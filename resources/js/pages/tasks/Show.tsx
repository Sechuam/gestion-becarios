import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, FilePlus, GraduationCap, History, LayoutGrid, MessageSquare, MessageSquareReply, Paperclip, Pencil, Trash2, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const [isTeamExpanded, setIsTeamExpanded] = useState(true);
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
                {/* Header / Hero Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/50 shadow-sm dark:bg-slate-800/50">
                            <Link href="/tareas">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                                {task.title}
                            </h1>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-bold ${
                                    String(task.status) === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    String(task.status) === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    String(task.status) === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${
                                        String(task.status) === 'completed' ? 'bg-emerald-500' :
                                        String(task.status) === 'pending' ? 'bg-amber-500' :
                                        String(task.status) === 'rejected' ? 'bg-red-500' :
                                        'bg-slate-500'
                                    }`} />
                                    {getTaskStatusLabel(task.status)}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    Vence el {formatDateEs(task.due_date)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {(canSubmitTask || canTutorComplete) && (
                            <Button
                                onClick={submitTask}
                                disabled={completeForm.processing}
                                className="h-10 rounded-xl bg-[#1f4f52] px-6 text-white shadow-lg shadow-[#1f4f52]/20 hover:bg-[#1f4f52]/90"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {canTutorComplete ? 'Completar Tarea' : 'Entregar Trabajo'}
                            </Button>
                        )}
                        {canReject && (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => setShowRejectForm((current) => !current)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Rechazar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Reject Form Contextual */}
                {showRejectForm && (
                    <Card className="border-red-200 bg-red-50/50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-red-800">
                                <AlertTriangle className="h-5 w-5" />
                                Motivo del Rechazo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                id="reject_reason"
                                value={rejectForm.data.reject_reason}
                                onChange={(e) => rejectForm.setData('reject_reason', e.target.value)}
                                className="min-h-[100px] w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm shadow-inner outline-none focus:ring-2 focus:ring-red-500/20"
                                placeholder="Indica qué debe corregirse o el motivo por el cual no se acepta la tarea..."
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" className="rounded-lg" onClick={() => setShowRejectForm(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={submitReject}
                                    disabled={rejectForm.processing}
                                    variant="destructive"
                                    className="rounded-lg px-6"
                                >
                                    Confirmar Rechazo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content with Tabs */}
                <Card className="app-panel overflow-hidden border-sidebar bg-white/40 shadow-xl backdrop-blur-sm dark:bg-slate-900/40">
                    <Tabs defaultValue="summary" className="w-full">
                        <div className="border-b border-sidebar bg-stone-100/40 px-6 py-2 dark:bg-slate-900/60">
                            <TabsList className="h-12 w-full justify-start gap-6 bg-transparent p-0">
                                <TabsTrigger value="summary" className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-4 text-sm font-semibold text-slate-500 shadow-none transition-none data-[state=active]:border-[#1f4f52] data-[state=active]:text-[#1f4f52] data-[state=active]:shadow-none">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Resumen
                                </TabsTrigger>
                                <TabsTrigger value="resources" className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-4 text-sm font-semibold text-slate-500 shadow-none transition-none data-[state=active]:border-[#1f4f52] data-[state=active]:text-[#1f4f52] data-[state=active]:shadow-none">
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    Recursos
                                </TabsTrigger>
                                <TabsTrigger value="comments" className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-4 text-sm font-semibold text-slate-500 shadow-none transition-none data-[state=active]:border-[#1f4f52] data-[state=active]:text-[#1f4f52] data-[state=active]:shadow-none">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Conversación
                                </TabsTrigger>
                                <TabsTrigger value="history" className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-4 text-sm font-semibold text-slate-500 shadow-none transition-none data-[state=active]:border-[#1f4f52] data-[state=active]:text-[#1f4f52] data-[state=active]:shadow-none">
                                    <History className="mr-2 h-4 w-4" />
                                    Seguimiento
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6">
                            {/* Summary Tab */}
                            <TabsContent value="summary" className="mt-0 space-y-8 outline-none">
                                <div className="grid gap-8 md:grid-cols-2">
                                    {/* Task Details */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-400">
                                                <LayoutGrid className="h-4 w-4" />
                                            </div>
                                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Planificación</h2>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Prioridad', value: getTaskPriorityLabel(task.priority), icon: <Clock className="h-4 w-4 text-[#1f4f52]" /> },
                                                { label: 'Tipo', value: task.practice_type?.name || '—', icon: <Paperclip className="h-4 w-4 text-[#1f4f52]" /> },
                                                { label: 'Creada por', value: task.creator?.name || '—', icon: <User className="h-4 w-4 text-[#1f4f52]" /> },
                                                { label: 'Vencimiento', value: formatDateEs(task.due_date), icon: <Clock className="h-4 w-4 text-[#1f4f52]" /> }
                                            ].map((item, idx) => (
                                                <div key={idx} className="rounded-xl border border-sidebar bg-stone-50/50 p-4 dark:bg-slate-800/30">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        {item.icon}
                                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
                                                    </div>
                                                    <p className="font-bold text-slate-700 dark:text-slate-200">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="rounded-xl border border-sidebar bg-white p-6 dark:bg-slate-800/50">
                                            <h3 className="mb-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Descripción del Trabajo</h3>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                {task.description || 'No se ha proporcionado una descripción detallada para esta tarea.'}
                                            </p>
                                        </div>

                                        {String(task.status) === 'rejected' && task.reject_reason && (
                                            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
                                                <div className="mb-2 flex items-center gap-2 font-black uppercase text-xs">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Motivo de Corrección Necesaria
                                                </div>
                                                <p className="text-sm italic">{task.reject_reason}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assigned Interns */}
                                    <div className="space-y-6">
                                        <div 
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-400">
                                                    <GraduationCap className="h-4 w-4" />
                                                </div>
                                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Equipo Asignado</h2>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isTeamExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                            </div>
                                        </div>

                                        {isTeamExpanded && (
                                            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {task.interns?.length ? (
                                                    task.interns.map((intern: any) => (
                                                        <div key={intern.id} className="flex items-center justify-between rounded-xl border border-sidebar bg-white p-4 transition-all hover:border-[#1f4f52] hover:shadow-md dark:bg-slate-800/40">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300 font-bold">
                                                                    {intern.user?.name?.charAt(0) || 'B'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 dark:text-emerald-400">{intern.user?.name || `Becario #${intern.id}`}</p>
                                                                    <p className="text-xs text-slate-400">{intern.center?.name || 'Sin centro'}</p>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm" asChild className="rounded-lg hover:bg-stone-100">
                                                                <Link href={`/interns/${intern.id}`}>Ver Perfil</Link>
                                                            </Button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                                        <div className="mb-2 rounded-full bg-stone-50 p-4 dark:bg-slate-800">
                                                            <User className="h-8 w-8 opacity-20" />
                                                        </div>
                                                        <p className="text-sm font-medium">No hay becarios asignados a esta tarea.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Resources Tab */}
                            <TabsContent value="resources" className="mt-0 outline-none">
                                <div className="grid gap-8 md:grid-cols-3">
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Documentos y Archivos</h2>
                                            <span className="text-xs font-bold text-slate-400 uppercase">{attachments.length} Archivos</span>
                                        </div>

                                        <div className="grid gap-3">
                                            {attachments.length ? (
                                                attachments.map((file) => (
                                                    <div key={file.id} className="group flex items-center justify-between rounded-xl border border-sidebar bg-white p-4 shadow-sm transition-all hover:bg-stone-50 dark:bg-slate-800/40">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f4f52]/10 text-[#1f4f52]">
                                                                <Paperclip className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 dark:text-slate-200">{file.name}</p>
                                                                <p className="text-xs text-slate-400 uppercase tracking-tighter">
                                                                    {file.mime_type} • {formatDateTimeEs(file.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" asChild className="rounded-full opacity-0 transition-opacity hover:bg-white group-hover:opacity-100">
                                                            <a href={file.url} target="_blank" rel="noreferrer">
                                                                <Download className="h-5 w-5 text-[#1f4f52]" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-xl border-2 border-dashed border-sidebar py-12 text-center">
                                                    <Paperclip className="mx-auto h-12 w-12 text-slate-200" />
                                                    <p className="mt-4 text-sm font-medium text-slate-400">No se han subido archivos adjuntos para esta tarea.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 rounded-2xl bg-stone-50/50 p-6 dark:bg-slate-800/30">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-[#1f4f52]">Gestionar Entregas</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed">Sube archivos complementarios, capturas de pantalla o reportes finales de la tarea.</p>

                                        <form onSubmit={submitAttachments} className="space-y-4 pt-2">
                                            <div className="relative cursor-pointer rounded-xl border-2 border-dashed border-stone-200 bg-white p-4 transition-colors hover:border-[#1f4f52]/50 group dark:bg-slate-800">
                                                <Input
                                                    id="attachments"
                                                    type="file"
                                                    multiple
                                                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                                                    onChange={(e) => attachmentForm.setData('attachments', Array.from(e.target.files || []))}
                                                />
                                                <div className="flex flex-col items-center text-center">
                                                    <FilePlus className="mb-2 h-8 w-8 text-[#1f4f52]/40 group-hover:text-[#1f4f52]" />
                                                    <p className="text-sm font-bold text-slate-600">Seleccionar archivos</p>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">PDF, PNG, JPG, ZIP</span>
                                                </div>
                                            </div>
                                            {attachmentForm.errors.attachments && (
                                                <p className="text-xs text-red-500">{attachmentForm.errors.attachments}</p>
                                            )}
                                            {attachmentForm.data.attachments.length > 0 && (
                                                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                                                    <p className="font-bold">✓ {attachmentForm.data.attachments.length} archivos seleccionados</p>
                                                </div>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={attachmentForm.processing}
                                                className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Subir Ahora
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Comments Tab */}
                            <TabsContent value="comments" className="mt-0 outline-none">
                                <div className="grid gap-8 xl:grid-cols-3">
                                    <div className="xl:col-span-2 space-y-6">
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Hilo de Conversación</h2>

                                        <div className="space-y-4">
                                            {comments.length ? (
                                                comments.map((comment) => (
                                                    <div key={comment.id} className="group rounded-2xl border border-sidebar bg-white p-6 shadow-sm transition-all hover:bg-stone-50/30 dark:bg-slate-800/40">
                                                        <div className="mb-4 flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f4f52]/10 font-bold text-[#1f4f52]">
                                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{comment.user?.name || 'Usuario'}</p>
                                                                    <p className="text-xs text-slate-400">
                                                                        {formatDateTimeEs(comment.created_at)}
                                                                        {comment.edited_at && <span className="text-[#1f4f52] italic"> • Editado</span>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="opacity-0 transition-opacity group-hover:opacity-100 italic">
                                                                {renderCommentActions(comment)}
                                                            </div>
                                                        </div>

                                                        {editingId === comment.id ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    value={editingValue}
                                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                                    className="min-h-[100px] w-full rounded-xl border border-[#1f4f52]/20 bg-stone-50 p-4 text-sm outline-none shadow-inner"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" className="rounded-lg" onClick={() => saveEdit(comment.id)}>Guardar Cambios</Button>
                                                                    <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setEditingId(null)}>Descartar</Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-slate-600 dark:text-slate-300 ml-1 leading-relaxed">{comment.comment}</p>
                                                        )}

                                                        <div className="mt-4 flex items-center gap-3">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 rounded-lg text-xs font-bold text-[#1f4f52] hover:bg-[#1f4f52]/5"
                                                                onClick={() => startReply(comment.id)}
                                                            >
                                                                <MessageSquareReply className="mr-2 h-4 w-4" />
                                                                Responder
                                                            </Button>
                                                        </div>

                                                        {/* Replies Section */}
                                                        {comment.replies.length > 0 && (
                                                            <div className="mt-6 space-y-4 border-l-2 border-stone-100 pl-6 dark:border-slate-700">
                                                                {comment.replies.map((reply) => (
                                                                    <div key={reply.id} className="relative rounded-xl border border-sidebar bg-stone-50/50 p-4 dark:bg-slate-800/20">
                                                                        <div className="mb-2 flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{reply.user?.name || 'Usuario'}</p>
                                                                                <span className="text-[10px] text-slate-400 tracking-tighter uppercase">{formatDateTimeEs(reply.created_at)}</span>
                                                                            </div>
                                                                            <div className="scale-75 origin-right">
                                                                                {renderCommentActions(reply)}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{reply.comment}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {replyTo === comment.id && (
                                                            <form onSubmit={submitComment} className="mt-4 space-y-3 rounded-xl border border-[#1f4f52]/10 bg-[#1f4f52]/5 p-4 animate-in fade-in duration-300">
                                                                <textarea
                                                                    value={commentForm.data.comment}
                                                                    onChange={(e) => commentForm.setData('comment', e.target.value)}
                                                                    className="min-h-[90px] w-full rounded-xl border-none bg-white p-3 text-sm shadow-sm outline-none"
                                                                    placeholder="Escribe tu respuesta aquí..."
                                                                />
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" disabled={commentForm.processing} className="rounded-lg">Enviar Respuesta</Button>
                                                                    <Button size="sm" variant="ghost" className="rounded-lg" onClick={cancelReply}>Cancelar</Button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-2xl border-2 border-dashed border-sidebar py-16 text-center">
                                                    <MessageSquare className="mx-auto h-12 w-12 text-slate-200" />
                                                    <p className="mt-4 text-sm font-medium text-slate-400">¿Tienes alguna duda o actualización? Inicia la conversación.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-2xl bg-[#1f4f52]/5 p-6 border border-[#1f4f52]/10">
                                            <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#1f4f52]">Añadir Nuevo Comentario</h3>
                                            <form onSubmit={submitComment} className="space-y-4">
                                                <textarea
                                                    id="comment"
                                                    value={commentForm.data.comment}
                                                    onChange={(e) => commentForm.setData('comment', e.target.value)}
                                                    className="min-h-[140px] w-full rounded-xl border-none bg-white p-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1f4f52]/20"
                                                    placeholder="Escribe algo importante para el equipo..."
                                                />
                                                {commentForm.errors.comment && (
                                                    <p className="text-xs text-red-500">{commentForm.errors.comment}</p>
                                                )}
                                                <Button
                                                    type="submit"
                                                    disabled={commentForm.processing}
                                                    className="w-full h-11 rounded-xl bg-[#1f4f52] text-white shadow-lg shadow-[#1f4f52]/20 hover:bg-[#1f4f52]/90"
                                                >
                                                    Publicar en el Hilo
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="mt-0 outline-none">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Historial de Estados</h2>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                            <History className="h-4 w-4" />
                                            Línea de Vida
                                        </div>
                                    </div>

                                    {displayedLogs.length > 0 ? (
                                        <div className="space-y-6">
                                            <div className="relative space-y-6 before:absolute before:left-5 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-stone-100 dark:before:bg-slate-800">
                                                {displayedLogs.map((log) => (
                                                    <div key={log.id} className="relative pl-12 group transition-all">
                                                        <div className={`absolute left-0 top-1.5 h-10 w-10 flex items-center justify-center rounded-xl border-4 border-white shadow-sm dark:border-slate-900 group-hover:scale-110 transition-transform ${
                                                            String(log.to_status) === 'completed' ? 'bg-emerald-500 text-white' :
                                                            String(log.to_status) === 'pending' ? 'bg-amber-500 text-white' :
                                                            String(log.to_status) === 'rejected' ? 'bg-red-500 text-white' :
                                                            'bg-slate-500 text-white'
                                                        }`}>
                                                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                        </div>

                                                        <div className="rounded-2xl border border-sidebar bg-white p-5 shadow-sm transition-all hover:border-[#1f4f52]/30 dark:bg-slate-800/40">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                                <p className="font-black text-sm text-slate-800 dark:text-slate-200">
                                                                    {log.user?.name || 'Sistema'}
                                                                </p>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-md dark:bg-slate-700/50">
                                                                    {formatDateTimeEs(log.changed_at)}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3 text-sm">
                                                                {log.from_status ? (
                                                                    <>
                                                                        <span className="rounded-lg bg-stone-100 px-2 py-1 font-bold text-slate-500 line-through dark:bg-slate-700/50">
                                                                            {getTaskStatusLabel(log.from_status)}
                                                                        </span>
                                                                        <ChevronRight className="h-4 w-4 text-slate-300" />
                                                                        <span className={`rounded-lg px-2 py-1 font-black ${
                                                                            String(log.to_status) === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                            String(log.to_status) === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                            String(log.to_status) === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                            'bg-slate-100 text-slate-700'
                                                                        }`}>
                                                                            {getTaskStatusLabel(log.to_status)}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                                                                        Apertura de Tarea:
                                                                        <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-700/50">
                                                                            {getTaskStatusLabel(log.to_status)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {log.reason && (
                                                                <div className="mt-4 rounded-xl border border-sidebar bg-stone-50/50 p-3 italic text-xs text-slate-600 dark:bg-slate-700/30">
                                                                    "{log.reason}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination Consistente */}
                                            {totalLogPages > 1 && (
                                                <div className="flex items-center justify-between border-t border-sidebar pt-6 pb-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={logPage === 1}
                                                        onClick={() => setLogPage((p) => p - 1)}
                                                        className="h-9 gap-2 rounded-xl border border-sidebar bg-white hover:bg-stone-50 dark:bg-slate-800"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Anterior
                                                    </Button>

                                                    <div className="flex items-center gap-1.5">
                                                        {[...Array(totalLogPages)].map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setLogPage(i + 1)}
                                                                className={`h-2 w-2 rounded-full transition-all ${
                                                                    logPage === i + 1 ? 'w-6 bg-[#1f4f52]' : 'bg-stone-200 dark:bg-slate-700'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={logPage === totalLogPages}
                                                        onClick={() => setLogPage((p) => p + 1)}
                                                        className="h-9 gap-2 rounded-xl border border-sidebar bg-white hover:bg-stone-50 dark:bg-slate-800"
                                                    >
                                                        Siguiente
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border-2 border-dashed border-sidebar py-16 text-center">
                                            <History className="mx-auto h-12 w-12 text-slate-200" />
                                            <p className="mt-4 text-sm font-medium text-slate-400">No hay registros de actividad todavía.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </Card>
            </div>
        </AppLayout>
    );
}
