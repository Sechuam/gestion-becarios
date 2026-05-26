<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\PracticeType;
use App\Models\Task;
use App\Models\TaskStatusLog;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('manage tasks');

    Role::findOrCreate('tutor')->givePermissionTo('manage tasks');
    Role::findOrCreate('intern');
});

function createPracticeTypeForTaskWorkflow(): PracticeType
{
    return PracticeType::create([
        'name' => 'Desarrollo',
        'description' => 'Tareas de desarrollo',
        'priority' => 'medium',
        'color' => '#0f766e',
        'is_active' => true,
    ]);
}

function createAssignedTaskScenario(string $status = 'in_progress'): array
{
    /** @var User $tutor */
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    /** @var User $internUser */
    $internUser = User::factory()->create();
    $internUser->assignRole('intern');

    $center = EducationCenter::create([
        'name' => 'IES Mediterraneo',
        'code' => 'IES-MED',
        'address' => 'Calle Mayor 1',
        'city' => 'Valencia',
        'contact_person' => 'Laura Gomez',
        'contact_email' => 'laura@example.test',
        'email' => 'centro@example.test',
        'phone' => '960000000',
    ]);

    /** @var Intern $intern */
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'status' => 'active',
    ]);

    /** @var Task $task */
    $task = Task::create([
        'title' => 'Preparar entrega semanal',
        'description' => 'Resumen de avances.',
        'status' => $status,
        'priority' => 'medium',
        'created_by' => $tutor->id,
        'practice_type_id' => createPracticeTypeForTaskWorkflow()->id,
    ]);
    $task->interns()->attach($intern->id);

    return [$tutor, $internUser, $intern, $task];
}

it('allows assigned interns to submit tasks for review', function () {
    [$tutor, $internUser, $intern, $task] = createAssignedTaskScenario('in_progress');

    $response = $this->actingAs($internUser)
        ->post(route('tasks.complete', $task));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Tarea entregada y enviada a revisión.');

    expect($task->fresh()->status)->toBe('in_review')
        ->and(TaskStatusLog::where('task_id', $task->id)
            ->where('from_status', 'in_progress')
            ->where('to_status', 'in_review')
            ->where('changed_by', $internUser->id)
            ->exists())->toBeTrue();
});

it('allows tutors to complete tasks that are in review', function () {
    [$tutor, $internUser, $intern, $task] = createAssignedTaskScenario('in_review');

    $response = $this->actingAs($tutor)
        ->post(route('tasks.complete', $task));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Tarea marcada como completada.');

    $task->refresh();

    expect($task->status)->toBe('completed')
        ->and($task->completed_at)->not->toBeNull()
        ->and(TaskStatusLog::where('task_id', $task->id)
            ->where('from_status', 'in_review')
            ->where('to_status', 'completed')
            ->where('changed_by', $tutor->id)
            ->exists())->toBeTrue();
});

it('prevents interns from accessing tasks they are not assigned to', function () {
    [$tutor, $internUser, $intern, $task] = createAssignedTaskScenario('in_progress');

    /** @var User $otherIntern */
    $otherIntern = User::factory()->create();
    $otherIntern->assignRole('intern');

    $this->actingAs($otherIntern)
        ->post(route('tasks.complete', $task))
        ->assertForbidden();

    expect($task->fresh()->status)->toBe('in_progress');
});
