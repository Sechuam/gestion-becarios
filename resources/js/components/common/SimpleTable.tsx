import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Column<T> = {
    key: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
    cellClassName?: string;
    headClassName?: string;
    sortKey?: string;
};

type SimpleTableProps<T> = {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (key: string) => void;
    emptyTitle?: string;
    emptyDescription?: string;
};

export function SimpleTable<T>({
    columns,
    rows,
    rowKey,
    sortKey,
    sortDirection = 'asc',
    onSort,
    emptyTitle = 'No hay datos disponibles',
    emptyDescription = 'Ajusta los filtros o crea un nuevo registro para empezar.',
}: SimpleTableProps<T>) {
    return (
        <div className="app-panel w-full overflow-hidden">
            <div className="w-full overflow-x-auto">
                <Table className="w-full min-w-[900px] text-left text-sm">
                    <TableHeader>
                        <TableRow className="border-b border-b-border bg-muted dark:border-slate-700/70 dark:bg-slate-800/70">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.label}
                                    className={`px-4 py-4 text-left font-semibold text-foreground ${col.headClassName ?? ''}`}
                                >
                                    {col.sortKey && onSort ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSort(col.sortKey as string)
                                            }
                                            className="inline-flex items-center gap-1 hover:text-foreground"
                                        >
                                            <span>{col.label}</span>
                                            {sortKey === col.sortKey ? (
                                                sortDirection === 'desc' ? (
                                                    <ChevronDown className="h-4 w-4 text-foreground" />
                                                ) : (
                                                    <ChevronUp className="h-4 w-4 text-foreground" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="h-4 w-4 text-muted-foreground/70" />
                                            )}
                                        </button>
                                    ) : (
                                        col.label
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length > 0 ? (
                            rows.map((row) => (
                                <TableRow
                                    key={rowKey(row)}
                                    className="border-b border-border transition-colors hover:bg-muted/35"
                                >
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.label}
                                            className={`${
                                                col.cellClassName ??
                                                'text-muted-foreground'
                                            }`}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : (row as any)[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={columns.length}
                                    className="px-6 py-10"
                                >
                                    <div className="empty-state">
                                        <div className="empty-state-icon">
                                            <ArrowUpDown className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground">
                                                {emptyTitle}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {emptyDescription}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
