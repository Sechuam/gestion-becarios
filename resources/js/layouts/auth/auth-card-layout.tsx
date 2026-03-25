import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-[#e7f4f7] p-6 md:p-10">
            <div className="absolute inset-0 bg-[url('/images/becagest-logo.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-linear-to-br from-[#0c2f4d]/80 via-[#1b6d7a]/70 to-[#29b3a1]/70" />
            <div className="relative flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex h-14 w-56 items-center justify-center">
                        <AppLogoIcon className="h-full w-full object-contain" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-2xl border-white/20 bg-white/95 shadow-xl backdrop-blur">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
