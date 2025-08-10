<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;
use LucianoTonet\GroqLaravel\Facades\Groq;
use Throwable;

class ConsultationController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Consultation::class);

        $consultations = Consultation::with('patient')
            ->where('doctor_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('consultations/index', [
            'consultations' => $consultations,
        ]);
    }

    public function show(Consultation $consultation): Response
    {
        Gate::authorize('view', $consultation);
        $consultation->load('patient');

        return Inertia::render('consultations/show', [
            'consultation' => $consultation,
        ]);
    }

    /**
     * Upload and store audio file
     */
    public function uploadAudio(Request $request)
    {
        try {
            $audioFile = $request->file('audio');

            // Generate unique filename
            $filename = 'audio_'.time().'_'.uniqid().'.mp3';

            // Store file in storage/app/audio directory
            $path = $audioFile->storeAs('audio', $filename, 'local');

            // Get full path
            $fullPath = Storage::disk('local')->path($path);

            return response()->json([
                'success' => true,
                'message' => 'Audio file uploaded successfully',
                'data' => [
                    'filename' => $filename,
                    'path' => $path,
                    'full_path' => $fullPath,
                    'size' => $audioFile->getSize(),
                ],
            ]);

        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload audio file: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Transcribe audio file using Groq's speech-to-text API
     */
    /**
     * Summarize consultation using Groq LLM
     */
    public function summarize(Consultation $consultation)
    {
        try {
            if (empty($consultation->transcript)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No transcript available for summarization',
                ], 400);
            }

            $systemPrompt = <<<'PROMPT'
            You are a highly accurate, detail-oriented, and clinically professional medical assistant.  
            Your role is to analyze a doctor patient consultation transcript and produce a structured, clear, and clinically useful summary.
            
            **Critical Guidelines:**
            - Base your analysis on the information provided in the transcript.
            - If specific information is absent, write **"Information Missing"** in that section.
            - Maintain precise medical terminology and professional tone throughout.
            - Ensure all findings are logically consistent and supported by the transcript.
            
            **Reasoning Process (Chain of Thought — think internally, do not include in output):**
            1. Carefully read and understand the transcript in full.  
            2. Identify and extract all factual details explicitly stated.  
            3. Group extracted details into relevant clinical categories (symptoms, diagnoses, tests, concerns, etc.).  
            4. Check for any missing information and mark it clearly as "Information Missing".  
            5. Organize findings logically before final formatting.  
            6. Output **only** the final structured markdown — never include your reasoning steps.
            
            **Output Format (Markdown):**
            
            1. **Brief Summary**  
            _(One to three sentences summarizing the consultation.)_
            
            2. **Key Symptoms and Patient Complaints**  
            _(List symptoms exactly as stated or clearly implied in the transcript.)_
            
            3. **Potential Diagnoses**  
            _(List possible diagnoses supported by transcript evidence. Include "Information Missing" if insufficient data.)_
            
            4. **Recommended Tests or Follow-up Actions**  
            _(List specific diagnostic tests, imaging, or lab work suggested or implied. Include "Information Missing" if none stated.)_
            
            5. **Immediate Concerns**  
            _(List urgent medical issues, red flags, or emergency indicators, if present.)_
            
            6. **Possible Questions to Ask for Better Diagnosis**  
            _(Suggest questions that could clarify symptoms, history, or other relevant factors.)_
            PROMPT;

            $response = Groq::chat()->completions()->create([
                'model' => 'llama-3.1-8b-instant',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Here is the consultation transcript to analyze:\n\n".$consultation->transcript],
                ],
                'temperature' => 0.2,
                'max_tokens' => 8192,
            ]);

            $summary = $response['choices'][0]['message']['content'] ?? null;

            // Update consultation with summary
            $consultation->update([
                'summary' => $summary,
                'status' => 'summarized',
            ]);

            return response()->json([
                'success' => true,
                'summary' => $summary,
            ]);

        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate summary: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Transcribe audio using Groq
     */
    /**
     * Mark consultation as completed
     */
    public function complete(Consultation $consultation)
    {
        Gate::authorize('update', $consultation);

        try {
            // Update the consultation
            $consultation->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Update the associated queue if it exists and is still in progress
            if ($consultation->queue) {
                $consultation->queue->update([
                    'status' => 'completed',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Consultation and associated queue marked as completed successfully',
                'consultation' => $consultation->fresh(),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete consultation: '.$e->getMessage(),
            ], 500);
        }
    }

    public function transcribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file_path' => 'required|string',
            'consultation_id' => 'sometimes|exists:consultations,id',
            'model' => 'sometimes|string|in:whisper-large-v3,whisper-large-v3-turbo',
            'language' => 'sometimes|string|max:10',
            'prompt' => 'sometimes|string|max:244',
            'response_format' => 'sometimes|string|in:json,text,srt,verbose_json,vtt',
            'temperature' => 'sometimes|numeric|between:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $filePath = $request->input('file_path');

            // Check if file exists
            if (! Storage::disk('local')->exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Audio file not found',
                ], 404);
            }

            // Get full system path
            $fullPath = Storage::disk('local')->path($filePath);

            // Prepare Groq API parameters
            $transcriptionParams = [
                'file' => $fullPath,
                'model' => $request->input('model', 'whisper-v3-large'),
                'response_format' => $request->input('response_format', 'json'),
            ];

            // Call Groq service to transcribe the audio
            $response = Groq::transcriptions()->create($transcriptionParams);

            // Extract transcription text based on response format
            $transcription = isset($response['text']) ? $response['text'] : $response;

            $systemPrompt = '
                Below is a text conversation between a doctor and a patient. DO NOT translate the conversation.

                <transcription>'
                    .$transcription.
                '</transcription>
                
                Take all the right context on my transcription and despite the useless information, output the result.
     
                Response as a question and answer log, no extra text and plain text only.

                IF the transcription is incomplete. Response: Transcription is incomplete.
            ';

            $finalResponse = Groq::chat()->completions()->create([
                'model' => 'llama-3.1-8b-instant',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                ],
                'temperature' => 0.3,
                'max_tokens' => 4000,
                'top_p' => 0.9,
            ]);

            $finalTranscription = $finalResponse['choices'][0]['message']['content'];

            // Clean up the file after transcription
            Storage::disk('local')->delete($filePath);

            $consultationId = $request->input('consultation_id');
            if ($consultationId) {
                $consultation = Consultation::where('id', $consultationId)
                    ->where('doctor_id', Auth::id())
                    ->firstOrFail();
                $consultation->update([
                    'transcript' => is_string($transcription) ? $transcription : json_encode($transcription),
                    'model_used' => $transcriptionParams['model'],
                    'status' => 'completed',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Audio transcribed successfully',
                'data' => [
                    'transcription' => $finalTranscription,
                    'model_used' => $transcriptionParams['model'],
                    'response_format' => $transcriptionParams['response_format'],
                    'full_response' => $response,
                ],
            ]);

        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to transcribe audio: '.$e->getMessage(),
            ], 500);
        }
    }
}
