import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Search,
    FileDown,
    ArrowLeft,
    School,
    Users,
    History as HistoryIcon,
    HardDrive,
    Calendar,
    MapPin,
    Mail,
    Phone,
    Globe,
    FileText,
    Download,
    GraduationCap,
    Clock,
    User,
    AlertTriangle,
    BarChart3,
    Info,
    Hash,
    ExternalLink
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmNavigationButton } from '@/components/common/ConfirmNavigationButton';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';
import type { BreadcrumbItem } from '@/types/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type Props = {
    educationCenter: any;
    agreement_url?: string;
    interns: any;
    filters?: {
        search?: string;
        status?: string;
        order?: string;
    };
    is_intern?: boolean;
    current_intern?: any;
    activities?: any[];
};

export default function Show({
    educationCenter,
    agreement_url,
    interns,
    filters,
    is_intern,
    current_intern,
    activities = [],
}: Props) {
    const isTrashed = !!educationCenter.deleted_at;
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage schools');
    const canExport = auth.user?.permissions?.includes('manage interns');
    const canViewNotes = auth.user?.permissions?.includes('view internal notes') || canManage;
    const [exportOpen, setExportOpen] = useState(false);
    const [notesValue, setNotesValue] = useState(
        educationCenter.internal_notes || '',
    );
    const [activityPage, setActivityPage] = useState(1);
    const activitiesPerPage = 3;
    const totalActivityPages = Math.ceil(activities.length / activitiesPerPage);
    const displayedActivities = activities.slice(
        (activityPage - 1) * activitiesPerPage,
        activityPage * activitiesPerPage,
    );
    const lastEmptyKeyRef = useRef<string>('');

    const isIntern = !!is_intern;
    const currentIntern = current_intern;
    const exportColumns = useMemo(
        () => [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'dni', label: 'DNI / NIE' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Teléfono' },
            { key: 'education_center', label: 'Centro Educativo' },
            { key: 'academic_degree', label: 'Titulación' },
            { key: 'total_hours', label: 'Horas Totales' },
            { key: 'start_date', label: 'Fecha Inicio' },
            { key: 'end_date', label: 'Fecha Fin' },
            { key: 'status', label: 'Estado' },
            { key: 'created_at', label: 'Fecha de Registro' },
            { key: 'updated_at', label: 'Última Actualización' },
            { key: 'internal_notes', label: 'Notas Internas' },
        ],
        [],
    );
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        exportColumns.map((column) => column.key),
    );

    const buildExportParams = () => {
        const params = new URLSearchParams();
        if (filters?.search) params.set('search', filters.search);
        if (filters?.status) params.set('status', filters.status);
        if (filters?.order) params.set('order', filters.order);
        if (selectedColumns.length) {
            params.set('columns', selectedColumns.join(','));
        }
        return params.toString();
    };

    const handleExport = () => {
        const query = buildExportParams();
        window.open(
            `/centros/${educationCenter.id}/export${query ? `?${query}` : ''}`,
        );
        setExportOpen(false);
        toast({
            title: 'Exportación iniciada',
            description: 'Tu descarga comenzará en breve.',
        });
    };

    useEffect(() => {
        const filtersEntries = Object.entries(filters || {}).filter(
            ([key, value]) => {
                if (value === undefined || value === null || value === '')
                    return false;
                if (key === 'order' && value === 'az') return false;
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
                    'No hay becarios que coincidan con los filtros actuales.',
            });
            lastEmptyKeyRef.current = emptyKey;
        }
    }, [filters, interns.data.length]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Centros Educativos', href: '/centros' },
        { title: educationCenter.name, href: `/centros/${educationCenter.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Centro: ${educationCenter.name}`} />

            <div className="space-y-6">
                {/* CABECERA DE ACCIÓN RÁPIDA */}
                <div className="flex items-center justify-between px-2">
                    <Button
                        variant="default"
                        className="bg-gradient-to-r from-sidebar to-[#1f4f52] text-white hover:opacity-95 shadow-sm rounded-xl font-bold uppercase tracking-widest text-[10px] border-0"
                        asChild
                    >
                        <Link href="/centros">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
                        </Link>
                    </Button>
                </div>

                {/* HERO INTEGRADO CON GRADIENTE */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 shadow-2xl md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative flex flex-wrap items-center gap-8">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 border-4 border-white/20 shadow-2xl backdrop-blur-md">
                            <School className="h-10 w-10 text-white" />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                                    {educationCenter.name}
                                </h1>
                                {isTrashed && (
                                    <Badge variant="destructive" className="bg-white/20 text-white border-white/30 backdrop-blur-md rounded-lg h-6 text-[10px]">
                                        Archivado
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-bold tracking-tight text-xs uppercase">{educationCenter.city || 'Ciudad no especificada'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    <span className="font-bold tracking-tight text-xs uppercase">{educationCenter.code || 'Sin código'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {isTrashed ? (
                                canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-2xl px-6 font-bold"
                                            onClick={() => router.post(`/centros/${educationCenter.id}/restore`)}
                                        >
                                            Restaurar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="rounded-2xl px-6 font-bold"
                                            onClick={() => {
                                                if (confirm('¿Seguro que quieres eliminar definitivamente este centro?')) {
                                                    router.delete(`/centros/${educationCenter.id}/force`);
                                                }
                                            }}
                                        >
                                            Eliminar Definitivo
                                        </Button>
                                    </>
                                )
                            ) : (
                                canManage && (
                                    <ConfirmNavigationButton
                                        href={`/centros/${educationCenter.id}/edit`}
                                        title="Confirmar edición"
                                        description={`Vas a editar la ficha de ${educationCenter.name}.`}
                                        confirmLabel="Ir a editar"
                                        className="bg-white text-sidebar hover:bg-white/90 rounded-2xl px-8 font-black shadow-lg transition-all"
                                    >
                                        Editar Información
                                    </ConfirmNavigationButton>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* PANEL ÚNICO UNIFICADO */}
                <Card className="app-panel rounded-3xl overflow-hidden border-sidebar/10 pt-0 pb-0 shadow-2xl">
                    <Tabs defaultValue="general" className="w-full">
                        {/* NAVEGACIÓN INTEGRADA */}
                        <div className="border-b border-sidebar/20 bg-stone-100/50 p-2">
                            <TabsList className="h-auto w-full grid grid-cols-1 gap-2 bg-transparent p-0 md:h-12 md:grid-cols-3">
                                {[
                                    { value: 'general', label: 'Información General', icon: Info },
                                    { value: 'becarios', label: `Becarios (${interns.total})`, icon: Users },
                                    { value: 'seguimiento', label: 'Seguimiento y Auditoría', icon: HistoryIcon },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="relative h-10 w-full rounded-xl border-none bg-transparent px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 shadow-none transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4" />
                                            <span className="truncate">{tab.label}</span>
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <CardContent className="p-8">
                            {/* PESTAÑA GENERAL */}
                            <TabsContent value="general" className="mt-0 space-y-12 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                    <div className="md:col-span-8 space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            {[
                                                { label: 'Código de Centro', value: educationCenter.code, icon: Hash },
                                                { label: 'Localidad / Ciudad', value: educationCenter.city, icon: MapPin },
                                                { label: 'Persona de Contacto', value: educationCenter.contact_person, icon: User },
                                                { label: 'Email Institucional', value: educationCenter.email, icon: Mail, isLink: true, href: `mailto:${educationCenter.email}` },
                                                { label: 'Correo del Coordinador', value: educationCenter.contact_email, icon: Mail, isLink: true, href: `mailto:${educationCenter.contact_email}` },
                                                { label: 'Teléfono', value: educationCenter.phone, icon: Phone },
                                                { label: 'Sitio Web', value: educationCenter.web, icon: Globe, isLink: true, href: educationCenter.web, target: '_blank' },
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-1.5 group">
                                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                                        <item.icon className="h-3 w-3" /> {item.label}
                                                    </p>
                                                    {item.isLink && item.value ? (
                                                        <a href={item.href} target={item.target} className="text-sm font-bold text-primary hover:underline block truncate">
                                                            {item.value}
                                                        </a>
                                                    ) : (
                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.value || '—'}</p>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="md:col-span-2 space-y-1.5">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Dirección Completa</p>
                                                {educationCenter.address ? (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${educationCenter.address}, ${educationCenter.city || ''}`)}`}
                                                        target="_blank"
                                                        className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                                    >
                                                        {educationCenter.address} <ExternalLink className="h-3 w-3 opacity-50" />
                                                    </a>
                                                ) : <p className="text-sm font-bold text-slate-400">—</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-4 translate-y-[-10px]">
                                        <div className="space-y-4 rounded-3xl bg-gradient-to-br from-sidebar to-[#1f4f52] p-6 shadow-xl shadow-sidebar/10">
                                            <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase text-white/75">
                                                <FileText className="h-3 w-3" /> Convenio de Prácticas
                                            </h4>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-white/70">Fecha Firma</span>
                                                    <span className="text-sm font-bold text-white">{formatDateEs(educationCenter.agreement_signed_at)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-white/70">Vencimiento</span>
                                                    <span className="text-sm font-bold text-white">{formatDateEs(educationCenter.agreement_expires_at)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-white/70">Plazas Máximas</span>
                                                    <span className="text-sm font-bold text-white">{educationCenter.agreement_slots ?? 'Ilimitadas'}</span>
                                                </div>
                                            </div>

                                            {agreement_url && (
                                                <div className="pt-2 grid grid-cols-2 gap-3">
                                                    <Button variant="outline" size="sm" className="rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20" asChild>
                                                        <a href={agreement_url} target="_blank">Ver</a>
                                                    </Button>
                                                    <Button size="sm" className="rounded-xl bg-white text-sidebar hover:bg-white/90" asChild>
                                                        <a href={agreement_url} download>Descargar</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA BECARIOS */}
                            <TabsContent value="becarios" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                {/* BARRA DE HERRAMIENTAS DE BECARIOS */}
                                <div className="mb-8 flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-br from-sidebar to-[#1f4f52] p-6 shadow-xl shadow-sidebar/10 md:flex-row md:items-center">
                                    <div className="flex flex-1 items-center gap-4">
                                        <div className="relative w-full max-w-md">
                                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/60" />
                                            <Input
                                                placeholder="Buscar por nombre o DNI..."
                                                className="h-12 rounded-2xl border border-white/20 bg-white/10 pl-11 font-medium text-white placeholder:text-white/60 shadow-sm transition-all focus:ring-2 focus:ring-white/25"
                                                defaultValue={filters?.search}
                                                onChange={(e) => router.get(`/centros/${educationCenter.id}`, { search: e.target.value, status: filters?.status, order: filters?.order }, { preserveState: true, preserveScroll: true, replace: true })}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                className="h-12 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white shadow-sm focus:ring-2 focus:ring-white/25"
                                                value={filters?.status ?? ''}
                                                onChange={(e) => router.get(`/centros/${educationCenter.id}`, { search: filters?.search, status: e.target.value || undefined, order: filters?.order }, { preserveState: true, preserveScroll: true, replace: true })}
                                            >
                                                <option value="">Todos los Estados</option>
                                                <option value="active">Becarios Activos</option>
                                                <option value="completed">Finalizados</option>
                                                <option value="abandoned">Abandonados</option>
                                            </select>

                                            <select
                                                className="h-12 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white shadow-sm focus:ring-2 focus:ring-white/25"
                                                value={filters?.order ?? 'az'}
                                                onChange={(e) => router.get(`/centros/${educationCenter.id}`, { search: filters?.search, status: filters?.status, order: e.target.value }, { preserveState: true, preserveScroll: true, replace: true })}
                                            >
                                                <option value="az">A → Z</option>
                                                <option value="za">Z → A</option>
                                                <option value="recent">Nuevos primero</option>
                                            </select>
                                        </div>
                                    </div>

                                    {canExport && (
                                            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                                                <DialogTrigger asChild>
                                                <Button className="flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sidebar shadow-lg shadow-sidebar/20 hover:bg-white/90">
                                                    <FileDown className="h-4 w-4" />
                                                    Exportar Excel
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-xl rounded-3xl border-none p-8">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-bold">Personalizar Exportación</DialogTitle>
                                                    <DialogDescription className="text-slate-500 py-2">
                                                        Selecciona los campos que deseas incluir en el informe de {interns.total} alumnos.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid grid-cols-2 gap-3 py-6">
                                                    {exportColumns.map((column) => (
                                                        <label key={column.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                                            <Checkbox
                                                                checked={selectedColumns.includes(column.key)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) setSelectedColumns([...selectedColumns, column.key]);
                                                                    else setSelectedColumns(selectedColumns.filter(c => c !== column.key));
                                                                }}
                                                            />
                                                            <span className="text-sm font-medium">{column.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" className="rounded-xl px-6" onClick={() => setExportOpen(false)}>Cerrar</Button>
                                                    <Button className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700" onClick={handleExport}>Descargar Listado</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>

                                {/* LISTADO DE BECARIOS (TABLA INTEGRADA) */}
                                <div className="w-full overflow-hidden rounded-3xl border border-sidebar/30 bg-gradient-to-br from-sidebar to-[#1f4f52] shadow-xl shadow-sidebar/10">
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/15 bg-white/10">
                                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Alumno</th>
                                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Titulación</th>
                                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Estado</th>
                                                    <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/70">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {interns.data.length > 0 ? (
                                                    interns.data.map((intern: any) => (
                                                        <tr key={intern.id} className="transition-colors hover:bg-white/5">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-white/15">
                                                                        <AvatarImage src={intern.user?.avatar || ''} alt={intern.user?.name || ''} />
                                                                        <AvatarFallback className="bg-transparent font-bold text-white">
                                                                            {intern.user?.name ? intern.user.name.substring(0, 2).toUpperCase() : 'BE'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex flex-col">
                                                                        {!isIntern ? (
                                                                            <Link href={`/becarios/${intern.id}`} className="font-bold text-white transition-colors hover:text-white/80">
                                                                                {intern.user.name}
                                                                            </Link>
                                                                        ) : (
                                                                            <span className="font-bold text-white">{intern.user.name}</span>
                                                                        )}
                                                                        <span className="text-[10px] font-bold uppercase text-white/60">{intern.dni}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-medium text-white/85">{intern.academic_degree}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge status={intern.status} />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {!isIntern && (
                                                                    <Button variant="ghost" size="sm" className="rounded-xl border border-white/20 bg-white text-sidebar hover:bg-white/90 hover:shadow-sm" asChild>
                                                                        <Link href={`/becarios/${intern.id}`}>Ver Perfil</Link>
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-20 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <Users className="mb-4 h-10 w-10 text-white/35" />
                                                                <p className="font-medium text-white/70">No se encontraron becarios con estos filtros.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* PAGINACIÓN INTEGRADA */}
                                    <div className="flex items-center justify-between border-t border-white/15 bg-white/10 px-6 py-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                                            Mostrando {interns.from || 0} a {interns.to || 0} de {interns.total} alumnos
                                        </p>
                                        <Pagination links={interns.links} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA SEGUIMIENTO */}
                            <TabsContent value="seguimiento" className="mt-0 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                                    <div className="md:col-span-12 flex items-center justify-between border-b border-slate-50 pb-3 tracking-tight dark:border-slate-800">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <HistoryIcon className="h-5 w-5 text-slate-500" />
                                            Historial y Notas de Auditoría
                                        </h3>
                                    </div>

                                    {canViewNotes && (
                                        <div className="md:col-span-5 space-y-6">
                                            <div className="space-y-4">
                                                <div className="rounded-2xl border border-sidebar/15 bg-white p-5 shadow-sm dark:bg-slate-900">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notas del centro</p>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        Escribe aquí observaciones internas sobre este centro educativo y guarda cuando quieras.
                                                    </p>
                                                    <textarea
                                                        value={notesValue}
                                                        onChange={(e) => setNotesValue(e.target.value)}
                                                        className="mt-4 min-h-[220px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition-all focus:border-sidebar/30 focus:bg-white focus:ring-2 focus:ring-sidebar/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800"
                                                        placeholder="Añade observaciones internas sobre este centro..."
                                                    />
                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl px-6"
                                                            onClick={() => setNotesValue(educationCenter.internal_notes || '')}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 text-white hover:opacity-95"
                                                            onClick={() =>
                                                                router.patch(`/centros/${educationCenter.id}/notes`, { internal_notes: notesValue }, { preserveScroll: true })
                                                            }
                                                        >
                                                            Guardar
                                                        </Button>
                                                    </div>

                                                    {(educationCenter.notes_updated_by || educationCenter.internal_notes_updated_at) && (
                                                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                                                            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Última edición</span>
                                                            <span className="text-[10px] font-bold text-slate-500">
                                                                {educationCenter.notes_updated_by?.name || 'Sistema'}
                                                                {educationCenter.internal_notes_updated_at ? ` · ${formatDateTimeEs(educationCenter.internal_notes_updated_at)}` : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`${canViewNotes ? 'md:col-span-7' : 'md:col-span-12'} relative min-w-0 space-y-6 pl-8 before:absolute before:bottom-0 before:left-0 before:top-4 before:w-px before:bg-slate-100 dark:before:bg-slate-800`}>
                                        <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Actividad Reciente</h4>
                                        <div className="space-y-10">
                                            {displayedActivities.length > 0 ? (
                                                displayedActivities.map((activity) => {
                                                    const changes = activity.properties?.attributes ?? {};
                                                    const old = activity.properties?.old ?? {};
                                                    const labels: Record<string, string> = {
                                                        name: 'Nombre', code: 'Código', address: 'Dirección', city: 'Ciudad',
                                                        contact_person: 'Contacto', contact_email: 'Email centro', phone: 'Teléfono',
                                                        web: 'Web', agreement_signed_at: 'Firma', agreement_expires_at: 'Vencimiento',
                                                        internal_notes: 'Notas internas',
                                                        internal_notes_updated_at: 'Fecha de actualización de notas',
                                                        internal_notes_updated_by: 'Actualizado por',
                                                    };

                                                    const formatValue = (field: string, value: any) => {
                                                        if (value === null || value === undefined || value === '') return '—';

                                                        if (field.endsWith('_at') || field.endsWith('_date')) {
                                                            try {
                                                                return formatDateEs(value);
                                                            } catch (e) {
                                                                return value;
                                                            }
                                                        }

                                                        return String(value);
                                                    };

                                                    const visibleFields = Object.keys(changes).filter(k => k in labels && old[k] !== changes[k]);

                                                    return (
                                                        <div key={activity.id} className="relative group">
                                                            <div className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 group-hover:bg-primary z-10 transition-colors" />
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDateTimeEs(activity.created_at)}</p>
                                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 uppercase">
                                                                    {activity.event === 'updated' ? 'Actualización de ficha' : 'Registro creado'}
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-0.5">Realizado por <span className="font-bold text-slate-700 dark:text-slate-300">{activity.causer_name || 'Sistema'}</span></p>

                                                                {visibleFields.length > 0 && (
                                                                    <div className="mt-4 space-y-2 p-4 rounded-2xl border border-sidebar/20 bg-white dark:bg-slate-900">
                                                                        {visibleFields.map(field => (
                                                                            <div key={field} className="text-[11px] grid grid-cols-12 gap-2">
                                                                                <span className="col-span-4 text-slate-500 font-bold">{labels[field]}:</span>
                                                                                <div className="col-span-8">
                                                                                    <span className="line-through opacity-30 italic">{formatValue(field, old[field])}</span>
                                                                                    <span className="mx-2 text-primary/40">→</span>
                                                                                    <span className="font-bold text-primary">{formatValue(field, changes[field])}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-sm text-slate-400 italic py-4">Aún no hay actividad registrada para este centro.</p>
                                            )}
                                        </div>

                                        {totalActivityPages > 1 && (
                                            <div className="mt-8 flex items-center justify-between border-t border-sidebar/20 pt-8">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    disabled={activityPage === 1}
                                                    onClick={() => setActivityPage((p) => p - 1)}
                                                    className="h-10 rounded-xl border-none bg-gradient-to-r from-sidebar to-[#1f4f52] px-4 text-white shadow-lg shadow-sidebar/10 hover:opacity-95 disabled:opacity-50"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Anterior
                                                </Button>

                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                                    Página {activityPage} de {totalActivityPages}
                                                </span>

                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    disabled={activityPage === totalActivityPages}
                                                    onClick={() => setActivityPage((p) => p + 1)}
                                                    className="h-10 rounded-xl border-none bg-gradient-to-r from-sidebar to-[#1f4f52] px-4 text-white shadow-lg shadow-sidebar/10 hover:opacity-95 disabled:opacity-50"
                                                >
                                                    Siguiente
                                                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </AppLayout>
    );
}
