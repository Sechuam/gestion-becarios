import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { ClipboardList, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleTable } from '@/components/common/SimpleTable';
import { TableActionMenu } from '@/components/common/TableActionMenu';
import { formatDateEs } from '@/lib/date-format';
import { getEvaluationTypeLabel } from '@/lib/evaluation-type-labels';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Props = {
    evaluations: any;
    filters: any;
    modules: string[];
    types: string[];
    userMode: 'admin' | 'tutor' | 'intern';
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Evaluaciones', href: '/evaluaciones' },
];

export default function Index({ evaluations, filters = {}, modules = [], types = [], userMode }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.roles?.includes('admin');
    const isTutor = auth?.user?.roles?.includes('tutor');
    const isIntern = userMode === 'intern';

    const canCreateEvaluation = isAdmin || isTutor;
    const canCreateSelfEvaluation = isIntern;
    const canDeleteEvaluation = auth?.user?.permissions?.includes('delete evaluations');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === 'all') {
            delete newFilters[key];
        }

        router.get('/evaluaciones', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (value: string) => {
        const newFilters = { ...filters, search: value };

        if (value.trim() === '') {
            delete newFilters.search;
        }

        router.get('/evaluaciones', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const getScoreTone = (score: number | null) => {
        if (score === null || Number.isNaN(score)) {
            return 'bg-slate-100 text-slate-500';
        }

        if (score >= 8) {
            return 'bg-emerald-100 text-emerald-700';
        }

        if (score >= 6) {
            return 'bg-amber-100 text-amber-700';
        }

        return 'bg-rose-100 text-rose-700';
    };

    const columns = [
        {
            key: 'intern',
            label: 'Becario',
            render: (row: any) => row.intern?.user?.name ?? 'Sin becario',
            cellClassName: 'text-foreground',
        },
        {
            key: 'evaluator',
            label: 'Evaluador',
            render: (row: any) => (
                <div className="space-y-1">
                    <p className="font-medium text-slate-700">{row.evaluator?.name ?? 'Sin evaluador'}</p>
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${row.is_self_evaluation
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                    >
                        {row.is_self_evaluation ? 'Autoevaluación' : 'Tutor / admin'}
                    </span>
                </div>
            ),
        },
        {
            key: 'evaluation_type',
            label: 'Tipo',
            render: (row: any) => (
                <span className="rounded-full bg-sidebar/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sidebar">
                    {getEvaluationTypeLabel(row.evaluation_type)}
                </span>
            ),
        },
        {
            key: 'evaluated_at',
            label: 'Fecha',
            render: (row: any) => (row.evaluated_at ? formatDateEs(row.evaluated_at) : 'Sin fecha'),
        },
        {
            key: 'weighted_score',
            label: 'Nota ponderada',
            render: (row: any) => {
                const numericScore = row.weighted_score !== null ? Number(row.weighted_score) : null;

                return (
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black tracking-wide ${getScoreTone(
                            numericScore,
                        )}`}
                    >
                        {row.weighted_score !== null ? row.weighted_score : 'Pendiente'}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (row: any) => (
                <TableActionMenu
                    actions={[
                        {
                            label: 'Ver detalle',
                            icon: 'view',
                            href: `/evaluaciones/${row.id}`,
                        },
                        ...(canDeleteEvaluation ? [{
                            label: 'Eliminar',
                            icon: 'delete' as const,
                            variant: 'destructive' as const,
                            onClick: () => { router.delete(`/evaluaciones/${row.id}`) },
                            confirm: {
                                title: '¿Eliminar evaluación?',
                                description: 'Esta acción no se puede deshacer. Se eliminarán la evaluación y todas sus puntuaciones.',
                                confirmLabel: 'Eliminar definitivamente',
                            }
                        }] : []),
                    ]}
                />
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluaciones" />
            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Evaluaciones"
                    description="Módulo de seguimiento de desempeño, feedback de tutores y autoevaluaciones de becarios."
                    icon={<ClipboardList className="h-6 w-6" />}
                    actions={
                        <div className="flex flex-wrap gap-3">
                            {canCreateEvaluation && (
                                <Button
                                    className="h-12 rounded-2xl bg-white px-8 pt-2 font-black text-sidebar shadow-lg transition-all hover:bg-white/90"
                                    onClick={() => router.get('/evaluaciones/create')}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Nueva evaluacion
                                </Button>
                            )}
                            {canCreateSelfEvaluation && (
                                <Button
                                    className="h-12 rounded-2xl bg-white px-8 pt-2 font-black text-sidebar shadow-lg transition-all hover:bg-white/90"
                                    onClick={() => router.get('/evaluaciones/create')}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Nueva autoevaluacion
                                </Button>
                            )}
                            {isAdmin && (
                                <Button
                                    className="h-12 rounded-2xl bg-white px-8 pt-2 font-black text-sidebar shadow-lg transition-all hover:bg-white/90"
                                    onClick={() => router.get('/evaluaciones/criterios')}
                                >
                                    <SlidersHorizontal className="mr-2 h-5 w-5" />
                                    Gestionar criterios
                                </Button>
                            )}
                        </div>
                    }
                />

                {isIntern ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Tipo de evaluacion
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant={filters.type ? 'outline' : 'default'}
                                className="h-10 rounded-full px-5 font-bold"
                                onClick={() => handleFilter('type', 'all')}
                            >
                                Todas
                            </Button>
                            {types.map((type) => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={filters.type === type ? 'default' : 'outline'}
                                    className="h-10 rounded-full px-5 font-bold"
                                    onClick={() => handleFilter('type', type)}
                                >
                                    {getEvaluationTypeLabel(type)}
                                </Button>
                            ))}
                        </div>

                        <p className="ml-auto rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:bg-slate-800">
                            Mostrando {evaluations.data.length} de {evaluations.total} evaluaciones
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-4 rounded-[2rem] border border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900/60">
                        <div className="w-full max-w-sm">
                            <Input
                                value={filters.search || ''}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Buscar becario por nombre..."
                                className="h-12 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                            />
                        </div>

                        <div className="w-full max-w-sm">
                            <Select
                                value={filters.module || 'all'}
                                onValueChange={(value) => handleFilter('module', value)}
                            >
                                <SelectTrigger className="h-12 w-full rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm">
                                    <SelectValue placeholder="Todos los modulos" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-sidebar/20">
                                    <SelectItem value="all">Todos los modulos</SelectItem>
                                    {modules.map((module) => (
                                        <SelectItem key={module} value={module}>
                                            {module}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-56">
                            <Select
                                value={filters.type || 'all'}
                                onValueChange={(value) => handleFilter('type', value)}
                            >
                                <SelectTrigger className="h-12 w-full rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm">
                                    <SelectValue placeholder="Todos los tipos" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-sidebar/20">
                                    <SelectItem value="all">Todos los tipos</SelectItem>
                                    {types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {getEvaluationTypeLabel(type)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <p className="ml-auto rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:bg-slate-800">
                            Mostrando {evaluations.data.length} de {evaluations.total} evaluaciones
                        </p>
                    </div>
                )}

                <div className="overflow-hidden rounded-[2.5rem] border border-sidebar/10 bg-white shadow-xl dark:bg-slate-900/60">
                    <SimpleTable
                        columns={columns}
                        rows={evaluations.data}
                        rowKey={(row) => row.id}
                        emptyTitle={isIntern ? 'Aun no tienes evaluaciones registradas' : 'Aun no hay evaluaciones registradas'}
                        emptyDescription={
                            isIntern
                                ? 'Aquí verás las evaluaciones de tu tutor y las autoevaluaciones que vayas enviando.'
                                : 'Crea la primera evaluacion para empezar a seguir el progreso de los becarios.'
                        }
                        striped
                    />
                </div>

                <div className="mt-6 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                            Pagina {evaluations.current_page} de {evaluations.last_page}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {evaluations.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all ${link.active
                                            ? 'scale-105 transform border-sidebar bg-sidebar text-sidebar-foreground shadow-md'
                                            : 'border-border/90 bg-white text-foreground hover:border-sidebar/40 hover:bg-slate-50'
                                        } ${!link.url ? 'pointer-events-none opacity-45' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                            .replace('Previous', 'Anterior')
                                            .replace('Next', 'Siguiente'),
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
