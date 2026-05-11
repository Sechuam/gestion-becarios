import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DashboardTaskProgress } from './types';

type Props = {
    taskProgress: DashboardTaskProgress[];
};

export function InternTaskProgressPanel({ taskProgress }: Props) {
    return (
        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-lg font-black">
                        Panel de progreso por becario
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        Tareas completadas, carga total y horas fichadas.
                    </p>
                </div>
                <TrendingUp className="h-5 w-5 text-sidebar" />
            </CardHeader>
            <CardContent className="space-y-3">
                {taskProgress.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-sidebar/20 p-6 text-sm text-slate-500">
                        Todavía no hay tareas vinculadas para mostrar progreso.
                    </div>
                ) : (
                    taskProgress.map((intern) => (
                        <div
                            key={intern.id}
                            className="rounded-lg border border-sidebar/10 p-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                        {intern.name}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                        {intern.center}
                                    </p>
                                </div>
                                <Badge variant="outline" className="rounded-lg">
                                    {intern.hours} h
                                </Badge>
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                                <Progress
                                    value={intern.progress}
                                    className="h-2"
                                />
                                <span className="w-10 text-right text-xs font-black text-slate-500">
                                    {intern.progress}%
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
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
