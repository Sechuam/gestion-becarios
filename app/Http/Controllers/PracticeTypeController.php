<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePracticeTypeRequest;
use App\Http\Requests\UpdatePracticeTypeRequest;
use App\Models\PracticeType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PracticeTypeController extends Controller
{
    protected function ensureAdmin()
    {
        if (! Auth::user()?->isAdmin()) {
            abort(403);
        }
    }

    public function index(Request $request)
    {
        $this->ensureAdmin();

        $query = PracticeType::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', '%'.$request->search.'%');
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $sort = $request->get('sort');
        $direction = strtolower($request->get('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortable = [
            'name' => 'name',
            'description' => 'description',
            'priority' => 'priority',
            'color' => 'color',
            'is_active' => 'is_active',
        ];

        if ($sort && isset($sortable[$sort])) {
            $types = $query->orderBy($sortable[$sort], $direction)->paginate(10)->withQueryString();
        } else {
            $types = $query->orderBy('priority')->orderBy('name')->paginate(10)->withQueryString();
        }

        return Inertia::render('practice-types/index', [
            'practice_types' => $types,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $this->ensureAdmin();

        return Inertia::render('practice-types/Create');
    }

    public function store(StorePracticeTypeRequest $request)
    {
        $this->ensureAdmin();

        PracticeType::create($request->validated());

        return to_route('practice-types.index')->with('success', 'Tipo de práctica creado.');
    }

    public function edit(PracticeType $practiceType)
    {
        $this->ensureAdmin();

        return Inertia::render('practice-types/Edit', [
            'practiceType' => $practiceType,
        ]);
    }

    public function update(UpdatePracticeTypeRequest $request, PracticeType $practiceType)
    {
        $this->ensureAdmin();

        $practiceType->update($request->validated());

        return to_route('practice-types.index')->with('success', 'Tipo de práctica actualizado.');
    }

    public function destroy(PracticeType $practiceType)
    {
        $this->ensureAdmin();

        $practiceType->delete();

        return back()->with('success', 'Tipo de práctica eliminado.');
    }

    public function toggle(PracticeType $practiceType)
    {
        $this->ensureAdmin();

        $practiceType->update([
            'is_active' => ! $practiceType->is_active,
        ]);

        return back()->with('success', 'Estado actualizado.');
    }
}
