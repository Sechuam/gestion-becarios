<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    public function index()
    {
        $roles = Role::query()
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'is_active' => (bool) ($role->is_active ?? true),
                'users_count' => $role->users_count ?? 0,
                'is_protected' => $role->name === 'admin',
            ]);

        $permissions = Permission::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
            ]);

        $rolePermissionTable = config('permission.table_names.role_has_permissions', 'role_permissions');
        $rolePermissions = DB::table($rolePermissionTable)
            ->select('role_id', 'permission_id')
            ->get()
            ->groupBy('role_id')
            ->map(fn ($rows) => $rows->pluck('permission_id')->values());

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')],
            'display_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'El nombre del rol es obligatorio.',
            'name.unique' => 'Ya existe un rol con ese nombre.',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'] ?? null,
            'guard_name' => 'web',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', "Rol {$role->name} creado correctamente.");
    }

    public function update(Request $request, Role $role)
    {
        if ($role->name === 'admin' && $request->boolean('is_active') === false) {
            return back()->with('error', 'No puedes desactivar el rol admin.');
        }

        $validated = $request->validate([
            'display_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ], [
            'display_name.max' => 'El nombre mostrado no debe superar 255 caracteres.',
        ]);

        $role->update([
            'display_name' => $validated['display_name'] ?? null,
            'is_active' => $validated['is_active'],
        ]);

        return back()->with('success', "Rol {$role->name} actualizado.");
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            return back()->with('error', 'No puedes eliminar el rol admin.');
        }

        if ($role->users()->exists()) {
            return back()->with('error', 'No puedes eliminar un rol con usuarios asignados.');
        }

        $role->delete();

        return back()->with('success', 'Rol eliminado correctamente.');
    }

    public function togglePermission(Request $request, Role $role, Permission $permission)
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        if ($role->name === 'admin' && $validated['enabled'] === false) {
            return back()->with('error', 'No puedes quitar permisos al rol admin.');
        }

        if ($validated['enabled']) {
            $role->givePermissionTo($permission);
        } else {
            $role->revokePermissionTo($permission);
        }

        return back()->with('success', 'Permisos actualizados.');
    }
}
