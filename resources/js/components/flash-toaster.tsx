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
    const lastFlashRef = useRef<FlashProps['flash']>(undefined);

    useEffect(() => {
        if (flash?.success && flash !== lastFlashRef.current) {
            toast({
                title: 'Éxito',
                description: flash.success,
                variant: 'default',
            });
        }

        if (flash?.error && flash !== lastFlashRef.current) {
            toast({
                title: 'Error',
                description: flash.error,
                variant: 'destructive',
            });
        }
        lastFlashRef.current = flash;
    }, [flash]);

    return null;
}
