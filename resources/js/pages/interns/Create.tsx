import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Becarios', href: '/becarios' },
    { title: 'Nuevo Becario', href: '/interns/create' },
];
export default function Create({ education_centers }: { education_centers: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', email: '', education_center_id: '', dni: '', birth_date: '',
        phone: '', address: '', city: '', academic_degree: '', academic_year: '2024-2025',
        start_date: '', end_date: '', tutor_name: '', total_hours: '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/interns');
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Becario" />

<div className="p-6 w-full max-w-4xl mx-auto bg-white dark:bg-slate-900">
    <form onSubmit={submit} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto sm:h-12 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                <TabsTrigger value="personal" className="rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">
                    Datos Personales
                </TabsTrigger>
                <TabsTrigger value="academic" className="rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">
                    Académicos
                </TabsTrigger>
                <TabsTrigger value="internship" className="rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">
                    Prácticas
                </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 pt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Nombre Completo</Label>
                        <Input id="name" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.name} onChange={e => setData('name', e.target.value)} />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email</Label>
                        <Input id="email" type="email" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.email} onChange={e => setData('email', e.target.value)} />
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
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-slate-700 dark:text-slate-200">Dirección</Label>
                        <Input id="address" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.address} onChange={e => setData('address', e.target.value)} />
                        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-700 dark:text-slate-200">Ciudad</Label>
                        <Input id="city" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.city} onChange={e => setData('city', e.target.value)} />
                        {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6 pt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-200">Centro Educativo</Label>
                        <Select onValueChange={(val) => setData('education_center_id', val)}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                <SelectValue placeholder="Selecciona un centro" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                {education_centers.map(center => (
                                    <SelectItem key={center.id} value={center.id.toString()}>{center.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.education_center_id && <p className="text-red-500 text-xs">{errors.education_center_id}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
            </TabsContent>

            <TabsContent value="internship" className="space-y-6 pt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="tutor" className="text-slate-700 dark:text-slate-200">Tutor Académico (Centro)</Label>
                        <Input id="tutor" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.tutor_name} onChange={e => setData('tutor_name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
    <Label htmlFor="total_hours" className="text-slate-700 dark:text-slate-200">Horas Totales Requeridas</Label>
    <div className="relative">
        <Input
            id="total_hours"
            type="number"
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pr-8"
            value={data.total_hours}
            onChange={e => setData('total_hours', e.target.value)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium font-mono text-sm">h</span>
    </div>
    {errors.total_hours && <p className="text-red-500 text-xs">{errors.total_hours}</p>}
</div>
                </div>
            </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" asChild>
                <Link href="/becarios">Cancelar</Link>
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white" disabled={processing}>
                Guardar Becario
            </Button>
        </div>
    </form>
</div>
        </AppLayout>
    );
}