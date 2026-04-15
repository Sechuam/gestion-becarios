<?php
 
 namespace App\Models;
 
 use Illuminate\Database\Eloquent\Model;
 use Spatie\MediaLibrary\HasMedia;
 use Spatie\MediaLibrary\InteractsWithMedia;
 
 class Absence extends Model implements HasMedia
 {
     use InteractsWithMedia;
 
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
