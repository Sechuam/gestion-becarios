export const KANBAN_COLUMNS = [
    { key: 'pending', label: 'Pendiente' },
    { key: 'in_progress', label: 'En progreso' },
    { key: 'in_review', label: 'En revisión' },
    { key: 'completed', label: 'Completada' },
    { key: 'rejected', label: 'Rechazada' },
];

export const KANBAN_WIP_LIMIT = 6;
export const KANBAN_ORDER_STORAGE_KEY = 'tasks-index-kanban-order';

export type TaskViewMode = 'kanban' | 'table';
export type BoardQuickFilter = 'all' | 'urgent' | 'high' | 'review' | 'unassigned';

