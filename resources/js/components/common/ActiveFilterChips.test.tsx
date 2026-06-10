import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ActiveFilterChips } from './ActiveFilterChips';

const chips = [
    { key: 'status', label: 'Estado: Activo' },
    { key: 'center', label: 'Centro: IES Norte' },
];

describe('ActiveFilterChips', () => {
    it('does not render when there are no chips', () => {
        const { container } = render(
            <ActiveFilterChips
                chips={[]}
                onRemove={vi.fn()}
                onClearAll={vi.fn()}
            />,
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders the active filter chips', () => {
        render(
            <ActiveFilterChips
                chips={chips}
                onRemove={vi.fn()}
                onClearAll={vi.fn()}
            />,
        );

        expect(screen.getByText('Estado: Activo')).toBeInTheDocument();
        expect(screen.getByText('Centro: IES Norte')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Limpiar filtros' }),
        ).toBeInTheDocument();
    });

    it('removes a chip when clicked', async () => {
        const user = userEvent.setup();
        const onRemove = vi.fn();

        render(
            <ActiveFilterChips
                chips={chips}
                onRemove={onRemove}
                onClearAll={vi.fn()}
            />,
        );

        await user.click(
            screen.getByRole('button', { name: /Estado: Activo/ }),
        );

        expect(onRemove).toHaveBeenCalledWith('status');
    });

    it('clears all filters when the clear button is clicked', async () => {
        const user = userEvent.setup();
        const onClearAll = vi.fn();

        render(
            <ActiveFilterChips
                chips={chips}
                onRemove={vi.fn()}
                onClearAll={onClearAll}
            />,
        );

        await user.click(
            screen.getByRole('button', { name: 'Limpiar filtros' }),
        );

        expect(onClearAll).toHaveBeenCalled();
    });
});
