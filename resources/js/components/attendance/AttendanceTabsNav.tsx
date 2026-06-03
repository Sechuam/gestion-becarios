import { CalendarClock, Clock3, FileText } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AttendanceTabsNav({ isIntern = true }: { isIntern?: boolean }) {
    if (!isIntern) {
        return (
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-xl border border-[#d9e1d6] bg-white/88 p-1 shadow-sm backdrop-blur dark:bg-[#142235]">
                <TabsTrigger
                    value="gestion"
                    className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-[#d9e9e4] data-[state=active]:text-[#315d58] data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#2f4a62] dark:data-[state=active]:text-white"
                >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Gestión horaria
                </TabsTrigger>
            </TabsList>
        );
    }

    return (
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-xl border border-[#d9e1d6] bg-white/88 p-1 shadow-sm backdrop-blur sm:grid-cols-3 dark:bg-[#142235]">
            <TabsTrigger
                value="registro"
                className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-[#d9e9e4] data-[state=active]:text-[#315d58] data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#2f4a62] dark:data-[state=active]:text-white"
            >
                <Clock3 className="mr-2 h-4 w-4" />
                Registro de jornada
            </TabsTrigger>
            <TabsTrigger
                value="ausencias"
                className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-[#d9e9e4] data-[state=active]:text-[#315d58] data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#2f4a62] dark:data-[state=active]:text-white"
            >
                <FileText className="mr-2 h-4 w-4" />
                Mis ausencias
            </TabsTrigger>
            <TabsTrigger
                value="calendario"
                className="h-10 rounded-lg text-xs font-black tracking-widest uppercase data-[state=active]:bg-[#d9e9e4] data-[state=active]:text-[#315d58] data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#2f4a62] dark:data-[state=active]:text-white"
            >
                <CalendarClock className="mr-2 h-4 w-4" />
                Calendario
            </TabsTrigger>
        </TabsList>
    );
}
