import { Head, router, useForm } from '@inertiajs/react';
import { Check, Copy, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { permissionLabel, roleLabel } from '@/lib/roles';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Permission, Role } from '@/types';

type RolePermissions = Record<string, number[]>;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles y permisos', href: '/roles' },
];

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
    const [createOpen, setCreateOpen] = useState(false);
    const [pendingPermissionKey, setPendingPermissionKey] = useState<string | null>(
        null
    );

    const createForm = useForm({
        name: '',
        display_name: '',
    });

    const editForm = useForm<{
        display_name: string;
        is_active: boolean;
    }>({
        display_name: '',
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
            display_name: role.display_name ?? '',
            is_active: role.is_active,
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingRoleId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const handleCreateRole = () => {
        if (!createForm.data.name.trim()) return;

        createForm.post('/roles', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setCreateOpen(false);
            },
        });
    };

    const handleUpdateRole = (roleId: number) => {
        editForm.patch(`/roles/${roleId}`, {
            preserveScroll: true,
            onSuccess: () => cancelEdit(),
        });
    };

    const handleDeleteRole = (role: Role) => {
        if (role.is_protected || role.users_count > 0) return;

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
        const key = `${roleId}-${permissionId}`;
        setPendingPermissionKey(key);

        router.post(
            `/roles/${roleId}/permissions/${permissionId}`,
            { enabled },
            {
                preserveScroll: true,
                onFinish: () => setPendingPermissionKey(null),
            }
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
                        Gestiona los roles del sistema y su matriz de permisos.
                    </p>
                </div>

                <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Lista de roles
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Roles activos.
                            </p>
                        </div>

                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Crear rol
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Crear rol</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-foreground">
                                            Nombre del rol
                                        </label>
                                        <input
                                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                            placeholder="Slug (ej: tutor_senior)"
                                            value={createForm.data.name}
                                            disabled={createForm.processing}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'name',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {createForm.errors.name && (
                                            <p className="text-sm text-red-600">
                                                {createForm.errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-foreground">
                                            Nombre visible
                                        </label>
                                        <input
                                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                            placeholder="Nombre visible (ej: Tutor senior)"
                                            value={createForm.data.display_name}
                                            disabled={createForm.processing}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'display_name',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {createForm.errors.display_name && (
                                            <p className="text-sm text-red-600">
                                                {createForm.errors.display_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {createForm.recentlySuccessful && (
                                    <p className="text-sm text-emerald-600">
                                        Rol creado correctamente.
                                    </p>
                                )}

                                <DialogFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCreateOpen(false)}
                                        disabled={createForm.processing}
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        className="gap-2"
                                        onClick={handleCreateRole}
                                        disabled={createForm.processing}
                                    >
                                        <Plus className="h-4 w-4" />
                                        {createForm.processing
                                            ? 'Creando...'
                                            : 'Crear rol'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {roles.map((role) => {
                            const cannotDelete =
                                role.is_protected || role.users_count > 0;

                            const deleteMessage = role.is_protected
                                ? 'Rol protegido del sistema.'
                                : role.users_count > 0
                                  ? 'No se puede eliminar porque tiene usuarios asignados.'
                                  : null;

                            return (
                                <div
                                    key={role.id}
                                    className="rounded-lg border border-border bg-background p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm text-muted-foreground">
                                                Rol
                                            </p>

                                            {editingRoleId === role.id ? (
                                                <div className="mt-1 space-y-1">
                                                    <input
                                                        className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
                                                        value={
                                                            editForm.data
                                                                .display_name
                                                        }
                                                        disabled={
                                                            editForm.processing
                                                        }
                                                        onChange={(e) =>
                                                            editForm.setData(
                                                                'display_name',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {editForm.errors
                                                        .display_name && (
                                                        <p className="text-sm text-red-600">
                                                            {
                                                                editForm.errors
                                                                    .display_name
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {roleLabel(
                                                            role.name,
                                                            role.display_name
                                                        )}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        {role.name}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                role.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
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
                                                        handleUpdateRole(
                                                            role.id
                                                        )
                                                    }
                                                    disabled={
                                                        editForm.processing
                                                    }
                                                >
                                                    {editForm.processing
                                                        ? 'Guardando...'
                                                        : 'Guardar'}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={cancelEdit}
                                                    disabled={
                                                        editForm.processing
                                                    }
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                title="Editar rol"
                                                onClick={() =>
                                                    startEdit(role)
                                                }
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Editar
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2"
                                            title="Clonar rol"
                                            disabled
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            Clonar
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 text-red-600"
                                            disabled={cannotDelete}
                                            title={
                                                role.is_protected
                                                    ? 'No se puede eliminar un rol protegido'
                                                    : role.users_count > 0
                                                      ? 'No se puede eliminar un rol con usuarios asignados'
                                                      : 'Eliminar rol'
                                            }
                                            onClick={() =>
                                                handleDeleteRole(role)
                                            }
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
                                                disabled={
                                                    editForm.processing
                                                }
                                                onClick={() =>
                                                    editForm.setData(
                                                        'is_active',
                                                        !editForm.data
                                                            .is_active
                                                    )
                                                }
                                            >
                                                {editForm.data.is_active
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Button>
                                        </div>
                                    )}

                                    {deleteMessage && (
                                        <p className="mt-3 text-xs text-muted-foreground">
                                            {deleteMessage}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Matriz de permisos
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Se muestran los permisos asignados por rol.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="py-3 pr-4 font-medium">
                                        Permiso ↓ / Rol →
                                    </th>
                                    {roles.map((role) => (
                                        <th
                                            key={role.id}
                                            className="py-3 pr-4 font-medium"
                                        >
                                            {roleLabel(
                                                role.name,
                                                role.display_name
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {permissions.map((permission) => (
                                    <tr
                                        key={permission.id}
                                        className="border-b border-border/60"
                                    >
                                        <td className="py-3 pr-4 text-foreground">
                                            {permissionLabel(permission.name)}
                                        </td>

                                        {roles.map((role) => {
                                            const hasPermission =
                                                rolePermissionMap[
                                                    role.id
                                                ]?.has(permission.id) ?? false;

                                            const permissionKey = `${role.id}-${permission.id}`;
                                            const isUpdating =
                                                pendingPermissionKey ===
                                                permissionKey;

                                            return (
                                                <td
                                                    key={`${permission.id}-${role.id}`}
                                                    className="py-3 pr-4"
                                                >
                                                    <button
                                                        type="button"
                                                        title={
                                                            hasPermission
                                                                ? 'Quitar permiso'
                                                                : 'Asignar permiso'
                                                        }
                                                        onClick={() =>
                                                            togglePermission(
                                                                role.id,
                                                                permission.id,
                                                                !hasPermission
                                                            )
                                                        }
                                                        className={`inline-flex min-w-10 items-center justify-center rounded-md border px-2 py-1 transition ${
                                                            isUpdating
                                                                ? 'cursor-not-allowed border-slate-300 bg-slate-100 opacity-60'
                                                                : 'border-border'
                                                        }`}
                                                        disabled={
                                                            (role.is_protected &&
                                                                hasPermission) ||
                                                            isUpdating
                                                        }
                                                    >
                                                        {isUpdating ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                ...
                                                            </span>
                                                        ) : hasPermission ? (
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
                        <Button
                            className="gap-2"
                            onClick={() => setCreateOpen(true)}
                            title="Crear un nuevo rol"
                        >
                            <Plus className="h-4 w-4" />
                            Crear rol
                        </Button>

                        <Button
                            variant="outline"
                            className="gap-2"
                            title="Clonar rol"
                            disabled
                        >
                            <Copy className="h-4 w-4" />
                            Clonar rol
                        </Button>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
