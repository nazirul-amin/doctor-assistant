<?php

use App\Http\Controllers\VoiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Voice Recognition Routes
Route::post('/consultations/upload', [VoiceController::class, 'uploadAudio'])
    ->name('consultations.upload');
Route::post('/consultations/transcribe', [VoiceController::class, 'transcribe'])
    ->name('consultations.transcribe');
