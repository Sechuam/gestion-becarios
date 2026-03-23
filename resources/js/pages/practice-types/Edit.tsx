import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    practiceType: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tipos de práctica', href: '/tipos-practica' },
    { title: 'Editar tipo', href: '#' },
];

export default function Edit({ practiceType }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: practiceType.name || '',
        description: practiceType.description || '',
        priority: practiceType.priority || '',
        color: practiceType.color || '',
        is_active: !!practiceType.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/tipos-practica/${practiceType.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar tipo de práctica" />

            <div className="p-6 w-full bg-background text-foreground">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Editar tipo</h1>
                    <p className="text-sm text-muted-foreground">
                        Actualiza los datos del tipo de práctica.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6 border rounded-xl bg-card dark:bg-slate-900/60 border-border dark:border-slate-700/70 shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="bg-background border-border text-foreground"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioridad (opcional)</Label>
                            <Input
                                id="priority"
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className="bg-background border-border text-foreground"
                            />
                            {errors.priority && <p className="text-red-500 text-xs">{errors.priority}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-[120px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40"
                        />
                        {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="color">Color (hex opcional)</Label>
                            <Input
                                id="color"
                                placeholder="#3b82f6"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                className="bg-background border-border text-foreground"
                            />
                            {errors.color && <p className="text-red-500 text-xs">{errors.color}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <Label htmlFor="is_active">Activo</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-6">
                        <Button type="button" variant="outline" className="border-border text-foreground hover:bg-muted" asChild>
                            <Link href="/tipos-practica">Cancelar</Link>
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={processing}>
                            Guardar cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
