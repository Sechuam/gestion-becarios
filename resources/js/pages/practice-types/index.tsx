import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
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

            <div className="flex flex-col gap-6 bg-background p-6 text-foreground">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Tipos de práctica
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Catálogo configurable por el administrador.
                        </p>
                    </div>
                    {isAdmin && (
                        <Button
                            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                            asChild
                        >
                            <Link href="/tipos-practica/create">
                                <Plus className="h-4 w-4" />
                                Nuevo tipo
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                    <div className="relative w-full max-w-sm">
                        <Input
                            placeholder="Buscar por nombre..."
                            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                            defaultValue={filters.search}
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
                                        active: 'Activos',
                                        inactive: 'Inactivos',
                                    }[filters.status as string] || 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="inactive">
                                    Inactivos
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="ml-auto text-sm font-medium text-muted-foreground">
                        Mostrando {practice_types.data.length} de{' '}
                        {practice_types.total} tipos
                    </p>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={practice_types.data}
                    rowKey={(row) => row.id}
                    sortKey={filters.sort}
                    sortDirection={filters.direction}
                    onSort={handleSort}
                />

                <div className="flex items-center gap-2">
                    {practice_types.links.map((link: any, i: number) => {
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
