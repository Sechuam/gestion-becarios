import { describe, expect, it } from 'vitest';

import {
    formatElapsed,
    formatHoursDecimal,
    getElapsedSeconds,
} from './time-format';

describe('time-format', () => {
    it('formats elapsed seconds as HH:MM:SS', () => {
        expect(formatElapsed(0)).toBe('00:00:00');
        expect(formatElapsed(59)).toBe('00:00:59');
        expect(formatElapsed(3661)).toBe('01:01:01');
    });

    it('does not format negative elapsed time', () => {
        expect(formatElapsed(-10)).toBe('00:00:00');
    });

    it('calculates elapsed seconds from a clock-in time', () => {
        const currentDate = new Date('2026-06-09T10:30:15');

        expect(getElapsedSeconds('09:15:00', currentDate)).toBe(4515);
    });

    it('formats decimal hours as hours and minutes', () => {
        expect(formatHoursDecimal(0.5)).toBe('30m');
        expect(formatHoursDecimal(1)).toBe('1h');
        expect(formatHoursDecimal(1.5)).toBe('1h 30m');
    });
});
