import { ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NonCompliantIntern } from './types';

type Props = {
    interns: NonCompliantIntern[];
};

export function NonComplianceCard({ interns }: Props) {
    return (
        <Card className="rounded-xl border-sidebar/10 bg-white shadow-lg xl:max-h-[34rem] dark:bg-slate-900">
            <CardHeader className="border-b border-sidebar/5 bg-slate-50/30 p-3 pb-2 dark:bg-slate-800/30">
                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow shadow-sidebar/20">
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
                            className="group rounded-xl border border-sidebar/5 bg-slate-50/50 p-4 shadow-sm transition-all hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40"
                        >
                            <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-md dark:border-slate-700">
                                    <AvatarImage
                                        src={intern.avatar}
                                        alt={intern.name}
                                    />
                                    <AvatarFallback className="bg-sidebar/10 text-xs font-black text-sidebar">
                                        {intern.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-black text-slate-800 dark:text-white">
                                        {intern.name}
                                    </p>
                                    <p className="text-sm leading-snug font-medium text-slate-500 dark:text-slate-400">
                                        Deuda de horas:{' '}
                                        <span className="font-black text-sidebar dark:text-sidebar-foreground">
                                            {intern.debt}h
                                        </span>{' '}
                                        acumuladas.
                                    </p>
                                    <div className="mt-2 flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                        <span className="rounded-full border border-sidebar/15 bg-gradient-to-r from-sidebar/10 to-[#1f4f52]/10 px-3 py-1 text-sidebar dark:text-white">
                                            Progreso: {intern.total_done}h /{' '}
                                            {intern.expected_hours}h
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
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
