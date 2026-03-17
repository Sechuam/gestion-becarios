<?php

namespace App\Http\Controllers;

use App\Exports\InternsExport;
use App\Http\Requests\StoreInternRequest;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class InternController extends Controller
{
    public function index(Request $request)
    {
        $query = Intern::query()
            ->join('users', 'users.id', '=', 'interns.user_id')
            ->with(['user', 'educationCenter'])
            ->select('interns.*');

        if ($request->filled('search')) {
            $query->where(DB::raw('lower(users.name)'), 'like', '%'.strtolower($request->search).'%');
        }
        if ($request->filled('center')) {
            $query->where('education_center_id', $request->center);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $order = $request->get('order', 'az');
        if ($order === 'za') {
            $query->orderBy('users.name', 'desc');
        } else {
            $query->orderBy('users.name', 'asc');
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
            'filters' => $request->only(['search', 'center', 'status', 'order', 'start_from', 'start_to']),
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
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInternRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make('password123'),
                ]);

                $user->assignRole('intern');

                $user->intern()->create($request->validated());
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
    public function show(Intern $intern)
    {
        return Inertia::render('interns/Show', [
            'intern' => $intern->load(['user', 'educationCenter'])->append(['progress', 'is_delayed']),
            'dni_url' => $intern->getFirstMediaUrl('dni'),
            'agreement_url' => $intern->getFirstMediaUrl('agreement'),
            'insurance_url' => $intern->getFirstMediaUrl('insurance'),

            'activities' => $intern->activities()
                ->with('causer')
                ->latest()
                ->get()
                ->map(fn ($activity) => [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'event' => $activity->event,
                    'causer_name' => $activity->causer->name ?? 'System',
                    'created_at' => $activity->created_at->format('d/m/Y H:i:'),
                    'properties' => $activity->properties,
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
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Intern $intern)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$intern->user_id,
            'education_center_id' => 'required|exists:education_centers,id',
            'dni' => 'required|string|regex:/^[XYZ]?\d{7,8}[A-Z]$/i|unique:interns,dni,'.$intern->id,
            'birth_date' => 'required|date',
            'total_hours' => 'required|integer',
            'status' => 'required|in:active,completed,abandoned',
            'abandon_reason' => 'nullable|string|max:255',
        ],
        [
            'dni.regex' => 'El DNI/NIE no tiene un formato válido.',
        ]);

        try {
            DB::transaction(function () use ($request, $intern) {
                $intern->user->update([
                    'name' => $request->name,
                    'email' => $request->email,
                ]);

                $intern->update($request->all());
            });

            if ($request->hasFile('dni_file')) {
                $intern->addMediaFromRequest('dni_file')->toMediaCollection('dni');
            }
            if ($request->hasFile('agreement_file')) {
                $intern->addMediaFromRequest('agreement_file')->toMediaCollection('agreement');
            }
            if ($request->hasFile('insurance_file')) {
                $intern->addMediaFromRequest('insurance_file')->toMediaCollection('insurance');
            }

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
            return Excel::download(new InternsExport($request->all()), 'becarios_'.date('Y-m-d').'.xlsx');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo exportar el listado de becarios.');
        }
    }
}
