import { useEffect, useMemo, useState } from 'preact/hooks';
import { L, status, imageOf } from '../lib/data';
import { advise, defaultNeeds, SPEEDS, variantHint, type Needs } from '../lib/advisor';
import { T } from '../lib/i18n';
import { href, asset } from '../lib/ui';
import type { Lang } from '../lib/types';
import { byId } from '../lib/data';

export default function Advisor({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [A, setA] = useState<Needs>(defaultNeeds());
  useEffect(() => {
    try { const s = localStorage.getItem('adv'); if (s) setA({ ...defaultNeeds(), ...JSON.parse(s) }); } catch { /* ignore */ }
  }, []);
  const set = (patch: Partial<Needs>) => {
    const next = { ...A, ...patch };
    setA(next);
    try { localStorage.setItem('adv', JSON.stringify(next)); } catch { /* ignore */ }
  };
  const out = useMemo(() => advise(A, lang), [A, lang]);
  const num = (k: keyof Needs, min = 0, max = 5000) => (
    <input id={`a-${k}`} type="number" inputMode="numeric" min={min} max={max} value={A[k] as number} onInput={(e) => set({ [k]: Math.max(min, Math.min(max, +(e.target as HTMLInputElement).value || 0)) } as Partial<Needs>)} />
  );
  const ck = (k: keyof Needs, lab: string) => (
    <label class="check"><input type="checkbox" checked={!!A[k]} onChange={(e) => set({ [k]: (e.target as HTMLInputElement).checked } as Partial<Needs>)} /> {t[lab]}</label>
  );
  const { top, ap, sw, apm, svc } = out;

  return (
    <div class="adv">
      <form class="form" autocomplete="off" onSubmit={(e) => e.preventDefault()}>
        <fieldset><legend>{t.fNet}</legend>
          <div class="two">
            <div class="field"><label for="a-users">{t.fUsers}</label>{num('users', 1)}</div>
            <div class="field"><label for="a-lines">{t.fLines}</label>{num('lines', 1, 8)}</div>
          </div>
          <div class="field"><label for="a-speed">{t.fSpeed}</label>
            <select id="a-speed" value={A.speed} onChange={(e) => set({ speed: +(e.target as HTMLSelectElement).value })}>
              {SPEEDS.map(([v, l]) => <option value={v}>{l}</option>)}
            </select>
          </div>
          <div class="field"><label for="a-line">{t.fLine}</label>
            <select id="a-line" value={A.line} onChange={(e) => set({ line: (e.target as HTMLSelectElement).value as Needs['line'] })}>
              <option value="eth">{t.lineEth}</option><option value="dsl">{t.lineDsl}</option><option value="cell">{t.lineCell}</option>
            </select>
          </div>
        </fieldset>
        <fieldset><legend>{t.fVpn}</legend>
          <div class="two">
            <div class="field"><label for="a-sites">{t.fSites}</label>{num('sites')}</div>
            <div class="field"><label for="a-remote">{t.fRemote}</label>{num('remote')}</div>
          </div>
        </fieldset>
        <fieldset><legend>{t.fNeeds}</legend>
          {ck('wifi', 'nWifi')}{ck('backup', 'nBackup')}{ck('ha', 'nHa')}{ck('hotspot', 'nHotspot')}{ck('iptv', 'nIptv')}{ck('voip', 'nVoip')}{ck('sec', 'nSec')}
        </fieldset>
        <fieldset><legend>{t.fWifi}</legend>
          <div class="field"><label for="a-wifiUsers">{t.fWifiUsers}</label>{num('wifiUsers')}</div>
          <div class="field"><label for="a-env">{t.fEnv}</label>
            <select id="a-env" value={A.env} onChange={(e) => set({ env: (e.target as HTMLSelectElement).value as Needs['env'] })}>
              {([['office', 'envOffice'], ['desk', 'envDesk'], ['dense', 'envDense'], ['out', 'envOut']] as const).map(([v, l]) => <option value={v}>{t[l]}</option>)}
            </select>
          </div>
          <div class="two">
            <div class="field"><label for="a-wired">{t.fWired}</label>{num('wired')}</div>
            <div class="field"><label for="a-cams">{t.fCams}</label>{num('cams')}</div>
          </div>
        </fieldset>
      </form>

      <div aria-live="polite">
        <h2 style="margin-bottom:14px">{t.rPick}</h2>
        {top[0] && top[0].fails > 0 && <div class="box warn" style="margin-bottom:14px">{t.noFit}</div>}
        {top.map((e, idx) => {
          const img = imageOf(e.d.id);
          const hint = variantHint(e.d, A);
          return (
            <div class="pick" key={e.d.id}>
              <div class="hd">
                <span class="rank">{t.rank(idx + 1)}</span>
                <h3><a href={href(lang, `devices/${e.d.id}`)}>{e.d.m}</a></h3>
                <span class={`pill ${status(e.d)}`}>{t.st[status(e.d)]}</span>
                {hint && <span style="font-size:.9rem">{t.chooseVar}: <b class="mono">{hint}</b></span>}
              </div>
              <div class="body-row">
                {img ? <img class="photo" src={asset(`img/devices/${img.thumb}`)} alt={e.d.m} /> : <span />}
                <div>
                  <p class="muted" style="margin-bottom:8px">{L(e.d.t, lang)}</p>
                  <ul class="checks">{e.ck.map((c) => <li class={c.ok ? '' : 'x'}>{c.txt}</li>)}</ul>
                </div>
              </div>
            </div>
          );
        })}

        <div class="two-col" style="margin-top:8px">
          <div class="box">
            <h3>{t.rAp}</h3>
            {ap.n ? (
              <>
                <span class="big">{ap.n}× <a href={href(lang, `devices/${ap.ap.id}`)} style="font-family:var(--font);font-size:1.1rem;font-weight:700">{ap.ap.m}</a></span>
                <span class="muted" style="font-size:.9rem">{L(ap.ap.t, lang)}</span>
                {apm != null && <span style={`font-size:.9rem;color:var(--${apm >= ap.n ? 'accent' : 'crit'})`}>{t.c[apm >= ap.n ? 'apm' : 'apmX'](apm, ap.n)}</span>}
              </>
            ) : <span class="muted">—</span>}
          </div>
          <div class="box">
            <h3>{t.rSw}</h3>
            {sw.best && (
              <>
                <span class="big">{sw.best.units}× <a href={href(lang, `devices/${sw.best.d.id}`)} style="font-family:var(--font);font-size:1.1rem;font-weight:700">{sw.best.d.m}</a></span>
                <span class="muted" style="font-size:.9rem">{L(sw.best.d.t, lang)}</span>
              </>
            )}
            {sw.extra && <span>+ {sw.extraN}× <a href={href(lang, `devices/${sw.extra.id}`)}>{sw.extra.m}</a></span>}
            <span style="font-size:.9rem">{t.swPlan}: <b class="mono">{sw.poePorts} PoE · {sw.load} W · {sw.total} {lang === 'vi' ? 'cổng' : 'ports'}</b></span>
          </div>
          {svc.length > 0 && (
            <div class="box">
              <h3>{t.rSvc}</h3>
              <ul style="margin:0;padding-left:18px;display:grid;gap:4px">
                {svc.map((s) => <li><a href={href(lang, `devices/${s.id}`)}>{byId[s.id].m}</a> — {lang === 'vi' ? s.vi : s.en}</li>)}
              </ul>
            </div>
          )}
        </div>
        <p class="muted" style="margin-top:14px;font-size:.88rem">{t.advSub}</p>
      </div>
    </div>
  );
}
