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
    const isIntern = auth?.user?.roles?.includes('intern');
    const isAdmin = auth?.user?.roles?.includes('admin');
    const isTutor = auth?.user?.roles?.includes('tutor');
    const role = isAdmin ? 'admin' : isTutor ? 'tutor' : 'intern';
    const sidebarSections = getSidebarByRole(role);

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
                <NavMain sections={sidebarSections} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
