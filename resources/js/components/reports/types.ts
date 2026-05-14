export type ReportDatasetConfig = {
    label: string;
    columns: Record<string, { heading: string }>;
};

export type ReportTemplate = {
    id: number;
    name: string;
    dataset: string;
    columns: string[];
    filters?: Record<string, string>;
    updated_at: string;
};

export type ReportsSummary = {
    interns: number;
    tasks: number;
    time_logs: number;
    evaluations: number;
};

export type ReportFormat = 'xlsx' | 'pdf';

export type ReportPreview = {
    rows: Record<string, string | number | null>[];
    columns: string[];
    availableColumns: Record<string, { heading: string }>;
    total: number;
};
