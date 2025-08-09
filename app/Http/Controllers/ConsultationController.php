<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Illuminate\Http\Request;
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

            $systemPrompt = "You are a medical assistant. Please analyze the following doctor-patient consultation transcript and provide:\n";
            $systemPrompt .= "1. A brief summary of the consultation\n";
            $systemPrompt .= "2. Key symptoms and patient complaints\n";
            $systemPrompt .= "3. Potential diagnoses (list as possibilities, not certainties)\n";
            $systemPrompt .= "4. Recommended tests or follow-up actions\n";
            $systemPrompt .= "5. Any immediate concerns that require attention";

            $response = Groq::chat()->completions()->create([
                'model' => 'meta-llama/llama-4-maverick-17b-128e-instruct',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Here is the consultation transcript to analyze:\n\n" . $consultation->transcript]
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
            ]);

            $summary = $response['choices'][0]['message']['content'];

            // Update consultation with summary
            $consultation->update([
                'summary' => $summary,
                'status' => 'summarized'
            ]);

            return response()->json([
                'success' => true,
                'summary' => $summary
            ]);

        } catch (\Exception $e) {
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
                    ->where('doctor_id', auth()->id())
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

    /**
     * Store transcription via Inertia form
     */
}
