import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

type Props = {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
};

export function EmptyState({
    title,
    description,
    icon,
    action,
    className,
}: Props) {
    return (
        <div className={`flex flex-col items-center justify-center space-y-4 p-12 text-center ${className || ''}`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sidebar/5 text-sidebar border border-sidebar/10 shadow-inner">
                {icon ?? <Sparkles className="h-8 w-8" />}
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="max-w-lg text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}
