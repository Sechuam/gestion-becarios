<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\InternController;
use App\Http\Controllers\EducationCenterController;
use App\Http\Controllers\TaskController;


// Ruta de bienvenida
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Rutas protegidas que requieren login y verificación de email
Route::middleware(['auth', 'verified'])->group(function () {

    // Rutas para tareas
    Route::get('tareas', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('tareas/create', [TaskController::class, 'create'])->name('tasks.create');
    Route::get('tareas/mis', [TaskController::class, 'myTasks'])->name('tasks.mine');
    Route::get('tareas/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
    Route::get('tareas/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::post('tareas', [TaskController::class, 'store'])->name('tasks.store');
    Route::patch('tareas/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('tareas/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::patch('tareas/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
    Route::post('tareas/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');
    Route::post('tareas/{task}/comments', [TaskController::class, 'storeComment'])->name('tasks.comments.store');
    Route::post('tareas/{task}/attachments', [TaskController::class, 'addAttachment'])->name('tasks.attachments.store');

    // Dashboard principal
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Módulo de Usuarios
    // Nota: El primer parámetro es la URL, el segundo es la carpeta en Pages
    Route::get('becarios', [InternController::class, 'index'])->name('becarios.index');
    Route::inertia('tutores', 'tutors/index')->name('tutores.index');
    Route::inertia('administrador', 'admin/index')->name('admin.index');
    // Ruta para la pestaña Usuarios
    Route::inertia('usuarios', 'users/index')->name('users.index');

    // Ruta para los centros educativos
    Route::get('centros', [EducationCenterController::class, 'index'])->name('schools.index');
    Route::get('centros/export', [EducationCenterController::class, 'exportIndex'])
        ->name('schools.export.index');
    Route::get('centros/{school}', [EducationCenterController::class, 'show'])
        ->whereNumber('school')
        ->name('schools.show');
    Route::get('centros/{school}/export', [EducationCenterController::class, 'export'])
        ->whereNumber('school')
        ->name('schools.export');

    Route::get('/interns/export', [InternController::class, 'export'])->name('becarios.export');

    Route::middleware('can:manage interns')->group(function () {
        Route::resource('interns', InternController::class)->except(['index', 'show']);
        Route::get('interns/{intern}', [InternController::class, 'show'])->name('interns.show');
        Route::post('interns/{intern}/restore', [InternController::class, 'restore'])->name('interns.restore');
        Route::delete('interns/{intern}/force', [InternController::class, 'forceDelete'])->name('interns.forceDelete');
        Route::patch('interns/{intern}/notes', [InternController::class, 'updateNotes'])->name('interns.notes');
    });

    // Rutas protegidas para administración de centros
    Route::middleware('can:manage schools')->group(function () {
        Route::resource('centros', EducationCenterController::class)
            ->parameters(['centros' => 'school'])
            ->except(['index', 'show']);
        Route::post('centros/{school}/restore', [EducationCenterController::class, 'restore'])->name('schools.restore');
        Route::delete('centros/{school}/force', [EducationCenterController::class, 'forceDelete'])->name('schools.forceDelete');
        Route::patch('centros/{school}/notes', [EducationCenterController::class, 'updateNotes'])->name('schools.notes');
    });

    // Ruta para evaluaciones
    Route::inertia('/evaluaciones', 'evaluations/index')->name('evaluations.index');
    // Ruta para asistencia
    Route::inertia('/asistencia', 'attendance/index')->name('attendance.index');
    // Ruta para reportes
    Route::inertia('/reportes', 'reports/index')->name('reports.index');

});

// rutas públicas o especiales
require __DIR__.'/settings.php';
