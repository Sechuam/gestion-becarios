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
import { getTaskStatusLabel } from '@/lib/task-labels';

interface TaskFiltersProps {
    filters: any;
    practice_types: any[];
    interns?: any[];
    tasksCount: number;
    totalTasks: number;
    onFilterChange: (key: string, value: string) => void;
    onClearFilter: (key: string) => void;
    onClearAll: () => void;
    activeFilterChips: any[];
}

export function TaskFilters({
    filters,
    practice_types,
    interns = [],
    tasksCount,
    totalTasks,
    onFilterChange,
    onClearFilter,
    onClearAll,
    activeFilterChips,
}: TaskFiltersProps) {
    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-sidebar/10 bg-white p-2 shadow-lg dark:bg-slate-900/60 transition-all">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Búsqueda principal */}
                    <div className="relative w-full sm:w-64 flex-none">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por título..."
                            className="h-8 border-sidebar/10 bg-slate-50/50 pl-9 text-[11px] text-foreground placeholder:text-muted-foreground rounded-lg shadow-sm focus:ring-sidebar/20"
                            value={filters.search || ''}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Filtros de Selección (Distribuidos) */}
                    <div className="flex-1 min-w-[120px]">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => onFilterChange('status', v)}
                        >
                            <SelectTrigger className="h-8 w-full border-sidebar/10 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="in_progress">En progreso</SelectItem>
                                <SelectItem value="in_review">En revisión</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                                <SelectItem value="rejected">Rechazada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <Select
                            value={filters.practice_type || 'all'}
                            onValueChange={(v) => onFilterChange('practice_type', v)}
                        >
                            <SelectTrigger className="h-8 w-full border-sidebar/10 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors [&>span]:truncate">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {practice_types.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {interns.length > 0 && (
                        <div className="flex-1 min-w-[150px]">
                            <Select
                                value={filters.intern_id || 'all'}
                                onValueChange={(v) => onFilterChange('intern_id', v)}
                            >
                                <SelectTrigger className="h-8 w-full border-sidebar/10 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors [&>span]:truncate">
                                    <SelectValue placeholder="Asignado a" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-sidebar/20">
                                    <SelectItem value="all">Cualquier becario</SelectItem>
                                    {interns.map((intern) => (
                                        <SelectItem key={intern.id} value={String(intern.id)}>
                                            {intern.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Filtros de Fecha (Distribuidos) */}
                    <div className="flex-1 min-w-[120px]">
                        <DatePicker
                            value={filters.due_from || ''}
                            onChange={(value) => onFilterChange('due_from', value)}
                            className="h-8 w-full border-sidebar/10 bg-card text-[10px] text-foreground rounded-lg shadow-sm"
                            placeholder="Desde..."
                        />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <DatePicker
                            value={filters.due_to || ''}
                            onChange={(value) => onFilterChange('due_to', value)}
                            className="h-8 w-full border-sidebar/10 bg-card text-[10px] text-foreground rounded-lg shadow-sm"
                            placeholder="Hasta..."
                        />
                    </div>

                    {/* Contador discreto */}
                    <div className="flex-none flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg dark:bg-slate-800 border border-sidebar/5">
                        <span className="flex h-1 w-1 rounded-full bg-sidebar animate-pulse" />
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums whitespace-nowrap">
                            {tasksCount} / {totalTasks}
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
}
