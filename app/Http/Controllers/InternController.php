<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\EducationCenter;
use App\Http\Requests\StoreInternRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class InternController extends Controller
{
    public function index(Request $request)

    {
        $interns = Intern::with(['user', 'educationCenter'])
        ->when($request->search, function ($query, $search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        })
        ->latest()
        ->paginate(10)
        ->withQueryString();

        return Inertia::render('interns/index', [
            'interns' => $interns,
            'filters' => $request->only(['search']),
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
            'email' => 'required|email|unique:users,email,' . $intern->user_id,
            'education_center_id' => 'required|exists:education_centers,id',
            'dni' => 'required|string|unique:interns,dni,' . $intern->id,
            'birth_date' => 'required|date',
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
}
