import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react'; // Importamos la flechita
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import type { SidebarSection } from '@/components/sidebar/sidebar-types';

// Extendemos el tipo localmente por si acaso
interface NavMainItem extends NavItem {
    items?: NavItem[];
}

type NavMainProps = {
    items?: NavMainItem[];
    sections?: SidebarSection[];
};

export function NavMain({ items = [], sections }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const renderItems = (menuItems: NavMainItem[]) => (
        <SidebarMenu>
            {menuItems.map((item) => {
                if (!item.items || item.items.length === 0) {
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                }

                return (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            {isCollapsed ? (
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.items.some((sub) =>
                                        isCurrentUrl(sub.href),
                                    )}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.items[0].href}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            ) : (
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={{ children: item.title }}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                            )}
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items.map((subItem) => (
                                        <SidebarMenuSubItem
                                            key={subItem.title}
                                        >
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={isCurrentUrl(
                                                    subItem.href,
                                                )}
                                            >
                                                <Link href={subItem.href}>
                                                    <span>
                                                        {subItem.title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                );
            })}
        </SidebarMenu>
    );

    return (
        <>
            {sections && sections.length > 0 ? (
                sections.map((section, index) => (
                    <SidebarGroup
                        key={`${section.label ?? 'section'}-${index}`}
                        className="py-0 group-data-[collapsible=icon]:px-0"
                    >
                        {section.label && (
                            <SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-[0.22em] text-sidebar-foreground/55 uppercase">
                                {section.label}
                            </SidebarGroupLabel>
                        )}
                        {renderItems(section.items)}
                    </SidebarGroup>
                ))
            ) : (
                <SidebarGroup className="py-0 group-data-[collapsible=icon]:px-0">
                    <SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-[0.22em] text-sidebar-foreground/55 uppercase">Platform</SidebarGroupLabel>
                    {renderItems(items)}
                </SidebarGroup>
            )}
        </>
    );
}
