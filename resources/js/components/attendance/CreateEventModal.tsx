import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';
import { useForm } from '@inertiajs/react';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

interface CreateEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string;
    event?: any;
    onSuccess?: () => void;
}

const COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Slate', value: '#475569' },
];

export function CreateEventModal({ open, onOpenChange, date, event, onSuccess }: CreateEventModalProps) {
    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        title: '',
        description: '',
        start_date: date,
        end_date: date,
        start_time: '09:00',
        end_time: '10:00',
        all_day: true,
        color: '#3b82f6',
    });

    useEffect(() => {
        if (open) {
            if (event) {
                const start = event.start ? new Date(event.start) : new Date();
                const end = event.end ? new Date(event.end) : start;
                
                setData({
                    title: event.title || '',
                    description: event.extendedProps?.description || '',
                    start_date: start.toISOString().split('T')[0],
                    end_date: end.toISOString().split('T')[0],
                    start_time: start.toTimeString().slice(0, 5),
                    end_time: end.toTimeString().slice(0, 5),
                    all_day: event.allDay ?? true,
                    color: event.backgroundColor || '#3b82f6',
                });
            } else {
                reset();
                setData('start_date', date);
                setData('end_date', date);
                setData('all_day', true);
            }
        }
    }, [open, event, date]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                onOpenChange(false);
                if (onSuccess) onSuccess();
            },
        };

        if (event) {
            patch(`/calendar-events/${event.id.replace('evt_', '')}`, options);
        } else {
            post('/calendar-events', options);
        }
    };

    const handleDelete = () => {
        if (!event) return;
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            destroy(`/calendar-events/${event.id.replace('evt_', '')}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    if (onSuccess) onSuccess();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] overflow-hidden rounded-3xl p-0 border-none bg-white dark:bg-slate-900 shadow-2xl">
                <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                        {event ? 'Editar Evento' : 'Nuevo Evento / Tarea'}
                    </DialogTitle>
                    {event && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
                    <div className="space-y-2">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">Título</Label>
                        <Input
                            required
                            placeholder="Ej: Preparar presentación, Tutoría..."
                            value={data.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                            className="h-11 rounded-2xl border-sidebar/20 bg-slate-50 dark:bg-slate-800/50"
                        />
                        {errors.title && <p className="text-xs font-bold text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">Descripción</Label>
                        <Textarea
                            placeholder="Detalles opcionales..."
                            value={data.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                            className="rounded-2xl border-sidebar/20 bg-slate-50 dark:bg-slate-800/50 min-h-[80px]"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <input
                                type="checkbox"
                                checked={data.all_day}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('all_day', e.target.checked)}
                                className="rounded border-sidebar/20 text-sidebar focus:ring-sidebar"
                            />
                            Todo el día
                        </label>
                    </div>

                    {!data.all_day && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">Inicio</Label>
                                <Input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_time', e.target.value)}
                                    className="h-11 rounded-2xl border-sidebar/20 bg-slate-50 dark:bg-slate-800/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">Fin</Label>
                                <Input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_time', e.target.value)}
                                    className="h-11 rounded-2xl border-sidebar/20 bg-slate-50 dark:bg-slate-800/50"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">Color</Label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setData('color', color.value)}
                                    className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-90"
                                    style={{ backgroundColor: color.value }}
                                >
                                    {data.color === color.value && (
                                        <Check className="h-4 w-4 text-white" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11 rounded-2xl text-xs font-black tracking-widest uppercase"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] text-xs font-black tracking-widest uppercase text-white shadow-lg"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : (event ? 'Actualizar' : 'Guardar Evento')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
