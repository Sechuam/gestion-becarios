<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EducationCenterController;

Route::apiResource('education-centers', EducationCenterController::class);