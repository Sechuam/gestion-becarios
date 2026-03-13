import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

type FlashProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

export function FlashToaster() {
    const { flash } = usePage().props as FlashProps;
    const lastShownRef = useRef<{ success?: string; error?: string }>({});

    useEffect(() => {
        if (flash?.success && flash.success !== lastShownRef.current.success) {
            toast({
                title: 'Éxito',
                description: flash.success,
                variant: 'success',
            });
            lastShownRef.current.success = flash.success;
        }

        if (flash?.error && flash.error !== lastShownRef.current.error) {
            toast({
                title: 'Error',
                description: flash.error,
                variant: 'destructive',
            });
            lastShownRef.current.error = flash.error;
        }
    }, [flash?.success, flash?.error]);

    return null;
}
