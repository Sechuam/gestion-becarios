<?php

use App\Models\PracticeType;
use App\Models\Task;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('tutor');
});

it('shows tutors their own unassigned tasks', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $practiceType = PracticeType::create([
        'name' => 'Desarrollo',
        'description' => 'Tareas de desarrollo',
        'priority' => 1,
        'color' => '#0f766e',
        'is_active' => true,
    ]);

    $task = Task::create([
        'title' => 'Tarea sin becarios asignados',
        'description' => 'Debe aparecer al tutor que la creó.',
        'status' => 'pending',
        'priority' => 'medium',
        'created_by' => $tutor->id,
        'practice_type_id' => $practiceType->id,
    ]);

    $this->actingAs($tutor)
        ->get(route('tasks.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tasks/index')
            ->where('tasks.data.0.id', $task->id)
            ->where('tasks.data.0.title', 'Tarea sin becarios asignados')
        );
});
