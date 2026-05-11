import { Card, CardContent } from '@/components/ui/card';
import type { DashboardMetric } from './types';

type Props = {
    metrics: DashboardMetric[];
};

export function DashboardMetricCards({ metrics }: Props) {
    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
                <Card
                    key={metric.label}
                    className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900"
                >
                    <CardContent className="flex items-start justify-between gap-3 p-4">
                        <div className="min-w-0 space-y-2">
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                {metric.label}
                            </p>
                            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                {metric.value}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                                {metric.hint}
                            </p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar text-white">
                            <metric.icon className="h-5 w-5" />
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
