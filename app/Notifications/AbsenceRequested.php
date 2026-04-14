<?php

namespace App\Notifications;

use App\Models\Absence;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AbsenceRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public $absence;

    public function __construct(Absence $absence)
    {
        $this->absence = $absence;
    }

    // Usaremos correo y base de datos ("campanita" web)
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    // La plantilla del correo electrónico
    public function toMail(object $notifiable): MailMessage
    {
        $nombreBecario = $this->absence->user->name;
        $fecha = \Carbon\Carbon::parse($this->absence->date)->format('d/m/Y');

        return (new MailMessage)
            ->subject("Nueva solicitud de ausencia: {$nombreBecario}")
            ->greeting("¡Hola!")
            ->line("El becario **{$nombreBecario}** ha solicitado una ausencia para el día **{$fecha}**.")
            ->line("Motivo indicado: {$this->absence->reason}")
            ->action('Revisar Solicitud', url('/dashboard'))
            ->line('Por favor, entra al panel para aprobarla o denegarla.');
    }

    // Lo que guardaremos en la base de datos para mostrar en la web
    public function toDatabase(object $notifiable): array
    {
        return [
            'absence_id' => $this->absence->id,
            'intern_id' => $this->absence->user->intern->id,
            'intern_name' => $this->absence->user->name,
            'date' => $this->absence->date,
            'reason' => $this->absence->reason,
            'type' => 'absence_request',
            'message' => "{$this->absence->user->name} ha solicitado el día " . \Carbon\Carbon::parse($this->absence->date)->format('d/m/Y') . " libre."
        ];
    }
}
