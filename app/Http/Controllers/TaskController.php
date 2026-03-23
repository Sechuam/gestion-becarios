<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\PracticeType;
use App\Models\Task;
use App\Models\TaskStatusLog;
use App\Models\Intern;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query()
            ->with(['practiceType', 'creator', 'interns.user']);

        $user = Auth::user();
        if ($user?->hasRole('intern')) {
            $query->whereHas('interns', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('title', 'ilike', '%'.$request->search.'%');
        }

        if ($request->filled('practice_type')) {
            $query->where('practice_type_id', $request->practice_type);
        }

        if ($request->filled('due_from')) {
            $query->whereDate('due_date', '>=', $request->due_from);
        }

        if ($request->filled('due_to')) {
            $query->whereDate('due_date', '<=', $request->due_to);
        }

        $sort = $request->get('sort');
        $direction = strtolower($request->get('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortable = [
            'title' => 'tasks.title',
            'practice_type' => 'practice_types.name',
            'status' => 'tasks.status',
            'priority' => 'tasks.priority',
            'due_date' => 'tasks.due_date',
            'created_at' => 'tasks.created_at',
            'updated_at' => 'tasks.updated_at',
        ];

        if ($sort && isset($sortable[$sort])) {
            if ($sort === 'practice_type') {
                $query->leftJoin('practice_types', 'practice_types.id', '=', 'tasks.practice_type_id')
                    ->select('tasks.*');
            }
            $query->orderBy($sortable[$sort], $direction);
        } else {
            $query->latest();
        }

        $tasks = $query->paginate(10)->withQueryString();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'practice_type', 'due_from', 'due_to', 'search', 'sort', 'direction']),
            'practice_types' => PracticeType::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function myTasks(Request $request)
    {
        $userId = Auth::id();

        $query = Task::query()
            ->with(['practiceType', 'creator', 'interns.user'])
            ->whereHas('interns', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('title', 'ilike', '%'.$request->search.'%');
        }

        if ($request->filled('practice_type')) {
            $query->where('practice_type_id', $request->practice_type);
        }

        if ($request->filled('due_from')) {
            $query->whereDate('due_date', '>=', $request->due_from);
        }

        if ($request->filled('due_to')) {
            $query->whereDate('due_date', '<=', $request->due_to);
        }

        $sort = $request->get('sort');
        $direction = strtolower($request->get('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortable = [
            'title' => 'tasks.title',
            'practice_type' => 'practice_types.name',
            'status' => 'tasks.status',
            'priority' => 'tasks.priority',
            'due_date' => 'tasks.due_date',
            'created_at' => 'tasks.created_at',
            'updated_at' => 'tasks.updated_at',
        ];

        if ($sort && isset($sortable[$sort])) {
            if ($sort === 'practice_type') {
                $query->leftJoin('practice_types', 'practice_types.id', '=', 'tasks.practice_type_id')
                    ->select('tasks.*');
            }
            $query->orderBy($sortable[$sort], $direction);
        } else {
            $query->latest();
        }

        $tasks = $query->paginate(10)->withQueryString();

        return Inertia::render('tasks/My', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'practice_type', 'due_from', 'due_to', 'search', 'sort', 'direction']),
            'practice_types' => PracticeType::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(StoreTaskRequest $request)
    {
        $task = Task::create([
            ...$request->validated(),
            'created_by' => Auth::id(),
        ]);

        if ($request->has('intern_ids')) {
            $task->interns()->sync($request->intern_ids);
        }

        TaskStatusLog::create([
            'task_id' => $task->id,
            'from_status' => null,
            'to_status' => $task->status,
            'changed_by' => Auth::id(),
            'changed_at' => now(),
        ]);

        return to_route('tasks.index')->with('success', 'Tarea creada correctamente.');
    }

    public function create()
    {
        return Inertia::render('tasks/Create', [
            'practice_types' => PracticeType::where('is_active', true)->get(['id', 'name']),
            'interns' => Intern::with('user')->get(),
        ]);
    }

    public function edit(Task $task)
    {
        if (Auth::user()?->hasRole('intern')) {
            return back()->with('error', 'No tienes permiso para editar tareas.');
        }

        $task->load(['interns']);

        return Inertia::render('tasks/Edit', [
            'task' => $task,
            'practice_types' => PracticeType::where('is_active', true)->get(['id', 'name']),
            'interns' => Intern::with('user')->get(),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        if (Auth::user()?->hasRole('intern')) {
            return back()->with('error', 'No tienes permiso para editar tareas.');
        }

        $fromStatus = $task->status;
        $task->update($request->validated());

        if ($request->has('intern_ids')) {
            $task->interns()->sync($request->intern_ids);
        }

        if ($request->filled('status') && $fromStatus !== $task->status) {
            TaskStatusLog::create([
                'task_id' => $task->id,
                'from_status' => $fromStatus,
                'to_status' => $task->status,
                'changed_by' => Auth::id(),
                'changed_at' => now(),
            ]);
        }

        return to_route('tasks.index')->with('success', 'Tarea actualizada.');
    }

    public function destroy(Task $task)
    {
        if (! in_array($task->status, ['completed', 'rejected'], true)) {
            return back()->with('error', 'Solo puedes eliminar tareas completadas o rechazadas.');
        }

        $task->delete();
        return back()->with('success', 'Tarea eliminada correctamente.');
    }

    public function updateStatus(Request $request, Task $task)
    {
        if (Auth::user()?->hasRole('intern')) {
            return back()->with('error', 'No tienes permiso para editar tareas.');
        }

        $request->validate([
            'status' => 'required|in:pending,in_progress,in_review,completed,rejected',
        ]);

        $fromStatus = $task->status;
        $task->update(['status' => $request->status]);

        TaskStatusLog::create([
            'task_id' => $task->id,
            'from_status' => $fromStatus,
            'to_status' => $task->status,
            'changed_by' => Auth::id(),
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Estado actualizado.');
    }

    public function show(Task $task)
    {
        $task->load(['practiceType', 'creator', 'interns.user', 'comments.user']);

        $user = Auth::user();
        $isIntern = $user?->hasRole('intern');
        $isAssigned = $isIntern
            ? $task->interns()->where('user_id', $user->id)->exists()
            : false;

        if ($isAssigned && $task->status === 'pending') {
            $fromStatus = $task->status;
            $task->update(['status' => 'in_progress']);

            TaskStatusLog::create([
                'task_id' => $task->id,
                'from_status' => $fromStatus,
                'to_status' => 'in_progress',
                'changed_by' => $user->id,
                'changed_at' => now(),
            ]);
        }

        $attachments = $task->getMedia('attachments')->map(function ($media) {
            return [
                'id' => $media->id,
                'name' => $media->file_name,
                'url' => $media->getUrl(),
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'created_at' => $media->created_at?->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('tasks/Show', [
            'task' => $task,
            'attachments' => $attachments,
            'is_assigned' => $isAssigned,
        ]);
    }

    public function complete(Task $task)
    {
        $user = Auth::user();

        if (! $user?->hasRole('intern')) {
            return back()->with('error', 'Solo un becario puede completar una tarea.');
        }

        $isAssigned = $task->interns()->where('user_id', $user->id)->exists();
        if (! $isAssigned) {
            return back()->with('error', 'No tienes esta tarea asignada.');
        }

        if ($task->status === 'completed') {
            return back()->with('success', 'La tarea ya está completada.');
        }

        $fromStatus = $task->status;
        $task->update(['status' => 'completed']);

        TaskStatusLog::create([
            'task_id' => $task->id,
            'from_status' => $fromStatus,
            'to_status' => 'completed',
            'changed_by' => $user->id,
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Tarea marcada como completada.');
    }

    public function storeComment(Request $request, Task $task)
    {
        $request->validate([
            'comment' => 'required|string|max:2000',
        ]);

        TaskComment::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Comentario añadido.');
    }

    public function addAttachment(Request $request, Task $task)
    {
        $request->validate([
            'attachments' => 'required|array',
            'attachments.*' => 'file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $task->addMedia($file)->toMediaCollection('attachments');
        }

        return back()->with('success', 'Archivos subidos correctamente.');
    }
}
