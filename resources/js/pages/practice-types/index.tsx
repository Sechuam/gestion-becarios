import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Shapes, Search } from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import { Pagination } from '@/components/common/Pagination';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import DeletePracticeTypeModal from '@/components/practice-types/DeletePracticeTypeModal';
import { TableActionMenu } from '@/components/common/TableActionMenu';
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
import { cn } from '@/lib/utils';
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
        { 
            key: 'priority', 
            label: 'Prioridad', 
            sortKey: 'priority',
            headClassName: 'text-center',
            cellClassName: 'text-center',
            render: (row: any) => (
                <div className="flex justify-center">
                    <span className="inline-block w-20 text-center text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-sidebar to-[#1f4f52] py-1 rounded-lg shadow-md border border-white/10">
                        {row.priority || '—'}
                    </span>
                </div>
            )
        },
        {
            key: 'color',
            label: 'Identificador',
            sortKey: 'color',
            headClassName: 'text-center',
            cellClassName: 'text-center',
            render: (row: any) =>
                row.color ? (
                    <div className="flex items-center justify-center gap-2">
                        <div
                            className="h-4 w-4 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                            style={{ 
                                backgroundColor: row.color,
                                boxShadow: `0 0 10px ${row.color}50`
                            }}
                            title={`Color identificativo: ${row.color}`}
                        />
                    </div>
                ) : (
                    <span className="text-slate-300">—</span>
                ),
        },
        {
            key: 'is_active',
            label: 'Estado',
            sortKey: 'is_active',
            headClassName: 'text-center',
            cellClassName: 'text-center',
            render: (row: any) => (
                <div className="flex justify-center">
                    <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            row.is_active
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                    >
                        {row.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            headClassName: 'text-center',
            cellClassName: 'text-center',
            render: (row: any) => (
                <div className="flex justify-center">
                    <TableActionMenu
                        actions={[
                            {
                                label: 'Editar',
                                icon: 'edit',
                                href: `/tipos-practica/${row.id}/edit`,
                            },
                            {
                                label: row.is_active ? 'Desactivar' : 'Activar',
                                onClick: () => router.patch(`/tipos-practica/${row.id}/toggle`),
                            },
                            {
                                label: 'Eliminar',
                                icon: 'delete',
                                variant: 'destructive',
                                onClick: () => {
                                    if (confirm(`¿Seguro que quieres eliminar "${row.name}"?`)) {
                                        router.delete(`/tipos-practica/${row.id}`);
                                    }
                                }
                            }
                        ]}
                    />
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
                            <HeaderActionButton 
                                label="Nuevo tipo"
                                href="/tipos-practica/create"
                            />
                        ) : undefined
                    }
                />

                <div className="rounded-xl border border-sidebar/10 bg-white p-2 shadow-lg dark:bg-slate-900/60 transition-all">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre..."
                                className="h-8 border-sidebar/10 bg-slate-50/50 pl-9 text-[11px] text-foreground placeholder:text-muted-foreground rounded-lg shadow-sm focus:ring-sidebar/20 w-full"
                                defaultValue={filters.search}
                                onChange={(e) =>
                                    handleFilter('search', e.target.value)
                                }
                            />
                        </div>

                        <div className="flex-1">
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(v) => handleFilter('status', v)}
                            >
                                <SelectTrigger className="h-8 w-full border-sidebar/10 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                    <SelectValue>
                                        {{
                                            active: 'Activos',
                                            inactive: 'Inactivos',
                                        }[filters.status as string] || 'Todos'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-sidebar/20">
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="inactive">
                                        Inactivos
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-none flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg dark:bg-slate-800 border border-sidebar/5 h-8">
                            <span className="flex h-1 w-1 rounded-full bg-sidebar animate-pulse" />
                            <span className="text-[10px] font-bold text-muted-foreground tabular-nums whitespace-nowrap uppercase tracking-widest">
                                {practice_types.data.length} / {practice_types.total} TIPOS
                            </span>
                        </div>
                    </div>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={practice_types.data}
                    rowKey={(row) => row.id}
                    sortKey={filters.sort}
                    sortDirection={filters.direction}
                    onSort={handleSort}
                    striped={true}
                />

                <div className="mt-6 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                            Página {practice_types.current_page} de {practice_types.last_page}
                        </span>
                        <Pagination links={practice_types.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
