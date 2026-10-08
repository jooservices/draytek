## Scope

Audit of `https://www.anphat.vn`, the Vietnamese DrayTek distributor site, to learn how the market presents and sells DrayTek products and what a reference site can do better. Observed on 2026-10-08 with automated page fetches; page bodies of individual FAQ and guide articles were not read.

## What it is

- A distributor shop and support site, not a knowledge site. Built on Joomla with the RedShop shop component (template "baldur"). `robots.txt` is the Joomla default; there is no `sitemap.xml` (HTTP 404).
- Main navigation: Brands (DrayTek, DINTEK, APTEK, HIKVISION, Wi-Tek, Cudy, NOYAFA), Solutions, Support, Warranty, News, Promotions. Hotline 1900.633.641 with offices in Ho Chi Minh City, Hanoi, Da Nang and a western branch.
- DrayTek catalog page lists 79 DrayTek products (routers, VigorAP, VigorSwitch, ACS 2, VigorConnect). The product list page is about 850 KB of HTML; the Vigor3912S page about 180 KB.

## Content structure

| Area | Path | Content |
|---|---|---|
| Products | `/draytek/san-pham` | Product cards with VND price, stock state (out of stock, pre-order, buy) and an add-to-compare button |
| Product page | one page per product | Tabs: Overview, Specifications, Support, Related solutions. The best pages (for example Vigor3912S) add narrative content: Suricata IDS/IPS, Smart Action, SSD with Docker |
| Support | `/firmware`, `/ho-tro/` | Firmware and datasheet tables per brand, with versions up to September 2026 |
| FAQ | `/cau-hoi-thuong-gap/` | Five categories: general, DrayTek, VPN, DHCP, wireless |
| Guides | `/huong-dan-su-dung/` | Usage guides per brand, for example RIP routing over L2VPN |
| Solutions | `/giai-phap-cua-chung-toi/` | Solution articles (access points, 10G switches, URL/IP Reputation) |
| News | `/tin-tuc/` | About 130 article links (product news and technology news) |
| Warranty and policy | `/bao-hanh`, `/chinh-sach-doi-hang`, `/thanh-toan-va-giao-hang` | Policies |

## Related sites

| Site | Observation |
|---|---|
| `sosanh.draytek.vn` | Single-page comparison tool served from GitHub Pages; see the sosanh audit page |
| `policy-route-load-balancing-mode.draytek.vn` | Policy Route and load-balancing landing page; source of the guide content planned in JOODT-5 |
| `draytek.vn`, `www.draytek.vn` | Do not connect |
| Mirrors | The footer links to WordPress, Tumblr and Blogspot mirrors for the APTEK brand |

## Strengths

- Complete Vietnamese catalog with prices, stock state and local warranty information.
- Firmware and datasheet downloads in one place.
- Some strong explanatory product pages and localized FAQ and guide content.

## Weaknesses a reference site can address

- Heavy pages (850 KB product list) and no sitemap.
- Search is shallow: no "find a router for my use case" and no structured spec filtering.
- Comparison is limited to the shop's add-to-compare button.
- Content is split across a shop, a guide site and a comparison site that link poorly to each other.
- Prices and stock are shop data that go stale, so a reference site should link out instead of copying them.

## Open items

- Bodies of the FAQ and guide articles were not read; only category listings were fetched.
- Pages marked out of stock were not rechecked.
