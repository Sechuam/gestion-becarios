<?php

namespace App\Http\Controllers;

use App\Exports\EducationCentersExport;
use App\Exports\InternsExport;
use App\Http\Requests\StoreEducationCenterRequest;
use App\Models\EducationCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class EducationCenterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EducationCenter::query();
        $trashed = $request->input('trashed');

        if ($trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($trashed === 'with') {
            $query->withTrashed();
        }

        if ($request->filled('search')) {
            $query->where('name', 'ilike', '%'.$request->search.'%');
        }

        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortable = [
            'name' => 'name',
            'code' => 'code',
            'city' => 'city',
            'contact_person' => 'contact_person',
            'contact_email' => 'contact_email',
            'email' => 'email',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ];

        if ($sort && isset($sortable[$sort])) {
            $query->orderBy($sortable[$sort], $direction);
        } else {
            $order = $request->input('order', 'az');
            if ($order === 'za') {
                $query->orderBy('name', 'desc');
            } elseif ($order === 'recent') {
                $query->orderBy('updated_at', 'desc');
            } elseif ($order === 'oldest') {
                $query->orderBy('updated_at', 'asc');
            } else {
                $query->orderBy('name', 'asc');
            }
        }

        $centers = $query->paginate(10)->withQueryString();

        return Inertia::render('schools/index', [
            'schools' => $centers,
            'filters' => $request->only('search', 'trashed', 'sort', 'direction'),
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
    public function show(Request $request, $school)
    {
        $user = Auth::user();
        $isIntern = $user
            ? $user->getRoleNames()
                ->map(fn ($role) => strtolower($role))
                ->intersect(['intern', 'becario'])
                ->isNotEmpty()
            : false;
        $currentIntern = $isIntern
        ? $user->intern()->with('companyTutor')->first()
        : null;
        $school = EducationCenter::withTrashed()->findOrFail($school);
        $internsQuery = $school->interns()
            ->join('users', 'users.id', '=', 'interns.user_id')
            ->with('user')
            ->select('interns.*');

        if ($request->filled('search')) {
            $internsQuery->where(DB::raw('lower(users.name)'), 'like', '%'.strtolower($request->search).'%');
        }
        if ($request->filled('status')) {
            $internsQuery->where('status', $request->status);
        }

        $order = $request->input('order', 'az');
        if ($order === 'za') {
            $internsQuery->orderBy('users.name', 'desc');
        } elseif ($order === 'recent') {
            $internsQuery->orderBy('interns.updated_at', 'desc');
        } elseif ($order === 'oldest') {
            $internsQuery->orderBy('interns.updated_at', 'asc');
        } else {
            $internsQuery->orderBy('users.name', 'asc');
        }

        $interns = $internsQuery->paginate(10)->withQueryString();

        return Inertia::render('schools/Show', [
            'educationCenter' => $school,
            'agreement_url' => $school->getFirstMediaUrl('agreement_pdf'),
            'interns' => $interns,
            'filters' => $request->only(['search', 'status', 'order']),
            'is_intern' => $isIntern,
            'current_intern' => $currentIntern,
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
            if ($school->interns()->where('status', 'active')->exists()) {
                return back()->with('error', 'No se puede eliminar un centro educativo con becarios activos.');
            }

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
                $request->only(['search', 'status', 'order', 'columns']),
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

    public function exportIndex(Request $request)
    {
        try {
            return Excel::download(
                new EducationCentersExport($request->all()),
                'centros_'.date('Y-m-d').'.xlsx'
            );
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo exportar el listado de centros.');
        }
    }

    public function restore($id)
    {
        $school = EducationCenter::onlyTrashed()->findOrFail($id);
        $school->restore();

        return back()->with('success', 'Centro Educativo restaurado correctamente');
    }

    public function forceDelete($id)
    {
        $school = EducationCenter::onlyTrashed()->findOrFail($id);
        $school->forceDelete();

        return back()->with('success', 'Centro Educativo eliminado definitivamente');
    }

    public function updateNotes(Request $request, EducationCenter $school)
    {
        $request->validate([
            'internal_notes' => 'nullable|string|max:1000',
        ]);

        $school->updateQuietly([
            'internal_notes' => $request->input('internal_notes'),
        ]);

        return back()->with('success', 'Notas actualizadas correctamente');
    }

    public function myCenter()
    {
        $user = Auth::user();

        $isIntern = $user
            ? $user->getRoleNames()
                ->map(fn ($role) => strtolower($role))
                ->intersect(['intern', 'becario'])
                ->isNotEmpty()
            : false;

        if (! $isIntern) {
            return back()->with('error', 'Solo los becarios pueden acceder a su centro');
        }

        $centerId = $user->intern?->education_center_id;

        if (! $centerId) {
            return back()->with('error', 'No tienes un centro asignado');
        }

        $school = EducationCenter::withTrashed()->findOrFail($centerId);

        return $this->show(request(), $school->id);
    }
}
