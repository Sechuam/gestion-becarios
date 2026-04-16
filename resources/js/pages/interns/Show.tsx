import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ArrowLeft, CalendarRange, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, FileText, GraduationCap, HardDrive, History as HistoryIcon, User } from 'lucide-react';
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
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesValue, setNotesValue] = useState(intern.internal_notes || '');
    const [activityPage, setActivityPage] = useState(1);
    const activitiesPerPage = 5;
    const totalActivityPages = Math.ceil(activities.length / activitiesPerPage);
    const displayedActivities = activities.slice(
        (activityPage - 1) * activitiesPerPage,
        activityPage * activitiesPerPage,
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
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl"
                        asChild
                    >
                        <Link href="/becarios">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
                        </Link>
                    </Button>
                    <ConfirmNavigationButton
                        href={`/interns/${intern.id}/edit`}
                        title="Confirmar edición"
                        description={`Vas a editar el perfil de ${intern.user.name}.`}
                        confirmLabel="Ir a editar"
                        className="bg-primary text-white hover:opacity-90 rounded-xl px-6"
                    >
                        Editar perfil
                    </ConfirmNavigationButton>
                </div>

                {/* HERO */}
                <div className="flex items-center gap-6 pb-2">
                    <Avatar className="h-20 w-20 shrink-0 rounded-3xl border border-sidebar shadow-sm">
                        <AvatarImage src={intern.user.avatar} alt={intern.user.name} className="object-cover" />
                        <AvatarFallback className="bg-white dark:bg-slate-900 text-primary">
                            <User className="h-10 w-10" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {intern.user.name}
                            </h1>
                            <StatusBadge status={intern.status} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Becario · {intern.academic_degree}
                        </p>
                    </div>
                </div>
                {/* TABS INTERFACE */}
                {/* PANEL ÚNICO UNIFICADO */}
                <Card className="app-panel rounded-3xl overflow-hidden">
                    <Tabs defaultValue="resumen" className="w-full">
                        {/* NAVEGACIÓN INTEGRADA EN LA CABECERA DEL PANEL */}
                        <div className="bg-slate-50/30 dark:bg-slate-800/20 border-b border-sidebar/20 px-6 pt-4">
                            <TabsList className="flex bg-transparent h-auto p-0 gap-8 justify-start">
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
                                        className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 text-sm font-semibold text-slate-500 transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary dark:text-slate-400 dark:data-[state=active]:text-primary"
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4" />
                                            {tab.label}
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <CardContent className="p-8">
                            {/* PESTAÑA RESUMEN UNIFICADA */}
                            <TabsContent value="resumen" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                {time_stats.is_non_compliant && (
                                    <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400 rounded-2xl">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle className="font-bold text-sm">Incumplimiento de Horario</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            Se ha detectado una deuda acumulada de <strong>{time_stats.debt} horas</strong>.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-accent rounded-xl">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Estado de Horas</h3>
                                        </div>
                                        
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-5xl font-black tracking-tight ${time_stats.debt >= 8 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                                                {time_stats.total_done}h
                                            </span>
                                            <span className="text-slate-400 font-medium">/ {time_stats.expected_hours}h esperadas</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 filter-panel p-4 rounded-2xl">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${time_stats.debt > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {time_stats.debt > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    {time_stats.debt > 0 ? `Deuda de ${time_stats.debt} horas` : `Adelanto de ${Math.abs(time_stats.debt)} horas`}
                                                </p>
                                                <p className="text-xs text-slate-500">Balance comparativo respecto al horario asignado</p>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full py-6 text-primary border-primary/20 hover:bg-accent rounded-2xl font-bold transition-all"
                                            onClick={() => setIsExportModalOpen(true)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Generar Informe de Registro
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                                    <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Progreso Total</h3>
                                            </div>
                                            <span className="text-2xl font-black text-emerald-600">{Math.round((time_stats.total_done / time_stats.target_total) * 100)}%</span>
                                        </div>

                                        <Progress value={(time_stats.total_done / time_stats.target_total) * 100} className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 rounded-2xl border border-sidebar/30 bg-white dark:bg-slate-900 shadow-sm">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Horas Fichadas</p>
                                                <p className="text-2xl font-bold">{time_stats.worked_hours}h</p>
                                            </div>
                                            <div className="p-5 rounded-2xl border border-sidebar/30 bg-white dark:bg-slate-900 shadow-sm">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Horas Justificadas</p>
                                                <p className="text-2xl font-bold text-primary">{time_stats.justified_hours}h</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-sidebar/20 rounded-2xl flex items-center justify-between">
                                            <p className="text-xs font-bold text-amber-800 dark:text-amber-200">Faltan por completar:</p>
                                            <p className="text-lg font-black text-amber-700 dark:text-amber-400">{Math.max(0, time_stats.target_total - time_stats.total_done)}h</p>
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
                                            {intern.user?.schedules?.length > 0 ? (
                                                intern.user.schedules.map((schedule: any) => (
                                                    <div key={schedule.id} className="p-6 rounded-2xl filter-panel">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{schedule.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Vigencia: {formatDateEs(schedule.start_date)} — {schedule.end_date ? formatDateEs(schedule.end_date) : 'Activo'}</p>
                                                            </div>
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
                                                ))
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
                                                            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${
                                                                abs.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
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
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                                    abs.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
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
                                                    <Button size="sm" className="rounded-xl px-6 bg-slate-900" onClick={() => router.patch(`/interns/${intern.id}/notes`, { internal_notes: notesValue }, { preserveScroll: true, onSuccess: () => setEditingNotes(false) })}>Guardar Cambios</Button>
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

                                    <div className="md:col-span-7 space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                                            <HistoryIcon className="h-5 w-5 text-slate-500" />
                                            Historial de Auditoría
                                        </h3>
                                        
                                        <div className="relative pl-8 space-y-1 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                                            {displayedActivities.length > 0 ? (
                                                displayedActivities.map((activity) => {
                                                    const changes = activity.properties?.attributes ?? {};
                                                    const old = activity.properties?.old ?? {};
                                                    const labels: Record<string, string> = {
                                                        status: 'Estado', progress: 'Progreso', internal_notes: 'Notas', end_date: 'Fecha fin', total_hours: 'Horas'
                                                    };
                                                    const formatValue = (field: string, value: any) => {
                                                        if (value === null || value === '') return '—';
                                                        if (field === 'status') return value === 'active' ? 'Activo' : value === 'completed' ? 'Finalizado' : 'Abandonado';
                                                        return value;
                                                    };

                                                    return (
                                                        <div key={activity.id} className="relative pb-8 group">
                                                            <div className="absolute -left-10 top-0.5 h-8 w-8 rounded-xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-sm overflow-hidden z-10 group-hover:scale-110 transition-transform">
                                                                <Avatar className="h-full w-full rounded-none">
                                                                    <AvatarImage src={activity.causer_avatar} alt={activity.causer_name} />
                                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">
                                                                        {activity.causer_name?.charAt(0) || 'S'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDateTimeEs(activity.created_at)}</p>
                                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                                                                    {activity.event === 'updated' ? 'Actualización de perfil' : 'Creación de registro'}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                                                                    {Object.keys(changes).map((field) => (
                                                                        field !== 'updated_at' && (
                                                                            <div key={field} className="text-xs">
                                                                                <span className="text-slate-500 font-medium">{labels[field] || field}:</span>
                                                                                <span className="ml-1.5 line-through opacity-40 italic">{formatValue(field, old[field])}</span>
                                                                                <span className="mx-1 text-primary/40">→</span>
                                                                                <span className="font-bold text-primary">{formatValue(field, changes[field])}</span>
                                                                            </div>
                                                                        )
                                                                    ))}
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
