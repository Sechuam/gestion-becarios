<?php

namespace App\Services;

use App\Models\Intern;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class TimeTrackingService
{
    public const NON_COMPLIANCE_THRESHOLD = 8.0;

    public function getStats(Intern $intern)
    {
        $user = $intern->user;
        $today = Carbon::today();
        $startDate = Carbon::parse($intern->start_date);
        $endDateLimit = $intern->end_date ? Carbon::parse($intern->end_date) : $today;
        $calculationEnd = $today->gt($endDateLimit) ? $endDateLimit : $today;

        $expectedHours = 0;
        $justifiedHours = 0;

        if ($startDate->lte($calculationEnd)) {
            $period = CarbonPeriod::create($startDate, $calculationEnd);
            $schedules = $user->schedules()->get();
            $approvedAbsenceDates = $user->absences()
                ->where('status', 'approved')
                ->get()
                ->map(fn($absence) => $absence->date->format('Y-m-d'));

            foreach ($period as $date) {
                $schedule = $schedules->first(function ($s) use ($date) {
                    return $date->between($s->start_date, $s->end_date ?? Carbon::tomorrow());
                });

                if ($schedule) {
                    $dayName = strtolower($date->format('l'));
                    $hoursToday = (float) $schedule->{"{$dayName}_hours"};
                    $expectedHours += $hoursToday;
                    $hasAbsence = $approvedAbsenceDates->contains($date->format('Y-m-d'));
                    if ($hasAbsence) {
                        $justifiedHours += $hoursToday;
                    }
                }
            }
        }

        $workedHours = (float) $user->timeLogs()
            ->whereBetween('date', [$startDate->toDateString(), $calculationEnd->toDateString()])
            ->sum('total_hours');

        $totalDone = $workedHours + $justifiedHours;
        $debt = $expectedHours - $totalDone;

        return [
            'expected_hours' => round($expectedHours, 2),
            'worked_hours' => round($workedHours, 2),
            'justified_hours' => round($justifiedHours, 2),
            'total_done' => round($totalDone, 2),
            'debt' => round($debt, 2),
            'is_non_compliant' => $debt >= self::NON_COMPLIANCE_THRESHOLD,
            'target_total' => (float) $intern->total_hours,
        ];
    }

    public function getReportData(Intern $intern, $startDate, $endDate)
    {
        $user = $intern->user;
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $period = CarbonPeriod::create($start, $end);
        $logs = $user->timeLogs()->whereBetween('date', [$start, $end])->get()->keyBy(fn($l) => $l->date->format('Y-m-d'));
        $absences = $user->absences()
            ->where('status', 'approved')
            ->whereBetween('date', [$start, $end])
            ->get()
            ->keyBy(fn($absence) => $absence->date->format('Y-m-d'));
        $schedules = $user->schedules()->get();

        $days = [];
        $totalWorked = 0;
        $totalJustified = 0;

        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $log = $logs->get($dateStr);
            $absence = $absences->get($dateStr);

            // Buscar que horario le tocaba ese dia
            $schedule = $schedules->first(fn($s) => $date->between($s->start_date, $s->end_date ?? Carbon::tomorrow()));
            $expectedToday = $schedule ? (float) $schedule->{strtolower($date->format('l')) . '_hours'} : 0;

            $days[] = [
                'date' => $date->format('d/m/Y'),
                'day_name' => $date->translatedFormat('l'),
                'clock_in' => $log?->clock_in,
                'clock_out' => $log?->clock_out,
                'hours' => $log?->total_hours ?? 0,
                'absence' => $absence?->reason,
                'justified_hours' => $absence ? $expectedToday : 0,
                'is_weekend' => $date->isWeekend(),
            ];

            $totalWorked += $log?->total_hours ?? 0;
            if ($absence)
                $totalJustified += $expectedToday;
        }

        return [
            'intern' => $intern,
            'days' => $days,
            'total_worked' => round($totalWorked, 2),
            'total_justified' => round($totalJustified, 2),
            'grand_total' => round($totalWorked + $totalJustified, 2),
            'period_start' => $start->format('d/m/Y'),
            'period_end' => $end->format('d/m/Y'),
        ];
    }

    public function getNonCompliantInternsForUser($user)
    {
        $query = Intern::query()
            ->with(['user', 'educationCenter', 'companyTutor'])
            ->where('status', 'active');

        if ($user->can('manage interns')) {
            $interns = $query->orderBy('start_date')->get();
        } elseif ($user->isTutor()) {
            $interns = $query
                ->where('company_tutor_user_id', $user->id)
                ->orderBy('start_date')
                ->get();
        } else {
            return collect();
        }

        return $interns
            ->map(function (Intern $intern) {
                $stats = $this->getStats($intern);

                return [
                    'id' => $intern->id,
                    'name' => $intern->user->name,
                    'debt' => $stats['debt'],
                    'expected_hours' => $stats['expected_hours'],
                    'total_done' => $stats['total_done'],
                    'education_center' => $intern->educationCenter?->name,
                    'company_tutor' => $intern->companyTutor?->name,
                ];
            })
            ->filter(fn(array $intern) => $intern['debt'] >= self::NON_COMPLIANCE_THRESHOLD)
            ->values();
    }
}
