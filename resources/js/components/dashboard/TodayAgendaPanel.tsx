import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Umbrella, Timer, PlayCircle, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function TodayAgendaPanel({ className, todayAgenda, currentLog }: TodayAgendaPanelProps) {
    const [seconds, setSeconds] = useState(currentLog?.elapsed_seconds || 0);

    useEffect(() => {
        if (!currentLog) return;
        
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [currentLog]);

    const formatElapsed = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <Card className={cn("flex flex-col overflow-hidden border-sidebar/15 bg-white shadow-sm dark:bg-slate-900", className)}>
            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-sidebar/5 px-2.5 py-1.5 dark:bg-sidebar/10">
                <div>
                    <CardTitle className="text-sm font-black text-sidebar dark:text-teal-100">
                        Mi Agenda de Hoy
                    </CardTitle>
                    <p className="text-[11px] leading-4 text-slate-500">
                        Eventos, reuniones y ausencias previstas.
                    </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/70 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-sidebar/10">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
            </CardHeader>

            <div className="flex flex-1 flex-col gap-4 p-5">
                {/* Estado de Jornada */}
                <div className="relative overflow-hidden rounded-2xl bg-[#1f4f52] p-5 text-white shadow-lg shadow-[#1f4f52]/20">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Estado de Jornada</p>
                            {currentLog ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black">{formatElapsed(seconds)}</span>
                                    <span className="text-xs font-medium text-white/80">trabajando</span>
                                </div>
                            ) : (
                                <p className="text-xl font-black">Fuera de servicio</p>
                            )}
                        </div>
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm",
                            currentLog && "animate-pulse"
                        )}>
                            {currentLog ? <Timer className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                        </div>
                    </div>
                    {currentLog && (
                        <div className="relative z-10 mt-4 flex items-center gap-2 rounded-lg bg-black/10 px-3 py-2 text-[11px] font-bold">
                            <Clock className="h-3.5 w-3.5" />
                            Entrada registrada a las {currentLog.clock_in.substring(0, 5)}
                        </div>
                    )}
                    {/* Decoración fondo */}
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
                </div>

                {/* Lista de Tareas/Eventos */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Eventos y Ausencias</p>
                    
                    {todayAgenda.length > 0 ? (
                        todayAgenda.map((item, idx) => (
                            <div key={idx} className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                <div 
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm"
                                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                >
                                    {item.type === 'event' ? <Calendar className="h-5 w-5" /> : <Umbrella className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {item.title}
                                        {item.creator && (
                                            <span className="ml-1.5 text-[10px] font-medium text-slate-400">
                                                por {item.creator}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-500">{item.time}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="rounded-full bg-slate-50 p-3 dark:bg-slate-800 mb-2">
                                <ClipboardCheck className="h-5 w-5 text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">No tienes nada planeado para hoy</p>
                            <p className="text-[10px] text-slate-400/70">¡Día despejado!</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
