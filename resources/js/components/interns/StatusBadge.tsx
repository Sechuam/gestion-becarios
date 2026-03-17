type StatusBadgeProps = {
    status: string;
};

const statusConfig: Record<string, { label: string; dot: string }> = {
    active: { label: 'Activo', dot: 'bg-emerald-500' },
    completed: { label: 'Finalizado', dot: 'bg-blue-500' },
    abandoned: { label: 'Abandonado', dot: 'bg-rose-500' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const item = statusConfig[status] || { label: status, dot: 'bg-slate-300' };

    return (
        <div className="inline-flex items-center px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-none">
            <span className={`h-1.5 w-1.5 rounded-full ${item.dot} mr-2`} />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {item.label}
            </span>
        </div>
    );
}
