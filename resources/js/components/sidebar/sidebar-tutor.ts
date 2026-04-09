import {
    BookOpen,
    Building2,
    ClipboardList,
    Clock,
    FileText,
    Kanban,
    LayoutGrid,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { SidebarSection } from '@/components/sidebar/sidebar-types';

export function getTutorSidebar(): SidebarSection[] {
    return [
        {
            label: 'Principal',
            items: [
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
                    isActive: false,
                    items: [
                        {
                            title: 'Mis becarios',
                            href: '/mis-becarios',
                            icon: BookOpen,
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
                        },
                    ],
                },
                {
                    title: 'Control horario',
                    href: '/asistencia',
                    icon: Clock,
                },
                {
                    title: 'Reportes',
                    href: '/reportes',
                    icon: FileText,
                },
            ],
        },
    ];
}
