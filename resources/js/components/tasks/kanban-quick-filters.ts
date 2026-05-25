import type { BoardQuickFilter } from '@/lib/task-constants';
import { dueStatus } from '@/lib/task-utils';

type KanbanQuickFilter = {
    key: BoardQuickFilter;
    label: string;
    tooltip: string;
    count: number;
};

export const buildKanbanQuickFilters = (tasks: any[]): KanbanQuickFilter[] => [
    {
        key: 'all',
        label: 'Todas',
        tooltip: 'Muestra todas las tareas sin filtrar',
        count: tasks.length,
    },
    {
        key: 'urgent',
        label: 'Urgentes',
        tooltip:
            'Muestra tareas vencidas o que vencen pronto, que no han sido finalizadas',
        count: tasks.filter((task: any) => {
            const due = dueStatus(task.due_date);
            return (
                (due === 'overdue' || due === 'soon') &&
                task.status !== 'completed'
            );
        }).length,
    },
    {
        key: 'high',
        label: 'Alta prioridad',
        tooltip: 'Muestra solo tareas marcadas con prioridad Alta',
        count: tasks.filter((task: any) => task.priority === 'high').length,
    },
    {
        key: 'review',
        label: 'En revisión',
        tooltip: 'Muestra tareas que esperan la revisión del tutor',
        count: tasks.filter((task: any) => task.status === 'in_review').length,
    },
    {
        key: 'unassigned',
        label: 'Sin asignar',
        tooltip: 'Muestra tareas que no tienen ningún becario asignado',
        count: tasks.filter((task: any) => !task.interns?.length).length,
    },
];
