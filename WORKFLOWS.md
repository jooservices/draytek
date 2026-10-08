# Workflows

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `Pages` (`.github/workflows/pages.yml`) | push to `develop`, manual | Validate data, type check, build, deploy to GitHub Pages |
| `Update data` (`.github/workflows/update-data.yml`) | weekly (Mon 03:17 UTC), manual | Fetch firmware and advisories; commit to `develop` and redeploy when data changed |

Local equivalents: `npm run validate:data`, `npm run check`, `npm run build`, `npm run update:data`.
