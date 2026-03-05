<?php

use App\Exports\UsersExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\LaravelPdf\Facades\Pdf;
use Inertia\Inertia;

// Ruta de bienvenida
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// --- RUTAS PROTEGIDAS (Requieren Login) ---
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard principal
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Módulo de Usuarios (Coincidiendo con tu Sidebar)
    // Nota: El primer parámetro es la URL, el segundo es la carpeta en Pages
    Route::inertia('becarios', 'interns/index')->name('becarios.index');
    Route::inertia('tutores', 'tutors/index')->name('tutores.index');
    Route::inertia('administrador', 'admin/index')->name('admin.index');
    // Ruta para la pestaña Usuarios
    Route::inertia('usuarios', 'users/index')->name('users.index');
    // Ruta para los centros educativos
    Route::inertia('schools', 'schools/index')->name('schools.index');
    //Ruta para tareas
    Route::inertia('/tareas', 'tasks/index')->name('tasks.index');
    // Ruta para evaluaciones
    Route::inertia('/evaluaciones', 'evaluations/index')->name('evaluations.index');
    // Ruta para asistencia
    Route::inertia('/asistencia', 'attendance/index')->name('attendance.index');
    // Ruta para reportes
    Route::inertia('/reportes', 'reports/index')->name('reports.index');

    // Gestión de Media / Archivos
    Route::view('/media-test-form', 'media-test');
    Route::post('/media-test', function (Request $request) {
        $request->validate([
            'file' => ['required', 'file'],
        ]);

        $user = $request->user();
        $user->addMediaFromRequest('file')->toMediaCollection('avatars');

        return 'OK';
    });

    // Exportación de Usuarios
    Route::get('/users-export', function () {
        return Excel::download(new UsersExport, 'users.xlsx');
    })->name('users.export');
});

// --- RUTAS PÚBLICAS O ESPECIALES ---

require __DIR__.'/settings.php';

// Generación de PDF
Route::get('/pdf-ejemplo', function () {
    $user = auth()->user();
    return Pdf::view('example', ['user' => $user])
        ->download('ejemplo.pdf');
});

