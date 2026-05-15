import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { BoardQuickFilter } from '@/lib/task-constants';

type QuickFilter = {
    key: BoardQuickFilter;
    label: string;
    tooltip?: string;
    count: number;
};

type Props = {
    activeFilter: BoardQuickFilter;
    filters: QuickFilter[];
    onFilterChange: (filter: BoardQuickFilter) => void;
};

export function TaskBoardQuickFiltersSheet({
    activeFilter,
    filters,
    onFilterChange,
}: Props) {
    const [open, setOpen] = useState(false);
    const activeBoardFilter = filters.find((filter) => filter.key === activeFilter);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    className="h-8 w-full justify-between rounded-lg border border-white/80 bg-white px-3 text-sidebar shadow-sm hover:bg-white/90"
                >
                    <span className="inline-flex items-center gap-2">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black tracking-widest uppercase">
                            Filtros rápidos
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="hidden max-w-[8rem] truncate text-[10px] font-bold text-sidebar/70 sm:inline">
                            {activeBoardFilter?.label ?? 'Todas'}
                        </span>
                        <span className="rounded-full bg-sidebar px-1.5 py-0.5 text-[10px] font-black text-white tabular-nums">
                            {activeBoardFilter?.count ?? 0}
                        </span>
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-[20rem] border-sidebar/15 bg-white p-0 sm:max-w-[22rem]"
                closeClassName="top-5 right-5"
            >
                <SheetHeader className="border-b border-sidebar/10 bg-slate-50/80 p-5">
                    <SheetTitle className="text-sm font-black tracking-tight text-sidebar">
                        Filtros rápidos
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                        Cambia la lectura del tablero sin mover los filtros principales.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-2 p-4">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            type="button"
                            className={`rounded-xl border p-3 text-left shadow-sm transition-all ${
                                activeFilter === filter.key
                                    ? 'border-sidebar bg-[linear-gradient(90deg,var(--sidebar)_0%,#244655_100%)] text-white shadow-sidebar/20'
                                    : 'border-sidebar/10 bg-white text-foreground hover:border-sidebar/30 hover:bg-slate-50'
                            }`}
                            onClick={() => {
                                onFilterChange(filter.key);
                                setOpen(false);
                            }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-black tracking-wide uppercase">
                                    {filter.label}
                                </span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${
                                        activeFilter === filter.key
                                            ? 'bg-white/20 text-white'
                                            : 'border border-sidebar/10 bg-slate-100 text-sidebar'
                                    }`}
                                >
                                    {filter.count}
                                </span>
                            </div>
                            {filter.tooltip && (
                                <p
                                    className={`mt-1.5 text-[11px] leading-snug ${
                                        activeFilter === filter.key
                                            ? 'text-white/75'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {filter.tooltip}
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
