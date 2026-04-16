export const dueStatus = (dueDate?: string | null) => {
    if (!dueDate) return 'none';
    const today = new Date();
    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );
    const due = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(due.getTime())) return 'none';
    const diffDays = Math.ceil(
        (due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'soon';
    return 'none';
};

export const getTaskSortableId = (taskId: number | string) => `task-${taskId}`;
export const getColumnDropId = (status: string) => `column-${status}`;

export const parseTaskSortableId = (id: any): number | null => {
    if (typeof id === 'number') return id;
    if (typeof id === 'string') {
        const match = id.match(/^task-(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
    }
    return null;
};

export const parseColumnDropId = (value: unknown) => {
    if (typeof value !== 'string' || !value.startsWith('column-')) return null;
    return value.slice(7);
};

