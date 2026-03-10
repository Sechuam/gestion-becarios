<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Intern extends Model implements HasMedia {

    use HasFactory, SoftDeletes, InteractsWithMedia;

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
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function educationCenter(): BelongsTo {
        return $this->belongsTo(EducationCenter::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('dni')
        ->singleFile();
        $this->addMediaCollection('agreement')
        ->singleFile();
    }
}

