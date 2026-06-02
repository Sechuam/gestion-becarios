import type { LucideIcon } from 'lucide-react';

export type DashboardRole = 'admin' | 'tutor' | 'intern' | string;

export type DashboardChartPoint = {
    id?: number | null;
    name?: string;
    status?: string;
    month?: string;
    day?: string;
    date?: string;
    iso_date?: string;
    becarios?: number;
    horas?: number;
    live_hours?: number;
    total_hours?: number;
    value?: number;
};

export type DashboardTaskProgress = {
    id: number;
    url?: string;
    name: string;
    center: string;
    completed: number;
    total: number;
    progress: number;
    hours: number;
    average_delay?: number;
};

export type DashboardAlert = {
    label: string;
    value: number;
    tone: string;
};

export type DashboardStats = {
    active_interns: number;
    active_centers: number;
    active_tasks: number;
    pending_evaluations: number;
    upcoming_endings: number;
    alerts: number;
    attendance_compliance: number;
    complete_attendance_rate: number;
    average_delay_minutes: number | null;
    absence_rate: number;
    completed_tasks: number;
    total_tasks: number;
    average_task_resolution_days: number | null;
};

export type DashboardMetric = {
    label: string;
    value: string | number;
    hint: string;
    icon: LucideIcon;
};

export type DashboardAgendaItem = {
    id?: number;
    type: 'event' | 'absence';
    title: string;
    description?: string | null;
    time: string;
    start_time?: string | null;
    end_time?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    all_day?: boolean;
    color: string;
    creator?: string | null;
    creator_id?: number | null;
    can_respond?: boolean;
    attendance_status?: string | null;
    attendance_status_value?: 'pending' | 'accepted' | 'rejected' | null;
    attendees?: Array<{
        id: number;
        name: string;
        email?: string | null;
        avatar?: string | null;
        attendance_status?: string | null;
        attendance_status_value?: 'pending' | 'accepted' | 'rejected' | null;
    }>;
};

export type DashboardCurrentLog = {
    clock_in: string;
    today_logged_hours: number;
    elapsed_seconds: number;
};
