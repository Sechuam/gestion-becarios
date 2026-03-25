import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative min-h-dvh bg-[#e7f4f7]">
            <div className="absolute inset-0 bg-[url('/images/becagest-logo.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c2f4d]/80 via-[#1b6d7a]/70 to-[#29b3a1]/70" />
            <div className="relative grid min-h-dvh flex-col items-center justify-center px-6 sm:px-8 lg:max-w-none lg:grid-cols-2 lg:px-0">
                <div className="relative hidden h-full flex-col justify-between p-10 text-white lg:flex">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center text-lg font-semibold"
                    >
                        <AppLogoIcon className="mr-2 h-8 w-32 object-contain" />
                        {name}
                    </Link>
                    <div className="relative z-20 max-w-md space-y-3">
                        <p className="text-2xl font-semibold">
                            Gestión de becarios con claridad y control
                        </p>
                        <p className="text-sm text-white/80">
                            Unifica prácticas, tareas y seguimiento en un solo
                            lugar.
                        </p>
                    </div>
                </div>
                <div className="w-full lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-12 w-56 object-contain" />
                    </Link>
                    <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-xl backdrop-blur">
                        <div className="mb-4 flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                            <h1 className="text-xl font-semibold text-slate-900">
                                {title}
                            </h1>
                            <p className="text-sm text-balance text-slate-600">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
