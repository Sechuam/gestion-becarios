import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface InternNotesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeIntern: any | null;
    noteValue: string;
    onNoteValueChange: (value: string) => void;
    onSave: () => void;
}

export function InternNotesDialog({
    open,
    onOpenChange,
    activeIntern,
    noteValue,
    onNoteValueChange,
    onSave,
}: InternNotesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Notas internas</DialogTitle>
                    <DialogDescription>
                        {activeIntern?.user?.name
                            ? `Notas privadas para ${activeIntern.user.name}.`
                            : 'Notas privadas del becario.'}
                    </DialogDescription>
                </DialogHeader>
                <textarea
                    value={noteValue}
                    onChange={(e) => onNoteValueChange(e.target.value)}
                    placeholder="Escribe aquí una nota interna..."
                    className="min-h-[120px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
                    autoFocus
                />
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={onSave}>Guardar nota</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
