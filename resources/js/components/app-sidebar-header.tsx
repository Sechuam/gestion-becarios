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
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b-2 border-sidebar bg-stone-100/60 px-6 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:bg-slate-900/60">

            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 rounded-xl border border-sidebar/40 bg-white/50 shadow-sm dark:bg-slate-800/50" />
                <div className="font-bold text-slate-600">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center rounded-xl border border-sidebar/40 bg-white/50 p-1 shadow-sm dark:bg-slate-800/50">
                <NotificationBell />
            </div>

        </header>
    );

}
