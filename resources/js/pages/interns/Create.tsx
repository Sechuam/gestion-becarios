import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Becarios', href: '/becarios' },
    { title: 'Nuevo Becario', href: '/interns/create' },
];
export default function Create({ education_centers }: { education_centers: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', email: '', education_center_id: '', dni: '', birth_date: '',
        phone: '', address: '', city: '', academic_degree: '', academic_year: '2024-2025',
        start_date: '', end_date: '', tutor_name: '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/interns');
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Becario" />
            <div className="p-4 max-w-4xl mx-auto">
                <form onSubmit={submit} className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                            <TabsTrigger value="academic">Académicos</TabsTrigger>
                            <TabsTrigger value="internship">Prácticas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal" className="space-y-4 pt-4 border rounded-md p-4 bg-white shadow-sm mt-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <Input id="address" value={data.address} onChange={e => setData('address', e.target.value)} />
                                    {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad</Label>
                                    <Input id="city" value={data.city} onChange={e => setData('city', e.target.value)} />
                                    {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="academic" className="space-y-4 pt-4 border rounded-md p-4 bg-white shadow-sm mt-4">
                            <div className="space-y-2">
                                <Label>Centro Educativo</Label>
                                <Select onValueChange={(val) => setData('education_center_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un centro" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {education_centers.map(center => (
                                            <SelectItem key={center.id} value={center.id.toString()}>{center.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.education_center_id && <p className="text-red-500 text-xs">{errors.education_center_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                        <TabsContent value="internship" className="space-y-4 pt-4 border rounded-md p-4 bg-white shadow-sm mt-4">
                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tutor">Tutor Académico (Centro)</Label>
                                <Input id="tutor" value={data.tutor_name} onChange={e => setData('tutor_name', e.target.value)} />
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" asChild><Link href="/becarios">Cancelar</Link></Button>
                        <Button type="submit" disabled={processing}>Guardar Becario</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}