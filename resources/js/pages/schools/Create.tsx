import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
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
        agreement_signed_at: '',
        agreement_expires_at: '',
        agreement_slots: '',
        agreement_file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/schools', { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Añadir Centro Educativo" />

            <div className="p-6 w-full bg-background text-foreground">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Nuevo Centro Educativo</h1>
                    <p className="text-sm text-muted-foreground">
                        Completa los datos para dar de alta una nueva institución.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* DATOS DEL CENTRO */}
                    <div className="space-y-6 pt-6 border border-border rounded-xl p-6 bg-card shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground">Nombre del Centro</Label>
                                <Input id="name" className="bg-background border-border text-foreground" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-foreground">Código/Identificador</Label>
                                <Input id="code" className="bg-background border-border text-foreground" value={data.code} onChange={e => setData('code', e.target.value)} required />
                                {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-foreground">Dirección</Label>
                                <Input id="address" className="bg-background border-border text-foreground" value={data.address} onChange={e => setData('address', e.target.value)} required />
                                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-foreground">Ciudad</Label>
                                <Input id="city" className="bg-background border-border text-foreground" value={data.city} onChange={e => setData('city', e.target.value)} required />
                                {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                            </div>
                        </div>
                    </div>

                    {/* CONTACTO */}
                    <div className="space-y-6 pt-6 border border-border rounded-xl p-6 bg-card shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="contact_person" className="text-foreground">Persona de Contacto</Label>
                                <Input id="contact_person" className="bg-background border-border text-foreground" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} required />
                                {errors.contact_person && <p className="text-red-500 text-xs">{errors.contact_person}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_position" className="text-foreground">Cargo (Opcional)</Label>
                                <Input id="contact_position" className="bg-background border-border text-foreground" value={data.contact_position} onChange={e => setData('contact_position', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* CONTACTO INSTITUCIONAL */}
                    <div className="space-y-6 pt-6 border border-border rounded-xl p-6 bg-card shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">Email Institucional</Label>
                                <Input id="email" type="email" className="bg-background border-border text-foreground" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-foreground">Teléfono</Label>
                                <Input id="phone" className="bg-background border-border text-foreground" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="web" className="text-foreground">Sitio Web (Opcional)</Label>
                                <Input id="web" type="url" className="bg-background border-border text-foreground" placeholder="https://..." value={data.web} onChange={e => setData('web', e.target.value)} />
                                {errors.web && <p className="text-red-500 text-xs">{errors.web}</p>}
                            </div>
                        </div>
                    </div>

                    {/* CONVENIO */}
                    <div className="space-y-6 pt-6 border border-border rounded-xl p-6 bg-card shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="agreement_signed_at">Fecha de firma</Label>
                                <Input id="agreement_signed_at" type="date" className="bg-background border-border text-foreground" value={data.agreement_signed_at} onChange={(e) => setData('agreement_signed_at', e.target.value)} />
                                {errors.agreement_signed_at && <p className="text-red-500 text-xs">{errors.agreement_signed_at}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agreement_expires_at">Fecha de vencimiento</Label>
                                <Input id="agreement_expires_at" type="date" className="bg-background border-border text-foreground" value={data.agreement_expires_at} onChange={(e) => setData('agreement_expires_at', e.target.value)} />
                                {errors.agreement_expires_at && <p className="text-red-500 text-xs">{errors.agreement_expires_at}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agreement_slots">Plazas acordadas</Label>
                                <Input id="agreement_slots" type="number" min={1} className="bg-background border-border text-foreground" value={data.agreement_slots} onChange={(e) => setData('agreement_slots', e.target.value)} />
                                {errors.agreement_slots && <p className="text-red-500 text-xs">{errors.agreement_slots}</p>}
                            </div>
                            <div className="space-y-2 lg:col-span-3 md:col-span-2">
                                <Label htmlFor="agreement_file">PDF del convenio</Label>
                                <Input id="agreement_file" type="file" accept="application/pdf" className="bg-background border-border text-foreground" onChange={(e) => setData('agreement_file', e.target.files?.[0] || null)} />
                                {errors.agreement_file && <p className="text-red-500 text-xs">{errors.agreement_file}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-6 mt-4">
                        <Button type="button" variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={processing}>
                            Guardar Centro
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
