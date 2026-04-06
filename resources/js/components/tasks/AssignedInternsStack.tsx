import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';

type InternAssignment = {
    id: number;
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
};

type Props = {
    interns?: InternAssignment[];
    visibleCount?: number;
};

export default function AssignedInternsStack({
    interns = [],
    visibleCount = 3,
}: Props) {
    const getInitials = useInitials();

    if (!interns.length) {
        return <span className="text-muted-foreground">—</span>;
    }

    const visibleInterns = interns.slice(0, visibleCount);
    const hiddenInterns = interns.slice(visibleCount);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center">
                    <div className="flex -space-x-2">
                        {visibleInterns.map((intern) => {
                            const name = intern.user?.name?.trim() || 'Becario';

                            return (
                                <Avatar
                                    key={intern.id}
                                    className="h-8 w-8 border-2 border-background bg-muted shadow-sm"
                                >
                                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                                        {getInitials(name)}
                                    </AvatarFallback>
                                </Avatar>
                            );
                        })}

                        {hiddenInterns.length > 0 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground shadow-sm">
                                +{hiddenInterns.length}
                            </div>
                        )}
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs rounded-xl border border-border bg-card px-3 py-2 text-card-foreground shadow-lg">
                <div className="space-y-1.5">
                    {interns.map((intern) => {
                        const name = intern.user?.name?.trim() || 'Becario';
                        const email = intern.user?.email?.trim();

                        return (
                            <div key={intern.id} className="flex items-center gap-2 text-xs">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                                    {getInitials(name)}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{name}</p>
                                    {email && (
                                        <p className="truncate text-muted-foreground">
                                            {email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
