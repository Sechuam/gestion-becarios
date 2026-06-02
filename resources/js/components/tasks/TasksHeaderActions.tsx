import { LayoutGrid, List } from 'lucide-react';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { TaskBoardQuickFiltersSheet } from '@/components/tasks/TaskBoardQuickFiltersSheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { BoardQuickFilter, TaskViewMode } from '@/lib/task-constants';

type TasksHeaderActionsProps = {
    canCreateTasks: boolean;
    viewMode: TaskViewMode;
    onViewModeChange: (viewMode: TaskViewMode) => void;
    boardFilter: BoardQuickFilter;
    boardQuickFilters: Array<{
        key: BoardQuickFilter;
        label: string;
        tooltip?: string;
        count: number;
    }>;
    onBoardFilterChange: (filter: BoardQuickFilter) => void;
};

export function TasksHeaderActions({
    canCreateTasks,
    viewMode,
    onViewModeChange,
    boardFilter,
    boardQuickFilters,
    onBoardFilterChange,
}: TasksHeaderActionsProps) {
    return (
        <div className="flex min-w-[18rem] flex-col gap-2">
            <div className="flex items-center gap-2">
                {canCreateTasks && (
                    <HeaderActionButton
                        label="Nueva tarea"
                        href="/tareas/create"
                    />
                )}
                <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => {
                        if (value) onViewModeChange(value as TaskViewMode);
                    }}
                    className="rounded-xl border border-white/70 bg-white/92 p-1 shadow-sm"
                >
                    <ToggleGroupItem
                        value="kanban"
                        className="h-8 min-w-[9rem] rounded-lg px-3 text-sidebar/65 transition-all data-[state=on]:bg-[#d9e9e4] data-[state=on]:text-[#315d58] data-[state=on]:shadow-sm dark:data-[state=on]:bg-slate-700 dark:data-[state=on]:text-white"
                        aria-label="Vista kanban"
                    >
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase">
                            Tablero
                        </span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="table"
                        className="h-8 min-w-[9rem] rounded-lg px-3 text-sidebar/65 transition-all data-[state=on]:bg-[#d9e9e4] data-[state=on]:text-[#315d58] data-[state=on]:shadow-sm dark:data-[state=on]:bg-slate-700 dark:data-[state=on]:text-white"
                        aria-label="Vista tabla"
                    >
                        <List className="mr-2 h-4 w-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase">
                            Lista
                        </span>
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <TaskBoardQuickFiltersSheet
                activeFilter={boardFilter}
                filters={boardQuickFilters}
                onFilterChange={onBoardFilterChange}
            />
        </div>
    );
}
