<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Spatie\LaravelPdf\Facades\Pdf;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';



Route::get('/pdf-ejemplo', function () {
    $user = auth()->user();

    return Pdf::view('example', ['user' => $user])
        ->download('ejemplo.pdf');
});