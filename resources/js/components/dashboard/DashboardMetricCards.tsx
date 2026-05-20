import { Card, CardContent } from '@/components/ui/card';
import type { DashboardMetric } from './types';

type Props = {
    metrics: DashboardMetric[];
};

export function DashboardMetricCards({ metrics }: Props) {
    return (
        <div className="grid gap-2.5 md:grid-cols-3">
            {metrics.map((metric) => (
                <Card
                    key={metric.label}
                    className="group border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 py-2.5 rounded-xl"
                >
                    <CardContent className="flex items-center gap-2.5 p-0 px-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
                            <metric.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5 leading-none">
                                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                                    {metric.value}
                                </span>
                                <span className="line-clamp-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider leading-none">
                                    {metric.label}
                                </span>
                            </div>
                            <span className="mt-0.5 block line-clamp-1 text-[10px] leading-none font-medium text-slate-600 dark:text-slate-300">
                                {metric.hint}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
