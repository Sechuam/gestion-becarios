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
            <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60 transition-all">
                {/* Fila 1: Búsqueda y Acciones Extra (Exportar) */}
                <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="relative max-w-md min-w-[280px] flex-1">
                        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, email o DNI..."
                            className="h-12 border-sidebar/20 bg-slate-50/50 pl-12 text-foreground placeholder:text-muted-foreground rounded-2xl shadow-sm focus:ring-sidebar/20"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterInternal('search', e.target.value)}
                        />
                    </div>

                    {children}

                    <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 px-4 py-2 rounded-full dark:bg-slate-800 flex items-center gap-2 border border-sidebar/5 shadow-inner">
                        <span className="flex h-2 w-2 rounded-full bg-sidebar animate-pulse" />
                        Mostrando {internsCount} de {totalInterns} becarios
                    </div>
                </div>

                {/* Fila 2: Filtros de centro, estado, vista y fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap items-end gap-6">
                    <div className="space-y-2 lg:min-w-[200px]">
                        <label className="text-[10px] font-black tracking-[0.12em] text-[#1f4f52]/70 uppercase ml-1">
                            Centro Educativo
                        </label>
                        <Select
                            value={filters.center || 'all'}
                            onValueChange={(v) => onFilterChange('center', v)}
                        >
                            <SelectTrigger className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
                                <SelectValue>
                                    {filters.center && filters.center !== 'all'
                                        ? education_centers.find(
                                              (c) => c.id.toString() === filters.center?.toString(),
                                          )?.name
                                        : 'Todos los centros'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-sidebar/20">
                                <SelectItem value="all">Todos los centros</SelectItem>
                                {education_centers.map((center) => (
                                    <SelectItem key={center.id} value={center.id.toString()}>
                                        {center.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 lg:min-w-[150px]">
                        <label className="text-[10px] font-black tracking-[0.12em] text-[#1f4f52]/70 uppercase ml-1">
                            Estado Actual
                        </label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => onFilterChange('status', v)}
                        >
                            <SelectTrigger className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
                                <SelectValue>
                                    {{
                                        active: 'Activos',
                                        completed: 'Completados',
                                        abandoned: 'Abandonados',
                                    }[filters.status as string] || 'Todos los estados'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-sidebar/20">
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="completed">Completados</SelectItem>
                                <SelectItem value="abandoned">Abandonados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 lg:min-w-[140px]">
                        <label className="text-[10px] font-black tracking-[0.12em] text-[#1f4f52]/70 uppercase ml-1">
                            Tipo de Vista
                        </label>
                        <Select
                            value={filters.trashed || 'none'}
                            onValueChange={(v) => onFilterChange('trashed', v)}
                        >
                            <SelectTrigger className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
                                <SelectValue>
                                    {{
                                        none: 'Solo Activos',
                                        only: 'Archivados',
                                        with: 'Ver Todos',
                                    }[filters.trashed as string] || 'Solo Activos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-sidebar/20">
                                <SelectItem value="none">Solo Activos</SelectItem>
                                <SelectItem value="only">Archivados</SelectItem>
                                <SelectItem value="with">Ver Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.12em] text-[#1f4f52]/70 uppercase ml-1">
                            Desde Fecha
                        </label>
                        <DatePicker
                            value={filters.start_from || ''}
                            onChange={(value) => onFilterChange('start_from', value)}
                            className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.12em] text-[#1f4f52]/70 uppercase ml-1">
                            Hasta Fecha
                        </label>
                        <DatePicker
                            value={filters.start_to || ''}
                            onChange={(value) => onFilterChange('start_to', value)}
                            className="h-11 border-sidebar/20 bg-card text-foreground rounded-2xl shadow-sm"
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
