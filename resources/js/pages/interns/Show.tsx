import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { ConfirmNavigationButton } from '@/components/common/ConfirmNavigationButton';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';
import type { BreadcrumbItem } from '@/types/navigation';
import { CreateScheduleModal } from '@/components/interns/CreateScheduleModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Clock, Download } from 'lucide-react';
import { ExportReportModal } from '@/components/interns/ExportReportModal';




export default function Show({
    intern,
    time_stats,
    dni_url,
    agreement_url,
    insurance_url,
    activities,

}: {
    intern: any;
    time_stats: any;
    dni_url: string;
    agreement_url: string;
    insurance_url: string;
    activities: any[];
}) {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage interns');
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesValue, setNotesValue] = useState(intern.internal_notes || '');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Becarios', href: '/becarios' },
        { title: intern.user.name, href: '#' },
    ];

    const centersById: Record<string, string> = {};
    if (intern.education_center?.id) {
        centersById[String(intern.education_center.id)] =
            intern.education_center.name;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Perfil de ${intern.user.name}`} />

            <div className="w-full space-y-6 bg-white p-6 dark:bg-slate-900">
                {/* CABECERA */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        asChild
                    >
                        <Link href="/becarios">
                            <ArrowLeft className="h-4 w-4" /> Volver
                        </Link>
                    </Button>
                    <ConfirmNavigationButton
                        href={`/interns/${intern.id}/edit`}
                        title="Confirmar edición"
                        description={`Vas a editar el perfil de ${intern.user.name}.`}
                        confirmLabel="Ir a editar"
                        className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                        Editar perfil
                    </ConfirmNavigationButton>
                </div>

                {/* HERO */}
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {intern.user?.name
                            ? intern.user.name.substring(0, 2).toUpperCase()
                            : 'B'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {intern.user.name}
                        </h1>
                        <p className="text-sm text-muted-foreground dark:text-slate-400">
                            Becario · {intern.academic_degree}
                        </p>
                    </div>
                </div>
                {/* RESUMEN DE SEGUIMIENTO HORARIO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado de cumplimiento</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className={`text-2xl font-bold ${time_stats.debt >= 8 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                    {time_stats.total_done}h / {time_stats.expected_hours}h
                                </p>
                                <p className="text-xs text-slate-500">Balance: {time_stats.debt > 0 ? `-${time_stats.debt}h de deuda` : `+${Math.abs(time_stats.debt)}h de adelanto`}</p>
                            </div>
                            {time_stats.debt >= 8 ? (
                                <div className="bg-red-100 text-red-700 p-2 rounded-full"><AlertTriangle className="h-5 w-5" /></div>
                            ) : (
                                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full"><CheckCircle2 className="h-5 w-5" /></div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full flex items-center justify-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => setIsExportModalOpen(true)}
                        >
                            <Download className="h-4 w-4" />
                            Exportar Parte de Horas
                        </Button>

                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progreso del Convenio ({time_stats.target_total}h totales)</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{Math.round((time_stats.total_done / time_stats.target_total) * 100)}%</span>
                        </div>
                        <Progress value={(time_stats.total_done / time_stats.target_total) * 100} className="h-3 bg-slate-100 dark:bg-slate-800" />
                        <div className="flex justify-between mt-3 text-[10px] text-slate-400">
                            <span>Fichadas: {time_stats.worked_hours}h</span>
                            <span>Justificadas: {time_stats.justified_hours}h</span>
                            <span>Restantes: {Math.max(0, time_stats.target_total - time_stats.total_done)}h</span>
                        </div>
                    </Card>
                </div>

                {time_stats.is_non_compliant && (
                    <Alert variant="destructive" className="mb-8 border-red-200 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-bold">¡Atención! Incumplimiento detectado</AlertTitle>
                        <AlertDescription>
                            Este becario tiene una deuda de <strong>{time_stats.debt} horas</strong> respecto a su horario esperado a día de hoy.
                            Por favor, revisa su actividad o contacta con él.
                        </AlertDescription>
                    </Alert>
                )}

                {/* GRID */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* COLUMNA IZQ */}
                    <div className="space-y-6 md:col-span-5">
                        <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Datos Personales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pt-2">
                                <div className="flex items-center justify-between border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Correo Electrónico
                                    </span>
                                    {intern.user.email ? (
                                        <a
                                            href={`mailto:${intern.user.email}`}
                                            className="text-sm font-medium text-slate-700 hover:underline dark:text-slate-200"
                                        >
                                            {intern.user.email}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            —
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Teléfono
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {intern.phone || 'No indicado'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Ciudad
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {intern.city || '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Dirección
                                    </span>
                                    {intern.address ? (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${intern.address}, ${intern.city || ''}`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-medium text-slate-700 hover:underline dark:text-slate-200"
                                            title="Ver en Google Maps"
                                        >
                                            {intern.address}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            —
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        DNI
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {intern.dni}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Estado
                                    </span>
                                    <StatusBadge status={intern.status} />
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Progreso
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {intern.progress ?? 0}%
                                    </span>
                                </div>
                                {intern.is_delayed && (
                                    <div className="mt-1 text-xs font-medium text-red-500">
                                        Retrasado
                                    </div>
                                )}
                                {intern.abandon_reason && (
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Motivo abandono
                                        </span>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {intern.abandon_reason}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Documentación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 px-6 pt-2">
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <a
                                            href={dni_url || '#'}
                                            className={`text-sm ${dni_url ? 'text-slate-700 hover:underline dark:text-slate-200' : 'pointer-events-none text-slate-400'}`}
                                            target="_blank"
                                        >
                                            DNI.pdf
                                        </a>
                                    </div>
                                    {dni_url ? (
                                        <a
                                            href={dni_url}
                                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            download
                                        >
                                            Descargar
                                        </a>
                                    ) : (
                                        <span className="rounded border px-1 text-[10px] font-bold text-slate-300 uppercase">
                                            Falta
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <a
                                            href={agreement_url || '#'}
                                            className={`text-sm ${agreement_url ? 'text-slate-700 hover:underline dark:text-slate-200' : 'pointer-events-none text-slate-400'}`}
                                            target="_blank"
                                        >
                                            Convenio.pdf
                                        </a>
                                    </div>
                                    {agreement_url ? (
                                        <a
                                            href={agreement_url}
                                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            download
                                        >
                                            Descargar
                                        </a>
                                    ) : (
                                        <span className="rounded border px-1 text-[10px] font-bold text-slate-300 uppercase">
                                            Falta
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <a
                                            href={insurance_url || '#'}
                                            className={`text-sm ${insurance_url ? 'text-slate-700 hover:underline dark:text-slate-200' : 'pointer-events-none text-slate-400'}`}
                                            target="_blank"
                                        >
                                            Seguro.pdf
                                        </a>
                                    </div>
                                    {insurance_url ? (
                                        <a
                                            href={insurance_url}
                                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            download
                                        >
                                            Descargar
                                        </a>
                                    ) : (
                                        <span className="rounded border px-1 text-[10px] font-bold text-slate-300 uppercase">
                                            Falta
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Notas internas
                                    </CardTitle>
                                    {canManage && !editingNotes && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setEditingNotes(true)
                                            }
                                        >
                                            Editar
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 px-6 pt-4">
                                {editingNotes ? (
                                    <>
                                        <textarea
                                            value={notesValue}
                                            onChange={(e) =>
                                                setNotesValue(e.target.value)
                                            }
                                            className="min-h-[120px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                                            placeholder="Escribe una nota interna..."
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    router.patch(
                                                        `/interns/${intern.id}/notes`,
                                                        {
                                                            internal_notes:
                                                                notesValue,
                                                        },
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () =>
                                                                setEditingNotes(
                                                                    false,
                                                                ),
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
                                                        intern.internal_notes ||
                                                        '',
                                                    );
                                                    setEditingNotes(false);
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            {intern.internal_notes && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.patch(
                                                            `/interns/${intern.id}/notes`,
                                                            {
                                                                internal_notes:
                                                                    null,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess:
                                                                    () => {
                                                                        setNotesValue(
                                                                            '',
                                                                        );
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
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            {intern.internal_notes ||
                                                'Sin notas internas.'}
                                        </p>
                                        {(intern.notes_updated_by ||
                                            intern.internal_notes_updated_at) && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Última edición:{' '}
                                                    {intern.notes_updated_by
                                                        ?.name || 'Usuario'}{' '}
                                                    ·{' '}
                                                    {formatDateTimeEs(
                                                        intern.internal_notes_updated_at,
                                                    )}
                                                </p>
                                            )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUMNA DER */}
                    <div className="space-y-6 md:col-span-7">
                        <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Información Académica
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pt-2">
                                <div className="grid grid-cols-3 border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Centro
                                    </span>
                                    <span className="col-span-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {intern.education_center?.id ? (
                                            <Link
                                                href={`/centros/${intern.education_center.id}`}
                                                className="hover:underline"
                                            >
                                                {intern.education_center.name}
                                            </Link>
                                        ) : (
                                            'Sin centro'
                                        )}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Grado
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {intern.academic_degree}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Fechas
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {formatDateEs(intern.start_date)} al{' '}
                                        {formatDateEs(intern.end_date)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Horas
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {intern.total_hours}h
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Tutor del Centro
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {intern.center_tutor_name ||
                                            'Sin asignar'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Email tutor centro
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {intern.center_tutor_email || '—'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 border-b border-slate-50 py-3 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Teléfono tutor centro
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {intern.center_tutor_phone || '—'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 py-3">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Tutor de Empresa
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {intern.company_tutor?.name ||
                                            'Sin asignar'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 py-3">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">
                                        Email tutor empresa
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                        {intern.company_tutor?.email || '—'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Horarios Asignados
                                    </CardTitle>
                                    {canManage && (
                                        <CreateScheduleModal userId={intern.user.id} />
                                    )}

                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pt-4 space-y-3">
                                {intern.user?.schedules?.length > 0 ? (
                                    intern.user.schedules.map((schedule: any) => (
                                        <div key={schedule.id} className="p-3 border rounded-lg border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex justify-between font-medium text-sm text-slate-800 dark:text-slate-200">
                                                <span>{schedule.name}</span>
                                                <span className="text-xs font-normal">
                                                    {formatDateEs(schedule.start_date)} — {schedule.end_date ? formatDateEs(schedule.end_date) : 'Indefinido'}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex justify-between text-xs text-slate-500 font-mono bg-white dark:bg-slate-900 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700">
                                                <span>L: {schedule.monday_hours}h</span>
                                                <span>M: {schedule.tuesday_hours}h</span>
                                                <span>X: {schedule.wednesday_hours}h</span>
                                                <span>J: {schedule.thursday_hours}h</span>
                                                <span>V: {schedule.friday_hours}h</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No tiene ningún horario asignado actualmente.</p>
                                )}
                            </CardContent>
                        </Card>
                        {/* CARD AUSENCIAS SOLICITADAS */}
                        <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-6">
                            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Solicitudes de Ausencia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pt-4 space-y-3">
                                {intern.user?.absences?.length > 0 ? (
                                    intern.user.absences.map((abs: any) => (
                                        <div key={abs.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                            <div>
                                                <p className="text-sm font-medium">{abs.reason}</p>
                                                <p className="text-xs text-slate-500">{formatDateEs(abs.date)}</p>
                                            </div>

                                            <div className="flex gap-2">
                                                {abs.status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                                            onClick={() => router.patch(`/absences/${abs.id}/status`, { status: 'approved' })}
                                                        >
                                                            Aprobar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => router.patch(`/absences/${abs.id}/status`, { status: 'rejected' })}
                                                        >
                                                            Rechazar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${abs.status === 'approved' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                                                        }`}>
                                                        {abs.status === 'approved' ? 'Aprobada' : 'Denegada'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No hay solicitudes de ausencia registradas.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Historial de Actividades
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pt-4">
                                {activities.length > 0 ? (
                                    <div className="space-y-4">
                                        {activities.map((activity) => {
                                            const changes =
                                                activity.properties
                                                    ?.attributes ?? {};
                                            const old =
                                                activity.properties?.old ?? {};

                                            const labels: Record<
                                                string,
                                                string
                                            > = {
                                                name: 'Nombre',
                                                email: 'Email',
                                                phone: 'Teléfono',
                                                address: 'Dirección',
                                                city: 'Ciudad',
                                                dni: 'DNI',
                                                birth_date: 'Fecha nacimiento',
                                                education_center_id:
                                                    'Centro educativo',
                                                academic_degree: 'Grado',
                                                academic_year: 'Curso',
                                                start_date: 'Fecha inicio',
                                                end_date: 'Fecha fin',
                                                tutor_name:
                                                    'Tutor centro (antiguo)',
                                                center_tutor_name:
                                                    'Tutor centro (nombre)',
                                                center_tutor_email:
                                                    'Tutor centro (email)',
                                                center_tutor_phone:
                                                    'Tutor centro (teléfono)',
                                                company_tutor_user_id:
                                                    'Tutor empresa (ID)',
                                                total_hours: 'Horas totales',
                                                status: 'Estado',
                                                abandon_reason:
                                                    'Motivo abandono',
                                            };

                                            const statusLabels: Record<
                                                string,
                                                string
                                            > = {
                                                active: 'Activo',
                                                completed: 'Finalizado',
                                                abandoned: 'Abandonado',
                                            };

                                            const labelFor = (field: string) =>
                                                labels[field] ?? field;

                                            const formatValue = (
                                                field: string,
                                                value: any,
                                            ) => {
                                                if (
                                                    value === null ||
                                                    value === undefined ||
                                                    value === ''
                                                )
                                                    return '—';

                                                if (field === 'status') {
                                                    return (
                                                        statusLabels[value] ??
                                                        value
                                                    );
                                                }

                                                if (
                                                    field ===
                                                    'education_center_id'
                                                ) {
                                                    const key = String(value);
                                                    return (
                                                        centersById[key] ??
                                                        value
                                                    );
                                                }

                                                if (field === 'academic_year') {
                                                    return `Curso ${String(value).replace('-', '/')}`;
                                                }

                                                if (field === 'total_hours') {
                                                    return `${value}h`;
                                                }

                                                if (
                                                    [
                                                        'birth_date',
                                                        'start_date',
                                                        'end_date',
                                                    ].includes(field)
                                                ) {
                                                    return formatDateEs(value);
                                                }

                                                return value;
                                            };

                                            return (
                                                <div
                                                    key={activity.id}
                                                    className="flex gap-4 text-sm"
                                                >
                                                    <span className="w-28 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                                                        {formatDateTimeEs(
                                                            activity.created_at,
                                                        )}
                                                    </span>
                                                    <div className="text-slate-600 dark:text-slate-300">
                                                        {activity.event ===
                                                            'updated'
                                                            ? 'Perfil modificado '
                                                            : activity.event ===
                                                                'created'
                                                                ? 'Perfil creado '
                                                                : activity.event +
                                                                ' '}
                                                        por{' '}
                                                        <span className="font-medium text-slate-700 dark:text-slate-200">
                                                            {
                                                                activity.causer_name
                                                            }
                                                        </span>
                                                        {activity.event ===
                                                            'updated' &&
                                                            Object.keys(changes)
                                                                .length > 0 && (
                                                                <div className="mt-1 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                                    {Object.keys(
                                                                        changes,
                                                                    ).map(
                                                                        (
                                                                            field,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    field
                                                                                }
                                                                            >
                                                                                <span className="font-semibold">
                                                                                    {labelFor(
                                                                                        field,
                                                                                    )}

                                                                                    :
                                                                                </span>{' '}
                                                                                <span className="line-through opacity-70">
                                                                                    {formatValue(
                                                                                        field,
                                                                                        old[
                                                                                        field
                                                                                        ],
                                                                                    )}
                                                                                </span>{' '}
                                                                                →{' '}
                                                                                <span className="text-slate-700 dark:text-slate-200">
                                                                                    {formatValue(
                                                                                        field,
                                                                                        changes[
                                                                                        field
                                                                                        ],
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">
                                        No hay historial disponible.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <ExportReportModal
                    intern={intern}
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                />
            </div>
        </AppLayout>
    );
}
