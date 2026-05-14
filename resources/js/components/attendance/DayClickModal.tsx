import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
            <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-3xl p-0 border-none bg-white dark:bg-slate-900 shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                        ¿Qué quieres hacer?
                    </DialogTitle>
                    <p className="text-sm font-medium text-slate-500 capitalize">{formattedDate}</p>
                </DialogHeader>

                <div className="grid gap-3 p-6 pt-2">
                    <button
                        onClick={() => onSelectOption('event')}
                        className="group flex items-center gap-4 rounded-2xl border border-sidebar/10 bg-slate-50 p-4 text-left transition-all hover:bg-sidebar hover:border-sidebar dark:bg-slate-800/50 dark:hover:bg-sidebar"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar/10 text-sidebar group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 group-hover:text-white dark:text-white transition-colors">Crear Evento / Tarea</p>
                            <p className="text-xs font-medium text-slate-500 group-hover:text-white/70 transition-colors">Añade un recordatorio o tarea personal</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectOption('absence')}
                        className="group flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50/30 p-4 text-left transition-all hover:bg-amber-500 hover:border-amber-500 dark:bg-amber-900/10 dark:hover:bg-amber-500"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <Umbrella className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-amber-900 group-hover:text-white dark:text-amber-100 transition-colors">Registrar Ausencia</p>
                            <p className="text-xs font-medium text-amber-700/60 group-hover:text-white/70 transition-colors">Solicitar o registrar falta al trabajo</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-xs font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X className="h-3 w-3" />
                        Cancelar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
