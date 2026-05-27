<?php

use App\Models\ReportTemplate;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Role::findOrCreate('intern');
});

it('allows users with report access to manage their own report templates', function () {
    $user = User::factory()->create();
    $user->assignRole('intern');

    $createResponse = $this->actingAs($user)->post(route('reports.templates.store'), [
        'name' => 'Informe semanal',
        'dataset' => 'interns',
        'columns' => ['id', 'name', 'email', 'status'],
        'filters' => ['status' => 'active'],
    ]);

    $createResponse->assertRedirect()
        ->assertSessionHas('success', 'Plantilla de informe guardada correctamente.');

    $template = ReportTemplate::query()->where('user_id', $user->id)->first();

    expect($template)->not->toBeNull()
        ->and($template->name)->toBe('Informe semanal')
        ->and($template->dataset)->toBe('interns')
        ->and($template->columns)->toBe(['id', 'name', 'email', 'status'])
        ->and($template->filters)->toBe(['status' => 'active']);

    $updateResponse = $this->actingAs($user)->patch(route('reports.templates.update', $template), [
        'name' => 'Informe semanal actualizado',
    ]);

    $updateResponse->assertRedirect()
        ->assertSessionHas('success', 'Plantilla de informe actualizada correctamente.');

    expect($template->fresh()->name)->toBe('Informe semanal actualizado');

    $deleteResponse = $this->actingAs($user)->delete(route('reports.templates.destroy', $template));

    $deleteResponse->assertRedirect()
        ->assertSessionHas('success', 'Plantilla de informe eliminada correctamente.');

    expect(ReportTemplate::query()->whereKey($template->id)->exists())->toBeFalse();
});

it('prevents users from managing report templates owned by another user', function () {
    $owner = User::factory()->create();
    $owner->assignRole('intern');

    $otherUser = User::factory()->create();
    $otherUser->assignRole('intern');

    $template = ReportTemplate::create([
        'user_id' => $owner->id,
        'name' => 'Informe privado',
        'dataset' => 'interns',
        'columns' => ['id', 'name'],
        'filters' => [],
    ]);

    $this->actingAs($otherUser)
        ->patch(route('reports.templates.update', $template), [
            'name' => 'Intento de cambio',
        ])
        ->assertForbidden();

    $this->actingAs($otherUser)
        ->delete(route('reports.templates.destroy', $template))
        ->assertForbidden();

    expect($template->fresh()->name)->toBe('Informe privado')
        ->and(ReportTemplate::query()->whereKey($template->id)->exists())->toBeTrue();
});
