import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, GraduationCap, Calendar, FileText, ArrowLeft, Clock } from 'lucide-react';

export default function Show({ intern, dni_url, agreement_url, insurance_url, activities }: { intern: any, dni_url: string, agreement_url: string, insurance_url: string, activities: any[] }) {
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

                {/* Cuadrícula principal: 3 columnas en pantallas grandes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Tarjeta de Datos Personales (Ocupa 1 columna) */}
                    <Card className="md:col-span-1 shadow-sm">
                        <CardHeader className="bg-muted/30 pb-3">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <User className="h-5 w-5" /> Datos Personales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Nombre</p><p className="font-medium">{intern.user.name}</p></div>
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p><p className="font-medium">{intern.user.email}</p></div>
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">DNI / NIE</p><p className="font-medium">{intern.dni}</p></div>
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Teléfono</p><p className="font-medium">{intern.phone || 'No indicado'}</p></div>
                        </CardContent>
                    </Card>
                    {/* Tarjeta de Datos Académicos y Prácticas (Ocupa 2 columnas) */}
                    <Card className="md:col-span-2 shadow-sm">
                        <CardHeader className="bg-muted/30 pb-3">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <GraduationCap className="h-5 w-5" /> Académicos y Prácticas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-6 pt-4">
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Centro</p><p className="font-medium">{intern.education_center?.name || 'Sin centro'}</p></div>
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Titulación</p><p className="font-medium">{intern.academic_degree}</p></div>
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Tutor Centro</p><p className="font-medium">{intern.tutor_name || 'Sin asignar'}</p></div>
                            <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Estado</p><p className="font-medium uppercase">{intern.status}</p></div>
                            <div className="col-span-2 border-t pt-4 grid grid-cols-2 gap-4">
                                <div><p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3 w-3" /> Fecha Inicio</p><p className="font-medium">{intern.start_date}</p></div>
                                <div><p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3 w-3" /> Fecha Fin</p><p className="font-medium">{intern.end_date}</p></div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Horas Totales
                                    </p>
                                    <p className="font-medium">{intern.total_hours}h</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Tarjeta de Documentación (Ocupa las 3 columnas abajo) */}
                    <Card className="md:col-span-3 shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 pb-3">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <FileText className="h-5 w-5" /> Documentación Oficial
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dni_url ? (
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-blue-50/30">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-semibold">Copia del DNI</p>
                                                <p className="text-xs text-muted-foreground">Documento subido</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={dni_url} target="_blank" download>Descargar</a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed rounded-xl bg-muted/10 text-center">
                                        <p className="text-sm text-muted-foreground italic">DNI no disponible</p>
                                    </div>
                                )}
                                {agreement_url ? (
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-green-50/30">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-green-500" />
                                            <div>
                                                <p className="text-sm font-semibold">Convenio de Prácticas</p>
                                                <p className="text-xs text-muted-foreground">Documento subido</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={agreement_url} target="_blank" download>Descargar</a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed rounded-xl bg-muted/10 text-center">
                                        <p className="text-sm text-muted-foreground italic">Convenio no disponible</p>
                                    </div>
                                )}
                                {insurance_url ? (
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-amber-50/30">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-amber-500" />
                                            <div>
                                                <p className="text-sm font-semibold">Seguro / Responsabilidad</p>
                                                <p className="text-xs text-muted-foreground">Documento subido</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={insurance_url} target="_blank" download>Descargar</a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed rounded-xl bg-muted/10 text-center">
                                        <p className="text-sm text-muted-foreground italic">Seguro no disponible</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-3 shadow-sm border-amber-100">
                        <CardHeader className="bg-amber-50/30 pb-3">
                            <CardTitle className="flex items-center gap-2 text-amber-900">
                                <Clock className="h-5 w-5" /> Historial de Cambios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {activities.length > 0 ? (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="relative pl-6 border-l-2 border-muted last:border-0 pb-6 last:pb-0">
                                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-amber-500 border-2 border-white" />
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                                                <span className="text-sm font-bold capitalize">
                                                    {activity.event === 'updated' ? 'Actualización' : activity.event === 'created' ? 'Creación' : activity.event}
                                                </span>
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                    {activity.created_at} por {activity.causer_name}
                                                </span>
                                            </div>

                                            {/* Aquí mostramos los detalles de lo que cambió si fue una actualización */}
                                            {activity.event === 'updated' && activity.properties?.old && (
                                                <div className="mt-2 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/20 p-3 rounded-lg">
                                                    {Object.keys(activity.properties.attributes).map(key => (
                                                        <div key={key} className="border-b border-muted/30 pb-1 last:border-0">
                                                            <span className="font-semibold text-muted-foreground uppercase text-[9px] block mb-1">{key}</span>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="line-through text-red-400 bg-red-50 px-1 rounded">{String(activity.properties.old[key])}</span>
                                                                <span className="text-green-600 bg-green-50 px-1 rounded font-medium">{String(activity.properties.attributes[key])}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">No hay historial disponible para este becario</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout >
    );
}