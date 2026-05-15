import { Link, router } from '@inertiajs/react';
import AssignedInternsStack from '@/components/tasks/AssignedInternsStack';
import { TableActionMenu } from '@/components/common/TableActionMenu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDateEs } from '@/lib/date-format';
import { getTaskPriorityLabel, getTaskStatusLabel } from '@/lib/task-labels';
import { dueStatus } from '@/lib/task-utils';
import { cn } from '@/lib/utils';

export const buildTaskTableColumns = ({ isIntern }: { isIntern: boolean }) => [
    {
        key: 'title',
        label: 'Tarea',
        sortKey: 'title',
        render: (task: any) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={`/tareas/${task.id}`}
                    className="font-semibold text-foreground hover:underline"
                >
                    {task.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                    {task.description || 'Sin descripción'}
                </span>
            </div>
        ),
    },
    {
        key: 'practice_type',
        label: 'Tipo',
        sortKey: 'practice_type',
        render: (task: any) => task.practice_type?.name || '—',
    },
    {
        key: 'status',
        label: 'Estado',
        sortKey: 'status',
        headClassName: 'text-center',
        cellClassName: 'text-center',
        render: (task: any) => (
            <div className="flex items-center justify-center gap-2 font-medium text-sidebar dark:text-white/80">
                <div
                    className={cn('h-2 w-2 shrink-0 rounded-full', {
                        'bg-slate-300': task.status === 'pending',
                        'bg-blue-400': task.status === 'in_progress',
                        'bg-violet-400': task.status === 'in_review',
                        'bg-emerald-500': task.status === 'completed',
                        'bg-rose-500': task.status === 'rejected',
                    })}
                />
                <span className="text-xs tracking-wider uppercase">
                    {getTaskStatusLabel(task.status)}
                </span>
            </div>
        ),
    },
    {
        key: 'priority',
        label: 'Prioridad',
        sortKey: 'priority',
        headClassName: 'text-center',
        cellClassName: 'text-center',
        render: (task: any) => (
            <div className="flex justify-center">
                <span
                    className={cn(
                        'inline-flex w-20 items-center justify-center rounded-full px-2 py-1 text-[9px] font-black tracking-widest uppercase shadow-sm transition-all',
                        {
                            'bg-sidebar text-white shadow-sidebar/20':
                                task.priority === 'high',
                            'bg-sidebar/70 text-white shadow-sidebar/10':
                                task.priority === 'medium',
                            'border border-sidebar/20 bg-white text-sidebar':
                                task.priority === 'low',
                        },
                    )}
                >
                    {getTaskPriorityLabel(task.priority)}
                </span>
            </div>
        ),
    },
    {
        key: 'due_date',
        label: 'Entrega',
        sortKey: 'due_date',
        render: (task: any) => {
            const status = dueStatus(task.due_date);
            const isCompleted = task.status === 'completed';
            const isLate =
                isCompleted &&
                task.completed_at &&
                task.due_date &&
                new Date(task.completed_at.split(/T| /)[0]) >
                new Date(task.due_date);

            const dotClass = isCompleted
                ? isLate
                    ? 'bg-orange-500'
                    : 'bg-emerald-500'
                : status === 'overdue'
                    ? 'bg-rose-500'
                    : status === 'soon'
                        ? 'bg-amber-400'
                        : 'bg-sidebar/20';

            const smartLabel = isCompleted
                ? isLate
                    ? 'Tarde'
                    : 'Completada'
                : status === 'overdue'
                    ? 'No entregada'
                    : status === 'soon'
                        ? 'Pronto'
                        : formatDateEs(task.due_date);

            return task.due_date ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex cursor-default items-center gap-2 font-medium text-sidebar dark:text-white/80">
                            <div
                                className={cn(
                                    'h-2 w-2 shrink-0 rounded-full',
                                    dotClass,
                                )}
                            />
                            <span className="text-xs tracking-wider uppercase">
                                {smartLabel}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl border-sidebar/20 font-medium">
                        Fecha límite: {formatDateEs(task.due_date)}
                    </TooltipContent>
                </Tooltip>
            ) : (
                '—'
            );
        },
    },
    {
        key: 'interns',
        label: 'Asignados',
        render: (task: any) => (
            <AssignedInternsStack interns={task.interns || []} />
        ),
    },
    {
        key: 'actions',
        label: 'Acciones',
        render: (task: any) => {
            const statusValue = String(task.status ?? '').toLowerCase();
            const canDelete = [
                'completed',
                'rejected',
                'completada',
                'rechazada',
            ].includes(statusValue);

            return (
                <TableActionMenu
                    actions={[
                        {
                            label: 'Ver tarea',
                            icon: 'view',
                            href: `/tareas/${task.id}`,
                        },
                        ...(!isIntern
                            ? [
                                {
                                    label: 'Editar tarea',
                                    icon: 'edit' as const,
                                    href: `/tareas/${task.id}/edit`,
                                },
                            ]
                            : []),
                        ...(!isIntern && canDelete
                            ? [
                                {
                                    label: 'Eliminar tarea',
                                    icon: 'delete' as const,
                                    onClick: () => {
                                        if (
                                            confirm(
                                                '¿Seguro que quieres eliminar esta tarea?',
                                            )
                                        ) {
                                            router.delete(
                                                `/tareas/${task.id}`,
                                            );
                                        }
                                    },
                                    variant: 'destructive' as const,
                                },
                            ]
                            : []),
                    ]}
                />
            );
        },
    },
];
