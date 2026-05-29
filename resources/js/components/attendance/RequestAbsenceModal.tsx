import { useForm, usePage } from '@inertiajs/react';
import { CalendarClock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { PageProps } from '@/types';

export function RequestAbsenceModal() {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<PageProps>().props;
    const { toast } = useToast();

    const isIntern = auth.user.roles?.includes('intern');
    const buttonText = isIntern ? 'Enviar Petición' : 'Registrar Ausencia';

    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        reason: 'Examen',
        justification_file: null as File | null,
    });

    useEffect(() => {
        const handleOpenModal = (e: CustomEvent<{ date: string }>) => {
            setData('date', e.detail.date);
            setOpen(true);
        };
        window.addEventListener(
            'open-absence-modal',
            handleOpenModal as EventListener,
        );
        return () =>
            window.removeEventListener(
                'open-absence-modal',
                handleOpenModal as EventListener,
            );
    }, [setData]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/absences', {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                toast({
                    title: isIntern
                        ? 'Solicitud enviada'
                        : 'Ausencia registrada',
                    description: isIntern
                        ? 'Tu petición de ausencia se ha enviado correctamente.'
                        : 'La ausencia se ha registrado correctamente.',
                });
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <HeaderActionButton
                    label="Registrar Ausencia"
                    icon={
                        <CalendarClock className="mr-1.5 h-4 w-4 text-primary" />
                    }
                />
            </DialogTrigger>
            <DialogContent className="overflow-hidden rounded-xl border-none bg-background p-0 shadow-xl sm:max-w-[460px] dark:bg-slate-900">
                <style>{`
                    .input-white-bg {
                        background-color: #ffffff !important;
                        color: #1e293b !important;
                    }
                `}</style>

                <DialogHeader className="p-5 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Registrar Ausencia
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6 px-8 pb-10">
                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                            ¿Qué día vas a faltar?
                        </Label>
                        <Input
                            type="date"
                            required
                            value={data.date}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setData('date', e.target.value)}
                            style={{ backgroundColor: 'white' }}
                            className="input-white-bg h-10 rounded-xl border-slate-200 px-4 shadow-sm transition-all focus:ring-4 focus:ring-slate-100"
                        />
                        {errors.date && (
                            <p className="ml-1 text-xs font-bold text-red-500">
                                {errors.date}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                            Motivo de la ausencia
                        </Label>
                        <div className="relative">
                            <select
                                id="absence-reason"
                                name="absence_reason"
                                className="input-white-bg flex h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all focus:ring-4 focus:ring-slate-100 focus:outline-none"
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                style={{ backgroundColor: 'white' }}
                            >
                                <option value="Examen">
                                    Examen de la Universidad
                                </option>
                                <option value="Enfermedad">
                                    Enfermedad / Cita Médica
                                </option>
                                <option value="Asuntos Propios">
                                    Asuntos Personales
                                </option>
                                <option value="Vacaciones">Vacaciones</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                <svg
                                    className="h-4 w-4 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                            Justificante (opcional)
                        </Label>
                        <div className="group relative">
                            <Input
                                type="file"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) =>
                                    setData(
                                        'justification_file',
                                        e.target.files?.[0] || null,
                                    )
                                }
                                style={{ backgroundColor: 'white' }}
                                className="input-white-bg h-11 rounded-xl border-slate-200 px-4 py-3 text-xs shadow-sm transition-all file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-1 file:text-[10px] file:font-black file:text-slate-600 file:uppercase"
                            />
                        </div>
                        <p className="ml-1 text-[10px] text-slate-400 italic">
                            PDF, JPG, PNG (Max 5MB)
                        </p>
                        {errors.justification_file && (
                            <p className="ml-1 text-xs font-bold text-red-500">
                                {errors.justification_file}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="h-10 flex-1 rounded-xl border-slate-200 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase transition-all hover:bg-slate-50 hover:text-slate-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-10 flex-[2.5] rounded-xl bg-sidebar text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-sidebar/20 transition-all hover:shadow-sidebar/30 active:scale-[0.98]"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                buttonText
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
