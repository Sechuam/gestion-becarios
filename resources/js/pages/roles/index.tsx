import { Head, router, useForm } from '@inertiajs/react';
import { Check, Copy, Pencil, Plus, Shield, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ModuleHeader } from '@/components/common/ModuleHeader';
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

const PERMISSION_GROUPS = [
    {
        name: 'Becarios',
        permissions: ['manage interns', 'view internal notes'],
    },
    {
        name: 'Centros Educativos',
        permissions: ['manage schools'],
    },
    {
        name: 'Tareas',
        permissions: ['manage tasks'],
    },
    {
        name: 'Control Horario',
        permissions: ['validate time logs', 'edit time logs'],
    },
    {
        name: 'Evaluaciones',
        permissions: [
            'manage evaluations',
            'view evaluations',
            'delete evaluations',
            'manage evaluation criteria',
        ],
    },
    {
        name: 'Tutores',
        permissions: ['manage tutors'],
    },
    {
        name: 'Sistema',
        permissions: ['manage users', 'view reports'],
    },
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

    const groupedPermissions = useMemo(() => {
        const result: { name: string; items: Permission[] }[] = [];
        const handledIds = new Set<number>();

        PERMISSION_GROUPS.forEach((group) => {
            const items = permissions.filter((p) =>
                group.permissions.includes(p.name)
            );
            if (items.length > 0) {
                result.push({ name: group.name, items });
                items.forEach((p) => handledIds.add(p.id));
            }
        });

        const others = permissions.filter((p) => !handledIds.has(p.id));
        if (others.length > 0) {
            result.push({ name: 'Otros', items: others });
        }

        return result;
    }, [permissions]);

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

    const headerMetrics = useMemo(
        () => [
            {
                label: 'Total Roles',
                value: roles.length,
                hint: 'Roles definidos en el sistema',
            },
            {
                label: 'Roles Activos',
                value: roles.filter((r) => r.is_active).length,
                hint: 'Roles habilitados actualmente',
            },
            {
                label: 'Permisos',
                value: permissions.length,
                hint: 'Capacidades del sistema',
            },
        ],
        [roles, permissions]
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y permisos" />

            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Roles y permisos"
                    description="Gestiona los roles del sistema y su matriz de permisos para controlar el acceso a los diferentes módulos."
                    icon={<Shield className="h-6 w-6" />}
                    metrics={headerMetrics}
                    actions={
                        <Button
                            className="gap-2 bg-sidebar/80 text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 rounded-2xl px-8 font-black shadow-xl backdrop-blur-md transition-all h-12 pt-1"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="h-5 w-5" />
                            Crear Rol
                        </Button>
                    }
                />

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
                                {groupedPermissions.map((group) => (
                                    <>
                                        <tr key={group.name} className="bg-muted/30">
                                            <td
                                                colSpan={roles.length + 1}
                                                className="py-2 px-4 text-xs font-black uppercase tracking-widest text-muted-foreground/70"
                                            >
                                                {group.name}
                                            </td>
                                        </tr>
                                        {group.items.map((permission) => (
                                            <tr
                                                key={permission.id}
                                                className="border-b border-border/60 hover:bg-muted/10 transition-colors"
                                            >
                                                <td className="py-3 pl-8 pr-4 text-foreground font-medium">
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
                                                                className={`inline-flex min-w-10 items-center justify-center rounded-md border px-2 py-1 transition-all duration-200 ${
                                                                    isUpdating
                                                                        ? 'cursor-not-allowed border-slate-300 bg-slate-100 opacity-60'
                                                                        : hasPermission
                                                                          ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50'
                                                                          : 'border-border hover:bg-muted'
                                                                }`}
                                                                disabled={
                                                                    (role.is_protected &&
                                                                        hasPermission) ||
                                                                    isUpdating
                                                                }
                                                            >
                                                                {isUpdating ? (
                                                                    <span className="text-xs text-muted-foreground animate-pulse">
                                                                        ...
                                                                    </span>
                                                                ) : hasPermission ? (
                                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-red-400 opacity-40 hover:opacity-100 transition-opacity" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </AppLayout>
    );
}
