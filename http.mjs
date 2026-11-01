// Polite outbound requests for the daily data job (Nov 1 2026, legal pass; see docs/legal-sources.md).
// Every request names NastyPlot, links the repo and gives a contact address, so a site owner can see who we are and
// reach us. Requests to the same host are spaced at least 1 second apart (a script's own longer pause still applies).
export const CONTACT = 'simran.jsbagga@gmail.com';
export const REPO = 'https://github.com/theresearchmode-glitch/pokelair-data';
export const UA = `NastyPlot-data/1.0 (+${REPO}; ${CONTACT})`;
export const MIN_GAP_MS = 1100; /* 1 s, plus slack for timer and network jitter */
const last = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
// wait until at least MIN_GAP_MS has passed since the last request to this URL's host
export async function pace(url) { let h = ''; try { h = new URL(url).host; } catch (e) { return; }
  /* the slot is reserved before waiting, so requests started at the same time still go out one gap apart */
  const now = Date.now(), at = Math.max(now, (last.get(h) || 0) + MIN_GAP_MS); last.set(h, at); if (at > now) await sleep(at - now); }
// fetch() with the NastyPlot User-Agent and per-host pacing; any other headers or options pass straight through
export async function politeFetch(url, opt = {}) { await pace(url);
  const headers = {...(opt.headers || {})}; for (const k of Object.keys(headers)) if (k.toLowerCase() === 'user-agent') delete headers[k];
  return fetch(url, {...opt, headers: {'User-Agent': UA, ...headers}}); }
