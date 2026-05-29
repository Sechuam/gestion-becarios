import { Card, CardContent } from '@/components/ui/card';
import type { DashboardMetric } from './types';

type Props = {
    metrics: DashboardMetric[];
};

export function DashboardMetricCards({ metrics }: Props) {
    return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
                <Card
                    key={metric.label}
                    className="group rounded-xl border-slate-200/80 bg-white py-2.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                    <CardContent className="flex min-w-0 items-center gap-2.5 p-0 px-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
                            <metric.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5 leading-none">
                                <span className="text-lg leading-none font-black tracking-tight text-slate-900 dark:text-white">
                                    {metric.value}
                                </span>
                                <span className="line-clamp-1 text-[10px] leading-none font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                    {metric.label}
                                </span>
                            </div>
                            <span className="mt-0.5 line-clamp-1 block text-[10px] leading-none font-medium text-slate-600 dark:text-slate-300">
                                {metric.hint}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
