import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
    id: string;
    label: string;
    hovered?: boolean;
    scrollRef?: (node: HTMLDivElement | null) => void;
    onScroll?: React.UIEventHandler<HTMLDivElement>;
    children: React.ReactNode;
}

export function DroppableColumn({
    id,
    label,
    hovered = false,
    scrollRef,
    onScroll,
    children,
}: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border transition-all ${
                isOver || hovered
                    ? 'border-sidebar/40 ring-2 ring-sidebar/15'
                    : 'border-slate-300/60'
            }`}
            style={{
                backgroundColor: '#fafafa',
                backgroundImage:
                    'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(148,163,184,0.18) 5px, rgba(148,163,184,0.18) 6px)',
            }}
        >
            {(isOver || hovered) && (
                <div className="pointer-events-none absolute top-2 right-2 left-2 z-10 rounded-lg border border-sidebar/20 bg-white/90 px-3 py-2 text-center text-xs font-medium text-sidebar backdrop-blur-sm">
                    Suelta para mover a {label.toLowerCase()}
                </div>
            )}
            <div
                ref={scrollRef}
                onScroll={onScroll}
                className={`scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent min-h-0 flex-1 overflow-y-auto p-1 ${
                    isOver || hovered ? 'pt-12' : ''
                } transition-all`}
            >
                <div className="flex min-h-full flex-col gap-2 pb-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
