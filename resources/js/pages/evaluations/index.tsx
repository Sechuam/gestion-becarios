import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Evaluaciones', href: '/evaluaciones' },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tareas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                    <p className="text-muted-foreground text-sm italic">
                        Módulo de Evaluaciones
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}