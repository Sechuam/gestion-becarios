import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ReferenceLine,
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
import type { DashboardChartPoint, DashboardCurrentLog } from './types';

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

function formatHoursToHoursMinutes(hours: number) {
    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${wholeHours}h ${minutes}m`;
}

type AttendanceView = 'day' | 'month';

function groupAttendanceByMonth(data: DashboardChartPoint[]) {
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'short' });
    const fallbackYear = new Date().getFullYear();
    const grouped = new Map<string, DashboardChartPoint>();

    data.forEach((point) => {
        if (!point.date) return;

        const [day, month] = point.date.split('/').map(Number);
        const date = point.iso_date
            ? new Date(`${point.iso_date}T00:00:00`)
            : new Date(fallbackYear, month - 1, day);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = grouped.get(key);
        const label = formatter.format(date).replace('.', '');

        grouped.set(key, {
            day: label.charAt(0).toUpperCase() + label.slice(1),
            date: label,
            horas: Number(current?.horas ?? 0) + Number(point.horas ?? 0),
        });
    });

    return Array.from(grouped.values());
}

function AttendanceTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value?: number; payload?: DashboardChartPoint }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;

    const point = payload[0]?.payload;
    const hours = Number(point?.horas ?? payload[0]?.value ?? 0);
    const date = point?.date;

    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <p className="font-black text-slate-900 dark:text-white">
                {label}
                {date ? ` · ${date}` : ''}
            </p>
            <p className="mt-1 font-medium text-slate-600 dark:text-slate-300">
                {formatHoursToHoursMinutes(hours)} registradas
            </p>
        </div>
    );
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
    currentLog,
}: ChartProps & {
    className?: string;
    currentLog?: DashboardCurrentLog | null;
}) {
    const [view, setView] = useState<AttendanceView>('day');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(
        currentLog?.elapsed_seconds ?? 0,
    );
    const liveHours = currentLog ? elapsedSeconds / 3600 : 0;
    const todayLoggedHours = Number(data[data.length - 1]?.horas ?? 0);
    const todayLiveTotalHours = todayLoggedHours + liveHours;
    const dailyData = useMemo(
        () =>
            [...data]
                .reverse()
                .map((point, index) => {
                    const isToday = index === 0;

                    return {
                        ...point,
                        day: isToday ? 'Hoy' : point.day,
                        horas:
                            isToday && currentLog
                                ? Number(point.horas ?? 0) + liveHours
                                : point.horas,
                    };
                }),
        [currentLog, data, liveHours],
    );
    const monthlyData = useMemo(() => groupAttendanceByMonth(data), [data]);
    const chartData = view === 'day' ? dailyData : monthlyData;
    const totalHours = chartData.reduce(
        (sum, item) => sum + Number(item.horas ?? 0),
        0,
    );
    const chartWidth =
        view === 'day'
            ? Math.max(860, chartData.length * 34)
            : Math.max(520, chartData.length * 96);

    useLayoutEffect(() => {
        const container = scrollRef.current;

        if (!container || view !== 'day') return;

        const scrollToToday = () => {
            container.scrollLeft = 0;
        };

        scrollToToday();
        const frame = window.requestAnimationFrame(scrollToToday);
        const timeout = window.setTimeout(scrollToToday, 120);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
        };
    }, [view, chartData.length, chartWidth]);

    useEffect(() => {
        if (!currentLog) {
            setElapsedSeconds(0);
            return;
        }

        setElapsedSeconds(currentLog.elapsed_seconds);
        const interval = window.setInterval(() => {
            setElapsedSeconds((seconds) => seconds + 1);
        }, 1000);

        return () => window.clearInterval(interval);
    }, [currentLog]);

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
                            Horas registradas durante los últimos 30 días.
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <div className="flex rounded-lg border border-sidebar/15 bg-white p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        {(['day', 'month'] as AttendanceView[]).map(
                            (option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setView(option)}
                                    className={`rounded-md px-2 py-1 text-[10px] font-black uppercase transition-colors ${
                                        view === option
                                            ? 'bg-sidebar text-white'
                                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {option === 'day' ? 'Día' : 'Mes'}
                                </button>
                            ),
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col bg-slate-50/60 px-3 pt-3 pb-3 dark:bg-slate-950/20">
                <div
                    ref={scrollRef}
                    className="relative min-h-[230px] min-w-0 overflow-x-auto rounded-lg border border-slate-200 bg-white px-2 pt-3 pb-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="sticky top-2 right-2 z-10 float-right rounded-lg border border-sidebar/15 bg-white/95 px-2.5 py-1 text-right shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
                        <p className="text-[9px] leading-none font-black tracking-widest text-slate-400 uppercase">
                            Total
                        </p>
                        <p className="mt-1 text-sm leading-none font-black text-slate-900 dark:text-white">
                            {formatHoursToHoursMinutes(totalHours)}
                        </p>
                    </div>
                    <div className="h-[220px]" style={{ width: chartWidth }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    left: 8,
                                    right: 8,
                                    top: 6,
                                    bottom: 48,
                                }}
                            >
                                <CartesianGrid
                                    stroke="#e2e8f0"
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={{ stroke: '#e2e8f0' }}
                                    tickLine={{ stroke: '#e2e8f0' }}
                                    tick={{
                                        dy: 14,
                                        fontSize: 10,
                                        fill: '#475569',
                                    }}
                                    height={54}
                                    interval={0}
                                />
                                <YAxis
                                    tickFormatter={(value) =>
                                        formatHoursToHoursMinutes(
                                            Number(value),
                                        )
                                    }
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#475569' }}
                                    width={52}
                                />
                                <Tooltip content={<AttendanceTooltip />} />
                                {view === 'day' && currentLog && (
                                    <ReferenceLine
                                        y={todayLiveTotalHours}
                                        stroke="#ef4444"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={{
                                            value: `Ahora ${formatHoursToHoursMinutes(todayLiveTotalHours)}`,
                                            position: 'insideTopLeft',
                                            fill: '#ef4444',
                                            fontSize: 10,
                                            fontWeight: 800,
                                        }}
                                    />
                                )}
                                <Bar
                                    dataKey="horas"
                                    fill="#65b84d"
                                    radius={[2, 2, 0, 0]}
                                    maxBarSize={28}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
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
            <CardContent className="grid items-stretch gap-1.5 bg-slate-50/60 px-2.5 pt-2 pb-2 sm:grid-cols-3 dark:bg-slate-950/20">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex min-h-[88px] flex-col rounded-md border border-l-2 border-slate-300 border-l-sidebar bg-white p-2 shadow-sm dark:border-slate-700 dark:border-l-teal-400 dark:bg-slate-900"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar text-white shadow-sm">
                                <stat.icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="h-1 w-6 rounded-full bg-sidebar" />
                        </div>
                        <div className="mt-2">
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
