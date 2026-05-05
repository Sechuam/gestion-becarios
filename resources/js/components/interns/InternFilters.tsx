import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ActiveFilterChips } from '@/components/common/ActiveFilterChips';

interface InternFiltersProps {
    filters: any;
    education_centers: any[];
    internsCount: number;
    totalInterns: number;
    onFilterChange: (key: string, value: string) => void;
    onClearFilter: (key: string) => void;
    onClearAll: () => void;
    activeFilterChips: any[];
    children?: React.ReactNode; // Slot for export dialog or other actions
}

export function InternFilters({
    filters,
    education_centers,
    internsCount,
    totalInterns,
    onFilterChange,
    onClearFilter,
    onClearAll,
    activeFilterChips,
    children,
}: InternFiltersProps) {
    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-sidebar/10 bg-white p-2 shadow-lg transition-all dark:bg-slate-900/60">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full flex-none sm:w-64">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar becario..."
                            className="h-8 rounded-lg border-sidebar/10 bg-slate-50/50 pl-9 text-[11px] text-foreground placeholder:text-muted-foreground shadow-sm focus:ring-sidebar/20"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterInternal('search', e.target.value)}
                        />
                    </div>

                    <div className="min-w-[150px] flex-1">
                        <Select
                            value={filters.center || 'all'}
                            onValueChange={(v) => onFilterChange('center', v)}
                        >
                            <SelectTrigger className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm transition-colors hover:bg-slate-50">
                                <SelectValue>
                                    {filters.center && filters.center !== 'all'
                                        ? education_centers.find(
                                              (c) => c.id.toString() === filters.center?.toString(),
                                          )?.name
                                        : 'Centro'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="all">Todos los centros</SelectItem>
                                {education_centers.map((center) => (
                                    <SelectItem key={center.id} value={center.id.toString()}>
                                        {center.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-[120px] flex-1">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => onFilterChange('status', v)}
                        >
                            <SelectTrigger className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm transition-colors hover:bg-slate-50">
                                <SelectValue>
                                    {{
                                        active: 'Activos',
                                        completed: 'Completados',
                                        abandoned: 'Abandonados',
                                    }[filters.status as string] || 'Estado'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="completed">Completados</SelectItem>
                                <SelectItem value="abandoned">Abandonados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-[120px] flex-1">
                        <Select
                            value={filters.trashed || 'none'}
                            onValueChange={(v) => onFilterChange('trashed', v)}
                        >
                            <SelectTrigger className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm transition-colors hover:bg-slate-50">
                                <SelectValue>
                                    {{
                                        none: 'Solo Activos',
                                        only: 'Archivados',
                                        with: 'Ver Todos',
                                    }[filters.trashed as string] || 'Vista'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="none">Solo Activos</SelectItem>
                                <SelectItem value="only">Archivados</SelectItem>
                                <SelectItem value="with">Ver Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-[120px] flex-1">
                        <DatePicker
                            value={filters.start_from || ''}
                            onChange={(value) => onFilterChange('start_from', value)}
                            className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm"
                            placeholder="Desde..."
                        />
                    </div>

                    <div className="min-w-[120px] flex-1">
                        <DatePicker
                            value={filters.start_to || ''}
                            onChange={(value) => onFilterChange('start_to', value)}
                            className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm"
                            placeholder="Hasta..."
                        />
                    </div>

                    {children}

                    <div className="flex h-8 flex-none items-center gap-1.5 rounded-lg border border-sidebar/5 bg-slate-50 px-2 py-1 dark:bg-slate-800">
                        <span className="flex h-1 w-1 animate-pulse rounded-full bg-sidebar" />
                        <span className="whitespace-nowrap text-[10px] font-bold tabular-nums text-muted-foreground">
                            {internsCount} / {totalInterns}
                        </span>
                    </div>
                </div>
            </div>

            <ActiveFilterChips
                chips={activeFilterChips}
                onRemove={onClearFilter}
                onClearAll={onClearAll}
            />
        </div>
    );

    function handleFilterInternal(key: string, value: string) {
        onFilterChange(key, value);
    }
}
