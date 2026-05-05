import {
    Building2,
    ClipboardList,
    Clock,
    LayoutGrid,
    UserCircle,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { SidebarSection } from '@/components/sidebar/sidebar-types';

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
            ],
        },
    ];
}
