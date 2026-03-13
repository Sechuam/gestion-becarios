import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/schools' },
    { title: 'Editar Centro', href: '#' },
];

export default function Edit({ educationCenter, agreement_url }: { educationCenter: any; agreement_url?: string }) {
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
        agreement_signed_at: educationCenter.agreement_signed_at || '',
        agreement_expires_at: educationCenter.agreement_expires_at || '',
        agreement_slots: educationCenter.agreement_slots || '',
        agreement_file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/schools/${educationCenter.id}`, { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Centro Educativo" />

            <div className="p-6 w-full bg-white dark:bg-slate-900">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Editar: {educationCenter.name}</h1>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                        Modifica los campos necesarios y guarda los cambios.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Nombre del Centro</Label>
                            <Input id="name" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.name} onChange={e => setData('name', e.target.value)} required />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-slate-700 dark:text-slate-200">Código/Identificador</Label>
                            <Input id="code" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.code} onChange={e => setData('code', e.target.value)} required />
                            {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-slate-700 dark:text-slate-200">Dirección</Label>
                            <Input id="address" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.address} onChange={e => setData('address', e.target.value)} required />
                            {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-slate-700 dark:text-slate-200">Ciudad</Label>
                            <Input id="city" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.city} onChange={e => setData('city', e.target.value)} required />
                            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="contact_person" className="text-slate-700 dark:text-slate-200">Persona de Contacto</Label>
                            <Input id="contact_person" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} required />
                            {errors.contact_person && <p className="text-red-500 text-xs">{errors.contact_person}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_position" className="text-slate-700 dark:text-slate-200">Cargo (Opcional)</Label>
                            <Input id="contact_position" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.contact_position} onChange={e => setData('contact_position', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email Institucional</Label>
                            <Input id="email" type="email" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">Teléfono</Label>
                            <Input id="phone" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="web" className="text-slate-700 dark:text-slate-200">Sitio Web (Opcional)</Label>
                        <Input id="web" type="url" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" value={data.web} onChange={e => setData('web', e.target.value)} />
                        {errors.web && <p className="text-red-500 text-xs">{errors.web}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="agreement_signed_at" className="text-slate-700 dark:text-slate-200">Fecha de firma</Label>
                            <Input
                                id="agreement_signed_at"
                                type="date"
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                value={data.agreement_signed_at}
                                onChange={(e) => setData('agreement_signed_at', e.target.value)}
                            />
                            {errors.agreement_signed_at && <p className="text-red-500 text-xs">{errors.agreement_signed_at}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agreement_expires_at" className="text-slate-700 dark:text-slate-200">Fecha de vencimiento</Label>
                            <Input
                                id="agreement_expires_at"
                                type="date"
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                value={data.agreement_expires_at}
                                onChange={(e) => setData('agreement_expires_at', e.target.value)}
                            />
                            {errors.agreement_expires_at && <p className="text-red-500 text-xs">{errors.agreement_expires_at}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agreement_slots" className="text-slate-700 dark:text-slate-200">Plazas acordadas</Label>
                            <Input
                                id="agreement_slots"
                                type="number"
                                min={1}
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                value={data.agreement_slots}
                                onChange={(e) => setData('agreement_slots', e.target.value)}
                            />
                            {errors.agreement_slots && <p className="text-red-500 text-xs">{errors.agreement_slots}</p>}
                        </div>

                        <div className="space-y-2 lg:col-span-3 md:col-span-2">
                            {agreement_url && (
                                <a
                                    href={agreement_url}
                                    target="_blank"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Ver convenio actual
                                </a>
                            )}
                            <Label htmlFor="agreement_file" className="text-slate-700 dark:text-slate-200">PDF del convenio</Label>
                            <Input
                                id="agreement_file"
                                type="file"
                                accept="application/pdf"
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                onChange={(e) => setData('agreement_file', e.target.files?.[0] || null)}
                            />
                            {errors.agreement_file && <p className="text-red-500 text-xs">{errors.agreement_file}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
                        <Button type="button" variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white" disabled={processing}>
                            Actualizar Centro
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}