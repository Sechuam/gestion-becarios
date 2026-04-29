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
            <div className="rounded-xl border border-sidebar/10 bg-white p-3 shadow-lg dark:bg-slate-900/60 transition-all">
                {/* Fila 1: Búsqueda y Acciones Extra (Exportar) */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative max-w-sm min-w-[240px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar becario..."
                            className="h-8 border-sidebar/20 bg-slate-50/50 pl-10 text-xs text-foreground placeholder:text-muted-foreground rounded-lg shadow-sm focus:ring-sidebar/20"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterInternal('search', e.target.value)}
                        />
                    </div>

                    {children}

                    <div className="ml-auto text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 px-3 py-1 rounded-full dark:bg-slate-800 flex items-center gap-1.5 border border-sidebar/5 shadow-inner">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-sidebar animate-pulse" />
                        {internsCount} / {totalInterns} becarios
                    </div>
                </div>

                {/* Fila 2: Filtros de centro, estado, vista y fechas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-end gap-2">
                    <div className="space-y-1 lg:min-w-[180px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Centro
                        </label>
                        <Select
                            value={filters.center || 'all'}
                            onValueChange={(v) => onFilterChange('center', v)}
                        >
                            <SelectTrigger className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                <SelectValue>
                                    {filters.center && filters.center !== 'all'
                                        ? education_centers.find(
                                              (c) => c.id.toString() === filters.center?.toString(),
                                          )?.name
                                        : 'Todos'}
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

                    <div className="space-y-1 lg:min-w-[120px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Estado
                        </label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => onFilterChange('status', v)}
                        >
                            <SelectTrigger className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                <SelectValue>
                                    {{
                                        active: 'Activos',
                                        completed: 'Completados',
                                        abandoned: 'Abandonados',
                                    }[filters.status as string] || 'Todos'}
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

                    <div className="space-y-1 lg:min-w-[120px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Vista
                        </label>
                        <Select
                            value={filters.trashed || 'none'}
                            onValueChange={(v) => onFilterChange('trashed', v)}
                        >
                            <SelectTrigger className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                <SelectValue>
                                    {{
                                        none: 'Solo Activos',
                                        only: 'Archivados',
                                        with: 'Ver Todos',
                                    }[filters.trashed as string] || 'Solo Activos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="none">Solo Activos</SelectItem>
                                <SelectItem value="only">Archivados</SelectItem>
                                <SelectItem value="with">Ver Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1 lg:min-w-[110px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Desde
                        </label>
                        <DatePicker
                            value={filters.start_from || ''}
                            onChange={(value) => onFilterChange('start_from', value)}
                            className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm"
                        />
                    </div>

                    <div className="space-y-1 lg:min-w-[110px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Hasta
                        </label>
                        <DatePicker
                            value={filters.start_to || ''}
                            onChange={(value) => onFilterChange('start_to', value)}
                            className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm"
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
