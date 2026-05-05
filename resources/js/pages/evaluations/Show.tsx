import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ClipboardList, Download, History, Info, ListChecks, MessageSquareText, Minus, Percent, Trash2, TrendingDown, TrendingUp, UserRound } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { formatDateEs } from '@/lib/date-format';
import { getEvaluationTypeLabel } from '@/lib/evaluation-type-labels';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BreadcrumbItem } from '@/types/navigation';

type EvaluationScore = {
    id: number;
    score: string | number;
    weighted_score: string | number;
    comment?: string | null;
    criterion?: {
        id: number;
        name: string;
        category: string;
        description?: string | null;
        rubric?: string | null;
        weight: string | number;
        max_score: number;
    } | null;
};

type EvaluationDetail = {
    id: number;
    evaluation_type: string;
    evaluated_at?: string | null;
    period_start?: string | null;
    period_end?: string | null;
    total_score?: string | number | null;
    weighted_score?: string | number | null;
    is_self_evaluation?: boolean;
    general_comments?: string | null;
    intern?: {
        id: number;
        academic_degree?: string | null;
        user?: {
            id: number;
            name: string;
            email?: string | null;
        } | null;
    } | null;
    evaluator?: {
        id: number;
        name: string;
        email?: string | null;
    } | null;
    scores: EvaluationScore[];
};

type Props = {
    evaluation: EvaluationDetail;
    history: Array<{
        id: number;
        evaluation_type: string;
        evaluated_at?: string | null;
        period_start?: string | null;
        period_end?: string | null;
        weighted_score?: string | number | null;
        total_score?: string | number | null;
        is_self_evaluation?: boolean;
        delta_from_previous?: number | null;
        is_current?: boolean;
        evaluator?: {
            id: number;
            name: string;
        } | null;
    }>;
    userMode: 'admin' | 'tutor' | 'intern';
};

export default function Show({ evaluation, history = [], userMode }: Props) {
    const { auth } = usePage().props as any;
    const isIntern = userMode === 'intern';
    const canDeleteEvaluation = auth?.user?.permissions?.includes('delete evaluations');
    const historyWithScore = history.filter((item) => item.weighted_score !== null && item.weighted_score !== undefined);
    const bestScore = historyWithScore.length
        ? Math.max(...historyWithScore.map((item) => Number(item.weighted_score)))
        : null;
    const averageScore = historyWithScore.length
        ? (
            historyWithScore.reduce((sum, item) => sum + Number(item.weighted_score), 0) /
            historyWithScore.length
        ).toFixed(2)
        : null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Evaluaciones', href: '/evaluaciones' },
        { title: `Evaluación #${evaluation.id}`, href: `/evaluaciones/${evaluation.id}` },
    ];

    const subjectName = evaluation.intern?.user?.name ?? 'Sin becario';
    const evaluatorName = evaluation.evaluator?.name ?? (evaluation.is_self_evaluation ? subjectName : 'Sin evaluador');
    const currentWeightedScore = evaluation.weighted_score !== null ? Number(evaluation.weighted_score) : null;
    const scoreTone =
        currentWeightedScore === null || Number.isNaN(currentWeightedScore)
            ? 'text-slate-900'
            : currentWeightedScore >= 8
                ? 'text-emerald-600'
                : currentWeightedScore >= 6
                    ? 'text-amber-600'
                    : 'text-rose-600';

    // Performance alerts
    const currentEvaluation = history.find((item) => item.is_current);
    const significantDrop = currentEvaluation?.delta_from_previous !== null && currentEvaluation?.delta_from_previous !== undefined
        ? Number(currentEvaluation.delta_from_previous) < -1
        : false;

    const recentHistory = history.slice(0, 3).reverse();
    const downwardTrend = recentHistory.length >= 3
        ? recentHistory[0].delta_from_previous !== null &&
        recentHistory[1].delta_from_previous !== null &&
        Number(recentHistory[0].delta_from_previous) < 0 &&
        Number(recentHistory[1].delta_from_previous) < 0
        : false;

    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Evaluación #${evaluation.id}`} />

            <div className="w-full space-y-4 p-4 dark:bg-slate-950/20">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-sidebar to-[#1f4f52] text-white hover:opacity-95 shadow-sm rounded-xl font-bold uppercase tracking-widest text-[10px] border-0"
                        asChild
                    >
                        <Link href="/evaluaciones">
                            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al listado
                        </Link>
                    </Button>
                </div>
                {/* Performance Alerts */}
                {(significantDrop || downwardTrend) && (
                    <div className="rounded-4xl border-2 border-rose-200 bg-rose-50 p-6 shadow-md dark:border-rose-900/30 dark:bg-rose-950/20">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
                                <AlertTriangle className="h-5 w-5 text-rose-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-rose-900 dark:text-rose-100">
                                    ⚠️ Alerta de rendimiento
                                </h3>
                                {significantDrop && (
                                    <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">
                                        <strong>Bajada significativa detectada:</strong> Esta evaluación muestra una <strong>disminución de {Math.abs(Number(currentEvaluation?.delta_from_previous)).toFixed(2)} puntos</strong> respecto a la anterior. Se recomienda revisar los criterios con menor puntuación y planificar actividades de mejora.
                                    </p>
                                )}
                                {downwardTrend && !significantDrop && (
                                    <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">
                                        <strong>Tendencia a la baja:</strong> El becario ha mostrado <strong>disminución en las últimas evaluaciones</strong>. Es recomendable realizar una reunión de seguimiento para identificar las causas y ofrecer apoyo.
                                    </p>
                                )}
                                {downwardTrend && significantDrop && (
                                    <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">
                                        <strong>Atención urgente:</strong> Se detecta tanto una bajada significativa actual como una tendencia decreciente. Se recomienda intervención inmediata para revertir esta situación.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <ModuleHeader
                    title={isIntern ? 'Tu evaluación' : `Evaluación de ${subjectName}`}
                    description="Revisa el detalle completo de la evaluación, las puntuaciones por criterio y las observaciones registradas."
                    icon={<ClipboardList className="h-5 w-5" />}
                    actions={
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                                {getEvaluationTypeLabel(evaluation.evaluation_type)}
                            </span>
                            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                                {evaluation.is_self_evaluation ? 'Autoevaluación' : 'Evaluación externa'}
                            </span>

                            <div className="h-4 w-px bg-white/20 mx-1" />

                            <Button
                                size="sm"
                                className="h-8 rounded-lg bg-white/10 px-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md border border-white/20 transition-all hover:bg-white/20"
                                asChild
                            >
                                <a href={`/evaluaciones/${evaluation.id}/pdf`} target="_blank" rel="noreferrer">
                                    <Download className="mr-1.5 h-3 w-3" />
                                    Informe
                                </a>
                            </Button>

                            {canDeleteEvaluation && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest shadow-lg transition-all"
                                        >
                                            <Trash2 className="mr-1.5 h-3 w-3" />
                                            Eliminar
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-3xl border-sidebar/10 shadow-2xl">
                                        <DialogTitle className="text-xl font-bold">¿Eliminar evaluación?</DialogTitle>
                                        <DialogDescription className="py-2 text-slate-500">
                                            Esta acción no se puede deshacer. Se eliminarán la evaluación y todas sus puntuaciones de forma permanente.
                                        </DialogDescription>
                                        <DialogFooter className="gap-2 pt-4">
                                            <DialogClose asChild>
                                                <Button variant="ghost" className="rounded-xl border-border px-6">Cancelar</Button>
                                            </DialogClose>
                                            <Button
                                                variant="destructive"
                                                onClick={() => router.delete(`/evaluaciones/${evaluation.id}`)}
                                                className="rounded-xl px-8 shadow-lg transition-all"
                                            >
                                                Eliminar definitivamente
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    }
                />

                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                    <div className="rounded-xl border border-sidebar/10 bg-white p-2.5 shadow-sm dark:bg-slate-900/60 transition-all hover:shadow-md">
                        <div className="mb-1 flex items-center gap-1.5 text-sidebar">
                            <Percent className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Nota</span>
                        </div>
                        <p className={`text-base font-black dark:text-white ${scoreTone}`}>
                            {evaluation.weighted_score ?? '—'}
                        </p>
                    </div>

                    <div className="rounded-xl border border-sidebar/10 bg-white p-2.5 shadow-sm dark:bg-slate-900/60 transition-all hover:shadow-md">
                        <div className="mb-1 flex items-center gap-1.5 text-sidebar">
                            <ClipboardList className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Total</span>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white">
                            {evaluation.total_score ?? '—'}
                        </p>
                    </div>

                    <div className="rounded-xl border border-sidebar/10 bg-white p-2.5 shadow-sm dark:bg-slate-900/60 transition-all hover:shadow-md">
                        <div className="mb-1 flex items-center gap-1.5 text-sidebar">
                            <UserRound className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Evaluador</span>
                        </div>
                        <p className="truncate text-[11px] font-black text-slate-900 dark:text-white" title={evaluatorName}>
                            {evaluatorName}
                        </p>
                    </div>

                    <div className="rounded-xl border border-sidebar/10 bg-white p-2.5 shadow-sm dark:bg-slate-900/60 transition-all hover:shadow-md">
                        <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                            <span className="text-[9px] font-black uppercase tracking-widest">Registros</span>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white">{history.length}</p>
                    </div>

                    <div className="rounded-xl border border-sidebar/10 bg-white p-2.5 shadow-sm dark:bg-slate-900/60 transition-all hover:shadow-md">
                        <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                            <span className="text-[9px] font-black uppercase tracking-widest">Mejor nota</span>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white">{bestScore ?? '—'}</p>
                    </div>

                    <div className="rounded-xl border border-sidebar/10 bg-white p-2.5 shadow-sm dark:bg-slate-900/60 transition-all hover:shadow-md">
                        <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                            <span className="text-[9px] font-black uppercase tracking-widest">Media</span>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white">{averageScore ?? '—'}</p>
                    </div>
                </div>

                <Tabs defaultValue="criteria" orientation="vertical" className="flex flex-col gap-6 lg:flex-row">
                    <TabsList className="flex h-auto w-full flex-col items-stretch justify-start gap-2 bg-transparent p-0 lg:w-64">
                        <TabsTrigger
                            value="general"
                            className="flex h-12 justify-start gap-3 rounded-2xl border border-sidebar/5 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=active]:border-sidebar/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white dark:bg-slate-900/60"
                        >
                            <Info className="h-4 w-4" />
                            Información general
                        </TabsTrigger>
                        <TabsTrigger
                            value="comments"
                            className="flex h-12 justify-start gap-3 rounded-2xl border border-sidebar/5 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=active]:border-sidebar/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white dark:bg-slate-900/60"
                        >
                            <MessageSquareText className="h-4 w-4" />
                            Comentario general
                        </TabsTrigger>
                        <TabsTrigger
                            value="criteria"
                            className="flex h-12 justify-start gap-3 rounded-2xl border border-sidebar/5 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=active]:border-sidebar/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white dark:bg-slate-900/60"
                        >
                            <ListChecks className="h-4 w-4" />
                            Criterios evaluados
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex h-12 justify-start gap-3 rounded-2xl border border-sidebar/5 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=active]:border-sidebar/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white dark:bg-slate-900/60"
                        >
                            <History className="h-4 w-4" />
                            Historia y evolución
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1">
                        <TabsContent value="general" className="mt-0">
                            <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                                <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-xl font-black text-white shadow-lg">
                                        01
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                            Información general
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500">
                                            Datos principales de la evaluación y del periodo valorado.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 shadow-lg">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Becario</p>
                                        <p className="mt-2 text-sm font-bold text-white">{subjectName}</p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 shadow-lg">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Tipo</p>
                                        <p className="mt-2 text-sm font-bold text-white">
                                            {getEvaluationTypeLabel(evaluation.evaluation_type)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 shadow-lg">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Fecha de evaluación</p>
                                        <p className="mt-2 text-sm font-bold text-white">
                                            {formatDateEs(evaluation.evaluated_at)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 shadow-lg">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Módulo</p>
                                        <p className="mt-2 text-sm font-bold text-white">
                                            {evaluation.intern?.academic_degree || '—'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 shadow-lg">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Inicio del período</p>
                                        <p className="mt-2 text-sm font-bold text-white">
                                            {evaluation.period_start ? formatDateEs(evaluation.period_start) : '—'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 shadow-lg">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Fin del período</p>
                                        <p className="mt-2 text-sm font-bold text-white">
                                            {evaluation.period_end ? formatDateEs(evaluation.period_end) : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="comments" className="mt-0">
                            <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                                <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-xl font-black text-white shadow-lg">
                                        02
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                            Comentario general
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500">
                                            Resumen global registrado en la evaluación.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 shadow-lg">
                                    <div className="mb-3 flex items-center gap-2 text-white/70">
                                        <MessageSquareText className="h-4 w-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">Observaciones</span>
                                    </div>
                                    <p className="text-sm leading-7 text-white">
                                        {evaluation.general_comments || 'No se han añadido observaciones generales para esta evaluación.'}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="criteria" className="mt-0">
                            <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                                <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-xl font-black text-white shadow-lg">
                                        03
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                            Criterios evaluados
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500">
                                            Desglose de puntuaciones, peso y comentarios por criterio.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {evaluation.scores.map((score) => (
                                        <div
                                            key={score.id}
                                            className="rounded-[1.5rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 shadow-lg transition-all hover:scale-[1.01]"
                                        >
                                            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-lg font-black text-white">
                                                            {score.criterion?.name ?? 'Criterio'}
                                                        </h3>
                                                        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                            {score.criterion?.category ?? 'General'}
                                                        </span>
                                                    </div>
                                                    {score.criterion?.description && (
                                                        <p className="mt-2 text-sm text-white/70">{score.criterion.description}</p>
                                                    )}
                                                    {score.criterion?.rubric && (
                                                        <p className="mt-2 text-sm italic text-white/60">{score.criterion.rubric}</p>
                                                    )}
                                                </div>

                                                <div className="grid min-w-[220px] grid-cols-2 gap-3">
                                                    <div className="rounded-2xl border border-sidebar/10 bg-white p-4 text-center shadow-sm">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nota</p>
                                                        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                                            {score.score}
                                                        </p>
                                                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                                                            / {score.criterion?.max_score ?? '—'}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-sidebar/10 bg-white p-4 text-center shadow-sm">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peso aplicado</p>
                                                        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                                            {score.weighted_score}
                                                        </p>
                                                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                                                            Peso {score.criterion?.weight ?? '—'}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl bg-white p-4 shadow-xl">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comentario del criterio</p>
                                                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                                    {score.comment || 'No se ha añadido comentario para este criterio.'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                                <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-xl font-black text-white shadow-lg">
                                        04
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                            Historial y evolución
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500">
                                            Recorrido cronológico de las evaluaciones del becario y variación respecto a la anterior.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {history.map((item) => {
                                        const delta = item.delta_from_previous;
                                        const isPositive = typeof delta === 'number' && delta > 0;
                                        const isNegative = typeof delta === 'number' && delta < 0;
                                        const isNeutral = typeof delta === 'number' && delta === 0;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`rounded-[1.5rem] p-5 shadow-lg transition-all bg-gradient-to-r from-sidebar to-[#1f4f52] ${item.is_current
                                                        ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-sidebar shadow-2xl'
                                                        : 'opacity-90'
                                                    }`}
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-black text-white">
                                                                {getEvaluationTypeLabel(item.evaluation_type)}
                                                            </span>
                                                            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                                                                {formatDateEs(item.evaluated_at)}
                                                            </span>
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${item.is_self_evaluation
                                                                        ? 'bg-violet-500/20 text-violet-200'
                                                                        : 'bg-white/20 text-white'
                                                                    }`}
                                                            >
                                                                {item.is_self_evaluation ? 'Autoevaluación' : 'Tutor / admin'}
                                                            </span>
                                                            {item.is_current && (
                                                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sidebar">
                                                                    Actual
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-white/60">
                                                            Periodo: {item.period_start ? formatDateEs(item.period_start) : '—'} -{' '}
                                                            {item.period_end ? formatDateEs(item.period_end) : '—'}
                                                        </p>

                                                        <p className="text-sm text-white/60">
                                                            Evaluador: {item.evaluator?.name ?? subjectName}
                                                        </p>
                                                    </div>

                                                    <div className="grid min-w-[240px] grid-cols-2 gap-3">
                                                        <div className="rounded-2xl border border-sidebar/10 bg-white p-4 text-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nota ponderada</p>
                                                            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                                                {item.weighted_score ?? '—'}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-2xl border border-sidebar/10 bg-white p-4 text-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evolución</p>
                                                            <div className="mt-2 flex items-center justify-center gap-2">
                                                                {isPositive && <TrendingUp className="h-5 w-5 text-emerald-600" />}
                                                                {isNegative && <TrendingDown className="h-5 w-5 text-rose-600" />}
                                                                {isNeutral && <Minus className="h-5 w-5 text-slate-500" />}
                                                                {!isPositive && !isNegative && !isNeutral && (
                                                                    <span className="text-sm font-semibold text-slate-500">—</span>
                                                                )}
                                                                {(isPositive || isNegative || isNeutral) && (
                                                                    <span
                                                                        className={`text-sm font-black ${isPositive
                                                                                ? 'text-emerald-600'
                                                                                : isNegative
                                                                                    ? 'text-rose-600'
                                                                                    : 'text-slate-500'
                                                                            }`}
                                                                    >
                                                                        {delta && delta > 0 ? '+' : ''}
                                                                        {delta?.toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!item.is_current && (
                                                    <div className="mt-4">
                                                        <Link
                                                            href={`/evaluaciones/${item.id}`}
                                                            className="text-xs font-black uppercase tracking-widest text-white hover:underline"
                                                        >
                                                            Ver esta evaluación
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {history.length === 0 && (
                                        <div className="rounded-[1.5rem] border border-dashed border-sidebar/20 bg-slate-50/60 p-6 text-sm text-slate-500">
                                            Aún no hay suficiente historial para mostrar evolución.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
