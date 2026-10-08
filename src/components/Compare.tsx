import { useEffect, useState } from 'preact/hooks';
import { byId, L, status, useById, imageOf } from '../lib/data';
import { SPEC } from '../lib/labels';
import { fmtValue } from '../lib/format';
import { T } from '../lib/i18n';
import { href, asset } from '../lib/ui';
import { readCmp, writeCmp } from './store';
import type { Lang } from '../lib/types';

export default function Compare({ lang }: { lang: Lang }) {
  const t = T[lang];
  const i = lang === 'vi' ? 0 : 1;
  const [ids, setIds] = useState<string[]>([]);
  const [only, setOnly] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('ids');
    if (fromUrl) writeCmp(fromUrl.split(',').filter((x) => byId[x]).slice(0, 4));
    setIds(readCmp().filter((x) => byId[x]));
    const sync = () => setIds(readCmp().filter((x) => byId[x]));
    window.addEventListener('cmp-change', sync);
    return () => window.removeEventListener('cmp-change', sync);
  }, []);

  const items = ids.map((id) => byId[id]);
  if (!items.length) {
    return <div class="empty">{t.cmpEmpty} <a href={href(lang, 'devices')}>{T[lang].catalog}</a></div>;
  }
  const remove = (id: string) => writeCmp(readCmp().filter((x) => x !== id));
  const share = () => {
    const url = `${location.origin}${location.pathname}?ids=${ids.join(',')}`;
    navigator.clipboard?.writeText(url);
  };
  const cats = [...new Set(items.map((d) => d.cat))];
  const groups: { label: string; rows: { label: string; vals: (string | null)[]; diff: boolean; best: number }[] }[] = [];
  for (const c of cats) {
    for (const [, gl, keys] of SPEC[c]) {
      const rows = [];
      for (const [k, lab, unit] of keys) {
        const vals = items.map((d) => (d.cat === c ? fmtValue(d.s[k], unit, lang, t.yes, t.no) : null));
        if (vals.every((v) => v == null)) continue;
        const diff = new Set(vals.map((v) => (v ?? '').toLowerCase())).size > 1;
        if (only && !diff) continue;
        const nums = items.map((d) => (typeof d.s[k] === 'number' ? (d.s[k] as number) : null));
        const present = nums.filter((n): n is number => n != null);
        const max = present.length > 1 ? Math.max(...present) : -1;
        rows.push({ label: lab[i], vals, diff, best: nums.findIndex((n) => n === max && max >= 0) });
      }
      if (rows.length) groups.push({ label: gl[i], rows });
    }
  }

  return (
    <div>
      <div class="bar">
        <label class="check"><input type="checkbox" checked={only} onChange={(e) => setOnly((e.target as HTMLInputElement).checked)} /> {t.onlyDiff}</label>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn sm" onClick={share}>{lang === 'vi' ? 'Chép link chia sẻ' : 'Copy share link'}</button>
          <button type="button" class="btn sm" onClick={() => window.print()}>{lang === 'vi' ? 'In' : 'Print'}</button>
          <button type="button" class="btn sm" onClick={() => writeCmp([])}>{t.clearAll}</button>
        </div>
      </div>
      <div class="tbl-wrap">
        <table class="cmp">
          <thead>
            <tr>
              <th></th>
              {items.map((d) => {
                const img = imageOf(d.id);
                return (
                  <th key={d.id}>
                    <div class="cmp-head">
                      {img && <img class="photo" src={asset(`img/devices/${img.thumb}`)} alt="" />}
                      <a href={href(lang, `devices/${d.id}`)} style="text-decoration:none">{d.m}</a>
                      <span class={`pill ${status(d)}`}>{t.st[status(d)]}</span>
                      <button type="button" class="btn sm" onClick={() => remove(d.id)}>{t.remove}</button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <>
                <tr class="grp"><th colSpan={items.length + 1}>{g.label}</th></tr>
                {g.rows.map((r) => (
                  <tr>
                    <th scope="row">{r.label}</th>
                    {r.vals.map((v, idx) => <td class={r.diff ? 'diff' : ''} style={r.best === idx ? 'font-weight:700' : ''}>{v == null ? <span class="nv">{t.nv}</span> : v}</td>)}
                  </tr>
                ))}
              </>
            ))}
            <tr class="grp"><th colSpan={items.length + 1}>{t.usesFor}</th></tr>
            <tr>
              <th scope="row">{t.usesFor}</th>
              {items.map((d) => <td>{(d.uses || []).map((u) => (lang === 'vi' ? useById[u]?.v : useById[u]?.e)).join(', ')}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
