import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MessageSquareReply, Pencil, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';
import { getTaskPriorityLabel, getTaskStatusLabel } from '@/lib/task-labels';
import type { BreadcrumbItem } from '@/types/navigation';

type CommentItem = {
    id: number;
    comment: string;
    created_at?: string | null;
    edited_at?: string | null;
    user?: {
        id: number;
        name: string;
    } | null;
    replies: Array<{
        id: number;
        comment: string;
        created_at?: string | null;
        edited_at?: string | null;
        user?: {
            id: number;
            name: string;
        } | null;
    }>;
};

type StatusLogItem = {
    id: number;
    from_status?: string | null;
    to_status: string;
    reason?: string | null;
    changed_at?: string | null;
    user?: {
        id: number;
        name: string;
    } | null;
};

type Props = {
    task: any;
    attachments: any[];
    is_assigned: boolean;
    comments: CommentItem[];
    status_logs: StatusLogItem[];
};

export default function Show({
    task,
    attachments = [],
    is_assigned,
    comments = [],
    status_logs = [],
}: Props) {
    const { auth } = usePage().props as any;
    const userId = Number(auth?.user?.id);
    const commentForm = useForm({
        comment: '',
        parent_id: null as number | null,
    });
    const attachmentForm = useForm({ attachments: [] as File[] });
    const completeForm = useForm({});
    const rejectForm = useForm({ status: 'rejected', reject_reason: '' });
    const isTutor = auth?.user?.roles?.includes('tutor');
    const isIntern = auth?.user?.roles?.includes('intern');
    const canReject =
        !isIntern &&
        ['pending', 'in_progress', 'in_review'].includes(String(task.status));
    const canSubmitTask =
        is_assigned && ['pending', 'in_progress'].includes(String(task.status));
    const canTutorComplete = isTutor && String(task.status) === 'in_review';
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [logPage, setLogPage] = useState(1);
    const logsPerPage = 3;
    const totalLogPages = Math.ceil(status_logs.length / logsPerPage);
    const displayedLogs = status_logs.slice(
        (logPage - 1) * logsPerPage,
        logPage * logsPerPage,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tareas', href: '/tareas' },
        { title: task.title, href: `/tareas/${task.id}` },
    ];

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(`/tareas/${task.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.reset();
                setReplyTo(null);
            },
        });
    };

    const submitAttachments = (e: React.FormEvent) => {
        e.preventDefault();
        attachmentForm.post(`/tareas/${task.id}/attachments`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => attachmentForm.reset(),
        });
    };

    const submitTask = () => {
        completeForm.post(`/tareas/${task.id}/complete`, {
            preserveScroll: true,
        });
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.patch(`/tareas/${task.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectForm(false);
                rejectForm.reset('reject_reason');
            },
        });
    };

    const startReply = (commentId: number) => {
        setEditingId(null);
        setReplyTo(commentId);
        commentForm.setData({
            comment: '',
            parent_id: commentId,
        });
    };

    const cancelReply = () => {
        setReplyTo(null);
        commentForm.setData({
            comment: '',
            parent_id: null,
        });
    };

    const startEdit = (commentId: number, value: string) => {
        setReplyTo(null);
        setEditingId(commentId);
        setEditingValue(value);
    };

    const saveEdit = (commentId: number) => {
        router.patch(
            `/tareas/${task.id}/comments/${commentId}`,
            { comment: editingValue },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    setEditingValue('');
                },
            },
        );
    };

    const deleteComment = (commentId: number) => {
        if (!confirm('¿Seguro que quieres eliminar este comentario?')) return;

        router.delete(`/tareas/${task.id}/comments/${commentId}`, {
            preserveScroll: true,
        });
    };

    const renderCommentActions = (comment: {
        id: number;
        comment: string;
        user?: { id: number } | null;
    }) => {
        if (Number(comment.user?.id) !== userId) {
            return null;
        }

        return (
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(comment.id, comment.comment)}
                >
                    <Pencil className="h-4 w-4" />
                    Editar
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteComment(comment.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                </Button>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tarea: ${task.title}`} />

            <div className="w-full space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title">{task.title}</h1>
                        <p className="page-subtitle">
                            {task.description || 'Sin descripción'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(canSubmitTask || canTutorComplete) && (
                            <Button
                                onClick={submitTask}
                                disabled={completeForm.processing}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {canTutorComplete
                                    ? 'Marcar completada'
                                    : 'Entregar'}
                            </Button>
                        )}
                        {canReject && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setShowRejectForm((current) => !current)
                                }
                            >
                                <XCircle className="h-4 w-4" />
                                Rechazar
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/tareas">Volver</Link>
                        </Button>
                    </div>
                </div>

                {showRejectForm && (
                    <form
                        onSubmit={submitReject}
                        className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4"
                    >
                        <Label htmlFor="reject_reason">
                            Motivo del rechazo
                        </Label>
                        <textarea
                            id="reject_reason"
                            value={rejectForm.data.reject_reason}
                            onChange={(e) =>
                                rejectForm.setData(
                                    'reject_reason',
                                    e.target.value,
                                )
                            }
                            className="min-h-[100px] w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-red-300"
                            placeholder="Explica por qué se rechaza la tarea y qué debe corregirse."
                        />
                        {rejectForm.errors.reject_reason && (
                            <p className="text-xs text-red-600">
                                {rejectForm.errors.reject_reason}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowRejectForm(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={rejectForm.processing}
                                variant="destructive"
                            >
                                Confirmar rechazo
                            </Button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <h2 className="text-sm font-semibold text-foreground">
                            Detalles
                        </h2>
                        <div className="text-sm">
                            <span className="text-muted-foreground">
                                Estado:
                            </span>{' '}
                            <span className="font-medium">
                                {getTaskStatusLabel(task.status)}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">
                                Prioridad:
                            </span>{' '}
                            <span className="font-medium">
                                {getTaskPriorityLabel(task.priority)}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">
                                Entrega:
                            </span>{' '}
                            <span className="font-medium">
                                {formatDateEs(task.due_date)}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Tipo:</span>{' '}
                            <span className="font-medium">
                                {task.practice_type?.name || '—'}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">
                                Creada por:
                            </span>{' '}
                            <span className="font-medium">
                                {task.creator?.name || '—'}
                            </span>
                        </div>
                        {String(task.status) === 'rejected' &&
                            task.reject_reason && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <p className="font-semibold">Motivo rechazo</p>
                                <p className="mt-1">{task.reject_reason}</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2 dark:border-slate-700/70 dark:bg-slate-900/60">
                        <h2 className="mb-3 text-sm font-semibold text-foreground">
                            Becarios asignados
                        </h2>
                        {task.interns?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {task.interns.map((intern: any) => (
                                    <span
                                        key={intern.id}
                                        className="rounded-full border px-3 py-1 text-xs"
                                    >
                                        {intern.user?.name ||
                                            `Becario #${intern.id}`}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Sin asignados
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <h2 className="text-sm font-semibold text-foreground">
                            Comentarios
                        </h2>
                        {comments.length ? (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="rounded-lg border border-border/70 p-4 text-sm"
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <div className="text-xs text-muted-foreground">
                                                {comment.user?.name ||
                                                    'Usuario'}{' '}
                                                ·{' '}
                                                {formatDateTimeEs(
                                                    comment.created_at,
                                                )}
                                                {comment.edited_at && (
                                                    <span>
                                                        {' '}
                                                        · editado{' '}
                                                        {formatDateTimeEs(
                                                            comment.edited_at,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {renderCommentActions(comment)}
                                        </div>
                                        {editingId === comment.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editingValue}
                                                    onChange={(e) =>
                                                        setEditingValue(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[90px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            saveEdit(comment.id)
                                                        }
                                                    >
                                                        Guardar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>{comment.comment}</p>
                                        )}

                                        <div className="mt-3 flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    startReply(comment.id)
                                                }
                                            >
                                                <MessageSquareReply className="h-4 w-4" />
                                                Responder
                                            </Button>
                                        </div>

                                        {replyTo === comment.id && (
                                            <form
                                                onSubmit={submitComment}
                                                className="mt-3 space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3"
                                            >
                                                <textarea
                                                    value={
                                                        commentForm.data.comment
                                                    }
                                                    onChange={(e) =>
                                                        commentForm.setData(
                                                            'comment',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[90px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                                                    placeholder="Escribe una respuesta..."
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={
                                                            commentForm.processing
                                                        }
                                                    >
                                                        Publicar respuesta
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={cancelReply}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </form>
                                        )}

                                        {comment.replies.length > 0 && (
                                            <div className="mt-4 space-y-3 border-l-2 border-border pl-4">
                                                {comment.replies.map(
                                                    (reply) => (
                                                        <div
                                                            key={reply.id}
                                                            className="rounded-lg border border-border/60 bg-muted/10 p-3"
                                                        >
                                                            <div className="mb-1 flex items-center justify-between gap-3">
                                                                <div className="text-xs text-muted-foreground">
                                                                    {reply.user
                                                                        ?.name ||
                                                                        'Usuario'}{' '}
                                                                    ·{' '}
                                                                    {formatDateTimeEs(
                                                                        reply.created_at,
                                                                    )}
                                                                    {reply.edited_at && (
                                                                        <span>
                                                                            {' '}
                                                                            ·
                                                                            editado{' '}
                                                                            {formatDateTimeEs(
                                                                                reply.edited_at,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {renderCommentActions(
                                                                    reply,
                                                                )}
                                                            </div>
                                                            {editingId ===
                                                            reply.id ? (
                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        value={
                                                                            editingValue
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setEditingValue(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                saveEdit(
                                                                                    reply.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            Guardar
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                setEditingId(
                                                                                    null,
                                                                                )
                                                                            }
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p>
                                                                    {
                                                                        reply.comment
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aún no hay comentarios.
                            </p>
                        )}

                        {replyTo === null && (
                            <form
                                onSubmit={submitComment}
                                className="space-y-3"
                            >
                                <Label htmlFor="comment">
                                    Añadir comentario
                                </Label>
                                <textarea
                                    id="comment"
                                    value={commentForm.data.comment}
                                    onChange={(e) =>
                                        commentForm.setData(
                                            'comment',
                                            e.target.value,
                                        )
                                    }
                                    className="min-h-[100px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
                                />
                                {commentForm.errors.comment && (
                                    <p className="text-xs text-red-500">
                                        {commentForm.errors.comment}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    disabled={commentForm.processing}
                                >
                                    Publicar comentario
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                            <h2 className="text-sm font-semibold text-foreground">
                                Adjuntos
                            </h2>
                            {attachments.length ? (
                                <div className="space-y-2 text-sm">
                                    {attachments.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between rounded-lg border border-border/70 p-3"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {file.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {file.mime_type} ·{' '}
                                                    {formatDateTimeEs(
                                                        file.created_at,
                                                    )}
                                                </div>
                                            </div>
                                            <a
                                                href={file.url}
                                                className="text-blue-600 hover:underline"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Ver
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Sin adjuntos.
                                </p>
                            )}

                            <form
                                onSubmit={submitAttachments}
                                className="space-y-3"
                            >
                                <Label htmlFor="attachments">
                                    Subir archivos
                                </Label>
                                <Input
                                    id="attachments"
                                    type="file"
                                    multiple
                                    onChange={(e) =>
                                        attachmentForm.setData(
                                            'attachments',
                                            Array.from(e.target.files || []),
                                        )
                                    }
                                />
                                {attachmentForm.errors.attachments && (
                                    <p className="text-xs text-red-500">
                                        {attachmentForm.errors.attachments}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    disabled={attachmentForm.processing}
                                >
                                    Subir archivos
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                            <h2 className="text-sm font-semibold text-foreground">
                                Historial de estado
                            </h2>
                            {displayedLogs.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {displayedLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="rounded-lg border border-border/70 p-3 text-sm transition-colors hover:bg-muted/5"
                                            >
                                                <p className="font-medium text-foreground">
                                                    {log.user?.name ||
                                                        'Sistema'}{' '}
                                                    ·{' '}
                                                    {formatDateTimeEs(
                                                        log.changed_at,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-muted-foreground">
                                                    {log.from_status
                                                        ? `${getTaskStatusLabel(log.from_status)} → ${getTaskStatusLabel(log.to_status)}`
                                                        : `Estado inicial: ${getTaskStatusLabel(log.to_status)}`}
                                                </p>
                                                {log.reason && (
                                                    <p className="mt-2 rounded-md bg-muted/30 p-2 text-xs text-foreground">
                                                        {log.reason}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {totalLogPages > 1 && (
                                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={logPage === 1}
                                                onClick={() =>
                                                    setLogPage((p) => p - 1)
                                                }
                                                className="h-8 px-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                <span className="ml-1 hidden sm:inline">
                                                    Anterior
                                                </span>
                                            </Button>

                                            <span className="text-xs text-muted-foreground">
                                                Página {logPage} de{' '}
                                                {totalLogPages}
                                            </span>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={logPage === totalLogPages}
                                                onClick={() =>
                                                    setLogPage((p) => p + 1)
                                                }
                                                className="h-8 px-2"
                                            >
                                                <span className="mr-1 hidden sm:inline">
                                                    Siguiente
                                                </span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Sin historial de estados.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
