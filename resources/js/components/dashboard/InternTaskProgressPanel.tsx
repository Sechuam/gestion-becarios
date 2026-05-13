import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DashboardTaskProgress } from './types';

type Props = {
    taskProgress: DashboardTaskProgress[];
    averageResolutionDays: number | null;
};

export function InternTaskProgressPanel({
    taskProgress,
    averageResolutionDays,
}: Props) {
    return (
        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between gap-3 p-3 pb-1.5">
                <div>
                    <CardTitle className="text-sm font-black">
                        Panel de progreso por becario
                    </CardTitle>
                    <p className="text-[11px] leading-4 text-slate-500">
                        Tareas completadas, carga total y horas fichadas.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="rounded-md px-2 py-0 text-[10px]"
                    >
                        {averageResolutionDays === null
                            ? 'Sin resolución media'
                            : `${averageResolutionDays} días de media`}
                    </Badge>
                    <TrendingUp className="h-3.5 w-3.5 text-sidebar" />
                </div>
            </CardHeader>
            <CardContent className="space-y-1.5 px-3 pb-3">
                {taskProgress.length === 0 ? (
                    <div className="rounded-md border border-dashed border-sidebar/20 p-3 text-xs text-slate-500">
                        Todavía no hay tareas vinculadas para mostrar progreso.
                    </div>
                ) : (
                    taskProgress.map((intern) => (
                        <div
                            key={intern.id}
                            className="rounded-md border border-sidebar/10 px-2.5 py-2"
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
                                <Badge
                                    variant="outline"
                                    className="rounded-md px-2 py-0 text-[10px]"
                                >
                                    {intern.hours} h
                                </Badge>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                                <Progress
                                    value={intern.progress}
                                    className="h-1"
                                />
                                <span className="w-9 text-right text-[11px] font-black text-slate-500">
                                    {intern.progress}%
                                </span>
                            </div>
                            <p className="mt-1 text-[10px] text-slate-500">
                                {intern.completed} de {intern.total} tareas
                                completadas
                            </p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
