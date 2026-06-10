import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventAttendeesPanel } from './EventAttendeesPanel';

const manageableInterns = [
    {
        id: 1,
        user_id: 101,
        name: 'Ana Garcia',
        education_center: 'IES Norte',
    },
    {
        id: 2,
        user_id: 102,
        name: 'Luis Perez',
        education_center: 'IES Sur',
    },
];

const manageableTutors = [
    {
        id: 3,
        user_id: 201,
        name: 'Marta Tutor',
        email: 'marta@example.com',
    },
];

describe('EventAttendeesPanel', () => {
    it('shows an unavailable message when attendees cannot be managed', () => {
        render(
            <EventAttendeesPanel
                available={false}
                manageableInterns={[]}
                manageableTutors={[]}
                selectedAttendeeIds={[]}
                onToggleAttendee={vi.fn()}
            />,
        );

        expect(
            screen.getByText('Selección de invitados no disponible'),
        ).toBeInTheDocument();
    });

    it('searches interns and toggles a result', async () => {
        const user = userEvent.setup();
        const onToggleAttendee = vi.fn();

        render(
            <EventAttendeesPanel
                available
                manageableInterns={manageableInterns}
                manageableTutors={manageableTutors}
                selectedAttendeeIds={[]}
                onToggleAttendee={onToggleAttendee}
            />,
        );

        await user.type(
            screen.getByPlaceholderText('Buscar becario por nombre...'),
            'ana',
        );
        await user.click(screen.getByRole('button', { name: /Ana Garcia/i }));

        expect(screen.getByText('IES Norte')).toBeInTheDocument();
        expect(onToggleAttendee).toHaveBeenCalledWith(101);
    });

    it('searches tutors by email and toggles a result', async () => {
        const user = userEvent.setup();
        const onToggleAttendee = vi.fn();

        render(
            <EventAttendeesPanel
                available
                manageableInterns={manageableInterns}
                manageableTutors={manageableTutors}
                selectedAttendeeIds={[]}
                onToggleAttendee={onToggleAttendee}
            />,
        );

        await user.type(
            screen.getByPlaceholderText('Buscar tutor por nombre o email...'),
            'marta@example.com',
        );
        await user.click(screen.getByRole('button', { name: /Marta Tutor/i }));

        expect(onToggleAttendee).toHaveBeenCalledWith(201);
    });

    it('renders selected attendees and allows removing them', async () => {
        const user = userEvent.setup();
        const onToggleAttendee = vi.fn();

        render(
            <EventAttendeesPanel
                available
                manageableInterns={manageableInterns}
                manageableTutors={manageableTutors}
                selectedAttendeeIds={[101, 201]}
                onToggleAttendee={onToggleAttendee}
            />,
        );

        expect(screen.getByText('2 seleccionados')).toBeInTheDocument();
        expect(screen.getByText('Becarios seleccionados')).toBeInTheDocument();
        expect(screen.getByText('Tutores seleccionados')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Ana Garcia/i }));

        expect(onToggleAttendee).toHaveBeenCalledWith(101);
    });

    it('shows an empty search result message', async () => {
        const user = userEvent.setup();

        render(
            <EventAttendeesPanel
                available
                manageableInterns={manageableInterns}
                manageableTutors={manageableTutors}
                selectedAttendeeIds={[]}
                onToggleAttendee={vi.fn()}
            />,
        );

        await user.type(
            screen.getByPlaceholderText('Buscar becario por nombre...'),
            'nadie',
        );

        expect(
            screen.getByText('No hay becarios con ese nombre'),
        ).toBeInTheDocument();
    });
});
