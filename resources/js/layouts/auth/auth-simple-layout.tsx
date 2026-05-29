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

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#f6f7f2]">
            <div className="absolute inset-0">
                <img
                    src="/images/becagest-logo.png"
                    alt=""
                    className="h-full w-full object-cover object-center opacity-[0.08]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(246,247,242,0.96)_0%,rgba(231,238,232,0.92)_43%,rgba(43,48,54,0.96)_100%)]" />
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
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#9fb6aa]/60 bg-white/72 px-3 py-1 text-xs font-black tracking-[0.16em] text-[#3b6f66] uppercase shadow-sm">
                            <Sparkles className="size-3.5" />
                            BecaGest
                        </div>
                        <h2 className="max-w-xl text-5xl leading-[1.03] font-black tracking-tight text-[#172033] xl:text-6xl">
                            Continúa donde dejaste tu programa de prácticas.
                        </h2>
                        <p className="mt-5 max-w-lg text-lg leading-8 font-medium text-[#536073]">
                            Accede a expedientes, tareas, asistencia,
                            evaluaciones e informes desde un espacio preparado
                            para trabajar con claridad.
                        </p>

                        <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-[#d9e1d6] bg-white/82 p-4 shadow-sm backdrop-blur">
                                <ClipboardList className="mb-3 size-5 text-[#4e7f78]" />
                                <div>
                                    <p className="font-black text-[#172033]">
                                        Tareas al día
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#5a657c]">
                                        Kanban, prioridades y comentarios por
                                        becario.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#d9e1d6] bg-white/82 p-4 shadow-sm backdrop-blur">
                                <CalendarCheck2 className="mb-3 size-5 text-[#4e7f78]" />
                                <div>
                                    <p className="font-black text-[#172033]">
                                        Asistencia clara
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#5a657c]">
                                        Horarios, ausencias y justificantes bajo
                                        control.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#d9e1d6] bg-white/82 p-4 shadow-sm backdrop-blur">
                                <BarChart3 className="mb-3 size-5 text-[#4e7f78]" />
                                <div>
                                    <p className="font-black text-[#172033]">
                                        Informes listos
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#5a657c]">
                                        Métricas, PDF y Excel para revisar y
                                        compartir.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#d9e1d6] bg-[#2b3036] p-4 text-white shadow-sm">
                                <ShieldCheck className="mb-3 size-5 text-[#9fc6bf]" />
                                <p className="font-black">Acceso protegido</p>
                                <p className="mt-1 text-sm leading-6 text-white/72">
                                    Roles y permisos para cada perfil del
                                    programa.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-[#425067]">
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

                <aside className="relative ml-auto flex min-h-dvh w-full flex-col justify-center bg-white/95 px-5 py-8 shadow-2xl shadow-slate-900/15 backdrop-blur sm:px-8 md:max-w-[29rem] lg:rounded-l-3xl lg:border-l lg:border-white/60">
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-[linear-gradient(90deg,#4e7f78,#2b3036)] lg:rounded-tl-3xl" />
                    <div className="mx-auto w-full max-w-sm">
                        <div className="mb-8 text-center">
                            <img
                                src="/images/becagest-logo-small.png"
                                alt=""
                                className="mx-auto mb-5 size-14 rounded-xl bg-[#f6f7f2] object-contain p-2 shadow-sm"
                            />
                            <h1 className="text-3xl font-black tracking-tight text-[#172033]">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-[#5a657c]">
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
