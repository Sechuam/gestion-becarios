import { Calendar, Umbrella, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface DayClickModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectOption: (option: 'event' | 'absence') => void;
    date: string;
    canRequestAbsence?: boolean;
}

export function DayClickModal({
    open,
    onOpenChange,
    onSelectOption,
    date,
    canRequestAbsence = true,
}: DayClickModalProps) {
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden rounded-xl border-none bg-background p-0 shadow-xl sm:max-w-[420px] dark:bg-slate-900">
                <DialogHeader className="p-5 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        ¿Qué quieres hacer?
                    </DialogTitle>
                    <p className="mt-1 text-xs font-bold tracking-widest text-slate-500 uppercase">
                        {formattedDate}
                    </p>
                </DialogHeader>

                <div className="grid gap-4 p-5 pt-2">
                    <button
                        onClick={() => onSelectOption('event')}
                        className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-sidebar hover:ring-4 hover:ring-slate-100 dark:bg-slate-800/50 dark:hover:bg-sidebar"
                    >
                        <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-sidebar/10 text-sidebar transition-all group-hover:bg-sidebar group-hover:text-white">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-slate-900 transition-colors">
                                Nuevo Evento
                            </p>
                            <p className="mt-0.5 text-[11px] leading-tight font-medium text-slate-500">
                                Añade un recordatorio o tarea personal a tu
                                agenda.
                            </p>
                        </div>
                    </button>

                    {canRequestAbsence && (
                        <button
                            onClick={() => onSelectOption('absence')}
                            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-sidebar hover:ring-4 hover:ring-slate-100 dark:bg-slate-800/50 dark:hover:bg-sidebar"
                        >
                            <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-sidebar/10 text-sidebar transition-all group-hover:bg-sidebar group-hover:text-white">
                                <Umbrella className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 transition-colors">
                                    Registrar Ausencia
                                </p>
                                <p className="mt-0.5 text-[11px] leading-tight font-medium text-slate-500">
                                    Informa de una falta al trabajo o solicita
                                    un permiso.
                                </p>
                            </div>
                        </button>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border-slate-200 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase shadow-sm transition-all hover:bg-white hover:text-slate-700"
                    >
                        <X className="h-3 w-3" />
                        Cancelar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
