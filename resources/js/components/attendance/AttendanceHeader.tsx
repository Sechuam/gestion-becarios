import { Clock3 } from 'lucide-react';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { MetricPills } from '@/components/common/MetricPills';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { cn } from '@/lib/utils';
import { RequestAbsenceModal } from './RequestAbsenceModal';
import { formatHoursDecimal } from './time-format';
import type { TodayLog } from './types';

type Props = {
    todayLogs: TodayLog[];
    currentLog: TodayLog | null;
    todayTotalHours: number;
    onClockIn: () => void;
    onClockOut: () => void;
};

export function AttendanceHeader({
    todayLogs,
    currentLog,
    todayTotalHours,
    onClockIn,
    onClockOut,
}: Props) {
    const metrics = [
        {
            label: 'Tramos hoy',
            value: todayLogs.length,
            hint: 'Sesiones registradas en la jornada',
        },
        {
            label: 'Tiempo acumulado',
            value:
                todayTotalHours > 0
                    ? formatHoursDecimal(todayTotalHours)
                    : '0m',
            hint: 'Suma de horas del día',
        },
        {
            label: 'Jornada activa',
            value: currentLog ? 'Sí' : 'No',
            hint: currentLog
                ? 'Hay un tramo abierto en curso'
                : 'No hay fichaje activo',
        },
    ];

    return (
        <>
            <ModuleHeader
                title="Control horario"
                description="Registra tu jornada, visualiza tus tramos del día y detecta incidencias de cumplimiento sin salir del módulo."
                icon={<Clock3 className="h-5 w-5" />}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <HeaderActionButton
                            label="Fichar Entrada"
                            onClick={onClockIn}
                            icon={<Clock3 className="mr-1.5 h-4 w-4" />}
                            className={cn(
                                currentLog?.clock_in &&
                                    !currentLog?.clock_out &&
                                    'pointer-events-none opacity-50',
                            )}
                        />
                        <HeaderActionButton
                            label="Fichar Salida"
                            onClick={onClockOut}
                            icon={<Clock3 className="mr-1.5 h-4 w-4" />}
                            className={cn(
                                (!currentLog?.clock_in ||
                                    currentLog?.clock_out) &&
                                    'pointer-events-none opacity-50',
                            )}
                        />
                        <RequestAbsenceModal />
                    </div>
                }
            />
            <MetricPills metrics={metrics} />
        </>
    );
}
