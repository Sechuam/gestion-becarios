import { DndContext, pointerWithin, DragOverlay } from '@dnd-kit/core';
import type {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    Modifier,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Sparkles, AlertTriangle } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import KanbanTaskCard from '@/components/tasks/KanbanTaskCard';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { KANBAN_COLUMNS, KANBAN_WIP_LIMIT } from '@/lib/task-constants';
import { DroppableColumn } from './DroppableColumn';

const KANBAN_SCROLL_STORAGE_KEY = 'tasks-kanban-scroll';

type KanbanScrollState = {
    boardLeft?: number;
    columns?: Record<string, number>;
};

const readKanbanScrollState = (): KanbanScrollState => {
    if (typeof window === 'undefined') return {};

    try {
        return JSON.parse(
            window.sessionStorage.getItem(KANBAN_SCROLL_STORAGE_KEY) || '{}',
        );
    } catch {
        return {};
    }
};

const writeKanbanScrollState = (state: KanbanScrollState) => {
    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.setItem(
            KANBAN_SCROLL_STORAGE_KEY,
            JSON.stringify(state),
        );
    } catch {
        // Scroll memory is a UX enhancement; storage can fail in restricted contexts.
    }
};

const getActivatorCoordinates = (event: Event) => {
    if ('clientX' in event && 'clientY' in event) {
        return {
            x: Number(event.clientX),
            y: Number(event.clientY),
        };
    }

    const touchEvent = event as TouchEvent;

    if ('touches' in event && touchEvent.touches.length > 0) {
        return {
            x: touchEvent.touches[0].clientX,
            y: touchEvent.touches[0].clientY,
        };
    }

    return null;
};

const snapDragOverlayToCursor: Modifier = ({
    activatorEvent,
    draggingNodeRect,
    transform,
}) => {
    if (!activatorEvent || !draggingNodeRect) {
        return transform;
    }

    const coordinates = getActivatorCoordinates(activatorEvent);

    if (!coordinates) {
        return transform;
    }

    const offsetX = coordinates.x - draggingNodeRect.left;
    const offsetY = coordinates.y - draggingNodeRect.top;

    return {
        ...transform,
        x: transform.x + offsetX - draggingNodeRect.width / 2,
        y: transform.y + offsetY - draggingNodeRect.height / 2,
    };
};

interface KanbanBoardProps {
    boardTasks: any[];
    tasksByStatus: Record<string, any[]>;
    sensors: any;
    activeDragTask: any | null;
    lastMoveMessage: string | null;
    highlightedTaskId: number | null;
    isIntern: boolean;
    isTutor: boolean;
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
    isIntern,
    isTutor,
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
    const boardScrollRef = useRef<HTMLDivElement | null>(null);
    const columnScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [dragOverlaySize, setDragOverlaySize] = useState<{
        width: number;
    } | null>(null);
    const columnCountsKey = useMemo(
        () =>
            KANBAN_COLUMNS.map(
                (col) => tasksByStatus[col.key]?.length ?? 0,
            ).join('|'),
        [tasksByStatus],
    );

    useEffect(() => {
        const savedScroll = readKanbanScrollState();
        const frame = window.requestAnimationFrame(() => {
            if (
                boardScrollRef.current &&
                typeof savedScroll.boardLeft === 'number'
            ) {
                boardScrollRef.current.scrollLeft = savedScroll.boardLeft;
            }

            KANBAN_COLUMNS.forEach((col) => {
                const columnNode = columnScrollRefs.current[col.key];
                const columnTop = savedScroll.columns?.[col.key];

                if (columnNode && typeof columnTop === 'number') {
                    columnNode.scrollTop = columnTop;
                }
            });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [columnCountsKey]);

    const persistBoardScroll = (left: number) => {
        writeKanbanScrollState({
            ...readKanbanScrollState(),
            boardLeft: left,
        });
    };

    const persistColumnScroll = (key: string, top: number) => {
        const savedScroll = readKanbanScrollState();

        writeKanbanScrollState({
            ...savedScroll,
            columns: {
                ...(savedScroll.columns ?? {}),
                [key]: top,
            },
        });
    };
    return (
        <div className="relative space-y-2.5">
            {lastMoveMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {lastMoveMessage}
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={(event) => {
                    const initialRect = event.active.rect.current.initial;

                    setDragOverlaySize(
                        initialRect ? { width: initialRect.width } : null,
                    );
                    onDragStart(event);
                }}
                onDragOver={onDragOver}
                onDragEnd={(event) => {
                    setDragOverlaySize(null);
                    onDragEnd(event);
                }}
                onDragCancel={() => {
                    setDragOverlaySize(null);
                    onDragCancel();
                }}
            >
                <div
                    ref={boardScrollRef}
                    onScroll={(event) =>
                        persistBoardScroll(event.currentTarget.scrollLeft)
                    }
                    className="scrollbar-thin scrollbar-thumb-sidebar/20 overflow-x-auto pb-2"
                >
                    <div className="flex min-w-max gap-3 lg:w-full lg:min-w-0">
                        {KANBAN_COLUMNS.map((col, index) => (
                            <div
                                key={col.key}
                                className={`flex h-[calc(100vh-17rem)] max-h-[38rem] min-h-[27rem] w-[14rem] min-w-[14rem] flex-col overflow-hidden rounded-xl border-2 shadow-sm lg:w-auto lg:min-w-0 lg:flex-1 ${
                                    index % 2 === 0
                                        ? 'border-slate-400 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
                                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                                } ${
                                    tasksByStatus[col.key].length >
                                    KANBAN_WIP_LIMIT
                                        ? 'border-amber-300/50 ring-2 ring-amber-300/50'
                                        : ''
                                }`}
                            >
                                {/* Header de la columna */}
                                <div
                                    className={`flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 ${
                                        index % 2 === 0
                                            ? 'bg-slate-200 dark:bg-slate-700'
                                            : 'bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {col.label}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {tasksByStatus[col.key].length}{' '}
                                            tareas
                                        </p>
                                    </div>
                                    {tasksByStatus[col.key].length >
                                    KANBAN_WIP_LIMIT ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    WIP
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Esta columna supera el límite
                                                sugerido de {KANBAN_WIP_LIMIT}{' '}
                                                tareas.
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : null}
                                </div>

                                {/* Cuerpo: exterior liso, interior con estilo propio en DroppableColumn */}
                                <div className="flex min-h-0 flex-1 flex-col p-1.5">
                                    <DroppableColumn
                                        id={getColumnDropId(col.key)}
                                        label={col.label}
                                        hovered={hoveredColumn === col.key}
                                        scrollRef={(node) => {
                                            columnScrollRefs.current[col.key] =
                                                node;
                                        }}
                                        onScroll={(event) =>
                                            persistColumnScroll(
                                                col.key,
                                                event.currentTarget.scrollTop,
                                            )
                                        }
                                    >
                                        <SortableContext
                                            items={tasksByStatus[col.key].map(
                                                (task) =>
                                                    getTaskSortableId(task.id),
                                            )}
                                            strategy={
                                                verticalListSortingStrategy
                                            }
                                        >
                                            {tasksByStatus[col.key].map(
                                                (task) => (
                                                    <KanbanTaskCard
                                                        key={task.id}
                                                        task={task}
                                                        canDrag={!isIntern}
                                                        canEdit={!isIntern}
                                                        canComplete={
                                                            isTutor || isIntern
                                                        }
                                                        completeLabel={
                                                            isTutor
                                                                ? 'Completar'
                                                                : 'Entregar'
                                                        }
                                                        completeStatuses={
                                                            isTutor
                                                                ? ['in_review']
                                                                : [
                                                                      'pending',
                                                                      'in_progress',
                                                                  ]
                                                        }
                                                        onComplete={onComplete}
                                                        onOpenDetails={
                                                            onOpenDetails
                                                        }
                                                        highlightMove={
                                                            highlightedTaskId ===
                                                            Number(task.id)
                                                        }
                                                    />
                                                ),
                                            )}
                                        </SortableContext>
                                    </DroppableColumn>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <DragOverlay
                    adjustScale={false}
                    modifiers={[snapDragOverlayToCursor]}
                >
                    {activeDragTask ? (
                        <div
                            style={{
                                width: dragOverlaySize?.width,
                            }}
                        >
                            <KanbanTaskCard
                                task={activeDragTask}
                                canDrag={false}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
