<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Models\Evaluation;
use App\Models\EvaluationCriterion;
use App\Models\EvaluationScore;
use App\Models\Intern;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;


class EvaluationController extends Controller
{
    protected function getEvaluationTypeLabel(string $type): string
    {
        return match ($type) {
            'weekly' => 'semanal',
            'monthly' => 'mensual',
            'final' => 'final',
            'self' => 'de autoevaluación',
            default => 'del mismo tipo',
        };
    }

    protected function canAccessEvaluations(): void
    {
        if (!Auth::user()?->can('view evaluations')) {
            abort(403);
        }
    }

    protected function canManageEvaluations(): void
    {
        if (!Auth::user()?->can('manage evaluations')) {
            abort(403);
        }
    }

    protected function canEvaluateIntern(Intern $intern): void
    {
        $user = Auth::user();

        if ($user?->isAdmin()) {
            return;
        }

        if ($user?->isIntern() && (int) $intern->user_id === (int) $user->id) {
            return;
        }

        if ($user?->isTutor() && (int) $intern->company_tutor_user_id === (int) $user->id) {
            return;
        }

        abort(403);
    }

    protected function canViewEvaluation(Evaluation $evaluation): void
    {
        $user = Auth::user();

        if ($user?->isAdmin()) {
            return;
        }

        if ($user?->isTutor() && (int) $evaluation->intern?->company_tutor_user_id === (int) $user->id) {
            return;
        }

        if ($user?->isIntern() && (int) $evaluation->intern?->user_id === (int) $user->id) {
            return;
        }

        abort(403);
    }

    protected function ensureNoDuplicateEvaluation(array $validated): void
    {
        $alreadyExists = Evaluation::query()
            ->where('intern_id', $validated['intern_id'])
            ->where('evaluation_type', $validated['evaluation_type'])
            ->whereDate('period_start', $validated['period_start'])
            ->whereDate('period_end', $validated['period_end'])
            ->exists();

        if (!$alreadyExists) {
            return;
        }

        $typeLabel = $this->getEvaluationTypeLabel((string) $validated['evaluation_type']);

        throw ValidationException::withMessages([
            'evaluation_type' => "Ya existe una evaluación {$typeLabel} para este becario en ese período.",
        ]);
    }

    public function index(Request $request)
    {
        $this->canAccessEvaluations();
        $query = Evaluation::query()
            ->with(['intern.user', 'evaluator'])
            ->latest('evaluated_at');

        $user = Auth::user();

        if ($user?->isIntern()) {
            $internId = $user->intern?->id;

            if (!$internId) {
                abort(403);
            }

            $query->where('intern_id', $internId);
        } elseif ($user?->isTutor()) {
            $query->whereHas('intern', function ($builder) use ($user) {
                $builder->where('company_tutor_user_id', $user->id);
            });
        }

        if (!$user?->isIntern() && $request->filled('search')) {
            $search = trim((string) $request->search);

            $query->whereHas('intern.user', function ($builder) use ($search) {
                $builder->where('name', 'ilike', '%' . $search . '%');
            });
        }

        if (!$user?->isIntern() && $request->filled('module')) {
            $module = trim((string) $request->module);

            $query->whereHas('intern', function ($builder) use ($module) {
                $builder->where('academic_degree', $module);
            });
        }

        if ($request->filled('type')) {
            $query->where('evaluation_type', $request->type);
        }

        $evaluations = $query->paginate(10)->withQueryString();

        $modules = collect();

        if (!$user?->isIntern()) {
            $modulesQuery = Intern::query();

            if ($user?->isTutor()) {
                $modulesQuery->where('company_tutor_user_id', $user->id);
            }

            $modules = $modulesQuery
                ->whereNotNull('academic_degree')
                ->where('academic_degree', '!=', '')
                ->select('academic_degree')
                ->distinct()
                ->orderBy('academic_degree')
                ->pluck('academic_degree')
                ->values();
        }

        return Inertia::render('evaluations/index', [
            'evaluations' => $evaluations,
            'filters' => $request->only(['search', 'module', 'type']),
            'modules' => $modules,
            'types' => Evaluation::TYPES,
            'userMode' => $user?->isIntern() ? 'intern' : ($user?->isTutor() ? 'tutor' : 'admin'),
        ]);
    }

    public function create()
    {
        $this->canAccessEvaluations();

        $user = Auth::user();
        $internsQuery = Intern::query()->with('user:id,name');
        if ($user?->isIntern()) {
            $internsQuery->where('user_id', $user->id);
        } elseif ($user?->isTutor()) {
            $internsQuery->where('company_tutor_user_id', $user->id);
        }

        $interns = $internsQuery
            ->orderBy('start_date')
            ->get()
            ->map(fn(Intern $intern) => [
                'id' => $intern->id,
                'name' => $intern->user?->name ?? "Becario #{$intern->id}",
            ]);

        $criteria = EvaluationCriterion::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('category')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'category',
                'description',
                'rubric',
                'weight',
                'max_score',
                'sort_order',
            ]);

        return Inertia::render('evaluations/Create', [
            'interns' => $interns,
            'criteria' => $criteria,
            'types' => $user?->isIntern() ? ['self'] : Evaluation::TYPES,
            'userMode' => $user?->isIntern() ? 'intern' : ($user?->isTutor() ? 'tutor' : 'admin'),
        ]);
    }

    public function show(Evaluation $evaluation)
    {
        $this->canAccessEvaluations();

        $evaluation->load([
            'intern.user:id,name,email',
            'evaluator:id,name,email',
            'scores.criterion:id,name,category,description,rubric,weight,max_score',
        ]);

        $this->canViewEvaluation($evaluation);

        $previousWeightedScore = null;
        $history = Evaluation::query()
            ->where('intern_id', $evaluation->intern_id)
            ->with('evaluator:id,name')
            ->orderBy('evaluated_at')
            ->orderBy('id')
            ->get([
                'id',
                'intern_id',
                'evaluator_user_id',
                'evaluation_type',
                'evaluated_at',
                'period_start',
                'period_end',
                'weighted_score',
                'total_score',
                'is_self_evaluation',
            ])
            ->map(function (Evaluation $item) use (&$previousWeightedScore, $evaluation) {
                $currentWeightedScore = $item->weighted_score !== null ? (float) $item->weighted_score : null;
                $delta = $currentWeightedScore !== null && $previousWeightedScore !== null
                    ? round($currentWeightedScore - $previousWeightedScore, 2)
                    : null;

                $historyItem = [
                    'id' => $item->id,
                    'evaluation_type' => $item->evaluation_type,
                    'evaluated_at' => $item->evaluated_at,
                    'period_start' => $item->period_start,
                    'period_end' => $item->period_end,
                    'weighted_score' => $item->weighted_score,
                    'total_score' => $item->total_score,
                    'is_self_evaluation' => $item->is_self_evaluation,
                    'delta_from_previous' => $delta,
                    'is_current' => (int) $item->id === (int) $evaluation->id,
                    'evaluator' => $item->evaluator ? [
                        'id' => $item->evaluator->id,
                        'name' => $item->evaluator->name,
                    ] : null,
                ];

                if ($currentWeightedScore !== null) {
                    $previousWeightedScore = $currentWeightedScore;
                }

                return $historyItem;
            })
            ->reverse()
            ->values();

        return Inertia::render('evaluations/Show', [
            'evaluation' => $evaluation,
            'history' => $history,
            'userMode' => Auth::user()?->isIntern() ? 'intern' : (Auth::user()?->isTutor() ? 'tutor' : 'admin'),
        ]);
    }

    public function store(StoreEvaluationRequest $request)
    {
        $this->canAccessEvaluations();

        $validated = $request->validated();
        $intern = Intern::findOrFail($validated['intern_id']);
        $user = Auth::user();

        $this->canEvaluateIntern($intern);

        if ($user?->isIntern()) {
            if ($validated['evaluation_type'] !== 'self') {
                throw ValidationException::withMessages([
                    'evaluation_type' => 'Como becario solo puedes registrar autoevaluaciones.',
                ]);
            }

            if ((int) $intern->user_id !== (int) $user->id) {
                throw ValidationException::withMessages([
                    'intern_id' => 'Solo puedes autoevaluarte a ti mismo.',
                ]);
            }
        }

        $this->ensureNoDuplicateEvaluation($validated);

        $criteria = EvaluationCriterion::query()
            ->whereIn('id', collect($validated['scores'])->pluck('criterion_id'))
            ->get()
            ->keyBy('id');

        $totalScore = 0;
        $weightedScore = 0;

        DB::transaction(function () use ($validated, $criteria, &$totalScore, &$weightedScore) {
            $evaluation = Evaluation::create([
                'intern_id' => $validated['intern_id'],
                'evaluator_user_id' => Auth::id(),
                'evaluation_type' => $validated['evaluation_type'],
                'period_start' => $validated['period_start'] ?? null,
                'period_end' => $validated['period_end'] ?? null,
                'evaluated_at' => $validated['evaluated_at'],
                'is_self_evaluation' => $validated['is_self_evaluation'] ?? ($validated['evaluation_type'] === 'self'),
                'general_comments' => $validated['general_comments'] ?? null,
                'total_score' => 0,
                'weighted_score' => 0,
            ]);

            foreach ($validated['scores'] as $item) {
                $criterion = $criteria->get($item['criterion_id']);

                if (!$criterion) {
                    continue;
                }

                $score = (float) $item['score'];

                if ($score > (float) $criterion->max_score) {
                    throw ValidationException::withMessages([
                        'scores' => 'Una o varias puntuaciones superan la nota maxima permitida.',
                    ]);
                }

                $itemWeightedScore = round(($score / $criterion->max_score) * $criterion->weight, 2);

                EvaluationScore::create([
                    'evaluation_id' => $evaluation->id,
                    'evaluation_criterion_id' => $criterion->id,
                    'score' => $score,
                    'weighted_score' => $itemWeightedScore,
                    'comment' => $item['comment'] ?? null,
                ]);

                $totalScore += $score;
                $weightedScore += $itemWeightedScore;
            }

            $evaluation->update([
                'total_score' => round($totalScore, 2),
                'weighted_score' => round($weightedScore, 2),
            ]);
        });

        return to_route('evaluations.index')->with('success', 'Evaluación creada correctamente.');
    }
}
