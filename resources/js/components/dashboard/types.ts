import type { LucideIcon } from 'lucide-react';

export type DashboardRole = 'admin' | 'tutor' | 'intern' | string;

export type DashboardChartPoint = {
    name?: string;
    month?: string;
    becarios?: number;
    horas?: number;
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
    alerts: number;
    attendance_compliance: number;
    completed_tasks: number;
    total_tasks: number;
};

export type DashboardMetric = {
    label: string;
    value: string | number;
    hint: string;
    icon: LucideIcon;
};
