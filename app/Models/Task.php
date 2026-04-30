<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Task extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'reject_reason',
        'kanban_position',
        'status',
        'priority',
        'due_date',
        'completed_at',
        'created_by',
        'practice_type_id',
    ];

    public function practiceType()
    {
        return $this->belongsTo(PracticeType::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function interns()
    {
        return $this->belongsToMany(Intern::class, 'intern_task')->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class)->whereNull('parent_id');
    }

    public function statusLogs()
    {
        return $this->hasMany(TaskStatusLog::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments');
    }
}
