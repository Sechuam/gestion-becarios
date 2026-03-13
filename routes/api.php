<?php

use App\Http\Controllers\Api\EducationCenterController;
use Illuminate\Support\Facades\Route;

Route::apiResource('education-centers', EducationCenterController::class);
