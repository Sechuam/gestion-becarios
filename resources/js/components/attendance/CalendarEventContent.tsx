import type { EventContentArg } from '@fullcalendar/core';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function CalendarEventContent({
    eventInfo,
}: {
    eventInfo: EventContentArg;
}) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="attendance-calendar-event-content">
                        <span
                            className="attendance-calendar-event-dot"
                            style={{
                                backgroundColor:
                                    eventInfo.event.backgroundColor,
                            }}
                        />
                        <span className="attendance-calendar-event-label">
                            {eventInfo.timeText ? `${eventInfo.timeText} ` : ''}
                            {eventInfo.event.title}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="flex max-w-[200px] flex-col gap-1 p-2"
                >
                    <p className="font-semibold">{eventInfo.event.title}</p>
                    {eventInfo.timeText && (
                        <p className="text-xs opacity-90">
                            {eventInfo.timeText}
                        </p>
                    )}
                    {eventInfo.event.extendedProps.description && (
                        <p className="mt-1 border-t border-white/20 pt-1 text-[10px] italic">
                            {eventInfo.event.extendedProps.description}
                        </p>
                    )}
                    {eventInfo.event.extendedProps.creator && (
                        <p className="mt-1 border-t border-white/10 pt-1 text-[9px] font-bold tracking-wider uppercase opacity-70">
                            De: {eventInfo.event.extendedProps.creator}
                        </p>
                    )}
                    {eventInfo.event.extendedProps.isPersonal &&
                        !eventInfo.event.extendedProps.canEdit && (
                            <p className="mt-1 border-t border-white/10 pt-1 text-[9px] font-bold tracking-wider uppercase opacity-70">
                                Solo lectura
                            </p>
                        )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
