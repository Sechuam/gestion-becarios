type Props = {
    showJornadas: boolean;
    showAbsences: boolean;
    showPersonalEvents: boolean;
    onShowJornadasChange: (value: boolean) => void;
    onShowAbsencesChange: (value: boolean) => void;
    onShowPersonalEventsChange: (value: boolean) => void;
};

export function CalendarVisibilityFilters({
    showJornadas,
    showAbsences,
    showPersonalEvents,
    onShowJornadasChange,
    onShowAbsencesChange,
    onShowPersonalEventsChange,
}: Props) {
    return (
        <div className="mb-4 flex items-center justify-end gap-4 px-2 pt-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <input
                    type="checkbox"
                    checked={showJornadas}
                    onChange={(event) =>
                        onShowJornadasChange(event.target.checked)
                    }
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                Mostrar Jornadas
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <input
                    type="checkbox"
                    checked={showAbsences}
                    onChange={(event) =>
                        onShowAbsencesChange(event.target.checked)
                    }
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                Mostrar Ausencias
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <input
                    type="checkbox"
                    checked={showPersonalEvents}
                    onChange={(event) =>
                        onShowPersonalEventsChange(event.target.checked)
                    }
                    className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                />
                Mis Eventos
            </label>
        </div>
    );
}
