import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteCenterModal from '@/components/schools/DeleteCenterModal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/schools' },
];

export default function Index({ schools }: { schools: any }) {
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage schools');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centros Educativos" />

            <div className="flex flex-col gap-6 p-6">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Centros Educativos</h1>
                        <p className="text-muted-foreground text-sm">
                            Gestiona las instituciones, universidades y centros de formación.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button className="gap-2" asChild>
                                <Link href="/schools/create">
                                    <Plus className="h-4 w-4" />
                                    Añadir Centro
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* FILTROS */}
                {/* FILTROS */}
<div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-card shadow-sm">
    <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
            placeholder="Buscar por nombre..."
            className="pl-9"
            onChange={(e) =>
                router.get(
                    '/schools',
                    { search: e.target.value },
                    { preserveState: true, preserveScroll: true, replace: true }
                )
            }
        />
    </div>
</div>

                {/* TABLA */}
                <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-[900px] w-full text-sm text-left">
                            <thead>
                                <tr className="border-b bg-slate-50 border-b-slate-200">
                                    <th className="px-4 py-4 text-left font-semibold text-slate-700">Nombre</th>
                                    <th className="px-4 py-4 text-left font-semibold text-slate-700">Código</th>
                                    <th className="px-4 py-4 text-left font-semibold text-slate-700">Ciudad</th>
                                    <th className="px-4 py-4 text-left font-semibold text-slate-700">Contacto</th>
                                    <th className="px-4 py-4 text-left font-semibold text-slate-700">Email</th>
                                    <th className="px-4 py-4 text-left font-semibold text-slate-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools.data.map((school: any) => (
                                    <tr
                                        key={school.id}
                                        className="border-b hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="px-4 py-4 text-slate-700">{school.name}</td>
                                        <td className="px-4 py-4 text-slate-600">{school.code}</td>
                                        <td className="px-4 py-4 text-slate-600">{school.city}</td>
                                        <td className="px-4 py-4 text-slate-600">{school.contact_person}</td>
                                        <td className="px-4 py-4 text-slate-600">{school.email}</td>
                                        <td className="px-4 py-4 flex gap-2">
                                            {canManage ? (
                                                <>
                                                    <Button variant="outline" size="sm" className="gap-1" asChild>
                                                        <Link href={`/schools/${school.id}/edit`}>
                                                            Editar
                                                        </Link>
                                                    </Button>
                                                    <DeleteCenterModal school={school} />
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Solo lectura</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINACIÓN */}
                <div className="flex items-center gap-2">
                    {schools.links.map((link: any, i: number) => {
                        let label = link.label.replace('Previous', 'Anterior').replace('Next', 'Siguiente');
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 text-sm rounded border ${
                                    link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: label }}
                                preserveState
                            />
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}