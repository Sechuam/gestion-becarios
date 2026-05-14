import { CalendarClock, TimerReset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatHoursDecimal } from './time-format';
import { SummaryTile } from './SummaryTile';
import { TodayLogsSection } from './TodayLogsSection';
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
            <CardHeader className="border-b border-slate-400 bg-slate-200 p-3 pb-2 dark:border-slate-600 dark:bg-slate-700">
                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-sidebar shadow-sm ring-1 ring-sidebar/10 dark:bg-slate-900">
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

                <TodayLogsSection
                    todayLogs={todayLogs}
                    todayLogsOpen={todayLogsOpen}
                    onTodayLogsOpenChange={onTodayLogsOpenChange}
                />
            </CardContent>
        </Card>
    );
}
