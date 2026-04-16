<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\User;
use App\Notifications\UserInvited;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rules\Password;

class InvitationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ], [
            'email.unique' => 'Ese correo ya pertenece a un usuario registrado.'
        ]);

        Invitation::where('email', $request->email)->delete();

        $invitation = Invitation::create([
            'email' => $request->email,
            'token' => Str::random(32),
            'role' => $request->role,
            'expires_at' => now()->addHours(48),
        ]);
        Notification::route('mail', $request->email)->notify(new UserInvited($invitation));

        return back()->with('success', 'Invitación enviada correctamente al correo.');
    }



    public function accept(Request $request, $token)
    {
        $invitation = Invitation::where('token', $token)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        return Inertia::render('auth/RegisterByInvitation', [
            'email' => $invitation->email,
            'token' => $invitation->token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string', 'exists:invitations,token'],
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $invitation = Invitation::where('token', $request->token)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();
        $user = User::create([
            'name' => $request->name,
            'email' => $invitation->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
        ]);
        $user->assignRole($invitation->role);
        $invitation->update([
            'accepted_at' => now()
        ]);

        auth()->login($user);

        return redirect()->route('dashboard');
    }
}
