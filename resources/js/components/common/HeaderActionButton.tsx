import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface HeaderActionButtonProps {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    className?: string;
}

export function HeaderActionButton({
    label,
    href,
    onClick,
    icon,
    className,
}: HeaderActionButtonProps) {
    const content = (
        <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,transparent_100%)]" />
            {icon || <Plus className="mr-1.5 h-3.5 w-3.5" />}
            {label}
        </>
    );

    const baseClasses = cn(
        'relative flex h-9 min-w-0 items-center justify-center overflow-hidden rounded-lg border-none bg-white px-4 text-[10px] font-black tracking-widest text-sidebar uppercase shadow-lg transition-all hover:bg-white/90 sm:min-w-[160px]',
        className,
    );

    if (href) {
        return (
            <Button asChild className={baseClasses}>
                <Link href={href}>{content}</Link>
            </Button>
        );
    }

    return (
        <Button className={baseClasses} onClick={onClick}>
            {content}
        </Button>
    );
}
