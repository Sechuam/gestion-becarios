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
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="page-title flex items-center gap-3">
                        {icon}
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
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
                        >
                            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                {metric.label}
                            </p>
                            <p className="mt-1 text-xl font-semibold text-foreground">
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
