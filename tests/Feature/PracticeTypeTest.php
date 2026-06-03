<?php

use App\Models\PracticeType;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
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

it('allows admins to view filtered practice types', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    PracticeType::create([
        'name' => 'Desarrollo Backend',
        'description' => 'Tareas con Laravel.',
        'priority' => 'high',
        'color' => '#2563eb',
        'is_active' => true,
    ]);
    PracticeType::create([
        'name' => 'Diseno UX',
        'description' => 'Prototipos y accesibilidad.',
        'priority' => 'medium',
        'color' => '#f97316',
        'is_active' => false,
    ]);

    $this->actingAs($admin)
        ->get(route('practice-types.index', [
            'search' => 'Backend',
            'status' => 'active',
            'sort' => 'name',
            'direction' => 'desc',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('practice-types/index')
            ->where('filters.search', 'Backend')
            ->where('filters.status', 'active')
            ->has('practice_types.data', 1)
            ->where('practice_types.data.0.name', 'Desarrollo Backend')
        );
});

it('allows admins to view the create form', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('practice-types.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('practice-types/Create'));
});

it('allows admins to view the edit form', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $practiceType = PracticeType::create([
        'name' => 'Marketing Digital',
        'description' => 'Campanas y analitica.',
        'priority' => 'low',
        'color' => '#22c55e',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->get(route('practice-types.edit', $practiceType))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('practice-types/Edit')
            ->where('practiceType.name', 'Marketing Digital')
        );
});

it('allows admins to update practice types', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $practiceType = PracticeType::create([
        'name' => 'Soporte',
        'description' => 'Atencion inicial.',
        'priority' => 'low',
        'color' => '#64748b',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->patch(route('practice-types.update', $practiceType), [
            'name' => 'Soporte Tecnico',
            'description' => 'Atencion y resolucion de incidencias.',
            'priority' => 'high',
            'color' => '#0f766e',
            'is_active' => false,
        ])
        ->assertRedirect(route('practice-types.index'))
        ->assertSessionHas('success', 'Tipo de práctica actualizado.');

    expect($practiceType->fresh())
        ->name->toBe('Soporte Tecnico')
        ->description->toBe('Atencion y resolucion de incidencias.')
        ->priority->toBe('high')
        ->color->toBe('#0f766e')
        ->is_active->toBeFalse();
});

it('allows admins to toggle practice type status', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $practiceType = PracticeType::create([
        'name' => 'Comunicacion',
        'description' => 'Redaccion y contenidos.',
        'priority' => 'medium',
        'color' => '#a855f7',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->patch(route('practice-types.toggle', $practiceType))
        ->assertRedirect()
        ->assertSessionHas('success', 'Estado actualizado.');

    expect($practiceType->fresh()->is_active)->toBeFalse();
});

it('allows admins to delete practice types', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $practiceType = PracticeType::create([
        'name' => 'Administracion',
        'description' => 'Gestion documental.',
        'priority' => 'medium',
        'color' => '#14b8a6',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->delete(route('practice-types.destroy', $practiceType))
        ->assertRedirect()
        ->assertSessionHas('success', 'Tipo de práctica eliminado.');

    expect(PracticeType::query()->whereKey($practiceType->id)->exists())->toBeFalse();
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
