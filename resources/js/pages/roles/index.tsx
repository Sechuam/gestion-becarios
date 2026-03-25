import { Head, router, useForm } from '@inertiajs/react';
import { Check, Copy, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles y permisos', href: '/roles' },
];

type Role = {
    id: number;
    name: string;
    is_active: boolean;
    users_count: number;
    is_protected: boolean;
};

type Permission = {
    id: number;
    name: string;
};

type RolePermissions = Record<string, number[]>;

export default function RolesIndex({
    roles,
    permissions,
    rolePermissions,
}: {
    roles: Role[];
    permissions: Permission[];
    rolePermissions: RolePermissions;
}) {
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const createForm = useForm({ name: '' });
    const editForm = useForm<{ name: string; is_active: boolean }>({
        name: '',
        is_active: true,
    });

    const rolePermissionMap = useMemo(() => {
        const map: Record<number, Set<number>> = {};
        Object.entries(rolePermissions || {}).forEach(([roleId, perms]) => {
            map[Number(roleId)] = new Set(perms as number[]);
        });
        return map;
    }, [rolePermissions]);

    const startEdit = (role: Role) => {
        setEditingRoleId(role.id);
        editForm.setData({
            name: role.name,
            is_active: role.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingRoleId(null);
        editForm.reset();
    };

    const handleCreateRole = () => {
        if (!createForm.data.name.trim()) return;
        createForm.post('/roles', {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    };

    const handleUpdateRole = (roleId: number) => {
        editForm.patch(`/roles/${roleId}`, {
            preserveScroll: true,
            onSuccess: () => cancelEdit(),
        });
    };

    const handleDeleteRole = (role: Role) => {
        if (role.is_protected) return;
        const confirmed = confirm(
            `¿Seguro que quieres eliminar el rol "${role.name}"?`
        );
        if (!confirmed) return;
        router.delete(`/roles/${role.id}`, { preserveScroll: true });
    };

    const togglePermission = (
        roleId: number,
        permissionId: number,
        enabled: boolean
    ) => {
        router.post(
            `/roles/${roleId}/permissions/${permissionId}`,
            { enabled },
            { preserveScroll: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y permisos" />

            <div className="space-y-8 p-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Roles y permisos
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona los roles del sistema y su matriz de
                        permisos.
                    </p>
                </div>

                <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Lista de roles
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Ejemplo de roles con número de usuarios y
                                estado.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                className="h-10 w-56 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                placeholder="Nuevo rol (ej: Tutor senior)"
                                value={createForm.data.name}
                                onChange={(e) =>
                                    createForm.setData(
                                        'name',
                                        e.target.value
                                    )
                                }
                            />
                            <Button
                                className="gap-2"
                                onClick={handleCreateRole}
                                disabled={createForm.processing}
                            >
                                <Plus className="h-4 w-4" />
                                Crear rol
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="rounded-lg border border-border bg-background p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Rol
                                        </p>
                                        {editingRoleId === role.id ? (
                                            <input
                                                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
                                                value={editForm.data.name}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : (
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {role.name}
                                            </h3>
                                        )}
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                        {role.is_active
                                            ? 'Activo'
                                            : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Usuarios</span>
                                    <span className="font-semibold text-foreground">
                                        {role.users_count}
                                    </span>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    {editingRoleId === role.id ? (
                                        <>
                                            <Button
                                                size="sm"
                                                className="gap-2"
                                                onClick={() =>
                                                    handleUpdateRole(role.id)
                                                }
                                                disabled={editForm.processing}
                                            >
                                                Guardar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={cancelEdit}
                                            >
                                                Cancelar
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => startEdit(role)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Editar
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2"
                                        disabled
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        Clonar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-red-600"
                                        disabled={role.is_protected}
                                        onClick={() => handleDeleteRole(role)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Eliminar
                                    </Button>
                                </div>
                                {editingRoleId === role.id && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Estado</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                editForm.setData(
                                                    'is_active',
                                                    !editForm.data.is_active
                                                )
                                            }
                                        >
                                            {editForm.data.is_active
                                                ? 'Activo'
                                                : 'Inactivo'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Matriz de permisos
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            El corazón del sistema: permisos por rol.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="py-3 pr-4 font-medium">
                                        Permiso ↓ / Rol →
                                    </th>
                                    <th className="py-3 pr-4 font-medium">
                                        Admin
                                    </th>
                                    <th className="py-3 pr-4 font-medium">
                                        Tutor
                                    </th>
                                    <th className="py-3 pr-4 font-medium">
                                        Becario
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((permission) => (
                                    <tr
                                        key={permission.id}
                                        className="border-b border-border/60"
                                    >
                                        <td className="py-3 pr-4 text-foreground">
                                            {permission.name}
                                        </td>
                                        {roles.map((role) => {
                                            const hasPermission =
                                                rolePermissionMap[role.id]?.has(
                                                    permission.id
                                                ) ?? false;
                                            return (
                                                <td
                                                    key={`${permission.id}-${role.id}`}
                                                    className="py-3 pr-4"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            togglePermission(
                                                                role.id,
                                                                permission.id,
                                                                !hasPermission
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1"
                                                        disabled={
                                                            role.is_protected &&
                                                            hasPermission
                                                        }
                                                    >
                                                        {hasPermission ? (
                                                            <Check className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-foreground">
                        Crear / editar roles
                    </h2>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Crear rol nuevo (por ejemplo: “Tutor senior”).</li>
                        <li>Clonar roles existentes.</li>
                        <li>Editar permisos desde la matriz.</li>
                    </ul>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Crear rol
                        </Button>
                        <Button variant="outline" className="gap-2" disabled>
                            <Copy className="h-4 w-4" />
                            Clonar rol
                        </Button>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
