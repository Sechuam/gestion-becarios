import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getEvaluationTypeLabel } from '@/lib/evaluation-type-labels';
import type { BreadcrumbItem } from '@/types/navigation';

type Criterion = {
    id: number;
    name: string;
    category: string;
    description?: string | null;
    rubric?: string | null;
    weight: string | number;
    max_score: number;
};

type InternOption = {
    id: number;
    name: string;
};

type Props = {
    interns: InternOption[];
    criteria: Criterion[];
    types: string[];
    userMode: 'admin' | 'tutor' | 'intern';
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Evaluaciones', href: '/evaluaciones' },
    { title: 'Nueva evaluacion', href: '/evaluaciones/create' },
];

export default function Create({ interns, criteria, types, userMode }: Props) {
    const hasCriteria = criteria.length > 0;
    const isIntern = userMode === 'intern';
    const currentInternId = interns[0] ? String(interns[0].id) : '';

    const { data, setData, post, processing, errors } = useForm({
        intern_id: currentInternId,
        evaluation_type: isIntern ? 'self' : (types[0] ?? 'weekly'),
        period_start: '',
        period_end: '',
        evaluated_at: new Date().toISOString().split('T')[0],
        is_self_evaluation: isIntern,
        general_comments: '',
        scores: criteria.map((criterion) => ({
            criterion_id: criterion.id,
            score: '',
            comment: '',
        })),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/evaluaciones');
    };

    const updateScore = (index: number, field: 'score' | 'comment', value: string) => {
        const nextScores = [...data.scores];
        nextScores[index] = {
            ...nextScores[index],
            [field]: value,
        };
        setData('scores', nextScores);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isIntern ? 'Nueva autoevaluacion' : 'Nueva evaluacion'} />

            <div className="min-h-screen w-full space-y-6 bg-slate-50/50 p-6 dark:bg-slate-950/20">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-8 shadow-xl md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                            {isIntern ? 'Nueva autoevaluacion' : 'Nueva evaluacion'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-lg font-medium italic text-white/70">
                            {isIntern
                                ? 'Completa tu propia valoracion con puntuaciones detalladas por criterio.'
                                : 'Registra una evaluacion formal con puntuaciones detalladas por criterio.'}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="app-panel rounded-[2rem] border-sidebar/10 bg-white p-8 shadow-2xl dark:bg-slate-900 md:p-12"
                >
                    <div className="mb-12">
                        <div className="mb-8 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
                                01
                            </span>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                    Datos generales
                                </h2>
                                <p className="text-sm font-medium text-slate-500">
                                    {isIntern
                                        ? 'Revisa el tipo de evaluacion y el periodo que vas a valorar.'
                                        : 'Selecciona el becario, el tipo de evaluacion y el periodo que vas a valorar.'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                    Becario
                                </Label>
                                {isIntern ? (
                                    <div className="flex h-12 items-center rounded-2xl border border-sidebar/20 bg-slate-50/50 px-4 text-sm font-semibold text-slate-700">
                                        {interns[0]?.name ?? 'Tu perfil de becario'}
                                    </div>
                                ) : (
                                    <Select
                                        value={data.intern_id}
                                        onValueChange={(value) => setData('intern_id', value)}
                                    >
                                        <SelectTrigger className="h-12 rounded-2xl border-sidebar/20 bg-slate-50/50">
                                            <SelectValue placeholder="Selecciona un becario" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-sidebar/20">
                                            {interns.map((intern) => (
                                                <SelectItem key={intern.id} value={String(intern.id)}>
                                                    {intern.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.intern_id && (
                                    <p className="text-xs font-bold text-red-500">{errors.intern_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                    Tipo de evaluacion
                                </Label>
                                {isIntern ? (
                                    <div className="flex h-12 items-center rounded-2xl border border-sidebar/20 bg-slate-50/50 px-4 text-sm font-semibold text-slate-700">
                                        {getEvaluationTypeLabel('self')}
                                    </div>
                                ) : (
                                    <Select
                                        value={data.evaluation_type}
                                        onValueChange={(value) => setData('evaluation_type', value)}
                                    >
                                        <SelectTrigger className="h-12 rounded-2xl border-sidebar/20 bg-slate-50/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-sidebar/20">
                                            {types.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {getEvaluationTypeLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.evaluation_type && (
                                    <p className="text-xs font-bold text-red-500">{errors.evaluation_type}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                    Inicio del periodo
                                </Label>
                                <Input
                                    type="date"
                                    value={data.period_start}
                                    onChange={(e) => setData('period_start', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-slate-50/50"
                                />
                                {errors.period_start && (
                                    <p className="text-xs font-bold text-red-500">{errors.period_start}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                    Fin del periodo
                                </Label>
                                <Input
                                    type="date"
                                    value={data.period_end}
                                    onChange={(e) => setData('period_end', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-slate-50/50"
                                />
                                {errors.period_end && (
                                    <p className="text-xs font-bold text-red-500">{errors.period_end}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                    Fecha de evaluacion
                                </Label>
                                <Input
                                    type="date"
                                    value={data.evaluated_at}
                                    onChange={(e) => setData('evaluated_at', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-slate-50/50"
                                />
                                {errors.evaluated_at && (
                                    <p className="text-xs font-bold text-red-500">{errors.evaluated_at}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <div className="mb-8 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
                                02
                            </span>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                    Criterios y puntuaciones
                                </h2>
                                <p className="text-sm font-medium text-slate-500">
                                    Asigna una nota a cada criterio activo y anade comentarios si hacen falta.
                                </p>
                            </div>
                        </div>

                        {hasCriteria ? (
                            <div className="space-y-5">
                                {criteria.map((criterion, index) => (
                                    <div
                                        key={criterion.id}
                                        className="rounded-[1.5rem] border border-sidebar/10 bg-slate-50/60 p-6 shadow-sm"
                                    >
                                        <div className="mb-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                                    {criterion.name}
                                                </h3>
                                                <span className="rounded-full bg-sidebar/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sidebar">
                                                    {criterion.category}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                                                Peso {criterion.weight}% · Nota maxima {criterion.max_score}
                                            </p>
                                            {criterion.description && (
                                                <p className="mt-3 text-sm text-slate-500">{criterion.description}</p>
                                            )}
                                            {criterion.rubric && (
                                                <p className="mt-2 text-sm italic text-slate-500">
                                                    {criterion.rubric}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                                    Puntuacion
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.scores[index].score}
                                                    onChange={(e) =>
                                                        updateScore(index, 'score', e.target.value)
                                                    }
                                                    className="h-12 rounded-2xl border-sidebar/20 bg-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                                    Comentario del criterio
                                                </Label>
                                                <Input
                                                    value={data.scores[index].comment}
                                                    onChange={(e) =>
                                                        updateScore(index, 'comment', e.target.value)
                                                    }
                                                    placeholder="Observacion breve sobre este criterio..."
                                                    className="h-12 rounded-2xl border-sidebar/20 bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.5rem] border border-dashed border-amber-300 bg-amber-50/70 p-6 text-amber-900">
                                <p className="text-sm font-black uppercase tracking-widest">
                                    No hay criterios activos
                                </p>
                                <p className="mt-2 text-sm">
                                    Antes de crear una evaluacion, necesitas dar de alta al menos un criterio activo en
                                    <span className="font-bold"> /evaluaciones/criterios</span>.
                                </p>
                            </div>
                        )}

                        {errors.scores && (
                            <p className="mt-4 text-xs font-bold text-red-500">{errors.scores}</p>
                        )}
                    </div>

                    <div className="mb-12">
                        <div className="mb-8 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
                                03
                            </span>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                    Comentario general
                                </h2>
                                <p className="text-sm font-medium text-slate-500">
                                    Resume la evaluacion con una conclusion global.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">
                                Observaciones generales
                            </Label>
                            <textarea
                                value={data.general_comments}
                                onChange={(e) => setData('general_comments', e.target.value)}
                                className="min-h-[160px] w-full rounded-2xl border border-sidebar/20 bg-slate-50/50 p-4 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-[#1f4f52] focus:ring-4 focus:ring-sidebar/5"
                                placeholder="Escribe aqui la valoracion general del desempeno..."
                            />
                            {errors.general_comments && (
                                <p className="text-xs font-bold text-red-500">{errors.general_comments}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t border-sidebar/10 pt-8">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl px-8 font-bold text-slate-500 hover:bg-slate-100"
                            asChild
                        >
                            <Link href="/evaluaciones">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            className="h-12 rounded-2xl bg-sidebar px-10 font-black text-white shadow-xl shadow-sidebar/20 transition-all hover:bg-sidebar/90 active:scale-95"
                            disabled={processing || !hasCriteria}
                        >
                            {processing
                                ? 'Guardando...'
                                : isIntern
                                  ? 'Enviar autoevaluacion'
                                  : 'Guardar evaluacion'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
