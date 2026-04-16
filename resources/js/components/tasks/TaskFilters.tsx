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
        <div className="space-y-4">
            <div className="filter-panel space-y-4 p-5">
                {/* Fila 1: Búsqueda */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative max-w-md min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por título..."
                            className="border-sidebar/40 bg-background pl-9 text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors"
                            value={filters.search || ''}
                            onChange={(e) =>
                                onFilterChange('search', e.target.value)
                            }
                        />
                    </div>

                    <p className="ml-auto text-sm font-medium whitespace-nowrap text-muted-foreground">
                        Mostrando {tasksCount} de {totalTasks} tareas
                    </p>
                </div>

                {/* Fila 2: Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Estado
                        </label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => onFilterChange('status', v)}
                        >
                            <SelectTrigger className="w-[160px] border-sidebar/40 bg-background text-foreground">
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
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="in_progress">En progreso</SelectItem>
                                <SelectItem value="in_review">En revisión</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                                <SelectItem value="rejected">Rechazada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Tipo
                        </label>
                        <Select
                            value={filters.practice_type || 'all'}
                            onValueChange={(v) => onFilterChange('practice_type', v)}
                        >
                            <SelectTrigger className="w-[220px] border-sidebar/40 bg-background text-foreground [&>span]:truncate">
                                <SelectValue>
                                    {filters.practice_type && filters.practice_type !== 'all'
                                        ? practice_types.find(
                                            (p) => p.id.toString() === filters.practice_type?.toString()
                                        )?.name
                                        : 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                {practice_types.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Becario
                        </label>
                        <Select
                            value={filters.intern_id || 'all'}
                            onValueChange={(v) => onFilterChange('intern_id', v)}
                        >
                            <SelectTrigger className="w-[200px] border-sidebar/40 bg-background text-foreground [&>span]:truncate">
                                <SelectValue>
                                    {filters.intern_id && filters.intern_id !== 'all'
                                        ? interns.find(
                                            (intern) => String(intern.id) === String(filters.intern_id)
                                        )?.name || 'Todos'
                                        : 'Todos'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los becarios</SelectItem>
                                {interns.map((intern) => (
                                    <SelectItem key={intern.id} value={String(intern.id)}>
                                        {intern.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Desde
                        </label>
                        <DatePicker
                            value={filters.due_from || ''}
                            onChange={(value) => onFilterChange('due_from', value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Hasta
                        </label>
                        <DatePicker
                            value={filters.due_to || ''}
                            onChange={(value) => onFilterChange('due_to', value)}
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
