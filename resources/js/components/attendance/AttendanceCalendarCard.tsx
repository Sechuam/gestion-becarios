import { useState, useRef } from 'react';
import axios from 'axios';
import type { EventContentArg, EventMountArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent } from '@/components/ui/card';
import { DayClickModal } from './DayClickModal';
import { CreateEventModal } from './CreateEventModal';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const renderCalendarEvent = (eventInfo: EventContentArg) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="attendance-calendar-event-content">
                    <span
                        className="attendance-calendar-event-dot"
                        style={{ backgroundColor: eventInfo.event.backgroundColor }}
                    />
                    <span className="attendance-calendar-event-label">
                        {eventInfo.timeText ? `${eventInfo.timeText} ` : ''}
                        {eventInfo.event.title}
                    </span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex flex-col gap-1 p-2 max-w-[200px]">
                <p className="font-semibold">{eventInfo.event.title}</p>
                {eventInfo.timeText && (
                    <p className="text-xs opacity-90">{eventInfo.timeText}</p>
                )}
                {eventInfo.event.extendedProps.description && (
                    <p className="text-[10px] italic border-t border-white/20 pt-1 mt-1">
                        {eventInfo.event.extendedProps.description}
                    </p>
                )}
                {eventInfo.event.extendedProps.creator && (
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-70 border-t border-white/10 pt-1 mt-1">
                        De: {eventInfo.event.extendedProps.creator}
                    </p>
                )}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export function AttendanceCalendarCard({
    canManageAttendance = false,
    manageableInterns = [],
}: {
    canManageAttendance?: boolean;
    manageableInterns?: any[];
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
                <div className="mb-4 flex items-center justify-end gap-4 px-2 pt-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <input 
                            type="checkbox" 
                            checked={showJornadas} 
                            onChange={e => setShowJornadas(e.target.checked)} 
                            className="rounded border-slate-300 text-primary focus:ring-primary" 
                        />
                        Mostrar Jornadas
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <input 
                            type="checkbox" 
                            checked={showAbsences} 
                            onChange={e => setShowAbsences(e.target.checked)} 
                            className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" 
                        />
                        Mostrar Ausencias
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <input 
                            type="checkbox" 
                            checked={showPersonalEvents} 
                            onChange={e => setShowPersonalEvents(e.target.checked)} 
                            className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" 
                        />
                        Mis Eventos
                    </label>
                </div>
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
                        contentHeight={500}
                        fixedWeekCount
                        expandRows
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
                            } catch (e) {
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
                            } catch (e) {
                                info.revert();
                            }
                        }}
                        dateClick={(arg) => {
                            setSelectedDate(arg.dateStr);
                            setIsDayClickModalOpen(true);
                        }}
                        eventClick={(info) => {
                            if (info.event.extendedProps.isPersonal) {
                                setSelectedEvent(info.event);
                                setIsCreateEventModalOpen(true);
                            }
                        }}
                        eventClassNames={(arg) => {
                            let classes = [
                                'attendance-calendar-event',
                                ...(arg.event.classNames || []),
                            ];
                            if (!showJornadas && classes.includes('is-jornada')) classes.push('hidden-event');
                            if (!showAbsences && classes.includes('is-absence')) classes.push('hidden-event');
                            if (!showJornadas && classes.includes('daily-summary-event')) classes.push('hidden-event');
                            if (!showPersonalEvents && classes.includes('is-personal-event')) classes.push('hidden-event');
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
                                font-size: 1.1rem !important;
                                font-weight: 800 !important;
                                color: var(--sidebar);
                                text-transform: capitalize;
                                background: white;
                                padding: 6px 20px;
                                border-radius: 99px;
                                border: 1px solid rgba(0,0,0,0.05);
                                box-shadow: 0 2px 10px rgba(0,0,0,0.04);
                            }
                            .dark .attendance-calendar .fc .fc-toolbar-title {
                                background: var(--sidebar);
                                color: white;
                                border: 1px solid rgba(255,255,255,0.05);
                            }

                            .attendance-calendar .fc .fc-popover {
                                z-index: 9999 !important;
                                background-color: var(--card) !important;
                                opacity: 1 !important;
                            }
                            .attendance-calendar .fc-theme-standard .fc-popover {
                                background: var(--card) !important;
                            }

                            .attendance-calendar .fc .fc-timegrid-event.is-jornada,
                            .attendance-calendar .fc .fc-daygrid-event.is-jornada {
                                background: linear-gradient(135deg, var(--sidebar) 0%, #1f4f52 100%) !important;
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
                                background: linear-gradient(135deg, var(--sidebar) 0%, #1f4f52 100%) !important;
                                padding: 6px 16px !important;
                                border: none !important;
                            }
                            .dark .attendance-calendar .fc .fc-list-day-cushion {
                                background: linear-gradient(135deg, var(--sidebar) 0%, #1f4f52 100%) !important;
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
                                color: #1f4f52; /* Color corporativo */
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
