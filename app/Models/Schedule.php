<?php

namespace App\Models;

use App\Support\DashboardCache;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected static function booted(): void
    {
        static::saved(fn () => DashboardCache::refresh());
        static::deleted(fn () => DashboardCache::refresh());
    }

    protected $guarded = ['id'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
