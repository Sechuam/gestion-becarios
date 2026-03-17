import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/interns/StatusBadge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

type Props = {
    educationCenter: any;
    agreement_url?: string;
    interns: any;
    filters?: {
        search?: string;
        status?: string;
    };
};

export default function Show({ educationCenter, agreement_url, interns, filters }: Props) {
    const { auth } = usePage().props as any;
    const canManage = auth.user?.permissions?.includes('manage schools');
    const canExport = auth.user?.permissions?.includes('manage interns');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Centros Educativos', href: '/schools' },
        { title: educationCenter.name, href: `/schools/${educationCenter.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Centro: ${educationCenter.name}`} />

            <div className="flex flex-col gap-6 p-6 bg-background text-foreground">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {educationCenter.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Detalle del centro educativo y su histórico de becarios.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" asChild>
                            <Link href="/schools">Volver</Link>
                        </Button>
                        {canManage && (
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white" asChild>
                                <Link href={`/schools/${educationCenter.id}/edit`}>Editar</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4 rounded-xl border bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-foreground">Información del centro</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Código</p>
                                <p className="text-foreground font-medium">{educationCenter.code || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Ciudad</p>
                                <p className="text-foreground font-medium">{educationCenter.city || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Dirección</p>
                                <p className="text-foreground font-medium">{educationCenter.address || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Contacto</p>
                                <p className="text-foreground font-medium">{educationCenter.contact_person || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email del coordinador</p>
                                {educationCenter.contact_email ? (
                                    <a
                                        href={`mailto:${educationCenter.contact_email}`}
                                        className="text-foreground font-medium hover:underline"
                                    >
                                        {educationCenter.contact_email}
                                    </a>
                                ) : (
                                    <p className="text-foreground font-medium">—</p>
                                )}
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email institucional</p>
                                {educationCenter.email ? (
                                    <a
                                        href={`mailto:${educationCenter.email}`}
                                        className="text-foreground font-medium hover:underline"
                                    >
                                        {educationCenter.email}
                                    </a>
                                ) : (
                                    <p className="text-foreground font-medium">—</p>
                                )}
                            </div>
                            <div>
                                <p className="text-muted-foreground">Teléfono</p>
                                <p className="text-foreground font-medium">{educationCenter.phone || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Web</p>
                                {educationCenter.web ? (
                                    <a href={educationCenter.web} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                        {educationCenter.web}
                                    </a>
                                ) : (
                                    <p className="text-foreground font-medium">—</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl border bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-foreground">Convenio</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Fecha de firma</p>
                                <p className="text-foreground font-medium">{educationCenter.agreement_signed_at || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Fecha de vencimiento</p>
                                <p className="text-foreground font-medium">{educationCenter.agreement_expires_at || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Plazas acordadas</p>
                                <p className="text-foreground font-medium">{educationCenter.agreement_slots ?? '—'}</p>
                            </div>
                            {agreement_url && (
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted" asChild>
                                        <a href={agreement_url} target="_blank" rel="noreferrer">
                                            Ver convenio PDF
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted" asChild>
                                        <a href={agreement_url} download>
                                            Descargar
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-4 p-5 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                            <Input
                                placeholder="Buscar becario por nombre..."
                                className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                                defaultValue={filters?.search}
                                onChange={(e) =>
                                    router.get(
                                        `/schools/${educationCenter.id}`,
                                        { search: e.target.value, status: filters?.status },
                                        { preserveState: true, preserveScroll: true, replace: true }
                                    )
                                }
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">Estado</label>
                            <select
                                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                value={filters?.status ?? ''}
                                onChange={(e) =>
                                    router.get(
                                        `/schools/${educationCenter.id}`,
                                        { search: filters?.search, status: e.target.value || undefined },
                                        { preserveState: true, preserveScroll: true, replace: true }
                                    )
                                }
                            >
                                <option value="">Todos</option>
                                <option value="active">Activo</option>
                                <option value="completed">Finalizado</option>
                                <option value="abandoned">Abandonado</option>
                            </select>
                        </div>
                        {canExport && (
                            <Button
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted"
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    if (filters?.search) params.set('search', filters.search);
                                    if (filters?.status) params.set('status', filters.status);
                                    const query = params.toString();
                                    window.open(
                                        `/schools/${educationCenter.id}/export${query ? `?${query}` : ''}`
                                    );
                                }}
                            >
                                Exportar Excel
                            </Button>
                        )}
                        <p className="text-sm text-muted-foreground ml-auto font-medium">
                            Mostrando {interns.data.length} de {interns.total} becarios
                        </p>
                    </div>

                    <div className="w-full rounded-xl border bg-card border-border dark:border-slate-700/70 dark:bg-slate-900/60 shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-[900px] w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b bg-muted border-b-border dark:border-slate-700/70 dark:bg-slate-800/70">
                                        <th className="px-4 py-4 text-left font-semibold text-foreground">Becario</th>
                                        <th className="px-4 py-4 text-left font-semibold text-foreground">Email</th>
                                        <th className="px-4 py-4 text-left font-semibold text-foreground">Titulación</th>
                                        <th className="px-4 py-4 text-left font-semibold text-foreground">Inicio</th>
                                        <th className="px-4 py-4 text-left font-semibold text-foreground">Fin</th>
                                        <th className="px-4 py-4 text-left font-semibold text-foreground">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interns.data.map((intern: any) => (
                                        <tr
                                            key={intern.id}
                                            className="border-b border-border dark:border-slate-700/70 hover:bg-muted/60 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-foreground">
                                                {intern.user?.name ? (
                                                    <Link
                                                        href={`/interns/${intern.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {intern.user.name}
                                                    </Link>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                                <td className="px-4 py-4 text-muted-foreground">
                                                    {intern.user?.email ? (
                                                        <a href={`mailto:${intern.user.email}`} className="hover:underline">
                                                            {intern.user.email}
                                                        </a>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                            <td className="px-4 py-4 text-muted-foreground">{intern.academic_degree || '—'}</td>
                                            <td className="px-4 py-4 text-muted-foreground">{intern.start_date || '—'}</td>
                                            <td className="px-4 py-4 text-muted-foreground">{intern.end_date || '—'}</td>
                                            <td className="px-4 py-4">
                                                <StatusBadge status={intern.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {interns.links.map((link: any, i: number) => {
                            const label = link.label.replace('Previous', 'Anterior').replace('Next', 'Siguiente');
                            return (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={`px-3 py-1 text-sm rounded border border-border ${
                                        link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                    } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                    preserveState
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
