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
    rightSlot?: React.ReactNode;
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
    rightSlot,
}: TaskFiltersProps) {
    return (
        <div className="rounded-xl border border-sidebar/10 bg-white p-2 shadow-sm transition-all dark:bg-slate-900/60">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    {/* Búsqueda principal */}
                    <div className="relative w-full flex-none sm:w-60">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por título..."
                            className="h-8 rounded-lg border-sidebar/10 bg-slate-50/50 pl-9 text-[11px] text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-sidebar/20"
                            value={filters.search || ''}
                            onChange={(e) =>
                                onFilterChange('search', e.target.value)
                            }
                        />
                    </div>

                    {/* Filtros de Selección (Distribuidos) */}
                    <div className="min-w-[128px] flex-1">
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) => onFilterChange('status', v)}
                        >
                            <SelectTrigger className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm transition-colors hover:bg-slate-50">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="all">
                                    Todos los estados
                                </SelectItem>
                                <SelectItem value="pending">
                                    Pendiente
                                </SelectItem>
                                <SelectItem value="in_progress">
                                    En progreso
                                </SelectItem>
                                <SelectItem value="in_review">
                                    En revisión
                                </SelectItem>
                                <SelectItem value="completed">
                                    Finalizada
                                </SelectItem>
                                <SelectItem value="rejected">
                                    Rechazada
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-[128px] flex-1">
                        <Select
                            value={filters.delivery_status || 'all'}
                            onValueChange={(v) =>
                                onFilterChange('delivery_status', v)
                            }
                        >
                            <SelectTrigger className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm transition-colors hover:bg-slate-50">
                                <SelectValue placeholder="Entrega" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="all">
                                    Todas las entregas
                                </SelectItem>
                                <SelectItem value="completed_ontime">
                                    Completada
                                </SelectItem>
                                <SelectItem value="late">Tarde</SelectItem>
                                <SelectItem value="not_delivered">
                                    No entregada
                                </SelectItem>
                                <SelectItem value="soon">Pronto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-[150px] flex-1">
                        <Select
                            value={filters.practice_type || 'all'}
                            onValueChange={(v) =>
                                onFilterChange('practice_type', v)
                            }
                        >
                            <SelectTrigger className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm transition-colors hover:bg-slate-50 [&>span]:truncate">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-sidebar/20">
                                <SelectItem value="all">
                                    Todas las categorías
                                </SelectItem>
                                {practice_types.map((type) => (
                                    <SelectItem
                                        key={type.id}
                                        value={type.id.toString()}
                                    >
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {interns.length > 0 && (
                        <div className="min-w-[150px] flex-1">
                            <Select
                                value={filters.intern_id || 'all'}
                                onValueChange={(v) =>
                                    onFilterChange('intern_id', v)
                                }
                            >
                                <SelectTrigger className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[11px] text-foreground shadow-sm transition-colors hover:bg-slate-50 [&>span]:truncate">
                                    <SelectValue placeholder="Asignado a" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-sidebar/20">
                                    <SelectItem value="all">
                                        Cualquier becario
                                    </SelectItem>
                                    {interns.map((intern) => (
                                        <SelectItem
                                            key={intern.id}
                                            value={String(intern.id)}
                                        >
                                            {intern.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Filtros de Fecha (Distribuidos) */}
                    <div className="min-w-[116px] flex-1">
                        <DatePicker
                            value={filters.due_from || ''}
                            onChange={(value) =>
                                onFilterChange('due_from', value)
                            }
                            className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[10px] text-foreground shadow-sm"
                            placeholder="Desde..."
                        />
                    </div>
                    <div className="min-w-[116px] flex-1">
                        <DatePicker
                            value={filters.due_to || ''}
                            onChange={(value) =>
                                onFilterChange('due_to', value)
                            }
                            className="h-8 w-full rounded-lg border-sidebar/10 bg-card text-[10px] text-foreground shadow-sm"
                            placeholder="Hasta..."
                        />
                    </div>

                    {/* Contador discreto */}
                    <div className="flex flex-none items-center gap-1.5 rounded-lg border border-sidebar/5 bg-slate-50 px-2 py-1 dark:bg-slate-800">
                        <span className="flex h-1 w-1 animate-pulse rounded-full bg-sidebar" />
                        <span className="text-[10px] font-bold whitespace-nowrap text-muted-foreground tabular-nums">
                            {tasksCount} / {totalTasks}
                        </span>
                    </div>
                </div>

                {rightSlot && (
                    <div className="flex flex-none items-center">
                        {rightSlot}
                    </div>
                )}
            </div>

            {activeFilterChips.length > 0 && (
                <div className="mt-1.5 border-t border-sidebar/5 pt-1.5">
                    <ActiveFilterChips
                        chips={activeFilterChips}
                        onRemove={onClearFilter}
                        onClearAll={onClearAll}
                    />
                </div>
            )}
        </div>
    );
}
