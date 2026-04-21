import { Head, Link, router } from '@inertiajs/react';
import { GraduationCap, Plus, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ActiveFilterChips } from '@/components/common/ActiveFilterChips';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs } from '@/lib/date-format';
import { getTaskStatusLabel, getTaskStatusTone } from '@/lib/task-labels';
import type { BreadcrumbItem } from '@/types/navigation';

type InternRow = {
    id: number;
    dni?: string | null;
    status: string;
    progress: number;
    is_delayed: boolean;
    user?: {
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
    } | null;
    education_center?: {
        id: number;
        name: string;
    } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

type RecentTask = {
    id: number;
    title: string;
    status?: string | null;
    due_date?: string | null;
    interns_count: number;
    practice_type?: {
        id: number;
        name: string;
    } | null;
};

type Props = {
    tutor: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    interns: Paginated<InternRow>;
    recent_tasks: RecentTask[];
    filters: {
        search?: string;
        status?: string;
    };
    stats: {
        assigned: number;
        active: number;
        delayed: number;
        open_tasks: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis becarios', href: '/mis-becarios' },
];

export default function My({
    tutor,
    interns,
    recent_tasks,
    filters = {},
    stats,
}: Props) {
    const lastEmptyKeyRef = useRef<string>('');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };

        if (!value || value === 'all') {
            delete newFilters[key as keyof typeof newFilters];
        }

        router.get('/mis-becarios', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key as keyof typeof newFilters];

        router.get('/mis-becarios', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearAllFilters = () => {
        router.get(
            '/mis-becarios',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        const filtersEntries = Object.entries(filters || {}).filter(
            ([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    return false;
                }
                if (key === 'status' && value === 'all') {
                    return false;
                }
                return true;
            },
        );
        const hasFilters = filtersEntries.length > 0;
        const emptyKey = JSON.stringify(
            filtersEntries.sort(([a], [b]) => a.localeCompare(b)),
        );

        if (interns.data.length > 0) {
            lastEmptyKeyRef.current = '';
            return;
        }

        if (
            interns.data.length === 0 &&
            hasFilters &&
            emptyKey !== lastEmptyKeyRef.current
        ) {
            toast({
                title: 'Sin resultados',
                description:
                    'No hay becarios asignados que coincidan con los filtros actuales.',
            });
            lastEmptyKeyRef.current = emptyKey;
        }
    }, [filters, interns.data.length]);

    const activeFilterChips = [];
    if (filters.search) {
        activeFilterChips.push({
            key: 'search',
            label: `Búsqueda: ${filters.search}`,
        });
    }
    if (filters.status) {
        activeFilterChips.push({
            key: 'status',
            label:
                {
                    active: 'Estado: Activo',
                    completed: 'Estado: Finalizado',
                    abandoned: 'Estado: Abandonado',
                }[filters.status] || `Estado: ${filters.status}`,
        });
    }

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            cellClassName: 'text-foreground',
            render: (intern: InternRow) => (
                <div className="flex items-center gap-3">
                    <Avatar className="flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-full border border-border bg-muted">
                        <AvatarImage src={intern.user?.avatar || ''} alt={intern.user?.name || ''} />
                        <AvatarFallback className="text-xs font-bold text-muted-foreground bg-transparent">
                            {intern.user?.name
                                ? intern.user.name.substring(0, 2).toUpperCase()
                                : 'B'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <Link
                            href={`/interns/${intern.id}`}
                            className="font-semibold text-foreground hover:underline"
                        >
                            {intern.user?.name || `Becario #${intern.id}`}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                            {intern.user?.email || '—'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'dni',
            label: 'DNI',
            cellClassName: 'font-mono text-xs text-muted-foreground',
        },
        {
            key: 'education_center',
            label: 'Centro',
            render: (intern: InternRow) =>
                intern.education_center?.id ? (
                    <Link
                        href={`/centros/${intern.education_center.id}`}
                        className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                        {intern.education_center.name}
                    </Link>
                ) : (
                    '—'
                ),
        },
        {
            key: 'status',
            label: 'Estado',
            cellClassName: 'text-foreground',
            render: (intern: InternRow) => (
                <StatusBadge status={intern.status} />
            ),
        },
        {
            key: 'progress',
            label: 'Progreso',
            render: (intern: InternRow) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded bg-muted">
                        <div
                            className={`h-2 ${intern.is_delayed ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${intern.progress ?? 0}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {intern.progress ?? 0}%
                    </span>
                    {intern.is_delayed && (
                        <span className="text-xs font-medium text-red-500">
                            Retrasado
                        </span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis becarios" />

            <div className="space-y-6">
                <ModuleHeader
                    title="Mis Becarios"
                    description={`Gestiona el seguimiento diario de tus becarios, detecta bloqueos y mantén a mano las tareas que has creado, ${tutor.name}.`}
                    avatar={tutor.avatar}
                    icon={<GraduationCap className="h-6 w-6" />}
                    metrics={[
                        {
                            label: 'Asignados',
                            value: stats.assigned,
                            hint: 'Becarios vinculados a tu perfil',
                        },
                        {
                            label: 'Activos',
                            value: stats.active,
                            hint: 'Becarios actualmente en prácticas',
                        },
                        {
                            label: 'Retrasados',
                            value: stats.delayed,
                            hint: 'Con fecha vencida y no finalizados',
                        },
                        {
                            label: 'Tareas abiertas',
                            value: stats.open_tasks,
                            hint: 'Pendientes, en progreso o en revisión',
                        },
                    ]}
                    actions={
                        <Button
                            className="gap-2 bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
                            onClick={() => router.get('/tareas/create')}
                        >
                            <Plus className="h-4 w-4" />
                            Nueva tarea
                        </Button>
                    }
                />

                <div className="space-y-4 rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative min-w-[240px] flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, email, DNI o centro..."
                                className="border-sidebar/20 bg-card pl-10 h-12 text-foreground placeholder:text-muted-foreground rounded-2xl shadow-sm"
                                defaultValue={filters.search}
                                onChange={(e) =>
                                    handleFilter('search', e.target.value)
                                }
                            />
                        </div>

                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) =>
                                handleFilter('status', value)
                            }
                        >
                            <SelectTrigger className="w-[180px] h-12 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm">
                                <SelectValue>
                                    {{
                                        active: 'Activos',
                                        completed: 'Finalizados',
                                        abandoned: 'Abandonados',
                                    }[filters.status as string] || 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-sidebar/20">
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="completed">
                                    Finalizados
                                </SelectItem>
                                <SelectItem value="abandoned">
                                    Abandonados
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <p className="ml-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 px-3 py-1 rounded-full dark:bg-slate-800">
                            Mostrando {interns.data.length} de {interns.total}{' '}
                            becarios
                        </p>
                    </div>
                </div>

                <ActiveFilterChips
                    chips={activeFilterChips}
                    onRemove={clearFilter}
                    onClearAll={clearAllFilters}
                />

                <SimpleTable
                    columns={columns}
                    rows={interns.data}
                    rowKey={(row) => row.id}
                    striped={true}
                />

                <div className="mt-6 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                            Página {interns.current_page} de {interns.last_page}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {interns.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all ${link.active
                                        ? 'scale-105 transform border-sidebar bg-sidebar text-sidebar-foreground shadow-md'
                                        : 'border-border/90 bg-white text-foreground hover:border-sidebar/40 hover:bg-slate-50'
                                        } ${!link.url ? 'pointer-events-none opacity-45' : ''}`}
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

                <Card className="app-panel rounded-[2rem] border-sidebar/10 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-sidebar/10 pb-4">
                        <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Tareas recientes creadas por mí</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-1">
                        {recent_tasks.length > 0 ? (
                            recent_tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-4"
                                >
                                    <div className="space-y-1">
                                        <Link
                                            href={`/tareas/${task.id}`}
                                            className="font-semibold text-foreground hover:underline"
                                        >
                                            {task.title}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                Tipo:{' '}
                                                {task.practice_type?.name ||
                                                    '—'}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                Becarios: {task.interns_count}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getTaskStatusTone(
                                                task.status,
                                            )}`}
                                        >
                                            {getTaskStatusLabel(task.status)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            Entrega:{' '}
                                            {formatDateEs(task.due_date)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aún no has creado tareas.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
