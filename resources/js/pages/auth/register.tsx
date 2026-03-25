import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { motion } from 'framer-motion';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Animación base
    const fadeInUp = {
        initial: { opacity: 0, y: 25 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <AuthLayout
            title="Crear cuenta"
            description="Completa tus datos para empezar en BecaGest"
        >
            <Head title="Crear cuenta" />

            {/* Contenedor principal animado */}
            <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Contenedor en cascada para stagger */}
                            <motion.div
                                className="grid gap-6"
                                initial="initial"
                                animate="animate"
                                variants={{
                                    animate: { transition: { staggerChildren: 0.1 } },
                                }}
                            >
                                {/* NOMBRE */}
                                <motion.div variants={fadeInUp} className="grid gap-2">
                                    <Label htmlFor="name">Nombre completo</Label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            name="name"
                                            placeholder="Tu nombre"
                                            className="pl-10"
                                        />
                                    </div>
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </motion.div>

                                {/* EMAIL */}
                                <motion.div variants={fadeInUp} className="grid gap-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            name="email"
                                            placeholder="correo@ejemplo.com"
                                            className="pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </motion.div>

                                {/* PASSWORD */}
                                <motion.div variants={fadeInUp} className="grid gap-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            tabIndex={3}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Contraseña"
                                            className="pl-10 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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

                                {/* CONFIRMAR PASSWORD */}
                                <motion.div variants={fadeInUp} className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirm ? 'text' : 'password'}
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            name="password_confirmation"
                                            placeholder="Confirmar contraseña"
                                            className="pl-10 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </motion.div>

                                {/* BOTÓN */}
                                <motion.div variants={fadeInUp}>
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-emerald-600 hover:bg-emerald-700"
                                        tabIndex={5}
                                        data-test="register-user-button"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Crear cuenta
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* LOGIN LINK */}
                            <motion.div
                                variants={fadeInUp}
                                className="text-center text-sm text-muted-foreground mt-2"
                            >
                                ¿Ya tienes cuenta?{' '}
                                <TextLink href={login()} tabIndex={6}>
                                    Inicia sesión
                                </TextLink>
                            </motion.div>

                            {/* SEGURIDAD */}
                            <motion.div
                                variants={fadeInUp}
                                className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2"
                            >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Tus datos están seguros
                            </motion.div>
                        </>
                    )}
                </Form>
            </motion.div>
        </AuthLayout>
    );
}