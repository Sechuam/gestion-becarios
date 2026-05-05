import { Bell } from 'lucide-react';
import { usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function NotificationBell() {
    const { auth } = usePage().props as any;
    const notifications = auth?.user?.unreadNotifications || [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-9 w-9 rounded-full bg-sidebar/85 text-white shadow-md hover:bg-sidebar hover:text-white transition-all duration-300 border border-white/10 group"
                >
                    <Bell className="relative h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-125" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-sidebar shadow-sm">
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
                            <Link
                                href={notification.data.intern_id ? `/interns/${notification.data.intern_id}` : '/becarios'}
                                className="text-xs text-indigo-500 mt-1 hover:underline"
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
