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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

            <div className="page-surface overflow-hidden border-sidebar/20 p-0 shadow-xl">
                <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-6 text-white">
                    <div className="flex flex-col gap-0">
                        <h1 className="text-xl font-black tracking-tight">
                            Nuevo{' '}
                            <span className="text-white/80">
                                Centro Educativo
                            </span>
                        </h1>
                        <p className="font-mono text-[9px] font-medium tracking-[0.2em] text-white/50 uppercase">
                            Alta de nueva institución colaboradora
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-4 md:p-6 dark:bg-slate-900/40">
                    <form onSubmit={submit} className="space-y-6" noValidate>
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
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Nombre del Centro
                                        </Label>
                                        <Input
                                            id="name"
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
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
                                        <Label htmlFor="code">
                                            Código/Identificador
                                        </Label>
                                        <Input
                                            id="code"
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
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
                                        <Label htmlFor="address">
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad</Label>
                                        <Input
                                            id="city"
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.city}
                                            onChange={(e) =>
                                                setData('city', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="contact"
                                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">
                                            Email Coordinador
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_position">
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
                                                setData('email', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="web">Sitio Web</Label>
                                        <Input
                                            id="web"
                                            type="url"
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.web}
                                            onChange={(e) =>
                                                setData('web', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="agreement"
                                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="agreement_signed_at">
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="agreement_expires_at">
                                            Fecha de vencimiento
                                        </Label>
                                        <DatePicker
                                            className="rounded-xl border-sidebar/10 bg-white shadow-sm"
                                            id="agreement_expires_at"
                                            value={data.agreement_expires_at}
                                            onChange={(value) =>
                                                setData(
                                                    'agreement_expires_at',
                                                    value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="agreement_slots">
                                            Plazas acordadas
                                        </Label>
                                        <Input
                                            id="agreement_slots"
                                            type="number"
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.agreement_slots}
                                            onChange={(e) =>
                                                setData(
                                                    'agreement_slots',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2 lg:col-span-3">
                                        <Label htmlFor="agreement_file">
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
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
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
                                type="submit"
                                className="rounded-xl bg-sidebar px-8 font-bold text-sidebar-foreground shadow-lg shadow-sidebar/20 transition-all hover:bg-sidebar/90"
                                disabled={processing}
                                onClick={submit}
                            >
                                Guardar Centro
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
