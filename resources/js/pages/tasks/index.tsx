import {
    pointerWithin,
    closestCenter,
    DndContext,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
    DragOverlay,
    type DragEndEvent,
    type DragOverEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    KanbanSquare,
    LayoutGrid,
    List,
    PlusCircle,
    Search,
    Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ActiveFilterChips } from '@/components/common/ActiveFilterChips';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import { TableActionMenu } from '@/components/common/TableActionMenu';
import AssignedInternsStack from '@/components/tasks/AssignedInternsStack';
import KanbanTaskCard from '@/components/tasks/KanbanTaskCard';
import TaskQuickViewSheet from '@/components/tasks/TaskQuickViewSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

const KANBAN_COLUMNS = [
    { key: 'pending', label: 'Pendiente' },
    { key: 'in_progress', label: 'En progreso' },
    { key: 'in_review', label: 'En revisión' },
    { key: 'completed', label: 'Completada' },
    { key: 'rejected', label: 'Rechazada' },
];
const KANBAN_ORDER_STORAGE_KEY = 'tasks-index-kanban-order';

type TaskViewMode = 'kanban' | 'table';
type BoardQuickFilter = 'all' | 'urgent' | 'high' | 'review' | 'unassigned';
const KANBAN_WIP_LIMIT = 6;

function DroppableColumn({
    id,
    label,
    hovered = false,
    children,
}: {
    id: string;
    label: string;
    hovered?: boolean;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`relative flex min-h-[24rem] flex-1 flex-col rounded-2xl transition-all border border-sidebar/20 bg-background shadow-sm ${isOver || hovered ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-sidebar/30'
                }`}
        >
            {(isOver || hovered) && (
                <div className="absolute top-2 left-2 right-2 z-10 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary backdrop-blur-sm pointer-events-none">
                    Suelta para mover a {label.toLowerCase()}
                </div>
            )}
            <div className={`flex flex-1 flex-col ${(isOver || hovered) ? 'pt-12' : ''} transition-all`}>
                {children}
            </div>
        </div>
    );
}

const dueStatus = (dueDate?: string | null) => {
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

const getTaskSortableId = (taskId: number | string) => `task-${taskId}`;
const getColumnDropId = (status: string) => `column-${status}`;

const parseTaskSortableId = (value: unknown) => {
    if (typeof value !== 'string' || !value.startsWith('task-')) return null;
    const id = Number(value.slice(5));
    return Number.isNaN(id) ? null : id;
};

const parseColumnDropId = (value: unknown) => {
    if (typeof value !== 'string' || !value.startsWith('column-')) return null;
    return value.slice(7);
};

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

    const isTutor = auth?.user?.roles?.includes('tutor');

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

            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Tareas"
                    description="Sigue el trabajo por estado, detecta entregas sensibles y cambia entre kanban y tabla según el momento."
                    icon={<KanbanSquare className="h-6 w-6" />}
                    metrics={headerMetrics}
                    actions={
                        <>
                            {isTutor && (
                                <Button
                                    className="gap-2"
                                    onClick={() => router.get('/tareas/create')}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Nueva tarea
                                </Button>
                            )}
                            <ToggleGroup
                                type="single"
                                value={viewMode}
                                onValueChange={(value) => {
                                    if (
                                        value === 'kanban' ||
                                        value === 'table'
                                    ) {
                                        setViewMode(value);
                                    }
                                }}
                                variant="outline"
                                size="sm"
                                className="rounded-lg border border-sidebar bg-card/80 p-0.5 shadow-sm"
                            >
                                <ToggleGroupItem
                                    value="kanban"
                                    className="rounded-md px-2"
                                    aria-label="Vista kanban"
                                    title="Vista kanban"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="table"
                                    className="rounded-md px-2"
                                    aria-label="Vista tabla"
                                    title="Vista tabla"
                                >
                                    <List className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </>
                    }
                />

                <div className="filter-panel space-y-4 p-5">
                    {/* Fila 1: Búsqueda */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative max-w-md min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por título..."
                                className="border-sidebar/40 bg-background pl-9 text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors"
                                onChange={(e) =>
                                    handleFilter('search', e.target.value)
                                }
                            />
                        </div>

                        <p className="ml-auto text-sm font-medium whitespace-nowrap text-muted-foreground">
                            Mostrando {tasks.data.length} de {tasks.total}{' '}
                            tareas
                        </p>
                    </div>

                    {/* Fila 2: Filtros */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Estado
                            </label>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(v) => handleFilter('status', v)}
                            >
                                <SelectTrigger className="w-[160px] border-sidebar/40 bg-background text-foreground">
                                    <SelectValue>
                                        {{
                                            pending: 'Pendiente',
                                            in_progress: 'En progreso',
                                            in_review: 'En revisión',
                                            completed: 'Completada',
                                            rejected: 'Rechazada',
                                        }[filters.status as string] || 'Todos'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los estados
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pendiente
                                    </SelectItem>
                                    <SelectItem value="in_progress">
                                        En progreso
                                    </SelectItem>
                                    <SelectItem value="in_review">
                                        En revisión
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completada
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rechazada
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Tipo
                            </label>
                            <Select
                                value={filters.practice_type || 'all'}
                                onValueChange={(v) =>
                                    handleFilter('practice_type', v)
                                }
                            >
                                <SelectTrigger className="w-[220px] border-sidebar/40 bg-background text-foreground [&>span]:truncate">
                                    <SelectValue>
                                        {filters.practice_type &&
                                            filters.practice_type !== 'all'
                                            ? practice_types.find(
                                                (p) =>
                                                    p.id.toString() ===
                                                    filters.practice_type?.toString(),
                                            )?.name
                                            : 'Todos'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los tipos
                                    </SelectItem>
                                    {practice_types.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id.toString()}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Becario
                            </label>
                            <Select
                                value={filters.intern_id || 'all'}
                                onValueChange={(v) =>
                                    handleFilter('intern_id', v)
                                }
                            >
                                <SelectTrigger className="w-[200px] border-sidebar/40 bg-background text-foreground [&>span]:truncate">
                                    <SelectValue>
                                        {filters.intern_id &&
                                            filters.intern_id !== 'all'
                                            ? interns.find(
                                                (intern) =>
                                                    String(intern.id) ===
                                                    String(filters.intern_id),
                                            )?.name || 'Todos'
                                            : 'Todos'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los becarios
                                    </SelectItem>
                                    {interns.map((intern) => (
                                        <SelectItem
                                            key={intern.id}
                                            value={String(intern.id)}
                                        >
                                            {intern.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Desde
                            </label>
                            <DatePicker
                                value={filters.due_from || ''}
                                onChange={(value) =>
                                    handleFilter('due_from', value)
                                }
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Hasta
                            </label>
                            <DatePicker
                                value={filters.due_to || ''}
                                onChange={(value) =>
                                    handleFilter('due_to', value)
                                }
                            />
                        </div>
                    </div>
                </div>

                <ActiveFilterChips
                    chips={activeFilterChips}
                    onRemove={clearFilter}
                    onClearAll={clearAllFilters}
                />

                {viewMode === 'kanban' ? (
                    <div className="space-y-4">
                        <div className="app-panel flex flex-wrap items-center justify-between gap-3 p-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {boardQuickFilters.map((filter) => (
                                    <Button
                                        key={filter.key}
                                        type="button"
                                        variant={
                                            boardFilter === filter.key
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        className="gap-2"
                                        onClick={() =>
                                            setBoardFilter(filter.key)
                                        }
                                    >
                                        {filter.label}
                                        <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
                                            {filter.count}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Sparkles className="h-3.5 w-3.5" />
                                Vista operativa con filtros rápidos y acciones
                                directas.
                            </div>
                        </div>

                        {lastMoveMessage && (
                            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                {lastMoveMessage}
                            </div>
                        )}

                        <DndContext
                            sensors={sensors}
                            collisionDetection={pointerWithin}
                            onDragStart={({ active }) => {
                                const taskId = parseTaskSortableId(active.id);
                                if (!taskId) return;

                                const task = boardTasks.find(t => t.id === taskId);
                                setActiveDragTask(task || null);
                            }}
                            onDragOver={(event: DragOverEvent) => {
                                const { active, over } = event;
                                if (!over) return;

                                const activeTaskId = parseTaskSortableId(active.id);
                                if (!activeTaskId) return;

                                setBoardTasks((prev) =>
                                    reorderBoardTasks(prev, activeTaskId, String(over.id))
                                );
                            }}
                            onDragEnd={(event: DragEndEvent) => {
                                const { active, over } = event;

                                if (!over) {
                                    setActiveDragTask(null);
                                    return;
                                }

                                const activeTaskId = parseTaskSortableId(active.id);
                                if (!activeTaskId) return;

                                const originalTask = boardTasks.find(
                                    (task) => Number(task.id) === activeTaskId,
                                );

                                setBoardTasks((prev) => {
                                    const newTasks = reorderBoardTasks(
                                        prev,
                                        activeTaskId,
                                        String(over.id)
                                    );

                                    const movedTask = newTasks.find(t => t.id === activeTaskId);
                                    if (movedTask && originalTask) {
                                        const newStatus = movedTask.status;
                                        updateTaskStatus(originalTask, newStatus);
                                    }

                                    persistBoardOrder(newTasks);
                                    return newTasks;
                                });

                                setActiveDragTask(null);
                            }}
                            onDragCancel={() => {
                                setHoveredColumn(null);
                                setActiveDragTask(null);
                                setBoardTasks(applyStoredKanbanOrder(tasks.data));
                            }}
                        >

                            <div className="overflow-x-auto pb-2">
                                <div className="flex min-w-max gap-4">
                                    {KANBAN_COLUMNS.map((col) => (
                                        <div
                                            key={col.key}
                                            className={`flex min-h-[32rem] w-[18rem] min-w-[18rem] flex-col rounded-2xl border bg-card p-3 shadow-sm xl:w-auto xl:min-w-0 xl:flex-1 ${tasksByStatus[col.key].length >
                                                KANBAN_WIP_LIMIT
                                                ? 'border-amber-300/70'
                                                : 'border-border'
                                                }`}
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-foreground">
                                                        {col.label}
                                                    </h3>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {
                                                            tasksByStatus[col.key]
                                                                .length
                                                        }{' '}
                                                        tareas
                                                    </p>
                                                </div>
                                                {tasksByStatus[col.key].length >
                                                    KANBAN_WIP_LIMIT ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                WIP
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Esta columna supera el
                                                            límite sugerido de{' '}
                                                            {KANBAN_WIP_LIMIT}{' '}
                                                            tareas.
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : null}
                                            </div>
                                            <DroppableColumn
                                                id={getColumnDropId(col.key)}
                                                label={col.label}
                                                hovered={hoveredColumn === col.key}
                                            >
                                                <SortableContext
                                                    items={tasksByStatus[col.key].map(task => getTaskSortableId(task.id))}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {tasksByStatus[col.key].map(task => (
                                                        <KanbanTaskCard
                                                            key={task.id}
                                                            task={task}
                                                            canDrag={!isIntern}
                                                            canEdit={!isIntern}
                                                            canComplete={
                                                                isTutor || isIntern
                                                            }
                                                            completeLabel={
                                                                isTutor
                                                                    ? 'Completar'
                                                                    : 'Entregar'
                                                            }
                                                            completeStatuses={
                                                                isTutor
                                                                    ? ['in_review']
                                                                    : [
                                                                          'pending',
                                                                          'in_progress',
                                                                      ]
                                                            }
                                                            onComplete={completeTask}
                                                            onOpenDetails={setSelectedTask}
                                                            highlightMove={
                                                                highlightedTaskId ===
                                                                Number(task.id)
                                                            }
                                                        />
                                                    ))}

                                                </SortableContext>
                                            </DroppableColumn>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <DragOverlay>
                                {activeDragTask ? (
                                    <KanbanTaskCard
                                        task={activeDragTask}
                                        canDrag={false}
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
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
                    />
                )}

                <div className="flex items-center gap-2">
                    {tasks.links.map((link: any, i: number) => {
                        const label = link.label
                            .replace('Previous', 'Anterior')
                            .replace('Next', 'Siguiente');
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded border border-border px-3 py-1 text-sm ${link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: label }}
                                preserveState
                            />
                        );
                    })}
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
