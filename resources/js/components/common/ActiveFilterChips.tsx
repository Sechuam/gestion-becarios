import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FilterChip = {
    key: string;
    label: string;
};

export function ActiveFilterChips({
    chips,
    onRemove,
    onClearAll,
}: {
    chips: FilterChip[];
    onRemove: (key: string) => void;
    onClearAll: () => void;
}) {
    if (!chips.length) {
        return null;
    }

    return (
        <div className="filter-panel flex flex-wrap items-center gap-2 p-3">
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    type="button"
                    onClick={() => onRemove(chip.key)}
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] transition-colors hover:bg-muted/85"
                >
                    <span>{chip.label}</span>
                    <X className="h-3 w-3 text-muted-foreground" />
                </button>
            ))}

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-background/60 hover:text-foreground"
            >
                Limpiar filtros
            </Button>
        </div>
    );
}
