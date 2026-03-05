<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EducationCenter extends Model {
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'adress',
        'city',
        'contact_person',
        'email',
        'phone',
    ];
}
