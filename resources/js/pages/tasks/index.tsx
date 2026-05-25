import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Head, router, usePage } from '@inertiajs/react';
import { KanbanSquare } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MetricPills } from '@/components/common/MetricPills';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import { Pagination } from '@/components/common/Pagination';
import TaskQuickViewSheet from '@/components/tasks/TaskQuickViewSheet';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { getTaskStatusLabel } from '@/lib/task-labels';
import {
    KANBAN_COLUMNS,
    KANBAN_ORDER_STORAGE_KEY,
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
import { DeliveryLegend } from '@/components/tasks/DeliveryLegend';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TasksHeaderActions } from '@/components/tasks/TasksHeaderActions';
import { buildActiveTaskFilterChips } from '@/components/tasks/active-task-filter-chips';
import { buildKanbanQuickFilters } from '@/components/tasks/kanban-quick-filters';
import { buildTaskTableColumns } from '@/components/tasks/task-table-columns';
import { buildTaskHeaderMetrics } from '@/components/tasks/task-header-metrics';
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
    const activeIndex = currentTasks.findIndex(
        (task) => Number(task.id) === activeTaskId,
    );
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
    } else {
        const overIndex = newTasks.findIndex(
            (task) => Number(task.id) === overTaskId,
        );
        if (overIndex === -1) return currentTasks;

        const overTask = newTasks[overIndex];

        if (activeTask.status === overTask.status) {
            newTasks = arrayMove(newTasks, activeIndex, overIndex);
        } else {
            const [movedTask] = newTasks.splice(activeIndex, 1);
            movedTask.status = overTask.status;

            const newOverIndex = newTasks.findIndex(
                (task) => Number(task.id) === overTaskId,
            );
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
                        title: isIntern
                            ? 'Tarea entregada'
                            : 'Tarea completada',
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
                return (
                    (due === 'overdue' || due === 'soon') &&
                    task.status !== 'completed'
                );
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
        () => buildTaskTableColumns({ isIntern }),
        [isIntern],
    );

    const activeFilterChips = useMemo(
        () =>
            buildActiveTaskFilterChips({
                filters,
                interns,
                practiceTypes: practice_types,
            }),
        [filters, interns, practice_types],
    );

    const boardQuickFilters = useMemo(
        () => buildKanbanQuickFilters(tasks.data),
        [tasks.data],
    );

    const headerMetrics = useMemo(() => buildTaskHeaderMetrics(tasks), [tasks]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tareas" />

            <div className="flex flex-col gap-3">
                <ModuleHeader
                    title="Tareas"
                    description="Sigue el trabajo por estado, detecta entregas sensibles y cambia entre kanban y tabla según el momento."
                    icon={<KanbanSquare className="h-6 w-6" />}
                    actions={
                        <TasksHeaderActions
                            isTutor={isTutor}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            boardFilter={boardFilter}
                            boardQuickFilters={boardQuickFilters}
                            onBoardFilterChange={setBoardFilter}
                        />
                    }
                />
                <MetricPills metrics={headerMetrics} />

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
                    rightSlot={<DeliveryLegend />}
                />

                {viewMode === 'kanban' ? (
                    <KanbanBoard
                        boardTasks={boardTasks}
                        tasksByStatus={tasksByStatus}
                        sensors={sensors}
                        activeDragTask={activeDragTask}
                        lastMoveMessage={lastMoveMessage}
                        highlightedTaskId={highlightedTaskId}
                        isIntern={isIntern}
                        isTutor={isTutor}
                        onDragStart={({ active }) => {
                            const taskId = parseTaskSortableId(active.id);
                            if (taskId)
                                setActiveDragTask(
                                    boardTasks.find((t) => t.id === taskId) ||
                                        null,
                                );
                        }}
                        onDragOver={(event) => {
                            const activeTaskId = parseTaskSortableId(
                                event.active.id,
                            );
                            if (activeTaskId && event.over) {
                                setBoardTasks((prev) =>
                                    reorderBoardTasks(
                                        prev,
                                        activeTaskId,
                                        String(event.over?.id),
                                    ),
                                );
                            }
                        }}
                        onDragEnd={(event) => {
                            const activeTaskId = parseTaskSortableId(
                                event.active.id,
                            );
                            if (activeTaskId && event.over) {
                                const originalTask = boardTasks.find(
                                    (t) => Number(t.id) === activeTaskId,
                                );
                                setBoardTasks((prev) => {
                                    const newTasks = reorderBoardTasks(
                                        prev,
                                        activeTaskId,
                                        String(event.over?.id),
                                    );
                                    const movedTask = newTasks.find(
                                        (t) => t.id === activeTaskId,
                                    );
                                    if (movedTask && originalTask)
                                        updateTaskStatus(
                                            originalTask,
                                            movedTask.status,
                                        );
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

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
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
