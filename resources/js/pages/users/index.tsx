import { MailPlus, Loader2 } from 'lucide-react';
import { Head, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { SimpleTable } from '@/components/common/SimpleTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { roleLabel } from '@/lib/roles';
import AppLayout from '@/layouts/app-layout';
import type { RoleOption } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: RoleOption[];
};

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
    const [roleFilter, setRoleFilter] = useState('all');

    // --- ESTADO Y FORMULARIO DE INVITACIÓN ---
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const { data: inviteData, setData: setInviteData, post: postInvite, processing: inviteProcessing, errors: inviteErrors, reset: resetInvite } = useForm({
        email: '',
        role: ''
    });

    const submitInvitation = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Intentando enviar a Laravel...", inviteData);
        postInvite('/invitaciones', {
            onSuccess: () => {
                console.log("¡Éxito!");
                setIsInviteModalOpen(false);
                resetInvite();
                toast({
                    title: "Invitación enviada",
                    description: "El correo ha sido enviado correctamente.",
                });
            },
            onError: (errors) => {
                console.error("Errores de validación Laravel:", errors);
            }
        });
    };
    // ----------------------------------------

    const roleOptions = useMemo(
        () =>
            roles.length
                ? roles
                : [
                    { name: 'admin', display_name: 'Administrador' },
                    { name: 'tutor', display_name: 'Tutor' },
                    { name: 'intern', display_name: 'Becario' },
                ],
        [roles]
    );

    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();

        return users.filter((user) => {
            const matchesQuery =
                !q ||
                user.name.toLowerCase().includes(q) ||
                user.email.toLowerCase().includes(q);

            const matchesRole =
                roleFilter === 'all' || user.roles?.[0]?.name === roleFilter;

            return matchesQuery && matchesRole;
        });
    }, [users, query, roleFilter]);

    const columns = useMemo(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                render: (user: UserRow) => user.name,
            },
            {
                key: 'email',
                label: 'Email',
                render: (user: UserRow) => user.email,
            },
            {
                key: 'role',
                label: 'Rol',
                render: (user: UserRow) => (
                    <Badge
                        variant="outline"
                        className="bg-transparent font-medium text-foreground"
                    >
                        {roleLabel(user.roles?.[0])}
                    </Badge>
                ),
            },
            {
                key: 'actions',
                label: 'Cambiar Rol',
                render: (user: UserRow) => (
                    <div className="flex items-center gap-3">
                        <Select
                            value={user.roles?.[0]?.name ?? ''}
                            onValueChange={(value) => {
                                const currentRole = user.roles?.[0]?.name ?? '';
                                const selectedRole = roleOptions.find(
                                    (role) => role.name === value
                                );

                                if (value === currentRole) return;

                                const confirmed = confirm(
                                    `¿Quieres cambiar el rol de ${user.name} a ${roleLabel(selectedRole)}?`
                                );

                                if (!confirmed) return;

                                setSavingId(user.id);

                                router.patch(
                                    `/usuarios/${user.id}/role`,
                                    { role: value },
                                    {
                                        preserveScroll: true,
                                        onFinish: () => setSavingId(null),
                                    }
                                );
                            }}
                        >
                            <SelectTrigger className="w-44 border-border bg-background text-foreground">
                                <SelectValue placeholder="Selecciona rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((role) => (
                                    <SelectItem
                                        key={role.name}
                                        value={role.name}
                                    >
                                        {roleLabel(role)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {savingId === user.id && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="opacity-60"
                                disabled
                            >
                                Guardando...
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        [roleOptions, savingId]
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Usuarios', href: '/usuarios' },
            ]}
        >
            <Head title="Usuarios" />

            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Usuarios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Asigna roles a los usuarios del sistema.
                        </p>
                    </div>

                    {/* Botón añadido aquí */}
                    <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
                        <MailPlus className="w-4 h-4" />
                        Invitar Usuario
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-full max-w-sm">
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="w-56">
                        <Select
                            value={roleFilter}
                            onValueChange={setRoleFilter}
                        >
                            <SelectTrigger className="w-full border-border bg-background text-foreground">
                                <SelectValue placeholder="Filtrar por rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los roles
                                </SelectItem>
                                {roleOptions.map((role) => (
                                    <SelectItem
                                        key={role.name}
                                        value={role.name}
                                    >
                                        {roleLabel(role)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <SimpleTable
                    columns={columns}
                    rows={filteredUsers}
                    rowKey={(row) => row.id}
                />
            </div>

            {/* Modal de Invitación añadido al final */}
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invitar al Sistema</DialogTitle>
                        <DialogDescription>
                            Envía un correo con un enlace único para que la persona se registre automáticamente con los permisos asignados.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitInvitation} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={inviteData.email}
                                onChange={e => setInviteData('email', e.target.value)}
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
                                        <SelectItem key={r.name} value={r.name}>
                                            {r.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {inviteErrors.role && <p className="text-sm text-red-500">{inviteErrors.role}</p>}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={inviteProcessing} className="gap-2">
                                {inviteProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                                Enviar Invitación
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
