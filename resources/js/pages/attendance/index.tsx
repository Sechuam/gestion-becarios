import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AbsencesCard } from '@/components/attendance/AbsencesCard';
import { AttendanceCalendarCard } from '@/components/attendance/AttendanceCalendarCard';
import { AttendanceHeader } from '@/components/attendance/AttendanceHeader';
import { AttendanceTabsNav } from '@/components/attendance/AttendanceTabsNav';
import { DailyRegisterCard } from '@/components/attendance/DailyRegisterCard';
import { NonComplianceCard } from '@/components/attendance/NonComplianceCard';
import {
    formatElapsed,
    getElapsedSeconds,
} from '@/components/attendance/time-format';
import type {
    Absence,
    ManageableIntern,
    NonCompliantIntern,
    TodayLog,
} from '@/components/attendance/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Control horario', href: '/asistencia' },
];

const ABSENCES_PER_PAGE = 5;

export default function Index({
    today_logs,
    current_log,
    today_total_hours,
    can_manage_attendance,
    manageable_interns,
    non_compliant_interns,
    absences,
}: {
    today_logs: TodayLog[];
    current_log: TodayLog | null;
    today_total_hours: number;
    can_manage_attendance: boolean;
    manageable_interns: ManageableIntern[];
    non_compliant_interns: NonCompliantIntern[];
    absences: Absence[];
}) {
    const manualForm = useForm({
        intern_id: '',
        date: new Date().toISOString().split('T')[0],
        clock_in: '',
        clock_out: '',
        notes: '',
    });

    const [now, setNow] = useState(() => new Date());
    const [todayLogsOpen, setTodayLogsOpen] = useState(
        () => today_logs.length <= 2,
    );
    const [absencePage, setAbsencePage] = useState(1);

    // ── Búsqueda de becarios ──────────────────────────────────────────────────
    const [internSearch, setInternSearch] = useState('');
    const [showInternDropdown, setShowInternDropdown] = useState(false);
    const internSearchRef = useRef<HTMLDivElement>(null);

    const filteredInterns = (manageable_interns ?? []).filter(
        (i) =>
            i.name.toLowerCase().includes(internSearch.toLowerCase()) ||
            (i.education_center ?? '')
                .toLowerCase()
                .includes(internSearch.toLowerCase()),
    );

    const selectedIntern = (manageable_interns ?? []).find(
        (i) => String(i.id) === manualForm.data.intern_id,
    );

    const totalAbsencePages = Math.max(
        1,
        Math.ceil((absences?.length ?? 0) / ABSENCES_PER_PAGE),
    );
    const paginatedAbsences = (absences ?? []).slice(
        (absencePage - 1) * ABSENCES_PER_PAGE,
        absencePage * ABSENCES_PER_PAGE,
    );
    const absenceRangeStart =
        absences.length > 0 ? (absencePage - 1) * ABSENCES_PER_PAGE + 1 : 0;
    const absenceRangeEnd = Math.min(
        absencePage * ABSENCES_PER_PAGE,
        absences.length,
    );

    useEffect(() => {
        setAbsencePage((currentPage) =>
            Math.min(currentPage, totalAbsencePages),
        );
    }, [totalAbsencePages]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                internSearchRef.current &&
                !internSearchRef.current.contains(e.target as Node)
            ) {
                setShowInternDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectIntern = (intern: ManageableIntern) => {
        manualForm.setData('intern_id', String(intern.id));
        setInternSearch('');
        setShowInternDropdown(false);
    };
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!current_log?.clock_in || current_log?.clock_out) return;

        const interval = window.setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => window.clearInterval(interval);
    }, [current_log?.clock_in, current_log?.clock_out]);
    const handleClockIn = () => {
        router.post('/time-logs/clock-in', {}, { preserveScroll: true });
    };

    const handleClockOut = () => {
        router.post('/time-logs/clock-out', {}, { preserveScroll: true });
    };

    const submitManualLog = (e: FormEvent) => {
        e.preventDefault();
        manualForm.post('/time-logs/manual', {
            preserveScroll: true,
            onSuccess: () => {
                manualForm.reset('clock_in', 'clock_out', 'notes');
                manualForm.setData(
                    'date',
                    new Date().toISOString().split('T')[0],
                );
            },
        });
    };

    const handleUploadJustification = (absenceId: number, file: File) => {
        router.post(
            `/absences/${absenceId}/justification`,
            {
                justification_file: file,
            },
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    const liveElapsed =
        current_log?.clock_in && !current_log?.clock_out
            ? formatElapsed(getElapsedSeconds(current_log.clock_in, now))
            : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control Horario" />

            <div className="flex h-full flex-1 flex-col gap-3">
                <AttendanceHeader
                    todayLogs={today_logs}
                    currentLog={current_log}
                    todayTotalHours={today_total_hours}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                />

                <Tabs defaultValue="registro" className="space-y-3">
                    <AttendanceTabsNav />

                    <TabsContent value="registro" className="mt-0 space-y-3">
                        <DailyRegisterCard
                            todayLogs={today_logs}
                            currentLog={current_log}
                            todayTotalHours={today_total_hours}
                            liveElapsed={liveElapsed}
                            todayLogsOpen={todayLogsOpen}
                            onTodayLogsOpenChange={setTodayLogsOpen}
                        />

                        {can_manage_attendance && (
                            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg dark:bg-slate-900">
                                    <CardHeader className="border-b border-sidebar/5 p-3 pb-2">
                                        <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow shadow-sidebar/20">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            Registro Manual
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <form
                                            onSubmit={submitManualLog}
                                            className="space-y-3"
                                        >
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div
                                                    className="space-y-2"
                                                    ref={internSearchRef}
                                                >
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Becario Asignado
                                                    </Label>

                                                    {/* Becario seleccionado */}
                                                    {selectedIntern &&
                                                        !showInternDropdown && (
                                                            <div
                                                                className="flex h-11 cursor-pointer items-center justify-between rounded-2xl border border-sidebar/20 bg-card px-4 shadow-sm transition-colors hover:bg-slate-50"
                                                                onClick={() => {
                                                                    setInternSearch(
                                                                        '',
                                                                    );
                                                                    setShowInternDropdown(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/20 text-[10px] font-black text-sidebar">
                                                                        {selectedIntern.name.charAt(
                                                                            0,
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                                        {
                                                                            selectedIntern.name
                                                                        }
                                                                    </span>
                                                                    {selectedIntern.education_center && (
                                                                        <span className="text-[10px] font-medium text-slate-400">
                                                                            ·{' '}
                                                                            {
                                                                                selectedIntern.education_center
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                                    Cambiar
                                                                </span>
                                                            </div>
                                                        )}

                                                    {/* Campo de búsqueda */}
                                                    {(!selectedIntern ||
                                                        showInternDropdown) && (
                                                        <div className="relative">
                                                            <Input
                                                                autoFocus={
                                                                    showInternDropdown
                                                                }
                                                                value={
                                                                    internSearch
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setInternSearch(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    setShowInternDropdown(
                                                                        true,
                                                                    );
                                                                }}
                                                                onFocus={() =>
                                                                    setShowInternDropdown(
                                                                        true,
                                                                    )
                                                                }
                                                                placeholder="Buscar becario por nombre o centro..."
                                                                className="h-11 rounded-2xl border-sidebar/20 bg-card pl-10 text-foreground shadow-sm"
                                                            />
                                                            <svg
                                                                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                />
                                                            </svg>

                                                            {showInternDropdown && (
                                                                <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-50 max-h-56 overflow-y-auto rounded-2xl border border-sidebar/20 bg-white shadow-xl dark:bg-slate-900">
                                                                    {filteredInterns.length >
                                                                    0 ? (
                                                                        filteredInterns.map(
                                                                            (
                                                                                intern,
                                                                            ) => (
                                                                                <button
                                                                                    key={
                                                                                        intern.id
                                                                                    }
                                                                                    type="button"
                                                                                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                                    onClick={() =>
                                                                                        selectIntern(
                                                                                            intern,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar/10 text-xs font-black text-sidebar transition-colors group-hover:bg-sidebar group-hover:text-white">
                                                                                        {intern.name.charAt(
                                                                                            0,
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm leading-none font-bold text-slate-800 dark:text-white">
                                                                                            {
                                                                                                intern.name
                                                                                            }
                                                                                        </p>
                                                                                        {intern.education_center && (
                                                                                            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                                                                                {
                                                                                                    intern.education_center
                                                                                                }
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </button>
                                                                            ),
                                                                        )
                                                                    ) : (
                                                                        <p className="py-6 text-center text-sm text-slate-400 italic">
                                                                            Sin
                                                                            resultados
                                                                            para
                                                                            &ldquo;
                                                                            {
                                                                                internSearch
                                                                            }
                                                                            &rdquo;
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {manualForm.errors
                                                        .intern_id && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors
                                                                    .intern_id
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Fecha de Registro
                                                    </Label>
                                                    <DatePicker
                                                        className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                        value={
                                                            manualForm.data.date
                                                        }
                                                        onChange={(value) =>
                                                            manualForm.setData(
                                                                'date',
                                                                value,
                                                            )
                                                        }
                                                    />
                                                    {manualForm.errors.date && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors.date
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Hora de Entrada
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                        value={
                                                            manualForm.data
                                                                .clock_in
                                                        }
                                                        onChange={(e) =>
                                                            manualForm.setData(
                                                                'clock_in',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {manualForm.errors
                                                        .clock_in && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors
                                                                    .clock_in
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                        Hora de Salida
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                        value={
                                                            manualForm.data
                                                                .clock_out
                                                        }
                                                        onChange={(e) =>
                                                            manualForm.setData(
                                                                'clock_out',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {manualForm.errors
                                                        .clock_out && (
                                                        <p className="text-xs font-bold text-red-500">
                                                            {
                                                                manualForm
                                                                    .errors
                                                                    .clock_out
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                                    Notas y Observaciones
                                                </Label>
                                                <Input
                                                    className="h-11 rounded-2xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                                    value={
                                                        manualForm.data.notes
                                                    }
                                                    onChange={(e) =>
                                                        manualForm.setData(
                                                            'notes',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Motivo del ajuste o comentario aclaratorio..."
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={
                                                    manualForm.processing ||
                                                    !manualForm.data.intern_id
                                                }
                                                className="h-8 rounded-lg bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 text-[10px] font-black text-white shadow shadow-sidebar/20 transition-all hover:opacity-95 active:scale-95"
                                            >
                                                Guardar Registro
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <NonComplianceCard
                                    interns={non_compliant_interns}
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* SECCIÓN MIS AUSENCIAS PARA EL BECARIO */}
                    <TabsContent value="ausencias" className="mt-0">
                        {absences && Array.isArray(absences) && (
                            <AbsencesCard
                                absences={absences}
                                paginatedAbsences={paginatedAbsences}
                                absencePage={absencePage}
                                totalAbsencePages={totalAbsencePages}
                                absenceRangeStart={absenceRangeStart}
                                absenceRangeEnd={absenceRangeEnd}
                                absencesPerPage={ABSENCES_PER_PAGE}
                                onPageChange={setAbsencePage}
                                onUploadJustification={
                                    handleUploadJustification
                                }
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="calendario" className="mt-0">
                        <AttendanceCalendarCard canManageAttendance={can_manage_attendance} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
