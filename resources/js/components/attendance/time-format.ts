const pad = (value: number) => String(value).padStart(2, '0');

export const formatElapsed = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const getElapsedSeconds = (
    clockIn: string,
    currentDate = new Date(),
) => {
    const [hours, minutes, seconds] = clockIn.split(':').map(Number);

    const start = new Date(currentDate);
    start.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0, 0);

    return Math.floor((currentDate.getTime() - start.getTime()) / 1000);
};

export const formatHoursDecimal = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (wholeHours === 0) {
        return `${minutes}m`;
    }

    if (minutes === 0) {
        return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}m`;
};
