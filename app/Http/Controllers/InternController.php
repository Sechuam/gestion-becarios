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

        $interns = $query->paginate(10)->withQueryString();

        return Inertia::render('interns/index', [
            'interns' => $interns,
            'filters' => $request->only(['search', 'center', 'status', 'order']),
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
    }

    /**
     * Display the specified resource.
     */
    public function show(Intern $intern)
    {
        return Inertia::render('interns/Show', [
            'intern' => $intern->load(['user', 'educationCenter']),
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
            'dni' => 'required|string|unique:interns,dni,'.$intern->id,
            'birth_date' => 'required|date',
            'total_hours' => 'required|integer',
        ]);

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
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Intern $intern)
    {
        $intern->delete();

        return redirect()->route('becarios.index')->with('success', 'Becario eliminado (archivado)');
    }

    public function export(Request $request)
    {
        return Excel::download(new InternsExport($request->all()), 'becarios_'.date('Y-m-d').'.xlsx');
    }
}
