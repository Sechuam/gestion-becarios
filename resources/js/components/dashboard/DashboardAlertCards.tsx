import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardAlert } from './types';

type Props = {
    alerts: DashboardAlert[];
};

export function DashboardAlertCards({ alerts }: Props) {
    return (
        <div className="grid gap-2 md:grid-cols-3">
            {alerts.map((alert) => (
                <Card
                    key={alert.label}
                    className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900"
                >
                    <CardContent className="flex items-center gap-2 p-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                            {alert.value > 0 ? (
                                <AlertTriangle className="h-3.5 w-3.5" />
                            ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                        </span>
                        <div>
                            <p className="text-lg leading-5 font-black text-slate-900 dark:text-white">
                                {alert.value}
                            </p>
                            <p className="text-[10px] leading-3 font-bold tracking-widest text-slate-500 uppercase">
                                {alert.label}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
