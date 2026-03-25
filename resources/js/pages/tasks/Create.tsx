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
    centers?: any[]; // opcional (cuando lo conectes al backend)
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
        education_centers_id: '',
    });

    const [assignmentType, setAssignmentType] = useState<'user' | 'module' | 'center'>('user');
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [selectedCenter, setSelectedCenter] = useState<string>('');

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

            <div className="w-full bg-background p-6 text-foreground">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Nueva tarea</h1>
                    <p className="text-sm text-muted-foreground">
                        Crea una tarea y asígnala de forma flexible.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border bg-card p-6 shadow-sm"
                >
                    {/* TÍTULO + TIPO */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
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
                                <SelectTrigger>
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

                    {/* DESCRIPCIÓN */}
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-28 w-full rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>

                    {/* ESTADO / PRIORIDAD / FECHA */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={data.priority} onValueChange={(v) => setData('priority', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PRIORITY_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <DatePicker
                            value={data.due_date}
                            onChange={(value) => setData('due_date', value)}
                        />
                    </div>

                    {/* 🔥 NUEVO SISTEMA DE ASIGNACIÓN */}
                    <div className="space-y-4">
                        <Label>Asignación</Label>

                        <Select
                            value={assignmentType}
                            onValueChange={(v) => {
                                setAssignmentType(v as any);
                                setData('assignment_type', v);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Por becario</SelectItem>
                                <SelectItem value="module">Por módulo</SelectItem>
                                <SelectItem value="center">Por centro</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* POR USUARIO */}
                        {assignmentType === 'user' && (
                            <ToggleGroup type="multiple" className="flex flex-wrap gap-2">
                                {interns.map((intern) => (
                                    <ToggleGroupItem
                                        key={intern.id}
                                        value={String(intern.id)}
                                        onClick={() => toggleIntern(intern.id)}
                                        className="text-xs"
                                    >
                                        {intern.user?.name || `Becario #${intern.id}`}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        )}

                        {/* POR MÓDULO */}
                        {assignmentType === 'module' && (
                            <Select
                                value={selectedModule}
                                onValueChange={(v) => {
                                    setSelectedModule(v);
                                    setData('module_id', v);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar módulo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daw">DAW</SelectItem>
                                    <SelectItem value="dam">DAM</SelectItem>
                                    <SelectItem value="asir">ASIR</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {/* POR CENTRO */}
                        {assignmentType === 'center' && (
                            <Select
                                value={selectedCenter}
                                onValueChange={(v) => {
                                    setSelectedCenter(v);
                                    setData('education_centers_id', v);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar centro" />
                                </SelectTrigger>
                                <SelectContent>
                                    {centers.length > 0 ? (
                                        centers.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="1">Centro 1</SelectItem>
                                            <SelectItem value="2">Centro 2</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        )}

                        {/* INFO UX */}
                        <p className="text-xs text-muted-foreground">
                            {assignmentType === 'user' && `${data.intern_ids.length} becarios seleccionados`}
                            {assignmentType === 'module' && 'Se asignará a todo el módulo'}
                            {assignmentType === 'center' && 'Se asignará a todo el centro'}
                        </p>

                        {errors.intern_ids && (
                            <p className="text-xs text-red-500">{errors.intern_ids}</p>
                        )}
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-end gap-3 border-t pt-6">
                        <Button variant="outline" asChild>
                            <Link href="/tareas">Cancelar</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            Crear tarea
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}