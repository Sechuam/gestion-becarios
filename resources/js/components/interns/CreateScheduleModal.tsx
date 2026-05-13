import { useState, type FormEvent } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';

type ScheduleItem = {
    id: number;
    name: string;
    start_date: string;
    end_date: string | null;
    monday_hours: number | string;
    tuesday_hours: number | string;
    wednesday_hours: number | string;
    thursday_hours: number | string;
    friday_hours: number | string;
    saturday_hours: number | string;
    sunday_hours: number | string;
    monday_entry_time: string | null;
    monday_exit_time: string | null;
    tuesday_entry_time: string | null;
    tuesday_exit_time: string | null;
    wednesday_entry_time: string | null;
    wednesday_exit_time: string | null;
    thursday_entry_time: string | null;
    thursday_exit_time: string | null;
    friday_entry_time: string | null;
    friday_exit_time: string | null;
    saturday_entry_time: string | null;
    saturday_exit_time: string | null;
    sunday_entry_time: string | null;
    sunday_exit_time: string | null;

};

type CreateScheduleModalProps = {
    userId: number;
    schedule?: ScheduleItem;
    createButtonClassName?: string;
};

const defaultScheduleData = (userId: number) => ({
    user_id: userId,
    name: 'Horario de Invierno',
    start_date: '',
    end_date: '',
    monday_hours: '0',
    tuesday_hours: '0',
    wednesday_hours: '0',
    thursday_hours: '0',
    friday_hours: '0',
    saturday_hours: '0',
    sunday_hours: '0',
    monday_entry_time: '',
    monday_exit_time: '',
    tuesday_entry_time: '',
    tuesday_exit_time: '',
    wednesday_entry_time: '',
    wednesday_exit_time: '',
    thursday_entry_time: '',
    thursday_exit_time: '',
    friday_entry_time: '',
    friday_exit_time: '',
    saturday_entry_time: '',
    saturday_exit_time: '',
    sunday_entry_time: '',
    sunday_exit_time: '',
});

const buildScheduleData = (userId: number, schedule?: ScheduleItem) => {
    if (!schedule) {
        return defaultScheduleData(userId);
    }

    return {
        user_id: userId,
        name: schedule.name,
        start_date: schedule.start_date,
        end_date: schedule.end_date ?? '',
        monday_hours: String(schedule.monday_hours ?? '0'),
        tuesday_hours: String(schedule.tuesday_hours ?? '0'),
        wednesday_hours: String(schedule.wednesday_hours ?? '0'),
        thursday_hours: String(schedule.thursday_hours ?? '0'),
        friday_hours: String(schedule.friday_hours ?? '0'),
        saturday_hours: String(schedule.saturday_hours ?? '0'),
        sunday_hours: String(schedule.sunday_hours ?? '0'),
        monday_entry_time: schedule.monday_entry_time ?? '',
        monday_exit_time: schedule.monday_exit_time ?? '',
        tuesday_entry_time: schedule.tuesday_entry_time ?? '',
        tuesday_exit_time: schedule.tuesday_exit_time ?? '',
        wednesday_entry_time: schedule.wednesday_entry_time ?? '',
        wednesday_exit_time: schedule.wednesday_exit_time ?? '',
        thursday_entry_time: schedule.thursday_entry_time ?? '',
        thursday_exit_time: schedule.thursday_exit_time ?? '',
        friday_entry_time: schedule.friday_entry_time ?? '',
        friday_exit_time: schedule.friday_exit_time ?? '',
        saturday_entry_time: schedule.saturday_entry_time ?? '',
        saturday_exit_time: schedule.saturday_exit_time ?? '',
        sunday_entry_time: schedule.sunday_entry_time ?? '',
        sunday_exit_time: schedule.sunday_exit_time ?? '',
    };
};

export function CreateScheduleModal({ userId, schedule, createButtonClassName }: CreateScheduleModalProps) {
    const [open, setOpen] = useState(false);
    const isEditing = Boolean(schedule);

    const applyPreset = (preset: 'winter' | 'summer' | 'intensive') => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let baseData = { ...data };

        if (preset === 'winter') {
            baseData = {
                ...baseData,
                name: 'Horario de Invierno',
                monday_hours: '8', tuesday_hours: '8', wednesday_hours: '8', thursday_hours: '8', friday_hours: '6',
                saturday_hours: '0', sunday_hours: '0',
            };
            days.forEach(day => {
                const isWorkDay = !['saturday', 'sunday'].includes(day);
                (baseData as Record<string, string>)[`${day}_entry_time`] = isWorkDay ? '09:00' : '';
                (baseData as Record<string, string>)[`${day}_exit_time`] = isWorkDay ? (day === 'friday' ? '15:00' : '18:00') : '';
            });
        } else if (preset === 'summer') {
            baseData = {
                ...baseData,
                name: 'Horario de Verano',
                monday_hours: '7', tuesday_hours: '7', wednesday_hours: '7', thursday_hours: '7', friday_hours: '7',
                saturday_hours: '0', sunday_hours: '0',
            };
            days.forEach(day => {
                const isWorkDay = !['saturday', 'sunday'].includes(day);
                (baseData as Record<string, string>)[`${day}_entry_time`] = isWorkDay ? '08:00' : '';
                (baseData as Record<string, string>)[`${day}_exit_time`] = isWorkDay ? '15:00' : '';
            });
        } else {
            baseData = {
                ...baseData,
                name: 'Jornada Intensiva',
                monday_hours: '6', tuesday_hours: '6', wednesday_hours: '6', thursday_hours: '6', friday_hours: '6',
                saturday_hours: '0', sunday_hours: '0',
            };
            days.forEach(day => {
                const isWorkDay = !['saturday', 'sunday'].includes(day);
                (baseData as Record<string, string>)[`${day}_entry_time`] = isWorkDay ? '08:00' : '';
                (baseData as Record<string, string>)[`${day}_exit_time`] = isWorkDay ? '14:00' : '';
            });
        }

        setData(baseData);
    };

    const { data, setData, post, patch, processing, errors } = useForm(
        buildScheduleData(userId, schedule),
    );

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (nextOpen) {
            setData(buildScheduleData(userId, schedule));
            return;
        }

        setData(buildScheduleData(userId, schedule));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const action = isEditing
            ? patch(`/schedules/${schedule?.id}`, {
                onSuccess: () => {
                    setOpen(false);
                },
            })
            : post('/schedules', {
                onSuccess: () => {
                    setData(defaultScheduleData(userId));
                    setOpen(false);
                },
            });

        return action;
    };

    const deleteSchedule = () => {
        if (!schedule || !window.confirm(`Eliminar el horario "${schedule.name}"?`)) {
            return;
        }

        router.delete(`/schedules/${schedule.id}`, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button size="sm" variant="outline" className="h-9 rounded-xl">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button size="sm" variant="outline" className={cn(createButtonClassName)}>
                        <Plus className="h-4 w-4" />
                        Anadir horario
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar horario' : 'Anadir nuevo horario'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Plantillas rapidas</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset('winter')}>
                                Invierno
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset('summer')}>
                                Verano
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset('intensive')}>
                                Intensiva
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label>Nombre del horario</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Horario de Verano"
                            />
                            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Desde (Fecha inicio)</Label>
                            <Input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                            />
                            {errors.start_date && <span className="text-xs text-red-500">{errors.start_date}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Hasta (Fecha fin - opcional)</Label>
                            <Input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                            />
                            {errors.end_date && <span className="text-xs text-red-500">{errors.end_date}</span>}
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-bold text-slate-900 dark:text-slate-100">Horas y Turnos</Label>
                            <div className="hidden sm:flex gap-8 text-[10px] uppercase font-bold text-slate-400 px-4">
                                <span className="w-20 text-center">Horas</span>
                                <span className="w-20 text-center">Entrada</span>
                                <span className="w-20 text-center">Salida</span>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, idx) => {
                                const dayLabels = {
                                    monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
                                    thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
                                };
                                const field = `${day}_hours` as keyof typeof data;

                                return (
                                    <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 transition-colors hover:border-sidebar/30">
                                        <span className="w-full sm:w-24 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 sm:mb-0">
                                            {dayLabels[day as keyof typeof dayLabels]}
                                        </span>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            {/* Horas */}
                                            <div className="flex flex-col items-center gap-1 sm:block">
                                                <span className="sm:hidden text-[9px] uppercase font-bold text-slate-400">Hrs</span>
                                                <Input
                                                    type="number"
                                                    min="0" max="24" step="0.5"
                                                    className="w-20 text-center h-9 bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800 focus:ring-sidebar/20"
                                                    value={data[field]}
                                                    onChange={(e) => setData(field, e.target.value)}
                                                />
                                            </div>

                                            {/* Entrada */}
                                            <div className="flex flex-col items-center gap-1 sm:block">
                                                <span className="sm:hidden text-[9px] uppercase font-bold text-slate-400">Ent</span>
                                                <Input
                                                    type="time"
                                                    className="w-24 text-xs h-9 bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800 focus:ring-sidebar/20"
                                                    value={data[`${day}_entry_time` as keyof typeof data] || ''}
                                                    onChange={(e) => setData(`${day}_entry_time` as any, e.target.value)}
                                                />
                                            </div>

                                            {/* Salida */}
                                            <div className="flex flex-col items-center gap-1 sm:block">
                                                <span className="sm:hidden text-[9px] uppercase font-bold text-slate-400">Sal</span>
                                                <Input
                                                    type="time"
                                                    className="w-24 text-xs h-9 bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800 focus:ring-sidebar/20"
                                                    value={data[`${day}_exit_time` as keyof typeof data] || ''}
                                                    onChange={(e) => setData(`${day}_exit_time` as any, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 gap-2">
                        <div>
                            {isEditing && (
                                <Button type="button" variant="destructive" onClick={deleteSchedule}>
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>
                                {isEditing ? 'Guardar cambios' : 'Guardar horario'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}
