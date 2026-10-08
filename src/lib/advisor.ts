// Device advisor: recommends routers, AP count and PoE switches from user needs.
import { devices, byId, L } from './data';
import { fmtMbps } from './format';
import { T } from './i18n';
import type { Device, Lang } from './types';

export interface Needs {
  users: number;
  lines: number;
  speed: number;
  line: 'eth' | 'dsl' | 'cell';
  sites: number;
  remote: number;
  wifi: boolean;
  backup: boolean;
  ha: boolean;
  hotspot: boolean;
  iptv: boolean;
  voip: boolean;
  sec: boolean;
  wifiUsers: number;
  env: 'office' | 'desk' | 'dense' | 'out';
  wired: number;
  cams: number;
}

export const defaultNeeds = (): Needs => ({
  users: 60, lines: 2, speed: 1000, line: 'eth', sites: 3, remote: 10, wifi: false, backup: true,
  ha: false, hotspot: true, iptv: false, voip: false, sec: false, wifiUsers: 50, env: 'office', wired: 15, cams: 8,
});

export const SPEEDS: [number, string][] = [
  [300, '300 Mbps'], [500, '500 Mbps'], [1000, '1 Gbps'], [2000, '2 Gbps'], [2500, '2.5 Gbps'], [5000, '5 Gbps'], [10000, '10 Gbps'],
];

const hasAny = (d: Device, fs: string[]) => fs.some((f) => (d.f || []).includes(f));
const maxPort = (d: Device) => {
  const f = d.f || [];
  return f.includes('10g') ? 10000 : f.includes('2.5g') ? 2500 : 1000;
};

export interface Check { ok: boolean; txt: string }
export interface RouterEval { d: Device; ck: Check[]; fails: number; over: number }

export function evalRouter(d: Device, A: Needs, lang: Lang): RouterEval {
  const C = T[lang].c;
  const ck: Check[] = [];
  const add = (ok: boolean, a: string, b: string) => ck.push({ ok, txt: ok ? a : b });
  const u = d.u || [0, 0];
  add(u[1] >= A.users, C.users(A.users, u[0], u[1]), C.usersX(A.users, u[1]));
  if (A.line === 'eth') {
    const w = typeof d.s.wanmax === 'number' ? d.s.wanmax : 1;
    add(w >= A.lines, C.wan(A.lines, w), C.wanX(A.lines, w));
    const sp = fmtMbps(A.speed);
    add(maxPort(d) >= Math.min(A.speed, 10000) || A.speed <= 1000, C.speed(sp), C.speedX(sp));
    if (typeof d.s.nat === 'number') {
      const tot = A.speed * Math.max(1, A.lines);
      add(d.s.nat >= tot * 0.9, C.nat(fmtMbps(d.s.nat)), C.natX(fmtMbps(d.s.nat)));
    }
    add(!hasAny(d, ['dsl', 'pon', 'xgspon']), C.line, C.lineX);
  } else if (A.line === 'dsl') add(hasAny(d, ['dsl']), C.line, C.lineX);
  else add(hasAny(d, ['lte', '5g']), C.line, C.lineX);
  const vneed = A.sites + A.remote;
  if (vneed > 0) {
    const v = typeof d.s.vpn === 'number' ? d.s.vpn : 0;
    add(v >= vneed, C.vpn(vneed, v), C.vpnX(vneed, v));
  }
  if (A.remote > 0) add(hasAny(d, ['wg', 'openvpn', 'ssl']), C.remote, C.remoteX);
  if (A.wifi) add(hasAny(d, ['wifi5', 'wifi6', 'wifi7']), C.wifi, C.wifiX);
  if (A.ha) add(!!d.s.ha, C.ha, C.haX);
  if (A.backup) add(hasAny(d, ['usbmodem', 'lte', '5g']), C.backup, C.backupX);
  if (A.hotspot) add(!!d.s.hotspot || hasAny(d, ['hotspot']), C.hotspot, C.hotspotX);
  if (A.voip) add(hasAny(d, ['voip']), C.voip, C.voipX);
  if (A.sec) add(hasAny(d, ['threat']), C.sec, C.secX);
  const fails = ck.filter((c) => !c.ok).length;
  const mid = Math.sqrt(Math.max(1, u[0]) * Math.max(1, u[1]));
  const over = Math.abs(Math.log(mid / Math.max(5, A.users)));
  return { d, ck, fails, over };
}

export function variantHint(d: Device, A: Needs): string {
  const v = (d.var || []).map((x) => x[0]);
  const pick = v.filter((n) => {
    if (A.wifi && !/(ax|ac|be)/i.test(n)) return false;
    if (!A.wifi && /(ax|ac|be)/i.test(n) && v.some((m) => !/(ax|ac|be)/i.test(m))) return false;
    if (A.voip !== /V/.test(n) && v.some((m) => /V/.test(m) === A.voip)) return false;
    return true;
  });
  return pick.length ? pick.slice(0, 3).join(', ') : '';
}

const AP_RATE: Record<string, number> = {
  ap912c: 25, ap918r: 25, ap918rpd: 25, ap805: 35, ap905: 35, ap962c: 35, ap1062c: 60, ap1070c: 80,
};

export function planAp(A: Needs) {
  const id =
    A.env === 'out' ? 'ap918r'
    : A.env === 'desk' ? 'ap905'
    : A.env === 'dense' ? (A.wifiUsers > 400 ? 'ap1070c' : 'ap1062c')
    : A.wifiUsers > 150 ? 'ap1062c' : 'ap962c';
  const n = A.wifiUsers > 0 ? Math.max(1, Math.ceil(A.wifiUsers / AP_RATE[id])) : 0;
  return { ap: byId[id], n, poeW: id === 'ap1070c' ? 51 : 25.5 };
}

export function planSwitch(A: Needs, apPlan: ReturnType<typeof planAp>) {
  const poePorts = apPlan.n + A.cams;
  const load = Math.ceil(apPlan.n * apPlan.poeW + A.cams * 7);
  const total = poePorts + A.wired + 1;
  const want25 = ['ap962c', 'ap1062c', 'ap805', 'ap905', 'ap1070c'].includes(apPlan.ap.id);
  const cands = devices
    .filter((d) => (d.cat === 'switch' && d.st === 'cur' && (d.f || []).includes('poe') && typeof d.s.budget === 'number') || d.id === 'swp2542x')
    .map((d) => {
      const pp = (d.fp || []).filter((p) => p.poe).reduce((a, p) => a + (p.n || 1), 0);
      const all = (d.fp || []).filter((p) => p.m !== 'con').reduce((a, p) => a + (p.n || 1), 0);
      const b = typeof d.s.budget === 'number' ? d.s.budget : 400;
      return { d, pp, all, b, g25: (d.f || []).includes('2.5g'), bt: (d.f || []).includes('poe++') };
    })
    .filter((c) => apPlan.ap.id !== 'ap1070c' || c.bt);
  let best: any = null;
  for (const c of cands) {
    const units = Math.max(1, Math.ceil(poePorts / c.pp), Math.ceil(load / c.b));
    const fitsAll = units * c.all >= total;
    const cost = units * 10 + (c.all > 30 ? 4 : 0) - (want25 && c.g25 ? 3 : 0) + (fitsAll ? 0 : 2);
    if (!best || cost < best.cost) best = { ...c, units, fitsAll, cost };
  }
  const rest = best && !best.fitsAll ? Math.max(0, total - best.units * best.all) : 0;
  const extra = rest > 0 ? (rest <= 8 ? byId.swg2100 : rest <= 24 ? byId.swg2282x : byId.swg2542x) : null;
  const extraCap = extra ? (extra.id === 'swg2100' ? 8 : extra.id === 'swg2282x' ? 24 : 48) : 1;
  return { poePorts, load, total, best, extra, extraN: extra ? Math.ceil(rest / extraCap) : 0 };
}

export function advise(A: Needs, lang: Lang) {
  const routers = devices.filter((d) => d.cat === 'router' && d.st === 'cur' && !['v166', 'v167', 'v180'].includes(d.id));
  const ev = routers.map((d) => evalRouter(d, A, lang)).sort((a, b) => a.fails - b.fails || a.over - b.over);
  const top = ev.slice(0, 3);
  const ap = planAp(A);
  const sw = planSwitch(A, ap);
  const r0 = top[0]?.d;
  const apm = r0 && typeof r0.s.apm === 'number' ? (r0.s.apm as number) : null;
  const svc: { id: string; vi: string; en: string }[] = [];
  if (A.sites >= 5) svc.push({ id: 'acs3', vi: 'quản lý tập trung, SD-WAN cho nhiều chi nhánh', en: 'central management and SD-WAN for many branches' });
  if (A.sec) svc.push({ id: 'threat', vi: 'cho Vigor2136, 2767, 2867, 2928', en: 'for Vigor2136, 2767, 2867, 2928' });
  if (A.hotspot) svc.push({ id: 'acs3', vi: 'máy chủ captive portal, thống kê khách (tuỳ chọn)', en: 'captive portal server with guest analytics (optional)' });
  if (A.remote > 0) svc.push({ id: 'smartvpn', vi: 'ứng dụng VPN miễn phí cho nhân viên', en: 'free VPN app for staff' });
  if (ap.n > 10 && !A.sites) svc.push({ id: 'vconnect', vi: 'quản lý nhiều AP/switch trong LAN', en: 'manage many APs/switches on the LAN' });
  if (sw.best && /SFP\+/.test(L(sw.best.d.s.uplink, lang) || '') && r0 && maxPort(r0) >= 10000) {
    svc.push({ id: 'daccx10', vi: 'nối router và switch qua SFP+ 10G', en: 'link router and switch over 10G SFP+' });
  }
  return { top, ap, sw, apm, svc };
}
