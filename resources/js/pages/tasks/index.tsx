import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleTable } from '@/components/common/SimpleTable';
import DeleteTaskModal from '@/components/tasks/DeleteTaskModal';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { formatDateEs } from '@/lib/date-format';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

type Props = {
    tasks: any;
    filters: any;
    practice_types: any[];
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

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`min-h-50 ${isOver ? 'bg-muted/40' : ''}`}>
            {children}
        </div>
    );
}

const dueStatus = (dueDate?: string | null) => {
    if (!dueDate) return 'none';
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const due = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(due.getTime())) return 'none';
    const diffDays = Math.ceil((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'soon';
    return 'none';
};

function DraggableTask({ task }: { task: any }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    const status = dueStatus(task.due_date);
    const tone = status === 'overdue'
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
            className={`rounded-lg border p-3 text-sm cursor-grab active:cursor-grabbing ${tone}`}
        >
            <Link href={`/tareas/${task.id}`} className="font-semibold hover:underline">
                {task.title}
            </Link>
            <p className="text-xs text-muted-foreground">{task.practice_type?.name || '—'}</p>
            {task.due_date && (
                <p className="text-[11px] mt-1 text-muted-foreground">Entrega: {formatDateEs(task.due_date)}</p>
            )}
        </div>
    );
}

export default function Index({ tasks, filters = {}, practice_types = [] }: Props) {
    const { auth } = usePage().props as any;
    const isIntern = auth?.user?.roles?.includes('intern');
    const statusLabel = (status: string) => ({
        pending: 'Pendiente',
        in_progress: 'En progreso',
        in_review: 'En revisión',
        completed: 'Completada',
        rejected: 'Rechazada',
    }[status] || status);
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
                render: (task: any) => (
                    <div className="flex flex-col gap-1">
                        <Link href={`/tareas/${task.id}`} className="font-semibold text-foreground hover:underline">
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
                render: (task: any) => task.practice_type?.name || '—',
            },
            {
                key: 'status',
                label: 'Estado',
                render: (task: any) => statusLabel(task.status) || '—',
            },
            {
                key: 'priority',
                label: 'Prioridad',
                render: (task: any) => task.priority || '—',
            },
            {
                key: 'due_date',
                label: 'Entrega',
                render: (task: any) => {
                    const status = dueStatus(task.due_date);
                    const tone = status === 'overdue'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : status === 'soon'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-transparent text-muted-foreground border-transparent';
                    return task.due_date ? (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>
                            {formatDateEs(task.due_date)}
                        </span>
                    ) : '—';
                },
            },
            {
                key: 'interns',
                label: 'Asignados',
                render: (task: any) =>
                    task.interns?.length
                        ? task.interns.map((i: any) => i.user?.name).join(', ')
                        : '—',
            },
            {
                key: 'actions',
                label: 'Acciones',
                render: (task: any) => {
                    const statusValue = String(task.status ?? '').toLowerCase();
                    const canDelete = ['completed', 'rejected', 'completada', 'rechazada'].includes(statusValue);

                    return (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-card text-muted-foreground border-border hover:text-blue-600 hover:bg-blue-50 font-medium shadow-none"
                                asChild
                            >
                                <Link href={`/tareas/${task.id}`}>
                                    <div className="flex items-center">
                                        <Eye className="w-4 h-4 mr-1.5 text-blue-500/70" /> Ver
                                    </div>
                                </Link>
                            </Button>
                            {!isIntern && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-card text-muted-foreground border-border hover:text-amber-600 hover:bg-amber-50 font-medium shadow-none"
                                    asChild
                                >
                                    <Link href={`/tareas/${task.id}/edit`}>
                                        <div className="flex items-center">
                                            <Pencil className="w-4 h-4 mr-1.5 text-amber-500/70" /> Editar
                                        </div>
                                    </Link>
                                </Button>
                            )}
                            {!isIntern && (canDelete ? (
                                <DeleteTaskModal task={task} />
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-card text-muted-foreground border-border font-medium shadow-none opacity-50"
                                    title="Solo disponible en completadas o rechazadas"
                                >
                                    <Trash2 className="w-4 h-4 mr-1.5 text-red-500/70" /> Eliminar
                                </Button>
                            ))}
                        </div>
                    );
                },
            },
        ],
        []
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tareas" />

            <div className="flex flex-col gap-6 p-6 bg-background text-foreground">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tareas</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestión de tareas y seguimiento por estado.
                        </p>
                    </div>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white" asChild>
                        <Link href="/tareas/create">Nueva tarea</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Input
                            placeholder="Buscar por título..."
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                            onChange={(e) => handleFilter('search', e.target.value)}
                        />
                    </div>

                    <div className="w-50">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => handleFilter('status', v)}
                        >
                            <SelectTrigger className="w-full bg-background border-border text-foreground">
                                <SelectValue>
                                    {{
                                        pending: 'Pendiente',
                                        in_progress: 'En progreso',
                                        in_review: 'En revisión',
                                        completed: 'Completada',
                                        rejected: 'Rechazada',
                                    }[filters.status as string] || 'Todos los estados'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="in_progress">En progreso</SelectItem>
                                <SelectItem value="in_review">En revisión</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                                <SelectItem value="rejected">Rechazada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-60">
                        <Select
                            value={filters.practice_type || 'all'}
                            onValueChange={(v) => handleFilter('practice_type', v)}
                        >
                            <SelectTrigger className="w-full bg-background border-border text-foreground">
                                <SelectValue>
                                    {filters.practice_type && filters.practice_type !== 'all'
                                        ? practice_types.find(p => p.id.toString() === filters.practice_type?.toString())?.name
                                        : 'Todos los tipos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                {practice_types.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-45">
                        <Input
                            type="date"
                            className="bg-background border-border text-foreground"
                            value={filters.due_from || ''}
                            onChange={(e) => handleFilter('due_from', e.target.value)}
                        />
                    </div>

                    <div className="w-45">
                        <Input
                            type="date"
                            className="bg-background border-border text-foreground"
                            value={filters.due_to || ''}
                            onChange={(e) => handleFilter('due_to', e.target.value)}
                        />
                    </div>

                    <p className="text-sm text-muted-foreground ml-auto font-medium">
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

                        router.patch(`/tareas/${taskId}/status`, { status: newStatus }, { preserveScroll: true });
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {KANBAN_COLUMNS.map((col) => (
                            <div key={col.key} className="rounded-xl border bg-card p-3">
                                <h3 className="text-sm font-semibold text-foreground mb-3">{col.label}</h3>
                                <DroppableColumn id={col.key}>
                                    <div className="space-y-3">
                                        {tasksByStatus[col.key].map((task: any) => (
                                            <DraggableTask key={task.id} task={task} />
                                        ))}
                                    </div>
                                </DroppableColumn>
                            </div>
                        ))}
                    </div>
                </DndContext>

                <SimpleTable columns={columns} rows={tasks.data} rowKey={(row) => row.id} />

                <div className="flex items-center gap-2">
                    {tasks.links.map((link: any, i: number) => {
                        const label = link.label.replace('Previous', 'Anterior').replace('Next', 'Siguiente');
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 text-sm rounded border border-border ${
                                    link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
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
