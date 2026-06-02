import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { FlashToaster } from '@/components/flash-toaster';
import { RealtimeInertiaRefresh } from '@/components/realtime-inertia-refresh';
import { SidebarProvider } from '@/components/ui/sidebar';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const isOpen = usePage().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">
                <RealtimeInertiaRefresh />
                {children}
                <FlashToaster />
            </div>
        );
    }

    return (
        <SidebarProvider
            defaultOpen={isOpen}
            className="bg-[#f6f7f2] bg-[radial-gradient(58rem_38rem_at_0%_-10%,rgba(132,183,175,0.18),transparent_60%),radial-gradient(48rem_30rem_at_105%_0%,rgba(78,127,120,0.1),transparent_55%)]"
        >
            <RealtimeInertiaRefresh />
            {children}
            <FlashToaster />
        </SidebarProvider>
    );
}
