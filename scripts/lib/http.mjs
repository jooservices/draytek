// Polite HTTP helper: browser-like UA, spacing between requests, retry with backoff on 429/5xx.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;

export async function fetchText(url, { delay = 1000, retries = 3 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const wait = Math.max(0, last + delay - Date.now());
    if (wait) await sleep(wait);
    last = Date.now();
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) });
      if (res.status === 404) return { status: 404, text: '' };
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) return { status: res.status, text: '' };
      return { status: 200, text: await res.text() };
    } catch (e) {
      if (attempt === retries) throw new Error(`${url}: ${e.message}`);
      await sleep(5000 * 2 ** attempt); // 5s, 10s, 20s
    }
  }
}
