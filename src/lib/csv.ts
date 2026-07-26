/**
 * CSV export helper.
 *
 * Why a custom helper instead of a library?
 *  - The CSV format is simple enough that pulling in a dependency
 *    would be overkill for this interview task.
 *  - Writing it ourselves lets us properly escape commas, quotes
 *    and newlines, which many tutorials skip.
 */

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // RFC 4180: if the value contains a comma, quote, or newline, wrap in quotes
  // and double any existing quotes.
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsvCell(row[c.key])).join(',')
    )
    .join('\n');
  return `${header}\n${body}`;
}

/**
 * Triggers a browser download for a given text payload.
 * Uses Blob + object URL so we don't have to encode the data URI manually.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Free the object URL to avoid leaking memory.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
