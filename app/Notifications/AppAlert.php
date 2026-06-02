<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class AppAlert extends Notification
{
    public function __construct(
        private readonly string $type,
        private readonly string $title,
        private readonly string $message,
        private readonly ?string $url = null,
        private readonly array $meta = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
            ...$this->meta,
        ];
    }
}
