export function recentLabelFromDate(updatedAt?: string): string | null {
    if (!updatedAt) return null;
    const updated = new Date(updatedAt);
    if (Number.isNaN(updated.getTime())) return null;
    const diffMs = Date.now() - updated.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays <= 1) return 'Actualizado hoy';
    if (diffDays <= 7) return 'Actualizado esta semana';
    return null;
}
