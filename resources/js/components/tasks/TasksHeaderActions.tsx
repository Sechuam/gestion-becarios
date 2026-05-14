import { LayoutGrid, List } from 'lucide-react';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { TaskViewMode } from '@/lib/task-constants';

type TasksHeaderActionsProps = {
    isTutor: boolean;
    viewMode: TaskViewMode;
    onViewModeChange: (viewMode: TaskViewMode) => void;
};

export function TasksHeaderActions({
    isTutor,
    viewMode,
    onViewModeChange,
}: TasksHeaderActionsProps) {
    return (
        <div className="flex items-center gap-3">
            {isTutor && (
                <HeaderActionButton label="Nueva tarea" href="/tareas/create" />
            )}
            <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                    if (value) onViewModeChange(value as TaskViewMode);
                }}
                className="rounded-2xl border border-white/20 bg-white/10 p-1 backdrop-blur-md"
            >
                <ToggleGroupItem
                    value="kanban"
                    className="h-9 min-w-[200px] rounded-xl px-4 text-white transition-all data-[state=on]:bg-white data-[state=on]:text-sidebar data-[state=on]:shadow-lg"
                    aria-label="Vista kanban"
                >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        Tablero
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="table"
                    className="h-9 min-w-[200px] rounded-xl px-4 text-white transition-all data-[state=on]:bg-white data-[state=on]:text-sidebar data-[state=on]:shadow-lg"
                    aria-label="Vista tabla"
                >
                    <List className="mr-2 h-4 w-4" />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        Lista
                    </span>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}
