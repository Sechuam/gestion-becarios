import { Download, FileBarChart2, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ReportDatasetConfig, ReportFormat } from './types';

type Props = {
    datasets: Record<string, ReportDatasetConfig>;
    datasetKeys: string[];
    dataset: string;
    format: ReportFormat;
    status: string;
    from: string;
    to: string;
    selectedColumns: string[];
    columns: Record<string, { heading: string }>;
    onDatasetChange: (value: string) => void;
    onFormatChange: (format: ReportFormat) => void;
    onStatusChange: (value: string) => void;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    onColumnToggle: (column: string) => void;
    onExport: () => void;
};

export function ReportBuilderCard({
    datasets,
    datasetKeys,
    dataset,
    format,
    status,
    from,
    to,
    selectedColumns,
    columns,
    onDatasetChange,
    onFormatChange,
    onStatusChange,
    onFromChange,
    onToChange,
    onColumnToggle,
    onExport,
}: Props) {
    return (
        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-lg font-black">
                    Constructor de informes
                </CardTitle>
                <p className="text-sm text-slate-500">
                    Elige origen, campos y filtros antes de exportar o guardar
                    la plantilla.
                </p>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Origen de datos</Label>
                        <select
                            value={dataset}
                            onChange={(event) =>
                                onDatasetChange(event.target.value)
                            }
                            className="h-10 w-full rounded-lg border border-sidebar/10 bg-background px-3 text-sm"
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

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input
                            value={status}
                            onChange={(event) =>
                                onStatusChange(event.target.value)
                            }
                            placeholder="active, completed..."
                        />
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
                        onClick={onExport}
                        disabled={selectedColumns.length === 0}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar informe
                    </Button>
                    <Badge variant="outline" className="rounded-lg">
                        {selectedColumns.length} columnas seleccionadas
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
