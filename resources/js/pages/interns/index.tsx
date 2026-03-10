import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DeleteInternModal from '@/components/interns/DeleteInternModal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Becarios', href: '/becarios' },
];
export default function Index({ interns, filters }: { interns: any; filters: any }) {
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage interns');
    // Función para manejar la búsqueda en tiempo real
    const handleSearch = (value: string) => {
        router.get('/becarios', { search: value }, {
            preserveState: true,
            replace: true
        });
    };
    // Formateador de colores para los estados
    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            active: { label: 'ACTIVO', className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' },
            pending: { label: 'PENDIENTE', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200' },
            completed: { label: 'COMPLETADO', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' },
            cancelled: { label: 'CANCELADO', className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' },
        };
        const item = config[status] || { label: status.toUpperCase(), className: '' };

        return (
            <Badge variant="outline" className={item.className}>
                {item.label}
            </Badge>
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Becarios" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                            <Users className="h-6 w-6" />
                            Gestión de Becarios
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Administra los becarios, sus centros y estados de prácticas.
                        </p>
                    </div>
                    {canManage && (
                        <Button className="gap-2" asChild>
                            <Link href="/interns/create">
                                <Plus className="h-4 w-4" />
                                Añadir Becario
                            </Link>
                        </Button>
                    )}
                </div>
                {/* Filtros y Buscador */}
                <div className="flex items-center gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-9"
                            defaultValue={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
                {/* Tabla de Becarios */}
                <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 transition-colors">
                                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Nombre</th>
                                <th className="h-12 px-4 text-left font-medium text-muted-foreground">DNI</th>
                                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Centro Educativo</th>
                                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Grado</th>
                                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 text-gray-500">
                            {interns.data.map((intern: any) => (
                                <tr key={intern.id} className="border-b hover:bg-muted/50 transition-colors">
                                    <td className="p-4 font-medium text-foreground">{intern.user?.name}</td>
                                    <td className="p-4">{intern.dni}</td>
                                    <td className="p-4">{intern.education_center?.name}</td>
                                    <td className="p-4">{intern.academic_degree}</td>
                                    <td className="p-4">{getStatusBadge(intern.status)}</td>
                                    <td className="p-4 flex gap-3">
                                        <Link href={`/interns/${intern.id}`} className="text-gray-600 hover:underline">Ver</Link>
                                        {canManage ? (
                                            <>
                                                <Link href={`/interns/${intern.id}/edit`} className="text-blue-600 hover:underline">Editar</Link>
                                                <DeleteInternModal intern={intern} />
                                            </>
                                        ) : (
                                            <span className="italic text-xs opacity-50 text-gray-400">Solo lectura</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Paginación */}
                <div className="flex items-center gap-2">
                    {interns.links.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`px-3 py-1 text-sm border rounded shadow-sm transition-colors ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'bg-white hover:bg-gray-50'} ${!link.url ? 'opacity-30 pointer-events-none' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', 'Anterior').replace('Next', 'Siguiente') }}
                            preserveState
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}