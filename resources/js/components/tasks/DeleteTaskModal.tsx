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

export default function DeleteTaskModal({ task }: { task: any }) {
    const handleDelete = () => {
        router.delete(`/tareas/${task.id}`, {
            onSuccess: () => {
                // El servidor nos redirigirá al index automáticamente
            },
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 className="mr-1.5 h-4 w-4 text-red-500/70" />{' '}
                    Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>¿Estás seguro de eliminar esta tarea?</DialogTitle>
                <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la tarea **
                    {task.title}** de forma permanente.
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                        Eliminar tarea
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
