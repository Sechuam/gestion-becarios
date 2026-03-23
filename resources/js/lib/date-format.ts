const isDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const toDate = (value: string) => {
    if (isDateOnly(value)) {
        return new Date(`${value}T00:00:00`);
    }
    return new Date(value);
};

export const formatDateEs = (value?: string | null) => {
    if (!value) return '—';
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatDateTimeEs = (value?: string | null) => {
    if (!value) return '—';
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
