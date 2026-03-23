import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleTable } from '@/components/common/SimpleTable';
import DeletePracticeTypeModal from '@/components/practice-types/DeletePracticeTypeModal';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

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

    const columns = [
        { key: 'name', label: 'Nombre', cellClassName: 'text-foreground' },
        { key: 'description', label: 'Descripción' },
        { key: 'priority', label: 'Prioridad' },
        {
            key: 'color',
            label: 'Color',
                render: (row: any) => row.color ? (
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-full border"
                            style={{ backgroundColor: row.color }}
                            title={row.color}
                        />
                        <span className="text-xs text-muted-foreground">{row.color}</span>
                    </span>
                ) : '—',
        },
        {
            key: 'is_active',
            label: 'Estado',
            render: (row: any) => (
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                    row.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
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
                        className="bg-card text-muted-foreground border-border hover:text-amber-600 hover:bg-amber-50 font-medium shadow-none"
                        asChild
                    >
                        <Link href={`/tipos-practica/${row.id}/edit`}>
                            <div className="flex items-center">
                                <Pencil className="w-4 h-4 mr-1.5 text-amber-500/70" /> Editar
                            </div>
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-card text-muted-foreground border-border hover:text-blue-600 hover:bg-blue-50 font-medium shadow-none"
                        onClick={() => router.patch(`/tipos-practica/${row.id}/toggle`)}
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

            <div className="flex flex-col gap-6 p-6 bg-background text-foreground">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tipos de práctica</h1>
                        <p className="text-sm text-muted-foreground">
                            Catálogo configurable por el administrador.
                        </p>
                    </div>
                    {isAdmin && (
                        <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white" asChild>
                            <Link href="/tipos-practica/create">
                                <Plus className="h-4 w-4" />
                                Nuevo tipo
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Input
                            placeholder="Buscar por nombre..."
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                            defaultValue={filters.search}
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
                                        active: 'Activos',
                                        inactive: 'Inactivos',
                                    }[filters.status as string] || 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="inactive">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="text-sm text-muted-foreground ml-auto font-medium">
                        Mostrando {practice_types.data.length} de {practice_types.total} tipos
                    </p>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={practice_types.data}
                    rowKey={(row) => row.id}
                />

                <div className="flex items-center gap-2">
                    {practice_types.links.map((link: any, i: number) => {
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
