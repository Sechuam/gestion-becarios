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

            <div className="page-surface">
                <div className="mb-6">
                    <h1 className="page-title">Nueva tarea</h1>
                    <p className="page-subtitle">
                        Crea una tarea y asígnala de forma flexible.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="rounded-xl border border-border/60 bg-card/90 p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <section className="space-y-4 rounded-lg border border-border/70 bg-background/60 p-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">Detalles</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Información principal de la tarea.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Título</Label>
                                        <Input
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                        />
                                        {errors.title && (
                                            <p className="text-xs text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipo de práctica</Label>
                                        <Select
                                            value={
                                                data.practice_type_id
                                                    ? String(data.practice_type_id)
                                                    : ''
                                            }
                                            onValueChange={(v) =>
                                                setData('practice_type_id', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {practice_types.map((type) => (
                                                    <SelectItem
                                                        key={type.id}
                                                        value={String(type.id)}
                                                    >
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
                                        className="min-h-28 w-full rounded-lg border px-3 py-2 text-sm"
                                    />
                                </div>
                            </section>

                            <section className="space-y-4 rounded-lg border border-border/70 bg-background/60 p-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Planificación
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Estado, prioridad y fecha de entrega.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <Select
                                        value={data.status}
                                        onValueChange={(v) => setData('status', v)}
                                    >
                                        <SelectTrigger>
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

                                    <Select
                                        value={data.priority}
                                        onValueChange={(v) => setData('priority', v)}
                                    >
                                        <SelectTrigger>
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

                                    <DatePicker
                                        value={data.due_date}
                                        onChange={(value) => setData('due_date', value)}
                                    />
                                </div>
                            </section>
                        </div>

                        <section className="space-y-4 rounded-lg border border-border/70 bg-background/60 p-4">
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">Asignación</h2>
                                <p className="text-xs text-muted-foreground">
                                    Decide cómo se asigna la tarea.
                                </p>
                            </div>

                        <Select
                            value={assignmentType}
                            onValueChange={(v) => {
                                setAssignmentType(v as any);
                                setData('assignment_type', v);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un modo" />
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
                            <div className="space-y-3">
                                <Select
                                    value={selectedCenter}
                                    onValueChange={(v) => {
                                        setSelectedCenter(v);
                                        setData('education_center_id', v);
                                        setData('intern_ids', []);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar centro" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="sticky top-0 z-10 bg-popover px-2 pb-2 pt-2">
                                            <Input
                                                value={centerQuery}
                                                onChange={(e) => setCenterQuery(e.target.value)}
                                                placeholder="Buscar centro..."
                                                className="h-8"
                                                onKeyDown={(e) => e.stopPropagation()}
                                                onKeyUp={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {(centers || [])
                                            .filter((c) =>
                                                centerQuery
                                                    ? c.name
                                                          ?.toLowerCase()
                                                          .includes(centerQuery.toLowerCase())
                                                    : true,
                                            )
                                            .map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>

                                {selectedCenter && (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Label>Becarios del centro</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const allIds = interns
                                                        .filter(
                                                            (intern) =>
                                                                String(intern.education_center_id) ===
                                                                String(selectedCenter),
                                                        )
                                                        .map((intern) => intern.id);
                                                    setData('intern_ids', allIds);
                                                }}
                                            >
                                                Seleccionar todos
                                            </Button>
                                        </div>
                                        <ToggleGroup
                                            type="multiple"
                                            className="flex flex-wrap gap-2"
                                            value={data.intern_ids.map((id) => String(id))}
                                            onValueChange={(values) =>
                                                setData(
                                                    'intern_ids',
                                                    values.map((v) => Number(v)),
                                                )
                                            }
                                        >
                                            {interns
                                                .filter(
                                                    (intern) =>
                                                        String(intern.education_center_id) ===
                                                        String(selectedCenter),
                                                )
                                                .map((intern) => (
                                                    <ToggleGroupItem
                                                        key={intern.id}
                                                        value={String(intern.id)}
                                                        className="text-xs"
                                                    >
                                                        {intern.user?.name ||
                                                            `Becario #${intern.id}`}
                                                    </ToggleGroupItem>
                                                ))}
                                        </ToggleGroup>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* INFO UX */}
                        <p className="text-xs text-muted-foreground">
                            {assignmentType === 'user' && `${data.intern_ids.length} becarios seleccionados`}
                            {assignmentType === 'module' && 'Se asignará a todo el módulo'}
                            {assignmentType === 'center' &&
                                (selectedCenter
                                    ? `${data.intern_ids.length} becarios seleccionados`
                                    : 'Selecciona un centro')}
                        </p>

                        {errors.intern_ids && (
                            <p className="text-xs text-red-500">{errors.intern_ids}</p>
                        )}
                        </section>
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
