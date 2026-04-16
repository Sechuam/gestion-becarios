<?php

namespace App\Http\Controllers;

use App\Exports\InternsExport;
use App\Http\Requests\StoreInternRequest;
use App\Http\Requests\UpdateInternRequest;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\InternalNote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\TimeTrackingService;


class InternController extends Controller
{
    public function myProfile()
    {
        $user = Auth::user();
        $intern = $user->intern;

        return Inertia::render('interns/Profile', [
            'intern' => $intern,
            'education_center' => $intern?->educationCenter,
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:5120'], // Máximo 5MB
        ]);

        $user = Auth::user();
        $user->clearMediaCollection('avatar');
        $user->addMediaFromRequest('avatar')->toMediaCollection('avatar');

        return back()->with('success', 'Foto de perfil actualizada correctamente.');
    }
    public function index(Request $request)
    {
        $query = Intern::query()
            ->join('users', 'users.id', '=', 'interns.user_id')
            ->with(['user', 'educationCenter'])
            ->select('interns.*');

        $trashed = $request->input('trashed');
        if ($trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($trashed === 'with') {
            $query->withTrashed();
        }

        if ($request->filled('search')) {
            $query->where(DB::raw('lower(users.name)'), 'like', '%' . strtolower($request->search) . '%');
        }
        if ($request->filled('center')) {
            $query->where('education_center_id', $request->center);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortable = [
            'name' => 'users.name',
            'dni' => 'interns.dni',
            'education_center' => 'education_centers.name',
            'academic_degree' => 'interns.academic_degree',
            'status' => 'interns.status',
        ];

        if ($sort && isset($sortable[$sort])) {
            if ($sort === 'education_center') {
                $query->leftJoin('education_centers', 'education_centers.id', '=', 'interns.education_center_id');
            }
            $query->orderBy($sortable[$sort], $direction);
        } else {
            $order = $request->input('order', 'az');
            if ($order === 'za') {
                $query->orderBy('users.name', 'desc');
            } elseif ($order === 'recent') {
                $query->orderBy('interns.updated_at', 'desc');
            } elseif ($order === 'oldest') {
                $query->orderBy('interns.updated_at', 'asc');
            } else {
                $query->orderBy('users.name', 'asc');
            }
        }
        if ($request->filled('start_from')) {
            $query->whereDate('start_date', '>=', $request->start_from);
        }
        if ($request->filled('start_to')) {
            $query->whereDate('start_date', '<=', $request->start_to);
        }

        $interns = $query->paginate(10)->through(function ($intern) {
            return array_merge($intern->toArray(), [
                'progress' => $intern->progress,
                'is_delayed' => $intern->is_delayed,
            ]);
        })->withQueryString();

        return Inertia::render('interns/index', [
            'interns' => $interns,
            'filters' => $request->only(['search', 'center', 'status', 'start_from', 'start_to', 'trashed', 'sort', 'direction']),
            'education_centers' => EducationCenter::all(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('interns/Create', [
            'education_centers' => EducationCenter::all(['id', 'name']),
            'tutors' => User::role('tutor')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInternRequest $request)
    {
        try {
            $intern = null;

            DB::transaction(function () use ($request, &$intern) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make('password123'),
                ]);

                $user->assignRole('intern');

                $intern = $user->intern()->create($request->validated());
                $this->syncInternMedia($intern, $request);
            });

            return redirect()->route('becarios.index')->with('success', 'Becario creado correctamente');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo crear el becario.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Intern $intern, TimeTrackingService $service)
    {
        auth()->user()->unreadNotifications
            ->where('data.intern_id', $intern->id)
            ->markAsRead();

        return Inertia::render('interns/Show', [
            'intern' => $intern->load(['user.schedules', 'user.absences', 'educationCenter', 'companyTutor', 'notesUpdatedBy', 'internalNotes.user'])->append(['progress', 'is_delayed']),
            'time_stats' => $service->getStats($intern),
            'dni_url' => $intern->getFirstMediaUrl('dni'),
            'agreement_url' => $intern->getFirstMediaUrl('agreement'),
            'insurance_url' => $intern->getFirstMediaUrl('insurance'),
            'internal_notes' => $intern->internalNotes->map(fn(InternalNote $note) => [
                'id' => $note->id,
                'content' => $note->content,
                'created_at' => $note->created_at,
                'edited_at' => $note->edited_at,
                'user' => $note->user ? [
                    'id' => $note->user->id,
                    'name' => $note->user->name,
                ] : null,
            ]),

            'activities' => $intern->activities()
                ->with('causer')
                ->latest()
                ->get()
                ->map(fn($activity) => [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'event' => $activity->event,
                    'causer_name' => $activity->causer->name ?? 'System',
                    'created_at' => $activity->created_at->format('d/m/Y H:i:'),
                    'properties' => $activity->properties,
                ]),

            'absences' => $intern->user->absences->map(fn($absence) => [
                'id' => $absence->id,
                'date' => $absence->date,
                'reason' => $absence->reason,
                'status' => $absence->status,
                'justification_url' => $absence->getFirstMediaUrl('justifications'),
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Intern $intern)
    {
        return Inertia::render('interns/Edit', [
            'intern' => $intern->load('user'),
            'education_centers' => EducationCenter::all(['id', 'name']),
            'tutors' => User::role('tutor')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInternRequest $request, Intern $intern)
    {
        try {
            DB::transaction(function () use ($request, $intern) {
                $validated = $request->validated();

                $intern->user->update([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                ]);

                $intern->update($validated);
            });

            $this->syncInternMedia($intern, $request);

            return redirect()->route('becarios.index')->with('success', 'Becario actualizado correctamente');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo actualizar el becario.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Intern $intern)
    {
        try {
            $intern->delete();

            return redirect()->route('becarios.index')->with('success', 'Becario eliminado (archivado)');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo eliminar el becario.');
        }
    }

    public function export(Request $request)
    {
        try {
            return Excel::download(new InternsExport($request->all()), 'becarios_' . date('Y-m-d') . '.xlsx');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo exportar el listado de becarios.');
        }
    }

    public function restore($id)
    {
        $intern = Intern::onlyTrashed()->findOrFail($id);
        $intern->restore();

        return back()->with('success', 'Becario restaurado correctamente');
    }

    public function forceDelete($id)
    {
        $intern = Intern::onlyTrashed()->findOrFail($id);
        $intern->forceDelete();

        return back()->with('success', 'Becario eliminado permanentemente');
    }

    public function updateNotes(Request $request, Intern $intern)
    {
        $request->validate([
            'internal_notes' => 'nullable|string|max:1000',
        ]);

        $intern->update([
            'internal_notes' => $request->input('internal_notes'),
            'internal_notes_updated_by' => Auth::id(),
            'internal_notes_updated_at' => now(),
        ]);

        return back()->with('success', 'Notas actualizadas correctamente');
    }

    public function storeInternalNote(Request $request, Intern $intern)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $intern->internalNotes()->create([
            'content' => $request->input('content'),
            'user_id' => Auth::id(),
        ]);

        $this->syncInternalNoteSummary($intern);

        return back()->with('success', 'Nota añadida correctamente');
    }

    public function updateInternalNote(Request $request, Intern $intern, InternalNote $note)
    {
        abort_unless(
            $note->notable_type === Intern::class && (int) $note->notable_id === (int) $intern->id,
            404,
        );

        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $note->update([
            'content' => $request->input('content'),
            'edited_at' => now(),
        ]);

        $this->syncInternalNoteSummary($intern);

        return back()->with('success', 'Nota actualizada correctamente');
    }

    public function destroyInternalNote(Intern $intern, InternalNote $note)
    {
        abort_unless(
            $note->notable_type === Intern::class && (int) $note->notable_id === (int) $intern->id,
            404,
        );

        $note->delete();

        $this->syncInternalNoteSummary($intern);

        return back()->with('success', 'Nota eliminada correctamente');
    }

    protected function syncInternMedia(Intern $intern, Request $request): void
    {
        if ($request->hasFile('dni_file')) {
            $intern->addMediaFromRequest('dni_file')->toMediaCollection('dni');
        }

        if ($request->hasFile('agreement_file')) {
            $intern->addMediaFromRequest('agreement_file')->toMediaCollection('agreement');
        }

        if ($request->hasFile('insurance_file')) {
            $intern->addMediaFromRequest('insurance_file')->toMediaCollection('insurance');
        }
    }

    protected function syncInternalNoteSummary(Intern $intern): void
    {
        /** @var InternalNote|null $latestNote */
        $latestNote = $intern->internalNotes()->with('user')->latest('created_at')->first();

        $intern->update([
            'internal_notes' => $latestNote?->content,
            'internal_notes_updated_by' => $latestNote?->user_id,
            'internal_notes_updated_at' => $latestNote?->created_at,
        ]);
    }
}
