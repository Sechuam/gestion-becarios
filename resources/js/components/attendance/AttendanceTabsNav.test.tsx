import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tabs } from '@/components/ui/tabs';
import { AttendanceTabsNav } from './AttendanceTabsNav';

const renderTabsNav = (isIntern = true) => {
    return render(
        <Tabs defaultValue={isIntern ? 'registro' : 'gestion'}>
            <AttendanceTabsNav isIntern={isIntern} />
        </Tabs>,
    );
};

describe('AttendanceTabsNav', () => {
    it('renders intern attendance tabs', () => {
        renderTabsNav();

        expect(
            screen.getByRole('tab', { name: 'Registro de jornada' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: 'Mis ausencias' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: 'Calendario' }),
        ).toBeInTheDocument();
    });

    it('renders only management tab for non interns', () => {
        renderTabsNav(false);

        expect(
            screen.getByRole('tab', { name: 'Gestión horaria' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('tab', { name: 'Registro de jornada' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('tab', { name: 'Mis ausencias' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('tab', { name: 'Calendario' }),
        ).not.toBeInTheDocument();
    });

    it('marks the default tab as selected', () => {
        renderTabsNav();

        expect(
            screen.getByRole('tab', { name: 'Registro de jornada' }),
        ).toHaveAttribute('aria-selected', 'true');
    });
});
