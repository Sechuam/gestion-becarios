import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    ClipboardCheck,
    Clock3,
    KanbanSquare,
    Users,
} from 'lucide-react';
import {
    AttendanceStatsCard,
    AttendanceChart,
    InternsByCenterChart,
    TaskStatusChart,
} from '@/components/dashboard/DashboardCharts';
import { DashboardAlertCards } from '@/components/dashboard/DashboardAlertCards';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetricCards } from '@/components/dashboard/DashboardMetricCards';
import { InternTaskProgressPanel } from '@/components/dashboard/InternTaskProgressPanel';
import type {
    DashboardAlert,
    DashboardChartPoint,
    DashboardMetric,
    DashboardRole,
    DashboardStats,
    DashboardTaskProgress,
} from '@/components/dashboard/types';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface DashboardProps {
    role: DashboardRole;
    stats: DashboardStats;
    interns_by_center: DashboardChartPoint[];
    attendance_chart: DashboardChartPoint[];
    task_status_chart: DashboardChartPoint[];
    task_progress: DashboardTaskProgress[];
    alerts: DashboardAlert[];
}

export default function Dashboard({
    role,
    stats,
    interns_by_center,
    attendance_chart,
    task_status_chart,
    task_progress,
    alerts,
}: DashboardProps) {
    const roleLabel =
        role === 'admin'
            ? 'Administración'
            : role === 'tutor'
              ? 'Tutoría'
              : 'Becario';
    const taskCompletion =
        stats.total_tasks > 0
            ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
            : 0;

    const metrics: DashboardMetric[] = [
        {
            label: role === 'intern' ? 'Mi práctica' : 'Becarios activos',
            value: stats.active_interns,
            hint:
                role === 'admin'
                    ? 'En todos los centros'
                    : 'Dentro de tu alcance',
            icon: Users,
        },
        {
            label: 'Tareas abiertas',
            value: stats.active_tasks,
            hint: 'Pendientes, activas o en revisión',
            icon: KanbanSquare,
        },
        {
            label: 'Evaluaciones pendientes',
            value: stats.pending_evaluations,
            hint: 'Sin evaluación registrada este mes',
            icon: ClipboardCheck,
        },
        {
            label: 'Cumplimiento horario',
            value: `${stats.attendance_compliance}%`,
            hint: 'Horas registradas sobre objetivo',
            icon: Clock3,
        },
        {
            label: 'Próximas finalizaciones',
            value: stats.upcoming_endings,
            hint: 'Prácticas que terminan en 30 días',
            icon: CalendarClock,
        },
        {
            label: 'Alertas activas',
            value: stats.alerts,
            hint: 'Ausencias y jornadas por revisar',
            icon: AlertTriangle,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-2.5">
                <DashboardHeader
                    roleLabel={roleLabel}
                    alerts={stats.alerts}
                    completedTasks={stats.completed_tasks}
                    taskCompletion={taskCompletion}
                />

                <DashboardMetricCards metrics={metrics} />

                <div className="grid gap-2.5 xl:grid-cols-[1.2fr_0.8fr]">
                    <InternsByCenterChart data={interns_by_center} />
                    <TaskStatusChart data={task_status_chart} />
                </div>

                <div className="grid gap-2.5 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="flex h-full flex-col gap-2.5">
                        <AttendanceChart
                            className="flex-1"
                            data={attendance_chart}
                        />
                        <AttendanceStatsCard
                            className="flex-1"
                            completeAttendanceRate={
                                stats.complete_attendance_rate
                            }
                            averageDelayMinutes={stats.average_delay_minutes}
                            absenceRate={stats.absence_rate}
                        />
                    </div>
                    <InternTaskProgressPanel
                        className="h-full"
                        taskProgress={task_progress}
                        averageResolutionDays={
                            stats.average_task_resolution_days
                        }
                    />
                </div>

                <DashboardAlertCards alerts={alerts} />
            </div>
        </AppLayout>
    );
}
