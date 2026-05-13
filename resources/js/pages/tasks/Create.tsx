import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import {
    TaskFormActions,
    TaskFormShell,
    TaskFormTabs,
    TaskPlanningFields,
} from '@/components/tasks/TaskFormSections';
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

export default function Create({
    practice_types = [],
    interns = [],
    centers = [],
}: Props) {
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

    const [assignmentType, setAssignmentType] = useState<
        'user' | 'module' | 'center'
    >('user');
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [selectedCenter, setSelectedCenter] = useState<string>('');
    const [centerQuery, setCenterQuery] = useState<string>('');
    const [internQuery, setInternQuery] = useState<string>('');

    const assignableInterns = (
        assignmentType === 'user'
            ? interns
            : interns.filter(
                  (intern) =>
                      String(intern.education_center_id) ===
                      String(selectedCenter),
              )
    ).filter((intern) => {
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

            <TaskFormShell
                titlePrefix="Nueva"
                titleAccent="Tarea"
                subtitle="Planificación y asignación de actividades"
            >
                <form onSubmit={submit} className="space-y-6" noValidate>
                    <TaskFormTabs
                        infoLabel="Información"
                        info={
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Título</Label>
                                        <Input
                                            className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
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
                                            value={
                                                data.practice_type_id
                                                    ? String(
                                                          data.practice_type_id,
                                                      )
                                                    : ''
                                            }
                                            onValueChange={(v) =>
                                                setData('practice_type_id', v)
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
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className="min-h-28 w-full rounded-xl border border-sidebar/10 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sidebar/20 focus:outline-none"
                                    />
                                </div>
                            </>
                        }
                        planning={
                            <TaskPlanningFields
                                status={data.status}
                                priority={data.priority}
                                dueDate={data.due_date}
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
                        assignment={
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Modelo de Asignación</Label>
                                        <Select
                                            value={assignmentType}
                                            onValueChange={(v) => {
                                                setAssignmentType(v as any);
                                                setData('assignment_type', v);
                                                setInternQuery('');
                                            }}
                                        >
                                            <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                <SelectValue placeholder="Selecciona un modo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">
                                                    Por becario
                                                </SelectItem>
                                                <SelectItem value="module">
                                                    Por módulo
                                                </SelectItem>
                                                <SelectItem value="center">
                                                    Por centro
                                                </SelectItem>
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
                                                    <SelectItem value="daw">
                                                        DAW
                                                    </SelectItem>
                                                    <SelectItem value="dam">
                                                        DAM
                                                    </SelectItem>
                                                    <SelectItem value="asir">
                                                        ASIR
                                                    </SelectItem>
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
                                                    setData(
                                                        'education_center_id',
                                                        v,
                                                    );
                                                    setData('intern_ids', []);
                                                    setInternQuery('');
                                                }}
                                            >
                                                <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                                                    <SelectValue placeholder="Seleccionar centro" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <div className="sticky top-0 z-10 bg-popover px-2 pt-2 pb-2">
                                                        <Input
                                                            value={centerQuery}
                                                            onChange={(e) =>
                                                                setCenterQuery(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Buscar centro..."
                                                            className="h-8 text-xs"
                                                            onKeyDown={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        />
                                                    </div>
                                                    {(centers || [])
                                                        .filter((c) =>
                                                            centerQuery
                                                                ? c.name
                                                                      ?.toLowerCase()
                                                                      .includes(
                                                                          centerQuery.toLowerCase(),
                                                                      )
                                                                : true,
                                                        )
                                                        .map((c) => (
                                                            <SelectItem
                                                                key={c.id}
                                                                value={String(
                                                                    c.id,
                                                                )}
                                                            >
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {(assignmentType === 'user' ||
                                        (assignmentType === 'center' &&
                                            selectedCenter)) && (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                                    {assignmentType === 'user'
                                                        ? 'Becarios Disponibles'
                                                        : 'Becarios del centro'}
                                                </Label>
                                                {assignmentType ===
                                                    'center' && (
                                                    <Button
                                                        type="button"
                                                        variant="link"
                                                        className="h-auto p-0 text-[10px] font-bold text-sidebar"
                                                        onClick={() => {
                                                            const allIds =
                                                                interns
                                                                    .filter(
                                                                        (
                                                                            intern,
                                                                        ) =>
                                                                            String(
                                                                                intern.education_center_id,
                                                                            ) ===
                                                                            String(
                                                                                selectedCenter,
                                                                            ),
                                                                    )
                                                                    .map(
                                                                        (
                                                                            intern,
                                                                        ) =>
                                                                            intern.id,
                                                                    );
                                                            setData(
                                                                'intern_ids',
                                                                allIds,
                                                            );
                                                        }}
                                                    >
                                                        Seleccionar todos
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                value={internQuery}
                                                onChange={(event) =>
                                                    setInternQuery(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Buscar becario..."
                                                className="h-8 border-sidebar/10 bg-white text-xs shadow-sm focus-visible:ring-sidebar/20"
                                            />
                                            <ToggleGroup
                                                type="multiple"
                                                className="flex flex-wrap justify-start gap-2"
                                                value={data.intern_ids.map(
                                                    (id) => String(id),
                                                )}
                                                onValueChange={(values) =>
                                                    setData(
                                                        'intern_ids',
                                                        values.map((v) =>
                                                            Number(v),
                                                        ),
                                                    )
                                                }
                                            >
                                                {assignableInterns.map(
                                                    (intern) => (
                                                        <ToggleGroupItem
                                                            key={intern.id}
                                                            value={String(
                                                                intern.id,
                                                            )}
                                                            className="h-8 rounded-lg border border-sidebar/10 bg-white px-3 text-[10px] font-bold shadow-sm transition-all data-[state=on]:bg-sidebar data-[state=on]:text-sidebar-foreground"
                                                        >
                                                            {intern.user
                                                                ?.name ||
                                                                `Becario #${intern.id}`}
                                                        </ToggleGroupItem>
                                                    ),
                                                )}
                                            </ToggleGroup>
                                            {assignableInterns.length === 0 && (
                                                <p className="rounded-lg border border-dashed border-sidebar/20 bg-white/60 p-3 text-xs text-slate-500">
                                                    No hay becarios que
                                                    coincidan con la búsqueda.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <p className="mt-2 text-[10px] font-medium text-muted-foreground italic">
                                        {assignmentType === 'user' &&
                                            `${data.intern_ids.length} becarios seleccionados`}
                                        {assignmentType === 'module' &&
                                            'Se asignará a todo el módulo'}
                                        {assignmentType === 'center' &&
                                            (selectedCenter
                                                ? `${data.intern_ids.length} becarios seleccionados`
                                                : 'Selecciona un centro')}
                                    </p>

                                    {errors.intern_ids && (
                                        <p className="text-xs text-red-500">
                                            {errors.intern_ids}
                                        </p>
                                    )}
                                </div>
                            </div>
                        }
                    />

                    <TaskFormActions
                        submitLabel="Crear Tarea"
                        processingLabel="Creando..."
                        processing={processing}
                    />
                </form>
            </TaskFormShell>
        </AppLayout>
    );
}
