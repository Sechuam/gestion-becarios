import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Umbrella, X } from 'lucide-react';

interface DayClickModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectOption: (option: 'event' | 'absence') => void;
    date: string;
}

export function DayClickModal({ open, onOpenChange, onSelectOption, date }: DayClickModalProps) {
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] overflow-hidden rounded-[2.5rem] p-0 border-none bg-background dark:bg-slate-900 shadow-2xl">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        ¿Qué quieres hacer?
                    </DialogTitle>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{formattedDate}</p>
                </DialogHeader>

                <div className="grid gap-4 p-8 pt-2">
                    <button
                        onClick={() => onSelectOption('event')}
                        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:ring-4 hover:ring-slate-100 hover:border-sidebar dark:bg-slate-800/50 dark:hover:bg-sidebar shadow-sm"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar/10 text-sidebar group-hover:bg-sidebar group-hover:text-white transition-all">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-slate-900 transition-colors">Nuevo Evento</p>
                            <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">Añade un recordatorio o tarea personal a tu agenda.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectOption('absence')}
                        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:ring-4 hover:ring-slate-100 hover:border-sidebar dark:bg-slate-800/50 dark:hover:bg-sidebar shadow-sm"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar/10 text-sidebar group-hover:bg-sidebar group-hover:text-white transition-all">
                            <Umbrella className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-slate-900 transition-colors">Registrar Ausencia</p>
                            <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">Informa de una falta al trabajo o solicita un permiso.</p>
                        </div>
                    </button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="mt-4 flex w-full h-12 items-center justify-center gap-2 rounded-2xl border-slate-200 text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 hover:bg-white hover:text-slate-700 transition-all shadow-sm"
                    >
                        <X className="h-3 w-3" />
                        Cancelar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
