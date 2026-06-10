import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestAbsenceModal } from './RequestAbsenceModal';

const { post, toast, pageProps } = vi.hoisted(() => ({
    post: vi.fn(),
    toast: vi.fn(),
    pageProps: {
        auth: {
            user: {
                roles: ['intern'],
            },
        },
    },
}));

vi.mock('@inertiajs/react', async () => {
    const React = await import('react');

    return {
        Link: ({
            href,
            children,
        }: {
            href: string;
            children: React.ReactNode;
        }) => <a href={href}>{children}</a>,
        usePage: () => ({
            props: pageProps,
        }),
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
                processing: false,
                errors,
                reset: vi.fn(() => setState(initialData)),
            };
        },
    };
});

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast,
    }),
}));

describe('RequestAbsenceModal', () => {
    beforeEach(() => {
        post.mockReset();
        toast.mockReset();
        pageProps.auth.user.roles = ['intern'];
    });

    it('opens the form from the trigger button', async () => {
        const user = userEvent.setup();

        render(<RequestAbsenceModal />);

        await user.click(
            screen.getByRole('button', { name: 'Registrar Ausencia' }),
        );

        expect(
            screen.getByRole('heading', { name: 'Registrar Ausencia' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveValue('Examen');
        expect(
            screen.getByRole('button', { name: 'Enviar Petición' }),
        ).toBeInTheDocument();
    });

    it('submits the absence request with form data', async () => {
        const user = userEvent.setup();
        post.mockImplementation((_url, options) => options.onSuccess?.());

        render(<RequestAbsenceModal />);

        await user.click(
            screen.getByRole('button', { name: 'Registrar Ausencia' }),
        );
        const dateInput = document.querySelector(
            'input[type="date"]',
        ) as HTMLInputElement;
        await user.type(dateInput, '2026-06-15');
        await user.selectOptions(screen.getByRole('combobox'), 'Enfermedad');

        const file = new File(['justificante'], 'justificante.pdf', {
            type: 'application/pdf',
        });
        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        await user.upload(fileInput, file);

        await user.click(
            screen.getByRole('button', { name: 'Enviar Petición' }),
        );

        expect(post).toHaveBeenCalledWith(
            '/absences',
            expect.objectContaining({
                forceFormData: true,
                onSuccess: expect.any(Function),
            }),
        );
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Solicitud enviada',
            }),
        );
    });

    it('opens from the calendar event with the selected date', () => {
        render(<RequestAbsenceModal />);

        act(() => {
            window.dispatchEvent(
                new CustomEvent('open-absence-modal', {
                    detail: { date: '2026-06-20' },
                }),
            );
        });

        expect(screen.getByDisplayValue('2026-06-20')).toBeInTheDocument();
    });
});
