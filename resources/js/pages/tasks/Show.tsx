import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';

type Props = {
    task: any;
    attachments: any[];
    is_assigned: boolean;
};

const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    in_review: 'En revisión',
    completed: 'Completada',
    rejected: 'Rechazada',
};

export default function Show({ task, attachments = [], is_assigned }: Props) {
    const commentForm = useForm({ comment: '' });
    const attachmentForm = useForm({ attachments: [] as File[] });
    const completeForm = useForm({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tareas', href: '/tareas' },
        { title: task.title, href: `/tareas/${task.id}` },
    ];

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(`/tareas/${task.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => commentForm.reset(),
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

    const markCompleted = () => {
        completeForm.post(`/tareas/${task.id}/complete`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tarea: ${task.title}`} />

            <div className="p-6 w-full bg-background text-foreground space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {task.description || 'Sin descripción'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {is_assigned && task.status !== 'completed' && (
                            <Button
                                onClick={markCompleted}
                                disabled={completeForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Marcar como completada
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/tareas">Volver</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-xl border bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-semibold text-foreground">Detalles</h2>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Estado:</span>{' '}
                            <span className="font-medium">{statusLabels[task.status] || task.status}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Prioridad:</span>{' '}
                            <span className="font-medium">{task.priority || '—'}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Entrega:</span>{' '}
                            {task.due_date ? (
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                                    dueStatus(task.due_date) === 'overdue'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : dueStatus(task.due_date) === 'soon'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-transparent text-muted-foreground border-transparent'
                                }`}>
                                    {formatDateEs(task.due_date)}
                                </span>
                            ) : (
                                <span className="font-medium">—</span>
                            )}
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Tipo:</span>{' '}
                            <span className="font-medium">{task.practice_type?.name || '—'}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Creada por:</span>{' '}
                            <span className="font-medium">{task.creator?.name || '—'}</span>
                        </div>
                    </div>

                    <div className="md:col-span-2 rounded-xl border bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-foreground mb-3">Becarios asignados</h2>
                        {task.interns?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {task.interns.map((intern: any) => (
                                    <span key={intern.id} className="rounded-full border px-3 py-1 text-xs">
                                        {intern.user?.name || `Becario #${intern.id}`}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Sin asignados</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-foreground">Comentarios</h2>
                        {task.comments?.length ? (
                            <div className="space-y-3">
                                {task.comments.map((comment: any) => (
                                    <div key={comment.id} className="rounded-lg border border-border/70 p-3 text-sm">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            {comment.user?.name || 'Usuario'} · {formatDateTimeEs(comment.created_at)}
                                        </div>
                                        <div>{comment.comment}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Aún no hay comentarios.</p>
                        )}

                        <form onSubmit={submitComment} className="space-y-3">
                            <Label htmlFor="comment">Añadir comentario</Label>
                            <textarea
                                id="comment"
                                value={commentForm.data.comment}
                                onChange={(e) => commentForm.setData('comment', e.target.value)}
                                className="min-h-[100px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
                            />
                            {commentForm.errors.comment && (
                                <p className="text-red-500 text-xs">{commentForm.errors.comment}</p>
                            )}
                            <Button type="submit" disabled={commentForm.processing}>
                                Publicar comentario
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-xl border bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-foreground">Adjuntos</h2>
                        {attachments.length ? (
                            <div className="space-y-2 text-sm">
                                {attachments.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                                        <div>
                                            <div className="font-medium">{file.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {file.mime_type} · {formatDateTimeEs(file.created_at)}
                                            </div>
                                        </div>
                                        <a href={file.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                            Ver
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Sin adjuntos.</p>
                        )}

                        <form onSubmit={submitAttachments} className="space-y-3">
                            <Label htmlFor="attachments">Subir archivos</Label>
                            <Input
                                id="attachments"
                                type="file"
                                multiple
                                onChange={(e) => attachmentForm.setData('attachments', Array.from(e.target.files || []))}
                            />
                            {attachmentForm.errors.attachments && (
                                <p className="text-red-500 text-xs">{attachmentForm.errors.attachments}</p>
                            )}
                            <Button type="submit" disabled={attachmentForm.processing}>
                                Subir archivos
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
    const dueStatus = (dueDate?: string | null) => {
        if (!dueDate) return 'none';
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const due = new Date(`${dueDate}T00:00:00`);
        if (Number.isNaN(due.getTime())) return 'none';
        const diffDays = Math.ceil((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 3) return 'soon';
        return 'none';
    };
