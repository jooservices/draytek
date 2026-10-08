// Creates or updates the Draytek Confluence space pages from repository content.
// Usage: node --env-file=<env file> scripts/sync-confluence.mjs [--dry] [--only="Title"]
import { createHash } from 'node:crypto';
import { client, md } from './confluence/lib.mjs';
import { pages } from './confluence/pages.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).replace(/^"|"$/g, '');
const SPACE_KEY = 'JOODT';

const titles = new Set(pages.map((p) => p.title));
for (const p of pages) if (p.parent && !titles.has(p.parent)) throw new Error(`unknown parent "${p.parent}" for "${p.title}"`);

if (dry) {
  for (const p of pages) console.log(`${p.parent ? '  ' : ''}${p.title}  (${md(p.body()).length} chars)`);
  process.exit(0);
}

const c = client();
const space = await c.getSpace(SPACE_KEY);
if (!space) throw new Error(`space ${SPACE_KEY} not found`);
const ids = {};
let created = 0, updated = 0, same = 0;
for (const p of pages) {
  if (only && p.title !== only) { const ex = await c.findPage(space.id, p.title); if (ex) ids[p.title] = ex.id; continue; }
  const body = md(p.body());
  const message = `Sync ${createHash('sha256').update(body).digest('hex').slice(0, 16)}`;
  let page = p.parent === null ? await c.getPage(space.homepageId) : await c.findPage(space.id, p.title);
  if (page && p.parent === null) { page = await c.getPage(space.homepageId); }
  if (!page) {
    page = await c.createPage(space.id, p.title, ids[p.parent], body);
    created++;
  } else {
    // Confluence normalizes storage XML, so compare a hash of our source body kept in the version message.
    const full = await c.getPage(page.id);
    if (full.version.message === message && full.title === p.title) { same++; ids[p.title] = page.id; continue; }
    await c.updatePage(page.id, p.title, body, full.version.number + 1, message);
    updated++;
  }
  ids[p.title] = page.id;
  if (p.labels?.length) await c.addLabels(page.id, p.labels).catch((e) => console.error(`labels ${p.title}: ${e.message}`));
  console.log(`${p.title} -> ${c.base}/wiki/spaces/${SPACE_KEY}/pages/${page.id}`);
}
console.log(`\ncreated ${created}, updated ${updated}, unchanged ${same}`);
