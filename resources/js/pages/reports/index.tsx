import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { FileBarChart2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reportes e informes', href: '/reportes' },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />
            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Reportes e informes"
                    description="Analítica avanzada, reportes de asistencia y métricas de cumplimiento de objetivos."
                    icon={<FileBarChart2 className="h-6 w-6" />}
                />

                <div className="rounded-[2.5rem] border border-sidebar/10 bg-white p-12 shadow-xl dark:bg-slate-900/60">
                    <EmptyState
                        title="Centro de Reportes"
                        description="Próximamente podrás generar informes detallados y exportaciones personalizadas de toda la actividad."
                        icon={<FileBarChart2 className="h-8 w-8 text-sidebar" />}
                        className="bg-slate-50/50 rounded-[2rem] border-dashed"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
