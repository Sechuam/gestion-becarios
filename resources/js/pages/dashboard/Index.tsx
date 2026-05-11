import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, BarChart3, Building2, CheckCircle2, Clock3, FileDown, KanbanSquare, TrendingUp, Users } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];

type Role = 'admin' | 'tutor' | 'intern' | string;

type ChartPoint = {
    name?: string;
    month?: string;
    becarios?: number;
    horas?: number;
    value?: number;
};

type TaskProgress = {
    id: number;
    name: string;
    center: string;
    completed: number;
    total: number;
    progress: number;
    hours: number;
};

interface DashboardProps {
    role: Role;
    stats: {
        active_interns: number;
        active_centers: number;
        active_tasks: number;
        alerts: number;
        attendance_compliance: number;
        completed_tasks: number;
        total_tasks: number;
    };
    interns_by_center: ChartPoint[];
    attendance_chart: ChartPoint[];
    task_status_chart: ChartPoint[];
    task_progress: TaskProgress[];
    alerts: { label: string; value: number; tone: string }[];
}

const pieColors = ['#0f766e', '#2563eb', '#f59e0b', '#e11d48', '#7c3aed', '#16a34a'];

export default function Dashboard({
    role,
    stats,
    interns_by_center,
    attendance_chart,
    task_status_chart,
    task_progress,
    alerts,
}: DashboardProps) {
    const roleLabel = role === 'admin' ? 'Administración' : role === 'tutor' ? 'Tutoría' : 'Becario';
    const taskCompletion = stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0;

    const metrics = [
        {
            label: role === 'intern' ? 'Mi práctica' : 'Becarios activos',
            value: stats.active_interns,
            hint: role === 'admin' ? 'En todos los centros' : 'Dentro de tu alcance',
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
                <ModuleHeader
                    title={`Dashboard ${roleLabel}`}
                    description="Centro de control operativo con KPIs, actividad horaria, tareas y reportes exportables."
                    icon={<BarChart3 className="h-6 w-6" />}
                    actions={
                        <Button asChild className="h-9 rounded-lg bg-white text-sidebar hover:bg-white/90">
                            <Link href="/reportes">
                                <FileDown className="mr-2 h-4 w-4" />
                                Reportes
                            </Link>
                        </Button>
                    }
                    metrics={[
                        { label: 'Alertas', value: stats.alerts, hint: 'Necesitan revisión' },
                        { label: 'Tareas completadas', value: stats.completed_tasks, hint: `${taskCompletion}% del total` },
                        { label: 'Widgets', value: 4, hint: 'Datos con caché' },
                    ]}
                />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <Card key={metric.label} className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                            <CardContent className="flex items-start justify-between gap-3 p-4">
                                <div className="min-w-0 space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.label}</p>
                                    <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{metric.value}</p>
                                    <p className="text-xs font-medium text-slate-500">{metric.hint}</p>
                                </div>
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar text-white">
                                    <metric.icon className="h-5 w-5" />
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-black">Becarios por centro educativo</CardTitle>
                                <p className="text-sm text-slate-500">Distribución activa para priorizar carga y seguimiento.</p>
                            </div>
                            <Badge variant="outline" className="rounded-lg">Recharts</Badge>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={interns_by_center} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={60} angle={-15} textAnchor="end" />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="becarios" radius={[6, 6, 0, 0]} fill="#0f766e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-black">Progreso de tareas</CardTitle>
                            <p className="text-sm text-slate-500">Estado global del trabajo asignado.</p>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={task_status_chart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={102} paddingAngle={3}>
                                        {task_status_chart.map((entry, index) => (
                                            <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                    <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-black">Cumplimiento horario</CardTitle>
                            <p className="text-sm text-slate-500">Horas registradas durante los últimos seis meses.</p>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendance_chart} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="horas" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-black">Panel de progreso por becario</CardTitle>
                                <p className="text-sm text-slate-500">Tareas completadas, carga total y horas fichadas.</p>
                            </div>
                            <TrendingUp className="h-5 w-5 text-sidebar" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {task_progress.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-sidebar/20 p-6 text-sm text-slate-500">Todavía no hay tareas vinculadas para mostrar progreso.</div>
                            ) : (
                                task_progress.map((intern) => (
                                    <div key={intern.id} className="rounded-lg border border-sidebar/10 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900 dark:text-white">{intern.name}</p>
                                                <p className="truncate text-xs text-slate-500">{intern.center}</p>
                                            </div>
                                            <Badge variant="outline" className="rounded-lg">{intern.hours} h</Badge>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <Progress value={intern.progress} className="h-2" />
                                            <span className="w-10 text-right text-xs font-black text-slate-500">{intern.progress}%</span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">{intern.completed} de {intern.total} tareas completadas</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {alerts.map((alert) => (
                        <Card key={alert.label} className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                            <CardContent className="flex items-center gap-3 p-4">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                    {alert.value > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                </span>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{alert.value}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{alert.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
