import { parse } from 'csv-parse/sync';

type Row = { address: string; amountHuman: string };
export function parseRecipientsCsv(csv: string): Row[] {
  const rec = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  return rec.map((r: any) => ({ address: r.address, amountHuman: r.amount }));
}
