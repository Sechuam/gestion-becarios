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
    ExternalLink,
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { MetricPills } from '@/components/common/MetricPills';
import { ModuleHeader } from '@/components/common/ModuleHeader';
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
import { cn } from '@/lib/utils';
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
    const canViewNotes =
        auth.user?.permissions?.includes('view internal notes') || canManage;
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

    const breadcrumbs: BreadcrumbItem[] = isIntern
        ? [
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Mi Centro', href: '/mi-centro' },
          ]
        : [
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Centros Educativos', href: '/centros' },
              {
                  title: educationCenter.name,
                  href: `/centros/${educationCenter.id}`,
              },
          ];

    const headerMetrics = [
        {
            label: 'Becarios registrados',
            value: interns.total,
        },
        {
            label: 'Plazas de convenio',
            value: educationCenter.agreement_slots ?? 'Ilimitadas',
        },
        {
            label: 'Vencimiento convenio',
            value: educationCenter.agreement_expires_at
                ? formatDateEs(educationCenter.agreement_expires_at)
                : 'Sin vencimiento',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Centro: ${educationCenter.name}`} />

            <div className="space-y-6">
                <ModuleHeader
                    title={educationCenter.name}
                    description={`Ficha oficial del centro de formación. Localidad: ${educationCenter.city || 'No especificada'} · Código de centro: ${educationCenter.code || 'Sin código'}`}
                    icon={<School className="h-5 w-5" />}
                    variant="sidebar"
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            {!isIntern && (
                                <Button
                                    variant="default"
                                    className="h-8 rounded-lg border border-slate-200 bg-white text-xs font-bold text-sidebar shadow-xs hover:bg-slate-50"
                                    asChild
                                >
                                    <Link href="/centros">
                                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />{' '}
                                        Volver al listado
                                    </Link>
                                </Button>
                            )}
                            {isTrashed
                                ? canManage && (
                                      <div className="flex gap-2">
                                          <Button
                                              variant="outline"
                                              className="h-8 rounded-lg border-white/20 bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/20"
                                              onClick={() =>
                                                  router.post(
                                                      `/centros/${educationCenter.id}/restore`,
                                                  )
                                              }
                                          >
                                              Restaurar
                                          </Button>
                                          <Button
                                              variant="destructive"
                                              className="h-8 rounded-lg px-3 text-xs font-bold"
                                              onClick={() => {
                                                  if (
                                                      confirm(
                                                          '¿Seguro que quieres eliminar definitivamente este centro?',
                                                      )
                                                  ) {
                                                      router.delete(
                                                          `/centros/${educationCenter.id}/force`,
                                                      );
                                                  }
                                              }}
                                          >
                                              Eliminar Definitivo
                                          </Button>
                                      </div>
                                  )
                                : canManage &&
                                  !isIntern && (
                                      <ConfirmNavigationButton
                                          href={`/centros/${educationCenter.id}/edit`}
                                          title="Confirmar edición"
                                          description={`Vas a editar la ficha de ${educationCenter.name}.`}
                                          confirmLabel="Ir a editar"
                                          className="h-8 rounded-lg bg-white px-4 text-xs font-black text-sidebar shadow-xs hover:bg-white/90"
                                      >
                                          Editar Ficha
                                      </ConfirmNavigationButton>
                                  )}
                        </div>
                    }
                />
                <MetricPills metrics={headerMetrics} />

                {/* PANEL ÚNICO UNIFICADO */}
                <Card className="app-panel overflow-hidden rounded-xl border-sidebar/10 pt-0 pb-0 shadow-xl">
                    <Tabs defaultValue="general" className="w-full">
                        <div className="border-b border-sidebar/20 bg-stone-100/50 p-2">
                            <TabsList
                                className={cn(
                                    'grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:h-10',
                                    isIntern
                                        ? 'md:grid-cols-2'
                                        : 'md:grid-cols-3',
                                )}
                            >
                                {[
                                    {
                                        value: 'general',
                                        label: 'Información General',
                                        icon: Info,
                                    },
                                    {
                                        value: 'becarios',
                                        label: `Becarios (${interns.total})`,
                                        icon: Users,
                                    },
                                    !isIntern && {
                                        value: 'seguimiento',
                                        label: 'Seguimiento y Auditoría',
                                        icon: HistoryIcon,
                                    },
                                ]
                                    .filter(
                                        (
                                            tab,
                                        ): tab is {
                                            value: string;
                                            label: string;
                                            icon: any;
                                        } => !!tab,
                                    )
                                    .map((tab) => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className="relative h-10 w-full rounded-xl border-none bg-transparent px-2 text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase shadow-none transition-all data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                                        >
                                            <div className="flex items-center gap-2">
                                                <tab.icon className="h-4 w-4" />
                                                <span className="truncate">
                                                    {tab.label}
                                                </span>
                                            </div>
                                        </TabsTrigger>
                                    ))}
                            </TabsList>
                        </div>

                        <CardContent className="p-5">
                            {/* PESTAÑA GENERAL */}
                            <TabsContent
                                value="general"
                                className="mt-0 animate-in space-y-6 duration-500 fade-in"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                                    <div className="space-y-4 md:col-span-8">
                                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                                            {[
                                                {
                                                    label: 'Código de Centro',
                                                    value: educationCenter.code,
                                                    icon: Hash,
                                                },
                                                {
                                                    label: 'Localidad / Ciudad',
                                                    value: educationCenter.city,
                                                    icon: MapPin,
                                                },
                                                {
                                                    label: 'Persona de Contacto',
                                                    value: educationCenter.contact_person,
                                                    icon: User,
                                                },
                                                {
                                                    label: 'Email Institucional',
                                                    value: educationCenter.email,
                                                    icon: Mail,
                                                    isLink: true,
                                                    href: `mailto:${educationCenter.email}`,
                                                },
                                                {
                                                    label: 'Correo del Coordinador',
                                                    value: educationCenter.contact_email,
                                                    icon: Mail,
                                                    isLink: true,
                                                    href: `mailto:${educationCenter.contact_email}`,
                                                },
                                                {
                                                    label: 'Teléfono',
                                                    value: educationCenter.phone,
                                                    icon: Phone,
                                                },
                                                {
                                                    label: 'Sitio Web',
                                                    value: educationCenter.web,
                                                    icon: Globe,
                                                    isLink: true,
                                                    href: educationCenter.web,
                                                    target: '_blank',
                                                },
                                            ].map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="group space-y-1"
                                                >
                                                    <p className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                        <item.icon className="h-3.5 w-3.5 text-sidebar/65 dark:text-white/60" />{' '}
                                                        {item.label}
                                                    </p>
                                                    {item.isLink &&
                                                    item.value ? (
                                                        <a
                                                            href={item.href}
                                                            target={item.target}
                                                            className="block truncate text-xs font-semibold text-primary hover:underline"
                                                        >
                                                            {item.value}
                                                        </a>
                                                    ) : (
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                                            {item.value || '—'}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="space-y-1 md:col-span-2">
                                                <p className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                    <MapPin className="h-3.5 w-3.5 text-sidebar/65 dark:text-white/60" />{' '}
                                                    Dirección Completa
                                                </p>
                                                {educationCenter.address ? (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${educationCenter.address}, ${educationCenter.city || ''}`)}`}
                                                        target="_blank"
                                                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-colors hover:text-indigo-600 dark:text-slate-100"
                                                    >
                                                        {
                                                            educationCenter.address
                                                        }{' '}
                                                        <ExternalLink className="h-3 w-3 opacity-50" />
                                                    </a>
                                                ) : (
                                                    <p className="text-xs font-semibold text-slate-400">
                                                        —
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-4">
                                        <div className="space-y-3.5 rounded-xl bg-gradient-to-br from-sidebar to-[#1f4f52] p-4 shadow-xl shadow-sidebar/10">
                                            <h4 className="mb-2.5 flex items-center gap-1.5 text-[10px] font-black tracking-wider text-white/75 uppercase">
                                                <FileText className="h-3.5 w-3.5" />{' '}
                                                Convenio de Prácticas
                                            </h4>

                                            <div className="space-y-2.5 border-t border-white/10 pt-2.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-white/70">
                                                        Fecha Firma
                                                    </span>
                                                    <span className="font-semibold text-white">
                                                        {formatDateEs(
                                                            educationCenter.agreement_signed_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-white/70">
                                                        Vencimiento
                                                    </span>
                                                    <span className="font-semibold text-white">
                                                        {formatDateEs(
                                                            educationCenter.agreement_expires_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-white/70">
                                                        Plazas Máximas
                                                    </span>
                                                    <span className="font-semibold text-white">
                                                        {educationCenter.agreement_slots ??
                                                            'Ilimitadas'}
                                                    </span>
                                                </div>
                                            </div>

                                            {agreement_url && (
                                                <div className="grid grid-cols-2 gap-2 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 rounded-lg border-white/20 bg-white/10 text-xs text-white hover:bg-white/20"
                                                        asChild
                                                    >
                                                        <a
                                                            href={agreement_url}
                                                            target="_blank"
                                                        >
                                                            Ver
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 rounded-lg bg-white text-xs font-bold text-sidebar hover:bg-white/90"
                                                        asChild
                                                    >
                                                        <a
                                                            href={agreement_url}
                                                            download
                                                        >
                                                            Descargar
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA BECARIOS */}
                            <TabsContent
                                value="becarios"
                                className="mt-0 animate-in space-y-4 duration-500 fade-in"
                            >
                                {/* BARRA DE HERRAMIENTAS DE BECARIOS */}
                                <div className="rounded-xl border border-sidebar/10 bg-white/70 p-1.5 shadow-xs backdrop-blur-md transition-all dark:bg-slate-900/60">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="relative w-full flex-none sm:w-64">
                                            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por nombre o DNI..."
                                                className="h-8 rounded-lg border-sidebar/10 bg-slate-50/50 pl-9 text-[11px] text-foreground shadow-xs placeholder:text-muted-foreground focus:ring-sidebar/20"
                                                defaultValue={filters?.search}
                                                onChange={(e) =>
                                                    router.get(
                                                        `/centros/${educationCenter.id}`,
                                                        {
                                                            search: e.target
                                                                .value,
                                                            status: filters?.status,
                                                            order: filters?.order,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                            replace: true,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="min-w-[140px] flex-1">
                                            <select
                                                className="h-8 w-full rounded-lg border border-sidebar/10 bg-card px-3 text-[11px] font-semibold text-foreground shadow-xs transition-colors hover:bg-slate-50"
                                                value={filters?.status ?? ''}
                                                onChange={(e) =>
                                                    router.get(
                                                        `/centros/${educationCenter.id}`,
                                                        {
                                                            search: filters?.search,
                                                            status:
                                                                e.target
                                                                    .value ||
                                                                undefined,
                                                            order: filters?.order,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                            replace: true,
                                                        },
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Todos los Estados
                                                </option>
                                                <option value="active">
                                                    Becarios Activos
                                                </option>
                                                <option value="completed">
                                                    Finalizados
                                                </option>
                                                <option value="abandoned">
                                                    Abandonados
                                                </option>
                                            </select>
                                        </div>

                                        <div className="min-w-[140px] flex-1">
                                            <select
                                                className="h-8 w-full rounded-lg border border-sidebar/10 bg-card px-3 text-[11px] font-semibold text-foreground shadow-xs transition-colors hover:bg-slate-50"
                                                value={filters?.order ?? 'az'}
                                                onChange={(e) =>
                                                    router.get(
                                                        `/centros/${educationCenter.id}`,
                                                        {
                                                            search: filters?.search,
                                                            status: filters?.status,
                                                            order: e.target
                                                                .value,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                            replace: true,
                                                        },
                                                    )
                                                }
                                            >
                                                <option value="az">
                                                    A → Z
                                                </option>
                                                <option value="za">
                                                    Z → A
                                                </option>
                                                <option value="recent">
                                                    Nuevos primero
                                                </option>
                                            </select>
                                        </div>

                                        {canExport && (
                                            <Dialog
                                                open={exportOpen}
                                                onOpenChange={setExportOpen}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button className="h-8 flex-1 rounded-lg bg-gradient-to-r from-sidebar to-[#1f4f52] px-3 text-[9px] font-black tracking-widest text-white uppercase shadow-xs sm:flex-none">
                                                        <FileDown className="mr-1.5 h-3.5 w-3.5" />
                                                        Exportar Excel
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-xl rounded-xl border-none p-6">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl font-bold">
                                                            Personalizar
                                                            Exportación
                                                        </DialogTitle>
                                                        <DialogDescription className="py-1.5 text-xs text-slate-500">
                                                            Selecciona los
                                                            campos que deseas
                                                            incluir en el
                                                            informe de{' '}
                                                            {interns.total}{' '}
                                                            alumnos.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid grid-cols-2 gap-3 py-4">
                                                        {exportColumns.map(
                                                            (column) => (
                                                                <label
                                                                    key={
                                                                        column.key
                                                                    }
                                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 p-2.5 transition-colors hover:bg-slate-50"
                                                                >
                                                                    <Checkbox
                                                                        checked={selectedColumns.includes(
                                                                            column.key,
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) => {
                                                                            if (
                                                                                checked
                                                                            )
                                                                                setSelectedColumns(
                                                                                    [
                                                                                        ...selectedColumns,
                                                                                        column.key,
                                                                                    ],
                                                                                );
                                                                            else
                                                                                setSelectedColumns(
                                                                                    selectedColumns.filter(
                                                                                        (
                                                                                            c,
                                                                                        ) =>
                                                                                            c !==
                                                                                            column.key,
                                                                                    ),
                                                                                );
                                                                        }}
                                                                    />
                                                                    <span className="text-xs font-semibold">
                                                                        {
                                                                            column.label
                                                                        }
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            className="h-9 rounded-xl px-5 text-xs"
                                                            onClick={() =>
                                                                setExportOpen(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            Cerrar
                                                        </Button>
                                                        <Button
                                                            className="h-9 rounded-xl bg-indigo-600 px-6 text-xs font-semibold hover:bg-indigo-700"
                                                            onClick={
                                                                handleExport
                                                            }
                                                        >
                                                            Descargar Listado
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        <div className="flex h-8 flex-none items-center gap-1.5 rounded-lg border border-sidebar/5 bg-slate-50 px-2.5 dark:bg-slate-800">
                                            <span className="flex h-1 w-1 animate-pulse rounded-full bg-sidebar" />
                                            <span className="text-[10px] font-bold whitespace-nowrap text-muted-foreground tabular-nums">
                                                {interns.data.length} /{' '}
                                                {interns.total}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* LISTADO DE BECARIOS (TABLA INTEGRADA) */}
                                <div className="w-full overflow-hidden rounded-xl border border-sidebar/30 bg-gradient-to-br from-sidebar to-[#1f4f52] shadow-xl shadow-sidebar/10">
                                    <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-400 bg-slate-200">
                                                    <th className="px-4 py-3 text-[9px] font-black tracking-widest text-slate-700 uppercase">
                                                        Alumno
                                                    </th>
                                                    <th className="px-4 py-3 text-[9px] font-black tracking-widest text-slate-700 uppercase">
                                                        Titulación
                                                    </th>
                                                    <th className="px-4 py-3 text-[9px] font-black tracking-widest text-slate-700 uppercase">
                                                        Estado
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-[9px] font-black tracking-widest text-slate-700 uppercase">
                                                        Acción
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {interns.data.length > 0 ? (
                                                    interns.data.map(
                                                        (intern: any) => (
                                                            <tr
                                                                key={intern.id}
                                                                className="transition-colors hover:bg-white/5"
                                                            >
                                                                <td className="px-4 py-2.5">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <Avatar className="h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/15">
                                                                            <AvatarImage
                                                                                src={
                                                                                    intern
                                                                                        .user
                                                                                        ?.avatar ||
                                                                                    ''
                                                                                }
                                                                                alt={
                                                                                    intern
                                                                                        .user
                                                                                        ?.name ||
                                                                                    ''
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="bg-transparent text-xs font-bold text-white">
                                                                                {intern
                                                                                    .user
                                                                                    ?.name
                                                                                    ? intern.user.name
                                                                                          .substring(
                                                                                              0,
                                                                                              2,
                                                                                          )
                                                                                          .toUpperCase()
                                                                                    : 'BE'}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex flex-col">
                                                                            {!isIntern ? (
                                                                                <Link
                                                                                    href={`/becarios/${intern.id}`}
                                                                                    className="text-xs font-bold text-white transition-colors hover:text-white/80"
                                                                                >
                                                                                    {
                                                                                        intern
                                                                                            .user
                                                                                            .name
                                                                                    }
                                                                                </Link>
                                                                            ) : (
                                                                                <span className="text-xs font-bold text-white">
                                                                                    {
                                                                                        intern
                                                                                            .user
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            <span className="text-[9px] font-bold text-white/50 uppercase">
                                                                                {
                                                                                    intern.dni
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <span className="text-xs font-semibold text-white/90">
                                                                        {
                                                                            intern.academic_degree
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <StatusBadge
                                                                        status={
                                                                            intern.status
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-2.5 text-right">
                                                                    {!isIntern && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 rounded-lg border border-white/20 bg-white px-3 text-[10px] font-bold text-sidebar hover:bg-white/90 hover:shadow-xs"
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={`/becarios/${intern.id}`}
                                                                            >
                                                                                Ver
                                                                                Perfil
                                                                            </Link>
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="px-4 py-8 text-center"
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <Users className="mb-3 h-8 w-8 text-white/35" />
                                                                <p className="text-xs font-medium text-white/70">
                                                                    No se
                                                                    encontraron
                                                                    becarios con
                                                                    estos
                                                                    filtros.
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* PAGINACIÓN INTEGRADA */}
                                    <div className="flex items-center justify-between border-t border-white/15 bg-white/10 px-4 py-3">
                                        <p className="text-[9px] font-black tracking-widest text-white/70 uppercase">
                                            Mostrando {interns.from || 0} a{' '}
                                            {interns.to || 0} de {interns.total}{' '}
                                            alumnos
                                        </p>
                                        <Pagination links={interns.links} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA SEGUIMIENTO */}
                            <TabsContent
                                value="seguimiento"
                                className="mt-0 animate-in duration-500 fade-in"
                            >
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 tracking-tight md:col-span-12 dark:border-slate-800">
                                        <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                                            <HistoryIcon className="h-4.5 w-4.5 text-slate-500" />
                                            Historial y Notas de Auditoría
                                        </h3>
                                    </div>

                                    {canViewNotes && (
                                        <div className="space-y-4 md:col-span-5">
                                            <div className="space-y-3">
                                                <div className="rounded-xl border border-sidebar/15 bg-white p-4 shadow-xs dark:bg-slate-900">
                                                    <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                        Notas del centro
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                        Escribe observaciones
                                                        internas sobre este
                                                        centro educativo y
                                                        guarda cuando quieras.
                                                    </p>
                                                    <textarea
                                                        value={notesValue}
                                                        onChange={(e) =>
                                                            setNotesValue(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-3 min-h-[140px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700 transition-all outline-none focus:border-sidebar/30 focus:bg-white focus:ring-2 focus:ring-sidebar/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800"
                                                        placeholder="Añade observaciones internas sobre este centro..."
                                                    />
                                                    <div className="mt-3 flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 rounded-lg px-4 text-xs"
                                                            onClick={() =>
                                                                setNotesValue(
                                                                    educationCenter.internal_notes ||
                                                                        '',
                                                                )
                                                            }
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 rounded-lg bg-gradient-to-r from-sidebar to-[#1f4f52] px-4 text-xs font-bold text-white hover:opacity-95"
                                                            onClick={() =>
                                                                router.patch(
                                                                    `/centros/${educationCenter.id}/notes`,
                                                                    {
                                                                        internal_notes:
                                                                            notesValue,
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Guardar
                                                        </Button>
                                                    </div>

                                                    {(educationCenter.notes_updated_by ||
                                                        educationCenter.internal_notes_updated_at) && (
                                                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[9px] font-semibold text-slate-400 dark:border-slate-700">
                                                            <span className="tracking-tighter uppercase opacity-70">
                                                                Última edición
                                                            </span>
                                                            <span className="text-slate-500">
                                                                {educationCenter
                                                                    .notes_updated_by
                                                                    ?.name ||
                                                                    'Sistema'}
                                                                {educationCenter.internal_notes_updated_at
                                                                    ? ` · ${formatDateTimeEs(educationCenter.internal_notes_updated_at)}`
                                                                    : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`${canViewNotes ? 'md:col-span-7' : 'md:col-span-12'} relative min-w-0 space-y-4 pl-6 before:absolute before:top-3 before:bottom-0 before:left-0 before:w-px before:bg-slate-100 dark:before:bg-slate-800`}
                                    >
                                        <h4 className="mb-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                            Actividad Reciente
                                        </h4>
                                        <div className="space-y-6">
                                            {displayedActivities.length > 0 ? (
                                                displayedActivities.map(
                                                    (activity) => {
                                                        const changes =
                                                            activity.properties
                                                                ?.attributes ??
                                                            {};
                                                        const old =
                                                            activity.properties
                                                                ?.old ?? {};
                                                        const labels: Record<
                                                            string,
                                                            string
                                                        > = {
                                                            name: 'Nombre',
                                                            code: 'Código',
                                                            address:
                                                                'Dirección',
                                                            city: 'Ciudad',
                                                            contact_person:
                                                                'Contacto',
                                                            contact_email:
                                                                'Email centro',
                                                            phone: 'Teléfono',
                                                            web: 'Web',
                                                            agreement_signed_at:
                                                                'Firma',
                                                            agreement_expires_at:
                                                                'Vencimiento',
                                                            internal_notes:
                                                                'Notas internas',
                                                            internal_notes_updated_at:
                                                                'Fecha de actualización de notas',
                                                            internal_notes_updated_by:
                                                                'Actualizado por',
                                                        };

                                                        const formatValue = (
                                                            field: string,
                                                            value: any,
                                                        ) => {
                                                            if (
                                                                value ===
                                                                    null ||
                                                                value ===
                                                                    undefined ||
                                                                value === ''
                                                            )
                                                                return '—';

                                                            if (
                                                                field.endsWith(
                                                                    '_at',
                                                                ) ||
                                                                field.endsWith(
                                                                    '_date',
                                                                )
                                                            ) {
                                                                try {
                                                                    return formatDateEs(
                                                                        value,
                                                                    );
                                                                } catch (e) {
                                                                    return value;
                                                                }
                                                            }

                                                            return String(
                                                                value,
                                                            );
                                                        };

                                                        const visibleFields =
                                                            Object.keys(
                                                                changes,
                                                            ).filter(
                                                                (k) =>
                                                                    k in
                                                                        labels &&
                                                                    old[k] !==
                                                                        changes[
                                                                            k
                                                                        ],
                                                            );

                                                        return (
                                                            <div
                                                                key={
                                                                    activity.id
                                                                }
                                                                className="group relative"
                                                            >
                                                                <div className="absolute top-1.5 -left-[29px] z-10 h-3.5 w-3.5 rounded-full border-4 border-white bg-slate-200 transition-colors group-hover:bg-primary dark:border-slate-900" />
                                                                <div>
                                                                    <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                                        {formatDateTimeEs(
                                                                            activity.created_at,
                                                                        )}
                                                                    </p>
                                                                    <p className="mt-0.5 text-xs font-bold text-slate-800 uppercase dark:text-slate-100">
                                                                        {activity.event ===
                                                                        'updated'
                                                                            ? 'Actualización de ficha'
                                                                            : 'Registro creado'}
                                                                    </p>
                                                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                                                        Realizado
                                                                        por{' '}
                                                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                                                            {activity.causer_name ||
                                                                                'Sistema'}
                                                                        </span>
                                                                    </p>

                                                                    {visibleFields.length >
                                                                        0 && (
                                                                        <div className="mt-2.5 space-y-1.5 rounded-xl border border-sidebar/15 bg-white p-3 dark:bg-slate-900">
                                                                            {visibleFields.map(
                                                                                (
                                                                                    field,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            field
                                                                                        }
                                                                                        className="grid grid-cols-12 gap-2 text-[10px]"
                                                                                    >
                                                                                        <span className="col-span-4 font-bold text-slate-500">
                                                                                            {
                                                                                                labels[
                                                                                                    field
                                                                                                ]
                                                                                            }

                                                                                            :
                                                                                        </span>
                                                                                        <div className="col-span-8">
                                                                                            <span className="italic line-through opacity-30">
                                                                                                {formatValue(
                                                                                                    field,
                                                                                                    old[
                                                                                                        field
                                                                                                    ],
                                                                                                )}
                                                                                            </span>
                                                                                            <span className="mx-1.5 text-primary/40">
                                                                                                →
                                                                                            </span>
                                                                                            <span className="font-semibold text-primary">
                                                                                                {formatValue(
                                                                                                    field,
                                                                                                    changes[
                                                                                                        field
                                                                                                    ],
                                                                                                )}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <p className="py-2 text-xs text-slate-400 italic">
                                                    Aún no hay actividad
                                                    registrada para este centro.
                                                </p>
                                            )}
                                        </div>

                                        {totalActivityPages > 1 && (
                                            <div className="mt-6 flex items-center justify-between border-t border-sidebar/20 pt-4">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    disabled={
                                                        activityPage === 1
                                                    }
                                                    onClick={() =>
                                                        setActivityPage(
                                                            (p) => p - 1,
                                                        )
                                                    }
                                                    className="h-8 rounded-lg border-none bg-gradient-to-r from-sidebar to-[#1f4f52] px-3 text-xs text-white shadow-xs hover:opacity-95 disabled:opacity-50"
                                                >
                                                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                                                    Anterior
                                                </Button>

                                                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                                    Página {activityPage} de{' '}
                                                    {totalActivityPages}
                                                </span>

                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    disabled={
                                                        activityPage ===
                                                        totalActivityPages
                                                    }
                                                    onClick={() =>
                                                        setActivityPage(
                                                            (p) => p + 1,
                                                        )
                                                    }
                                                    className="h-8 rounded-lg border-none bg-gradient-to-r from-sidebar to-[#1f4f52] px-3 text-xs text-white shadow-xs hover:opacity-95 disabled:opacity-50"
                                                >
                                                    Siguiente
                                                    <ArrowLeft className="ml-1.5 h-3.5 w-3.5 rotate-180" />
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
