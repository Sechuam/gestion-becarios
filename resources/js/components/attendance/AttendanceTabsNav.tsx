import { CalendarClock, Clock3, FileText } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AttendanceTabsNav() {
    return (
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-xl border border-sidebar/10 bg-white p-1 shadow-sm sm:grid-cols-3 dark:bg-slate-900">
            <TabsTrigger
                value="registro"
                className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-sidebar data-[state=active]:text-white"
            >
                <Clock3 className="mr-2 h-4 w-4" />
                Registro de jornada
            </TabsTrigger>
            <TabsTrigger
                value="ausencias"
                className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-sidebar data-[state=active]:text-white"
            >
                <FileText className="mr-2 h-4 w-4" />
                Mis ausencias
            </TabsTrigger>
            <TabsTrigger
                value="calendario"
                className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-sidebar data-[state=active]:text-white"
            >
                <CalendarClock className="mr-2 h-4 w-4" />
                Calendario
            </TabsTrigger>
        </TabsList>
    );
}
