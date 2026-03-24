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

const buildMainNavItems = (isIntern: boolean, isAdmin: boolean, isStaff: boolean): NavItem[] => {
    const seguimientoItems: NavItem[] = [
        ...(isIntern
            ? []
            : [
                {
                    title: 'Tareas (Kanban)',
                    href: '/tareas',
                    icon: Kanban,
                },
            ]),
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
        ...(isIntern
            ? [
                {
                    title: 'Mi centro',
                    href: '/mi-centro',
                    icon: Building2,
                },
            ]
        : []),
        ...(isStaff
            ? [
                {
                    title: 'Centros educativos',
                    href: '/centros',
                    icon: Building2,
                },
            ]
            : []),
        ...(isAdmin
            ? [
                {
                    title: 'Usuarios',
                    href: '#',
                    icon: Users,
                    isActive: false,
                    items: [
                        {
                            title: 'Becarios',
                            href: '/becarios',
                            icon: BookOpen,
                        },
                        {
                            title: 'Tutores',
                            href: '/tutores',
                            icon: GraduationCap,
                        },
                        {
                            title: 'Administrador',
                            href: '/administrador',
                            icon: ShieldCheck,
                        },
                    ],
                },
            ]
            : []),
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
        ...(isAdmin
            ? [
                {
                    title: 'Reportes e informes',
                    href: '/reportes',
                    icon: FileText,
                },
            ]
            : []),
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
    const isTutor = auth?.user?.roles?.includes('tutor');
    const isStaff = !!isAdmin || !!isTutor;

    const mainNavItems = buildMainNavItems(!!isIntern, !!isAdmin, !!isStaff);

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