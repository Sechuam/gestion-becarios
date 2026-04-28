export const evaluationTypeLabels: Record<string, string> = {
    weekly: 'Semanal',
    monthly: 'Mensual',
    final: 'Final',
    self: 'Autoevaluación',
};

export function getEvaluationTypeLabel(type: string): string {
    return evaluationTypeLabels[type] ?? type;
}
