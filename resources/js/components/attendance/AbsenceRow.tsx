import { CalendarClock, Download, ExternalLink, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Absence } from './types';

type Props = {
    absence: Absence;
    onUploadJustification: (absenceId: number, file: File) => void;
};

export function AbsenceRow({ absence, onUploadJustification }: Props) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-200/70 hover:shadow-md dark:border-[#2c465c] dark:bg-[#17283c]">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-inner ${
                        absence.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : absence.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                    }`}
                >
                    <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm leading-none font-black text-slate-800 dark:text-white">
                        {absence?.reason || 'Sin motivo'}
                    </p>
                    <p className="mt-1 text-[9px] font-black tracking-widest text-slate-500 uppercase dark:text-[#8fa3b6]">
                        {absence?.date || '--'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span
                    className={`rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase shadow-sm ${
                        absence.status === 'approved'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : absence.status === 'rejected'
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                >
                    {absence.status === 'approved'
                        ? 'Aprobada'
                        : absence.status === 'rejected'
                          ? 'Denegada'
                          : 'En espera'}
                </span>

                {absence.justification_url ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white hover:text-sidebar dark:text-[#c4d2df] dark:hover:bg-slate-900"
                            asChild
                        >
                            <a
                                href={absence.justification_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white hover:text-sidebar dark:text-[#c4d2df] dark:hover:bg-slate-900"
                            asChild
                        >
                            <a href={absence.justification_url} download>
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            id={`absence-justification-${absence.id}`}
                            name={`absence_justification_${absence.id}`}
                            type="file"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onUploadJustification(absence.id, file);
                                }
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <Button
                            variant="outline"
                            className="h-10 gap-2 rounded-xl border-slate-300 bg-white text-xs font-black tracking-widest text-sidebar uppercase shadow-sm hover:bg-slate-50"
                        >
                            <FilePlus className="h-4 w-4" />
                            Adjuntar PDF
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
