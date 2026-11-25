// Team Card and Poster: a long team name's lines are spaced by the size they are drawn at (code review FP-5, Nov 16).
// The fallback loops ("for (fz = 40; ... && !TL; fz -= 2)") stepped the size down once more after the name fitted, so the
// lines were drawn at one size and spaced by a smaller one (they touched). Only names too long for two lines reach it.
// Exit 1 on any failure (2 fail on the build before the fix).   PAGE=app/dist/v2.html node app/test/share-fz.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const NAME = 'Wonderfully Overgrown Rain Team Name That Keeps Going Well Past Two Lines Of Text';
const r = await p.evaluate(n => window.__ev(`(async () => { const keep = ARB.facts, ft = CanvasRenderingContext2D.prototype.fillText, out = {};
  let rec = null; CanvasRenderingContext2D.prototype.fillText = function (t, x, y) { if (rec && /italic 800/.test(this.font) && ${JSON.stringify(n)}.includes(String(t).trim()) && String(t).trim().length > 3) rec.push({t, y, px: parseFloat(this.font.match(/(\\d+(?:\\.\\d+)?)px/)[1])}); return ft.apply(this, arguments); };
  ARB.facts = (ms, nm) => Object.assign(keep(ms, nm), {name: ${JSON.stringify(n)}});
  try { for (const [k, fn] of [['card', () => ARB.card()], ['poster', () => ARB.poster(members())]]) { rec = []; await fn(); out[k] = rec; } }
  finally { ARB.facts = keep; CanvasRenderingContext2D.prototype.fillText = ft; }
  return out; })()`), NAME);
for (const k of ['card', 'poster']) {
  const L = r[k] || [], gaps = L.slice(1).map((l, i) => +(l.y - L[i].y).toFixed(2)), want = L.length ? +(L[0].px * 1.02).toFixed(2) : 0;
  ok(L.length >= 3, `${k}: the long name is drawn on 3 lines (${L.length}: ${L.map(l => l.t).join(' / ')})`);
  ok(L.length >= 2 && gaps.every(g => Math.abs(g - want) < 0.05), `${k}: lines drawn at ${L[0] && L[0].px}px are spaced ${want}px apart (gaps ${gaps.join(', ')})`); }
await b.close();
console.log(`share-fz: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
