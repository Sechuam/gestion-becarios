import { Head, router, useForm } from '@inertiajs/react';
import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AbsencesCard } from '@/components/attendance/AbsencesCard';
import { AttendanceCalendarCard } from '@/components/attendance/AttendanceCalendarCard';
import { AttendanceHeader } from '@/components/attendance/AttendanceHeader';
import { AttendanceTabsNav } from '@/components/attendance/AttendanceTabsNav';
import { DailyRegisterCard } from '@/components/attendance/DailyRegisterCard';
import { ManualLogCard } from '@/components/attendance/ManualLogCard';
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
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Control horario', href: '/asistencia' },
];

const ABSENCES_PER_PAGE = 5;

export default function Index({
    today_logs,
    current_log,
    today_total_hours,
    is_intern,
    can_manage_attendance,
    manageable_interns,
    non_compliant_interns,
    absences,
}: {
    today_logs: TodayLog[];
    current_log: TodayLog | null;
    today_total_hours: number;
    is_intern: boolean;
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
                {is_intern ? (
                    <AttendanceHeader
                        todayLogs={today_logs}
                        currentLog={current_log}
                        todayTotalHours={today_total_hours}
                        onClockIn={handleClockIn}
                        onClockOut={handleClockOut}
                    />
                ) : (
                    <ModuleHeader
                        title="Control horario"
                        description="Gestiona registros manuales, revisa incidencias y consulta el calendario horario de los becarios."
                        icon={<Clock3 className="h-5 w-5" />}
                    />
                )}

                <Tabs
                    defaultValue={is_intern ? 'registro' : 'gestion'}
                    className="space-y-3"
                >
                    <AttendanceTabsNav isIntern={is_intern} />

                    {is_intern ? (
                        <>
                            <TabsContent
                                value="registro"
                                className="mt-0 space-y-3"
                            >
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
                                        <ManualLogCard
                                            form={manualForm}
                                            manageableInterns={
                                                manageable_interns
                                            }
                                            onSubmit={submitManualLog}
                                        />

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
                                <AttendanceCalendarCard
                                    canManageAttendance={can_manage_attendance}
                                    canRequestAbsence={is_intern}
                                    manageableInterns={manageable_interns}
                                />
                            </TabsContent>
                        </>
                    ) : (
                        <TabsContent value="gestion" className="mt-0 space-y-3">
                            <ManualLogCard
                                form={manualForm}
                                manageableInterns={manageable_interns}
                                onSubmit={submitManualLog}
                            />

                            <AttendanceCalendarCard
                                canManageAttendance={can_manage_attendance}
                                canRequestAbsence={is_intern}
                                manageableInterns={manageable_interns}
                            />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AppLayout>
    );
}
