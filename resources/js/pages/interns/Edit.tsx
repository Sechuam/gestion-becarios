import { Head, useForm, Link, router } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default function Edit({
    intern,
    education_centers,
    tutors,
}: {
    intern: any;
    education_centers: any[];
    tutors: any[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Becarios', href: '/becarios' },
        { title: `Editar: ${intern.user.name}`, href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put' as const,
        name: intern.user.name,
        email: intern.user.email,
        education_center_id: intern.education_center_id ? intern.education_center_id.toString() : '',
        dni: intern.dni || '',
        birth_date: intern.birth_date || '',
        phone: intern.phone || '',
        address: intern.address || '',
        city: intern.city || '',
        academic_degree: intern.academic_degree || '',
        academic_year: intern.academic_year || '',
        start_date: intern.start_date || '',
        end_date: intern.end_date || '',
        status: intern.status || 'active',
        abandon_reason: intern.abandon_reason || '',
        total_hours: intern.total_hours || '',
        dni_file: null as File | null,
        agreement_file: null as File | null,
        insurance_file: null as File | null,

        center_tutor_name: intern.center_tutor_name || '',
        center_tutor_email: intern.center_tutor_email || '',
        center_tutor_phone: intern.center_tutor_phone || '',
        company_tutor_user_id: intern.company_tutor_user_id
            ? String(intern.company_tutor_user_id)
            : '',
    });

    const submitLock = useRef(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const submit = (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (processing || submitLock.current) return;
        submitLock.current = true;
        post(`/interns/${intern.id}`, {
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
            <Head title={`Editar Becario - ${intern.user.name}`} />

            <div className="page-surface">
                {/* CABECERA */}
                <div className="mb-3 flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-xl border border-sidebar/20 bg-white shadow-sm dark:bg-slate-900">
                            <AvatarImage src={intern.user?.avatar || ''} alt={intern.user?.name || ''} />
                            <AvatarFallback className="text-base font-black text-sidebar/40 bg-transparent">
                                {intern.user?.name
                                    ? intern.user.name.substring(0, 2).toUpperCase()
                                    : 'BE'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border border-white dark:border-slate-950 shadow-sm" title="Usuario Activo" />
                    </div>
                    <div className="flex flex-col gap-0">
                        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            Editar <span className="bg-gradient-to-r from-sidebar to-[#1f4f52] bg-clip-text text-transparent">Expediente</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[8px] uppercase tracking-[0.2em]">
                            Actualizando a {intern.user.name} · {intern.dni}
                        </p>
                    </div>
                </div>

                <div className="app-panel rounded-xl border-sidebar/20 bg-white shadow-lg dark:bg-slate-900/40 p-3 md:p-4">
                    <form onSubmit={requestConfirmation} className="space-y-4" noValidate>
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="flex h-auto w-full justify-start gap-3 bg-transparent p-0 border-b border-sidebar/10 rounded-none mb-4 px-1 overflow-x-auto scrollbar-none">
                                {[
                                    { value: 'personal', label: 'Datos Personales' },
                                    { value: 'academic', label: 'Académicos' },
                                    { value: 'documents', label: 'Documentación' },
                                    { value: 'internship', label: 'Prácticas' }
                                ].map(tab => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-2 pt-1 text-[13px] font-bold text-slate-400 transition-all data-[state=active]:border-sidebar data-[state=active]:bg-transparent data-[state=active]:text-sidebar dark:data-[state=active]:text-white shadow-none"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                        <TabsContent
                            value="personal"
                            className="mt-0 space-y-4 outline-none animate-in fade-in duration-500"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-foreground"
                                    >
                                        Nombre Completo
                                    </Label>
                                    <Input
                                        id="name"
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
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
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
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
                                        className="border-border bg-card text-foreground"
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
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="city"
                                        className="text-foreground"
                                    >
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
                                <div className="space-y-2 md:col-span-3">
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
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="academic"
                            className="mt-0 space-y-6 outline-none animate-in fade-in duration-500"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Centro Educativo
                                    </Label>
                                    <Select
                                        defaultValue={data.education_center_id}
                                        onValueChange={(val) =>
                                            setData('education_center_id', val)
                                        }
                                    >
                                        <SelectTrigger className="border-border bg-card text-foreground">
                                            <SelectValue placeholder="Centro" />
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
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="degree"
                                        className="text-foreground"
                                    >
                                        Grado / Titulación
                                    </Label>
                                    <Input
                                        id="degree"
                                        className="border-border bg-card text-foreground"
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
                                        className="border-border bg-card text-foreground"
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
                        </TabsContent>

                        <TabsContent
                            value="documents"
                            className="mt-0 space-y-6 outline-none animate-in fade-in duration-500"
                        >
                            <div className="w-full space-y-4">
                                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Documentación del becario
                                </h3>

                                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg border border-border bg-card p-2 text-muted-foreground">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="dni_file"
                                                className="cursor-pointer text-sm font-semibold text-foreground"
                                            >
                                                Copia del DNI
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                PDF o Imagen (Máx. 5MB)
                                            </p>
                                        </div>
                                    </div>
                                    <Input
                                        id="dni_file"
                                        type="file"
                                        className="h-auto w-full cursor-pointer border-0 bg-transparent p-0 shadow-none file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-1 file:text-xs file:text-white sm:max-w-62.5"
                                        onChange={(e) =>
                                            setData(
                                                'dni_file',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg border border-border bg-card p-2 text-muted-foreground">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="agreement_file"
                                                className="cursor-pointer text-sm font-semibold text-foreground"
                                            >
                                                Convenio de Prácticas
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Documento PDF firmado
                                            </p>
                                        </div>
                                    </div>
                                    <Input
                                        id="agreement_file"
                                        type="file"
                                        className="h-auto w-full cursor-pointer border-0 bg-transparent p-0 shadow-none file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-1 file:text-xs file:text-white sm:max-w-62.5"
                                        onChange={(e) =>
                                            setData(
                                                'agreement_file',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg border border-border bg-card p-2 text-muted-foreground">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="insurance_file"
                                                className="cursor-pointer text-sm font-semibold text-foreground"
                                            >
                                                Seguro Escolar
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Póliza de responsabilidad
                                            </p>
                                        </div>
                                    </div>
                                    <Input
                                        id="insurance_file"
                                        type="file"
                                        className="h-auto w-full cursor-pointer border-0 bg-transparent p-0 shadow-none file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-1 file:text-xs file:text-white sm:max-w-62.5"
                                        onChange={(e) =>
                                            setData(
                                                'insurance_file',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                    />
                                </div>

                                {(errors.dni_file ||
                                    errors.agreement_file ||
                                    errors.insurance_file) && (
                                    <p className="mt-4 rounded-md border border-red-100 bg-red-50 p-2 text-xs font-medium text-red-500 italic">
                                        Por favor, revisa los archivos
                                        seleccionados.
                                    </p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="internship"
                            className="mt-0 space-y-6 outline-none animate-in fade-in duration-500"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

                                <div className="space-y-2 md:col-span-3">
                                    <Label
                                        htmlFor="center_tutor_name"
                                        className="text-foreground"
                                    >
                                        Tutor del Centro (Nombre)
                                    </Label>
                                    <Input
                                        id="center_tutor_name"
                                        className="border-border bg-card text-foreground"
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
                                        className="border-border bg-card text-foreground"
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
                                        className="border-border bg-card text-foreground"
                                        value={data.center_tutor_phone}
                                        onChange={(e) =>
                                            setData(
                                                'center_tutor_phone',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-3">
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
                                        <SelectTrigger className="border-border bg-card text-foreground">
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
                                            className="border-border bg-card pr-8 text-foreground"
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
                                <div className="space-y-2 md:col-span-3">
                                    <Label className="text-foreground">
                                        Estado
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(val) =>
                                            setData('status', val)
                                        }
                                    >
                                        <SelectTrigger className="border-border bg-card text-foreground">
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
                                    <div className="space-y-2 md:col-span-3">
                                        <Label
                                            htmlFor="abandon_reason"
                                            className="text-foreground"
                                        >
                                            Motivo de abandono
                                        </Label>
                                        <Input
                                            id="abandon_reason"
                                            className="border-border bg-card text-foreground"
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

                        <div className="flex justify-end gap-3 border-t border-sidebar/10 pt-8 mt-4">
                            <Button
                                variant="outline"
                                className="rounded-xl border-border px-6 text-foreground hover:bg-muted"
                                asChild
                            >
                                <Link href={`/interns/${intern.id}`}>Cancelar</Link>
                            </Button>
                            <Button
                                type="button"
                                className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 rounded-xl px-8 shadow-lg shadow-sidebar/20 transition-all font-bold"
                                disabled={processing}
                                onClick={requestConfirmation}
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </div>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="max-w-md rounded-3xl border-sidebar/10 shadow-2xl">
                        <DialogTitle className="text-xl font-bold">Confirmar cambios</DialogTitle>
                        <DialogDescription className="text-slate-500 py-2">
                            Vas a guardar los cambios en el expediente de <span className="font-bold text-slate-900 dark:text-white">{intern.user.name}</span>. ¿Deseas continuar?
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
                                Guardar cambios
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
