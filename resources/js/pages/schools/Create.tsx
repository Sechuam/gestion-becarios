
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types/navigation';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/schools' },
    { title: 'Añadir Centro', href: '/schools/create' },
];
export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        address: '',
        city: '',
        contact_person: '',
        contact_position: '',
        email: '',
        phone: '',
        web: '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/schools');
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Añadir Centro Educativo" />

<div className="p-6 w-full max-w-2xl mx-auto">
    <div className="mb-6">
        <h1 className="text-2xl font-bold">Nuevo Centro Educativo</h1>
        <p className="text-sm text-muted-foreground">
            Completa los datos para dar de alta una nueva institución.
        </p>
    </div>

    <form onSubmit={submit} className="space-y-6 border rounded-xl bg-white shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre del Centro</Label>
                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="code">Código/Identificador</Label>
                <Input id="code" value={data.code} onChange={e => setData('code', e.target.value)} required />
                {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={data.address} onChange={e => setData('address', e.target.value)} required />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" value={data.city} onChange={e => setData('city', e.target.value)} required />
                {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="contact_person">Persona de Contacto</Label>
                <Input id="contact_person" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} required />
                {errors.contact_person && <p className="text-red-500 text-xs">{errors.contact_person}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="contact_position">Cargo (Opcional)</Label>
                <Input id="contact_position" value={data.contact_position} onChange={e => setData('contact_position', e.target.value)} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="email">Email Institucional</Label>
                <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="web">Sitio Web (Opcional)</Label>
            <Input id="web" type="url" placeholder="https://..." value={data.web} onChange={e => setData('web', e.target.value)} />
            {errors.web && <p className="text-red-500 text-xs">{errors.web}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
                Guardar Centro
            </Button>
        </div>
    </form>
</div>
        </AppLayout>
    );
}