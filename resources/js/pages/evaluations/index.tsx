import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { ClipboardList, SlidersHorizontal } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Evaluaciones', href: '/evaluaciones' },
];

export default function Index() {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.roles?.includes('admin');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluaciones" />
            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Evaluaciones"
                    description="Módulo de seguimiento de desempeño, feedback de tutores y autoevaluaciones de becarios."
                    icon={<ClipboardList className="h-6 w-6" />}
                    actions={
                        isAdmin ? (
                            <Button
                                className="h-12 rounded-2xl bg-white px-8 pt-2 font-black text-sidebar shadow-lg transition-all hover:bg-white/90"
                                onClick={() => router.get('/evaluaciones/criterios')}
                            >
                                <SlidersHorizontal className="mr-2 h-5 w-5" />
                                Gestionar criterios
                            </Button>
                        ) : undefined
                    }
                />

                <div className="rounded-[2.5rem] border border-sidebar/10 bg-white p-12 shadow-xl dark:bg-slate-900/60">
                    <EmptyState
                        title="Módulo de Evaluaciones en camino"
                        description="Estamos preparando las herramientas de seguimiento de competencias y feedback 360º para tu programa."
                        icon={<ClipboardList className="h-8 w-8 text-sidebar" />}
                        className="bg-slate-50/50 rounded-[2rem] border-dashed"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
