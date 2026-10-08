// Static data access. All device data lives in /data (one JSON file per device).
import type { Device, Use, ImageEntry, Lang, Bi } from './types';

const deviceFiles = import.meta.glob('../../data/devices/*.json', { eager: true, import: 'default' }) as Record<string, Device>;
const order = ['router', 'ap', 'switch', 'more'];

import firmwareJson from '../../data/firmware.json';
import feedJson from '../../data/advisories-feed.json';

export interface FirmwareItem { ids: string[]; version: string; stable?: string; date: string | null; url: string }
export const firmware = firmwareJson as { checked: string; source: string; items: Record<string, FirmwareItem> };
export interface FeedItem { date: string; title: string; cves: string[]; url: string; families: string[] }
export const advisoryFeed = feedJson as { checked: string; source: string; items: FeedItem[] };

// Latest firmware fetched by `npm run update:firmware` overrides the curated version.
const fwByDevice: Record<string, FirmwareItem> = {};
for (const it of Object.values(firmware.items)) for (const id of it.ids) fwByDevice[id] = it;
export const firmwareOf = (id: string) => fwByDevice[id] ?? null;

// Merge hardware profile (hw) into spec values as h_* keys, sourced from the UK spec page.
for (const d of Object.values(deviceFiles)) {
  d.src = { ...(d.src || {}) };
  d.s = { ...d.s };
  const fwi = fwByDevice[d.id];
  if (fwi) {
    d.s.fwv = fwi.version;
    d.src.fwv = 'fwl';
    if (fwi.date) d.s.fwdate = fwi.date;
  }
  for (const [k, v] of Object.entries(d.hw || {})) {
    if (k === 'uk') continue;
    d.s['h_' + k] = v;
    d.src['h_' + k] = 'ukp';
  }
}

export const devices: Device[] = Object.values(deviceFiles).sort(
  (a, b) => order.indexOf(a.cat) - order.indexOf(b.cat) || a.m.localeCompare(b.m, 'en', { numeric: true }),
);

export const byId: Record<string, Device> = Object.fromEntries(devices.map((d) => [d.id, d]));

import usesJson from '../../data/uses.json';
import imagesJson from '../../data/images.json';
import sourcesJson from '../../data/sources.json';
import advisoryJson from '../../data/advisories.json';

export const uses = usesJson as Use[];
export const useById: Record<string, Use> = Object.fromEntries(uses.map((u) => [u.id, u]));
export const images = imagesJson as Record<string, ImageEntry>;
export const sources = sourcesJson as Record<string, { n: string | Bi; u?: string }>;
export const advisory = advisoryJson as { id: string; v: string; e: string };

export const TODAY = '2026-10-08';

/** Pick the string for a language from a bilingual value. */
export function L<T>(x: T | Bi | undefined, lang: Lang): any {
  if (x && typeof x === 'object' && !Array.isArray(x) && ('v' in (x as object) || 'e' in (x as object))) {
    return lang === 'vi' ? (x as Bi).v : (x as Bi).e;
  }
  return x;
}

export function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

export function status(d: Device): 'cur' | 'old' | 'eos' | 'dead' {
  if (d.st === 'eos' && d.eol && d.eol <= TODAY) return 'dead';
  return d.st;
}

/** Image URL for a device (relative to site base), or null. */
export function imageOf(id: string): ImageEntry | null {
  return images[id] ?? null;
}
