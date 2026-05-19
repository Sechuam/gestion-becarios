import { Check, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ManageableIntern } from './types';

type Props = {
    available: boolean;
    manageableInterns: ManageableIntern[];
    selectedAttendeeIds: number[];
    onToggleAttendee: (userId: number) => void;
};

export function EventAttendeesPanel({
    available,
    manageableInterns,
    selectedAttendeeIds,
    onToggleAttendee,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCenter, setSelectedCenter] = useState('all');
    const [selectedModule, setSelectedModule] = useState('all');

    const centers = useMemo(() => {
        const unique = new Set(
            manageableInterns
                .map((intern) => intern.education_center)
                .filter((center): center is string => Boolean(center)),
        );

        return Array.from(unique).sort();
    }, [manageableInterns]);

    const modules = useMemo(() => {
        const unique = new Set(
            manageableInterns
                .map((intern) => intern.module_name)
                .filter((module): module is string => Boolean(module)),
        );

        return Array.from(unique).sort();
    }, [manageableInterns]);

    const filteredInterns = useMemo(() => {
        return manageableInterns.filter((intern) => {
            const matchesSearch = intern.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesCenter =
                selectedCenter === 'all' ||
                intern.education_center === selectedCenter;
            const matchesModule =
                selectedModule === 'all' ||
                intern.module_name === selectedModule;

            return matchesSearch && matchesCenter && matchesModule;
        });
    }, [manageableInterns, searchTerm, selectedCenter, selectedModule]);

    if (!available) {
        return (
            <div className="flex h-full items-center justify-center text-center opacity-50">
                <div className="space-y-2">
                    <Users className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold text-slate-400">
                        Selección de invitados no disponible
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col space-y-4">
            <div className="ml-1 flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                    <Users className="h-3 w-3" />
                    Invitar Becarios
                </Label>
                <span className="rounded-full border border-slate-100 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 shadow-sm">
                    {selectedAttendeeIds.length} seleccionados
                </span>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800">
                <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-8 rounded-xl border-slate-200 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                    <select
                        className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-[9px] font-bold focus:ring-2 focus:ring-sidebar/20 focus:outline-none"
                        value={selectedCenter}
                        onChange={(event) =>
                            setSelectedCenter(event.target.value)
                        }
                    >
                        <option value="all">Centros</option>
                        {centers.map((center) => (
                            <option key={center} value={center}>
                                {center}
                            </option>
                        ))}
                    </select>
                    <select
                        className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-[9px] font-bold focus:ring-2 focus:ring-sidebar/20 focus:outline-none"
                        value={selectedModule}
                        onChange={(event) =>
                            setSelectedModule(event.target.value)
                        }
                    >
                        <option value="all">Módulos</option>
                        {modules.map((module) => (
                            <option key={module} value={module}>
                                {module}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="custom-scrollbar flex flex-1 flex-col justify-start gap-2 overflow-y-auto pr-2">
                {filteredInterns.length > 0 ? (
                    filteredInterns.map((intern) => (
                        <button
                            key={intern.id}
                            type="button"
                            onClick={() => onToggleAttendee(intern.user_id)}
                            className={cn(
                                'flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all',
                                selectedAttendeeIds.includes(intern.user_id)
                                    ? 'border-slate-400 bg-slate-200 shadow-sm ring-1 ring-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:ring-slate-600'
                                    : 'border-slate-100 bg-white shadow-sm hover:border-slate-200',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                                    {intern.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[11px] leading-none font-black text-slate-800">
                                        {intern.name}
                                    </p>
                                    <p className="mt-1 truncate text-[9px] text-slate-400">
                                        {intern.education_center}
                                    </p>
                                </div>
                            </div>
                            {selectedAttendeeIds.includes(intern.user_id) && (
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-400 text-white dark:bg-slate-500">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </button>
                    ))
                ) : (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                        <Users className="mb-2 h-8 w-8 text-slate-200" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Sin resultados
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
