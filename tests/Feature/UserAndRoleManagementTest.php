<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('manage users');
    Role::findOrCreate('admin')->givePermissionTo('manage users');
    Role::findOrCreate('tutor');
    Role::findOrCreate('intern');
});

it('lists users and roles for users with management permission', function () {
    $admin = User::factory()->create(['name' => 'Admin User']);
    $admin->assignRole('admin');

    $user = User::factory()->create(['name' => 'Managed User']);
    $user->assignRole('tutor');

    $this->actingAs($admin)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->has('users', 2)
            ->where('users.0.name', 'Admin User')
            ->where('users.1.name', 'Managed User')
            ->has('roles', 3)
        );
});

it('prevents an admin from removing their own admin role', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->patch(route('users.role', $admin), [
            'role' => 'tutor',
        ])
        ->assertRedirect()
        ->assertSessionHas('error', 'No puedes quitarte el rol de administrador.');

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

it('creates an intern profile when assigning the intern role', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->patch(route('users.role', $user), [
            'role' => 'intern',
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Rol actualizado correctamente.');

    expect($user->fresh()->hasRole('intern'))->toBeTrue()
        ->and($user->fresh()->intern)->not->toBeNull();
});

it('allows managing custom roles and their permissions', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $permission = Permission::findOrCreate('view reports');

    $this->actingAs($admin)
        ->post(route('roles.store'), [
            'name' => 'coordinator',
            'display_name' => 'Coordinador',
            'is_active' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Rol coordinator creado correctamente.');

    $role = Role::where('name', 'coordinator')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('roles.update', $role), [
            'display_name' => 'Coordinador Senior',
            'is_active' => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Rol coordinator actualizado.');

    expect($role->fresh()->display_name)->toBe('Coordinador Senior')
        ->and((bool) $role->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)
        ->post(route('roles.permissions.toggle', [$role, $permission]), [
            'enabled' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Permisos actualizados.');

    expect($role->fresh()->hasPermissionTo('view reports'))->toBeTrue();

    $this->actingAs($admin)
        ->delete(route('roles.destroy', $role))
        ->assertRedirect()
        ->assertSessionHas('success', 'Rol eliminado correctamente.');

    expect(Role::where('name', 'coordinator')->exists())->toBeFalse();
});

it('protects the admin role from destructive role changes', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $adminRole = Role::findByName('admin');
    $permission = Permission::findByName('manage users');

    $this->actingAs($admin)
        ->patch(route('roles.update', $adminRole), [
            'display_name' => 'Administrador',
            'is_active' => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('error', 'No puedes desactivar el rol admin.');

    $this->actingAs($admin)
        ->post(route('roles.permissions.toggle', [$adminRole, $permission]), [
            'enabled' => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('error', 'No puedes quitar permisos al rol admin.');

    $this->actingAs($admin)
        ->delete(route('roles.destroy', $adminRole))
        ->assertRedirect()
        ->assertSessionHas('error', 'No puedes eliminar el rol admin.');

    expect($adminRole->fresh()->hasPermissionTo('manage users'))->toBeTrue()
        ->and(Role::where('name', 'admin')->exists())->toBeTrue();
});
