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
        <div className="app-panel w-full overflow-hidden border-2 border-sidebar/15 shadow-xl">
            <div className="w-full overflow-x-auto">
                <Table className="w-full min-w-[900px] text-left text-sm">
                    <TableHeader>
                        <TableRow 
                            className="border-b-2 border-white/20 bg-gradient-to-r from-sidebar to-[#1f4f52] text-sidebar-foreground hover:opacity-100"
                        >
                            {columns.map((col) => (
                                <TableHead
                                    key={col.label}
                                    className={`px-3 py-2 text-left font-black uppercase tracking-widest text-[10px] text-sidebar-foreground ${col.headClassName ?? ''}`}
                                >
                                    {col.sortKey && onSort ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSort(col.sortKey as string)
                                            }
                                            className="inline-flex items-center gap-1 text-sidebar-foreground/95 hover:text-sidebar-foreground uppercase font-black tracking-widest"
                                        >
                                            <span>{col.label}</span>
                                            {sortKey === col.sortKey ? (
                                                sortDirection === 'desc' ? (
                                                    <ChevronDown className="h-3 w-3 text-sidebar-foreground" />
                                                ) : (
                                                    <ChevronUp className="h-3 w-3 text-sidebar-foreground" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-sidebar-foreground/60" />
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
                                    className={`border-b border-sidebar/10 transition-colors hover:bg-muted/35 ${
                                        striped && index % 2 !== 0
                                            ? 'bg-sidebar/5 dark:bg-sidebar/10'
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
