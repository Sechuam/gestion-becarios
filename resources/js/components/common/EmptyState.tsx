import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

type Props = {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
};

export function EmptyState({
    title,
    description,
    icon,
    action,
}: Props) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                {icon ?? <Sparkles className="h-5 w-5" />}
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
