<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\User;
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
        if (!Gate::allows('viewAny', Consultation::class)) {
            abort(403, 'You do not have permission to view consultations.');
        }

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
        if (!Gate::allows('view', $consultation)) {
            abort(403, 'You do not have permission to view this consultation.');
        }
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
    
            $systemPrompt = <<<PROMPT
                You are a highly accurate and detail oriented medical assistant helping doctors analyze consultations.
                Your goal is to provide a structured, clear, and clinically useful summary of a doctor-patient consultation transcript.
                
                IMPORTANT:
                - Base your analysis ONLY on the transcript.
                - If important information is missing, clearly state "Information Missing" in the relevant section.
                - Maintain medical professionalism and accuracy.
                
                Your output must follow this EXACT structure:
                
                1. Brief Summary
                2. Key Symptoms and Patient Complaints
                3. Potential Diagnoses (Possible, Not Certain)
                4. Recommended Tests or Follow-up Actions
                5. Immediate Concerns
                6. Possible Questions to Ask for Better Diagnosis
            PROMPT;
    
            $response = Groq::chat()->completions()->create([
                'model' => 'meta-llama/llama-4-maverick-17b-128e-instruct',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Here is the consultation transcript to analyze:\n\n" . $consultation->transcript]
                ],
                'temperature' => 0.2,
                'max_tokens' => 8192,
            ]);
    
            $summary = $response['choices'][0]['message']['content'] ?? null;
    
            // Update consultation with summary
            $consultation->update([
                'summary' => $summary,
                'status' => 'summarized'
            ]);
    
            return response()->json([
                'success' => true,
                'summary' => $summary
            ]);
    
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate summary: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Transcribe audio using Groq
     */
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

            $systemPrompt = "
                Below is a text conversation between a doctor and a patient. DO NOT translate the conversation.

                <transcription>"
                    .$transcription.
                "</transcription>
                
                Take all the right context on my transcription and despite the useless information, output the result.
     
                Response as a question and answer log, no extra text and plain text only.

                IF the transcription is incomplete. Response: Transcription is incomplete.
            ";
            
            
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
