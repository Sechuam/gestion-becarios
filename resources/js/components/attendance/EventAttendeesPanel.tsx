import { Check, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ManageableIntern, ManageableTutor } from './types';

const PREVIEW_LIMIT = 6;

type Props = {
    available: boolean;
    manageableInterns: ManageableIntern[];
    manageableTutors: ManageableTutor[];
    selectedAttendeeIds: number[];
    onToggleAttendee: (userId: number) => void;
};

export function EventAttendeesPanel({
    available,
    manageableInterns,
    manageableTutors,
    selectedAttendeeIds,
    onToggleAttendee,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [tutorSearchTerm, setTutorSearchTerm] = useState('');

    const filteredInterns = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) return [];

        return manageableInterns
            .filter((intern) => {
            const matchesSearch = intern.name
                .toLowerCase()
                    .includes(term);

                return matchesSearch;
            })
            .slice(0, PREVIEW_LIMIT);
    }, [manageableInterns, searchTerm]);

    const filteredTutors = useMemo(() => {
        const term = tutorSearchTerm.trim().toLowerCase();

        if (!term) return [];

        return manageableTutors
            .filter((tutor) =>
                `${tutor.name} ${tutor.email ?? ''}`
                    .toLowerCase()
                    .includes(term),
            )
            .slice(0, PREVIEW_LIMIT);
    }, [manageableTutors, tutorSearchTerm]);

    const selectedInterns = useMemo(
        () =>
            manageableInterns.filter((intern) =>
                selectedAttendeeIds.includes(intern.user_id),
            ),
        [manageableInterns, selectedAttendeeIds],
    );
    const selectedTutors = useMemo(
        () =>
            manageableTutors.filter((tutor) =>
                selectedAttendeeIds.includes(tutor.user_id),
            ),
        [manageableTutors, selectedAttendeeIds],
    );

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
                    Invitar personas
                </Label>
                <span className="rounded-full border border-slate-100 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 shadow-sm">
                    {selectedAttendeeIds.length} seleccionados
                </span>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-[#2f4a62] dark:bg-[#17283c]">
                <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    Becarios
                </p>
                <Input
                    placeholder="Buscar becario por nombre..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-8 rounded-xl border-slate-200 text-xs"
                />
                {searchTerm.trim() && (
                    <AttendeeResults
                        emptyText="No hay becarios con ese nombre"
                        items={filteredInterns.map((intern) => ({
                            id: intern.id,
                            userId: intern.user_id,
                            name: intern.name,
                            subtitle: intern.education_center,
                        }))}
                        selectedAttendeeIds={selectedAttendeeIds}
                        onToggleAttendee={onToggleAttendee}
                    />
                )}
            </div>

            <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-[#2f4a62] dark:bg-[#17283c]">
                <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    Tutores
                </p>
                <Input
                    placeholder="Buscar tutor por nombre o email..."
                    value={tutorSearchTerm}
                    onChange={(event) =>
                        setTutorSearchTerm(event.target.value)
                    }
                    className="h-8 rounded-xl border-slate-200 text-xs"
                />
                {tutorSearchTerm.trim() && (
                    <AttendeeResults
                        emptyText="No hay tutores con ese nombre"
                        items={filteredTutors.map((tutor) => ({
                            id: tutor.id,
                            userId: tutor.user_id,
                            name: tutor.name,
                            subtitle: tutor.email,
                        }))}
                        selectedAttendeeIds={selectedAttendeeIds}
                        onToggleAttendee={onToggleAttendee}
                    />
                )}
            </div>

            <div className="custom-scrollbar flex flex-1 flex-col justify-start gap-2 overflow-y-auto pr-2">
                {selectedInterns.length > 0 && (
                    <>
                        <p className="px-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                            Becarios seleccionados
                        </p>
                        {selectedInterns.map((intern) => (
                        <button
                            key={intern.id}
                            type="button"
                            onClick={() => onToggleAttendee(intern.user_id)}
                            className={cn(
                                'flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all',
                                selectedAttendeeIds.includes(intern.user_id)
                                    ? 'border-slate-400 bg-slate-200 shadow-sm ring-1 ring-slate-400 dark:border-[#3c6270] dark:bg-[#22374d] dark:ring-slate-600'
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
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-400 text-white dark:bg-[#5b7188]">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </button>
                        ))}
                    </>
                )}

                {selectedTutors.length > 0 && (
                    <>
                        <p className="mt-2 px-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                            Tutores seleccionados
                        </p>
                        {selectedTutors.map((tutor) => (
                            <button
                                key={tutor.id}
                                type="button"
                                onClick={() =>
                                    onToggleAttendee(tutor.user_id)
                                }
                                className={cn(
                                    'flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all',
                                    selectedAttendeeIds.includes(tutor.user_id)
                                        ? 'border-slate-400 bg-slate-200 shadow-sm ring-1 ring-slate-400 dark:border-[#3c6270] dark:bg-[#22374d] dark:ring-slate-600'
                                        : 'border-slate-100 bg-white shadow-sm hover:border-slate-200',
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                                        {tutor.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] leading-none font-black text-slate-800">
                                            {tutor.name}
                                        </p>
                                        <p className="mt-1 truncate text-[9px] text-slate-400">
                                            {tutor.email}
                                        </p>
                                    </div>
                                </div>
                                {selectedAttendeeIds.includes(
                                    tutor.user_id,
                                ) && (
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-400 text-white dark:bg-[#5b7188]">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </>
                )}

                {selectedInterns.length === 0 && selectedTutors.length === 0 && (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                        <Users className="mb-2 h-8 w-8 text-slate-200" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Busca personas para invitarlas
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

type AttendeeResult = {
    id: number;
    userId: number;
    name: string;
    subtitle?: string | null;
};

function AttendeeResults({
    emptyText,
    items,
    selectedAttendeeIds,
    onToggleAttendee,
}: {
    emptyText: string;
    items: AttendeeResult[];
    selectedAttendeeIds: number[];
    onToggleAttendee: (userId: number) => void;
}) {
    if (items.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-400">
                {emptyText}
            </p>
        );
    }

    return (
        <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {items.map((item) => {
                const selected = selectedAttendeeIds.includes(item.userId);

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggleAttendee(item.userId)}
                        className={cn(
                            'flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left transition-all',
                            selected
                                ? 'border-slate-400 bg-slate-200 shadow-sm ring-1 ring-slate-400 dark:border-[#3c6270] dark:bg-[#22374d] dark:ring-slate-600'
                                : 'border-slate-100 bg-white shadow-sm hover:border-slate-200',
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                                {item.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-[11px] leading-none font-black text-slate-800">
                                    {item.name}
                                </p>
                                {item.subtitle && (
                                    <p className="mt-1 truncate text-[9px] text-slate-400">
                                        {item.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {selected && (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-400 text-white dark:bg-[#5b7188]">
                                <Check className="h-3 w-3" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
