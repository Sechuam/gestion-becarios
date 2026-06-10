import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

vi.mock('@inertiajs/react', () => ({
    Link: ({
        href,
        children,
        className,
    }: {
        href: string;
        children: React.ReactNode;
        className?: string;
    }) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

const links = [
    { url: null, label: '&laquo; Previous', active: false },
    { url: '/becarios?page=1', label: '1', active: false },
    { url: '/becarios?page=2', label: '2', active: true },
    { url: '/becarios?page=3', label: '3', active: false },
    { url: '/becarios?page=3', label: 'Next &raquo;', active: false },
];

describe('Pagination', () => {
    it('renders pagination links', () => {
        render(<Pagination links={links} />);

        expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '2' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '3' })).toBeInTheDocument();
    });

    it('does not render when there are not enough links', () => {
        const shortLinks = [
            { url: null, label: '&laquo; Previous', active: false },
            { url: '/becarios?page=1', label: '1', active: true },
            { url: null, label: 'Next &raquo;', active: false },
        ];

        const { container } = render(<Pagination links={shortLinks} />);
        expect(container.firstChild).toBeNull();
    });

    it('tranlates previous and next labels', () => {
        render(<Pagination links={links} />);
        expect(screen.getByText(/Anterior/)).toBeInTheDocument();
        expect(screen.getByText(/Siguiente/)).toBeInTheDocument();
    });

    it('marks the active link', () => {
        render(<Pagination links={links} />);
        expect(screen.getByRole('link', { name: '2' })).toHaveClass(
            'scale-105',
        );
    });

    it('disables links without url', () => {
        render(<Pagination links={links} />);

        const previousLink = screen.getByRole('link', { name: '« Anterior' });

        expect(previousLink).toHaveAttribute('href', '#');
        expect(previousLink).toHaveClass('pointer-events-none');
        expect(previousLink).toHaveClass('opacity-45');
    });

    it('applies custom class names', () => {
        const { container } = render(
            <Pagination links={links} className="mt-6" />,
        );

        expect(container.firstChild).toHaveClass('mt-6');
    });
});
