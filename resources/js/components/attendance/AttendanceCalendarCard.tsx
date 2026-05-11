import type { EventContentArg, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Card, CardContent } from '@/components/ui/card';

const renderCalendarEvent = (eventInfo: EventContentArg) => (
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
);

const attachEventTooltip = (eventInfo: EventMountArg) => {
    const tooltip = [eventInfo.timeText, eventInfo.event.title]
        .filter(Boolean)
        .join(' · ');

    eventInfo.el.setAttribute('title', tooltip || eventInfo.event.title);
};

export function AttendanceCalendarCard() {
    return (
        <Card className="overflow-hidden rounded-xl border-sidebar/10 bg-white p-2 shadow-lg dark:bg-slate-900">
            <CardContent className="p-0">
                <div className="attendance-calendar rounded-lg border border-sidebar/10 bg-slate-50/50 p-2 shadow-inner transition-all dark:bg-slate-800/50">
                    <FullCalendar
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek',
                        }}
                        events="/time-logs/events"
                        locale="es"
                        firstDay={1}
                        contentHeight={500}
                        fixedWeekCount
                        expandRows
                        dayMaxEventRows={3}
                        moreLinkClick="popover"
                        eventClassNames={() => ['attendance-calendar-event']}
                        eventContent={renderCalendarEvent}
                        eventDidMount={attachEventTooltip}
                        buttonText={{
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Semana',
                            day: 'Día',
                        }}
                    />
                </div>
                <style>{`
                            .attendance-calendar .fc .fc-button {
                                background: linear-gradient(90deg, var(--sidebar) 0%, #1f4f52 100%);
                                border-color: transparent;
                                color: white;
                                box-shadow: 0 8px 24px rgba(31, 79, 82, 0.18);
                            }

                            .attendance-calendar .fc .fc-button:hover,
                            .attendance-calendar .fc .fc-button:focus {
                                opacity: 0.95;
                                box-shadow: 0 10px 28px rgba(31, 79, 82, 0.24);
                            }

                            .attendance-calendar .fc .fc-button:disabled {
                                opacity: 0.55;
                                box-shadow: none;
                            }

                            .attendance-calendar .fc .fc-button-primary:not(:disabled).fc-button-active,
                            .attendance-calendar .fc .fc-button-primary:not(:disabled):active {
                                background: linear-gradient(90deg, #163c42 0%, #1f4f52 100%);
                                border-color: transparent;
                            }
                        `}</style>
            </CardContent>
        </Card>
    );
}
