import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
};

export function ModuleHeader({
    title,
    description,
    icon,
    avatar,
    actions,
    metrics = [],
    metricsVariant = 'glass',
}: Props) {
    return (
        <section className="app-panel relative overflow-hidden rounded-2xl bg-linear-to-r from-sidebar to-[#1f4f52] p-3 shadow-xl md:px-5 md:py-3">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                    <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-black tracking-widest text-white/80 uppercase backdrop-blur-md">
                        Panel de gestión
                    </p>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                            {avatar ? (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                                    <img
                                        src={avatar}
                                        className="h-full w-full object-cover"
                                        alt={title}
                                    />
                                </div>
                            ) : icon ? (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                                    {icon}
                                </span>
                            ) : null}
                            <h1 className="text-lg leading-none font-black tracking-tight text-white md:text-xl">
                                {title}
                            </h1>
                        </div>
                        <p className="ml-11 line-clamp-1 text-[10px] leading-tight font-medium text-white/60 italic">
                            {description}
                        </p>
                    </div>
                </div>

                {actions && (
                    <div className="flex shrink-0 items-center">{actions}</div>
                )}
            </div>

            {metrics.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className={cn(
                                'relative overflow-hidden rounded-lg border p-2 shadow-lg backdrop-blur-md transition-all',
                                metricsVariant === 'solid'
                                    ? 'border-white/80 bg-white/90 text-sidebar hover:bg-white'
                                    : 'border-white/20 bg-white/10 text-white hover:bg-white/15',
                            )}
                        >
                            <p
                                className={cn(
                                    'text-[8px] leading-none font-black tracking-widest uppercase',
                                    metricsVariant === 'solid'
                                        ? 'text-sidebar/70'
                                        : 'text-white/50',
                                )}
                            >
                                {metric.label}
                            </p>
                            <p
                                className={cn(
                                    'mt-0.5 text-sm font-black tracking-tight md:text-base',
                                    metricsVariant === 'solid'
                                        ? 'text-sidebar'
                                        : 'text-white',
                                )}
                            >
                                {metric.value}
                            </p>
                            {metric.hint && (
                                <p
                                    className={cn(
                                        'mt-0.5 line-clamp-1 text-[8px] leading-none font-medium',
                                        metricsVariant === 'solid'
                                            ? 'text-slate-500'
                                            : 'text-white/40',
                                    )}
                                >
                                    {metric.hint}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
