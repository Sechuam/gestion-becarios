export type RoleOption = {
    name: string;
    display_name?: string | null;
};

export type Role = {
    id: number;
    name: string;
    display_name?: string | null;
    is_active: boolean;
    users_count: number;
    is_protected: boolean;
};

export type Permission = {
    id: number;
    name: string;
};
