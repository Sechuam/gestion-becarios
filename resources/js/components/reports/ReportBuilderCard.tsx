import {
    Download,
    Eye,
    FileBarChart2,
    FileSpreadsheet,
    LayoutTemplate,
    Loader2,
    Save,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getEvaluationTypeLabel } from '@/lib/evaluation-type-labels';
import type { ReportDatasetConfig, ReportFormat, ReportPreview } from './types';

type Props = {
    datasets: Record<string, ReportDatasetConfig>;
    datasetKeys: string[];
    dataset: string;
    format: ReportFormat;
    status: string;
    from: string;
    to: string;
    groupBy: string;
    selectedColumns: string[];
    columns: Record<string, { heading: string }>;
    preview: ReportPreview | null;
    previewing: boolean;
    onDatasetChange: (value: string) => void;
    onFormatChange: (format: ReportFormat) => void;
    onStatusChange: (value: string) => void;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    onGroupByChange: (value: string) => void;
    onColumnToggle: (column: string) => void;
    onPreview: () => void;
    onExport: () => void;
    onOpenSaveTemplate: () => void;
    onOpenTemplates: () => void;
};

export function ReportBuilderCard({
    datasets,
    datasetKeys,
    dataset,
    format,
    status,
    from,
    to,
    groupBy,
    selectedColumns,
    columns,
    preview,
    previewing,
    onDatasetChange,
    onFormatChange,
    onStatusChange,
    onFromChange,
    onToChange,
    onGroupByChange,
    onColumnToggle,
    onPreview,
    onExport,
    onOpenSaveTemplate,
    onOpenTemplates,
}: Props) {
    const hasColumns = selectedColumns.length > 0;
    const statusLabels: Record<string, string> = {
        active: 'Activo',
        completed: 'Finalizado',
        abandoned: 'Abandonado',
        pending: 'Pendiente',
        in_progress: 'En progreso',
        in_review: 'En revisión',
        review: 'En revisión',
        rejected: 'Rechazado',
    };
    const priorityLabels: Record<string, string> = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente',
    };

    function previewValue(column: string, value: string | number | null) {
        if (column === 'status' && typeof value === 'string') {
            return statusLabels[value] ?? value;
        }

        if (column === 'priority' && typeof value === 'string') {
            return priorityLabels[value] ?? value;
        }

        if (column === 'type' && typeof value === 'string') {
            return getEvaluationTypeLabel(value);
        }

        return value ?? '-';
    }

    const statusOptions =
        dataset === 'interns'
            ? [
                  { value: 'active', label: 'Activo' },
                  { value: 'completed', label: 'Finalizado' },
                  { value: 'abandoned', label: 'Abandonado' },
              ]
            : dataset === 'tasks'
              ? [
                    { value: 'pending', label: 'Pendiente' },
                    { value: 'in_progress', label: 'En progreso' },
                    { value: 'in_review', label: 'En revisión' },
                    { value: 'completed', label: 'Finalizada' },
                    { value: 'rejected', label: 'Rechazada' },
                ]
              : [];

    return (
        <Card className="min-w-0 overflow-hidden border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="text-lg font-black">
                        Constructor de informes
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        Elige origen, campos y filtros antes de exportar o
                        guardar la plantilla.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
                        onClick={onOpenSaveTemplate}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar plantilla
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
                        onClick={onOpenTemplates}
                    >
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        Plantillas guardadas
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="min-w-0 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Origen de datos</Label>
                        <select
                            value={dataset}
                            onChange={(event) =>
                                onDatasetChange(event.target.value)
                            }
                            className="h-10 w-full rounded-lg border border-sidebar/10 bg-white px-3 text-sm dark:bg-slate-950"
                        >
                            {datasetKeys.map((key) => (
                                <option key={key} value={key}>
                                    {datasets[key].label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Formato</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={
                                    format === 'xlsx' ? 'default' : 'outline'
                                }
                                onClick={() => onFormatChange('xlsx')}
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    format === 'pdf' ? 'default' : 'outline'
                                }
                                onClick={() => onFormatChange('pdf')}
                            >
                                <FileBarChart2 className="mr-2 h-4 w-4" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <Label>Estado</Label>
                        <select
                            value={status}
                            onChange={(event) =>
                                onStatusChange(event.target.value)
                            }
                            disabled={statusOptions.length === 0}
                            className="h-10 w-full rounded-lg border border-sidebar/10 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-950 dark:disabled:bg-slate-900"
                        >
                            <option value="">
                                {statusOptions.length > 0
                                    ? 'Todos los estados'
                                    : 'Sin filtro de estado'}
                            </option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Desde</Label>
                        <Input
                            type="date"
                            value={from}
                            onChange={(event) =>
                                onFromChange(event.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Hasta</Label>
                        <Input
                            type="date"
                            value={to}
                            onChange={(event) => onToChange(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Agrupar por</Label>
                        <select
                            value={groupBy}
                            onChange={(event) =>
                                onGroupByChange(event.target.value)
                            }
                            className="h-10 w-full rounded-lg border border-sidebar/10 bg-white px-3 text-sm dark:bg-slate-950"
                        >
                            <option value="">Sin agrupación</option>
                            {Object.entries(columns).map(([key, column]) => (
                                <option key={key} value={key}>
                                    {column.heading}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Columnas</Label>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(columns).map(([key, column]) => (
                            <label
                                key={key}
                                className="flex items-center gap-2 rounded-lg border border-sidebar/10 p-3 text-sm font-medium"
                            >
                                <Checkbox
                                    checked={selectedColumns.includes(key)}
                                    onCheckedChange={() => onColumnToggle(key)}
                                />
                                {column.heading}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onPreview}
                        disabled={!hasColumns || previewing}
                    >
                        {previewing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Eye className="mr-2 h-4 w-4" />
                        )}
                        Vista previa
                    </Button>
                    <Button
                        type="button"
                        onClick={onExport}
                        disabled={!hasColumns}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar informe
                    </Button>
                    <Badge variant="outline" className="rounded-lg">
                        {selectedColumns.length} columnas seleccionadas
                    </Badge>
                </div>

                {preview && (
                    <div className="max-w-full min-w-0 rounded-xl border border-sidebar/10 bg-sidebar/5 p-3">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Vista previa
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Mostrando {preview.rows.length} de{' '}
                                    {preview.total} registros encontrados.
                                </p>
                            </div>
                            <Badge className="bg-sidebar text-sidebar-foreground">
                                Datos reales
                            </Badge>
                        </div>

                        {preview.rows.length > 0 ? (
                            <div className="max-w-full overflow-x-auto rounded-lg border border-sidebar/10 bg-white dark:bg-slate-950">
                                <div className="h-1 bg-linear-to-r from-sidebar to-sidebar-accent" />
                                <table className="min-w-full divide-y divide-sidebar/10 text-sm">
                                    <thead className="border-b border-slate-400 bg-slate-200 text-slate-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100">
                                        <tr>
                                            {preview.columns.map((column) => (
                                                <th
                                                    key={column}
                                                    className="px-3 py-2 text-left text-xs font-bold whitespace-nowrap text-slate-700 uppercase dark:text-slate-100"
                                                >
                                                    {preview.availableColumns[
                                                        column
                                                    ]?.heading ?? column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar/10">
                                        {preview.rows.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {preview.columns.map(
                                                    (column) => (
                                                        <td
                                                            key={column}
                                                            className="max-w-56 truncate px-3 py-2 text-slate-700 dark:text-slate-200"
                                                            title={String(
                                                                previewValue(
                                                                    column,
                                                                    row[column],
                                                                ),
                                                            )}
                                                        >
                                                            {previewValue(
                                                                column,
                                                                row[column],
                                                            )}
                                                        </td>
                                                    ),
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-sidebar/20 bg-white px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-950">
                                No hay registros para los filtros actuales.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
