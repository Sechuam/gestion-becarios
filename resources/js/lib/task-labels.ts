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
