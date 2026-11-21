// THE PLOT, round 3 (picture mock-up only). Three things only: PHOTOS (the two Pokemon), MARKER (the hit is a hand-drawn arrow;
// a circle = chosen; moves are highlighter swipes in their type colour), STICKY NOTES (only the two sets). Bold PLOT-blue field.
// Numbers are ROUGH stand-ins in real HP: Sneasler 155 HP, Heat Wave 137–161, faints 1 time in 4.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const REPO = 'C:/Users/simra/code/pl-mascot'; const { chromium } = createRequire(REPO + '/package.json')('playwright');
const OUT = REPO + '/calc-options/the-plot'; fs.mkdirSync(OUT, { recursive: true }); const PAGE = path.resolve(REPO, 'app/dist/v2.html');
const img = (id, c = '') => `<img class="${c}" src="../src/v2/art/${id}.webp" alt="">`;
const IC = { clear: '<circle cx="12" cy="12" r="7"/><path d="M7 17L17 7"/>', none: '<circle cx="12" cy="12" r="7"/><path d="M7 17L17 7"/>',
  sun: '<circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  rain: '<path d="M7 14.5a4 4 0 0 1 .6-7.9A5.5 5.5 0 0 1 18 8a3.3 3.3 0 0 1-.6 6.5Z" fill="currentColor" stroke="none"/><path d="M8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3"/>',
  sand: '<path d="M3 8.5h11a2.5 2.5 0 1 0-2.5-2.5M3 12.5h15a2.5 2.5 0 1 1-2.5 2.5M3 16.5h8"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
  grassy: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" fill="currentColor" stroke="none"/>',
  electric: '<path d="M13.5 2.5L5 13.5h6l-1.5 8 9-11.5h-6Z" fill="currentColor" stroke="none"/>',
  psychic: '<path d="M12 12.2a1.2 1.2 0 1 1 1.6-1.2 2.8 2.8 0 1 1-3.6 3.2 4.6 4.6 0 1 1 6.8-5.4 6.6 6.6 0 1 1-10.4 2"/>',
  misty: '<path d="M12 3.5c3.2 4 5.5 7 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2.8 2.3-5.8 5.5-9.8Z" fill="currentColor" stroke="none"/>' };
const ic = k => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const WC = { clear: '#5E5A66', sun: '#E08A00', rain: '#2A73C9', sand: '#A8742A', snow: '#3E8FB8', none: '#5E5A66', grassy: '#28843C', electric: '#B58A00', psychic: '#C2479A', misty: '#C2609A' };
const WX = [['clear', 'Clear'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']], TR = [['none', 'None'], ['grassy', 'Grassy'], ['electric', 'Electric'], ['psychic', 'Psychic'], ['misty', 'Misty']];
const FIRE = '#D2411E', GRASS = '#28843C';
const MOVES = [['Heat Wave', 'Fire', FIRE, '137–161', 'faints 1 in 4'], ['Weather Ball', 'Fire', FIRE, '195–231', 'always faints'], ['Solar Beam', 'Grass', GRASS, '51–60', '3+ hits']];
const SW = [['Hits both foes', 1], ['Screen up', 0], ['Helping Hand', 0], ['Friend Guard', 0], ['Critical hit', 0]];
const SETA = [['Item', 'Charizardite Y'], ['Ability', 'Drought'], ['Nature', 'Modest'], ['Sp. Atk points', '32']], SETD = [['Item', 'White Herb'], ['Ability', 'Unburden'], ['Nature', 'Adamant'], ['Points', 'HP 2 · Sp. Def 0']];
const ring = `<svg class="ring" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><path d="M52 5C20 2 4 16 5 31C6 48 32 57 56 55C80 53 97 43 95 27C93 11 70 2 38 7" fill="none" stroke="#E8364F" stroke-width="3.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
const kit = (cls, t, S) => `<div class="kit ${cls}"><h2 class="u">${t}</h2>${S.map(([k, v]) => `<button class="ln"><small>${k}</small><b>${v}</b></button>`).join('')}<div class="ln st"><small>Stage</small><span><button aria-label="Lower">−</button><b>±0</b><button aria-label="Raise">+</button></span></div></div>`;
const opts = (L, on) => `<div class="five">${L.map(([k, t]) => `<button class="${k === on ? 'on' : ''}" style="--k:${WC[k]}">${ic(k)}<span>${t}</span>${k === on ? ring : ''}</button>`).join('')}</div>`;
const HTML = `<div class="w"><section class="wall">
 <div class="top"><h1 class="u">The plot</h1><button class="swap u"><svg viewBox="0 0 60 34" aria-hidden="true"><path d="M4 10H52M42 3L54 10L42 17M56 24H8M18 17L6 24L18 31" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>swap them</button></div>
 <button class="ph a"><span>${img(10035)}</span><small>the muscle · Mega</small><b class="u">Charizard Y <i class="arw"></i></b></button>
 <button class="ph d"><span>${img(903)}</span><small>the target</small><b class="u">Sneasler <i class="arw"></i></b>${ring}</button>
 <div class="ans"><svg class="arrow" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true"><path d="M4 52C90 8 250 2 388 34" fill="none" stroke="#17161A" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="M362 12L390 35L354 50" fill="none" stroke="#17161A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
  <p class="l1"><span class="ty">Fire</span>Heat Wave does</p><p class="big u">137–161</p><p class="l2">damage. Sneasler has <b>155 HP</b>.</p>
  <p class="vd u"><span>Faints 1 time in 4${ring}</span></p><p class="sm u">hangs on with 0–18 HP the other three</p></div>
 <div class="blk mv"><h2 class="u">the move</h2><div class="mvs">${MOVES.map(([n, t, c, d, k], i) => `<button class="m${i ? '' : ' on'}" style="--c:${c};--r:${[-1.5, 1, -1][i]}deg"><i class="sw"></i><b class="u">${n}</b><em class="u">${d}</em><small>${t} · ${k}</small>${i ? '' : ring}</button>`).join('')}<button class="m all" style="--r:1deg"><b class="u">All moves <i class="arw"></i></b><small>every move it learns, with its damage</small></button></div></div>
 <div class="blk sky"><h2 class="u">the sky</h2>${opts(WX, 'sun')}</div>
 <div class="blk gnd"><h2 class="u">the ground</h2>${opts(TR, 'none')}</div>
 <div class="blk turn"><h2 class="u">this turn</h2><div class="sws">${SW.map(([t, on]) => `<button class="${on ? 'on' : ''}"><span>${t}</span>${on ? ring : ''}</button>`).join('')}</div></div>
 ${kit('a', "the muscle's kit", SETA)}${kit('d', "the target's kit", SETD)}
 <button class="ko"><b class="u">KO Board: your six against the top 30</b><small>18 down in one hit · 8 can go down · 4 survive</small><i class="kbar"><i style="flex:18"></i><i class="can" style="flex:8"></i><i class="sv" style="flex:4"></i></i></button>
 <p class="links"><a>How the Calc Works ›</a><a>Put this hit on the table ›</a><a>Notes on this hit ›</a></p>
</section></div>`;
const CSS = `
@media (max-width:699.98px){.np-bar{position:static!important}}
.w{--tx:#17161A;--pk:#E8364F;color:#17161A;font:400 16px/1.5 var(--b);overflow:hidden;background:#FCFAF3}
.w *{box-sizing:border-box;margin:0}.w .u{font-family:var(--u)!important;font-weight:900!important;font-style:italic!important;font-synthesis:style;letter-spacing:-.02em}.w img{display:block;object-fit:contain;max-width:none}
:where(.w) button{font:inherit;color:inherit;background:none;border:0;border-radius:0;cursor:pointer;text-align:left;padding:0}
.w .ic{width:22px;height:22px;flex:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.w .arw{display:inline-block;flex:none;width:10px;height:8px;background:currentColor;opacity:.7;clip-path:polygon(0 0,100% 0,50% 100%)}
.w .ring{position:absolute;inset:-7px -10px;width:calc(100% + 20px);height:calc(100% + 14px);pointer-events:none;overflow:visible}
.wall{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"top top" "pa pd" "ans ans" "mv mv" "sky sky" "gnd gnd" "turn turn" "ka kd" "ko ko" "lk lk";gap:20px 14px;padding:16px var(--gut) 36px;
  background:linear-gradient(rgba(0,120,191,.22) 1.5px,transparent 1.5px) 0 0/120px 120px,linear-gradient(90deg,rgba(0,120,191,.22) 1.5px,transparent 1.5px) 0 0/120px 120px,linear-gradient(rgba(0,120,191,.1) 1px,transparent 1px) 0 0/24px 24px,linear-gradient(90deg,rgba(0,120,191,.1) 1px,transparent 1px) 0 0/24px 24px,#FCFAF3}
.top{grid-area:top;display:flex;align-items:center;justify-content:space-between;gap:12px}.top h1{font-size:30px;line-height:1;transform:rotate(-2deg)}
.swap{display:flex;align-items:center;gap:8px;min-height:44px;font-size:13px}.swap svg{width:44px;height:26px}
/* photos */
.ph{position:relative;grid-area:pa;display:grid;justify-items:start;padding:8px 8px 10px;background:#fff;color:var(--tx);transform:rotate(var(--r));box-shadow:0 0 0 1px rgba(23,22,26,.1),0 18px 24px -14px rgba(0,0,0,.5)}.ph.a{--r:-3deg;--t:#CFE6F7}.ph.d{grid-area:pd;--r:3deg;--t:#F9D0D7}
.ph span{position:relative;display:block;width:100%;aspect-ratio:1;min-height:0;overflow:hidden;background:var(--t)}.ph img{position:absolute;inset:4%;width:92%;height:92%}.ph.d img{transform:scaleX(-1)}
.ph small{margin-top:6px;font:700 12px/1.2 var(--b);color:#5E5A66}.ph b{display:flex;align-items:center;gap:6px;font-size:16px;line-height:1.2;white-space:nowrap}
.ph .ring{inset:-4px -6px auto;width:calc(100% + 12px);height:auto;aspect-ratio:1}
/* the hit: a marker arrow, the number under it */
.ans{grid-area:ans;display:grid;justify-items:center;gap:2px;text-align:center}
.arrow{width:74%;height:44px;overflow:visible;margin-bottom:2px}
.ans .l1{display:flex;align-items:center;gap:8px;font:700 16px/1.3 var(--b)}.ty{padding:0 9px;background:${FIRE};color:#fff;font:700 12px/1.7 var(--b);clip-path:polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)}
.ans .big{font-size:62px;line-height:1;white-space:nowrap;color:#D2411E}.ans .l2{font:600 16px/1.3 var(--b)}.ans .l2 b{font-weight:900}
.ans .vd{margin:22px 0 18px;font-size:24px;line-height:1.1}.ans .vd span{position:relative;display:inline-block;padding:2px 4px}.ans .vd .ring{inset:-16px -34px;width:calc(100% + 68px);height:calc(100% + 32px)}
.ans .vd{color:#C41E35}.ans .sm{font-size:13px;line-height:1.3;color:#0068AD;transform:rotate(-1.5deg)}
.w h2{font-size:16px;line-height:1.2;margin-bottom:8px}.blk.mv{grid-area:mv}.blk.sky{grid-area:sky}.blk.gnd{grid-area:gnd}.blk.turn{grid-area:turn}
/* moves: highlighter swipes in the type's colour */
.mvs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px}
.m{color:#fff;position:relative;isolation:isolate;display:grid;align-content:center;gap:1px;min-height:84px;padding:10px 16px 12px;transform:rotate(var(--r))}
.m .sw{position:absolute;inset:0;z-index:-1;background:var(--c);clip-path:polygon(2% 8%,12% 2%,30% 6%,52% 0,74% 5%,96% 1%,100% 14%,98% 40%,100% 66%,97% 92%,80% 100%,58% 95%,36% 100%,14% 94%,1% 98%,3% 70%,0 42%);box-shadow:none}
.m b{display:flex;align-items:center;gap:8px;font-size:15px;line-height:1.15;white-space:nowrap}.m em{font-size:22px;line-height:1.1;white-space:nowrap}.m small{font:700 12.5px/1.3 var(--b);color:rgba(255,255,255,.9)}
.m .ring{inset:-8px -6px;width:calc(100% + 12px);height:calc(100% + 16px)}.m.all{color:#17161A;border:3px dashed rgba(23,22,26,.5)}.m.all small{color:#5E5A66}
/* sky, ground, this turn: written straight on the wall; the circle is the choice */
.five{display:grid;grid-template-columns:repeat(5,minmax(0,1fr))}.five button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:62px;font:800 13px/1.1 var(--b)}
.five .ic{color:var(--k)}.five .ring{inset:1px 0;width:100%;height:calc(100% - 2px)}
.sws{display:flex;flex-wrap:wrap;gap:6px 8px}.sws button{position:relative;display:flex;align-items:center;min-height:46px;padding:0 12px;font:800 15px/1.1 var(--b);color:rgba(23,22,26,.55)}.sws button.on{color:#17161A}.sws .ring{inset:3px -2px;width:calc(100% + 4px);height:calc(100% - 6px)}
/* sticky notes: only the two sets */
.kit{position:relative;grid-area:ka;display:grid;align-content:start;padding:14px 12px 8px;background:var(--p);color:var(--tx);transform:rotate(var(--r));box-shadow:0 22px 22px -18px rgba(0,0,0,.6)}.kit.a{--p:#D9EDFB;--r:1.2deg}.kit.d{grid-area:kd;--p:#FBD3DA;--r:-1.2deg}
.kit::before{content:"";position:absolute;left:0;right:0;top:0;height:16px;background:linear-gradient(180deg,rgba(0,0,0,.1),transparent)}.kit h2{font-size:13px;margin-bottom:2px}
.kit .ln{display:grid;min-height:50px;align-content:center;width:100%;border-bottom:2px dotted rgba(23,22,26,.35)}.kit .ln small{font:700 11.5px/1.2 var(--b);color:rgba(23,22,26,.66)}.kit .ln b{font:800 14.5px/1.25 var(--b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kit .st{grid-template-columns:auto minmax(0,1fr);align-items:center;border-bottom:0}.kit .st span{display:flex;align-items:center;justify-content:flex-end;gap:2px}.kit .st button{display:grid;place-items:center;width:44px;height:44px;background:rgba(255,255,255,.6);font:900 20px/1 var(--b)}.kit .st span b{min-width:26px;text-align:center}
.ko{color:#fff;grid-area:ko;display:grid;gap:2px;width:100%;padding:14px 18px 16px;background:#17161A;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}.ko b{font-size:16px;line-height:1.2}.ko small{font:600 13px/1.4 var(--b)}
.kbar{display:flex;height:8px;margin-top:6px;overflow:hidden}.kbar i{background:var(--pk)}.kbar .can{background:repeating-linear-gradient(135deg,var(--pk) 0 4px,#2DBE6C 4px 8px)}.kbar .sv{background:#2DBE6C}
.links{grid-area:lk;display:flex;flex-wrap:wrap;gap:0 22px}.links a{display:inline-flex;align-items:center;min-height:44px;font:800 15px/1 var(--b);color:#0068AD;text-decoration:underline 2px;text-underline-offset:6px;cursor:pointer}
@media (min-width:1000px){.wall{grid-template-columns:280px minmax(0,1fr) minmax(0,1fr) 280px;grid-template-areas:"top top top top" "pa ans ans pd" "ka mv mv kd" "ka sky gnd kd" "ko turn turn lk";gap:30px 40px;padding:22px var(--gut) 52px;align-items:start}
 .top h1{font-size:44px}.swap{font-size:15px}.ph{padding:12px 12px 14px}.ph b{font-size:23px}.ph small{font-size:13px}
 .ans{align-self:center}.arrow{width:calc(100% + 90px);height:84px;margin:0 -45px -6px}.ans .big{font-size:112px}.ans .l1{font-size:19px}.ans .l2{font-size:19px}.ans .vd{font-size:34px;margin:28px 0 22px}.ans .sm{font-size:16px}
 .w h2{font-size:18px}.mvs{grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.m{min-height:104px;padding:12px 12px 14px 14px}.m b{font-size:14px}.m em{font-size:20px}.m small{font-size:12px}
 .kit{padding:18px 16px 10px}.kit h2{font-size:15px}.kit .ln b{font-size:16px}.five button{min-height:66px}
 .ko{align-self:center}.links{display:grid;align-self:center}}
`;
const b = await chromium.launch(); const stats = [];
for (const [dev, o] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const c = await b.newContext(o), p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', 'day'); } catch (e) {} });
  await p.goto('file://' + PAGE + '#calc'); await p.waitForTimeout(2500);
  await p.evaluate(({ html, css }) => { document.documentElement.setAttribute('data-theme', 'day'); const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const m = document.getElementById('main'), m2 = m.cloneNode(false); m2.innerHTML = html; m.replaceWith(m2); scrollTo(0, 0);
    document.getElementById = () => null; document.querySelector = () => null; document.querySelectorAll = () => []; }, { html: HTML, css: CSS });
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {}); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const m = await p.evaluate(() => { const W = document.getElementsByClassName('w')[0], small = [], cut = [];
    for (const e of W.getElementsByTagName('*')) { if (/^(BUTTON|A)$/.test(e.tagName)) { const r = e.getBoundingClientRect(); if (r.width && (r.height < 43.5 || r.width < 43.5)) small.push((e.textContent.trim() || e.getAttribute('aria-label') || '?').slice(0, 16) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      if (!e.children.length && e.textContent.trim() && e.clientWidth && e.scrollWidth > e.clientWidth + 1) cut.push(e.textContent.trim().slice(0, 18)); }
    const a = document.getElementsByClassName('vd')[0].getBoundingClientRect(); return { s: (W.getBoundingClientRect().height / innerHeight).toFixed(2), ans: Math.round(a.bottom), sw: document.documentElement.scrollWidth > innerWidth, small, cut }; });
  await p.screenshot({ path: path.join(OUT, `the-plot-4-${dev}-light.png`), fullPage: true });
  stats.push(`the-plot-4 ${dev}: ${m.s} screens, the verdict ends at ${m.ans}px${m.sw ? ' SIDEWAYS' : ''}, small ${m.small.length}${m.small.length ? ' (' + m.small.join(', ') + ')' : ''}, cut ${m.cut.length}${m.cut.length ? ' (' + m.cut.slice(0, 6).join(', ') + ')' : ''}`); await c.close(); }
await b.close(); console.log(stats.join('\n'));
