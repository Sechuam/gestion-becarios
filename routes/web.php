<?php

use App\Exports\UsersExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\LaravelPdf\Facades\Pdf;

// ruta de bienvenida, que se carga con React
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// ruta de dashboard para hacer login o registro
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    // Nueva ruta para becarios
    Route::inertia('becarios', 'interns/index')->name('interns.index');
});

require __DIR__.'/settings.php';

// ruta para descargar un pdf
Route::get('/pdf-ejemplo', function () {
    $user = auth()->user();

    return Pdf::view('example', ['user' => $user])
        ->download('ejemplo.pdf');
});
// ruta para subir un archivo, primero identifica al usuario logueado y luego sube el archivo
Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('/media-test-form', 'media-test');

    // ruta para subir un archivo
    Route::post('/media-test', function (Request $request) {
        $request->validate([
            'file' => ['required', 'file'],
        ]);

        $user = $request->user(); // usuario logueado
        // sube el archivo al media collection 'avatars'
        $user->addMediaFromRequest('file')->toMediaCollection('avatars');

        return 'OK';

    });
});

// ruta para exportar usuarios
Route::get('/users-export', function () {
    return Excel::download(new UsersExport, 'users.xlsx');

})->middleware(['auth', 'verified']);
