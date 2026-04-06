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
        <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    type="button"
                    onClick={() => onRemove(chip.key)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
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
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
            >
                Limpiar filtros
            </Button>
        </div>
    );
}
