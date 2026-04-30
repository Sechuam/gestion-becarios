import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, FilePlus, GraduationCap, History, LayoutGrid, MessageSquare, MessageSquareReply, Paperclip, Pencil, Plus, Trash2, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { formatDateEs, formatDateTimeEs } from '@/lib/date-format';
import { dueStatus } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
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
        avatar?: string | null;
    } | null;
    replies: Array<{
        id: number;
        comment: string;
        created_at?: string | null;
        edited_at?: string | null;
        user?: {
            id: number;
            name: string;
            avatar?: string | null;
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
        avatar?: string | null;
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
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
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
                setIsCommentModalOpen(false);
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

    const renderCommentActions = (
        comment: { id: number; comment: string; user?: { id: number } | null },
        darkTheme: boolean = false
    ) => {
        if (Number(comment.user?.id) !== userId) {
            return null;
        }

        const buttonClasses = cn(
            "h-7 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest shadow-sm transition-all flex items-center gap-1.5",
            darkTheme 
                ? "bg-white text-sidebar hover:bg-white/90 border-none" 
                : "bg-gradient-to-r from-sidebar to-[#1f4f52] text-white hover:opacity-90 border-none"
        );

        return (
            <div className="flex items-center gap-1.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={buttonClasses}
                    onClick={() => startEdit(comment.id, comment.comment)}
                >
                    <Pencil className="h-3 w-3" />
                    Editar
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={buttonClasses}
                    onClick={() => deleteComment(comment.id)}
                >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                </Button>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tarea: ${task.title}`} />

            <div className="w-full space-y-6">
                <div className="flex items-center justify-between px-2 pb-2">
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                        asChild
                    >
                        <Link href="/tareas">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
                        </Link>
                    </Button>
                </div>

                {/* HERO INTEGRADO CON GRADIENTE */}
                <ModuleHeader
                    title={task.title}
                    description={`Tarea asignada a ${task.interns?.length || 0} becarios. Estado actual: ${getTaskStatusLabel(task.status)}.`}
                    icon={<LayoutGrid className="h-6 w-6" />}
                    metrics={[
                        {
                            label: 'Prioridad',
                            value: getTaskPriorityLabel(task.priority),
                            hint: task.priority === 'high' ? 'Atención urgente' : 'Normal',
                        },
                        {
                            label: 'Vencimiento',
                            value: formatDateEs(task.due_date),
                            hint: dueStatus(task.due_date) === 'overdue' ? '¡Atrasada!' : 'Plazo vigente',
                        },
                        {
                            label: 'Estado',
                            value: getTaskStatusLabel(task.status),
                            hint: 'Actualizado recientemente',
                        },
                    ]}
                    actions={
                        <div className="flex gap-3">
                            {(canSubmitTask || canTutorComplete) && (
                                <Button
                                    onClick={submitTask}
                                    disabled={completeForm.processing}
                                    className="bg-white text-sidebar hover:bg-white/90 rounded-2xl px-6 h-10 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    {canTutorComplete ? 'Completar' : 'Entregar'}
                                </Button>
                            )}
                            {canReject && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-2xl px-6 h-10 text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md"
                                    onClick={() => setShowRejectForm((current) => !current)}
                                >
                                    <XCircle className="mr-2 h-4 w-4 text-rose-300" />
                                    Rechazar
                                </Button>
                            )}
                        </div>
                    }
                />

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
                <div className="app-panel w-full overflow-hidden border-2 border-sidebar/15 shadow-2xl">
                    <Tabs defaultValue="summary" className="w-full">
                        <div className="border-b border-sidebar/20 bg-stone-100/50 p-2">
                            <TabsList className="h-12 w-full grid grid-cols-4 gap-2 bg-transparent p-0">
                                <TabsTrigger value="summary" className="relative h-10 rounded-xl border-none bg-transparent px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 shadow-none transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg w-full">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Resumen
                                </TabsTrigger>
                                <TabsTrigger value="resources" className="relative h-10 rounded-xl border-none bg-transparent px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 shadow-none transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg w-full">
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    Recursos
                                </TabsTrigger>
                                <TabsTrigger value="comments" className="relative h-10 rounded-xl border-none bg-transparent px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 shadow-none transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg w-full">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Conversación
                                </TabsTrigger>
                                <TabsTrigger value="history" className="relative h-10 rounded-xl border-none bg-transparent px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 shadow-none transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg w-full">
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
                                                { label: 'Prioridad', value: getTaskPriorityLabel(task.priority), icon: <div className={cn("h-2 w-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]", {
                                                    'bg-white': true,
                                                })} />, primary: true },
                                                { label: 'Tipo', value: task.practice_type?.name || '—', icon: <Paperclip className="h-4 w-4 text-sidebar" /> },
                                                { label: 'Creada por', value: task.creator?.name || '—', icon: <User className="h-4 w-4 text-sidebar" /> },
                                                { label: 'Vencimiento', value: formatDateEs(task.due_date), icon: <Clock className="h-4 w-4 text-white" />, primary: true }
                                            ].map((item, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "metric-tile p-5 transition-all duration-300 hover:scale-[1.02]",
                                                        item.primary 
                                                            ? "bg-gradient-to-br from-sidebar to-[#1f4f52] border-none shadow-xl shadow-sidebar/20" 
                                                            : "bg-white border border-stone-100"
                                                    )}
                                                >
                                                    <div className="mb-3 flex items-center gap-2">
                                                        {item.icon}
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest",
                                                            item.primary ? "text-white/60" : "text-slate-400"
                                                        )}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <p className={cn(
                                                        "text-base font-black tracking-tight",
                                                        item.primary ? "text-white" : "text-slate-700"
                                                    )}>
                                                        {item.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="task-surface-soft rounded-2xl border p-6">
                                            <h3 className="mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Descripción del Trabajo</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
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
                                                        <div key={intern.id} className="task-surface-soft flex items-center justify-between rounded-2xl border p-4 transition-all hover:border-[#1f4f52] hover:shadow-lg">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="flex h-11 w-11 shrink-0 overflow-hidden items-center justify-center rounded-full border border-sidebar bg-stone-50 text-stone-600 font-bold">
                                                                    <AvatarImage src={intern.user?.avatar || ''} alt={intern.user?.name || ''} />
                                                                    <AvatarFallback className="bg-transparent text-sm">
                                                                        {intern.user?.name?.charAt(0) || 'B'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-800">{intern.user?.name || `Becario #${intern.id}`}</p>
                                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{intern.education_center?.name || 'Sin centro'}</p>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-stone-100 text-[10px] font-black uppercase tracking-widest text-[#1f4f52]">
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
                                                    <div key={file.id} className="group task-surface-soft flex items-center justify-between rounded-2xl border-none bg-gradient-to-r from-sidebar to-[#1f4f52] p-5 shadow-lg shadow-sidebar/10 transition-all hover:scale-[1.01] hover:shadow-xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                                                                <Paperclip className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-white">{file.name}</p>
                                                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                                                    {file.mime_type} • {formatDateTimeEs(file.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 opacity-0 transition-all group-hover:opacity-100">
                                                            <a href={file.url} target="_blank" rel="noreferrer">
                                                                <Download className="h-5 w-5" />
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
                                                className="w-full h-11 rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-lg shadow-sidebar/20 hover:opacity-90 transition-all font-black uppercase tracking-widest text-[10px]"
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
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-stone-50 pb-4">
                                            <div className="flex items-center gap-4">
                                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Hilo de Conversación</h2>
                                                <div className="flex h-6 items-center gap-1.5 rounded-full bg-sidebar/5 px-3 text-[9px] font-black uppercase tracking-widest text-sidebar border border-sidebar/10">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {comments.length}
                                                </div>
                                            </div>

                                            <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className="h-9 rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] px-5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-sidebar/20 transition-all hover:opacity-90">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Añadir Comentario
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[420px] rounded-[2rem] border border-sidebar/20 bg-white p-0 overflow-hidden shadow-2xl shadow-sidebar/10 ring-1 ring-black/5">
                                                    <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 text-white">
                                                        <DialogHeader>
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 mb-3 border border-white/20 backdrop-blur-md">
                                                                <MessageSquareReply className="h-5 w-5" />
                                                            </div>
                                                            <DialogTitle className="text-xl font-black uppercase tracking-widest leading-tight">
                                                                Nuevo Comentario
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                    </div>
                                                    <div className="p-6">
                                                        <form onSubmit={submitComment} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="comment" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Tu Mensaje</Label>
                                                                <textarea
                                                                    id="comment"
                                                                    value={commentForm.data.comment}
                                                                    onChange={(e) => commentForm.setData('comment', e.target.value)}
                                                                    className="min-h-[120px] w-full rounded-xl border-stone-100 bg-stone-50 p-4 text-sm shadow-inner outline-none focus:ring-2 focus:ring-sidebar/20 transition-all placeholder:text-slate-300"
                                                                    placeholder="Escribe algo importante..."
                                                                    autoFocus
                                                                />
                                                                {commentForm.errors.comment && (
                                                                    <p className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1">{commentForm.errors.comment}</p>
                                                                )}
                                                            </div>
                                                            <DialogFooter className="pt-2 flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    onClick={() => setIsCommentModalOpen(false)}
                                                                    className="rounded-xl h-10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 px-4"
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                                <Button
                                                                    type="submit"
                                                                    disabled={commentForm.processing}
                                                                    className="h-10 rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-sidebar/20 hover:opacity-90 transition-all"
                                                                >
                                                                    Publicar
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            {comments.length ? (
                                                comments.map((comment) => {
                                                    return (
                                                        <div key={comment.id} className="group rounded-3xl border border-stone-100 bg-white p-4 shadow-sm transition-all hover:shadow-md text-slate-600">
                                                            <div className="mb-3 flex items-start justify-between">
                                                                <div className="flex items-center gap-2.5">
                                                                    <Avatar className="flex h-8 w-8 shrink-0 overflow-hidden items-center justify-center rounded-full border border-sidebar bg-[#1f4f52]/10 font-bold text-[#1f4f52]">
                                                                        <AvatarImage src={comment.user?.avatar || ''} alt={comment.user?.name || ''} />
                                                                        <AvatarFallback className="bg-transparent text-xs">
                                                                            {comment.user?.name?.charAt(0) || 'U'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800">
                                                                            {comment.user?.name || 'Usuario'}
                                                                        </p>
                                                                        <p className="text-[9px] font-medium uppercase tracking-widest text-slate-400">
                                                                            {formatDateTimeEs(comment.created_at)}
                                                                            {comment.edited_at && <span className="italic ml-1 text-sidebar"> • Editado</span>}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                                                    {renderCommentActions(comment, false)}
                                                                </div>
                                                            </div>

                                                            {editingId === comment.id ? (
                                                                <div className="space-y-3">
                                                                    <textarea
                                                                        value={editingValue}
                                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                                        className="min-h-[80px] w-full rounded-xl border border-[#1f4f52]/20 bg-stone-50 p-3 text-xs outline-none shadow-inner text-slate-800"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button size="sm" className="h-8 text-[10px] uppercase font-black" onClick={() => saveEdit(comment.id)}>Guardar</Button>
                                                                        <Button size="sm" variant="ghost" className="h-8 text-[10px] uppercase font-black" onClick={() => setEditingId(null)}>Descartar</Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="ml-0.5 leading-relaxed text-sm text-slate-600">
                                                                    {comment.comment}
                                                                </p>
                                                            )}

                                                            <div className="mt-3 flex items-center gap-3">
                                                                {!replyTo && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#1f4f52] hover:bg-[#1f4f52]/5"
                                                                        onClick={() => startReply(comment.id)}
                                                                    >
                                                                        <MessageSquareReply className="mr-1.5 h-3.5 w-3.5" />
                                                                        Responder
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {/* Replies Section */}
                                                            {comment.replies.length > 0 && (
                                                                <div className="mt-4 space-y-3 border-l-2 border-stone-50 pl-4">
                                                                    {comment.replies.map((reply) => {
                                                                        return (
                                                                            <div key={reply.id} className="group relative rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-3.5 text-white shadow-lg shadow-sidebar/5">
                                                                                <div className="mb-2 flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Avatar className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/10 font-bold text-white">
                                                                                            <AvatarImage src={reply.user?.avatar || ''} alt={reply.user?.name || ''} />
                                                                                            <AvatarFallback className="bg-transparent text-[8px]">
                                                                                                {reply.user?.name?.charAt(0) || 'U'}
                                                                                            </AvatarFallback>
                                                                                        </Avatar>
                                                                                        <p className="text-xs font-bold">{reply.user?.name || 'Usuario'}</p>
                                                                                        <span className="text-[8px] tracking-widest uppercase text-white/50">
                                                                                            {formatDateTimeEs(reply.created_at)}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="scale-75 origin-right opacity-0 transition-opacity group-hover:opacity-100">
                                                                                        {renderCommentActions(reply, true)}
                                                                                    </div>
                                                                                </div>
                                                                                <p className="text-xs leading-relaxed text-white/90">{reply.comment}</p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {replyTo === comment.id && (
                                                                <form onSubmit={submitComment} className="mt-3 space-y-3 rounded-xl border border-[#1f4f52]/10 bg-[#1f4f52]/5 p-3 animate-in fade-in duration-300">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-sidebar animate-pulse" />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-sidebar">Respondiendo a {comment.user?.name}</span>
                                                                    </div>
                                                                    <textarea
                                                                        value={commentForm.data.comment}
                                                                        onChange={(e) => commentForm.setData('comment', e.target.value)}
                                                                        className="min-h-[70px] w-full rounded-xl border-none bg-white p-3 text-xs shadow-sm outline-none"
                                                                        placeholder="Escribe tu respuesta aquí..."
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button size="sm" disabled={commentForm.processing} className="h-8 text-[9px] uppercase font-black rounded-lg bg-sidebar text-white hover:bg-sidebar/90">Enviar Respuesta</Button>
                                                                        <Button size="sm" variant="ghost" className="h-8 text-[9px] uppercase font-black rounded-lg" onClick={cancelReply}>Cancelar</Button>
                                                                    </div>
                                                                </form>
                                                            )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                                        <div className="rounded-2xl border-2 border-dashed border-sidebar py-16 text-center">
                                                    <MessageSquare className="mx-auto h-12 w-12 text-slate-200" />
                                                    <p className="mt-4 text-sm font-medium text-slate-400">¿Tienes alguna duda o actualización? Inicia la conversación.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="mt-0 outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-4">
                                    {/* Columna Izquierda: Información y Paginación */}
                                    <div className="flex flex-col justify-between min-h-[400px]">
                                        <div className="space-y-6">
                                            <div className="task-surface-soft p-8 rounded-[2.5rem] border border-sidebar/10 bg-white/50">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-lg shadow-sidebar/20 mb-6">
                                                    <History className="h-6 w-6" />
                                                </div>
                                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest leading-tight">
                                                    Historial de<br />Estados
                                                </h2>
                                                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-sidebar to-[#1f4f52] rounded-full" />
                                                <p className="text-sm font-medium text-slate-400 mt-8 leading-relaxed italic">
                                                    "Cada cambio cuenta una historia sobre el progreso de este proyecto."
                                                </p>
                                                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                                                    Aquí puedes ver quién, cuándo y por qué se cambió el estado de la tarea. Las correcciones y aprobaciones quedan registradas para asegurar la transparencia del proceso.
                                                </p>
                                            </div>
                                        </div>

                                        {totalLogPages > 1 && (
                                            <div className="pt-12">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-2">
                                                        {[...Array(totalLogPages)].map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setLogPage(i + 1)}
                                                                className={`h-1.5 rounded-full transition-all ${
                                                                    logPage === i + 1 ? 'w-12 bg-gradient-to-r from-sidebar to-[#1f4f52] shadow-sm' : 'w-2 bg-stone-200'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={logPage === 1}
                                                            onClick={() => setLogPage((p) => p - 1)}
                                                            className="h-10 px-6 rounded-xl border-sidebar/10 bg-gradient-to-r from-sidebar to-[#1f4f52] text-white hover:opacity-90 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sidebar/10 disabled:opacity-30 disabled:bg-stone-100 disabled:text-slate-400"
                                                        >
                                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                                            Anterior
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={logPage === totalLogPages}
                                                            onClick={() => setLogPage((p) => p + 1)}
                                                            className="h-10 px-6 rounded-xl border-sidebar/10 bg-gradient-to-r from-sidebar to-[#1f4f52] text-white hover:opacity-90 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sidebar/10 disabled:opacity-30 disabled:bg-stone-100 disabled:text-slate-400"
                                                        >
                                                            Siguiente
                                                            <ChevronRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Columna Derecha: Registro de Actividad (Timeline) */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registro de Actividad</h3>
                                            <div className="h-[1px] flex-1 mx-4 bg-stone-100" />
                                        </div>
                                        
                                        {displayedLogs.length > 0 ? (
                                            <div className="space-y-4">
                                                {displayedLogs.map((log, idx) => {
                                                    const isPrimaryLog = idx % 2 === 0;
                                                    return (
                                                        <div key={log.id} className={cn(
                                                            "task-surface-soft group relative flex flex-col gap-4 rounded-3xl border p-6 transition-all shadow-sm",
                                                            isPrimaryLog 
                                                                ? "bg-gradient-to-r from-sidebar to-[#1f4f52] border-none text-white shadow-lg shadow-sidebar/20" 
                                                                : "bg-white/40 border-sidebar/5 hover:border-sidebar/20 hover:shadow-2xl hover:shadow-sidebar/5"
                                                        )}>
                                                            {/* Avatar and User Info */}
                                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn(
                                                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 shadow-sm text-white",
                                                                        isPrimaryLog ? "border-white/20 bg-white/10" : "border-white bg-sidebar shadow-sidebar/20"
                                                                    )}>
                                                                        <Avatar className="h-full w-full">
                                                                            <AvatarImage src={log.user?.avatar || ''} className="object-cover" />
                                                                            <AvatarFallback className="bg-transparent text-xs font-black">
                                                                                {log.user?.name?.charAt(0) || 'S'}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </div>
                                                                    <div>
                                                                        <p className={cn("text-sm font-black", isPrimaryLog ? "text-white" : "text-slate-800")}>
                                                                            {log.user?.name || 'Sistema'}
                                                                        </p>
                                                                        <p className={cn("text-[10px] font-bold uppercase tracking-widest", isPrimaryLog ? "text-white/50" : "text-slate-400")}>
                                                                            {formatDateTimeEs(log.changed_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", isPrimaryLog ? "text-white" : "")}>
                                                                    {log.from_status ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={cn("rounded-lg px-3 py-1.5 line-through", isPrimaryLog ? "bg-white/10 text-white/50" : "bg-stone-100 text-slate-400")}>
                                                                                {getTaskStatusLabel(log.from_status)}
                                                                            </span>
                                                                        <ChevronRight className="h-3 w-3 text-slate-200" />
                                                                        <span className={cn(
                                                                            "rounded-lg px-3 py-1.5 shadow-sm border",
                                                                            String(log.to_status) === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                            String(log.to_status) === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                            String(log.to_status) === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                            'bg-stone-50 text-slate-600 border-stone-100'
                                                                        )}>
                                                                            {getTaskStatusLabel(log.to_status)}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-slate-300">Iniciada</span>
                                                                        <ChevronRight className="h-3 w-3 text-slate-200" />
                                                                        <span className="rounded-lg bg-stone-50 px-3 py-1.5 text-slate-600 border border-sidebar/5">
                                                                            {getTaskStatusLabel(log.to_status)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {log.reason && (
                                                            <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-xs text-rose-800/80 leading-relaxed italic shadow-inner">
                                                                <div className="absolute left-0 top-0 h-full w-1 bg-rose-400" />
                                                                "{log.reason}"
                                                            </div>
                                                        )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            ) : (
                                            <div className="rounded-[3rem] border-2 border-dashed border-sidebar/10 py-24 text-center bg-stone-50/30">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-sidebar/5">
                                                    <History className="h-8 w-8 text-slate-200" />
                                                </div>
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sin registros aún</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
