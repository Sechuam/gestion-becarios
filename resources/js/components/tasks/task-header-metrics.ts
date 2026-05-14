import { dueStatus } from '@/lib/task-utils';

export const buildTaskHeaderMetrics = (tasks: any) => [
    {
        label: 'Resultados',
        value: tasks.total,
        hint: 'Total según filtros actuales',
    },
    {
        label: 'Pendientes',
        value: tasks.data.filter((task: any) => task.status === 'pending')
            .length,
        hint: 'En esta página',
    },
    {
        label: 'En revisión',
        value: tasks.data.filter((task: any) => task.status === 'in_review')
            .length,
        hint: 'Esperando validación',
    },
    {
        label: 'Entrega sensible',
        value: tasks.data.filter((task: any) => {
            const status = dueStatus(task.due_date);
            return status === 'overdue' || status === 'soon';
        }).length,
        hint: 'Atrasadas o próximas',
    },
];
