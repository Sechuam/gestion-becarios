import type { EventContentArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarEventContent } from './CalendarEventContent';
import { CalendarVisibilityFilters } from './CalendarVisibilityFilters';
import { CreateEventModal } from './CreateEventModal';
import { DayClickModal } from './DayClickModal';
import type { ManageableIntern } from './types';

const renderCalendarEvent = (eventInfo: EventContentArg) => (
    <CalendarEventContent eventInfo={eventInfo} />
);

const normalizeEventClasses = (classNames: string[] | string | undefined) => {
    if (!classNames) {
        return [];
    }

    if (Array.isArray(classNames)) {
        return classNames;
    }

    return classNames.split(/\s+/).filter(Boolean);
};

export function AttendanceCalendarCard({
    canManageAttendance = false,
    canRequestAbsence = true,
    manageableInterns = [],
}: {
    canManageAttendance?: boolean;
    canRequestAbsence?: boolean;
    manageableInterns?: ManageableIntern[];
}) {
    const [showJornadas, setShowJornadas] = useState(true);
    const [showAbsences, setShowAbsences] = useState(true);
    const [showPersonalEvents, setShowPersonalEvents] = useState(true);

    const [isDayClickModalOpen, setIsDayClickModalOpen] = useState(false);
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const calendarRef = useRef<FullCalendar>(null);

    const handleOptionSelect = (option: 'event' | 'absence') => {
        setIsDayClickModalOpen(false);
        if (option === 'absence') {
            window.dispatchEvent(
                new CustomEvent('open-absence-modal', {
                    detail: { date: selectedDate },
                }),
            );
        } else {
            setSelectedEvent(null);
            setIsCreateEventModalOpen(true);
        }
    };

    const handleEventCreated = () => {
        calendarRef.current?.getApi().refetchEvents();
    };

    return (
        <Card className="overflow-hidden rounded-xl border-sidebar/10 bg-white p-2 shadow-lg dark:bg-slate-900">
            <CardContent className="p-0">
                <CalendarVisibilityFilters
                    showJornadas={showJornadas}
                    showAbsences={showAbsences}
                    showPersonalEvents={showPersonalEvents}
                    onShowJornadasChange={setShowJornadas}
                    onShowAbsencesChange={setShowAbsences}
                    onShowPersonalEventsChange={setShowPersonalEvents}
                />
                <div className="attendance-calendar rounded-lg border border-sidebar/10 bg-slate-50/50 p-2 shadow-inner transition-all dark:bg-slate-800/50">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                            listPlugin,
                        ]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'today prev,next',
                            center: 'title',
                            right: 'listWeek timeGridDay,timeGridWeek,dayGridMonth',
                        }}
                        events="/time-logs/events"
                        locales={[esLocale]}
                        locale="es"
                        firstDay={1}
                        height="auto"
                        contentHeight="auto"
                        fixedWeekCount
                        expandRows={false}
                        dayMaxEventRows={3}
                        displayEventEnd={true}
                        nowIndicator={true}
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5],
                        }}
                        moreLinkClick="popover"
                        editable={canManageAttendance}
                        eventDurationEditable={canManageAttendance}
                        eventDrop={async (info) => {
                            if (!info.event.id.startsWith('log_')) {
                                info.revert();
                                return;
                            }
                            const id = info.event.id.replace('log_', '');
                            try {
                                await axios.patch(`/time-logs/${id}`, {
                                    start: info.event.start?.toISOString(),
                                    end: info.event.end?.toISOString(),
                                });
                            } catch {
                                info.revert();
                            }
                        }}
                        eventResize={async (info) => {
                            if (!info.event.id.startsWith('log_')) {
                                info.revert();
                                return;
                            }
                            const id = info.event.id.replace('log_', '');
                            try {
                                await axios.patch(`/time-logs/${id}`, {
                                    start: info.event.start?.toISOString(),
                                    end: info.event.end?.toISOString(),
                                });
                            } catch {
                                info.revert();
                            }
                        }}
                        dateClick={(arg) => {
                            setSelectedDate(arg.dateStr);
                            setIsDayClickModalOpen(true);
                        }}
                        eventClick={(info) => {
                            if (
                                info.event.extendedProps.isPersonal &&
                                info.event.extendedProps.canEdit
                            ) {
                                setSelectedEvent(info.event);
                                setIsCreateEventModalOpen(true);
                            }
                        }}
                        eventClassNames={(arg) => {
                            const classes = [
                                'attendance-calendar-event',
                                ...normalizeEventClasses(arg.event.classNames),
                            ];
                            if (!showJornadas && classes.includes('is-jornada'))
                                classes.push('hidden-event');
                            if (!showAbsences && classes.includes('is-absence'))
                                classes.push('hidden-event');
                            if (
                                !showJornadas &&
                                classes.includes('daily-summary-event')
                            )
                                classes.push('hidden-event');
                            if (
                                !showPersonalEvents &&
                                classes.includes('is-personal-event')
                            )
                                classes.push('hidden-event');
                            if (
                                arg.event.extendedProps.isPersonal &&
                                !arg.event.extendedProps.canEdit
                            )
                                classes.push('is-readonly-event');
                            return classes;
                        }}
                        eventContent={renderCalendarEvent}
                        buttonText={{
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Semana',
                            day: 'Día',
                            listWeek: 'Agenda',
                        }}
                    />
                </div>
                <style>{`
                            .attendance-calendar .fc .fc-button {
                                position: relative;
                                z-index: 2;
                                background: var(--sidebar) !important;
                                border-color: transparent !important;
                                color: white !important;
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                                text-transform: uppercase;
                                font-size: 0.7rem;
                                font-weight: 900;
                                letter-spacing: 0.05em;
                                padding: 8px 16px;
                                border-radius: 8px !important;
                                transition: all 0.2s ease;
                            }

                            .attendance-calendar .fc .fc-button:hover {
                                opacity: 0.9;
                                transform: translateY(-1px);
                                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
                            }

                            .attendance-calendar .fc .fc-button:active,
                            .attendance-calendar .fc .fc-button-primary:not(:disabled).fc-button-active {
                                background: #163c42 !important; /* Un poco más oscuro para el estado activo */
                                opacity: 1 !important;
                                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                            }

                            .attendance-calendar .fc .fc-header-toolbar {
                                margin-bottom: 12px !important;
                                border: 1px solid #94a3b8;
                                border-radius: 12px;
                                background: #e2e8f0;
                                padding: 10px 12px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.04);
                            }

                            .dark .attendance-calendar .fc .fc-header-toolbar {
                                border-color: #475569;
                                background: #334155;
                            }

                            /* Separación entre grupos de botones y botones individuales */
                            .attendance-calendar .fc .fc-toolbar-chunk {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                            }

                            /* Estilo Segmented Control (Cuadrito agrupado) */
                            .attendance-calendar .fc .fc-button-group {
                                gap: 0;
                                border: 1px solid var(--sidebar);
                                border-radius: 10px;
                                overflow: hidden;
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                            }

                            .attendance-calendar .fc .fc-button-group .fc-button {
                                border-radius: 0 !important;
                                margin: 0 !important;
                                border: none !important;
                                border-right: 1px solid rgba(255, 255, 255, 0.3) !important; /* Más visible */
                            }

                            .attendance-calendar .fc .fc-button-group .fc-button:last-child {
                                border-right: none !important;
                            }
                            
                            .attendance-calendar .fc .fc-toolbar-title {
                                position: relative;
                                z-index: 1;
                                pointer-events: none;
                                font-size: 1.1rem !important;
                                font-weight: 800 !important;
                                color: #1e293b;
                                text-transform: capitalize;
                                background: transparent;
                                padding: 0;
                                border: none;
                                box-shadow: none;
                            }
                            .dark .attendance-calendar .fc .fc-toolbar-title {
                                background: transparent;
                                color: white;
                                border: none;
                            }

                            .attendance-calendar .fc .fc-popover {
                                z-index: 9999 !important;
                                background-color: var(--card) !important;
                                opacity: 1 !important;
                            }
                            .attendance-calendar .fc-theme-standard .fc-popover {
                                background: var(--card) !important;
                            }

                            .attendance-calendar .fc .fc-daygrid-day-frame {
                                min-height: 84px;
                            }

                            @media (max-width: 640px) {
                                .attendance-calendar .fc .fc-daygrid-day-frame {
                                    min-height: 68px;
                                }
                            }

                            .attendance-calendar .fc .fc-timegrid-event.is-jornada,
                            .attendance-calendar .fc .fc-daygrid-event.is-jornada {
                                background: linear-gradient(135deg, var(--sidebar) 0%, var(--sidebar-accent) 100%) !important;
                                border: none !important;
                                box-shadow: 0 4px 12px rgba(31, 79, 82, 0.15) !important;
                            }
                            
                            .attendance-calendar .fc .fc-timegrid-event.is-jornada .attendance-calendar-event-label,
                            .attendance-calendar .fc .fc-daygrid-event.is-jornada .attendance-calendar-event-label {
                                color: white !important;
                            }
                            
                            .attendance-calendar .fc .fc-timegrid-event.is-jornada .attendance-calendar-event-dot,
                            .attendance-calendar .fc .fc-daygrid-event.is-jornada .attendance-calendar-event-dot {
                                background-color: rgba(255, 255, 255, 0.8) !important;
                            }

                            .attendance-calendar .fc .fc-timegrid-event.is-jornada:hover,
                            .attendance-calendar .fc .fc-daygrid-event.is-jornada:hover {
                                opacity: 0.95;
                                box-shadow: 0 6px 16px rgba(31, 79, 82, 0.25) !important;
                            }

                            /* Estilo PREMIUM para la vista Agenda */
                            .attendance-calendar .fc .fc-list {
                                border: none !important;
                                border-radius: 8px;
                                overflow: hidden;
                            }
                            
                            /* Cabeceras de Día en Agenda */
                            .attendance-calendar .fc .fc-list-day-cushion {
                                background: linear-gradient(135deg, var(--sidebar) 0%, var(--sidebar-accent) 100%) !important;
                                padding: 6px 16px !important;
                                border: none !important;
                            }
                            .dark .attendance-calendar .fc .fc-list-day-cushion {
                                background: linear-gradient(135deg, var(--sidebar) 0%, var(--sidebar-accent) 100%) !important;
                            }
                            .attendance-calendar .fc .fc-list-day-text {
                                text-transform: capitalize;
                            }
                            .attendance-calendar .fc .fc-list-day-text,
                            .attendance-calendar .fc .fc-list-day-side-text {
                                font-weight: 700 !important;
                                color: white !important;
                                font-size: 0.9rem;
                            }
                            
                            /* Filas de eventos en Agenda */
                            .attendance-calendar .fc .fc-list-event td {
                                border: none !important;
                                padding: 14px 16px !important;
                                border-bottom: 1px solid rgba(0,0,0,0.05) !important;
                                transition: background-color 0.2s ease;
                            }
                            .dark .attendance-calendar .fc .fc-list-event td {
                                border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                            }

                            .attendance-calendar .fc .fc-list-event.is-jornada td {
                                background-color: rgba(226, 232, 240, 0.8) !important; /* Gris más oscuro */
                            }
                            .dark .attendance-calendar .fc .fc-list-event.is-jornada td {
                                background-color: rgba(30, 41, 59, 0.8) !important;
                            }
                            .attendance-calendar .fc .fc-list-event.is-jornada:hover td {
                                background-color: rgba(203, 213, 225, 0.9) !important;
                            }
                            .dark .attendance-calendar .fc .fc-list-event.is-jornada:hover td {
                                background-color: rgba(15, 23, 42, 1) !important;
                            }
                            
                            .attendance-calendar .fc .fc-list-event-time {
                                font-weight: 800;
                                color: var(--sidebar-accent); /* Color corporativo */
                                width: 130px !important;
                            }
                            .dark .attendance-calendar .fc .fc-list-event-time {
                                color: #38bdf8;
                            }
                            .attendance-calendar .fc .fc-list-event-title {
                                font-weight: 600;
                            }

                            /* Restar importancia a filas de "Todo el día" (Ausencias y Sumatorios) */
                            .attendance-calendar .fc .fc-list-event.daily-summary-event td,
                            .attendance-calendar .fc .fc-list-event.is-absence td {
                                opacity: 0.65;
                                background-color: transparent !important;
                                padding: 6px 16px !important; /* Más finas */
                            }
                            .attendance-calendar .fc .fc-list-event.daily-summary-event:hover td,
                            .attendance-calendar .fc .fc-list-event.is-absence:hover td {
                                opacity: 1;
                                background-color: rgba(0,0,0,0.02) !important;
                            }
                            .dark .attendance-calendar .fc .fc-list-event.daily-summary-event:hover td,
                            .dark .attendance-calendar .fc .fc-list-event.is-absence:hover td {
                                background-color: rgba(255,255,255,0.02) !important;
                            }
                            .attendance-calendar .fc .fc-list-event.daily-summary-event .fc-list-event-time,
                            .attendance-calendar .fc .fc-list-event.is-absence .fc-list-event-time {
                                color: #94a3b8 !important; /* Slate 400 */
                                font-weight: 500 !important;
                                font-size: 0.8rem;
                            }
                            .attendance-calendar .fc .fc-list-event.daily-summary-event .fc-list-event-title,
                            .attendance-calendar .fc .fc-list-event.is-absence .fc-list-event-title {
                                font-weight: 500;
                            }

                            .hidden-event {
                                display: none !important;
                            }

                            .attendance-calendar .fc .is-readonly-event {
                                cursor: default !important;
                                opacity: 0.82;
                            }

                            .attendance-calendar .fc .daily-summary-event {
                                background: transparent !important;
                                border: none !important;
                                box-shadow: none !important;
                            }
                            .attendance-calendar .fc .daily-summary-event .attendance-calendar-event-label {
                                color: var(--primary) !important;
                                font-weight: 800;
                                font-size: 0.8rem;
                            }
                            .attendance-calendar .fc .daily-summary-event .attendance-calendar-event-dot {
                                display: none !important;
                            }
                            .attendance-calendar .fc .daily-summary-event:hover {
                                background: rgba(0,0,0,0.02) !important;
                            }

                            .attendance-calendar .fc .has-conflict {
                                border: 2px solid #ef4444 !important;
                                animation: pulse-border 2s infinite;
                            }
                            @keyframes pulse-border {
                                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
                                70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                            }
                        `}</style>

                <DayClickModal
                    open={isDayClickModalOpen}
                    onOpenChange={setIsDayClickModalOpen}
                    onSelectOption={handleOptionSelect}
                    date={selectedDate}
                    canRequestAbsence={canRequestAbsence}
                />

                <CreateEventModal
                    open={isCreateEventModalOpen}
                    onOpenChange={setIsCreateEventModalOpen}
                    date={selectedDate}
                    event={selectedEvent}
                    onCreated={handleEventCreated}
                    manageableInterns={manageableInterns}
                />
            </CardContent>
        </Card>
    );
}
