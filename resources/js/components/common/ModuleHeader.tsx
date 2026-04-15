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
    actions?: ReactNode;
    metrics?: Metric[];
};

export function ModuleHeader({
    title,
    description,
    icon,
    actions,
    metrics = [],
}: Props) {
    return (
        <section className="app-panel relative overflow-hidden p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(132,183,175,0.18),transparent_58%)]" />
            <div className="relative flex flex-wrap items-start justify-between gap-5">
                <div className="space-y-3">
                    <p className="section-kicker">Panel de gestión</p>
                    <h1 className="page-title flex items-center gap-3">
                        {icon && (
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]">
                                {icon}
                            </span>
                        )}
                        <span>{title}</span>
                    </h1>
                    <p className="page-subtitle">{description}</p>
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
