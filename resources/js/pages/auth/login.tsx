import { Form, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { fadeInUp } from '@/lib/animations';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="Bienvenido de nuevo"
            description="Entra para continuar gestionando becarios, tareas, asistencia e informes."
        >
            <Head title="Iniciar sesión" />

            <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            {status && (
                                <motion.div
                                    variants={fadeInUp}
                                    className="rounded-xl border border-[#b9c8be] bg-[#edf5ef] px-4 py-3 text-center text-sm font-semibold text-[#315d58]"
                                >
                                    {status}
                                </motion.div>
                            )}

                            <motion.div
                                className="grid gap-5"
                                initial="initial"
                                animate="animate"
                                variants={{
                                    animate: {
                                        transition: {
                                            staggerChildren: 0.1,
                                        },
                                    },
                                }}
                            >
                                <motion.div
                                    variants={fadeInUp}
                                    className="grid gap-2"
                                >
                                    <Label htmlFor="email">
                                        Correo electrónico
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7a8697]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="correo@ejemplo.com"
                                            className="h-11 border-[#d6dfd3] bg-[#fbfcf9] pl-10 shadow-sm focus-visible:ring-[#4e7f78]/30"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </motion.div>

                                <motion.div
                                    variants={fadeInUp}
                                    className="grid gap-2"
                                >
                                    <div className="flex items-center">
                                        <Label htmlFor="password">
                                            Contraseña
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm"
                                                tabIndex={5}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </TextLink>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7a8697]" />
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Contraseña"
                                            className="h-11 border-[#d6dfd3] bg-[#fbfcf9] pr-10 pl-10 shadow-sm focus-visible:ring-[#4e7f78]/30"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[#7a8697] transition hover:bg-[#eef3ed] hover:text-[#172033]"
                                            aria-label={
                                                showPassword
                                                    ? 'Ocultar contraseña'
                                                    : 'Mostrar contraseña'
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    <InputError message={errors.password} />
                                </motion.div>

                                <motion.div
                                    variants={fadeInUp}
                                    className="flex items-center space-x-3 rounded-xl border border-[#e0e7dd] bg-[#fbfcf9] px-3 py-2.5"
                                >
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">Recuérdame</Label>
                                </motion.div>

                                <motion.div variants={fadeInUp}>
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-[#2b3036] text-white shadow-lg shadow-slate-900/12 hover:bg-[#3b424b]"
                                        tabIndex={4}
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Iniciar sesión
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {canRegister && (
                                <motion.div
                                    variants={fadeInUp}
                                    className="rounded-xl border border-[#e0e7dd] bg-[#fbfcf9] px-4 py-3 text-center text-sm text-[#5a657c]"
                                >
                                    ¿No tienes cuenta?{' '}
                                    <TextLink href={register()} tabIndex={5}>
                                        Crear cuenta
                                    </TextLink>
                                </motion.div>
                            )}

                            <motion.div
                                variants={fadeInUp}
                                className="flex items-center justify-center gap-2 text-xs font-semibold text-[#6a7687]"
                            >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Acceso protegido por roles y verificación
                            </motion.div>
                        </>
                    )}
                </Form>
            </motion.div>
        </AuthLayout>
    );
}
