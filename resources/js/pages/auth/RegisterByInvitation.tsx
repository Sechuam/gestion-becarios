import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function RegisterByInvitation({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/registro/invitacion/registrar', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Aceptar invitación"
            description="Has sido invitado a unirte a Gestión Becarios. Solo necesitas completar tus datos."
        >
            <Head title="Aceptar Invitación" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {Object.keys(errors).length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        Hay errores en el registro, revisa los datos aportados.
                        {errors.token && (
                            <span> Token inválido o expirado.</span>
                        )}
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico asignado</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        disabled
                        className="bg-muted text-muted-foreground"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Tu nombre completo</Label>
                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">
                        Confirmar contraseña
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button
                    type="submit"
                    className="h-11 w-full"
                    disabled={processing}
                >
                    {processing ? 'Registrando...' : 'Completar registro'}
                </Button>
            </form>
        </AuthLayout>
    );
}
