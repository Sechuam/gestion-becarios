import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
        priority: String(practiceType.priority || 'medium').toLowerCase(),
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
            <div className="w-full space-y-4 p-4 dark:bg-slate-900/20 min-h-screen">
                {/* CABECERA ESTILIZADA */}
                <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-sidebar to-[#1f4f52] p-6 shadow-lg">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                                <Pencil className="h-6 w-6" />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-white">
                                Editar Tipo de Práctica
                            </h1>
                        </div>
                        <p className="mt-1 ml-[52px] text-xs font-medium text-white/60 italic">
                            Modificando los parámetros de la categoría: {practiceType.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="app-panel rounded-[1.5rem] border-sidebar/10 bg-white p-6 shadow-xl dark:bg-slate-900">
                    {/* SECCIÓN 01: INFORMACIÓN BÁSICA */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-sidebar/5 pb-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar text-xs font-black text-white shadow-md">01</span>
                            <div>
                                <h2 className="text-sm font-black tracking-tight text-slate-800 dark:text-white uppercase tracking-widest">Identificación</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#1f4f52]">Nombre del Tipo</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    placeholder="Ej: Desarrollo Frontend, Sistemas..."
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-10 border-sidebar/10 bg-slate-50/30 rounded-xl focus:border-sidebar/40 transition-all text-sm"
                                />
                                {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-[#1f4f52]">Prioridad Sugerida</Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(value) => setData('priority', value)}
                                >
                                    <SelectTrigger className="h-10 border-sidebar/10 bg-slate-50/30 rounded-xl focus:border-sidebar/40 transition-all text-sm">
                                        <SelectValue placeholder="Selecciona prioridad" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-sidebar/10">
                                        <SelectItem value="baja">Baja</SelectItem>
                                        <SelectItem value="media">Media</SelectItem>
                                        <SelectItem value="alta">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.priority && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.priority}</p>}
                            </div>
                        </div>

                        <div className="mt-6 space-y-1.5">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-[#1f4f52]">Descripción</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe el propósito de este tipo de práctica..."
                                className="min-h-[80px] w-full rounded-xl border border-sidebar/10 bg-slate-50/30 p-3 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-sidebar/40 focus:ring-4 focus:ring-sidebar/5"
                            />
                            {errors.description && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.description}</p>}
                        </div>
                    </div>

                    {/* SECCIÓN 02: CONFIGURACIÓN VISUAL */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-sidebar/5 pb-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar text-xs font-black text-white shadow-md">02</span>
                            <div>
                                <h2 className="text-sm font-black tracking-tight text-slate-800 dark:text-white uppercase tracking-widest">Estética y Estado</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="color" className="text-[10px] font-black uppercase tracking-widest text-[#1f4f52]">Color Corporativo (HEX)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        placeholder="#3b82f6"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="h-10 border-sidebar/10 bg-slate-50/30 rounded-xl text-sm"
                                    />
                                    <div 
                                        className="h-10 w-10 shrink-0 rounded-xl border-2 border-white shadow-md transition-transform hover:scale-105" 
                                        style={{ backgroundColor: data.color || '#e2e8f0' }}
                                    />
                                </div>
                                {errors.color && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.color}</p>}
                            </div>

                            <div className="flex items-center gap-4 pt-6">
                                <div className="relative inline-flex h-10 items-center cursor-pointer rounded-xl border border-sidebar/10 bg-slate-50/50 px-4 transition-all hover:bg-slate-100">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-sidebar/20 text-sidebar focus:ring-sidebar"
                                    />
                                    <Label htmlFor="is_active" className="ml-3 cursor-pointer text-[10px] font-black text-sidebar uppercase tracking-widest">¿Mantener Activo?</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-sidebar/5 pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                            asChild
                        >
                            <Link href="/tipos-practica">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="relative overflow-hidden h-10 rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-sidebar/20 hover:opacity-95 transition-all border-none"
                        >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/10 to-transparent" />
                            {processing ? 'Guardando...' : 'Actualizar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
