import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
    id: string;
    label: string;
    hovered?: boolean;
    children: React.ReactNode;
}

export function DroppableColumn({
    id,
    label,
    hovered = false,
    children,
}: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`relative flex min-h-[24rem] flex-1 flex-col rounded-2xl transition-all border border-sidebar/20 bg-background shadow-sm ${
                isOver || hovered ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-sidebar/30'
            }`}
        >
            {(isOver || hovered) && (
                <div className="absolute top-2 left-2 right-2 z-10 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary backdrop-blur-sm pointer-events-none">
                    Suelta para mover a {label.toLowerCase()}
                </div>
            )}
            <div className={`flex flex-1 flex-col ${isOver || hovered ? 'pt-12' : ''} transition-all`}>
                {children}
            </div>
        </div>
    );
}
