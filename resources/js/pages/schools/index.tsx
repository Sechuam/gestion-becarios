import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, Plus, Search, FileDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActiveFilterChips } from '@/components/common/ActiveFilterChips';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { RowMetaBadges } from '@/components/common/RowMetaBadges';
import { SimpleTable } from '@/components/common/SimpleTable';
import { TableActionMenu } from '@/components/common/TableActionMenu';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { recentLabelFromDate } from '@/lib/recent-label';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/centros' },
];

export default function Index({
    schools,
    filters = {},
}: {
    schools: any;
    filters: any;
}) {
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage schools');
    const [notesOpen, setNotesOpen] = useState(false);
    const [activeSchool, setActiveSchool] = useState<any | null>(null);
    const [noteValue, setNoteValue] = useState('');
    const [noteOriginal, setNoteOriginal] = useState('');
    const [exportOpen, setExportOpen] = useState(false);
    const lastEmptyKeyRef = useRef<string>('');

    const exportColumns = useMemo(
        () => [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'code', label: 'Código' },
            { key: 'city', label: 'Ciudad' },
            { key: 'address', label: 'Dirección' },
            { key: 'contact_person', label: 'Contacto' },
            { key: 'contact_position', label: 'Cargo contacto' },
            { key: 'contact_email', label: 'Email del coordinador' },
            { key: 'email', label: 'Email institucional' },
            { key: 'phone', label: 'Teléfono' },
            { key: 'web', label: 'Web' },
            { key: 'agreement_signed_at', label: 'Fecha firma convenio' },
            { key: 'agreement_expires_at', label: 'Vencimiento convenio' },
            { key: 'agreement_slots', label: 'Plazas acordadas' },
            { key: 'internal_notes', label: 'Notas internas' },
            { key: 'created_at', label: 'Fecha de registro' },
            { key: 'updated_at', label: 'Última actualización' },
        ],
        [],
    );
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        exportColumns.map((column) => column.key),
    );

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (
            value === '' ||
            value === 'all' ||
            (key === 'trashed' && value === 'none')
        ) {
            delete newFilters[key];
        }
        router.get('/centros', newFilters, {
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
        router.get('/centros', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        router.get('/centros', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearAllFilters = () => {
        router.get(
            '/centros',
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
        window.open(`/centros/export?${buildExportParams()}`);
        setExportOpen(false);
        toast({
            title: 'Exportación iniciada',
            description: 'La descarga comenzará en breve.',
        });
    };

    const handleOpenNotes = (school: any) => {
        setActiveSchool(school);
        setNoteValue(school.internal_notes || '');
        setNoteOriginal(school.internal_notes || '');
        setNotesOpen(true);
    };

    const handleSaveNotes = () => {
        if (!activeSchool) return;
        if ((noteValue || '') === (noteOriginal || '')) {
            toast({
                title: 'Sin cambios',
                description: 'No hay cambios que guardar en las notas.',
            });
            setNotesOpen(false);
            return;
        }
        router.patch(
            `/centros/${activeSchool.id}/notes`,
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
                return true;
            },
        );
        const hasFilters = filtersEntries.length > 0;
        const emptyKey = JSON.stringify(
            filtersEntries.sort(([a], [b]) => a.localeCompare(b)),
        );

        if (schools.data.length > 0) {
            lastEmptyKeyRef.current = '';
            return;
        }

        if (
            schools.data.length === 0 &&
            hasFilters &&
            emptyKey !== lastEmptyKeyRef.current
        ) {
            toast({
                title: 'Sin resultados',
                description:
                    'No hay centros que coincidan con los filtros actuales.',
            });
            lastEmptyKeyRef.current = emptyKey;
        }
    }, [filters, schools.data.length]);

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            cellClassName: 'text-foreground',
            sortKey: 'name',
            render: (school: any) => (
                <div className="flex flex-col gap-1">
                    <Link
                        href={`/centros/${school.id}`}
                        className="font-semibold text-foreground hover:underline"
                    >
                        {school.name}
                    </Link>
                    <RowMetaBadges
                        recentLabel={recentLabelFromDate(school.updated_at)}
                        note={school.internal_notes}
                    />
                </div>
            ),
        },
        { key: 'code', label: 'Código', sortKey: 'code' },
        { key: 'city', label: 'Ciudad', sortKey: 'city' },
        {
            key: 'contact_person',
            label: 'Contacto',
            sortKey: 'contact_person',
            render: (school: any) =>
                school.contact_person ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="max-w-[180px] truncate">
                                {school.contact_person}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {school.contact_person}
                                </p>
                                {school.contact_position && (
                                    <p>{school.contact_position}</p>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    '—'
                ),
        },
        {
            key: 'contact_email',
            label: 'Email Coordinador',
            sortKey: 'contact_email',
            render: (school: any) =>
                school.contact_email ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <a
                                href={`mailto:${school.contact_email}`}
                                className="block max-w-[220px] truncate hover:underline"
                            >
                                {school.contact_email}
                            </a>
                        </TooltipTrigger>
                        <TooltipContent>{school.contact_email}</TooltipContent>
                    </Tooltip>
                ) : (
                    '—'
                ),
        },
        {
            key: 'email',
            label: 'Email Institucional',
            sortKey: 'email',
            render: (school: any) =>
                school.email ? (
                    <a
                        href={`mailto:${school.email}`}
                        className="hover:underline"
                    >
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
                    <TableActionMenu
                        actions={
                            isTrashed
                                ? canManage
                                    ? [
                                          {
                                              label: 'Restaurar centro',
                                              icon: 'restore',
                                              onClick: () =>
                                                  router.post(
                                                      `/centros/${school.id}/restore`,
                                                  ),
                                          },
                                          {
                                              label: 'Eliminar definitivo',
                                              icon: 'delete',
                                              variant: 'destructive',
                                              onClick: () => {
                                                  if (
                                                      confirm(
                                                          '¿Seguro que quieres eliminar definitivamente este centro? Esta acción no se puede deshacer.',
                                                      )
                                                  ) {
                                                      router.delete(
                                                          `/centros/${school.id}/force`,
                                                      );
                                                  }
                                              },
                                          },
                                      ]
                                    : []
                                : [
                                      {
                                          label: 'Ver centro',
                                          icon: 'view',
                                          href: `/centros/${school.id}`,
                                      },
                                      ...(canManage
                                          ? [
                                                {
                                                    label: 'Editar centro',
                                                    icon: 'edit' as const,
                                                    href: `/centros/${school.id}/edit`,
                                                    confirm: {
                                                        title: 'Confirmar edición',
                                                        description: `Vas a editar la ficha de ${school.name}.`,
                                                        confirmLabel:
                                                            'Ir a editar',
                                                    },
                                                },
                                                {
                                                    label: 'Notas internas',
                                                    icon: 'notes' as const,
                                                    onClick: () =>
                                                        handleOpenNotes(school),
                                                },
                                                {
                                                    label: 'Archivar centro',
                                                    icon: 'delete' as const,
                                                    variant:
                                                        'destructive' as const,
                                                    onClick: () =>
                                                        router.delete(
                                                            `/centros/${school.id}`,
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
        if (filters.trashed && filters.trashed !== 'none') {
            chips.push({
                key: 'trashed',
                label: `Vista: ${filters.trashed === 'only' ? 'Archivados' : 'Todos'}`,
            });
        }

        return chips;
    }, [filters]);

    const headerMetrics = useMemo(
        () => [
            {
                label: 'Resultados',
                value: schools.total,
                hint: 'Total según filtros actuales',
            },
            {
                label: 'Archivados',
                value: schools.data.filter((school: any) => !!school.deleted_at)
                    .length,
                hint: 'En esta página',
            },
            {
                label: 'Con contacto',
                value: schools.data.filter(
                    (school: any) =>
                        school.contact_person || school.contact_email,
                ).length,
                hint: 'Centros con referencia directa',
            },
        ],
        [schools.data, schools.total],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centros Educativos" />

            <div className="flex flex-col gap-3">
                <ModuleHeader
                    title="Centros Educativos"
                    description="Gestiona instituciones, universidades y centros de formación con una visión rápida del estado de tu red de convenios."
                    icon={<Building2 className="h-6 w-6" />}
                    metrics={headerMetrics}
                    actions={
                        canManage ? (
                            <Button
                                className="gap-2 bg-sidebar/80 text-white border border-white/20 hover:bg-white/10 hover:border-white/40 rounded-lg px-4 font-black shadow-lg backdrop-blur-md transition-all h-8 text-[10px] uppercase tracking-widest"
                                onClick={() => router.get('/centros/create')}
                            >
                                <Plus className="h-4 w-4" />
                                Añadir Centro
                            </Button>
                        ) : undefined
                    }
                />

                {/* FILTROS */}
                <div className="rounded-xl border border-sidebar/10 bg-white p-3 shadow-lg dark:bg-slate-900/60 transition-all">
                    {/* Fila 1: Búsqueda y Exportar */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="relative max-w-sm min-w-[240px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar centro..."
                                className="h-8 border-sidebar/20 bg-slate-50/50 pl-10 text-xs text-foreground placeholder:text-muted-foreground rounded-lg shadow-sm focus:ring-sidebar/20"
                                defaultValue={filters.search}
                                onChange={(e) =>
                                    handleFilter('search', e.target.value)
                                }
                            />
                        </div>

                        {canManage && (
                            <Dialog
                                open={exportOpen}
                                onOpenChange={setExportOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-8 rounded-lg border-sidebar/20 bg-card px-4 text-[10px] font-black uppercase tracking-widest text-sidebar hover:bg-sidebar hover:text-white transition-all shadow-sm"
                                    >
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Exportar Excel
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl rounded-[2.5rem] border-sidebar/10 p-8 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">
                                            Exportación Personalizada
                                        </DialogTitle>
                                        <DialogDescription className="text-base font-medium text-slate-500 italic">
                                            Elige las columnas que quieres incluir en el archivo Excel. Se respetarán los filtros actuales de la tabla.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-4">
                                        {exportColumns.map((column) => {
                                            const isChecked =
                                                selectedColumns.includes(
                                                    column.key,
                                                );
                                            return (
                                                <label
                                                    key={column.key}
                                                    className="flex items-center gap-3 rounded-2xl border border-sidebar/10 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#1f4f52]/80 hover:bg-sidebar/5 cursor-pointer transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        className="h-5 w-5 rounded-lg border-sidebar/30 text-sidebar focus:ring-sidebar"
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            const isOn =
                                                                checked ===
                                                                true;
                                                            setSelectedColumns(
                                                                (prev) => {
                                                                    if (isOn) {
                                                                        return [
                                                                            ...prev,
                                                                            column.key,
                                                                        ];
                                                                    }
                                                                    return prev.filter(
                                                                        (key) =>
                                                                            key !==
                                                                            column.key,
                                                                    );
                                                                },
                                                            );
                                                        }}
                                                    />
                                                    {column.label}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <DialogFooter className="mt-8 gap-3 sm:justify-end">
                                        <Button
                                            variant="ghost"
                                            className="rounded-xl px-8 font-bold text-slate-500 hover:bg-slate-100"
                                            onClick={() => setExportOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            className="h-11 rounded-2xl bg-sidebar px-8 font-black text-white shadow-lg shadow-sidebar/20"
                                            onClick={handleExport}
                                            disabled={
                                                selectedColumns.length === 0
                                            }
                                        >
                                            Generar Descarga
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        <div className="ml-auto text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 px-3 py-1 rounded-full dark:bg-slate-800 flex items-center gap-1.5 border border-sidebar/5 shadow-inner">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-sidebar animate-pulse" />
                            {schools.data.length} / {schools.total}{' '}
                            centros
                        </div>
                    </div>

                    {/* Fila 2: Filtros */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-end gap-2">
                        <div className="space-y-1 lg:min-w-[150px]">
                            <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                                Vista
                            </label>
                            <Select
                                value={filters.trashed || 'none'}
                                onValueChange={(v) =>
                                    handleFilter('trashed', v)
                                }
                            >
                                <SelectTrigger className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                    <SelectValue>
                                        {{
                                            none: 'Solo Activos',
                                            only: 'Archivados',
                                            with: 'Ver Todos',
                                        }[filters.trashed as string] ||
                                            'Solo Activos'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-sidebar/20">
                                    <SelectItem value="none">
                                        Solo Activos
                                    </SelectItem>
                                    <SelectItem value="only">
                                        Archivados
                                    </SelectItem>
                                    <SelectItem value="with">Ver Todos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <ActiveFilterChips
                    chips={activeFilterChips}
                    onRemove={clearFilter}
                    onClearAll={clearAllFilters}
                />

                <SimpleTable
                    columns={columns}
                    rows={schools.data}
                    rowKey={(row) => row.id}
                    sortKey={filters.sort}
                    sortDirection={filters.direction}
                    onSort={handleSort}
                    emptyTitle="No hay centros en esta vista"
                    emptyDescription="Cambia la vista o crea un nuevo centro educativo para empezar a construir la red."
                    striped={true}
                />

                {/* PAGINACIÓN */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-sm font-medium text-muted-foreground">
                        Página {schools.current_page ?? 1} de {schools.last_page ?? 1}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {schools.links.map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveState
                                className={`rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
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

            <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Notas internas</DialogTitle>
                        <DialogDescription>
                            {activeSchool?.name
                                ? `Notas privadas para ${activeSchool.name}.`
                                : 'Notas privadas del centro.'}
                        </DialogDescription>
                    </DialogHeader>
                    <textarea
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="Escribe aquí una nota interna..."
                        className="min-h-30 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setNotesOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveNotes}>Guardar nota</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
