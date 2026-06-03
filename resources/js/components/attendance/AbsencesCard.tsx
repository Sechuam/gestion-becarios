import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AbsenceRow } from './AbsenceRow';
import { AbsencesPagination } from './AbsencesPagination';
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
        <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-xs dark:border-[#2f4a62] dark:bg-[#142235]">
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="border-b border-slate-400 bg-slate-200 p-3 pb-2 dark:border-[#3c6270] dark:bg-[#22374d]">
                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-sidebar shadow-sm ring-1 ring-sidebar/10 dark:bg-[#142235]">
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
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
                            <p className="text-sm font-medium text-slate-500 italic">
                                No tienes ausencias registradas recientemente.
                            </p>
                        </div>
                    )}
                    {absences.length > absencesPerPage && (
                        <AbsencesPagination
                            absencePage={absencePage}
                            totalAbsencePages={totalAbsencePages}
                            absenceRangeStart={absenceRangeStart}
                            absenceRangeEnd={absenceRangeEnd}
                            totalAbsences={absences.length}
                            onPageChange={onPageChange}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
