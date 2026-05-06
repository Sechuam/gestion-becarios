import { Head, useForm, router } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import {
    MailPlus,
    Loader2,
    Shield,
    GraduationCap,
    Users,
    UserX,
    Search,
    ChevronDown,
    Check,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { RoleOption } from '@/types';

type UserRow = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    roles: RoleOption[];
};

const ROLE_META: Record<string, {
    label: string;
    dotColor: string;
    icon: React.ElementType;
}> = {
    admin: {
        label: 'Admin',
        dotColor: 'bg-rose-500',
        icon: Shield,
    },
    tutor: {
        label: 'Tutor',
        dotColor: 'bg-violet-400',
        icon: GraduationCap,
    },
    intern: {
        label: 'Becario',
        dotColor: 'bg-emerald-400',
        icon: Users,
    },
    none: {
        label: 'Sin rol',
        dotColor: 'bg-slate-300',
        icon: UserX,
    },
};

function getRoleName(user: UserRow): string {
    return user.roles?.[0]?.name ?? 'none';
}

function UserRowItem({
    user,
    isSaving,
    roleName,
    roleOptions,
    onRoleChange,
    showBadge = false,
    isAlternative,
}: {
    user: UserRow;
    isSaving: boolean;
    roleName: string;
    roleOptions: RoleOption[];
    onRoleChange: (user: UserRow, newRole: string) => void;
    showBadge?: boolean;
    isAlternative?: boolean;
}) {
    const meta = ROLE_META[roleName] ?? ROLE_META.none;
    const RoleIcon = meta.icon;

    return (
        <div className={`flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40 ${isAlternative ? 'bg-sidebar/5 dark:bg-sidebar/10' : ''}`}>
            <Avatar className="h-7 w-7 shrink-0 border border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-[10px] font-bold text-sidebar bg-muted">
                    {user.name.split(' ').slice(0, 2).map((w) => w.charAt(0)).join('').toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground leading-tight">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>

            {/* Role indicator */}
            {showBadge && (
                <div className="hidden sm:flex">
                    <span className="inline-flex h-8 min-w-[112px] items-center justify-center rounded-lg border-0 bg-gradient-to-r from-sidebar to-[#1f4f52] px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                        {meta.label}
                    </span>
                </div>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        disabled={isSaving}
                        className="flex h-8 shrink-0 items-center gap-1 rounded-lg border-0 bg-gradient-to-r from-sidebar to-[#1f4f52] px-2.5 py-1 text-xs font-medium text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                    >
                        {isSaving
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <ChevronDown className="h-3 w-3" />
                        }
                        <span>Cambiar</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    {roleOptions.map((role) => {
                        const rm = ROLE_META[role.name] ?? ROLE_META.none;
                        const isCurrent = roleName === role.name;
                        return (
                            <DropdownMenuItem
                                key={role.name}
                                onClick={() => onRoleChange(user, role.name)}
                                className={`flex items-center gap-2.5 ${
                                    isCurrent
                                        ? 'bg-gradient-to-r from-sidebar to-[#1f4f52] font-semibold text-white focus:text-white'
                                        : ''
                                }`}
                            >
                                <span className="text-sm">{rm.label}</span>
                                {isCurrent && (
                                    <Check className="ml-auto h-3.5 w-3.5 text-white" />
                                )}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function UsersIndex({
    users = [] as UserRow[],
    roles = [] as RoleOption[],
}: {
    users: UserRow[];
    roles: RoleOption[];
}) {
    const { toast } = useToast();
    const [savingId, setSavingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [activeRole, setActiveRole] = useState<'all' | 'admin' | 'tutor' | 'intern'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingRoleChange, setPendingRoleChange] = useState<{
        user: UserRow;
        newRole: string;
    } | null>(null);

    const { data: inviteData, setData: setInviteData, post: postInvite, processing: inviteProcessing, errors: inviteErrors, reset: resetInvite } = useForm({ email: '', role: '' });

    useEffect(() => {
        setCurrentPage(1);
    }, [query, activeRole]);

    const submitInvitation = (e: React.FormEvent) => {
        e.preventDefault();
        postInvite('/invitaciones', {
            onSuccess: () => {
                setIsInviteModalOpen(false);
                resetInvite();
                toast({ title: 'Invitación enviada', description: 'El correo ha sido enviado correctamente.' });
            },
        });
    };

    const USERS_PER_PAGE = 10;

    const roleOptions = useMemo(
        () => roles.length ? roles : [
            { name: 'admin', display_name: 'Administrador' },
            { name: 'tutor', display_name: 'Tutor' },
            { name: 'intern', display_name: 'Becario' },
        ],
        [roles],
    );

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: users.length, none: 0 };
        roleOptions.forEach((r) => (c[r.name] = 0));
        users.forEach((u) => {
            const r = u.roles?.[0]?.name;
            if (r && c[r] !== undefined) c[r]++;
            else c.none++;
        });
        return c;
    }, [users, roleOptions]);

    const isSearching = query.trim().length > 0;

    const searchResults = useMemo(() => {
        if (!isSearching) return [];
        const q = query.trim().toLowerCase();
        return users.filter(
            (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        );
    }, [users, query, isSearching]);

    const filteredUsers = useMemo(() => {
        const base = isSearching ? searchResults : users;
        if (activeRole === 'all') return base;
        return base.filter((user) => getRoleName(user) === activeRole);
    }, [users, searchResults, isSearching, activeRole]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * USERS_PER_PAGE;
        const end = start + USERS_PER_PAGE;

        return filteredUsers.slice(start, end);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleRoleChange = (user: UserRow, newRole: string) => {
        const currentRole = getRoleName(user);
        if (newRole === currentRole) return;
        setPendingRoleChange({ user, newRole });
    };

    const confirmRoleChange = () => {
        if (!pendingRoleChange) return;
        const { user, newRole } = pendingRoleChange;
        setSavingId(user.id);
        router.patch(`/usuarios/${user.id}/role`, { role: newRole }, {
            preserveScroll: true,
            onFinish: () => {
                setSavingId(null);
                setPendingRoleChange(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Usuarios', href: '/usuarios' }]}>
            <Head title="Gestión de Usuarios" />

            <div className="space-y-5">
                {/* HEADER CON GRADIENTE CORPORATIVO */}
                <section className="app-panel relative overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar to-[#1f4f52] p-3 shadow-xl md:px-5 md:py-3">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 space-y-1.5">
                            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/80 backdrop-blur-md">
                                Panel de administración
                            </p>
                            <div className="space-y-0.5">
                            <h1 className="flex items-center gap-3 text-lg font-black leading-none tracking-tight text-white md:text-xl">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                                    <Users className="h-4 w-4" />
                                </span>
                                Gestión de Usuarios
                            </h1>
                            <p className="ml-[44px] max-w-3xl text-[10px] font-medium italic leading-tight text-white/60 line-clamp-1">
                                Administra roles y permisos de los {counts.all} usuarios registrados.
                            </p>
                            </div>
                        </div>
                        <HeaderActionButton 
                            label="Invitar Usuario"
                            onClick={() => setIsInviteModalOpen(true)}
                            icon={<MailPlus className="mr-2 h-4 w-4" />}
                        />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                            { key: 'all', label: 'Total', dot: 'bg-white/40' },
                            { key: 'admin', label: 'Admins', dot: 'bg-rose-500' },
                            { key: 'tutor', label: 'Tutores', dot: 'bg-violet-400' },
                            { key: 'intern', label: 'Becarios', dot: 'bg-emerald-400' },
                        ].map(({ key, label, dot }) => (
                            <div key={key} className="relative overflow-hidden rounded-lg border border-white/20 bg-white/10 p-2 shadow-lg backdrop-blur-md transition-all hover:bg-white/15">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/50">{label}</p>
                                    <div className={cn("h-1.5 w-1.5 rounded-full", dot)} />
                                </div>
                                <p className="mt-0.5 text-sm md:text-base font-black tracking-tight text-white">{counts[key] ?? 0}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SEARCH BAR */}
                <div className="relative">
                    <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Busca un usuario por nombre o email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-sidebar/20 bg-card pl-10 pr-9 text-foreground placeholder:text-muted-foreground shadow-sm dark:bg-slate-900/60 rounded-2xl h-12"
                    />
                    {isSearching && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="w-full">
                    <ToggleGroup
                        type="single"
                        value={activeRole}
                        onValueChange={(value) => {
                            if (value) {
                                setActiveRole(
                                    value as
                                        | 'all'
                                        | 'admin'
                                        | 'tutor'
                                        | 'intern',
                                );
                            }
                        }}
                        className="grid w-full grid-cols-1 gap-2 rounded-2xl border border-slate-900/15 bg-slate-50/70 p-1.5 shadow-sm dark:border-white/15 dark:bg-slate-900/50 md:grid-cols-2 xl:grid-cols-4"
                    >
                        {[
                            { key: 'all', label: 'Todos' },
                            { key: 'admin', label: 'Administradores' },
                            { key: 'tutor', label: 'Tutores' },
                            { key: 'intern', label: 'Becarios' },
                        ].map((item) => (
                            <ToggleGroupItem
                                key={item.key}
                                value={item.key}
                                className="h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=on]:border-transparent data-[state=on]:bg-gradient-to-r data-[state=on]:from-sidebar data-[state=on]:to-[#1f4f52] data-[state=on]:text-white data-[state=on]:shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
                                aria-label={item.label}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {item.label}
                                </span>
                                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-black tabular-nums text-current">
                                    {counts[item.key] ?? 0}
                                </span>
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <div className="overflow-hidden rounded-[2.25rem] border border-sidebar/20 bg-white shadow-xl dark:bg-slate-900/60">
                    <p className="border-b border-sidebar/10 bg-gradient-to-r from-sidebar to-[#1f4f52] px-5 py-3 text-xs font-semibold text-white/85">
                        {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
                        {filteredUsers.length > 0 && (
                            <span>
                                {' '}· mostrando {((currentPage - 1) * USERS_PER_PAGE) + 1}-
                                {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)}
                            </span>
                        )}
                        {isSearching ? ` para «${query}»` : ''}
                    </p>

                    {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl py-12 text-muted-foreground">
                            <UserX className="h-8 w-8 opacity-30" />
                            <p className="text-sm font-medium">
                                {isSearching
                                    ? `Ningún usuario coincide con «${query}».`
                                    : 'No hay usuarios para este filtro.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {paginatedUsers.map((user, index) => (
                                <UserRowItem
                                    key={user.id}
                                    user={user}
                                    isSaving={savingId === user.id}
                                    roleName={getRoleName(user)}
                                    roleOptions={roleOptions}
                                    onRoleChange={handleRoleChange}
                                    showBadge={activeRole === 'all' || isSearching}
                                    isAlternative={index % 2 !== 0}
                                />
                            ))}
                        </div>
                    )}
                    {filteredUsers.length > USERS_PER_PAGE && (
                        <div className="flex items-center justify-between border-t border-sidebar/10 px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                Página {currentPage} de {totalPages}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-xl border-0 bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-xl border-0 bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </div>


                {/* INVITE MODAL */}
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Invitar al Sistema</DialogTitle>
                            <DialogDescription>
                                Envía un correo con un enlace único para que la persona se registre con los permisos asignados.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitInvitation} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">Correo Electrónico</Label>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData('email', e.target.value)}
                                    required
                                />
                                {inviteErrors.email && <p className="text-sm text-red-500">{inviteErrors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Rol Asignado</Label>
                                <Select onValueChange={(value) => setInviteData('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.name} value={r.name}>{r.display_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {inviteErrors.role && <p className="text-sm text-red-500">{inviteErrors.role}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={inviteProcessing} className="gap-2">
                                    {inviteProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Enviar Invitación
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={!!pendingRoleChange}
                    onOpenChange={(open) => {
                        if (!open) setPendingRoleChange(null);
                    }}
                >
                    <DialogContent className="overflow-hidden border-sidebar/20 p-0 shadow-2xl sm:max-w-md">
                        <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-5 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-left text-xl font-black tracking-tight text-white">
                                    Confirmar cambio de rol
                                </DialogTitle>
                                <DialogDescription className="pt-2 text-left text-white/75">
                                    Revisa el cambio antes de actualizar el acceso de este usuario.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="space-y-5 px-6 py-5">
                            <div className="rounded-2xl border border-sidebar/10 bg-slate-50/80 p-4 dark:bg-slate-900/60">
                                <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                                    ¿Quieres cambiar el rol de{' '}
                                    <span className="font-black text-slate-900 dark:text-white">
                                        {pendingRoleChange?.user.name}
                                    </span>{' '}
                                    a{' '}
                                    <span className="inline-flex rounded-full bg-gradient-to-r from-sidebar to-[#1f4f52] px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-white shadow-sm">
                                        {ROLE_META[pendingRoleChange?.newRole ?? 'none']?.label ??
                                            pendingRoleChange?.newRole}
                                    </span>
                                    ?
                                </p>
                            </div>

                            <DialogFooter className="gap-2 sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl border-sidebar/15"
                                    onClick={() => setPendingRoleChange(null)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    className="rounded-xl border-0 bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-sm hover:opacity-95"
                                    onClick={confirmRoleChange}
                                >
                                    Confirmar cambio
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
