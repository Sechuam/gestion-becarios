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

            {/* Fondo general más claro como en la foto */}
            <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen pb-12 w-full">

                {/* 1. Cabecera con Botones alineados */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" asChild className="gap-2 bg-white text-slate-600 border-slate-200">
                        <Link href="/becarios"><ArrowLeft className="h-4 w-4" /> Volver</Link>
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Link href={`/interns/${intern.id}/edit`}>Editar perfil</Link>
                    </Button>
                </div>
                {/* 2. Hero Section (Avatar grande y Nombre) */}
                <div className="flex items-center gap-6 border-b border-slate-200 pb-8 pt-2">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-4xl shadow-sm">
                        {/* Coge una o dos iniciales del nombre */}
                        {intern.user?.name ? intern.user.name.substring(0, 2).toUpperCase() : 'B'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">{intern.user.name}</h1>
                        <p className="text-slate-500 font-medium">Becario · {intern.academic_degree}</p>
                    </div>
                </div>
                {/* 3. Cuadrícula principal (2 columnas como en la foto: 5-7) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* COLUMNA IZQUIERDA (Datos Personales + Documentación) */}
                    <div className="md:col-span-5 space-y-6">

                        {/* Tarjeta Datos Personales */}
                        <Card className="shadow-sm border-slate-200 rounded-xl">
                            <CardHeader className="pb-4 border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-800">Datos Personales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-0 pt-2 px-6">
                                <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                                    <span className="text-sm font-medium text-slate-500">Correo Electrónico</span>
                                    <span className="text-sm text-slate-900 font-medium">{intern.user.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                                    <span className="text-sm font-medium text-slate-500">Teléfono</span>
                                    <span className="text-sm text-slate-900 font-medium">{intern.phone || 'No indicado'}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                                    <span className="text-sm font-medium text-slate-500">DNI</span>
                                    <span className="text-sm text-slate-900 font-medium">{intern.dni}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                                    <span className="text-sm font-medium text-slate-500">Estado</span>
                                    {/* Un badge estilo etiqueta amarilla como en la foto si está pendiente, o verde si está activo */}
                                    <span className={`text-xs font-bold capitalize px-3 py-1 rounded-md ${intern.status === 'active' ? 'bg-green-100 text-green-800' :
                                        intern.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                            intern.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {intern.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Tarjeta Documentación */}
                        <Card className="shadow-sm border-slate-200 rounded-xl">
                            <CardHeader className="pb-4 border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-800">Documentación</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-0 pt-2 px-6">
                                {/* DNI */}
                                <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <FileText className={`h-5 w-5 ${dni_url ? 'text-slate-400' : 'text-slate-200'}`} />
                                        <a href={dni_url || '#'} className={`text-sm font-medium ${dni_url ? 'text-blue-600 hover:underline' : 'text-slate-400 pointer-events-none'}`} target="_blank">
                                            DNI.pdf
                                        </a>
                                    </div>
                                    {dni_url ? (
                                        <a href={dni_url} className="text-xs text-slate-400 hover:text-slate-600 transition-colors" download>Descargar</a>
                                    ) : (
                                        <span className="text-[10px] uppercase text-slate-300 font-bold border rounded px-1">Falta</span>
                                    )}
                                </div>

                                {/* Convenio (Icono simulado azul en la foto) */}
                                <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600 rounded p-1 text-white">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <a href={agreement_url || '#'} className={`text-sm font-medium ${agreement_url ? 'text-blue-600 hover:underline' : 'text-slate-400 pointer-events-none'}`} target="_blank">
                                            Convenio.pdf
                                        </a>
                                    </div>
                                    {agreement_url ? (
                                        <a href={agreement_url} className="text-xs text-slate-400 hover:text-slate-600 transition-colors" download>Descargar</a>
                                    ) : (
                                        <span className="text-[10px] uppercase text-slate-300 font-bold border rounded px-1">Falta</span>
                                    )}
                                </div>
                                {/* Seguro */}
                                <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <FileText className={`h-5 w-5 ${insurance_url ? 'text-slate-400' : 'text-slate-200'}`} />
                                        <a href={insurance_url || '#'} className={`text-sm font-medium ${insurance_url ? 'text-blue-600 hover:underline' : 'text-slate-400 pointer-events-none'}`} target="_blank">
                                            Seguro.pdf
                                        </a>
                                    </div>
                                    {insurance_url ? (
                                        <a href={insurance_url} className="text-xs text-slate-400 hover:text-slate-600 transition-colors" download>Descargar</a>
                                    ) : (
                                        <span className="text-[10px] uppercase text-slate-300 font-bold border rounded px-1">Falta</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* COLUMNA DERECHA (Académica + Historial) */}
                    <div className="md:col-span-7 space-y-6">

                        {/* Tarjeta Información Académica */}
                        <Card className="shadow-sm border-slate-200 rounded-xl">
                            <CardHeader className="pb-4 border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-800">Información Académica</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-0 pt-2 px-6">
                                <div className="grid grid-cols-3 py-4 border-b border-slate-50">
                                    <span className="col-span-1 text-sm font-medium text-slate-500">Centro Educativo</span>
                                    <span className="col-span-2 text-sm text-slate-800 font-semibold">{intern.education_center?.name || 'Sin centro'}</span>
                                </div>
                                <div className="grid grid-cols-3 py-4 border-b border-slate-50">
                                    <span className="col-span-1 text-sm font-medium text-slate-500">Grado</span>
                                    <span className="col-span-2 text-sm text-slate-600 font-medium">{intern.academic_degree}</span>
                                </div>
                                <div className="grid grid-cols-3 py-4 border-b border-slate-50">
                                    <span className="col-span-1 text-sm font-medium text-slate-500">Fechas</span>
                                    <span className="col-span-2 text-sm text-slate-600">{intern.start_date} al {intern.end_date}</span>
                                </div>
                                <div className="grid grid-cols-3 py-4 border-b border-slate-50">
                                    <span className="col-span-1 text-sm font-medium text-slate-500">Horas Totales</span>
                                    <span className="col-span-2 text-sm text-slate-600">{intern.total_hours}h</span>
                                </div>
                                <div className="grid grid-cols-3 py-4 border-b border-slate-50">
                                    <span className="col-span-1 text-sm font-medium text-slate-500">Tutor Centro</span>
                                    <span className="col-span-2 text-sm text-slate-600 block">{intern.tutor_name || 'Sin asignar'}</span>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Tarjeta Historial de Actividades (Línea del tiempo) */}
                        <Card className="shadow-sm border-slate-200 rounded-xl">
                            <CardHeader className="pb-4 border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-800">Historial de Actividades</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 px-6">
                                <div className="space-y-0">
                                    {activities.length > 0 ? (
                                        activities.map((activity, index) => (
                                            <div key={activity.id} className="relative pl-8 pb-8 last:pb-0">
                                                {/* Línea conectora gris (se oculta en el último) */}
                                                {index !== activities.length - 1 && (
                                                    <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-slate-200" />
                                                )}
                                                {/* Circulito gris claro del timeline */}
                                                <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-slate-300 bg-white" />

                                                <div className="flex flex-col sm:flex-row gap-2 sm:items-start text-sm">
                                                    {/* Fecha y Hora (negrita como en la foto) */}
                                                    <span className="font-semibold text-slate-800 w-32 shrink-0">
                                                        {activity.created_at}
                                                    </span>
                                                    {/* Descripción */}
                                                    <div className="flex-1 text-slate-500">
                                                        {activity.event === 'updated'
                                                            ? 'Perfil modificado '
                                                            : activity.event === 'created'
                                                                ? 'Perfil creado '
                                                                : activity.event + ' '}
                                                        por <span className="font-semibold text-slate-600">{activity.causer_name}</span>

                                                        {/* Caja de qué cambió exactamente */}
                                                        {activity.event === 'updated' && activity.properties?.old && (
                                                            <div className="mt-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-md border border-slate-100">
                                                                {Object.keys(activity.properties.attributes).map(key => (
                                                                    <div key={key} className="pb-1">
                                                                        <span className="font-semibold text-slate-400 uppercase text-[9px] block mb-1">{key}</span>
                                                                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                                                                            <span className="line-through text-red-500">{String(activity.properties.old[key])}</span>
                                                                            <span className="text-emerald-600 font-medium">→ {String(activity.properties.attributes[key])}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 italic py-4">No hay historial disponible.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
