import type { ReactNode } from 'react';

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
};

export function ModuleHeader({
    title,
    description,
    icon,
    avatar,
    actions,
    metrics = [],
}: Props) {
    return (
        <section className="app-panel relative overflow-hidden bg-gradient-to-r from-sidebar to-[#1f4f52] p-3 shadow-xl md:px-5 md:py-3 rounded-2xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
            
            <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                    <p className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/80 backdrop-blur-md border border-white/20">
                        Panel de gestión
                    </p>
                    
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                            {avatar ? (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                                    <img src={avatar} className="h-full w-full object-cover" alt={title} />
                                </div>
                            ) : icon ? (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                                    {icon}
                                </span>
                            ) : null}
                            <h1 className="text-lg md:text-xl font-black tracking-tight text-white leading-none">
                                {title}
                            </h1>
                        </div>
                        <p className="text-[10px] font-medium text-white/60 leading-tight italic ml-[44px] line-clamp-1">
                            {description}
                        </p>
                    </div>
                </div>

                {actions && (
                    <div className="flex shrink-0 items-center">
                        {actions}
                    </div>
                )}
            </div>

            {metrics.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="relative overflow-hidden rounded-lg bg-white/10 p-2 shadow-lg backdrop-blur-md border border-white/20 transition-all hover:bg-white/15"
                        >
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/50 leading-none">
                                {metric.label}
                            </p>
                            <p className="mt-0.5 text-sm md:text-base font-black tracking-tight text-white">
                                {metric.value}
                            </p>
                            {metric.hint && (
                                <p className="mt-0.5 text-[8px] font-medium text-white/40 line-clamp-1 leading-none">
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
