import { Head, usePage, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import { User, Building2, CalendarRange, Phone, GraduationCap, MapPin, Mail, Camera, Eye, Pencil, Check, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageCropperModal from '@/components/ImageCropperModal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function Profile({
    intern,
    education_center,
}: {
    intern: any;
    education_center: any;
}) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Mi Área', href: '#' },
        { title: 'Mi Perfil', href: '/mi-perfil' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        avatar: null as File | null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // Estados para el cropper
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    
    // Estado para el visor de foto
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
        setData('avatar', file);
        setPreviewUrl(URL.createObjectURL(croppedImageBlob));
    };

    const submitAvatar = () => {
        if (!data.avatar) return;
        post('/mi-perfil/avatar', {
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
        setData('avatar', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Perfil" />

            <div className="w-full space-y-8 p-6 min-h-screen">
                <div className="flex items-center gap-4 border-b border-sidebar/20 pb-6">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                            Mi Perfil
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Consulta tus datos personales y gestiona tu foto de perfil.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* AVATAR SECTION */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="app-panel rounded-3xl overflow-hidden border-sidebar/20">
                            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative group">
                                    <Avatar className="h-40 w-40 shrink-0 border-4 border-white dark:border-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
                                        <AvatarImage src={previewUrl || user.avatar || ''} className="object-cover" alt={user.name} />
                                        <AvatarFallback className="text-5xl bg-primary/10 text-primary font-bold">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-2 right-2 bg-primary text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all ring-4 ring-white dark:ring-slate-800"
                                        title="Cambiar foto"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </button>
                                    
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                                    <p className="text-sm font-medium text-slate-500">{user.email}</p>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-2 pt-2">
                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl gap-2 font-bold"
                                        onClick={() => setIsViewerOpen(true)}
                                    >
                                        <Eye className="h-4 w-4" /> Ver foto
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl gap-2 font-bold"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Pencil className="h-4 w-4" /> Editar
                                    </Button>
                                </div>

                                {data.avatar && (
                                    <div className="w-full pt-2 flex gap-2">
                                        <Button 
                                            onClick={submitAvatar} 
                                            disabled={processing}
                                            className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"
                                        >
                                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            Guardar Cambios
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            onClick={cancelSelection} 
                                            disabled={processing}
                                            className="rounded-xl text-slate-500"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* MODALES */}
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

                    {/* DATOS SECTION */}
                    <div className="md:col-span-8 space-y-6">
                        <Card className="app-panel rounded-3xl overflow-hidden border-sidebar/20">
                            <div className="bg-slate-50/30 dark:bg-slate-800/20 border-b border-sidebar/20 px-6 py-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" /> Datos Personales
                                </h3>
                            </div>
                            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5"><Mail className="h-3 w-3"/> Correo</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{user.email}</p>
                                </div>
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
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5"><MapPin className="h-3 w-3"/> Dirección</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">
                                        {[intern?.address, intern?.city].filter(Boolean).join(', ') || 'No especificada'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="app-panel rounded-3xl overflow-hidden border-sidebar/20">
                            <div className="bg-slate-50/30 dark:bg-slate-800/20 border-b border-sidebar/20 px-6 py-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-emerald-500" /> Mi Centro Educativo
                                </h3>
                            </div>
                            <CardContent className="p-8">
                                {education_center ? (
                                    <div className="flex gap-4 items-center">
                                        <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center font-bold text-emerald-600">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{education_center.name}</h4>
                                            <p className="text-sm font-medium text-slate-500">{intern?.academic_degree || 'Sin grado asignado'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-500 italic">
                                        No tienes un centro educativo asignado todavía.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
