<?php

namespace App\Observers;

use App\Events\ApplicationDataUpdated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BroadcastsModelChanges
{
    public function created(Model $model): void
    {
        $this->broadcast($model, 'created');
    }

    public function updated(Model $model): void
    {
        $this->broadcast($model, 'updated');
    }

    public function deleted(Model $model): void
    {
        $this->broadcast($model, 'deleted');
    }

    public function restored(Model $model): void
    {
        $this->broadcast($model, 'restored');
    }

    public function forceDeleted(Model $model): void
    {
        $this->broadcast($model, 'force_deleted');
    }

    protected function broadcast(Model $model, string $action): void
    {
        broadcast(new ApplicationDataUpdated(
            resource: Str::of(class_basename($model))->snake()->plural()->toString(),
            action: $action,
            resourceId: $model->getKey(),
        ));
    }
}
