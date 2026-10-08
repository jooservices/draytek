# jooservices/draytek

> Status: **POC** — branch model may be bypassed.

Live site: https://jooservices.github.io/draytek/

Port Atlas: an independent, static, bilingual (Vietnamese/English) reference site for networking devices: catalog, comparison, advisor, firmware/security notices, and background guides. All content loads from static files; there is no backend.

## Run

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run validate:data
npm run update:data  # refresh firmware versions and security advisories (manual)
```

Set `SITE_URL` and `BASE_PATH` at build time to deploy under a domain or a sub-path.

## Stack

Astro 7 (static pages) + Preact islands for the interactive tools (catalog filter, compare, advisor) + TypeScript. No database, no server.

## Layout

| Path | Purpose |
| --- | --- |
| `data/devices/<id>.json` | One file per device: specs, port layout, variants, uses, notes, sources |
| `data/uses.json`, `sources.json`, `advisories.json`, `guides.json` | Use cases, source registry, advisories, guide content |
| `data/images.json` | Device id → product image entry |
| `public/img/devices/` | Web-sized WebP images (generated) |
| `assets-src/` | Original images (not committed); `npm run images` converts them |
| `src/lib/` | Data access, search, advisor logic, labels |
| `src/pages/[lang]/` | Pages for `vi` and `en` |

## Add a device

1. Copy a similar file in `data/devices/` to `data/devices/<new-id>.json` and edit it. Keep `id` equal to the file name.
2. Each spec value is a number, `true`/`false`, a string, or `{ "v": "...", "e": "..." }` for bilingual text. Leave a value out when it is not verified; the page shows "unverified". Add `src` entries to cite where each value came from.
3. Add an image: put the original in `assets-src/press/`, map the device id to its file in `scripts/build-images.mjs`, run `npm run images`.
4. Run `npm run validate:data` and `npm run build`. The device gets its own page, filter and compare support automatically.

## Data updates

Firmware versions come from the official firmware server (`latest.txt` per model folder) and security advisories from the DrayTek UK advisory index.

- **Manual:** `npm run update:firmware`, `npm run update:advisories`, or both with `npm run update:data`. Use `-- --dry` to preview, `-- --only=v2928,ap962c` to limit firmware lookups. Requests are spaced 1 second apart with retry on rate limits.
- **Automatic:** the `Update data` workflow runs weekly (Monday 03:17 UTC) and on demand from the Actions tab. When data changed it commits to `develop` and redeploys the site. Unchanged data produces no commit.

Fetched firmware overrides the curated version in `data/devices/*.json`. Devices without a firmware folder (software, accessories) keep curated values.

## Confluence

DrayTek knowledge lives in the Confluence space `JOODT` (https://jooservices.atlassian.net/wiki/spaces/JOODT). Narrative pages are defined in `scripts/confluence/pages.mjs`; device tables are generated from `data/`. Refresh with `node --env-file=<env file> scripts/sync-confluence.mjs` (or `npm run sync:confluence` with `JIRA_URL`, `JIRA_EMAIL`, `JIRA_TOKEN` set; never commit them). `-- --dry` lists pages without writing. Unchanged pages are skipped.

## Deploy

`Pages` workflow builds and deploys to GitHub Pages on every push to `develop` (validate data, type check, build). It sets `BASE_PATH=/<repo>` and `SITE_URL`.

## Scope

Out of scope: quiz, feedback, reactions, prices and stock.
