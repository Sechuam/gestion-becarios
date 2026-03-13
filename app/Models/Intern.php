<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Intern extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (Intern $intern) {
            if ($intern->status === 'cancelled') {
                return;
            }

            $start = $intern->start_date ? Carbon::parse($intern->start_date)->startOfDay() : null;
            $end = $intern->end_date ? Carbon::parse($intern->end_date)->endOfDay() : null;
            $today = Carbon::today();

            if (! $start || ! $end) {
                $intern->status = 'pending';
                return;
            }

            if ($today->lt($start)) {
                $intern->status = 'pending';
            } elseif ($today->gt($end)) {
                $intern->status = 'completed';
            } else {
                $intern->status = 'active';
            }
        });
    }

    protected $fillable = [
        'user_id',
        'education_center_id',
        'dni',
        'birth_date',
        'phone',
        'address',
        'city',
        'academic_degree',
        'academic_year',
        'start_date',
        'end_date',
        'status',
        'tutor_name',
        'total_hours',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function educationCenter(): BelongsTo
    {
        return $this->belongsTo(EducationCenter::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('dni')
            ->singleFile();
        $this->addMediaCollection('agreement')
            ->singleFile();
        $this->addMediaCollection('insurance')
            ->singleFile();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
