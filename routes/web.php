<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// Ruta de bienvenida
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Rutas protegidas que requieren login y verificación de email
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard principal
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Módulo de Usuarios
    // Nota: El primer parámetro es la URL, el segundo es la carpeta en Pages
    Route::get('becarios', [App\Http\Controllers\InternController::class, 'index'])->name('becarios.index');
    Route::inertia('tutores', 'tutors/index')->name('tutores.index');
    Route::inertia('administrador', 'admin/index')->name('admin.index');
    // Ruta para la pestaña Usuarios
    Route::inertia('usuarios', 'users/index')->name('users.index');
    // Ruta para los centros educativos
    Route::get('schools', [\App\Http\Controllers\EducationCenterController::class, 'index'])->name('schools.index');
    Route::get('schools/{school}', [\App\Http\Controllers\EducationCenterController::class, 'show'])
        ->whereNumber('school')
        ->name('schools.show');
    Route::get('/interns/export', [\App\Http\Controllers\InternController::class, 'export'])->name('becarios.export');

    Route::middleware('can:manage interns')->group(function () {
        Route::resource('interns', App\Http\Controllers\InternController::class)->except(['index', 'show']);
        Route::get('interns/{intern}', [App\Http\Controllers\InternController::class, 'show'])->name('interns.show');
    });

    // Rutas protegidas para administración de centros
    Route::middleware('can:manage schools')->group(function () {
        Route::resource('schools', \App\Http\Controllers\EducationCenterController::class)->except(['index', 'show']);
    });
    // Ruta para tareas
    Route::inertia('/tareas', 'tasks/index')->name('tasks.index');
    // Ruta para evaluaciones
    Route::inertia('/evaluaciones', 'evaluations/index')->name('evaluations.index');
    // Ruta para asistencia
    Route::inertia('/asistencia', 'attendance/index')->name('attendance.index');
    // Ruta para reportes
    Route::inertia('/reportes', 'reports/index')->name('reports.index');

});

// rutas públicas o especiales

require __DIR__.'/settings.php';
