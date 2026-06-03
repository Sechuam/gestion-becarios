import { ChevronsUpDown, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatHoursDecimal } from './time-format';
import type { TodayLog } from './types';

type Props = {
    todayLogs: TodayLog[];
    todayLogsOpen: boolean;
    onTodayLogsOpenChange: (open: boolean) => void;
};

export function TodayLogsSection({
    todayLogs,
    todayLogsOpen,
    onTodayLogsOpenChange,
}: Props) {
    if (todayLogs.length === 0) {
        return null;
    }

    return (
        <Collapsible open={todayLogsOpen} onOpenChange={onTodayLogsOpenChange}>
            <div className="rounded-xl border border-slate-300 bg-slate-100 p-2.5 shadow-sm dark:border-[#2c465c] dark:bg-[#17283c]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="px-1">
                        <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase dark:text-white">
                            Tramos de hoy
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-[#8fa3b6]">
                            {todayLogs.length} registros en la jornada actual.
                        </p>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full border-slate-300 bg-white px-3 text-[10px] font-black tracking-widest text-sidebar uppercase hover:bg-slate-50 dark:border-[#2c465c] dark:bg-[#142235]"
                        >
                            {todayLogsOpen ? 'Ocultar detalle' : 'Ver detalle'}
                            <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pt-3">
                    <div className="grid max-h-64 gap-3 overflow-y-auto pr-1">
                        {todayLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center justify-between gap-2 rounded-lg border border-sidebar/10 bg-white px-3 py-2 shadow-sm transition-all hover:border-sidebar/30 dark:bg-[#17283c]"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <Clock3 className="h-4 w-4 shrink-0 text-sidebar/50" />
                                    <span className="truncate font-bold text-slate-700 dark:text-[#d8e4ef]">
                                        {log.clock_in ?? '--:--'}{' '}
                                        <span className="mx-2 text-slate-300">
                                            →
                                        </span>{' '}
                                        {log.clock_out ?? 'En curso'}
                                    </span>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="h-8 shrink-0 rounded-full border-sidebar/20 bg-slate-50 px-4 text-[10px] font-black tracking-widest text-sidebar uppercase"
                                >
                                    {log.total_hours !== null
                                        ? formatHoursDecimal(log.total_hours)
                                        : 'Procesando...'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
