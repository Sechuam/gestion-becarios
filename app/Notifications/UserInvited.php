<?php

namespace App\Notifications;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvited extends Notification implements ShouldQueue
{
    use Queueable;

    public $invitation;

    public function __construct(Invitation $invitation)
    {
        $this->invitation = $invitation;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('register.invitation', ['token' => $this->invitation->token]);
        return (new MailMessage)
            ->subject('Has sido invitado a BecaGest')
            ->greeting('¡Hola!')
            ->line('Has sido invitado para unirte a la plataforma BecaGest, donde podrás seguir tus prácticas y gestionar tu información académica.')
            ->action('Aceptar invitación y Registrarse', $url)
            ->line('Este enlace de invitación expirará en 48 horas.')
            ->line('Si no esperabas esta invitación, puedes ignorar este correo');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
