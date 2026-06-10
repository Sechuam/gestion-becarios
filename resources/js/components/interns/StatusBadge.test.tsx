import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
    it('renders the active status label', () => {
        render(<StatusBadge status="active" />);
        expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('renders the inactive status label', () => {
        render(<StatusBadge status="completed" />);
        expect(screen.getByText('Finalizado')).toBeInTheDocument();
    });

    it('renders the status label', () => {
        render(<StatusBadge status="abandoned" />);
        expect(screen.getByText('Abandonado')).toBeInTheDocument();
    });

    it('renders unknown status as provided', () => {
        render(<StatusBadge status="unknown-status" />);
        expect(screen.getByText('unknown-status')).toBeInTheDocument();
    });

    it('applies custom class names', () => {
        const { container } = render(
            <StatusBadge status="active" className="mt-4" />,
        );
        expect(container.firstChild).toHaveClass('mt-4');
    });
});
