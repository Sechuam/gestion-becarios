<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class TutorController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->role('tutor')
            ->withCount([
                'assignedInterns as assigned_interns_count',
                'createdTasks as tasks_created_count',
            ]);

        if ($request->filled('search')) {
            $term = '%'.strtolower((string) $request->string('search')).'%';

            $query->where(function ($subQuery) use ($term) {
                $subQuery->where(DB::raw('lower(name)'), 'like', $term)
                    ->orWhere(DB::raw('lower(email)'), 'like', $term);
            });
        }

        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortable = [
            'name' => 'name',
            'email' => 'email',
            'assigned_interns_count' => 'assigned_interns_count',
            'tasks_created_count' => 'tasks_created_count',
            'created_at' => 'created_at',
        ];

        if ($sort && isset($sortable[$sort])) {
            $query->orderBy($sortable[$sort], $direction);
        } else {
            $query->orderBy('name');
        }

        $metricsQuery = clone $query;
        $resultCount = (clone $metricsQuery)->count();
        $withAssignedInternsCount = (clone $metricsQuery)
            ->whereHas('assignedInterns')
            ->count();
        $tasksCreatedCount = (clone $metricsQuery)
            ->get()
            ->sum('tasks_created_count');

        $tutors = $query
            ->paginate(10)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'assigned_interns_count' => $user->assigned_interns_count,
                'tasks_created_count' => $user->tasks_created_count,
            ])
            ->withQueryString();

        return Inertia::render('tutors/index', [
            'tutors' => $tutors,
            'filters' => $request->only(['search', 'sort', 'direction']),
            'stats' => [
                'results' => $resultCount,
                'with_assigned_interns' => $withAssignedInternsCount,
                'tasks_created' => $tasksCreatedCount,
            ],
        ]);
    }

    public function show(Request $request, User $user)
    {
        abort_unless($user->hasRole('tutor'), 404);

        $tutor = $user->loadCount([
            'assignedInterns as assigned_interns_count',
            'createdTasks as tasks_created_count',
        ]);

        $assignedInternsQuery = Intern::query()
            ->where('company_tutor_user_id', $user->id)
            ->join('users', 'users.id', '=', 'interns.user_id')
            ->leftJoin('education_centers', 'education_centers.id', '=', 'interns.education_center_id')
            ->with(['user', 'educationCenter'])
            ->select('interns.*');

        if ($request->filled('search')) {
            $term = '%'.strtolower((string) $request->string('search')).'%';

            $assignedInternsQuery->where(function ($subQuery) use ($term) {
                $subQuery->where(DB::raw('lower(users.name)'), 'like', $term)
                    ->orWhere(DB::raw('lower(users.email)'), 'like', $term)
                    ->orWhere(DB::raw('lower(interns.dni)'), 'like', $term)
                    ->orWhere(DB::raw('lower(education_centers.name)'), 'like', $term);
            });
        }

        $assignedInterns = $assignedInternsQuery
            ->orderBy('users.name')
            ->paginate(10)
            ->through(fn (Intern $intern) => [
                'id' => $intern->id,
                'dni' => $intern->dni,
                'status' => $intern->status,
                'progress' => $intern->progress,
                'user' => [
                    'name' => $intern->user?->name,
                    'email' => $intern->user?->email,
                ],
                'education_center' => $intern->educationCenter ? [
                    'id' => $intern->educationCenter->id,
                    'name' => $intern->educationCenter->name,
                ] : null,
            ])
            ->withQueryString();

        $createdTasks = Task::query()
            ->where('created_by', $user->id)
            ->with(['practiceType'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'due_date' => $task->due_date,
                'practice_type' => $task->practiceType ? [
                    'id' => $task->practiceType->id,
                    'name' => $task->practiceType->name,
                ] : null,
                'created_at' => $task->created_at,
            ]);

        return Inertia::render('tutors/Show', [
            'tutor' => [
                'id' => $tutor->id,
                'name' => $tutor->name,
                'email' => $tutor->email,
                'created_at' => $tutor->created_at,
                'assigned_interns_count' => $tutor->assigned_interns_count,
                'tasks_created_count' => $tutor->tasks_created_count,
            ],
            'assigned_interns' => $assignedInterns,
            'created_tasks' => $createdTasks,
            'filters' => $request->only(['search']),
        ]);
    }

    public function mine(Request $request)
    {
        /** @var User|null $user */
        $user = Auth::user();

        abort_unless($user?->isTutor(), 403);

        $assignedInternsQuery = Intern::query()
            ->where('company_tutor_user_id', $user->id)
            ->join('users', 'users.id', '=', 'interns.user_id')
            ->leftJoin('education_centers', 'education_centers.id', '=', 'interns.education_center_id')
            ->with(['user', 'educationCenter'])
            ->select('interns.*');

        if ($request->filled('search')) {
            $term = '%'.strtolower((string) $request->string('search')).'%';

            $assignedInternsQuery->where(function ($subQuery) use ($term) {
                $subQuery->where(DB::raw('lower(users.name)'), 'like', $term)
                    ->orWhere(DB::raw('lower(users.email)'), 'like', $term)
                    ->orWhere(DB::raw('lower(interns.dni)'), 'like', $term)
                    ->orWhere(DB::raw('lower(education_centers.name)'), 'like', $term);
            });
        }

        if ($request->filled('status')) {
            $assignedInternsQuery->where('interns.status', $request->input('status'));
        }

        $assignedInterns = $assignedInternsQuery
            ->orderBy('users.name')
            ->paginate(10)
            ->through(fn (Intern $intern) => [
                'id' => $intern->id,
                'dni' => $intern->dni,
                'status' => $intern->status,
                'progress' => $intern->progress,
                'is_delayed' => $intern->is_delayed,
                'user' => [
                    'name' => $intern->user?->name,
                    'email' => $intern->user?->email,
                ],
                'education_center' => $intern->educationCenter ? [
                    'id' => $intern->educationCenter->id,
                    'name' => $intern->educationCenter->name,
                ] : null,
            ])
            ->withQueryString();

        $recentTasks = Task::query()
            ->where('created_by', $user->id)
            ->with(['practiceType'])
            ->withCount('interns')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'due_date' => $task->due_date,
                'interns_count' => $task->interns_count,
                'practice_type' => $task->practiceType ? [
                    'id' => $task->practiceType->id,
                    'name' => $task->practiceType->name,
                ] : null,
            ]);

        $totalAssigned = $user->assignedInterns()->count();
        $activeInterns = $user->assignedInterns()->where('status', 'active')->count();
        $delayedInterns = $user->assignedInterns()
            ->whereDate('end_date', '<', Carbon::today())
            ->where('status', '!=', 'completed')
            ->count();
        $openTasks = $user->createdTasks()
            ->whereIn('status', ['pending', 'in_progress', 'in_review'])
            ->count();

        return Inertia::render('tutors/My', [
            'tutor' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'interns' => $assignedInterns,
            'recent_tasks' => $recentTasks,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'assigned' => $totalAssigned,
                'active' => $activeInterns,
                'delayed' => $delayedInterns,
                'open_tasks' => $openTasks,
            ],
        ]);
    }
}
