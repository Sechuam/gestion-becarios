import { Link } from '@inertiajs/react';
import { BarChart3, FileDown, LayoutDashboard, Save, Settings2 } from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    roleLabel: string;
    alerts: number;
    completedTasks: number;
    taskCompletion: number;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    onManageWidgets: () => void;
};

export function DashboardHeader({
    roleLabel,
    alerts,
    completedTasks,
    taskCompletion,
    isEditing,
    setIsEditing,
    onManageWidgets,
}: Props) {
    return (
        <ModuleHeader
            title={`Dashboard ${roleLabel}`}
            description="Centro de control operativo con KPIs, actividad horaria, tareas y reportes exportables."
            icon={<BarChart3 className="h-6 w-6" />}
            actions={
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button
                            asChild
                            className="h-9 flex-1 rounded-lg bg-white text-sidebar hover:bg-white/90 shadow-sm border border-slate-100"
                        >
                            <Link href="/reportes">
                                <FileDown className="mr-2 h-4 w-4" />
                                Reportes
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onManageWidgets}
                            className="h-9 w-9 p-0 rounded-lg bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-sm"
                            title="Gestionar Widgets"
                        >
                            <Settings2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                            "h-9 rounded-lg px-4 font-bold transition-all active:scale-95 shadow-sm border",
                            isEditing 
                                ? "bg-sidebar text-white hover:bg-sidebar/90 border-transparent" 
                                : "bg-white text-sidebar hover:bg-white/90 border-slate-100"
                        )}
                    >
                        {isEditing ? (
                            <>
                                <Save className="mr-2 h-4 w-4 animate-pulse" />
                                Guardar diseño
                            </>
                        ) : (
                            <>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Editar diseño
                            </>
                        )}
                    </Button>
                </div>
            }
            metrics={[
                {
                    label: 'Alertas',
                    value: alerts,
                    hint: 'Necesitan revisión',
                },
                {
                    label: 'Tareas completadas',
                    value: completedTasks,
                    hint: `${taskCompletion}% del total`,
                },
                { label: 'Widgets', value: 7, hint: 'Datos con caché' },
            ]}
        />
    );
}
