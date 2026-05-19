import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import type { PageProps } from '@/types';
import { EventAttendeesPanel } from './EventAttendeesPanel';
import { EventDetailsFields } from './EventDetailsFields';
import type { ManageableIntern } from './types';

interface CreateEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string;
    event?: any;
    onCreated?: () => void;
    manageableInterns?: ManageableIntern[];
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
            <DialogContent className="max-h-[720px] overflow-hidden rounded-xl border-none bg-background p-0 shadow-xl sm:max-w-[800px] dark:bg-slate-900">
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
                        <EventDetailsFields
                            data={data}
                            errors={errors}
                            colors={COLORS}
                            setData={setData}
                        />

                        {/* Columna Derecha: Invitados (Más estrecha) */}
                        <div className="flex flex-[0.9] flex-col overflow-hidden bg-slate-50/30 p-7 dark:bg-slate-950/20">
                            <EventAttendeesPanel
                                available={
                                    Boolean(isTutorOrAdmin) &&
                                    manageableInterns.length > 0
                                }
                                manageableInterns={manageableInterns}
                                selectedAttendeeIds={data.attendee_ids}
                                onToggleAttendee={toggleAttendee}
                            />
                        </div>
                    </div>

                    {/* Botonera Inferior */}
                    <div className="flex items-center gap-3 border-t border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        {event && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDelete}
                                className="flex h-10 w-12 items-center justify-center rounded-xl border-red-100 bg-red-50 text-red-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-10 flex-1 rounded-xl border-slate-200 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase shadow-sm transition-all hover:bg-slate-50 hover:text-slate-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-10 flex-[2] rounded-xl bg-[#1f4f52] text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-[#1f4f52]/20 transition-all hover:shadow-[#1f4f52]/30 active:scale-[0.98]"
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
