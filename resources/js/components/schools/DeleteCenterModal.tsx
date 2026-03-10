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
                <button className="text-red-600 hover:underline text-xs font-medium flex items-center gap-1">
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                </button>
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