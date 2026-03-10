import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, GraduationCap, Calendar, FileText, ArrowLeft } from 'lucide-react';
export default function Show({ intern }: { intern: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Becarios', href: '/becarios' },
        { title: intern.user.name, href: '#' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Perfil de ${intern.user.name}`} />
            <div className="p-4 space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" asChild className="gap-2">
                        <Link href="/becarios"><ArrowLeft className="h-4 w-4" /> Volver</Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/interns/${intern.id}/edit`}>Editar Perfil</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tarjeta de Datos Personales */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div><p className="text-xs text-muted-foreground">Nombre</p><p className="font-medium">{intern.user.name}</p></div>
                            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{intern.user.email}</p></div>
                            <div><p className="text-xs text-muted-foreground">DNI</p><p className="font-medium">{intern.dni}</p></div>
                            <div><p className="text-xs text-muted-foreground">Teléfono</p><p className="font-medium">{intern.phone || 'No indicado'}</p></div>
                        </CardContent>
                    </Card>
                    {/* Tarjeta de Datos Académicos y Prácticas */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Académicos y Prácticas</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-6">
                            <div><p className="text-xs text-muted-foreground">Centro</p><p className="font-medium">{intern.education_center.name}</p></div>
                            <div><p className="text-xs text-muted-foreground">Titulación</p><p className="font-medium">{intern.academic_degree}</p></div>
                            <div><p className="text-xs text-muted-foreground">Tutor Centro</p><p className="font-medium">{intern.tutor_name || 'Sin asignar'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Estado</p><p className="font-medium uppercase">{intern.status}</p></div>
                            <div className="col-span-2 border-t pt-4 grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Inicio</p><p className="font-medium">{intern.start_date}</p></div>
                                <div><p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Fin</p><p className="font-medium">{intern.end_date}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Tarjeta de Documentos (Pendiente de implementar subida) */}
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documentación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg opacity-50">
                                <FileText className="h-10 w-10 mb-2" />
                                <p className="text-sm font-medium">No hay documentos subidos</p>
                                <p className="text-xs">Próximamente: DNI, Convenio, Seguro...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}