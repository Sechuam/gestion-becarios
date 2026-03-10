import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/schools' },
];

export default function Index({ schools }: { schools: any }) {
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

                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="border rounded px-3 py-2 text-sm w-64"
                    onChange={(e) => router.get('/schools', {
                        search: e.target.value
                    }, { preserveState: true, replace: true })}
                />


                <div className="flex flex-col gap-4">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 px-4">Nombre</th>
                                <th className="py-2 px-4">Código</th>
                                <th className="py-2 px-4">Ciudad</th>
                                <th className="py-2 px-4">Contacto</th>
                                <th className="py-2 px-4">Email</th>
                                <th className="py-2 px-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.data.map((school: any) => (
                                <tr key={school.id} className="border-b hover:bg-muted/50">
                                    <td className="py-2 px-4">{school.name}</td>
                                    <td className="py-2 px-4">{school.code}</td>
                                    <td className="py-2 px-4">{school.city}</td>
                                    <td className="py-2 px-4">{school.contact_person}</td>
                                    <td className="py-2 px-4">{school.email}</td>
                                    <td className="py-2 px-4">
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center gap-1 mt-4">
                        {schools.links.map((link: any, i: number) => {
                            let label = link.label
                                .replace('Previous', 'Anterior')
                                .replace('Next', 'Siguiente');
                            return (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={`px-3 py-1 text-sm rounded border ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                    preserveState
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}