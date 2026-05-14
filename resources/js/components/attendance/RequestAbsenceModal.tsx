import { useState, useEffect, type FormEvent } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { CalendarClock, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RequestAbsenceModal() {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<PageProps>().props;
    
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
        window.addEventListener('open-absence-modal', handleOpenModal as EventListener);
        return () => window.removeEventListener('open-absence-modal', handleOpenModal as EventListener);
    }, [setData]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/absences', {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
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
            <DialogContent className="sm:max-w-[460px] overflow-hidden rounded-[2.5rem] p-0 border-none bg-background dark:bg-slate-900 shadow-2xl">
                <style>{`
                    .input-white-bg {
                        background-color: #ffffff !important;
                        color: #1e293b !important;
                    }
                `}</style>
                
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Registrar Ausencia
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="px-8 pb-10 space-y-6">
                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">¿Qué día vas a faltar?</Label>
                        <Input
                            type="date"
                            required
                            value={data.date}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('date', e.target.value)}
                            style={{ backgroundColor: 'white' }}
                            className="h-12 rounded-2xl border-slate-200 px-4 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm input-white-bg"
                        />
                        {errors.date && <p className="text-xs font-bold text-red-500 ml-1">{errors.date}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Motivo de la ausencia</Label>
                        <div className="relative">
                            <select
                                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-slate-100 focus:outline-none appearance-none transition-all shadow-sm input-white-bg"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                style={{ backgroundColor: 'white' }}
                            >
                                <option value="Examen">Examen de la Universidad</option>
                                <option value="Enfermedad">Enfermedad / Cita Médica</option>
                                <option value="Asuntos Propios">Asuntos Personales</option>
                                <option value="Vacaciones">Vacaciones</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">Justificante (opcional)</Label>
                        <div className="group relative">
                            <Input
                                type="file"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('justification_file', e.target.files?.[0] || null)}
                                style={{ backgroundColor: 'white' }}
                                className="h-14 rounded-2xl border-slate-200 px-4 py-3 text-xs file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-1 file:text-[10px] file:font-black file:uppercase file:text-slate-600 transition-all shadow-sm input-white-bg"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 italic ml-1">PDF, JPG, PNG (Max 5MB)</p>
                        {errors.justification_file && <p className="text-xs font-bold text-red-500 ml-1">{errors.justification_file}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1 h-12 rounded-2xl border-slate-200 text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-[2.5] h-12 rounded-2xl bg-[#1f4f52] text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-xl shadow-[#1f4f52]/20 hover:shadow-[#1f4f52]/30 active:scale-[0.98] transition-all"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonText}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
