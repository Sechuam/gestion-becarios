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
                    className="bg-card text-muted-foreground border-border hover:text-red-600 hover:bg-red-50 font-medium shadow-none"
                >
                    <Trash2 className="w-4 h-4 mr-1.5 text-red-500/70" /> Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>¿Estás seguro de eliminar esta tarea?</DialogTitle>
                <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la tarea **{task.title}** de forma permanente.
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
