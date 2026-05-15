import { LayoutGrid, List } from 'lucide-react';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { TaskBoardQuickFiltersSheet } from '@/components/tasks/TaskBoardQuickFiltersSheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { BoardQuickFilter, TaskViewMode } from '@/lib/task-constants';

type TasksHeaderActionsProps = {
    isTutor: boolean;
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
    isTutor,
    viewMode,
    onViewModeChange,
    boardFilter,
    boardQuickFilters,
    onBoardFilterChange,
}: TasksHeaderActionsProps) {
    return (
        <div className="flex min-w-[18rem] flex-col gap-2">
            <div className="flex items-center gap-2">
                {isTutor && (
                    <HeaderActionButton label="Nueva tarea" href="/tareas/create" />
                )}
                <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => {
                        if (value) onViewModeChange(value as TaskViewMode);
                    }}
                    className="rounded-xl border border-white/80 bg-white p-1 shadow-sm"
                >
                    <ToggleGroupItem
                        value="kanban"
                        className="h-8 min-w-[9rem] rounded-lg px-3 text-sidebar/65 transition-all data-[state=on]:bg-sidebar data-[state=on]:text-white data-[state=on]:shadow-sm"
                        aria-label="Vista kanban"
                    >
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase">
                            Tablero
                        </span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="table"
                        className="h-8 min-w-[9rem] rounded-lg px-3 text-sidebar/65 transition-all data-[state=on]:bg-sidebar data-[state=on]:text-white data-[state=on]:shadow-sm"
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
