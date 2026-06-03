import { ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NonCompliantIntern } from './types';

type Props = {
    interns: NonCompliantIntern[];
};

export function NonComplianceCard({ interns }: Props) {
    return (
        <Card className="gap-0 rounded-xl border-slate-200 bg-white py-0 shadow-xs xl:max-h-[34rem] dark:border-[#2f4a62] dark:bg-[#142235]">
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="border-b border-slate-400 bg-slate-200 p-3 pb-2 dark:border-[#3c6270] dark:bg-[#22374d]">
                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-sidebar shadow-sm ring-1 ring-sidebar/10 dark:bg-[#142235]">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                    Incumplimientos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto p-3 xl:max-h-[29rem]">
                {interns.length > 0 ? (
                    interns.map((intern) => (
                        <div
                            key={intern.id}
                            className="group rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-200/70 hover:shadow-md dark:border-[#2c465c] dark:bg-[#17283c]"
                        >
                            <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-md dark:border-[#2c465c]">
                                    <AvatarImage
                                        src={intern.avatar}
                                        alt={intern.name}
                                    />
                                    <AvatarFallback className="bg-white text-xs font-black text-sidebar dark:bg-[#142235]">
                                        {intern.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-black text-slate-800 dark:text-white">
                                        {intern.name}
                                    </p>
                                    <p className="text-sm leading-snug font-medium text-slate-500 dark:text-[#8fa3b6]">
                                        Deuda de horas:{' '}
                                        <span className="font-black text-sidebar dark:text-white">
                                            {intern.debt}h
                                        </span>{' '}
                                        acumuladas.
                                    </p>
                                    <div className="mt-2 flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-[#8fa3b6]">
                                        <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sidebar shadow-sm dark:border-[#2c465c] dark:bg-[#142235] dark:text-white">
                                            Progreso: {intern.total_done}h /{' '}
                                            {intern.expected_hours}h
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
                        <p className="text-sm font-medium text-slate-500 italic">
                            No hay becarios con deuda horaria crítica en este
                            momento. <br /> El cumplimiento es óptimo en la red.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
