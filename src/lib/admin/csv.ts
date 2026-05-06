/**
 * CSV serialisation for admin exports. RFC 4180 basics — quote every
 * field, double any quotes inside, CRLF terminators. Keeps Excel and
 * Sheets happy.
 */

export function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return '""';
    const str =
      typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const header = columns.map((c) => escape(c)).join(',');
  const body = rows.map((row) =>
    columns.map((col) => escape(row[col])).join(',')
  );

  return [header, ...body].join('\r\n') + '\r\n';
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
