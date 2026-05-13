import { FileBarChart2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReportDatasetConfig, ReportTemplate } from './types';

type Props = {
    templates: ReportTemplate[];
    datasets: Record<string, ReportDatasetConfig>;
    onApplyTemplate: (template: ReportTemplate) => void;
};

export function ReportTemplatesCard({
    templates,
    datasets,
    onApplyTemplate,
}: Props) {
    return (
        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-lg font-black">
                    Plantillas guardadas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {templates.length === 0 ? (
                    <EmptyState
                        title="Sin plantillas todavía"
                        description="Guarda tu primer informe personalizado para reutilizarlo más adelante."
                        icon={
                            <FileBarChart2 className="h-6 w-6 text-sidebar" />
                        }
                        className="rounded-lg border-dashed bg-slate-50/50"
                    />
                ) : (
                    templates.map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => onApplyTemplate(template)}
                            className="w-full rounded-lg border border-sidebar/10 p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-black text-slate-900 dark:text-white">
                                    {template.name}
                                </p>
                                <Badge variant="outline" className="rounded-lg">
                                    {datasets[template.dataset]?.label ??
                                        template.dataset}
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                {template.columns.length} columnas configuradas
                                {template.filters?.group_by
                                    ? ` · Agrupado por ${
                                          datasets[template.dataset]?.columns[
                                              template.filters.group_by
                                          ]?.heading ??
                                          template.filters.group_by
                                      }`
                                    : ''}
                            </p>
                        </button>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
