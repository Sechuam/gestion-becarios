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
        <section className="app-panel relative overflow-hidden bg-gradient-to-r from-sidebar to-[#1f4f52] p-5 shadow-2xl md:px-8 md:py-6 rounded-[2rem]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
            
            <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                    <p className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/80 backdrop-blur-md border border-white/20">
                        Panel de gestión
                    </p>
                    
                    <div className="flex items-center gap-3">
                        {avatar ? (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                                <img src={avatar} className="h-full w-full object-cover" alt={title} />
                            </div>
                        ) : icon ? (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                                <div className="h-5 w-5">
                                    {icon}
                                </div>
                            </span>
                        ) : null}
                        <div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
                                {title}
                            </h1>
                            <p className="text-[11px] md:text-xs font-medium text-white/60 leading-relaxed italic mt-0.5 line-clamp-1 md:line-clamp-none">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                {actions && (
                    <div className="flex shrink-0 items-center">
                        {actions}
                    </div>
                )}
            </div>

            {metrics.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="relative overflow-hidden rounded-xl bg-white/10 p-3 shadow-lg backdrop-blur-md border border-white/20 transition-all hover:bg-white/15"
                        >
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">
                                {metric.label}
                            </p>
                            <p className="mt-1 text-lg md:text-xl font-black tracking-tight text-white">
                                {metric.value}
                            </p>
                            {metric.hint && (
                                <p className="mt-1 text-[10px] font-medium text-white/40 line-clamp-1">
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
