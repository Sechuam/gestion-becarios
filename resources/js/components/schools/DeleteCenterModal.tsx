import { router } from '@inertiajs/react';
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
import { Trash2 } from 'lucide-react';
export default function DeleteCenterModal({ school }: { school: any }) {
    const handleDelete = () => {
        router.delete(`/schools/${school.id}`, {
            onSuccess: () => {
                // El servidor nos redirigirá al index automáticamente
            }
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
    <Button variant="outline" size="sm" className="gap-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
        Eliminar
    </Button>
</DialogTrigger>
            <DialogContent>
                <DialogTitle>¿Estás seguro de eliminar este centro?</DialogTitle>
                <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el centro **{school.name}** y todos los datos asociados de forma permanente.
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                        Eliminar Centro
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}