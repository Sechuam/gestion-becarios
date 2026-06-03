import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CalendarRange,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    FileText,
    GraduationCap,
    HardDrive,
    History as HistoryIcon,
    Pencil,
    RotateCcw,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AbsencesPagination } from '@/components/attendance/AbsencesPagination';
import { ConfirmNavigationButton } from '@/components/common/ConfirmNavigationButton';
import { MetricPills } from '@/components/common/MetricPills';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { CreateScheduleModal } from '@/components/interns/CreateScheduleModal';
import { ExportReportModal } from '@/components/interns/ExportReportModal';
import { InternProfileTabsNav } from '@/components/interns/InternProfileTabsNav';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';
import type { BreadcrumbItem } from '@/types/navigation';

const ABSENCES_PER_PAGE = 3;
const PROFILE_TABS = [
    'resumen',
    'personal',
    'academico',
    'asistencia',
    'seguimiento',
];

function getInitialProfileTab() {
    if (typeof window === 'undefined') return 'resumen';

    const hash = window.location.hash.replace('#', '');

    return PROFILE_TABS.includes(hash) ? hash : 'resumen';
}

export default function Show({
    intern,
    time_stats,
    dni_url,
    agreement_url,
    insurance_url,
    internal_notes,
    activities,
    absences,
}: {
    intern: any;
    time_stats: any;
    dni_url: string;
    agreement_url: string;
    insurance_url: string;
    internal_notes: any[];
    activities: any[];
    absences: any[];
}) {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(getInitialProfileTab);

    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage interns');
    const headerMetrics = [
        {
            label: 'Centro',
            value: intern.education_center?.name || 'Sin asignar',
        },
        {
            label: 'Estado',
            value:
                {
                    active: 'Activo',
                    completed: 'Finalizado',
                    withdrawn: 'Baja/Abandono',
                    pending: 'Pendiente',
                }[intern.status as string] || intern.status,
        },
        {
            label: 'Horas',
            value: `${time_stats.total_done} / ${time_stats.target_total}h`,
        },
        {
            label: 'Progreso',
            value: `${Math.round((time_stats.total_done / time_stats.target_total) * 100) || 0}%`,
        },
    ];
    const canViewNotes =
        auth.user?.permissions?.includes('view internal notes') || canManage;
    const canViewReports =
        auth.user?.permissions?.includes('view reports') || canManage;
    const latestInternalNote = internal_notes?.[0] ?? null;
    const visibleNoteContent =
        intern.internal_notes || latestInternalNote?.content || '';
    const visibleNoteAuthor =
        intern.notes_updated_by || latestInternalNote?.user || null;
    const visibleNoteDate =
        intern.internal_notes_updated_at ||
        latestInternalNote?.edited_at ||
        latestInternalNote?.created_at ||
        null;
    const previousInternalNotes = (internal_notes ?? []).filter(
        (note) =>
            note.content !== visibleNoteContent ||
            note.id !== latestInternalNote?.id,
    );
    const [notesValue, setNotesValue] = useState(visibleNoteContent);
    const [activityPage, setActivityPage] = useState(1);
    const [absencePage, setAbsencePage] = useState(1);
    const [absenceToDelete, setAbsenceToDelete] = useState<any | null>(null);
    const activitiesPerPage = 3;
    const totalActivityPages = Math.ceil(activities.length / activitiesPerPage);
    const displayedActivities = activities.slice(
        (activityPage - 1) * activitiesPerPage,
        activityPage * activitiesPerPage,
    );
    const totalAbsencePages = Math.max(
        1,
        Math.ceil((absences?.length ?? 0) / ABSENCES_PER_PAGE),
    );
    const safeAbsencePage = Math.min(absencePage, totalAbsencePages);
    const displayedAbsences = (absences ?? []).slice(
        (safeAbsencePage - 1) * ABSENCES_PER_PAGE,
        safeAbsencePage * ABSENCES_PER_PAGE,
    );
    const absenceRangeStart =
        (absences?.length ?? 0) > 0
            ? (safeAbsencePage - 1) * ABSENCES_PER_PAGE + 1
            : 0;
    const absenceRangeEnd = Math.min(
        safeAbsencePage * ABSENCES_PER_PAGE,
        absences?.length ?? 0,
    );
    const today = new Date().toISOString().split('T')[0];
    const schedules = [...(intern.user?.schedules ?? [])].sort(
        (a: any, b: any) =>
            String(b.start_date).localeCompare(String(a.start_date)),
    );
    const handleDeleteAbsence = () => {
        if (!absenceToDelete) return;

        router.delete(`/absences/${absenceToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setAbsenceToDelete(null),
        });
    };

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

    useEffect(() => {
        const handleHashChange = () => {
            setActiveTab(getInitialProfileTab());
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Perfil de ${intern.user.name}`} />

            <div className="min-h-screen w-full space-y-3 p-6">
                {/* CABECERA */}
                <div className="flex items-center justify-between px-2">
                    <Button
                        variant="default"
                        className="rounded-xl border-0 bg-gradient-to-r from-sidebar to-sidebar-accent text-[10px] font-bold tracking-widest text-white uppercase shadow-sm hover:opacity-95"
                        asChild
                    >
                        <Link href="/becarios">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al
                            listado
                        </Link>
                    </Button>
                </div>

                {/* HERO INTEGRADO CON GRADIENTE */}
                <ModuleHeader
                    title={intern.user.name}
                    description={`${intern.user.email} • ${intern.academic_degree || 'Sin titulación'}`}
                    avatar={intern.user.avatar}
                    actions={
                        canManage ? (
                            <ConfirmNavigationButton
                                href={`/interns/${intern.id}/edit`}
                                title="Confirmar edición"
                                description={`Vas a editar el perfil de ${intern.user.name}.`}
                                confirmLabel="Ir a editar"
                                className="flex h-8 items-center rounded-lg border-none bg-white px-4 text-[10px] font-black tracking-widest text-sidebar uppercase shadow-lg hover:bg-white/90"
                            >
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Editar Perfil
                            </ConfirmNavigationButton>
                        ) : undefined
                    }
                />
                <MetricPills metrics={headerMetrics} />
                {/* TABS INTERFACE */}
                {/* PANEL ÚNICO UNIFICADO */}
                <Card className="app-panel w-full overflow-hidden border-2 border-sidebar/15 pt-0 pb-0 shadow-xl">
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => {
                            setActiveTab(value);
                            window.history.replaceState(
                                null,
                                '',
                                `#${value}`,
                            );
                        }}
                        className="w-full"
                    >
                        {/* NAVEGACIÓN INTEGRADA EN LA CABECERA DEL PANEL */}
                        <div className="border-b border-sidebar/20 bg-stone-100/50 p-2 dark:border-[#2f4a62] dark:bg-[#142235]/85">
                            <InternProfileTabsNav />
                        </div>

                        <CardContent className="p-6">
                            {/* PESTAÑA RESUMEN UNIFICADA */}
                            <TabsContent
                                value="resumen"
                                className="mt-0 animate-in space-y-8 duration-500 fade-in"
                            >
                                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-gradient-to-br from-sidebar to-sidebar-accent p-2 shadow-md shadow-sidebar/20">
                                                <Clock className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-[#edf1f5]">
                                                Estado de Horas
                                            </h3>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                                {time_stats.total_done}h
                                            </span>
                                            <span className="font-medium text-slate-400">
                                                / {time_stats.expected_hours}h
                                                esperadas
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent p-4 shadow-xl shadow-sidebar/10">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full ${time_stats.debt > 0 ? 'bg-white text-rose-600' : 'bg-white/15 text-white'}`}
                                            >
                                                {time_stats.debt > 0 ? (
                                                    <AlertTriangle className="h-5 w-5" />
                                                ) : (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {time_stats.debt > 0
                                                        ? `Deuda de ${time_stats.debt} horas`
                                                        : `Adelanto de ${Math.abs(time_stats.debt)} horas`}
                                                </p>
                                                <p className="text-xs text-white/60">
                                                    Balance comparativo respecto
                                                    al horario asignado
                                                </p>
                                            </div>
                                        </div>

                                        {canViewReports && (
                                            <Button
                                                variant="default"
                                                className="w-full rounded-xl border-none bg-gradient-to-r from-sidebar to-sidebar-accent py-6 font-bold text-white shadow-xl shadow-sidebar/10 transition-all hover:opacity-95"
                                                onClick={() =>
                                                    setIsExportModalOpen(true)
                                                }
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Generar Informe de Registro
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-xl bg-gradient-to-br from-sidebar to-sidebar-accent p-2 shadow-md shadow-sidebar/20">
                                                    <GraduationCap className="h-5 w-5 text-white" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-[#edf1f5]">
                                                    Progreso Total
                                                </h3>
                                            </div>
                                            <span className="text-2xl font-black text-sidebar">
                                                {Math.round(
                                                    (time_stats.total_done /
                                                        time_stats.target_total) *
                                                        100,
                                                )}
                                                %
                                            </span>
                                        </div>

                                        <Progress
                                            value={
                                                (time_stats.total_done /
                                                    time_stats.target_total) *
                                                100
                                            }
                                            className="h-4 rounded-full bg-slate-200 dark:bg-[#22374d]"
                                            indicatorClassName="bg-slate-700 dark:bg-slate-200"
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-xl border-none bg-gradient-to-br from-sidebar to-sidebar-accent p-5 shadow-xl shadow-sidebar/10">
                                                <p className="mb-1 text-[10px] font-black tracking-widest text-white/60 uppercase">
                                                    Horas Fichadas
                                                </p>
                                                <p className="text-2xl font-bold text-white">
                                                    {time_stats.worked_hours}h
                                                </p>
                                            </div>
                                            <div className="rounded-xl border-none bg-gradient-to-br from-sidebar to-sidebar-accent p-5 shadow-xl shadow-sidebar/10">
                                                <p className="mb-1 text-[10px] font-black tracking-widest text-white/60 uppercase">
                                                    Horas Justificadas
                                                </p>
                                                <p className="text-2xl font-bold text-white">
                                                    {time_stats.justified_hours}
                                                    h
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border-none bg-gradient-to-r from-sidebar to-sidebar-accent p-4 shadow-xl shadow-sidebar/10">
                                            <p className="text-xs font-bold text-white/80">
                                                Faltan por completar:
                                            </p>
                                            <p className="text-lg font-black text-white">
                                                {Number(
                                                    Math.max(
                                                        0,
                                                        time_stats.target_total -
                                                            time_stats.total_done,
                                                    ).toFixed(1),
                                                )}
                                                h
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA PERSONAL UNIFICADA */}
                            <TabsContent
                                value="personal"
                                className="mt-0 animate-in duration-500 fade-in"
                            >
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-3 md:col-span-12 dark:border-[#2f4a62]">
                                        <h3 className="flex items-center gap-2 text-xl font-bold">
                                            <User className="h-5 w-5 text-primary" />
                                            Ficha de Expediente
                                        </h3>
                                        <StatusBadge status={intern.status} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:col-span-8 md:grid-cols-2">
                                        {[
                                            {
                                                label: 'Correo Electrónico',
                                                value: intern.user.email,
                                                isLink: true,
                                                href: `mailto:${intern.user.email}`,
                                            },
                                            {
                                                label: 'Teléfono de Contacto',
                                                value:
                                                    intern.phone ||
                                                    'No indicado',
                                            },
                                            {
                                                label: 'Dirección de Residencia',
                                                value: intern.address || '—',
                                            },
                                            {
                                                label: 'Ciudad / Localidad',
                                                value: intern.city || '—',
                                            },
                                            {
                                                label: 'DNI / NIE',
                                                value: intern.dni,
                                            },
                                            {
                                                label: 'Fecha de Nacimiento',
                                                value: intern.birth_date
                                                    ? formatDateEs(
                                                          intern.birth_date,
                                                      )
                                                    : '—',
                                            },
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                    {item.label}
                                                </p>
                                                {item.isLink && item.value ? (
                                                    <a
                                                        href={item.href}
                                                        className="block text-sm font-bold text-primary hover:underline"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800 dark:text-[#edf1f5]">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6 md:col-span-4">
                                        <div className="space-y-4 rounded-xl bg-gradient-to-br from-sidebar to-sidebar-accent p-6 shadow-xl shadow-sidebar/10">
                                            <h4 className="mb-4 flex items-center gap-2 text-xs font-black text-white/75 uppercase">
                                                <HardDrive className="h-3 w-3" />{' '}
                                                Documentación Digital
                                            </h4>
                                            {[
                                                {
                                                    label: 'Copia DNI',
                                                    url: dni_url,
                                                },
                                                {
                                                    label: 'Convenio de Prácticas',
                                                    url: agreement_url,
                                                },
                                                {
                                                    label: 'Seguro de Accidentes',
                                                    url: insurance_url,
                                                },
                                            ].map((doc, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group flex items-center justify-between"
                                                >
                                                    <span className="text-xs font-medium text-white">
                                                        {doc.label}
                                                    </span>
                                                    {doc.url ? (
                                                        <div className="flex gap-2">
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                className="rounded-lg bg-white/15 p-1.5 text-white transition-colors hover:bg-white/25"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                            <a
                                                                href={doc.url}
                                                                download
                                                                className="rounded-lg bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white/85">
                                                            Pendiente
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA ACADEMIA UNIFICADA */}
                            <TabsContent
                                value="academico"
                                className="mt-0 animate-in duration-500 fade-in"
                            >
                                <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-50 pb-4 dark:border-[#2f4a62]">
                                            <h3 className="flex items-center gap-2 text-xl font-bold">
                                                <GraduationCap className="h-5 w-5 text-primary" />
                                                Formación y Centro
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                    Centro Educativo
                                                </p>
                                                {intern.education_center?.id ? (
                                                    <Link
                                                        href={`/centros/${intern.education_center.id}`}
                                                        className="text-lg font-bold text-primary hover:underline"
                                                    >
                                                        {
                                                            intern
                                                                .education_center
                                                                .name
                                                        }
                                                    </Link>
                                                ) : (
                                                    <p className="text-lg font-bold">
                                                        Sin asignar
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                    Grado o Titulación
                                                </p>
                                                <p className="text-base font-bold text-slate-800 dark:text-[#edf1f5]">
                                                    {intern.academic_degree}
                                                </p>
                                            </div>

                                            <div className="flex gap-12">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                        Fecha Inicio
                                                    </p>
                                                    <p className="text-sm font-bold">
                                                        {formatDateEs(
                                                            intern.start_date,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                        Fecha Fin Prevista
                                                    </p>
                                                    <p className="text-sm font-bold">
                                                        {formatDateEs(
                                                            intern.end_date,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="border-b border-slate-50 pb-4 dark:border-[#2f4a62]">
                                            <h3 className="flex items-center gap-2 text-xl font-bold">
                                                <User className="h-5 w-5 text-black dark:text-white" />
                                                Tutorización
                                            </h3>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex gap-4 rounded-xl bg-gradient-to-br from-sidebar to-sidebar-accent p-5 shadow-xl shadow-sidebar/10">
                                                <Avatar className="h-10 w-12 shrink-0 rounded-full">
                                                    <AvatarFallback className="bg-white/20 font-bold text-white">
                                                        {intern.center_tutor_name?.substring(
                                                            0,
                                                            1,
                                                        ) || 'C'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="mb-1 text-[10px] font-black tracking-widest text-white/70 uppercase">
                                                        Tutor del Centro
                                                    </p>
                                                    <p className="text-base font-bold text-white">
                                                        {intern.center_tutor_name ||
                                                            'Sin asignar'}
                                                    </p>
                                                    <p className="text-xs text-white/80">
                                                        {intern.center_tutor_email ||
                                                            'No email'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 rounded-xl bg-gradient-to-br from-sidebar to-sidebar-accent p-5 shadow-xl shadow-sidebar/10">
                                                <Avatar className="h-10 w-12 shrink-0 rounded-full">
                                                    <AvatarImage
                                                        src={
                                                            intern.company_tutor
                                                                ?.avatar
                                                        }
                                                        alt={
                                                            intern.company_tutor
                                                                ?.name || ''
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-white/20 font-bold text-white">
                                                        {intern.company_tutor?.name?.substring(
                                                            0,
                                                            1,
                                                        ) || 'E'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="mb-1 text-[10px] font-black tracking-widest text-white/70 uppercase">
                                                        Tutor de Empresa
                                                    </p>
                                                    <p className="text-base font-bold text-white">
                                                        {intern.company_tutor
                                                            ?.name ||
                                                            'Sin asignar'}
                                                    </p>
                                                    <p className="text-xs text-white/80">
                                                        {intern.company_tutor
                                                            ?.email ||
                                                            'No email'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA ASISTENCIA UNIFICADA */}
                            <TabsContent
                                value="asistencia"
                                className="mt-0 animate-in duration-500 fade-in"
                            >
                                <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
                                    <div className="space-y-6 md:col-span-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-xl font-bold">
                                                <Clock className="h-5 w-5 text-black dark:text-white" />
                                                Horarios Activos
                                            </h3>
                                            {canManage && (
                                                <CreateScheduleModal
                                                    userId={intern.user.id}
                                                    createButtonClassName="border-none bg-gradient-to-r from-sidebar to-sidebar-accent text-white shadow-lg shadow-sidebar/10 hover:opacity-95"
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {schedules.length > 0 ? (
                                                schedules.map(
                                                    (schedule: any) => {
                                                        const isActive =
                                                            schedule.start_date <=
                                                                today &&
                                                            (!schedule.end_date ||
                                                                schedule.end_date >=
                                                                    today);

                                                        return (
                                                            <div
                                                                key={
                                                                    schedule.id
                                                                }
                                                                className="rounded-xl bg-gradient-to-br from-sidebar to-sidebar-accent p-6 shadow-xl shadow-sidebar/10"
                                                            >
                                                                <div className="mb-4 flex items-start justify-between">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-bold text-white">
                                                                                {
                                                                                    schedule.name
                                                                                }
                                                                            </h4>
                                                                            {isActive && (
                                                                                <Badge className="rounded-full bg-white text-sidebar hover:bg-white">
                                                                                    Activo
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="mt-0.5 text-[10px] font-bold text-white/70">
                                                                            Vigencia:{' '}
                                                                            {formatDateEs(
                                                                                schedule.start_date,
                                                                            )}{' '}
                                                                            —{' '}
                                                                            {schedule.end_date
                                                                                ? formatDateEs(
                                                                                      schedule.end_date,
                                                                                  )
                                                                                : 'Activo'}
                                                                        </p>
                                                                    </div>
                                                                    {canManage && (
                                                                        <CreateScheduleModal
                                                                            userId={
                                                                                intern
                                                                                    .user
                                                                                    .id
                                                                            }
                                                                            schedule={
                                                                                schedule
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="grid grid-cols-5 gap-2">
                                                                    {[
                                                                        'L',
                                                                        'M',
                                                                        'X',
                                                                        'J',
                                                                        'V',
                                                                    ].map(
                                                                        (
                                                                            d,
                                                                            i,
                                                                        ) => {
                                                                            const h =
                                                                                [
                                                                                    schedule.monday_hours,
                                                                                    schedule.tuesday_hours,
                                                                                    schedule.wednesday_hours,
                                                                                    schedule.thursday_hours,
                                                                                    schedule.friday_hours,
                                                                                ][
                                                                                    i
                                                                                ];
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        d
                                                                                    }
                                                                                    className="flex flex-col items-center rounded-xl border border-white/15 bg-white/10 p-2 shadow-sm backdrop-blur-sm"
                                                                                >
                                                                                    <span className="mb-1 text-[10px] font-black text-white/55">
                                                                                        {
                                                                                            d
                                                                                        }
                                                                                    </span>
                                                                                    <span className="text-sm font-bold text-white">
                                                                                        {
                                                                                            h
                                                                                        }

                                                                                        h
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 py-8 text-center dark:border-[#2f4a62]">
                                                    <CalendarRange className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                                                    <p className="text-sm text-slate-500 italic">
                                                        No hay horarios
                                                        definidos.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6 md:col-span-7">
                                        <h3 className="flex items-center gap-2 text-xl font-bold">
                                            <AlertTriangle className="h-5 w-5 text-black dark:text-white" />
                                            Gestión de Ausencias
                                        </h3>

                                        <div className="space-y-4">
                                            {absences?.length > 0 ? (
                                                <>
                                                    {displayedAbsences.map(
                                                        (abs: any) => (
                                                            <div
                                                                key={abs.id}
                                                                className="group flex items-center justify-between rounded-xl border border-sidebar/20 bg-white p-5 transition-all hover:shadow-md dark:bg-[#142235]"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div
                                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                                            abs.status ===
                                                                            'approved'
                                                                                ? 'bg-sidebar/10 text-sidebar'
                                                                                : abs.status ===
                                                                                    'rejected'
                                                                                  ? 'bg-rose-50 text-rose-600'
                                                                                  : 'bg-amber-50 text-amber-600'
                                                                        }`}
                                                                    >
                                                                        <FileText className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800 dark:text-[#edf1f5]">
                                                                            {
                                                                                abs.reason
                                                                            }
                                                                        </p>
                                                                        <div className="mt-1 flex items-center gap-3">
                                                                            <span className="text-xs font-medium text-slate-400">
                                                                                {formatDateEs(
                                                                                    abs.date,
                                                                                )}
                                                                            </span>
                                                                            {abs.justification_url && (
                                                                                <a
                                                                                    href={
                                                                                        abs.justification_url
                                                                                    }
                                                                                    target="_blank"
                                                                                    className="text-[10px] font-black tracking-widest text-indigo-600 uppercase hover:underline"
                                                                                >
                                                                                    Justificante
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    {abs.status ===
                                                                    'pending' ? (
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-9 rounded-xl"
                                                                                onClick={() =>
                                                                                    router.patch(
                                                                                        `/absences/${abs.id}/status`,
                                                                                        {
                                                                                            status: 'approved',
                                                                                        },
                                                                                    )
                                                                                }
                                                                            >
                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="destructive"
                                                                                className="h-9 rounded-xl"
                                                                                onClick={() =>
                                                                                    router.patch(
                                                                                        `/absences/${abs.id}/status`,
                                                                                        {
                                                                                            status: 'rejected',
                                                                                        },
                                                                                    )
                                                                                }
                                                                            >
                                                                                <ArrowLeft className="h-4 w-4 rotate-45" />
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <span
                                                                            className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${
                                                                                abs.status ===
                                                                                'approved'
                                                                                    ? 'bg-sidebar/10 text-sidebar'
                                                                                    : 'bg-rose-100 text-rose-700'
                                                                            }`}
                                                                        >
                                                                            {abs.status ===
                                                                            'approved'
                                                                                ? 'Aprobada'
                                                                                : 'Denegada'}
                                                                        </span>
                                                                    )}
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-9 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                                        onClick={() =>
                                                                            setAbsenceToDelete(
                                                                                abs,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}

                                                    {absences.length >
                                                        ABSENCES_PER_PAGE && (
                                                        <AbsencesPagination
                                                            absencePage={
                                                                safeAbsencePage
                                                            }
                                                            totalAbsencePages={
                                                                totalAbsencePages
                                                            }
                                                            absenceRangeStart={
                                                                absenceRangeStart
                                                            }
                                                            absenceRangeEnd={
                                                                absenceRangeEnd
                                                            }
                                                            totalAbsences={
                                                                absences.length
                                                            }
                                                            onPageChange={
                                                                setAbsencePage
                                                            }
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <p className="py-8 text-center text-sm text-slate-500 italic">
                                                    No hay registros de
                                                    ausencia.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA SEGUIMIENTO UNIFICADA */}
                            <TabsContent
                                value="seguimiento"
                                className="mt-0 animate-in duration-500 fade-in"
                            >
                                <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
                                    {canViewNotes && (
                                        <div className="space-y-6 md:col-span-5">
                                            <div className="flex items-center justify-between border-b border-slate-50 pb-4 dark:border-[#2f4a62]">
                                                <h3 className="flex items-center gap-2 text-xl font-bold">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    Notas de Seguimiento
                                                </h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="rounded-xl border border-sidebar/15 bg-white p-5 shadow-sm dark:bg-[#142235]">
                                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                        Nota de seguimiento
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-[#8fa3b6]">
                                                        Escribe aquí las
                                                        observaciones del
                                                        becario y guarda los
                                                        cambios cuando quieras.
                                                    </p>
                                                    <textarea
                                                        value={notesValue}
                                                        onChange={(e) =>
                                                            setNotesValue(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-4 min-h-[220px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 transition-all outline-none focus:border-sidebar/30 focus:bg-white focus:ring-2 focus:ring-sidebar/15 dark:border-[#2c465c] dark:bg-[#17283c] dark:text-[#d8e4ef] dark:focus:bg-slate-800"
                                                        placeholder="Añade observaciones sobre el desempeño..."
                                                    />
                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl"
                                                            onClick={() => {
                                                                setNotesValue(
                                                                    visibleNoteContent,
                                                                );
                                                            }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent px-6 text-white hover:opacity-95"
                                                            onClick={() =>
                                                                router.patch(
                                                                    `/interns/${intern.id}/notes`,
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

                                                    {(visibleNoteAuthor ||
                                                        visibleNoteDate) && (
                                                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-[#2c465c]">
                                                            <span className="text-[10px] font-bold tracking-tighter uppercase opacity-50">
                                                                Última edición
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage
                                                                        src={
                                                                            visibleNoteAuthor?.avatar
                                                                        }
                                                                        alt={
                                                                            visibleNoteAuthor?.name ||
                                                                            ''
                                                                        }
                                                                    />
                                                                    <AvatarFallback className="bg-slate-100 text-[10px] dark:bg-[#22374d]">
                                                                        {visibleNoteAuthor?.name?.charAt(
                                                                            0,
                                                                        ) ||
                                                                            'S'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-[10px] font-bold text-slate-500">
                                                                    {visibleNoteAuthor?.name ||
                                                                        'Sistema'}
                                                                    {visibleNoteDate
                                                                        ? ` · ${formatDateTimeEs(visibleNoteDate)}`
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {previousInternalNotes.length >
                                                    0 && (
                                                    <div className="rounded-xl border border-sidebar/10 bg-white p-4 shadow-sm dark:bg-[#142235]">
                                                        <p className="mb-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                            Historial de notas
                                                        </p>
                                                        <div className="space-y-3">
                                                            {previousInternalNotes.map(
                                                                (note) => (
                                                                    <div
                                                                        key={
                                                                            note.id
                                                                        }
                                                                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-[#2c465c] dark:bg-[#1b2d42]"
                                                                    >
                                                                        <div className="mb-2 flex items-center justify-between gap-2">
                                                                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                                                {note
                                                                                    .user
                                                                                    ?.name ||
                                                                                    'Sistema'}
                                                                            </span>
                                                                            <span className="text-[10px] font-medium text-slate-400">
                                                                                {formatDateTimeEs(
                                                                                    note.edited_at ||
                                                                                        note.created_at,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-[#c4d2df]">
                                                                            {
                                                                                note.content
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`${canViewNotes ? 'md:col-span-7' : 'md:col-span-12'} min-w-0 space-y-6`}
                                    >
                                        <h3 className="flex items-center gap-2 border-b border-slate-50 pb-4 text-xl font-bold dark:border-[#2f4a62]">
                                            <HistoryIcon className="h-5 w-5 text-slate-500" />
                                            Historial de Auditoría
                                        </h3>

                                        <div className="relative space-y-1 pl-8 before:absolute before:top-2 before:bottom-2 before:left-3 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
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

                                                        // Mapa de traducciones completo
                                                        const labels: Record<
                                                            string,
                                                            string
                                                        > = {
                                                            status: 'Estado',
                                                            progress:
                                                                'Progreso',
                                                            internal_notes:
                                                                'Notas internas',
                                                            internal_notes_updated_at:
                                                                'Fecha de actualización de notas',
                                                            internal_notes_updated_by:
                                                                'Actualizado por',
                                                            notes: 'Observaciones',
                                                            end_date:
                                                                'Fecha de finalización',
                                                            start_date:
                                                                'Fecha de inicio',
                                                            total_hours:
                                                                'Horas totales',
                                                            hours: 'Horas contrato',
                                                            academic_degree:
                                                                'Titulación',
                                                            academic_year:
                                                                'Curso académico',
                                                            education_center_id:
                                                                'Centro educativo',
                                                            company_tutor_user_id:
                                                                'Tutor de empresa',
                                                            tutor_name:
                                                                'Tutor de empresa',
                                                            center_tutor_name:
                                                                'Tutor del centro',
                                                            center_tutor_email:
                                                                'Email tutor centro',
                                                            birth_date:
                                                                'Fecha de nacimiento',
                                                            dni: 'DNI/NIE',
                                                            phone: 'Teléfono',
                                                            address:
                                                                'Dirección',
                                                            city: 'Población',
                                                            abandon_reason:
                                                                'Motivo de baja',
                                                            user_id:
                                                                'ID de usuario',
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

                                                            // Formatear estados
                                                            if (
                                                                field ===
                                                                'status'
                                                            ) {
                                                                const statusMap: Record<
                                                                    string,
                                                                    string
                                                                > = {
                                                                    active: 'Activo',
                                                                    completed:
                                                                        'Finalizado',
                                                                    withdrawn:
                                                                        'Baja/Abandono',
                                                                    pending:
                                                                        'Pendiente',
                                                                };
                                                                return (
                                                                    statusMap[
                                                                        value
                                                                    ] || value
                                                                );
                                                            }

                                                            // Formatear fechas
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
                                                                } catch {
                                                                    return value;
                                                                }
                                                            }

                                                            return value;
                                                        };

                                                        return (
                                                            <div
                                                                key={
                                                                    activity.id
                                                                }
                                                                className="group relative pb-10"
                                                            >
                                                                {/* Línea vertical y Avatar */}
                                                                <div className="absolute top-0.5 -left-10 z-10 h-8 w-8 overflow-hidden rounded-xl border-4 border-white bg-white shadow-sm ring-1 ring-slate-200 transition-all group-hover:scale-110 dark:border-[#0f1b2a] dark:bg-[#17283c] dark:ring-[#2c465c]">
                                                                    <Avatar className="h-full w-full rounded-none">
                                                                        <AvatarImage
                                                                            src={
                                                                                activity.causer_avatar
                                                                            }
                                                                            alt={
                                                                                activity.causer_name
                                                                            }
                                                                        />
                                                                        <AvatarFallback className="bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-[#22374d]">
                                                                            {activity.causer_name?.charAt(
                                                                                0,
                                                                            ) ||
                                                                                'S'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <p className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:border-[#2f4a62] dark:bg-[#17283c]/85">
                                                                            {formatDateTimeEs(
                                                                                activity.created_at,
                                                                            )}
                                                                        </p>
                                                                        <span className="text-[10px] font-bold text-slate-400 opacity-50">
                                                                            •
                                                                        </span>
                                                                        <span className="text-[10px] font-bold tracking-tighter text-sidebar/60 uppercase dark:text-white/40">
                                                                            Por{' '}
                                                                            {activity.causer_name ||
                                                                                'Sistema'}
                                                                        </span>
                                                                    </div>

                                                                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-[#edf1f5]">
                                                                        {activity.event ===
                                                                        'updated' ? (
                                                                            <span className="flex items-center gap-1.5">
                                                                                <Pencil className="h-3 w-3 text-amber-500" />
                                                                                Edición
                                                                                de
                                                                                información
                                                                            </span>
                                                                        ) : activity.event ===
                                                                          'created' ? (
                                                                            <span className="flex items-center gap-1.5">
                                                                                <CheckCircle2 className="h-3 w-3 text-sidebar" />
                                                                                Alta
                                                                                de
                                                                                nuevo
                                                                                becario
                                                                            </span>
                                                                        ) : activity.event ===
                                                                          'deleted' ? (
                                                                            <span className="flex items-center gap-1.5">
                                                                                <Trash2 className="h-3 w-3 text-rose-500" />
                                                                                Eliminación
                                                                                de
                                                                                registro
                                                                            </span>
                                                                        ) : activity.event ===
                                                                          'restored' ? (
                                                                            <span className="flex items-center gap-1.5">
                                                                                <RotateCcw className="h-3 w-3 text-blue-500" />
                                                                                Restauración
                                                                                de
                                                                                registro
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1.5 text-[10px] tracking-tighter uppercase opacity-70">
                                                                                {
                                                                                    activity.description
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </p>

                                                                    {/* Grid de cambios */}
                                                                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-2">
                                                                        {Object.keys(
                                                                            changes,
                                                                        ).map(
                                                                            (
                                                                                field,
                                                                            ) => {
                                                                                if (
                                                                                    [
                                                                                        'updated_at',
                                                                                        'id',
                                                                                        'created_at',
                                                                                    ].includes(
                                                                                        field,
                                                                                    )
                                                                                )
                                                                                    return null;

                                                                                const label =
                                                                                    labels[
                                                                                        field
                                                                                    ] ||
                                                                                    field;
                                                                                const oldValue =
                                                                                    formatValue(
                                                                                        field,
                                                                                        old[
                                                                                            field
                                                                                        ],
                                                                                    );
                                                                                const newValue =
                                                                                    formatValue(
                                                                                        field,
                                                                                        changes[
                                                                                            field
                                                                                        ],
                                                                                    );

                                                                                // Si es creación, no mostrar el valor antiguo
                                                                                if (
                                                                                    activity.event ===
                                                                                    'created'
                                                                                ) {
                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                field
                                                                                            }
                                                                                            className="flex min-w-0 flex-col gap-0.5 border-l-2 border-sidebar/40 py-0.5 pl-3"
                                                                                        >
                                                                                            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                                                                {
                                                                                                    label
                                                                                                }
                                                                                            </span>
                                                                                            <span className="text-xs font-bold break-words text-slate-700 dark:text-[#c4d2df]">
                                                                                                {
                                                                                                    newValue
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            field
                                                                                        }
                                                                                        className="flex min-w-0 flex-col gap-0.5 border-l-2 border-sidebar/40 py-0.5 pl-3"
                                                                                    >
                                                                                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                                                            {
                                                                                                label
                                                                                            }
                                                                                        </span>
                                                                                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                                                            <span className="break-words text-slate-500 line-through opacity-30">
                                                                                                {
                                                                                                    oldValue
                                                                                                }
                                                                                            </span>
                                                                                            <span className="font-bold text-primary/40">
                                                                                                →
                                                                                            </span>
                                                                                            <span className="font-bold break-words text-sidebar dark:text-[#edf1f5]">
                                                                                                {
                                                                                                    newValue
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <p className="py-4 text-sm text-slate-400 italic">
                                                    Aún no hay actividad
                                                    registrada para este
                                                    becario.
                                                </p>
                                            )}

                                            {totalActivityPages > 1 && (
                                                <div className="mt-8 flex items-center justify-between border-t border-sidebar/20 pt-8">
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
                                                        className="h-10 rounded-xl border-none bg-gradient-to-r from-sidebar to-sidebar-accent px-4 text-white shadow-lg shadow-sidebar/10 hover:opacity-95 disabled:opacity-50"
                                                    >
                                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                                        Anterior
                                                    </Button>

                                                    <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
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
                                                        className="h-10 rounded-xl border-none bg-gradient-to-r from-sidebar to-sidebar-accent px-4 text-white shadow-lg shadow-sidebar/10 hover:opacity-95 disabled:opacity-50"
                                                    >
                                                        Siguiente
                                                        <ChevronRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
                {/* FIN PANEL UNIFICADO */}
                {/* FIN TABS */}

                <ExportReportModal
                    intern={intern}
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                />

                <Dialog
                    open={Boolean(absenceToDelete)}
                    onOpenChange={(open) => {
                        if (!open) setAbsenceToDelete(null);
                    }}
                >
                    <DialogContent className="max-w-md rounded-xl border-sidebar/10 shadow-xl">
                        <DialogHeader>
                            <DialogTitle>Cancelar ausencia</DialogTitle>
                            <DialogDescription>
                                Vas a eliminar esta ausencia del registro del
                                becario. Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>

                        {absenceToDelete && (
                            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-900">
                                <p className="font-bold">
                                    {absenceToDelete.reason}
                                </p>
                                <p className="mt-1 text-xs font-medium text-rose-700">
                                    {formatDateEs(absenceToDelete.date)}
                                </p>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setAbsenceToDelete(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                className="rounded-xl"
                                onClick={handleDeleteAbsence}
                            >
                                Eliminar ausencia
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
