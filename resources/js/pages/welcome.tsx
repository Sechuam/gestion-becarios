import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    BookOpenCheck,
    CalendarCheck2,
    CheckCircle2,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutDashboard,
    MessagesSquare,
    ShieldCheck,
    Sparkles,
    UsersRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const modules = [
    {
        icon: UsersRound,
        title: 'Becarios y centros',
        description:
            'Expedientes, tutores, centros educativos, notas internas y documentación en un único lugar.',
    },
    {
        icon: ClipboardList,
        title: 'Tareas y seguimiento',
        description:
            'Tableros Kanban, asignaciones, comentarios y estados para saber qué necesita atención.',
    },
    {
        icon: CalendarCheck2,
        title: 'Asistencia y ausencias',
        description:
            'Registro horario, calendarios, incidencias y justificantes con control por rol.',
    },
    {
        icon: BookOpenCheck,
        title: 'Evaluaciones',
        description:
            'Criterios, rúbricas, autoevaluaciones y puntuaciones históricas preparadas para revisar.',
    },
    {
        icon: BarChart3,
        title: 'Informes y métricas',
        description:
            'Dashboards, KPIs, plantillas y exportaciones en PDF o Excel para tomar decisiones.',
    },
    {
        icon: MessagesSquare,
        title: 'Comunicación',
        description:
            'Mensajes y avisos centralizados para mantener conectados a administradores, tutores y becarios.',
    },
];

const workflow = [
    'Invita a tutores y becarios con roles definidos.',
    'Organiza prácticas, horarios, tareas y documentación.',
    'Supervisa progreso, asistencia, evaluaciones e informes.',
];

const dashboardStats = [
    ['Becarios activos', '48', '+12%'],
    ['Tareas en curso', '126', '32 urgentes'],
    ['Asistencia semanal', '94%', 'estable'],
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="BecaGest | Gestión integral de becarios" />

            <main className="min-h-dvh overflow-hidden bg-[#f6f7f2] text-[#172033]">
                <section className="relative min-h-[92dvh] border-b border-[#d7ded2]">
                    <div className="absolute inset-0">
                        <img
                            src="/images/becagest-logo.png"
                            alt=""
                            className="h-full w-full object-cover object-center opacity-[0.08]"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(246,247,242,0.96)_0%,rgba(230,238,232,0.94)_46%,rgba(43,48,54,0.9)_100%)]" />
                    </div>

                    <motion.header
                        initial={{ opacity: 0, y: -14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8"
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                            aria-label="BecaGest"
                        >
                            <span className="flex size-10 overflow-hidden rounded-lg bg-white shadow-sm">
                                <img
                                    src="/images/becagest-logo-small.png"
                                    alt=""
                                    className="h-full w-full scale-125 object-cover object-center"
                                />
                            </span>
                            <span className="text-lg font-black tracking-tight">
                                BecaGest
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#4f5b6b] md:flex">
                            <a href="#modulos" className="hover:text-[#172033]">
                                Módulos
                            </a>
                            <a href="#flujo" className="hover:text-[#172033]">
                                Flujo
                            </a>
                            <a
                                href="#informes"
                                className="hover:text-[#172033]"
                            >
                                Informes
                            </a>
                        </nav>

                        {auth.user ? (
                            <Button asChild className="bg-[#2b3036] text-white">
                                <Link href={dashboard()}>
                                    Dashboard
                                    <ArrowRight />
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost">
                                    <Link href={login()}>Acceder</Link>
                                </Button>
                                {canRegister && (
                                    <Button
                                        asChild
                                        className="hidden bg-[#2b3036] text-white sm:inline-flex"
                                    >
                                        <Link href={register()}>
                                            Crear cuenta
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </motion.header>

                    <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pt-8 pb-14 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:pt-14 lg:pb-20">
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                            className="max-w-3xl"
                        >
                            <motion.div
                                variants={fadeUp}
                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9fb6aa]/60 bg-white/72 px-3 py-1 text-xs font-bold tracking-[0.16em] text-[#3b6f66] uppercase shadow-sm"
                            >
                                <Sparkles className="size-3.5" />
                                Plataforma de prácticas
                            </motion.div>
                            <motion.h1
                                variants={fadeUp}
                                transition={{ duration: 0.65, ease: 'easeOut' }}
                                className="max-w-4xl text-5xl leading-[1.02] font-black tracking-tight text-[#172033] sm:text-6xl lg:text-7xl"
                            >
                                Gestiona becarios, tutores y prácticas sin
                                perder el pulso.
                            </motion.h1>
                            <motion.p
                                variants={fadeUp}
                                transition={{ duration: 0.65, ease: 'easeOut' }}
                                className="mt-6 max-w-2xl text-lg leading-8 font-medium text-[#536073] sm:text-xl"
                            >
                                BecaGest reúne expedientes, tareas, asistencia,
                                evaluaciones, mensajes e informes para que cada
                                programa de prácticas avance con claridad.
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                transition={{ duration: 0.65, ease: 'easeOut' }}
                                className="mt-9 flex flex-col gap-3 sm:flex-row"
                            >
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-[#2b3036] text-white shadow-xl shadow-slate-900/15 hover:bg-[#3b424b]"
                                >
                                    <Link
                                        href={auth.user ? dashboard() : login()}
                                    >
                                        {auth.user
                                            ? 'Entrar al dashboard'
                                            : 'Acceder a BecaGest'}
                                        <ArrowRight />
                                    </Link>
                                </Button>
                                {canRegister && !auth.user && (
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="border-[#b9c8be] bg-white/75"
                                    >
                                        <Link href={register()}>
                                            Solicitar acceso
                                        </Link>
                                    </Button>
                                )}
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                transition={{ duration: 0.65, ease: 'easeOut' }}
                                className="mt-10 grid max-w-2xl gap-3 text-sm font-semibold text-[#425067] sm:grid-cols-3"
                            >
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-[#4e7f78]" />
                                    Roles y permisos
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-[#4e7f78]" />
                                    Exportaciones PDF
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-[#4e7f78]" />
                                    Seguimiento diario
                                </span>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 36, scale: 0.96 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.2,
                                ease: 'easeOut',
                            }}
                            className="relative"
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="rounded-2xl border border-white/60 bg-white/82 p-4 shadow-2xl shadow-slate-900/18 backdrop-blur"
                            >
                                <div className="rounded-xl border border-[#d7ded2] bg-[#fbfcf9] p-4">
                                    <div className="flex items-center justify-between border-b border-[#e1e7de] pb-4">
                                        <div>
                                            <p className="text-xs font-bold tracking-[0.14em] text-[#6a7687] uppercase">
                                                Panel operativo
                                            </p>
                                            <h2 className="mt-1 text-xl font-black">
                                                Resumen de prácticas
                                            </h2>
                                        </div>
                                        <div className="rounded-lg bg-[#d9e9e4] p-2 text-[#315d58]">
                                            <LayoutDashboard className="size-5" />
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        {dashboardStats.map(
                                            ([label, value, meta]) => (
                                                <div
                                                    key={label}
                                                    className="rounded-lg border border-[#dde5da] bg-white p-3"
                                                >
                                                    <p className="text-xs font-semibold text-[#6a7687]">
                                                        {label}
                                                    </p>
                                                    <p className="mt-2 text-2xl font-black">
                                                        {value}
                                                    </p>
                                                    <p className="text-xs font-bold text-[#4e7f78]">
                                                        {meta}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
                                        <div className="rounded-lg border border-[#dde5da] bg-white p-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="font-bold">
                                                    Progreso por fase
                                                </p>
                                                <span className="rounded-full bg-[#eef3ed] px-2 py-1 text-xs font-bold">
                                                    Mayo
                                                </span>
                                            </div>
                                            {[78, 62, 44, 91].map(
                                                (value, index) => (
                                                    <div
                                                        key={value}
                                                        className="mb-3 last:mb-0"
                                                    >
                                                        <div className="mb-1 flex justify-between text-xs font-semibold text-[#667286]">
                                                            <span>
                                                                Grupo{' '}
                                                                {index + 1}
                                                            </span>
                                                            <span>
                                                                {value}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-[#edf1ea]">
                                                            <motion.div
                                                                initial={{
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    width: `${value}%`,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    delay:
                                                                        0.65 +
                                                                        index *
                                                                            0.12,
                                                                    ease: 'easeOut',
                                                                }}
                                                                className="h-2 rounded-full bg-[#4e7f78]"
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.55,
                                                delay: 0.85,
                                                ease: 'easeOut',
                                            }}
                                            className="rounded-lg border border-[#dde5da] bg-[#2b3036] p-4 text-white"
                                        >
                                            <p className="text-sm font-bold">
                                                Próximas acciones
                                            </p>
                                            <div className="mt-4 space-y-3 text-sm text-white/82">
                                                <p className="flex gap-2">
                                                    <span className="mt-1 size-2 rounded-full bg-[#9fc6bf]" />
                                                    Revisar 6 evaluaciones
                                                </p>
                                                <p className="flex gap-2">
                                                    <span className="mt-1 size-2 rounded-full bg-[#d6a055]" />
                                                    Validar 3 ausencias
                                                </p>
                                                <p className="flex gap-2">
                                                    <span className="mt-1 size-2 rounded-full bg-[#aab6c4]" />
                                                    Exportar informe semanal
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <section id="modulos" className="px-5 py-20 sm:px-8">
                    <div className="mx-auto max-w-7xl">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="max-w-3xl"
                        >
                            <p className="text-sm font-black tracking-[0.16em] text-[#4e7f78] uppercase">
                                Todo conectado
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                                Una mesa de control para cada parte del
                                programa.
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {modules.map((module) => (
                                <motion.article
                                    key={module.title}
                                    variants={fadeUp}
                                    transition={{
                                        duration: 0.5,
                                        ease: 'easeOut',
                                    }}
                                    className="rounded-xl border border-[#d9e1d6] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                                >
                                    <div className="mb-5 inline-flex rounded-lg bg-[#d9e9e4] p-3 text-[#315d58]">
                                        <module.icon className="size-6" />
                                    </div>
                                    <h3 className="text-xl font-black">
                                        {module.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-[#5a657c]">
                                        {module.description}
                                    </p>
                                </motion.article>
                            ))}
                        </motion.div>
                    </div>
                </section>

                <section
                    id="flujo"
                    className="border-y border-[#d7ded2] bg-white px-5 py-20 sm:px-8"
                >
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-center">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <p className="text-sm font-black tracking-[0.16em] text-[#4e7f78] uppercase">
                                Flujo claro
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                                Del alta inicial al informe final, sin saltos
                                entre herramientas.
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-[#5a657c]">
                                Administradores, tutores y becarios trabajan en
                                la misma plataforma, pero cada rol ve solo lo
                                que necesita para avanzar.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.25 }}
                            className="grid gap-4"
                        >
                            {workflow.map((item, index) => (
                                <motion.div
                                    key={item}
                                    variants={fadeUp}
                                    transition={{
                                        duration: 0.5,
                                        ease: 'easeOut',
                                    }}
                                    className="flex gap-4 rounded-xl border border-[#d9e1d6] bg-[#f8faf6] p-5"
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2b3036] text-sm font-black text-white">
                                        {index + 1}
                                    </span>
                                    <p className="pt-1 text-lg font-bold">
                                        {item}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                <section id="informes" className="px-5 py-20 sm:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                        className="mx-auto grid max-w-7xl gap-10 rounded-2xl bg-[#2b3036] p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center"
                    >
                        <div>
                            <div className="mb-5 inline-flex rounded-lg bg-white/10 p-3 text-[#9fc6bf]">
                                <FileText className="size-7" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                                Informes listos para dirección, coordinación y
                                seguimiento.
                            </h2>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/76">
                                Exporta asistencia, evolución, tareas y
                                evaluación con datos consistentes. Menos hojas
                                sueltas, más decisiones con contexto.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {[
                                [
                                    'PDF y Excel',
                                    'Reportes preparados para compartir.',
                                ],
                                [
                                    'KPIs por rol',
                                    'Indicadores relevantes para cada perfil.',
                                ],
                                [
                                    'Historial auditable',
                                    'Cambios y estados trazables.',
                                ],
                            ].map(([title, description]) => (
                                <div
                                    key={title}
                                    className="rounded-xl border border-white/12 bg-white/8 p-5"
                                >
                                    <div className="mb-2 flex items-center gap-3">
                                        <ShieldCheck className="size-5 text-[#9fc6bf]" />
                                        <h3 className="font-black">{title}</h3>
                                    </div>
                                    <p className="text-sm text-white/70">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                <section className="px-5 pb-20 sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 border-t border-[#d7ded2] pt-10 md:flex-row md:items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <GraduationCap className="size-7 text-[#4e7f78]" />
                                <h2 className="text-2xl font-black">
                                    BecaGest
                                </h2>
                            </div>
                            <p className="mt-3 max-w-xl text-[#5a657c]">
                                Una plataforma pensada para que la gestión de
                                prácticas sea ordenada, medible y fácil de
                                acompañar.
                            </p>
                        </div>
                        <Button
                            asChild
                            size="lg"
                            className="bg-[#2b3036] text-white hover:bg-[#3b424b]"
                        >
                            <Link href={auth.user ? dashboard() : login()}>
                                {auth.user
                                    ? 'Volver al dashboard'
                                    : 'Entrar ahora'}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
