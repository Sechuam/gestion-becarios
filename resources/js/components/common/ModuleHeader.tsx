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
        <section className="app-panel relative overflow-hidden p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-22 bg-[linear-gradient(90deg,rgba(15,23,42,0.96)_0%,rgba(15,23,42,0.94)_22%,rgba(30,41,59,0.92)_48%,rgba(51,65,85,0.78)_68%,rgba(100,116,139,0.3)_84%,rgba(255,255,255,0)_94%)]" />
            <div className="pointer-events-none absolute left-0 top-0 h-22 w-[52rem] bg-[linear-gradient(90deg,rgba(15,23,42,0.2)_0%,rgba(15,23,42,0.14)_62%,rgba(15,23,42,0)_100%)]" />
            <div className="relative flex flex-wrap items-start justify-between gap-5">
                <div className="space-y-3">
                    <p className="section-kicker text-white/80">Panel de gestión</p>
                    <div className="flex items-start gap-4">
                        {avatar ? (
                            <div className="-mt-1 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-sm">
                                <img src={avatar} className="h-full w-full object-cover" alt={title} />
                            </div>
                        ) : icon ? (
                            <span className="-mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                                {icon}
                            </span>
                        ) : null}
                        <div>
                            <h1 className="page-title leading-tight text-white">
                                {title}
                            </h1>
                        </div>
                    </div>
                    <p className="page-subtitle max-w-3xl pl-[3.75rem] mt-0.5">{description}</p>
                </div>

                {actions && (
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        {actions}
                    </div>
                )}
            </div>

            {metrics.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="metric-tile px-4 py-3.5"
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {metric.label}
                            </p>
                            <p className="mt-1 text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                                {metric.value}
                            </p>
                            {metric.hint && (
                                <p className="mt-1 text-xs text-muted-foreground">
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
