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

<div className="p-6 w-full">
    {/* CABECERA */}
    <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-lg">
            {intern.user?.name ? intern.user.name.substring(0, 2).toUpperCase() : 'B'}
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Editar perfil</h1>
            <p className="text-sm text-muted-foreground">Actualiza los datos, documentos y prácticas del becario.</p>
        </div>
    </div>

    <form onSubmit={submit} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-12 bg-slate-100 p-1 rounded-xl gap-1">
                <TabsTrigger value="personal" className="rounded-lg text-sm font-medium data-[state=active]:bg-white">
                    Datos Personales
                </TabsTrigger>
                <TabsTrigger value="academic" className="rounded-lg text-sm font-medium data-[state=active]:bg-white">
                    Académicos
                </TabsTrigger>
                <TabsTrigger value="documents" className="rounded-lg text-sm font-medium data-[state=active]:bg-white">
                    Documentos
                </TabsTrigger>
                <TabsTrigger value="internship" className="rounded-lg text-sm font-medium data-[state=active]:bg-white">
                    Prácticas
                </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 pt-6 border border-slate-200 rounded-xl p-6 bg-white shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dni">DNI / NIE</Label>
                        <Input id="dni" value={data.dni} onChange={e => setData('dni', e.target.value)} />
                        {errors.dni && <p className="text-red-500 text-xs">{errors.dni}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birth">Fecha Nacimiento</Label>
                        <Input id="birth" type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                        {errors.birth_date && <p className="text-red-500 text-xs">{errors.birth_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input id="city" value={data.city} onChange={e => setData('city', e.target.value)} />
                        {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" value={data.address} onChange={e => setData('address', e.target.value)} />
                        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6 pt-6 border border-slate-200 rounded-xl p-6 bg-white shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Centro Educativo</Label>
                        <Select defaultValue={data.education_center_id} onValueChange={(val) => setData('education_center_id', val)}>
                            <SelectTrigger><SelectValue placeholder="Centro" /></SelectTrigger>
                            <SelectContent>
                                {education_centers.map(center => (
                                    <SelectItem key={center.id} value={center.id.toString()}>{center.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.education_center_id && <p className="text-red-500 text-xs">{errors.education_center_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="degree">Grado / Titulación</Label>
                        <Input id="degree" value={data.academic_degree} onChange={e => setData('academic_degree', e.target.value)} />
                        {errors.academic_degree && <p className="text-red-500 text-xs">{errors.academic_degree}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year">Curso</Label>
                        <Input id="year" value={data.academic_year} onChange={e => setData('academic_year', e.target.value)} />
                        {errors.academic_year && <p className="text-red-500 text-xs">{errors.academic_year}</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="documents" className="pt-6 border border-slate-200 rounded-xl p-6 bg-white shadow-sm mt-4">
                <div className="space-y-4 w-full">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Documentación del becario</h3>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <Label htmlFor="dni_file" className="text-sm font-semibold text-slate-700 cursor-pointer">Copia del DNI</Label>
                                <p className="text-xs text-slate-400">PDF o Imagen (Máx. 5MB)</p>
                            </div>
                        </div>
                        <Input
                            id="dni_file"
                            type="file"
                            className="w-full sm:max-w-[250px] file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                            onChange={e => setData('dni_file', e.target.files?.[0] || null)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <Label htmlFor="agreement_file" className="text-sm font-semibold text-slate-700 cursor-pointer">Convenio de Prácticas</Label>
                                <p className="text-xs text-slate-400">Documento PDF firmado</p>
                            </div>
                        </div>
                        <Input
                            id="agreement_file"
                            type="file"
                            className="w-full sm:max-w-[250px] file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                            onChange={e => setData('agreement_file', e.target.files?.[0] || null)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <Label htmlFor="insurance_file" className="text-sm font-semibold text-slate-700 cursor-pointer">Seguro Escolar</Label>
                                <p className="text-xs text-slate-400">Póliza de responsabilidad</p>
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

            <TabsContent value="internship" className="space-y-6 pt-6 border border-slate-200 rounded-xl p-6 bg-white shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="start">Fecha Inicio</Label>
                        <Input id="start" type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                        {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end">Fecha Fin</Label>
                        <Input id="end" type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                        {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tutor">Tutor Académico (Centro)</Label>
                        <Input id="tutor" value={data.tutor_name} onChange={e => setData('tutor_name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="total_hours">Horas Totales Requeridas</Label>
                        <div className="relative">
                            <Input id="total_hours" type="number" className="pr-8" value={data.total_hours} onChange={e => setData('total_hours', e.target.value)} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium font-mono text-sm">h</span>
                        </div>
                        {errors.total_hours && <p className="text-red-500 text-xs">{errors.total_hours}</p>}
                    </div>
                </div>
            </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 mt-4">
            <Button variant="outline" className="px-6" asChild>
                <Link href={`/interns/${intern.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" className="px-6" disabled={processing}>
                Guardar Cambios
            </Button>
        </div>
    </form>
</div>
        </AppLayout>
    );
}