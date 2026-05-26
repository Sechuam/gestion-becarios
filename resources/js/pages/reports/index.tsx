import { Head, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { ReportBuilderCard } from '@/components/reports/ReportBuilderCard';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportTemplatesCard } from '@/components/reports/ReportTemplatesCard';
import { SaveReportTemplateCard } from '@/components/reports/SaveReportTemplateCard';
import type {
    ReportDatasetConfig,
    ReportFormat,
    ReportPreview,
    ReportTemplate,
    ReportsSummary,
} from '@/components/reports/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    datasets: Record<string, ReportDatasetConfig>;
    templates: ReportTemplate[];
    summary: ReportsSummary;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reportes e informes', href: '/reportes' },
];

export default function Index({ datasets, templates, summary }: Props) {
    const datasetKeys = Object.keys(datasets);
    const [dataset, setDataset] = useState(datasetKeys[0] ?? 'interns');
    const [format, setFormat] = useState<ReportFormat>('xlsx');
    const [status, setStatus] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [groupBy, setGroupBy] = useState('');
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        Object.keys(datasets[dataset]?.columns ?? {}),
    );
    const [templateName, setTemplateName] = useState('');
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState<ReportPreview | null>(null);
    const [previewing, setPreviewing] = useState(false);
    const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
    const [templatesOpen, setTemplatesOpen] = useState(false);

    const columns = useMemo(
        () => datasets[dataset]?.columns ?? {},
        [dataset, datasets],
    );

    function changeDataset(value: string) {
        const nextColumns = Object.keys(datasets[value]?.columns ?? {});
        setDataset(value);
        setSelectedColumns(nextColumns);
        setStatus('');
        setGroupBy('');
        setPreview(null);
    }

    function toggleColumn(column: string) {
        const next = selectedColumns.includes(column)
            ? selectedColumns.filter((item) => item !== column)
            : [...selectedColumns, column];

        setSelectedColumns(next);
        setPreview(null);
    }

    function updateStatus(value: string) {
        setStatus(value);
        setPreview(null);
    }

    function updateFrom(value: string) {
        setFrom(value);
        setPreview(null);
    }

    function updateTo(value: string) {
        setTo(value);
        setPreview(null);
    }

    function updateGroupBy(value: string) {
        setGroupBy(value);
        setPreview(null);
    }

    function submitTemplate(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        router.post(
            '/reportes/plantillas',
            {
                name: templateName,
                dataset,
                columns: selectedColumns,
                filters: { status, from, to, group_by: groupBy },
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    setTemplateName('');
                    setSaveTemplateOpen(false);
                },
            },
        );
    }

    function buildReportParams(includeFormat = false) {
        const params = new URLSearchParams({
            dataset,
            columns: selectedColumns.join(','),
        });

        if (includeFormat) params.set('format', format);
        if (status) params.set('status', status);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (groupBy) params.set('group_by', groupBy);

        return params;
    }

    async function previewReport() {
        setPreviewing(true);

        try {
            const response = await fetch(
                `/reportes/preview?${buildReportParams().toString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('No se pudo generar la vista previa.');
            }

            setPreview((await response.json()) as ReportPreview);
        } finally {
            setPreviewing(false);
        }
    }

    function exportReport() {
        const params = buildReportParams(true);

        window.location.href = `/reportes/export?${params.toString()}`;
    }

    function applyTemplate(template: ReportTemplate) {
        setDataset(template.dataset);
        setSelectedColumns(template.columns);
        setStatus(template.filters?.status ?? '');
        setFrom(template.filters?.from ?? '');
        setTo(template.filters?.to ?? '');
        setGroupBy(template.filters?.group_by ?? '');
        setTemplateName(template.name);
        setPreview(null);
        setTemplatesOpen(false);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />
            <div className="flex min-w-0 flex-col gap-3">
                <ReportsHeader summary={summary} />

                <ReportBuilderCard
                    datasets={datasets}
                    datasetKeys={datasetKeys}
                    dataset={dataset}
                    format={format}
                    status={status}
                    from={from}
                    to={to}
                    groupBy={groupBy}
                    selectedColumns={selectedColumns}
                    columns={columns}
                    preview={preview}
                    previewing={previewing}
                    onDatasetChange={changeDataset}
                    onFormatChange={setFormat}
                    onStatusChange={updateStatus}
                    onFromChange={updateFrom}
                    onToChange={updateTo}
                    onGroupByChange={updateGroupBy}
                    onColumnToggle={toggleColumn}
                    onPreview={previewReport}
                    onExport={exportReport}
                    onOpenSaveTemplate={() => setSaveTemplateOpen(true)}
                    onOpenTemplates={() => setTemplatesOpen(true)}
                />
            </div>

            <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
                <DialogContent className="overflow-hidden border-sidebar/10 p-0 shadow-xl sm:max-w-lg [&>button]:text-white [&>button]:hover:bg-white/10">
                    <DialogHeader className="bg-sidebar px-6 py-5 text-white">
                        <DialogTitle className="text-left text-xl font-black text-white">
                            Guardar plantilla
                        </DialogTitle>
                        <DialogDescription className="text-left text-white/75">
                            Guarda la configuración actual del constructor para
                            reutilizarla más adelante.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        <SaveReportTemplateCard
                            templateName={templateName}
                            saving={saving}
                            selectedColumnsCount={selectedColumns.length}
                            onTemplateNameChange={setTemplateName}
                            onSubmit={submitTemplate}
                            framed={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
                <DialogContent className="max-h-[85vh] overflow-hidden border-sidebar/10 p-0 shadow-xl sm:max-w-3xl [&>button]:text-white [&>button]:hover:bg-white/10">
                    <DialogHeader className="bg-sidebar px-6 py-5 text-white">
                        <DialogTitle className="text-left text-xl font-black text-white">
                            Plantillas guardadas
                        </DialogTitle>
                        <DialogDescription className="text-left text-white/75">
                            Aplica una plantilla al constructor o administra sus
                            nombres.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[calc(85vh-112px)] overflow-y-auto p-6">
                        <ReportTemplatesCard
                            templates={templates}
                            datasets={datasets}
                            onApplyTemplate={applyTemplate}
                            framed={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
