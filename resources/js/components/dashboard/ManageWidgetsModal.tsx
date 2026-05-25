import {
    Users,
    BarChart3,
    PieChart,
    Clock3,
    CalendarDays,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface WidgetConfig {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const AVAILABLE_WIDGETS: WidgetConfig[] = [
    {
        id: 'metrics',
        label: 'Métricas KPIs',
        description: 'Tarjetas con contadores de becarios, tareas y alertas.',
        icon: <Users className="h-5 w-5 text-blue-500" />,
    },
    {
        id: 'interns_chart',
        label: 'Becarios por Centro',
        description: 'Distribución visual de becarios en centros educativos.',
        icon: <BarChart3 className="h-5 w-5 text-indigo-500" />,
    },
    {
        id: 'task_chart',
        label: 'Estado de Tareas',
        description: 'Gráfico circular con el progreso global de tareas.',
        icon: <PieChart className="h-5 w-5 text-purple-500" />,
    },
    {
        id: 'attendance',
        label: 'Control de Asistencia',
        description: 'Gráficos de cumplimiento horario y tasas de ausencia.',
        icon: <Clock3 className="h-5 w-5 text-emerald-500" />,
    },
    {
        id: 'agenda',
        label: 'Agenda de Hoy',
        description: 'Próximos eventos y registro de actividad actual.',
        icon: <CalendarDays className="h-5 w-5 text-orange-500" />,
    },
    {
        id: 'progress',
        label: 'Progreso de Tareas',
        description: 'Ranking de becarios por resolución de tareas.',
        icon: <TrendingUp className="h-5 w-5 text-cyan-500" />,
    },
    {
        id: 'alerts',
        label: 'Alertas Críticas',
        description: 'Avisos directos sobre incidencias importantes.',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
];

interface ManageWidgetsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visibleWidgets: string[];
    supportedWidgets?: string[];
    onToggleWidget: (id: string) => void;
}

export function ManageWidgetsModal({
    open,
    onOpenChange,
    visibleWidgets,
    supportedWidgets,
    onToggleWidget,
}: ManageWidgetsModalProps) {
    const widgets = supportedWidgets
        ? AVAILABLE_WIDGETS.filter((widget) =>
              supportedWidgets.includes(widget.id),
          )
        : AVAILABLE_WIDGETS;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden rounded-xl border-none bg-background p-0 shadow-xl sm:max-w-[500px]">
                <DialogHeader className="border-b border-slate-100 p-5 pb-4">
                    <div className="mb-1 flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2">
                            <BarChart3 className="h-5 w-5 text-slate-600" />
                        </div>
                        <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                            Configurar Widgets
                        </DialogTitle>
                    </div>
                    <DialogDescription className="font-medium text-slate-500">
                        Elige qué módulos quieres ver en tu panel principal.
                    </DialogDescription>
                </DialogHeader>

                <div className="custom-scrollbar max-h-[450px] space-y-3 overflow-y-auto p-6">
                    {widgets.map((widget) => {
                        const isVisible = visibleWidgets.includes(widget.id);
                        return (
                            <div
                                key={widget.id}
                                onClick={() => onToggleWidget(widget.id)}
                                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                                    isVisible
                                        ? 'border-slate-200 bg-white shadow-sm'
                                        : 'border-transparent bg-slate-50/50 opacity-60'
                                } hover:border-slate-300`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`rounded-xl p-2.5 ${isVisible ? 'bg-slate-50' : 'bg-slate-200/50'}`}
                                    >
                                        {widget.icon}
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm leading-none font-bold text-slate-900">
                                            {widget.label}
                                        </p>
                                        <p className="text-[11px] leading-tight font-medium text-slate-500">
                                            {widget.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={isVisible}
                                    onCheckedChange={() =>
                                        onToggleWidget(widget.id)
                                    }
                                    className="data-[state=checked]:bg-sidebar"
                                />
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="border-t border-slate-100 bg-slate-50/50 p-6">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="h-11 w-full rounded-xl bg-sidebar text-[10px] font-black tracking-widest text-white uppercase shadow-lg hover:bg-sidebar/90"
                    >
                        Finalizar Configuración
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
