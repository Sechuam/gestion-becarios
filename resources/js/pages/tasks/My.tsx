import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { KanbanSquare, LayoutGrid, List, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import TaskQuickViewSheet from '@/components/tasks/TaskQuickViewSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs } from '@/lib/date-format';
import {
    getTaskPriorityLabel,
    getTaskPriorityTone,
    getTaskStatusLabel,
    getTaskStatusTone,
} from '@/lib/task-labels';
import type { BreadcrumbItem } from '@/types/navigation';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { KANBAN_COLUMNS, KANBAN_WIP_LIMIT, TaskViewMode, BoardQuickFilter } from '@/lib/task-constants';
import { dueStatus, parseTaskSortableId } from '@/lib/task-utils';

type Props = {
    tasks: any;
    filters: any;
    practice_types: any[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis tareas', href: '/tareas/mis' },
];



export default function My({
    tasks,
    filters = {},
    practice_types = [],
}: Props) {
    const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
        if (typeof window === 'undefined') return 'kanban';

        const savedView = window.localStorage.getItem('tasks-my-view-mode');

        return savedView === 'table' ? 'table' : 'kanban';
    });
    const { auth } = usePage().props as any;
    const isIntern =
        auth?.user?.roles?.includes('intern') ||
        auth?.user?.roles?.includes('becario');
    const [boardFilter, setBoardFilter] = useState<BoardQuickFilter>('all');
    const [lastMoveMessage, setLastMoveMessage] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
    const [highlightedTaskId, setHighlightedTaskId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem('tasks-my-view-mode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        if (highlightedTaskId === null) return;

        const timeoutId = window.setTimeout(() => {
            setHighlightedTaskId(null);
        }, 650);

        return () => window.clearTimeout(timeoutId);
    }, [highlightedTaskId]);

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === 'all') {
            delete newFilters[key];
        }
        router.get('/tareas/mis', newFilters, {
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
            '/tareas/mis',
            { ...filters, sort: key, direction: nextDir },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        router.get('/tareas/mis', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearAllFilters = () => {
        router.get('/tareas/mis', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const filteredBoardTasks = useMemo(() => {
        return tasks.data.filter((task: any) => {
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

            return true;
        });
    }, [boardFilter, tasks.data]);

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
    ) => {
        if (!task || task.status === newStatus) return;

        const nextStatusLabel = getTaskStatusLabel(String(newStatus));
        setLastMoveMessage(`"${task.title}" pasa a ${nextStatusLabel}.`);
        setHoveredColumn(null);
        setHighlightedTaskId(Number(task.id));

        router.patch(
            `/tareas/${task.id}/status`,
            { status: newStatus },
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
                    <Badge
                        variant="outline"
                        className={getTaskStatusTone(task.status)}
                    >
                        {getTaskStatusLabel(task.status)}
                    </Badge>
                ),
            },
            {
                key: 'priority',
                label: 'Prioridad',
                sortKey: 'priority',
                render: (task: any) => (
                    <Badge
                        variant="outline"
                        className={getTaskPriorityTone(task.priority)}
                    >
                        {getTaskPriorityLabel(task.priority)}
                    </Badge>
                ),
            },
            {
                key: 'due_date',
                label: 'Entrega',
                sortKey: 'due_date',
                render: (task: any) => {
                    const status = dueStatus(task.due_date);
                    const tone =
                        status === 'overdue'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : status === 'soon'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-transparent text-muted-foreground border-transparent';
                    const smartLabel =
                        status === 'overdue'
                            ? 'Atrasada'
                            : status === 'soon'
                              ? 'Pronto'
                              : formatDateEs(task.due_date);
                    return task.due_date ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}
                                >
                                    {smartLabel}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                Fecha exacta: {formatDateEs(task.due_date)}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        '—'
                    );
                },
            },
        ],
        [],
    );

    const activeFilterChips = useMemo(() => {
        const chips = [];

        if (filters.search) chips.push({ key: 'search', label: `Buscar: ${filters.search}` });
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
        if (filters.due_from) chips.push({ key: 'due_from', label: `Desde: ${formatDateEs(filters.due_from)}` });
        if (filters.due_to) chips.push({ key: 'due_to', label: `Hasta: ${formatDateEs(filters.due_to)}` });

        return chips;
    }, [filters, practice_types]);

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
                count: tasks.data.filter((task: any) => task.priority === 'high')
                    .length,
            },
            {
                key: 'review' as const,
                label: 'En revisión',
                count: tasks.data.filter(
                    (task: any) => task.status === 'in_review',
                ).length,
            },
        ],
        [tasks.data],
    );

    const submitTask = (selectedTask: any) =>
        router.post(
            `/tareas/${selectedTask.id}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    {
                        setSelectedTask(null);
                        toast({
                            title: 'Tarea entregada',
                            description: `"${selectedTask.title}" se ha enviado a revisión.`,
                        });
                    },
            },
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis tareas" />

            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Mis tareas"
                    description="Tu tablero personal de ejecución, con foco en entregas cercanas, revisión y cierre rápido."
                    icon={<KanbanSquare className="h-6 w-6" />}
                    metrics={[
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
                                const due = dueStatus(task.due_date);
                                return due === 'overdue' || due === 'soon';
                            }).length,
                            hint: 'Atrasadas o próximas',
                        },
                    ]}
                    actions={
                        <ToggleGroup
                            type="single"
                            value={viewMode}
                            onValueChange={(value) => {
                                if (value === 'kanban' || value === 'table') {
                                    setViewMode(value);
                                }
                            }}
                            className="bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md"
                        >
                            <ToggleGroupItem
                                value="kanban"
                                className="rounded-xl px-4 h-10 text-white data-[state=on]:bg-white data-[state=on]:text-sidebar data-[state=on]:shadow-lg transition-all"
                                aria-label="Vista kanban"
                                title="Vista kanban"
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Tablero</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="table"
                                className="rounded-xl px-4 h-10 text-white data-[state=on]:bg-white data-[state=on]:text-sidebar data-[state=on]:shadow-lg transition-all"
                                aria-label="Vista tabla"
                                title="Vista tabla"
                            >
                                <List className="h-4 w-4 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Lista</span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    }
                />

                <TaskFilters
                    filters={filters}
                    practice_types={practice_types}
                    tasksCount={tasks.data.length}
                    totalTasks={tasks.total}
                    onFilterChange={handleFilter}
                    onClearFilter={clearFilter}
                    onClearAll={clearAllFilters}
                    activeFilterChips={activeFilterChips}
                />

                {viewMode === 'kanban' ? (
                    <KanbanBoard
                        boardTasks={tasks.data}
                        tasksByStatus={tasksByStatus}
                        sensors={sensors}
                        activeDragTask={null} // En My.tsx simplificamos el overlay para acelerar
                        lastMoveMessage={lastMoveMessage}
                        highlightedTaskId={highlightedTaskId}
                        boardFilter={boardFilter}
                        boardQuickFilters={boardQuickFilters}
                        isIntern={isIntern}
                        isTutor={false}
                        onBoardFilterChange={setBoardFilter}
                        onDragStart={() => setHoveredColumn(null)}
                        onDragOver={(event) => {
                            setHoveredColumn(
                                typeof event.over?.id === 'string'
                                    ? String(event.over.id)
                                    : null,
                            );
                        }}
                        onDragEnd={(event) => {
                            if (isIntern) return;
                            const { active, over } = event;
                            if (!over) {
                                setHoveredColumn(null);
                                return;
                            }
                            const taskId = parseTaskSortableId(active.id);
                            const newStatus = over.id;
                            const movedTask = tasks.data.find(
                                (task: any) => task.id === taskId,
                            );
                            if (!movedTask || movedTask.status === newStatus) {
                                setHoveredColumn(null);
                                return;
                            }
                            updateTaskStatus(movedTask, String(newStatus));
                        }}
                        onDragCancel={() => setHoveredColumn(null)}
                        onComplete={submitTask}
                        onOpenDetails={setSelectedTask}
                        hoveredColumn={hoveredColumn}
                        getTaskSortableId={(id) => `task-${id}`}
                        getColumnDropId={(status) => status}
                    />
                ) : (
                    <SimpleTable
                        columns={columns}
                        rows={tasks.data}
                        rowKey={(row) => row.id}
                        sortKey={filters.sort}
                        sortDirection={filters.direction}
                        onSort={handleSort}
                        striped={true}
                    />
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-sm font-medium text-muted-foreground">
                        Página {tasks.current_page ?? 1} de {tasks.last_page ?? 1}
                    </span>
                    <div className="flex items-center gap-2">
                        {tasks.links.map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveState
                                className={`rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                                    link.active
                                        ? 'scale-105 transform border-sidebar bg-sidebar text-sidebar-foreground shadow-md'
                                        : 'border-border bg-card text-muted-foreground hover:border-sidebar/40 hover:bg-muted'
                                } ${!link.url ? 'pointer-events-none opacity-30' : ''}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label
                                        .replace('Previous', 'Anterior')
                                        .replace('Next', 'Siguiente'),
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <TaskQuickViewSheet
                task={selectedTask}
                open={Boolean(selectedTask)}
                onOpenChange={(open) => {
                    if (!open) setSelectedTask(null);
                }}
                canComplete={isIntern}
                completeLabel="Entregar"
                onComplete={submitTask}
                onMoveTask={
                    !isIntern
                        ? (task, status) =>
                              updateTaskStatus(task, status, true)
                        : undefined
                }
                availableStatuses={KANBAN_COLUMNS}
            />
        </AppLayout>
    );
}
