import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { Users, Plus, Search, FileDown, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DeleteInternModal from '@/components/interns/DeleteInternModal';
import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
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

    // 1. Estado local para el buscador (soluciona el problema de los espacios)
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    // 2. Efecto de búsqueda con Delay (Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                handleFilter('search', searchQuery);
            }
        }, 500); // Espera 500ms antes de disparar la búsqueda
        return () => clearTimeout(timer);
    }, [searchQuery]);
    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'all') {
            delete newFilters[key];
        }
        router.get('/becarios', newFilters, {
            preserveState: true,
            replace: true
        });
    };
    // 3. Badges de estado unificados y minimalistas
    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; dot: string }> = {
            active: {
                label: 'Activo',
                dot: 'bg-emerald-500',
            },
            pending: {
                label: 'Pendiente',
                dot: 'bg-amber-500',
            },
            completed: {
                label: 'Completado',
                dot: 'bg-blue-500',
            },
            cancelled: {
                label: 'Cancelado',
                dot: 'bg-slate-400',
            }
        };
        const item = config[status] || { label: status, dot: 'bg-slate-300' };
        return (
            <div className="inline-flex items-center w-[110px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-none">
                <span className={`h-1.5 w-1.5 rounded-full ${item.dot} mr-2`} />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {item.label}
                </span>
            </div>
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Becarios" />
            <div className="flex flex-col gap-6 p-6">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                            <Users className="h-6 w-6" />
                            Gestión de Becarios
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Administra los becarios, sus centros y estados de prácticas.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                onClick={() =>
                                    window.open(`/interns/export?${new URLSearchParams(filters).toString()}`)
                                }
                            >
                                <FileDown className="h-4 w-4" />
                                Exportar Excel
                            </Button>
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild>
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
                    <div className="p-4 border rounded-xl bg-card border-l-4 border-l-blue-500 hover:shadow-md transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:border-l-blue-400">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total becarios</p>
                        <p className="text-2xl font-bold mt-1">{interns.total}</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-card border-l-4 border-l-green-500 hover:shadow-md transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:border-l-green-400">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Activos</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {interns.data.filter((i: any) => i.status === 'active').length}
                        </p>
                    </div>
                    <div className="p-4 border rounded-xl bg-card border-l-4 border-l-yellow-500 hover:shadow-md transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:border-l-yellow-400">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                            {interns.data.filter((i: any) => i.status === 'pending').length}
                        </p>
                    </div>
                    <div className="p-4 border rounded-xl bg-card border-l-4 border-l-indigo-500 hover:shadow-md transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:border-l-indigo-400">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completados</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">
                            {interns.data.filter((i: any) => i.status === 'completed').length}
                        </p>
                    </div>
                </div>
                {/* FILTROS */}
                <div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-muted/20 dark:bg-slate-800/40 dark:border-slate-700 shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-9 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
                            value={searchQuery} // Usamos el estado local
                            onChange={(e) => setSearchQuery(e.target.value)} // Cambiamos el estado local
                        />
                    </div>
                    <div className="w-[300px]">
                        <Select
                            value={filters.center || 'all'}
                            onValueChange={(v) => handleFilter('center', v)}
                        >
                            <SelectTrigger className="w-full overflow-hidden [&>span]:truncate dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
                                <SelectValue>
                                    {filters.center && filters.center !== 'all'
                                        ? education_centers.find(c => c.id.toString() === filters.center?.toString())?.name
                                        : 'Todos los centros'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
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
                            <SelectTrigger className="w-full dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
                                <SelectValue>
                                    {{
                                        'active': 'Activos',
                                        'pending': 'Pendientes',
                                        'completed': 'Completados',
                                        'cancelled': 'Cancelados'
                                    }[filters.status as string] || 'Todos los estados'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="pending">Pendientes</SelectItem>
                                <SelectItem value="completed">Completados</SelectItem>
                                <SelectItem value="cancelled">Cancelados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-sm text-muted-foreground ml-auto font-medium">
                        Mostrando {interns.data.length} de {interns.total} becarios
                    </p>
                </div>
                {/* TABLA */}
                <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800/20">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-slate-50 dark:bg-slate-800/60 border-b-slate-200 dark:border-b-slate-700">
                                <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">Nombre</th>
                                <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">DNI</th>
                                <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">Centro Educativo</th>
                                <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">Grado</th>
                                <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">Estado</th>
                                <th className="px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interns.data.map((intern: any) => (
                                <tr
                                    key={intern.id}
                                    className="border-b dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                                                {intern.user?.name ? intern.user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">{intern.user?.name}</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">{intern.user?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs italic">{intern.dni}</td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{intern.education_center?.name}</td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{intern.academic_degree}</td>
                                    <td className="px-4 py-4">
                                        {getStatusBadge(intern?.status as string)}
                                    </td>
                                    <td className="px-4 py-4 flex gap-2">
                                        {/* Botones Minimalistas Outline */}
                                        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium shadow-none" asChild>
                                            <Link href={`/interns/${intern.id}`}>
                                                <div className="flex items-center">
                                                    <Eye className="w-4 h-4 mr-1.5 text-blue-500/70" /> Ver
                                                </div>
                                            </Link>
                                        </Button>
                                        {canManage && (
                                            <>
                                                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium shadow-none" asChild>
                                                    <Link href={`/interns/${intern.id}/edit`}>
                                                        <div className="flex items-center">
                                                            <Pencil className="w-4 h-4 mr-1.5 text-amber-500/70" /> Editar
                                                        </div>
                                                    </Link>
                                                </Button>
                                                <DeleteInternModal intern={intern} />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}
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
