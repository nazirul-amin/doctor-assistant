<?php

use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\QueueController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Queue routes
    Route::get('queue', [QueueController::class, 'index'])->name('dashboard');
    Route::get('queue/create', [QueueController::class, 'create'])->name('queue.create');
    Route::post('queue', [QueueController::class, 'store'])->name('queue.store');
    Route::post('queue/{queue}/process', [QueueController::class, 'process'])->name('queue.process');
    Route::post('queue/{queue}/complete', [QueueController::class, 'complete'])->name('queue.complete');
    Route::post('queue/{queue}/cancel', [QueueController::class, 'cancel'])->name('queue.cancel');
    Route::delete('queue/{queue}', [QueueController::class, 'destroy'])->name('queue.destroy');

    Route::get('consultations', [ConsultationController::class, 'index'])->name('consultations.index');
    Route::get('consultations/{consultation}', [ConsultationController::class, 'show'])->name('consultations.show');
    Route::post('consultations/{consultation}/summarize', [ConsultationController::class, 'summarize'])->name('consultations.summarize');

    // JSON API endpoints for audio upload/transcription
    Route::post('api/voice/upload', [ConsultationController::class, 'uploadAudio'])->name('voice.upload');
    Route::post('api/voice/transcribe', [ConsultationController::class, 'transcribe'])->name('voice.transcribe');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
