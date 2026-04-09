import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    MessageSquareText,
    Paperclip,
    Pencil,
    UserRound,
    Users,
} from 'lucide-react';
import AssignedInternsStack from '@/components/tasks/AssignedInternsStack';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { formatDateEs } from '@/lib/date-format';
import {
    getTaskPriorityLabel,
    getTaskPriorityTone,
    getTaskStatusLabel,
    getTaskStatusTone,
} from '@/lib/task-labels';

type Props = {
    task: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canEdit?: boolean;
    canComplete?: boolean;
    completeLabel?: string;
    completeStatuses?: string[];
    onComplete?: (task: any) => void;
    onMoveTask?: (task: any, status: string) => void;
    availableStatuses?: Array<{ key: string; label: string }>;
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

const getDueMeta = (dueDate?: string | null) => {
    if (!dueDate) {
        return {
            label: 'Sin fecha definida',
            tone: 'border-border bg-muted/40 text-muted-foreground',
        };
    }

    const status = dueStatus(dueDate);

    if (status === 'overdue') {
        return {
            label: `Atrasada · ${formatDateEs(dueDate)}`,
            tone: 'border-red-200 bg-red-50 text-red-700',
        };
    }

    if (status === 'soon') {
        return {
            label: `Pronto · ${formatDateEs(dueDate)}`,
            tone: 'border-amber-200 bg-amber-50 text-amber-700',
        };
    }

    return {
        label: formatDateEs(dueDate),
        tone: 'border-border bg-muted/40 text-muted-foreground',
    };
};

export default function TaskQuickViewSheet({
    task,
    open,
    onOpenChange,
    canEdit = false,
    canComplete = false,
    completeLabel = 'Completar',
    completeStatuses = ['pending', 'in_progress'],
    onComplete,
    onMoveTask,
    availableStatuses = [],
}: Props) {
    const dueMeta = getDueMeta(task?.due_date);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full gap-0 overflow-y-auto border-l border-border/80 sm:max-w-xl"
            >
                {task ? (
                    <>
                        <SheetHeader className="space-y-3 border-b border-border/70 pb-5">
                            <div className="flex flex-wrap items-center gap-2 pr-8">
                                <Badge
                                    variant="outline"
                                    className={getTaskStatusTone(task.status)}
                                >
                                    {getTaskStatusLabel(task.status)}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={getTaskPriorityTone(
                                        task.priority,
                                    )}
                                >
                                    {getTaskPriorityLabel(task.priority)}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={dueMeta.tone}
                                >
                                    {dueMeta.label}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <SheetTitle className="text-xl leading-tight">
                                    {task.title}
                                </SheetTitle>
                                <SheetDescription className="text-sm leading-6">
                                    {task.description ||
                                        'Sin descripción disponible.'}
                                </SheetDescription>
                            </div>
                        </SheetHeader>

                        <div className="space-y-6 p-4">
                            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                    <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Contexto
                                    </p>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <ClipboardList className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Tipo
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {task.practice_type?.name ||
                                                        'Sin tipo'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <UserRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Creada por
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {task.creator?.name ||
                                                        'Sin creador visible'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Entrega
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {task.due_date
                                                        ? formatDateEs(
                                                              task.due_date,
                                                          )
                                                        : 'Sin fecha de entrega'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                    <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Señales rápidas
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                                            <p className="text-[11px] text-muted-foreground">
                                                Comentarios
                                            </p>
                                            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                                <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                                                {Number(
                                                    task.comments_count ?? 0,
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                                            <p className="text-[11px] text-muted-foreground">
                                                Adjuntos
                                            </p>
                                            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                {Number(
                                                    task.attachments_count ?? 0,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-border/70 bg-card p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Becarios asignados
                                        </h3>
                                    </div>
                                    <AssignedInternsStack
                                        interns={task.interns || []}
                                    />
                                </div>
                                {task.interns?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {task.interns.map((intern: any) => (
                                            <span
                                                key={intern.id}
                                                className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs text-foreground"
                                            >
                                                {intern.user?.name ||
                                                    `Becario #${intern.id}`}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Esta tarea todavía no tiene becarios
                                        asignados.
                                    </p>
                                )}
                            </section>

                            {task &&
                                onMoveTask &&
                                availableStatuses.length > 0 && (
                                    <section className="rounded-xl border border-border/70 bg-card p-4">
                                        <div className="mb-3">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Mover a otra columna
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Cambio rápido de estado sin
                                                arrastrar.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {availableStatuses
                                                .filter(
                                                    (status) =>
                                                        status.key !==
                                                        task.status,
                                                )
                                                .map((status) => (
                                                    <Button
                                                        key={status.key}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            onMoveTask(
                                                                task,
                                                                status.key,
                                                            )
                                                        }
                                                    >
                                                        {status.label}
                                                    </Button>
                                                ))}
                                        </div>
                                    </section>
                                )}
                        </div>

                        <SheetFooter className="border-t border-border/70 bg-background/95">
                            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                                <Button variant="outline" asChild>
                                    <Link href={`/tareas/${task.id}`}>
                                        Ver ficha completa
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                {canEdit && (
                                    <Button variant="outline" asChild>
                                        <Link href={`/tareas/${task.id}/edit`}>
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </Link>
                                    </Button>
                                )}
                                {canComplete &&
                                    onComplete &&
                                    completeStatuses.includes(
                                        String(task.status),
                                    ) && (
                                        <Button
                                            onClick={() => onComplete(task)}
                                            className="gap-2"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {completeLabel}
                                        </Button>
                                    )}
                            </div>
                        </SheetFooter>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
