import { Head, useForm, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

export default function Edit({ intern, education_centers, tutors }: { intern: any; education_centers: any[]; tutors: any[] }) {
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
        status: intern.status,
        abandon_reason: intern.abandon_reason || '',
        total_hours: intern.total_hours || '',
        dni_file: null as File | null,
        agreement_file: null as File | null,
        insurance_file: null as File | null,

        center_tutor_name: intern.center_tutor_name || '',
        center_tutor_email: intern.center_tutor_email || '',
        center_tutor_phone: intern.center_tutor_phone || '',
        company_tutor_user_id: intern.company_tutor_user_id ? String(intern.company_tutor_user_id) : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/interns/${intern.id}`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Becario - ${intern.user.name}`} />

            <div className="p-6 w-full bg-background text-foreground">
                {/* CABECERA */}
                <div className="flex items-center gap-4 border-b border-border pb-4 mb-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-lg">
                        {intern.user?.name ? intern.user.name.substring(0, 2).toUpperCase() : 'B'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Editar perfil</h1>
                        <p className="text-sm text-muted-foreground">
                            Actualiza los datos, documentos y prácticas del becario.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-12 bg-muted dark:bg-slate-800/70 border border-border dark:border-slate-700/70 p-1 rounded-xl gap-1">
                            <TabsTrigger className="rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground" value="personal">
                                Datos Personales
                            </TabsTrigger>
                            <TabsTrigger className="rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground" value="academic">
                                Académicos
                            </TabsTrigger>
                            <TabsTrigger className="rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground" value="documents">
                                Documentos
                            </TabsTrigger>
                            <TabsTrigger className="rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground" value="internship">
                                Prácticas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="space-y-6 pt-6 border border-border dark:border-slate-700/70 rounded-xl p-6 bg-card dark:bg-slate-900/60 shadow-sm mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-foreground">Nombre Completo</Label>
                                    <Input id="name" className="bg-background border-border text-foreground placeholder:text-muted-foreground" value={data.name} onChange={e => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-foreground">Email</Label>
                                    <Input id="email" type="email" className="bg-background border-border text-foreground placeholder:text-muted-foreground" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dni" className="text-foreground">DNI / NIE</Label>
                                    <Input id="dni" className="bg-background border-border text-foreground" value={data.dni} onChange={e => setData('dni', e.target.value)} />
                                    {errors.dni && <p className="text-red-500 text-xs">{errors.dni}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birth" className="text-foreground">Fecha Nacimiento</Label>
                                    <Input id="birth" type="date" className="bg-background border-border text-foreground" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                                    {errors.birth_date && <p className="text-red-500 text-xs">{errors.birth_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-foreground">Teléfono</Label>
                                    <Input id="phone" className="bg-background border-border text-foreground" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-foreground">Ciudad</Label>
                                    <Input id="city" className="bg-background border-border text-foreground" value={data.city} onChange={e => setData('city', e.target.value)} />
                                    {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="address" className="text-foreground">Dirección</Label>
                                    <Input id="address" className="bg-background border-border text-foreground" value={data.address} onChange={e => setData('address', e.target.value)} />
                                    {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="academic" className="space-y-6 pt-6 border border-border dark:border-slate-700/70 rounded-xl p-6 bg-card dark:bg-slate-900/60 shadow-sm mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Centro Educativo</Label>
                                    <Select defaultValue={data.education_center_id} onValueChange={(val) => setData('education_center_id', val)}>
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder="Centro" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {education_centers.map(center => (
                                                <SelectItem key={center.id} value={center.id.toString()}>{center.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.education_center_id && <p className="text-red-500 text-xs">{errors.education_center_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="degree" className="text-foreground">Grado / Titulación</Label>
                                    <Input id="degree" className="bg-background border-border text-foreground" value={data.academic_degree} onChange={e => setData('academic_degree', e.target.value)} />
                                    {errors.academic_degree && <p className="text-red-500 text-xs">{errors.academic_degree}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year" className="text-foreground">Curso</Label>
                                    <Input id="year" className="bg-background border-border text-foreground" value={data.academic_year} onChange={e => setData('academic_year', e.target.value)} />
                                    {errors.academic_year && <p className="text-red-500 text-xs">{errors.academic_year}</p>}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="pt-6 border border-border dark:border-slate-700/70 rounded-xl p-6 bg-card dark:bg-slate-900/60 shadow-sm mt-4">
                            <div className="space-y-4 w-full">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documentación del becario</h3>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border bg-muted/40">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-card p-2 rounded-lg border border-border text-muted-foreground">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="dni_file" className="text-sm font-semibold text-foreground cursor-pointer">Copia del DNI</Label>
                                            <p className="text-xs text-muted-foreground">PDF o Imagen (Máx. 5MB)</p>
                                        </div>
                                    </div>
                                    <Input
                                        id="dni_file"
                                        type="file"
                                        className="w-full sm:max-w-62.5 file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                                        onChange={e => setData('dni_file', e.target.files?.[0] || null)}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border bg-muted/40">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-card p-2 rounded-lg border border-border text-muted-foreground">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="agreement_file" className="text-sm font-semibold text-foreground cursor-pointer">Convenio de Prácticas</Label>
                                            <p className="text-xs text-muted-foreground">Documento PDF firmado</p>
                                        </div>
                                    </div>
                                    <Input
                                        id="agreement_file"
                                        type="file"
                                        className="w-full sm:max-w-62.5 file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
                                        onChange={e => setData('agreement_file', e.target.files?.[0] || null)}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border bg-muted/40">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-card p-2 rounded-lg border border-border text-muted-foreground">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="insurance_file" className="text-sm font-semibold text-foreground cursor-pointer">Seguro Escolar</Label>
                                            <p className="text-xs text-muted-foreground">Póliza de responsabilidad</p>
                                        </div>
                                    </div>
                                    <Input
                                        id="insurance_file"
                                        type="file"
                                        className="w-full sm:max-w-62.5 file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 file:text-xs cursor-pointer bg-transparent border-0 shadow-none h-auto p-0"
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

                        <TabsContent value="internship" className="space-y-6 pt-6 border border-border dark:border-slate-700/70 rounded-xl p-6 bg-card dark:bg-slate-900/60 shadow-sm mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="start" className="text-foreground">Fecha Inicio</Label>
                                    <Input id="start" type="date" className="bg-background border-border text-foreground" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                    {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end" className="text-foreground">Fecha Fin</Label>
                                    <Input id="end" type="date" className="bg-background border-border text-foreground" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                    {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="center_tutor_name" className="text-foreground">Tutor del Centro (Nombre)</Label>
                                    <Input id="center_tutor_name" className="bg-background border-border text-foreground" value={data.center_tutor_name} onChange={e => setData('center_tutor_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="center_tutor_email" className="text-foreground">Tutor del Centro (Email)</Label>
                                    <Input id="center_tutor_email" type="email" className="bg-background border-border text-foreground" value={data.center_tutor_email} onChange={e => setData('center_tutor_email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="center_tutor_phone" className="text-foreground">Tutor del Centro (Teléfono)</Label>
                                    <Input id="center_tutor_phone" className="bg-background border-border text-foreground" value={data.center_tutor_phone} onChange={e => setData('center_tutor_phone', e.target.value)} />
                                </div>

                                <div className="space-y-2 md:col-span-3">
                                    <Label className="text-foreground">Tutor de Empresa</Label>
                                    <Select value={data.company_tutor_user_id} onValueChange={(val) => setData('company_tutor_user_id', val)}>
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder="Selecciona un tutor de empresa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tutors.map((t: any) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name} ({t.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total_hours" className="text-foreground">Horas Totales Requeridas</Label>
                                    <div className="relative">
                                        <Input id="total_hours" type="number" className="bg-background border-border text-foreground pr-8" value={data.total_hours} onChange={e => setData('total_hours', e.target.value)} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium font-mono text-sm">h</span>
                                    </div>
                                    {errors.total_hours && <p className="text-red-500 text-xs">{errors.total_hours}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-3">
                                    <Label className="text-foreground">Estado</Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder="Selecciona un estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Activo</SelectItem>
                                            <SelectItem value="completed">Finalizado</SelectItem>
                                            <SelectItem value="abandoned">Abandonado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}
                                </div>
                                {data.status === 'abandoned' && (
                                    <div className="space-y-2 md:col-span-3">
                                        <Label htmlFor="abandon_reason" className="text-foreground">Motivo de abandono</Label>
                                        <Input
                                            id="abandon_reason"
                                            className="bg-background border-border text-foreground"
                                            value={data.abandon_reason}
                                            onChange={(e) => setData('abandon_reason', e.target.value)}
                                        />
                                        {errors.abandon_reason && <p className="text-red-500 text-xs">{errors.abandon_reason}</p>}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-3 border-t border-border pt-6 mt-4">
                        <Button variant="outline" className="border-border text-foreground hover:bg-muted" asChild>
                            <Link href={`/interns/${intern.id}`}>Cancelar</Link>
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}