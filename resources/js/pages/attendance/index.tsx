import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Control horario', href: '/asistencia' },
];

export default function Index() {

    const handleClockIn = () => {
        router.post('/time-logs/clock-in', {}, {
            preserveScroll: true
        });
    };

    const handleClockOut = () => {
        router.post('/time-logs/clock-out', {}, {
            preserveScroll: true
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control Horario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 border-l-4 border-indigo-500">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h3 className="text-lg font-bold mb-2 font-mono text-indigo-500">
                            ⚡ REGISTRO DE HORAS
                        </h3>
                        <p className="mb-6 text-sm text-gray-500">
                            Registra la hora exacta a la que empiezas y terminas tu jornada.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleClockIn}
                                className="px-6 py-2 bg-emerald-500 text-white font-medium rounded shadow hover:bg-emerald-600 active:scale-95 transition-all"
                            >
                                Entrar a Trabajar
                            </button>

                            <button
                                onClick={handleClockOut}
                                className="px-6 py-2 bg-rose-500 text-white font-medium rounded shadow hover:bg-rose-600 active:scale-95 transition-all"
                            >
                                Terminar Jornada
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 md:min-h-min border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-muted-foreground italic">
                        El calendario y el historial mensual se mostrarán aquí.
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}

