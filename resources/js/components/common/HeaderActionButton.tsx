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

export function HeaderActionButton({ label, href, onClick, icon, className }: HeaderActionButtonProps) {
    const content = (
        <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,transparent_100%)]" />
            {icon || <Plus className="mr-1.5 h-3.5 w-3.5" />}
            {label}
        </>
    );

    const baseClasses = cn(
        "relative overflow-hidden bg-white text-sidebar hover:bg-white/90 rounded-xl px-5 font-black shadow-lg transition-all h-9 border-none text-[10px] uppercase tracking-widest flex items-center justify-center min-w-[200px]",
        className
    );

    if (href) {
        return (
            <Button asChild className={baseClasses}>
                <Link href={href}>
                    {content}
                </Link>
            </Button>
        );
    }

    return (
        <Button className={baseClasses} onClick={onClick}>
            {content}
        </Button>
    );
}
