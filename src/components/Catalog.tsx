import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { devices, L, status, imageOf, useById, uses } from '../lib/data';
import { filterDevices, defaultFilters, parseQuery, type Filters } from '../lib/search';
import { FLAG } from '../lib/labels';
import { T } from '../lib/i18n';
import { href, asset } from '../lib/ui';
import { fmtMbps, fmtK } from '../lib/format';
import { readCmp, writeCmp, MAX } from './store';
import type { Lang, Device } from '../lib/types';

const FEATS = ['10g', '2.5g', 'sfp+', 'wifi6', 'wifi7', 'lte', '5g', 'wg', 'ssl', 'ha', 'bgp', 'poe', 'poe++', 'stack', 'mesh', 'outdoor', 'threat', 'docker', 'fanless', 'rack'];

function keyVals(d: Device, lang: Lang): [string, string][] {
  const s = d.s;
  const v = (x: any) => L(x, lang);
  if (d.cat === 'router') {
    return [
      ['NAT', typeof s.nat === 'number' ? fmtMbps(s.nat) : '—'],
      ['VPN', typeof s.vpn === 'number' ? String(s.vpn) : '—'],
      ['WAN', typeof s.wanmax === 'number' ? String(s.wanmax) : '—'],
      ['Sessions', typeof s.sess === 'number' ? fmtK(s.sess) : '—'],
    ];
  }
  if (d.cat === 'ap') return [[lang === 'vi' ? 'Chuẩn' : 'Std', String(v(s.std) ?? '—')], [lang === 'vi' ? 'Tốc độ' : 'Link', String(v(s.link) ?? '—')]];
  if (d.cat === 'switch') return [[lang === 'vi' ? 'Cổng' : 'Ports', String(v(s.ports) ?? '—')], ['PoE', typeof s.budget === 'number' ? s.budget + ' W' : '—']];
  return [[lang === 'vi' ? 'Loại' : 'Type', String(v(s.kind) ?? '—')]];
}

const numLabel = (k: string, n: number, lang: Lang) => {
  const vi = lang === 'vi';
  const m: Record<string, [string, string]> = { users: ['người dùng', 'users'], vpn: ['kênh VPN', 'VPN tunnels'], wan: ['đường WAN', 'WAN lines'], cams: ['camera', 'cameras'] };
  return `≥ ${n} ${m[k]?.[vi ? 0 : 1] ?? k}`;
};

export default function Catalog({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [S, setS] = useState<Filters>(defaultFilters());
  const [cmp, setCmp] = useState<string[]>([]);
  const [shown, setShown] = useState(36);
  const railRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const f = defaultFilters();
    f.q = p.get('q') || '';
    const c = p.get('cat');
    if (c && ['router', 'ap', 'switch', 'more'].includes(c)) f.cat = c as Filters['cat'];
    const u = p.get('use');
    if (u && useById[u]) f.uses = [u];
    setS(f);
    if (railRef.current && window.innerWidth <= 900) railRef.current.open = false;
    setCmp(readCmp());
    const sync = () => setCmp(readCmp());
    window.addEventListener('cmp-change', sync);
    return () => window.removeEventListener('cmp-change', sync);
  }, []);

  const { list, P } = useMemo(() => filterDevices(S, lang), [S, lang]);
  const upd = (patch: Partial<Filters>) => { setS({ ...S, ...patch }); setShown(36); };
  const toggle = (arr: string[], x: string) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);
  const toggleCmp = (id: string) => {
    const cur = readCmp();
    const i = cur.indexOf(id);
    if (i >= 0) cur.splice(i, 1); else if (cur.length < MAX) cur.push(id);
    writeCmp(cur);
  };
  const understood = [...P.flags].length + Object.keys(P.nums).length + P.uses.length > 0;
  const cats: [Filters['cat'], string][] = [['all', t.all], ['router', t.router], ['ap', t.ap], ['switch', t.switch], ['more', t.more]];
  const reset = () => { setS(defaultFilters()); setShown(36); };

  return (
    <div class="cat-layout">
      <details class="rail" ref={railRef} aria-label={t.filters} open>
        <summary>{t.filters}</summary>
        <div class="field">
          <label for="cq">{t.sLabel}</label>
          <input id="cq" type="search" value={S.q} placeholder={t.sPh} onInput={(e) => upd({ q: (e.target as HTMLInputElement).value })} />
        </div>
        <div>
          <h3>{t.usesH}</h3>
          <div class="opts">
            {uses.map((u) => (
              <button type="button" class="chip" aria-pressed={S.uses.includes(u.id)} onClick={() => upd({ uses: toggle(S.uses, u.id) })}>{lang === 'vi' ? u.v : u.e}</button>
            ))}
          </div>
        </div>
        <div>
          <h3>{t.featH}</h3>
          <div class="opts">
            {FEATS.map((f) => (
              <button type="button" class="chip" aria-pressed={S.feats.includes(f)} onClick={() => upd({ feats: toggle(S.feats, f) })}>{FLAG[f]?.[lang === 'vi' ? 0 : 1] ?? f}</button>
            ))}
          </div>
        </div>
        <div>
          <h3>{t.specH}</h3>
          <div class="two">
            {([['users', t.minUsers], ['vpn', t.minVpn], ['wan', t.minWan]] as const).map(([k, lab]) => (
              <div class="field">
                <label for={`m-${k}`}>{lab}</label>
                <input id={`m-${k}`} type="number" min="0" inputMode="numeric" value={S.min[k] || ''} placeholder={t.any} onInput={(e) => upd({ min: { ...S.min, [k]: +(e.target as HTMLInputElement).value || 0 } })} />
              </div>
            ))}
          </div>
        </div>
        <label class="check"><input type="checkbox" checked={S.old} onChange={(e) => upd({ old: (e.target as HTMLInputElement).checked })} /> {t.showOld}</label>
        <button type="button" class="btn sm" onClick={reset}>{t.reset}</button>
      </details>

      <section>
        <div class="tabs" role="tablist">
          {cats.map(([c, lab]) => (
            <button type="button" role="tab" class="chip" aria-pressed={S.cat === c} aria-selected={S.cat === c} onClick={() => upd({ cat: c })}>{lab}</button>
          ))}
        </div>
        <div class="bar">
          <strong>{t.results(list.length)}</strong>
          <label class="check">{t.sort}
            <select value={S.sort} onChange={(e) => upd({ sort: (e.target as HTMLSelectElement).value as Filters['sort'] })} style="padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--surface)">
              <option value="rel">{t.sRel}</option><option value="name">{t.sName}</option><option value="perf">{t.sPerf}</option><option value="vpn">{t.sVpn}</option><option value="users">{t.sUsers}</option>
            </select>
          </label>
        </div>
        {understood && S.q && (
          <p class="parsed">{t.understood} {[...P.flags].map((f) => FLAG[f]?.[lang === 'vi' ? 0 : 1] ?? f).concat(P.uses.map((u) => (lang === 'vi' ? useById[u].v : useById[u].e))).concat(Object.entries(P.nums).map(([k, n]) => numLabel(k, n, lang))).join(' · ')}</p>
        )}
        {list.length === 0 ? <div class="empty">{t.none}</div> : (
          <div class="grid">
            {list.slice(0, shown).map(({ d, why }) => {
              const img = imageOf(d.id);
              const st = status(d);
              const on = cmp.includes(d.id);
              return (
                <article class="card" key={d.id}>
                  <div class="pic">
                    {img ? <img class="photo" src={asset(`img/devices/${img.thumb}`)} alt={d.m} width={400} height={Math.round((400 * img.h) / img.w)} loading="lazy" decoding="async" /> : <PortStrip d={d} />}
                  </div>
                  <div class="body">
                    <span class={`pill ${st}`}>{t.st[st]}</span>
                    <h3><a href={href(lang, `devices/${d.id}`)}>{d.m}</a></h3>
                    <p class="muted" style="font-size:.92rem">{L(d.t, lang)}</p>
                    <div class="kv">{keyVals(d, lang).map(([k, v]) => <span>{k} <b>{v}</b></span>)}</div>
                    {why.length > 0 && <div class="why">{why.map((w) => <span>{w}</span>)}</div>}
                    <div class="actions">
                      <button type="button" class="btn sm" disabled={!on && cmp.length >= MAX} onClick={() => toggleCmp(d.id)}>{on ? t.added : cmp.length >= MAX ? t.full : t.add}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {list.length > shown && <div style="text-align:center;margin-top:20px"><button type="button" class="btn" onClick={() => setShown(shown + 36)}>{lang === 'vi' ? `Xem thêm (${list.length - shown})` : `Show more (${list.length - shown})`}</button></div>}
      </section>

      {cmp.length > 0 && (
        <div class="cmp-bar" role="status">
          <span class="mono">{t.cmpN(cmp.length)}</span>
          <button type="button" class="link" onClick={() => writeCmp([])}>{t.clearAll}</button>
          <a class="btn sm" href={href(lang, 'compare')}>{t.goCmp}</a>
        </div>
      )}
    </div>
  );
}

function PortStrip({ d }: { d: Device }) {
  const ports = (d.fp || []).slice(0, 8);
  return (
    <div class="plate" style="border:0;background:transparent;justify-content:center">
      {ports.map((p) => (
        <div class={`pg r-${p.r}`}><div class="gl">{Array.from({ length: Math.min(p.n || 1, 8) }, () => <i class={`port ${p.m}${p.poe ? ' poe' : ''}`} />)}</div></div>
      ))}
    </div>
  );
}
