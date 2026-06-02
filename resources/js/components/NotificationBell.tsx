import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    ClipboardCheck,
    Mail,
    MessageSquare,
    UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';
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
    const [open, setOpen] = useState(false);
    const notifications: any[] = auth?.user?.unreadNotifications || [];

    const handleRead = (notification: any) => {
        setOpen(false);
        router.post(`/notificaciones/${notification.id}/read`);
    };

    const handleReadAll = () => {
        setOpen(false);
        router.post('/notificaciones/read-all');
    };

    const notificationIcon = (type?: string) => {
        switch (type) {
            case 'new_message':
                return (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                        <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                );
            case 'absence_request':
            case 'absence_status_changed':
                return (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                        <UserRoundCheck className="h-3.5 w-3.5" />
                    </div>
                );
            case 'task_created':
            case 'task_status_changed':
            case 'task_submitted':
            case 'evaluation_created':
                return (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                    </div>
                );
            case 'calendar_event_created':
            case 'calendar_event_updated':
                return (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                    </div>
                );
            default:
                return (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <Bell className="h-3.5 w-3.5" />
                    </div>
                );
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
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
                <div className="flex items-center justify-between px-2">
                    <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={handleReadAll}
                            className="rounded px-2 py-0.5 text-[11px] font-medium text-indigo-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
                        >
                            Leer todo
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-slate-500">
                        <Mail className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        No tienes notificaciones nuevas
                    </div>
                ) : (
                    notifications.map((notification: any) => {
                        const data = notification.data || {};
                        const type = data.type ?? '';
                        const isMessage = type === 'new_message';
                        const isAbsence = type === 'absence_request';
                        const label = data.title ?? (isMessage
                            ? (data.sender_name ?? 'Nuevo mensaje')
                            : isAbsence
                              ? (data.intern_name ?? 'Ausencia')
                              : 'Notificación');

                        return (
                            <DropdownMenuItem
                                key={notification.id}
                                onClick={() => handleRead(notification)}
                                className="flex cursor-pointer items-start gap-3 p-3 focus:bg-slate-50 dark:focus:bg-slate-800/60"
                            >
                                {notificationIcon(type)}
                                <div className="min-w-0 flex-1">
                                    <span className="block text-sm leading-tight font-semibold">
                                        {label}
                                    </span>
                                    <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-slate-500 dark:text-slate-400">
                                        {data.message ?? ''}
                                    </span>
                                    {isMessage && (
                                        <span className="mt-1 inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                            Mensaje
                                        </span>
                                    )}
                                    {isAbsence && (
                                        <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                            Ausencia
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        );
                    })
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
