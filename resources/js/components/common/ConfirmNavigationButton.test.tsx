import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmNavigationButton } from './ConfirmNavigationButton';

const { visit } = vi.hoisted(() => ({
    visit: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    router: {
        visit,
    },
}));

describe('ConfirmNavigationButton', () => {
    beforeEach(() => {
        visit.mockClear();
    });

    it('renders the trigger button', () => {
        render(
            <ConfirmNavigationButton
                href="/becarios"
                title="Salir del formulario"
                description="Perderas los cambios sin guardar."
            >
                Volver
            </ConfirmNavigationButton>,
        );

        expect(
            screen.getByRole('button', { name: 'Volver' }),
        ).toBeInTheDocument();
    });

    it('opens the confirmation dialog', async () => {
        const user = userEvent.setup();

        render(
            <ConfirmNavigationButton
                href="/becarios"
                title="Salir del formulario"
                description="Perderas los cambios sin guardar."
            >
                Volver
            </ConfirmNavigationButton>,
        );

        await user.click(screen.getByRole('button', { name: 'Volver' }));

        expect(
            screen.getByRole('heading', { name: 'Salir del formulario' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Perderas los cambios sin guardar.'),
        ).toBeInTheDocument();
    });

    it('navigates to the href when confirmed', async () => {
        const user = userEvent.setup();

        render(
            <ConfirmNavigationButton
                href="/becarios"
                title="Salir del formulario"
                description="Perderas los cambios sin guardar."
                confirmLabel="Salir"
            >
                Volver
            </ConfirmNavigationButton>,
        );

        await user.click(screen.getByRole('button', { name: 'Volver' }));
        await user.click(screen.getByRole('button', { name: 'Salir' }));

        expect(visit).toHaveBeenCalledWith('/becarios');
    });

    it('closes the dialog without navigating when cancelled', async () => {
        const user = userEvent.setup();

        render(
            <ConfirmNavigationButton
                href="/becarios"
                title="Salir del formulario"
                description="Perderas los cambios sin guardar."
            >
                Volver
            </ConfirmNavigationButton>,
        );

        await user.click(screen.getByRole('button', { name: 'Volver' }));
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(visit).not.toHaveBeenCalled();
        expect(
            screen.queryByRole('heading', { name: 'Salir del formulario' }),
        ).not.toBeInTheDocument();
    });
});
