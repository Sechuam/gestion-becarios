<?php

use App\Http\Controllers\EducationCenterController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationCriterionController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\PracticeTypeController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TutorController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\TimeLogController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\AttendanceReportController;
use App\Http\Controllers\InvitationController;



// Ruta de bienvenida
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Rutas protegidas que requieren login y verificación de email
Route::middleware(['auth', 'verified'])->group(function () {
    // Rutas para el área personal del becario
    Route::get('mi-perfil', [InternController::class, 'myProfile'])
        ->name('interns.my-profile')
        ->middleware('role:intern|becario');
    Route::post('mi-perfil/avatar', [InternController::class, 'updateAvatar'])
        ->name('interns.update-avatar')
        ->middleware('role:intern|becario');

    // Ruta para que el centro concreto del becario en cuestion
    Route::get('mi-centro', [EducationCenterController::class, 'myCenter'])
        ->name('schools.my');

    // Rutas para tareas
    Route::get('tareas', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('tareas/create', [TaskController::class, 'create'])
        ->name('tasks.create')
        ->middleware('tutor');
    Route::get('tareas/mis', [TaskController::class, 'myTasks'])->name('tasks.mine');
    Route::patch('tareas/board-order', [TaskController::class, 'updateBoardOrder'])
        ->name('tasks.board-order');
    Route::get('mis-becarios', [TutorController::class, 'mine'])
        ->name('tutors.mine')
        ->middleware('tutor');
    Route::get('tareas/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
    Route::get('tareas/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::post('tareas', [TaskController::class, 'store'])
        ->name('tasks.store')
        ->middleware('tutor');
    Route::patch('tareas/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('tareas/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::patch('tareas/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
    Route::post('tareas/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');
    Route::post('tareas/{task}/comments', [TaskController::class, 'storeComment'])->name('tasks.comments.store');
    Route::patch('tareas/{task}/comments/{comment}', [TaskController::class, 'updateComment'])->name('tasks.comments.update');
    Route::delete('tareas/{task}/comments/{comment}', [TaskController::class, 'destroyComment'])->name('tasks.comments.destroy');
    Route::post('tareas/{task}/attachments', [TaskController::class, 'addAttachment'])->name('tasks.attachments.store');
    Route::get('/asistencia', [TimeLogController::class, 'index'])->name('attendance.index');
    Route::post('/time-logs/clock-in', [TimeLogController::class, 'clockIn'])->name('time-logs.clock-in');
    Route::post('/time-logs/clock-out', [TimeLogController::class, 'clockOut'])->name('time-logs.clock-out');
    Route::post('/time-logs/manual', [TimeLogController::class, 'storeManual'])->name('time-logs.manual');
    Route::get('/time-logs/events', [TimeLogController::class, 'getEvents'])->name('time-logs.events');
    Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::patch('/schedules/{schedule}', [ScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');
    // Rutas de Ausencias
    Route::post('/absences', [AbsenceController::class, 'store'])->name('absences.store');
    Route::patch('/absences/{absence}/status', [AbsenceController::class, 'updateStatus'])->name('absences.updateStatus');
    Route::post('/absences/{absence}/justification', [AbsenceController::class, 'uploadJustification'])->name('absences.uploadJustification');
    Route::get('/interns/{intern}/report', [AttendanceReportController::class, 'download'])->name('interns.report');





    // Catálogo de tipos de práctica (solo admin)
    Route::get('tipos-practica', [PracticeTypeController::class, 'index'])
        ->name('practice-types.index')
        ->middleware('admin');
    Route::get('tipos-practica/create', [PracticeTypeController::class, 'create'])
        ->name('practice-types.create')
        ->middleware('admin');
    Route::post('tipos-practica', [PracticeTypeController::class, 'store'])
        ->name('practice-types.store')
        ->middleware('admin');
    Route::get('tipos-practica/{practiceType}/edit', [PracticeTypeController::class, 'edit'])
        ->name('practice-types.edit')
        ->middleware('admin');
    Route::patch('tipos-practica/{practiceType}', [PracticeTypeController::class, 'update'])
        ->name('practice-types.update')
        ->middleware('admin');
    Route::delete('tipos-practica/{practiceType}', [PracticeTypeController::class, 'destroy'])
        ->name('practice-types.destroy')
        ->middleware('admin');
    Route::patch('tipos-practica/{practiceType}/toggle', [PracticeTypeController::class, 'toggle'])
        ->name('practice-types.toggle')
        ->middleware('admin');

    // Dashboard principal
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Módulo de Usuarios
    // Nota: El primer parámetro es la URL, el segundo es la carpeta en Pages
    Route::get('becarios', [InternController::class, 'index'])
        ->name('becarios.index')
        ->middleware('staff');
    Route::get('tutores', [TutorController::class, 'index'])
        ->name('tutores.index')
        ->middleware('admin');
    Route::get('tutores/{user}', [TutorController::class, 'show'])
        ->name('tutores.show')
        ->middleware('staff');
    Route::inertia('administrador', 'admin/index')->name('admin.index');
    // Ruta para la pestaña Usuarios
    Route::get('usuarios', [UsersController::class, 'index'])
        ->name('users.index')
        ->middleware('admin');
    Route::patch('usuarios/{user}/role', [UsersController::class, 'updateRole'])
        ->name('users.role')
        ->middleware('admin');

    // Ruta para que el Admin envíe la invitación
    Route::post('invitaciones', [InvitationController::class, 'store'])
        ->name('invitations.store')
        ->middleware('admin');

    // Ruta para los centros educativos
    Route::get('centros', [EducationCenterController::class, 'index'])
        ->name('schools.index')
        ->middleware('staff');
    Route::get('centros/export', [EducationCenterController::class, 'exportIndex'])
        ->name('schools.export.index')
        ->middleware('admin');
    Route::get('centros/{school}', [EducationCenterController::class, 'show'])
        ->whereNumber('school')
        ->name('schools.show')
        ->middleware('staff');
    Route::get('centros/{school}/export', [EducationCenterController::class, 'export'])
        ->whereNumber('school')
        ->name('schools.export')
        ->middleware('admin');

    Route::get('/interns/export', [InternController::class, 'export'])
        ->name('becarios.export')
        ->middleware('staff');

    Route::middleware('can:manage interns')->group(function () {
        Route::resource('interns', InternController::class)->except(['index', 'show']);
        Route::post('interns/{intern}/restore', [InternController::class, 'restore'])->name('interns.restore');
        Route::delete('interns/{intern}/force', [InternController::class, 'forceDelete'])->name('interns.forceDelete');
        Route::patch('interns/{intern}/notes', [InternController::class, 'updateNotes'])->name('interns.notes');
        Route::post('interns/{intern}/notes/thread', [InternController::class, 'storeInternalNote'])->name('interns.notes.store');
        Route::patch('interns/{intern}/notes/{note}', [InternController::class, 'updateInternalNote'])->name('interns.notes.update');
        Route::delete('interns/{intern}/notes/{note}', [InternController::class, 'destroyInternalNote'])->name('interns.notes.destroy');
    });
    Route::get('interns/{intern}', [InternController::class, 'show'])
        ->name('interns.show')
        ->middleware('staff');

    // Rutas protegidas para administración de centros
    Route::middleware('can:manage schools')->group(function () {
        Route::resource('centros', EducationCenterController::class)
            ->parameters(['centros' => 'school'])
            ->except(['index', 'show']);
        Route::post('centros/{school}/restore', [EducationCenterController::class, 'restore'])->name('schools.restore');
        Route::delete('centros/{school}/force', [EducationCenterController::class, 'forceDelete'])->name('schools.forceDelete');
        Route::patch('centros/{school}/notes', [EducationCenterController::class, 'updateNotes'])->name('schools.notes');
        Route::post('centros/{school}/notes/thread', [EducationCenterController::class, 'storeInternalNote'])->name('schools.notes.store');
        Route::patch('centros/{school}/notes/{note}', [EducationCenterController::class, 'updateInternalNote'])->name('schools.notes.update');
        Route::delete('centros/{school}/notes/{note}', [EducationCenterController::class, 'destroyInternalNote'])->name('schools.notes.destroy');
    });

    // Ruta para evaluaciones
    Route::get('/evaluaciones', [EvaluationController::class, 'index'])
        ->name('evaluations.index');
    Route::get('/evaluaciones/create', [EvaluationController::class, 'create'])
        ->name('evaluations.create');
    Route::post('/evaluaciones', [EvaluationController::class, 'store'])
        ->name('evaluations.store');
    Route::get('/evaluaciones/criterios', [EvaluationCriterionController::class, 'index'])
        ->name('evaluation-criteria.index')
        ->middleware('admin');
    Route::get('/evaluaciones/criterios/create', [EvaluationCriterionController::class, 'create'])
        ->name('evaluation-criteria.create')
        ->middleware('admin');
    Route::post('/evaluaciones/criterios', [EvaluationCriterionController::class, 'store'])
        ->name('evaluation-criteria.store')
        ->middleware('admin');
    Route::get('/evaluaciones/criterios/{criterion}/edit', [EvaluationCriterionController::class, 'edit'])
        ->name('evaluation-criteria.edit')
        ->middleware('admin');
    Route::patch('/evaluaciones/criterios/{criterion}', [EvaluationCriterionController::class, 'update'])
        ->name('evaluation-criteria.update')
        ->middleware('admin');
    Route::delete('/evaluaciones/criterios/{criterion}', [EvaluationCriterionController::class, 'destroy'])
        ->name('evaluation-criteria.destroy')
        ->middleware('admin');
    Route::patch('/evaluaciones/criterios/{criterion}/toggle', [EvaluationCriterionController::class, 'toggle'])
        ->name('evaluation-criteria.toggle')
        ->middleware('admin');
    // Ruta para reportes
    Route::inertia('/reportes', 'reports/index')->name('reports.index');
    // Roles y permisos (admin)
    Route::get('/roles', [RolesController::class, 'index'])
        ->name('roles.index')
        ->middleware('admin');
    Route::post('/roles', [RolesController::class, 'store'])
        ->name('roles.store')
        ->middleware('admin');
    Route::patch('/roles/{role}', [RolesController::class, 'update'])
        ->name('roles.update')
        ->middleware('admin');
    Route::delete('/roles/{role}', [RolesController::class, 'destroy'])
        ->name('roles.destroy')
        ->middleware('admin');
    Route::post('/roles/{role}/permissions/{permission}', [RolesController::class, 'togglePermission'])
        ->name('roles.permissions.toggle')
        ->middleware('admin');

});

// Rutas Públicas (para invitados que aún no se han logueado)
Route::middleware('guest')->group(function () {
    Route::get('registro/invitacion/{token}', [InvitationController::class, 'accept'])->name('register.invitation');
    Route::post('registro/invitacion/registrar', [InvitationController::class, 'register'])->name('register.invitation.store');
});

// rutas públicas o especiales
require __DIR__ . '/settings.php';
