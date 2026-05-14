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

export function CreateEventModal({ open, onOpenChange, date, event, onCreated, manageableInterns = [] }: CreateEventModalProps) {
    const { auth } = usePage<PageProps>().props;
    const isTutorOrAdmin = auth.user.roles?.some((role: string) => ['admin', 'tutor'].includes(role));

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
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
        const unique = new Set(manageableInterns.map(i => i.education_center).filter(Boolean));
        return Array.from(unique).sort();
    }, [manageableInterns]);

    const modules = React.useMemo(() => {
        const unique = new Set(manageableInterns.map(i => i.module_name).filter(Boolean));
        return Array.from(unique).sort();
    }, [manageableInterns]);

    // Filtrar la lista
    const filteredInterns = React.useMemo(() => {
        return manageableInterns.filter(intern => {
            const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCenter = selectedCenter === 'all' || intern.education_center === selectedCenter;
            const matchesModule = selectedModule === 'all' || intern.module_name === selectedModule;
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
                start_time: event.startStr.includes('T') ? event.startStr.split('T')[1].substring(0, 5) : '09:00',
                end_time: event.endStr?.includes('T') ? event.endStr.split('T')[1].substring(0, 5) : '10:00',
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
        if (event) {
            put(route('calendar-events.update', event.id), {
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
        destroy(route('calendar-events.destroy', event.id), {
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
            <DialogContent className="sm:max-w-[800px] max-h-[720px] overflow-hidden rounded-[2.5rem] p-0 border-none bg-background dark:bg-slate-900 shadow-2xl">
                <style>{`
                    .input-white-bg {
                        background-color: #ffffff !important;
                        color: #1e293b !important;
                    }
                `}</style>
                
                <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                        {event ? 'Editar Evento' : 'Nuevo Evento'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[650px]">
                    <div className="flex flex-1 overflow-hidden">
                        {/* Columna Izquierda: Detalles del Evento (Más ancha) */}
                        <div className="flex-[1.4] p-6 space-y-4 overflow-y-auto custom-scrollbar border-r border-slate-100 dark:border-slate-800">
                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Título del Evento</Label>
                                <Input
                                    required
                                    placeholder="Ej: Reunión de equipo..."
                                    value={data.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                    className="h-10 rounded-2xl border-slate-300 px-4 focus:ring-4 focus:ring-slate-100 text-slate-900 transition-all shadow-sm input-white-bg"
                                />
                                {errors.title && <p className="text-xs font-bold text-red-500 ml-1">{errors.title}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Descripción / Notas</Label>
                                <Textarea
                                    placeholder="Escribe aquí los detalles..."
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                    className="rounded-2xl border-slate-300 px-4 py-3 focus:ring-4 focus:ring-slate-100 text-slate-900 min-h-[60px] resize-none transition-all shadow-sm input-white-bg text-xs"
                                />
                            </div>

                            <div className="space-y-3 p-4 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">Empieza</Label>
                                        <Input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_date', e.target.value)}
                                            style={{ backgroundColor: 'white' }}
                                            className="h-9 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg text-xs px-2"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">Termina</Label>
                                        <Input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_date', e.target.value)}
                                            style={{ backgroundColor: 'white' }}
                                            className="h-9 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg text-xs px-2"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        id="all_day_toggle"
                                        type="checkbox"
                                        checked={data.all_day}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('all_day', e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#1f4f52] focus:ring-[#1f4f52]"
                                    />
                                    <label htmlFor="all_day_toggle" className="text-[10px] font-black uppercase tracking-wider text-slate-600 cursor-pointer select-none">
                                        Todo el día
                                    </label>
                                </div>

                                {!data.all_day && (
                                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1">
                                            <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">Inicio</Label>
                                            <Input
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_time', e.target.value)}
                                                style={{ backgroundColor: 'white' }}
                                                className="h-9 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg text-xs px-2"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="ml-1 text-[9px] font-black tracking-widest text-slate-900 uppercase">Fin</Label>
                                            <Input
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_time', e.target.value)}
                                                style={{ backgroundColor: 'white' }}
                                                className="h-9 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg text-xs px-2"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="ml-1 mb-3 block text-[10px] font-black tracking-widest text-slate-900 uppercase">Color</Label>
                                <div className="flex flex-wrap gap-2 ml-1">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setData('color', color.value)}
                                            className={cn(
                                                "group relative flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95",
                                                data.color === color.value ? "ring-2 ring-offset-2 ring-sidebar" : "ring-1 ring-slate-200 shadow-sm"
                                            )}
                                            style={{ backgroundColor: color.value }}
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
                        <div className="flex-[0.9] bg-slate-50/30 dark:bg-slate-950/20 p-7 flex flex-col overflow-hidden">
                            {isTutorOrAdmin && manageableInterns.length > 0 ? (
                                <div className="flex flex-col h-full space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label className="text-[10px] font-black tracking-widest text-slate-900 uppercase flex items-center gap-2">
                                            <Users className="h-3 w-3" />
                                            Invitar Becarios
                                        </Label>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                                            {data.attendee_ids.length} seleccionados
                                        </span>
                                    </div>

                                    {/* Filtros */}
                                    <div className="space-y-2 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <Input
                                            placeholder="Buscar por nombre..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-8 text-xs rounded-xl border-slate-200"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                className="h-8 px-2 rounded-xl border border-slate-200 bg-white text-[9px] font-bold focus:ring-2 focus:ring-sidebar/20 focus:outline-none"
                                                value={selectedCenter}
                                                onChange={(e) => setSelectedCenter(e.target.value)}
                                            >
                                                <option value="all">Centros</option>
                                                {centers.map(center => (
                                                    <option key={center} value={center}>{center}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="h-8 px-2 rounded-xl border border-slate-200 bg-white text-[9px] font-bold focus:ring-2 focus:ring-sidebar/20 focus:outline-none"
                                                value={selectedModule}
                                                onChange={(e) => setSelectedModule(e.target.value)}
                                            >
                                                <option value="all">Módulos</option>
                                                {modules.map(mod => (
                                                    <option key={mod} value={mod}>{mod}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Lista */}
                                    <div className="flex-1 flex flex-col justify-start gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredInterns.length > 0 ? (
                                            filteredInterns.map((intern) => (
                                                <button
                                                    key={intern.id}
                                                    type="button"
                                                    onClick={() => toggleAttendee(intern.user_id)}
                                                    className={cn(
                                                        "flex items-center justify-between rounded-xl border p-2.5 transition-all text-left w-full",
                                                        data.attendee_ids.includes(intern.user_id)
                                                            ? "border-sidebar bg-sidebar/5 ring-1 ring-sidebar shadow-sm"
                                                            : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                                                            {intern.name.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-black text-slate-800 leading-none truncate">{intern.name}</p>
                                                            <p className="text-[9px] text-slate-400 mt-1 truncate">
                                                                {intern.education_center}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {data.attendee_ids.includes(intern.user_id) && (
                                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar text-white">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                                <Users className="h-8 w-8 text-slate-200 mb-2" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center opacity-50">
                                    <div className="space-y-2">
                                        <Users className="h-10 w-10 mx-auto text-slate-300" />
                                        <p className="text-xs font-bold text-slate-400">Selección de invitados no disponible</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botonera Inferior */}
                    <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
                        {event && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDelete}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 rounded-2xl border-slate-200 text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-[2] h-12 rounded-2xl bg-[#1f4f52] text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-xl shadow-[#1f4f52]/20 hover:shadow-[#1f4f52]/30 active:scale-[0.98] transition-all"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : (event ? 'Guardar Cambios' : 'Crear Evento')}
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
