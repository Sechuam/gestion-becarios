import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, FileDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmNavigationButton } from '@/components/common/ConfirmNavigationButton';
import { StatusBadge } from '@/components/interns/StatusBadge';
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
    const [exportOpen, setExportOpen] = useState(false);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesValue, setNotesValue] = useState(
        educationCenter.internal_notes || '',
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

            <div className="flex flex-col gap-6">
                {isTrashed && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        Este centro está archivado. No admite nuevos becarios.
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="page-title">{educationCenter.name}</h1>
                        <p className="page-subtitle">
                            Detalle del centro educativo y su histórico de
                            becarios.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            asChild
                        >
                            <Link href="/centros">Volver</Link>
                        </Button>

                        {isTrashed ? (
                            <>
                                {canManage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                            onClick={() =>
                                                router.post(
                                                    `/centros/${educationCenter.id}/restore`,
                                                )
                                            }
                                        >
                                            Restaurar centro
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="shadow-md shadow-red-500/20"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        '¿Seguro que quieres eliminar definitivamente este centro? Esta acción no se puede deshacer.',
                                                    )
                                                ) {
                                                    router.delete(
                                                        `/centros/${educationCenter.id}/force`,
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
                                {canManage && (
                                    <ConfirmNavigationButton
                                        href={`/centros/${educationCenter.id}/edit`}
                                        title="Confirmar edición"
                                        description={`Vas a editar la ficha de ${educationCenter.name}.`}
                                        confirmLabel="Ir a editar"
                                        className="bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                        Editar
                                    </ConfirmNavigationButton>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2 dark:border-slate-700/70 dark:bg-slate-900/60">
                        <h2 className="text-lg font-semibold text-foreground">
                            Información del centro
                        </h2>
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground">Código</p>
                                <p className="font-medium text-foreground">
                                    {educationCenter.code || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Ciudad</p>
                                <p className="font-medium text-foreground">
                                    {educationCenter.city || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Dirección
                                </p>
                                <p className="font-medium text-foreground">
                                    {educationCenter.address || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Contacto
                                </p>
                                <p className="font-medium text-foreground">
                                    {educationCenter.contact_person || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Email del coordinador
                                </p>
                                {educationCenter.contact_email ? (
                                    <a
                                        href={`mailto:${educationCenter.contact_email}`}
                                        className="font-medium text-foreground hover:underline"
                                    >
                                        {educationCenter.contact_email}
                                    </a>
                                ) : (
                                    <p className="font-medium text-foreground">
                                        —
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Email institucional
                                </p>
                                {educationCenter.email ? (
                                    <a
                                        href={`mailto:${educationCenter.email}`}
                                        className="font-medium text-foreground hover:underline"
                                    >
                                        {educationCenter.email}
                                    </a>
                                ) : (
                                    <p className="font-medium text-foreground">
                                        —
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Teléfono
                                </p>
                                <p className="font-medium text-foreground">
                                    {educationCenter.phone || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Web</p>
                                {educationCenter.web ? (
                                    <a
                                        href={educationCenter.web}
                                        className="text-blue-600 hover:underline"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {educationCenter.web}
                                    </a>
                                ) : (
                                    <p className="font-medium text-foreground">
                                        —
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <h2 className="text-lg font-semibold text-foreground">
                            Convenio
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Fecha de firma
                                </p>
                                <p className="font-medium text-foreground">
                                    {formatDateEs(
                                        educationCenter.agreement_signed_at,
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Fecha de vencimiento
                                </p>
                                <p className="font-medium text-foreground">
                                    {formatDateEs(
                                        educationCenter.agreement_expires_at,
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Plazas acordadas
                                </p>
                                <p className="font-medium text-foreground">
                                    {educationCenter.agreement_slots ?? '—'}
                                </p>
                            </div>
                            {agreement_url && (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-border text-foreground hover:bg-muted"
                                        asChild
                                    >
                                        <a
                                            href={agreement_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Ver convenio PDF
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-border text-foreground hover:bg-muted"
                                        asChild
                                    >
                                        <a href={agreement_url} download>
                                            Descargar
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-foreground">
                                Notas internas
                            </h2>
                            {canManage && !editingNotes && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingNotes(true)}
                                >
                                    Editar
                                </Button>
                            )}
                        </div>
                        {editingNotes ? (
                            <div className="space-y-3">
                                <textarea
                                    value={notesValue}
                                    onChange={(e) =>
                                        setNotesValue(e.target.value)
                                    }
                                    className="min-h-[140px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                                    placeholder="Escribe una nota interna del centro..."
                                />
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            router.patch(
                                                `/centros/${educationCenter.id}/notes`,
                                                {
                                                    internal_notes: notesValue,
                                                },
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () =>
                                                        setEditingNotes(false),
                                                },
                                            )
                                        }
                                    >
                                        Guardar nota
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setNotesValue(
                                                educationCenter.internal_notes ||
                                                '',
                                            );
                                            setEditingNotes(false);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    {educationCenter.internal_notes && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() =>
                                                router.patch(
                                                    `/centros/${educationCenter.id}/notes`,
                                                    {
                                                        internal_notes: null,
                                                    },
                                                    {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            setNotesValue('');
                                                            setEditingNotes(
                                                                false,
                                                            );
                                                        },
                                                    },
                                                )
                                            }
                                        >
                                            Borrar nota
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 text-sm">
                                <p className="text-foreground">
                                    {educationCenter.internal_notes ||
                                        'Sin notas internas.'}
                                </p>
                                {(educationCenter.notes_updated_by ||
                                    educationCenter.internal_notes_updated_at) && (
                                        <p className="text-xs text-muted-foreground">
                                            Última edición:{' '}
                                            {educationCenter.notes_updated_by
                                                ?.name || 'Usuario'}{' '}
                                            ·{' '}
                                            {formatDateTimeEs(
                                                educationCenter.internal_notes_updated_at,
                                            )}
                                        </p>
                                    )}
                            </div>
                        )}
                    </div>
                </div>

                {isIntern && (
                    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <h2 className="text-lg font-semibold text-foreground">
                            Tutores
                        </h2>

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground">
                                    Tutor del Centro
                                </p>
                                <p className="font-medium text-foreground">
                                    {currentIntern?.center_tutor_name || '—'}
                                </p>
                                {currentIntern?.center_tutor_email ? (
                                    <a
                                        href={`mailto:${currentIntern.center_tutor_email}`}
                                        className="text-foreground hover:underline"
                                    >
                                        {currentIntern.center_tutor_email}
                                    </a>
                                ) : (
                                    <p className="text-foreground">—</p>
                                )}
                                <p className="text-foreground">
                                    {currentIntern?.center_tutor_phone || '—'}
                                </p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">
                                    Tutor de Empresa
                                </p>
                                <p className="font-medium text-foreground">
                                    {currentIntern?.company_tutor?.name || '—'}
                                </p>
                                {currentIntern?.company_tutor?.email ? (
                                    <a
                                        href={`mailto:${currentIntern.company_tutor.email}`}
                                        className="text-foreground hover:underline"
                                    >
                                        {currentIntern.company_tutor.email}
                                    </a>
                                ) : (
                                    <p className="text-foreground">—</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!isIntern && (
                    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <h2 className="text-lg font-semibold text-foreground">
                            Historial de actividad
                        </h2>
                        {activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map((activity) => {
                                    const changes =
                                        activity.properties?.attributes ?? {};
                                    const old = activity.properties?.old ?? {};

                                    const labels: Record<string, string> = {
                                        name: 'Nombre',
                                        code: 'Código',
                                        address: 'Dirección',
                                        city: 'Ciudad',
                                        contact_person: 'Contacto',
                                        contact_email: 'Email del coordinador',
                                        contact_position: 'Cargo',
                                        email: 'Email institucional',
                                        phone: 'Teléfono',
                                        web: 'Web',
                                        agreement_signed_at: 'Fecha de firma',
                                        agreement_expires_at:
                                            'Fecha de vencimiento',
                                        agreement_slots: 'Plazas acordadas',
                                        internal_notes: 'Notas internas',
                                        internal_notes_updated_by:
                                            'Editor de notas',
                                        internal_notes_updated_at:
                                            'Fecha edición de notas',
                                    };

                                    const visibleFields = Object.keys(changes)
                                        .filter((key) => key in labels)
                                        .filter(
                                            (key) => old[key] !== changes[key],
                                        );

                                    return (
                                        <div
                                            key={activity.id}
                                            className="rounded-xl border border-border/70 p-4"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {activity.causer_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.event ===
                                                            'created'
                                                            ? 'Creó el centro'
                                                            : activity.event ===
                                                                'updated'
                                                                ? 'Actualizó la ficha del centro'
                                                                : activity.description}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.created_at}
                                                </p>
                                            </div>

                                            {visibleFields.length > 0 && (
                                                <div className="mt-3 space-y-2 text-sm">
                                                    {visibleFields.map(
                                                        (field) => (
                                                            <div
                                                                key={field}
                                                                className="rounded-lg bg-muted/30 px-3 py-2"
                                                            >
                                                                <span className="font-medium text-foreground">
                                                                    {
                                                                        labels[
                                                                        field
                                                                        ]
                                                                    }
                                                                    :
                                                                </span>{' '}
                                                                <span className="text-muted-foreground">
                                                                    {old[
                                                                        field
                                                                    ] ?? '—'}
                                                                </span>{' '}
                                                                <span className="text-muted-foreground">
                                                                    →
                                                                </span>{' '}
                                                                <span className="text-foreground">
                                                                    {changes[
                                                                        field
                                                                    ] ?? '—'}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aún no hay actividad registrada para este
                                centro.
                            </p>
                        )}
                    </div>
                )}

                {!isIntern && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                                <Input
                                    placeholder="Buscar becario por nombre..."
                                    className="border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                                    defaultValue={filters?.search}
                                    onChange={(e) =>
                                        router.get(
                                            `/centros/${educationCenter.id}`,
                                            {
                                                search: e.target.value,
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
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">
                                    Estado
                                </label>
                                <select
                                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                    value={filters?.status ?? ''}
                                    onChange={(e) =>
                                        router.get(
                                            `/centros/${educationCenter.id}`,
                                            {
                                                search: filters?.search,
                                                status:
                                                    e.target.value || undefined,
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
                                    <option value="">Todos</option>
                                    <option value="active">Activo</option>
                                    <option value="completed">
                                        Finalizado
                                    </option>
                                    <option value="abandoned">
                                        Abandonado
                                    </option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">
                                    Orden
                                </label>
                                <select
                                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                    value={filters?.order ?? 'az'}
                                    onChange={(e) =>
                                        router.get(
                                            `/centros/${educationCenter.id}`,
                                            {
                                                search: filters?.search,
                                                status: filters?.status,
                                                order: e.target.value,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            },
                                        )
                                    }
                                >
                                    <option value="az">Orden: A → Z</option>
                                    <option value="za">Orden: Z → A</option>
                                    <option value="recent">
                                        Orden: Actualizados primero
                                    </option>
                                    <option value="oldest">
                                        Orden: Actualizados últimos
                                    </option>
                                </select>
                            </div>
                            {canExport && (
                                <Dialog
                                    open={exportOpen}
                                    onOpenChange={setExportOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-border text-foreground hover:bg-muted"
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
                                                Elige las columnas que quieres
                                                incluir en el Excel. Se
                                                respetarán los filtros actuales.
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
                                                                    checked ===
                                                                    true;
                                                                setSelectedColumns(
                                                                    (prev) => {
                                                                        if (
                                                                            isOn
                                                                        ) {
                                                                            return [
                                                                                ...prev,
                                                                                column.key,
                                                                            ];
                                                                        }
                                                                        return prev.filter(
                                                                            (
                                                                                key,
                                                                            ) =>
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
                                                onClick={() =>
                                                    setExportOpen(false)
                                                }
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleExport}
                                                disabled={
                                                    selectedColumns.length === 0
                                                }
                                            >
                                                Descargar Excel
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <p className="ml-auto text-sm font-medium text-muted-foreground">
                                Mostrando {interns.data.length} de{' '}
                                {interns.total} becarios
                            </p>
                        </div>

                        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                            <div className="w-full overflow-x-auto">
                                <table className="min-w- w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-b-border bg-muted dark:border-slate-700/70 dark:bg-slate-800/70">
                                            <th className="px-4 py-4 text-left font-semibold text-foreground">
                                                Becario
                                            </th>
                                            <th className="px-4 py-4 text-left font-semibold text-foreground">
                                                Email
                                            </th>
                                            <th className="px-4 py-4 text-left font-semibold text-foreground">
                                                Titulación
                                            </th>
                                            <th className="px-4 py-4 text-left font-semibold text-foreground">
                                                Inicio
                                            </th>
                                            <th className="px-4 py-4 text-left font-semibold text-foreground">
                                                Fin
                                            </th>
                                            <th className="px-4 py-4 text-left font-semibold text-foreground">
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interns.data.map((intern: any) => (
                                            <tr
                                                key={intern.id}
                                                className="border-b border-border transition-colors hover:bg-muted/60 dark:border-slate-700/70 dark:hover:bg-slate-800/50"
                                            >
                                                <td className="px-4 py-4 text-foreground">
                                                    {intern.user?.name ? (
                                                        <Link
                                                            href={`/interns/${intern.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {intern.user.name}
                                                        </Link>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground">
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
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground">
                                                    {intern.academic_degree ||
                                                        '—'}
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground">
                                                    {formatDateEs(
                                                        intern.start_date,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground">
                                                    {formatDateEs(
                                                        intern.end_date,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge
                                                        status={intern.status}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {interns.links.map((link: any, i: number) => {
                                const label = link.label
                                    .replace('Previous', 'Anterior')
                                    .replace('Next', 'Siguiente');
                                return (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`rounded border border-border px-3 py-1 text-sm ${link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                            } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                        dangerouslySetInnerHTML={{
                                            __html: label,
                                        }}
                                        preserveState
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
