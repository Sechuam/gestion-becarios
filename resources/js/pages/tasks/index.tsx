import {
    pointerWithin,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragEndEvent,
    type DragOverEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    KanbanSquare,
    LayoutGrid,
    List,
    PlusCircle,
    Sparkles,
    Loader2,
    Calendar
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import { TableActionMenu } from '@/components/common/TableActionMenu';
import { Pagination } from '@/components/common/Pagination';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import AssignedInternsStack from '@/components/tasks/AssignedInternsStack';
import TaskQuickViewSheet from '@/components/tasks/TaskQuickViewSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs } from '@/lib/date-format';
import {
    getTaskPriorityLabel,
    getTaskPriorityTone,
    getTaskStatusLabel,
    getTaskStatusTone,
} from '@/lib/task-labels';
import {
    KANBAN_COLUMNS,
    KANBAN_ORDER_STORAGE_KEY,
    KANBAN_WIP_LIMIT,
    type TaskViewMode,
    type BoardQuickFilter,
} from '@/lib/task-constants';
import {
    dueStatus,
    getTaskSortableId,
    getColumnDropId,
    parseTaskSortableId,
    parseColumnDropId,
} from '@/lib/task-utils';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import type { BreadcrumbItem } from '@/types/navigation';

type Props = {
    tasks: any;
    filters: any;
    practice_types: any[];
    interns: Array<{ id: number; name: string }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tareas', href: '/tareas' },
];


const applyStoredKanbanOrder = (tasks: any[]) => {
    if (typeof window === 'undefined') return tasks;

    const raw = window.localStorage.getItem(KANBAN_ORDER_STORAGE_KEY);
    if (!raw) return tasks;

    try {
        const saved = JSON.parse(raw) as Record<string, number[]>;
        const grouped = Object.fromEntries(
            KANBAN_COLUMNS.map((column) => [column.key, [] as any[]]),
        ) as Record<string, any[]>;

        tasks.forEach((task) => {
            const status = String(task.status || 'pending');
            if (!grouped[status]) grouped[status] = [];
            grouped[status].push(task);
        });

        KANBAN_COLUMNS.forEach((column) => {
            const order = saved[column.key] || [];
            const indexMap = new Map(
                order.map((id, index) => [Number(id), index]),
            );

            grouped[column.key].sort((left, right) => {
                const leftIndex = indexMap.get(Number(left.id));
                const rightIndex = indexMap.get(Number(right.id));

                if (leftIndex === undefined && rightIndex === undefined)
                    return 0;
                if (leftIndex === undefined) return 1;
                if (rightIndex === undefined) return -1;

                return leftIndex - rightIndex;
            });
        });

        return KANBAN_COLUMNS.flatMap((column) => grouped[column.key] || []);
    } catch {
        return tasks;
    }
};

const persistKanbanOrder = (tasks: any[]) => {
    if (typeof window === 'undefined') return;

    const payload = Object.fromEntries(
        KANBAN_COLUMNS.map((column) => [
            column.key,
            tasks
                .filter((task) => String(task.status) === column.key)
                .map((task) => Number(task.id)),
        ]),
    );

    window.localStorage.setItem(
        KANBAN_ORDER_STORAGE_KEY,
        JSON.stringify(payload),
    );
};

const reorderBoardTasks = (
    currentTasks: any[],
    activeTaskId: number,
    overId: string,
) => {
    const activeIndex = currentTasks.findIndex(task => Number(task.id) === activeTaskId);
    if (activeIndex === -1) return currentTasks;
    const activeTask = currentTasks[activeIndex];

    const overTaskId = parseTaskSortableId(overId);
    let newTasks = [...currentTasks];

    if (overTaskId === null) {
        const targetColumn = parseColumnDropId(overId);
        if (!targetColumn) return currentTasks;

        const [movedTask] = newTasks.splice(activeIndex, 1);
        movedTask.status = targetColumn;
        newTasks.push(movedTask);
    }
    else {
        const overIndex = newTasks.findIndex(task => Number(task.id) === overTaskId);
        if (overIndex === -1) return currentTasks;

        const overTask = newTasks[overIndex];

        if (activeTask.status === overTask.status) {
            newTasks = arrayMove(newTasks, activeIndex, overIndex);
        } else {
            const [movedTask] = newTasks.splice(activeIndex, 1);
            movedTask.status = overTask.status;

            const newOverIndex = newTasks.findIndex(task => Number(task.id) === overTaskId);
            newTasks.splice(newOverIndex, 0, movedTask);
        }
    }
    const grouped = Object.fromEntries(
        KANBAN_COLUMNS.map((col) => [col.key, [] as any[]]),
    ) as Record<string, any[]>;

    newTasks.forEach((task) => {
        const status = String(task.status || 'pending');
        if (!grouped[status]) grouped[status] = [];
        grouped[status].push(task);
    });

    return KANBAN_COLUMNS.flatMap((col) => grouped[col.key] || []);
};


const buildBoardOrderPayload = (tasks: any[]) =>
    KANBAN_COLUMNS.flatMap((column) =>
        tasks
            .filter((task) => String(task.status) === column.key)
            .map((task, index) => ({
                id: Number(task.id),
                status: column.key,
                position: index + 1,
            })),
    );

export default function Index({
    tasks,
    filters = {},
    practice_types = [],
    interns = [],
}: Props) {
    const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
        if (typeof window === 'undefined') return 'kanban';

        const savedView = window.localStorage.getItem('tasks-index-view-mode');

        return savedView === 'table' ? 'table' : 'kanban';
    });
    const { auth } = usePage().props as any;
    const isIntern =
        auth?.user?.roles?.includes('intern') ||
        auth?.user?.roles?.includes('becario');
    const isTutor = auth?.user?.roles?.includes('tutor');
    const isAdmin = auth?.user?.roles?.includes('admin');
    const [boardFilter, setBoardFilter] = useState<BoardQuickFilter>('all');
    const [lastMoveMessage, setLastMoveMessage] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
    const [highlightedTaskId, setHighlightedTaskId] = useState<number | null>(
        null,
    );
    const [activeDragTask, setActiveDragTask] = useState<any | null>(null);
    const [boardTasks, setBoardTasks] = useState<any[]>(() =>
        applyStoredKanbanOrder(tasks.data),
    );
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem('tasks-index-view-mode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        if (highlightedTaskId === null) return;

        const timeoutId = window.setTimeout(() => {
            setHighlightedTaskId(null);
        }, 650);

        return () => window.clearTimeout(timeoutId);
    }, [highlightedTaskId]);

    useEffect(() => {
        setBoardTasks(applyStoredKanbanOrder(tasks.data));
    }, [tasks.data]);

    useEffect(() => {
        persistKanbanOrder(boardTasks);
    }, [boardTasks]);

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === 'all') {
            delete newFilters[key];
        }
        router.get('/tareas', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (key: string) => {
        const currentKey = filters.sort;
        const currentDir = filters.direction || 'asc';
        const nextDir =
            currentKey === key && currentDir === 'asc' ? 'desc' : 'asc';
        router.get(
            '/tareas',
            { ...filters, sort: key, direction: nextDir },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        router.get('/tareas', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearAllFilters = () => {
        router.get(
            '/tareas',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const completeTask = (task: any, closePanel = false) => {
        const nextStatus = isIntern ? 'in_review' : 'completed';

        // Actualización optimista para feedback instantáneo en el tablero
        setBoardTasks((currentTasks) =>
            currentTasks.map((t) =>
                Number(t.id) === Number(task.id)
                    ? { ...t, status: nextStatus }
                    : t,
            ),
        );

        router.post(
            `/tareas/${task.id}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (closePanel) {
                        setSelectedTask(null);
                    }
                    toast({
                        title: isIntern ? 'Tarea entregada' : 'Tarea completada',
                        description: `"${task.title}" se ha marcado como ${isIntern ? 'en revisión' : 'completada'}.`,
                    });
                },
            },
        );
    };

    const persistBoardOrder = (nextTasks: any[]) => {
        router.patch(
            '/tareas/board-order',
            {
                items: buildBoardOrderPayload(nextTasks),
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const filteredBoardTasks = useMemo(() => {
        return boardTasks.filter((task: any) => {
            if (boardFilter === 'urgent') {
                const due = dueStatus(task.due_date);
                return due === 'overdue' || due === 'soon';
            }

            if (boardFilter === 'high') {
                return task.priority === 'high';
            }

            if (boardFilter === 'review') {
                return task.status === 'in_review';
            }

            if (boardFilter === 'unassigned') {
                return !task.interns?.length;
            }

            return true;
        });
    }, [boardFilter, boardTasks]);

    const tasksByStatus = useMemo(() => {
        const map: Record<string, any[]> = {};
        KANBAN_COLUMNS.forEach((col) => (map[col.key] = []));
        filteredBoardTasks.forEach((task: any) => {
            const key = task.status || 'pending';
            if (!map[key]) map[key] = [];
            map[key].push(task);
        });
        return map;
    }, [filteredBoardTasks]);

    const updateTaskStatus = (
        task: any,
        newStatus: string,
        closePanel = false,
        rejectReason?: string,
    ) => {
        if (!task) return;

        const currentTask = boardTasks.find(
            (current) => Number(current.id) === Number(task.id),
        );
        const previousStatus = String(
            currentTask?.status ?? task.status ?? 'pending',
        );

        if (previousStatus === newStatus) return;

        const resolvedRejectReason =
            newStatus === 'rejected'
                ? (rejectReason ??
                    window.prompt('Indica el motivo del rechazo:') ??
                    '')
                : '';

        if (newStatus === 'rejected' && !resolvedRejectReason.trim()) {
            return;
        }

        const nextStatusLabel = getTaskStatusLabel(String(newStatus));
        setLastMoveMessage(`"${task.title}" pasa a ${nextStatusLabel}.`);
        setHoveredColumn(null);
        setHighlightedTaskId(Number(task.id));
        setBoardTasks((currentTasks) =>
            currentTasks.map((currentTask) =>
                Number(currentTask.id) === Number(task.id)
                    ? { ...currentTask, status: newStatus }
                    : currentTask,
            ),
        );

        router.patch(
            `/tareas/${task.id}/status`,
            {
                status: newStatus,
                reject_reason:
                    newStatus === 'rejected' ? resolvedRejectReason : undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (closePanel) {
                        setSelectedTask(null);
                    }

                    toast({
                        title: 'Estado actualizado',
                        description: `"${task.title}" ahora está en ${nextStatusLabel}.`,
                    });
                },
            },
        );
    };

    const columns = useMemo(
        () => [
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
                render: (task: any) => (
                    <div className="flex items-center gap-2 font-medium text-sidebar dark:text-white/80">
                        <div className={cn("h-2 w-2 rounded-full shrink-0", {
                            'bg-slate-300': task.status === 'pending',
                            'bg-blue-400': task.status === 'in_progress',
                            'bg-violet-400': task.status === 'in_review',
                            'bg-emerald-500': task.status === 'completed',
                            'bg-rose-500': task.status === 'rejected',
                        })} />
                        <span className="text-xs uppercase tracking-wider">{getTaskStatusLabel(task.status)}</span>
                    </div>
                ),
            },
            {
                key: 'priority',
                label: 'Prioridad',
                sortKey: 'priority',
                render: (task: any) => (
                    <div className="flex items-center gap-2 font-medium text-sidebar dark:text-white/80">
                        <div className={cn("h-2 w-2 rounded-full shrink-0", {
                            'bg-rose-500': task.priority === 'high',
                            'bg-amber-400': task.priority === 'medium',
                            'bg-emerald-400': task.priority === 'low',
                        })} />
                        <span className="text-xs uppercase tracking-wider">{getTaskPriorityLabel(task.priority)}</span>
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
                    
                    const dotClass = isCompleted
                        ? 'bg-emerald-500'
                        : status === 'overdue'
                            ? 'bg-rose-500'
                            : status === 'soon'
                                ? 'bg-amber-400'
                                : 'bg-sidebar/20';

                    const smartLabel = isCompleted
                        ? formatDateEs(task.due_date)
                        : status === 'overdue'
                            ? 'Atrasada'
                            : status === 'soon'
                                ? 'Pronto'
                                : formatDateEs(task.due_date);

                    return task.due_date ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 font-medium text-sidebar dark:text-white/80 cursor-default">
                                    <div className={cn("h-2 w-2 rounded-full shrink-0", dotClass)} />
                                    <span className="text-xs uppercase tracking-wider">{smartLabel}</span>
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
        ],
        [isIntern],
    );

    const activeFilterChips = useMemo(() => {
        const chips = [];

        if (filters.search)
            chips.push({ key: 'search', label: `Buscar: ${filters.search}` });
        if (filters.status)
            chips.push({
                key: 'status',
                label: `Estado: ${getTaskStatusLabel(filters.status)}`,
            });
        if (filters.practice_type) {
            const typeName = practice_types.find(
                (type: any) =>
                    String(type.id) === String(filters.practice_type),
            )?.name;
            if (typeName) {
                chips.push({
                    key: 'practice_type',
                    label: `Tipo: ${typeName}`,
                });
            }
        }
        if (filters.intern_id) {
            const internName = interns.find(
                (intern) => String(intern.id) === String(filters.intern_id),
            )?.name;
            if (internName) {
                chips.push({
                    key: 'intern_id',
                    label: `Becario: ${internName}`,
                });
            }
        }
        if (filters.due_from)
            chips.push({
                key: 'due_from',
                label: `Desde: ${formatDateEs(filters.due_from)}`,
            });
        if (filters.due_to)
            chips.push({
                key: 'due_to',
                label: `Hasta: ${formatDateEs(filters.due_to)}`,
            });

        return chips;
    }, [filters, interns, practice_types]);

    const boardQuickFilters = useMemo(
        () => [
            { key: 'all' as const, label: 'Todas', count: tasks.data.length },
            {
                key: 'urgent' as const,
                label: 'Urgentes',
                count: tasks.data.filter((task: any) => {
                    const due = dueStatus(task.due_date);
                    return due === 'overdue' || due === 'soon';
                }).length,
            },
            {
                key: 'high' as const,
                label: 'Alta prioridad',
                count: tasks.data.filter(
                    (task: any) => task.priority === 'high',
                ).length,
            },
            {
                key: 'review' as const,
                label: 'En revisión',
                count: tasks.data.filter(
                    (task: any) => task.status === 'in_review',
                ).length,
            },
            {
                key: 'unassigned' as const,
                label: 'Sin asignar',
                count: tasks.data.filter((task: any) => !task.interns?.length)
                    .length,
            },
        ],
        [tasks.data],
    );

    const headerMetrics = useMemo(
        () => [
            {
                label: 'Resultados',
                value: tasks.total,
                hint: 'Total según filtros actuales',
            },
            {
                label: 'Pendientes',
                value: tasks.data.filter(
                    (task: any) => task.status === 'pending',
                ).length,
                hint: 'En esta página',
            },
            {
                label: 'En revisión',
                value: tasks.data.filter(
                    (task: any) => task.status === 'in_review',
                ).length,
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
        ],
        [tasks.data, tasks.total],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tareas" />

            <div className="flex flex-col gap-3">
                <ModuleHeader
                    title="Tareas"
                    description="Sigue el trabajo por estado, detecta entregas sensibles y cambia entre kanban y tabla según el momento."
                    icon={<KanbanSquare className="h-6 w-6" />}
                    metrics={headerMetrics}
                    actions={
                        <div className="flex items-center gap-3">
                            {isTutor && (
                                <HeaderActionButton 
                                    label="Nueva tarea"
                                    href="/tareas/create"
                                />
                            )}
                            <ToggleGroup
                                type="single"
                                value={viewMode}
                                onValueChange={(value) => {
                                    if (value) setViewMode(value as TaskViewMode);
                                }}
                                className="bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md"
                            >
                                <ToggleGroupItem
                                    value="kanban"
                                    className="rounded-xl px-4 h-9 text-white data-[state=on]:bg-white data-[state=on]:text-sidebar data-[state=on]:shadow-lg transition-all min-w-[200px]"
                                    aria-label="Vista kanban"
                                >
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tablero</span>
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="table"
                                    className="rounded-xl px-4 h-9 text-white data-[state=on]:bg-white data-[state=on]:text-sidebar data-[state=on]:shadow-lg transition-all min-w-[200px]"
                                    aria-label="Vista tabla"
                                >
                                    <List className="h-4 w-4 mr-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Lista</span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    }
                />

                <TaskFilters
                    filters={filters}
                    practice_types={practice_types}
                    interns={interns}
                    tasksCount={tasks.data.length}
                    totalTasks={tasks.total}
                    onFilterChange={handleFilter}
                    onClearFilter={clearFilter}
                    onClearAll={clearAllFilters}
                    activeFilterChips={activeFilterChips}
                />

                {viewMode === 'kanban' ? (
                    <KanbanBoard
                        boardTasks={boardTasks}
                        tasksByStatus={tasksByStatus}
                        sensors={sensors}
                        activeDragTask={activeDragTask}
                        lastMoveMessage={lastMoveMessage}
                        highlightedTaskId={highlightedTaskId}
                        boardFilter={boardFilter}
                        boardQuickFilters={boardQuickFilters}
                        isIntern={isIntern}
                        isTutor={isTutor}
                        onBoardFilterChange={setBoardFilter}
                        onDragStart={({ active }) => {
                            const taskId = parseTaskSortableId(active.id);
                            if (taskId) setActiveDragTask(boardTasks.find(t => t.id === taskId) || null);
                        }}
                        onDragOver={(event) => {
                            const activeTaskId = parseTaskSortableId(event.active.id);
                            if (activeTaskId && event.over) {
                                setBoardTasks((prev) => reorderBoardTasks(prev, activeTaskId, String(event.over?.id)));
                            }
                        }}
                        onDragEnd={(event) => {
                            const activeTaskId = parseTaskSortableId(event.active.id);
                            if (activeTaskId && event.over) {
                                const originalTask = boardTasks.find(t => Number(t.id) === activeTaskId);
                                setBoardTasks((prev) => {
                                    const newTasks = reorderBoardTasks(prev, activeTaskId, String(event.over?.id));
                                    const movedTask = newTasks.find(t => t.id === activeTaskId);
                                    if (movedTask && originalTask) updateTaskStatus(originalTask, movedTask.status);
                                    persistBoardOrder(newTasks);
                                    return newTasks;
                                });
                            }
                            setActiveDragTask(null);
                        }}
                        onDragCancel={() => {
                            setHoveredColumn(null);
                            setActiveDragTask(null);
                            setBoardTasks(applyStoredKanbanOrder(tasks.data));
                        }}
                        onComplete={completeTask}
                        onOpenDetails={setSelectedTask}
                        hoveredColumn={hoveredColumn}
                        getTaskSortableId={getTaskSortableId}
                        getColumnDropId={getColumnDropId}
                    />
                ) : (
                    <SimpleTable
                        columns={columns}
                        rows={tasks.data}
                        rowKey={(row) => row.id}
                        sortKey={filters.sort}
                        sortDirection={filters.direction}
                        onSort={handleSort}
                        emptyTitle="No hay tareas en esta vista"
                        emptyDescription="Ajusta los filtros, cambia a otra vista o crea una nueva tarea para empezar a mover el tablero."
                        striped={true}
                    />
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                        Página {tasks.current_page} de {tasks.last_page}
                    </span>
                    <Pagination links={tasks.links} />
                </div>
            </div>

            <TaskQuickViewSheet
                task={selectedTask}
                open={Boolean(selectedTask)}
                onOpenChange={(open) => {
                    if (!open) setSelectedTask(null);
                }}
                canEdit={!isIntern}
                canComplete={isTutor || isIntern}
                completeLabel={isTutor ? 'Completar' : 'Entregar'}
                completeStatuses={
                    isTutor ? ['in_review'] : ['pending', 'in_progress']
                }
                onComplete={(task) => completeTask(task, true)}
                onMoveTask={
                    !isIntern
                        ? (task, status) => updateTaskStatus(task, status, true)
                        : undefined
                }
                availableStatuses={KANBAN_COLUMNS}
            />
        </AppLayout>
    );
}
