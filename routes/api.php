<?php

use App\Http\Controllers\ConsultationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Voice Recognition Routes
Route::post('/consultations/upload', [ConsultationController::class, 'uploadAudio'])
    ->name('consultations.upload');
Route::post('/consultations/transcribe', [ConsultationController::class, 'transcribe'])
    ->name('consultations.transcribe');
