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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardChartPoint } from './types';

const pieColors = [
    '#0f766e',
    '#1f4f52',
    '#2c6f72',
    '#3b8588',
    '#63a8aa',
    '#9ccfd0',
];

type ChartProps = {
    data: DashboardChartPoint[];
};

export function InternsByCenterChart({ data }: ChartProps) {
    return (
        <Card className="overflow-hidden border-sidebar/15 bg-white shadow-sm dark:bg-slate-900">
            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-sidebar/5 px-2.5 py-1.5 dark:bg-sidebar/10">
                <div>
                    <CardTitle className="text-sm font-black text-sidebar dark:text-teal-100">
                        Becarios por centro educativo
                    </CardTitle>
                    <p className="text-[11px] leading-4 text-slate-500">
                        Distribución activa para priorizar carga y seguimiento.
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="rounded-md border-sidebar/20 bg-white/70 px-2 py-0 text-[10px] text-sidebar dark:bg-slate-950/40 dark:text-teal-100"
                >
                    Recharts
                </Badge>
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
                            fill="#1f4f52"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function TaskStatusChart({ data }: ChartProps) {
    return (
        <Card className="overflow-hidden border-sidebar/15 bg-white shadow-sm dark:bg-slate-900">
            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-sidebar/5 px-2.5 py-1.5 dark:bg-sidebar/10">
                <div>
                    <CardTitle className="text-sm font-black text-sidebar dark:text-teal-100">
                        Progreso de tareas
                    </CardTitle>
                    <p className="text-[11px] leading-4 text-slate-500">
                        Estado global del trabajo asignado.
                    </p>
                </div>
            </CardHeader>
            <CardContent className="h-44 px-2.5 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={36}
                            outerRadius={66}
                            paddingAngle={3}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`${entry.name}-${index}`}
                                    fill={pieColors[index % pieColors.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function AttendanceChart({ data, className }: ChartProps & { className?: string }) {
    return (
        <Card className={`flex flex-col overflow-hidden border-sidebar/15 bg-white shadow-sm dark:bg-slate-900 ${className}`}>
            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-sidebar/5 px-2.5 py-1.5 dark:bg-sidebar/10">
                <div>
                    <CardTitle className="text-sm font-black text-sidebar dark:text-teal-100">
                        Cumplimiento horario
                    </CardTitle>
                    <p className="text-[11px] leading-4 text-slate-500">
                        Horas registradas durante los últimos seis meses.
                    </p>
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
                            dot={{ r: 3, fill: '#1f4f52', stroke: '#ffffff' }}
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
        <Card className={`flex flex-col overflow-hidden border-sidebar/15 bg-white shadow-sm dark:bg-slate-900 ${className}`}>
            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-sidebar/5 px-2.5 py-1.5 dark:bg-sidebar/10">
                <div>
                    <CardTitle className="text-sm font-black text-sidebar dark:text-teal-100">
                        Estadísticas de cumplimiento horario
                    </CardTitle>
                    <p className="text-[11px] leading-4 text-slate-500">
                        Lectura resumida de asistencia reciente y ausencias.
                    </p>
                </div>
            </CardHeader>
            <CardContent className="grid flex-1 items-stretch gap-1.5 px-2.5 pb-2 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex h-full flex-col rounded-md border border-sidebar bg-linear-to-br from-sidebar to-[#1f4f52] p-2 shadow-sm"
                    >
                        {/* Top row: icon left, line right */}
                        <div className="flex items-start justify-between">
                            <stat.icon className="h-6 w-6 text-white/40" />
                            <div className="h-1 w-6 rounded-full bg-white/10" />
                        </div>
                        {/* Spacer */}
                        <div className="flex-1" />
                        {/* Bottom: fixed height so all cards align perfectly */}
                        <div className="min-h-[72px]">
                            <p className="text-[9px] leading-3 font-black tracking-widest text-white/70 uppercase">
                                {stat.label}
                            </p>
                            <p className="mt-0.5 text-lg leading-6 font-black text-white">
                                {stat.value}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[10px] leading-3.5 font-medium text-white/70">
                                {stat.hint}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
