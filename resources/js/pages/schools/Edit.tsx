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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        setConfirmOpen(false);

        post(`/centros/${educationCenter.id}`, {
            forceFormData: true,
            preserveScroll: true,
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

            <div className="page-surface overflow-hidden border-sidebar/20 p-0 shadow-xl">
                <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-5 text-white">
                    <div className="flex flex-col gap-0">
                        <h1 className="text-xl font-black tracking-tight">
                            Editar{' '}
                            <span className="text-white/80">
                                Centro Educativo
                            </span>
                        </h1>
                        <p className="font-mono text-[9px] font-medium tracking-[0.2em] text-white/50 uppercase">
                            Actualizando: {educationCenter.name} ·{' '}
                            {educationCenter.code}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-4 md:p-6 dark:bg-slate-900/40">
                    <form
                        onSubmit={requestConfirmation}
                        className="space-y-6"
                        noValidate
                    >
                        <Tabs defaultValue="institution" className="w-full">
                            <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-2 rounded-xl border border-slate-900/15 bg-slate-50/70 p-1.5 shadow-sm dark:border-white/15 dark:bg-slate-900/50">
                                <TabsTrigger
                                    value="institution"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                                >
                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                        Institución
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="contact"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                                >
                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                        Contacto
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="agreement"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                                >
                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                        Convenio
                                    </span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="institution"
                                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
                            >
                                {/* SECCIÓN: DATOS DEL CENTRO */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">
                                            01
                                        </span>
                                        <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">
                                            Información Institucional
                                        </h3>
                                    </div>
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.code}
                                                onChange={(e) =>
                                                    setData(
                                                        'code',
                                                        e.target.value,
                                                    )
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.address}
                                                onChange={(e) =>
                                                    setData(
                                                        'address',
                                                        e.target.value,
                                                    )
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.city}
                                                onChange={(e) =>
                                                    setData(
                                                        'city',
                                                        e.target.value,
                                                    )
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
                            </TabsContent>

                            <TabsContent
                                value="contact"
                                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
                            >
                                {/* SECCIÓN: CONTACTO */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">
                                            02
                                        </span>
                                        <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">
                                            Coordinación y Contacto
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="contact_person"
                                                className="text-foreground"
                                            >
                                                Persona de Contacto
                                            </Label>
                                            <Input
                                                id="contact_person"
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.contact_email}
                                                onChange={(e) =>
                                                    setData(
                                                        'contact_email',
                                                        e.target.value,
                                                    )
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
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

                                    <div className="space-y-6 border-t border-sidebar/5 pt-4">
                                        <div className="flex items-center gap-2 pb-2">
                                            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                Canales Oficiales
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email Institucional
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData(
                                                            'email',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.email && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    Teléfono
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            'phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.phone && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="web">
                                                    Sitio Web
                                                </Label>
                                                <Input
                                                    id="web"
                                                    type="url"
                                                    className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                    value={data.web}
                                                    onChange={(e) =>
                                                        setData(
                                                            'web',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="agreement"
                                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
                            >
                                {/* SECCIÓN: CONVENIO */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">
                                            03
                                        </span>
                                        <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">
                                            Detalles del Convenio
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="agreement_signed_at"
                                                className="text-foreground"
                                            >
                                                Fecha de firma
                                            </Label>
                                            <DatePicker
                                                className="rounded-xl border-sidebar/10 bg-white shadow-sm"
                                                id="agreement_signed_at"
                                                value={data.agreement_signed_at}
                                                onChange={(value) =>
                                                    setData(
                                                        'agreement_signed_at',
                                                        value,
                                                    )
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
                                                className="rounded-xl border-sidebar/10 bg-white shadow-sm"
                                                id="agreement_expires_at"
                                                value={
                                                    data.agreement_expires_at
                                                }
                                                onChange={(value) =>
                                                    setData(
                                                        'agreement_expires_at',
                                                        value,
                                                    )
                                                }
                                            />
                                            {errors.agreement_expires_at && (
                                                <p className="text-xs text-red-500">
                                                    {
                                                        errors.agreement_expires_at
                                                    }
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
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
                                                className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                                onChange={(e) =>
                                                    setData(
                                                        'agreement_file',
                                                        e.target.files?.[0] ||
                                                            null,
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
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-3 border-t border-sidebar/10 pt-6">
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
                                className="rounded-xl bg-sidebar px-8 font-bold text-sidebar-foreground shadow-lg shadow-sidebar/20 transition-all hover:bg-sidebar/90"
                                disabled={processing}
                                onClick={requestConfirmation}
                            >
                                Actualizar Centro
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md rounded-xl border-sidebar/10 shadow-xl">
                    <DialogTitle className="text-xl font-bold">
                        Confirmar cambios
                    </DialogTitle>
                    <DialogDescription className="py-2 text-slate-500">
                        Vas a guardar los cambios en la ficha de{' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                            {educationCenter.name}
                        </span>
                        . ¿Deseas continuar?
                    </DialogDescription>
                    <DialogFooter className="gap-2 pt-4">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-xl px-6">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            className="rounded-xl bg-sidebar px-8 font-bold text-sidebar-foreground shadow-lg shadow-sidebar/20 transition-all hover:bg-sidebar/90"
                            onClick={submit}
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
