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
        <div className="grid gap-2 md:grid-cols-3">
            {alerts.map((alert) => {
                const Icon =
                    alert.value === 0
                        ? CheckCircle2
                        : (ALERT_ICONS[alert.label] ?? CalendarOff);

                return (
                    <Card
                        key={alert.label}
                        className="border-l-2 border-slate-300 border-l-sidebar bg-white shadow-sm dark:border-slate-700 dark:border-l-teal-400 dark:bg-slate-900"
                    >
                        <CardContent className="flex items-center gap-2 px-2.5 py-1.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar text-white shadow-sm">
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div>
                                <p className="text-lg leading-5 font-black text-sidebar dark:text-teal-100">
                                    {alert.value}
                                </p>
                                <p className="text-[10px] leading-3 font-bold tracking-widest text-sidebar uppercase dark:text-teal-100">
                                    {alert.label}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
