import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventDetailsFields } from './EventDetailsFields';

const colors = [
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Rojo', value: '#ef4444' },
];

const baseData = {
    title: 'Reunion inicial',
    description: 'Preparar objetivos',
    start_date: '2026-06-10',
    end_date: '2026-06-10',
    start_time: '09:00',
    end_time: '10:00',
    all_day: false,
    color: '#3b82f6',
    attendee_ids: [],
};

describe('EventDetailsFields', () => {
    it('renders event form values and validation errors', () => {
        render(
            <EventDetailsFields
                data={baseData}
                errors={{ title: 'El titulo es obligatorio.' }}
                colors={colors}
                setData={vi.fn()}
            />,
        );

        expect(screen.getByDisplayValue('Reunion inicial')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Preparar objetivos')).toBeInTheDocument();
        expect(screen.getByText('El titulo es obligatorio.')).toBeInTheDocument();
    });

    it('updates title and all-day state', async () => {
        const user = userEvent.setup();
        const setData = vi.fn();

        render(
            <EventDetailsFields
                data={baseData}
                errors={{}}
                colors={colors}
                setData={setData}
            />,
        );

        fireEvent.change(
            screen.getByPlaceholderText('Ej: Reunión de equipo...'),
            {
                target: { value: 'Seguimiento' },
            },
        );
        await user.click(screen.getByRole('checkbox', { name: 'Todo el día' }));

        expect(setData).toHaveBeenCalledWith('title', 'Seguimiento');
        expect(setData).toHaveBeenCalledWith('all_day', true);
    });

    it('hides time inputs for all-day events', () => {
        render(
            <EventDetailsFields
                data={{ ...baseData, all_day: true }}
                errors={{}}
                colors={colors}
                setData={vi.fn()}
            />,
        );

        expect(screen.queryByDisplayValue('09:00')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('10:00')).not.toBeInTheDocument();
    });

    it('updates the selected color', async () => {
        const user = userEvent.setup();
        const setData = vi.fn();

        render(
            <EventDetailsFields
                data={baseData}
                errors={{}}
                colors={colors}
                setData={setData}
            />,
        );

        const colorButtons = screen.getAllByRole('button');
        await user.click(colorButtons[1]);

        expect(setData).toHaveBeenCalledWith('color', '#ef4444');
    });
});
