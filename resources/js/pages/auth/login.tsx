import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { fadeInUp } from '@/lib/animations';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { motion } from "framer-motion";

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
            title="Inicia sesión"
            description="Accede para gestionar tus becarios y tareas"
        >
            <Head title="Iniciar sesión" />

            {/* Fade general del login */}
            <motion.div
                variants={fadeInUp}
                initial="initial"   // ⚠️ CORREGIDO (tenías "animate")
                animate="animate"
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* CONTENEDOR CON CASCADA */}
                            <motion.div
                                className="grid gap-6"
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
                                {/* EMAIL */}
                                <motion.div variants={fadeInUp} className="grid gap-2">
                                    <Label htmlFor="email">
                                        Correo electrónico
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="correo@ejemplo.com"
                                            className="pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </motion.div>

                                {/* PASSWORD */}
                                <motion.div variants={fadeInUp} className="grid gap-2">
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
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Contraseña"
                                            className="pl-10 pr-10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

                                {/* REMEMBER */}
                                <motion.div variants={fadeInUp} className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">
                                        Recuérdame
                                    </Label>
                                </motion.div>

                                {/* BOTÓN */}
                                <motion.div variants={fadeInUp}>
                                    <Button
                                        type="submit"
                                        className="mt-4 h-11 w-full bg-emerald-600 hover:bg-emerald-700"
                                        tabIndex={4}
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Iniciar sesión
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* REGISTER */}
                            {canRegister && (
                                <motion.div
                                    variants={fadeInUp}
                                    className="text-center text-sm text-muted-foreground"
                                >
                                    ¿No tienes cuenta?{' '}
                                    <TextLink href={register()} tabIndex={5}>
                                        Crear cuenta
                                    </TextLink>
                                </motion.div>
                            )}

                            {/* SEGURIDAD */}
                            <motion.div
                                variants={fadeInUp}
                                className="flex items-center justify-center gap-2 text-xs text-slate-500"
                            >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Tus datos están seguros
                            </motion.div>
                        </>
                    )}
                </Form>
            </motion.div>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
