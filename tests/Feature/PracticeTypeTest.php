<?php

use App\Models\PracticeType;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Role::findOrCreate('admin');
    Role::findOrCreate('tutor');
});

it('allows admins to create practice types', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post(route('practice-types.store'), [
        'name' => 'Desarrollo Backend',
        'description' => 'Tareas relacioandas con Laravel y APIs.',
        'priority' => 'high',
        'color' => '#2563eb',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('practice-types.index'));

    expect(PracticeType::where('name', 'Desarrollo Backend')->exists())->toBeTrue();

});

it('prevents tutors from creating practice types', function () {
    /** @var User $tutor */
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $response = $this->actingAs($tutor)->post(route('practice-types.store'), [
        'name' => 'Diseño UX/UI',
        'description' => 'Tareas relacioandas con experiencia de usuario.',
        'priority' => 'medium',
        'color' => '#f97316',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', 'No tienes permiso para acceder');

    expect(PracticeType::where('name', 'Diseño UX/UI')->exists())->toBeFalse();
});

it('requires a name when creating practice types', function () {
    /** @var User $admin */
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)
    ->post(route('practice-types.store'), [
        'name' => '',
        'description' => 'Tareas sin nombre para probar validación.',
        'priority' => 'low',
        'color' => '#22c55e',
        'is_active' => true,
    ]);

    $response->assertSessionHasErrors('name');

    expect(PracticeType::where('description', 'Tareas sin nombre para probar validación.')->exists())->toBeFalse();
});
