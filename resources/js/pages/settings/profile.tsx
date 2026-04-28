import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, useForm } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { useRef, useState } from 'react';
import { User, Building2, CalendarRange, Phone, GraduationCap, MapPin, Mail, Camera, Eye, Pencil, Check, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import ImageCropperModal from '@/components/ImageCropperModal';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mi cuenta',
        href: edit(),
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    intern,
    education_center,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    intern?: any;
    education_center?: any;
}) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    // Lógica de Avatar
    const { data: avatarData, setData: setAvatarData, post: postAvatar, processing: avatarProcessing } = useForm({
        avatar: null as File | null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setOriginalImage(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImageBlob: Blob) => {
        const file = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' });
        setAvatarData('avatar', file);
        setPreviewUrl(URL.createObjectURL(croppedImageBlob));
    };

    const submitAvatar = () => {
        if (!avatarData.avatar) return;
        postAvatar(ProfileController.updateAvatar.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setPreviewUrl(null);
                setOriginalImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const cancelSelection = () => {
        setPreviewUrl(null);
        setOriginalImage(null);
        setAvatarData('avatar', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajustes de Perfil" />

            <SettingsLayout>
                <div className="space-y-6">

                    {/* AVATAR SECTION */}
                    <div className="flex flex-col items-center md:flex-row md:items-start gap-8 pb-6 border-b border-sidebar/20">
                        <div className="relative group">
                            <Avatar className="h-32 w-32 shrink-0 border-4 border-white dark:border-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                                <AvatarImage src={previewUrl || user.avatar || ''} className="object-cover" alt={user.name} />
                                <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all ring-2 ring-white dark:ring-slate-800"
                                title="Cambiar foto"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="flex flex-col justify-center space-y-3">
                            <div className="space-y-1 text-center md:text-left">
                                <h3 className="font-bold text-slate-900 dark:text-white">Foto de perfil</h3>
                                <p className="text-xs text-slate-500">PNG, JPG o WebP. Máximo 5MB.</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="rounded-lg gap-2 font-bold h-9"
                                    onClick={() => setIsViewerOpen(true)}
                                >
                                    <Eye className="h-3.5 w-3.5" /> Ver foto
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="rounded-lg gap-2 font-bold h-9"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Pencil className="h-3.5 w-3.5" /> Editar
                                </Button>
                            </div>

                            {avatarData.avatar && (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Button 
                                        size="sm"
                                        onClick={submitAvatar} 
                                        disabled={avatarProcessing}
                                        className="bg-primary text-white hover:bg-primary/90 rounded-lg gap-2 font-bold shadow-sm"
                                    >
                                        {avatarProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                        Guardar foto
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={cancelSelection} 
                                        disabled={avatarProcessing}
                                        className="rounded-lg text-slate-500 h-9"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <ImageCropperModal 
                        open={isCropperOpen}
                        image={originalImage}
                        onClose={() => setIsCropperOpen(false)}
                        onCropComplete={handleCropComplete}
                    />

                    <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                        <DialogContent className="max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                            <img 
                                src={user.avatar || ''} 
                                className="w-full h-auto rounded-3xl shadow-2xl" 
                                alt="Foto de perfil" 
                            />
                        </DialogContent>
                    </Dialog>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre completo"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Dirección de correo electrónico</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Dirección de correo"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Haz clic aquí para reenviar el
                                                    correo de verificación.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Se ha enviado un nuevo enlace
                                                    de verificación a tu dirección
                                                    de correo electrónico.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Guardar
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Guardado
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {intern && (
                    <div className="mt-12 pt-8 border-t border-sidebar/20 space-y-8">
                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Datos Personales del Becario"
                                description="Esta información ha sido proporcionada por el administrador."
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="app-panel rounded-2xl overflow-hidden border-sidebar/10 shadow-sm">
                                    <CardContent className="p-6 grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5"><Phone className="h-3 w-3"/> Teléfono</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{intern?.phone || 'No especificado'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">DNI / NIE</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{intern?.dni || 'No especificado'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5"><CalendarRange className="h-3 w-3"/> Nacimiento</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{intern?.birth_date || 'No especificado'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5"><MapPin className="h-3 w-3"/> Dirección</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">
                                                {[intern?.address, intern?.city].filter(Boolean).join(', ') || 'No especificada'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="app-panel rounded-2xl overflow-hidden border-sidebar/10 shadow-sm">
                                    <div className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-sidebar/10 px-6 py-3">
                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-emerald-500" /> Centro Educativo
                                        </h3>
                                    </div>
                                    <CardContent className="p-6">
                                        {education_center ? (
                                            <div className="flex gap-4 items-center">
                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center font-bold text-emerald-600">
                                                    <GraduationCap className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{education_center.name}</h4>
                                                    <p className="text-xs font-medium text-slate-500">{intern?.academic_degree || 'Sin grado asignado'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-slate-500 text-sm italic">
                                                Sin centro educativo asignado.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-sidebar/20">
                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
