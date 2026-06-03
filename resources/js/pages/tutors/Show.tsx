import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    GraduationCap,
    Mail,
    Search,
    User,
    ClipboardList,
    Info,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    const TASKS_PER_PAGE = 3;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tutores', href: '/tutores' },
        { title: tutor.name, href: `/tutores/${tutor.id}` },
    ];
    const [tasksPage, setTasksPage] = useState(1);
    const tasksTotalPages = Math.max(
        1,
        Math.ceil(created_tasks.length / TASKS_PER_PAGE),
    );
    const visibleTasks = created_tasks.slice(
        (tasksPage - 1) * TASKS_PER_PAGE,
        tasksPage * TASKS_PER_PAGE,
    );

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
                        variant="default"
                        className="rounded-xl border-0 bg-gradient-to-r from-sidebar to-sidebar-accent text-[10px] font-bold tracking-widest text-white uppercase shadow-sm hover:opacity-95"
                        asChild
                    >
                        <Link href="/tutores">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al
                            listado
                        </Link>
                    </Button>
                </div>

                {/* HERO INTEGRADO CON GRADIENTE */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent p-5 shadow-xl md:p-6">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative flex flex-wrap items-center gap-6">
                        <Avatar className="h-20 w-20 shrink-0 rounded-xl border-4 border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                            <AvatarImage
                                src={tutor.avatar || ''}
                                alt={tutor.name || ''}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-2xl font-black text-white">
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
                                <h1 className="text-2xl leading-none font-black tracking-tight text-white md:text-xl">
                                    {tutor.name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="h-7 rounded-lg border-white/10 bg-white/10 px-3 text-[10px] font-black tracking-[0.2em] text-white/80 uppercase backdrop-blur-md"
                                >
                                    Tutor
                                </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-white/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-md">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <a
                                        href={`mailto:${tutor.email}`}
                                        className="text-sm font-bold tracking-tight transition-colors hover:text-white"
                                    >
                                        {tutor.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-md">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">
                                        {tutor.assigned_interns_count} Becarios
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="app-panel w-full overflow-hidden border-2 border-sidebar/15 pt-0 pb-0 shadow-xl">
                    <Tabs defaultValue="interns" className="w-full">
                        <div className="border-b border-sidebar/20 bg-stone-100/50 p-2 dark:bg-[#142235]/85">
                            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:h-10 md:grid-cols-3">
                                {[
                                    {
                                        value: 'interns',
                                        label: 'Becarios Asignados',
                                        icon: Users,
                                    },
                                    {
                                        value: 'tasks',
                                        label: 'Tareas Creadas',
                                        icon: ClipboardList,
                                    },
                                    {
                                        value: 'info',
                                        label: 'Información',
                                        icon: Info,
                                    },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="relative h-10 w-full rounded-xl border-none bg-transparent px-2 text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase shadow-none transition-all dark:text-[#aebecd] dark:hover:bg-[#22374d] dark:hover:text-white data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#2f4a62] dark:data-[state=active]:text-white"
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">
                                                {tab.label}
                                            </span>
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <CardContent className="p-6">
                            <TabsContent
                                value="interns"
                                className="mt-0 animate-in duration-500 outline-none fade-in"
                            >
                                <div className="space-y-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                                Becarios Vinculados
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Mostrando{' '}
                                                {assigned_interns.data.length}{' '}
                                                de {assigned_interns.total}{' '}
                                                becarios
                                            </p>
                                        </div>

                                        <div className="relative max-w-md min-w-[280px] flex-1">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por nombre, DNI o centro..."
                                                className="h-11 rounded-xl border-sidebar/10 bg-slate-50/50 pl-10 dark:bg-[#17283c]/85"
                                                defaultValue={filters.search}
                                                onChange={(e) =>
                                                    handleFilter(
                                                        'search',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-xl border border-sidebar/10 bg-slate-50/70 shadow-sm dark:bg-[#17283c]/75">
                                        <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-400 bg-slate-200 dark:border-[#2f4a62] dark:bg-[#1b2d42]">
                                                    <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-slate-700 uppercase dark:text-[#edf1f5]">
                                                        Nombre
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-slate-700 uppercase dark:text-[#edf1f5]">
                                                        Centro
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-slate-700 uppercase dark:text-[#edf1f5]">
                                                        Estado
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-slate-700 uppercase dark:text-[#edf1f5]">
                                                        Progreso
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-sidebar/5 bg-slate-50/60 dark:bg-[#17283c]/70">
                                                {assigned_interns.data.length >
                                                0 ? (
                                                    assigned_interns.data.map(
                                                        (intern) => (
                                                            <tr
                                                                key={intern.id}
                                                                className="transition-colors hover:bg-white/70 dark:hover:bg-slate-800/60"
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col">
                                                                        <Link
                                                                            href={`/interns/${intern.id}`}
                                                                            className="font-bold text-slate-900 transition-colors hover:text-sidebar dark:text-white"
                                                                        >
                                                                            {intern
                                                                                .user
                                                                                ?.name ||
                                                                                `Becario #${intern.id}`}
                                                                        </Link>
                                                                        <span className="mt-0.5 font-mono text-[10px] tracking-tighter text-slate-400 uppercase">
                                                                            {intern.dni ||
                                                                                'SIN DNI'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {intern
                                                                        .education_center
                                                                        ?.id ? (
                                                                        <Link
                                                                            href={`/centros/${intern.education_center.id}`}
                                                                            className="font-medium text-slate-600 hover:underline dark:text-[#8fa3b6]"
                                                                        >
                                                                            {
                                                                                intern
                                                                                    .education_center
                                                                                    .name
                                                                            }
                                                                        </Link>
                                                                    ) : (
                                                                        '—'
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <StatusBadge
                                                                        status={
                                                                            intern.status
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="w-32 space-y-1.5">
                                                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[#17283c]">
                                                                            <div
                                                                                className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                                                                style={{
                                                                                    width: `${intern.progress || 0}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-[#8fa3b6]">
                                                                            {intern.progress ||
                                                                                0}
                                                                            %
                                                                            Completado
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="px-6 py-8 text-center font-medium text-slate-400 italic"
                                                        >
                                                            No se han encontrado
                                                            becarios asignados.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-between px-2 pt-4">
                                        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                            Página{' '}
                                            {assigned_interns.current_page} de{' '}
                                            {assigned_interns.last_page}
                                        </p>
                                        <Pagination
                                            links={assigned_interns.links}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="tasks"
                                className="mt-0 animate-in duration-500 outline-none fade-in"
                            >
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                            Registro de Tareas
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Últimas actividades y asignaciones
                                            realizadas por el tutor
                                        </p>
                                    </div>

                                    {created_tasks.length > 0 ? (
                                        <div className="space-y-4 rounded-xl border border-sidebar/10 bg-slate-50/70 p-4 dark:bg-[#17283c]/70">
                                            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                    Mostrando{' '}
                                                    {visibleTasks.length} de{' '}
                                                    {created_tasks.length}{' '}
                                                    tareas
                                                </p>
                                                <p className="text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                    Página {tasksPage} de{' '}
                                                    {tasksTotalPages}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {visibleTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="group relative flex items-center justify-between rounded-xl border border-sidebar/15 bg-white p-5 shadow-sm transition-all hover:border-sidebar/30 hover:shadow-md dark:bg-[#142235]/86"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className={`flex h-10 w-12 items-center justify-center rounded-xl border border-sidebar/10 bg-slate-50 shadow-sm ${getTaskStatusTone(task.status)} bg-opacity-10 text-current dark:bg-[#17283c]`}
                                                            >
                                                                <ClipboardList className="h-6 w-6" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Link
                                                                    href={`/tareas/${task.id}`}
                                                                    className="text-base font-bold text-slate-900 hover:text-sidebar dark:text-white"
                                                                >
                                                                    {task.title}
                                                                </Link>
                                                                <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                                    <span>
                                                                        {task
                                                                            .practice_type
                                                                            ?.name ||
                                                                            'Gral'}
                                                                    </span>
                                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                                    <span>
                                                                        {formatDateEs(
                                                                            task.created_at,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <span
                                                                className={`rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${getTaskStatusTone(task.status)}`}
                                                            >
                                                                {getTaskStatusLabel(
                                                                    task.status,
                                                                )}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-500">
                                                                Vence:{' '}
                                                                {formatDateEs(
                                                                    task.due_date,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {tasksTotalPages > 1 && (
                                                <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl border-sidebar/15 bg-white px-4 text-[10px] font-black tracking-widest text-sidebar uppercase hover:bg-slate-100 dark:bg-[#142235]"
                                                        onClick={() =>
                                                            setTasksPage(
                                                                (page) =>
                                                                    Math.max(
                                                                        1,
                                                                        page -
                                                                            1,
                                                                    ),
                                                            )
                                                        }
                                                        disabled={
                                                            tasksPage === 1
                                                        }
                                                    >
                                                        Anterior
                                                    </Button>
                                                    <div className="flex items-center gap-2">
                                                        {Array.from(
                                                            {
                                                                length: tasksTotalPages,
                                                            },
                                                            (_, index) =>
                                                                index + 1,
                                                        ).map((page) => (
                                                            <Button
                                                                key={page}
                                                                type="button"
                                                                size="sm"
                                                                variant={
                                                                    page ===
                                                                    tasksPage
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                className={
                                                                    page ===
                                                                    tasksPage
                                                                        ? 'h-8 rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent px-3 text-[10px] font-black tracking-widest text-white uppercase hover:opacity-95'
                                                                        : 'h-8 rounded-xl border-sidebar/15 bg-white px-3 text-[10px] font-black tracking-widest text-sidebar uppercase hover:bg-slate-100 dark:bg-[#142235]'
                                                                }
                                                                onClick={() =>
                                                                    setTasksPage(
                                                                        page,
                                                                    )
                                                                }
                                                            >
                                                                {page}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl border-sidebar/15 bg-white px-4 text-[10px] font-black tracking-widest text-sidebar uppercase hover:bg-slate-100 dark:bg-[#142235]"
                                                        onClick={() =>
                                                            setTasksPage(
                                                                (page) =>
                                                                    Math.min(
                                                                        tasksTotalPages,
                                                                        page +
                                                                            1,
                                                                    ),
                                                            )
                                                        }
                                                        disabled={
                                                            tasksPage ===
                                                            tasksTotalPages
                                                        }
                                                    >
                                                        Siguiente
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border-2 border-dashed border-sidebar/10 p-12 text-center">
                                            <p className="font-medium text-slate-400 italic">
                                                Este tutor todavía no ha
                                                registrado ninguna tarea.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="info"
                                className="mt-0 animate-in duration-500 outline-none fade-in"
                            >
                                <div className="w-full space-y-8">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                            Información de Perfil
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Datos detallados y estadísticas de
                                            actividad
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {[
                                            {
                                                label: 'Nombre Completo',
                                                value: tutor.name,
                                                icon: User,
                                            },
                                            {
                                                label: 'Correo Electrónico',
                                                value: tutor.email,
                                                icon: Mail,
                                            },
                                            {
                                                label: 'Fecha de Alta',
                                                value: formatDateEs(
                                                    tutor.created_at,
                                                ),
                                                icon: ClipboardList,
                                            },
                                            {
                                                label: 'Becarios bajo supervisión',
                                                value: tutor.assigned_interns_count,
                                                icon: Users,
                                            },
                                            {
                                                label: 'Volumen de Tareas',
                                                value: `${tutor.tasks_created_count} creadas`,
                                                icon: GraduationCap,
                                            },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-4 rounded-xl border border-sidebar/10 bg-white p-4 shadow-sm dark:bg-[#142235]/86"
                                            >
                                                <div className="rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent p-2 text-white shadow shadow-sidebar/20">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                                                    <p className="inline-flex max-w-full rounded-full bg-gradient-to-r from-sidebar to-sidebar-accent px-2.5 py-0.5 text-[9px] font-black tracking-[0.18em] text-white uppercase shadow-sm">
                                                        {item.label}
                                                    </p>
                                                    <p className="text-sm leading-snug font-bold text-slate-800 dark:text-white">
                                                        {item.value}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </AppLayout>
    );
}
