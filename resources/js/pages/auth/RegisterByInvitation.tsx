import { FormEventHandler } from 'react';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterByInvitation({ token, email }: { token: string, email: string }) {
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
            title="Aceptar Invitación" 
            description="Has sido invitado a unirte a Gestion Becarios. Solo necesitas rellenar tus datos."
        >
            <Head title="Aceptar Invitación" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                
                {/* Mostramos alertas si hay algo general fallando como el token */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-md text-sm border border-red-200">
                        Hay errores en el registro, revisa los datos aportados. 
                        {errors.token && <span> (Token inválido o expirado)</span>}
                    </div>
                )}

                {/* Email bloqueado */}
                <div className="grid gap-2">
                    <Label htmlFor="email">Correo Electrónico asignado</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        disabled // Lo bloqueamos para que no puedan cambiarlo
                        className="bg-muted text-muted-foreground"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Tu Nombre Completo</Label>
                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Registrando...' : 'Completar Registro'}
                </Button>
            </form>
        </AuthLayout>
    );
}
