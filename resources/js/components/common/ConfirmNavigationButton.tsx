import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
    href: string;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    children: ReactNode;
    className?: string;
};

export function ConfirmNavigationButton({
    href,
    title,
    description,
    confirmLabel = 'Continuar',
    children,
    className,
}: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className={className}>{children}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={() => router.visit(href)}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
