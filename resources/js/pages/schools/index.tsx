import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    Pencil,
    Plus,
    Search,
    MessageSquare,
    FileDown,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RowMetaBadges } from '@/components/common/RowMetaBadges';
import { SimpleTable } from '@/components/common/SimpleTable';
import DeleteCenterModal from '@/components/schools/DeleteCenterModal';
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
        { key: 'contact_person', label: 'Contacto', sortKey: 'contact_person' },
        {
            key: 'contact_email',
            label: 'Email Coordinador',
            sortKey: 'contact_email',
            render: (school: any) =>
                school.contact_email ? (
                    <a
                        href={`mailto:${school.contact_email}`}
                        className="hover:underline"
                    >
                        {school.contact_email}
                    </a>
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
                    <div className="flex gap-2">
                        {isTrashed ? (
                            <>
                                {canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-emerald-50 hover:text-emerald-600"
                                            onClick={() =>
                                                router.post(
                                                    `/centros/${school.id}/restore`,
                                                )
                                            }
                                        >
                                            Restaurar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-red-50 hover:text-red-600"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        '¿Seguro que quieres eliminar definitivamente este centro? Esta acción no se puede deshacer.',
                                                    )
                                                ) {
                                                    router.delete(
                                                        `/centros/${school.id}/force`,
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
                                    className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-blue-50 hover:text-blue-600"
                                    asChild
                                >
                                    <Link href={`/centros/${school.id}`}>
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
                                        className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-primary/10 hover:text-primary"
                                        onClick={() => handleOpenNotes(school)}
                                        title="Notas"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                )}
                                {canManage ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-amber-50 hover:text-amber-600"
                                            asChild
                                        >
                                            <Link
                                                href={`/centros/${school.id}/edit`}
                                            >
                                                <div className="flex items-center">
                                                    <Pencil className="mr-1.5 h-4 w-4 text-amber-500/70" />{' '}
                                                    Editar
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

            <div className="flex flex-col gap-6">
                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="page-title">
                            Centros Educativos
                        </h1>
                        <p className="page-subtitle">
                            Gestiona las instituciones, universidades y centros
                            de formación.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <Button
                                className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
                                asChild
                            >
                                <Link href="/centros/create">
                                    <Plus className="h-4 w-4" />
                                    Añadir Centro
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* FILTROS */}
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                            defaultValue={filters.search}
                            onChange={(e) =>
                                handleFilter('search', e.target.value)
                            }
                        />
                    </div>

                    <div className="w-50">
                        <Select
                            value={filters.trashed || 'none'}
                            onValueChange={(v) => handleFilter('trashed', v)}
                        >
                            <SelectTrigger className="w-full border-border bg-background text-foreground">
                                <SelectValue>
                                    {{
                                        none: 'Activos',
                                        only: 'Archivados',
                                        with: 'Todos',
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
                        Mostrando {schools.data.length} de {schools.total}{' '}
                        centros
                    </p>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={schools.data}
                    rowKey={(row) => row.id}
                    sortKey={filters.sort}
                    sortDirection={filters.direction}
                    onSort={handleSort}
                />

                {/* PAGINACIÓN */}
                <div className="flex items-center gap-2">
                    {schools.links.map((link: any, i: number) => {
                        const label = link.label
                            .replace('Previous', 'Anterior')
                            .replace('Next', 'Siguiente');
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded border border-border px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: label }}
                                preserveState
                            />
                        );
                    })}
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
