<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'date' => 'date',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
