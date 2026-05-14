import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
            <DialogContent className="sm:max-w-[460px] overflow-hidden rounded-[2.5rem] p-0 border-none bg-white dark:bg-slate-900 shadow-2xl">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                        {event ? 'Editar Evento' : 'Nuevo Evento'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
                    {/* Sección Identificación */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Título del Evento</Label>
                            <Input
                                required
                                placeholder="Ej: Reunión de equipo..."
                                value={data.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:focus:ring-slate-800/30 transition-all"
                            />
                            {errors.title && <p className="text-xs font-bold text-red-500 ml-1">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Descripción / Notas</Label>
                            <Textarea
                                placeholder="Escribe aquí los detalles..."
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                className="rounded-2xl border-slate-200 bg-slate-50/50 px-4 py-3 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:focus:ring-slate-800/30 min-h-[100px] resize-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Sección Temporalidad */}
                    <div className="space-y-4 p-5 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase text-xs">Empieza</Label>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_date', e.target.value)}
                                    className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase text-xs">Termina</Label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_date', e.target.value)}
                                    className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
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
                            <label htmlFor="all_day_toggle" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                                Todo el día
                            </label>
                        </div>

                        {!data.all_day && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1.5">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Hora Inicio</Label>
                                    <Input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_time', e.target.value)}
                                        className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Hora Fin</Label>
                                    <Input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_time', e.target.value)}
                                        className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección Categoría */}
                    <div className="space-y-3">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Color de Etiqueta</Label>
                        <div className="flex flex-wrap gap-3 ml-1">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setData('color', color.value)}
                                    className={`group relative flex h-7 w-7 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
                                        data.color === color.value ? 'ring-2 ring-offset-2 ring-[#1f4f52] dark:ring-offset-slate-900' : 'ring-1 ring-slate-200 dark:ring-slate-700'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                >
                                    {data.color === color.value && (
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {event && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleDelete}
                                className="h-12 w-12 rounded-2xl border-red-100 bg-red-50/50 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:border-red-900/30 dark:bg-red-900/10 transition-all"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 hover:text-slate-600"
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
