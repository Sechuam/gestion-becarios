import { Head, Link, router, usePage } from '@inertiajs/react';
import { Users, Plus, Search, FileDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActiveFilterChips } from '@/components/common/ActiveFilterChips';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { RowMetaBadges } from '@/components/common/RowMetaBadges';
import { SimpleTable } from '@/components/common/SimpleTable';
import { TableActionMenu } from '@/components/common/TableActionMenu';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs } from '@/lib/date-format';
import { recentLabelFromDate } from '@/lib/recent-label';
import type { BreadcrumbItem } from '@/types/navigation';
import { InternFilters } from '@/components/interns/InternFilters';
import { InternExportDialog } from '@/components/interns/InternExportDialog';
import { InternNotesDialog } from '@/components/interns/InternNotesDialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Becarios', href: '/becarios' },
];

export default function Index({
    interns,
    filters = {},
    education_centers = [],
}: {
    interns: any;
    filters: any;
    education_centers: any[];
}) {
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage interns');
    const [exportOpen, setExportOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [activeIntern, setActiveIntern] = useState<any | null>(null);
    const [noteValue, setNoteValue] = useState('');
    const [noteOriginal, setNoteOriginal] = useState('');
    const lastEmptyKeyRef = useRef<string>('');

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

    const handleSort = (key: string) => {
        const currentKey = filters.sort;
        const currentDir = filters.direction || 'asc';
        const nextDir =
            currentKey === key && currentDir === 'asc' ? 'desc' : 'asc';
        const newFilters = { ...filters, sort: key, direction: nextDir };
        router.get('/becarios', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        router.get('/becarios', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearAllFilters = () => {
        router.get(
            '/becarios',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const buildExportParams = () => {
        const params = new URLSearchParams();
        Object.entries(filters || {}).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                return;
            }
            params.set(key, String(value));
        });
        if (selectedColumns.length) {
            params.set('columns', selectedColumns.join(','));
        }
        return params.toString();
    };

    const handleExport = () => {
        window.open(`/interns/export?${buildExportParams()}`);
        setExportOpen(false);
        toast({
            title: 'Exportación iniciada',
            description: 'Tu descarga comenzará en breve.',
        });
    };

    const handleOpenNotes = (intern: any) => {
        setActiveIntern(intern);
        setNoteValue(intern.internal_notes || '');
        setNoteOriginal(intern.internal_notes || '');
        setNotesOpen(true);
    };

    const handleSaveNotes = () => {
        if (!activeIntern) return;
        if ((noteValue || '') === (noteOriginal || '')) {
            toast({
                title: 'Sin cambios',
                description: 'No hay cambios que guardar en las notas.',
            });
            setNotesOpen(false);
            return;
        }
        router.patch(
            `/interns/${activeIntern.id}/notes`,
            { internal_notes: noteValue },
            { preserveScroll: true, onSuccess: () => setNotesOpen(false) },
        );
    };

    useEffect(() => {
        const filtersEntries = Object.entries(filters || {}).filter(
            ([key, value]) => {
                if (value === undefined || value === null || value === '')
                    return false;
                if (key === 'trashed' && value === 'none') return false;
                if (key === 'status' && value === 'all') return false;
                if (key === 'center' && value === 'all') return false;
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

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            cellClassName: 'text-foreground',
            sortKey: 'name',
            render: (intern: any) => {
                const recent = recentLabelFromDate(intern.updated_at);

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                            <AvatarImage src={intern.user?.avatar || ''} alt={intern.user?.name || ''} />
                            <AvatarFallback className="text-xs font-bold text-muted-foreground bg-transparent">
                                {intern.user?.name ? intern.user.name.charAt(0).toUpperCase() : '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                            <Link
                                href={`/interns/${intern.id}`}
                                className="font-semibold text-foreground hover:text-sidebar hover:underline transition-colors"
                            >
                                {intern.user?.name}
                            </Link>
                            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                {intern.user?.email ? (
                                    <a
                                        href={`mailto:${intern.user.email}`}
                                        className="hover:underline"
                                    >
                                        {intern.user.email}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </span>
                            <RowMetaBadges
                                recentLabel={recent}
                                note={intern.internal_notes}
                            />
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'dni',
            label: 'DNI',
            cellClassName: 'text-muted-foreground font-mono text-xs italic',
            sortKey: 'dni',
        },
        {
            key: 'education_center',
            label: 'Centro Educativo',
            cellClassName: 'text-muted-foreground',
            sortKey: 'education_center',
            render: (intern: any) =>
                intern.education_center?.id ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={`/centros/${intern.education_center.id}`}
                                className="block max-w-[220px] truncate hover:underline"
                            >
                                {intern.education_center.name}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            {intern.education_center.name}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    '—'
                ),
        },
        {
            key: 'academic_degree',
            label: 'Grado',
            cellClassName: 'text-muted-foreground',
            sortKey: 'academic_degree',
        },
        {
            key: 'progress',
            label: 'Progreso',
            render: (intern: any) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded bg-muted">
                        <div
                            className={`h-2 ${intern.is_delayed ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${intern.progress ?? 0}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {intern.progress ?? 0}%
                    </span>
                    {intern.is_delayed && (
                        <span className="text-xs font-medium text-red-500">
                            Retrasado
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            cellClassName: 'text-foreground',
            sortKey: 'status',
            render: (intern: any) => (
                <StatusBadge status={intern?.status as string} />
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            cellClassName: 'text-foreground',
            render: (intern: any) => {
                const isTrashed = !!intern.deleted_at;

                return (
                    <TableActionMenu
                        actions={
                            isTrashed
                                ? canManage
                                    ? [
                                          {
                                              label: 'Restaurar',
                                              icon: 'restore',
                                              onClick: () =>
                                                  router.post(
                                                      `/interns/${intern.id}/restore`,
                                                  ),
                                          },
                                          {
                                              label: 'Eliminar definitivo',
                                              icon: 'delete',
                                              variant: 'destructive',
                                              onClick: () => {
                                                  if (
                                                      confirm(
                                                          '¿Seguro que quieres eliminar definitivamente este becario? Esta acción no se puede deshacer.',
                                                      )
                                                  ) {
                                                      router.delete(
                                                          `/interns/${intern.id}/force`,
                                                      );
                                                  }
                                              },
                                          },
                                      ]
                                    : []
                                : [
                                      {
                                          label: 'Ver becario',
                                          icon: 'view',
                                          href: `/interns/${intern.id}`,
                                      },
                                      ...(canManage
                                          ? [
                                                {
                                                    label: 'Editar becario',
                                                    icon: 'edit' as const,
                                                    href: `/interns/${intern.id}/edit`,
                                                    confirm: {
                                                        title: 'Confirmar edición',
                                                        description: `Vas a editar el perfil de ${intern.user?.name ?? 'este becario'}.`,
                                                        confirmLabel:
                                                            'Ir a editar',
                                                    },
                                                },
                                                {
                                                    label: 'Notas internas',
                                                    icon: 'notes' as const,
                                                    onClick: () =>
                                                        handleOpenNotes(intern),
                                                },
                                                {
                                                    label: 'Archivar becario',
                                                    icon: 'delete' as const,
                                                    variant:
                                                        'destructive' as const,
                                                    onClick: () =>
                                                        router.delete(
                                                            `/interns/${intern.id}`,
                                                        ),
                                                },
                                            ]
                                          : []),
                                  ]
                        }
                    />
                );
            },
        },
    ];

    const activeFilterChips = useMemo(() => {
        const chips = [];

        if (filters.search)
            chips.push({ key: 'search', label: `Buscar: ${filters.search}` });
        if (filters.center) {
            const centerName = education_centers.find(
                (center: any) => String(center.id) === String(filters.center),
            )?.name;
            if (centerName) {
                chips.push({ key: 'center', label: `Centro: ${centerName}` });
            }
        }
        if (filters.status) {
            const statusLabel: Record<string, string> = {
                active: 'Activos',
                completed: 'Completados',
                abandoned: 'Abandonados',
            };
            chips.push({
                key: 'status',
                label: `Estado: ${statusLabel[filters.status] || filters.status}`,
            });
        }
        if (filters.start_from)
            chips.push({
                key: 'start_from',
                label: `Desde: ${formatDateEs(filters.start_from)}`,
            });
        if (filters.start_to)
            chips.push({
                key: 'start_to',
                label: `Hasta: ${formatDateEs(filters.start_to)}`,
            });
        if (filters.trashed) {
            const trashedLabel =
                filters.trashed === 'only'
                    ? 'Archivados'
                    : filters.trashed === 'with'
                      ? 'Todos'
                      : null;
            if (trashedLabel) {
                chips.push({ key: 'trashed', label: `Vista: ${trashedLabel}` });
            }
        }

        return chips;
    }, [education_centers, filters]);

    const headerMetrics = useMemo(
        () => [
            {
                label: 'Resultados',
                value: interns.total,
                hint: 'Total según filtros actuales',
            },
            {
                label: 'Activos',
                value: interns.data.filter((i: any) => i.status === 'active')
                    .length,
                hint: 'En esta página',
            },
            {
                label: 'Retrasados',
                value: interns.data.filter((i: any) => i.is_delayed).length,
                hint: 'Prácticas fuera de fecha',
            },
        ],
        [interns.data, interns.total],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Becarios" />

            <div className="flex flex-col gap-3">
                <ModuleHeader
                    title="Gestión de Becarios"
                    description="Administra los becarios, sus centros y estados de prácticas con una vista rápida de carga y seguimiento."
                    icon={<Users className="h-6 w-6" />}
                    metrics={headerMetrics}
                    actions={
                        canManage ? (
                            <Button
                                className="gap-2 bg-sidebar/80 text-white border border-white/20 hover:bg-white/10 hover:border-white/40 rounded-lg px-4 font-black shadow-lg backdrop-blur-md transition-all h-8 text-[10px] uppercase tracking-widest"
                                onClick={() => router.get('/interns/create')}
                            >
                                <Plus className="h-4 w-4" />
                                Añadir Becario
                            </Button>
                        ) : undefined
                    }
                />

                <InternFilters
                    filters={filters}
                    education_centers={education_centers}
                    internsCount={interns.data.length}
                    totalInterns={interns.total}
                    onFilterChange={handleFilter}
                    onClearFilter={clearFilter}
                    onClearAll={clearAllFilters}
                    activeFilterChips={activeFilterChips}
                >
                    {canManage && (
                        <InternExportDialog
                            open={exportOpen}
                            onOpenChange={setExportOpen}
                            exportColumns={exportColumns}
                            selectedColumns={selectedColumns}
                            onSelectedColumnsChange={setSelectedColumns}
                            onExport={handleExport}
                        />
                    )}
                </InternFilters>

                <SimpleTable
                    columns={columns}
                    rows={interns.data}
                    rowKey={(row) => row.id}
                    sortKey={filters.sort}
                    sortDirection={filters.direction}
                    onSort={handleSort}
                    emptyTitle="No hay becarios que mostrar"
                    emptyDescription="Prueba con otros filtros o registra un nuevo becario para empezar a poblar el módulo."
                    striped={true}
                />

                {/* PAGINACIÓN */}
                <div className="mt-4 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                            Página {interns.current_page} de {interns.last_page}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {interns.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded-lg border px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all ${
                                        link.active
                                            ? 'scale-105 transform border-sidebar bg-sidebar text-sidebar-foreground shadow-md'
                                            : 'border-border bg-card text-muted-foreground hover:border-sidebar/40 hover:bg-muted'
                                    } ${!link.url ? 'pointer-events-none opacity-30' : ''}`}
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

            <InternNotesDialog
                open={notesOpen}
                onOpenChange={setNotesOpen}
                activeIntern={activeIntern}
                noteValue={noteValue}
                onNoteValueChange={setNoteValue}
                onSave={handleSaveNotes}
            />
        </AppLayout>
    );
}
