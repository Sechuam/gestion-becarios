import { Check } from 'lucide-react';
import type { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type EventFormData = {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    color: string;
    attendee_ids: number[];
};

type Props = {
    data: EventFormData;
    errors: Partial<Record<keyof EventFormData, string>>;
    colors: { name: string; value: string }[];
    setData: <Key extends keyof EventFormData>(
        key: Key,
        value: EventFormData[Key],
    ) => void;
};

export function EventDetailsFields({ data, errors, colors, setData }: Props) {
    return (
        <div className="custom-scrollbar flex-[1.4] space-y-4 overflow-y-auto border-r border-slate-100 p-6 dark:border-slate-800">
            <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                    Título del Evento
                </Label>
                <Input
                    required
                    placeholder="Ej: Reunión de equipo..."
                    value={data.title}
                    onChange={(event: FormEvent<HTMLInputElement>) =>
                        setData('title', event.currentTarget.value)
                    }
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
                    onChange={(event: FormEvent<HTMLTextAreaElement>) =>
                        setData('description', event.currentTarget.value)
                    }
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
                            onChange={(event: FormEvent<HTMLInputElement>) =>
                                setData('start_date', event.currentTarget.value)
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
                            onChange={(event: FormEvent<HTMLInputElement>) =>
                                setData('end_date', event.currentTarget.value)
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
                        onChange={(event: FormEvent<HTMLInputElement>) =>
                            setData('all_day', event.currentTarget.checked)
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
                                    event: FormEvent<HTMLInputElement>,
                                ) =>
                                    setData(
                                        'start_time',
                                        event.currentTarget.value,
                                    )
                                }
                                style={{ backgroundColor: 'white' }}
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
                                    event: FormEvent<HTMLInputElement>,
                                ) =>
                                    setData(
                                        'end_time',
                                        event.currentTarget.value,
                                    )
                                }
                                style={{ backgroundColor: 'white' }}
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
                    {colors.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => setData('color', color.value)}
                            className={cn(
                                'group relative flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95',
                                data.color === color.value
                                    ? 'ring-2 ring-sidebar ring-offset-2'
                                    : 'shadow-sm ring-1 ring-slate-200',
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
    );
}
