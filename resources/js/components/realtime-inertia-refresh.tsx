import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { echo } from '@/lib/echo';

const RELOAD_DEBOUNCE_MS = 450;

export function RealtimeInertiaRefresh() {
    const { auth } = usePage().props as any;
    const userId = auth?.user?.id;
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const realtime = echo;

        if (!realtime || !userId) {
            return;
        }

        const reloadPage = () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = window.setTimeout(() => {
                router.reload();
            }, RELOAD_DEBOUNCE_MS);
        };

        realtime.private('app.data').listen(
            '.ApplicationDataUpdated',
            reloadPage,
        );
        realtime.private(`App.Models.User.${userId}`).notification(reloadPage);

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }

            realtime.leave('app.data');
            realtime.leave(`App.Models.User.${userId}`);
        };
    }, [userId]);

    return null;
}
