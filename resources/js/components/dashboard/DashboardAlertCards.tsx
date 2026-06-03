import { CalendarOff, CheckCircle2, ListTodo, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardAlert } from './types';

type Props = {
    alerts: DashboardAlert[];
};

const ALERT_ICONS: Record<string, React.ElementType> = {
    'Ausencias pendientes': CalendarOff,
    'Jornadas abiertas hoy': Timer,
    'Tareas sin completar': ListTodo,
};

export function DashboardAlertCards({ alerts }: Props) {
    return (
        <div className="grid gap-2.5 md:grid-cols-3">
            {alerts.map((alert) => {
                const Icon =
                    alert.value === 0
                        ? CheckCircle2
                        : (ALERT_ICONS[alert.label] ?? CalendarOff);

                const isAlertActive = alert.value > 0;
                const borderLeftClass = isAlertActive
                    ? 'border-l-rose-500 dark:border-l-rose-400'
                    : 'border-l-sidebar dark:border-l-teal-500';
                const iconBgClass = isAlertActive
                    ? 'bg-rose-50 text-rose-500 border border-rose-100 animate-pulse'
                    : 'bg-sidebar text-white dark:bg-[#9fc6bf] dark:text-[#14202a]';

                return (
                    <Card
                        key={alert.label}
                        className={`group rounded-xl border-l-3 border-slate-200/80 bg-white py-2.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-[#2a4158] dark:bg-[#142235] dark:shadow-[0_16px_46px_-32px_rgba(0,0,0,0.95)] ${borderLeftClass}`}
                    >
                        <CardContent className="flex items-center gap-2.5 p-0 px-3">
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-105 ${iconBgClass}`}
                            >
                                <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-1.5 leading-none">
                                    <span
                                        className={`text-lg leading-none font-black tracking-tight ${isAlertActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}
                                    >
                                        {alert.value}
                                    </span>
                                    <span className="line-clamp-1 text-[10px] leading-none font-bold tracking-wider text-slate-600 uppercase dark:text-[#c4d2df]">
                                        {alert.label}
                                    </span>
                                </div>
                                <span className="mt-0.5 line-clamp-1 block text-[10px] leading-none font-medium text-slate-600 dark:text-[#93a7ba]">
                                    {isAlertActive
                                        ? 'Requiere atención'
                                        : 'Sin incidencias hoy'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
