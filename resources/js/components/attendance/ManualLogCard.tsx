import { FileText, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ManageableIntern, ManualLogFormState } from './types';

type Props = {
    form: ManualLogFormState;
    manageableInterns: ManageableIntern[];
    onSubmit: (event: FormEvent) => void;
};

export function ManualLogCard({ form, manageableInterns, onSubmit }: Props) {
    const [internSearch, setInternSearch] = useState('');
    const [showInternDropdown, setShowInternDropdown] = useState(false);
    const internSearchRef = useRef<HTMLDivElement>(null);

    const filteredInterns = (manageableInterns ?? []).filter(
        (intern) =>
            intern.name.toLowerCase().includes(internSearch.toLowerCase()) ||
            (intern.education_center ?? '')
                .toLowerCase()
                .includes(internSearch.toLowerCase()),
    );

    const selectedIntern = (manageableInterns ?? []).find(
        (intern) => String(intern.id) === form.data.intern_id,
    );

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (
                internSearchRef.current &&
                !internSearchRef.current.contains(event.target as Node)
            ) {
                setShowInternDropdown(false);
            }
        };

        document.addEventListener('mousedown', handler);

        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function selectIntern(intern: ManageableIntern) {
        form.setData('intern_id', String(intern.id));
        setInternSearch('');
        setShowInternDropdown(false);
    }

    return (
        <Card className="gap-0 overflow-visible rounded-xl border-slate-200 bg-white py-0 shadow-xs dark:border-[#2f4a62] dark:bg-[#142235]">
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent" />
            <CardHeader className="border-b border-slate-400 bg-slate-200 p-3 pb-2 dark:border-[#3c6270] dark:bg-[#22374d]">
                <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800 dark:text-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-sidebar shadow-sm ring-1 ring-sidebar/10 dark:bg-[#142235]">
                        <FileText className="h-4 w-4" />
                    </div>
                    Registro Manual
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2" ref={internSearchRef}>
                            <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                Becario Asignado
                            </Label>

                            {selectedIntern && !showInternDropdown && (
                                <div
                                    className="flex h-11 cursor-pointer items-center justify-between rounded-xl border border-sidebar/20 bg-card px-4 shadow-sm transition-colors hover:bg-slate-50"
                                    onClick={() => {
                                        setInternSearch('');
                                        setShowInternDropdown(true);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar/20 text-[10px] font-black text-sidebar">
                                            {selectedIntern.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                                            {selectedIntern.name}
                                        </span>
                                        {selectedIntern.education_center && (
                                            <span className="text-[10px] font-medium text-slate-400">
                                                ·{' '}
                                                {
                                                    selectedIntern.education_center
                                                }
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Cambiar
                                    </span>
                                </div>
                            )}

                            {(!selectedIntern || showInternDropdown) && (
                                <div className="relative">
                                    <Input
                                        autoFocus={showInternDropdown}
                                        value={internSearch}
                                        onChange={(event) => {
                                            setInternSearch(event.target.value);
                                            setShowInternDropdown(true);
                                        }}
                                        onFocus={() =>
                                            setShowInternDropdown(true)
                                        }
                                        placeholder="Buscar becario por nombre o centro..."
                                        className="h-11 rounded-xl border-sidebar/20 bg-card pl-10 text-foreground shadow-sm"
                                    />
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    {showInternDropdown && (
                                        <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-50 max-h-56 overflow-y-auto rounded-xl border border-sidebar/20 bg-white shadow-xl dark:bg-[#142235]">
                                            {filteredInterns.length > 0 ? (
                                                filteredInterns.map(
                                                    (intern) => (
                                                        <button
                                                            key={intern.id}
                                                            type="button"
                                                            className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                                            onClick={() =>
                                                                selectIntern(
                                                                    intern,
                                                                )
                                                            }
                                                        >
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar/10 text-xs font-black text-sidebar transition-colors group-hover:bg-sidebar group-hover:text-white">
                                                                {intern.name.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm leading-none font-bold text-slate-800 dark:text-white">
                                                                    {
                                                                        intern.name
                                                                    }
                                                                </p>
                                                                {intern.education_center && (
                                                                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                                                        {
                                                                            intern.education_center
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ),
                                                )
                                            ) : (
                                                <p className="py-6 text-center text-sm text-slate-400 italic">
                                                    Sin resultados para &ldquo;
                                                    {internSearch}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {form.errors.intern_id && (
                                <p className="text-xs font-bold text-red-500">
                                    {form.errors.intern_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                Fecha de Registro
                            </Label>
                            <DatePicker
                                className="h-11 rounded-xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                panelClassName="z-[90]"
                                value={form.data.date}
                                onChange={(value) =>
                                    form.setData('date', value)
                                }
                            />
                            {form.errors.date && (
                                <p className="text-xs font-bold text-red-500">
                                    {form.errors.date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                Hora de Entrada
                            </Label>
                            <Input
                                type="time"
                                className="h-11 rounded-xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                value={form.data.clock_in}
                                onChange={(event) =>
                                    form.setData('clock_in', event.target.value)
                                }
                            />
                            {form.errors.clock_in && (
                                <p className="text-xs font-bold text-red-500">
                                    {form.errors.clock_in}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                                Hora de Salida
                            </Label>
                            <Input
                                type="time"
                                className="h-11 rounded-xl border-sidebar/20 bg-card text-foreground shadow-sm"
                                value={form.data.clock_out}
                                onChange={(event) =>
                                    form.setData(
                                        'clock_out',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.clock_out && (
                                <p className="text-xs font-bold text-red-500">
                                    {form.errors.clock_out}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="ml-1 text-[10px] font-black tracking-widest text-sidebar uppercase">
                            Notas y Observaciones
                        </Label>
                        <Input
                            className="h-11 rounded-xl border-sidebar/20 bg-card text-foreground shadow-sm"
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            placeholder="Motivo del ajuste o comentario aclaratorio..."
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing || !form.data.intern_id}
                        className="h-8 rounded-lg bg-gradient-to-r from-sidebar to-sidebar-accent px-6 text-[10px] font-black text-white shadow shadow-sidebar/20 transition-all hover:opacity-95 active:scale-95"
                    >
                        Guardar Registro
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
