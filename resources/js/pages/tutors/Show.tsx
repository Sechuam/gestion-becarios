import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, Mail, MapPin, Hash, Search, User, ClipboardList, Info, Users } from 'lucide-react';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs } from '@/lib/date-format';
import { getTaskStatusLabel, getTaskStatusTone } from '@/lib/task-labels';
import type { BreadcrumbItem } from '@/types/navigation';

type Tutor = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    created_at?: string | null;
    assigned_interns_count: number;
    tasks_created_count: number;
};

type AssignedIntern = {
    id: number;
    dni?: string | null;
    status: string;
    progress: number;
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
    education_center?: {
        id: number;
        name: string;
    } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

type CreatedTask = {
    id: number;
    title: string;
    status?: string | null;
    due_date?: string | null;
    created_at?: string | null;
    practice_type?: {
        id: number;
        name: string;
    } | null;
};

type Props = {
    tutor: Tutor;
    assigned_interns: Paginated<AssignedIntern>;
    created_tasks: CreatedTask[];
    filters?: {
        search?: string;
    };
};

export default function Show({
    tutor,
    assigned_interns,
    created_tasks,
    filters = {},
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tutores', href: '/tutores' },
        { title: tutor.name, href: `/tutores/${tutor.id}` },
    ];

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };

        if (!value) {
            delete newFilters[key as keyof typeof newFilters];
        }

        router.get(`/tutores/${tutor.id}`, newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tutor: ${tutor.name}`} />

            <div className="page-surface space-y-6">
                <div className="flex items-center justify-between px-2">
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                        asChild
                    >
                        <Link href="/tutores">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
                        </Link>
                    </Button>
                </div>

                {/* HERO INTEGRADO CON GRADIENTE */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 shadow-2xl md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative flex flex-wrap items-center gap-8">
                        <Avatar className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
                            <AvatarImage src={tutor.avatar || ''} alt={tutor.name || ''} className="object-cover" />
                            <AvatarFallback className="text-white text-2xl font-black">
                                {tutor.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((word) => word.charAt(0))
                                    .join('')
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                                    {tutor.name}
                                </h1>
                                <Badge variant="outline" className="bg-white/10 text-white/80 border-white/10 backdrop-blur-md rounded-lg h-7 text-[10px] uppercase font-black tracking-[0.2em] px-3">
                                    Tutor
                                </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-white/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-md">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <a href={`mailto:${tutor.email}`} className="font-bold tracking-tight text-sm hover:text-white transition-colors">
                                        {tutor.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-md">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold tracking-tight text-sm">
                                        {tutor.assigned_interns_count} Becarios
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="app-panel rounded-[2rem] border-sidebar/20 bg-white shadow-xl dark:bg-slate-900/40 p-1 md:p-8">
                    <Tabs defaultValue="interns" className="w-full">
                        <TabsList className="flex h-auto w-full justify-start gap-8 bg-transparent p-0 border-b border-sidebar/10 rounded-none mb-8 px-2 overflow-x-auto scrollbar-none">
                            {[
                                { value: 'interns', label: 'Becarios Asignados', icon: Users },
                                { value: 'tasks', label: 'Tareas Creadas', icon: ClipboardList },
                                { value: 'info', label: 'Información', icon: Info }
                            ].map(tab => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 text-sm font-bold text-slate-400 transition-all data-[state=active]:border-sidebar data-[state=active]:bg-transparent data-[state=active]:text-sidebar dark:data-[state=active]:text-white shadow-none group"
                                >
                                    <div className="flex items-center gap-2">
                                        <tab.icon className="h-4 w-4 transition-transform group-data-[state=active]:scale-110" />
                                        {tab.label}
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="interns" className="mt-0 outline-none animate-in fade-in duration-500">
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Becarios Vinculados</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Mostrando {assigned_interns.data.length} de {assigned_interns.total} becarios
                                        </p>
                                    </div>

                                    <div className="relative max-w-md min-w-[280px] flex-1">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre, DNI o centro..."
                                            className="pl-10 h-11 border-sidebar/10 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl"
                                            defaultValue={filters.search}
                                            onChange={(e) => handleFilter('search', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-sidebar/10 shadow-sm bg-white dark:bg-slate-900/50">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-sidebar/10">
                                                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-slate-500">Nombre</th>
                                                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-slate-500">Centro</th>
                                                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-slate-500">Estado</th>
                                                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-slate-500">Progreso</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-sidebar/5">
                                            {assigned_interns.data.length > 0 ? (
                                                assigned_interns.data.map((intern) => (
                                                    <tr key={intern.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <Link href={`/interns/${intern.id}`} className="font-bold text-slate-900 dark:text-white hover:text-sidebar transition-colors">
                                                                    {intern.user?.name || `Becario #${intern.id}`}
                                                                </Link>
                                                                <span className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">
                                                                    {intern.dni || 'SIN DNI'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {intern.education_center?.id ? (
                                                                <Link href={`/centros/${intern.education_center.id}`} className="text-slate-600 dark:text-slate-400 hover:underline font-medium">
                                                                    {intern.education_center.name}
                                                                </Link>
                                                            ) : '—'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge status={intern.status} />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="w-32 space-y-1.5">
                                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                                    <div 
                                                                        className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                                                                        style={{ width: `${intern.progress || 0}%` }} 
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    {intern.progress || 0}% Completado
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                                                        No se han encontrado becarios asignados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between px-2 pt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Página {assigned_interns.current_page} de {assigned_interns.last_page}
                                    </p>
                                    <div className="flex gap-2">
                                        {assigned_interns.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url ?? '#'}
                                                preserveState
                                                className={`rounded-xl border px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                                                    link.active
                                                        ? 'bg-sidebar text-white border-sidebar shadow-lg shadow-sidebar/20'
                                                        : 'bg-white dark:bg-slate-800 border-sidebar/10 text-slate-600 hover:border-sidebar/40'
                                                } ${!link.url ? 'opacity-30 pointer-events-none' : ''}`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label.replace('Previous', 'Anterior').replace('Next', 'Siguiente')
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tasks" className="mt-0 outline-none animate-in fade-in duration-500">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Registro de Tareas</h3>
                                    <p className="text-sm text-muted-foreground">Últimas actividades y asignaciones realizadas por el tutor</p>
                                </div>

                                {created_tasks.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {created_tasks.map((task) => (
                                            <div key={task.id} className="group relative flex items-center justify-between rounded-[1.5rem] border border-sidebar/10 bg-white dark:bg-slate-900/50 p-5 hover:border-sidebar/30 transition-all hover:shadow-md">
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getTaskStatusTone(task.status)} bg-opacity-10 text-current`}>
                                                        <ClipboardList className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Link href={`/tareas/${task.id}`} className="text-base font-bold text-slate-900 dark:text-white hover:text-sidebar">
                                                            {task.title}
                                                        </Link>
                                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            <span>{task.practice_type?.name || 'Gral'}</span>
                                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                            <span>{formatDateEs(task.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${getTaskStatusTone(task.status)}`}>
                                                        {getTaskStatusLabel(task.status)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500">
                                                        Vence: {formatDateEs(task.due_date)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-[2rem] border-2 border-dashed border-sidebar/10 p-12 text-center">
                                        <p className="text-slate-400 font-medium italic">Este tutor todavía no ha registrado ninguna tarea.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="info" className="mt-0 outline-none animate-in fade-in duration-500">
                            <div className="max-w-2xl space-y-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Información de Perfil</h3>
                                    <p className="text-sm text-muted-foreground">Datos detallados y estadísticas de actividad</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: 'Nombre Completo', value: tutor.name, icon: User },
                                        { label: 'Correo Electrónico', value: tutor.email, icon: Mail },
                                        { label: 'Fecha de Alta', value: formatDateEs(tutor.created_at), icon: ClipboardList },
                                        { label: 'Becarios bajo supervisión', value: tutor.assigned_interns_count, icon: Users },
                                        { label: 'Volumen de Tareas', value: `${tutor.tasks_created_count} creadas`, icon: GraduationCap }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-sidebar/5 bg-slate-50/50 dark:bg-slate-800/30">
                                            <div className="rounded-xl bg-white dark:bg-slate-800 p-2 shadow-sm text-sidebar">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}

    );
}
