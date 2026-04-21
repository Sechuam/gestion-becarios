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
            <div className="space-y-6">
                {/* HERO SECTION CON GRADIENTE CORPORATIVO */}
                <section className="relative overflow-hidden bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 shadow-2xl md:p-10 rounded-[2.5rem]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_70%)] lg:block" />
                    
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 space-y-3">
                            <p className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/90 backdrop-blur-md border border-white/20">
                                Centro de control
                            </p>
                            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl leading-none">
                                Visión general <br/> del programa
                            </h1>
                            <p className="max-w-xl text-sm font-medium text-white/70 leading-relaxed italic">
                                Supervisa la actividad diaria, detecta incidencias y accede rápido a los módulos del sistema.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-full px-3 h-6 text-[9px] font-black uppercase tracking-widest">Ritmo semanal estable</Badge>
                                <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-full px-3 h-6 text-[9px] font-black uppercase tracking-widest">3 revisiones pendientes</Badge>
                            </div>
                        </div>

                        <div className="grid min-w-[280px] grid-cols-2 gap-3">
                            <div className="relative overflow-hidden rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:bg-white/15">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                                    Cumplimiento
                                </p>
                                <p className="mt-1 text-2xl font-black tracking-tight text-white text-emerald-300">92%</p>
                                <p className="mt-1 text-[9px] font-bold text-white/50 uppercase tracking-widest">Activo</p>
                            </div>
                            <div className="relative overflow-hidden rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:bg-white/15">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                                    Completadas
                                </p>
                                <p className="mt-1 text-2xl font-black tracking-tight text-white">41</p>
                                <p className="mt-1 text-[9px] font-bold text-white/50 uppercase tracking-widest">Ciclo actual</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* METRICS GRID */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <Card key={metric.label} className="rounded-[2rem] border-sidebar/10 bg-white p-2 shadow-xl dark:bg-slate-900 transition-all hover:scale-[1.02] hover:shadow-2xl">
                            <CardContent className="flex items-start justify-between gap-4 p-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {metric.label}
                                    </p>
                                    <p className="text-4xl font-black tracking-tight text-slate-800 dark:text-white">
                                        {metric.value}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 italic">{metric.hint}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sidebar text-white shadow-lg shadow-sidebar/20 pt-1">
                                    <metric.icon className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                    <Card className="rounded-[2.5rem] border-sidebar/10 bg-white shadow-2xl overflow-hidden dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between gap-6 border-b border-sidebar/5 p-8 pb-6">
                            <div>
                                <p className="inline-flex items-center rounded-full bg-sidebar/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sidebar">Actividad</p>
                                <CardTitle className="mt-4 text-2xl font-black tracking-tight text-slate-800 dark:text-white">Mapa operativo del día</CardTitle>
                            </div>
                            <Badge variant="outline" className="border-sidebar/20 bg-slate-50 px-4 h-8 rounded-full text-[10px] font-bold uppercase tracking-widest text-sidebar shadow-inner">
                                <Activity className="mr-2 h-4 w-4" />
                                Actualizado hace 2 min
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-sidebar/10 bg-slate-50/50 dark:bg-slate-800/50">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                                <div className="relative grid gap-4 p-6 md:grid-cols-3">
                                    <div className="rounded-2xl border border-sidebar/10 bg-white p-6 shadow-sm dark:bg-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-sidebar">Control horario</p>
                                        <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">3 incidencias</p>
                                        <p className="mt-1 text-xs font-medium text-slate-500">Pendientes hoy</p>
                                    </div>
                                    <div className="rounded-2xl border border-sidebar/10 bg-white p-6 shadow-sm dark:bg-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-sidebar">Tareas</p>
                                        <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">13 revisiones</p>
                                        <p className="mt-1 text-xs font-medium text-slate-500">Por validar</p>
                                    </div>
                                    <div className="rounded-2xl border border-sidebar/10 bg-white p-6 shadow-sm dark:bg-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-sidebar">Ausencias</p>
                                        <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">2 solicitudes</p>
                                        <p className="mt-1 text-xs font-medium text-slate-500">Por aprobar</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card className="rounded-[2.5rem] border-sidebar/10 bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="border-b border-sidebar/5 p-8 pb-6 bg-slate-50/30 dark:bg-slate-800/30">
                                <p className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600">Atención necesaria</p>
                                <CardTitle className="mt-4 text-2xl font-black tracking-tight text-slate-800 dark:text-white">Bloqueos y alertas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-8 pt-6">
                                {[
                                    ['Becario con deuda de horas', 'Revisar seguimiento en control horario'],
                                    ['3 tareas con entrega sensible', 'Conviene priorizar seguimiento del tutor'],
                                    ['1 convenio vence este mes', 'Validar renovación del centro'],
                                ].map(([title, description]) => (
                                    <div key={title} className="group rounded-[1.5rem] border border-sidebar/10 bg-white p-5 shadow-sm transition-all hover:bg-rose-50/30 hover:border-rose-200 dark:bg-slate-800">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-inner">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-800 dark:text-white group-hover:text-rose-700 transition-colors">{title}</p>
                                                <p className="text-sm font-medium text-slate-500 leading-snug">{description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <EmptyState
                            title="Tus accesos rápidos"
                            description="Conecta métricas reales y widgets para personalizar tu experiencia diaria."
                            icon={<CheckCircle2 className="h-6 w-6 text-sidebar" />}
                            className="rounded-[2.5rem] border-sidebar/10 shadow-xl bg-slate-50/50 dark:bg-slate-800/50"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
