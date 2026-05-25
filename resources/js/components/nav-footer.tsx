import type { ComponentPropsWithoutRef } from 'react';
import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const href = toUrl(item.href);
                        const isExternal =
                            href.startsWith('http') ||
                            href.startsWith('mailto:') ||
                            href.startsWith('tel:');
                        const content = (
                            <>
                                {item.icon && (
                                    <item.icon className="h-5 w-5" />
                                )}
                                <span>{item.title}</span>
                            </>
                        );

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                >
                                    {isExternal ? (
                                        <a
                                            href={href}
                                            target={
                                                href.startsWith('http')
                                                    ? '_blank'
                                                    : undefined
                                            }
                                            rel={
                                                href.startsWith('http')
                                                    ? 'noopener noreferrer'
                                                    : undefined
                                            }
                                        >
                                            {content}
                                        </a>
                                    ) : (
                                        <Link href={href}>{content}</Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
