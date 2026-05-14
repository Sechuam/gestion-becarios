import { Button } from '@/components/ui/button';

type Props = {
    absencePage: number;
    totalAbsencePages: number;
    absenceRangeStart: number;
    absenceRangeEnd: number;
    totalAbsences: number;
    onPageChange: (updater: (page: number) => number) => void;
};

export function AbsencesPagination({
    absencePage,
    totalAbsencePages,
    absenceRangeStart,
    absenceRangeEnd,
    totalAbsences,
    onPageChange,
}: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-sidebar/10 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800">
            <p className="text-xs font-bold text-slate-500">
                Mostrando{' '}
                <span className="text-sidebar">{absenceRangeStart}</span> -{' '}
                <span className="text-sidebar">{absenceRangeEnd}</span> de{' '}
                {totalAbsences} ausencias
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    disabled={absencePage === 1}
                    onClick={() =>
                        onPageChange((page) => Math.max(1, page - 1))
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
                            Math.min(totalAbsencePages, page + 1),
                        )
                    }
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
