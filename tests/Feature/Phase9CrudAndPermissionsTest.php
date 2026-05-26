<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\PracticeType;
use App\Models\Task;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $permissions = [
        'manage schools',
        'manage interns',
        'manage tasks',
        'view evaluations',
        'manage evaluations',
        'delete evaluations',
        'view reports',
        'manage users',
        'manage tutors',
        'validate time logs',
        'edit time logs',
    ];

    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission);
    }

    Role::findOrCreate('admin')->syncPermissions($permissions);
    Role::findOrCreate('tutor')->syncPermissions(['manage tasks', 'view evaluations', 'manage evaluations']);
    Role::findOrCreate('intern')->syncPermissions(['view evaluations']);
});

function userWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function validCenterPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'IES Mediterraneo',
        'code' => 'IES-MED',
        'address' => 'Calle Mayor 1',
        'city' => 'Valencia',
        'contact_person' => 'Laura Gomez',
        'contact_email' => 'laura.gomez@example.test',
        'contact_position' => 'Coordinadora FCT',
        'email' => 'secretaria@example.test',
        'phone' => '960000000',
        'web' => 'https://ies-mediterraneo.test',
        'agreement_signed_at' => '2026-03-01',
        'agreement_expires_at' => '2027-03-01',
        'agreement_slots' => 4,
    ], $overrides);
}

function validInternPayload(EducationCenter $center, array $overrides = []): array
{
    return array_merge([
        'name' => 'Ana Interna',
        'email' => 'ana.interna@example.test',
        'education_center_id' => $center->id,
        'dni' => '12345678Z',
        'birth_date' => '2002-05-10',
        'phone' => '600000000',
        'address' => 'Calle Practicas 2',
        'city' => 'Valencia',
        'academic_degree' => 'DAM',
        'academic_year' => '2025-2026',
        'start_date' => '2026-03-02',
        'end_date' => '2026-06-19',
        'total_hours' => 400,
        'status' => 'active',
    ], $overrides);
}

it('allows admins to create, update, and archive education centers', function () {
    $admin = userWithRole('admin');

    $this->actingAs($admin)
        ->post(route('centros.store'), validCenterPayload())
        ->assertRedirect(route('schools.index'));

    $center = EducationCenter::query()->where('code', 'IES-MED')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('centros.update', $center), validCenterPayload([
            'name' => 'IES Mediterraneo Actualizado',
            'code' => 'IES-MED-2',
            'contact_email' => 'coordinacion@example.test',
            'email' => 'info@example.test',
        ]))
        ->assertRedirect(route('schools.index'));

    expect($center->fresh()->name)->toBe('IES Mediterraneo Actualizado');

    $this->actingAs($admin)
        ->delete(route('centros.destroy', $center))
        ->assertRedirect(route('schools.index'));

    expect(EducationCenter::query()->find($center->id))->toBeNull()
        ->and(EducationCenter::withTrashed()->find($center->id)?->trashed())->toBeTrue();
});

it('prevents tutors from managing education centers directly', function () {
    $tutor = userWithRole('tutor');

    $this->actingAs($tutor)
        ->post(route('centros.store'), validCenterPayload())
        ->assertForbidden();

    expect(EducationCenter::query()->where('code', 'IES-MED')->exists())->toBeFalse();
});

it('allows admins to create an intern user profile with the intern role', function () {
    $admin = userWithRole('admin');
    $center = EducationCenter::factory()->create();

    $this->actingAs($admin)
        ->post(route('interns.store'), validInternPayload($center))
        ->assertRedirect(route('becarios.index'));

    $intern = Intern::query()->where('dni', '12345678Z')->firstOrFail();

    expect($intern->education_center_id)->toBe($center->id)
        ->and($intern->user->email)->toBe('ana.interna@example.test')
        ->and($intern->user->hasRole('intern'))->toBeTrue();
});

it('allows tutors to create assigned tasks but blocks interns from creating tasks', function () {
    $tutor = userWithRole('tutor');
    $internUser = userWithRole('intern');
    $center = EducationCenter::factory()->create();
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'status' => 'active',
    ]);
    $practiceType = PracticeType::create([
        'name' => 'Desarrollo web',
        'is_active' => true,
    ]);

    $payload = [
        'title' => 'Preparar informe semanal',
        'description' => 'Resumen de avances y bloqueos.',
        'status' => 'pending',
        'priority' => 'medium',
        'due_date' => '2026-05-29',
        'practice_type_id' => $practiceType->id,
        'intern_ids' => [$intern->id],
        'assignment_type' => 'user',
    ];

    $this->actingAs($internUser)
        ->post(route('tasks.store'), $payload)
        ->assertRedirect();

    expect(Task::query()->where('title', 'Preparar informe semanal')->exists())->toBeFalse();

    $this->actingAs($tutor)
        ->post(route('tasks.store'), $payload)
        ->assertRedirect(route('tasks.index'));

    $task = Task::query()->where('title', 'Preparar informe semanal')->firstOrFail();

    expect($task->creator->is($tutor))->toBeTrue()
        ->and($task->interns()->whereKey($intern->id)->exists())->toBeTrue();
});
