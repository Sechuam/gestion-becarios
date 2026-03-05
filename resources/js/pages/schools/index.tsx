import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/schools' },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centros Educativos" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Centros Educativos</h1>
                        <p className="text-muted-foreground">
                            Gestiona las instituciones, universidades y centros de formación.
                        </p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Añadir Centro
                    </Button>
                </div>

                {/* Contenedor temporal para la tabla o lista */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border flex-1 rounded-xl border-2 border-dashed">
                    <div className="flex h-full flex-col items-center justify-center space-y-2">
                        <Building2 className="text-muted-foreground h-12 w-12 opacity-20" />
                        <p className="text-muted-foreground font-medium">No hay centros registrados</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}