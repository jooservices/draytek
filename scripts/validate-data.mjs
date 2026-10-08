// Validates data/devices/*.json: required fields, unique ids, valid references. Run: npm run validate:data
import fs from 'node:fs';
import path from 'node:path';

const dir = 'data/devices';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
const devices = files.map((f) => ({ f, d: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
const ids = new Set(devices.map((x) => x.d.id));
const uses = new Set(JSON.parse(fs.readFileSync('data/uses.json', 'utf8')).map((u) => u.id));
const sources = JSON.parse(fs.readFileSync('data/sources.json', 'utf8'));
const images = fs.existsSync('data/images.json') ? JSON.parse(fs.readFileSync('data/images.json', 'utf8')) : {};
const errors = [];
const err = (f, m) => errors.push(`${f}: ${m}`);

for (const { f, d } of devices) {
  if (f !== `${d.id}.json`) err(f, `file name must match id "${d.id}"`);
  for (const k of ['id', 'cat', 'm', 'st', 't', 's']) if (d[k] === undefined) err(f, `missing "${k}"`);
  if (!['router', 'ap', 'switch', 'more'].includes(d.cat)) err(f, `bad cat "${d.cat}"`);
  if (!['cur', 'old', 'eos'].includes(d.st)) err(f, `bad st "${d.st}"`);
  if (d.t && (!d.t.v || !d.t.e)) err(f, 't needs v and e');
  for (const u of d.uses || []) if (!uses.has(u)) err(f, `unknown use "${u}"`);
  for (const k of ['next']) if (d[k] && !ids.has(d[k])) err(f, `${k} -> unknown id "${d[k]}"`);
  for (const p of d.prev || []) if (!ids.has(p)) err(f, `prev -> unknown id "${p}"`);
  for (const [k, s] of Object.entries(d.src || {})) if (!sources[s]) err(f, `src.${k} -> unknown source "${s}"`);
}
for (const [id, img] of Object.entries(images)) {
  if (!ids.has(id)) err('images.json', `unknown device "${id}"`);
  for (const k of ['src', 'thumb']) if (!fs.existsSync(path.join('public/img/devices', img[k]))) err('images.json', `${id}: missing file ${img[k]}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${devices.length} devices, ${Object.keys(images).length} images`);
