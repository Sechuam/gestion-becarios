import { Head, Link } from '@inertiajs/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { ConfirmNavigationButton } from '@/components/common/ConfirmNavigationButton';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';
import type { BreadcrumbItem } from '@/types/navigation';

export default function Show({
    intern,
    dni_url,
    agreement_url,
    insurance_url,
    activities,
}: {
    intern: any;
    dni_url: string;
    agreement_url: string;
    insurance_url: string;
    activities: any[];
}) {
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
            </div>
        </AppLayout>
    );
}
