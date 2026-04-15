import { Head } from '@inertiajs/react';
import { Activity, AlertTriangle, Building2, CheckCircle2, Clock3, KanbanSquare, Users } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

export default function Dashboard() {
    const metrics = [
        {
            label: 'Becarios activos',
            value: '24',
            hint: 'Seguimiento en tiempo real',
            icon: Users,
        },
        {
            label: 'Centros vinculados',
            value: '8',
            hint: 'Convenios y plazas',
            icon: Building2,
        },
        {
            label: 'Tareas en revisión',
            value: '13',
            hint: 'Pendientes de validación',
            icon: KanbanSquare,
        },
        {
            label: 'Alertas horarias',
            value: '3',
            hint: 'Requieren seguimiento hoy',
            icon: AlertTriangle,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="dashboard-grid">
                <section className="app-panel relative overflow-hidden p-6">
                    <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_top_right,rgba(132,183,175,0.22),transparent_58%)] lg:block" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <p className="section-kicker">Centro de control</p>
                            <h1 className="page-title">Visión general del programa</h1>
                            <p className="page-subtitle">
                                Supervisa la actividad diaria, detecta incidencias y accede rápido a los módulos con más movimiento.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-background/70">Ritmo semanal estable</Badge>
                                <Badge variant="outline" className="bg-background/70">3 revisiones pendientes</Badge>
                            </div>
                        </div>
                        <div className="grid min-w-[280px] grid-cols-2 gap-3">
                            <div className="metric-tile px-4 py-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Cumplimiento horario
                                </p>
                                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground">92%</p>
                                <p className="mt-1 text-xs text-muted-foreground">Mejor que la semana pasada</p>
                            </div>
                            <div className="metric-tile px-4 py-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Tareas completadas
                                </p>
                                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground">41</p>
                                <p className="mt-1 text-xs text-muted-foreground">Cierre operativo del ciclo</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <Card key={metric.label} className="app-panel border-sidebar">
                            <CardContent className="flex items-start justify-between gap-4 pt-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        {metric.label}
                                    </p>
                                    <p className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                                        {metric.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{metric.hint}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary">
                                    <metric.icon className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
                    <Card className="app-panel overflow-hidden border-sidebar">
                        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-sidebar/20 pb-4">
                            <div>
                                <p className="section-kicker">Actividad</p>
                                <CardTitle className="mt-2 text-xl">Mapa operativo del día</CardTitle>
                            </div>
                            <Badge variant="outline" className="bg-background/80">
                                <Activity className="mr-1 h-3.5 w-3.5" />
                                Actualizado hace 2 min
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="relative min-h-[22rem] overflow-hidden rounded-[1.15rem] border border-sidebar/30 bg-muted/20">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/15 dark:stroke-neutral-100/10" />
                                <div className="relative grid gap-4 p-6 md:grid-cols-3">
                                    <div className="metric-tile px-4 py-4">
                                        <p className="text-xs font-semibold text-foreground">Control horario</p>
                                        <p className="mt-1 text-sm text-muted-foreground">3 incidencias abiertas</p>
                                    </div>
                                    <div className="metric-tile px-4 py-4">
                                        <p className="text-xs font-semibold text-foreground">Tareas</p>
                                        <p className="mt-1 text-sm text-muted-foreground">13 en revisión</p>
                                    </div>
                                    <div className="metric-tile px-4 py-4">
                                        <p className="text-xs font-semibold text-foreground">Ausencias</p>
                                        <p className="mt-1 text-sm text-muted-foreground">2 por aprobar</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card className="app-panel border-sidebar">
                            <CardHeader className="border-b border-sidebar/20 pb-4">
                                <p className="section-kicker">Atención</p>
                                <CardTitle className="mt-2 text-xl">Bloqueos y alertas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6">
                                {[
                                    ['Becario con deuda de horas', 'Revisar seguimiento en control horario'],
                                    ['3 tareas con entrega sensible', 'Conviene priorizar seguimiento del tutor'],
                                    ['1 convenio vence este mes', 'Validar renovación del centro'],
                                ].map(([title, description]) => (
                                    <div key={title} className="rounded-2xl border border-sidebar/30 bg-muted/25 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-foreground">{title}</p>
                                                <p className="text-sm text-muted-foreground">{description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <EmptyState
                            title="Tus accesos rápidos están listos para personalizar"
                            description="Este panel puede convertirse en el resumen principal por rol cuando conectéis métricas reales y widgets de negocio."
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
