import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
    Users, 
    BarChart3, 
    PieChart, 
    Clock3, 
    CalendarDays, 
    TrendingUp, 
    AlertCircle 
} from 'lucide-react';

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
        icon: <Users className="h-5 w-5 text-blue-500" />
    },
    { 
        id: 'interns_chart', 
        label: 'Becarios por Centro', 
        description: 'Distribución visual de becarios en centros educativos.',
        icon: <BarChart3 className="h-5 w-5 text-indigo-500" />
    },
    { 
        id: 'task_chart', 
        label: 'Estado de Tareas', 
        description: 'Gráfico circular con el progreso global de tareas.',
        icon: <PieChart className="h-5 w-5 text-purple-500" />
    },
    { 
        id: 'attendance', 
        label: 'Control de Asistencia', 
        description: 'Gráficos de cumplimiento horario y tasas de ausencia.',
        icon: <Clock3 className="h-5 w-5 text-emerald-500" />
    },
    { 
        id: 'agenda', 
        label: 'Agenda de Hoy', 
        description: 'Próximos eventos y registro de actividad actual.',
        icon: <CalendarDays className="h-5 w-5 text-orange-500" />
    },
    { 
        id: 'progress', 
        label: 'Progreso de Tareas', 
        description: 'Ranking de becarios por resolución de tareas.',
        icon: <TrendingUp className="h-5 w-5 text-cyan-500" />
    },
    { 
        id: 'alerts', 
        label: 'Alertas Críticas', 
        description: 'Avisos directos sobre incidencias importantes.',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
    },
];

interface ManageWidgetsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visibleWidgets: string[];
    onToggleWidget: (id: string) => void;
}

export function ManageWidgetsModal({ 
    open, 
    onOpenChange, 
    visibleWidgets, 
    onToggleWidget 
}: ManageWidgetsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 border-none bg-background shadow-2xl overflow-hidden">
                <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <BarChart3 className="h-5 w-5 text-slate-600" />
                        </div>
                        <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                            Configurar Widgets
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-500 font-medium">
                        Elige qué módulos quieres ver en tu panel principal.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar">
                    {AVAILABLE_WIDGETS.map((widget) => {
                        const isVisible = visibleWidgets.includes(widget.id);
                        return (
                            <div 
                                key={widget.id}
                                onClick={() => onToggleWidget(widget.id)}
                                className={`
                                    flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
                                    ${isVisible 
                                        ? 'bg-white border-slate-200 shadow-sm' 
                                        : 'bg-slate-50/50 border-transparent opacity-60'
                                    }
                                    hover:border-slate-300
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${isVisible ? 'bg-slate-50' : 'bg-slate-200/50'}`}>
                                        {widget.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                                            {widget.label}
                                        </p>
                                        <p className="text-[11px] font-medium text-slate-500 leading-tight">
                                            {widget.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={isVisible}
                                    onCheckedChange={() => onToggleWidget(widget.id)}
                                    className="data-[state=checked]:bg-sidebar"
                                />
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <Button 
                        onClick={() => onOpenChange(false)}
                        className="w-full h-11 rounded-2xl bg-sidebar text-white font-black uppercase tracking-widest text-[10px] hover:bg-sidebar/90 shadow-lg"
                    >
                        Finalizar Configuración
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
