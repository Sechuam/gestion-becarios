<?php

use App\Models\EvaluationCriterion;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Role::findOrCreate('admin');
    Role::findOrCreate('tutor');
});

it('allows admins to list evaluation criteria', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    EvaluationCriterion::create([
        'name' => 'Responsabilidad',
        'category' => 'Actitud',
        'weight' => 1.5,
        'max_score' => 10,
        'sort_order' => 2,
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->get(route('evaluation-criteria.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evaluations/criteria/index')
            ->where('criteria.data.0.name', 'Responsabilidad')
            ->where('categories.0', 'Actitud')
        );
});

it('allows admins to create and update evaluation criteria', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('evaluation-criteria.store'), [
            'name' => 'Calidad tecnica',
            'category' => 'Desempeno',
            'description' => 'Entrega trabajo con calidad.',
            'rubric' => '1 bajo, 10 excelente.',
            'weight' => 2,
            'max_score' => 10,
            'sort_order' => 1,
            'is_active' => true,
        ])
        ->assertRedirect(route('evaluation-criteria.index'))
        ->assertSessionHas('success', 'Criterio de evaluacion creado.');

    $criterion = EvaluationCriterion::where('name', 'Calidad tecnica')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('evaluation-criteria.update', $criterion), [
            'name' => 'Calidad tecnica actualizada',
            'category' => 'Desempeno',
            'description' => 'Entrega trabajo con calidad y autonomia.',
            'rubric' => '1 bajo, 10 excelente.',
            'weight' => 3,
            'max_score' => 10,
            'sort_order' => 4,
            'is_active' => true,
        ])
        ->assertRedirect(route('evaluation-criteria.index'))
        ->assertSessionHas('success', 'Criterio de evaluacion actualizado.');

    expect($criterion->fresh()->name)->toBe('Calidad tecnica actualizada')
        ->and((float) $criterion->fresh()->weight)->toBe(3.0)
        ->and($criterion->fresh()->sort_order)->toBe(4);
});

it('validates required evaluation criterion fields', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('evaluation-criteria.store'), [
            'name' => '',
            'category' => '',
            'weight' => 0,
            'max_score' => 0,
        ])
        ->assertSessionHasErrors(['name', 'category', 'weight', 'max_score']);

    expect(EvaluationCriterion::count())->toBe(0);
});

it('allows admins to toggle and delete evaluation criteria', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $criterion = EvaluationCriterion::create([
        'name' => 'Comunicacion',
        'category' => 'Competencias',
        'weight' => 1,
        'max_score' => 10,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->patch(route('evaluation-criteria.toggle', $criterion))
        ->assertRedirect()
        ->assertSessionHas('success', 'Estado actualizado.');

    expect($criterion->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)
        ->delete(route('evaluation-criteria.destroy', $criterion))
        ->assertRedirect()
        ->assertSessionHas('success', 'Criterio de evaluacion eliminado.');

    expect(EvaluationCriterion::whereKey($criterion->id)->exists())->toBeFalse();
});

it('prevents non admins from managing evaluation criteria', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $this->actingAs($tutor)
        ->get(route('evaluation-criteria.index'))
        ->assertRedirect()
        ->assertSessionHas('error', 'No tienes permiso para acceder');
});
