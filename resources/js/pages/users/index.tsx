import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function UsersIndex() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Usuarios', href: '/usuarios' }]}>
            <Head title="Usuarios" />
            <div className="p-4"><h1>Gestión General de Usuarios</h1></div>
        </AppLayout>
    );
}