import type { RoleOption } from '@/types';

export const roleLabel = (
    role?: RoleOption | string,
    displayName?: string | null
) => {
    if (!role) return '—';

    if (typeof role === 'object') {
        return (
            role.display_name ||
            formatRoleName(role.name)
        );
    }

    return displayName || formatRoleName(role);
};

export const permissionLabel = (permission: string) =>
    ({
        'manage interns': 'Gestionar becarios',
        'manage schools': 'Gestionar centros',
    })[permission] || permission;

function formatRoleName(role: string) {
    return (
        ({
            admin: 'Administrador',
            tutor: 'Tutor',
            intern: 'Becario',
        })[String(role).toLowerCase()] ||
        String(role)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
    );
}
