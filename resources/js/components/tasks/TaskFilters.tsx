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
            <div className="rounded-xl border border-sidebar/10 bg-white p-3 shadow-lg dark:bg-slate-900/60 transition-all">
                {/* Fila 1: Búsqueda */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative max-w-sm min-w-[240px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar tarea..."
                            className="h-8 border-sidebar/20 bg-slate-50/50 pl-10 text-xs text-foreground placeholder:text-muted-foreground rounded-lg shadow-sm focus:ring-sidebar/20"
                            value={filters.search || ''}
                            onChange={(e) =>
                                onFilterChange('search', e.target.value)
                            }
                        />
                    </div>

                    <div className="ml-auto text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 px-3 py-1 rounded-full dark:bg-slate-800 flex items-center gap-1.5 border border-sidebar/5 shadow-inner">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-sidebar animate-pulse" />
                        {tasksCount} / {totalTasks} tareas
                    </div>
                </div>

                {/* Fila 2: Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-end gap-2">
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
                                        pending: 'Pendiente',
                                        in_progress: 'En progreso',
                                        in_review: 'En revisión',
                                        completed: 'Completada',
                                        rejected: 'Rechazada',
                                    }[filters.status as string] || 'Todos'}
                                </SelectValue>
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

                    <div className="space-y-1 lg:min-w-[180px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Categoría
                        </label>
                        <Select
                            value={filters.practice_type || 'all'}
                            onValueChange={(v) => onFilterChange('practice_type', v)}
                        >
                            <SelectTrigger className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors [&>span]:truncate">
                                <SelectValue>
                                    {filters.practice_type && filters.practice_type !== 'all'
                                        ? practice_types.find(
                                            (p) => p.id.toString() === filters.practice_type?.toString()
                                        )?.name
                                        : 'Todas'}
                                </SelectValue>
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

                    <div className="space-y-1 lg:min-w-[160px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Asignada a
                        </label>
                        <Select
                            value={filters.intern_id || 'all'}
                            onValueChange={(v) => onFilterChange('intern_id', v)}
                        >
                            <SelectTrigger className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors [&>span]:truncate">
                                <SelectValue>
                                    {filters.intern_id && filters.intern_id !== 'all'
                                        ? interns.find(
                                            (intern) => String(intern.id) === String(filters.intern_id)
                                        )?.name || 'Cualquiera'
                                        : 'Cualquiera'}
                                </SelectValue>
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

                    <div className="space-y-1 lg:min-w-[110px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Desde
                        </label>
                        <DatePicker
                            value={filters.due_from || ''}
                            onChange={(value) => onFilterChange('due_from', value)}
                            className="h-8 border-sidebar/20 bg-card text-[11px] text-foreground rounded-lg shadow-sm"
                        />
                    </div>

                    <div className="space-y-1 lg:min-w-[110px]">
                        <label className="text-[9px] font-black tracking-widest text-[#1f4f52]/70 uppercase ml-0.5">
                            Hasta
                        </label>
                        <DatePicker
                            value={filters.due_to || ''}
                            onChange={(value) => onFilterChange('due_to', value)}
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
}
