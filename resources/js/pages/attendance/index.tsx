import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { RequestAbsenceModal } from '@/components/attendance/RequestAbsenceModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarClock, AlertTriangle, Clock3, ShieldAlert, TimerReset } from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Control horario', href: '/asistencia' },
];

type TodayLog = {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    total_hours: number | null;
    notes: string | null;
};

type ManageableIntern = {
    id: number;
    user_id: number;
    name: string;
    education_center: string | null;
};

type NonCompliantIntern = {
    id: number;
    name: string;
    debt: number;
    expected_hours: number;
    total_done: number;
    education_center: string | null;
};

const pad = (value: number) => String(value).padStart(2, '0');

const formatElapsed = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const getElapsedSeconds = (clockIn: string, currentDate = new Date()) => {
    const [hours, minutes, seconds] = clockIn.split(':').map(Number);

    const start = new Date(currentDate);
    start.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0, 0);

    return Math.floor((currentDate.getTime() - start.getTime()) / 1000);
};

const formatHoursDecimal = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (wholeHours === 0) {
        return `${minutes}m`;
    }

    if (minutes === 0) {
        return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}m`;
};

export default function Index({
    today_logs,
    current_log,
    today_total_hours,
    can_manage_attendance,
    manageable_interns,
    non_compliant_interns,
}: {
    today_logs: TodayLog[];
    current_log: TodayLog | null;
    today_total_hours: number;
    can_manage_attendance: boolean;
    manageable_interns: ManageableIntern[];
    non_compliant_interns: NonCompliantIntern[];
}) {
    const manualForm = useForm({
        intern_id: manageable_interns[0]?.id ? String(manageable_interns[0].id) : '',
        date: new Date().toISOString().split('T')[0],
        clock_in: '',
        clock_out: '',
        notes: '',
    });

    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        if (!current_log?.clock_in || current_log?.clock_out) return;

        const interval = window.setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => window.clearInterval(interval);
    }, [current_log?.clock_in, current_log?.clock_out]);
    const handleClockIn = () => {
        router.post('/time-logs/clock-in', {}, { preserveScroll: true });
    };

    const handleClockOut = () => {
        router.post('/time-logs/clock-out', {}, { preserveScroll: true });
    };

    const submitManualLog = (e: FormEvent) => {
        e.preventDefault();
        manualForm.post('/time-logs/manual', {
            preserveScroll: true,
            onSuccess: () => {
                manualForm.reset('clock_in', 'clock_out', 'notes');
                manualForm.setData('date', new Date().toISOString().split('T')[0]);
            },
        });
    };

    const liveElapsed =
        current_log?.clock_in && !current_log?.clock_out
            ? formatElapsed(getElapsedSeconds(current_log.clock_in, now))
            : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control Horario" />

            <div className="flex h-full flex-1 flex-col gap-6">
                <ModuleHeader
                    title="Control horario"
                    description="Registra tu jornada, visualiza tus tramos del día y detecta incidencias de cumplimiento sin salir del módulo."
                    icon={<Clock3 className="h-5 w-5" />}
                    metrics={[
                        {
                            label: 'Tramos hoy',
                            value: today_logs.length,
                            hint: 'Sesiones registradas en la jornada',
                        },
                        {
                            label: 'Tiempo acumulado',
                            value: today_total_hours > 0 ? formatHoursDecimal(today_total_hours) : '0m',
                            hint: 'Suma de horas del día',
                        },
                        {
                            label: 'Jornada activa',
                            value: current_log ? 'Sí' : 'No',
                            hint: current_log ? 'Hay un tramo abierto en curso' : 'No hay fichaje activo',
                        },
                    ]}
                />

                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <CalendarClock className="h-5 w-5" />
                            Registro diario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500">
                            Registra la hora exacta a la que empiezas y terminas tu jornada.
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={handleClockIn}
                                disabled={Boolean(current_log?.clock_in && !current_log?.clock_out)}
                            >
                                Entrar a trabajar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleClockOut}
                                disabled={!current_log?.clock_in || Boolean(current_log?.clock_out)}
                            >
                                Terminar jornada
                            </Button>
                            <RequestAbsenceModal />
                        </div>

                        {(today_logs.length > 0 || current_log) && (
                            <>
                                <div className="grid gap-3 rounded-[1.1rem] border border-border/70 bg-muted/25 p-4 text-sm md:grid-cols-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Entrada</p>
                                        <p className="font-medium">{current_log?.clock_in ?? '--:--'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Salida</p>
                                        <p className="font-medium">{current_log?.clock_out ?? '--:--'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                                        <p className="font-medium">
                                            {today_total_hours > 0 ? formatHoursDecimal(today_total_hours) : '0m'}
                                        </p>
                                    </div>
                                </div>

                                {liveElapsed && (
                                    <div className="rounded-[1.1rem] border border-primary/20 bg-primary/10 p-4 text-sm">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Tiempo trabajando ahora
                                        </p>
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/60 text-primary">
                                                <TimerReset className="h-5 w-5" />
                                            </div>
                                            <p className="text-2xl font-semibold tracking-[-0.03em] text-primary">
                                                {liveElapsed}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {today_logs.length > 0 && (
                                    <div className="rounded-[1.1rem] border border-border/70 bg-background/70 p-4 text-sm">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Tramos de hoy
                                        </p>

                                        <div className="mt-3 space-y-2">
                                            {today_logs.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-3 py-2.5"
                                                >
                                                    <span>
                                                        {log.clock_in ?? '--:--'} - {log.clock_out ?? 'En curso'}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        {log.total_hours !== null ? formatHoursDecimal(log.total_hours) : 'Pendiente'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {can_manage_attendance && (
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registro manual por tutor</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitManualLog} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Becario</Label>
                                            <Select
                                                value={manualForm.data.intern_id}
                                                onValueChange={(value) => manualForm.setData('intern_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un becario" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {manageable_interns.map((intern) => (
                                                        <SelectItem key={intern.id} value={String(intern.id)}>
                                                            {intern.name}
                                                            {intern.education_center ? ` · ${intern.education_center}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {manualForm.errors.intern_id && (
                                                <p className="text-xs text-red-500">{manualForm.errors.intern_id}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Fecha</Label>
                                            <Input
                                                type="date"
                                                value={manualForm.data.date}
                                                onChange={(e) => manualForm.setData('date', e.target.value)}
                                            />
                                            {manualForm.errors.date && (
                                                <p className="text-xs text-red-500">{manualForm.errors.date}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Entrada</Label>
                                            <Input
                                                type="time"
                                                value={manualForm.data.clock_in}
                                                onChange={(e) => manualForm.setData('clock_in', e.target.value)}
                                            />
                                            {manualForm.errors.clock_in && (
                                                <p className="text-xs text-red-500">{manualForm.errors.clock_in}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Salida</Label>
                                            <Input
                                                type="time"
                                                value={manualForm.data.clock_out}
                                                onChange={(e) => manualForm.setData('clock_out', e.target.value)}
                                            />
                                            {manualForm.errors.clock_out && (
                                                <p className="text-xs text-red-500">{manualForm.errors.clock_out}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Notas</Label>
                                        <Input
                                            value={manualForm.data.notes}
                                            onChange={(e) => manualForm.setData('notes', e.target.value)}
                                            placeholder="Motivo del ajuste o comentario"
                                        />
                                    </div>

                                    <Button type="submit" disabled={manualForm.processing || !manualForm.data.intern_id}>
                                        Guardar registro manual
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                                    Alertas de incumplimiento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {non_compliant_interns.length > 0 ? (
                                    non_compliant_interns.map((intern) => (
                                        <Alert
                                            key={intern.id}
                                            variant="destructive"
                                            className="rounded-2xl border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100"
                                        >
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle className="text-red-900 dark:text-red-100">
                                                {intern.name}
                                            </AlertTitle>
                                            <AlertDescription className="text-red-700 dark:text-red-200">
                                                Deuda de {intern.debt}h. Lleva {intern.total_done}h de {intern.expected_hours}h esperadas.
                                            </AlertDescription>
                                        </Alert>

                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No hay becarios con deuda horaria igual o superior a 8 horas.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardContent className="p-6">
                        <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-3">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek',
                                }}
                                events="/time-logs/events"
                                locale="es"
                                height="auto"
                                buttonText={{
                                    today: 'Hoy',
                                    month: 'Mes',
                                    week: 'Semana',
                                    day: 'Día',
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
