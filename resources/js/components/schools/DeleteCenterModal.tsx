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
        router.delete(`/schools/${school.id}`, {
            onSuccess: () => {
                // El servidor nos redirigirá al index automáticamente
            }
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
                    <Trash2 className="w-4 h-4 mr-1.5 text-red-500/70" /> Borrar
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
