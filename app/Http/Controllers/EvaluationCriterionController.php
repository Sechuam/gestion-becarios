<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationCriterionRequest;
use App\Http\Requests\UpdateEvaluationCriterionRequest;
use App\Models\EvaluationCriterion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationCriterionController extends Controller
{
    protected function ensureAdmin(): void
    {
        if (! Auth::user()?->isAdmin()) {
            abort(403);
        }
    }

    public function index(Request $request)
    {
        $this->ensureAdmin();

        $query = EvaluationCriterion::query();

        if ($request->filled('search')) {
            $query->where(function ($builder) use ($request) {
                $builder
                    ->where('name', 'ilike', '%'.$request->search.'%')
                    ->orWhere('category', 'ilike', '%'.$request->search.'%');
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $sort = $request->get('sort');
        $direction = strtolower($request->get('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortable = [
            'name' => 'name',
            'category' => 'category',
            'weight' => 'weight',
            'max_score' => 'max_score',
            'sort_order' => 'sort_order',
            'is_active' => 'is_active',
        ];

        if ($sort && isset($sortable[$sort])) {
            $criteria = $query->orderBy($sortable[$sort], $direction)->paginate(10)->withQueryString();
        } else {
            $criteria = $query
                ->orderBy('sort_order')
                ->orderBy('category')
                ->orderBy('name')
                ->paginate(10)
                ->withQueryString();
        }

        return Inertia::render('evaluations/criteria/index', [
            'criteria' => $criteria,
            'filters' => $request->only(['search', 'status', 'category', 'sort', 'direction']),
            'categories' => EvaluationCriterion::query()
                ->select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category')
                ->values(),
        ]);
    }

    public function create()
    {
        $this->ensureAdmin();

        return Inertia::render('evaluations/criteria/Create');
    }

    public function store(StoreEvaluationCriterionRequest $request)
    {
        $this->ensureAdmin();

        EvaluationCriterion::create($request->validated());

        return to_route('evaluation-criteria.index')->with('success', 'Criterio de evaluacion creado.');
    }

    public function edit(EvaluationCriterion $criterion)
    {
        $this->ensureAdmin();

        return Inertia::render('evaluations/criteria/Edit', [
            'criterion' => $criterion,
        ]);
    }

    public function update(UpdateEvaluationCriterionRequest $request, EvaluationCriterion $criterion)
    {
        $this->ensureAdmin();

        $criterion->update($request->validated());

        return to_route('evaluation-criteria.index')->with('success', 'Criterio de evaluacion actualizado.');
    }

    public function destroy(EvaluationCriterion $criterion)
    {
        $this->ensureAdmin();

        $criterion->delete();

        return back()->with('success', 'Criterio de evaluacion eliminado.');
    }

    public function toggle(EvaluationCriterion $criterion)
    {
        $this->ensureAdmin();

        $criterion->update([
            'is_active' => ! $criterion->is_active,
        ]);

        return back()->with('success', 'Estado actualizado.');
    }
}
