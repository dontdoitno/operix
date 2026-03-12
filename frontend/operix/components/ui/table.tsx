import { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface TableRow {
  key: string;
  cells: ReactNode[];
}

interface TableProps {
  headers: string[];
  rows: TableRow[];
  className?: string;
}

export function Table({ headers, rows, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-[#E5E7EB] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-[#F9FAFB]">
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={`${row.key}-${cellIndex}`}
                  className="border-b border-[#E5E7EB] px-4 py-4 text-sm text-[#1F2937]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
