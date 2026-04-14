<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Services\TimeTrackingService;
use Illuminate\Http\Request;
use Spatie\LaravelPdf\Facades\Pdf;

class AttendanceReportController extends Controller
{
    public function download(Request $request, Intern $intern, TimeTrackingService $service)
    {
        $user = $request->user();
        abort_unless(
            $user->can('manage interns')
                || ($user->isTutor() && $intern->company_tutor_user_id === $user->id)
                || $intern->user_id === $user->id,
            403
        );

        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $data = $service->getReportData($intern, $request->start_date, $request->end_date);

        return Pdf::view('pdfs.attendance-report', $data)
            ->driver('dompdf')
            ->name("reporte-asistencia-{$intern->user->name}.pdf");
    }

}
