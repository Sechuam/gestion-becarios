import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { SimpleTable } from '@/components/common/SimpleTable';
import DeleteTaskModal from '@/components/tasks/DeleteTaskModal';
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
import AppLayout from '@/layouts/app-layout';
import { formatDateEs } from '@/lib/date-format';
import type { BreadcrumbItem } from '@/types/navigation';

type Props = {
    tasks: any;
    filters: any;
    practice_types: any[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis tareas', href: '/tareas/mis' },
];

const KANBAN_COLUMNS = [
    { key: 'pending', label: 'Pendiente' },
    { key: 'in_progress', label: 'En progreso' },
    { key: 'in_review', label: 'En revisión' },
    { key: 'completed', label: 'Completada' },
    { key: 'rejected', label: 'Rechazada' },
];

function DroppableColumn({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-50 ${isOver ? 'bg-muted/40' : ''}`}
        >
            {children}
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

const statusLabel = (status: string) =>
    ({
        pending: 'Pendiente',
        in_progress: 'En progreso',
        in_review: 'En revisión',
        completed: 'Completada',
        rejected: 'Rechazada',
    })[status] || status;

function DraggableTask({ task }: { task: any }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });
    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;
    const status = dueStatus(task.due_date);
    const tone =
        status === 'overdue'
            ? 'border-red-200 bg-red-50/60'
            : status === 'soon'
              ? 'border-amber-200 bg-amber-50/60'
              : 'border-border bg-background';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`cursor-grab rounded-lg border p-3 text-sm active:cursor-grabbing ${tone}`}
        >
            <Link
                href={`/tareas/${task.id}`}
                className="font-semibold hover:underline"
            >
                {task.title}
            </Link>
            <p className="text-xs text-muted-foreground">
                {task.practice_type?.name || '—'}
            </p>
            {task.due_date && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                    Entrega: {formatDateEs(task.due_date)}
                </p>
            )}
        </div>
    );
}

export default function My({
    tasks,
    filters = {},
    practice_types = [],
}: Props) {
    const { auth } = usePage().props as any;
    const isIntern =
        auth?.user?.roles?.includes('intern') ||
        auth?.user?.roles?.includes('becario');
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

    const tasksByStatus = useMemo(() => {
        const map: Record<string, any[]> = {};
        KANBAN_COLUMNS.forEach((col) => (map[col.key] = []));
        tasks.data.forEach((task: any) => {
            const key = task.status || 'pending';
            if (!map[key]) map[key] = [];
            map[key].push(task);
        });
        return map;
    }, [tasks.data]);

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
                render: (task: any) => statusLabel(task.status) || '—',
            },
            {
                key: 'priority',
                label: 'Prioridad',
                sortKey: 'priority',
                render: (task: any) => task.priority || '—',
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
                    return task.due_date ? (
                        <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}
                        >
                            {formatDateEs(task.due_date)}
                        </span>
                    ) : (
                        '—'
                    );
                },
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
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-blue-50 hover:text-blue-600"
                                asChild
                            >
                                <Link href={`/tareas/${task.id}`}>
                                    <div className="flex items-center">
                                        <Eye className="mr-1.5 h-4 w-4 text-blue-500/70" />{' '}
                                        Ver
                                    </div>
                                </Link>
                            </Button>
                            {!isIntern && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-amber-50 hover:text-amber-600"
                                    asChild
                                >
                                    <Link href={`/tareas/${task.id}/edit`}>
                                        <div className="flex items-center">
                                            <Pencil className="mr-1.5 h-4 w-4 text-amber-500/70" />{' '}
                                            Editar
                                        </div>
                                    </Link>
                                </Button>
                            )}
                            {!isIntern &&
                                (canDelete ? (
                                    <DeleteTaskModal task={task} />
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-border bg-card font-medium text-muted-foreground opacity-50 shadow-none"
                                        title="Solo disponible en completadas o rechazadas"
                                    >
                                        <Trash2 className="mr-1.5 h-4 w-4 text-red-500/70" />{' '}
                                        Eliminar
                                    </Button>
                                ))}
                        </div>
                    );
                },
            },
        ],
        [isIntern],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis tareas" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="page-title">
                            Mis tareas
                        </h1>
                        <p className="page-subtitle">
                            Tareas asignadas a tu usuario.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                    <div className="relative w-full max-w-sm">
                        <Input
                            placeholder="Buscar por título..."
                            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                            onChange={(e) =>
                                handleFilter('search', e.target.value)
                            }
                        />
                    </div>

                    <div className="w-50">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => handleFilter('status', v)}
                        >
                            <SelectTrigger className="w-full border-border bg-background text-foreground">
                                <SelectValue>
                                    {{
                                        pending: 'Pendiente',
                                        in_progress: 'En progreso',
                                        in_review: 'En revisión',
                                        completed: 'Completada',
                                        rejected: 'Rechazada',
                                    }[filters.status as string] ||
                                        'Todos los estados'}
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

                    <div className="w-60">
                        <Select
                            value={filters.practice_type || 'all'}
                            onValueChange={(v) =>
                                handleFilter('practice_type', v)
                            }
                        >
                            <SelectTrigger className="w-full border-border bg-background text-foreground">
                                <SelectValue>
                                    {filters.practice_type &&
                                    filters.practice_type !== 'all'
                                        ? practice_types.find(
                                              (p) =>
                                                  p.id.toString() ===
                                                  filters.practice_type?.toString(),
                                          )?.name
                                        : 'Todos los tipos'}
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

                    <div className="w-45">
                        <DatePicker
                            value={filters.due_from || ''}
                            onChange={(value) =>
                                handleFilter('due_from', value)
                            }
                        />
                    </div>

                    <div className="w-45">
                        <DatePicker
                            value={filters.due_to || ''}
                            onChange={(value) =>
                                handleFilter('due_to', value)
                            }
                        />
                    </div>

                    <p className="ml-auto text-sm font-medium text-muted-foreground">
                        Mostrando {tasks.data.length} de {tasks.total} tareas
                    </p>
                </div>

                <DndContext
                    onDragEnd={(event) => {
                        if (isIntern) return;
                        const { active, over } = event;
                        if (!over) return;

                        const taskId = active.id;
                        const newStatus = over.id;

                        router.patch(
                            `/tareas/${taskId}/status`,
                            { status: newStatus },
                            { preserveScroll: true },
                        );
                    }}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        {KANBAN_COLUMNS.map((col) => (
                            <div
                                key={col.key}
                                className="rounded-xl border bg-card p-3"
                            >
                                <h3 className="mb-3 text-sm font-semibold text-foreground">
                                    {col.label}
                                </h3>
                                <DroppableColumn id={col.key}>
                                    <div className="space-y-3">
                                        {tasksByStatus[col.key].map(
                                            (task: any) => (
                                                <DraggableTask
                                                    key={task.id}
                                                    task={task}
                                                />
                                            ),
                                        )}
                                    </div>
                                </DroppableColumn>
                            </div>
                        ))}
                    </div>
                </DndContext>

                <SimpleTable
                    columns={columns}
                    rows={tasks.data}
                    rowKey={(row) => row.id}
                    sortKey={filters.sort}
                    sortDirection={filters.direction}
                    onSort={handleSort}
                />

                <div className="flex items-center gap-2">
                    {tasks.links.map((link: any, i: number) => {
                        const label = link.label
                            .replace('Previous', 'Anterior')
                            .replace('Next', 'Siguiente');
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded border border-border px-3 py-1 text-sm ${
                                    link.active
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
        </AppLayout>
    );
}
