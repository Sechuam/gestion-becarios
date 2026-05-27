import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    TaskFormActions,
    TaskFormShell,
    TaskFormTabs,
    TaskPlanningFields,
} from '@/components/tasks/TaskFormSections';
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
        intern_ids: (task.interns || []).map((intern: any) => intern.id),
    });
    const [internQuery, setInternQuery] = useState('');

    const filteredInterns = interns.filter((intern) => {
        const query = internQuery.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (intern.user?.name || `Becario #${intern.id}`)
            .toLowerCase()
            .includes(query);
    });

    const toggleIntern = (id: number) => {
        setData(
            'intern_ids',
            data.intern_ids.includes(id)
                ? data.intern_ids.filter((internId: number) => internId !== id)
                : [...data.intern_ids, id],
        );
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        patch(`/tareas/${task.id}`);
    };

    const infoContent = (
        <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(event) =>
                            setData('title', event.target.value)
                        }
                        className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                    />
                    {errors.title && (
                        <p className="text-xs text-red-500">{errors.title}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Tipo de práctica</Label>
                    <Select
                        value={data.practice_type_id}
                        onValueChange={(value) =>
                            setData('practice_type_id', value)
                        }
                    >
                        <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
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
                    onChange={(event) =>
                        setData('description', event.target.value)
                    }
                    className="min-h-[120px] w-full rounded-xl border border-sidebar/10 bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all outline-none focus-visible:border-sidebar focus-visible:ring-4 focus-visible:ring-sidebar/10"
                />
            </div>
        </>
    );

    const assignmentContent = (
        <div className="space-y-4">
            <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Becarios Asignados
            </Label>
            <Input
                value={internQuery}
                onChange={(event) => setInternQuery(event.target.value)}
                placeholder="Buscar becario..."
                className="h-8 border-sidebar/10 bg-white text-xs shadow-sm focus-visible:ring-sidebar/20"
            />
            <ToggleGroup
                type="multiple"
                className="flex flex-wrap justify-start gap-2"
                value={data.intern_ids.map((id: number) => String(id))}
            >
                {filteredInterns.map((intern) => (
                    <ToggleGroupItem
                        key={intern.id}
                        value={String(intern.id)}
                        onClick={() => toggleIntern(intern.id)}
                        className="h-9 rounded-xl border border-sidebar/10 bg-white px-4 text-xs font-bold shadow-sm transition-all data-[state=on]:border-slate-400 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-800 dark:bg-slate-900 dark:data-[state=on]:border-slate-600 dark:data-[state=on]:bg-slate-700 dark:data-[state=on]:text-white"
                    >
                        {intern.user?.name || `Becario #${intern.id}`}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            {filteredInterns.length === 0 && (
                <p className="rounded-lg border border-dashed border-sidebar/20 bg-white/60 p-3 text-xs text-slate-500">
                    No hay becarios que coincidan con la búsqueda.
                </p>
            )}
            {errors.intern_ids && (
                <p className="text-xs text-red-500">{errors.intern_ids}</p>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar tarea" />

            <TaskFormShell
                titlePrefix="Editar"
                titleAccent="Tarea"
                subtitle={`Actualizando: ${task.title}`}
            >
                <form onSubmit={submit} className="space-y-6" noValidate>
                    <TaskFormTabs
                        infoLabel="Información General"
                        info={infoContent}
                        planning={
                            <TaskPlanningFields
                                status={data.status}
                                priority={data.priority}
                                dueDate={data.due_date}
                                dueDateId="due_date"
                                onStatusChange={(value) =>
                                    setData('status', value)
                                }
                                onPriorityChange={(value) =>
                                    setData('priority', value)
                                }
                                onDueDateChange={(value) =>
                                    setData('due_date', value)
                                }
                            />
                        }
                        assignment={assignmentContent}
                    />

                    <TaskFormActions
                        submitLabel="Guardar cambios"
                        processingLabel="Guardando..."
                        processing={processing}
                    />
                </form>
            </TaskFormShell>
        </AppLayout>
    );
}
