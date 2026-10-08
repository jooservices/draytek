// Builds display rows for a device's spec sheet, grouped by category.
import { L, sources, byId } from './data';
import { SPEC, KEY, KEYL } from './labels';
import { fmtValue } from './format';
import { T } from './i18n';
import type { Device, Lang } from './types';

const NV: Record<string, string[]> = {
  router: ['nat', 'sess', 'vpn', 'wanmax', 'wan', 'lan', 'ipsec', 'os', 'fwv'],
  ap: ['std', 'link', 'clients', 'ports'],
  switch: ['level', 'ports', 'poe', 'cap'],
  more: [],
};
const HWNV = ['h_pwr', 'h_cons', 'h_dim', 'h_wt', 'h_temp'];
const showNV = (d: Device, k: string) => (NV[d.cat] || []).includes(k) || (d.cat !== 'more' && HWNV.includes(k));

const SHORT: Record<string, string> = { db26: 'DB26', ds: 'DS', fwl: 'FW', ukr: 'UK', ukap: 'UK', uksw: 'UK', uklc: 'LC', ukp: 'UK', cve: 'CVE' };

export interface SrcRef { short: string; name: string; url?: string }
export interface Row { key: string; label: string; value: string | null; yes?: boolean; no?: boolean; src?: SrcRef }
export interface Group { id: string; label: string; rows: Row[] }

export function srcRef(d: Device, k: string, lang: Lang): SrcRef | undefined {
  const key = d.src?.[k];
  if (!key) return undefined;
  const s = sources[key];
  if (!s) return { short: key, name: key };
  const name = String(L(s.n, lang));
  const uk = d.hw?.uk as string | undefined;
  const url =
    key === 'ukp' && uk ? 'https://www.draytek.co.uk/products/' + uk
    : key === 'ds' && d.fw ? `https://fw.draytek.com.tw/${d.fw}/Document/`
    : key === 'fwl' && d.fw ? `https://fw.draytek.com.tw/${d.fw}/Firmware/`
    : s.u;
  return { short: SHORT[key] || key, name, url };
}

export function specGroups(d: Device, lang: Lang): Group[] {
  const t = T[lang];
  const i = lang === 'vi' ? 0 : 1;
  return (SPEC[d.cat] || []).map(([gid, gl, rows]: any) => {
    const out: Row[] = [];
    for (const [k, lab, unit] of rows) {
      const raw = d.s[k];
      const value = fmtValue(raw, unit, lang, t.yes, t.no);
      if (value == null && !showNV(d, k)) continue;
      out.push({ key: k, label: lab[i], value, yes: raw === true, no: raw === false, src: value == null ? undefined : srcRef(d, k, lang) });
    }
    return { id: gid, label: gl[i], rows: out };
  }).filter((g: Group) => g.rows.length);
}

export function keyStats(d: Device, lang: Lang): { label: string; value: string }[] {
  const t = T[lang];
  return (KEY[d.cat] || []).map(([k, lab, unit]: any) => ({
    label: lang === 'vi' ? (KEYL.vi[lab] || lab) : lab,
    value: fmtValue(d.s[k], unit, lang, t.yes, t.no) ?? '—',
  }));
}

export const docLinks = (d: Device, lang: Lang) => {
  const t = T[lang];
  const links: { label: string; url: string }[] = [];
  if (d.fw) {
    links.push({ label: t.dsLink, url: `https://fw.draytek.com.tw/${d.fw}/Document/` });
    links.push({ label: t.fwLink, url: `https://fw.draytek.com.tw/${d.fw}/Firmware/` });
  }
  const uk = d.hw?.uk as string | undefined;
  if (uk) links.push({ label: lang === 'vi' ? 'Trang thông số UK (phần cứng)' : 'UK spec page (hardware)', url: 'https://www.draytek.co.uk/products/' + uk });
  links.push({ label: 'Databook 2026', url: sources.db26.u! });
  links.push({ label: String(L(sources.uklc.n, lang)), url: sources.uklc.u! });
  return links;
};

export const related = (d: Device) => {
  const pointing = Object.values(byId).filter((x) => x.next === d.id && !(d.prev || []).includes(x.id));
  return {
    prev: ((d.prev as string[]) || []).map((p) => byId[p]).filter(Boolean),
    succ: d.next ? byId[d.next] : null,
    older: pointing.filter((x) => x.st !== 'cur'),
    smaller: pointing.filter((x) => x.st === 'cur'),
  };
};
