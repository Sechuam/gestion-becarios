import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function DeleteEvaluationCriterionModal({
    criterion,
}: {
    criterion: any;
}) {
    const handleDelete = () => {
        router.delete(`/evaluaciones/criterios/${criterion.id}`);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 className="mr-1.5 h-4 w-4 text-red-500/70" />
                    Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>¿Eliminar criterio de evaluacion?</DialogTitle>
                <DialogDescription>
                    Esta accion no se puede deshacer. Se eliminara el criterio {criterion.name}.
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                        Eliminar criterio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
