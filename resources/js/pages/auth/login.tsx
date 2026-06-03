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
                                    className="rounded-xl border border-[#b9c8be] bg-[#edf5ef] px-4 py-3 text-center text-sm font-semibold text-[#315d58] dark:border-[#9fc6bf]/30 dark:bg-[#19322f] dark:text-[#c7e4df]"
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
                                    <Label
                                        htmlFor="email"
                                        className="text-[#2b3036] dark:text-[#dce5ec]"
                                    >
                                        Correo electrónico
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7a8697] dark:text-[#9fb0c2]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="correo@ejemplo.com"
                                            className="h-11 border-[#d6dfd3] bg-[#fbfcf9] pl-10 text-[#172033] shadow-sm placeholder:text-[#8b97a8] focus-visible:ring-[#4e7f78]/30 dark:border-white/12 dark:bg-[#182432] dark:text-[#edf1f5] dark:placeholder:text-[#8fa1b4] dark:focus-visible:ring-[#9fc6bf]/30"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </motion.div>

                                <motion.div
                                    variants={fadeInUp}
                                    className="grid gap-2"
                                >
                                    <div className="flex items-center">
                                        <Label
                                            htmlFor="password"
                                            className="text-[#2b3036] dark:text-[#dce5ec]"
                                        >
                                            Contraseña
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm text-[#4e5d73] decoration-[#b7c2cf] hover:text-[#172033] dark:text-[#b9c6d5] dark:decoration-[#5d7185] dark:hover:text-white"
                                                tabIndex={5}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </TextLink>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7a8697] dark:text-[#9fb0c2]" />
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
                                            className="h-11 border-[#d6dfd3] bg-[#fbfcf9] pr-10 pl-10 text-[#172033] shadow-sm placeholder:text-[#8b97a8] focus-visible:ring-[#4e7f78]/30 dark:border-white/12 dark:bg-[#182432] dark:text-[#edf1f5] dark:placeholder:text-[#8fa1b4] dark:focus-visible:ring-[#9fc6bf]/30"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[#7a8697] transition hover:bg-[#eef3ed] hover:text-[#172033] dark:text-[#a9b7c8] dark:hover:bg-white/10 dark:hover:text-white"
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
                                    className="flex items-center space-x-3 px-1"
                                >
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-[#c8d5ce] data-[state=checked]:border-[#4e7f78] data-[state=checked]:bg-[#4e7f78] dark:border-[#607488] dark:data-[state=checked]:border-[#9fc6bf] dark:data-[state=checked]:bg-[#9fc6bf] dark:data-[state=checked]:text-[#14202a]"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-[#4e5d73] dark:text-[#c7d2de]"
                                    >
                                        Recuérdame
                                    </Label>
                                </motion.div>

                                <motion.div variants={fadeInUp}>
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-[#2b3036] text-white shadow-lg shadow-slate-900/12 hover:bg-[#3b424b] dark:bg-[#9fc6bf] dark:text-[#14202a] dark:hover:bg-[#b7d8d2]"
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
                                    className="rounded-xl border border-[#e0e7dd] bg-[#fbfcf9] px-4 py-3 text-center text-sm text-[#5a657c] dark:border-white/12 dark:bg-[#182432] dark:text-[#b9c6d5]"
                                >
                                    ¿No tienes cuenta?{' '}
                                    <TextLink
                                        href={register()}
                                        className="text-[#172033] decoration-[#aeb9c7] hover:text-[#315d58] dark:text-[#edf1f5] dark:decoration-[#63778b] dark:hover:text-[#c7e4df]"
                                        tabIndex={5}
                                    >
                                        Crear cuenta
                                    </TextLink>
                                </motion.div>
                            )}

                            <motion.div
                                variants={fadeInUp}
                                className="flex items-center justify-center gap-2 text-xs font-semibold text-[#6a7687] dark:text-[#aeb9c7]"
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
