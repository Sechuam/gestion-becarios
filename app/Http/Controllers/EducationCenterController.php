<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducationCenterRequest;
use App\Models\EducationCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InternsExport;

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
        try {
            $school = EducationCenter::create($request->validated());

            if ($request->hasFile('agreement_file')) {
                $school->addMediaFromRequest('agreement_file')->toMediaCollection('agreement_pdf');
            }

            return to_route('schools.index')->with('success', 'Centro Educativo creado.');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo crear el centro educativo.');
        }
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
    public function show(Request $request, EducationCenter $school)
    {
        $internsQuery = $school->interns()->with('user');

        if ($request->filled('search')) {
            $internsQuery->whereHas('user', function ($q) {
                $q->where(DB::raw('lower(name)'), 'like', '%'.strtolower($request->search).'%');
            });
        }
        if ($request->filled('status')) {
            $internsQuery->where('status', $request->status);
        }

        $interns = $internsQuery
            ->orderBy('start_date', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('schools/Show', [
            'educationCenter' => $school,
            'agreement_url' => $school->getFirstMediaUrl('agreement_pdf'),
            'interns' => $interns,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreEducationCenterRequest $request, EducationCenter $school)
    {
        try {
            $school->update($request->validated());

            if ($request->hasFile('agreement_file')) {
                $school->addMediaFromRequest('agreement_file')->toMediaCollection('agreement_pdf');
            }

            return to_route('schools.index')->with('success', 'Centro Educativo actualizado');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo actualizar el centro educativo.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EducationCenter $school)
    {
        try {
            $school->delete();

            return to_route('schools.index')->with('success', 'Centro Educativo eliminado');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo eliminar el centro educativo.');
        }
    }

    public function export(Request $request, EducationCenter $school)
    {
        try {
            $filters = array_merge(
                $request->only(['search', 'status']),
                ['center' => $school->id],
            );

            return Excel::download(
                new InternsExport($filters),
                'becarios_'.$school->id.'_'.date('Y-m-d').'.xlsx'
            );
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo exportar el histórico de becarios.');
        }
    }
}
