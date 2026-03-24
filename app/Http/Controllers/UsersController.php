<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->with('roles')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->values(),
            ]);

        $roles = Role::query()
            ->orderBy('name')
            ->pluck('name');

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,tutor,intern',
        ]);

        $role = $request->input('role');

        // Prevent removing your own admin role.
        if ($user->id === Auth::id() && $role !== 'admin') {
            return back()->with('error', 'No puedes quitarte el rol de administrador.');
        }

        $user->syncRoles([$role]);

        return back()->with('success', 'Rol actualizado correctamente.');
    }
}
