import { Head, Link, router, usePage } from '@inertiajs/react';
import { Users, Plus, Search, FileDown, Pencil, Eye } from 'lucide-react';
import DeleteInternModal from '@/components/interns/DeleteInternModal';
import { Button } from '@/components/ui/button';
import { SimpleTable } from '@/components/common/SimpleTable';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Becarios', href: '/becarios' },
];

export default function Index({
    interns,
    filters = {},
    education_centers = []
}: {
    interns: any;
    filters: any;
    education_centers: any[];
}) {
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage interns');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'all') {
            delete newFilters[key];
        }
        router.get('/becarios', newFilters, {
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
        render: (intern: any) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-xs border border-border">
                    {intern.user?.name ? intern.user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{intern.user?.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        {intern.user?.email ? (
                            <a href={`mailto:${intern.user.email}`} className="hover:underline">
                                {intern.user.email}
                            </a>
                        ) : (
                            '—'
                        )}
                    </span>
                </div>
            </div>
        ),
    },
    {
        key: 'dni',
        label: 'DNI',
        cellClassName: 'text-muted-foreground font-mono text-xs italic',
    },
    {
        key: 'education_center',
        label: 'Centro Educativo',
        cellClassName: 'text-muted-foreground',
        render: (intern: any) =>
            intern.education_center?.id ? (
                <Link href={`/schools/${intern.education_center.id}`} className="hover:underline">
                    {intern.education_center.name}
                </Link>
            ) : (
                '—'
            ),
    },
    {
        key: 'academic_degree',
        label: 'Grado',
        cellClassName: 'text-muted-foreground',
    },
    {
        key: 'status',
        label: 'Estado',
        cellClassName: 'text-foreground',
        render: (intern: any) => <StatusBadge status={intern?.status as string} />,
    },
    {
        key: 'actions',
        label: 'Acciones',
        cellClassName: 'text-foreground',
        render: (intern: any) => (
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium shadow-none"
                    asChild
                >
                    <Link href={`/interns/${intern.id}`}>
                        <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1.5 text-blue-500/70" /> Ver
                        </div>
                    </Link>
                </Button>
                {canManage && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium shadow-none"
                            asChild
                        >
                            <Link href={`/interns/${intern.id}/edit`}>
                                <div className="flex items-center">
                                    <Pencil className="w-4 h-4 mr-1.5 text-amber-500/70" /> Editar
                                </div>
                            </Link>
                        </Button>
                        <DeleteInternModal intern={intern} />
                    </>
                )}
            </div>
        ),
    },
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Becarios" />

            <div className="flex flex-col gap-6 p-6 bg-background text-foreground">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight text-foreground">
                            <Users className="h-6 w-6" />
                            Gestión de Becarios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Administra los becarios, sus centros y estados de prácticas.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white" asChild>
                                <Link href="/interns/create">
                                    <Plus className="h-4 w-4" />
                                    Añadir Becario
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-3 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total becarios</p>
                        <p className="text-lg font-semibold mt-1 text-foreground">{interns.total}</p>
                    </div>
        <div className="p-3 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Activos</p>
                        <p className="text-lg font-semibold mt-1 text-foreground">
                            {interns.data.filter((i: any) => i.status === 'active').length}
                        </p>
                    </div>
        <div className="p-3 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pendientes</p>
                        <p className="text-lg font-semibold mt-1 text-foreground">
                            {interns.data.filter((i: any) => i.status === 'pending').length}
                        </p>
                    </div>
        <div className="p-3 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Completados</p>
                        <p className="text-lg font-semibold mt-1 text-foreground">
                            {interns.data.filter((i: any) => i.status === 'completed').length}
                        </p>
                    </div>
                </div>

                {/* FILTROS */}
    <div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                            onChange={(e) => handleFilter('search', e.target.value)}
                        />
                    </div>
                    <div className="w-[300px]">
                        <Select
                            value={filters.center || 'all'}
                            onValueChange={(v) => handleFilter('center', v)}
                        >
                            <SelectTrigger className="w-full overflow-hidden [&>span]:truncate bg-background border-border text-foreground">
                                <SelectValue>
                                    {filters.center && filters.center !== 'all'
                                        ? education_centers.find(c => c.id.toString() === filters.center?.toString())?.name
                                        : 'Todos los centros'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los centros</SelectItem>
                                {education_centers.map((center) => (
                                    <SelectItem key={center.id} value={center.id.toString()}>{center.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[200px]">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => handleFilter('status', v)}
                        >
                            <SelectTrigger className="w-full bg-background border-border text-foreground">
                                <SelectValue>
                                    {{
                                        'active': 'Activos',
                                        'pending': 'Pendientes',
                                        'completed': 'Completados',
                                        'cancelled': 'Cancelados',
                                        'abandoned': 'Abandonados'
                                    }[filters.status as string] || 'Todos los estados'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="pending">Pendientes</SelectItem>
                                <SelectItem value="completed">Completados</SelectItem>
                                <SelectItem value="cancelled">Cancelados</SelectItem>
                                <SelectItem value="abandoned">Abandonados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {canManage && (
                        <Button
                            variant="outline"
                            className="gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={() =>
                                window.open(`/interns/export?${new URLSearchParams(filters).toString()}`)
                            }
                        >
                            <FileDown className="h-4 w-4" />
                            Exportar Excel
                        </Button>
                    )}
                    <p className="text-sm text-muted-foreground ml-auto font-medium">
                        Mostrando {interns.data.length} de {interns.total} becarios
                    </p>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={interns.data}
                    rowKey={(row) => row.id}
                />

                {/* PAGINACIÓN */}
                <div className="w-full mt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">
                            Página {interns.current_page} de {interns.last_page}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {interns.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border rounded-xl transition-all
                                    ${link.active
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-105'
                                            : 'bg-card text-muted-foreground border-border hover:bg-muted'}
                                    ${!link.url ? 'opacity-30 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                            .replace('Previous', 'Anterior')
                                            .replace('Next', 'Siguiente')
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
