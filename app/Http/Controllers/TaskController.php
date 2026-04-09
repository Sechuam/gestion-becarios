<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Intern;
use App\Models\PracticeType;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\EducationCenter;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query()
            ->with(['practiceType', 'creator', 'interns.user'])
            ->withCount('comments');

        $user = Auth::user();
        if ($user?->isIntern()) {
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

        if ($request->filled('intern_id')) {
            $query->whereHas('interns', function ($q) use ($request) {
                $q->where('interns.id', $request->intern_id);
            });
        }

        if ($request->filled('due_from')) {
            $query->whereDate('due_date', '>=', $request->due_from);
        }

        if ($request->filled('due_to')) {
            $query->whereDate('due_date', '<=', $request->due_to);
        }

        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
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
            $query
                ->orderByRaw('COALESCE(tasks.kanban_position, 2147483647)')
                ->latest();
        }

        $tasks = $query->paginate(10)->withQueryString();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'practice_type', 'intern_id', 'due_from', 'due_to', 'search', 'sort', 'direction']),
            'practice_types' => PracticeType::where('is_active', true)->get(['id', 'name']),
            'interns' => Intern::query()
                ->with('user:id,name')
                ->join('users', 'users.id', '=', 'interns.user_id')
                ->orderBy('users.name')
                ->select('interns.id', 'interns.user_id')
                ->get()
                ->map(fn (Intern $intern) => [
                    'id' => $intern->id,
                    'name' => $intern->user?->name ?? "Becario #{$intern->id}",
                ]),
        ]);
    }

    public function myTasks(Request $request)
    {
        $userId = Auth::id();

        $query = Task::query()
            ->with(['practiceType', 'creator', 'interns.user'])
            ->withCount('comments')
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

        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
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
            $query
                ->orderByRaw('COALESCE(tasks.kanban_position, 2147483647)')
                ->latest();
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
        if (! Auth::user()?->isTutor()) {
            return back()->with('error', 'Solo los tutores pueden crear tareas.');
        }
        $validated = $request->validated();
        $task = Task::create([
            ...Arr::only($validated, [
                'title',
                'description',
                'status',
                'priority',
                'due_date',
                'practice_type_id',
            ]),
            'created_by' => Auth::id(),
            'kanban_position' => $this->nextKanbanPosition(),
        ]);

        $internIds = $validated['intern_ids'] ?? [];
        $assignmentType = $validated['assignment_type'] ?? 'user';

        if ($assignmentType === 'module' && ! empty($validated['module_id'])) {
            $module = strtolower((string) $validated['module_id']);
            $internIds = Intern::whereRaw('lower(academic_degree) = ?', [$module])
                ->pluck('id')
                ->all();
        }

        if ($assignmentType === 'center' && ! empty($validated['education_center_id'])) {
            $internIds = ! empty($internIds)
                ? $internIds
                : Intern::where('education_center_id', $validated['education_center_id'])
                    ->pluck('id')
                    ->all();
        }

        if (! empty($internIds)) {
            $task->interns()->sync($internIds);
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
        if (! Auth::user()?->isTutor()) {
            return back()->with('error', 'Solo los tutores pueden crear tareas.');
        }

        return Inertia::render('tasks/Create', [
            'practice_types' => PracticeType::where('is_active', true)->get(['id', 'name']),
            'interns' => Intern::with('user')->get(),
            'centers' => EducationCenter::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(Task $task)
    {
        if (Auth::user()?->isIntern()) {
            return back()->with('error', 'No tienes permiso para editar tareas.');
        }

        $task->load(['interns']);

        return Inertia::render('tasks/Edit', [
            'task' => $task,
            'practice_types' => PracticeType::where('is_active', true)->get(['id', 'name']),
            'interns' => Intern::with('user')->get(),
            'centers' => EducationCenter::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        if (Auth::user()?->isIntern()) {
            return back()->with('error', 'No tienes permiso para editar tareas.');
        }

        $fromStatus = $task->status;
        $validated = $request->validated();
        $task->update(Arr::only($validated, [
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'practice_type_id',
            'reject_reason',
        ]));

        if ($request->has('intern_ids')) {
            $task->interns()->sync($validated['intern_ids'] ?? []);
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
        if (Auth::user()?->isIntern()) {
            return back()->with('error', 'No tienes permiso para editar tareas.');
        }

        $request->validate([
            'status' => 'required|in:pending,in_progress,in_review,completed,rejected',
            'reject_reason' => 'nullable|string|max:2000',
        ]);

        if ($request->input('status') === 'rejected') {
            $request->validate([
                'reject_reason' => 'required|string|max:2000',
            ]);
        }

        $fromStatus = $task->status;
        $task->update([
            'status' => $request->status,
            'reject_reason' => $request->input('status') === 'rejected'
                ? $request->input('reject_reason')
                : null,
        ]);

        TaskStatusLog::create([
            'task_id' => $task->id,
            'from_status' => $fromStatus,
            'to_status' => $task->status,
            'reason' => $request->input('status') === 'rejected'
                ? $request->input('reject_reason')
                : null,
            'changed_by' => Auth::id(),
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Estado actualizado.');
    }

    public function show(Task $task)
    {
        $user = Auth::user();
        $isIntern = $user?->isIntern() ?? false;
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
                'reason' => null,
                'changed_by' => $user->id,
                'changed_at' => now(),
            ]);
        }

        $task->load([
            'practiceType',
            'creator',
            'interns.user',
            'comments.user',
            'comments.replies.user',
            'statusLogs.user',
        ]);

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
            'comments' => $task->comments
                ->sortBy('created_at')
                ->values()
                ->map(fn (TaskComment $comment) => $this->serializeComment($comment)),
            'status_logs' => $task->statusLogs
                ->sortByDesc('changed_at')
                ->values()
                ->map(fn (TaskStatusLog $log) => [
                    'id' => $log->id,
                    'from_status' => $log->from_status,
                    'to_status' => $log->to_status,
                    'reason' => $log->reason,
                    'changed_at' => $log->changed_at,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                    ] : null,
                ]),
        ]);
    }

    public function complete(Task $task)
    {
        $user = Auth::user();
        $isIntern = $user?->isIntern() ?? false;
        $isTutor = $user?->isTutor() ?? false;

        if (! $isIntern && ! $isTutor) {
            return back()->with('error', 'Solo un becario o tutor puede completar una tarea.');
        }

        if ($task->status === 'completed') {
            return back()->with('success', 'La tarea ya está completada.');
        }

        if ($isIntern) {
            $isAssigned = $task->interns()->where('user_id', $user->id)->exists();
            if (! $isAssigned) {
                return back()->with('error', 'No tienes esta tarea asignada.');
            }

            if ($task->status === 'in_review') {
                return back()->with('success', 'La tarea ya está entregada y en revisión.');
            }

            if (! in_array($task->status, ['pending', 'in_progress'], true)) {
                return back()->with('error', 'Solo puedes entregar tareas pendientes o en progreso.');
            }

            $fromStatus = $task->status;
            $task->update(['status' => 'in_review']);

            TaskStatusLog::create([
                'task_id' => $task->id,
                'from_status' => $fromStatus,
                'to_status' => 'in_review',
                'reason' => null,
                'changed_by' => $user->id,
                'changed_at' => now(),
            ]);

            return back()->with('success', 'Tarea entregada y enviada a revisión.');
        }

        if ($task->status !== 'in_review') {
            return back()->with('error', 'Solo puedes completar tareas que ya estén en revisión.');
        }

        $fromStatus = $task->status;
        $task->update(['status' => 'completed']);

        TaskStatusLog::create([
            'task_id' => $task->id,
            'from_status' => $fromStatus,
            'to_status' => 'completed',
            'reason' => null,
            'changed_by' => $user->id,
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Tarea marcada como completada.');
    }

    public function storeComment(Request $request, Task $task)
    {
        $request->validate([
            'comment' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:task_comments,id',
        ]);

        if ($request->filled('parent_id')) {
            $parent = TaskComment::query()
                ->where('task_id', $task->id)
                ->findOrFail($request->integer('parent_id'));

            if ($parent->parent_id !== null) {
                return back()->with('error', 'Solo se puede responder a comentarios principales.');
            }
        }

        TaskComment::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'parent_id' => $request->input('parent_id'),
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Comentario añadido.');
    }

    public function updateComment(Request $request, Task $task, TaskComment $comment)
    {
        abort_unless($comment->task_id === $task->id, 404);

        if ((int) $comment->user_id !== (int) Auth::id()) {
            return back()->with('error', 'Solo puedes editar tus propios comentarios.');
        }

        $request->validate([
            'comment' => 'required|string|max:2000',
        ]);

        $comment->update([
            'comment' => $request->input('comment'),
            'edited_at' => now(),
        ]);

        return back()->with('success', 'Comentario actualizado.');
    }

    public function destroyComment(Task $task, TaskComment $comment)
    {
        abort_unless($comment->task_id === $task->id, 404);

        $user = Auth::user();
        $canDelete = (int) $comment->user_id === (int) $user?->id || $user?->isStaff();

        if (! $canDelete) {
            return back()->with('error', 'No puedes eliminar este comentario.');
        }

        $comment->replies()->delete();
        $comment->delete();

        return back()->with('success', 'Comentario eliminado.');
    }

    public function updateBoardOrder(Request $request)
    {
        if (Auth::user()?->isIntern()) {
            return back()->with('error', 'No tienes permiso para reordenar tareas.');
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:tasks,id',
            'items.*.status' => 'required|in:pending,in_progress,in_review,completed,rejected',
            'items.*.position' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                Task::whereKey($item['id'])->update([
                    'kanban_position' => $item['position'],
                ]);
            }
        });

        return back()->with('success', 'Orden del tablero actualizado.');
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

    protected function serializeComment(TaskComment $comment): array
    {
        return [
            'id' => $comment->id,
            'comment' => $comment->comment,
            'edited_at' => $comment->edited_at,
            'created_at' => $comment->created_at,
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ] : null,
            'replies' => $comment->replies
                ->sortBy('created_at')
                ->values()
                ->map(fn (TaskComment $reply) => [
                    'id' => $reply->id,
                    'comment' => $reply->comment,
                    'edited_at' => $reply->edited_at,
                    'created_at' => $reply->created_at,
                    'user' => $reply->user ? [
                        'id' => $reply->user->id,
                        'name' => $reply->user->name,
                    ] : null,
                ]),
        ];
    }

    protected function nextKanbanPosition(): int
    {
        return (int) Task::max('kanban_position') + 1;
    }
}
