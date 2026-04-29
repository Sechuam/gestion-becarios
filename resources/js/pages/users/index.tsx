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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                <div className="hidden items-center gap-1.5 font-medium text-sidebar dark:text-white/80 sm:flex">
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dotColor)} />
                    <span className="text-[11px] uppercase tracking-wider">{meta.label}</span>
                </div>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        disabled={isSaving}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground disabled:opacity-50"
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
                        const Ico = rm.icon;
                        const isCurrent = roleName === role.name;
                        return (
                            <DropdownMenuItem
                                key={role.name}
                                onClick={() => onRoleChange(user, role.name)}
                                className={`flex items-center gap-2.5 ${isCurrent ? 'font-semibold bg-muted/50' : ''}`}
                            >
                                <div className={cn("h-2 w-2 rounded-full", rm.dotColor)} />
                                <span className="text-sm">{rm.label}</span>
                                {isCurrent && <Check className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
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
        const newMeta = ROLE_META[newRole];
        const confirmed = confirm(`¿Cambiar el rol de ${user.name} a ${newMeta?.label ?? newRole}?`);
        if (!confirmed) return;
        setSavingId(user.id);
        router.patch(`/usuarios/${user.id}/role`, { role: newRole }, {
            preserveScroll: true,
            onFinish: () => setSavingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Usuarios', href: '/usuarios' }]}>
            <Head title="Gestión de Usuarios" />

            <div className="space-y-5">
                {/* HEADER CON GRADIENTE CORPORATIVO */}
                <section className="relative overflow-hidden bg-gradient-to-r from-sidebar to-[#1f4f52] p-5 shadow-2xl md:px-8 md:py-6 rounded-[2rem]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 space-y-1.5">
                            <p className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/90 backdrop-blur-md border border-white/20">
                                Panel de administración
                            </p>
                            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-3 leading-none">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                                    <Users className="h-5 w-5" />
                                </span>
                                Gestión de Usuarios
                            </h1>
                            <p className="max-w-3xl text-xs font-medium text-white/70 leading-relaxed italic line-clamp-1">
                                Administra roles y permisos de los {counts.all} usuarios registrados.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setIsInviteModalOpen(true)} 
                            className="bg-white text-sidebar hover:bg-white/90 rounded-2xl px-6 font-black shadow-lg transition-all h-10 text-xs"
                        >
                            <MailPlus className="mr-2 h-4 w-4" />
                            Invitar Usuario
                        </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { key: 'all', label: 'Total', dot: 'bg-white/40' },
                            { key: 'admin', label: 'Admins', dot: 'bg-rose-500' },
                            { key: 'tutor', label: 'Tutores', dot: 'bg-violet-400' },
                            { key: 'intern', label: 'Becarios', dot: 'bg-emerald-400' },
                        ].map(({ key, label, dot }) => (
                            <div key={key} className="relative overflow-hidden rounded-2xl bg-white/10 p-3 shadow-lg backdrop-blur-md border border-white/20 transition-all hover:bg-white/15">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/50">{label}</p>
                                    <div className={cn("h-1.5 w-1.5 rounded-full", dot)} />
                                </div>
                                <p className="mt-1 text-xl font-black tracking-tight text-white">{counts[key] ?? 0}</p>
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

                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'admin', label: 'Administradores' },
                        { key: 'tutor', label: 'Tutores' },
                        { key: 'intern', label: 'Becarios' },
                    ].map((item) => (
                        <Button
                            key={item.key}
                            type="button"
                            variant={activeRole === item.key ? 'default' : 'outline'}
                            onClick={() => setActiveRole(item.key as 'all' | 'admin' | 'tutor' | 'intern')}
                            className={`rounded-full transition-all ${
                                activeRole === item.key
                                    ? 'border-sidebar bg-sidebar text-white shadow-md hover:bg-sidebar/90'
                                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {item.label} ({counts[item.key] ?? 0})
                        </Button>

                    ))}
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-sidebar/10 bg-white dark:bg-slate-900/60 shadow-xl">
                    <p className="border-b border-border px-4 py-2 text-xs font-semibold text-muted-foreground">
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
                        <div className="flex items-center justify-between border-t border-border px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                Página {currentPage} de {totalPages}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
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
            </div>
        </AppLayout>
    );
}
