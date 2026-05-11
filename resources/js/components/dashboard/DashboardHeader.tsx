import { Link } from '@inertiajs/react';
import { BarChart3, FileDown } from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Button } from '@/components/ui/button';

type Props = {
    roleLabel: string;
    alerts: number;
    completedTasks: number;
    taskCompletion: number;
};

export function DashboardHeader({
    roleLabel,
    alerts,
    completedTasks,
    taskCompletion,
}: Props) {
    return (
        <ModuleHeader
            title={`Dashboard ${roleLabel}`}
            description="Centro de control operativo con KPIs, actividad horaria, tareas y reportes exportables."
            icon={<BarChart3 className="h-6 w-6" />}
            actions={
                <Button
                    asChild
                    className="h-9 rounded-lg bg-white text-sidebar hover:bg-white/90"
                >
                    <Link href="/reportes">
                        <FileDown className="mr-2 h-4 w-4" />
                        Reportes
                    </Link>
                </Button>
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
                { label: 'Widgets', value: 4, hint: 'Datos con caché' },
            ]}
        />
    );
}
