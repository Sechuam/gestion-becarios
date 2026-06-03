import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NotificationBell } from './NotificationBell';
import ThemeToggleButton from './theme-toggle-button';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#d7ded2]/80 bg-white/82 px-6 shadow-sm shadow-slate-900/5 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:border-white/10 dark:bg-[#111d2c]/92">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 rounded-xl border border-[#b9c8be] bg-white text-sidebar shadow-sm hover:bg-sidebar hover:text-white dark:border-[#9fc6bf]/55 dark:bg-[#9fc6bf]/12 dark:text-[#d8fff7] dark:shadow-[0_0_0_1px_rgba(159,198,191,0.08)] dark:hover:border-[#9fc6bf] dark:hover:bg-[#9fc6bf] dark:hover:text-[#14202a] [&_svg]:size-4" />
                <div className="font-bold text-slate-600 dark:text-[#d8e4ef] [&_[data-slot=breadcrumb-page]]:text-slate-800 dark:[&_[data-slot=breadcrumb-page]]:text-white [&_[data-slot=breadcrumb-separator]]:text-sidebar/40 dark:[&_[data-slot=breadcrumb-separator]]:text-[#8fa3b6] [&_a]:text-slate-500 dark:[&_a]:text-[#8fa3b6] [&_a:hover]:text-sidebar dark:[&_a:hover]:text-[#d8fff7]">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-[#b9c8be] bg-white/90 p-1 shadow-sm transition-all hover:border-[#4e7f78]/50 dark:border-[#9fc6bf]/35 dark:bg-[#142235] dark:shadow-[0_0_0_1px_rgba(159,198,191,0.06)]">
                <ThemeToggleButton className="size-9" />
                <NotificationBell triggerClassName="border-sidebar/20 bg-sidebar text-white shadow-none hover:bg-sidebar/90 hover:text-white dark:border-[#9fc6bf]/45 dark:bg-[#9fc6bf]/12 dark:text-[#d8fff7] dark:hover:border-[#9fc6bf] dark:hover:bg-[#9fc6bf] dark:hover:text-[#14202a]" />
            </div>
        </header>
    );
}
