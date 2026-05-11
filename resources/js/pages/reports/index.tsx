import { FormEvent, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Download, FileBarChart2, FileSpreadsheet, Save } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DatasetConfig = {
    label: string;
    columns: Record<string, { heading: string }>;
};

type Template = {
    id: number;
    name: string;
    dataset: string;
    columns: string[];
    filters?: Record<string, string>;
    updated_at: string;
};

type Props = {
    datasets: Record<string, DatasetConfig>;
    templates: Template[];
    summary: {
        interns: number;
        tasks: number;
        time_logs: number;
        evaluations: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reportes e informes', href: '/reportes' },
];

export default function Index({ datasets, templates, summary }: Props) {
    const datasetKeys = Object.keys(datasets);
    const [dataset, setDataset] = useState(datasetKeys[0] ?? 'interns');
    const [format, setFormat] = useState<'xlsx' | 'pdf'>('xlsx');
    const [status, setStatus] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [selectedColumns, setSelectedColumns] = useState<string[]>(Object.keys(datasets[dataset]?.columns ?? {}));
    const [templateName, setTemplateName] = useState('');
    const [saving, setSaving] = useState(false);

    const columns = useMemo(() => datasets[dataset]?.columns ?? {}, [dataset, datasets]);

    function changeDataset(value: string) {
        const nextColumns = Object.keys(datasets[value]?.columns ?? {});
        setDataset(value);
        setSelectedColumns(nextColumns);
    }

    function toggleColumn(column: string) {
        const next = selectedColumns.includes(column)
            ? selectedColumns.filter((item) => item !== column)
            : [...selectedColumns, column];

        setSelectedColumns(next);
    }

    function submitTemplate(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        router.post('/reportes/plantillas', {
            name: templateName,
            dataset,
            columns: selectedColumns,
            filters: { status, from, to },
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
            onSuccess: () => setTemplateName(''),
        });
    }

    function exportReport() {
        const params = new URLSearchParams({
            dataset,
            format,
            columns: selectedColumns.join(','),
        });

        if (status) params.set('status', status);
        if (from) params.set('from', from);
        if (to) params.set('to', to);

        window.location.href = `/reportes/export?${params.toString()}`;
    }

    function applyTemplate(template: Template) {
        setDataset(template.dataset);
        setSelectedColumns(template.columns);
        setStatus(template.filters?.status ?? '');
        setFrom(template.filters?.from ?? '');
        setTo(template.filters?.to ?? '');
        setTemplateName(template.name);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />
            <div className="flex flex-col gap-5">
                <ModuleHeader
                    title="Reportes e informes"
                    description="Constructor de informes personalizables con exportación Excel/PDF y plantillas guardadas."
                    icon={<FileBarChart2 className="h-6 w-6" />}
                    metrics={[
                        { label: 'Becarios', value: summary.interns },
                        { label: 'Tareas', value: summary.tasks },
                        { label: 'Fichajes', value: summary.time_logs },
                        { label: 'Evaluaciones', value: summary.evaluations },
                    ]}
                />

                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-black">Constructor de informes</CardTitle>
                            <p className="text-sm text-slate-500">Elige origen, campos y filtros antes de exportar o guardar la plantilla.</p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Origen de datos</Label>
                                    <select
                                        value={dataset}
                                        onChange={(event) => changeDataset(event.target.value)}
                                        className="h-10 w-full rounded-lg border border-sidebar/10 bg-background px-3 text-sm"
                                    >
                                        {datasetKeys.map((key) => (
                                            <option key={key} value={key}>{datasets[key].label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Formato</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button type="button" variant={format === 'xlsx' ? 'default' : 'outline'} onClick={() => setFormat('xlsx')}>
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Excel
                                        </Button>
                                        <Button type="button" variant={format === 'pdf' ? 'default' : 'outline'} onClick={() => setFormat('pdf')}>
                                            <FileBarChart2 className="mr-2 h-4 w-4" />
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="active, completed..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Desde</Label>
                                    <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hasta</Label>
                                    <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Columnas</Label>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(columns).map(([key, column]) => (
                                        <label key={key} className="flex items-center gap-2 rounded-lg border border-sidebar/10 p-3 text-sm font-medium">
                                            <Checkbox checked={selectedColumns.includes(key)} onCheckedChange={() => toggleColumn(key)} />
                                            {column.heading}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" onClick={exportReport} disabled={selectedColumns.length === 0}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar informe
                                </Button>
                                <Badge variant="outline" className="rounded-lg">{selectedColumns.length} columnas seleccionadas</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-5">
                        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-lg font-black">Guardar plantilla</CardTitle>
                                <p className="text-sm text-slate-500">Conserva combinaciones de campos para repetir informes frecuentes.</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitTemplate} className="space-y-3">
                                    <Input value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="Informe mensual de seguimiento" />
                                    <Button
                                        type="submit"
                                        disabled={saving || selectedColumns.length === 0}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar plantilla
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-lg font-black">Plantillas guardadas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {templates.length === 0 ? (
                                    <EmptyState
                                        title="Sin plantillas todavía"
                                        description="Guarda tu primer informe personalizado para reutilizarlo más adelante."
                                        icon={<FileBarChart2 className="h-6 w-6 text-sidebar" />}
                                        className="rounded-lg border-dashed bg-slate-50/50"
                                    />
                                ) : (
                                    templates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => applyTemplate(template)}
                                            className="w-full rounded-lg border border-sidebar/10 p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-black text-slate-900 dark:text-white">{template.name}</p>
                                                <Badge variant="outline" className="rounded-lg">{datasets[template.dataset]?.label ?? template.dataset}</Badge>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">{template.columns.length} columnas configuradas</p>
                                        </button>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
