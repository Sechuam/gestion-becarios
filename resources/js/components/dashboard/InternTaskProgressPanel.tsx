import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, TrendingUp } from 'lucide-react';
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
};

export function InternTaskProgressPanel({
    taskProgress,
    averageResolutionDays,
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
        <Card className="overflow-hidden border-sidebar/15 bg-white shadow-sm dark:bg-slate-900">
            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-sidebar/5 px-2.5 py-1.5 dark:bg-sidebar/10">
                <div>
                    <CardTitle className="text-sm font-black text-sidebar dark:text-teal-100">
                        Panel de progreso por becario
                    </CardTitle>
                    <p className="text-[11px] leading-4 text-slate-500">
                        Tareas completadas, carga total y horas fichadas.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="rounded-md border-sidebar/20 bg-white/70 px-2 py-0 text-[10px] text-sidebar dark:bg-slate-950/40 dark:text-teal-100"
                    >
                        {averageResolutionDays === null
                            ? 'Sin resolución media'
                            : `${averageResolutionDays} días de media`}
                    </Badge>
                    <TrendingUp className="h-3.5 w-3.5 text-sidebar dark:text-teal-100" />
                </div>
            </CardHeader>
            <CardContent className="space-y-1.5 px-2.5 pb-2">
                {taskProgress.length === 0 ? (
                    <div className="rounded-md border border-dashed border-sidebar/20 px-2.5 py-2 text-xs text-slate-500">
                        Todavía no hay tareas vinculadas para mostrar progreso.
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-sidebar/70" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    handleSearch(event.target.value)
                                }
                                placeholder="Buscar becario o centro"
                                className="h-8 rounded-md border-sidebar/15 bg-sidebar/5 pl-8 text-xs focus-visible:ring-sidebar/20 dark:bg-sidebar/10"
                            />
                        </div>

                        {visibleProgress.length === 0 ? (
                            <div className="rounded-md border border-dashed border-sidebar/20 px-2.5 py-2 text-xs text-slate-500">
                                No hay becarios que coincidan con la búsqueda.
                            </div>
                        ) : (
                            visibleProgress.map((intern) => (
                                <div
                                    key={intern.id}
                                    className="rounded-md border border-sidebar/15 bg-gradient-to-r from-sidebar/5 to-transparent px-2.5 py-1.5 dark:from-sidebar/10"
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
                                                className="rounded-md border-sidebar/20 bg-white/70 px-2 py-0 text-[10px] text-sidebar dark:bg-slate-950/40 dark:text-teal-100"
                                            >
                                                {intern.hours} h
                                            </Badge>
                                            {intern.average_delay !== undefined && intern.average_delay > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-md bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0 text-[9px] font-bold"
                                                >
                                                    +{intern.average_delay} min retraso
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <Progress
                                            value={intern.progress}
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

                        <div className="flex items-center justify-between gap-2 pt-0.5">
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
                    </>
                )}
            </CardContent>
        </Card>
    );
}
