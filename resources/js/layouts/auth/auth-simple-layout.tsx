import { motion } from 'framer-motion';
import { fadeInHorizontal } from '@/lib/animations';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-dvh bg-[#e7f4f7]">
            <div className="absolute inset-0 bg-[url('/images/becagest-logo.png')] bg-cover bg-center opacity-40" />
            <div className="absolute inset-0 bg-linear-to-br from-[#08243f]/85 via-[#145d6a]/78 to-[#1f9d8f]/75" />

            <div className="relative flex min-h-dvh">
                <div className="relative hidden flex-1 items-center px-12 py-10 md:flex">
                    <motion.div
                        className="max-w-lg text-white"
                        variants={fadeInHorizontal}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                    >
                        <h2 className="text-4xl font-semibold leading-tight text-white">
                            Gestiona becarios sin complicaciones
                        </h2>
                        <p className="mt-3 text-base text-white/85">
                            Todo el control en un solo lugar, de forma clara y rápida.
                        </p>
                        <div className="mt-8 grid gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                                <div>
                                    <p className="font-medium">
                                        Asignación de tareas ágil
                                    </p>
                                    <p className="text-white/70">
                                        Kanban, filtros y prioridades para cada
                                        becario.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                                <div>
                                    <p className="font-medium">
                                        Seguimiento con historial
                                    </p>
                                    <p className="text-white/70">
                                        Estados, trazabilidad y comentarios
                                        en cada tarea.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                                <div>
                                    <p className="font-medium">
                                        Reportes listos para usar
                                    </p>
                                    <p className="text-white/70">
                                        Exporta datos y obtén métricas al instante.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <aside className="relative ml-auto flex min-h-dvh w-full max-w-md flex-col justify-center bg-white/95 px-8 py-10 shadow-2xl backdrop-blur md:rounded-l-3xl">
                    <div className="mb-6 space-y-2">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {title}
                        </h1>
                        <p className="text-sm text-slate-600">
                            {description}
                        </p>
                    </div>
                    <div>{children}</div>
                </aside>
            </div>
        </div>
    );
}
