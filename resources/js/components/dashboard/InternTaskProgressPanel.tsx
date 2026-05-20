import { useMemo, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { DashboardTaskProgress } from './types';

const ITEMS_PER_PAGE = 4;

type Props = {
    taskProgress: DashboardTaskProgress[];
    averageResolutionDays: number | null;
    className?: string;
};

export function InternTaskProgressPanel({
    taskProgress,
    averageResolutionDays,
    className,
}: Props) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filteredProgress = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return taskProgress;
        }

        return taskProgress.filter((intern) =>
            `${intern.name} ${intern.center}`.toLowerCase().includes(term),
        );
    }, [search, taskProgress]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredProgress.length / ITEMS_PER_PAGE),
    );
    const currentPage = Math.min(page, totalPages);
    const visibleProgress = filteredProgress.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    function handleSearch(value: string) {
        setSearch(value);
        setPage(1);
    }

    return (
        <Card
            className={`group flex flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${className}`}
        >
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-400 bg-slate-200 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar to-sidebar-accent/90 text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <Users className="h-4 w-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm leading-tight font-black text-slate-800 dark:text-slate-100">
                            Panel de progreso por becario
                        </CardTitle>
                        <p className="mt-0.5 text-[11px] leading-none text-slate-500">
                            Tareas completadas, carga total y horas fichadas.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="rounded-md border-sidebar/20 bg-white/80 px-2 py-0 text-[10px] text-sidebar dark:border-slate-700 dark:bg-slate-950/40 dark:text-teal-100"
                    >
                        {averageResolutionDays === null
                            ? 'Sin resolución media'
                            : `${averageResolutionDays} días de media`}
                    </Badge>
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar text-white shadow-sm">
                        <TrendingUp className="h-3.5 w-3.5" />
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-1.5 bg-slate-50/60 px-2.5 pt-2 pb-2 dark:bg-slate-950/20">
                {taskProgress.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-200 px-2.5 py-2 text-xs text-slate-500 dark:border-slate-700">
                        Todavía no hay tareas vinculadas para mostrar progreso.
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col justify-between">
                        <div className="min-h-[380px] flex-1 space-y-1.5">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-sidebar/70" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        handleSearch(event.target.value)
                                    }
                                    placeholder="Buscar becario o centro"
                                    className="h-8 rounded-md border-slate-300 bg-white pl-8 text-xs shadow-sm focus-visible:ring-sidebar/20 dark:border-slate-700 dark:bg-slate-900"
                                />
                            </div>

                            {visibleProgress.length === 0 ? (
                                <div className="rounded-md border border-dashed border-slate-200 px-2.5 py-2 text-xs text-slate-500 dark:border-slate-700">
                                    No hay becarios que coincidan con la
                                    búsqueda.
                                </div>
                            ) : (
                                visibleProgress.map((intern) => (
                                    <div
                                        key={intern.id}
                                        className="rounded-md border border-l-2 border-slate-300 border-l-sidebar bg-white px-2.5 py-1.5 shadow-sm dark:border-slate-700 dark:border-l-teal-400 dark:bg-slate-900"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-black text-slate-900 dark:text-white">
                                                    {intern.name}
                                                </p>
                                                <p className="truncate text-[10px] text-slate-500">
                                                    {intern.center}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-md border-sidebar/20 bg-white/80 px-2 py-0 text-[10px] text-sidebar dark:border-slate-700 dark:bg-slate-950/40 dark:text-teal-100"
                                                >
                                                    {intern.hours} h
                                                </Badge>
                                                {intern.average_delay !==
                                                    undefined &&
                                                    intern.average_delay >
                                                        0 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="rounded-md border-amber-500/20 bg-amber-500/10 px-1.5 py-0 text-[9px] font-bold text-amber-600"
                                                        >
                                                            +
                                                            {
                                                                intern.average_delay
                                                            }{' '}
                                                            min retraso
                                                        </Badge>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <Progress
                                                value={intern.progress}
                                                aria-label={`Progreso de tareas de ${intern.name}: ${intern.progress}%`}
                                                className="h-1"
                                                indicatorClassName="bg-sidebar dark:bg-teal-400"
                                            />
                                            <span className="w-9 text-right text-[11px] font-black text-slate-500">
                                                {intern.progress}%
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[10px] text-slate-500">
                                            {intern.completed} de {intern.total}{' '}
                                            tareas completadas
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-4">
                            <span className="text-[10px] font-medium text-slate-500">
                                {filteredProgress.length === 0
                                    ? '0 resultados'
                                    : `${visibleProgress.length} de ${filteredProgress.length}`}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Ver página anterior de progreso"
                                    className="h-7 w-7 border-sidebar bg-sidebar text-white hover:bg-sidebar/90 disabled:border-sidebar/20 disabled:bg-sidebar/10 disabled:text-sidebar/40"
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(1, current - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="w-12 text-center text-[10px] font-bold text-slate-500">
                                    {currentPage}/{totalPages}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Ver página siguiente de progreso"
                                    className="h-7 w-7 border-sidebar bg-sidebar text-white hover:bg-sidebar/90 disabled:border-sidebar/20 disabled:bg-sidebar/10 disabled:text-sidebar/40"
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(totalPages, current + 1),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
