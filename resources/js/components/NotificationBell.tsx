import { usePage, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type NotificationBellProps = {
    triggerClassName?: string;
};

export function NotificationBell({ triggerClassName }: NotificationBellProps) {
    const { auth } = usePage().props as any;
    const notifications = auth?.user?.unreadNotifications || [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                        notifications.length > 0
                            ? `Abrir notificaciones (${notifications.length} sin leer)`
                            : 'Abrir notificaciones'
                    }
                    className={cn(
                        'group relative h-9 w-9 rounded-full border border-white/10 bg-sidebar/85 text-white shadow-md transition-all duration-300 hover:bg-sidebar hover:text-white',
                        triggerClassName,
                    )}
                >
                    <Bell className="relative h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-125" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-sidebar">
                            {notifications.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                        No tienes notificaciones nuevas
                    </div>
                ) : (
                    notifications.map((notification: any) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="flex cursor-pointer flex-col items-start gap-1 p-3"
                        >
                            <span className="text-sm font-semibold">
                                {notification.data.intern_name}
                            </span>
                            <span className="line-clamp-2 text-xs text-slate-500">
                                {notification.data.message}
                            </span>
                            <Link
                                href={
                                    notification.data.intern_id
                                        ? `/interns/${notification.data.intern_id}`
                                        : '/becarios'
                                }
                                className="mt-1 text-xs text-indigo-500 hover:underline"
                            >
                                Ir a gestionar ausencias
                            </Link>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
