<?php

use App\Exports\UsersExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\LaravelPdf\Facades\Pdf;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    // Nueva ruta para becarios
    Route::inertia('becarios', 'interns/index')->name('interns.index');
});

require __DIR__.'/settings.php';

Route::get('/pdf-ejemplo', function () {
    $user = auth()->user();

    return Pdf::view('example', ['user' => $user])
        ->download('ejemplo.pdf');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('/media-test-form', 'media-test');

    Route::post('/media-test', function (Request $request) {
        $request->validate([
            'file' => ['required', 'file'],
        ]);

        $user = $request->user(); // usuario logueado

        $user->addMediaFromRequest('file')->toMediaCollection('avatars');

        return 'OK';

    });
});

Route::get('/users-export', function () {
    return Excel::download(new UsersExport, 'users.xlsx');

})->middleware(['auth', 'verified']);
