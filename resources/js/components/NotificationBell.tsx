import { Bell } from 'lucide-react';
import { usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function NotificationBell() {
    const { auth } = usePage().props as any;
    const notifications = auth?.user?.unreadNotifications || [];

    const canManage = auth?.user?.permissions?.includes('manage interns');
    if (!canManage) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
                        <DropdownMenuItem key={notification.id} className="cursor-pointer p-3 flex flex-col items-start gap-1">
                            <span className="font-semibold text-sm">{notification.data.intern_name}</span>
                            <span className="text-xs text-slate-500 line-clamp-2">{notification.data.message}</span>
                            <Link href="/dashboard" className="text-xs text-indigo-500 mt-1 hover:underline">
                                Ir al Dashboard para gestionar
                            </Link>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
