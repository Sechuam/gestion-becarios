import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Evaluaciones', href: '/evaluaciones' },
    { title: 'Criterios', href: '/evaluaciones/criterios' },
    { title: 'Nuevo criterio', href: '/evaluaciones/criterios/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: '',
        description: '',
        rubric: '',
        weight: '10',
        max_score: '10',
        sort_order: '0',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/evaluaciones/criterios');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo criterio de evaluacion" />

            <div className="space-y-5">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent p-5 shadow-lg md:p-6">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative">
                        <h1 className="text-base font-black tracking-tight text-white">
                            Nuevo criterio de evaluacion
                        </h1>
                        <p className="mt-1 max-w-2xl text-xs font-medium text-white/65 italic">
                            Define una metrica reutilizable para valorar el
                            desempeno del becario.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="app-panel rounded-xl border-sidebar/10 bg-white p-5 shadow-xl md:p-6 dark:bg-[#142235]"
                >
                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-4 border-b border-sidebar/10 pb-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
                                01
                            </span>
                            <div>
                                <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-white">
                                    Identificacion
                                </h2>
                                <p className="text-sm font-medium text-slate-500">
                                    Nombre, categoria y contexto del criterio.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-xs font-black tracking-widest text-sidebar uppercase"
                                >
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Ej: Puntualidad"
                                    className="h-10 rounded-xl border-sidebar/20 bg-slate-50/50 focus:ring-sidebar/20"
                                />
                                {errors.name && (
                                    <p className="text-xs font-bold text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="category"
                                    className="text-xs font-black tracking-widest text-sidebar uppercase"
                                >
                                    Categoria
                                </Label>
                                <Input
                                    id="category"
                                    value={data.category}
                                    onChange={(e) =>
                                        setData('category', e.target.value)
                                    }
                                    placeholder="Ej: Competencias transversales"
                                    className="h-10 rounded-xl border-sidebar/20 bg-slate-50/50 focus:ring-sidebar/20"
                                />
                                {errors.category && (
                                    <p className="text-xs font-bold text-red-500">
                                        {errors.category}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 space-y-2">
                            <Label
                                htmlFor="description"
                                className="text-xs font-black tracking-widest text-sidebar uppercase"
                            >
                                Descripcion
                            </Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Explica que mide este criterio..."
                                className="min-h-[92px] w-full rounded-xl border border-sidebar/20 bg-slate-50/50 p-3 text-sm text-slate-700 shadow-sm transition-all outline-none focus:border-sidebar focus:ring-4 focus:ring-sidebar/5"
                            />
                            {errors.description && (
                                <p className="text-xs font-bold text-red-500">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 space-y-2">
                            <Label
                                htmlFor="rubric"
                                className="text-xs font-black tracking-widest text-sidebar uppercase"
                            >
                                Rubrica
                            </Label>
                            <textarea
                                id="rubric"
                                value={data.rubric}
                                onChange={(e) =>
                                    setData('rubric', e.target.value)
                                }
                                placeholder="Define como interpretar cada nivel de puntuacion..."
                                className="min-h-[112px] w-full rounded-xl border border-sidebar/20 bg-slate-50/50 p-3 text-sm text-slate-700 shadow-sm transition-all outline-none focus:border-sidebar focus:ring-4 focus:ring-sidebar/5"
                            />
                            {errors.rubric && (
                                <p className="text-xs font-bold text-red-500">
                                    {errors.rubric}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-4 border-b border-sidebar/10 pb-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">
                                02
                            </span>
                            <div>
                                <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-white">
                                    Ponderacion
                                </h2>
                                <p className="text-sm font-medium text-slate-500">
                                    Peso, nota maxima y orden dentro del
                                    formulario.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="weight"
                                    className="text-xs font-black tracking-widest text-sidebar uppercase"
                                >
                                    Peso (%)
                                </Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={data.weight}
                                    onChange={(e) =>
                                        setData('weight', e.target.value)
                                    }
                                    className="h-10 rounded-xl border-sidebar/20 bg-slate-50/50 focus:ring-sidebar/20"
                                />
                                {errors.weight && (
                                    <p className="text-xs font-bold text-red-500">
                                        {errors.weight}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="max_score"
                                    className="text-xs font-black tracking-widest text-sidebar uppercase"
                                >
                                    Nota maxima
                                </Label>
                                <Input
                                    id="max_score"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={data.max_score}
                                    onChange={(e) =>
                                        setData('max_score', e.target.value)
                                    }
                                    className="h-10 rounded-xl border-sidebar/20 bg-slate-50/50 focus:ring-sidebar/20"
                                />
                                {errors.max_score && (
                                    <p className="text-xs font-bold text-red-500">
                                        {errors.max_score}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="sort_order"
                                    className="text-xs font-black tracking-widest text-sidebar uppercase"
                                >
                                    Orden
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData('sort_order', e.target.value)
                                    }
                                    className="h-10 rounded-xl border-sidebar/20 bg-slate-50/50 focus:ring-sidebar/20"
                                />
                                {errors.sort_order && (
                                    <p className="text-xs font-bold text-red-500">
                                        {errors.sort_order}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-4">
                            <div className="relative inline-flex h-10 cursor-pointer items-center rounded-xl border border-sidebar/10 bg-slate-50 px-4 transition-all hover:bg-slate-100">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-sidebar/20 text-sidebar focus:ring-sidebar"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="ml-3 cursor-pointer text-xs font-black tracking-widest text-sidebar uppercase"
                                >
                                    Activar criterio
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t border-sidebar/10 pt-5">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl px-8 font-bold text-slate-500 hover:bg-slate-100"
                            asChild
                        >
                            <Link href="/evaluaciones/criterios">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            className="h-10 rounded-xl bg-sidebar px-10 font-black text-white shadow-lg shadow-sidebar/20 transition-all hover:bg-sidebar/90 active:scale-95"
                            disabled={processing}
                        >
                            {processing ? 'Guardando...' : 'Crear criterio'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
