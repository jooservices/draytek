// Fetches the security advisory index from DrayTek UK and writes data/advisories-feed.json.
// Usage: npm run update:advisories [-- --dry]
import fs from 'node:fs';
import { fetchText } from './lib/http.mjs';

const BASE = 'https://www.draytek.co.uk';
const OUT = 'data/advisories-feed.json';
const dry = process.argv.includes('--dry');

const page = await fetchText(`${BASE}/support/security-advisories`);
if (page.status !== 200) { console.error(`advisory page HTTP ${page.status}`); process.exit(1); }

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–');
const items = [];
for (const m of page.text.matchAll(/<li><a href=['"]([^'"]+)['"]>\s*(\d{2})\/(\d{2})\/(\d{4})\s*-\s*([^<]+)<\/a><\/li>/g)) {
  const [, href, dd, mm, yyyy, rawTitle] = m;
  const title = decode(rawTitle).replace(/^Security Advisory:\s*/i, '').trim();
  const cves = [...new Set((decode(rawTitle) + ' ' + href).match(/CVE-\d{4}-\d{4,7}/gi) || [])].map((c) => c.toUpperCase());
  items.push({
    date: `${yyyy}-${mm}-${dd}`,
    title,
    cves,
    url: href.startsWith('http') ? href : BASE + href,
    families: ['VigorAP', 'VigorSwitch', 'Vigor3900', 'Vigor2960', 'Vigor300B', 'Vigor3910', 'Vigor2962'].filter((f) => new RegExp(f.replace('Vigor', 'Vigor ?'), 'i').test(title)),
  });
}
if (!items.length) { console.error('no advisories parsed (page layout changed?)'); process.exit(1); }
items.sort((a, b) => b.date.localeCompare(a.date));

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { items: [] };
const known = new Set(prev.items.map((i) => i.url));
const fresh = items.filter((i) => !known.has(i.url));
const unchanged = JSON.stringify(prev.items) === JSON.stringify(items);
if (!dry && !unchanged) fs.writeFileSync(OUT, JSON.stringify({ checked: new Date().toISOString(), source: `${BASE}/support/security-advisories`, items }, null, 2) + '\n');
console.log(`${items.length} advisories, ${fresh.length} new${dry ? ' (dry run)' : ''}`);
for (const f of fresh.slice(0, 10)) console.log(`  new: ${f.date} ${f.title}`);
