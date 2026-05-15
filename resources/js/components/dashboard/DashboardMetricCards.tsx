import { Card, CardContent } from '@/components/ui/card';
import type { DashboardMetric } from './types';

type Props = {
    metrics: DashboardMetric[];
};

export function DashboardMetricCards({ metrics }: Props) {
    return (
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-5">
            {metrics.map((metric) => (
                <Card
                    key={metric.label}
                    className="group border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                >
                    <CardContent className="flex items-center gap-2 px-2.5 py-1">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar text-white shadow-sm">
                            <metric.icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5">
                                <p className="text-xl leading-5 font-black tracking-tight text-slate-900 dark:text-white">
                                    {metric.value}
                                </p>
                                <p className="line-clamp-1 text-[10px] leading-3 font-bold text-slate-600 dark:text-slate-300">
                                    {metric.label}
                                </p>
                            </div>
                            <p className="line-clamp-1 text-[10px] leading-3 font-medium text-slate-500">
                                {metric.hint}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
