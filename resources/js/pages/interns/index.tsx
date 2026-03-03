import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";

// Array de objetos con la propiedad title y href
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Becarios', href: '/becarios' },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Becarios" />
            <div className="p-4">
                <h1 className="text-2xl font-bold">Lista de becarios</h1>
                <p className="text-gray-600">Aquí podremos gestionar a todos los becarios del sistema</p>
            </div>
        </AppLayout>
    );
}


