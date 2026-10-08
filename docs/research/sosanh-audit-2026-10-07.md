## Scope

Audit of the distributor-hosted comparison tool `sosanh.draytek.vn` against official DrayTek documents. Used as a reference only; Port Atlas does not copy its code or layout.

## Sources used

- Page source of `sosanh.draytek.vn`: one 31 KB HTML file served from GitHub Pages, data labelled "Ver 9.0 (20260915)".
- DrayTek Databook 2026 (29/04/2026): `https://fw.draytek.com.tw/Databook/databook-2026-260429.pdf`.
- 15 official datasheets under `fw.draytek.com.tw/<Model>/Document/` (2136 260805, 2928 260907, 2927 260701, 2962 260701, 3912 260701, 3910 231206, 1000B 20210903, 2915 231206, 2925, 2926, 2952, 3220, 300B, 3900).
- Latest firmware versions from `fw.draytek.com.tw/<Model>/Firmware/`.
- DrayTek UK comparison tables, per-model specification pages and the product lifecycle page.
- `draytek.com` (global) blocks automated access (HTTP 403, Cloudflare), so the firmware server datasheets, which the global site links to, were used instead.

Rule applied: UK figures sometimes differ from the global datasheet (for example Vigor2928 NAT sessions: UK 60K, global 100K). The comparison tool follows the global datasheet, so the latest global datasheet is the reference.

## Clear data errors (fix immediately)

| Model | Value on the tool | Official value | Source |
|---|---|---|---|
| V2927 (wired) | Wi-Fi listed (5 GHz AC, 2.4 GHz) | No Wi-Fi (only ac/ax/Lac variants have it). Makes the "built-in Wi-Fi" filter return the wrong model | 2927 datasheet 260701 |
| V2927, 2927Fax, 2927Fac | WireGuard "-" | WireGuard supported (firmware 4.5.x) | 2927 datasheet 260701 |
| V2962 | USB "-" | 1x USB 2.0 and 1x USB 3.0, supports 4G/LTE USB modem | 2962 datasheet 260701 |
| V3912 / 3912S | USB "-" | 2x USB 3.0 | 3912 datasheet 260701 |
| V3910 | USB "-" | 2x USB 3.0 | 3910 datasheet |
| V1000B | USB "-" | 2x USB 3.0 | 1000B datasheet |
| V3910 | NAT sessions 500k | 1000K | 3910 datasheet 231206 |
| V2925 | DrayOS 4.x | DrayOS 3.x (firmware 3.9.8.6) | firmware server |
| V2926 Plus | DrayOS 4.x | DrayOS 3.x (firmware 3.9.9.13) | firmware server |
| V3220 | DrayOS empty | DrayOS 3.x (firmware 3.9.8.9) | firmware server |
| V300B | OSPF/BGP/RIP supported | Static and RIP v1/v2 only | 300B datasheet |
| V2962 | IPsec 800 Mbps | 900 Mbps | UK specification |
| V2136 / 2136ax, V2928 | SMS PIN "-" | Hotspot supports SMS PIN (also click-through, social login, RADIUS, external portal) | 2136 and 2928 datasheets |
| V2915Fac | NAT 50k | 30K (whole 2915 series) | 2915 datasheet |

## Minor differences and items to verify

| Model | Tool | Reference | Note |
|---|---|---|---|
| V3912 | NAT 9 Gbps, IPsec 3000, SSL 3300 | UK: NAT 12.5 Gbps, IPsec 5000, SSL 3500, WireGuard 900 | Possibly older datasheet figures; the performance table in the 260701 datasheet is an image and could not be extracted |
| V2136 / 2136ax | NAT 2 Gbps | 2.3 Gbps | Databook 2026 |
| V2136 | VLAN on LAN: 4 | Max VLAN 8, LAN subnets 4 | The tool puts the subnet count in the VLAN cell |
| V2927 | VLAN 8 | Max VLAN 16, LAN subnets 8 | Same issue |
| V2927 | IPsec 250, SSL 150 | UK: 300 (800 with hardware acceleration, firmware 4.2.1+), SSL 120 | |
| V2928 | IPsec 400 | UK: 430 | |
| V1000B | NAT 9300 Mbps | 9.4 Gbps | |
| V3910 | WireGuard 200 tunnels, 350 Mbps | The 3910 datasheet (2023) and UK specification do not list WireGuard | May have been added in firmware 4.4.6.x; confirm in release notes |
| V1100ax | 16 VPN, WireGuard 16 | Databook 2026 lists only Vigor1100Vax (GPON and 2 FXS), 2 VPN, 50K NAT | "Vigor1100ax" not found in official sources |
| V3910, V2915 | marked end of sale | UK lifecycle still "Available"; absent from the global Databook 2026 | Confirm the Vietnam market status with the distributor |
| SD-WAN | supported for 2927/2962/3910/3912, "-" for 2928/2136 | DrayTek SD-WAN runs through VigorACS 3 on managed routers | The criterion is not defined |

## General data-quality problems

- 48 empty cells ("no data") are mixed with 211 cells holding "-", so users cannot tell "not supported" from "not entered".
- The "*" marker (Wi-Fi Marketing on 1000B/3910/3912) and "being updated" have no footnote.
- Units are inconsistent ("900", "2 Gbps", "950Mbps", "2.2G", "9300 (SFP+)").
- The "PPPoE" and "Static" rows are identical, contradicting the footnote that PPPoE throughput is lower.
- "Capacity (users)" is a distributor estimate, not a vendor figure, and should be labelled as an estimate.
- Footer notes are out of date (V/N suffixes) and do not explain F, ac, ax, be, S, L, 5G, Plus.
- Many current models are missing: 2136F/Fax, 2136ax-4G, 2928be, 2928-4G/5G, 2927ac/ax/Vac/L/Lax-5G, C410/C510, 1220/1220be (XGS-PON), 180, 1100Vax. The GPON/XGS-PON filter matches a single model.
- No datasheet or product page link per model, so values cannot be verified.

## Technical and UX audit

| Severity | Issue | Recommendation |
|---|---|---|
| High | Ticking "compare" re-renders the whole grid, losing keyboard focus and resetting screen readers | Update only the card's class and checkbox |
| High | Data hard-coded in JavaScript with no source or verification date per model | Separate data file with `source_url` and `verified_at` |
| Medium | Filters match text values, so wrong data produces wrong filter results (Wi-Fi, USB, WireGuard) | Structured boolean fields |
| Medium | Rows are looked up by label prefix | Fixed keys per row |
| Medium | Filter and compare state is not in the URL, so a comparison cannot be shared | Sync state to the query string |
| Medium | No meta description, Open Graph, favicon, robots.txt or sitemap (all 404) | Add them so link previews work |
| Low | `alert()` when selecting more than 4 models | Inline message |
| Low | Result count has no `aria-live`; dialog lacks `aria-labelledby` | Add ARIA attributes |
| Low | No end-of-support or vulnerability warning for old models | EoL badge and advisory link |
| OK | HTTPS with 301 redirect, 31 KB, no external libraries, responsive below 820 px, HTML escaping, `:focus-visible` | none |

## Outcome

These findings drove the Port Atlas design: structured data with a source and date per value, an explicit "unverified" marker, state in the URL, EoL and advisory information, and a much larger device set (86 devices).
