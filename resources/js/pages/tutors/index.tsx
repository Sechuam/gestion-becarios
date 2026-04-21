import { Head, Link, router } from '@inertiajs/react';
import { GraduationCap, Search, Eye } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ActiveFilterChips } from '@/components/common/ActiveFilterChips';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tutores', href: '/tutores' },
];

type TutorRow = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    status: string;
    created_at?: string | null;
    assigned_interns_count: number;
    tasks_created_count: number;
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

export default function Index({
    tutors,
    filters = {},
    stats,
}: {
    tutors: Paginated<TutorRow>;
    filters: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
    stats: {
        results: number;
        with_assigned_interns: number;
        tasks_created: number;
    };
}) {
    const lastEmptyKeyRef = useRef<string>('');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };

        if (!value) {
            delete newFilters[key as keyof typeof newFilters];
        }

        router.get('/tutores', newFilters, {
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
            '/tutores',
            { ...filters, sort: key, direction: nextDir },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key as keyof typeof newFilters];

        router.get('/tutores', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearAllFilters = () => {
        router.get(
            '/tutores',
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
            ([, value]) =>
                value !== undefined && value !== null && value !== '',
        );
        const hasFilters = filtersEntries.length > 0;
        const emptyKey = JSON.stringify(
            filtersEntries.sort(([a], [b]) => a.localeCompare(b)),
        );

        if (tutors.data.length > 0) {
            lastEmptyKeyRef.current = '';
            return;
        }

        if (
            tutors.data.length === 0 &&
            hasFilters &&
            emptyKey !== lastEmptyKeyRef.current
        ) {
            toast({
                title: 'Sin resultados',
                description:
                    'No hay tutores que coincidan con la búsqueda actual.',
            });
            lastEmptyKeyRef.current = emptyKey;
        }
    }, [filters, tutors.data.length]);

    const headerMetrics = [
        {
            label: 'Resultados',
            value: stats.results,
            hint: 'Tutores encontrados con los filtros actuales',
        },
        {
            label: 'Con becarios asignados',
            value: stats.with_assigned_interns,
            hint: 'Tutores con al menos un becario vinculado',
        },
        {
            label: 'Tareas creadas',
            value: stats.tasks_created,
            hint: 'Total de tareas creadas por los tutores listados',
        },
    ];

    const activeFilterChips = [];
    if (filters.search) {
        activeFilterChips.push({
            key: 'search',
            label: `Búsqueda: ${filters.search}`,
        });
    }

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            sortKey: 'name',
            cellClassName: 'text-foreground',
            render: (tutor: TutorRow) => (
                <div className="flex items-center gap-3">
                    <Avatar className="flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-full border border-border bg-muted">
                        <AvatarImage src={tutor.avatar || ''} alt={tutor.name || ''} />
                        <AvatarFallback className="text-xs font-bold text-muted-foreground bg-transparent">
                            {tutor.name
                                ? tutor.name
                                      .split(' ')
                                      .slice(0, 2)
                                      .map((word) => word.charAt(0))
                                      .join('')
                                      .toUpperCase()
                                : 'T'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <Link
                            href={`/tutores/${tutor.id}`}
                            className="font-semibold text-foreground hover:underline"
                        >
                            {tutor.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                            {tutor.email}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            sortKey: 'email',
            render: (tutor: TutorRow) => (
                <a
                    href={`mailto:${tutor.email}`}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                >
                    {tutor.email}
                </a>
            ),
        },
        {
            key: 'assigned_interns_count',
            label: 'Becarios',
            sortKey: 'assigned_interns_count',
            cellClassName: 'text-foreground font-semibold',
        },
        {
            key: 'tasks_created_count',
            label: 'Tareas creadas',
            sortKey: 'tasks_created_count',
            cellClassName: 'text-foreground font-semibold',
        },
        {
            key: 'actions',
            label: 'Acciones',
            headClassName: 'text-center',
            cellClassName: 'text-center',
            render: (tutor: TutorRow) => (
                <div className="w-full text-center">
                    <Button
                        variant="outline"
                        size="sm"
                        className="mx-auto flex w-fit"
                        asChild
                    >
                        <Link href={`/tutores/${tutor.id}`}>
                            <Eye className="h-4 w-4" />
                            Ver tutor
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutores" />

            <div className="space-y-6">
                <ModuleHeader
                    title="Módulo de Tutores"
                    description="Consulta los tutores de empresa, su carga de becarios y la actividad reciente que generan en el sistema."
                    icon={<GraduationCap className="h-6 w-6" />}
                    metrics={headerMetrics}
                />

                <div className="rounded-[2.5rem] border border-sidebar/10 bg-white p-8 shadow-2xl dark:bg-slate-900/60 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-sidebar/10 dark:bg-slate-800/50">
                        <div className="relative min-w-[300px] flex-1">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-sidebar/40" />
                            <Input
                                placeholder="Buscar por nombre, email o cargo..."
                                className="h-12 border-sidebar/20 bg-white pl-12 text-foreground placeholder:text-muted-foreground rounded-2xl shadow-sm focus-visible:ring-sidebar transition-all"
                                defaultValue={filters.search}
                                onChange={(e) => handleFilter('search', e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                             <p className="text-sm font-black text-sidebar uppercase tracking-widest bg-sidebar/5 px-4 py-2 rounded-xl border border-sidebar/10">
                                {tutors.total} Tutores Registrados
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
                        <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-sidebar" /> Filtro por Nombre</span>
                        <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-sidebar" /> Filtro por Email</span>
                        <span className="flex items-center gap-1.5 ml-auto text-sidebar/60 italic font-medium lowercase">Mostrando {tutors.data.length} resultados en esta página</span>
                    </div>
                </div>

                <ActiveFilterChips
                    chips={activeFilterChips}
                    onRemove={clearFilter}
                    onClearAll={clearAllFilters}
                />

                <div className="rounded-[2.5rem] border border-sidebar/10 bg-white shadow-xl dark:bg-slate-900/60 overflow-hidden">
                    <SimpleTable
                        columns={columns}
                        rows={tutors.data}
                        rowKey={(row) => row.id}
                        sortKey={filters.sort}
                        sortDirection={filters.direction}
                        onSort={handleSort}
                        striped={true}
                    />
                </div>

                <div className="mt-6 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                            Página {tutors.current_page} de {tutors.last_page}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {tutors.links.map((link, i) => (
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
            </div>
        </AppLayout>
    );
}
