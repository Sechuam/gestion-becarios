<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskStatusLog extends Model
{
    protected $fillable = ['task_id', 'from_status', 'to_status', 'changed_by', 'changed_at'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
