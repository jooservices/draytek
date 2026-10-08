// Reads repository data for generated Confluence pages (English values only).
import fs from 'node:fs';
import path from 'node:path';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const en = (x) => (x && typeof x === 'object' && !Array.isArray(x) && 'e' in x ? x.e : x);

export const fmtMbps = (n) => (n >= 1000 ? (Math.round(n / 100) / 10).toString().replace(/\.0$/, '') + ' Gbps' : n + ' Mbps');
export const fmtK = (n) => (n >= 1000000 ? n / 1000000 + 'M' : n >= 1000 ? Math.round(n / 1000) + 'K' : String(n));
export const val = (v, unit) => {
  v = en(v);
  if (v === undefined || v === null || v === '') return 'not verified';
  if (v === true) return 'yes';
  if (v === false) return 'no';
  if (typeof v === 'number') return unit === 'mbps' ? fmtMbps(v) : unit === 'k' ? fmtK(v) : unit === 'w' ? v + ' W' : String(v);
  return String(v).replace(/\|/g, '/');
};

export function loadData() {
  const firmware = readJson('data/firmware.json');
  const fwBy = {};
  for (const it of Object.values(firmware.items)) for (const id of it.ids) fwBy[id] = it;
  const devices = fs.readdirSync('data/devices').map((f) => readJson(path.join('data/devices', f)));
  for (const d of devices) {
    const f = fwBy[d.id];
    d.s = { ...d.s };
    if (f) { d.s.fwv = f.version; d.s.fwdate = f.date; }
  }
  const order = ['router', 'ap', 'switch', 'more'];
  devices.sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat) || a.m.localeCompare(b.m, 'en', { numeric: true }));
  return {
    devices,
    byId: Object.fromEntries(devices.map((d) => [d.id, d])),
    firmware,
    feed: readJson('data/advisories-feed.json'),
    advisory: readJson('data/advisories.json'),
    guides: readJson('data/guides.json'),
    sources: readJson('data/sources.json'),
    images: readJson('data/images.json'),
    noImage: readJson('data/no-image.json'),
    uses: readJson('data/uses.json'),
    en,
  };
}
