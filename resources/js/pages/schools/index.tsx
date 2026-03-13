import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search } from 'lucide-react';
import DeleteCenterModal from '@/components/schools/DeleteCenterModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

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

            <div className="flex flex-col gap-6 p-6 bg-background text-foreground">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Centros Educativos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las instituciones, universidades y centros de formación.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white" asChild>
                                <Link href="/schools/create">
                                    <Plus className="h-4 w-4" />
                                    Añadir Centro
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* FILTROS */}
                <div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-card border-border shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                            onChange={(e) =>
                                router.get(
                                    '/schools',
                                    { search: e.target.value },
                                    { preserveState: true, preserveScroll: true, replace: true }
                                )
                            }
                        />
                    </div>
                    <p className="text-sm text-muted-foreground ml-auto font-medium">
                        Mostrando {schools.data.length} de {schools.total} centros
                    </p>
                </div>

                {/* TABLA */}
                <div className="w-full rounded-xl border bg-card border-border shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-[900px] w-full text-sm text-left">
                            <thead>
                                <tr className="border-b bg-muted border-b-border">
                                    <th className="px-4 py-4 text-left font-semibold text-foreground">Nombre</th>
                                    <th className="px-4 py-4 text-left font-semibold text-foreground">Código</th>
                                    <th className="px-4 py-4 text-left font-semibold text-foreground">Ciudad</th>
                                    <th className="px-4 py-4 text-left font-semibold text-foreground">Contacto</th>
                                    <th className="px-4 py-4 text-left font-semibold text-foreground">Email Coordinador</th>
                                    <th className="px-4 py-4 text-left font-semibold text-foreground">Email Institucional</th>
                                    <th className="px-4 py-4 text-left font-semibold text-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools.data.map((school: any) => (
                                    <tr
                                        key={school.id}
                                        className="border-b border-border hover:bg-muted/60 transition-colors"
                                    >
                                        <td className="px-4 py-4 text-foreground">
                                            <Link href={`/schools/${school.id}`} className="hover:underline">
                                                {school.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">{school.code}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{school.city}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{school.contact_person}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{school.contact_email}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{school.email}</td>
                                        <td className="px-4 py-4 flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-card text-muted-foreground border-border hover:text-blue-600 hover:bg-blue-50 font-medium shadow-none"
                                                asChild
                                            >
                                                <Link href={`/schools/${school.id}`}>
                                                    <div className="flex items-center">
                                                        <Eye className="w-4 h-4 mr-1.5 text-blue-500/70" /> Ver
                                                    </div>
                                                </Link>
                                            </Button>
                                            {canManage ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-card text-muted-foreground border-border hover:text-amber-600 hover:bg-amber-50 font-medium shadow-none"
                                                        asChild
                                                    >
                                                        <Link href={`/schools/${school.id}/edit`}>
                                                            <div className="flex items-center">
                                                                <Pencil className="w-4 h-4 mr-1.5 text-amber-500/70" /> Editar
                                                            </div>
                                                        </Link>
                                                    </Button>
                                                    <DeleteCenterModal school={school} />
                                                </>
                                            ) : null}
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
                        const label = link.label.replace('Previous', 'Anterior').replace('Next', 'Siguiente');
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 text-sm rounded border border-border ${
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
