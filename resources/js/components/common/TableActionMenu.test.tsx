import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TableActionMenu } from './TableActionMenu';

const { visit } = vi.hoisted(() => ({
    visit: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({
        href,
        children,
    }: {
        href: string;
        children: React.ReactNode;
    }) => <a href={href}>{children}</a>,
    router: {
        visit,
    },
}));

describe('TableActionMenu', () => {
    beforeEach(() => {
        visit.mockClear();
    });

    it('renders a placeholder when there are no enabled actions', () => {
        render(
            <TableActionMenu
                actions={[
                    {
                        label: 'Editar',
                        href: '/becarios/1/edit',
                        disabled: true,
                    },
                ]}
            />,
        );

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('opens the menu and renders enabled actions', async () => {
        const user = userEvent.setup();

        render(
            <TableActionMenu
                actions={[
                    { label: 'Ver', href: '/becarios/1', icon: 'view' },
                    {
                        label: 'Editar',
                        href: '/becarios/1/edit',
                        icon: 'edit',
                    },
                    {
                        label: 'Eliminar',
                        href: '/becarios/1',
                        icon: 'delete',
                        disabled: true,
                    },
                ]}
            />,
        );

        await user.click(screen.getByRole('button'));

        expect(screen.getByRole('link', { name: 'Ver' })).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Editar' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: 'Eliminar' }),
        ).not.toBeInTheDocument();
    });

    it('calls an action click handler from the menu', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <TableActionMenu
                actions={[
                    {
                        label: 'Notas',
                        icon: 'notes',
                        onClick,
                    },
                ]}
            />,
        );

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByRole('menuitem', { name: 'Notas' }));

        expect(onClick).toHaveBeenCalledOnce();
    });

    it('opens a confirmation dialog before running a confirmed action', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <TableActionMenu
                actions={[
                    {
                        label: 'Restaurar',
                        icon: 'restore',
                        onClick,
                        confirm: {
                            title: 'Restaurar becario',
                            description:
                                'El becario volvera a estar disponible.',
                            confirmLabel: 'Restaurar',
                        },
                    },
                ]}
            />,
        );

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByRole('menuitem', { name: 'Restaurar' }));

        expect(
            screen.getByRole('heading', { name: 'Restaurar becario' }),
        ).toBeInTheDocument();
        expect(onClick).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Restaurar' }));

        expect(onClick).toHaveBeenCalledOnce();
    });

    it('navigates when confirming an action with href', async () => {
        const user = userEvent.setup();

        render(
            <TableActionMenu
                actions={[
                    {
                        label: 'Eliminar',
                        icon: 'delete',
                        href: '/becarios/1',
                        variant: 'destructive',
                        confirm: {
                            title: 'Eliminar becario',
                            description:
                                'Esta accion no se puede deshacer.',
                            confirmLabel: 'Eliminar',
                        },
                    },
                ]}
            />,
        );

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
        await user.click(screen.getByRole('button', { name: 'Eliminar' }));

        expect(visit).toHaveBeenCalledWith('/becarios/1');
    });
});
