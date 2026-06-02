<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Lee una notificación y redirige a la URL correspondiente.
     */
    public function read(string $id): RedirectResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->whereKey($id)->first();

        if (! $notification) {
            return redirect()->route('dashboard')
                ->with('error', 'Notificación no encontrada.');
        }

        $notification->markAsRead();

        $data = $notification->data;

        if (! empty($data['url']) && is_string($data['url']) && str_starts_with($data['url'], '/')) {
            return redirect($data['url']);
        }

        // Redirigir según el tipo de notificación
        return match ($data['type'] ?? '') {
            'new_message' => redirect()->route('messages.index', [
                'conversation' => $data['conversation_id'] ?? null,
            ]),
            'absence_request' => redirect(
                $data['intern_id'] ?? false
                    ? route('interns.show', $data['intern_id']).'#asistencia'
                    : route('dashboard')
            ),
            default => redirect()->route('dashboard'),
        };
    }

    /**
     * Lee todas las notificaciones del usuario.
     */
    public function readAll(): RedirectResponse
    {
        Auth::user()->unreadNotifications->markAsRead();

        return redirect()->back()
            ->with('success', 'Todas las notificaciones marcadas como leídas.');
    }
}
