import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { getSidebarByRole } from '@/components/sidebar';
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
    const isIntern =
        auth?.user?.roles?.includes('intern') ||
        auth?.user?.roles?.includes('becario');
    const isAdmin = auth?.user?.roles?.includes('admin');
    const isTutor = auth?.user?.roles?.includes('tutor');
    const role = isAdmin ? 'admin' : isTutor ? 'tutor' : 'intern';
    const sidebarSections = getSidebarByRole(role);

    return (
        <Sidebar collapsible="icon" variant="inset" className="group-data-[variant=inset]:p-3">
            <SidebarHeader className="border-b border-sidebar-border/80 px-2 pb-4 pt-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-2xl bg-white/8 p-1.5 hover:bg-white/12">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-1 py-4">
                <NavMain sections={sidebarSections} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/80 px-2 pt-4">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
