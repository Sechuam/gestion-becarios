<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Task;
use App\Models\EducationCenter;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // DATOS BASE (por ahora simples para evitar errores)
        $stats = [
            'active_interns' => User::count(),
            'active_centers' => EducationCenter::count(),
            'active_tasks' => Task::where('status', 'active')->count(),
            'alerts' => 3,
        ];

        return Inertia::render('dashboard/Index', [
            'role' => $user->roles->first()?->name ?? 'intern',
            'stats' => $stats,
        ]);
    }
}