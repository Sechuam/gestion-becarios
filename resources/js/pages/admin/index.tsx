import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// Array de objetos con la propiedad title y href
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/usuarios' },
    { title: 'Administrador', href: '/administrador' },
];

export default function Index() {
    return (
        // Todo lo que hay dentro de AppLayout es el contenido
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administrador" />
            <div className="p-4">
                <h1 className="text-2xl font-bold">
                    Estás en la pestaña de administradores
                </h1>
                <p className="text-gray-600">
                    Aquí verás todo lo que puedes hacer como administrador.
                </p>
            </div>
        </AppLayout>
    );
}
