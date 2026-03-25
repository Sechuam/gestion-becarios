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
export default function DeleteInternModal({ intern }: { intern: any }) {
    const handleDelete = () => {
        router.delete(`/interns/${intern.id}`, {
            onSuccess: () => {
                // El servidor redirigirá al index automáticamente
            },
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 bg-white font-medium text-slate-600 shadow-none hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-red-900/20"
                >
                    <Trash2 className="mr-1.5 h-4 w-4 text-red-500/70" /> Borrar
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>
                    ¿Estás seguro de eliminar a este becario?
                </DialogTitle>
                <DialogDescription>
                    Esta acción archivará al becario **{intern.user.name}**.
                    Podrás recuperarlo más adelante si fuese necesario desde la
                    base de datos (Soft Delete).
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
