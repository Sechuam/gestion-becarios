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
                'grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
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
                        className="flex min-h-16 items-center gap-3 rounded-xl border border-sidebar/10 bg-white px-4 py-3 shadow-sm dark:bg-slate-900/60"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sidebar/10 bg-sidebar/5">
                            <IconComponent
                                className={cn('h-4 w-4', iconColor)}
                            />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-black tracking-widest text-sidebar uppercase dark:text-white/80">
                                {metric.label}
                            </p>
                            {metric.hint && (
                                <p className="truncate text-[11px] font-medium text-muted-foreground">
                                    {metric.hint}
                                </p>
                            )}
                        </div>
                        <span className="shrink-0 text-lg font-black tracking-tight text-sidebar dark:text-white">
                            {metric.value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
