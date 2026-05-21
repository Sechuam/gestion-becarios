import type { LucideIcon } from 'lucide-react';

export type DashboardRole = 'admin' | 'tutor' | 'intern' | string;

export type DashboardChartPoint = {
    name?: string;
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
    type: 'event' | 'absence';
    title: string;
    time: string;
    color: string;
};

export type DashboardCurrentLog = {
    clock_in: string;
    today_logged_hours: number;
    elapsed_seconds: number;
};
