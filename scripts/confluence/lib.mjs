// Confluence helpers: small Markdown -> storage-format converter and a REST v2 client.
// Credentials come from the process environment (JIRA_URL, JIRA_EMAIL, JIRA_TOKEN); never printed.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[\[([^\]]+)\]\]/g, (_, t) => `<ac:link><ri:page ri:content-title="${t.replace(/"/g, '&quot;')}" /><ac:plain-text-link-body><![CDATA[${t}]]></ac:plain-text-link-body></ac:link>`);
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

const macro = (name, body, params = {}) =>
  `<ac:structured-macro ac:name="${name}">${Object.entries(params).map(([k, v]) => `<ac:parameter ac:name="${k}">${esc(v)}</ac:parameter>`).join('')}<ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`;

/** Convert a small Markdown subset to Confluence storage format. */
export function md(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if (l.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      out.push(`<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[${buf.join('\n')}]]></ac:plain-text-body></ac:structured-macro>`);
    } else if ((m = l.match(/^(#{1,4})\s+(.*)$/))) {
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
      i++;
    } else if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(`<table><tbody><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    } else if (/^[-*]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ''));
      out.push(`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`);
    } else if (/^\d+\.\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ''));
      out.push(`<ol>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`);
    } else if ((m = l.match(/^:::(info|note|warning|tip)\s*$/))) {
      const buf = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') buf.push(lines[i++]);
      i++;
      out.push(macro(m[1], md(buf.join('\n'))));
    } else {
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\||[-*]\s|\d+\.\s|```|:::)/.test(lines[i])) buf.push(lines[i++]);
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
  }
  return out.join('');
}

export function client() {
  const { JIRA_URL, JIRA_EMAIL, JIRA_TOKEN } = process.env;
  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_TOKEN) throw new Error('JIRA_URL, JIRA_EMAIL and JIRA_TOKEN must be set in the environment');
  const base = JIRA_URL.replace(/\/$/, '');
  const auth = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
  const call = async (method, path, body) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(base + path, {
        method,
        headers: { Authorization: auth, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 3000 * (attempt + 1))); continue; }
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${json.message || json.errors?.[0]?.title || text.slice(0, 200)}`);
      return json;
    }
    throw new Error(`${method} ${path}: retries exhausted`);
  };
  return {
    base,
    getSpace: async (key) => (await call('GET', `/wiki/api/v2/spaces?keys=${encodeURIComponent(key)}`)).results[0],
    findPage: async (spaceId, title) => (await call('GET', `/wiki/api/v2/spaces/${spaceId}/pages?title=${encodeURIComponent(title)}&limit=5`)).results[0],
    getPage: (id) => call('GET', `/wiki/api/v2/pages/${id}?body-format=storage&include-version=true`),
    createPage: (spaceId, title, parentId, value) => call('POST', '/wiki/api/v2/pages', { spaceId, status: 'current', title, parentId, body: { representation: 'storage', value } }),
    updatePage: (id, title, value, version, message) => call('PUT', `/wiki/api/v2/pages/${id}`, { id, status: 'current', title, body: { representation: 'storage', value }, version: { number: version, message } }),
    addLabels: (id, names) => call('POST', `/wiki/rest/api/content/${id}/label`, names.map((name) => ({ prefix: 'global', name }))),
  };
}
