import { Link } from '@inertiajs/react';
import {
    BarChart3,
    FileDown,
    LayoutDashboard,
    Save,
    Settings2,
} from 'lucide-react';
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
    isEditing,
    setIsEditing,
    onManageWidgets,
}: Props) {
    return (
        <ModuleHeader
            title={`Dashboard ${roleLabel}`}
            description="Control de rendimiento, tareas activas y seguimiento del programa de becarios en tiempo real."
            icon={<BarChart3 className="h-6 w-6" />}
            variant="sidebar"
            actions={
                <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-[18rem]">
                    <div className="flex gap-2">
                        <Button
                            asChild
                            className="h-9 min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-3 text-sidebar shadow-sm hover:bg-white/90"
                        >
                            <Link href="/reportes">
                                <FileDown className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Reportes
                                </span>
                                <span className="sm:hidden">Informes</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onManageWidgets}
                            aria-label="Gestionar widgets del dashboard"
                            className="h-9 w-9 rounded-lg border-white/20 bg-white p-0 text-sidebar shadow-sm hover:bg-slate-50"
                            title="Gestionar Widgets"
                        >
                            <Settings2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                            'h-9 rounded-lg border px-3 text-xs font-bold shadow-sm transition-all active:scale-95 sm:px-4 sm:text-sm',
                            isEditing
                                ? 'border-white/15 bg-[#4e7f78] text-white hover:bg-[#426f68]'
                                : 'border-white/20 bg-white text-sidebar hover:bg-white/90',
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
        />
    );
}
