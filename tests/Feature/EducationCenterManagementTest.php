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

    Permission::findOrCreate('manage schools');

    Role::findOrCreate('admin')->givePermissionTo('manage schools');
    Role::findOrCreate('tutor');
});

it('allows staff to view the education centers index', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    EducationCenter::factory()->create([
    'name' => 'Centro Norte',
    'city' => 'Madrid',
    ]);

    $this->actingAs($admin)
    ->get(route('schools.index'))
    ->assertOk()
    ->assertInertia(fn (Assert $page) => $page
    ->component('schools/index')
    ->where('schools.data.0.name', 'Centro Norte')
    );
});

it('allows staff to view an education center detail', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $school = EducationCenter::factory()->create([
    'name' => 'Centro Sur',
    ]);

    $this->actingAs($admin)
    ->get(route('schools.show', $school))
    ->assertOk()
    ->assertInertia(fn (Assert $page) => $page
    ->component('schools/Show')
    ->where('educationCenter.name', 'Centro Sur')
    );
});

it('prevents deleting education centers with active interns', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $school = EducationCenter::factory()->create();

    Intern::factory()->create([
    'education_center_id' => $school->id,
    'status' => 'active',
    ]);

    $this->actingAs($admin)
    ->delete(route('centros.destroy', $school))
    ->assertRedirect()
    ->assertSessionHas('error', 'No se puede eliminar un centro educativo con becarios activos.');

    expect(EducationCenter::whereKey($school->id)->exists())->toBeTrue();
});

it('allows admins to create education centers', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
    ->post(route('centros.store'), [
    'name' => 'Centro Nuevo',
    'code' => 'CN-001',
    'city' => 'Valencia',
    'address' =>'Calle Nueva 1',
    'phone' =>'961234567',
    'email' =>'centro-nuevo@example.test',
    'contact_person' =>'Persona Contacto',
    'contact_email' =>'contacto@example.test',
    ])
    ->assertRedirect(route('schools.index'))
    ->assertSessionHas('success', 'Centro Educativo creado.');

    expect(EducationCenter::where('name', 'Centro Nuevo')->exists())->toBeTrue();
});

it('allows admins to update education centers', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

   $school = EducationCenter::factory()->create([
   'name' => 'Centro Antiguo',
   'city' => 'Madrid',
   ]);

   $this->actingAs($admin)
   ->patch(route('centros.update', $school), [
   'name' => 'Centro Actualizado',
   'code' => $school->code,
   'city' => 'Barcelona',
   'address' => 'Calle Actualizada 1',
   'phone' => '931234567',
   'email' => 'centro-actualizado@example.test',
   'contact_person' => 'Nuevo Contacto',
   'contact_email' => 'nuevo-contacto@example.test',
   ])
   ->assertRedirect(route('schools.index'))
   ->assertSessionHas('success', 'Centro Educativo actualizado');

   expect($school->fresh()->name)->toBe('Centro Actualizado')
   ->and($school->fresh()->city)->toBe('Barcelona');
});

it('allows admins to archive education cernters without active interns', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $school = EducationCenter::factory()->create();

    $this->actingAs($admin)
    ->delete(route('centros.destroy', $school))
    ->assertRedirect(route('schools.index'))
    ->assertSessionHas('success', 'Centro Educativo eliminado');

    expect(EducationCenter::query()->whereKey($school->id)->exists())->toBeFalse()
    ->and(EducationCenter::withTrashed()->whereKey($school->id)->first()?->trashed())->toBeTrue();
});

it('allows admins to restore archived education centers', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $school = EducationCenter::factory()->create();
    $school->delete();

    $this->actingAs($admin)
    ->post(route('schools.restore', $school->id))
    ->assertRedirect()
    ->assertSessionHas('success', 'Centro Educativo restaurado correctamente');

    expect($school->fresh()->trashed())->toBeFalse();
});

it('allows admins to permanently delete archived education centers', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $school = EducationCenter::factory()->create();
    $school->delete();

    $this->actingAs($admin)
    ->delete(route('schools.forceDelete', $school->id))
    ->assertRedirect()
    ->assertSessionHas('success', 'Centro Educativo eliminado definitivamente');

    expect(EducationCenter::withTrashed()->whereKey($school->id)->exists())->toBeFalse();
});
