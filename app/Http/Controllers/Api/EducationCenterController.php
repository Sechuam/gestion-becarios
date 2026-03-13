<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEducationCenterRequest;
use App\Models\EducationCenter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EducationCenterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EducationCenter::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', '%'.$request->search.'%');
        }
        $centers = $query->paginate(10)->withQueryString();

        return Inertia::render('schools/index', [
            'schools' => $centers,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('schools/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEducationCenterRequest $request)
    {
        $school = EducationCenter::create($request->validated());

        if ($request->hasFile('agreement_file')) {
            $school->addMediaFromRequest('agreement_file')->toMediaCollection('agreement_pdf');
        }

        return to_route('schools.index')->with('success', 'Centro Educativo creado.');
    }

    public function edit(EducationCenter $school)
    {
        return Inertia::render('schools/Edit', [
            'educationCenter' => $school,
            'agreement_url' => $school->getFirstMediaUrl('agreement_pdf'),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(EducationCenter $school)
    {
        return response()->json($school);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreEducationCenterRequest $request, EducationCenter $school)
    {
        $school->update($request->validated());

        if ($request->hasFile('agreement_file')) {
            $school->addMediaFromRequest('agreement_file')->toMediaCollection('agreement_pdf');
        }

        return to_route('schools.index')->with('success', 'Centro Educativo actualizado');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EducationCenter $school)
    {
        $school->delete();

        return to_route('schools.index')->with('success', 'Centro Educativo eliminado');
    }
}
