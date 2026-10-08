// Natural-language device search (Vietnamese without diacritics, English) and scoring.
import { devices, uses, useById, norm, L } from './data';
import { FLAG } from './labels';
import type { Device, Lang } from './types';

const STOP = new Set(
  norm(
    'cho can toi minh voi va hoac co the la mot nhung cac de dung su dung thiet bi can loai nao gi the for the a an and or with need needs want my our of to in on use using device',
  ).split(' '),
);

const SYN: [RegExp, string][] = [
  [/\b(10 ?g|10 ?gbps|10 ?gbe|10 gigabit)\b/, '10g'],
  [/\b(2[.,]5 ?g|2[.,]5 ?gbps|2[.,]5 ?gbe|multi ?gig)\b/, '2.5g'],
  [/\bsfp\+|sfpp\b/, 'sfp+'],
  [/\bsfp\b(?!\+)/, 'sfp'],
  [/\bwi-?fi ?7\b|\b802\.11be\b/, 'wifi7'],
  [/\bwi-?fi ?6\b|\b802\.11ax\b/, 'wifi6'],
  [/\bwi-?fi ?5\b|\b802\.11ac\b/, 'wifi5'],
  [/\b(4g|lte)\b/, 'lte'],
  [/\b5g\b/, '5g'],
  [/\bwireguard\b/, 'wg'],
  [/\bopenvpn\b/, 'openvpn'],
  [/\bssl ?vpn\b/, 'ssl'],
  [/\bbgp\b/, 'bgp'],
  [/\bospf\b/, 'ospf'],
  [/\bpoe\+\+|802\.3bt\b/, 'poe++'],
  [/\bpoe\b/, 'poe'],
  [/\bxgs-?pon\b/, 'xgspon'],
  [/\bg?pon\b/, 'pon'],
  [/\b(vdsl|adsl|dsl)\b/, 'dsl'],
  [/\bg\.?fast\b/, 'gfast'],
  [/\b(fxs|voip)\b/, 'voip'],
  [/\bdocker|suricata\b/, 'docker'],
  [/\bmesh\b/, 'mesh'],
  [/\b(high availability|\bha\b)\b/, 'ha'],
  [/\bstack(ing)?\b|xep chong/, 'stack'],
  [/\bonvif\b/, 'onvif'],
  [/\bngoai troi|outdoor\b/, 'outdoor'],
  [/\b(can bang tai|load ?balanc\w*)\b/, 'lb'],
  [/\bthreat protection\b/, 'threat'],
  [/\b(fanless|khong quat|silent|em)\b/, 'fanless'],
  [/\b(rack|1u)\b/, 'rack'],
];

const NUMI: [RegExp, string][] = [
  [/(\d+)\s*(nguoi|user|users|nhan vien|staff|may tinh|pc|khach|guests?|people|clients?)\b/, 'users'],
  [/(\d+)\s*(chi nhanh|branch(es)?|sites?|van phong|offices?|tunnels?|kenh vpn|vpn)\b/, 'vpn'],
  [/(\d+)\s*(wan|duong( truyen| mang| internet)?|lines?|isp|nha mang)\b/, 'wan'],
  [/(\d+)\s*(camera|cam|cameras)\b/, 'cams'],
];

const ALIAS: Record<string, string[]> = {
  lte: ['lte', '5g', 'usbmodem'],
  sfp: ['sfp', 'sfp+'],
  poe: ['poe', 'poe++'],
  pon: ['pon', 'xgspon'],
  dsl: ['dsl', 'gfast'],
};

export const hasFlag = (d: Device, f: string) => (ALIAS[f] || [f]).some((x) => (d.f || []).includes(x));

const flagLabel = (k: string, lang: Lang) => (FLAG[k] ? FLAG[k][lang === 'vi' ? 0 : 1] : k);
const useLabel = (id: string, lang: Lang) => (useById[id] ? (lang === 'vi' ? useById[id].v : useById[id].e) : id);

type Hay = { all: string; model: string; uses: string[] };
const HAY: Record<string, Hay> = {};
function hay(d: Device): Hay {
  if (HAY[d.id]) return HAY[d.id];
  const parts = [
    d.m,
    d.id,
    ...(d.var || []).map((v) => v[0] + ' ' + (v[1].v || '') + ' ' + (v[1].e || '')),
    d.t.v,
    d.t.e,
    ...(d.uses || []).flatMap((u) => [useById[u]?.v, useById[u]?.e, useById[u]?.k]),
    ...(d.f || []).flatMap((f) => FLAG[f] || [f]),
    ...Object.values(d.s || {}).map((v) => (v && typeof v === 'object' ? (v.v || '') + ' ' + (v.e || '') : String(v))),
    ...(d.hw ? Object.values(d.hw).map((v: any) => (v && typeof v === 'object' ? (v.v || '') + ' ' + (v.e || '') : String(v))) : []),
  ];
  return (HAY[d.id] = {
    all: norm(parts.join(' ')),
    model: norm(d.m + ' ' + (d.var || []).map((v) => v[0]).join(' ')),
    uses: (d.uses || []).map((u) => norm(useById[u]?.v + ' ' + useById[u]?.e + ' ' + useById[u]?.k)),
  });
}

export interface Parsed {
  flags: Set<string>;
  nums: Record<string, number>;
  words: string[];
  uses: string[];
}

export function parseQuery(q: string): Parsed {
  let s = ' ' + norm(q) + ' ';
  const flags = new Set<string>();
  const nums: Record<string, number> = {};
  for (const [re, key] of NUMI) {
    const m = s.match(re);
    if (m) {
      nums[key] = +m[1];
      s = s.replace(m[0], ' ');
    }
  }
  for (const [re, f] of SYN) {
    if (re.test(s)) {
      flags.add(f);
      s = s.replace(re, ' ');
    }
  }
  if (nums.cams) flags.add('poe');
  const words = s.split(/[^a-z0-9.+-]+/).filter((w) => w && w.length > 1 && !STOP.has(w));
  const matched = uses
    .filter((u) => {
      const k = norm(u.v + ' ' + u.e + ' ' + u.k).split(/\s+/);
      return words.length > 0 && words.filter((w) => k.includes(w)).length >= Math.min(2, words.length);
    })
    .map((u) => u.id);
  if (nums.cams && !matched.includes('camera')) matched.push('camera');
  return { flags, nums, words, uses: matched };
}

export function scoreDevice(d: Device, P: Parsed, lang: Lang): { sc: number; why: string[] } | null {
  const H = hay(d);
  let sc = 0;
  const why: string[] = [];
  for (const f of P.flags) {
    if (!hasFlag(d, f)) return null;
    why.push(flagLabel(f, lang));
    sc += 4;
  }
  if (d.cat === 'router') {
    if (P.nums.users && !(d.u && d.u[1] >= P.nums.users)) return null;
    if (P.nums.vpn && !(typeof d.s.vpn === 'number' && d.s.vpn >= P.nums.vpn)) return null;
    if (P.nums.wan && !(typeof d.s.wanmax === 'number' && d.s.wanmax >= P.nums.wan)) return null;
  } else if (P.nums.users || P.nums.vpn || P.nums.wan) {
    sc -= 3;
  }
  let hits = 0;
  for (const w of P.words) {
    if (H.model.includes(w)) {
      sc += 12;
      hits++;
      continue;
    }
    if (H.uses.some((u) => u.split(/\s+/).includes(w))) {
      sc += 3;
      hits++;
      continue;
    }
    if (H.all.includes(w)) {
      sc += 1;
      hits++;
    }
  }
  if (P.words.length && hits < Math.ceil(P.words.length / 2)) return null;
  for (const u of P.uses) if ((d.uses || []).includes(u)) {
    sc += 6;
    why.push(useLabel(u, lang));
  }
  if (d.st === 'cur') sc += 1;
  return { sc, why };
}

export interface Filters {
  q: string;
  cat: 'all' | 'router' | 'ap' | 'switch' | 'more';
  uses: string[];
  feats: string[];
  old: boolean;
  sort: 'rel' | 'name' | 'perf' | 'vpn' | 'users';
  min: { users: number; vpn: number; wan: number; sess: number };
}

export const defaultFilters = (): Filters => ({
  q: '',
  cat: 'all',
  uses: [],
  feats: [],
  old: false,
  sort: 'rel',
  min: { users: 0, vpn: 0, wan: 0, sess: 0 },
});

export function filterDevices(S: Filters, lang: Lang) {
  const P = parseQuery(S.q);
  const hasQ = S.q.trim().length > 0;
  const list: { d: Device; sc: number; why: string[] }[] = [];
  for (const d of devices) {
    if (S.cat !== 'all' && d.cat !== S.cat) continue;
    const r = hasQ ? scoreDevice(d, P, lang) : { sc: 0, why: [] as string[] };
    if (!r) continue;
    const modelHit = hasQ && P.words.some((w) => hay(d).model.includes(w));
    if (!S.old && d.st !== 'cur' && !modelHit) continue;
    if (S.uses.some((u) => !(d.uses || []).includes(u))) continue;
    if (S.feats.some((f) => !(d.f || []).includes(f))) continue;
    if (S.min.users && !(d.cat === 'router' && d.u && d.u[1] >= S.min.users)) continue;
    if (S.min.vpn && !(typeof d.s.vpn === 'number' && d.s.vpn >= S.min.vpn)) continue;
    if (S.min.wan && !(typeof d.s.wanmax === 'number' && d.s.wanmax >= S.min.wan)) continue;
    if (S.min.sess && !(typeof d.s.sess === 'number' && d.s.sess >= S.min.sess)) continue;
    list.push({ d, ...r });
  }
  const num = (d: Device, k: string) => (typeof d.s[k] === 'number' ? d.s[k] : -1);
  const idx = (d: Device) => devices.indexOf(d);
  const sorters: Record<string, (a: any, b: any) => number> = {
    rel: (a, b) => b.sc - a.sc || idx(a.d) - idx(b.d),
    name: (a, b) => a.d.m.localeCompare(b.d.m, 'en', { numeric: true }),
    perf: (a, b) => num(b.d, 'nat') - num(a.d, 'nat'),
    vpn: (a, b) => num(b.d, 'vpn') - num(a.d, 'vpn'),
    users: (a, b) => (b.d.u || [0, 0])[1] - (a.d.u || [0, 0])[1],
  };
  list.sort(sorters[S.sort] || sorters.rel);
  return { list, P };
}
