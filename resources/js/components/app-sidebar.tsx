import { Link, usePage } from '@inertiajs/react';
import { BookOpen, LifeBuoy } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { buildDynamicSidebar } from '@/components/sidebar/sidebar-dynamic';
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
        title: 'Guía de uso',
        href: '/dashboard',
        icon: BookOpen,
    },
    {
        title: 'Soporte',
        href: 'mailto:soporte@becagest.local',
        icon: LifeBuoy,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const roles: string[] = auth?.user?.roles ?? [];
    const permissions: string[] = auth?.user?.permissions ?? [];

    const sidebarSections = buildDynamicSidebar({ roles, permissions });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/80 pt-2 pb-4 group-data-[collapsible=icon]:px-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-xl bg-white/8 p-1.5 group-data-[collapsible=icon]:justify-center hover:bg-white/12"
                        >
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

            <SidebarFooter className="border-t border-sidebar-border/80 pt-4 group-data-[collapsible=icon]:px-0">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
