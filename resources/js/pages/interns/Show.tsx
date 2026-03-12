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

            <div className="p-6 space-y-6 w-full bg-white dark:bg-slate-900">
                {/* CABECERA */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        asChild
                    >
                        <Link href="/becarios">
                            <ArrowLeft className="h-4 w-4" /> Volver
                        </Link>
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white" asChild>
                        <Link href={`/interns/${intern.id}/edit`}>Editar perfil</Link>
                    </Button>
                </div>

                {/* HERO */}
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-lg">
                        {intern.user?.name ? intern.user.name.substring(0, 2).toUpperCase() : 'B'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{intern.user.name}</h1>
                        <p className="text-sm text-muted-foreground dark:text-slate-400">
                            Becario · {intern.academic_degree}
                        </p>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* COLUMNA IZQ */}
                    <div className="md:col-span-5 space-y-6">
                        <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Datos Personales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 px-6">
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Correo Electrónico</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{intern.user.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Teléfono</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{intern.phone || 'No indicado'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">DNI</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{intern.dni}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Estado</span>
                                    <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                        {intern.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Documentación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 px-6 space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <a href={dni_url || '#'} className={`text-sm ${dni_url ? 'text-slate-700 dark:text-slate-200 hover:underline' : 'text-slate-400 pointer-events-none'}`} target="_blank">
                                            DNI.pdf
                                        </a>
                                    </div>
                                    {dni_url ? (
                                        <a href={dni_url} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" download>Descargar</a>
                                    ) : (
                                        <span className="text-[10px] uppercase text-slate-300 font-bold border rounded px-1">Falta</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <a href={agreement_url || '#'} className={`text-sm ${agreement_url ? 'text-slate-700 dark:text-slate-200 hover:underline' : 'text-slate-400 pointer-events-none'}`} target="_blank">
                                            Convenio.pdf
                                        </a>
                                    </div>
                                    {agreement_url ? (
                                        <a href={agreement_url} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" download>Descargar</a>
                                    ) : (
                                        <span className="text-[10px] uppercase text-slate-300 font-bold border rounded px-1">Falta</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <a href={insurance_url || '#'} className={`text-sm ${insurance_url ? 'text-slate-700 dark:text-slate-200 hover:underline' : 'text-slate-400 pointer-events-none'}`} target="_blank">
                                            Seguro.pdf
                                        </a>
                                    </div>
                                    {insurance_url ? (
                                        <a href={insurance_url} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" download>Descargar</a>
                                    ) : (
                                        <span className="text-[10px] uppercase text-slate-300 font-bold border rounded px-1">Falta</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUMNA DER */}
                    <div className="md:col-span-7 space-y-6">
                        <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Información Académica
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 px-6">
                                <div className="grid grid-cols-3 py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">Centro</span>
                                    <span className="col-span-2 text-sm text-slate-700 dark:text-slate-200 font-medium">{intern.education_center?.name || 'Sin centro'}</span>
                                </div>
                                <div className="grid grid-cols-3 py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">Grado</span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">{intern.academic_degree}</span>
                                </div>
                                <div className="grid grid-cols-3 py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">Fechas</span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">{intern.start_date} al {intern.end_date}</span>
                                </div>
                                <div className="grid grid-cols-3 py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">Horas</span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">{intern.total_hours}h</span>
                                </div>
                                <div className="grid grid-cols-3 py-3">
                                    <span className="col-span-1 text-xs text-slate-500 dark:text-slate-400">Tutor Centro</span>
                                    <span className="col-span-2 text-sm text-slate-600 dark:text-slate-300">{intern.tutor_name || 'Sin asignar'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Historial de Actividades
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 px-6">
                                {activities.length > 0 ? (
                                    <div className="space-y-4">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="flex gap-4 text-sm">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 w-28 shrink-0">
                                                    {activity.created_at}
                                                </span>
                                                <div className="text-slate-600 dark:text-slate-300">
                                                    {activity.event === 'updated'
                                                        ? 'Perfil modificado '
                                                        : activity.event === 'created'
                                                            ? 'Perfil creado '
                                                            : activity.event + ' '}
                                                    por <span className="font-medium text-slate-700 dark:text-slate-200">{activity.causer_name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No hay historial disponible.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}