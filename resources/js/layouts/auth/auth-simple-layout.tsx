import { motion } from 'framer-motion';
import {
    BarChart3,
    CalendarCheck2,
    CheckCircle2,
    ClipboardList,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

import { fadeInHorizontal } from '@/lib/animations';
import type { AuthLayoutProps } from '@/types';
import ThemeToggleButton from '@/components/theme-toggle-button';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#f6f7f2] dark:bg-[#111922]">
            <div className="absolute inset-0">
                <img
                    src="/images/becagest-logo.png"
                    alt=""
                    className="h-full w-full object-cover object-center opacity-[0.08] dark:opacity-[0.05]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(246,247,242,0.96)_0%,rgba(231,238,232,0.92)_43%,rgba(43,48,54,0.96)_100%)] dark:bg-[linear-gradient(135deg,rgba(17,25,34,0.98)_0%,rgba(25,38,49,0.94)_48%,rgba(8,13,18,0.98)_100%)]" />
            </div>

            <div className="relative flex min-h-dvh">
                <div className="relative hidden flex-1 items-center px-10 py-10 lg:flex xl:px-16">
                    <motion.div
                        className="max-w-2xl"
                        variants={fadeInHorizontal}
                        initial="initial"
                        animate="animate"
                        transition={{
                            duration: 0.7,
                            delay: 0.2,
                            ease: 'easeOut',
                        }}
                    >
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#9fb6aa]/60 bg-white/72 px-3 py-1 text-xs font-black tracking-[0.16em] text-[#3b6f66] uppercase shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-[#b9d8d2]">
                            <Sparkles className="size-3.5" />
                            BecaGest
                        </div>
                        <h2 className="max-w-xl text-5xl leading-[1.03] font-black tracking-tight text-[#172033] xl:text-6xl dark:text-[#edf1f5]">
                            Continúa donde dejaste tu programa de prácticas.
                        </h2>
                        <p className="mt-5 max-w-lg text-lg leading-8 font-medium text-[#536073] dark:text-[#aeb9c7]">
                            Accede a expedientes, tareas, asistencia,
                            evaluaciones e informes desde un espacio preparado
                            para trabajar con claridad.
                        </p>

                        <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-[#d9e1d6] bg-white/82 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
                                <ClipboardList className="mb-3 size-5 text-[#4e7f78]" />
                                <div>
                                    <p className="font-black text-[#172033] dark:text-[#edf1f5]">
                                        Tareas al día
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#5a657c] dark:text-[#aeb9c7]">
                                        Kanban, prioridades y comentarios por
                                        becario.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#d9e1d6] bg-white/82 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
                                <CalendarCheck2 className="mb-3 size-5 text-[#4e7f78]" />
                                <div>
                                    <p className="font-black text-[#172033] dark:text-[#edf1f5]">
                                        Asistencia clara
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#5a657c] dark:text-[#aeb9c7]">
                                        Horarios, ausencias y justificantes bajo
                                        control.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#d9e1d6] bg-white/82 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
                                <BarChart3 className="mb-3 size-5 text-[#4e7f78]" />
                                <div>
                                    <p className="font-black text-[#172033] dark:text-[#edf1f5]">
                                        Informes listos
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#5a657c] dark:text-[#aeb9c7]">
                                        Métricas, PDF y Excel para revisar y
                                        compartir.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#d9e1d6] bg-[#2b3036] p-4 text-white shadow-sm dark:border-[#9fc6bf]/20 dark:bg-[#0f1720]">
                                <ShieldCheck className="mb-3 size-5 text-[#9fc6bf]" />
                                <p className="font-black">Acceso protegido</p>
                                <p className="mt-1 text-sm leading-6 text-white/72">
                                    Roles y permisos para cada perfil del
                                    programa.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-[#425067] dark:text-[#c9d2dc]">
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-[#4e7f78]" />
                                Admin
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-[#4e7f78]" />
                                Tutor
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-[#4e7f78]" />
                                Becario
                            </span>
                        </div>
                    </motion.div>
                </div>

                <aside className="relative ml-auto flex min-h-dvh w-full flex-col justify-center overflow-hidden bg-white/95 px-5 py-8 shadow-2xl shadow-slate-900/15 backdrop-blur sm:px-8 md:max-w-[31rem] md:rounded-l-3xl md:border-l md:border-white/60 dark:border-white/10 dark:bg-[#121b26]/96 dark:shadow-black/30">
                    <div className="absolute top-0 right-0 left-0 z-10 h-2.5 bg-[linear-gradient(90deg,#4e7f78,#2b3036)] md:rounded-tl-3xl dark:bg-[linear-gradient(90deg,#9fc6bf,#2b3036)]" />
                    <div className="absolute top-0 bottom-0 left-0 z-10 hidden w-px bg-[linear-gradient(180deg,rgba(159,198,191,0.7),rgba(255,255,255,0.16),rgba(159,198,191,0.28))] md:block dark:block" />
                    <ThemeToggleButton className="absolute top-6 right-6 z-20" />
                    <div className="mx-auto w-full max-w-sm">
                        <div className="mb-8 text-center">
                            <div className="relative mx-auto mt-6 mb-7 flex size-48 items-center justify-center rounded-full border border-[#d7e2db] bg-white shadow-[0_24px_64px_-34px_rgba(23,32,51,0.8)] dark:border-white/10 dark:bg-white/8 dark:shadow-black/30">
                                <div className="absolute inset-0 rounded-full bg-[#9fc6bf]/18 blur-2xl dark:bg-[#9fc6bf]/12" />
                                <div className="relative flex size-44 items-center justify-center overflow-hidden rounded-full bg-[#f6fbfa] p-3 ring-1 ring-[#e0ebe6] dark:bg-[#172432] dark:ring-white/10">
                                    <img
                                        src="/images/becagest-logo.png"
                                        alt="BecaGest"
                                        className="h-full w-full -translate-y-2 scale-[2.35] object-contain object-center"
                                    />
                                </div>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-[#172033] dark:text-[#edf1f5]">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-[#5a657c] dark:text-[#aeb9c7]">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </aside>
            </div>
        </div>
    );
}
