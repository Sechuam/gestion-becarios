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
    const isTutorOrAdmin = auth.user.roles?.some(role => ['admin', 'tutor'].includes(role));

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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none bg-background dark:bg-slate-900 shadow-2xl custom-scrollbar">
                <style>{`
                    .input-white-bg {
                        background-color: #ffffff !important;
                        color: #1e293b !important;
                    }
                `}</style>
                
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {event ? 'Editar Evento' : 'Nuevo Evento'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
                    {/* Sección Identificación */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Título del Evento</Label>
                            <Input
                                required
                                placeholder="Ej: Reunión de equipo..."
                                value={data.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                style={{ backgroundColor: 'white' }}
                                className="h-12 rounded-2xl border-slate-300 px-4 focus:ring-4 focus:ring-slate-100 text-slate-900 transition-all shadow-sm input-white-bg"
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
                                className="rounded-2xl border-slate-300 px-4 py-3 focus:ring-4 focus:ring-slate-100 text-slate-900 min-h-[100px] resize-none transition-all shadow-sm input-white-bg"
                            />
                        </div>
                    </div>

                    {/* Sección Temporalidad */}
                    <div className="space-y-4 p-5 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase text-xs">Empieza</Label>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_date', e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                    className="h-11 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase text-xs">Termina</Label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_date', e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                    className="h-11 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="all_day_toggle"
                                type="checkbox"
                                checked={data.all_day}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('all_day', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-[#1f4f52] focus:ring-[#1f4f52]"
                            />
                            <label htmlFor="all_day_toggle" className="text-xs font-bold text-slate-900 cursor-pointer select-none">
                                Todo el día
                            </label>
                        </div>

                        {!data.all_day && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1.5">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Hora Inicio</Label>
                                    <Input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_time', e.target.value)}
                                        style={{ backgroundColor: 'white' }}
                                        className="h-11 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Hora Fin</Label>
                                    <Input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_time', e.target.value)}
                                        style={{ backgroundColor: 'white' }}
                                        className="h-11 rounded-xl border-slate-300 text-slate-900 shadow-sm input-white-bg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección Invitados (Solo Tutores/Admin) */}
                    {isTutorOrAdmin && manageableInterns.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <Label className="text-[10px] font-black tracking-widest text-slate-900 uppercase flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    Invitar Becarios
                                </Label>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {data.attendee_ids.length} seleccionados
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                                {manageableInterns.map((intern) => (
                                    <button
                                        key={intern.id}
                                        type="button"
                                        onClick={() => toggleAttendee(intern.user_id)}
                                        className={cn(
                                            "flex items-center justify-between rounded-xl border p-3 transition-all",
                                            data.attendee_ids.includes(intern.user_id)
                                                ? "border-sidebar bg-sidebar/5 ring-1 ring-sidebar"
                                                : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                                                {intern.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-800">{intern.name}</span>
                                        </div>
                                        {data.attendee_ids.includes(intern.user_id) && (
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sidebar text-white">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sección Categoría */}
                    <div className="space-y-3">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Color de Etiqueta</Label>
                        <div className="flex flex-wrap gap-3 ml-1">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setData('color', color.value)}
                                    className={cn(
                                        "group relative flex h-7 w-7 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95",
                                        data.color === color.value ? "ring-2 ring-offset-2 ring-sidebar" : "ring-1 ring-slate-200 shadow-sm"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                >
                                    {data.color === color.value && (
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
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
                            className="flex-[2.5] h-12 rounded-2xl bg-[#1f4f52] text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-xl shadow-[#1f4f52]/20 hover:shadow-[#1f4f52]/30 active:scale-[0.98] transition-all"
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
