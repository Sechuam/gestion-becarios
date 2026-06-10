import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
    it('renders the title and description', () => {
        render(
            <EmptyState
                title="Sin becarios"
                description="Todavia no hay becarios registrados."
            />,
        );

        expect(screen.getByText('Sin becarios')).toBeInTheDocument();
        expect(
            screen.getByText('Todavia no hay becarios registrados.'),
        ).toBeInTheDocument();
    });

    it('renders an action when provided', () => {
        render(
            <EmptyState
                title="Sin tareas"
                description="No tienes tareas pendientes."
                action={<button type="button">Crear tarea</button>}
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Crear tarea' }),
        ).toBeInTheDocument();
    });

    it('calls the action handler when the action button is clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(
            <EmptyState
                title="Sin tareas"
                description="No tienes tareas pendientes."
                action={
                    <button type="button" onClick={handleClick}>
                        Crear tarea
                    </button>
                }
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Crear tarea' }));
        expect(handleClick).toHaveBeenCalled();
    });
});
