<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use Illuminate\Http\Request;
use Spatie\LaravelPdf\Facades\Pdf;

class EvaluationReportController extends Controller
{
    public function download(Request $request, Evaluation $evaluation)
    {
        $user = $request->user();

        abort_unless(
            $user?->isAdmin()
                || ($user?->isTutor() && (int) $evaluation->intern?->company_tutor_user_id === (int) $user->id)
                || ($user?->isIntern() && (int) $evaluation->intern?->user_id === (int) $user->id),
            403
        );

        $evaluation->load([
            'intern.user',
            'evaluator',
            'scores.criterion',
        ]);

        // Get evaluation history for graph
        $previousWeightedScore = null;
        $history = Evaluation::query()
            ->where('intern_id', $evaluation->intern_id)
            ->orderBy('evaluated_at', 'asc')
            ->orderBy('id', 'asc')
            ->get([
                'id',
                'evaluation_type',
                'evaluated_at',
                'weighted_score',
            ])
            ->map(function (Evaluation $item) use (&$previousWeightedScore, $evaluation) {
                $currentWeightedScore = $item->weighted_score !== null ? (float) $item->weighted_score : null;
                $delta = $currentWeightedScore !== null && $previousWeightedScore !== null
                    ? round($currentWeightedScore - $previousWeightedScore, 2)
                    : null;

                if ($currentWeightedScore !== null) {
                    $previousWeightedScore = $currentWeightedScore;
                }

                return [
                    'id' => $item->id,
                    'evaluated_at' => $item->evaluated_at?->format('Y-m-d'),
                    'weighted_score' => $currentWeightedScore,
                    'delta' => $delta,
                    'is_current' => (int) $item->id === (int) $evaluation->id,
                ];
            })
            ->values();

        $fileName = 'evaluacion-' . $evaluation->id . '-' . str($evaluation->intern?->user?->name ?? 'becario')
            ->slug()
            ->value() . '.pdf';

        return Pdf::view('pdfs.evaluation-report', [
            'evaluation' => $evaluation,
            'history' => $history,
        ])
            ->driver('dompdf')
            ->name($fileName);
    }
}
