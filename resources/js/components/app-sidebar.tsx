import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, GraduationCap, LayoutGrid, ShieldCheck, Users, Building2, Clock, ClipboardList, Kanban, Star, FileText, ListChecks } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem as BaseNavItem } from '@/types';

interface NavItem extends BaseNavItem {
    items?: NavItem[];
}

const buildMainNavItems = (isIntern: boolean, isAdmin: boolean): NavItem[] => {
    const seguimientoItems: NavItem[] = [
        {
            title: 'Tareas (Kanban)',
            href: '/tareas',
            icon: Kanban,
        },
        ...(isIntern
            ? [
                {
                    title: 'Mis tareas',
                    href: '/tareas/mis',
                    icon: ClipboardList,
                },
            ]
            : []),
        ...(isAdmin
            ? [
                {
                    title: 'Tipos de práctica',
                    href: '/tipos-practica',
                    icon: ListChecks,
                },
            ]
            : []),
        {
            title: 'Evaluaciones',
            href: '/evaluaciones',
            icon: Star,
        },
    ];

    return [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Centros educativos',
            href: '/centros',
            icon: Building2,
        },
        {
            title: 'Usuarios',
            href: '#',
            icon: Users,
            isActive: false, // Esto lo mantiene abierto por defecto
            items: [
                {
                    title: 'Becarios',
                    href: '/becarios', // ruta que hemos creado en web.php
                    icon: BookOpen,
                },
                {
                    title: 'Tutores',
                    href: '/tutores', // ruta que hemos creado en web.php
                    icon: GraduationCap,
                },
                {
                    title: 'Administrador',
                    href: '/administrador', // ruta que hemos creado en web.php
                    icon: ShieldCheck,
                },
            ],
        },
        {
            title: 'Seguimiento académico',
            href: '#',
            icon: ClipboardList,
            isActive: false,
            items: seguimientoItems,
        },
        {
            title: 'Control horario',
            href: '/asistencia',
            icon: Clock,
        },
        {
            title: 'Reportes e informes',
            href: '/reportes',
            icon: FileText,
        },
    ];
};


const footerNavItems: NavItem[] = [
    {
        title: 'Ayuda / Guía',
        href: '#',
        icon: FolderGit2,
    },
    {
        title: 'Soporte / Contacto',
        href: '#',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const isIntern = auth?.user?.roles?.includes('intern');
    const isAdmin = auth?.user?.roles?.includes('admin');
    const mainNavItems = buildMainNavItems(!!isIntern, !!isAdmin);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
