import { Head, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/centros' },
    { title: 'Añadir Centro', href: '/centros/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        address: '',
        city: '',
        contact_person: '',
        contact_email: '',
        contact_position: '',
        email: '',
        phone: '',
        web: '',
        agreement_signed_at: '',
        agreement_expires_at: '',
        agreement_slots: '',
        agreement_file: null as File | null,
    });

    const submitLock = useRef(false);

    const submit = (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (processing || submitLock.current) return;
        submitLock.current = true;
        post('/centros', {
            forceFormData: true,
            onFinish: () => {
                submitLock.current = false;
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Añadir Centro Educativo" />

            <div className="page-surface">
                <div className="mb-6">
                    <h1 className="page-title">Nuevo Centro Educativo</h1>
                    <p className="page-subtitle">
                        Completa los datos para dar de alta una nueva
                        institución.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6" noValidate>
                    {/* DATOS DEL CENTRO */}
                    <div className="space-y-6 rounded-xl border border-border bg-card p-6 pt-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-foreground"
                                >
                                    Nombre del Centro
                                </Label>
                                <Input
                                    id="name"
                                    className="border-border bg-background text-foreground"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="code"
                                    className="text-foreground"
                                >
                                    Código/Identificador
                                </Label>
                                <Input
                                    id="code"
                                    className="border-border bg-background text-foreground"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                />
                                {errors.code && (
                                    <p className="text-xs text-red-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="address"
                                    className="text-foreground"
                                >
                                    Dirección
                                </Label>
                                <Input
                                    id="address"
                                    className="border-border bg-background text-foreground"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                                {errors.address && (
                                    <p className="text-xs text-red-500">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="city"
                                    className="text-foreground"
                                >
                                    Ciudad
                                </Label>
                                <Input
                                    id="city"
                                    className="border-border bg-background text-foreground"
                                    value={data.city}
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                />
                                {errors.city && (
                                    <p className="text-xs text-red-500">
                                        {errors.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CONTACTO */}
                    <div className="space-y-6 rounded-xl border border-border bg-card p-6 pt-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="contact_person"
                                    className="text-foreground"
                                >
                                    Persona de Contacto
                                </Label>
                                <Input
                                    id="contact_person"
                                    className="border-border bg-background text-foreground"
                                    value={data.contact_person}
                                    onChange={(e) =>
                                        setData(
                                            'contact_person',
                                            e.target.value,
                                        )
                                    }
                                />
                                {errors.contact_person && (
                                    <p className="text-xs text-red-500">
                                        {errors.contact_person}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="contact_email"
                                    className="text-foreground"
                                >
                                    Email del Coordinador
                                </Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    className="border-border bg-background text-foreground"
                                    value={data.contact_email}
                                    onChange={(e) =>
                                        setData('contact_email', e.target.value)
                                    }
                                />
                                {errors.contact_email && (
                                    <p className="text-xs text-red-500">
                                        {errors.contact_email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="contact_position"
                                    className="text-foreground"
                                >
                                    Cargo (Opcional)
                                </Label>
                                <Input
                                    id="contact_position"
                                    className="border-border bg-background text-foreground"
                                    value={data.contact_position}
                                    onChange={(e) =>
                                        setData(
                                            'contact_position',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* CONTACTO INSTITUCIONAL */}
                    <div className="space-y-6 rounded-xl border border-border bg-card p-6 pt-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-foreground"
                                >
                                    Email Institucional
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="border-border bg-background text-foreground"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-foreground"
                                >
                                    Teléfono
                                </Label>
                                <Input
                                    id="phone"
                                    className="border-border bg-background text-foreground"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="web"
                                    className="text-foreground"
                                >
                                    Sitio Web (Opcional)
                                </Label>
                                <Input
                                    id="web"
                                    type="url"
                                    className="border-border bg-background text-foreground"
                                    placeholder="https://..."
                                    value={data.web}
                                    onChange={(e) =>
                                        setData('web', e.target.value)
                                    }
                                />
                                {errors.web && (
                                    <p className="text-xs text-red-500">
                                        {errors.web}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CONVENIO */}
                    <div className="space-y-6 rounded-xl border border-border bg-card p-6 pt-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="agreement_signed_at">
                                    Fecha de firma
                                </Label>
                                <DatePicker
                                    id="agreement_signed_at"
                                    value={data.agreement_signed_at}
                                    onChange={(value) =>
                                        setData('agreement_signed_at', value)
                                    }
                                />
                                {errors.agreement_signed_at && (
                                    <p className="text-xs text-red-500">
                                        {errors.agreement_signed_at}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agreement_expires_at">
                                    Fecha de vencimiento
                                </Label>
                                <DatePicker
                                    id="agreement_expires_at"
                                    value={data.agreement_expires_at}
                                    onChange={(value) =>
                                        setData('agreement_expires_at', value)
                                    }
                                />
                                {errors.agreement_expires_at && (
                                    <p className="text-xs text-red-500">
                                        {errors.agreement_expires_at}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agreement_slots">
                                    Plazas acordadas
                                </Label>
                                <Input
                                    id="agreement_slots"
                                    type="number"
                                    min={1}
                                    className="border-border bg-background text-foreground"
                                    value={data.agreement_slots}
                                    onChange={(e) =>
                                        setData(
                                            'agreement_slots',
                                            e.target.value,
                                        )
                                    }
                                />
                                {errors.agreement_slots && (
                                    <p className="text-xs text-red-500">
                                        {errors.agreement_slots}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <Label htmlFor="agreement_file">
                                    PDF del convenio
                                </Label>
                                <Input
                                    id="agreement_file"
                                    type="file"
                                    accept="application/pdf"
                                    className="border-border bg-background text-foreground"
                                    onChange={(e) =>
                                        setData(
                                            'agreement_file',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                />
                                {errors.agreement_file && (
                                    <p className="text-xs text-red-500">
                                        {errors.agreement_file}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3 border-t border-border pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-border text-foreground hover:bg-muted"
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={processing}
                            onClick={submit}
                        >
                            Guardar Centro
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
