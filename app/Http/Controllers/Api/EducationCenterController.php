<?php

namespace App\Http\Controllers\Api;

use App\Models\EducationCenter;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreEducationCenterRequest;

class EducationCenterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $centers = EducationCenter::all();
        return response()->json($centers);
    }

    public function create()
    {
        return inertia('EducationCenters/Create');
    }

    public function edit(EducationCenter $education_center)

    {
        return inertia('EducationCenters/Edit', [
            'educationCenter' => $education_center
        ]);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEducationCenterRequest $request)
    {
        $center = EducationCenter::create($request->validated());
        return to_route('education-centers.index');

    }

    /**
     * Display the specified resource.
     */
    public function show(EducationCenter $education_center)
    {
        return response()->json($education_center);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreEducationCenterRequest $request, EducationCenter $education_center)
    {
        $education_center->update($request->validated());
        return to_route('education-centers.index')->with('success', 'Centro actualizado');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EducationCenter $education_center)
    {
        $education_center->delete();
        return to_route('education-centers.index')->with('success', 'Centro eliminado');
    }
}
