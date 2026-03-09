<?php

namespace App\Http\Controllers\Api;

use App\Models\EducationCenter;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreEducationCenterRequest;
use Inertia\Inertia;

class EducationCenterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $centers = EducationCenter::paginate(10);
        return Inertia::render('schools/index', [
            'schools' => $centers
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
        EducationCenter::create($request->validated());
        return to_route('schools.index')->with('success', 'Centro Educativo creado.');

    }

    public function edit(EducationCenter $school)
    {
        return Inertia::render('schools/Edit', [
            'educationCenter' => $school
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
