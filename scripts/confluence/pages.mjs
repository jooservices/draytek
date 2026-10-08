// Page tree and content for the Draytek Confluence space (key JOODT).
// Narrative pages are written here; device tables are generated from data/ and marked "generated".
import fs from 'node:fs';
import { loadData, val, fmtMbps, fmtK } from './data.mjs';

const D = loadData();
// Pages show when their content was last reviewed, not when the sync ran, so unchanged content does not create new versions.
const REVIEWED = '2026-10-08';
const DATA_DATE = D.firmware.checked.slice(0, 10);
const JIRA = 'https://jooservices.atlassian.net/browse/';
const jira = (...keys) => keys.map((k) => `[${k}](${JIRA}${k})`).join(', ');
const REPO = 'https://github.com/jooservices/draytek';
const SITE = 'https://jooservices.github.io/draytek/';
const SPACE_HOME = 'Draytek';

const head = ({ verified = REVIEWED, sources = [], jira: keys = [], generated = false }) =>
  `:::info\n**Owner:** Viet Vu. **Last verified:** ${verified}. ${sources.length ? `**Sources:** ${sources.join('; ')}. ` : ''}${keys.length ? `**Jira:** ${jira(...keys)}.` : ''}${generated ? ` **Generated** from repository data (${REPO}/tree/develop/data) by \`npm run sync:confluence\`; do not edit this table by hand.` : ''}\n:::\n\n`;

const table = (headers, rows) => `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n`;
const link = (d) => `[${d.m}](${SITE}en/devices/${d.id}/)`;
const status = (d) => ({ cur: 'on sale', old: 'not in Databook 2026', eos: 'end of sale' }[d.st] || d.st) + (d.eol ? ` (EoL ${d.eol})` : '');
const of = (cat) => D.devices.filter((d) => d.cat === cat);
const fw = (d) => (d.s.fwv ? `${d.s.fwv}${d.s.fwdate ? ` (${d.s.fwdate})` : ''}` : '—');
const readDoc = (p) => fs.readFileSync(p, 'utf8');

export const pages = [
  // ---------- Space home ----------
  {
    title: SPACE_HOME, parent: null, labels: ['draytek', 'overview'],
    body: () => head({ sources: ['repository README', 'Jira JOODT'], jira: ['JOODT-9'] }) + `
Knowledge base for DrayTek networking devices and the **Port Atlas** reference site. It holds verified product knowledge, market audits, data sources, runbooks and decisions. Jira (project JOODT) is the record of tasks and progress; this space holds durable knowledge.

## At a glance

| Item | Value |
|---|---|
| Site | [Port Atlas](${SITE}) (bilingual Vietnamese/English, static) |
| Repository | [jooservices/draytek](${REPO}) |
| Jira project | [JOODT](https://jooservices.atlassian.net/jira/software/projects/JOODT/list) |
| Devices covered | ${D.devices.length} (${of('router').length} routers, ${of('ap').length} access points, ${of('switch').length} switches, ${of('more').length} software, services and accessories) |
| Firmware data checked | ${D.firmware.checked.slice(0, 10)} |
| Security advisories tracked | ${D.feed.items.length} (latest ${D.feed.items[0].date}) |

## How this space is organised

- [[Product knowledge]] — what the devices are, how they differ, lifecycle, firmware and security.
- [[Market (Vietnam)]] — audits of the distributor site and the comparison tool, plus reference sites by country.
- [[Data and sources]] — where facts come from, how they are verified, known discrepancies, image sources.
- [[Port Atlas site]] — architecture, features, runbooks, decisions and roadmap.
- [[End-user guides]] — configuration guides for end users (planned).

## Conventions

- Every page shows owner, **last verified** date, sources and related Jira keys.
- Facts are labelled **Verified** (checked against an official source on the date shown), **Assumed**, **Proposed** or **Open**. Nothing is guessed: a missing value is shown as "not verified".
- Device tables are **generated** from the repository data (single source of truth) and marked as such. Specification values live in the repository, not in hand-written pages.
- Task status is not copied here; follow the Jira links.
- No credentials or secret values are ever recorded.
`,
  },
  // ---------- Product knowledge ----------
  {
    title: 'Product knowledge', parent: SPACE_HOME, labels: ['draytek', 'product'],
    body: () => head({ sources: ['official datasheets', 'Databook 2026', 'DrayTek UK pages'], jira: ['JOODT-1'] }) + `
What DrayTek devices are, how the lines differ, and how long they are supported.

- [[Product lines overview]]
- [[Routers]], [[Wi-Fi access points]], [[Switches]], [[Software, services and accessories]]
- [[DrayOS and firmware]]
- [[Lifecycle and support]]
- [[Security advisories and hardening]]
- [[Regional differences]]
- [[Glossary]]
`,
  },
  {
    title: 'Product lines overview', parent: 'Product knowledge', labels: ['draytek', 'product'],
    body: () => {
      const cur = (c) => of(c).filter((d) => d.st === 'cur').length;
      return head({ verified: DATA_DATE, sources: ['Databook 2026', 'repository data/devices'], jira: ['JOODT-1'], generated: true }) + `
## Summary

The dataset covers ${D.devices.length} devices: ${cur('router')} current routers, ${cur('ap')} current access points, ${cur('switch')} current switches and ${cur('more')} software, service and accessory items, plus older models still common in Vietnam.

## Router lines

| Line | Typical use | Key traits (from data) |
|---|---|---|
| Vigor2136 | Small office, 2.5G dual WAN | DrayOS 5, 2.3 Gbps NAT, 16 VPN tunnels, optional Wi-Fi 6 |
| Vigor2927 | SMB dual WAN | DrayOS 4, 50 VPN tunnels, many variants (fibre, Wi-Fi, VoIP, LTE/5G) |
| Vigor2928 | 10G SMB / branch | DrayOS 5, 9.3 Gbps NAT, 10G SFP+ and RJ-45, Wi-Fi 7 variants |
| Vigor2962 | Branch office, VPN concentrator | 200 VPN tunnels, OSPF/BGP, high availability |
| Vigor3912 / 3912S | Large site, flagship 10G | 1M NAT sessions, 500 VPN tunnels; 3912S adds SSD and 8 GB RAM for Docker apps |
| Vigor1100Vax, 1220, 180 | Fibre (GPON, XGS-PON) | Carrier and FTTH use |
| Vigor C410 / C510 | Mobile primary line | 4G (C410) or 5G (C510) |
| Vigor166/167, 2765-2767, 2865-2867 | xDSL | Mainly European market |
| Legacy (2925, 2926, 2952, 3220, 3900, 2960, 300B, 1000B, 3910, 2915) | Older sites | Several are past end of support; see [[Lifecycle and support]] |

## Access points and switches

- **VigorAP:** Wi-Fi 5, 6 and 7 ceiling, desktop and outdoor models with mesh and central management.
- **VigorSwitch:** unmanaged (Q60x), smart-lite (G1080, Q1070x), web-smart (G1282, P1282) and L2+ managed (G2100 up to G2542x), with PoE (P / PQ) variants and 2.5G (Q) and 10G (x) uplinks.

## Software and services

VigorACS 3 (central management and SD-WAN), VigorConnect (local management of up to 100 devices), SmartVPN Client, and subscription services (Threat Protection, URL/IP Reputation). See [[Software, services and accessories]].

Details per device: [[Routers]], [[Wi-Fi access points]], [[Switches]]. Reading model names: [[DrayOS and firmware]].
`;
    },
  },
  {
    title: 'Routers', parent: 'Product knowledge', labels: ['draytek', 'product', 'generated'],
    body: () => head({ verified: DATA_DATE, sources: ['repository data/devices', 'official datasheets'], jira: ['JOODT-1', 'JOODT-3'], generated: true }) +
      `Values come from official datasheets, the Databook 2026 and DrayTek UK pages; "not verified" means the value was not found. Throughput is a vendor lab figure.\n\n` +
      table(['Model', 'Status', 'Summary', 'NAT', 'Sessions', 'VPN', 'Max WAN', 'DrayOS', 'Latest firmware'],
        of('router').map((d) => [link(d), status(d), val(d.t), val(d.s.nat, 'mbps'), val(d.s.sess, 'k'), val(d.s.vpn), val(d.s.wanmax), val(d.s.os), fw(d)])),
  },
  {
    title: 'Wi-Fi access points', parent: 'Product knowledge', labels: ['draytek', 'product', 'generated'],
    body: () => head({ verified: DATA_DATE, sources: ['repository data/devices', 'DrayTek UK AP comparison'], jira: ['JOODT-1'], generated: true }) +
      table(['Model', 'Status', 'Standard', 'Class', 'Max link rate', 'Clients', 'Ports', 'Latest firmware'],
        of('ap').map((d) => [link(d), status(d), val(d.s.std), val(d.s.cls), val(d.s.link), val(d.s.clients), val(d.s.ports), fw(d)])),
  },
  {
    title: 'Switches', parent: 'Product knowledge', labels: ['draytek', 'product', 'generated'],
    body: () => head({ verified: DATA_DATE, sources: ['repository data/devices', 'DrayTek UK switch comparison'], jira: ['JOODT-1'], generated: true }) +
      table(['Model', 'Status', 'Level', 'Access ports', 'Uplink', 'PoE budget', 'Latest firmware'],
        of('switch').map((d) => [link(d), status(d), val(d.s.level), val(d.s.ports), val(d.s.uplink), val(d.s.budget, 'w'), fw(d)])),
  },
  {
    title: 'Software, services and accessories', parent: 'Product knowledge', labels: ['draytek', 'product', 'generated'],
    body: () => head({ sources: ['repository data/devices', 'DrayTek AU and UK pages'], jira: ['JOODT-1'], generated: true }) +
      table(['Item', 'Type', 'What it does', 'Supported devices'],
        of('more').map((d) => [link(d), val(d.s.kind), val(d.s.what), val(d.s.models)])),
  },
  {
    title: 'DrayOS and firmware', parent: 'Product knowledge', labels: ['draytek', 'product', 'generated'],
    body: () => head({ verified: DATA_DATE, sources: ['firmware server fw.draytek.com.tw', 'repository data/guides.json'], jira: ['JOODT-3'], generated: true }) + `
## Operating systems

${table(['Platform', 'Models', 'Notes', 'Firmware line'], D.guides.os.map((o) => [`**${o.platform}**`, o.models, o.note.e, o.fw]))}
## Reading model names

The number is the product line; the letters after it describe the variant.

${table(['Suffix', 'Meaning'], D.guides.suffixes.map((s) => [`\`${s.k}\``, s.e]))}
## Latest firmware by model

Fetched from the official firmware server (\`latest.txt\` per model folder) by \`npm run update:firmware\`; checked ${D.firmware.checked.slice(0, 10)}. Models where the server lists a separate stable line show it too.

${table(['Model', 'Type', 'Latest firmware', 'Released', 'Stable line'],
  D.devices.filter((d) => d.cat !== 'more' && d.s.fwv).map((d) => { const f = Object.values(D.firmware.items).find((x) => x.ids.includes(d.id)); return [link(d), d.cat, d.s.fwv, d.s.fwdate || '—', f?.stable || '—']; }))}
`,
  },
  {
    title: 'Lifecycle and support', parent: 'Product knowledge', labels: ['draytek', 'product', 'generated'],
    body: () => {
      const life = D.devices.filter((d) => d.eol).sort((a, b) => a.eol.localeCompare(b.eol));
      return head({ sources: ['DrayTek UK product lifecycle page', 'repository data/devices'], jira: ['JOODT-1'], generated: true }) + `
Per DrayTek UK: after end of sale (EoS), firmware is maintained for 3 to 5 years until end of life (EoL). After EoL there are no security fixes. Vietnam market status can differ and should be confirmed with the distributor (open item).

` + table(['Model', 'End of sale', 'End of life', 'Replace with'], life.map((d) => [link(d), d.eos || '—', d.eol, d.next && D.byId[d.next] ? link(D.byId[d.next]) : '—']));
    },
  },
  {
    title: 'Security advisories and hardening', parent: 'Product knowledge', labels: ['draytek', 'product', 'security', 'generated'],
    body: () => {
      const cves = D.devices.filter((d) => d.cve);
      return head({ verified: D.feed.checked.slice(0, 10), sources: [D.feed.source], jira: ['JOODT-3', 'JOODT-8'], generated: true }) + `
## Advisories

Fetched from the DrayTek UK advisory index by \`npm run update:advisories\`. Which devices an advisory affects must be confirmed in the advisory itself; the family column is only a hint taken from the title.

${table(['Date', 'Advisory', 'CVE', 'Family'], D.feed.items.map((a) => [a.date, `[${a.title.replace(/\|/g, '/')}](${a.url})`, a.cves.length > 1 ? `${a.cves[0]} to ${a.cves[a.cves.length - 1].replace(/^CVE-\d{4}-/, '')}` : a.cves[0] || '—', a.families.join(', ') || '—']))}
## CVE-2025-10547 minimum firmware

${D.advisory.e}

${table(['Model', 'Minimum firmware', 'Latest firmware'], cves.map((d) => [link(d), d.cve, d.s.fwv || '—']))}
## Hardening checklist

- Keep firmware at the latest version for the model's line.
- Do not expose the admin interface to the Internet; restrict remote administration to an IP list or reach it through a VPN.
- Plan replacement of models at or past end of life; see [[Lifecycle and support]].
`;
    },
  },
  {
    title: 'Regional differences', parent: 'Product knowledge', labels: ['draytek', 'product', 'data'],
    body: () => head({ sources: ['Databook 2026', 'DrayTek UK', 'official datasheets'], jira: ['JOODT-1'] }) + `
Figures differ between the global datasheet, the Databook 2026 and regional (UK) pages. Port Atlas uses the **latest global datasheet first** and fills gaps from UK pages, showing both numbers where sources disagree.

| Model | Item | Global datasheet | Other source |
|---|---|---|---|
| Vigor2928 | NAT sessions | 100K (Sep 2026) | 60K (Databook 2026, UK) |
| Vigor2928 | IPsec | 430 Mbps (UK product page) | 540 Mbps (UK comparison) |
| Vigor2136ax | VPN tunnels | 16 | 4 (UK) |
| Vigor3912 | Performance | datasheet performance table is an image and could not be extracted | UK: NAT 12.5 Gbps, IPsec 5 Gbps, SSL 3.5 Gbps, WireGuard 900 Mbps |

Other regional notes:

- Some lines (xDSL such as 2766/2767/2865-2867) are mainly sold in Europe.
- Vigor1100ax appears on a Vietnamese distributor listing, but the Databook 2026 lists only Vigor1100Vax. Open item: confirm the exact model name.
- The global site \`draytek.com\` blocks automated access (HTTP 403); official datasheets and firmware are read from \`fw.draytek.com.tw\`.

Every such conflict is also recorded in [[Discrepancy log]].
`,
  },
  {
    title: 'Glossary', parent: 'Product knowledge', labels: ['draytek', 'product'],
    body: () => head({ sources: ['DrayTek documentation', 'repository data/guides.json'], jira: ['JOODT-1'], generated: true }) + table(['Term', 'Meaning'], D.guides.terms.map((t) => [`**${t.k}**`, t.e])),
  },
  // ---------- Market ----------
  {
    title: 'Market (Vietnam)', parent: SPACE_HOME, labels: ['draytek', 'market'],
    body: () => head({ sources: ['live site audits'], jira: ['JOODT-1'] }) + `
Audits of what the Vietnamese market already offers, used as reference only.

- [[An Phat site audit]]
- [[sosanh.draytek.vn audit]]
- [[Reference sites by country]]
`,
  },
  {
    title: 'An Phat site audit', parent: 'Market (Vietnam)', labels: ['draytek', 'market', 'audit'],
    body: () => head({ verified: '2026-10-08', sources: ['https://www.anphat.vn (observed)'], jira: ['JOODT-1'] }) + readDoc('docs/research/anphat-audit-2026-10-08.md'),
  },
  {
    title: 'sosanh.draytek.vn audit', parent: 'Market (Vietnam)', labels: ['draytek', 'market', 'audit', 'data-quality'],
    body: () => head({ verified: '2026-10-07', sources: ['Databook 2026', 'official datasheets', 'DrayTek UK'], jira: ['JOODT-1'] }) + readDoc('docs/research/sosanh-audit-2026-10-07.md'),
  },
  {
    title: 'Reference sites by country', parent: 'Market (Vietnam)', labels: ['draytek', 'market', 'sources'],
    body: () => head({ verified: '2026-10-08', sources: ['direct requests, 2026-10-08'], jira: ['JOODT-3'] }) + `
Reachability and usefulness of DrayTek sites, checked with plain HTTP requests from the development machine.

| Site | Result | Use |
|---|---|---|
| draytek.com (global) | HTTP 403 (automated access blocked) | Not used directly |
| draytek.co.uk (UK) | 200 | Best structured data: comparison tables, per-model specification pages, product lifecycle, security advisories |
| draytek.com.au (AU) | 200, WordPress | Product pages with several image angles, news feed (\`/feed/\`) |
| draytek.de, draytek.nl, draytek.pl, draytek.cz, draytek.pt, draytek.com.cn | 200 | Not used so far; only their sitemaps were searched for the models missing photos and none matched |
| draytek.com.tw, draytek.fr | 403 | Not used |
| draytek.es, draytek.com.sg, draytek.jp, draytek.co.th, draytek.vn | Did not respond | Not used |
| fw.draytek.com.tw (firmware server) | 200 | Databook 2026, datasheets, firmware per model; rate-limits rapid requests (HTTP 429) |
| anphat.vn | 200 | Vietnamese distributor catalog and firmware table; see [[An Phat site audit]] |
`,
  },
  // ---------- Data and sources ----------
  {
    title: 'Data and sources', parent: SPACE_HOME, labels: ['draytek', 'data'],
    body: () => head({ sources: ['repository'], jira: ['JOODT-1', 'JOODT-3', 'JOODT-7'] }) + `
- [[Source register]]
- [[Data model and verification rules]]
- [[Discrepancy log]]
- [[Image sources and status]]
`,
  },
  {
    title: 'Source register', parent: 'Data and sources', labels: ['draytek', 'data', 'sources'],
    body: () => head({ verified: '2026-10-08', sources: ['direct checks'], jira: ['JOODT-3'], generated: false }) + `
Order of trust when values disagree: latest global datasheet, then Databook 2026, then regional (UK) pages. Distributor pages are used for catalog context, not for specifications.

| Source | Provides | Access and limits | Used for |
|---|---|---|---|
| \`fw.draytek.com.tw/<model>/Document/\` | Official datasheets | Public; rate-limited (HTTP 429) on rapid requests | Specification values |
| \`fw.draytek.com.tw/Databook/databook-2026-260429.pdf\` | Databook 2026 (29/04/2026) | Public | Current line-up, specifications |
| \`fw.draytek.com.tw/<model>/Firmware/latest.txt\` | Latest firmware version; folder listing with dates and release notes | Public; fetch about 1 request per second | Firmware column, \`npm run update:firmware\` |
| draytek.co.uk product, comparison, lifecycle pages | Hardware specs, comparison tables, EoS/EoL, product photos | Public | Hardware profile, lifecycle, gaps in datasheets |
| draytek.co.uk security advisories | Advisory index with dates and CVE ids | Public; HTML list | Security page, \`npm run update:advisories\` |
| draytek.com.au product pages | Product photos from several angles, news feed | Public | Photos for models missing elsewhere |
| draytek.com (global) | — | HTTP 403 to automated requests | Not used |
| anphat.vn | Vietnamese catalog, firmware table, product images | Public | Market audit; some product photos where nothing better exists |

Per-value sources are recorded in each device file (\`src\` keys, mapped in \`data/sources.json\`) and shown as small tags on the device pages.
`,
  },
  {
    title: 'Data model and verification rules', parent: 'Data and sources', labels: ['draytek', 'data', 'runbook'],
    body: () => head({ sources: ['repository scripts/validate-data.mjs', 'data/devices'], jira: ['JOODT-1', 'JOODT-2'] }) + `
## Files

| Path | Content |
|---|---|
| \`data/devices/<id>.json\` | One device: identity, category, status, summary, variants, port layout, specs, uses, features, notes, successor |
| \`data/uses.json\` | Use cases (office, cafe, hotel, branch hub...) with search keywords |
| \`data/sources.json\` | Source registry referenced by each value |
| \`data/firmware.json\` | Latest firmware per model folder, written by the update script |
| \`data/advisories-feed.json\` | Advisory index, written by the update script |
| \`data/advisories.json\` | Curated note for CVE-2025-10547 |
| \`data/guides.json\` | Operating-system table, name suffixes, glossary |
| \`data/images.json\`, \`data/no-image.json\` | Photo manifest and devices without a photo |

## Value rules

- A value is a number, \`true\`/\`false\`, a string, or \`{ "v": "...", "e": "..." }\` for bilingual text. Throughput is stored in Mbps.
- A missing value is shown as "not verified". Values are never guessed; each carries a source key.
- Fetched firmware overrides the curated version for devices that have a firmware folder.
- Where sources conflict, both values are kept in the device notes; see [[Discrepancy log]].

## Checks

\`npm run validate:data\` checks required fields, unique ids and file names, categories, status values, use ids, successor references, source keys, image files, and that every device has either a photo or an entry in \`no-image.json\`.
`,
  },
  {
    title: 'Discrepancy log', parent: 'Data and sources', labels: ['draytek', 'data', 'generated'],
    body: () => {
      const rows = [];
      for (const d of D.devices) for (const n of (d.note?.e || [])) rows.push([link(d), n.replace(/\|/g, '/')]);
      return head({ sources: ['repository data/devices notes'], jira: ['JOODT-1'], generated: true }) + `Notes recorded on device files where sources disagree or a feature is absent.\n\n` + table(['Device', 'Note'], rows);
    },
  },
  {
    title: 'Image sources and status', parent: 'Data and sources', labels: ['draytek', 'data', 'images'],
    body: () => {
      const byOrigin = {};
      for (const e of Object.values(D.images)) byOrigin[e.origin] = (byOrigin[e.origin] || 0) + 1;
      const label = { 'uk-press': 'DrayTek UK press images page', uk: 'DrayTek UK product pages', au: 'DrayTek AU product pages', an: 'Distributor product images' };
      const none = Object.entries(D.noImage.items);
      return head({ verified: '2026-10-08', sources: ['direct checks of UK, AU and distributor pages'], jira: ['JOODT-7'], generated: true }) + `
${Object.keys(D.images).length} of ${D.devices.length} devices have a photo. Photos keep their natural aspect ratio and open full size in a modal; devices without a photo show a drawn port layout.

## Origin of photos

${table(['Origin', 'Photos'], Object.entries(byOrigin).map(([k, n]) => [label[k] || k, String(n)]))}
Pipeline: original files are kept outside Git (\`assets-src/\`); \`npm run images\` writes web-sized WebP (thumbnail, display, full) and \`data/images.json\`.

## Quality notes

- Vigor3910 has only a 528 px wide photo (best available).
- Images carrying a seller overlay were rejected.
- Vigor1100Vax was not given the Vigor1100ax photo because it is a different model.

## Devices without a photo

${table(['Device', 'Reason'], none.map(([id, r]) => [D.byId[id] ? link(D.byId[id]) : id, r === 'software' ? 'Software or service, no physical product' : 'No suitable photo found on the checked sources']))}
`;
    },
  },
  // ---------- Port Atlas ----------
  {
    title: 'Port Atlas site', parent: SPACE_HOME, labels: ['draytek', 'site'],
    body: () => head({ sources: ['repository'], jira: ['JOODT-1', 'JOODT-4'] }) + `
Port Atlas is the independent, bilingual, static reference site for DrayTek devices: ${SITE}

- [[Architecture and stack decision]]
- [[Features and advisor logic]]
- [[Runbooks]]
- [[Decision log]]
- [[Roadmap]]
`,
  },
  {
    title: 'Architecture and stack decision', parent: 'Port Atlas site', labels: ['draytek', 'site', 'adr'],
    body: () => head({ sources: ['repository README, package.json'], jira: ['JOODT-1', 'JOODT-4'] }) + `
## Context

A website that is attractive, friendly, provides useful information, and makes it easy to add devices and specifications. Content and specs must load from static files; no backend.

## Decision

**Astro 7 + TypeScript**, with **Preact islands** for interactive tools, data in JSON files (one per device), deployed to **GitHub Pages**.

## Why

- **Easy updates:** a device is one file; the site derives its page, filters, search and compare entry. The build validates data.
- **Fast and shareable:** each device has its own URL; interactivity runs only where needed.
- **Sourced data:** each value keeps its source key; unknown values are shown as "not verified".
- **Bilingual:** values carry Vietnamese and English text; the UI switches language.
- **No operating cost:** static output, no server or database.

## Alternatives considered

| Option | Why not chosen |
|---|---|
| Single self-contained HTML file (the earlier prototype) | Works, but hard to maintain beyond about 100 devices, no per-device URLs |
| Next.js / full React | Heavier than needed; ships JavaScript to render static specs |
| WordPress / CMS | Needs a server and database and security upkeep |
| Website builder | No control over data structure, compare and calculators |

## Consequences

- Data effort dominates: every new device needs datasheet checking.
- Real-time features such as reactions or feedback are out of scope (no backend).

## Build and hosting

- Node >= 22.12 (CI uses Node 24). Scripts: \`dev\`, \`build\`, \`check\`, \`validate:data\`, \`images\`, \`update:firmware\`, \`update:advisories\`, \`update:data\`, \`sync:confluence\`.
- GitHub Pages workflow builds on every push to \`develop\` with \`BASE_PATH=/draytek\`.
`,
  },
  {
    title: 'Features and advisor logic', parent: 'Port Atlas site', labels: ['draytek', 'site'],
    body: () => head({ sources: ['repository src/lib/search.ts, advisor.ts'], jira: ['JOODT-1'] }) + `
## Pages

| Page | What it does |
|---|---|
| Home | Natural-language search box, use-case chips, categories, featured devices |
| Devices | Filters by use, feature and minimum specification; text search that understands numbers and features, without diacritics |
| Device detail | Photo with zoom, port layout, specifications by group with source tags, variants, uses, notes, lifecycle, security, successor, documents |
| Compare | Up to 4 devices, differences highlighted, share link, print |
| Advisor | Recommends 3 routers, access point count and PoE switch count from stated needs |
| Security | Advisory list (filterable) and latest firmware by model, from fetched data |
| Guides | Model-name suffixes, operating systems, lifecycle, glossary, sources |

## Search

The query is parsed into feature flags (for example 10G, 2.5G, SFP+, Wi-Fi 5/6/7, 4G/5G, WireGuard, PoE, mesh, outdoor), numeric needs (users, VPN tunnels, WAN lines, cameras) and use-case words. A device must satisfy every flag and numeric need; remaining words score matches in model names, uses and spec text.

## Advisor

Routers are checked against: users (estimated range per model), number of WAN lines and port speed, NAT throughput against total bandwidth, line type (Ethernet, DSL, cellular), VPN tunnels (branches plus remote workers), remote-access VPN, built-in Wi-Fi, high availability, 4G/5G backup, hotspot, VoIP and Threat Protection. The three routers with the fewest failed checks (then closest size fit) are shown with each check.

Access points are planned by environment and device count (about 25 clients per AP for older models, 35 for Wi-Fi 6 desk/ceiling, 60 for AX6000, 80 for Wi-Fi 7). The PoE switch is chosen by PoE ports needed (APs plus cameras), power budget and total ports, with a second switch added when ports run short.

These are starting suggestions to be checked against datasheets, not guarantees.

## Out of scope

Quiz, feedback and reactions; prices and stock.
`,
  },
  {
    title: 'Runbooks', parent: 'Port Atlas site', labels: ['draytek', 'site', 'runbook'],
    body: () => head({ sources: ['repository README, WORKFLOWS.md'], jira: ['JOODT-3', 'JOODT-4', 'JOODT-7'] }) + `
## Run locally

\`\`\`
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
\`\`\`

## Add a device

1. Copy a similar file in \`data/devices/\` to \`data/devices/<new-id>.json\` and edit it; \`id\` must equal the file name.
2. Fill values with numbers, booleans, strings or bilingual \`{ "v": "...", "e": "..." }\`; leave out unverified values and cite sources in \`src\`.
3. Add a photo: place the original in \`assets-src/press/\`, map the id in \`scripts/build-images.mjs\`, run \`npm run images\`. If no photo exists, list the device in \`data/no-image.json\`.
4. Run \`npm run validate:data\` and \`npm run build\`.

## Update firmware and advisories

- **Manual:** \`npm run update:data\` (or \`update:firmware\`, \`update:advisories\`). Options: \`-- --dry\`, \`-- --only=v2928,ap962c\`. Requests are spaced one second apart with retry on rate limits.
- **Automatic:** the *Update data* workflow runs weekly (Monday 03:17 UTC) and on demand from the Actions tab. When data changed it commits to \`develop\` and starts a deploy; unchanged data produces no commit.
- Devices without a firmware folder (software, accessories) keep curated values; the script reports four expected "404" lines.

## Deploy

The *Pages* workflow validates data, type-checks, builds and deploys on every push to \`develop\`. Public URL: ${SITE}. The Pages CDN may return a transient 503 under a rapid request burst.

## Refresh this Confluence space

\`npm run sync:confluence\` regenerates device tables and narrative pages from the repository (needs \`JIRA_URL\`, \`JIRA_EMAIL\`, \`JIRA_TOKEN\` in the environment; never commit them). Use \`-- --dry\` to preview.

## Troubleshooting

| Symptom | Cause and action |
|---|---|
| HTTP 429 from the firmware server | Too many requests; the script backs off and retries; rerun later |
| Official global site returns 403 | Automated access is blocked; use the firmware server and regional sites |
| Photo looks stretched | Never set both width and height; images use \`img.photo\` styles (auto size, contain) |
`,
  },
  {
    title: 'Decision log', parent: 'Port Atlas site', labels: ['draytek', 'site', 'adr'],
    body: () => head({ sources: ['project conversations (owner decisions)'], jira: ['JOODT-1', 'JOODT-4', 'JOODT-9'] }) + `
Only owner-confirmed decisions are listed. Dates are when the decision was given.

| Date | Decision | Status |
|---|---|---|
| 2026-10-07 | The reference site is independent of any project and uses no brand name; the existing comparison tool is a reference for ideas only, not copied | Implemented |
| 2026-10-07 | Vietnamese and English with a language switch | Implemented |
| 2026-10-08 | New project \`draytek\` in the JOOservices namespace, registered as POC, working branch \`develop\` | Implemented |
| 2026-10-08 | No quiz, feedback or reaction features | Implemented (out of scope) |
| 2026-10-08 | Stack: Astro + TypeScript + Preact islands, static data files. The owner delegated the technical choice after the recommendation was explained | Implemented |
| 2026-10-08 | Product photos are used beside the drawn port diagrams; photos keep aspect ratio and open full size | Implemented |
| 2026-10-08 | Firmware and advisory updates support both manual and automatic runs; deploy to GitHub Pages | Implemented |
| 2026-10-08 | Jira project JOODT and a dedicated Confluence space JOODT for DrayTek knowledge | Implemented |
`,
  },
  {
    title: 'Roadmap', parent: 'Port Atlas site', labels: ['draytek', 'site', 'roadmap'],
    body: () => head({ sources: ['Jira JOODT'], jira: ['JOODT-5', 'JOODT-6', 'JOODT-8', 'JOODT-9'] }) + `
Planned and proposed work. Status is tracked only in Jira: [JOODT backlog](https://jooservices.atlassian.net/jira/software/projects/JOODT/list).

| Item | Jira | Notes |
|---|---|---|
| Port the Policy Route guide into the Guides section | ${jira('JOODT-5')} | Content exists only as an earlier artifact |
| Subnet/VLAN and PoE planning tools | ${jira('JOODT-6')} | VPN configuration generator and network diagram are later candidates (proposed) |
| Update AP and switch security notice text on device pages | ${jira('JOODT-8')} | Use the advisory feed instead of hard-coded CVE ranges |
| Document DrayTek knowledge in Confluence | ${jira('JOODT-9')} | This space |
`,
  },
  // ---------- Guides ----------
  {
    title: 'End-user guides', parent: SPACE_HOME, labels: ['draytek', 'guides'],
    body: () => head({ sources: ['earlier Policy Route landing content'], jira: ['JOODT-5'] }) + `
:::note
**Proposed / not yet written.** The six-page Policy Route and load-balancing guide (mechanism, configuration, scenarios, troubleshooting) exists only as an earlier artifact and is tracked in ${jira('JOODT-5')}. It will be added here when ported.
:::

Planned guides: Policy Route and load balancing; VPN setup; Wi-Fi mesh; firmware upgrade.
`,
  },
];
