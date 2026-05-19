import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, LayoutGrid } from 'lucide-react';

type Metric = {
    label: string;
    value: string | number;
    hint?: string;
};

type Props = {
    title: string;
    description: string;
    icon?: ReactNode;
    avatar?: string;
    actions?: ReactNode;
    metrics?: Metric[];
    metricsVariant?: 'glass' | 'solid';
    variant?: 'dark' | 'stone' | 'sidebar' | 'primary';
};

export function ModuleHeader({
    title,
    description,
    icon,
    avatar,
    actions,
    metrics = [],
    metricsVariant = 'glass',
    variant = 'dark',
}: Props) {
    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-xl p-4 shadow-xl transition-all duration-300 md:px-5 md:py-4',
                variant === 'dark'
                    ? 'app-panel bg-linear-to-r from-sidebar to-sidebar-accent'
                    : variant === 'sidebar'
                      ? 'border border-white/10 bg-linear-to-r from-sidebar to-sidebar-accent'
                      : variant === 'primary'
                        ? 'border border-primary/20 bg-primary text-white shadow-xl'
                        : 'border border-sidebar/10 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60',
            )}
        >
            {(variant === 'dark' ||
                variant === 'sidebar' ||
                variant === 'primary') && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_100%)]" />
            )}

            <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-[16rem] flex-1 space-y-1.5">
                    <p
                        className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black tracking-widest uppercase backdrop-blur-md',
                            variant === 'dark' ||
                                variant === 'sidebar' ||
                                variant === 'primary'
                                ? 'border-white/20 bg-white/10 text-white/80'
                                : 'border-sidebar/10 bg-sidebar/5 text-sidebar/80 dark:border-white/20 dark:bg-white/10 dark:text-white/80',
                        )}
                    >
                        Panel de gestión
                    </p>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                            {avatar ? (
                                <div
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border shadow-xl backdrop-blur-md',
                                        variant === 'dark' ||
                                            variant === 'sidebar' ||
                                            variant === 'primary'
                                            ? 'border-white/20 bg-white/10'
                                            : 'border-sidebar/10 bg-sidebar/5 dark:border-white/20 dark:bg-white/10',
                                    )}
                                >
                                    <img
                                        src={avatar}
                                        className="h-full w-full object-cover"
                                        alt={title}
                                    />
                                </div>
                            ) : icon ? (
                                <span
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-xl backdrop-blur-md',
                                        variant === 'dark' ||
                                            variant === 'sidebar' ||
                                            variant === 'primary'
                                            ? 'border-white/20 bg-white/10 text-white'
                                            : 'border-sidebar/10 bg-sidebar/5 text-sidebar dark:border-white/20 dark:bg-white/10 dark:text-white',
                                    )}
                                >
                                    {icon}
                                </span>
                            ) : null}
                            <h1
                                className={cn(
                                    'text-lg leading-tight font-black tracking-tight md:text-xl',
                                    variant === 'dark' ||
                                        variant === 'sidebar' ||
                                        variant === 'primary'
                                        ? 'text-white'
                                        : 'text-sidebar dark:text-white',
                                )}
                            >
                                {title}
                            </h1>
                        </div>
                        <p
                            className={cn(
                                'ml-11 line-clamp-2 max-w-4xl text-[11px] leading-tight font-medium italic sm:line-clamp-1',
                                variant === 'dark' ||
                                    variant === 'sidebar' ||
                                    variant === 'primary'
                                    ? 'text-white/60'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {description}
                        </p>
                    </div>
                </div>

                {actions && (
                    <div className="flex min-w-0 shrink-0 items-center">
                        {actions}
                    </div>
                )}
            </div>

            {metrics.length > 0 && (
                <div
                    className={cn(
                        'mt-4 inline-flex max-w-full flex-wrap items-stretch rounded-lg border p-1 shadow-xs md:flex-nowrap',
                        metricsVariant === 'solid'
                            ? 'border-slate-200/80 bg-white text-sidebar'
                            : 'border-white/20 bg-white/10 text-white backdrop-blur-md',
                    )}
                >
                    {metrics.map((metric, idx) => {
                        const labelLower = metric.label.toLowerCase();
                        let IconComponent = LayoutGrid;
                        let iconColor =
                            metricsVariant === 'solid'
                                ? 'text-indigo-500'
                                : 'text-indigo-300';
                        if (labelLower.includes('alerta')) {
                            IconComponent = AlertCircle;
                            iconColor =
                                Number(metric.value) > 0
                                    ? 'text-rose-500 animate-pulse'
                                    : metricsVariant === 'solid'
                                      ? 'text-slate-400'
                                      : 'text-white/45';
                        } else if (
                            labelLower.includes('tarea') ||
                            labelLower.includes('completada')
                        ) {
                            IconComponent = CheckCircle2;
                            iconColor =
                                metricsVariant === 'solid'
                                    ? 'text-emerald-500'
                                    : 'text-emerald-400';
                        }

                        return (
                            <React.Fragment key={metric.label}>
                                {idx > 0 && (
                                    <div
                                        className={cn(
                                            'my-1.5 hidden w-[1px] md:block',
                                            metricsVariant === 'solid'
                                                ? 'bg-slate-200/80'
                                                : 'bg-white/15',
                                        )}
                                    />
                                )}
                                <div
                                    className={cn(
                                        'group flex items-center gap-3 rounded-md px-3 py-1.5 transition-colors duration-150',
                                        metricsVariant === 'solid'
                                            ? 'hover:bg-slate-50/80'
                                            : 'hover:bg-white/5',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-transform duration-200 group-hover:scale-105',
                                            metricsVariant === 'solid'
                                                ? labelLower.includes(
                                                      'alerta',
                                                  ) && Number(metric.value) > 0
                                                    ? 'border-rose-100 bg-rose-50'
                                                    : 'border-slate-100 bg-slate-50'
                                                : labelLower.includes(
                                                        'alerta',
                                                    ) &&
                                                    Number(metric.value) > 0
                                                  ? 'border-rose-500/25 bg-rose-500/10'
                                                  : 'border-white/10 bg-white/5',
                                        )}
                                    >
                                        <IconComponent
                                            className={cn('h-4 w-4', iconColor)}
                                        />
                                    </div>

                                    <div className="flex min-w-[95px] flex-col sm:min-w-[110px] md:min-w-[120px]">
                                        <span
                                            className={cn(
                                                'text-[9px] leading-none font-extrabold tracking-wider uppercase',
                                                metricsVariant === 'solid'
                                                    ? 'text-sidebar/85'
                                                    : 'text-white/80',
                                            )}
                                        >
                                            {metric.label}
                                        </span>
                                        {metric.hint && (
                                            <span
                                                className={cn(
                                                    'mt-0.5 line-clamp-1 text-[9px] leading-none font-medium',
                                                    metricsVariant === 'solid'
                                                        ? 'text-slate-500'
                                                        : 'text-white/60',
                                                )}
                                            >
                                                {metric.hint}
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className={cn(
                                            'shrink-0 pl-1.5 text-base leading-none font-black tracking-tight',
                                            metricsVariant === 'solid'
                                                ? 'text-sidebar'
                                                : 'text-white',
                                        )}
                                    >
                                        {metric.value}
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
