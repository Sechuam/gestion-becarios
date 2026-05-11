import { FileBarChart2 } from 'lucide-react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import type { ReportsSummary } from './types';

type Props = {
    summary: ReportsSummary;
};

export function ReportsHeader({ summary }: Props) {
    return (
        <ModuleHeader
            title="Reportes e informes"
            description="Constructor de informes personalizables con exportación Excel/PDF y plantillas guardadas."
            icon={<FileBarChart2 className="h-6 w-6" />}
            metrics={[
                { label: 'Becarios', value: summary.interns },
                { label: 'Tareas', value: summary.tasks },
                { label: 'Fichajes', value: summary.time_logs },
                { label: 'Evaluaciones', value: summary.evaluations },
            ]}
        />
    );
}
