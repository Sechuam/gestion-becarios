import { Head, router } from '@inertiajs/react';
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
    const [savingId, setSavingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

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
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Usuarios
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Asigna roles a los usuarios del sistema.
                    </p>
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
        </AppLayout>
    );
}
