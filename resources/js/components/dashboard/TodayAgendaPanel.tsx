import {
    Clock,
    Calendar,
    Umbrella,
    Timer,
    PlayCircle,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight,
    CalendarPlus,
    CheckCircle2,
    UserCircle,
    Users,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { DashboardAgendaItem } from './types';

const AGENDA_ITEMS_PER_PAGE = 4;

interface TodayAgendaPanelProps {
    className?: string;
    todayAgenda: DashboardAgendaItem[];
    currentLog: {
        clock_in: string;
        elapsed_seconds: number;
    } | null;
    showWorkStatus?: boolean;
    onCreateEvent?: () => void;
}

export function TodayAgendaPanel({
    className,
    todayAgenda,
    currentLog,
    showWorkStatus = true,
    onCreateEvent,
}: TodayAgendaPanelProps) {
    const [seconds, setSeconds] = useState(currentLog?.elapsed_seconds || 0);
    const [agendaPage, setAgendaPage] = useState(1);
    const [selectedItem, setSelectedItem] =
        useState<DashboardAgendaItem | null>(null);
    const totalAgendaPages = Math.max(
        1,
        Math.ceil(todayAgenda.length / AGENDA_ITEMS_PER_PAGE),
    );
    const currentAgendaPage = Math.min(agendaPage, totalAgendaPages);
    const visibleAgenda = useMemo(
        () =>
            todayAgenda.slice(
                (currentAgendaPage - 1) * AGENDA_ITEMS_PER_PAGE,
                currentAgendaPage * AGENDA_ITEMS_PER_PAGE,
            ),
        [currentAgendaPage, todayAgenda],
    );

    useEffect(() => {
        if (!currentLog) return;

        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [currentLog]);

    useEffect(() => {
        setAgendaPage((currentPage) => Math.min(currentPage, totalAgendaPages));
    }, [totalAgendaPages]);

    const formatElapsed = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <Card
            className={cn(
                'group flex flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                className,
            )}
        >
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-400 bg-slate-200 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar to-sidebar-accent/90 text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm leading-tight font-black text-slate-800 dark:text-slate-100">
                            Mi Agenda de Hoy
                        </CardTitle>
                        <p className="mt-0.5 text-[11px] leading-none text-slate-500">
                            Eventos, reuniones y ausencias previstas.
                        </p>
                    </div>
                </div>
                <span className="rounded-md border border-sidebar/20 bg-white/80 px-2 py-0.5 text-[10px] font-black tracking-widest text-sidebar uppercase dark:border-slate-700 dark:bg-slate-900">
                    {new Date().toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                    })}
                </span>
            </CardHeader>

            <div className="flex flex-1 flex-col gap-2.5 bg-slate-50/60 px-4 pt-3 pb-4 dark:bg-slate-950/20">
                {showWorkStatus && (
                    <div className="relative overflow-hidden rounded-xl border border-l-2 border-slate-300 border-l-sidebar bg-white p-3.5 text-slate-900 shadow-sm dark:border-slate-700 dark:border-l-teal-400 dark:bg-slate-900 dark:text-white">
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black tracking-[0.2em] text-sidebar uppercase dark:text-teal-100">
                                    Estado de Jornada
                                </p>
                                {currentLog ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black">
                                            {formatElapsed(seconds)}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">
                                            trabajando
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-xl font-black">
                                        Fuera de servicio
                                    </p>
                                )}
                            </div>
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-white shadow-sm',
                                    currentLog && 'animate-pulse',
                                )}
                            >
                                {currentLog ? (
                                    <Timer className="h-5 w-5" />
                                ) : (
                                    <PlayCircle className="h-5 w-5" />
                                )}
                            </div>
                        </div>
                        {currentLog && (
                            <div className="relative z-10 mt-2 flex items-center gap-2 rounded-lg border border-sidebar/10 bg-white px-2.5 py-1.5 text-[11px] font-bold text-sidebar dark:bg-slate-900 dark:text-teal-100">
                                <Clock className="h-3.5 w-3.5" />
                                Entrada registrada a las{' '}
                                {currentLog.clock_in.substring(0, 5)}
                            </div>
                        )}
                        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-sidebar/5" />
                    </div>
                )}

                {/* Lista de Tareas/Eventos */}
                <div className="flex flex-1 flex-col gap-2 overflow-hidden">
                    <div className="ml-1 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black tracking-widest text-sidebar uppercase">
                            Eventos y Ausencias
                        </p>
                        {onCreateEvent && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={onCreateEvent}
                                className="h-7 rounded-lg bg-sidebar px-2.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm hover:bg-sidebar/90"
                            >
                                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                                Nuevo
                            </Button>
                        )}
                    </div>

                    {todayAgenda.length > 0 ? (
                        <>
                            <div
                                className={cn(
                                    'space-y-2.5 overflow-hidden pr-1',
                                    showWorkStatus
                                        ? 'min-h-[204px]'
                                        : 'min-h-[338px]',
                                )}
                            >
                                {visibleAgenda.map((item, idx) => (
                                    <button
                                        type="button"
                                        key={`${currentAgendaPage}-${idx}`}
                                        onClick={() => setSelectedItem(item)}
                                        className="group flex w-full items-center gap-3.5 rounded-lg border border-l-2 border-slate-300 border-l-sidebar bg-white p-2.5 text-left shadow-sm transition-all hover:border-slate-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar/30 dark:border-slate-700 dark:border-l-teal-400 dark:bg-slate-900"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar text-white shadow-sm">
                                            {item.type === 'event' ? (
                                                <Calendar className="h-[18px] w-[18px]" />
                                            ) : (
                                                <Umbrella className="h-[18px] w-[18px]" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[13px] font-bold text-slate-800 dark:text-slate-200">
                                                {item.title}
                                                {item.creator && (
                                                    <span className="ml-1.5 text-[10px] font-medium text-slate-400">
                                                        por {item.creator}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-500">
                                                {item.time}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {totalAgendaPages > 1 && (
                                <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                                    <span className="text-[10px] font-medium text-slate-500">
                                        {visibleAgenda.length} de{' '}
                                        {todayAgenda.length}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            aria-label="Ver página anterior de la agenda"
                                            className="h-7 w-7 border-sidebar bg-sidebar text-white hover:bg-sidebar/90 disabled:border-sidebar/20 disabled:bg-sidebar/10 disabled:text-sidebar/40"
                                            disabled={currentAgendaPage === 1}
                                            onClick={() =>
                                                setAgendaPage((page) =>
                                                    Math.max(1, page - 1),
                                                )
                                            }
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </Button>
                                        <span className="w-12 text-center text-[10px] font-bold text-slate-500">
                                            {currentAgendaPage}/
                                            {totalAgendaPages}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            aria-label="Ver página siguiente de la agenda"
                                            className="h-7 w-7 border-sidebar bg-sidebar text-white hover:bg-sidebar/90 disabled:border-sidebar/20 disabled:bg-sidebar/10 disabled:text-sidebar/40"
                                            disabled={
                                                currentAgendaPage ===
                                                totalAgendaPages
                                            }
                                            onClick={() =>
                                                setAgendaPage((page) =>
                                                    Math.min(
                                                        totalAgendaPages,
                                                        page + 1,
                                                    ),
                                                )
                                            }
                                        >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="mb-2 rounded-full bg-slate-50 p-3 dark:bg-slate-800">
                                <ClipboardCheck className="h-5 w-5 text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">
                                No tienes nada planeado para hoy
                            </p>
                            <p className="text-[10px] text-slate-400/70">
                                ¡Día despejado!
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <AgendaDetailModal
                item={selectedItem}
                onOpenChange={(open) => !open && setSelectedItem(null)}
            />
        </Card>
    );
}

function AgendaDetailModal({
    item,
    onOpenChange,
}: {
    item: DashboardAgendaItem | null;
    onOpenChange: (open: boolean) => void;
}) {
    const attendees = item?.attendees ?? [];
    const isEvent = item?.type === 'event';
    const [processingStatus, setProcessingStatus] = useState<
        'accepted' | 'rejected' | null
    >(null);

    const respondToEvent = (status: 'accepted' | 'rejected') => {
        if (!item?.id) return;

        setProcessingStatus(status);

        router.patch(
            `/calendar-events/${item.id}/attendance`,
            { attendance_status: status },
            {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
                onFinish: () => setProcessingStatus(null),
            },
        );
    };

    return (
        <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
                {item && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="pr-8 text-xl font-black">
                                {item.title}
                            </DialogTitle>
                            <DialogDescription>
                                {isEvent
                                    ? 'Detalle del evento programado para hoy.'
                                    : 'Detalle de la ausencia registrada para hoy.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {item.description && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                    {item.description}
                                </div>
                            )}

                            <div className="grid gap-2 sm:grid-cols-2">
                                <AgendaDetailRow
                                    icon={Clock}
                                    label="Horario"
                                    value={item.time}
                                />
                                <AgendaDetailRow
                                    icon={CheckCircle2}
                                    label="Asistencia"
                                    value={
                                        item.attendance_status ??
                                        'Pendiente de confirmación'
                                    }
                                />
                                {item.creator && (
                                    <AgendaDetailRow
                                        icon={UserCircle}
                                        label="Creado por"
                                        value={item.creator}
                                    />
                                )}
                                <AgendaDetailRow
                                    icon={Calendar}
                                    label="Fecha"
                                    value={[
                                        item.start_date,
                                        item.end_date &&
                                        item.end_date !== item.start_date
                                            ? item.end_date
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(' - ')}
                                />
                            </div>

                            {isEvent && item.can_respond && (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sidebar/15 bg-sidebar/5 p-3">
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">
                                            Confirmación de asistencia
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Estado actual:{' '}
                                            {item.attendance_status ??
                                                'Pendiente de confirmación'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={
                                                processingStatus !== null ||
                                                item.attendance_status_value ===
                                                    'accepted'
                                            }
                                            onClick={() =>
                                                respondToEvent('accepted')
                                            }
                                            className="h-8 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                                        >
                                            {processingStatus === 'accepted'
                                                ? 'Aceptando...'
                                                : 'Aceptar'}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={
                                                processingStatus !== null ||
                                                item.attendance_status_value ===
                                                    'rejected'
                                            }
                                            onClick={() =>
                                                respondToEvent('rejected')
                                            }
                                            className="h-8 border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            {processingStatus === 'rejected'
                                                ? 'Rechazando...'
                                                : 'Rechazar'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {isEvent && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100">
                                        <Users className="h-4 w-4 text-sidebar" />
                                        Integrantes
                                    </div>
                                    {attendees.length > 0 ? (
                                        <div className="space-y-2">
                                            {attendees.map((attendee) => (
                                                <div
                                                    key={attendee.id}
                                                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={
                                                                    attendee.avatar ??
                                                                    undefined
                                                                }
                                                                alt={
                                                                    attendee.name
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {attendee.name
                                                                    .slice(
                                                                        0,
                                                                        2,
                                                                    )
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                                {attendee.name}
                                                            </p>
                                                            {attendee.email && (
                                                                <p className="truncate text-xs text-slate-500">
                                                                    {
                                                                        attendee.email
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 rounded-md border border-sidebar/20 bg-sidebar/5 px-2 py-1 text-[10px] font-bold text-sidebar">
                                                        {attendee.attendance_status ??
                                                            'Pendiente'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-800">
                                            No hay integrantes invitados.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function AgendaDetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Clock;
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar text-white">
                <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    {label}
                </p>
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                    {value || 'No especificado'}
                </p>
            </div>
        </div>
    );
}
