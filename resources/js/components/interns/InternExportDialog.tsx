import React from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface InternExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exportColumns: any[];
    selectedColumns: string[];
    onSelectedColumnsChange: (columns: string[] | ((prev: string[]) => string[])) => void;
    onExport: () => void;
    disabled?: boolean;
}

export function InternExportDialog({
    open,
    onOpenChange,
    exportColumns,
    selectedColumns,
    onSelectedColumnsChange,
    onExport,
    disabled = false,
}: InternExportDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    className="h-8 gap-2 rounded-lg bg-gradient-to-r from-sidebar to-[#1f4f52] px-3 text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:opacity-95"
                >
                    <FileDown className="h-3.5 w-3.5" />
                    Exportar Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Exportación personalizada</DialogTitle>
                    <DialogDescription>
                        Elige las columnas que quieres incluir en el Excel. Se respetarán los filtros actuales.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {exportColumns.map((column) => {
                        const isChecked = selectedColumns.includes(column.key);
                        return (
                            <label
                                key={column.key}
                                className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
                            >
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                        const isOn = checked === true;
                                        onSelectedColumnsChange((prev) => {
                                            if (isOn) {
                                                if (prev.includes(column.key)) return prev;
                                                return [...prev, column.key];
                                            }
                                            return prev.filter((key) => key !== column.key);
                                        });
                                    }}
                                />
                                {column.label}
                            </label>
                        );
                    })}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onExport} disabled={selectedColumns.length === 0 || disabled}>
                        Descargar Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
