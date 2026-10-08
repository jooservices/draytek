// Fetches the latest firmware version per device folder from the official firmware server
// and writes data/firmware.json. Failed lookups keep the previous value.
// Usage: npm run update:firmware [-- --only=v2928,ap962c] [-- --dry]
import fs from 'node:fs';
import path from 'node:path';
import { fetchText } from './lib/http.mjs';

const BASE = 'https://fw.draytek.com.tw';
const OUT = 'data/firmware.json';
const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const dry = args.includes('--dry');

const devices = fs.readdirSync('data/devices').map((f) => JSON.parse(fs.readFileSync(path.join('data/devices', f), 'utf8')));
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { items: {} };

// folder (as used in the URL) -> device ids
const folders = new Map();
for (const d of devices) {
  if (!d.fw || (only.length && !only.includes(d.id))) continue;
  if (!folders.has(d.fw)) folders.set(d.fw, []);
  folders.get(d.fw).push(d.id);
}

const verOf = (s) => (s.match(/(\d+(?:\.\d+)+)/) || [])[1];
const cmpVer = (a, b) => {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};

function parseListing(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  const out = [];
  for (const m of text.matchAll(/(\S+)\s+(\d{4}-\d{2}-\d{2}) \d{2}:\d{2}/g)) out.push({ name: m[1], date: m[2] });
  return out;
}

const items = { ...prev.items };
const errors = [];
for (const [folder, ids] of folders) {
  const url = `${BASE}/${folder}/Firmware/`;
  try {
    const listing = await fetchText(url);
    if (listing.status !== 200) { errors.push(`${folder}: listing HTTP ${listing.status}`); continue; }
    const entries = parseListing(listing.text);
    let version, stable;
    if (entries.some((e) => e.name === 'latest.txt')) {
      const r = await fetchText(`${url}latest.txt`);
      version = verOf(r.text.trim());
    }
    if (entries.some((e) => e.name === 'latest_stable.txt')) {
      const r = await fetchText(`${url}latest_stable.txt`);
      stable = verOf(r.text.trim());
    }
    const dated = entries.filter((e) => verOf(e.name) && !/^latest/.test(e.name));
    if (!version && dated.length) version = dated.map((e) => verOf(e.name)).sort(cmpVer).pop();
    if (!version) { errors.push(`${folder}: no version found`); continue; }
    const hit = dated.filter((e) => verOf(e.name) === version).sort((a, b) => a.date.localeCompare(b.date)).pop();
    items[folder] = {
      ids, version, ...(stable && stable !== version ? { stable } : {}),
      date: hit?.date ?? null,
      url: `${url}${hit && hit.name.endsWith('/') ? hit.name : ''}`,
    };
    console.log(`${folder.padEnd(22)} ${version}${stable && stable !== version ? ` (stable ${stable})` : ''} ${hit?.date ?? ''}`);
  } catch (e) {
    errors.push(e.message);
  }
}

// Report changes against previous snapshot and against the curated device data.
const changes = [];
for (const [folder, it] of Object.entries(items)) {
  const before = prev.items?.[folder]?.version;
  if (before && before !== it.version) changes.push(`${folder}: ${before} -> ${it.version}`);
}
const result = { checked: new Date().toISOString(), source: BASE, items };
const unchanged = JSON.stringify(prev.items) === JSON.stringify(items);
if (!dry && !unchanged) fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
console.log(`\n${folders.size} folders checked, ${changes.length} changed, ${errors.length} errors${dry ? ' (dry run, nothing written)' : ''}`);
for (const c of changes) console.log('  changed:', c);
for (const e of errors) console.error('  error:', e);
if (errors.length && errors.length === folders.size) process.exit(1);
