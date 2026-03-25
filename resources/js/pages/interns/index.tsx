import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Users,
    Plus,
    Search,
    FileDown,
    Pencil,
    Eye,
    MessageSquare,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RowMetaBadges } from '@/components/common/RowMetaBadges';
import { SimpleTable } from '@/components/common/SimpleTable';
import DeleteInternModal from '@/components/interns/DeleteInternModal';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
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
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { recentLabelFromDate } from '@/lib/recent-label';
import type { BreadcrumbItem } from '@/types/navigation';

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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-muted-foreground">
                            {intern.user?.name
                                ? intern.user.name.charAt(0).toUpperCase()
                                : '?'}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground">
                                {intern.user?.name}
                            </span>
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
                    <Link
                        href={`/centros/${intern.education_center.id}`}
                        className="hover:underline"
                    >
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
                    <div className="flex gap-2">
                        {isTrashed ? (
                            <>
                                {canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-200 bg-white font-medium text-slate-600 shadow-none hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-emerald-900/20"
                                            onClick={() =>
                                                router.post(
                                                    `/interns/${intern.id}/restore`,
                                                )
                                            }
                                        >
                                            Restaurar
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-200 bg-white font-medium text-slate-600 shadow-none hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-red-900/20"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        '¿Seguro que quieres eliminar definitivamente este becario? Esta acción no se puede deshacer.',
                                                    )
                                                ) {
                                                    router.delete(
                                                        `/interns/${intern.id}/force`,
                                                    );
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
                                    className="border-slate-200 bg-white font-medium text-slate-600 shadow-none hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-blue-900/20"
                                    asChild
                                >
                                    <Link href={`/interns/${intern.id}`}>
                                        <div className="flex items-center">
                                            <Eye className="mr-1.5 h-4 w-4 text-blue-500/70" />{' '}
                                            Ver
                                        </div>
                                    </Link>
                                </Button>
                                {canManage && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-slate-200 bg-white font-medium text-slate-600 shadow-none hover:bg-primary/10 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                                        onClick={() => handleOpenNotes(intern)}
                                        title="Notas"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                )}
                                {canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-200 bg-white font-medium text-slate-600 shadow-none hover:bg-amber-50 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-amber-900/20"
                                            asChild
                                        >
                                            <Link
                                                href={`/interns/${intern.id}/edit`}
                                            >
                                                <div className="flex items-center">
                                                    <Pencil className="mr-1.5 h-4 w-4 text-amber-500/70" />{' '}
                                                    Editar
                                                </div>
                                            </Link>
                                        </Button>
                                        <DeleteInternModal intern={intern} />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Becarios" />

            <div className="flex flex-col gap-6 bg-background p-6 text-foreground">
                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <Users className="h-6 w-6" />
                            Gestión de Becarios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Administra los becarios, sus centros y estados de
                            prácticas.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <Button
                                className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                                asChild
                            >
                                <Link href="/interns/create">
                                    <Plus className="h-4 w-4" />
                                    Añadir Becario
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                            Total becarios
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                            {interns.total}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                            Activos
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                            {
                                interns.data.filter(
                                    (i: any) => i.status === 'active',
                                ).length
                            }
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                            Abandonados
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                            {
                                interns.data.filter(
                                    (i: any) => i.status === 'abandoned',
                                ).length
                            }
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                            Completados
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                            {
                                interns.data.filter(
                                    (i: any) => i.status === 'completed',
                                ).length
                            }
                        </p>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                            onChange={(e) =>
                                handleFilter('search', e.target.value)
                            }
                        />
                    </div>

                    <div className="w-[300px]">
                        <Select
                            value={filters.center || 'all'}
                            onValueChange={(v) => handleFilter('center', v)}
                        >
                            <SelectTrigger className="w-full overflow-hidden border-border bg-background text-foreground [&>span]:truncate">
                                <SelectValue>
                                    {filters.center && filters.center !== 'all'
                                        ? education_centers.find(
                                              (c) =>
                                                  c.id.toString() ===
                                                  filters.center?.toString(),
                                          )?.name
                                        : 'Todos los centros'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los centros
                                </SelectItem>
                                {education_centers.map((center) => (
                                    <SelectItem
                                        key={center.id}
                                        value={center.id.toString()}
                                    >
                                        {center.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[200px]">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => handleFilter('status', v)}
                        >
                            <SelectTrigger className="w-full border-border bg-background text-foreground">
                                <SelectValue>
                                    {{
                                        active: 'Activos',
                                        completed: 'Completados',
                                        abandoned: 'Abandonados',
                                    }[filters.status as string] ||
                                        'Todos los estados'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los estados
                                </SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="completed">
                                    Completados
                                </SelectItem>
                                <SelectItem value="abandoned">
                                    Abandonados
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[200px]">
                        <Select
                            value={filters.trashed || 'none'}
                            onValueChange={(v) => handleFilter('trashed', v)}
                        >
                            <SelectTrigger className="w-full border-border bg-background text-foreground">
                                <SelectValue>
                                    {{
                                        none: 'No archivados',
                                        only: 'Archivados',
                                        with: 'Todos',
                                    }[filters.trashed as string] ||
                                        'No archivados'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    No archivados
                                </SelectItem>
                                <SelectItem value="only">Archivados</SelectItem>
                                <SelectItem value="with">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[180px]">
                        <DatePicker
                            value={filters.start_from || ''}
                            onChange={(value) =>
                                handleFilter('start_from', value)
                            }
                        />
                    </div>
                    <div className="w-[180px]">
                        <DatePicker
                            value={filters.start_to || ''}
                            onChange={(value) =>
                                handleFilter('start_to', value)
                            }
                        />
                    </div>

                    {canManage && (
                        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Exportar Excel
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Exportación personalizada
                                    </DialogTitle>
                                    <DialogDescription>
                                        Elige las columnas que quieres incluir
                                        en el Excel. Se respetarán los filtros
                                        actuales.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {exportColumns.map((column) => {
                                        const isChecked =
                                            selectedColumns.includes(
                                                column.key,
                                            );
                                        return (
                                            <label
                                                key={column.key}
                                                className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        const isOn =
                                                            checked === true;
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
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setExportOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleExport}
                                        disabled={selectedColumns.length === 0}
                                    >
                                        Descargar Excel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <p className="ml-auto text-sm font-medium text-muted-foreground">
                        Mostrando {interns.data.length} de {interns.total}{' '}
                        becarios
                    </p>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={interns.data}
                    rowKey={(row) => row.id}
                    sortKey={filters.sort}
                    sortDirection={filters.direction}
                    onSort={handleSort}
                />

                {/* PAGINACIÓN */}
                <div className="mt-6 w-full">
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
                                    className={`rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                                        link.active
                                            ? 'scale-105 transform border-primary bg-primary text-primary-foreground shadow-md'
                                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
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

            <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Notas internas</DialogTitle>
                        <DialogDescription>
                            {activeIntern?.user?.name
                                ? `Notas privadas para ${activeIntern.user.name}.`
                                : 'Notas privadas del becario.'}
                        </DialogDescription>
                    </DialogHeader>
                    <textarea
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="Escribe aquí una nota interna..."
                        className="min-h-[120px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
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
