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
    UserCircle,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { SidebarSection } from '@/components/sidebar/sidebar-types';

interface BuildSidebarOptions {
    roles: string[];
    permissions: string[];
}

export function buildDynamicSidebar({ roles, permissions }: BuildSidebarOptions): SidebarSection[] {
    const has = (perm: string) => permissions.includes(perm);
    const isAdmin = roles.includes('admin');
    const isTutor = roles.includes('tutor');
    const isIntern = roles.includes('intern') || roles.includes('becario');

    const sections: SidebarSection[] = [];

    // ─── SECCIÓN PRINCIPAL (siempre visible) ───────────────────────────────────
    sections.push({
        label: 'Principal',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    });

    // ─── SECCIÓN MI ÁREA (solo becarios que no son admin/tutor) ────────────────
    if (isIntern && !isAdmin && !isTutor) {
        const myAreaItems: any[] = [
            { title: 'Mi centro', href: '/mi-centro' },
        ];

        sections[0].items.push({
            title: 'Mi área',
            href: '#',
            icon: UserCircle,
            isActive: false,
            items: myAreaItems,
        });
    }

    // ─── SECCIÓN GESTIÓN ───────────────────────────────────────────────────────
    const gestionItems: any[] = [];

    // Centros educativos (staff con manage schools o admin o tutor)
    if (isAdmin || isTutor || has('manage schools')) {
        gestionItems.push({
            title: 'Centros educativos',
            href: '/centros',
            icon: Building2,
        });
    }

    // Submenu de usuarios: Becarios, Tutores, Administradores
    const usuariosSubItems: any[] = [];

    if (isAdmin || has('manage interns')) {
        usuariosSubItems.push({
            title: 'Becarios',
            href: '/becarios',
            icon: BookOpen,
        });
    }

    if (isTutor && !isAdmin) {
        usuariosSubItems.push({
            title: 'Mis becarios',
            href: '/mis-becarios',
            icon: BookOpen,
        });
    }

    if (isAdmin || has('manage tutors')) {
        usuariosSubItems.push({
            title: 'Tutores',
            href: '/tutores',
            icon: GraduationCap,
        });
    }

    if (isAdmin) {
        usuariosSubItems.push({
            title: 'Administradores',
            href: '/administrador',
            icon: ShieldCheck,
        });
    }

    if (usuariosSubItems.length > 0) {
        gestionItems.push({
            title: 'Usuarios',
            href: '#',
            icon: Users,
            isActive: false,
            items: usuariosSubItems,
        });
    }

    if (gestionItems.length > 0) {
        sections.push({ label: 'Gestión', items: gestionItems });
    }

    // ─── SECCIÓN OPERACIÓN ─────────────────────────────────────────────────────
    const operacionItems: any[] = [];

    // Seguimiento académico
    const seguimientoSubItems: any[] = [];

    // Tareas: todos, pero el link cambia según sea intern o staff
    if (isAdmin || isTutor || has('manage tasks')) {
        seguimientoSubItems.push({
            title: 'Tareas',
            href: '/tareas',
            icon: Kanban,
        });
    } else if (isIntern) {
        seguimientoSubItems.push({
            title: 'Mis tareas',
            href: '/tareas/mis',
            icon: Kanban,
        });
    }

    // Tipos de práctica (solo admin)
    if (isAdmin) {
        seguimientoSubItems.push({
            title: 'Tipos de práctica',
            href: '/tipos-practica',
            icon: ListChecks,
        });
    }

    // Evaluaciones (todos excepto becario puro sin permisos extra)
    if (isAdmin || isTutor || has('manage interns')) {
        seguimientoSubItems.push({
            title: 'Evaluaciones',
            href: '/evaluaciones',
            icon: Star,
        });
    } else if (isIntern) {
        seguimientoSubItems.push({
            title: 'Evaluaciones',
            href: '/evaluaciones',
            icon: Star,
        });
    }

    if (seguimientoSubItems.length > 0) {
        operacionItems.push({
            title: 'Seguimiento académico',
            href: '#',
            icon: ClipboardList,
            isActive: false,
            items: seguimientoSubItems,
        });
    }

    // Control horario (todos los usuarios)
    operacionItems.push({
        title: 'Control horario',
        href: '/asistencia',
        icon: Clock,
    });

    if (operacionItems.length > 0) {
        sections.push({ label: 'Operación', items: operacionItems });
    }

    // ─── SECCIÓN CONFIGURACIÓN ─────────────────────────────────────────────────
    const configSubItems: any[] = [];

    if (isAdmin || has('manage users')) {
        configSubItems.push({ title: 'Gestión de usuarios', href: '/usuarios' });
    }

    if (isAdmin || has('manage users')) {
        configSubItems.push({ title: 'Roles y permisos', href: '/roles' });
    }

    if (configSubItems.length > 0) {
        sections.push({
            label: 'Configuración',
            items: [
                {
                    title: 'Panel de administración',
                    href: '#',
                    icon: Settings,
                    isActive: false,
                    items: configSubItems,
                },
            ],
        });
    }

    // ─── SECCIÓN ANÁLISIS ──────────────────────────────────────────────────────
    if (isAdmin || has('view reports')) {
        sections.push({
            label: 'Análisis',
            items: [
                {
                    title: 'Reportes e informes',
                    href: '/reportes',
                    icon: FileText,
                },
            ],
        });
    }

    return sections;
}
