import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { ConfirmNavigationButton } from '@/components/common/ConfirmNavigationButton';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';
import type { BreadcrumbItem } from '@/types/navigation';
import { CreateScheduleModal } from '@/components/interns/CreateScheduleModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ArrowLeft, CalendarRange, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, FileText, GraduationCap, HardDrive, History as HistoryIcon, Mail, Pencil, RotateCcw, Trash2, User } from 'lucide-react';
import { ExportReportModal } from '@/components/interns/ExportReportModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';




export default function Show({
    intern,
    time_stats,
    dni_url,
    agreement_url,
    insurance_url,
    activities,
    absences,

}: {
    intern: any;
    time_stats: any;
    dni_url: string;
    agreement_url: string;
    insurance_url: string;
    activities: any[];
    absences: any[];
}) {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage interns');
    const canViewNotes = auth.user?.permissions?.includes('view internal notes') || canManage;
    const canViewReports = auth.user?.permissions?.includes('view reports') || canManage;
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesValue, setNotesValue] = useState(intern.internal_notes || '');
    const [activityPage, setActivityPage] = useState(1);
    const activitiesPerPage = 5;
    const totalActivityPages = Math.ceil(activities.length / activitiesPerPage);
    const displayedActivities = activities.slice(
        (activityPage - 1) * activitiesPerPage,
        activityPage * activitiesPerPage,
    );
    const today = new Date().toISOString().split('T')[0];
    const schedules = [...(intern.user?.schedules ?? [])].sort((a: any, b: any) =>
        String(b.start_date).localeCompare(String(a.start_date)),
    );

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

            <div className="w-full space-y-6 p-6 min-h-screen">
                {/* CABECERA */}
                <div className="flex items-center justify-between px-2">
                    <Button
                        variant="default"
                        className="bg-gradient-to-r from-sidebar to-[#1f4f52] text-white hover:opacity-95 shadow-sm rounded-xl font-bold uppercase tracking-widest text-[10px] border-0"
                        asChild
                    >
                        <Link href="/becarios">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
                        </Link>
                    </Button>
                </div>

                {/* HERO INTEGRADO CON GRADIENTE */}
                <ModuleHeader
                    title={intern.user.name}
                    description={`${intern.user.email} • ${intern.academic_degree || 'Sin titulación'}`}
                    avatar={intern.user.avatar}
                    metrics={[
                        { label: 'Centro', value: intern.education_center?.name || 'Sin asignar' },
                        { label: 'Estado', value: { active: 'Activo', completed: 'Finalizado', withdrawn: 'Baja/Abandono', pending: 'Pendiente' }[intern.status as string] || intern.status },
                        { label: 'Horas', value: `${time_stats.total_done} / ${time_stats.target_total}h` },
                        { label: 'Progreso', value: `${Math.round((time_stats.total_done / time_stats.target_total) * 100) || 0}%` },
                    ]}
                    actions={
                        canManage ? (
                            <ConfirmNavigationButton
                                href={`/interns/${intern.id}/edit`}
                                title="Confirmar edición"
                                description={`Vas a editar el perfil de ${intern.user.name}.`}
                                confirmLabel="Ir a editar"
                                className="h-8 rounded-lg bg-white px-4 text-[10px] font-black uppercase tracking-widest text-sidebar shadow-lg hover:bg-white/90 border-none flex items-center"
                            >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Editar Perfil
                            </ConfirmNavigationButton>
                        ) : undefined
                    }
                />
                {/* TABS INTERFACE */}
                {/* PANEL ÚNICO UNIFICADO */}
                <Card className="app-panel w-full overflow-hidden border-2 border-sidebar/15 shadow-2xl">
                    <Tabs defaultValue="resumen" className="w-full">
                        {/* NAVEGACIÓN INTEGRADA EN LA CABECERA DEL PANEL */}
                        <div className="border-b border-sidebar/20 bg-stone-100/50 p-2">
                            <TabsList className="h-auto md:h-12 w-full grid grid-cols-1 md:grid-cols-5 gap-2 bg-transparent p-0">
                                {[
                                    { value: 'resumen', label: 'Resumen', icon: Clock },
                                    { value: 'personal', label: 'Información Personal', icon: User },
                                    { value: 'academico', label: 'Academia y Empresa', icon: GraduationCap },
                                    { value: 'asistencia', label: 'Horarios y Ausencias', icon: CalendarRange },
                                    { value: 'seguimiento', label: 'Seguimiento', icon: HistoryIcon },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="relative h-10 rounded-xl border-none bg-transparent px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 shadow-none transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg w-full"
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{tab.label}</span>
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <CardContent className="p-6">
                            {/* PESTAÑA RESUMEN UNIFICADA */}
                            <TabsContent value="resumen" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-sidebar to-[#1f4f52] shadow-md shadow-sidebar/20 rounded-xl">
                                                <Clock className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Estado de Horas</h3>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-5xl font-black tracking-tight ${time_stats.debt >= 8 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                                                {time_stats.total_done}h
                                            </span>
                                            <span className="text-slate-400 font-medium">/ {time_stats.expected_hours}h esperadas</span>
                                        </div>

                                        <div className="flex items-center gap-4 bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 rounded-2xl shadow-xl shadow-sidebar/10">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${time_stats.debt > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                {time_stats.debt > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {time_stats.debt > 0 ? `Deuda de ${time_stats.debt} horas` : `Adelanto de ${Math.abs(time_stats.debt)} horas`}
                                                </p>
                                                <p className="text-xs text-white/60">Balance comparativo respecto al horario asignado</p>
                                            </div>
                                        </div>

                                        {canViewReports && (
                                            <Button
                                                variant="default"
                                                className="w-full py-6 bg-gradient-to-r from-sidebar to-[#1f4f52] text-white hover:opacity-95 rounded-2xl font-bold transition-all shadow-xl shadow-sidebar/10 border-none"
                                                onClick={() => setIsExportModalOpen(true)}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Generar Informe de Registro
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-sidebar to-[#1f4f52] shadow-md shadow-sidebar/20 rounded-xl">
                                                    <GraduationCap className="h-5 w-5 text-white" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Progreso Total</h3>
                                            </div>
                                            <span className="text-2xl font-black text-sidebar">{Math.round((time_stats.total_done / time_stats.target_total) * 100)}%</span>
                                        </div>

                                        <Progress value={(time_stats.total_done / time_stats.target_total) * 100} className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-sidebar to-[#1f4f52] shadow-xl shadow-sidebar/10 border-none">
                                                <p className="text-[10px] uppercase font-black text-white/60 tracking-widest mb-1">Horas Fichadas</p>
                                                <p className="text-2xl font-bold text-white">{time_stats.worked_hours}h</p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-sidebar to-[#1f4f52] shadow-xl shadow-sidebar/10 border-none">
                                                <p className="text-[10px] uppercase font-black text-white/60 tracking-widest mb-1">Horas Justificadas</p>
                                                <p className="text-2xl font-bold text-white">{time_stats.justified_hours}h</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-sidebar to-[#1f4f52] shadow-xl shadow-sidebar/10 rounded-2xl border-none flex items-center justify-between">
                                            <p className="text-xs font-bold text-white/80">Faltan por completar:</p>
                                            <p className="text-lg font-black text-white">{Number(Math.max(0, time_stats.target_total - time_stats.total_done).toFixed(1))}h</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA PERSONAL UNIFICADA */}
                            <TabsContent value="personal" className="mt-0 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                    <div className="md:col-span-12 items-center mb-4 pb-4 border-b border-slate-50 dark:border-slate-800 flex justify-between">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            Ficha de Expediente
                                        </h3>
                                        <StatusBadge status={intern.status} />
                                    </div>

                                    <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        {[
                                            { label: 'Correo Electrónico', value: intern.user.email, isLink: true, href: `mailto:${intern.user.email}` },
                                            { label: 'Teléfono de Contacto', value: intern.phone || 'No indicado' },
                                            { label: 'Dirección de Residencia', value: intern.address || '—' },
                                            { label: 'Ciudad / Localidad', value: intern.city || '—' },
                                            { label: 'DNI / NIE', value: intern.dni },
                                            { label: 'Fecha de Nacimiento', value: intern.birth_date ? formatDateEs(intern.birth_date) : '—' }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{item.label}</p>
                                                {item.isLink && item.value ? (
                                                    <a href={item.href} className="text-sm font-bold text-primary hover:underline block">{item.value}</a>
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="md:col-span-4 space-y-6">
                                        <div className="filter-panel p-6 rounded-3xl space-y-4">
                                            <h4 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 mb-4">
                                                <HardDrive className="h-3 w-3" /> Documentación Digital
                                            </h4>
                                            {[
                                                { label: 'Copia DNI', url: dni_url },
                                                { label: 'Convenio de Prácticas', url: agreement_url },
                                                { label: 'Seguro de Accidentes', url: insurance_url }
                                            ].map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between group">
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{doc.label}</span>
                                                    {doc.url ? (
                                                        <div className="flex gap-2">
                                                            <a href={doc.url} target="_blank" className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-primary transition-colors shadow-none hover:shadow-sm">
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                            <a href={doc.url} download className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Pendiente</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA ACADEMIA UNIFICADA */}
                            <TabsContent value="academico" className="mt-0 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                    <div className="space-y-8">
                                        <div className="border-b border-slate-50 dark:border-slate-800 pb-4">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5 text-primary" />
                                                Formación y Centro
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Centro Educativo</p>
                                                {intern.education_center?.id ? (
                                                    <Link href={`/centros/${intern.education_center.id}`} className="text-lg font-bold text-primary hover:underline">
                                                        {intern.education_center.name}
                                                    </Link>
                                                ) : <p className="text-lg font-bold">Sin asignar</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Grado o Titulación</p>
                                                <p className="text-base font-bold text-slate-800 dark:text-slate-100">{intern.academic_degree}</p>
                                            </div>

                                            <div className="flex gap-12">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Fecha Inicio</p>
                                                    <p className="text-sm font-bold">{formatDateEs(intern.start_date)}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Fecha Fin Prevista</p>
                                                    <p className="text-sm font-bold">{formatDateEs(intern.end_date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="border-b border-slate-50 dark:border-slate-800 pb-4">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <User className="h-5 w-5 text-emerald-500" />
                                                Tutorización
                                            </h3>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex gap-4 p-5 rounded-2xl filter-panel">
                                                <Avatar className="h-12 w-12 shrink-0 rounded-full">
                                                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/40 font-bold text-indigo-600">
                                                        {intern.center_tutor_name?.substring(0, 1) || 'C'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Tutor del Centro</p>
                                                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{intern.center_tutor_name || 'Sin asignar'}</p>
                                                    <p className="text-xs text-slate-500">{intern.center_tutor_email || 'No email'}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 p-5 rounded-2xl filter-panel">
                                                <Avatar className="h-12 w-12 shrink-0 rounded-full">
                                                    <AvatarImage src={intern.company_tutor?.avatar} alt={intern.company_tutor?.name || ''} />
                                                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/40 font-bold text-emerald-600">
                                                        {intern.company_tutor?.name?.substring(0, 1) || 'E'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Tutor de Empresa</p>
                                                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{intern.company_tutor?.name || 'Sin asignar'}</p>
                                                    <p className="text-xs text-slate-500">{intern.company_tutor?.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA ASISTENCIA UNIFICADA */}
                            <TabsContent value="asistencia" className="mt-0 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                    <div className="md:col-span-5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-primary" />
                                                Horarios Activos
                                            </h3>
                                            {canManage && <CreateScheduleModal userId={intern.user.id} />}
                                        </div>

                                        <div className="space-y-4">
                                            {schedules.length > 0 ? (
                                                schedules.map((schedule: any) => {
                                                    const isActive =
                                                        schedule.start_date <= today &&
                                                        (!schedule.end_date || schedule.end_date >= today);

                                                    return (
                                                        <div key={schedule.id} className="p-6 rounded-2xl filter-panel">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{schedule.name}</h4>
                                                                        {isActive && (
                                                                            <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                                                                                Activo
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Vigencia: {formatDateEs(schedule.start_date)} — {schedule.end_date ? formatDateEs(schedule.end_date) : 'Activo'}</p>
                                                                </div>
                                                                {canManage && (
                                                                    <CreateScheduleModal
                                                                        userId={intern.user.id}
                                                                        schedule={schedule}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-5 gap-2">
                                                                {['L', 'M', 'X', 'J', 'V'].map((d, i) => {
                                                                    const h = [schedule.monday_hours, schedule.tuesday_hours, schedule.wednesday_hours, schedule.thursday_hours, schedule.friday_hours][i];
                                                                    return (
                                                                        <div key={d} className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-sidebar/20 shadow-sm">
                                                                            <span className="text-[10px] font-black text-slate-300 mb-1">{d}</span>
                                                                            <span className="text-sm font-bold text-primary">{h}h</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="text-center py-12 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                                    <CalendarRange className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500 italic">No hay horarios definidos.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-7 space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            Gestión de Ausencias
                                        </h3>

                                        <div className="space-y-4">
                                            {absences?.length > 0 ? (
                                                absences.map((abs: any) => (
                                                    <div key={abs.id} className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-sidebar/20 group hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${abs.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                                    abs.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                                                }`}>
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{abs.reason}</p>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-xs font-medium text-slate-400">{formatDateEs(abs.date)}</span>
                                                                    {abs.justification_url && (
                                                                        <a href={abs.justification_url} target="_blank" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Justificante</a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {abs.status === 'pending' ? (
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => router.patch(`/absences/${abs.id}/status`, { status: 'approved' })}>
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="destructive" className="h-9 rounded-xl" onClick={() => router.patch(`/absences/${abs.id}/status`, { status: 'rejected' })}>
                                                                        <ArrowLeft className="h-4 w-4 rotate-45" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${abs.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                                    }`}>
                                                                    {abs.status === 'approved' ? 'Aprobada' : 'Denegada'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-500 italic text-center py-12">No hay registros de ausencia.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA SEGUIMIENTO UNIFICADA */}
                            <TabsContent value="seguimiento" className="mt-0 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                    {canViewNotes && (
                                        <div className="md:col-span-5 space-y-6">
                                            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    Notas de Seguimiento
                                                </h3>
                                                {canManage && !editingNotes && (
                                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-indigo-600 hover:bg-indigo-50" onClick={() => setEditingNotes(true)}>Editar</Button>
                                                )}
                                            </div>

                                            {editingNotes ? (
                                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                    <textarea
                                                        value={notesValue}
                                                        onChange={(e) => setNotesValue(e.target.value)}
                                                        className="min-h-[200px] w-full rounded-2xl border-slate-200 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                        placeholder="Añade observaciones sobre el desempeño..."
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button size="sm" className="rounded-xl px-6 bg-sidebar text-sidebar-foreground hover:bg-sidebar/90" onClick={() => router.patch(`/interns/${intern.id}/notes`, { internal_notes: notesValue }, { preserveScroll: true, onSuccess: () => setEditingNotes(false) })}>Guardar Cambios</Button>
                                                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setNotesValue(intern.internal_notes || ''); setEditingNotes(false); }}>Cancelar</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6 rounded-2xl filter-panel min-h-[150px]">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                        {intern.internal_notes || 'No se han registrado notas adicionales para este becario.'}
                                                    </p>
                                                    {(intern.notes_updated_by || intern.internal_notes_updated_at) && (
                                                        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                                            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Última edición</span>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={intern.notes_updated_by?.avatar} alt={intern.notes_updated_by?.name || ''} />
                                                                    <AvatarFallback className="text-[10px] bg-slate-100 dark:bg-slate-700">
                                                                        {intern.notes_updated_by?.name?.charAt(0) || 'S'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-[10px] font-bold text-slate-500">{intern.notes_updated_by?.name || 'Sistema'} · {formatDateTimeEs(intern.internal_notes_updated_at)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className={`${canViewNotes ? 'md:col-span-7' : 'md:col-span-12'} space-y-6`}>
                                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                                            <HistoryIcon className="h-5 w-5 text-slate-500" />
                                            Historial de Auditoría
                                        </h3>

                                        <div className="relative pl-8 space-y-1 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                                            {displayedActivities.length > 0 ? (
                                                displayedActivities.map((activity) => {
                                                    const changes = activity.properties?.attributes ?? {};
                                                    const old = activity.properties?.old ?? {};

                                                    // Mapa de traducciones completo
                                                    const labels: Record<string, string> = {
                                                        status: 'Estado',
                                                        progress: 'Progreso',
                                                        internal_notes: 'Notas internas',
                                                        notes: 'Observaciones',
                                                        end_date: 'Fecha de finalización',
                                                        start_date: 'Fecha de inicio',
                                                        total_hours: 'Horas totales',
                                                        hours: 'Horas contrato',
                                                        academic_degree: 'Titulación',
                                                        academic_year: 'Curso académico',
                                                        education_center_id: 'Centro educativo',
                                                        company_tutor_user_id: 'Tutor de empresa',
                                                        center_tutor_name: 'Tutor del centro',
                                                        center_tutor_email: 'Email tutor centro',
                                                        birth_date: 'Fecha de nacimiento',
                                                        dni: 'DNI/NIE',
                                                        phone: 'Teléfono',
                                                        address: 'Dirección',
                                                        city: 'Población',
                                                        abandon_reason: 'Motivo de baja',
                                                        user_id: 'ID de usuario'
                                                    };

                                                    const formatValue = (field: string, value: any) => {
                                                        if (value === null || value === undefined || value === '') return '—';

                                                        // Formatear estados
                                                        if (field === 'status') {
                                                            const statusMap: Record<string, string> = {
                                                                active: 'Activo',
                                                                completed: 'Finalizado',
                                                                withdrawn: 'Baja/Abandono',
                                                                pending: 'Pendiente'
                                                            };
                                                            return statusMap[value] || value;
                                                        }

                                                        // Formatear fechas
                                                        if (field.endsWith('_at') || field.endsWith('_date')) {
                                                            try {
                                                                return formatDateEs(value);
                                                            } catch (e) {
                                                                return value;
                                                            }
                                                        }

                                                        return value;
                                                    };

                                                    return (
                                                        <div key={activity.id} className="relative pb-10 group">
                                                            {/* Línea vertical y Avatar */}
                                                            <div className="absolute -left-10 top-0.5 h-8 w-8 rounded-xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-sm overflow-hidden z-10 group-hover:scale-110 transition-all ring-1 ring-slate-200 dark:ring-slate-700">
                                                                <Avatar className="h-full w-full rounded-none">
                                                                    <AvatarImage src={activity.causer_avatar} alt={activity.causer_name} />
                                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500">
                                                                        {activity.causer_name?.charAt(0) || 'S'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                                                                        {formatDateTimeEs(activity.created_at)}
                                                                    </p>
                                                                    <span className="text-[10px] font-bold text-slate-400 opacity-50">•</span>
                                                                    <span className="text-[10px] font-bold text-sidebar/60 dark:text-white/40 uppercase tracking-tighter">
                                                                        Por {activity.causer_name || 'Sistema'}
                                                                    </span>
                                                                </div>

                                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
                                                                    {activity.event === 'updated' ? (
                                                                        <span className="flex items-center gap-1.5">
                                                                            <Pencil className="h-3 w-3 text-amber-500" />
                                                                            Edición de información
                                                                        </span>
                                                                    ) : activity.event === 'created' ? (
                                                                        <span className="flex items-center gap-1.5">
                                                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                                            Alta de nuevo becario
                                                                        </span>
                                                                    ) : activity.event === 'deleted' ? (
                                                                        <span className="flex items-center gap-1.5">
                                                                            <Trash2 className="h-3 w-3 text-rose-500" />
                                                                            Eliminación de registro
                                                                        </span>
                                                                    ) : activity.event === 'restored' ? (
                                                                        <span className="flex items-center gap-1.5">
                                                                            <RotateCcw className="h-3 w-3 text-blue-500" />
                                                                            Restauración de registro
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1.5 uppercase tracking-tighter text-[10px] opacity-70">
                                                                            {activity.description}
                                                                        </span>
                                                                    )}
                                                                </p>

                                                                {/* Grid de cambios */}
                                                                <div className="mt-3 grid grid-cols-1 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                                                    {Object.keys(changes).map((field) => {
                                                                        if (['updated_at', 'id', 'created_at'].includes(field)) return null;

                                                                        const label = labels[field] || field;
                                                                        const oldValue = formatValue(field, old[field]);
                                                                        const newValue = formatValue(field, changes[field]);

                                                                        // Si es creación, no mostrar el valor antiguo
                                                                        if (activity.event === 'created') {
                                                                            return (
                                                                                <div key={field} className="flex flex-col gap-0.5 border-l-2 border-emerald-500/20 pl-3 py-0.5">
                                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{newValue}</span>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <div key={field} className="flex flex-col gap-0.5 border-l-2 border-amber-500/20 pl-3 py-0.5">
                                                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                                                                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                                                    <span className="line-through opacity-30 text-slate-500">{oldValue}</span>
                                                                                    <span className="text-primary/40 font-bold">→</span>
                                                                                    <span className="font-bold text-sidebar dark:text-emerald-400">{newValue}</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-sm text-slate-400 italic py-4">Aún no hay actividad registrada para este becario.</p>
                                            )}

                                            {totalActivityPages > 1 && (
                                                <div className="flex items-center justify-between border-t border-sidebar/20 pt-8 mt-8">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={activityPage === 1}
                                                        onClick={() => setActivityPage((p) => p - 1)}
                                                        className="h-10 px-4 rounded-xl border-sidebar/30 hover:bg-white"
                                                    >
                                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                                        Anterior
                                                    </Button>

                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        Página {activityPage} de {totalActivityPages}
                                                    </span>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={activityPage === totalActivityPages}
                                                        onClick={() => setActivityPage((p) => p + 1)}
                                                        className="h-10 px-4 rounded-xl border-sidebar/30 hover:bg-white"
                                                    >
                                                        Siguiente
                                                        <ChevronRight className="h-4 w-4 ml-2" />
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
            </div>
        </AppLayout>
    );
}
