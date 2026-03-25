<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeType extends Model
{
    protected $fillable = [
        'name', 'description', 'priority', 'color', 'is_active',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
