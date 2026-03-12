import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, GraduationCap, LayoutGrid, ShieldCheck, Users, Building2, Clock, ClipboardList, Kanban, Star, FileText } from 'lucide-react';
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },

    {
        title: 'Centros educativos',
        href: '/schools',
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

            // Nueva sección para tutores

            {
                title: 'Tutores',
                href: '/tutores', // ruta que hemos creado en web.php
                icon: GraduationCap,
            },

            // Nueva sección para administradores

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
        items: [
            {
                title: 'Tareas (Kanban)',
                href: '/tareas',
                icon: Kanban,
            },
            {
                title: 'Evaluaciones',
                href: '/evaluaciones',
                icon: Star,
            },
        ],
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
    }
];


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
