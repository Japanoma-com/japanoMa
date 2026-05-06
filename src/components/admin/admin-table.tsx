import type { ReactNode } from 'react';

/**
 * Shared table primitive for admin data surfaces — consistent styling,
 * empty state, and overflow handling across Leads, Content, Areas,
 * Taxonomy views.
 */

type Column<T> = {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T, index: number) => ReactNode;
};

export function AdminTable<T>({
  rows,
  columns,
  emptyMessage,
  rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  emptyMessage: string;
  rowKey: (row: T, index: number) => string;
}) {
  return (
    <div className="bg-shoji border border-border rounded-lg overflow-x-auto">
      {rows.length === 0 ? (
        <p className="p-ma-8 text-sm text-stone">{emptyMessage}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border bg-washi/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-ma-4 py-ma-3 label-overline text-stone"
                  style={{
                    width: col.width,
                    textAlign: col.align ?? 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                className="border-b border-border last:border-0 hover:bg-washi/40 align-top"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-ma-4 py-ma-3"
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
