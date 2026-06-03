import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Props = {
    templateName: string;
    saving: boolean;
    selectedColumnsCount: number;
    onTemplateNameChange: (value: string) => void;
    onSubmit: (event: FormEvent) => void;
    framed?: boolean;
};

export function SaveReportTemplateCard({
    templateName,
    saving,
    selectedColumnsCount,
    onTemplateNameChange,
    onSubmit,
    framed = true,
}: Props) {
    const content = (
        <form onSubmit={onSubmit} className="space-y-3">
            <Input
                value={templateName}
                onChange={(event) => onTemplateNameChange(event.target.value)}
                placeholder="Informe mensual de seguimiento"
            />
            <Button
                type="submit"
                disabled={saving || selectedColumnsCount === 0}
            >
                <Save className="mr-2 h-4 w-4" />
                Guardar plantilla
            </Button>
        </form>
    );

    if (!framed) {
        return content;
    }

    return (
        <Card className="border-sidebar/10 bg-white shadow-sm dark:bg-[#142235]">
            <CardHeader>
                <CardTitle className="text-lg font-black">
                    Guardar plantilla
                </CardTitle>
                <p className="text-sm text-slate-500">
                    Conserva combinaciones de campos para repetir informes
                    frecuentes.
                </p>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
}
