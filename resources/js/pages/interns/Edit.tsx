import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { FileText, ArrowLeft } from 'lucide-react';
export default function Edit({ intern, education_centers }: { intern: any; education_centers: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Becarios', href: '/becarios' },
        { title: `Editar: ${intern.user.name}`, href: '#' },
    ];
    const { data, setData, put, processing, errors } = useForm({
        name: intern.user.name,
        email: intern.user.email,
        education_center_id: intern.education_center_id.toString(),
        dni: intern.dni,
        birth_date: intern.birth_date,
        phone: intern.phone,
        address: intern.address,
        city: intern.city,
        academic_degree: intern.academic_degree,
        academic_year: intern.academic_year,
        start_date: intern.start_date,
        end_date: intern.end_date,
        tutor_name: intern.tutor_name,
        total_hours: intern.total_hours || '',
        dni_file: null as File | null,
        agreement_file: null as File | null,
        insurance_file: null as File | null,
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/interns/${intern.id}`, {
            _method: 'put',
            ...data,
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Becario - ${intern.user.name}`} />

            <div className="p-6 min-h-screen w-full">

                {/* Cabecera Premium */}
                <div className="flex items-center gap-5 border-b border-slate-200 pb-6 mb-8">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-2xl shadow-sm">
                        {intern.user?.name ? intern.user.name.substring(0, 2).toUpperCase() : 'B'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Editar Perfil: {intern.user.name}</h1>
                        <p className="text-slate-500 mt-1">Actualiza los datos, documentos y prácticas del becario.</p>
                    </div>
                </div>
                <form onSubmit={submit} className="space-y-8">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-14 bg-slate-100/80 p-1.5 rounded-xl">
                            <TabsTrigger value="personal" className="rounded-lg text-sm font-medium data-[state=active]:shadow-sm data-[state=active]:bg-white">Datos Personales</TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-lg text-sm font-medium data-[state=active]:shadow-sm data-[state=active]:bg-white">Académicos</TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-lg text-sm font-medium data-[state=active]:shadow-sm data-[state=active]:bg-white">Documentos</TabsTrigger>
                            <TabsTrigger value="internship" className="rounded-lg text-sm font-medium data-[state=active]:shadow-sm data-[state=active]:bg-white">Prácticas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal" className="space-y-8 pt-10 border border-slate-100 rounded-2xl p-8 bg-white shadow-sm mt-6 min-h-[580px]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-slate-600 font-semibold">Nombre Completo</Label>
                                    <Input id="name" className="h-12 shadow-sm" value={data.name} onChange={e => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-slate-600 font-semibold">Email</Label>
                                    <Input id="email" type="email" className="h-12 shadow-sm" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="dni" className="text-slate-600 font-semibold">DNI / NIE</Label>
                                    <Input id="dni" className="h-12 shadow-sm" value={data.dni} onChange={e => setData('dni', e.target.value)} />
                                    {errors.dni && <p className="text-red-500 text-xs">{errors.dni}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="birth" className="text-slate-600 font-semibold">Fecha Nacimiento</Label>
                                    <Input id="birth" type="date" className="h-12 shadow-sm" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                                    {errors.birth_date && <p className="text-red-500 text-xs">{errors.birth_date}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-slate-600 font-semibold">Teléfono</Label>
                                    <Input id="phone" className="h-12 shadow-sm" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="city" className="text-slate-600 font-semibold">Ciudad</Label>
                                    <Input id="city" className="h-12 shadow-sm" value={data.city} onChange={e => setData('city', e.target.value)} />
                                    {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                                </div>
                                <div className="space-y-3 md:col-span-3 pt-4">
                                    <Label htmlFor="address" className="text-slate-600 font-semibold">Dirección</Label>
                                    <Input id="address" className="h-12 shadow-sm max-w-2xl" value={data.address} onChange={e => setData('address', e.target.value)} />
                                    {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                                </div>
                            </div>
                        </TabsContent>
                        {/* PESTAÑA ACADÉMICA */}
                        <TabsContent value="academic" className="space-y-8 pt-10 border border-slate-100 rounded-2xl p-8 bg-white shadow-sm mt-6 min-h-[580px]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-slate-600 font-semibold">Centro Educativo</Label>
                                    <Select defaultValue={data.education_center_id} onValueChange={(val) => setData('education_center_id', val)}>
                                        <SelectTrigger className="h-12 shadow-sm bg-white"><SelectValue placeholder="Centro" /></SelectTrigger>
                                        <SelectContent>
                                            {education_centers.map(center => (
                                                <SelectItem key={center.id} value={center.id.toString()}>{center.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.education_center_id && <p className="text-red-500 text-xs">{errors.education_center_id}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="degree" className="text-slate-600 font-semibold">Grado / Titulación</Label>
                                    <Input id="degree" className="h-12 shadow-sm" value={data.academic_degree} onChange={e => setData('academic_degree', e.target.value)} />
                                    {errors.academic_degree && <p className="text-red-500 text-xs">{errors.academic_degree}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="year" className="text-slate-600 font-semibold">Curso</Label>
                                    <Input id="year" className="h-12 shadow-sm" value={data.academic_year} onChange={e => setData('academic_year', e.target.value)} />
                                    {errors.academic_year && <p className="text-red-500 text-xs">{errors.academic_year}</p>}
                                </div>
                            </div>
                        </TabsContent>
                        {/* PESTAÑA DOCUMENTOS (FORMATO LISTA) */}
                        <TabsContent value="documents" className="pt-10 border border-slate-100 rounded-2xl p-8 bg-white shadow-sm mt-6 min-h-[580px]">
                            <div className="space-y-4 w-full">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Documentación del becario</h3>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 text-blue-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="dni_file" className="text-sm font-bold text-slate-700 cursor-pointer">Copia del DNI</Label>
                                            <p className="text-xs text-slate-400">PDF o Imagen (Máx. 5MB)</p>
                                        </div>
                                    </div>
                                    <Input
                                        id="dni_file"
                                        type="file"
                                        className="max-w-[250px] file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs hover:file:bg-blue-700 cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                                        onChange={e => setData('dni_file', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 text-blue-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="agreement_file" className="text-sm font-bold text-slate-700 cursor-pointer">Convenio de Prácticas</Label>
                                            <p className="text-xs text-slate-400">Documento PDF firmado</p>
                                        </div>
                                    </div>
                                    <Input
                                        id="agreement_file"
                                        type="file"
                                        className="max-w-[250px] file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs hover:file:bg-blue-700 cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                                        onChange={e => setData('agreement_file', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 text-amber-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="insurance_file" className="text-sm font-bold text-slate-700 cursor-pointer">Seguro Escolar</Label>
                                            <p className="text-xs text-slate-400">Póliza de responsabilidad</p>
                                        </div>
                                    </div>
                                    <Input
                                        id="insurance_file"
                                        type="file"
                                        className="max-w-[250px] file:bg-amber-600 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs hover:file:bg-amber-700 cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                                        onChange={e => setData('insurance_file', e.target.files?.[0] || null)}
                                    />
                                </div>
                                {(errors.dni_file || errors.agreement_file || errors.insurance_file) && (
                                    <p className="text-xs text-red-500 mt-4 italic bg-red-50 p-2 rounded-md border border-red-100 font-medium">
                                        Por favor, revisa los archivos seleccionados.
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                        {/* PESTAÑA PRÁCTICAS */}
                        <TabsContent value="internship" className="space-y-8 pt-10 border border-slate-100 rounded-2xl p-8 bg-white shadow-sm mt-6 min-h-[580px]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="start" className="text-slate-600 font-semibold">Fecha Inicio</Label>
                                    <Input id="start" type="date" className="h-12 shadow-sm" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                    {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="end" className="text-slate-600 font-semibold">Fecha Fin</Label>
                                    <Input id="end" type="date" className="h-12 shadow-sm" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                    {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="tutor" className="text-slate-600 font-semibold">Tutor Académico (Centro)</Label>
                                    <Input id="tutor" className="h-12 shadow-sm" value={data.tutor_name} onChange={e => setData('tutor_name', e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="total_hours" className="text-slate-600 font-semibold">Horas Totales Requeridas</Label>
                                    <div className="relative">
                                        <Input id="total_hours" type="number" className="h-12 shadow-sm pr-8" value={data.total_hours} onChange={e => setData('total_hours', e.target.value)} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium font-mono text-sm">h</span>
                                    </div>
                                    {errors.total_hours && <p className="text-red-500 text-xs">{errors.total_hours}</p>}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-4 border-t border-slate-200 pt-8 mt-4">
                        <Button variant="outline" className="h-12 px-8 text-slate-600 border-slate-200 hover:bg-slate-50 rounded-xl" asChild>
                            <Link href={`/interns/${intern.id}`}>Cancelar</Link>
                        </Button>
                        <Button type="submit" className="h-12 px-10 bg-blue-600 hover:bg-blue-700 shadow-md rounded-xl font-bold" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}