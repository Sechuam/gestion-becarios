import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardAlert } from './types';

type Props = {
    alerts: DashboardAlert[];
};

export function DashboardAlertCards({ alerts }: Props) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            {alerts.map((alert) => (
                <Card
                    key={alert.label}
                    className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900"
                >
                    <CardContent className="flex items-center gap-3 p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            {alert.value > 0 ? (
                                <AlertTriangle className="h-5 w-5" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                        </span>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {alert.value}
                            </p>
                            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                                {alert.label}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
