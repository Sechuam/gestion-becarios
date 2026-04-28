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

        $fileName = 'evaluacion-' . $evaluation->id . '-' . str($evaluation->intern?->user?->name ?? 'becario')
            ->slug()
            ->value() . '.pdf';

        return Pdf::view('pdfs.evaluation-report', [
            'evaluation' => $evaluation,
        ])
            ->driver('dompdf')
            ->name($fileName);
    }
}
