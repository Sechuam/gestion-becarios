import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="BecaGest" />
            <div className="relative min-h-dvh bg-[#e7f4f7]">
                <div className="absolute inset-0 bg-[url('/images/becagest-logo.png')] bg-cover bg-center opacity-[0.12] blur-[1px] saturate-150" />
                <div className="absolute inset-0 bg-linear-to-br from-[#0c2f4d]/75 via-[#1b6d7a]/65 to-[#29b3a1]/65" />

                <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-white">
                    <div className="welcome-fade flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl space-y-7 text-center lg:text-left">
                            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                                Gestiona becarios y talento sin perder el
                                control
                            </h1>
                            <p className="text-base text-white/90 sm:text-lg">
                                Asigna tareas, da seguimiento y toma decisiones
                                con datos reales.
                            </p>
                            <ul className="space-y-3 text-sm text-white/85 sm:text-base">
                                <li>Kanban para tareas y seguimiento.</li>
                                <li>Gestión de prácticas desde un panel único.</li>
                                <li>Reportes con métricas listas para decisión.</li>
                            </ul>
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
                                {auth.user ? (
                                    <Link href={dashboard()}>
                                        <Button className="bg-white text-slate-900 hover:bg-white/90">
                                            Ir al dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={login()}>
                                            <Button className="bg-emerald-500 text-white hover:bg-emerald-400">
                                                Acceder
                                            </Button>
                                        </Link>
                                        {canRegister && (
                                            <Link href={register()}>
                                                <Button
                                                    variant="outline"
                                                    className="bg-emerald-500 text-white hover:bg-emerald-400"
                                                >
                                                    Crear cuenta
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-white/70 sm:text-sm">
                                Empieza gratis en segundos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes welcomeFade {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .welcome-fade {
                    animation: welcomeFade 0.8s ease-out both;
                }
            `}</style>
        </>
    );
}
