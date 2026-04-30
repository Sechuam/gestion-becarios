import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Search, SlidersHorizontal } from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { SimpleTable } from '@/components/common/SimpleTable';
import { Pagination } from '@/components/common/Pagination';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
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
import type { BreadcrumbItem } from '@/types/navigation';

type Props = {
    criteria: any;
    filters: any;
    categories: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Evaluaciones', href: '/evaluaciones' },
    { title: 'Criterios', href: '/evaluaciones/criterios' },
];

export default function Index({ criteria, filters = {}, categories = [] }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.roles?.includes('admin');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === 'all') {
            delete newFilters[key];
        }
        router.get('/evaluaciones/criterios', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (key: string) => {
        const currentKey = filters.sort;
        const currentDir = filters.direction || 'asc';
        const nextDir = currentKey === key && currentDir === 'asc' ? 'desc' : 'asc';
        router.get(
            '/evaluaciones/criterios',
            { ...filters, sort: key, direction: nextDir },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns = [
        { key: 'name', label: 'Nombre', cellClassName: 'text-foreground', sortKey: 'name' },
        { key: 'category', label: 'Categoria', sortKey: 'category' },
        {
            key: 'weight',
            label: 'Peso',
            sortKey: 'weight',
            render: (row: any) => `${row.weight}%`,
        },
        { key: 'max_score', label: 'Nota max.', sortKey: 'max_score' },
        { key: 'sort_order', label: 'Orden', sortKey: 'sort_order' },
        {
            key: 'is_active',
            label: 'Estado',
            sortKey: 'is_active',
            render: (row: any) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        row.is_active
                            ? 'bg-gradient-to-r from-sidebar to-[#1f4f52] text-white'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
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
                <TableActionMenu
                    actions={[
                        {
                            label: 'Editar',
                            icon: 'edit',
                            href: `/evaluaciones/criterios/${row.id}/edit`,
                        },
                        {
                            label: row.is_active ? 'Desactivar' : 'Activar',
                            icon: 'restore',
                            onClick: () => router.patch(`/evaluaciones/criterios/${row.id}/toggle`),
                        },
                        {
                            label: 'Eliminar',
                            icon: 'delete',
                            variant: 'destructive',
                            confirm: {
                                title: '¿Eliminar criterio de evaluacion?',
                                description: `Esta accion no se puede deshacer. Se eliminara el criterio ${row.name}.`,
                                confirmLabel: 'Eliminar criterio',
                            },
                            onClick: () => router.delete(`/evaluaciones/criterios/${row.id}`),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criterios de evaluacion" />

            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Criterios de evaluacion"
                    description="Define los criterios, pesos y categorias que usara el sistema para valorar el desempeno de cada becario."
                    icon={<SlidersHorizontal className="h-6 w-6" />}
                    actions={
                        <div className="flex gap-2">
                            {isAdmin && (
                                <HeaderActionButton 
                                    label="Nuevo criterio"
                                    href="/evaluaciones/criterios/create"
                                />
                            )}
                            <HeaderActionButton 
                                label="Volver"
                                href="/evaluaciones"
                                icon={<ArrowLeft className="mr-1.5 h-3.5 w-3.5" />}
                                className="min-w-[140px]"
                            />
                        </div>
                    }
                />

                <div className="flex flex-wrap items-center gap-4 rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o categoria..."
                            className="h-12 rounded-2xl border-sidebar/20 bg-card pl-10 text-foreground placeholder:text-muted-foreground shadow-sm"
                            defaultValue={filters.search}
                            onChange={(e) => handleFilter('search', e.target.value)}
                        />
                    </div>

                    <div className="w-56">
                        <Select
                            value={filters.category || 'all'}
                            onValueChange={(value) => handleFilter('category', value)}
                        >
                            <SelectTrigger className="h-12 w-full rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm">
                                <SelectValue placeholder="Todas las categorias" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-sidebar/20">
                                <SelectItem value="all">Todas las categorias</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-56">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => handleFilter('status', value)}
                        >
                            <SelectTrigger className="h-12 w-full rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm">
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-sidebar/20">
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="inactive">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="ml-auto rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:bg-slate-800">
                        Mostrando {criteria.data.length} de {criteria.total} criterios
                    </p>
                </div>

                <div className="overflow-hidden rounded-[2.5rem] border border-sidebar/10 bg-white shadow-xl dark:bg-slate-900/60">
                    <SimpleTable
                        columns={columns}
                        rows={criteria.data}
                        rowKey={(row) => row.id}
                        sortKey={filters.sort}
                        sortDirection={filters.direction}
                        onSort={handleSort}
                        striped
                    />
                </div>

                <div className="mt-6 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                            Pagina {criteria.current_page} de {criteria.last_page}
                        </span>
                        <Pagination links={criteria.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
