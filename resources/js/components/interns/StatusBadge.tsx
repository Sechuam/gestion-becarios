type StatusBadgeProps = {
    status: string;
};

const statusConfig: Record<string, { label: string; dot: string }> = {
    active: { label: 'Activo', dot: 'bg-emerald-500' },
    completed: { label: 'Finalizado', dot: 'bg-indigo-500' },
    abandoned: { label: 'Abandonado', dot: 'bg-rose-500' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const item = statusConfig[status] || { label: status, dot: 'bg-slate-300' };

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
            <span className="text-[11px] font-semibold text-muted-foreground">
                {item.label}
            </span>
        </div>
    );
}
