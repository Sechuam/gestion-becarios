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

<div className="p-6 w-full bg-white dark:bg-slate-900">
    {/* CABECERA */}
    <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-lg">
            {intern.user?.name ? intern.user.name.substring(0, 2).toUpperCase() : 'B'}
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Editar perfil</h1>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
                Actualiza los datos, documentos y prácticas del becario.
            </p>
        </div>
    </div>

    <form onSubmit={submit} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-12 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                <TabsTrigger className="rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white" value="personal">
                    Datos Personales
                </TabsTrigger>
                <TabsTrigger className="rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white" value="academic">
                    Académicos
                </TabsTrigger>
                <TabsTrigger className="rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white" value="documents">
                    Documentos
                </TabsTrigger>
                <TabsTrigger className="rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white" value="internship">
                    Prácticas
                </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 pt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Nombre Completo</Label>
                        <Input id="name" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" value={data.name} onChange={e => setData('name', e.target.value)} />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email</Label>
                        <Input id="email" type="email" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" value={data.email} onChange={e => setData('email', e.target.value)} />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dni" className="text-slate-700 dark:text-slate-200">DNI / NIE</Label>
                        <Input id="dni" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.dni} onChange={e => setData('dni', e.target.value)} />
                        {errors.dni && <p className="text-red-500 text-xs">{errors.dni}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birth" className="text-slate-700 dark:text-slate-200">Fecha Nacimiento</Label>
                        <Input id="birth" type="date" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                        {errors.birth_date && <p className="text-red-500 text-xs">{errors.birth_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">Teléfono</Label>
                        <Input id="phone" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-700 dark:text-slate-200">Ciudad</Label>
                        <Input id="city" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.city} onChange={e => setData('city', e.target.value)} />
                        {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="address" className="text-slate-700 dark:text-slate-200">Dirección</Label>
                        <Input id="address" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.address} onChange={e => setData('address', e.target.value)} />
                        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6 pt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-200">Centro Educativo</Label>
                        <Select defaultValue={data.education_center_id} onValueChange={(val) => setData('education_center_id', val)}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                <SelectValue placeholder="Centro" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                {education_centers.map(center => (
                                    <SelectItem key={center.id} value={center.id.toString()}>{center.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.education_center_id && <p className="text-red-500 text-xs">{errors.education_center_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="degree" className="text-slate-700 dark:text-slate-200">Grado / Titulación</Label>
                        <Input id="degree" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.academic_degree} onChange={e => setData('academic_degree', e.target.value)} />
                        {errors.academic_degree && <p className="text-red-500 text-xs">{errors.academic_degree}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year" className="text-slate-700 dark:text-slate-200">Curso</Label>
                        <Input id="year" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.academic_year} onChange={e => setData('academic_year', e.target.value)} />
                        {errors.academic_year && <p className="text-red-500 text-xs">{errors.academic_year}</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="documents" className="pt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-4">
                <div className="space-y-4 w-full">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documentación del becario</h3>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center gap-4">
                            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <Label htmlFor="dni_file" className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">Copia del DNI</Label>
                                <p className="text-xs text-slate-400 dark:text-slate-500">PDF o Imagen (Máx. 5MB)</p>
                            </div>
                        </div>
                        <Input
                            id="dni_file"
                            type="file"
                            className="w-full sm:max-w-[250px] file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                            onChange={e => setData('dni_file', e.target.files?.[0] || null)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center gap-4">
                            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <Label htmlFor="agreement_file" className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">Convenio de Prácticas</Label>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Documento PDF firmado</p>
                            </div>
                        </div>
                        <Input
                            id="agreement_file"
                            type="file"
                            className="w-full sm:max-w-[250px] file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                            onChange={e => setData('agreement_file', e.target.files?.[0] || null)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center gap-4">
                            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <Label htmlFor="insurance_file" className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">Seguro Escolar</Label>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Póliza de responsabilidad</p>
                            </div>
                        </div>
                        <Input
                            id="insurance_file"
                            type="file"
                            className="w-full sm:max-w-[250px] file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
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

            <TabsContent value="internship" className="space-y-6 pt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="start" className="text-slate-700 dark:text-slate-200">Fecha Inicio</Label>
                        <Input id="start" type="date" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                        {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end" className="text-slate-700 dark:text-slate-200">Fecha Fin</Label>
                        <Input id="end" type="date" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                        {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tutor" className="text-slate-700 dark:text-slate-200">Tutor Académico (Centro)</Label>
                        <Input id="tutor" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.tutor_name} onChange={e => setData('tutor_name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="total_hours" className="text-slate-700 dark:text-slate-200">Horas Totales Requeridas</Label>
                        <div className="relative">
                            <Input id="total_hours" type="number" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pr-8" value={data.total_hours} onChange={e => setData('total_hours', e.target.value)} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium font-mono text-sm">h</span>
                        </div>
                        {errors.total_hours && <p className="text-red-500 text-xs">{errors.total_hours}</p>}
                    </div>
                </div>
            </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
            <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" asChild>
                <Link href={`/interns/${intern.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white" disabled={processing}>
                Guardar Cambios
            </Button>
        </div>
    </form>
</div>
        </AppLayout>
    );
}