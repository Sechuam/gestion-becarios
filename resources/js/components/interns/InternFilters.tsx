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
        <div className="space-y-4">
            <div className="filter-panel space-y-4 p-5">
                {/* Fila 1: Búsqueda y Acciones Extra (Exportar) */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative max-w-md min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterInternal('search', e.target.value)}
                        />
                    </div>

                    {children}

                    <p className="ml-auto text-sm font-medium whitespace-nowrap text-muted-foreground">
                        Mostrando {internsCount} de {totalInterns} becarios
                    </p>
                </div>

                {/* Fila 2: Filtros de centro, estado, vista y fechas */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Centro
                        </label>
                        <Select
                            value={filters.center || 'all'}
                            onValueChange={(v) => onFilterChange('center', v)}
                        >
                            <SelectTrigger className="w-[200px] border-border bg-background text-foreground [&>span]:truncate">
                                <SelectValue>
                                    {filters.center && filters.center !== 'all'
                                        ? education_centers.find(
                                              (c) => c.id.toString() === filters.center?.toString(),
                                          )?.name
                                        : 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los centros</SelectItem>
                                {education_centers.map((center) => (
                                    <SelectItem key={center.id} value={center.id.toString()}>
                                        {center.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Estado
                        </label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => onFilterChange('status', v)}
                        >
                            <SelectTrigger className="w-[160px] border-border bg-background text-foreground">
                                <SelectValue>
                                    {{
                                        active: 'Activos',
                                        completed: 'Completados',
                                        abandoned: 'Abandonados',
                                    }[filters.status as string] || 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="completed">Completados</SelectItem>
                                <SelectItem value="abandoned">Abandonados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Vista
                        </label>
                        <Select
                            value={filters.trashed || 'none'}
                            onValueChange={(v) => onFilterChange('trashed', v)}
                        >
                            <SelectTrigger className="w-[160px] border-border bg-background text-foreground">
                                <SelectValue>
                                    {{
                                        none: 'Activos',
                                        only: 'Archivados',
                                        with: 'Todos',
                                    }[filters.trashed as string] || 'Activos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Activos</SelectItem>
                                <SelectItem value="only">Archivados</SelectItem>
                                <SelectItem value="with">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Desde
                        </label>
                        <DatePicker
                            value={filters.start_from || ''}
                            onChange={(value) => onFilterChange('start_from', value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Hasta
                        </label>
                        <DatePicker
                            value={filters.start_to || ''}
                            onChange={(value) => onFilterChange('start_to', value)}
                        />
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
