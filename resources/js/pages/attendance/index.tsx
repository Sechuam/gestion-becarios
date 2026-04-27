import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EventContentArg, EventMountArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { RequestAbsenceModal } from '@/components/attendance/RequestAbsenceModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarClock, AlertTriangle, Clock3, ShieldAlert, TimerReset, FilePlus, ExternalLink, FileText, Download } from 'lucide-react';
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
    avatar?: string;
    education_center: string | null;
};

type NonCompliantIntern = {
    id: number;
    name: string;
    avatar?: string;
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
    absences,
}: {
    today_logs: TodayLog[];
    current_log: TodayLog | null;
    today_total_hours: number;
    can_manage_attendance: boolean;
    manageable_interns: ManageableIntern[];
    non_compliant_interns: NonCompliantIntern[];
    absences: any[];
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

    const handleUploadJustification = (absenceId: number, file: File) => {
        router.post(`/absences/${absenceId}/justification`, {
            justification_file: file,
        }, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const liveElapsed =
        current_log?.clock_in && !current_log?.clock_out
            ? formatElapsed(getElapsedSeconds(current_log.clock_in, now))
            : null;

    const renderCalendarEvent = (eventInfo: EventContentArg) => (
        <div className="attendance-calendar-event-content">
            <span
                className="attendance-calendar-event-dot"
                style={{ backgroundColor: eventInfo.event.backgroundColor }}
            />
            <span className="attendance-calendar-event-label">
                {eventInfo.timeText ? `${eventInfo.timeText} ` : ''}
                {eventInfo.event.title}
            </span>
        </div>
    );

    const attachEventTooltip = (eventInfo: EventMountArg) => {
        const tooltip = [eventInfo.timeText, eventInfo.event.title]
            .filter(Boolean)
            .join(' · ');

        eventInfo.el.setAttribute('title', tooltip || eventInfo.event.title);
    };

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

                <Card className="rounded-[2.5rem] border-sidebar/10 bg-white shadow-2xl overflow-hidden dark:bg-slate-900">
                    <CardHeader className="border-b border-sidebar/5 p-8 pb-6">
                        <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-white shadow-lg shadow-sidebar/20 pt-1">
                                <CalendarClock className="h-6 w-6" />
                            </div>
                            Registro de Jornada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-sidebar/10 dark:bg-slate-800/50">
                            <div className="space-y-1">
                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Acciones Rápidas</p>
                                <p className="text-sm font-medium text-slate-500 italic">Registra la hora exacta a la que empiezas y terminas tu jornada.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button
                                    onClick={handleClockIn}
                                    disabled={Boolean(current_log?.clock_in && !current_log?.clock_out)}
                                    className="h-12 bg-sidebar text-white hover:bg-sidebar/90 rounded-2xl px-8 font-black shadow-xl shadow-sidebar/20 transition-all active:scale-95"
                                >
                                    Fichar Entrada
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleClockOut}
                                    disabled={!current_log?.clock_in || Boolean(current_log?.clock_out)}
                                    className="h-12 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl px-8 font-black shadow-xl shadow-rose-600/20 transition-all active:scale-95"
                                >
                                    Fichar Salida
                                </Button>
                                <RequestAbsenceModal />
                            </div>
                        </div>

                        {(today_logs.length > 0 || current_log) && (
                            <div className="grid gap-8">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="flex flex-col gap-2 rounded-2xl border border-sidebar/10 bg-white p-6 shadow-sm dark:bg-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-sidebar">Entrada Detectada</p>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">{current_log?.clock_in ?? '--:--'}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-2xl border border-sidebar/10 bg-white p-6 shadow-sm dark:bg-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-sidebar">Salida Registrada</p>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">{current_log?.clock_out ?? '--:--'}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-2xl border border-sidebar/10 bg-white p-6 shadow-sm dark:bg-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-sidebar">Total Acumulado</p>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">
                                            {today_total_hours > 0 ? formatHoursDecimal(today_total_hours) : '0m'}
                                        </p>
                                    </div>
                                </div>

                                {liveElapsed && (
                                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sidebar/5 to-[#1f4f52]/5 p-8 border border-sidebar/10 backdrop-blur-sm">
                                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sidebar text-white shadow-xl shadow-sidebar/20 pt-1">
                                                    <TimerReset className="h-7 w-7 animate-pulse" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar">En Curso</p>
                                                    <p className="text-4xl font-black tracking-tight text-sidebar leading-none mt-1">
                                                        {liveElapsed}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-sidebar/70 italic max-w-[200px]">
                                                Contabilizando el tramo actual en tiempo real.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {today_logs.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest ml-1">Tramos de hoy</h3>
                                        <div className="grid gap-3">
                                            {today_logs.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="flex items-center justify-between gap-4 rounded-2xl border border-sidebar/10 bg-white px-6 py-4 shadow-sm hover:border-sidebar/30 transition-all dark:bg-slate-800"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock3 className="h-4 w-4 text-sidebar/50" />
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                                            {log.clock_in ?? '--:--'} <span className="mx-2 text-slate-300">→</span> {log.clock_out ?? 'En curso'}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="h-8 rounded-full border-sidebar/20 bg-slate-50 px-4 text-[10px] font-black uppercase tracking-widest text-sidebar">
                                                        {log.total_hours !== null ? formatHoursDecimal(log.total_hours) : 'Procesando...'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {can_manage_attendance && (
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <Card className="rounded-[2.5rem] border-sidebar/10 bg-white shadow-2xl overflow-hidden dark:bg-slate-900">
                            <CardHeader className="border-b border-sidebar/5 p-8 pb-6">
                                <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Registro Manual</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={submitManualLog} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-sidebar ml-1">Becario Asignado</Label>
                                            <Select
                                                value={manualForm.data.intern_id}
                                                onValueChange={(value) => manualForm.setData('intern_id', value)}
                                            >
                                                <SelectTrigger className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
                                                    <SelectValue placeholder="Selecciona un becario" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-sidebar/20">
                                                    {manageable_interns && Array.isArray(manageable_interns) && manageable_interns.map((intern) => (
                                                        <SelectItem key={intern.id} value={String(intern.id)}>
                                                            {intern.name}
                                                            {intern.education_center ? ` · ${intern.education_center}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {manualForm.errors.intern_id && (
                                                <p className="text-xs font-bold text-red-500">{manualForm.errors.intern_id}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-sidebar ml-1">Fecha de Registro</Label>
                                            <DatePicker
                                                className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm"
                                                value={manualForm.data.date}
                                                onChange={(value) => manualForm.setData('date', value)}
                                            />
                                            {manualForm.errors.date && (
                                                <p className="text-xs font-bold text-red-500">{manualForm.errors.date}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-sidebar ml-1">Hora de Entrada</Label>
                                            <Input
                                                type="time"
                                                className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm"
                                                value={manualForm.data.clock_in}
                                                onChange={(e) => manualForm.setData('clock_in', e.target.value)}
                                            />
                                            {manualForm.errors.clock_in && (
                                                <p className="text-xs font-bold text-red-500">{manualForm.errors.clock_in}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-sidebar ml-1">Hora de Salida</Label>
                                            <Input
                                                type="time"
                                                className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm"
                                                value={manualForm.data.clock_out}
                                                onChange={(e) => manualForm.setData('clock_out', e.target.value)}
                                            />
                                            {manualForm.errors.clock_out && (
                                                <p className="text-xs font-bold text-red-500">{manualForm.errors.clock_out}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-sidebar ml-1">Notas y Observaciones</Label>
                                        <Input
                                            className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm"
                                            value={manualForm.data.notes}
                                            onChange={(e) => manualForm.setData('notes', e.target.value)}
                                            placeholder="Motivo del ajuste o comentario aclaratorio..."
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={manualForm.processing || !manualForm.data.intern_id}
                                        className="h-12 bg-sidebar text-white hover:bg-sidebar/90 rounded-2xl px-10 font-black shadow-xl shadow-sidebar/20 transition-all active:scale-95"
                                    >
                                        Guardar Registro Manual
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-sidebar/10 bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="border-b border-sidebar/5 p-8 pb-6 bg-slate-50/30 dark:bg-slate-800/30">
                                <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-inner">
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                    Alertas de Incumplimiento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {non_compliant_interns.length > 0 ? (
                                    non_compliant_interns.map((intern) => (
                                        <div
                                            key={intern.id}
                                            className="group rounded-[1.5rem] border border-rose-100 bg-rose-50/30 p-5 shadow-sm transition-all hover:bg-rose-50 hover:border-rose-200 dark:bg-red-950/20 dark:border-red-900/40"
                                        >
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-12 w-12 border-4 border-white shadow-lg shrink-0">
                                                    <AvatarImage src={intern.avatar} alt={intern.name} />
                                                    <AvatarFallback className="text-sm font-black bg-rose-100 text-rose-600 pt-1">
                                                        {intern.name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <p className="font-black text-rose-900 dark:text-red-100">{intern.name}</p>
                                                    <p className="text-sm font-medium text-rose-700/80 leading-snug dark:text-red-200/70">
                                                        Deuda Crítica: <span className="font-black text-rose-600">{intern.debt}h</span> acumuladas.
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-rose-400">
                                                        <span>Progreso: {intern.total_done}h / {intern.expected_hours}h</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                                        <p className="text-sm font-medium text-slate-500 italic">
                                            No hay becarios con deuda horaria crítica en este momento. <br /> El cumplimiento es óptimo en la red.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* SECCIÓN MIS AUSENCIAS PARA EL BECARIO */}
                {!can_manage_attendance && absences && Array.isArray(absences) && (
                    <Card className="rounded-[2.5rem] border-sidebar/10 bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="border-b border-sidebar/5 p-8 pb-6 bg-slate-50/30 dark:bg-slate-800/30">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar/10 text-sidebar shadow-inner">
                                    <FileText className="h-6 w-6" />
                                </div>
                                Mis Ausencias y Permisos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-4">
                                {absences.length > 0 ? (
                                    absences.map((abs) => (
                                        <div key={abs.id} className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-sidebar/10 bg-slate-50/50 p-6 shadow-sm transition-all hover:bg-white hover:shadow-md dark:bg-slate-800">
                                            <div className="flex items-center gap-5">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${abs.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        abs.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    <CalendarClock className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white">{abs?.reason || 'Sin motivo detallado'}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{abs?.date || '--'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <span className={`text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border shadow-sm ${abs.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        abs.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {abs.status === 'approved' ? 'Aprobada' :
                                                        abs.status === 'rejected' ? 'Denegada' : 'En espera'}
                                                </span>

                                                {abs.justification_url ? (
                                                    <div className="flex items-center gap-3">
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-sidebar/10 hover:text-sidebar" asChild>
                                                            <a href={abs.justification_url} target="_blank" rel="noreferrer">
                                                                <ExternalLink className="h-5 w-5" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-sidebar/10 hover:text-sidebar" asChild>
                                                            <a href={abs.justification_url} download>
                                                                <Download className="h-5 w-5" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleUploadJustification(abs.id, file);
                                                            }}
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                        />
                                                        <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs font-black uppercase tracking-widest text-[#1f4f52] border-sidebar/20 bg-white hover:bg-slate-50 shadow-sm">
                                                            <FilePlus className="h-4 w-4" />
                                                            Adjuntar PDF
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                                        <p className="text-sm font-medium text-slate-500 italic">No tienes ausencias registradas recientemente.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="rounded-[2.5rem] border-sidebar/10 bg-white shadow-2xl overflow-hidden dark:bg-slate-900 p-8">
                    <CardContent className="p-0">
                        <div className="attendance-calendar rounded-[2rem] border border-sidebar/10 bg-slate-50/50 p-6 shadow-inner transition-all dark:bg-slate-800/50">
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
                                firstDay={1}
                                contentHeight={720}
                                fixedWeekCount
                                expandRows
                                dayMaxEventRows={3}
                                moreLinkClick="popover"
                                eventClassNames={() => ['attendance-calendar-event']}
                                eventContent={renderCalendarEvent}
                                eventDidMount={attachEventTooltip}
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
