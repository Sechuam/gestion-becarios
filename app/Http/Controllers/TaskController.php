<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Models\TaskStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query()
            ->with(['practiceType', 'creator', 'interns']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

        $tasks = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'practice_type', 'due_from', 'due_to']),
        ]);
    }

    public function store(StoreTaskRequest $request)
    {
        $task = Task::create([
            ...$request->validated(),
            'created_by' => Auth::id(),
        ]);

        if ($request->filled('intern_ids')) {
            $task->interns()->sync($request->intern_ids);
        }

        TaskStatusLog::create([
            'task_id' => $task->id,
            'from_status' => null,
            'to_status' => $task->status,
            'changed_by' => Auth::id(),
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Tarea creada correctamente.');
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        $fromStatus = $task->status;
        $task->update($request->validated());

        if ($request->filled('intern_ids')) {
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

        return back()->with('success', 'Tarea actualizada.');
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return back()->with('success', 'Tarea eliminada.');
    }

    public function updateStatus(Request $request, Task $task)
    {
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
}