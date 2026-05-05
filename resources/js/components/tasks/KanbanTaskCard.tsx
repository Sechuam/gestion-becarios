import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Eye,
    GripVertical,
    MessageSquareText,
    Paperclip,
    Pencil,
} from 'lucide-react';
import AssignedInternsStack from '@/components/tasks/AssignedInternsStack';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDateEs } from '@/lib/date-format';
import {
    getTaskPriorityLabel,
    getTaskPriorityTone,
    getTaskStatusLabel,
    getTaskStatusTone,
} from '@/lib/task-labels';

const getTaskSortableId = (taskId: number | string) => `task-${taskId}`;

type Props = {
    task: any;
    canDrag?: boolean;
    canEdit?: boolean;
    canComplete?: boolean;
    completeLabel?: string;
    completeStatuses?: string[];
    onComplete?: (task: any) => void;
    onOpenDetails?: (task: any) => void;
    highlightMove?: boolean;
};

const dueStatus = (dueDate?: string | null) => {
    if (!dueDate) return 'none';
    const today = new Date();
    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );
    const due = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(due.getTime())) return 'none';
    const diffDays = Math.ceil(
        (due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'soon';
    return 'none';
};

const getDueBadge = (dueDate?: string | null) => {
    const status = dueStatus(dueDate);
    if (!dueDate) {
        return {
            label: 'Sin fecha',
            className: 'border-border bg-muted/40 text-muted-foreground',
        };
    }

    if (status === 'overdue') {
        return {
            label: 'Atrasada',
            className: 'border-red-200 bg-red-50 text-red-700',
        };
    }

    if (status === 'soon') {
        return {
            label: 'Pronto',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
        };
    }

    return {
        label: formatDateEs(dueDate),
        className: 'border-border bg-muted/40 text-muted-foreground',
    };
};

export default function KanbanTaskCard({
    task,
    canDrag = true,
    canEdit = false,
    canComplete = false,
    completeLabel = 'Completar',
    completeStatuses = ['pending', 'in_progress'],
    onComplete,
    onOpenDetails,
    highlightMove = false,
}: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: getTaskSortableId(task.id),
        disabled: !canDrag,
        data: {
            type: 'task',
            taskId: Number(task.id),
            status: task.status,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const dueBadge = getDueBadge(task.due_date);
    const commentsCount = Number(task.comments_count ?? 0);
    const attachmentsCount = Number(task.attachments_count ?? 0);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative task-surface-soft group rounded-xl border border-border p-4 pl-5 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isDragging ? 'opacity-40 border-dashed z-0' : ''
                } ${onOpenDetails ? 'cursor-pointer' : ''} ${highlightMove ? 'task-card-drop-highlight' : ''
                }`}
            onClick={() => onOpenDetails?.(task)}
        >
            {task.practice_type?.color && (
                <div 
                    className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                    style={{ backgroundColor: task.practice_type.color }}
                />
            )}
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    {onOpenDetails ? (
                        <button
                            type="button"
                            className="block truncate text-left font-semibold text-foreground hover:underline"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onOpenDetails(task);
                            }}
                        >
                            {task.title}
                        </button>
                    ) : (
                        <Link
                            href={`/tareas/${task.id}`}
                            className="block truncate font-semibold text-foreground hover:underline"
                        >
                            {task.title}
                        </Link>
                    )}
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        {task.description || 'Sin descripción'}
                    </p>
                </div>
                {canDrag && (
                    <button
                        type="button"
                        className="mt-0.5 inline-flex shrink-0 cursor-grab items-center rounded-md border border-border/70 bg-muted/30 p-1.5 text-muted-foreground/70 shadow-sm transition hover:border-primary/30 hover:bg-primary/8 hover:text-foreground active:cursor-grabbing"
                        {...listeners}
                        {...attributes}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                        aria-label="Arrastrar tarea"
                        title="Arrastrar tarea"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Estado */}
                <div className="flex items-center gap-1.5 font-medium text-sidebar dark:text-white/80">
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", {
                        'bg-slate-300': task.status === 'pending',
                        'bg-blue-400': task.status === 'in_progress',
                        'bg-violet-400': task.status === 'in_review',
                        'bg-emerald-500': task.status === 'completed',
                        'bg-rose-500': task.status === 'rejected',
                    })} />
                    <span className="text-[10px] uppercase tracking-wider">{getTaskStatusLabel(task.status)}</span>
                </div>

                {/* Prioridad */}
                <div className="flex items-center gap-1.5 font-medium text-sidebar dark:text-white/80">
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", {
                        'bg-rose-500': task.priority === 'high',
                        'bg-amber-400': task.priority === 'medium',
                        'bg-emerald-400': task.priority === 'low',
                    })} />
                    <span className="text-[10px] uppercase tracking-wider">{getTaskPriorityLabel(task.priority)}</span>
                </div>

                {/* Entrega */}
                {task.due_date && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 font-medium text-sidebar dark:text-white/80 cursor-default">
                                {(() => {
                                    const dStatus = dueStatus(task.due_date);
                                    const isCompleted = task.status === 'completed';
                                    const isLate = isCompleted && task.completed_at && task.due_date &&
                                                   new Date(task.completed_at.split(/T| /)[0]) > new Date(task.due_date);

                                    const dotClass = isCompleted
                                        ? (isLate ? 'bg-orange-500' : 'bg-emerald-500')
                                        : dStatus === 'overdue'
                                            ? 'bg-rose-500'
                                            : dStatus === 'soon'
                                                ? 'bg-amber-400'
                                                : 'bg-sidebar/20';

                                    const smartLabel = isCompleted
                                        ? (isLate ? 'Tarde' : 'Completada')
                                        : dStatus === 'overdue'
                                            ? 'No entregada'
                                            : dStatus === 'soon'
                                                ? 'Pronto'
                                                : formatDateEs(task.due_date);

                                    return (
                                        <>
                                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass)} />
                                            <span className="text-[10px] uppercase tracking-wider">{smartLabel}</span>
                                        </>
                                    );
                                })()}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-xl border-sidebar/20 font-medium">
                            Fecha límite: {formatDateEs(task.due_date)}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                        {task.practice_type?.name || 'Sin tipo'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        {task.creator?.name
                            ? `Creada por ${task.creator.name}`
                            : 'Sin creador visible'}
                    </p>
                </div>
                <AssignedInternsStack interns={task.interns || []} />
            </div>

            <div className="mb-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    {commentsCount}
                </span>
                <span className="inline-flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" />
                    {attachmentsCount}
                </span>
            </div>

            <div className="space-y-2 opacity-80 transition-opacity group-hover:opacity-100">
                <div className="flex flex-wrap items-center gap-2">
                    {onOpenDetails && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0 px-2.5"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onOpenDetails(task);
                            }}
                            title="Vista rápida"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 px-2.5"
                        asChild
                    >
                        <Link href={`/tareas/${task.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0 px-2.5"
                            asChild
                        >
                            <Link href={`/tareas/${task.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
                {canComplete &&
                    onComplete &&
                    completeStatuses.includes(String(task.status)) && (
                        <Button
                            size="sm"
                            className="h-8 w-full gap-1.5 px-3 bg-[linear-gradient(90deg,var(--sidebar)_0%,#244655_100%)] text-white hover:opacity-95 border-0 shadow-sm"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onComplete(task);
                            }}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {completeLabel}
                        </Button>
                    )}
            </div>
        </div>
    );
}
