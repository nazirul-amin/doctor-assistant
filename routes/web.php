<?php

use App\Http\Controllers\ConsultationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('consultations', [ConsultationController::class, 'index'])
        ->name('consultations.index');
    Route::post('consultations', [ConsultationController::class, 'store'])
        ->name('consultations.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
