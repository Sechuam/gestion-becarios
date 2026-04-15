import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NotificationBell } from './NotificationBell';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/75 px-6 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">

            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 rounded-xl border border-border/70 bg-card/75 shadow-sm" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center rounded-full border border-border/70 bg-card/75 p-1 shadow-sm">
                <NotificationBell />
            </div>

        </header>
    );

}
