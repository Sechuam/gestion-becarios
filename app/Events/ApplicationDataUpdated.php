<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ApplicationDataUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly string $resource,
        public readonly string $action,
        public readonly int|string|null $resourceId = null,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('app.data');
    }

    public function broadcastAs(): string
    {
        return 'ApplicationDataUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'resource' => $this->resource,
            'action' => $this->action,
            'resource_id' => $this->resourceId,
            'broadcasted_at' => now()->toISOString(),
        ];
    }
}
