export type TodayLog = {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    total_hours: number | null;
    notes: string | null;
};

export type ManageableIntern = {
    id: number;
    user_id: number;
    name: string;
    avatar?: string;
    education_center: string | null;
    module_name?: string | null;
};

export type ManageableTutor = {
    id: number;
    user_id: number;
    name: string;
    email?: string | null;
};

export type NonCompliantIntern = {
    id: number;
    name: string;
    avatar?: string;
    debt: number;
    expected_hours: number;
    total_done: number;
    education_center: string | null;
};

export type Absence = {
    id: number;
    date: string;
    reason: string | null;
    status: 'approved' | 'rejected' | 'pending' | string;
    justification_url?: string | null;
};

export type ManualLogFormData = {
    intern_id: string;
    date: string;
    clock_in: string;
    clock_out: string;
    notes: string;
};

export type ManualLogFormState = {
    data: ManualLogFormData;
    errors: Partial<Record<keyof ManualLogFormData, string>>;
    processing: boolean;
    setData: (key: keyof ManualLogFormData, value: string) => void;
};
