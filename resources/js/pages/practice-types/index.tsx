import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Shapes, Search } from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import DeletePracticeTypeModal from '@/components/practice-types/DeletePracticeTypeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

type Props = {
    practice_types: any;
    filters: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tipos de práctica', href: '/tipos-practica' },
];

export default function Index({ practice_types, filters = {} }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.roles?.includes('admin');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === 'all') {
            delete newFilters[key];
        }
        router.get('/tipos-practica', newFilters, {
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
            '/tipos-practica',
            { ...filters, sort: key, direction: nextDir },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            cellClassName: 'text-foreground',
            sortKey: 'name',
        },
        { key: 'description', label: 'Descripción', sortKey: 'description' },
        { key: 'priority', label: 'Prioridad', sortKey: 'priority' },
        {
            key: 'color',
            label: 'Color',
            sortKey: 'color',
            render: (row: any) =>
                row.color ? (
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-full border"
                            style={{ backgroundColor: row.color }}
                            title={row.color}
                        />
                        <span className="text-xs text-muted-foreground">
                            {row.color}
                        </span>
                    </span>
                ) : (
                    '—'
                ),
        },
        {
            key: 'is_active',
            label: 'Estado',
            sortKey: 'is_active',
            render: (row: any) => (
                <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        row.is_active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                >
                    {row.is_active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (row: any) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-amber-50 hover:text-amber-600"
                        asChild
                    >
                        <Link href={`/tipos-practica/${row.id}/edit`}>
                            <div className="flex items-center">
                                <Pencil className="mr-1.5 h-4 w-4 text-amber-500/70" />{' '}
                                Editar
                            </div>
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-blue-50 hover:text-blue-600"
                        onClick={() =>
                            router.patch(`/tipos-practica/${row.id}/toggle`)
                        }
                    >
                        {row.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                    <DeletePracticeTypeModal practiceType={row} />
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de práctica" />

            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Tipos de Práctica"
                    description="Gestiona las categorías y clasificaciones de las tareas para organizar mejor el seguimiento de los becarios."
                    icon={<Shapes className="h-6 w-6" />}
                    actions={
                        isAdmin ? (
                            <Button
                                className="bg-white text-sidebar hover:bg-white/90 rounded-2xl px-8 font-black shadow-lg transition-all pt-2 h-12"
                                onClick={() => router.get('/tipos-practica/create')}
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nuevo tipo
                            </Button>
                        ) : undefined
                    }
                />

                <div className="flex flex-wrap items-center gap-4 rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="border-sidebar/20 bg-card pl-10 h-12 text-foreground placeholder:text-muted-foreground rounded-2xl shadow-sm"
                            defaultValue={filters.search}
                            onChange={(e) =>
                                handleFilter('search', e.target.value)
                            }
                        />
                    </div>

                    <div className="w-56">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => handleFilter('status', v)}
                        >
                            <SelectTrigger className="w-full h-12 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm">
                                <SelectValue>
                                    {{
                                        active: 'Activos',
                                        inactive: 'Inactivos',
                                    }[filters.status as string] || 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-sidebar/20">
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="inactive">
                                    Inactivos
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="ml-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 px-3 py-1 rounded-full dark:bg-slate-800">
                        Mostrando {practice_types.data.length} de{' '}
                        {practice_types.total} tipos
                    </p>
                </div>

                <div className="rounded-[2.5rem] border border-sidebar/10 bg-white shadow-xl dark:bg-slate-900/60 overflow-hidden">
                    <SimpleTable
                        columns={columns}
                        rows={practice_types.data}
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
                            Página {practice_types.current_page} de {practice_types.last_page}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {practice_types.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all ${
                                        link.active
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
