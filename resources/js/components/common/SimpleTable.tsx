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
        <div className="app-panel w-full overflow-hidden rounded-xl border border-sidebar/15 shadow-xl">
            <div className="h-1 bg-gradient-to-r from-sidebar to-[#1f4f52]" />
            <div className="w-full overflow-x-auto">
                <Table className="w-full min-w-[920px] text-left text-sm">
                    <TableHeader>
                        <TableRow className="border-b border-slate-400 bg-slate-200 text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.label}
                                    className={`px-4 py-3 text-left text-[10px] font-black tracking-widest text-slate-700 uppercase dark:text-slate-100 ${col.headClassName ?? ''}`}
                                >
                                    {col.sortKey && onSort ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSort(col.sortKey as string)
                                            }
                                            className="inline-flex items-center gap-1 tracking-widest text-slate-700 uppercase hover:text-slate-950 dark:text-slate-100 dark:hover:text-white"
                                        >
                                            <span>{col.label}</span>
                                            {sortKey === col.sortKey ? (
                                                sortDirection === 'desc' ? (
                                                    <ChevronDown className="h-3 w-3 text-slate-700 dark:text-slate-100" />
                                                ) : (
                                                    <ChevronUp className="h-3 w-3 text-slate-700 dark:text-slate-100" />
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
                                    className={`border-b border-sidebar/10 transition-colors hover:bg-accent/35 ${
                                        striped && index % 2 !== 0
                                            ? 'bg-muted/45 dark:bg-sidebar/10'
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
