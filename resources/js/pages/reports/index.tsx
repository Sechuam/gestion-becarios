import { FormEvent, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ReportBuilderCard } from '@/components/reports/ReportBuilderCard';
import { ReportTemplatesCard } from '@/components/reports/ReportTemplatesCard';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { SaveReportTemplateCard } from '@/components/reports/SaveReportTemplateCard';
import type {
    ReportDatasetConfig,
    ReportFormat,
    ReportTemplate,
    ReportsSummary,
} from '@/components/reports/types';
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

    const columns = useMemo(
        () => datasets[dataset]?.columns ?? {},
        [dataset, datasets],
    );

    function changeDataset(value: string) {
        const nextColumns = Object.keys(datasets[value]?.columns ?? {});
        setDataset(value);
        setSelectedColumns(nextColumns);
        setGroupBy('');
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
                onSuccess: () => setTemplateName(''),
            },
        );
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
        if (groupBy) params.set('group_by', groupBy);

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
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />
            <div className="flex flex-col gap-5">
                <ReportsHeader summary={summary} />

                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
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
                        onDatasetChange={changeDataset}
                        onFormatChange={setFormat}
                        onStatusChange={setStatus}
                        onFromChange={setFrom}
                        onToChange={setTo}
                        onGroupByChange={setGroupBy}
                        onColumnToggle={toggleColumn}
                        onExport={exportReport}
                    />

                    <div className="space-y-5">
                        <SaveReportTemplateCard
                            templateName={templateName}
                            saving={saving}
                            selectedColumnsCount={selectedColumns.length}
                            onTemplateNameChange={setTemplateName}
                            onSubmit={submitTemplate}
                        />

                        <ReportTemplatesCard
                            templates={templates}
                            datasets={datasets}
                            onApplyTemplate={applyTemplate}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
