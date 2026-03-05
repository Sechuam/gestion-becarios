import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function UsersIndex() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Usuarios', href: '/usuarios' }]}>
            <Head title="Usuarios" />
            <div className="p-4"><h1>Gestión General de Usuarios</h1></div>
        </AppLayout>
    );
}