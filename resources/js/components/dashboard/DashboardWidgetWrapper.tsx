import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardWidgetWrapperProps {
    id: string;
    children: React.ReactNode;
    isEditing: boolean;
    className?: string;
}

export function DashboardWidgetWrapper({
    id,
    children,
    isEditing,
    className,
}: DashboardWidgetWrapperProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative',
                isDragging && 'opacity-50',
                className,
            )}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes gentle-shake {
                    0%, 100% { transform: rotate(-0.3deg) translateY(0); }
                    50% { transform: rotate(0.3deg) translateY(-1.5px); }
                }
                .animate-gentle-shake {
                    animation: gentle-shake 3s ease-in-out infinite;
                }
            `,
                }}
            />
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-2 -left-2 z-50 flex items-center gap-1"
                    >
                        <div
                            {...attributes}
                            {...listeners}
                            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-full bg-sidebar text-white shadow-lg transition-colors hover:bg-sidebar/90 active:cursor-grabbing"
                        >
                            <GripVertical className="h-4 w-4" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={cn(
                    'h-full transition-all duration-300',
                    isEditing &&
                        'animate-gentle-shake rounded-xl ring-2 ring-sidebar/20 ring-offset-4',
                )}
            >
                {children}
            </div>

            {isEditing && (
                <div className="absolute inset-0 z-40 rounded-xl bg-transparent" />
            )}
        </div>
    );
}
