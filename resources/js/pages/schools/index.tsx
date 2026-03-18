import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search } from 'lucide-react';
import DeleteCenterModal from '@/components/schools/DeleteCenterModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { SimpleTable } from '@/components/common/SimpleTable';
import type { BreadcrumbItem } from '@/types/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/schools' },
];

export default function Index({
    schools,
    filters = {}
}: {
    schools: any;
    filters: any;
}) {
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage schools');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'all') {
            delete newFilters[key];
        }
        router.get('/schools', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            cellClassName: 'text-foreground',
            render: (school: any) => (
                <Link href={`/schools/${school.id}`} className="hover:underline">
                    {school.name}
                </Link>
            ),
        },
        { key: 'code', label: 'Código' },
        { key: 'city', label: 'Ciudad' },
        { key: 'contact_person', label: 'Contacto' },
        {
            key: 'contact_email',
            label: 'Email Coordinador',
            render: (school: any) =>
                school.contact_email ? (
                    <a href={`mailto:${school.contact_email}`} className="hover:underline">
                        {school.contact_email}
                    </a>
                ) : (
                    '—'
                ),
        },
        {
            key: 'email',
            label: 'Email Institucional',
            render: (school: any) =>
                school.email ? (
                    <a href={`mailto:${school.email}`} className="hover:underline">
                        {school.email}
                    </a>
                ) : (
                    '—'
                ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            cellClassName: 'text-foreground',
            render: (school: any) => {
                const isTrashed = !!school.deleted_at;

                return (
                    <div className="flex gap-2">
                        {isTrashed ? (
                            <>
                                {canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-card text-muted-foreground border-border hover:text-emerald-600 hover:bg-emerald-50 font-medium shadow-none"
                                            onClick={() => router.post(`/schools/${school.id}/restore`)}
                                        >
                                            Restaurar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-card text-muted-foreground border-border hover:text-red-600 hover:bg-red-50 font-medium shadow-none"
                                            onClick={() => {
                                                if (confirm('¿Seguro que quieres eliminar definitivamente este centro? Esta acción no se puede deshacer.')) {
                                                    router.delete(`/schools/${school.id}/force`);
                                                }
                                            }}
                                        >
                                            Eliminar definitivo
                                        </Button>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-card text-muted-foreground border-border hover:text-blue-600 hover:bg-blue-50 font-medium shadow-none"
                                    asChild
                                >
                                    <Link href={`/schools/${school.id}`}>
                                        <div className="flex items-center">
                                            <Eye className="w-4 h-4 mr-1.5 text-blue-500/70" /> Ver
                                        </div>
                                    </Link>
                                </Button>
                                {canManage ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-card text-muted-foreground border-border hover:text-amber-600 hover:bg-amber-50 font-medium shadow-none"
                                            asChild
                                        >
                                            <Link href={`/schools/${school.id}/edit`}>
                                                <div className="flex items-center">
                                                    <Pencil className="w-4 h-4 mr-1.5 text-amber-500/70" /> Editar
                                                </div>
                                            </Link>
                                        </Button>
                                        <DeleteCenterModal school={school} />
                                    </>
                                ) : null}
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centros Educativos" />

            <div className="flex flex-col gap-6 p-6 bg-background text-foreground">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Centros Educativos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las instituciones, universidades y centros de formación.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white" asChild>
                                <Link href="/schools/create">
                                    <Plus className="h-4 w-4" />
                                    Añadir Centro
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* FILTROS */}
                <div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                            onChange={(e) => handleFilter('search', e.target.value)}
                        />
                    </div>

                    <div className="w-[200px]">
                        <Select
                            value={filters.trashed || 'none'}
                            onValueChange={(v) => handleFilter('trashed', v)}
                        >
                            <SelectTrigger className="w-full bg-background border-border text-foreground">
                                <SelectValue>
                                    {{
                                        'none': 'Activos',
                                        'only': 'Archivados',
                                        'with': 'Todos'
                                    }[filters.trashed as string] || 'Activos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Activos</SelectItem>
                                <SelectItem value="only">Archivados</SelectItem>
                                <SelectItem value="with">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="text-sm text-muted-foreground ml-auto font-medium">
                        Mostrando {schools.data.length} de {schools.total} centros
                    </p>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={schools.data}
                    rowKey={(row) => row.id}
                />

                {/* PAGINACIÓN */}
                <div className="flex items-center gap-2">
                    {schools.links.map((link: any, i: number) => {
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