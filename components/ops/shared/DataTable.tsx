import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableColumn<Row> = {
  key: string;
  header: ReactNode;
  className?: string;
  render: (row: Row) => ReactNode;
};

export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  emptyState,
  className,
}: {
  rows: Row[];
  columns: Array<DataTableColumn<Row>>;
  rowKey: (row: Row) => string;
  emptyState?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("whitespace-nowrap px-4 py-3", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={rowKey(row)} className="align-top transition hover:bg-slate-50/70">
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3 text-slate-700", column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  {emptyState ?? "No records match the current filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
