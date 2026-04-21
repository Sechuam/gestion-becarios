import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
    id: string;
    label: string;
    hovered?: boolean;
    dark?: boolean;
    children: React.ReactNode;
}

export function DroppableColumn({
    id,
    label,
    hovered = false,
    dark = false,
    children,
}: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`relative flex min-h-[24rem] flex-1 flex-col rounded-2xl transition-all border shadow-sm ${
                dark
                    ? 'border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_24%),repeating-linear-gradient(180deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_18px),linear-gradient(180deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.015)_100%)]'
                    : 'border-sidebar/20 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_22%),repeating-linear-gradient(180deg,rgba(15,23,42,0.03)_0px,rgba(15,23,42,0.03)_1px,transparent_1px,transparent_18px),linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(248,250,252,0.92)_100%)]'
            } ${
                isOver || hovered
                    ? dark
                        ? 'border-white/35 ring-2 ring-white/15 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_24%),repeating-linear-gradient(180deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_18px),linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)]'
                        : 'border-primary ring-2 ring-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_24%),repeating-linear-gradient(180deg,rgba(15,23,42,0.035)_0px,rgba(15,23,42,0.035)_1px,transparent_1px,transparent_18px),linear-gradient(180deg,rgba(59,130,246,0.04)_0%,rgba(255,255,255,0.92)_100%)]'
                    : ''
            }`}
        >
            {(isOver || hovered) && (
                <div className={`absolute top-2 left-2 right-2 z-10 rounded-lg px-3 py-2 text-center text-xs font-medium backdrop-blur-sm pointer-events-none ${
                    dark
                        ? 'border border-white/15 bg-white/10 text-white'
                        : 'border border-primary/20 bg-primary/10 text-primary'
                }`}>
                    Suelta para mover a {label.toLowerCase()}
                </div>
            )}
            <div className={`flex flex-1 flex-col ${isOver || hovered ? 'pt-12' : ''} transition-all`}>
                {children}
            </div>
        </div>
    );
}
