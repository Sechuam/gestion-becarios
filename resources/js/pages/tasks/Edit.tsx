import { Head, Link, useForm } from '@inertiajs/react';
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

type Props = {
    task: any;
    practice_types: any[];
    interns: any[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tareas', href: '/tareas' },
    { title: 'Editar tarea', href: '#' },
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

export default function Edit({
    task,
    practice_types = [],
    interns = [],
}: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        practice_type_id: task.practice_type_id
            ? String(task.practice_type_id)
            : '',
        intern_ids: (task.interns || []).map((i: any) => i.id),
    });

    const toggleIntern = (id: number) => {
        setData(
            'intern_ids',
            data.intern_ids.includes(id)
                ? data.intern_ids.filter((i: number) => i !== id)
                : [...data.intern_ids, id],
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/tareas/${task.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar tarea" />

            <div className="page-surface">
                <div className="mb-6">
                    <h1 className="page-title">Editar tarea</h1>
                    <p className="page-subtitle">
                        Actualiza la información de la tarea.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border border-border/60 bg-card/90 p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                className="border-border bg-background text-foreground"
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de práctica</Label>
                            <Select
                                value={data.practice_type_id}
                                onValueChange={(v) =>
                                    setData('practice_type_id', v)
                                }
                            >
                                <SelectTrigger className="border-border bg-background text-foreground">
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
                            {errors.practice_type_id && (
                                <p className="text-xs text-red-500">
                                    {errors.practice_type_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            className="min-h-[120px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                                value={data.status}
                                onValueChange={(v) => setData('status', v)}
                            >
                                <SelectTrigger className="border-border bg-background text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
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
                                <SelectTrigger className="border-border bg-background text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due_date">Fecha de entrega</Label>
                            <DatePicker
                                id="due_date"
                                value={data.due_date}
                                onChange={(value) =>
                                    setData('due_date', value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Becarios asignados</Label>
                        <ToggleGroup
                            type="multiple"
                            className="flex flex-wrap gap-2"
                        >
                            {interns.map((intern) => (
                                <ToggleGroupItem
                                    key={intern.id}
                                    value={String(intern.id)}
                                    onClick={() => toggleIntern(intern.id)}
                                    className="text-xs"
                                >
                                    {intern.user?.name ||
                                        `Becario #${intern.id}`}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        {errors.intern_ids && (
                            <p className="text-xs text-red-500">
                                {errors.intern_ids}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-border text-foreground hover:bg-muted"
                            asChild
                        >
                            <Link href="/tareas">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={processing}
                        >
                            Guardar cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
