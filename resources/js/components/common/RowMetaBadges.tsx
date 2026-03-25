import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type RowMetaBadgesProps = {
    recentLabel?: string | null;
    note?: string | null;
    noteLabel?: string;
};

export function RowMetaBadges({
    recentLabel,
    note,
    noteLabel = 'Nota',
}: RowMetaBadgesProps) {
    if (!recentLabel && !note) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 pt-1">
            {recentLabel && (
                <span className="rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {recentLabel}
                </span>
            )}
            {note && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-help rounded-full border border-border/80 bg-accent/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-foreground/70 uppercase">
                            {noteLabel}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <p className="text-sm leading-relaxed">{note}</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}
