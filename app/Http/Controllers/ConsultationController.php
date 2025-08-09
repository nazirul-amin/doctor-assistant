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
                'model' => $request->input('model', 'whisper-large-v3-turbo'),
                'response_format' => $request->input('response_format', 'json'),
            ];

            // Add optional parameters if provided
            if ($request->has('language')) {
                $transcriptionParams['language'] = $request->input('language');
            }

            if ($request->has('prompt')) {
                $transcriptionParams['prompt'] = $request->input('prompt');
            }

            if ($request->has('temperature')) {
                $transcriptionParams['temperature'] = (float) $request->input('temperature');
            }

            // Call Groq service to transcribe the audio
            $response = Groq::transcriptions()->create($transcriptionParams);

            // Extract transcription text based on response format
            $transcription = isset($response['text']) ? $response['text'] : $response;

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
                    'transcription' => $transcription,
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
