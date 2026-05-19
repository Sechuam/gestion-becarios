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
import {
    ClipboardCheck,
    Clock,
    UserX,
    GraduationCap,
    ListTodo,
    BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardChartPoint } from './types';

const taskStatusColors: Record<string, string> = {
    Pendientes: '#94a3b8',
    'En curso': '#3b82f6',
    'En revisión': '#8b5cf6',
    Completadas: '#10b981',
    Rechazadas: '#ef4444',
};

function getTaskStatusColor(name?: string) {
    if (!name) return '#64748b';
    return taskStatusColors[name] ?? '#64748b';
}

type ChartProps = {
    data: DashboardChartPoint[];
};

export function InternsByCenterChart({ data }: ChartProps) {
    return (
        <Card className="group gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-400 bg-slate-200 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar to-sidebar-accent/90 text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <GraduationCap className="h-4 w-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm leading-tight font-black text-slate-800 dark:text-slate-100">
                            Becarios por centro educativo
                        </CardTitle>
                        <p className="mt-0.5 text-[11px] leading-none text-slate-500">
                            Distribución activa para priorizar carga y
                            seguimiento.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-44 px-2.5 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ left: 0, right: 4, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            height={38}
                            angle={-12}
                            textAnchor="end"
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar
                            dataKey="becarios"
                            radius={[6, 6, 0, 0]}
                            fill="#64748b"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function TaskStatusChart({ data }: ChartProps) {
    return (
        <Card className="group gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-400 bg-slate-200 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar to-sidebar-accent/90 text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <ListTodo className="h-4 w-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm leading-tight font-black text-slate-800 dark:text-slate-100">
                            Progreso de tareas
                        </CardTitle>
                        <p className="mt-0.5 text-[11px] leading-none text-slate-500">
                            Estado global del trabajo asignado.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid h-44 grid-cols-[minmax(0,1fr)_112px] items-center gap-2 px-2.5 pb-2">
                <div className="min-h-0 min-w-0 self-stretch">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={34}
                                outerRadius={60}
                                paddingAngle={3}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`${entry.name}-${index}`}
                                        fill={getTaskStatusColor(entry.name)}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                    {data.map((entry) => (
                        <div
                            key={entry.name}
                            className="flex min-w-0 items-center gap-1.5"
                        >
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{
                                    backgroundColor: getTaskStatusColor(
                                        entry.name,
                                    ),
                                }}
                            />
                            <span className="truncate">
                                {entry.name}: {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function AttendanceChart({
    data,
    className,
}: ChartProps & { className?: string }) {
    return (
        <Card
            className={`group flex flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${className}`}
        >
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-400 bg-slate-200 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar to-sidebar-accent/90 text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <Clock className="h-4 w-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm leading-tight font-black text-slate-800 dark:text-slate-100">
                            Cumplimiento horario
                        </CardTitle>
                        <p className="mt-0.5 text-[11px] leading-none text-slate-500">
                            Horas registradas durante los últimos seis meses.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 px-2.5 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="horas"
                            stroke="#0f766e"
                            strokeWidth={2.5}
                            dot={{
                                r: 3,
                                fill: 'var(--sidebar-accent)',
                                stroke: '#ffffff',
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

type AttendanceStatsProps = {
    completeAttendanceRate: number;
    averageDelayMinutes: number | null;
    absenceRate: number;
    className?: string;
};

export function AttendanceStatsCard({
    completeAttendanceRate,
    averageDelayMinutes,
    absenceRate,
    className,
}: AttendanceStatsProps) {
    const stats = [
        {
            label: 'Días completos',
            value: `${completeAttendanceRate}%`,
            hint: 'Últimos 30 días con horas cubiertas',
            icon: ClipboardCheck,
        },
        {
            label: 'Retraso medio',
            value:
                averageDelayMinutes === null
                    ? 'No configurado'
                    : averageDelayMinutes === 0
                      ? 'Sin retraso'
                      : `${averageDelayMinutes} min`,
            hint:
                averageDelayMinutes === null
                    ? 'Requiere hora prevista de entrada'
                    : 'Basado en el horario previsto',
            icon: Clock,
        },
        {
            label: 'Tasa de ausencias',
            value: `${absenceRate}%`,
            hint: 'Ausencias aprobadas sobre días previstos',
            icon: UserX,
        },
    ];

    return (
        <Card
            className={`group flex flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${className}`}
        >
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-400 bg-slate-200 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar to-sidebar-accent/90 text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <BarChart3 className="h-4 w-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm leading-tight font-black text-slate-800 dark:text-slate-100">
                            Estadísticas de cumplimiento horario
                        </CardTitle>
                        <p className="mt-0.5 text-[11px] leading-none text-slate-500">
                            Lectura resumida de asistencia reciente y ausencias.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid flex-1 items-stretch gap-1.5 bg-slate-50/60 px-2.5 pt-2 pb-2 sm:grid-cols-3 dark:bg-slate-950/20">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex h-full flex-col rounded-md border border-l-2 border-slate-300 border-l-sidebar bg-white p-2 shadow-sm dark:border-slate-700 dark:border-l-teal-400 dark:bg-slate-900"
                    >
                        {/* Top row: icon left, line right */}
                        <div className="flex items-start justify-between">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar text-white shadow-sm">
                                <stat.icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="h-1 w-6 rounded-full bg-sidebar" />
                        </div>
                        {/* Spacer */}
                        <div className="flex-1" />
                        {/* Bottom: fixed height so all cards align perfectly */}
                        <div className="min-h-[72px]">
                            <p className="text-[9px] leading-3 font-black tracking-widest text-slate-500 uppercase">
                                {stat.label}
                            </p>
                            <p className="mt-0.5 text-lg leading-6 font-black text-slate-900 dark:text-white">
                                {stat.value}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[10px] leading-3.5 font-medium text-slate-500">
                                {stat.hint}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
