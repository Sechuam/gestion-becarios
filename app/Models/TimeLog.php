<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property \Illuminate\Support\Carbon $date
 * @property string|null $clock_in
 * @property string|null $clock_out
 * @property float|null $total_hours
 */
class TimeLog extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'date' => 'date',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_user_id');
    }
}
