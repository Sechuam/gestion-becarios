import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
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
        intern_id: '',
        date: new Date().toISOString().split('T')[0],
        clock_in: '',
        clock_out: '',
        notes: '',
    });

    const [now, setNow] = useState(() => new Date());

    // ── Búsqueda de becarios ──────────────────────────────────────────────────
    const [internSearch, setInternSearch] = useState('');
    const [showInternDropdown, setShowInternDropdown] = useState(false);
    const internSearchRef = useRef<HTMLDivElement>(null);

    const filteredInterns = (manageable_interns ?? []).filter((i) =>
        i.name.toLowerCase().includes(internSearch.toLowerCase()) ||
        (i.education_center ?? '').toLowerCase().includes(internSearch.toLowerCase())
    );

    const selectedIntern = (manageable_interns ?? []).find(
        (i) => String(i.id) === manualForm.data.intern_id
    );

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (internSearchRef.current && !internSearchRef.current.contains(e.target as Node)) {
                setShowInternDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectIntern = (intern: ManageableIntern) => {
        manualForm.setData('intern_id', String(intern.id));
        setInternSearch('');
        setShowInternDropdown(false);
    };
    // ─────────────────────────────────────────────────────────────────────────

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

            <div className="flex h-full flex-1 flex-col gap-3">
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

                <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg overflow-hidden dark:bg-slate-900">
                    <CardHeader className="border-b border-sidebar/5 p-3 pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-sidebar text-white shadow shadow-sidebar/20">
                                <CalendarClock className="h-4 w-4" />
                            </div>
                            Registro de Jornada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-xl border border-sidebar/10 dark:bg-slate-800/50">
                            <div className="space-y-0">
                                <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Acciones Rápidas</p>
                                <p className="text-[10px] font-medium text-slate-500 italic leading-none mt-1">Ficha entrada y salida con un clic.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    onClick={handleClockIn}
                                    disabled={Boolean(current_log?.clock_in && !current_log?.clock_out)}
                                    className="h-8 bg-sidebar text-white hover:bg-sidebar/90 rounded-lg px-4 text-[10px] font-black shadow shadow-sidebar/20 transition-all active:scale-95"
                                >
                                    Fichar Entrada
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleClockOut}
                                    disabled={!current_log?.clock_in || Boolean(current_log?.clock_out)}
                                    className="h-8 bg-rose-600 text-white hover:bg-rose-700 rounded-lg px-4 text-[10px] font-black shadow shadow-rose-600/20 transition-all active:scale-95"
                                >
                                    Fichar Salida
                                </Button>
                                <RequestAbsenceModal />
                            </div>
                        </div>

                        {(today_logs.length > 0 || current_log) && (
                            <div className="grid gap-8">
                                <div className="grid gap-2 md:grid-cols-3">
                                    <div className="flex flex-col gap-0 rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-sidebar leading-none">Entrada</p>
                                        <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{current_log?.clock_in ?? '--:--'}</p>
                                    </div>
                                    <div className="flex flex-col gap-0 rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-sidebar leading-none">Salida</p>
                                        <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{current_log?.clock_out ?? '--:--'}</p>
                                    </div>
                                    <div className="flex flex-col gap-0 rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-sidebar leading-none">Total Hoy</p>
                                        <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
                                            {today_total_hours > 0 ? formatHoursDecimal(today_total_hours) : '0m'}
                                        </p>
                                    </div>
                                </div>

                                {liveElapsed && (
                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sidebar/5 to-[#1f4f52]/5 p-3 border border-sidebar/10 backdrop-blur-sm">
                                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar text-white shadow shadow-sidebar/20">
                                                    <TimerReset className="h-4 w-4 animate-pulse" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-sidebar leading-none">En Curso</p>
                                                    <p className="text-2xl font-black tracking-tight text-sidebar leading-none mt-1">
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
                                                    className="flex items-center justify-between gap-2 rounded-lg border border-sidebar/10 bg-white px-3 py-2 shadow-sm hover:border-sidebar/30 transition-all dark:bg-slate-800"
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
                        <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900">
                            <CardHeader className="border-b border-sidebar/5 p-3 pb-2">
                                <CardTitle className="text-base font-black tracking-tight text-slate-800 dark:text-white">Registro Manual</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <form onSubmit={submitManualLog} className="space-y-3">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2" ref={internSearchRef}>
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-sidebar ml-1">Becario Asignado</Label>

                                            {/* Becario seleccionado */}
                                            {selectedIntern && !showInternDropdown && (
                                                <div
                                                    className="flex items-center justify-between h-11 px-4 rounded-2xl border border-sidebar/20 bg-card shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                                    onClick={() => { setInternSearch(''); setShowInternDropdown(true); }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-6 w-6 rounded-full bg-sidebar/20 flex items-center justify-center text-[10px] font-black text-sidebar">
                                                            {selectedIntern.name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{selectedIntern.name}</span>
                                                        {selectedIntern.education_center && (
                                                            <span className="text-[10px] text-slate-400 font-medium">· {selectedIntern.education_center}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cambiar</span>
                                                </div>
                                            )}

                                            {/* Campo de búsqueda */}
                                            {(!selectedIntern || showInternDropdown) && (
                                                <div className="relative">
                                                    <Input
                                                        autoFocus={showInternDropdown}
                                                        value={internSearch}
                                                        onChange={(e) => { setInternSearch(e.target.value); setShowInternDropdown(true); }}
                                                        onFocus={() => setShowInternDropdown(true)}
                                                        placeholder="Buscar becario por nombre o centro..."
                                                        className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm pl-10"
                                                    />
                                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

                                                    {showInternDropdown && (
                                                        <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 max-h-56 overflow-y-auto rounded-2xl border border-sidebar/20 bg-white dark:bg-slate-900 shadow-xl">
                                                            {filteredInterns.length > 0 ? (
                                                                filteredInterns.map((intern) => (
                                                                    <button
                                                                        key={intern.id}
                                                                        type="button"
                                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                                                        onClick={() => selectIntern(intern)}
                                                                    >
                                                                        <div className="h-8 w-8 shrink-0 rounded-full bg-sidebar/10 flex items-center justify-center text-xs font-black text-sidebar group-hover:bg-sidebar group-hover:text-white transition-colors">
                                                                            {intern.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{intern.name}</p>
                                                                            {intern.education_center && (
                                                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{intern.education_center}</p>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-slate-400 italic text-center py-6">Sin resultados para &ldquo;{internSearch}&rdquo;</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

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
                                        className="h-8 bg-sidebar text-white hover:bg-sidebar/90 rounded-lg px-6 text-[10px] font-black shadow shadow-sidebar/20 transition-all active:scale-95"
                                    >
                                        Guardar Registro
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900">
                            <CardHeader className="border-b border-sidebar/5 p-3 pb-2 bg-slate-50/30 dark:bg-slate-800/30">
                                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-sidebar/10 text-sidebar shadow-inner">
                                        <ShieldAlert className="h-4 w-4" />
                                    </div>
                                    Incumplimientos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2">
                                {non_compliant_interns.length > 0 ? (
                                    non_compliant_interns.map((intern) => (
                                        <div
                                            key={intern.id}
                                            className="group rounded-xl border border-sidebar/5 bg-slate-50/50 p-4 shadow-sm transition-all hover:bg-white hover:shadow-md dark:bg-slate-800/40 dark:border-slate-800"
                                        >
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-10 w-10 border-2 border-white shadow-md shrink-0 dark:border-slate-700">
                                                    <AvatarImage src={intern.avatar} alt={intern.name} />
                                                    <AvatarFallback className="text-xs font-black bg-sidebar/10 text-sidebar">
                                                        {intern.name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <p className="font-black text-slate-800 dark:text-white">{intern.name}</p>
                                                    <p className="text-sm font-medium text-slate-500 leading-snug dark:text-slate-400">
                                                        Deuda de horas: <span className="font-black text-sidebar dark:text-sidebar-foreground">{intern.debt}h</span> acumuladas.
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
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
                    <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="border-b border-sidebar/5 p-3 pb-2 bg-slate-50/30 dark:bg-slate-800/30">
                            <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-sidebar/10 text-sidebar shadow-inner">
                                    <FileText className="h-4 w-4" />
                                </div>
                                Mis Ausencias
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <div className="space-y-4">
                                {absences.length > 0 ? (
                                    absences.map((abs) => (
                                        <div key={abs.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sidebar/10 bg-slate-50/50 p-4 shadow-sm transition-all hover:bg-white hover:shadow-md dark:bg-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-inner ${abs.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        abs.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    <CalendarClock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{abs?.reason || 'Sin motivo'}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{abs?.date || '--'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full border shadow-sm ${abs.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        abs.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {abs.status === 'approved' ? 'Aprobada' :
                                                        abs.status === 'rejected' ? 'Denegada' : 'En espera'}
                                                </span>

                                                {abs.justification_url ? (
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-sidebar/10 hover:text-sidebar" asChild>
                                                            <a href={abs.justification_url} target="_blank" rel="noreferrer">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-sidebar/10 hover:text-sidebar" asChild>
                                                            <a href={abs.justification_url} download>
                                                                <Download className="h-4 w-4" />
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

                <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg overflow-hidden dark:bg-slate-900 p-2">
                    <CardContent className="p-0">
                        <div className="attendance-calendar rounded-lg border border-sidebar/10 bg-slate-50/50 p-2 shadow-inner transition-all dark:bg-slate-800/50">
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
                                contentHeight={500}
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
