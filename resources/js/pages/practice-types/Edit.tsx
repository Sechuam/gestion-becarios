import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

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

            <div className="w-full space-y-6 bg-slate-50/50 p-6 dark:bg-slate-950/20 min-h-screen">
                {/* CABECERA ESTILIZADA */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-8 shadow-xl md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                            Editar Tipo de Práctica
                        </h1>
                        <p className="mt-2 max-w-2xl text-lg font-medium text-white/70 italic">
                            Modificando los parámetros de la categoría: {practiceType.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="app-panel rounded-[2rem] border-sidebar/10 bg-white p-8 shadow-2xl dark:bg-slate-900 md:p-12">
                    {/* SECCIÓN 01: INFORMACIÓN BÁSICA */}
                    <div className="mb-12">
                        <div className="mb-8 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">01</span>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Identificación</h2>
                                <p className="text-sm font-medium text-slate-500">Actualiza el nombre y descripción de esta categoría.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Nombre del Tipo</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    placeholder="Ej: Desarrollo Frontend, Sistemas..."
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-12 border-sidebar/20 bg-card rounded-2xl focus:ring-sidebar/20"
                                />
                                {errors.name && <p className="text-xs font-bold text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Prioridad Sugerida</Label>
                                <Input
                                    id="priority"
                                    value={data.priority}
                                    placeholder="Ej: Alta, Media, Baja o número..."
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="h-12 border-sidebar/20 bg-card rounded-2xl focus:ring-sidebar/20"
                                />
                                {errors.priority && <p className="text-xs font-bold text-red-500">{errors.priority}</p>}
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Descripción</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe el propósito de este tipo de práctica..."
                                className="min-h-[120px] w-full rounded-2xl border border-sidebar/20 bg-card p-4 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-[#1f4f52] focus:ring-4 focus:ring-sidebar/5"
                            />
                            {errors.description && <p className="text-xs font-bold text-red-500">{errors.description}</p>}
                        </div>
                    </div>

                    {/* SECCIÓN 02: CONFIGURACIÓN VISUAL */}
                    <div className="mb-12">
                        <div className="mb-8 flex items-center gap-4 border-b border-sidebar/10 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-xl font-black text-white shadow-lg">02</span>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Estética y Estado</h2>
                                <p className="text-sm font-medium text-slate-500">Gestiona la etiqueta de color y el estado de activación.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="color" className="text-xs font-black uppercase tracking-widest text-[#1f4f52]">Color Corporativo (HEX)</Label>
                                <div className="flex gap-3">
                                    <Input
                                        id="color"
                                        placeholder="#3b82f6"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="h-12 border-sidebar/20 bg-card rounded-2xl"
                                    />
                                    <div 
                                        className="h-12 w-12 shrink-0 rounded-2xl border-4 border-white shadow-lg transition-transform hover:scale-105" 
                                        style={{ backgroundColor: data.color || '#e2e8f0' }}
                                    />
                                </div>
                                {errors.color && <p className="text-xs font-bold text-red-500">{errors.color}</p>}
                            </div>

                            <div className="flex items-center gap-4 pt-8">
                                <div className="relative inline-flex h-12 items-center cursor-pointer rounded-2xl border border-sidebar/10 bg-slate-50 px-4 transition-all hover:bg-slate-100">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-5 w-5 rounded border-sidebar/20 text-sidebar focus:ring-sidebar"
                                    />
                                    <Label htmlFor="is_active" className="ml-3 cursor-pointer text-sm font-black text-sidebar uppercase tracking-widest">¿Mantener Activo?</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t border-sidebar/10 pt-8">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl px-8 font-bold text-slate-500 hover:bg-slate-100"
                            asChild
                        >
                            <Link href="/tipos-practica">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            className="h-12 rounded-2xl bg-sidebar px-10 font-black text-white shadow-xl shadow-sidebar/20 transition-all hover:bg-sidebar/90 active:scale-95"
                            disabled={processing}
                        >
                            {processing ? 'Guardando...' : 'Actualizar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
