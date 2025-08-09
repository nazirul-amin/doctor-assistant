<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;
use LucianoTonet\GroqLaravel\Facades\Groq;

class VoiceController extends Controller
{
    /**
     * Show the voice demo page
     */
    public function index(): Response
    {
        return Inertia::render('consultations/index');
    }

    /**
     * Upload and store audio file
     */
    public function uploadAudio(Request $request): JsonResponse
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
                'data' => [
                    'filename' => $filename,
                    'path' => $path,
                    'full_path' => $fullPath,
                    'size' => $audioFile->getSize(),
                ],
                'message' => 'Audio file uploaded successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload audio file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Transcribe audio file using Groq's speech-to-text API
     */
    public function transcribe(Request $request): JsonResponse
    {
        // For API endpoints, we'll keep JSON responses
        // But we can also add Inertia support for form submissions

        $validator = Validator::make($request->all(), [
            'file_path' => 'required|string',
            'model' => 'sometimes|string|in:whisper-large-v3,whisper-large-v3-turbo',
            'language' => 'sometimes|string|max:10',
            'prompt' => 'sometimes|string|max:244',
            'response_format' => 'sometimes|string|in:json,text,srt,verbose_json,vtt',
            'temperature' => 'sometimes|numeric|between:0,1',
        ]);

        if ($validator->fails()) {
            // If it's an Inertia request, redirect back with errors
            if ($request->header('X-Inertia')) {
                return back()->withErrors($validator)->with('error', 'Validation failed');
            }

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
                $errorMessage = 'Audio file not found';

                if ($request->header('X-Inertia')) {
                    return back()->with('error', $errorMessage);
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
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

            $resultData = [
                'transcription' => $transcription,
                'model_used' => $transcriptionParams['model'],
                'response_format' => $transcriptionParams['response_format'],
                'full_response' => $response,
            ];

            // If it's an Inertia request, redirect back with success data
            if ($request->header('X-Inertia')) {
                return back()->with('success', 'Audio transcribed successfully')->with('transcription_data', $resultData);
            }

            return response()->json([
                'success' => true,
                'data' => $resultData,
                'message' => 'Audio transcribed successfully',
            ]);

        } catch (\Exception $e) {
            $errorMessage = 'Failed to transcribe audio: '.$e->getMessage();

            if ($request->header('X-Inertia')) {
                return back()->with('error', $errorMessage);
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store transcription via Inertia form
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'audio' => 'required|file|mimes:mp3,mpeg,wav,flac,mp4,m4a,ogg,webm|max:25600',
            'model' => 'sometimes|string|in:whisper-large-v3,whisper-large-v3-turbo',
            'language' => 'sometimes|string|max:10',
            'prompt' => 'sometimes|string|max:244',
            'response_format' => 'sometimes|string|in:json,text,srt,verbose_json,vtt',
            'temperature' => 'sometimes|numeric|between:0,1',
        ]);

        try {
            // Upload the file first
            $audioFile = $request->file('audio');
            $filename = 'audio_'.time().'_'.uniqid().'.mp3';
            $path = $audioFile->storeAs('audio', $filename, 'local');
            $fullPath = Storage::disk('local')->path($path);

            // Prepare Groq API parameters
            $transcriptionParams = [
                'file' => $fullPath,
                'model' => $request->input('model', 'whisper-large-v3-turbo'),
                'response_format' => $request->input('response_format', 'json'),
            ];

            // Add optional parameters
            if ($request->filled('language')) {
                $transcriptionParams['language'] = $request->input('language');
            }

            if ($request->filled('prompt')) {
                $transcriptionParams['prompt'] = $request->input('prompt');
            }

            if ($request->filled('temperature')) {
                $transcriptionParams['temperature'] = (float) $request->input('temperature');
            }

            // Transcribe
            $response = Groq::transcriptions()->create($transcriptionParams);
            $transcription = isset($response['text']) ? $response['text'] : $response;

            // Clean up
            Storage::disk('local')->delete($path);

            return Inertia::render('consultations/index', [
                'success' => 'Audio transcribed successfully',
                'transcription' => $transcription,
                'model_used' => $transcriptionParams['model'],
            ]);

        } catch (\Exception $e) {
            return Inertia::render('consultations/index', [
                'error' => 'Failed to transcribe audio: '.$e->getMessage(),
            ]);
        }
    }
}
