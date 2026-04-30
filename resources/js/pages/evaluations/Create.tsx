import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, ChevronsUpDown, ClipboardList, History, Info, ListChecks, MessageSquareText, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
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
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        intern_id: '',
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

    // Check for missing comments on extreme scores
    const missingComments = data.scores
        .map((score, index) => {
            const scoreNum = parseFloat(score.score);
            if (!isNaN(scoreNum) && (scoreNum < 4 || scoreNum > 8) && !score.comment.trim()) {
                return index;
            }
            return null;
        })
        .filter((idx) => idx !== null);

    const filteredInterns = interns.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const selectedIntern = interns.find(i => String(i.id) === data.intern_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isIntern ? 'Nueva autoevaluacion' : 'Nueva evaluacion'} />

            <div className="min-h-screen w-full space-y-4 p-4 dark:bg-slate-950/20">
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

                <ModuleHeader
                    title={isIntern ? 'Nueva autoevaluacion' : 'Nueva evaluacion'}
                    description={isIntern
                        ? 'Haz una reflexión honesta sobre tu progreso y valora cada criterio con calma.'
                        : 'Registra una evaluacion formal con puntuaciones detalladas por criterio.'}
                    icon={<ClipboardList className="h-5 w-5" />}
                />

                <form
                    onSubmit={submit}
                    className="flex flex-col gap-6 lg:flex-row"
                >
                    <Tabs defaultValue="general" orientation="vertical" className="flex w-full flex-col gap-6 lg:flex-row">
                        <TabsList className="flex h-auto w-full flex-col items-stretch justify-start gap-2 bg-transparent p-0 lg:w-72">
                            <TabsTrigger
                                value="general"
                                className="flex h-12 justify-start gap-3 rounded-2xl border border-sidebar/5 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=active]:border-sidebar/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white dark:bg-slate-900/60"
                            >
                                <Info className="h-4 w-4" />
                                01. Datos generales
                            </TabsTrigger>
                            <TabsTrigger
                                value="criteria"
                                className="flex h-12 justify-start gap-3 rounded-2xl border border-sidebar/5 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=active]:border-sidebar/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white dark:bg-slate-900/60"
                            >
                                <ListChecks className="h-4 w-4" />
                                02. Criterios y puntuaciones
                            </TabsTrigger>
                            <TabsTrigger
                                value="comments"
                                className="flex h-12 justify-start gap-3 rounded-2xl border border-sidebar/5 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=active]:border-sidebar/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white dark:bg-slate-900/60"
                            >
                                <MessageSquareText className="h-4 w-4" />
                                03. Comentario general
                            </TabsTrigger>

                            <div className="mt-4 flex flex-col gap-2 rounded-[1.5rem] border border-sidebar/10 bg-white p-4 shadow-xl dark:bg-slate-900/60">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Acciones</p>
                                <Button
                                    type="submit"
                                    className="h-10 w-full rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-xs font-black text-white shadow-lg shadow-sidebar/20 transition-all hover:opacity-90 active:scale-95"
                                    disabled={processing || !hasCriteria}
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : isIntern
                                            ? 'Enviar'
                                            : 'Guardar'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-8 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                                    asChild
                                >
                                    <Link href="/evaluaciones">Cancelar</Link>
                                </Button>
                            </div>
                        </TabsList>

                        <div className="flex-1">
                            <TabsContent value="general" className="mt-0">
                                <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-2xl dark:bg-slate-900/60">
                                    <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-lg font-black text-white shadow-lg">
                                            01
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                                                Datos generales
                                            </h2>
                                            <p className="text-[11px] font-medium text-slate-500">
                                                {isIntern
                                                    ? 'Periodo y confirmación de autoevaluación.'
                                                    : 'Becario, tipo de evaluacion y periodo.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Becario
                                            </Label>
                                            {isIntern ? (
                                                <div className="flex h-10 items-center rounded-xl border border-sidebar/10 bg-slate-50/50 px-3 text-xs font-bold text-slate-700">
                                                    {interns[0]?.name ?? 'Tu perfil de becario'}
                                                </div>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            className="h-10 w-full justify-between rounded-xl border-sidebar/10 bg-slate-50/50 px-3 text-xs font-bold hover:bg-slate-100 transition-colors"
                                                        >
                                                            <span className="truncate">
                                                                {selectedIntern?.name ?? "Selecciona un becario"}
                                                            </span>
                                                            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent 
                                                        className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] p-0" 
                                                        align="start"
                                                    >
                                                        <div className="flex items-center border-b border-sidebar/10 px-3 py-2">
                                                            <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-40" />
                                                            <input
                                                                className="flex h-7 w-full bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground"
                                                                placeholder="Buscar becario..."
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="max-h-[240px] overflow-y-auto p-1 scrollbar-thin">
                                                            {filteredInterns.length === 0 ? (
                                                                <p className="p-3 text-center text-[11px] font-medium text-muted-foreground">
                                                                    No se encontraron becarios.
                                                                </p>
                                                            ) : (
                                                                filteredInterns.map((intern) => (
                                                                    <DropdownMenuItem
                                                                        key={intern.id}
                                                                        onSelect={() => {
                                                                            setData('intern_id', String(intern.id));
                                                                            setSearchTerm('');
                                                                        }}
                                                                        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-bold hover:bg-slate-50"
                                                                    >
                                                                        {intern.name}
                                                                        {String(intern.id) === data.intern_id && (
                                                                            <Check className="h-3.5 w-3.5 text-sidebar" />
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                ))
                                                            )}
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            {errors.intern_id && (
                                                <p className="text-[10px] font-bold text-red-500">{errors.intern_id}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Tipo de evaluacion
                                            </Label>
                                            {isIntern ? (
                                                <div className="flex h-10 items-center rounded-xl border border-sidebar/10 bg-slate-50/50 px-3 text-xs font-bold text-slate-700">
                                                    {getEvaluationTypeLabel('self')}
                                                </div>
                                            ) : (
                                                <Select
                                                    value={data.evaluation_type}
                                                    onValueChange={(value) => setData('evaluation_type', value)}
                                                >
                                                    <SelectTrigger className="h-10 rounded-xl border-sidebar/10 bg-slate-50/50 text-xs font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-sidebar/20">
                                                        {types.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {getEvaluationTypeLabel(type)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {errors.evaluation_type && (
                                                <p className="text-[10px] font-bold text-red-500">{errors.evaluation_type}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Inicio del periodo
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.period_start}
                                                onChange={(e) => setData('period_start', e.target.value)}
                                                className="h-10 rounded-xl border-sidebar/10 bg-slate-50/50 text-xs font-bold"
                                            />
                                            {errors.period_start && (
                                                <p className="text-[10px] font-bold text-red-500">{errors.period_start}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Fin del periodo
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.period_end}
                                                onChange={(e) => setData('period_end', e.target.value)}
                                                className="h-10 rounded-xl border-sidebar/10 bg-slate-50/50 text-xs font-bold"
                                            />
                                            {errors.period_end && (
                                                <p className="text-[10px] font-bold text-red-500">{errors.period_end}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Fecha de evaluacion
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.evaluated_at}
                                                onChange={(e) => setData('evaluated_at', e.target.value)}
                                                className="h-10 rounded-xl border-sidebar/10 bg-slate-50/50 text-xs font-bold"
                                            />
                                            {errors.evaluated_at && (
                                                <p className="text-[10px] font-bold text-red-500">{errors.evaluated_at}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="criteria" className="mt-0">
                                <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-2xl dark:bg-slate-900/60">
                                    <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-lg font-black text-white shadow-lg">
                                            02
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                                                Criterios y puntuaciones
                                            </h2>
                                            <p className="text-[11px] font-medium text-slate-500">
                                                Asigna notas y añade comentarios si hace falta.
                                            </p>
                                        </div>
                                    </div>

                                    {hasCriteria ? (
                                        <div className="space-y-3">
                                            {criteria.map((criterion, index) => (
                                                <div
                                                    key={criterion.id}
                                                    className="rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 shadow-lg"
                                                >
                                                    <div className="mb-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-base font-black text-white">
                                                                {criterion.name}
                                                            </h3>
                                                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                                                                {criterion.category}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-white/60">
                                                            Peso {criterion.weight}% · Máx {criterion.max_score}
                                                        </p>
                                                        {criterion.description && (
                                                            <p className="mt-2 text-xs text-white/70">{criterion.description}</p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        <div className="rounded-xl bg-white p-2.5 shadow-xl">
                                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                                Puntuación
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={data.scores[index].score}
                                                                onChange={(e) =>
                                                                    updateScore(index, 'score', e.target.value)
                                                                }
                                                                className="mt-1 h-8 rounded-lg border-sidebar/10 bg-slate-50/50 text-[11px] font-black"
                                                            />
                                                        </div>

                                                        <div className="rounded-xl bg-white p-2.5 shadow-xl">
                                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                                Comentario
                                                                {(() => {
                                                                    const scoreNum = parseFloat(data.scores[index].score);
                                                                    return scoreNum < 4 || scoreNum > 8 ? (
                                                                        <span className="ml-1 text-amber-600 font-black">!</span>
                                                                    ) : null;
                                                                })()}
                                                            </Label>
                                                            <Input
                                                                value={data.scores[index].comment}
                                                                onChange={(e) =>
                                                                    updateScore(index, 'comment', e.target.value)
                                                                }
                                                                placeholder="Opcional..."
                                                                className={`mt-1 h-8 rounded-lg bg-slate-50/50 text-[11px] font-medium transition-all ${
                                                                    (() => {
                                                                        const scoreNum = parseFloat(data.scores[index].score);
                                                                        return (scoreNum < 4 || scoreNum > 8) && !data.scores[index].comment.trim()
                                                                            ? 'border-2 border-amber-400'
                                                                            : 'border-sidebar/10';
                                                                    })()
                                                                }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-4 text-amber-900">
                                            <p className="text-xs font-black uppercase tracking-widest">
                                                No hay criterios activos
                                            </p>
                                        </div>
                                    )}

                                    {errors.scores && (
                                        <p className="mt-3 text-[10px] font-bold text-red-500">{errors.scores}</p>
                                    )}

                                    {missingComments.length > 0 && (
                                        <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 shadow-sm">
                                            <div className="flex gap-2">
                                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                                                <p className="text-[10px] font-bold text-amber-900">
                                                    Faltan comentarios obligatorios.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="comments" className="mt-0">
                                <div className="rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-2xl dark:bg-slate-900/60">
                                    <div className="mb-6 flex items-center gap-4 border-b border-sidebar/10 pb-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-lg font-black text-white shadow-lg">
                                            03
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                                                Comentario general
                                            </h2>
                                            <p className="text-[11px] font-medium text-slate-500">
                                                Conclusión global del desempeño.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Observaciones globales
                                        </Label>
                                        <textarea
                                            value={data.general_comments}
                                            onChange={(e) => setData('general_comments', e.target.value)}
                                            className="min-h-[120px] w-full rounded-2xl border border-sidebar/10 bg-slate-50/50 p-4 text-xs font-medium text-slate-700 shadow-inner outline-none transition-all focus:border-sidebar focus:ring-4 focus:ring-sidebar/5"
                                            placeholder="Escribe aquí la valoración general..."
                                        />
                                        {errors.general_comments && (
                                            <p className="text-[10px] font-bold text-red-500">{errors.general_comments}</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </form>
            </div>
        </AppLayout>
    );
}
