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
export default function DeleteCenterModal({ school }: { school: any }) {
    const handleDelete = () => {
        router.delete(`/centros/${school.id}`, {
            onSuccess: () => {
                // El servidor nos redirigirá al index automáticamente
            },
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    className="shadow-md shadow-red-500/20"
                >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    ¿Estás seguro de eliminar este centro?
                </DialogTitle>
                <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el centro **
                    {school.name}** y todos los datos asociados de forma
                    permanente.
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
