import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Download, MessageSquareText, Minus, Percent, TrendingDown, TrendingUp, UserRound } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { formatDateEs } from '@/lib/date-format';
import { getEvaluationTypeLabel } from '@/lib/evaluation-type-labels';
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
    const isIntern = userMode === 'intern';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Evaluación #${evaluation.id}`} />

            <div className="w-full space-y-6">
                <div className="flex items-center justify-between px-2 pb-2">
                    <Button
                        variant="ghost"
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800"
                        asChild
                    >
                        <Link href="/evaluaciones">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al listado
                        </Link>
                    </Button>

                    <Button
                        className="h-11 rounded-2xl bg-sidebar px-6 font-black text-white shadow-lg shadow-sidebar/20 transition-all hover:bg-sidebar/90"
                        asChild
                    >
                        <a href={`/evaluaciones/${evaluation.id}/pdf`} target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar informe
                        </a>
                    </Button>
                </div>

                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 shadow-2xl md:p-8">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative flex flex-wrap items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
                            <ClipboardList className="h-8 w-8 text-white" />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                                    {isIntern ? 'Tu evaluación' : `Evaluación de ${subjectName}`}
                                </h1>
                                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                    {getEvaluationTypeLabel(evaluation.evaluation_type)}
                                </span>
                                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                    {evaluation.is_self_evaluation ? 'Autoevaluación' : 'Evaluación externa'}
                                </span>
                            </div>

                            <p className="max-w-3xl text-sm font-medium text-white/80 md:text-base">
                                Revisa el detalle completo de la evaluación, las puntuaciones por criterio y las observaciones registradas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <div className="mb-3 flex items-center gap-3 text-sidebar">
                            <Percent className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Nota ponderada</span>
                        </div>
                        <p className={`text-3xl font-black dark:text-white ${scoreTone}`}>
                            {evaluation.weighted_score ?? '—'}
                        </p>
                    </div>

                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <div className="mb-3 flex items-center gap-3 text-sidebar">
                            <ClipboardList className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Puntuación total</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">
                            {evaluation.total_score ?? '—'}
                        </p>
                    </div>

                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <div className="mb-3 flex items-center gap-3 text-sidebar">
                            <UserRound className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Evaluador</span>
                        </div>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{evaluatorName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evaluaciones registradas</p>
                        <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{history.length}</p>
                    </div>

                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mejor nota ponderada</p>
                        <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{bestScore ?? '—'}</p>
                    </div>

                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Media histórica</p>
                        <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{averageScore ?? '—'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                        <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
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
                            <div className="rounded-2xl border border-sidebar/10 bg-slate-50/60 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Becario</p>
                                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">{subjectName}</p>
                            </div>
                            <div className="rounded-2xl border border-sidebar/10 bg-slate-50/60 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</p>
                                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
                                    {getEvaluationTypeLabel(evaluation.evaluation_type)}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sidebar/10 bg-slate-50/60 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha de evaluación</p>
                                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
                                    {formatDateEs(evaluation.evaluated_at)}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sidebar/10 bg-slate-50/60 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</p>
                                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
                                    {evaluation.intern?.academic_degree || '—'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sidebar/10 bg-slate-50/60 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inicio del período</p>
                                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
                                    {evaluation.period_start ? formatDateEs(evaluation.period_start) : '—'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sidebar/10 bg-slate-50/60 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fin del período</p>
                                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
                                    {evaluation.period_end ? formatDateEs(evaluation.period_end) : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                        <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
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

                        <div className="rounded-[1.5rem] border border-sidebar/10 bg-slate-50/60 p-5">
                            <div className="mb-3 flex items-center gap-2 text-sidebar">
                                <MessageSquareText className="h-4 w-4" />
                                <span className="text-xs font-black uppercase tracking-widest">Observaciones</span>
                            </div>
                            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                                {evaluation.general_comments || 'No se han añadido observaciones generales para esta evaluación.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                    <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
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
                                className="rounded-[1.5rem] border border-sidebar/10 bg-slate-50/60 p-6 shadow-sm"
                            >
                                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                                {score.criterion?.name ?? 'Criterio'}
                                            </h3>
                                            <span className="rounded-full bg-sidebar/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sidebar">
                                                {score.criterion?.category ?? 'General'}
                                            </span>
                                        </div>
                                        {score.criterion?.description && (
                                            <p className="mt-2 text-sm text-slate-500">{score.criterion.description}</p>
                                        )}
                                        {score.criterion?.rubric && (
                                            <p className="mt-2 text-sm italic text-slate-500">{score.criterion.rubric}</p>
                                        )}
                                    </div>

                                    <div className="grid min-w-[220px] grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-sidebar/10 bg-white p-4 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nota</p>
                                            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                                {score.score}
                                            </p>
                                            <p className="mt-1 text-xs font-medium text-slate-500">
                                                / {score.criterion?.max_score ?? '—'}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-sidebar/10 bg-white p-4 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peso aplicado</p>
                                            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                                {score.weighted_score}
                                            </p>
                                            <p className="mt-1 text-xs font-medium text-slate-500">
                                                Peso {score.criterion?.weight ?? '—'}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-sidebar/10 bg-white p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comentario del criterio</p>
                                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                        {score.comment || 'No se ha añadido comentario para este criterio.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[2rem] border border-sidebar/10 bg-white p-8 shadow-xl dark:bg-slate-900/60">
                    <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
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
                                    className={`rounded-[1.5rem] border p-5 shadow-sm transition-all ${
                                        item.is_current
                                            ? 'border-sidebar/30 bg-sidebar/5'
                                            : 'border-sidebar/10 bg-slate-50/60'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                                    {getEvaluationTypeLabel(item.evaluation_type)}
                                                </span>
                                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                                    {formatDateEs(item.evaluated_at)}
                                                </span>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                                        item.is_self_evaluation
                                                            ? 'bg-violet-100 text-violet-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {item.is_self_evaluation ? 'Autoevaluación' : 'Tutor / admin'}
                                                </span>
                                                {item.is_current && (
                                                    <span className="rounded-full bg-sidebar px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                        Actual
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-slate-500">
                                                Periodo: {item.period_start ? formatDateEs(item.period_start) : '—'} -{' '}
                                                {item.period_end ? formatDateEs(item.period_end) : '—'}
                                            </p>

                                            <p className="text-sm text-slate-500">
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
                                                            className={`text-sm font-black ${
                                                                isPositive
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
                                                className="text-xs font-black uppercase tracking-widest text-sidebar hover:underline"
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
            </div>
        </AppLayout>
    );
}
