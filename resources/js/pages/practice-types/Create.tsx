import { Head, useForm, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import React from 'react';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tipos de práctica', href: '/tipos-practica' },
    { title: 'Nuevo tipo', href: '/tipos-practica/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        priority: '',
        color: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tipos-practica');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo tipo de práctica" />
            <div className="min-h-screen w-full space-y-4 p-4 dark:bg-[#0f1b2a]/70">
                {/* CABECERA ESTILIZADA */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent p-6 shadow-lg">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
                                <Plus className="h-6 w-6" />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-white">
                                Nuevo Tipo de Práctica
                            </h1>
                        </div>
                        <p className="mt-1 ml-[52px] text-xs font-medium text-white/60 italic">
                            Define una nueva categoría para organizar las tareas
                            de los becarios.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="app-panel rounded-xl border-sidebar/10 bg-white p-6 shadow-xl dark:bg-[#142235]"
                >
                    {/* SECCIÓN 01: INFORMACIÓN BÁSICA */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-sidebar/5 pb-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar text-xs font-black text-white shadow-md">
                                01
                            </span>
                            <div>
                                <h2 className="text-sm font-black tracking-tight tracking-widest text-slate-800 uppercase dark:text-white">
                                    Identificación
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="name"
                                    className="text-[10px] font-black tracking-widest text-sidebar uppercase"
                                >
                                    Nombre del Tipo
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    placeholder="Ej: Desarrollo Frontend, Sistemas..."
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-10 rounded-xl border-sidebar/10 bg-slate-50/30 text-sm transition-all focus:border-sidebar/40"
                                />
                                {errors.name && (
                                    <p className="text-[10px] font-bold text-red-500 uppercase">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="priority"
                                    className="text-[10px] font-black tracking-widest text-sidebar uppercase"
                                >
                                    Prioridad Sugerida
                                </Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(value) =>
                                        setData('priority', value)
                                    }
                                >
                                    <SelectTrigger className="h-10 rounded-xl border-sidebar/10 bg-slate-50/30 text-sm transition-all focus:border-sidebar/40">
                                        <SelectValue placeholder="Selecciona prioridad" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-sidebar/10">
                                        <SelectItem value="baja">
                                            Baja
                                        </SelectItem>
                                        <SelectItem value="media">
                                            Media
                                        </SelectItem>
                                        <SelectItem value="alta">
                                            Alta
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.priority && (
                                    <p className="text-[10px] font-bold text-red-500 uppercase">
                                        {errors.priority}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 space-y-1.5">
                            <Label
                                htmlFor="description"
                                className="text-[10px] font-black tracking-widest text-sidebar uppercase"
                            >
                                Descripción
                            </Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Describe brevemente el propósito de este tipo de práctica..."
                                className="min-h-[80px] w-full rounded-xl border border-sidebar/10 bg-slate-50/30 p-3 text-sm text-slate-700 shadow-sm transition-all outline-none focus:border-sidebar/40 focus:ring-4 focus:ring-sidebar/5"
                            />
                            {errors.description && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 02: CONFIGURACIÓN VISUAL */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-sidebar/5 pb-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar text-xs font-black text-white shadow-md">
                                02
                            </span>
                            <div>
                                <h2 className="text-sm font-black tracking-tight tracking-widest text-slate-800 uppercase dark:text-white">
                                    Estética y Estado
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="color"
                                    className="text-[10px] font-black tracking-widest text-sidebar uppercase"
                                >
                                    Color Corporativo (HEX)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        placeholder="#3b82f6"
                                        value={data.color}
                                        onChange={(e) =>
                                            setData('color', e.target.value)
                                        }
                                        className="h-10 rounded-xl border-sidebar/10 bg-slate-50/30 text-sm"
                                    />
                                    <div
                                        className="h-10 w-10 shrink-0 rounded-xl border-2 border-white shadow-md transition-transform hover:scale-105"
                                        style={{
                                            backgroundColor:
                                                data.color || '#e2e8f0',
                                        }}
                                    />
                                </div>
                                {errors.color && (
                                    <p className="text-[10px] font-bold text-red-500 uppercase">
                                        {errors.color}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-6">
                                <div className="relative inline-flex h-10 cursor-pointer items-center rounded-xl border border-sidebar/10 bg-slate-50/50 px-4 transition-all hover:bg-slate-100">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-sidebar/20 text-sidebar focus:ring-sidebar"
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="ml-3 cursor-pointer text-[10px] font-black tracking-widest text-sidebar uppercase"
                                    >
                                        ¿Activar Tipo?
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-sidebar/5 pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-10 rounded-xl px-6 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-50 hover:text-slate-600"
                            asChild
                        >
                            <Link href="/tipos-practica">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="relative h-10 overflow-hidden rounded-xl border-none bg-gradient-to-r from-sidebar to-sidebar-accent px-8 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-sidebar/20 transition-all hover:opacity-95"
                        >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/10 to-transparent" />
                            {processing
                                ? 'Guardando...'
                                : 'Crear Tipo de Práctica'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
