import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    ClipboardCheck,
    GraduationCap,
    ListChecks,
    Settings2,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/usuarios' },
    { title: 'Administrador', href: '/administrador' },
];

const managementLinks = [
    {
        title: 'Usuarios y accesos',
        description: 'Gestiona invitaciones, perfiles y roles operativos.',
        href: '/usuarios',
        icon: Users,
    },
    {
        title: 'Roles y permisos',
        description: 'Revisa capacidades por rol y permisos sensibles.',
        href: '/roles',
        icon: ShieldCheck,
    },
    {
        title: 'Centros educativos',
        description: 'Mantén sedes, contactos y datos académicos al día.',
        href: '/centros',
        icon: Building2,
    },
    {
        title: 'Tipos de práctica',
        description: 'Ordena categorías, prioridades y estados activos.',
        href: '/tipos-practica',
        icon: GraduationCap,
    },
    {
        title: 'Criterios de evaluación',
        description: 'Configura pesos, rúbricas y criterios de seguimiento.',
        href: '/evaluaciones/criterios',
        icon: ClipboardCheck,
    },
    {
        title: 'Reportes e informes',
        description: 'Genera lecturas exportables sobre la actividad.',
        href: '/reportes',
        icon: BarChart3,
    },
];

const operatingChecks = [
    'Revisar usuarios pendientes de rol o acceso.',
    'Comprobar centros sin tutor o datos incompletos.',
    'Validar criterios y tipos de práctica antes de abrir evaluaciones.',
    'Usar reportes para detectar carga desigual o tareas atrasadas.',
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de administración" />

            <div className="flex flex-col gap-3">
                <ModuleHeader
                    title="Panel de administración"
                    description="Centro de control para configurar accesos, catálogo académico y herramientas de supervisión del sistema."
                    icon={<Settings2 className="h-6 w-6" />}
                />

                <div className="grid gap-3 xl:grid-cols-[1fr_22rem]">
                    <Card className="pt-0 pb-0">
                        <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
                        <CardHeader className="border-b border-slate-400 bg-slate-200 py-3 dark:border-slate-800 dark:bg-slate-800/70">
                            <CardTitle className="text-slate-800 dark:text-slate-100">
                                Accesos de gestión
                            </CardTitle>
                            <CardDescription>
                                Atajos a los módulos que suelen requerir
                                mantenimiento administrativo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 py-5 md:grid-cols-2">
                            {managementLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group flex min-h-28 items-start gap-3 rounded-xl border border-sidebar/10 bg-white p-4 shadow-sm transition-all hover:border-sidebar/25 hover:bg-slate-50 hover:shadow-md dark:bg-slate-900/60 dark:hover:bg-slate-800/80"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar text-white shadow-sm transition-transform group-hover:scale-105">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-black tracking-tight text-slate-900 dark:text-white">
                                                {item.title}
                                            </span>
                                            <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                                                {item.description}
                                            </span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Card className="pt-0 pb-0">
                        <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
                        <CardHeader className="border-b border-slate-400 bg-slate-200 py-3 dark:border-slate-800 dark:bg-slate-800/70">
                            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <ListChecks className="h-4 w-4" />
                                Revisión rápida
                            </CardTitle>
                            <CardDescription>
                                Puntos útiles antes de cerrar una sesión de
                                administración.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 py-5">
                            {operatingChecks.map((check, index) => (
                                <div
                                    key={check}
                                    className="flex gap-3 rounded-xl border border-sidebar/10 bg-white p-3 shadow-sm dark:bg-slate-900/60"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200 text-[10px] font-black text-slate-800 dark:bg-slate-700 dark:text-white">
                                        {index + 1}
                                    </span>
                                    <p className="text-xs leading-snug font-medium text-slate-600 dark:text-slate-300">
                                        {check}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
