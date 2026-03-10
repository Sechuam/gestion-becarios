import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types/navigation';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/schools' },
    { title: 'Editar Centro', href: '#' },
];
export default function Edit({ educationCenter }: { educationCenter: any }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: educationCenter.name || '',
        code: educationCenter.code || '',
        address: educationCenter.address || '',
        city: educationCenter.city || '',
        contact_person: educationCenter.contact_person || '',
        contact_position: educationCenter.contact_position || '',
        email: educationCenter.email || '',
        phone: educationCenter.phone || '',
        web: educationCenter.web || '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/schools/${educationCenter.id}`);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Centro Educativo" />
            <div className="p-4 max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Editar: {educationCenter.name}</h1>
                    <p className="text-muted-foreground text-sm">Modifica los campos necesarios y guarda los cambios.</p>
                </div>
                <form onSubmit={submit} className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
                    {/* El resto del formulario es idéntico al de Create.tsx */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Nombre del Centro</Label>
                            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="code">Código/Identificador</Label>
                            <Input id="code" value={data.code} onChange={e => setData('code', e.target.value)} required />
                            {errors.code && <p className="text-destructive text-xs">{errors.code}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" value={data.address} onChange={e => setData('address', e.target.value)} required />
                            {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input id="city" value={data.city} onChange={e => setData('city', e.target.value)} required />
                            {errors.city && <p className="text-destructive text-xs">{errors.city}</p>}
                        </div>
                    </div>
                    <hr className="my-2" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="contact_person">Persona de Contacto</Label>
                            <Input id="contact_person" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} required />
                            {errors.contact_person && <p className="text-destructive text-xs">{errors.contact_person}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="contact_position">Cargo del Contacto</Label>
                            <Input id="contact_position" value={data.contact_position} onChange={e => setData('contact_position', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="email">Email Institucional</Label>
                            <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                            {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="web">Sitio Web</Label>
                        <Input id="web" type="url" value={data.web} onChange={e => setData('web', e.target.value)} />
                        {errors.web && <p className="text-destructive text-xs">{errors.web}</p>}
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>Actualizar Centro</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}