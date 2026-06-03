import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mi cuenta',
        href: editAppearance(),
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajustes de apariencia" />

            <h1 className="sr-only">Ajustes de apariencia</h1>

            <SettingsLayout>
                <Card className="pt-0 pb-0">
                    <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
                    <CardHeader className="border-b border-slate-400 bg-slate-200 py-3 dark:border-[#2f4a62] dark:bg-[#1b2d42]">
                        <CardTitle className="text-slate-800 dark:text-[#edf1f5]">
                            Apariencia
                        </CardTitle>
                        <CardDescription>
                            Elige cómo quieres visualizar la interfaz en este
                            dispositivo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 py-5">
                        <AppearanceTabs />
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            El modo sistema seguirá automáticamente la
                            preferencia de apariencia configurada en tu equipo.
                        </p>
                    </CardContent>
                </Card>
            </SettingsLayout>
        </AppLayout>
    );
}
