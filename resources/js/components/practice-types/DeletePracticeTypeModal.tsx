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

export default function DeletePracticeTypeModal({ practiceType }: { practiceType: any }) {
    const handleDelete = () => {
        router.delete(`/tipos-practica/${practiceType.id}`);
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
                <DialogTitle>¿Eliminar tipo de práctica?</DialogTitle>
                <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el tipo **{practiceType.name}**.
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                        Eliminar tipo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
