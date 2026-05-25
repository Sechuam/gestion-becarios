import {
    Building2,
    ClipboardList,
    Clock,
    FileText,
    LayoutGrid,
} from 'lucide-react';
import type { SidebarSection } from '@/components/sidebar/sidebar-types';
import { dashboard } from '@/routes';

export function getInternSidebar(): SidebarSection[] {
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
                    title: 'Mi centro',
                    href: '/mi-centro',
                    icon: Building2,
                },
                {
                    title: 'Seguimiento académico',
                    href: '#',
                    icon: ClipboardList,
                    isActive: false,
                    items: [
                        {
                            title: 'Mis tareas',
                            href: '/tareas/mis',
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
                    title: 'Reportes e informes',
                    href: '/reportes',
                    icon: FileText,
                },
            ],
        },
    ];
}
