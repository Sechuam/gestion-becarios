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
                const Icon = alert.value === 0
                    ? CheckCircle2
                    : (ALERT_ICONS[alert.label] ?? CalendarOff);

                return (
                    <Card
                        key={alert.label}
                        className="border-sidebar bg-linear-to-br from-sidebar to-[#1f4f52] shadow-sm"
                    >
                        <CardContent className="flex items-center gap-2 px-2.5 py-1.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-white ring-1 ring-white/20">
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div>
                                <p className="text-lg leading-5 font-black text-white">
                                    {alert.value}
                                </p>
                                <p className="text-[10px] leading-3 font-bold tracking-widest text-white/70 uppercase">
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
