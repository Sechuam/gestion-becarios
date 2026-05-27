<?php

use App\Http\Controllers\EducationCenterController;
use Illuminate\Support\Facades\Route;

Route::apiResource('education-centers', EducationCenterController::class);
