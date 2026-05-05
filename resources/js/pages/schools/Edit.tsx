import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Centros Educativos', href: '/centros' },
    { title: 'Editar Centro', href: '#' },
];

export default function Edit({
    educationCenter,
    agreement_url,
}: {
    educationCenter: any;
    agreement_url?: string;
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: educationCenter.name || '',
        code: educationCenter.code || '',
        address: educationCenter.address || '',
        city: educationCenter.city || '',
        contact_person: educationCenter.contact_person || '',
        contact_email: educationCenter.contact_email || '',
        contact_position: educationCenter.contact_position || '',
        email: educationCenter.email || '',
        phone: educationCenter.phone || '',
        web: educationCenter.web || '',
        agreement_signed_at: educationCenter.agreement_signed_at || '',
        agreement_expires_at: educationCenter.agreement_expires_at || '',
        agreement_slots: educationCenter.agreement_slots || '',
        agreement_file: null as File | null,
        _method: 'patch',
    });

    const submitLock = useRef(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const submit = (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (processing || submitLock.current) return;
        submitLock.current = true;
        post(`/centros/${educationCenter.id}`, {
            forceFormData: true,
            onFinish: () => {
                submitLock.current = false;
            },
        });
    };

    const requestConfirmation = (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (processing) return;
        setConfirmOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Centro Educativo" />

            <div className="mb-6 flex flex-col gap-1">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Editar <span className="bg-gradient-to-r from-sidebar to-[#1f4f52] bg-clip-text text-transparent">Centro Educativo</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[9px] uppercase tracking-[0.2em]">
                    Actualizando a {educationCenter.name} · {educationCenter.code}
                </p>
            </div>

            <div className="app-panel rounded-[1.5rem] border-sidebar/20 bg-white shadow-xl dark:bg-slate-900/40 p-4 md:p-6">
                <form onSubmit={requestConfirmation} className="space-y-6" noValidate>
                    {/* SECCIÓN: DATOS DEL CENTRO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">01</span>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Información Institucional</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground">
                                    Nombre del Centro
                                </Label>
                                <Input
                                    id="name"
                                    className="border-border bg-card text-foreground"
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
                                <Label htmlFor="code" className="text-foreground">
                                    Código/Identificador
                                </Label>
                                <Input
                                    id="code"
                                    className="border-border bg-card text-foreground"
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
                                    className="border-border bg-card text-foreground"
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
                                <Label htmlFor="city" className="text-foreground">
                                    Ciudad
                                </Label>
                                <Input
                                    id="city"
                                    className="border-border bg-card text-foreground"
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

                    {/* SECCIÓN: CONTACTO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">02</span>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Coordinación y Contacto</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="contact_person"
                                    className="text-foreground"
                                >
                                    Persona de Contacto
                                </Label>
                                <Input
                                    id="contact_person"
                                    className="border-border bg-card text-foreground"
                                    value={data.contact_person}
                                    onChange={(e) =>
                                        setData('contact_person', e.target.value)
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
                                    className="border-border bg-card text-foreground"
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
                                    className="border-border bg-card text-foreground"
                                    value={data.contact_position}
                                    onChange={(e) =>
                                        setData('contact_position', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN: CONTACTO INSTITUCIONAL */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">03</span>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Canales Oficiales</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">
                                    Email Institucional
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="border-border bg-card text-foreground"
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
                                <Label htmlFor="phone" className="text-foreground">
                                    Teléfono
                                </Label>
                                <Input
                                    id="phone"
                                    className="border-border bg-card text-foreground"
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="web" className="text-foreground">
                                Sitio Web (Opcional)
                            </Label>
                            <Input
                                id="web"
                                type="url"
                                className="border-border bg-background text-foreground"
                                value={data.web}
                                onChange={(e) => setData('web', e.target.value)}
                            />
                            {errors.web && (
                                <p className="text-xs text-red-500">{errors.web}</p>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN: CONVENIO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">04</span>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Detalles del Convenio</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="agreement_signed_at"
                                    className="text-foreground"
                                >
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
                                <Label
                                    htmlFor="agreement_expires_at"
                                    className="text-foreground"
                                >
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
                                <Label
                                    htmlFor="agreement_slots"
                                    className="text-foreground"
                                >
                                    Plazas acordadas
                                </Label>
                                <Input
                                    id="agreement_slots"
                                    type="number"
                                    min={1}
                                    className="border-border bg-card text-foreground"
                                    value={data.agreement_slots}
                                    onChange={(e) =>
                                        setData('agreement_slots', e.target.value)
                                    }
                                />
                                {errors.agreement_slots && (
                                    <p className="text-xs text-red-500">
                                        {errors.agreement_slots}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                {agreement_url && (
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <a
                                            href={agreement_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Ver convenio actual
                                        </a>
                                        <a
                                            href={agreement_url}
                                            download
                                            className="text-blue-600 hover:underline"
                                        >
                                            Descargar
                                        </a>
                                    </div>
                                )}
                                <Label
                                    htmlFor="agreement_file"
                                    className="text-foreground"
                                >
                                    PDF del convenio
                                </Label>
                                <Input
                                    id="agreement_file"
                                    type="file"
                                    accept="application/pdf"
                                    className="border-border bg-card text-foreground"
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

                    <div className="flex justify-end gap-3 border-t border-sidebar/10 pt-8 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl border-border px-6 text-foreground hover:bg-muted"
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 rounded-xl px-8 shadow-lg shadow-sidebar/20 transition-all font-bold"
                            disabled={processing}
                            onClick={requestConfirmation}
                        >
                            Actualizar Centro
                        </Button>
                    </div>
                </form>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md rounded-3xl border-sidebar/10 shadow-2xl">
                    <DialogTitle className="text-xl font-bold">Confirmar cambios</DialogTitle>
                    <DialogDescription className="text-slate-500 py-2">
                        Vas a guardar los cambios en la ficha de <span className="font-bold text-slate-900 dark:text-white">{educationCenter.name}</span>. ¿Deseas continuar?
                    </DialogDescription>
                    <DialogFooter className="gap-2 pt-4">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-xl px-6">Cancelar</Button>
                        </DialogClose>
                        <Button
                            className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 rounded-xl px-8 shadow-lg shadow-sidebar/20 transition-all font-bold"
                            onClick={() => {
                                setConfirmOpen(false);
                                submit();
                            }}
                            disabled={processing}
                        >
                            Actualizar centro
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
