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
                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium shadow-none">
                    <Trash2 className="w-4 h-4 mr-1.5 text-red-500/70" /> Borrar
                </Button>
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