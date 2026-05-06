import { Head, useForm, Link } from '@inertiajs/react';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { useState } from 'react';

type Props = {
    practice_types: any[];
    interns: any[];
    centers?: any[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tareas', href: '/tareas' },
    { title: 'Nueva tarea', href: '/tareas/create' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'in_review', label: 'En revisión' },
    { value: 'completed', label: 'Completada' },
    { value: 'rejected', label: 'Rechazada' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
];

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

export default function Create({ practice_types = [], interns = [], centers = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        practice_type_id: '',
        intern_ids: [] as number[],
        assignment_type: 'user',
        module_id: '',
        education_center_id: '',
    });

    const [assignmentType, setAssignmentType] = useState<'user' | 'module' | 'center'>('user');
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [selectedCenter, setSelectedCenter] = useState<string>('');
    const [centerQuery, setCenterQuery] = useState<string>('');

    const toggleIntern = (id: number) => {
        setData(
            'intern_ids',
            data.intern_ids.includes(id)
                ? data.intern_ids.filter((i) => i !== id)
                : [...data.intern_ids, id],
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tareas');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva tarea" />

            <div className="page-surface p-0 overflow-hidden border-sidebar/20 shadow-xl">
                <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-6 text-white">
                    <div className="flex flex-col gap-0">
                        <h1 className="text-xl font-black tracking-tight">
                            Nueva <span className="text-white/80">Tarea</span>
                        </h1>
                        <p className="text-white/50 font-medium font-mono text-[9px] uppercase tracking-[0.2em]">
                            Planificación y asignación de actividades
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-4 md:p-6 dark:bg-slate-900/40">
                    <form onSubmit={submit} className="space-y-6" noValidate>
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-2xl border border-slate-900/15 bg-slate-50/70 p-1.5 shadow-sm dark:border-white/15 dark:bg-slate-900/50 mb-6">
                                <TabsTrigger
                                    value="info"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Información</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="planning"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Planificación</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="assignment"
                                    className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-sidebar data-[state=active]:to-[#1f4f52] data-[state=active]:text-white data-[state=active]:shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Asignación</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="info" className="mt-0 space-y-4 outline-none animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Título</Label>
                                        <Input
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                        />
                                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipo de práctica</Label>
                                        <Select
                                            value={data.practice_type_id ? String(data.practice_type_id) : ''}
                                            onValueChange={(v) => setData('practice_type_id', v)}
                                        >
                                            <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {practice_types.map((type) => (
                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="min-h-28 w-full rounded-xl border border-sidebar/10 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sidebar/20"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="planning" className="mt-0 space-y-4 outline-none animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Estado</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(v) => setData('status', v)}
                                        >
                                            <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Prioridad</Label>
                                        <Select
                                            value={data.priority}
                                            onValueChange={(v) => setData('priority', v)}
                                        >
                                            <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                <SelectValue placeholder="Prioridad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRIORITY_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fecha de entrega</Label>
                                        <DatePicker
                                             className="bg-white border-sidebar/10 shadow-sm rounded-xl"
                                            value={data.due_date}
                                            onChange={(value) => setData('due_date', value)}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="assignment" className="mt-0 space-y-4 outline-none animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Modelo de Asignación</Label>
                                            <Select
                                                value={assignmentType}
                                                onValueChange={(v) => {
                                                    setAssignmentType(v as any);
                                                    setData('assignment_type', v);
                                                }}
                                            >
                                                <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                    <SelectValue placeholder="Selecciona un modo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">Por becario</SelectItem>
                                                    <SelectItem value="module">Por módulo</SelectItem>
                                                    <SelectItem value="center">Por centro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {assignmentType === 'module' && (
                                            <div className="space-y-2">
                                                <Label>Seleccionar Módulo</Label>
                                                <Select
                                                    value={selectedModule}
                                                    onValueChange={(v) => {
                                                        setSelectedModule(v);
                                                        setData('module_id', v);
                                                    }}
                                                >
                                                    <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                        <SelectValue placeholder="Seleccionar módulo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="daw">DAW</SelectItem>
                                                        <SelectItem value="dam">DAM</SelectItem>
                                                        <SelectItem value="asir">ASIR</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {assignmentType === 'center' && (
                                            <div className="space-y-2">
                                                <Label>Seleccionar Centro</Label>
                                                <Select
                                                    value={selectedCenter}
                                                    onValueChange={(v) => {
                                                        setSelectedCenter(v);
                                                        setData('education_center_id', v);
                                                        setData('intern_ids', []);
                                                    }}
                                                >
                                                    <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                        <SelectValue placeholder="Seleccionar centro" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <div className="sticky top-0 z-10 bg-popover px-2 pb-2 pt-2">
                                                            <Input
                                                                value={centerQuery}
                                                                onChange={(e) => setCenterQuery(e.target.value)}
                                                                placeholder="Buscar centro..."
                                                                className="h-8 text-xs"
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        {(centers || [])
                                                            .filter((c) =>
                                                                centerQuery
                                                                    ? c.name?.toLowerCase().includes(centerQuery.toLowerCase())
                                                                    : true,
                                                            )
                                                            .map((c) => (
                                                                <SelectItem key={c.id} value={String(c.id)}>
                                                                    {c.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {(assignmentType === 'user' || (assignmentType === 'center' && selectedCenter)) && (
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <Label className="text-xs uppercase font-black text-slate-400 tracking-widest">
                                                        {assignmentType === 'user' ? 'Becarios Disponibles' : 'Becarios del centro'}
                                                    </Label>
                                                    {assignmentType === 'center' && (
                                                        <Button
                                                            type="button"
                                                            variant="link"
                                                            className="h-auto p-0 text-[10px] font-bold text-sidebar"
                                                            onClick={() => {
                                                                const allIds = interns
                                                                    .filter((intern) => String(intern.education_center_id) === String(selectedCenter))
                                                                    .map((intern) => intern.id);
                                                                setData('intern_ids', allIds);
                                                            }}
                                                        >
                                                            Seleccionar todos
                                                        </Button>
                                                    )}
                                                </div>
                                                <ToggleGroup
                                                    type="multiple"
                                                    className="flex flex-wrap justify-start gap-2"
                                                    value={data.intern_ids.map((id) => String(id))}
                                                    onValueChange={(values) =>
                                                        setData('intern_ids', values.map((v) => Number(v)))
                                                    }
                                                >
                                                    {(assignmentType === 'user' ? interns : interns.filter(i => String(i.education_center_id) === String(selectedCenter)))
                                                        .map((intern) => (
                                                            <ToggleGroupItem
                                                                key={intern.id}
                                                                value={String(intern.id)}
                                                                className="h-8 rounded-lg border border-sidebar/10 bg-white px-3 text-[10px] font-bold transition-all data-[state=on]:bg-sidebar data-[state=on]:text-sidebar-foreground shadow-sm"
                                                            >
                                                                {intern.user?.name || `Becario #${intern.id}`}
                                                            </ToggleGroupItem>
                                                        ))}
                                                </ToggleGroup>
                                            </div>
                                        )}
                                        
                                        <p className="text-[10px] font-medium text-muted-foreground italic mt-2">
                                            {assignmentType === 'user' && `${data.intern_ids.length} becarios seleccionados`}
                                            {assignmentType === 'module' && 'Se asignará a todo el módulo'}
                                            {assignmentType === 'center' && (selectedCenter ? `${data.intern_ids.length} becarios seleccionados` : 'Selecciona un centro')}
                                        </p>

                                        {errors.intern_ids && (
                                            <p className="text-xs text-red-500">{errors.intern_ids}</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-3 border-t border-sidebar/10 pt-6">
                            <Button
                                variant="outline"
                                className="rounded-xl border-border px-6 text-foreground hover:bg-muted"
                                asChild
                            >
                                <Link href="/tareas">Cancelar</Link>
                            </Button>

                            <Button
                                type="submit"
                                className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 rounded-xl px-8 shadow-lg shadow-sidebar/20 transition-all font-bold"
                                disabled={processing}
                            >
                                {processing ? 'Creando...' : 'Crear Tarea'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
