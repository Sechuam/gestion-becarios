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

            <div className="w-full bg-background p-6 text-foreground">
                <form onSubmit={submit} className="space-y-6" noValidate>
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1 sm:h-12 sm:grid-cols-3 dark:border-slate-700/70 dark:bg-slate-800/70">
                            <TabsTrigger
                                value="personal"
                                className="rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground"
                            >
                                Datos Personales
                            </TabsTrigger>
                            <TabsTrigger
                                value="academic"
                                className="rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground"
                            >
                                Académicos
                            </TabsTrigger>
                            <TabsTrigger
                                value="internship"
                                className="rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground"
                            >
                                Prácticas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="personal"
                            className="mt-4 space-y-6 rounded-xl border border-border bg-card p-6 pt-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60"
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
                                        htmlFor="email"
                                        className="text-foreground"
                                    >
                                        Email
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
                                        htmlFor="dni"
                                        className="text-foreground"
                                    >
                                        DNI / NIE
                                    </Label>
                                    <Input
                                        id="dni"
                                        className="border-border bg-background text-foreground"
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
                                <div className="space-y-2 md:col-span-2">
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
                        </TabsContent>

                        <TabsContent
                            value="academic"
                            className="mt-4 space-y-6 rounded-xl border border-border bg-card p-6 pt-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Centro Educativo
                                    </Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setData('education_center_id', val)
                                        }
                                    >
                                        <SelectTrigger className="border-border bg-background text-foreground">
                                            <SelectValue placeholder="Selecciona un centro" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {education_centers.map((center) => (
                                                <SelectItem
                                                    key={center.id}
                                                    value={center.id.toString()}
                                                >
                                                    {center.name}
                                                </SelectItem>
                                            ))}
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
                                            className="border-border bg-background text-foreground"
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
                                            className="border-border bg-background text-foreground"
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
                            className="mt-4 space-y-6 rounded-xl border border-border bg-card p-6 pt-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60"
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
                                        className="border-border bg-background text-foreground"
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
                                        className="border-border bg-background text-foreground"
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
                                        className="border-border bg-background text-foreground"
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
                                        <SelectTrigger className="border-border bg-background text-foreground">
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
                                            className="border-border bg-background pr-8 text-foreground"
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
                                        <SelectTrigger className="border-border bg-background text-foreground">
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
                                            className="border-border bg-background text-foreground"
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

                    <div className="flex justify-end gap-3 border-t border-border pt-6">
                        <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-muted"
                            asChild
                        >
                            <Link href="/becarios">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={processing}
                            onClick={submit}
                        >
                            Guardar Becario
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
