import { router } from '@inertiajs/react';
import { Check, FileBarChart2, Pencil, Trash2, X } from 'lucide-react';
import { FormEvent, MouseEvent, useState } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ReportDatasetConfig, ReportTemplate } from './types';

type Props = {
    templates: ReportTemplate[];
    datasets: Record<string, ReportDatasetConfig>;
    onApplyTemplate: (template: ReportTemplate) => void;
    framed?: boolean;
};

export function ReportTemplatesCard({
    templates,
    datasets,
    onApplyTemplate,
    framed = true,
}: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    function startEditing(event: MouseEvent, template: ReportTemplate) {
        event.stopPropagation();
        setEditingId(template.id);
        setEditingName(template.name);
    }

    function cancelEditing(event?: MouseEvent) {
        event?.stopPropagation();
        setEditingId(null);
        setEditingName('');
    }

    function submitRename(event: FormEvent, template: ReportTemplate) {
        event.preventDefault();
        event.stopPropagation();

        router.patch(
            `/reportes/plantillas/${template.id}`,
            { name: editingName },
            {
                preserveScroll: true,
                onSuccess: () => cancelEditing(),
            },
        );
    }

    function destroyTemplate(event: MouseEvent, template: ReportTemplate) {
        event.stopPropagation();

        if (!window.confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
            return;
        }

        router.delete(`/reportes/plantillas/${template.id}`, {
            preserveScroll: true,
        });
    }

    const content = (
        <div className="space-y-2">
            {templates.length === 0 ? (
                <EmptyState
                    title="Sin plantillas todavía"
                    description="Guarda tu primer informe personalizado para reutilizarlo más adelante."
                    icon={<FileBarChart2 className="h-6 w-6 text-sidebar" />}
                    className="rounded-lg border-dashed bg-slate-50/50"
                />
            ) : (
                templates.map((template) => (
                    <div
                        key={template.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onApplyTemplate(template)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onApplyTemplate(template);
                            }
                        }}
                        className="w-full cursor-pointer rounded-lg border border-sidebar/10 bg-white p-3 text-left transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center justify-between gap-2">
                            {editingId === template.id ? (
                                <form
                                    onSubmit={(event) =>
                                        submitRename(event, template)
                                    }
                                    onKeyDown={(event) =>
                                        event.stopPropagation()
                                    }
                                    className="flex min-w-0 flex-1 items-center gap-2"
                                >
                                    <Input
                                        value={editingName}
                                        onChange={(event) =>
                                            setEditingName(event.target.value)
                                        }
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        className="h-8 text-xs"
                                        autoFocus
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-8 w-8 bg-sidebar text-white hover:bg-sidebar/90"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={cancelEditing}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </form>
                            ) : (
                                <p className="truncate font-black text-slate-900 dark:text-white">
                                    {template.name}
                                </p>
                            )}
                            <Badge variant="outline" className="rounded-lg">
                                {datasets[template.dataset]?.label ??
                                    template.dataset}
                            </Badge>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="min-w-0 text-xs text-slate-500">
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
                            {editingId !== template.id && (
                                <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-500 hover:text-sidebar"
                                        onClick={(event) =>
                                            startEditing(event, template)
                                        }
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-500 hover:text-red-600"
                                        onClick={(event) =>
                                            destroyTemplate(event, template)
                                        }
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    if (!framed) {
        return content;
    }

    return (
        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-lg font-black">
                    Plantillas guardadas
                </CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
}
