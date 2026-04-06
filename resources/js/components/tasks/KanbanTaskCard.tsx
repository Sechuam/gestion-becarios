import { useDraggable } from '@dnd-kit/core';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateEs } from '@/lib/date-format';
import {
    getTaskPriorityLabel,
    getTaskPriorityTone,
    getTaskStatusLabel,
    getTaskStatusTone,
} from '@/lib/task-labels';

type Props = {
    task: any;
    canDrag?: boolean;
    canEdit?: boolean;
    canComplete?: boolean;
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
    onComplete,
    onOpenDetails,
    highlightMove = false,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: task.id,
            disabled: !canDrag,
        });

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;

    const dueBadge = getDueBadge(task.due_date);
    const commentsCount = Number(task.comments_count ?? 0);
    const attachmentsCount = Number(task.attachments_count ?? 0);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group rounded-xl border border-border bg-card p-4 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isDragging ? 'z-20 rotate-[1deg] shadow-xl' : ''
            } ${onOpenDetails ? 'cursor-pointer' : ''} ${
                highlightMove ? 'task-card-drop-highlight' : ''
            }`}
            onClick={() => onOpenDetails?.(task)}
        >
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

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                    variant="outline"
                    className={getTaskStatusTone(task.status)}
                >
                    {getTaskStatusLabel(task.status)}
                </Badge>
                <Badge
                    variant="outline"
                    className={getTaskPriorityTone(task.priority)}
                >
                    {getTaskPriorityLabel(task.priority)}
                </Badge>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={dueBadge.className}>
                            {dueBadge.label}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        {task.due_date
                            ? `Entrega: ${formatDateEs(task.due_date)}`
                            : 'Sin fecha de entrega'}
                    </TooltipContent>
                </Tooltip>
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

            <div className="flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                {onOpenDetails && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5"
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
                <Button variant="outline" size="sm" className="h-8 px-2.5" asChild>
                    <Link href={`/tareas/${task.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
                {canEdit && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5"
                        asChild
                    >
                        <Link href={`/tareas/${task.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
                {canComplete && onComplete && task.status !== 'completed' && (
                    <Button
                        size="sm"
                        className="ml-auto h-8 gap-1.5 px-3"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onComplete(task);
                        }}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Completar
                    </Button>
                )}
            </div>
        </div>
    );
}
