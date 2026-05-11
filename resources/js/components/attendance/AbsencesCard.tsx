import {
    CalendarClock,
    Download,
    ExternalLink,
    FilePlus,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Absence } from './types';

type Props = {
    absences: Absence[];
    paginatedAbsences: Absence[];
    absencePage: number;
    totalAbsencePages: number;
    absenceRangeStart: number;
    absenceRangeEnd: number;
    absencesPerPage: number;
    onPageChange: (updater: (page: number) => number) => void;
    onUploadJustification: (absenceId: number, file: File) => void;
};

export function AbsencesCard({
    absences,
    paginatedAbsences,
    absencePage,
    totalAbsencePages,
    absenceRangeStart,
    absenceRangeEnd,
    absencesPerPage,
    onPageChange,
    onUploadJustification,
}: Props) {
    return (
        <Card className="overflow-hidden rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900">
            <CardHeader className="border-b border-sidebar/5 bg-slate-50/30 p-3 pb-2 dark:bg-slate-800/30">
                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-sidebar/10 text-sidebar shadow-inner">
                        <FileText className="h-4 w-4" />
                    </div>
                    Mis Ausencias
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
                <div className="space-y-4">
                    {absences.length > 0 ? (
                        paginatedAbsences.map((absence) => (
                            <AbsenceRow
                                key={absence.id}
                                absence={absence}
                                onUploadJustification={onUploadJustification}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                            <p className="text-sm font-medium text-slate-500 italic">
                                No tienes ausencias registradas recientemente.
                            </p>
                        </div>
                    )}
                    {absences.length > absencesPerPage && (
                        <div className="flex flex-col gap-3 rounded-xl border border-sidebar/10 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800">
                            <p className="text-xs font-bold text-slate-500">
                                Mostrando{' '}
                                <span className="text-sidebar">
                                    {absenceRangeStart}
                                </span>{' '}
                                -{' '}
                                <span className="text-sidebar">
                                    {absenceRangeEnd}
                                </span>{' '}
                                de {absences.length} ausencias
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg"
                                    disabled={absencePage === 1}
                                    onClick={() =>
                                        onPageChange((page) =>
                                            Math.max(1, page - 1),
                                        )
                                    }
                                >
                                    Anterior
                                </Button>
                                <span className="min-w-16 text-center text-xs font-black text-slate-500">
                                    {absencePage} / {totalAbsencePages}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg"
                                    disabled={absencePage === totalAbsencePages}
                                    onClick={() =>
                                        onPageChange((page) =>
                                            Math.min(
                                                totalAbsencePages,
                                                page + 1,
                                            ),
                                        )
                                    }
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function AbsenceRow({
    absence,
    onUploadJustification,
}: {
    absence: Absence;
    onUploadJustification: (absenceId: number, file: File) => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sidebar/10 bg-slate-50/50 p-4 shadow-sm transition-all hover:bg-white hover:shadow-md dark:bg-slate-800">
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
                    <p className="mt-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                        {absence?.date || '--'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span
                    className={`rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase shadow-sm ${
                        absence.status === 'approved'
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                            : absence.status === 'rejected'
                              ? 'border-rose-100 bg-rose-50 text-rose-700'
                              : 'border-amber-100 bg-amber-50 text-amber-700'
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
                            className="h-8 w-8 rounded-lg hover:bg-sidebar/10 hover:text-sidebar"
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
                            className="h-8 w-8 rounded-lg hover:bg-sidebar/10 hover:text-sidebar"
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
                            className="h-10 gap-2 rounded-xl border-sidebar/20 bg-white text-xs font-black tracking-widest text-[#1f4f52] uppercase shadow-sm hover:bg-slate-50"
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
