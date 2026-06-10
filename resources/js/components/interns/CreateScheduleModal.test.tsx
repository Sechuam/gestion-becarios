import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateScheduleModal } from './CreateScheduleModal';

const { post, patch, destroy } = vi.hoisted(() => ({
    post: vi.fn(),
    patch: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock('@inertiajs/react', async () => {
    const React = await import('react');

    return {
        router: {
            delete: destroy,
        },
        useForm: (initialData: Record<string, unknown>) => {
            const [data, setState] = React.useState(initialData);
            const [errors] = React.useState<Record<string, string>>({});

            const setData = (
                keyOrData: string | Record<string, unknown>,
                value?: unknown,
            ) => {
                if (typeof keyOrData === 'string') {
                    setState((current) => ({
                        ...current,
                        [keyOrData]: value,
                    }));
                    return;
                }

                setState(keyOrData);
            };

            return {
                data,
                setData,
                post,
                patch,
                processing: false,
                errors,
            };
        },
    };
});

const schedule = {
    id: 7,
    name: 'Horario Actual',
    start_date: '2026-01-01',
    end_date: null,
    monday_hours: 8,
    tuesday_hours: 8,
    wednesday_hours: 8,
    thursday_hours: 8,
    friday_hours: 6,
    saturday_hours: 0,
    sunday_hours: 0,
    monday_entry_time: '09:00',
    monday_exit_time: '18:00',
    tuesday_entry_time: '09:00',
    tuesday_exit_time: '18:00',
    wednesday_entry_time: '09:00',
    wednesday_exit_time: '18:00',
    thursday_entry_time: '09:00',
    thursday_exit_time: '18:00',
    friday_entry_time: '09:00',
    friday_exit_time: '15:00',
    saturday_entry_time: null,
    saturday_exit_time: null,
    sunday_entry_time: null,
    sunday_exit_time: null,
};

describe('CreateScheduleModal', () => {
    beforeEach(() => {
        post.mockReset();
        patch.mockReset();
        destroy.mockReset();
        vi.restoreAllMocks();
    });

    it('opens the create schedule form', async () => {
        const user = userEvent.setup();

        render(<CreateScheduleModal userId={12} />);

        await user.click(
            screen.getByRole('button', { name: /Anadir horario/i }),
        );

        expect(
            screen.getByRole('heading', { name: 'Anadir nuevo horario' }),
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('Horario de Invierno')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Guardar horario' }),
        ).toBeInTheDocument();
    });

    it('applies the summer preset', async () => {
        const user = userEvent.setup();

        render(<CreateScheduleModal userId={12} />);

        await user.click(
            screen.getByRole('button', { name: /Anadir horario/i }),
        );
        await user.click(screen.getByRole('button', { name: 'Verano' }));

        expect(screen.getByDisplayValue('Horario de Verano')).toBeInTheDocument();
        expect(screen.getAllByDisplayValue('7')).toHaveLength(5);
        expect(screen.getAllByDisplayValue('08:00')).toHaveLength(5);
        expect(screen.getAllByDisplayValue('15:00')).toHaveLength(5);
    });

    it('submits a new schedule', async () => {
        const user = userEvent.setup();
        post.mockImplementation((_url, options) => options.onSuccess?.());

        render(<CreateScheduleModal userId={12} />);

        await user.click(
            screen.getByRole('button', { name: /Anadir horario/i }),
        );
        await user.clear(screen.getByDisplayValue('Horario de Invierno'));
        await user.type(screen.getByPlaceholderText('Ej: Horario de Verano'), 'Horario Junio');
        await user.click(screen.getByRole('button', { name: 'Guardar horario' }));

        expect(post).toHaveBeenCalledWith(
            '/schedules',
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        );
    });

    it('opens an existing schedule and saves changes', async () => {
        const user = userEvent.setup();
        patch.mockImplementation((_url, options) => options.onSuccess?.());

        render(<CreateScheduleModal userId={12} schedule={schedule} />);

        await user.click(screen.getByRole('button'));

        expect(
            screen.getByRole('heading', { name: 'Editar horario' }),
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('Horario Actual')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(patch).toHaveBeenCalledWith(
            '/schedules/7',
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        );
    });

    it('deletes an existing schedule after confirmation', async () => {
        const user = userEvent.setup();
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<CreateScheduleModal userId={12} schedule={schedule} />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByRole('button', { name: /Eliminar/i }));

        expect(window.confirm).toHaveBeenCalledWith(
            'Eliminar el horario "Horario Actual"?',
        );
        expect(destroy).toHaveBeenCalledWith(
            '/schedules/7',
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        );
    });
});
