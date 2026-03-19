import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    ToggleGroup,
    ToggleGroupItem
} from '@/components/ui/toggle-group';

type Props = {
    practice_types: any[];
    interns: any[];
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

export default function Create({ practice_types = [], interns = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        practice_type_id: '',
        intern_ids: [] as number[],
    });

    const toggleIntern = (id: number) => {
        setData('intern_ids', data.intern_ids.includes(id)
            ? data.intern_ids.filter((i) => i !== id)
            : [...data.intern_ids, id]
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tareas');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva tarea" />

            <div className="p-6 w-full bg-background text-foreground">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Nueva tarea</h1>
                    <p className="text-sm text-muted-foreground">
                        Crea una tarea y asígnala a uno o varios becarios.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="bg-background border-border text-foreground"
                            />
                            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de práctica</Label>
                            <Select
                                value={data.practice_type_id ? String(data.practice_type_id) : ''}
                                onValueChange={(v) => setData('practice_type_id', v)}
                            >
                                <SelectTrigger className="bg-background border-border text-foreground">
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
                            {errors.practice_type_id && <p className="text-red-500 text-xs">{errors.practice_type_id}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-30 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                                value={data.status}
                                onValueChange={(v) => setData('status', v)}
                            >
                                <SelectTrigger className="bg-background border-border text-foreground">
                                    <SelectValue />
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
                                <SelectTrigger className="bg-background border-border text-foreground">
                                    <SelectValue />
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
                            <Label htmlFor="due_date">Fecha de entrega</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Becarios asignados</Label>
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
                        {errors.intern_ids && <p className="text-red-500 text-xs">{errors.intern_ids}</p>}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-6">
                        <Button type="button" variant="outline" className="border-border text-foreground hover:bg-muted" asChild>
                            <Link href="/tareas">Cancelar</Link>
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={processing}>
                            Crear tarea
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
