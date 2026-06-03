<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('manage interns');

    Role::findOrCreate('admin')->givePermissionTo('manage interns');
    Role::findOrCreate('tutor');
});

it('allows admins to view the interns index', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create(['name' => 'Becario Visible']);

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->get(route('becarios.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('interns/index')
            ->where('interns.data.0.user.name', 'Becario Visible')
            ->has('education_centers', 1)
        );
});

it('allows admins to view intern details', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create(['name' => 'Detalle Admin']);
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->get(route('interns.show', $intern))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('interns/Show')
            ->where('intern.user.name', 'Detalle Admin')
            ->has('time_stats')
        );
});

it('allows assigned tutors to view intern details', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create(['name' => 'Becario Asignado']);
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'status' => 'active',
    ]);

    $this->actingAs($tutor)
        ->get(route('interns.show', $intern))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('interns/Show')
            ->where('intern.user.name', 'Becario Asignado')
        );
});

it('prevents tutors from viewing interns assigned to another tutor', function () {
    $assignedTutor = User::factory()->create();
    $assignedTutor->assignRole('tutor');
    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');
    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create();
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $assignedTutor->id,
        'status' => 'active',
    ]);

    $this->actingAs($otherTutor)
        ->get(route('interns.show', $intern))
        ->assertForbidden();
});

it('allows admins to update interns', function () {
    /** @var User $admin */
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $center = EducationCenter::factory()->create();

    /** @var User $internUser */
    $internUser = User::factory()->create([
        'name' => 'Nombre original',
        'email' => 'original@example.test',
    ]);

    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'dni' => '12345678A',
        'birth_date' => '2000-01-01',
        'phone' => '123456789',
        'address' => 'Calle Bolivar, 1',
        'city' => 'Málaga',
        'academic_degree' => 'DAM',
        'start_date' => '2024-01-01',
        'end_date' => '2024-06-30',
        'total_hours' => 300,
        'status' => 'active',
        'academic_year' => '2024-2025',
    ]);

    $response = $this->actingAs($admin)
        ->patch(route('interns.update', $intern), [
            'name' => 'Nombre actualizado',
            'email' => 'actualizado@example.test',
            'education_center_id' => $center->id,
            'dni' => '87654321B',
            'birth_date' => '1999-12-31',
            'phone' => '987654321',
            'address' => 'Calle Larios, 2',
            'city' => 'Málaga',
            'academic_degree' => 'ASIR',
            'start_date' => '2024-02-01',
            'end_date' => '2024-07-31',
            'total_hours' => 350,
            'status' => 'completed',
            'academic_year' => '2025-2026',
        ]);

    $response->assertRedirect(route('becarios.index'));

    $intern->refresh();
    $internUser->refresh();

    expect($intern->phone)->toBe('987654321')
        ->and($intern->status)->toBe('completed')
        ->and($internUser->email)->toBe('actualizado@example.test')
        ->and($internUser->name)->toBe('Nombre actualizado')
        ->and($intern->dni)->toBe('87654321B')
        ->and($intern->birth_date)->toBe('1999-12-31')
        ->and($intern->address)->toBe('Calle Larios, 2')
        ->and($intern->city)->toBe('Málaga')
        ->and($intern->academic_degree)->toBe('ASIR')
        ->and($intern->start_date)->toBe('2024-02-01')
        ->and($intern->end_date)->toBe('2024-07-31')
        ->and($intern->total_hours)->toBe(350)
        ->and($intern->education_center_id)->toBe($center->id)
        ->and($intern->user_id)->toBe($internUser->id)
        ->and($intern->academic_year)->toBe('2025-2026');
});

it('allows admins to archive interns', function () {
    /** @var User $admin */
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $center = EducationCenter::factory()->create();

    /** @var User $internUser */
    /** @var Intern $intern */
    $internUser = User::factory()->create();
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('interns.destroy', $intern));

    $response->assertRedirect(route('becarios.index'));

    expect(Intern::query()->find($intern->id))->toBeNull()
        ->and(Intern::withTrashed()->find($intern->id)?->trashed())->toBeTrue();
});
