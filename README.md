# jooservices/draytek

> Status: **POC** — branch model may be bypassed. GitHub repository: pending.

Independent static reference site for DrayTek networking devices: catalog, comparison, device advisor, and configuration helpers. Data is loaded from static files; no backend.

## Scope

- Device catalog and detail pages (routers, access points, switches, software), sourced from official datasheets.
- Compare, use-case search, sizing and recommendation tools.
- Configuration helpers (Policy Route, VPN, subnet/VLAN, PoE planning) and a firmware/security notices page.
- Vietnamese and English.

Out of scope: quiz, feedback, reactions, prices and stock.

## Layout

| Path | Purpose |
| --- | --- |
| `data/` | Static device and content data (JSON), each value with source and verification date |
| `docs/` | Research notes and design decisions |

## Status

Scaffold only. Stack is not selected yet.
