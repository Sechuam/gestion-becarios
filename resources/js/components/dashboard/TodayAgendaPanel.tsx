import {
    Clock,
    Calendar,
    Umbrella,
    Timer,
    PlayCircle,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AGENDA_ITEMS_PER_PAGE = 4;

interface AgendaItem {
    type: 'event' | 'absence';
    title: string;
    time: string;
    color: string;
    creator?: string | null;
}

interface TodayAgendaPanelProps {
    className?: string;
    todayAgenda: AgendaItem[];
    currentLog: {
        clock_in: string;
        elapsed_seconds: number;
    } | null;
}

export function TodayAgendaPanel({
    className,
    todayAgenda,
    currentLog,
}: TodayAgendaPanelProps) {
    const [seconds, setSeconds] = useState(currentLog?.elapsed_seconds || 0);
    const [agendaPage, setAgendaPage] = useState(1);
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
                {/* Estado de Jornada */}
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
                    {/* Decoración fondo */}
                    <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-sidebar/5" />
                </div>

                {/* Lista de Tareas/Eventos */}
                <div className="flex flex-1 flex-col gap-2 overflow-hidden">
                    <div className="ml-1 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black tracking-widest text-sidebar uppercase">
                            Eventos y Ausencias
                        </p>
                    </div>

                    {todayAgenda.length > 0 ? (
                        <>
                            <div className="min-h-[204px] space-y-2.5 overflow-hidden pr-1">
                                {visibleAgenda.map((item, idx) => (
                                    <div
                                        key={`${currentAgendaPage}-${idx}`}
                                        className="group flex items-center gap-3.5 rounded-lg border border-l-2 border-slate-300 border-l-sidebar bg-white p-2.5 shadow-sm transition-all hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:border-l-teal-400 dark:bg-slate-900"
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
                                    </div>
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
        </Card>
    );
}
