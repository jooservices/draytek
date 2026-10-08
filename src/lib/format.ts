import { L } from './data';
import type { Lang } from './types';

export const fmtMbps = (n: number) =>
  n >= 1000 ? (Math.round(n / 100) / 10).toString().replace(/\.0$/, '') + ' Gbps' : n + ' Mbps';
export const fmtK = (n: number) => (n >= 1000000 ? n / 1000000 + 'M' : n >= 1000 ? Math.round(n / 1000) + 'K' : String(n));

/** Plain-text value for a spec cell. Returns null when the value is not verified. */
export function fmtValue(v: any, unit: string | undefined, lang: Lang, yes: string, no: string): string | null {
  v = L(v, lang);
  if (v === undefined || v === null || v === '') return null;
  if (v === true) return yes;
  if (v === false) return no;
  if (typeof v === 'number') {
    if (unit === 'mbps') return fmtMbps(v);
    if (unit === 'k') return fmtK(v);
    if (unit === 'gbps') return v + ' Gbps';
    if (unit === 'w') return v + ' W';
    return String(v);
  }
  return String(v);
}
