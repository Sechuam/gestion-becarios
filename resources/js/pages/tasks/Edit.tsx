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
                <div className="mb-4 flex flex-col gap-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Editar <span className="bg-gradient-to-r from-sidebar to-[#1f4f52] bg-clip-text text-transparent">Tarea</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[9px] uppercase tracking-[0.2em]">
                        Actualizando {task.title}
                    </p>
                </div>

                <div className="app-panel rounded-[1.5rem] border-sidebar/20 bg-white shadow-xl dark:bg-slate-900/40 p-4 md:p-6">
                    <form onSubmit={submit} className="space-y-6" noValidate>
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">01</span>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Detalles de la Actividad</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        className="border-border bg-card text-foreground"
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
                                        <SelectTrigger className="border-border bg-card text-foreground">
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
                                    className="min-h-[120px] w-full rounded-2xl border border-sidebar/10 bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none focus-visible:border-sidebar focus-visible:ring-4 focus-visible:ring-sidebar/10 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4 pt-4">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">02</span>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Planificación Temporal</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(v) => setData('status', v)}
                                    >
                                        <SelectTrigger className="border-border bg-card text-foreground">
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
                                        <SelectTrigger className="border-border bg-card text-foreground">
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
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-sidebar/5 pb-4 pt-4">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/10 text-[10px] font-bold text-sidebar">03</span>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Becarios Asignados</h3>
                            </div>
                            <ToggleGroup
                                type="multiple"
                                className="flex flex-wrap justify-start gap-3"
                                value={data.intern_ids.map((id: number) => String(id))}
                            >
                                {interns.map((intern) => (
                                    <ToggleGroupItem
                                        key={intern.id}
                                        value={String(intern.id)}
                                        onClick={() => toggleIntern(intern.id)}
                                        className="h-10 rounded-xl border border-sidebar/10 bg-white dark:bg-slate-900 px-4 text-xs font-bold transition-all data-[state=on]:bg-sidebar data-[state=on]:text-sidebar-foreground shadow-sm"
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

                        <div className="flex justify-end gap-3 border-t border-sidebar/10 pt-8 mt-4">
                            <Button
                                type="button"
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
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
