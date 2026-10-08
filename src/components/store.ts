// Compare selection shared across pages via localStorage ("cmp"), max 4 devices.
export const MAX = 4;
export const readCmp = (): string[] => { try { return JSON.parse(localStorage.getItem('cmp') || '[]'); } catch { return []; } };
export const writeCmp = (v: string[]) => {
  try { localStorage.setItem('cmp', JSON.stringify(v)); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event('cmp-change'));
};
