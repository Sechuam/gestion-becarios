import type { NavItem } from '@/types';

export type SidebarItem = NavItem & {
    items?: SidebarItem[];
};

export type SidebarSection = {
    label?: string;
    items: SidebarItem[];
};
