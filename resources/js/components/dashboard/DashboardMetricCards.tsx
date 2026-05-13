import { Card, CardContent } from '@/components/ui/card';
import type { DashboardMetric } from './types';

type Props = {
    metrics: DashboardMetric[];
};

export function DashboardMetricCards({ metrics }: Props) {
    return (
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric) => (
                <Card
                    key={metric.label}
                    className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900"
                >
                    <CardContent className="flex min-h-20 items-start justify-between gap-2 p-2.5">
                        <div className="min-w-0">
                            <p className="line-clamp-1 text-[9px] leading-3 font-black tracking-widest text-slate-400 uppercase">
                                {metric.label}
                            </p>
                            <p className="mt-0.5 text-xl leading-6 font-black tracking-tight text-slate-900 dark:text-white">
                                {metric.value}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[10px] leading-3.5 font-medium text-slate-500">
                                {metric.hint}
                            </p>
                        </div>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar text-white">
                            <metric.icon className="h-3.5 w-3.5" />
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
