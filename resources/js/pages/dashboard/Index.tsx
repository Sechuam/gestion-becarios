import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    ClipboardCheck,
    KanbanSquare,
    Users,
    LayoutDashboard,
    Save,
    GripHorizontal,
} from 'lucide-react';
import {
    AttendanceStatsCard,
    AttendanceChart,
    InternsByCenterChart,
    TaskStatusChart,
} from '@/components/dashboard/DashboardCharts';
import { DashboardAlertCards } from '@/components/dashboard/DashboardAlertCards';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetricCards } from '@/components/dashboard/DashboardMetricCards';
import { InternTaskProgressPanel } from '@/components/dashboard/InternTaskProgressPanel';
import { TodayAgendaPanel } from '@/components/dashboard/TodayAgendaPanel';
import { DashboardWidgetWrapper } from '@/components/dashboard/DashboardWidgetWrapper';
import { ManageWidgetsModal } from '@/components/dashboard/ManageWidgetsModal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    rectIntersection,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
    DashboardAgendaItem,
    DashboardAlert,
    DashboardChartPoint,
    DashboardCurrentLog,
    DashboardMetric,
    DashboardRole,
    DashboardStats,
    DashboardTaskProgress,
} from '@/components/dashboard/types';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

// Estructura inicial del puzzle
const DEFAULT_SECTIONS = [
    'row_metrics',
    'row_top_charts',
    'row_bottom_panels',
    'row_alerts',
];
const DEFAULT_TOP_CHARTS = ['interns_chart', 'task_chart'];
const DEFAULT_BOTTOM_PANELS = ['attendance', 'agenda', 'progress'];

interface DashboardProps {
    role: DashboardRole;
    stats: DashboardStats;
    interns_by_center: DashboardChartPoint[];
    attendance_chart: DashboardChartPoint[];
    task_status_chart: DashboardChartPoint[];
    task_progress: DashboardTaskProgress[];
    alerts: DashboardAlert[];
    today_agenda: DashboardAgendaItem[];
    current_log: DashboardCurrentLog | null;
}

// Componente para las filas móviles
function SortableRow({
    id,
    children,
    isEditing,
}: {
    id: string;
    children: React.ReactNode;
    isEditing: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 40 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'relative transition-all duration-300',
                isDragging && 'opacity-30',
                isEditing && 'pl-10',
            )}
        >
            {isEditing && (
                <div
                    {...attributes}
                    {...listeners}
                    className="group absolute top-0 bottom-0 left-0 flex w-8 cursor-grab items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-all hover:bg-slate-100 hover:text-sidebar"
                    title="Arrastrar fila"
                >
                    <GripHorizontal className="h-4 w-4 rotate-90 opacity-40 group-hover:opacity-100" />
                </div>
            )}
            {children}
        </div>
    );
}

export default function Dashboard({
    role,
    stats,
    interns_by_center,
    attendance_chart,
    task_status_chart,
    task_progress,
    alerts,
    today_agenda,
    current_log,
}: DashboardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
    const [topCharts, setTopCharts] = useState<string[]>(DEFAULT_TOP_CHARTS);
    const [bottomPanels, setBottomPanels] = useState<string[]>(
        DEFAULT_BOTTOM_PANELS,
    );
    const [visibleWidgets, setVisibleWidgets] = useState<string[]>(
        DEFAULT_TOP_CHARTS.concat(DEFAULT_BOTTOM_PANELS).concat([
            'metrics',
            'alerts',
        ]),
    );
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('dashboard-puzzle');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.sections) setSections(parsed.sections);
                if (parsed.topCharts) setTopCharts(parsed.topCharts);
                if (parsed.bottomPanels) setBottomPanels(parsed.bottomPanels);
                if (parsed.visibleWidgets)
                    setVisibleWidgets(parsed.visibleWidgets);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const saveLayout = (
        newSections: string[],
        newTop: string[],
        newBottom: string[],
        newVisible: string[],
    ) => {
        localStorage.setItem(
            'dashboard-puzzle',
            JSON.stringify({
                sections: newSections,
                topCharts: newTop,
                bottomPanels: newBottom,
                visibleWidgets: newVisible,
            }),
        );
    };

    const toggleWidget = (id: string) => {
        const newVisible = visibleWidgets.includes(id)
            ? visibleWidgets.filter((w) => w !== id)
            : [...visibleWidgets, id];
        setVisibleWidgets(newVisible);
        saveLayout(sections, topCharts, bottomPanels, newVisible);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragStart = (event: DragStartEvent) =>
        setActiveId(event.active.id as string);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            setActiveId(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        // Si es una fila principal
        if (sections.includes(activeId)) {
            const oldIndex = sections.indexOf(activeId);
            const newIndex = sections.indexOf(overId);
            const newSections = arrayMove(sections, oldIndex, newIndex);
            setSections(newSections);
            saveLayout(newSections, topCharts, bottomPanels, visibleWidgets);
        }
        // Si es un gráfico superior
        else if (topCharts.includes(activeId)) {
            const oldIndex = topCharts.indexOf(activeId);
            const newIndex = topCharts.indexOf(overId);
            const newTop = arrayMove(topCharts, oldIndex, newIndex);
            setTopCharts(newTop);
            saveLayout(sections, newTop, bottomPanels, visibleWidgets);
        }
        // Si es un panel inferior
        else if (bottomPanels.includes(activeId)) {
            const oldIndex = bottomPanels.indexOf(activeId);
            const newIndex = bottomPanels.indexOf(overId);
            const newBottom = arrayMove(bottomPanels, oldIndex, newIndex);
            setBottomPanels(newBottom);
            saveLayout(sections, topCharts, newBottom, visibleWidgets);
        }

        setActiveId(null);
    };

    const roleLabel =
        role === 'admin'
            ? 'Administración'
            : role === 'tutor'
              ? 'Tutoría'
              : 'Becario';
    const taskCompletion =
        stats.total_tasks > 0
            ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
            : 0;

    const metrics: DashboardMetric[] = [
        {
            label: role === 'intern' ? 'Mi práctica' : 'Becarios activos',
            value: stats.active_interns,
            hint:
                role === 'admin'
                    ? 'En todos los centros'
                    : 'Dentro de tu alcance',
            icon: Users,
        },
        {
            label: 'Tareas abiertas',
            value: stats.active_tasks,
            hint: 'Pendientes, activas o en revisión',
            icon: KanbanSquare,
        },
        {
            label: 'Evaluaciones pendientes',
            value: stats.pending_evaluations,
            hint: 'Sin evaluación registrada este mes',
            icon: ClipboardCheck,
        },
        {
            label: 'Próximas finalizaciones',
            value: stats.upcoming_endings,
            hint: 'Prácticas que terminan en 30 días',
            icon: CalendarClock,
        },
        {
            label: 'Alertas activas',
            value: stats.alerts,
            hint: 'Ausencias y jornadas por revisar',
            icon: AlertTriangle,
        },
    ];

    const renderWidget = (id: string, isOverlay = false) => {
        switch (id) {
            case 'metrics':
                return <DashboardMetricCards metrics={metrics} />;
            case 'interns_chart':
                return <InternsByCenterChart data={interns_by_center} />;
            case 'task_chart':
                return <TaskStatusChart data={task_status_chart} />;
            case 'attendance':
                return (
                    <div className="flex h-full flex-col gap-2.5">
                        <AttendanceChart
                            className="flex-1"
                            data={attendance_chart}
                        />
                        <AttendanceStatsCard
                            className="flex-1"
                            completeAttendanceRate={
                                stats.complete_attendance_rate
                            }
                            averageDelayMinutes={stats.average_delay_minutes}
                            absenceRate={stats.absence_rate}
                        />
                    </div>
                );
            case 'agenda':
                return (
                    <TodayAgendaPanel
                        className="h-full"
                        todayAgenda={today_agenda}
                        currentLog={current_log}
                    />
                );
            case 'progress':
                return (
                    <InternTaskProgressPanel
                        className="h-full"
                        taskProgress={task_progress}
                        averageResolutionDays={
                            stats.average_task_resolution_days
                        }
                    />
                );
            case 'alerts':
                return <DashboardAlertCards alerts={alerts} />;
            default:
                return null;
        }
    };

    const renderSection = (rowId: string) => {
        switch (rowId) {
            case 'row_metrics':
                if (!visibleWidgets.includes('metrics')) return null;
                return (
                    <SortableRow key={rowId} id={rowId} isEditing={isEditing}>
                        <DashboardWidgetWrapper
                            id="metrics"
                            isEditing={isEditing}
                            className="w-full"
                        >
                            {renderWidget('metrics')}
                        </DashboardWidgetWrapper>
                    </SortableRow>
                );
            case 'row_top_charts':
                const visibleTop = topCharts.filter((id) =>
                    visibleWidgets.includes(id),
                );
                if (visibleTop.length === 0) return null;
                return (
                    <SortableRow key={rowId} id={rowId} isEditing={isEditing}>
                        <SortableContext
                            items={visibleTop}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                {topCharts.map((id) => {
                                    if (!visibleWidgets.includes(id))
                                        return null;
                                    return (
                                        <DashboardWidgetWrapper
                                            key={id}
                                            id={id}
                                            isEditing={isEditing}
                                            className={
                                                id === 'interns_chart'
                                                    ? 'md:col-span-7'
                                                    : 'md:col-span-5'
                                            }
                                        >
                                            {renderWidget(id)}
                                        </DashboardWidgetWrapper>
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </SortableRow>
                );
            case 'row_bottom_panels':
                const visibleBottom = bottomPanels.filter((id) =>
                    visibleWidgets.includes(id),
                );
                if (visibleBottom.length === 0) return null;
                return (
                    <SortableRow key={rowId} id={rowId} isEditing={isEditing}>
                        <SortableContext
                            items={visibleBottom}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {bottomPanels.map((id) => {
                                    if (!visibleWidgets.includes(id))
                                        return null;
                                    return (
                                        <DashboardWidgetWrapper
                                            key={id}
                                            id={id}
                                            isEditing={isEditing}
                                            className="col-span-1"
                                        >
                                            {renderWidget(id)}
                                        </DashboardWidgetWrapper>
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </SortableRow>
                );
            case 'row_alerts':
                if (!visibleWidgets.includes('alerts')) return null;
                return (
                    <SortableRow key={rowId} id={rowId} isEditing={isEditing}>
                        <DashboardWidgetWrapper
                            id="alerts"
                            isEditing={isEditing}
                            className="w-full"
                        >
                            {renderWidget('alerts')}
                        </DashboardWidgetWrapper>
                    </SortableRow>
                );
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-4">
                <DashboardHeader
                    roleLabel={roleLabel}
                    alerts={stats.alerts}
                    completedTasks={stats.completed_tasks}
                    taskCompletion={taskCompletion}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onManageWidgets={() => setIsManageModalOpen(true)}
                />

                <ManageWidgetsModal
                    open={isManageModalOpen}
                    onOpenChange={setIsManageModalOpen}
                    visibleWidgets={visibleWidgets}
                    onToggleWidget={toggleWidget}
                />

                <DndContext
                    sensors={sensors}
                    collisionDetection={rectIntersection}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setActiveId(null)}
                >
                    <SortableContext
                        items={sections}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={cn(
                            "flex flex-col gap-6 transition-all duration-500 rounded-3xl p-4 -m-4",
                            isEditing && "bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-slate-100/50 dark:bg-slate-950/20 ring-1 ring-slate-200/60 dark:ring-slate-800/60 shadow-inner"
                        )}>
                            {sections.map((rowId) => renderSection(rowId))}
                        </div>
                    </SortableContext>

                    <DragOverlay
                        dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: { active: { opacity: '0.4' } },
                            }),
                        }}
                    >
                        {activeId ? (
                            <div className="pointer-events-none scale-[1.02] opacity-90 shadow-2xl transition-transform">
                                {sections.includes(activeId) ? (
                                    <div className="rounded-3xl border-2 border-dashed border-sidebar/20 bg-white/50 p-4 backdrop-blur-sm">
                                        Moviendo sección completa...
                                    </div>
                                ) : (
                                    renderWidget(activeId, true)
                                )}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </AppLayout>
    );
}
