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
export default function DeleteInternModal({ intern }: { intern: any }) {
    const handleDelete = () => {
        router.delete(`/interns/${intern.id}`, {
            onSuccess: () => {
                // El servidor redirigirá al index automáticamente
            }
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-red-500 hover:underline text-xs flex items-center gap-1">
                    <Trash2 className="h-3 w-3" />
                    Borrar
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>¿Estás seguro de eliminar a este becario?</DialogTitle>
                <DialogDescription>
                    Esta acción archivará al becario **{intern.user.name}**. Podrás recuperarlo más adelante si fuese necesario desde la base de datos (Soft Delete).
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                        Confirmar Borrado
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}