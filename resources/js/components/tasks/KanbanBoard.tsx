import React from 'react';
import {
    DndContext,
    pointerWithin,
    DragOverlay,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import KanbanTaskCard from '@/components/tasks/KanbanTaskCard';
import { DroppableColumn } from './DroppableColumn';
import { KANBAN_COLUMNS, KANBAN_WIP_LIMIT } from '@/lib/task-constants';

interface KanbanBoardProps {
    boardTasks: any[];
    tasksByStatus: Record<string, any[]>;
    sensors: any;
    activeDragTask: any | null;
    lastMoveMessage: string | null;
    highlightedTaskId: number | null;
    boardFilter: any;
    boardQuickFilters: any[];
    isIntern: boolean;
    isTutor: boolean;
    onBoardFilterChange: (filter: any) => void;
    onDragStart: (event: DragStartEvent) => void;
    onDragOver: (event: DragOverEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragCancel: () => void;
    onComplete: (task: any) => void;
    onOpenDetails: (task: any) => void;
    hoveredColumn: string | null;
    getTaskSortableId: (id: any) => string;
    getColumnDropId: (status: string) => string;
}

export function KanbanBoard({
    tasksByStatus,
    sensors,
    activeDragTask,
    lastMoveMessage,
    highlightedTaskId,
    boardFilter,
    boardQuickFilters,
    isIntern,
    isTutor,
    onBoardFilterChange,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    onComplete,
    onOpenDetails,
    hoveredColumn,
    getTaskSortableId,
    getColumnDropId,
}: KanbanBoardProps) {
    return (
        <div className="space-y-4">
            <div className="app-panel task-surface flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    {boardQuickFilters.map((filter) => (
                        <Button
                            key={filter.key}
                            type="button"
                            variant={boardFilter === filter.key ? 'default' : 'outline'}
                            size="sm"
                            className={`flex-1 min-w-[140px] h-9 gap-2 rounded-xl border shadow-sm transition-all duration-200 ${
                                boardFilter === filter.key
                                    ? 'border-sidebar bg-[linear-gradient(90deg,var(--sidebar)_0%,#244655_100%)] text-white hover:opacity-95'
                                    : 'border-border/90 bg-white text-foreground hover:border-sidebar/35 hover:bg-slate-50'
                            }`}
                            onClick={() => onBoardFilterChange(filter.key)}
                        >
                            <span className="truncate text-[11px] font-bold uppercase tracking-tight">{filter.label}</span>
                            <span
                                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${
                                    boardFilter === filter.key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                                }`}
                            >
                                {filter.count}
                            </span>
                        </Button>
                    ))}
                </div>
                <div className="hidden lg:flex flex-none items-center gap-2 text-[10px] font-medium text-muted-foreground bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Sparkles className="h-3 w-3 text-sidebar/40" />
                    <span>Filtros rápidos del tablero</span>
                </div>
            </div>

            {lastMoveMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {lastMoveMessage}
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={onDragCancel}
            >
                <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-sidebar/20">
                    <div className="flex min-w-max gap-3">
                        {KANBAN_COLUMNS.map((col, index) => (
                            <div
                                key={col.key}
                                className={`flex min-h-[32rem] w-[15.5rem] min-w-[15.5rem] flex-col rounded-2xl border-2 p-2.5 shadow-sm xl:w-auto xl:min-w-0 xl:flex-1 ${
                                    index % 2 === 0
                                        ? 'border-white/10 bg-gradient-to-br from-sidebar to-[#1f4f52] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]'
                                        : 'border-sidebar/20 bg-gradient-to-b from-white to-[#dce9e5]/30'
                                } ${
                                    tasksByStatus[col.key].length > KANBAN_WIP_LIMIT
                                        ? 'ring-2 ring-amber-300/50 border-amber-300/50'
                                        : ''
                                }`}
                            >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className={`text-sm font-semibold ${index % 2 === 0 ? 'text-white' : 'text-foreground'}`}>{col.label}</h3>
                                        <p className={`text-[11px] ${index % 2 === 0 ? 'text-white/70' : 'text-muted-foreground'}`}>
                                            {tasksByStatus[col.key].length} tareas
                                        </p>
                                    </div>
                                    {tasksByStatus[col.key].length > KANBAN_WIP_LIMIT ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    WIP
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Esta columna supera el límite sugerido de {KANBAN_WIP_LIMIT} tareas.
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : null}
                                </div>
                                <DroppableColumn
                                    id={getColumnDropId(col.key)}
                                    label={col.label}
                                    hovered={hoveredColumn === col.key}
                                    dark={index % 2 === 0}
                                >
                                    <SortableContext
                                        items={tasksByStatus[col.key].map((task) => getTaskSortableId(task.id))}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {tasksByStatus[col.key].map((task) => (
                                            <KanbanTaskCard
                                                key={task.id}
                                                task={task}
                                                canDrag={!isIntern}
                                                canEdit={!isIntern}
                                                canComplete={isTutor || isIntern}
                                                completeLabel={isTutor ? 'Completar' : 'Entregar'}
                                                completeStatuses={isTutor ? ['in_review'] : ['pending', 'in_progress']}
                                                onComplete={onComplete}
                                                onOpenDetails={onOpenDetails}
                                                highlightMove={highlightedTaskId === Number(task.id)}
                                            />
                                        ))}
                                    </SortableContext>
                                </DroppableColumn>
                            </div>
                        ))}
                    </div>
                </div>
                <DragOverlay>
                    {activeDragTask ? <KanbanTaskCard task={activeDragTask} canDrag={false} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
