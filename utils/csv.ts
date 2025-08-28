export type CsvRow = Record<string, string>;

export function toCSV<T extends Record<string, any>>(rows: T[], headers?: string[]): string {
  if (!rows.length) return '';
  const cols = headers || Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const escape = (v: any) => {
    const s = v === undefined || v === null ? '' : String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const head = cols.join(',');
  const body = rows.map(r => cols.map(c => escape(r[c])).join(',')).join('\n');
  return head + '\n' + body;
}

export function fromCSV(csv: string): CsvRow[] {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((h, i) => row[h] = cells[i] ?? '');
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else {
        current += ch;
      }
    } else {
      if (ch === ',') { result.push(current); current = ''; }
      else if (ch === '"') { inQuotes = true; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}


