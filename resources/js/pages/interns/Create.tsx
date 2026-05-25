import { Head, useForm, Link } from '@inertiajs/react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Becarios', href: '/becarios' },
    { title: 'Nuevo Becario', href: '/interns/create' },
];

type FormData = {
    name: string;
    email: string;
    education_center_id: string;
    dni: string;
    birth_date: string;
    phone: string;
    address: string;
    city: string;
    academic_degree: string;
    academic_year: string;
    start_date: string;
    end_date: string;
    total_hours: string;
    status: string;
    abandon_reason: string;
    dni_file: File | null;
    agreement_file: File | null;
    insurance_file: File | null;
    center_tutor_name: string;
    center_tutor_email: string;
    center_tutor_phone: string;
    company_tutor_user_id: string;
};

export default function Create({
    education_centers,
    tutors,
}: {
    education_centers: any[];
    tutors: any[];
}) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        email: '',
        education_center_id: '',
        dni: '',
        birth_date: '',
        phone: '',
        address: '',
        city: '',
        academic_degree: '',
        academic_year: '2025-2026',
        start_date: '',
        end_date: '',
        total_hours: '',
        status: 'active',
        abandon_reason: '',
        dni_file: null,
        agreement_file: null,
        insurance_file: null,
        center_tutor_name: '',
        center_tutor_email: '',
        center_tutor_phone: '',
        company_tutor_user_id: '',
    });

    const submitLock = useRef(false);

    const submit = (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (processing || submitLock.current) return;
        submitLock.current = true;
        post('/interns', {
            forceFormData: true,
            onFinish: () => {
                submitLock.current = false;
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Becario" />

            <div className="page-surface overflow-hidden border-sidebar/20 p-0 shadow-xl">
                <div className="bg-linear-to-r from-sidebar to-sidebar-accent px-6 py-6 text-white">
                    <div className="flex flex-col gap-0">
                        <h1 className="text-xl font-black tracking-tight">
                            Nuevo <span className="text-white/80">Becario</span>
                        </h1>
                        <p className="font-mono text-[9px] font-medium tracking-[0.2em] text-white/50 uppercase">
                            Formulario de alta de nuevo expediente
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-4 md:p-6 dark:bg-slate-900/40">
                    <form onSubmit={submit} className="space-y-6" noValidate>
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="mb-6 grid! h-auto w-full grid-cols-3 gap-2 rounded-xl border border-slate-900/15 bg-slate-50/70 p-1.5 shadow-sm dark:border-white/15 dark:bg-slate-900/50">
                                <TabsTrigger
                                    value="personal"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                                >
                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                        Datos Personales
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="academic"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                                >
                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                        Académicos
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="internship"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                                >
                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                        Prácticas
                                    </span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="personal"
                                className="mt-0 animate-in space-y-6 duration-500 outline-none fade-in"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-foreground"
                                        >
                                            Nombre Completo
                                        </Label>
                                        <Input
                                            id="name"
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
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
                                            htmlFor="email"
                                            className="text-foreground"
                                        >
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
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
                                            htmlFor="dni"
                                            className="text-foreground"
                                        >
                                            DNI / NIE
                                        </Label>
                                        <Input
                                            id="dni"
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.dni}
                                            onChange={(e) =>
                                                setData('dni', e.target.value)
                                            }
                                        />
                                        {errors.dni && (
                                            <p className="text-xs text-red-500">
                                                {errors.dni}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="birth"
                                            className="text-foreground"
                                        >
                                            Fecha Nacimiento
                                        </Label>
                                        <DatePicker
                                            id="birth"
                                            value={data.birth_date}
                                            onChange={(value) =>
                                                setData('birth_date', value)
                                            }
                                        />
                                        {errors.birth_date && (
                                            <p className="text-xs text-red-500">
                                                {errors.birth_date}
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
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
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
                                    <div className="space-y-2 md:col-span-2">
                                        <Label
                                            htmlFor="address"
                                            className="text-foreground"
                                        >
                                            Dirección
                                        </Label>
                                        <Input
                                            id="address"
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
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
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
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
                            </TabsContent>

                            <TabsContent
                                value="academic"
                                className="mt-0 animate-in space-y-6 duration-500 outline-none fade-in"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground">
                                            Centro Educativo
                                        </Label>
                                        <Select
                                            onValueChange={(val) =>
                                                setData(
                                                    'education_center_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20">
                                                <SelectValue placeholder="Selecciona un centro" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {education_centers.map(
                                                    (center) => (
                                                        <SelectItem
                                                            key={center.id}
                                                            value={center.id.toString()}
                                                        >
                                                            {center.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.education_center_id && (
                                            <p className="text-xs text-red-500">
                                                {errors.education_center_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="degree"
                                                className="text-foreground"
                                            >
                                                Grado / Titulación
                                            </Label>
                                            <Input
                                                id="degree"
                                                className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.academic_degree}
                                                onChange={(e) =>
                                                    setData(
                                                        'academic_degree',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.academic_degree && (
                                                <p className="text-xs text-red-500">
                                                    {errors.academic_degree}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="year"
                                                className="text-foreground"
                                            >
                                                Curso
                                            </Label>
                                            <Input
                                                id="year"
                                                className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.academic_year}
                                                onChange={(e) =>
                                                    setData(
                                                        'academic_year',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.academic_year && (
                                                <p className="text-xs text-red-500">
                                                    {errors.academic_year}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="internship"
                                className="mt-0 animate-in space-y-6 duration-500 outline-none fade-in"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="start"
                                            className="text-foreground"
                                        >
                                            Fecha Inicio
                                        </Label>
                                        <DatePicker
                                            id="start"
                                            value={data.start_date}
                                            onChange={(value) =>
                                                setData('start_date', value)
                                            }
                                        />
                                        {errors.start_date && (
                                            <p className="text-xs text-red-500">
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="end"
                                            className="text-foreground"
                                        >
                                            Fecha Fin
                                        </Label>
                                        <DatePicker
                                            id="end"
                                            value={data.end_date}
                                            onChange={(value) =>
                                                setData('end_date', value)
                                            }
                                        />
                                        {errors.end_date && (
                                            <p className="text-xs text-red-500">
                                                {errors.end_date}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label
                                            htmlFor="center_tutor_name"
                                            className="text-foreground"
                                        >
                                            Tutor del Centro (Nombre)
                                        </Label>
                                        <Input
                                            id="center_tutor_name"
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.center_tutor_name}
                                            onChange={(e) =>
                                                setData(
                                                    'center_tutor_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="center_tutor_email"
                                            className="text-foreground"
                                        >
                                            Tutor del Centro (Email)
                                        </Label>
                                        <Input
                                            id="center_tutor_email"
                                            type="email"
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.center_tutor_email}
                                            onChange={(e) =>
                                                setData(
                                                    'center_tutor_email',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="center_tutor_phone"
                                            className="text-foreground"
                                        >
                                            Tutor del Centro (Teléfono)
                                        </Label>
                                        <Input
                                            id="center_tutor_phone"
                                            className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.center_tutor_phone}
                                            onChange={(e) =>
                                                setData(
                                                    'center_tutor_phone',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-foreground">
                                            Tutor de Empresa
                                        </Label>
                                        <Select
                                            value={data.company_tutor_user_id}
                                            onValueChange={(val) =>
                                                setData(
                                                    'company_tutor_user_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20">
                                                <SelectValue placeholder="Selecciona un tutor de empresa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tutors.map((t: any) => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={String(t.id)}
                                                    >
                                                        {t.name} ({t.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="total_hours"
                                            className="text-foreground"
                                        >
                                            Horas Totales Requeridas
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="total_hours"
                                                type="number"
                                                className="border-sidebar/10 bg-white pr-8 text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.total_hours}
                                                onChange={(e) =>
                                                    setData(
                                                        'total_hours',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <span className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-sm font-medium text-muted-foreground">
                                                h
                                            </span>
                                        </div>
                                        {errors.total_hours && (
                                            <p className="text-xs text-red-500">
                                                {errors.total_hours}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label
                                            htmlFor="dni_file"
                                            className="text-foreground"
                                        >
                                            DNI / NIE
                                        </Label>
                                        <Input
                                            id="dni_file"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) =>
                                                setData(
                                                    'dni_file',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        {errors.dni_file && (
                                            <p className="text-xs text-red-500">
                                                {errors.dni_file}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label
                                            htmlFor="agreement_file"
                                            className="text-foreground"
                                        >
                                            Convenio de Prácticas
                                        </Label>
                                        <Input
                                            id="agreement_file"
                                            type="file"
                                            accept="application/pdf"
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

                                    <div className="space-y-2 md:col-span-2">
                                        <Label
                                            htmlFor="insurance_file"
                                            className="text-foreground"
                                        >
                                            Seguro de Accidentes
                                        </Label>
                                        <Input
                                            id="insurance_file"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) =>
                                                setData(
                                                    'insurance_file',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        {errors.insurance_file && (
                                            <p className="text-xs text-red-500">
                                                {errors.insurance_file}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-foreground">
                                            Estado
                                        </Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val) =>
                                                setData('status', val)
                                            }
                                        >
                                            <SelectTrigger className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20">
                                                <SelectValue placeholder="Selecciona un estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">
                                                    Activo
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Finalizado
                                                </SelectItem>
                                                <SelectItem value="abandoned">
                                                    Abandonado
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-xs text-red-500">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>
                                    {data.status === 'abandoned' && (
                                        <div className="space-y-2 md:col-span-2">
                                            <Label
                                                htmlFor="abandon_reason"
                                                className="text-foreground"
                                            >
                                                Motivo de abandono
                                            </Label>
                                            <Input
                                                id="abandon_reason"
                                                className="border-sidebar/10 bg-white text-foreground shadow-sm focus-visible:ring-sidebar/20"
                                                value={data.abandon_reason}
                                                onChange={(e) =>
                                                    setData(
                                                        'abandon_reason',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.abandon_reason && (
                                                <p className="text-xs text-red-500">
                                                    {errors.abandon_reason}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-3 border-t border-sidebar/10 pt-8">
                            <Button
                                variant="outline"
                                className="rounded-xl border-border px-6 text-foreground hover:bg-muted"
                                asChild
                            >
                                <Link href="/becarios">Cancelar</Link>
                            </Button>
                            <Button
                                type="submit"
                                className="rounded-xl bg-sidebar px-8 font-bold text-sidebar-foreground shadow-lg shadow-sidebar/20 transition-all hover:bg-sidebar/90"
                                disabled={processing}
                                onClick={submit}
                            >
                                Guardar Becario
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
