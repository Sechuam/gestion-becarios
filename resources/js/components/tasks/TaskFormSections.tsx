import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TASK_STATUS_OPTIONS = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'in_review', label: 'En revisión' },
    { value: 'completed', label: 'Completada' },
    { value: 'rejected', label: 'Rechazada' },
];

export const TASK_PRIORITY_OPTIONS = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
];

type TaskFormShellProps = {
    titlePrefix: string;
    titleAccent: string;
    subtitle: string;
    children: ReactNode;
};

export function TaskFormShell({
    titlePrefix,
    titleAccent,
    subtitle,
    children,
}: TaskFormShellProps) {
    return (
        <div className="page-surface overflow-visible border-sidebar/20 p-0 shadow-xl">
            <div className="rounded-t-[1.2rem] bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-5 text-white">
                <div className="flex flex-col gap-0">
                    <h1 className="text-xl font-black tracking-tight">
                        {titlePrefix}{' '}
                        <span className="text-white/80">{titleAccent}</span>
                    </h1>
                    <p className="font-mono text-[9px] font-medium tracking-[0.2em] text-white/50 uppercase">
                        {subtitle}
                    </p>
                </div>
            </div>

            <div className="rounded-b-[1.2rem] bg-slate-50/50 p-4 md:p-6 dark:bg-slate-900/40">
                {children}
            </div>
        </div>
    );
}

type TaskFormTabsProps = {
    infoLabel: string;
    info: ReactNode;
    planning: ReactNode;
    assignment: ReactNode;
};

export function TaskFormTabs({
    infoLabel,
    info,
    planning,
    assignment,
}: TaskFormTabsProps) {
    const triggerClass =
        'h-10 w-full rounded-xl border border-slate-900/10 bg-white px-4 text-slate-500 shadow-sm transition-all data-[state=active]:border-slate-400 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white dark:border-white/10 dark:bg-slate-800 dark:text-slate-300';

    return (
        <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-2 rounded-xl border border-slate-900/15 bg-slate-50/70 p-1.5 shadow-sm dark:border-white/15 dark:bg-slate-900/50">
                <TabsTrigger value="info" className={triggerClass}>
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        {infoLabel}
                    </span>
                </TabsTrigger>
                <TabsTrigger value="planning" className={triggerClass}>
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        Planificación
                    </span>
                </TabsTrigger>
                <TabsTrigger value="assignment" className={triggerClass}>
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        Asignación
                    </span>
                </TabsTrigger>
            </TabsList>

            <TabsContent
                value="info"
                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
            >
                {info}
            </TabsContent>
            <TabsContent
                value="planning"
                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
            >
                {planning}
            </TabsContent>
            <TabsContent
                value="assignment"
                className="mt-0 animate-in space-y-4 duration-500 outline-none fade-in"
            >
                {assignment}
            </TabsContent>
        </Tabs>
    );
}

type TaskPlanningFieldsProps = {
    status: string;
    priority: string;
    dueDate: string;
    onStatusChange: (value: string) => void;
    onPriorityChange: (value: string) => void;
    onDueDateChange: (value: string) => void;
    dueDateId?: string;
};

export function TaskPlanningFields({
    status,
    priority,
    dueDate,
    onStatusChange,
    onPriorityChange,
    onDueDateChange,
    dueDateId,
}: TaskPlanningFieldsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        {TASK_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={priority} onValueChange={onPriorityChange}>
                    <SelectTrigger className="border-sidebar/10 bg-white shadow-sm focus-visible:ring-sidebar/20">
                        <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                        {TASK_PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor={dueDateId}>Fecha de entrega</Label>
                <DatePicker
                    id={dueDateId}
                    className="rounded-xl border-sidebar/10 bg-white shadow-sm"
                    value={dueDate}
                    onChange={onDueDateChange}
                />
            </div>
        </div>
    );
}

type TaskFormActionsProps = {
    submitLabel: string;
    processingLabel: string;
    processing: boolean;
};

export function TaskFormActions({
    submitLabel,
    processingLabel,
    processing,
}: TaskFormActionsProps) {
    return (
        <div className="flex justify-end gap-3 border-t border-sidebar/10 pt-6">
            <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border px-6 text-foreground hover:bg-muted"
                asChild
            >
                <Link href="/tareas">Cancelar</Link>
            </Button>
            <Button
                type="submit"
                className="rounded-xl bg-sidebar px-8 font-bold text-sidebar-foreground shadow-lg shadow-sidebar/20 transition-all hover:bg-sidebar/90"
                disabled={processing}
            >
                {processing ? processingLabel : submitLabel}
            </Button>
        </div>
    );
}
