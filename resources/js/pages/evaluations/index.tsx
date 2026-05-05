import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { ClipboardList, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleTable } from '@/components/common/SimpleTable';
import { TableActionMenu } from '@/components/common/TableActionMenu';
import { Pagination } from '@/components/common/Pagination';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
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
            <div className="flex flex-col gap-3">
                <ModuleHeader
                    title="Evaluaciones"
                    description="Módulo de seguimiento de desempeño, feedback de tutores y autoevaluaciones de becarios."
                    icon={<ClipboardList className="h-6 w-6" />}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            {canCreateEvaluation && (
                                <HeaderActionButton 
                                    label="Nueva evaluacion"
                                    href="/evaluaciones/create"
                                />
                            )}
                            {canCreateSelfEvaluation && (
                                <HeaderActionButton 
                                    label="Nueva autoevaluacion"
                                    href="/evaluaciones/create"
                                />
                            )}
                            {isAdmin && (
                                <HeaderActionButton 
                                    label="Gestionar criterios"
                                    href="/evaluaciones/criterios"
                                    icon={<SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />}
                                />
                            )}
                        </div>
                    }
                />

                {isIntern ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sidebar/10 bg-white p-3 shadow-lg dark:bg-slate-900/60">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">
                            Tipo
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                type="button"
                                variant={filters.type ? 'outline' : 'default'}
                                className="h-7 rounded-lg px-3 text-[10px] font-bold"
                                onClick={() => handleFilter('type', 'all')}
                            >
                                Todas
                            </Button>
                            {types.map((type) => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={filters.type === type ? 'default' : 'outline'}
                                    className="h-7 rounded-lg px-3 text-[10px] font-bold"
                                    onClick={() => handleFilter('type', type)}
                                >
                                    {getEvaluationTypeLabel(type)}
                                </Button>
                            ))}
                        </div>

                        <p className="ml-auto rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:bg-slate-800 border border-sidebar/5">
                            {evaluations.data.length} / {evaluations.total} evaluaciones
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-sidebar/10 bg-white p-2 shadow-lg dark:bg-slate-900/60 transition-all">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Búsqueda */}
                            <div className="relative w-full sm:w-64 flex-none">
                                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Buscar becario..."
                                    className="h-8 border-sidebar/10 bg-slate-50/50 pl-9 text-[11px] text-foreground placeholder:text-muted-foreground rounded-lg shadow-sm focus:ring-sidebar/20"
                                />
                            </div>

                            {/* Filtros de Selección (Distribuidos) */}
                            <div className="flex-1 min-w-[150px]">
                                <Select
                                    value={filters.module || 'all'}
                                    onValueChange={(value) => handleFilter('module', value)}
                                >
                                    <SelectTrigger className="h-8 w-full border-sidebar/10 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                        <SelectValue placeholder="Todos los módulos" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-sidebar/20">
                                        <SelectItem value="all">Todos los módulos</SelectItem>
                                        {modules.map((module) => (
                                            <SelectItem key={module} value={module}>
                                                {module}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 min-w-[150px]">
                                <Select
                                    value={filters.type || 'all'}
                                    onValueChange={(value) => handleFilter('type', value)}
                                >
                                    <SelectTrigger className="h-8 w-full border-sidebar/10 bg-card text-[11px] text-foreground rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                        <SelectValue placeholder="Todos los tipos" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-sidebar/20">
                                        <SelectItem value="all">Todos los tipos</SelectItem>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {getEvaluationTypeLabel(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Contador */}
                            <div className="flex-none flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg dark:bg-slate-800 border border-sidebar/5 ml-auto">
                                <span className="flex h-1 w-1 rounded-full bg-sidebar animate-pulse" />
                                <span className="text-[10px] font-bold text-muted-foreground tabular-nums whitespace-nowrap">
                                    {evaluations.data.length} / {evaluations.total} registrados
                                </span>
                            </div>
                        </div>
                    </div>
                )}

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

                <div className="mt-6 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                            Pagina {evaluations.current_page} de {evaluations.last_page}
                        </span>
                        <Pagination links={evaluations.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
