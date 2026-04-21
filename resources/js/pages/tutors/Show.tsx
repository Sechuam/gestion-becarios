import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, Mail, MapPin, Hash, Search } from 'lucide-react';
import { StatusBadge } from '@/components/interns/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

            <div className="space-y-6">
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
                        <Avatar className="h-20 w-20 shrink-0 rounded-2xl border-4 border-white/20 shadow-2xl">
                            <AvatarImage src={tutor.avatar || ''} alt={tutor.name || ''} className="object-cover" />
                            <AvatarFallback className="bg-white/10 text-white backdrop-blur-md text-xl font-black">
                                {tutor.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((word) => word.charAt(0))
                                    .join('')
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                                    {tutor.name}
                                </h1>
                                <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-md rounded-lg h-6 text-[10px]">
                                    Tutor
                                </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <a href={`mailto:${tutor.email}`} className="font-bold tracking-tight text-sm hover:text-white transition-colors">
                                        {tutor.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    <span className="font-bold tracking-tight text-sm uppercase">Personal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-1 rounded-[2rem] border-sidebar/10 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-sidebar/10 pb-4">
                            <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Datos Personales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-1">
                            <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Nombre
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {tutor.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Email
                                </span>
                                <a
                                    href={`mailto:${tutor.email}`}
                                    className="text-sm font-medium text-foreground hover:underline"
                                >
                                    {tutor.email}
                                </a>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Fecha de registro
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {formatDateEs(tutor.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Becarios asignados
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {tutor.assigned_interns_count}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Tareas creadas
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {tutor.tasks_created_count}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-2 rounded-[2rem] border-sidebar/10 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-sidebar/10 pb-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Becarios Asignados</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Seguimiento de los becarios vinculados a
                                        este tutor.
                                    </p>
                                </div>

                                <div className="relative max-w-md min-w-[260px] flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, email, DNI o centro..."
                                        className="pl-9"
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
                        </CardHeader>

                        <CardContent className="space-y-4 pt-1">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {assigned_interns.data.length} de{' '}
                                {assigned_interns.total} becarios
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-border/70">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="bg-muted/50">
                                        <tr className="border-b border-border/70">
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                                                Nombre
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                                                DNI
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                                                Centro
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                                                Estado
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                                                Progreso
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assigned_interns.data.length > 0 ? (
                                            assigned_interns.data.map(
                                                (intern) => (
                                                    <tr
                                                        key={intern.id}
                                                        className="border-b border-border/60 last:border-b-0"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <Link
                                                                    href={`/interns/${intern.id}`}
                                                                    className="font-semibold text-foreground hover:underline"
                                                                >
                                                                    {intern.user
                                                                        ?.name ||
                                                                        `Becario #${intern.id}`}
                                                                </Link>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {intern.user
                                                                        ?.email ||
                                                                        '—'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                                                            {intern.dni || '—'}
                                                        </td>
                                                        <td className="px-4 py-4 text-muted-foreground">
                                                            {intern
                                                                .education_center
                                                                ?.id ? (
                                                                <Link
                                                                    href={`/centros/${intern.education_center.id}`}
                                                                    className="hover:text-foreground hover:underline"
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
                                                        <td className="px-4 py-4">
                                                            <StatusBadge
                                                                status={
                                                                    intern.status
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="space-y-1">
                                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                                    <div
                                                                        className="h-full rounded-full bg-emerald-500"
                                                                        style={{
                                                                            width: `${Math.max(
                                                                                0,
                                                                                Math.min(
                                                                                    100,
                                                                                    intern.progress ||
                                                                                        0,
                                                                                ),
                                                                            )}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-medium text-muted-foreground">
                                                                    {intern.progress ||
                                                                        0}
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                                                >
                                                    No hay becarios asignados
                                                    que coincidan con la
                                                    búsqueda actual.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Página {assigned_interns.current_page} de{' '}
                                    {assigned_interns.last_page}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    {assigned_interns.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url ?? '#'}
                                            preserveState
                                            className={`rounded-xl border px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all ${
                                                link.active
                                                    ? 'scale-105 transform border-sidebar bg-sidebar text-sidebar-foreground shadow-md'
                                                    : 'border-border/90 bg-white text-foreground hover:border-sidebar/40 hover:bg-slate-50'
                                            } ${!link.url ? 'pointer-events-none opacity-45' : ''}`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label
                                                    .replace(
                                                        'Previous',
                                                        'Anterior',
                                                    )
                                                    .replace(
                                                        'Next',
                                                        'Siguiente',
                                                    ),
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-[2rem] border-sidebar/10 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-sidebar/10 pb-4">
                        <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Tareas Creadas</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Últimas 10 tareas registradas por este tutor.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-1">
                        {created_tasks.length > 0 ? (
                            <div className="space-y-3">
                                {created_tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-4"
                                    >
                                        <div className="space-y-1">
                                            <Link
                                                href={`/tareas/${task.id}`}
                                                className="font-semibold text-foreground hover:underline"
                                            >
                                                {task.title}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    Tipo:{' '}
                                                    {task.practice_type?.name ||
                                                        '—'}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    Creada el{' '}
                                                    {formatDateEs(
                                                        task.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getTaskStatusTone(
                                                    task.status,
                                                )}`}
                                            >
                                                {getTaskStatusLabel(
                                                    task.status,
                                                )}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                Entrega:{' '}
                                                {formatDateEs(task.due_date)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Este tutor todavía no ha creado tareas.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
