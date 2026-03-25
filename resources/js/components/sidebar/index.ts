import type { SidebarSection } from '@/components/sidebar/sidebar-types';
import { getAdminSidebar } from '@/components/sidebar/sidebar-admin';
import { getInternSidebar } from '@/components/sidebar/sidebar-intern';
import { getTutorSidebar } from '@/components/sidebar/sidebar-tutor';

export type SidebarRole = 'admin' | 'tutor' | 'intern';

export function getSidebarByRole(role: SidebarRole): SidebarSection[] {
    if (role === 'admin') {
        return getAdminSidebar();
    }
    if (role === 'tutor') {
        return getTutorSidebar();
    }
    return getInternSidebar();
}
