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
    striped?: boolean;
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
    striped = false,
}: SimpleTableProps<T>) {
    return (
        <div className="app-panel w-full overflow-hidden rounded-xl border border-sidebar/15 shadow-xl dark:border-[#2a4158] dark:bg-[#142235] dark:shadow-[0_24px_72px_-48px_rgba(0,0,0,0.95)]">
            <div className="h-1 bg-gradient-to-r from-sidebar to-sidebar-accent dark:from-[#9fc6bf] dark:to-[#5f9e95]" />
            <div className="w-full overflow-x-auto">
                <Table className="w-full min-w-[920px] text-left text-sm">
                    <TableHeader>
                        <TableRow className="border-b border-slate-400 bg-slate-200 text-slate-700 hover:bg-slate-200 dark:border-[#2f4a62] dark:bg-[#1b2d42] dark:text-[#edf1f5]">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.label}
                                    className={`px-4 py-3 text-left text-[10px] font-black tracking-widest text-slate-700 uppercase dark:text-[#d8e4ef] ${col.headClassName ?? ''}`}
                                >
                                    {col.sortKey && onSort ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSort(col.sortKey as string)
                                            }
                                            className="inline-flex items-center gap-1 tracking-widest text-slate-700 uppercase hover:text-slate-950 dark:text-[#d8e4ef] dark:hover:text-white"
                                        >
                                            <span>{col.label}</span>
                                            {sortKey === col.sortKey ? (
                                                sortDirection === 'desc' ? (
                                                    <ChevronDown className="h-3 w-3 text-slate-700 dark:text-[#d8e4ef]" />
                                                ) : (
                                                    <ChevronUp className="h-3 w-3 text-slate-700 dark:text-[#d8e4ef]" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400" />
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
                            rows.map((row, index) => (
                                <TableRow
                                    key={rowKey(row)}
                                    className={`border-b border-sidebar/10 transition-colors hover:bg-accent/35 dark:border-[#203548] dark:hover:bg-[#1d3148] ${
                                        striped && index % 2 !== 0
                                            ? 'bg-muted/45 dark:bg-[#17283c]/70'
                                            : ''
                                    }`}
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
