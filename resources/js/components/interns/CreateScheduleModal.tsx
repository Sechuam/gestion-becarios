import { useState, type FormEvent } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
};

type CreateScheduleModalProps = {
    userId: number;
    schedule?: ScheduleItem;
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
    };
};

export function CreateScheduleModal({ userId, schedule }: CreateScheduleModalProps) {
    const [open, setOpen] = useState(false);
    const isEditing = Boolean(schedule);

    const applyPreset = (preset: 'winter' | 'summer' | 'intensive') => {
        if (preset === 'winter') {
            setData({
                ...data,
                name: 'Horario de Invierno',
                monday_hours: '8',
                tuesday_hours: '8',
                wednesday_hours: '8',
                thursday_hours: '8',
                friday_hours: '6',
                saturday_hours: '0',
                sunday_hours: '0',
            });
            return;
        }

        if (preset === 'summer') {
            setData({
                ...data,
                name: 'Horario de Verano',
                monday_hours: '7',
                tuesday_hours: '7',
                wednesday_hours: '7',
                thursday_hours: '7',
                friday_hours: '6',
                saturday_hours: '0',
                sunday_hours: '0',
            });
            return;
        }

        setData({
            ...data,
            name: 'Jornada Intensiva',
            monday_hours: '6',
            tuesday_hours: '6',
            wednesday_hours: '6',
            thursday_hours: '6',
            friday_hours: '6',
            saturday_hours: '0',
            sunday_hours: '0',
        });
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
                    <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                        Anadir horario
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
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

                    <div className="space-y-3 pt-2 border-t">
                        <Label>Horas diarias</Label>
                        <div className="flex justify-between gap-2">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, idx) => {
                                const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                                const field = `${day}_hours` as keyof typeof data;
                                return (
                                    <div key={day} className="flex flex-col items-center gap-1">
                                        <span className="text-xs text-slate-500 font-bold">{labels[idx]}</span>
                                        <Input
                                            type="number"
                                            min="0" max="24" step="0.5"
                                            className="w-14 text-center px-1"
                                            value={data[field]}
                                            onChange={(e) => setData(field, e.target.value)}
                                        />
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
        </Dialog>
    );
}
