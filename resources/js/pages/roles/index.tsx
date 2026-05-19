import { Head, router, useForm } from '@inertiajs/react';
import { Check, Copy, Pencil, Plus, Shield, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MetricPills } from '@/components/common/MetricPills';
import { ModuleHeader } from '@/components/common/ModuleHeader';
import { HeaderActionButton } from '@/components/common/HeaderActionButton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const [managePermissionsRoleId, setManagePermissionsRoleId] = useState<
        number | null
    >(null);
    const [pendingPermissionKey, setPendingPermissionKey] = useState<
        string | null
    >(null);

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
                group.permissions.includes(p.name),
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

    const roleCardsSummary = useMemo(
        () =>
            roles.map((role) => {
                const permissionIds =
                    rolePermissionMap[role.id] ?? new Set<number>();
                const activeGroups = groupedPermissions.filter((group) =>
                    group.items.some((permission) =>
                        permissionIds.has(permission.id),
                    ),
                );

                return {
                    role,
                    permissionsCount: permissionIds.size,
                    activeGroups,
                };
            }),
        [groupedPermissions, rolePermissionMap, roles],
    );

    const managedRole =
        roles.find((role) => role.id === managePermissionsRoleId) ?? null;

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
            `¿Seguro que quieres eliminar el rol "${role.name}"?`,
        );

        if (!confirmed) return;

        router.delete(`/roles/${role.id}`, { preserveScroll: true });
    };

    const togglePermission = (
        roleId: number,
        permissionId: number,
        enabled: boolean,
    ) => {
        const key = `${roleId}-${permissionId}`;
        setPendingPermissionKey(key);

        router.post(
            `/roles/${roleId}/permissions/${permissionId}`,
            { enabled },
            {
                preserveScroll: true,
                onFinish: () => setPendingPermissionKey(null),
            },
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
        [roles, permissions],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y permisos" />

            <div className="flex flex-col gap-6">
                <ModuleHeader
                    title="Roles y permisos"
                    description="Gestiona los roles del sistema y su matriz de permisos para controlar el acceso a los diferentes módulos."
                    icon={<Shield className="h-6 w-6" />}
                    actions={
                        <HeaderActionButton
                            label="Crear Rol"
                            onClick={() => setCreateOpen(true)}
                        />
                    }
                />
                <MetricPills metrics={headerMetrics} />

                <Tabs defaultValue="roles" className="w-full">
                    <div className="rounded-xl border border-sidebar/10 bg-white p-1.5 shadow-sm dark:bg-slate-900/60">
                        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-2">
                            <TabsTrigger
                                value="roles"
                                className="h-10 rounded-xl border border-sidebar/10 bg-slate-50/80 text-[10px] font-black tracking-[0.18em] text-slate-500 uppercase data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:bg-slate-800/70 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                            >
                                Vista roles
                            </TabsTrigger>
                            <TabsTrigger
                                value="matrix"
                                className="h-10 rounded-xl border border-sidebar/10 bg-slate-50/80 text-[10px] font-black tracking-[0.18em] text-slate-500 uppercase data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:bg-slate-800/70 dark:text-slate-300 dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
                            >
                                Vista matriz
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="roles" className="mt-4">
                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
                            <div className="border-b border-slate-400 bg-slate-200 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                    Lista de roles
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Gestiona cada rol desde una vista más
                                    compacta.
                                </p>
                            </div>

                            <div className="space-y-4 p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Abre el detalle de un rol para revisar o
                                        ajustar permisos sin usar la matriz
                                        completa.
                                    </p>

                                    <Dialog
                                        open={createOpen}
                                        onOpenChange={setCreateOpen}
                                    >
                                        <DialogContent className="overflow-hidden border-sidebar/20 p-0 shadow-xl sm:max-w-md">
                                            <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-5 text-white">
                                                <DialogHeader>
                                                    <DialogTitle className="text-left text-xl font-black text-white">
                                                        Crear rol
                                                    </DialogTitle>
                                                    <DialogDescription className="pt-2 text-left text-white/75">
                                                        Define un nuevo rol para
                                                        organizar accesos y
                                                        permisos del sistema.
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </div>

                                            <div className="space-y-4 px-6 py-5">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-foreground">
                                                        Nombre del rol
                                                    </label>
                                                    <input
                                                        className="h-11 w-full rounded-xl border border-sidebar/15 bg-slate-50/80 px-3 text-sm text-foreground shadow-sm"
                                                        placeholder="Slug (ej: tutor_senior)"
                                                        value={
                                                            createForm.data.name
                                                        }
                                                        disabled={
                                                            createForm.processing
                                                        }
                                                        onChange={(e) =>
                                                            createForm.setData(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {createForm.errors.name && (
                                                        <p className="text-sm text-red-600">
                                                            {
                                                                createForm
                                                                    .errors.name
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-foreground">
                                                        Nombre visible
                                                    </label>
                                                    <input
                                                        className="h-11 w-full rounded-xl border border-sidebar/15 bg-slate-50/80 px-3 text-sm text-foreground shadow-sm"
                                                        placeholder="Nombre visible (ej: Tutor senior)"
                                                        value={
                                                            createForm.data
                                                                .display_name
                                                        }
                                                        disabled={
                                                            createForm.processing
                                                        }
                                                        onChange={(e) =>
                                                            createForm.setData(
                                                                'display_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {createForm.errors
                                                        .display_name && (
                                                        <p className="text-sm text-red-600">
                                                            {
                                                                createForm
                                                                    .errors
                                                                    .display_name
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {createForm.recentlySuccessful && (
                                                    <p className="text-sm text-emerald-600">
                                                        Rol creado
                                                        correctamente.
                                                    </p>
                                                )}

                                                <DialogFooter className="gap-2 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl border-sidebar/15"
                                                        onClick={() =>
                                                            setCreateOpen(false)
                                                        }
                                                        disabled={
                                                            createForm.processing
                                                        }
                                                    >
                                                        Cancelar
                                                    </Button>

                                                    <Button
                                                        className="gap-2 rounded-xl border-0 bg-gradient-to-r from-sidebar to-[#1f4f52] text-white shadow-sm hover:opacity-95"
                                                        onClick={
                                                            handleCreateRole
                                                        }
                                                        disabled={
                                                            createForm.processing
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        {createForm.processing
                                                            ? 'Creando...'
                                                            : 'Crear rol'}
                                                    </Button>
                                                </DialogFooter>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {roleCardsSummary.map(
                                        ({
                                            role,
                                            permissionsCount,
                                            activeGroups,
                                        }) => {
                                            const cannotDelete =
                                                role.is_protected ||
                                                role.users_count > 0;

                                            const deleteMessage =
                                                role.is_protected
                                                    ? 'Rol protegido del sistema.'
                                                    : role.users_count > 0
                                                      ? 'No se puede eliminar porque tiene usuarios asignados.'
                                                      : null;

                                            return (
                                                <div
                                                    key={role.id}
                                                    className="min-w-0 overflow-hidden rounded-lg border border-sidebar/20 bg-gradient-to-r from-sidebar to-[#1f4f52] p-4 text-white shadow-lg"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-white/65">
                                                                Rol
                                                            </p>

                                                            {editingRoleId ===
                                                            role.id ? (
                                                                <div className="mt-1 space-y-1">
                                                                    <input
                                                                        className="h-9 w-full rounded-md border border-white/20 bg-white/10 px-2 text-sm text-white placeholder:text-white/50"
                                                                        value={
                                                                            editForm
                                                                                .data
                                                                                .display_name
                                                                        }
                                                                        disabled={
                                                                            editForm.processing
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            editForm.setData(
                                                                                'display_name',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                    {editForm
                                                                        .errors
                                                                        .display_name && (
                                                                        <p className="text-sm text-red-600">
                                                                            {
                                                                                editForm
                                                                                    .errors
                                                                                    .display_name
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <h3 className="text-lg font-semibold break-words text-white">
                                                                        {roleLabel(
                                                                            role.name,
                                                                            role.display_name,
                                                                        )}
                                                                    </h3>
                                                                </>
                                                            )}
                                                        </div>

                                                        <span
                                                            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                                                                role.is_active
                                                                    ? 'bg-white text-sidebar'
                                                                    : 'bg-white/15 text-white'
                                                            }`}
                                                        >
                                                            {role.is_active
                                                                ? 'Activo'
                                                                : 'Inactivo'}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between text-sm text-white/75">
                                                        <span>Usuarios</span>
                                                        <span className="font-semibold text-white">
                                                            {role.users_count}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between text-sm text-white/75">
                                                        <span>Permisos</span>
                                                        <span className="font-semibold text-white">
                                                            {permissionsCount}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {activeGroups
                                                            .slice(0, 3)
                                                            .map((group) => (
                                                                <span
                                                                    key={`${role.id}-${group.name}`}
                                                                    className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-black tracking-widest text-white/85 uppercase"
                                                                >
                                                                    {group.name}
                                                                </span>
                                                            ))}
                                                        {activeGroups.length >
                                                            3 && (
                                                            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-black tracking-widest text-white/85 uppercase">
                                                                +
                                                                {activeGroups.length -
                                                                    3}{' '}
                                                                grupos
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {editingRoleId ===
                                                        role.id ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-9 flex-1 gap-2 border-0 bg-white text-sidebar hover:bg-white/90 sm:flex-none"
                                                                    onClick={() =>
                                                                        handleUpdateRole(
                                                                            role.id,
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
                                                                    className="h-9 flex-1 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:flex-none"
                                                                    onClick={
                                                                        cancelEdit
                                                                    }
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
                                                                className="h-9 flex-1 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:flex-none"
                                                                title="Editar rol"
                                                                onClick={() =>
                                                                    startEdit(
                                                                        role,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Editar
                                                            </Button>
                                                        )}

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 flex-1 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:flex-none"
                                                            onClick={() =>
                                                                setManagePermissionsRoleId(
                                                                    role.id,
                                                                )
                                                            }
                                                        >
                                                            <Shield className="h-3.5 w-3.5" />
                                                            Permisos
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 flex-1 gap-2 text-white/85 hover:bg-white/10 hover:text-white sm:flex-none"
                                                            title="Clonar rol"
                                                            disabled
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                            Clonar
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 flex-1 gap-2 text-white/85 hover:bg-white/10 hover:text-white disabled:text-white/35 sm:flex-none"
                                                            disabled={
                                                                cannotDelete
                                                            }
                                                            title={
                                                                role.is_protected
                                                                    ? 'No se puede eliminar un rol protegido'
                                                                    : role.users_count >
                                                                        0
                                                                      ? 'No se puede eliminar un rol con usuarios asignados'
                                                                      : 'Eliminar rol'
                                                            }
                                                            onClick={() =>
                                                                handleDeleteRole(
                                                                    role,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Eliminar
                                                        </Button>
                                                    </div>

                                                    {editingRoleId ===
                                                        role.id && (
                                                        <div className="mt-3 flex items-center gap-2 text-sm text-white/75">
                                                            <span>Estado</span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                                                                disabled={
                                                                    editForm.processing
                                                                }
                                                                onClick={() =>
                                                                    editForm.setData(
                                                                        'is_active',
                                                                        !editForm
                                                                            .data
                                                                            .is_active,
                                                                    )
                                                                }
                                                            >
                                                                {editForm.data
                                                                    .is_active
                                                                    ? 'Activo'
                                                                    : 'Inactivo'}
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {deleteMessage && (
                                                        <p className="mt-3 text-xs text-white/70">
                                                            {deleteMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="matrix" className="mt-4">
                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
                            <div className="border-b border-slate-400 bg-slate-200 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                    Matriz de permisos
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Vista avanzada para comparar rápidamente
                                    permisos entre roles.
                                </p>
                            </div>

                            <div className="overflow-x-auto p-6">
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
                                                        role.display_name,
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {groupedPermissions.map((group) => (
                                            <>
                                                <tr
                                                    key={group.name}
                                                    className="bg-gradient-to-r from-sidebar to-[#1f4f52]"
                                                >
                                                    <td
                                                        colSpan={
                                                            roles.length + 1
                                                        }
                                                        className="px-4 py-2 text-xs font-black tracking-widest text-white/80 uppercase"
                                                    >
                                                        {group.name}
                                                    </td>
                                                </tr>
                                                {group.items.map(
                                                    (permission) => (
                                                        <tr
                                                            key={permission.id}
                                                            className="border-b border-border/60 transition-colors hover:bg-muted/10"
                                                        >
                                                            <td className="py-3 pr-4 pl-8 font-medium text-foreground">
                                                                {permissionLabel(
                                                                    permission.name,
                                                                )}
                                                            </td>

                                                            {roles.map(
                                                                (role) => {
                                                                    const hasPermission =
                                                                        rolePermissionMap[
                                                                            role
                                                                                .id
                                                                        ]?.has(
                                                                            permission.id,
                                                                        ) ??
                                                                        false;

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
                                                                                        !hasPermission,
                                                                                    )
                                                                                }
                                                                                className={`inline-flex min-w-10 items-center justify-center rounded-md border px-2 py-1 transition-all duration-200 ${
                                                                                    isUpdating
                                                                                        ? 'cursor-not-allowed border-slate-300 bg-slate-100 opacity-60'
                                                                                        : hasPermission
                                                                                          ? 'border-slate-400 bg-slate-200 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-700'
                                                                                          : 'border-border hover:bg-muted'
                                                                                }`}
                                                                                disabled={
                                                                                    (role.is_protected &&
                                                                                        hasPermission) ||
                                                                                    isUpdating
                                                                                }
                                                                            >
                                                                                {isUpdating ? (
                                                                                    <span className="animate-pulse text-xs text-muted-foreground">
                                                                                        ...
                                                                                    </span>
                                                                                ) : hasPermission ? (
                                                                                    <Check className="h-4 w-4 text-slate-700 dark:text-white" />
                                                                                ) : (
                                                                                    <X className="h-4 w-4 text-red-400 opacity-40 transition-opacity hover:opacity-100" />
                                                                                )}
                                                                            </button>
                                                                        </td>
                                                                    );
                                                                },
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </TabsContent>
                </Tabs>

                <Dialog
                    open={managePermissionsRoleId !== null}
                    onOpenChange={(open) => {
                        if (!open) setManagePermissionsRoleId(null);
                    }}
                >
                    <DialogContent className="max-h-[85vh] overflow-hidden border-sidebar/20 p-0 shadow-xl sm:max-w-3xl">
                        <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-5 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-left text-xl font-black text-white">
                                    Gestionar permisos
                                </DialogTitle>
                                <DialogDescription className="pt-2 text-left text-white/75">
                                    {managedRole
                                        ? `Ajusta los permisos del rol ${roleLabel(
                                              managedRole.name,
                                              managedRole.display_name,
                                          )}.`
                                        : 'Ajusta los permisos del rol seleccionado.'}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="max-h-[calc(85vh-108px)] space-y-5 overflow-y-auto px-6 py-5">
                            {managedRole &&
                                groupedPermissions.map((group) => (
                                    <div
                                        key={`modal-${group.name}`}
                                        className="rounded-xl border border-sidebar/10 bg-slate-50/70 p-4 dark:bg-slate-900/50"
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-black tracking-[0.18em] text-sidebar uppercase">
                                                    {group.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {group.items.length} permiso
                                                    {group.items.length !== 1
                                                        ? 's'
                                                        : ''}
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-sidebar/10 bg-white px-3 py-1 text-[10px] font-black tracking-widest text-sidebar uppercase dark:bg-slate-900">
                                                {
                                                    group.items.filter(
                                                        (permission) =>
                                                            rolePermissionMap[
                                                                managedRole.id
                                                            ]?.has(
                                                                permission.id,
                                                            ),
                                                    ).length
                                                }{' '}
                                                activos
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {group.items.map((permission) => {
                                                const hasPermission =
                                                    rolePermissionMap[
                                                        managedRole.id
                                                    ]?.has(permission.id) ??
                                                    false;
                                                const permissionKey = `${managedRole.id}-${permission.id}`;
                                                const isUpdating =
                                                    pendingPermissionKey ===
                                                    permissionKey;

                                                return (
                                                    <button
                                                        key={`modal-${managedRole.id}-${permission.id}`}
                                                        type="button"
                                                        onClick={() =>
                                                            togglePermission(
                                                                managedRole.id,
                                                                permission.id,
                                                                !hasPermission,
                                                            )
                                                        }
                                                        disabled={isUpdating}
                                                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                                                            hasPermission
                                                                ? 'border-slate-400 bg-slate-200 text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                                                                : 'border-sidebar/10 bg-white text-slate-700 hover:border-sidebar/20 hover:bg-slate-50 dark:bg-slate-950/50 dark:text-slate-200'
                                                        } ${isUpdating ? 'opacity-60' : ''}`}
                                                    >
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                {permissionLabel(
                                                                    permission.name,
                                                                )}
                                                            </p>
                                                            <p
                                                                className={`text-[11px] ${
                                                                    hasPermission
                                                                        ? 'text-slate-600 dark:text-slate-200'
                                                                        : 'text-muted-foreground'
                                                                }`}
                                                            >
                                                                {
                                                                    permission.name
                                                                }
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`inline-flex h-8 min-w-[92px] items-center justify-center rounded-lg px-3 text-[10px] font-black tracking-widest uppercase ${
                                                                hasPermission
                                                                    ? 'border border-slate-400 bg-slate-100 text-slate-800 dark:border-slate-500 dark:bg-slate-600 dark:text-white'
                                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            {isUpdating
                                                                ? '...'
                                                                : hasPermission
                                                                  ? 'Activo'
                                                                  : 'Inactivo'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
