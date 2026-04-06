export const TASK_STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    in_review: 'En revisión',
    completed: 'Completada',
    rejected: 'Rechazada',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
};

export const getTaskStatusLabel = (status?: string | null) => {
    if (!status) return '—';
    return TASK_STATUS_LABELS[status] || status;
};

export const getTaskPriorityLabel = (priority?: string | null) => {
    if (!priority) return '—';
    return TASK_PRIORITY_LABELS[priority] || priority;
};

export const getTaskPriorityTone = (priority?: string | null) => {
    switch (priority) {
        case 'high':
            return 'border-red-200 bg-red-50 text-red-700';
        case 'medium':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'low':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        default:
            return 'border-border bg-muted/40 text-muted-foreground';
    }
};

export const getTaskStatusTone = (status?: string | null) => {
    switch (status) {
        case 'completed':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'in_review':
            return 'border-violet-200 bg-violet-50 text-violet-700';
        case 'in_progress':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'rejected':
            return 'border-red-200 bg-red-50 text-red-700';
        case 'pending':
            return 'border-slate-200 bg-slate-50 text-slate-700';
        default:
            return 'border-border bg-muted/40 text-muted-foreground';
    }
};
