import { AlertCircle, CheckCircle2, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

type Metric = {
    label: string;
    value: string | number;
    hint?: string;
};

type Props = {
    metrics: Metric[];
    className?: string;
};

export function MetricPills({ metrics, className }: Props) {
    if (!metrics.length) return null;

    return (
        <div
            className={cn(
                'grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                className,
            )}
        >
            {metrics.map((metric) => {
                const labelLower = metric.label.toLowerCase();
                let IconComponent = LayoutGrid;
                let iconColor = 'text-indigo-500';

                if (labelLower.includes('alerta')) {
                    IconComponent = AlertCircle;
                    iconColor =
                        Number(metric.value) > 0
                            ? 'text-rose-500'
                            : 'text-slate-400';
                } else if (
                    labelLower.includes('tarea') ||
                    labelLower.includes('completada') ||
                    labelLower.includes('activo')
                ) {
                    IconComponent = CheckCircle2;
                    iconColor = 'text-emerald-500';
                }

                return (
                    <div
                        key={metric.label}
                        className="flex min-h-12 items-center gap-2.5 rounded-lg border border-sidebar/10 bg-white px-3 py-2 shadow-sm dark:bg-[#142235]"
                    >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-sidebar/10 bg-sidebar/5">
                            <IconComponent
                                className={cn('h-3.5 w-3.5', iconColor)}
                            />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[9px] font-black tracking-widest text-sidebar uppercase dark:text-white/80">
                                {metric.label}
                            </p>
                            {metric.hint && (
                                <p className="truncate text-[10px] font-medium text-muted-foreground">
                                    {metric.hint}
                                </p>
                            )}
                        </div>
                        <span className="shrink-0 text-base font-black tracking-tight text-sidebar dark:text-white">
                            {metric.value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
