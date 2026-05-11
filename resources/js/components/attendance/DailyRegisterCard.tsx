import {
    CalendarClock,
    ChevronsUpDown,
    Clock3,
    TimerReset,
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatHoursDecimal } from './time-format';
import type { TodayLog } from './types';

type Props = {
    todayLogs: TodayLog[];
    currentLog: TodayLog | null;
    todayTotalHours: number;
    liveElapsed: string | null;
    todayLogsOpen: boolean;
    onTodayLogsOpenChange: (open: boolean) => void;
};

export function DailyRegisterCard({
    todayLogs,
    currentLog,
    todayTotalHours,
    liveElapsed,
    todayLogsOpen,
    onTodayLogsOpenChange,
}: Props) {
    return (
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
                                    Accede al fichaje rápido arriba y deja aquí
                                    solo el resumen de hoy.
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="h-8 rounded-full border-sidebar/20 bg-white/85 px-3 text-[10px] font-black tracking-widest text-sidebar uppercase shadow-sm backdrop-blur-sm dark:bg-slate-900/85"
                            >
                                {currentLog
                                    ? 'Jornada en curso'
                                    : 'Sin fichaje activo'}
                            </Badge>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            <SummaryTile
                                label="Entrada"
                                value={currentLog?.clock_in ?? '--:--'}
                            />
                            <SummaryTile
                                label="Salida"
                                value={currentLog?.clock_out ?? '--:--'}
                            />
                            <SummaryTile
                                label="Total hoy"
                                value={
                                    todayTotalHours > 0
                                        ? formatHoursDecimal(todayTotalHours)
                                        : '0m'
                                }
                            />
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
                                            Contabilizando el tramo actual en
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
                                        No hay un tramo abierto ahora mismo.
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-500 italic dark:text-slate-400">
                                        Cuando fiches entrada, el contador en
                                        vivo aparecerá aquí.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {(todayLogs.length > 0 || currentLog) &&
                    todayLogs.length > 0 && (
                        <Collapsible
                            open={todayLogsOpen}
                            onOpenChange={onTodayLogsOpenChange}
                        >
                            <div className="rounded-xl border border-sidebar/10 bg-slate-50/60 p-2.5 dark:bg-slate-800/50">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="px-1">
                                        <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase dark:text-white">
                                            Tramos de hoy
                                        </h3>
                                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            {todayLogs.length} registros en la
                                            jornada actual.
                                        </p>
                                    </div>
                                    <CollapsibleTrigger asChild>
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
                                        {todayLogs.map((log) => (
                                            <div
                                                key={log.id}
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
                                                    {log.total_hours !== null
                                                        ? formatHoursDecimal(
                                                              log.total_hours,
                                                          )
                                                        : 'Procesando...'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    )}
            </CardContent>
        </Card>
    );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-sidebar/10 bg-white p-2 shadow-sm dark:bg-slate-800">
            <p className="text-[8px] leading-none font-black tracking-widest text-sidebar uppercase">
                {label}
            </p>
            <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-white">
                {value}
            </p>
        </div>
    );
}
