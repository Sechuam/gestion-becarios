import { formatDateEs } from '@/lib/date-format';
import { getTaskStatusLabel } from '@/lib/task-labels';

type TaskFilterChip = {
    key: string;
    label: string;
};

export const buildActiveTaskFilterChips = ({
    filters,
    interns,
    practiceTypes,
}: {
    filters: any;
    interns: Array<{ id: number; name: string }>;
    practiceTypes: any[];
}): TaskFilterChip[] => {
    const chips: TaskFilterChip[] = [];

    if (filters.search) {
        chips.push({ key: 'search', label: `Buscar: ${filters.search}` });
    }

    if (filters.status) {
        chips.push({
            key: 'status',
            label: `Estado: ${getTaskStatusLabel(filters.status)}`,
        });
    }

    if (filters.delivery_status) {
        const labels: Record<string, string> = {
            completed_ontime: 'Completada',
            late: 'Tarde',
            not_delivered: 'No entregada',
            soon: 'Pronto',
        };
        chips.push({
            key: 'delivery_status',
            label: `Entrega: ${
                labels[filters.delivery_status] || filters.delivery_status
            }`,
        });
    }

    if (filters.practice_type) {
        const typeName = practiceTypes.find(
            (type: any) => String(type.id) === String(filters.practice_type),
        )?.name;

        if (typeName) {
            chips.push({
                key: 'practice_type',
                label: `Tipo: ${typeName}`,
            });
        }
    }

    if (filters.intern_id) {
        const internName = interns.find(
            (intern) => String(intern.id) === String(filters.intern_id),
        )?.name;

        if (internName) {
            chips.push({
                key: 'intern_id',
                label: `Becario: ${internName}`,
            });
        }
    }

    if (filters.due_from) {
        chips.push({
            key: 'due_from',
            label: `Desde: ${formatDateEs(filters.due_from)}`,
        });
    }

    if (filters.due_to) {
        chips.push({
            key: 'due_to',
            label: `Hasta: ${formatDateEs(filters.due_to)}`,
        });
    }

    return chips;
};
