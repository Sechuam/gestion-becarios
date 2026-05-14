import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';
import { Check, Loader2, Trash2, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

interface CreateEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string;
    event?: any;
    onCreated?: () => void;
    manageableInterns?: any[];
}

const COLORS = [
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Esmeralda', value: '#10b981' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Ámbar', value: '#f59e0b' },
    { name: 'Violeta', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Pizarra', value: '#475569' },
];

export function CreateEventModal({
    open,
    onOpenChange,
    date,
    event,
    onCreated,
    manageableInterns = [],
}: CreateEventModalProps) {
    const { auth } = usePage<PageProps>().props;
    const isTutorOrAdmin = auth.user.roles?.some((role: string) =>
        ['admin', 'tutor'].includes(role),
    );

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        start_time: '09:00',
        end_time: '10:00',
        all_day: false,
        color: COLORS[0].value,
        attendee_ids: [] as number[],
    });

    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCenter, setSelectedCenter] = React.useState('all');
    const [selectedModule, setSelectedModule] = React.useState('all');

    // Extraer opciones únicas para los filtros
    const centers = React.useMemo(() => {
        const unique = new Set(
            manageableInterns.map((i) => i.education_center).filter(Boolean),
        );
        return Array.from(unique).sort();
    }, [manageableInterns]);

    const modules = React.useMemo(() => {
        const unique = new Set(
            manageableInterns.map((i) => i.module_name).filter(Boolean),
        );
        return Array.from(unique).sort();
    }, [manageableInterns]);

    // Filtrar la lista
    const filteredInterns = React.useMemo(() => {
        return manageableInterns.filter((intern) => {
            const matchesSearch = intern.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesCenter =
                selectedCenter === 'all' ||
                intern.education_center === selectedCenter;
            const matchesModule =
                selectedModule === 'all' ||
                intern.module_name === selectedModule;
            return matchesSearch && matchesCenter && matchesModule;
        });
    }, [manageableInterns, searchTerm, selectedCenter, selectedModule]);

    useEffect(() => {
        if (event) {
            setData({
                title: event.title || '',
                description: event.extendedProps?.description || '',
                start_date: event.startStr.split('T')[0],
                end_date: (event.endStr || event.startStr).split('T')[0],
                start_time: event.startStr.includes('T')
                    ? event.startStr.split('T')[1].substring(0, 5)
                    : '09:00',
                end_time: event.endStr?.includes('T')
                    ? event.endStr.split('T')[1].substring(0, 5)
                    : '10:00',
                all_day: event.allDay,
                color: event.backgroundColor || COLORS[0].value,
                attendee_ids: event.extendedProps?.attendee_ids || [],
            });
        } else {
            reset();
            setData('start_date', date);
            setData('end_date', date);
            // Resetear filtros al abrir para nuevo evento
            setSearchTerm('');
            setSelectedCenter('all');
            setSelectedModule('all');
        }
    }, [event, date, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const eventId = event?.extendedProps?.calendarEventId ?? event?.id;

        if (event) {
            put(route('calendar-events.update', eventId), {
                onSuccess: () => {
                    onOpenChange(false);
                    if (onCreated) onCreated();
                },
            });
        } else {
            post(route('calendar-events.store'), {
                onSuccess: () => {
                    onOpenChange(false);
                    if (onCreated) onCreated();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!event) return;

        const eventId = event.extendedProps?.calendarEventId ?? event.id;

        destroy(route('calendar-events.destroy', eventId), {
            onSuccess: () => {
                onOpenChange(false);
                if (onCreated) onCreated();
            },
        });
    };

    const toggleAttendee = (userId: number) => {
        const current = [...data.attendee_ids];
        const index = current.indexOf(userId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(userId);
        }
        setData('attendee_ids', current);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[720px] overflow-hidden rounded-[2.5rem] border-none bg-background p-0 shadow-2xl sm:max-w-[800px] dark:bg-slate-900">
                <style>{`
                    .input-white-bg {
                        background-color: #ffffff !important;
                        color: #1e293b !important;
                    }
                `}</style>

                <DialogHeader className="border-b border-slate-100 p-6 pb-4 dark:border-slate-800">
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                        {event ? 'Editar Evento' : 'Nuevo Evento'}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="flex h-full max-h-[650px] flex-col"
                >
                    <div className="flex flex-1 overflow-hidden">
                        {/* Columna Izquierda: Detalles del Evento (Más ancha) */}
                        <div className="custom-scrollbar flex-[1.4] space-y-4 overflow-y-auto border-r border-slate-100 p-6 dark:border-slate-800">
                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                                    Título del Evento
                                </Label>
                                <Input
                                    required
                                    placeholder="Ej: Reunión de equipo..."
                                    value={data.title}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('title', e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                    className="input-white-bg h-10 rounded-2xl border-slate-300 px-4 text-slate-900 shadow-sm transition-all focus:ring-4 focus:ring-slate-100"
                                />
                                {errors.title && (
                                    <p className="ml-1 text-xs font-bold text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                                    Descripción / Notas
                                </Label>
                                <Textarea
                                    placeholder="Escribe aquí los detalles..."
                                    value={data.description}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('description', e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                    className="input-white-bg min-h-[60px] resize-none rounded-2xl border-slate-300 px-4 py-3 text-xs text-slate-900 shadow-sm transition-all focus:ring-4 focus:ring-slate-100"
                                />
                            </div>

                            <div className="space-y-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">
                                            Empieza
                                        </Label>
                                        <Input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                setData(
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                            style={{ backgroundColor: 'white' }}
                                            className="input-white-bg h-9 rounded-xl border-slate-300 px-2 text-xs text-slate-900 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">
                                            Termina
                                        </Label>
                                        <Input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                setData(
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                            style={{ backgroundColor: 'white' }}
                                            className="input-white-bg h-9 rounded-xl border-slate-300 px-2 text-xs text-slate-900 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        id="all_day_toggle"
                                        type="checkbox"
                                        checked={data.all_day}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData('all_day', e.target.checked)
                                        }
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#1f4f52] focus:ring-[#1f4f52]"
                                    />
                                    <label
                                        htmlFor="all_day_toggle"
                                        className="cursor-pointer text-[10px] font-black tracking-wider text-slate-600 uppercase select-none"
                                    >
                                        Todo el día
                                    </label>
                                </div>

                                {!data.all_day && (
                                    <div className="grid animate-in grid-cols-2 gap-3 duration-200 fade-in slide-in-from-top-1">
                                        <div className="space-y-1">
                                            <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">
                                                Inicio
                                            </Label>
                                            <Input
                                                type="time"
                                                value={data.start_time}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                    setData(
                                                        'start_time',
                                                        e.target.value,
                                                    )
                                                }
                                                style={{
                                                    backgroundColor: 'white',
                                                }}
                                                className="input-white-bg h-9 rounded-xl border-slate-300 px-2 text-xs text-slate-900 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">
                                                Fin
                                            </Label>
                                            <Input
                                                type="time"
                                                value={data.end_time}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                    setData(
                                                        'end_time',
                                                        e.target.value,
                                                    )
                                                }
                                                style={{
                                                    backgroundColor: 'white',
                                                }}
                                                className="input-white-bg h-9 rounded-xl border-slate-300 px-2 text-xs text-slate-900 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="mb-3 ml-1 block text-[10px] font-black tracking-widest text-slate-900 uppercase">
                                    Color
                                </Label>
                                <div className="ml-1 flex flex-wrap gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() =>
                                                setData('color', color.value)
                                            }
                                            className={cn(
                                                'group relative flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95',
                                                data.color === color.value
                                                    ? 'ring-2 ring-sidebar ring-offset-2'
                                                    : 'shadow-sm ring-1 ring-slate-200',
                                            )}
                                            style={{
                                                backgroundColor: color.value,
                                            }}
                                        >
                                            {data.color === color.value && (
                                                <Check className="h-3 w-3 text-white" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Invitados (Más estrecha) */}
                        <div className="flex flex-[0.9] flex-col overflow-hidden bg-slate-50/30 p-7 dark:bg-slate-950/20">
                            {isTutorOrAdmin && manageableInterns.length > 0 ? (
                                <div className="flex h-full flex-col space-y-4">
                                    <div className="ml-1 flex items-center justify-between">
                                        <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                                            <Users className="h-3 w-3" />
                                            Invitar Becarios
                                        </Label>
                                        <span className="rounded-full border border-slate-100 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 shadow-sm">
                                            {data.attendee_ids.length}{' '}
                                            seleccionados
                                        </span>
                                    </div>

                                    {/* Filtros */}
                                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800">
                                        <Input
                                            placeholder="Buscar por nombre..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="h-8 rounded-xl border-slate-200 text-xs"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-[9px] font-bold focus:ring-2 focus:ring-sidebar/20 focus:outline-none"
                                                value={selectedCenter}
                                                onChange={(e) =>
                                                    setSelectedCenter(
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    Centros
                                                </option>
                                                {centers.map((center) => (
                                                    <option
                                                        key={center}
                                                        value={center}
                                                    >
                                                        {center}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-[9px] font-bold focus:ring-2 focus:ring-sidebar/20 focus:outline-none"
                                                value={selectedModule}
                                                onChange={(e) =>
                                                    setSelectedModule(
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    Módulos
                                                </option>
                                                {modules.map((mod) => (
                                                    <option
                                                        key={mod}
                                                        value={mod}
                                                    >
                                                        {mod}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Lista */}
                                    <div className="custom-scrollbar flex flex-1 flex-col justify-start gap-2 overflow-y-auto pr-2">
                                        {filteredInterns.length > 0 ? (
                                            filteredInterns.map((intern) => (
                                                <button
                                                    key={intern.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleAttendee(
                                                            intern.user_id,
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all',
                                                        data.attendee_ids.includes(
                                                            intern.user_id,
                                                        )
                                                            ? 'border-sidebar bg-sidebar/5 shadow-sm ring-1 ring-sidebar'
                                                            : 'border-slate-100 bg-white shadow-sm hover:border-slate-200',
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                                                            {intern.name.charAt(
                                                                0,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-[11px] leading-none font-black text-slate-800">
                                                                {intern.name}
                                                            </p>
                                                            <p className="mt-1 truncate text-[9px] text-slate-400">
                                                                {
                                                                    intern.education_center
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {data.attendee_ids.includes(
                                                        intern.user_id,
                                                    ) && (
                                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar text-white">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="flex h-32 flex-col items-center justify-center text-center">
                                                <Users className="mb-2 h-8 w-8 text-slate-200" />
                                                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Sin resultados
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center opacity-50">
                                    <div className="space-y-2">
                                        <Users className="mx-auto h-10 w-10 text-slate-300" />
                                        <p className="text-xs font-bold text-slate-400">
                                            Selección de invitados no disponible
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botonera Inferior */}
                    <div className="flex items-center gap-3 border-t border-slate-100 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                        {event && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDelete}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl border-red-100 bg-red-50 text-red-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-12 flex-1 rounded-2xl border-slate-200 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase shadow-sm transition-all hover:bg-slate-50 hover:text-slate-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-12 flex-[2] rounded-2xl bg-[#1f4f52] text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-[#1f4f52]/20 transition-all hover:shadow-[#1f4f52]/30 active:scale-[0.98]"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : event ? (
                                'Guardar Cambios'
                            ) : (
                                'Crear Evento'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function route(name: string, id?: number) {
    if (name === 'calendar-events.store') return '/calendar-events';
    if (name === 'calendar-events.update') return `/calendar-events/${id}`;
    if (name === 'calendar-events.destroy') return `/calendar-events/${id}`;
    return '';
}
