import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  cellClassName?: string;
  sortKey?: string;
};

type SimpleTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
};

export function SimpleTable<T>({
  columns,
  rows,
  rowKey,
  sortKey,
  sortDirection = "asc",
  onSort,
}: SimpleTableProps<T>) {
  return (
    <div className="w-full rounded-xl border bg-card border-border dark:border-slate-700/70 dark:bg-slate-900/60 shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[900px] w-full text-sm text-left">
          <TableHeader>
            <TableRow className="border-b bg-muted border-b-border dark:border-slate-700/70 dark:bg-slate-800/70">
              {columns.map((col) => (
                <TableHead
                  key={col.label}
                  className="px-4 py-4 text-left font-semibold text-foreground"
                >
                  {col.sortKey && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.sortKey as string)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <span>{col.label}</span>
                      {sortKey === col.sortKey ? (
                        sortDirection === "desc" ? (
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
            {rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                className="border-b border-border dark:border-slate-700/70 hover:bg-muted/60 dark:hover:bg-slate-800/50 transition-colors"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.label}
                    className={`px-4 py-4 ${
                      col.cellClassName ?? "text-muted-foreground"
                    }`}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
