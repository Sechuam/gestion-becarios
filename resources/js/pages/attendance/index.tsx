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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    CalendarClock,
    AlertTriangle,
    Clock3,
    ShieldAlert,
    TimerReset,
    FilePlus,
    ExternalLink,
    FileText,
    Download,
    ChevronsUpDown,
} from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Control horario', href: '/asistencia' },
];

const ABSENCES_PER_PAGE = 5;

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
    const [todayLogsOpen, setTodayLogsOpen] = useState(
        () => today_logs.length <= 2,
    );
    const [absencePage, setAbsencePage] = useState(1);

    // ── Búsqueda de becarios ──────────────────────────────────────────────────
    const [internSearch, setInternSearch] = useState('');
    const [showInternDropdown, setShowInternDropdown] = useState(false);
    const internSearchRef = useRef<HTMLDivElement>(null);

    const filteredInterns = (manageable_interns ?? []).filter(
        (i) =>
            i.name.toLowerCase().includes(internSearch.toLowerCase()) ||
            (i.education_center ?? '')
                .toLowerCase()
                .includes(internSearch.toLowerCase()),
    );

    const selectedIntern = (manageable_interns ?? []).find(
        (i) => String(i.id) === manualForm.data.intern_id,
    );

    const totalAbsencePages = Math.max(
        1,
        Math.ceil((absences?.length ?? 0) / ABSENCES_PER_PAGE),
    );
    const paginatedAbsences = (absences ?? []).slice(
        (absencePage - 1) * ABSENCES_PER_PAGE,
        absencePage * ABSENCES_PER_PAGE,
    );
    const absenceRangeStart =
        absences.length > 0 ? (absencePage - 1) * ABSENCES_PER_PAGE + 1 : 0;
    const absenceRangeEnd = Math.min(
        absencePage * ABSENCES_PER_PAGE,
        absences.length,
    );

    useEffect(() => {
        setAbsencePage((currentPage) =>
            Math.min(currentPage, totalAbsencePages),
        );
    }, [totalAbsencePages]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                internSearchRef.current &&
                !internSearchRef.current.contains(e.target as Node)
            ) {
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
                manualForm.setData(
                    'date',
                    new Date().toISOString().split('T')[0],
                );
            },
        });
    };

    const handleUploadJustification = (absenceId: number, file: File) => {
        router.post(
            `/absences/${absenceId}/justification`,
            {
                justification_file: file,
            },
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
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
                            value:
                                today_total_hours > 0
                                    ? formatHoursDecimal(today_total_hours)
                                    : '0m',
                            hint: 'Suma de horas del día',
                        },
                        {
                            label: 'Jornada activa',
                            value: current_log ? 'Sí' : 'No',
                            hint: current_log
                                ? 'Hay un tramo abierto en curso'
                                : 'No hay fichaje activo',
                        },
                    ]}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <HeaderActionButton
                                label="Fichar Entrada"
                                onClick={handleClockIn}
                                icon={<Clock3 className="mr-1.5 h-4 w-4" />}
                                className={cn(
                                    current_log?.clock_in &&
                                        !current_log?.clock_out &&
                                        'pointer-events-none opacity-50',
                                )}
                            />
                            <HeaderActionButton
                                label="Fichar Salida"
                                onClick={handleClockOut}
                                icon={<Clock3 className="mr-1.5 h-4 w-4" />}
                                className={cn(
                                    (!current_log?.clock_in ||
                                        current_log?.clock_out) &&
                                        'pointer-events-none opacity-50',
                                )}
                            />
                            <RequestAbsenceModal />
                        </div>
                    }
                />

                <Tabs defaultValue="registro" className="space-y-3">
                    <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-xl border border-sidebar/10 bg-white p-1 shadow-sm sm:grid-cols-3 dark:bg-slate-900">
                        <TabsTrigger
                            value="registro"
                            className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-sidebar data-[state=active]:text-white"
                        >
                            <Clock3 className="mr-2 h-4 w-4" />
                            Registro de jornada
                        </TabsTrigger>
                        <TabsTrigger
                            value="ausencias"
                            className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-sidebar data-[state=active]:text-white"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Mis ausencias
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendario"
                            className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-sidebar data-[state=active]:text-white"
                        >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Calendario
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="registro" className="mt-0 space-y-3">
                        <Card className="overflow-hidden rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900">
                            <CardHeader className="border-b border-sidebar/5 p-3 pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-sidebar text-white shadow shadow-sidebar/20">
                                        <CalendarClock className="h-4 w-4" />
                                    </div>
                                    Registro de Jornada
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-3">
                                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
                                    <div className="rounded-xl border border-sidebar/20 bg-gradient-to-r from-sidebar/8 to-[#1f4f52]/8 p-3 dark:from-sidebar/15 dark:to-[#1f4f52]/15">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black tracking-widest text-slate-800 uppercase dark:text-white">
                                                    Monitor de actividad
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-500 italic dark:text-slate-400">
                                                    Accede al fichaje rápido
                                                    arriba y deja aquí solo el
                                                    resumen de hoy.
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="h-8 rounded-full border-sidebar/20 bg-white/85 px-3 text-[10px] font-black tracking-widest text-sidebar uppercase shadow-sm backdrop-blur-sm dark:bg-slate-900/85"
                                            >
                                                {current_log
                                                    ? 'Jornada en curso'
                                                    : 'Sin fichaje activo'}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                            <div className="rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
                                                <p className="text-[8px] leading-none font-black tracking-widest text-sidebar uppercase">
                                                    Entrada
                                                </p>
                                                <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-white">
                                                    {current_log?.clock_in ??
                                                        '--:--'}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
                                                <p className="text-[8px] leading-none font-black tracking-widest text-sidebar uppercase">
                                                    Salida
                                                </p>
                                                <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-white">
                                                    {current_log?.clock_out ??
                                                        '--:--'}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
                                                <p className="text-[8px] leading-none font-black tracking-widest text-sidebar uppercase">
                                                    Total hoy
                                                </p>
                                                <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-white">
                                                    {today_total_hours > 0
                                                        ? formatHoursDecimal(
                                                              today_total_hours,
                                                          )
                                                        : '0m'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-sidebar/20 bg-gradient-to-r from-sidebar/10 to-[#1f4f52]/10 p-3 shadow-sm dark:bg-slate-800/80 dark:from-sidebar/15 dark:to-[#1f4f52]/15">
                                        {liveElapsed ? (
                                            <div className="relative overflow-hidden rounded-xl border border-sidebar/10 bg-gradient-to-r from-sidebar/5 to-[#1f4f52]/5 p-3 backdrop-blur-sm">
                                                <div className="relative flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar text-white shadow shadow-sidebar/20">
                                                        <TimerReset className="h-4 w-4 animate-pulse" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[8px] leading-none font-black tracking-[0.2em] text-sidebar uppercase">
                                                            En curso
                                                        </p>
                                                        <p className="mt-1 text-2xl leading-none font-black tracking-tight text-sidebar">
                                                            {liveElapsed}
                                                        </p>
                                                        <p className="mt-1 text-[11px] font-medium text-sidebar/70 italic">
                                                            Contabilizando el
                                                            tramo actual en
                                                            tiempo real.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex h-full min-h-28 items-center rounded-xl border border-dashed border-sidebar/15 bg-slate-50/60 px-4 py-3 dark:bg-slate-900/30">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] leading-none font-black tracking-[0.2em] text-sidebar uppercase">
                                                        Estado actual
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                        No hay un tramo abierto
                                                        ahora mismo.
                                                    </p>
                                                    <p className="text-[11px] font-medium text-slate-500 italic dark:text-slate-400">
                                                        Cuando fiches entrada,
                                                        el contador en vivo
                                                        aparecerá aquí.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(today_logs.length > 0 || current_log) && (
                                    <div className="grid gap-3">
                                        {today_logs.length > 0 && (
                                            <Collapsible
                                                open={todayLogsOpen}
                                                onOpenChange={setTodayLogsOpen}
                                            >
                                                <div className="rounded-xl border border-sidebar/10 bg-slate-50/60 p-2.5 dark:bg-slate-800/50">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="px-1">
                                                            <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase dark:text-white">
                                                                Tramos de hoy
                                                            </h3>
                                                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                                {
                                                                    today_logs.length
                                                                }{' '}
                                                                registros en la
                                                                jornada actual.
                                                            </p>
                                                        </div>
                                                        <CollapsibleTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 rounded-full border-sidebar/20 bg-white px-3 text-[10px] font-black tracking-widest text-sidebar uppercase hover:bg-slate-50 dark:bg-slate-900"
                                                            >
                                                                {todayLogsOpen
                                                                    ? 'Ocultar detalle'
                                                                    : 'Ver detalle'}
                                                                <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5" />
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </div>
                                                    <CollapsibleContent className="pt-3">
                                                        <div className="grid max-h-64 gap-3 overflow-y-auto pr-1">
                                                            {today_logs.map(
                                                                (log) => (
                                                                    <div
                                                                        key={
                                                                            log.id
                                                                        }
                                                                        className="flex items-center justify-between gap-2 rounded-lg border border-sidebar/10 bg-white px-3 py-2 shadow-sm transition-all hover:border-sidebar/30 dark:bg-slate-800"
                                                                    >
                                                                        <div className="flex min-w-0 items-center gap-3">
                                                                            <Clock3 className="h-4 w-4 shrink-0 text-sidebar/50" />
                                                                            <span className="truncate font-bold text-slate-700 dark:text-slate-200">
                                                                                {log.clock_in ??
                                                                                    '--:--'}{' '}
                                                                                <span className="mx-2 text-slate-300">
                                                                                    →
                                                                                </span>{' '}
                                                                                {log.clock_out ??
                                                                                    'En curso'}
                                                                            </span>
                                                                        </div>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="h-8 shrink-0 rounded-full border-sidebar/20 bg-slate-50 px-4 text-[10px] font-black tracking-widest text-sidebar uppercase"
                                                                        >
                                                                            {log.total_hours !==
                                                                            null
                                                                                ? formatHoursDecimal(
                                                                                      log.total_hours,
                                                                                  )
                                                                                : 'Procesando...'}
                                                                        </Badge>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </CollapsibleContent>
                                                </div>
                                            </Collapsible>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {can_manage_attendance && (
                            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900">
                                    <CardHeader className="border-b border-sidebar/5 p-3 pb-2">
                                        <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow shadow-sidebar/20">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            Registro Manual
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <form
                                            onSubmit={submitManualLog}
                                            className="space-y-3"
                                        >
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div
                                                    className="space-y-2"
                                                    ref={internSearchRef}
                                                >
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Becario Asignado
                                                    </Label>

                                                    {/* Becario seleccionado */}
                                                    {selectedIntern &&
                                                        !showInternDropdown && (
                                                            <div
                                                                className="flex h-11 cursor-pointer items-center justify-between rounded-2xl border border-sidebar/20 bg-card px-4 shadow-sm transition-colors hover:bg-slate-50"
                                                                onClick={() => {
                                                                    setInternSearch(
                                                                        '',
                                                                    );
                                                                    setShowInternDropdown(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/20 text-[10px] font-black text-sidebar">
                                                                        {selectedIntern.name.charAt(
                                                                            0,
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                                        {
                                                                            selectedIntern.name
                                                                        }
                                                                    </span>
                                                                    {selectedIntern.education_center && (
                                                                        <span className="text-[10px] font-medium text-slate-400">
                                                                            ·{' '}
                                                                            {
                                                                                selectedIntern.education_center
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                                    Cambiar
                                                                </span>
                                                            </div>
                                                        )}

                                                    {/* Campo de búsqueda */}
                                                    {(!selectedIntern ||
                                                        showInternDropdown) && (
                                                        <div className="relative">
                                                            <Input
                                                                autoFocus={
                                                                    showInternDropdown
                                                                }
                                                                value={
                                                                    internSearch
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setInternSearch(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    setShowInternDropdown(
                                                                        true,
                                                                    );
                                                                }}
                                                                onFocus={() =>
                                                                    setShowInternDropdown(
                                                                        true,
                                                                    )
                                                                }
                                                                placeholder="Buscar becario por nombre o centro..."
                                                                className="h-11 rounded-2xl border-sidebar/20 bg-card pl-10 text-foreground shadow-sm"
                                                            />
                                                            <svg
                                                                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                />
                                                            </svg>

                                                            {showInternDropdown && (
                                                                <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-50 max-h-56 overflow-y-auto rounded-2xl border border-sidebar/20 bg-white shadow-xl dark:bg-slate-900">
                                                                    {filteredInterns.length >
                                                                    0 ? (
                                                                        filteredInterns.map(
                                                                            (
                                                                                intern,
                                                                            ) => (
                                                                                <button
                                                                                    key={
                                                                                        intern.id
                                                                                    }
                                                                                    type="button"
                                                                                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                                    onClick={() =>
                                                                                        selectIntern(
                                                                                            intern,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar/10 text-xs font-black text-sidebar transition-colors group-hover:bg-sidebar group-hover:text-white">
                                                                                        {intern.name.charAt(
                                                                                            0,
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm leading-none font-bold text-slate-800 dark:text-white">
                                                                                            {
                                                                                                intern.name
                                                                                            }
                                                                                        </p>
                                                                                        {intern.education_center && (
                                                                                            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                                                                                {
                                                                                                    intern.education_center
                                                                                                }
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </button>
                                                                            ),
                                                                        )
                                                                    ) : (
                                                                        <p className="py-6 text-center text-sm text-slate-400 italic">
                                                                            Sin
                                                                            resultados
                                                                            para
                                                                            &ldquo;
                                                                            {
                                                                                internSearch
                                                                            }
                                                                            &rdquo;
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {manualForm.errors
                                                        .intern_id && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors
                                                                    .intern_id
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Fecha de Registro
                                                    </Label>
                                                    <DatePicker
                                                        className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                        value={
                                                            manualForm.data.date
                                                        }
                                                        onChange={(value) =>
                                                            manualForm.setData(
                                                                'date',
                                                                value,
                                                            )
                                                        }
                                                    />
                                                    {manualForm.errors.date && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors.date
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Hora de Entrada
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                        value={
                                                            manualForm.data
                                                                .clock_in
                                                        }
                                                        onChange={(e) =>
                                                            manualForm.setData(
                                                                'clock_in',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {manualForm.errors
                                                        .clock_in && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors
                                                                    .clock_in
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Hora de Salida
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                        value={
                                                            manualForm.data
                                                                .clock_out
                                                        }
                                                        onChange={(e) =>
                                                            manualForm.setData(
                                                                'clock_out',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {manualForm.errors
                                                        .clock_out && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors
                                                                    .clock_out
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                    Notas y Observaciones
                                                </Label>
                                                <Input
                                                    className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                    value={
                                                        manualForm.data.notes
                                                    }
                                                    onChange={(e) =>
                                                        manualForm.setData(
                                                            'notes',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Motivo del ajuste o comentario aclaratorio..."
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={
                                                    manualForm.processing ||
                                                    !manualForm.data.intern_id
                                                }
                                                className="h-8 rounded-lg bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 text-[10px] font-black text-white shadow shadow-sidebar/20 transition-all hover:opacity-95 active:scale-95"
                                            >
                                                Guardar Registro
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg xl:max-h-[34rem] dark:bg-slate-900">
                                    <CardHeader className="border-b border-sidebar/5 bg-slate-50/30 p-3 pb-2 dark:bg-slate-800/30">
                                        <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow shadow-sidebar/20">
                                                <ShieldAlert className="h-4 w-4" />
                                            </div>
                                            Incumplimientos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 overflow-y-auto p-3 xl:max-h-[29rem]">
                                        {non_compliant_interns.length > 0 ? (
                                            non_compliant_interns.map(
                                                (intern) => (
                                                    <div
                                                        key={intern.id}
                                                        className="group rounded-xl border border-sidebar/5 bg-slate-50/50 p-4 shadow-sm transition-all hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-md dark:border-slate-700">
                                                                <AvatarImage
                                                                    src={
                                                                        intern.avatar
                                                                    }
                                                                    alt={
                                                                        intern.name
                                                                    }
                                                                />
                                                                <AvatarFallback className="bg-sidebar/10 text-xs font-black text-sidebar">
                                                                    {intern.name?.charAt(
                                                                        0,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1">
                                                                <p className="font-black text-slate-800 dark:text-white">
                                                                    {
                                                                        intern.name
                                                                    }
                                                                </p>
                                                                <p className="text-sm leading-snug font-medium text-slate-500 dark:text-slate-400">
                                                                    Deuda de
                                                                    horas:{' '}
                                                                    <span className="font-black text-sidebar dark:text-sidebar-foreground">
                                                                        {
                                                                            intern.debt
                                                                        }
                                                                        h
                                                                    </span>{' '}
                                                                    acumuladas.
                                                                </p>
                                                                <div className="mt-2 flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                                                    <span className="rounded-full border border-sidebar/15 bg-gradient-to-r from-sidebar/10 to-[#1f4f52]/10 px-3 py-1 text-sidebar dark:text-white">
                                                                        Progreso:{' '}
                                                                        {
                                                                            intern.total_done
                                                                        }
                                                                        h /{' '}
                                                                        {
                                                                            intern.expected_hours
                                                                        }
                                                                        h
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                                                <p className="text-sm font-medium text-slate-500 italic">
                                                    No hay becarios con deuda
                                                    horaria crítica en este
                                                    momento. <br /> El
                                                    cumplimiento es óptimo en la
                                                    red.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    {/* SECCIÓN MIS AUSENCIAS PARA EL BECARIO */}
                    <TabsContent value="ausencias" className="mt-0">
                        {absences && Array.isArray(absences) && (
                            <Card className="overflow-hidden rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900">
                                <CardHeader className="border-b border-sidebar/5 bg-slate-50/30 p-3 pb-2 dark:bg-slate-800/30">
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
                                            paginatedAbsences.map((abs) => (
                                                <div
                                                    key={abs.id}
                                                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sidebar/10 bg-slate-50/50 p-4 shadow-sm transition-all hover:bg-white hover:shadow-md dark:bg-slate-800"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-inner ${
                                                                abs.status ===
                                                                'approved'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : abs.status ===
                                                                        'rejected'
                                                                      ? 'bg-rose-100 text-rose-700'
                                                                      : 'bg-amber-100 text-amber-700'
                                                            }`}
                                                        >
                                                            <CalendarClock className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm leading-none font-black text-slate-800 dark:text-white">
                                                                {abs?.reason ||
                                                                    'Sin motivo'}
                                                            </p>
                                                            <p className="mt-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                                {abs?.date ||
                                                                    '--'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase shadow-sm ${
                                                                abs.status ===
                                                                'approved'
                                                                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                                                    : abs.status ===
                                                                        'rejected'
                                                                      ? 'border-rose-100 bg-rose-50 text-rose-700'
                                                                      : 'border-amber-100 bg-amber-50 text-amber-700'
                                                            }`}
                                                        >
                                                            {abs.status ===
                                                            'approved'
                                                                ? 'Aprobada'
                                                                : abs.status ===
                                                                    'rejected'
                                                                  ? 'Denegada'
                                                                  : 'En espera'}
                                                        </span>

                                                        {abs.justification_url ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:bg-sidebar/10 hover:text-sidebar"
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={
                                                                            abs.justification_url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:bg-sidebar/10 hover:text-sidebar"
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={
                                                                            abs.justification_url
                                                                        }
                                                                        download
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="relative">
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const file =
                                                                            e
                                                                                .target
                                                                                .files?.[0];
                                                                        if (
                                                                            file
                                                                        )
                                                                            handleUploadJustification(
                                                                                abs.id,
                                                                                file,
                                                                            );
                                                                    }}
                                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    className="h-10 gap-2 rounded-xl border-sidebar/20 bg-white text-xs font-black tracking-widest text-[#1f4f52] uppercase shadow-sm hover:bg-slate-50"
                                                                >
                                                                    <FilePlus className="h-4 w-4" />
                                                                    Adjuntar PDF
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                                                <p className="text-sm font-medium text-slate-500 italic">
                                                    No tienes ausencias
                                                    registradas recientemente.
                                                </p>
                                            </div>
                                        )}
                                        {absences.length >
                                            ABSENCES_PER_PAGE && (
                                            <div className="flex flex-col gap-3 rounded-xl border border-sidebar/10 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800">
                                                <p className="text-xs font-bold text-slate-500">
                                                    Mostrando{' '}
                                                    <span className="text-sidebar">
                                                        {absenceRangeStart}
                                                    </span>{' '}
                                                    -{' '}
                                                    <span className="text-sidebar">
                                                        {absenceRangeEnd}
                                                    </span>{' '}
                                                    de {absences.length}{' '}
                                                    ausencias
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 rounded-lg"
                                                        disabled={
                                                            absencePage === 1
                                                        }
                                                        onClick={() =>
                                                            setAbsencePage(
                                                                (page) =>
                                                                    Math.max(
                                                                        1,
                                                                        page -
                                                                            1,
                                                                    ),
                                                            )
                                                        }
                                                    >
                                                        Anterior
                                                    </Button>
                                                    <span className="min-w-16 text-center text-xs font-black text-slate-500">
                                                        {absencePage} /{' '}
                                                        {totalAbsencePages}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 rounded-lg"
                                                        disabled={
                                                            absencePage ===
                                                            totalAbsencePages
                                                        }
                                                        onClick={() =>
                                                            setAbsencePage(
                                                                (page) =>
                                                                    Math.min(
                                                                        totalAbsencePages,
                                                                        page +
                                                                            1,
                                                                    ),
                                                            )
                                                        }
                                                    >
                                                        Siguiente
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="calendario" className="mt-0">
                        <Card className="overflow-hidden rounded-xl border-sidebar/10 bg-white p-2 shadow-lg dark:bg-slate-900">
                            <CardContent className="p-0">
                                <div className="attendance-calendar rounded-lg border border-sidebar/10 bg-slate-50/50 p-2 shadow-inner transition-all dark:bg-slate-800/50">
                                    <FullCalendar
                                        plugins={[
                                            dayGridPlugin,
                                            timeGridPlugin,
                                            interactionPlugin,
                                        ]}
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
                                        eventClassNames={() => [
                                            'attendance-calendar-event',
                                        ]}
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
                                <style>{`
                            .attendance-calendar .fc .fc-button {
                                background: linear-gradient(90deg, var(--sidebar) 0%, #1f4f52 100%);
                                border-color: transparent;
                                color: white;
                                box-shadow: 0 8px 24px rgba(31, 79, 82, 0.18);
                            }

                            .attendance-calendar .fc .fc-button:hover,
                            .attendance-calendar .fc .fc-button:focus {
                                opacity: 0.95;
                                box-shadow: 0 10px 28px rgba(31, 79, 82, 0.24);
                            }

                            .attendance-calendar .fc .fc-button:disabled {
                                opacity: 0.55;
                                box-shadow: none;
                            }

                            .attendance-calendar .fc .fc-button-primary:not(:disabled).fc-button-active,
                            .attendance-calendar .fc .fc-button-primary:not(:disabled):active {
                                background: linear-gradient(90deg, #163c42 0%, #1f4f52 100%);
                                border-color: transparent;
                            }
                        `}</style>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
