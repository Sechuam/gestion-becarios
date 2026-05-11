import { Head } from '@inertiajs/react';
import { Building2, Clock3, KanbanSquare, Users } from 'lucide-react';
import {
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
            label: 'Centros vinculados',
            value: stats.active_centers,
            hint: 'Con actividad registrada',
            icon: Building2,
        },
        {
            label: 'Tareas abiertas',
            value: stats.active_tasks,
            hint: 'Pendientes, activas o en revisión',
            icon: KanbanSquare,
        },
        {
            label: 'Cumplimiento horario',
            value: `${stats.attendance_compliance}%`,
            hint: 'Horas registradas sobre objetivo',
            icon: Clock3,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-5">
                <DashboardHeader
                    roleLabel={roleLabel}
                    alerts={stats.alerts}
                    completedTasks={stats.completed_tasks}
                    taskCompletion={taskCompletion}
                />

                <DashboardMetricCards metrics={metrics} />

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <InternsByCenterChart data={interns_by_center} />
                    <TaskStatusChart data={task_status_chart} />
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                    <AttendanceChart data={attendance_chart} />
                    <InternTaskProgressPanel taskProgress={task_progress} />
                </div>

                <DashboardAlertCards alerts={alerts} />
            </div>
        </AppLayout>
    );
}
