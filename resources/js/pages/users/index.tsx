import { Head, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    MailPlus,
    Loader2,
    Shield,
    GraduationCap,
    Users,
    UserX,
    Search,
    ChevronDown,
    ChevronRight,
    Check,
    X,
} from 'lucide-react';
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
    color: string;
    bg: string;
    border: string;
    headerBg: string;
    icon: React.ElementType;
}> = {
    admin: {
        label: 'Administradores',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-800/60',
        headerBg: 'bg-rose-50/80 dark:bg-rose-950/30',
        icon: Shield,
    },
    tutor: {
        label: 'Tutores',
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-950/40',
        border: 'border-violet-200 dark:border-violet-800/60',
        headerBg: 'bg-violet-50/80 dark:bg-violet-950/30',
        icon: GraduationCap,
    },
    intern: {
        label: 'Becarios',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        headerBg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
        icon: Users,
    },
    none: {
        label: 'Sin rol',
        color: 'text-slate-500 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800/40',
        border: 'border-slate-200 dark:border-slate-700/60',
        headerBg: 'bg-slate-50/80 dark:bg-slate-800/30',
        icon: UserX,
    },
};

const ROLE_ORDER = ['admin', 'tutor', 'intern', 'none'];

function getRoleName(user: UserRow): string {
    return user.roles?.[0]?.name ?? 'none';
}

function UserRow({
    user,
    isSaving,
    roleName,
    roleOptions,
    onRoleChange,
    showBadge = false,
}: {
    user: UserRow;
    isSaving: boolean;
    roleName: string;
    roleOptions: RoleOption[];
    onRoleChange: (user: UserRow, newRole: string) => void;
    showBadge?: boolean;
}) {
    const meta = ROLE_META[roleName] ?? ROLE_META.none;
    const RoleIcon = meta.icon;

    return (
        <div className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40">
            <Avatar className="h-7 w-7 shrink-0 border border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className={`text-[10px] font-bold ${meta.color} bg-muted`}>
                    {user.name.split(' ').slice(0, 2).map((w) => w.charAt(0)).join('').toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground leading-tight">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>

            {/* Role badge — solo visible en modo búsqueda */}
            {showBadge && (
                <Badge
                    variant="outline"
                    className={`hidden shrink-0 items-center gap-1 border text-[11px] font-semibold sm:flex ${meta.bg} ${meta.border} ${meta.color}`}
                >
                    <RoleIcon className="h-2.5 w-2.5" />
                    {ROLE_META[roleName]?.label ?? 'Sin rol'}
                </Badge>
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
                                className={`flex items-center gap-2 ${isCurrent ? 'font-semibold' : ''}`}
                            >
                                <Ico className={`h-4 w-4 ${rm.color}`} />
                                <span>{rm.label}</span>
                                {isCurrent && <Check className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function RoleGroup({
    roleKey,
    users,
    savingId,
    roleOptions,
    onRoleChange,
    defaultOpen = false,
}: {
    roleKey: string;
    users: UserRow[];
    savingId: number | null;
    roleOptions: RoleOption[];
    onRoleChange: (user: UserRow, newRole: string) => void;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const meta = ROLE_META[roleKey] ?? ROLE_META.none;
    const Icon = meta.icon;

    if (users.length === 0) return null;

    return (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            {/* Section header */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left bg-card transition-colors hover:bg-muted/50 dark:bg-slate-900/60 dark:hover:bg-slate-800/60"
            >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${meta.border} ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">{meta.label}</span>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                    {users.length}
                </span>
                {open
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                }
            </button>

            {/* User rows */}
            {open && (
                <div className="divide-y divide-border bg-card dark:bg-slate-900/60">
                    {users.map((user) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            isSaving={savingId === user.id}
                            roleName={getRoleName(user)}
                            roleOptions={roleOptions}
                            onRoleChange={onRoleChange}
                        />
                    ))}
                </div>
            )}
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

    const { data: inviteData, setData: setInviteData, post: postInvite, processing: inviteProcessing, errors: inviteErrors, reset: resetInvite } = useForm({ email: '', role: '' });

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

    const grouped = useMemo(() => {
        const g: Record<string, UserRow[]> = { none: [] };
        roleOptions.forEach((r) => (g[r.name] = []));
        users.forEach((u) => {
            const r = u.roles?.[0]?.name ?? 'none';
            if (g[r]) g[r].push(u);
            else g.none.push(u);
        });
        return g;
    }, [users, roleOptions]);

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
                {/* HEADER */}
                <section className="app-panel relative overflow-hidden p-6">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(132,183,175,0.18),transparent_58%)]" />
                    <div className="relative flex flex-wrap items-start justify-between gap-5">
                        <div className="space-y-1">
                            <p className="section-kicker">Panel de administración</p>
                            <h1 className="page-title flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]">
                                    <Users className="h-5 w-5" />
                                </span>
                                Gestión de Usuarios
                            </h1>
                            <p className="page-subtitle">Gestiona roles de los {counts.all} usuarios del sistema.</p>
                        </div>
                        <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                            <MailPlus className="h-4 w-4" />
                            Invitar Usuario
                        </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { key: 'all', label: 'Total', color: 'text-slate-500' },
                            { key: 'admin', label: 'Admins', color: 'text-rose-500' },
                            { key: 'tutor', label: 'Tutores', color: 'text-violet-500' },
                            { key: 'intern', label: 'Becarios', color: 'text-emerald-500' },
                        ].map(({ key, label, color }) => (
                            <div key={key} className="metric-tile px-4 py-3.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                                <p className={`mt-1 text-[1.45rem] font-semibold tracking-[-0.03em] ${color}`}>{counts[key] ?? 0}</p>
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
                        className="border-border bg-card pl-10 pr-9 text-foreground placeholder:text-muted-foreground shadow-sm dark:bg-slate-900/60"
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

                {/* SEARCH RESULTS mode */}
                {isSearching ? (
                    searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-12 text-muted-foreground">
                            <UserX className="h-8 w-8 opacity-30" />
                            <p className="text-sm font-medium">Ningún usuario coincide con «{query}».</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
                            <p className="border-b border-border px-4 py-2 text-xs font-semibold text-muted-foreground">
                                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para «{query}»
                            </p>
                            <div className="divide-y divide-border/60">
                                {searchResults.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        isSaving={savingId === user.id}
                                        roleName={getRoleName(user)}
                                        roleOptions={roleOptions}
                                        onRoleChange={handleRoleChange}
                                        showBadge={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    /* GROUPED mode */
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 items-start">
                        {ROLE_ORDER.map((roleKey) => (
                            <RoleGroup
                                key={roleKey}
                                roleKey={roleKey}
                                users={grouped[roleKey] ?? []}
                                savingId={savingId}
                                roleOptions={roleOptions}
                                onRoleChange={handleRoleChange}
                                defaultOpen={roleKey === 'admin'}
                            />
                        ))}
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
        </AppLayout>
    );
}
