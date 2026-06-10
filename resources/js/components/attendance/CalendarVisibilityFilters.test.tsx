import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CalendarVisibilityFilters } from './CalendarVisibilityFilters';

const renderFilters = (
    props: Partial<ComponentProps<typeof CalendarVisibilityFilters>> = {},
) => {
    return render(
        <CalendarVisibilityFilters
            showJornadas
            showAbsences
            showPersonalEvents
            onShowAbsencesChange={vi.fn()}
            onShowJornadasChange={vi.fn()}
            onShowPersonalEventsChange={vi.fn()}
            {...props}
        />,
    );
};

describe('CalendarVisibilityFilters', () => {
    it('renders the available filters', () => {
        renderFilters();

        expect(
            screen.getByRole('checkbox', { name: 'Mostrar Jornadas' }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('checkbox', { name: 'Mostrar Ausencias' }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('checkbox', { name: 'Mis Eventos' }),
        ).toBeInTheDocument();
    });

    it('hides jornadas filter when it is not allowed', () => {
        renderFilters({ canShowJornadas: false });

        expect(
            screen.queryByRole('checkbox', { name: 'Mostrar Jornadas' }),
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole('checkbox', { name: 'Mostrar Ausencias' }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('checkbox', { name: 'Mis Eventos' }),
        ).toBeInTheDocument();
    });

    it('checks filters according to their props', () => {
        renderFilters({
            showJornadas: false,
            showAbsences: true,
            showPersonalEvents: false,
        });

        expect(
            screen.getByRole('checkbox', { name: 'Mostrar Jornadas' }),
        ).not.toBeChecked();
        expect(
            screen.getByRole('checkbox', { name: 'Mostrar Ausencias' }),
        ).toBeChecked();
        expect(
            screen.getByRole('checkbox', { name: 'Mis Eventos' }),
        ).not.toBeChecked();
    });

    it('calls absences change handler when checkbox is clicked', async () => {
        const user = userEvent.setup();
        const onShowAbsencesChange = vi.fn();

        renderFilters({
            showAbsences: true,
            onShowAbsencesChange,
        });

        await user.click(
            screen.getByRole('checkbox', { name: 'Mostrar Ausencias' }),
        );

        expect(onShowAbsencesChange).toHaveBeenCalledWith(false);
    });

    it('calls personal events change handler when checkbox is clicked', async () => {
        const user = userEvent.setup();
        const onShowPersonalEventsChange = vi.fn();

        renderFilters({
            showPersonalEvents: false,
            onShowPersonalEventsChange,
        });

        await user.click(screen.getByRole('checkbox', { name: 'Mis Eventos' }));

        expect(onShowPersonalEventsChange).toHaveBeenCalledWith(true);
    });

    it('calls jornadas change handler when checkbox is clicked', async () => {
        const user = userEvent.setup();
        const onShowJornadasChange = vi.fn();

        renderFilters({
            showJornadas: true,
            onShowJornadasChange,
        });

        await user.click(
            screen.getByRole('checkbox', { name: 'Mostrar Jornadas' }),
        );

        expect(onShowJornadasChange).toHaveBeenCalledWith(false);
    });
});
