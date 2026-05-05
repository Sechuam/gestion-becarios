import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

type Props = {
    criterion: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Evaluaciones', href: '/evaluaciones' },
    { title: 'Criterios', href: '/evaluaciones/criterios' },
    { title: 'Editar criterio', href: '#' },
];

export default function Edit({ criterion }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: criterion.name || '',
        category: criterion.category || '',
        description: criterion.description || '',
        rubric: criterion.rubric || '',
        weight: String(criterion.weight ?? '10'),
        max_score: String(criterion.max_score ?? '10'),
        sort_order: String(criterion.sort_order ?? '0'),
        is_active: !!criterion.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/evaluaciones/criterios/${criterion.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar criterio de evaluacion" />

            <div className="min-h-screen w-full space-y-6 bg-slate-50/50 p-6 dark:bg-slate-950/20">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-8 shadow-xl md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                            Editar criterio de evaluacion
                        </h1>
                        <p className="mt-2 max-w-2xl text-lg font-medium italic text-white/70">
                            Ajustando la configuracion del criterio {criterion.name}.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="app-panel rounded-[2rem] border-sidebar/10 bg-white p-8 shadow-2xl dark:bg-slate-900 md:p-12">
                    <div className="mb-12">
                        <div className="mb-8 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">01</span>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Identificacion</h2>
                                <p className="text-sm font-medium text-slate-500">Actualiza el significado y contexto del criterio.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Nombre</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-card focus:ring-sidebar/20"
                                />
                                {errors.name && <p className="text-xs font-bold text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Categoria</Label>
                                <Input
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-card focus:ring-sidebar/20"
                                />
                                {errors.category && <p className="text-xs font-bold text-red-500">{errors.category}</p>}
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Descripcion</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="min-h-[110px] w-full rounded-2xl border border-sidebar/20 bg-card p-4 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-[#1f4f52] focus:ring-4 focus:ring-sidebar/5"
                            />
                            {errors.description && <p className="text-xs font-bold text-red-500">{errors.description}</p>}
                        </div>

                        <div className="mt-8 space-y-2">
                            <Label htmlFor="rubric" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Rubrica</Label>
                            <textarea
                                id="rubric"
                                value={data.rubric}
                                onChange={(e) => setData('rubric', e.target.value)}
                                className="min-h-[140px] w-full rounded-2xl border border-sidebar/20 bg-card p-4 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-[#1f4f52] focus:ring-4 focus:ring-sidebar/5"
                            />
                            {errors.rubric && <p className="text-xs font-bold text-red-500">{errors.rubric}</p>}
                        </div>
                    </div>

                    <div className="mb-12">
                        <div className="mb-8 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">02</span>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Ponderacion</h2>
                                <p className="text-sm font-medium text-slate-500">Gestiona peso, limite de nota y orden visual.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Peso (%)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-card focus:ring-sidebar/20"
                                />
                                {errors.weight && <p className="text-xs font-bold text-red-500">{errors.weight}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_score" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Nota maxima</Label>
                                <Input
                                    id="max_score"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={data.max_score}
                                    onChange={(e) => setData('max_score', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-card focus:ring-sidebar/20"
                                />
                                {errors.max_score && <p className="text-xs font-bold text-red-500">{errors.max_score}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort_order" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Orden</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                    className="h-12 rounded-2xl border-sidebar/20 bg-card focus:ring-sidebar/20"
                                />
                                {errors.sort_order && <p className="text-xs font-bold text-red-500">{errors.sort_order}</p>}
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="relative inline-flex h-12 cursor-pointer items-center rounded-2xl border border-sidebar/10 bg-slate-50 px-4 transition-all hover:bg-slate-100">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-5 w-5 rounded border-sidebar/20 text-sidebar focus:ring-sidebar"
                                />
                                <Label htmlFor="is_active" className="ml-3 cursor-pointer text-sm font-black uppercase tracking-widest text-sidebar">Mantener activo</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t border-sidebar/10 pt-8">
                        <Button type="button" variant="ghost" className="rounded-xl px-8 font-bold text-slate-500 hover:bg-slate-100" asChild>
                            <Link href="/evaluaciones/criterios">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            className="h-12 rounded-2xl bg-sidebar px-10 font-black text-white shadow-xl shadow-sidebar/20 transition-all hover:bg-sidebar/90 active:scale-95"
                            disabled={processing}
                        >
                            {processing ? 'Guardando...' : 'Actualizar criterio'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
