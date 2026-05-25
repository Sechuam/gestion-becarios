import {
    CalendarRange,
    Clock,
    GraduationCap,
    History as HistoryIcon,
    User,
} from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const internProfileTabs = [
    {
        value: 'resumen',
        label: 'Resumen',
        icon: Clock,
    },
    {
        value: 'personal',
        label: 'Información Personal',
        icon: User,
    },
    {
        value: 'academico',
        label: 'Academia y Empresa',
        icon: GraduationCap,
    },
    {
        value: 'asistencia',
        label: 'Horarios y Ausencias',
        icon: CalendarRange,
    },
    {
        value: 'seguimiento',
        label: 'Seguimiento',
        icon: HistoryIcon,
    },
];

export function InternProfileTabsNav() {
    return (
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:h-10 md:grid-cols-5">
            {internProfileTabs.map((tab) => (
                <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative h-10 w-full rounded-xl border-none bg-transparent px-2 text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase shadow-none transition-all data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                >
                    <div className="flex items-center gap-2">
                        <tab.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                    </div>
                </TabsTrigger>
            ))}
        </TabsList>
    );
}
