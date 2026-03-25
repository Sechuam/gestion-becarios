import {
    BookOpen,
    Building2,
    ClipboardList,
    Clock,
    FileText,
    GraduationCap,
    Kanban,
    LayoutGrid,
    ListChecks,
    Settings,
    ShieldCheck,
    Star,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { SidebarSection } from '@/components/sidebar/sidebar-types';

export function getAdminSidebar(): SidebarSection[] {
    return [
        {
            label: 'Principal',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
        {
            label: 'Gestión',
            items: [
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
                            title: 'Administradores',
                            href: '/administrador',
                            icon: ShieldCheck,
                        },
                    ],
                },
                {
                    title: 'Centros educativos',
                    href: '/centros',
                    icon: Building2,
                },
            ],
        },
        {
            label: 'Operación',
            items: [
                {
                    title: 'Seguimiento académico',
                    href: '#',
                    icon: ClipboardList,
                    isActive: false,
                    items: [
                        {
                            title: 'Tareas',
                            href: '/tareas',
                            icon: Kanban,
                        },
                        {
                            title: 'Tipos de práctica',
                            href: '/tipos-practica',
                            icon: ListChecks,
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
            ],
        },
        {
            label: 'Configuración',
            items: [
                {
                    title: 'Panel de administración',
                    href: '#',
                    icon: Settings,
                    isActive: false,
                    items: [
                        {
                            title: 'Gestión de usuarios',
                            href: '/usuarios',
                        },
                        {
                            title: 'Roles y permisos',
                            href: '/roles',
                        },
                        {
                            title: 'Configuración global',
                            href: '#',
                        },
                    ],
                },
            ],
        },
        {
            label: 'Análisis',
            items: [
                {
                    title: 'Reportes e informes',
                    href: '/reportes',
                    icon: FileText,
                },
            ],
        },
    ];
}
