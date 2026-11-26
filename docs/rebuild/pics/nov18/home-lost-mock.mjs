// node docs/rebuild/pics/nov18/home-lost-mock.mjs (copy it to the repo root first so playwright resolves) PAGE OUTDIR [ids]  -> OUTDIR/home-lost-<id>-<w>-<light|dark>.png. Mock-ups only: injected into the built page, the source is not edited.
import {chromium} from 'playwright';
const [PAGE, OUT, IDS] = process.argv.slice(2);
const E = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const O = {
  // HOME-04 A: the Usage page's source line says when the next month arrives (Showdown ladder chosen)
  h04a: {hash: '#usage', target: '.us-src', pre: async q => { const c = q.locator('[data-ussrc="ladder"]').first(); if (await c.count()) { await c.click(); await q.waitForTimeout(800); } },
    js: () => { const p = document.querySelector('.us-src'); if (p) p.insertAdjacentHTML('beforeend', `<span class="zz-nx">${V2.esc(V2.homeNext().replace(/^\. /, '. '))}</span>`); },
    css: `.zz-nx{color:var(--ink);font-weight:600}`},
  // HOME-04 B: the footer, beside "Data as of": the ladder month and when the next arrives
  h04b: {hash: '#home', target: '.np-foot', js: () => { const a = document.querySelector('.np-asof'); if (a) a.insertAdjacentHTML('afterend', ` <span class="zz-lad">Ladder usage: ${V2.esc(V2.homeHead().src)}${V2.esc(V2.homeNext())}</span>`); },
    css: `.zz-lad{white-space:normal}`},
  // HOME-05 A: the hero ticker carries this week's rating moves (arrow + points), each opening its Pokémon
  h05a: {hash: '#home', target: '.sdh-tick', js: () => { const u = document.querySelector('.sdh-tick ul'); if (!u) return; const W = V2.homeWeek(12), E = V2.esc;
      u.setAttribute('aria-label', 'This week in the ratings');
      const moved = new Set(W.map(w => w.n)); [...u.children].forEach(li => { const b = li.querySelector('[data-v2mon]'); if (b && moved.has(b.dataset.v2mon)) li.remove(); });
      u.insertAdjacentHTML('afterbegin', `<li class="zz-tl"><a href="#weekly"><span class="u">This Week</span></a></li>` + W.map(w => `<li><button type="button" data-v2mon="${E(w.n)}" aria-label="${E(V2.disp(w.n))} ${w.d > 0 ? 'up' : 'down'} ${Math.abs(w.d)} points this week, rating ${w.r}"><span class="nm u">${E(V2.disp(w.n))}</span> <span class="zz-mv ${w.d > 0 ? 'up' : 'dn'}">${w.d > 0 ? '▲' : '▼'} ${Math.abs(w.d)}</span> <span class="rt u">${w.r}</span></button></li>`).join('')); },
    css: `.sdh-tick .zz-tl a{display:flex;align-items:center;height:100%;padding:var(--s4) var(--s3) 0;font:800 var(--t17)/1 var(--u);font-style:italic;font-synthesis:style;color:var(--sd-on-band);text-transform:uppercase;letter-spacing:.04em;border-right:2px solid var(--sd-post-line);padding-right:var(--s6)}
      .sdh-tick .zz-mv{font:700 var(--t20)/1 var(--b);color:var(--sd-on-band)}.sdh-tick .zz-mv.dn{opacity:.86}
      @media (max-width:899.98px){.sdh-tick .zz-tl a{padding-top:var(--s3);font-size:var(--t15)}.sdh-tick .zz-mv{font-size:var(--t17)}}@media (max-width:699.98px){.sdh-tick .zz-tl{display:none}}`},
  // HOME-05 B: This Week page: "Ratings on the Move" under "Pokémon on the Move" (usage); chips open the Pokémon
  h05b: {hash: '#weekly', target: '.zz-rm', js: () => { const m = document.querySelector('.wk-move'); if (!m) return; const W = V2.homeWeek(12), E = V2.esc;
      m.insertAdjacentHTML('afterend', `<section class="zz-rm"><h2 class="u">Ratings on the Move</h2><p class="fine">NastyPlot ratings since last week. Tap one for its page.</p><ul>${W.map(w => `<li><button type="button" class="zz-chip" data-v2mon="${E(w.n)}" aria-label="${E(V2.disp(w.n))} ${w.d > 0 ? 'up' : 'down'} ${Math.abs(w.d)} points this week, rating ${w.r}">${V2.mon(w.n, {bare: true})}<span class="zz-cn">${V2.rowName(V2.disp(w.n))}<small>Rating ${w.r}</small></span><b class="zz-cd ${w.d > 0 ? 'up' : 'dn'}"><span aria-hidden="true">${w.d > 0 ? '▲' : '▼'}</span> <span class="u">${Math.abs(w.d)}</span><small>${w.d > 0 ? 'up' : 'down'}</small></b></button></li>`).join('')}</ul></section>`); },
    css: `.zz-rm{margin:var(--s12) 0}.zz-rm h2{margin:0;font-size:var(--t34)}.zz-rm .fine{margin:var(--s2) 0 var(--s4)}
      .zz-rm ul{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--s3);margin:0;padding:0;list-style:none}
      .zz-chip{display:grid;grid-template-columns:56px minmax(0,1fr) auto;align-items:center;gap:var(--s3);width:100%;min-height:72px;padding:var(--s2) var(--s4) var(--s2) var(--s2);border:0;border-radius:var(--r-m,10px);background:var(--surface);color:var(--ink);text-align:left;font:600 var(--t16)/1.3 var(--b);cursor:pointer}
      .zz-chip .np-mon{width:56px;height:56px;margin:0}.zz-cn small{display:block;font:500 var(--t13)/1.5 var(--b);color:var(--ink-2)}
      .zz-cd{display:grid;justify-items:end;font:800 var(--t22)/1 var(--u);font-style:italic;font-synthesis:style}.zz-cd small{font:600 var(--t13)/1.5 var(--b);font-style:normal}
      .zz-cd.up{color:var(--good-text)}.zz-cd.dn{color:var(--bad-text)}
      @media (max-width:699.98px){.zz-rm ul{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.zz-chip{grid-template-columns:40px minmax(0,1fr);grid-template-rows:auto auto;padding:var(--s2) var(--s3)}.zz-chip .np-mon{width:40px;height:40px}.zz-cd{grid-column:2;justify-items:start;display:flex;gap:var(--s1);align-items:baseline}.zz-rm h2{font-size:var(--t26)}}`},
  // HOME-12 A: the welcome in the six band, beside the sample team it explains (first visit only; Got It hides it for good)
  h12a: {hash: '#home', fresh: true, target: '.zz-wl', js: () => { const l = document.querySelector('.sds-line .sds-note') || document.querySelector('.sds-line h2'); if (!l) return;
      l.insertAdjacentHTML('afterend', `<section class="zz-wl" aria-label="New here?"><p class="zz-k">New here?</p><ol><li><b>Get a team</b><span>Let us build one from real winning teams, copy a top team, or type your own six.</span></li><li><b>Read your Strength Score</b><span>How strong your six is, its Matchups against the top threats, and exactly what to change.</span></li><li><b>Plan each match</b><span>Scout their six, see who moves first, run the damage, and get a turn 1 plan.</span></li></ol><p class="zz-acts"><a class="np-btn sds-btn" href="#tournaments" data-hmwelcome>Copy a Top Team</a><button type="button" class="np-link sds-lk" data-hmwelcome>Got It</button></p></section>`); },
    css: `.zz-wl{position:relative;z-index:3;margin:var(--s6) 0 var(--s2);padding:var(--s4) 0 var(--s4) var(--s4);border-left:4px solid var(--plot);color:var(--on-plate)}
      .zz-k{margin:0 0 var(--s2);font:800 var(--t20)/1.2 var(--u);font-style:italic;font-synthesis:style}
      .zz-wl ol{margin:0;padding:0;list-style:none;counter-reset:s;display:grid;gap:var(--s3)}
      .zz-wl li{counter-increment:s;display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:var(--s2);font:500 var(--t15)/1.5 var(--b);color:color-mix(in srgb,var(--on-plate) 80%,transparent)}
      .zz-wl li::before{content:counter(s);grid-row:span 2;font:800 var(--t20)/1.2 var(--u);font-style:italic;font-synthesis:style;color:var(--plot-text)}
      .zz-wl li b{font:700 var(--t16)/1.5 var(--b);color:var(--on-plate)}
      .zz-acts{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s6);margin:var(--s4) 0 0}
      .zz-b{display:inline-flex;align-items:center;min-height:44px;padding:0 var(--s5);border-radius:var(--r-s,4px);background:var(--plot);color:var(--on-main,#fff);font:700 var(--t16)/1 var(--b);text-decoration:none}
      .zz-got{min-height:44px;padding:0 var(--s2);border:0;background:none;color:var(--on-plate);font:700 var(--t16)/1 var(--b);text-decoration:underline;text-underline-offset:4px}`},
  // HOME-12 B: a slim "New here?" strip at the top of the page, under the header, before the hero (first visit only)
  h12b: {hash: '#home', fresh: true, target: '.zz-wb', top: true, js: () => { const s = document.querySelector('.sd'); if (!s) return;
      s.insertAdjacentHTML('beforebegin', `<section class="zz-wb" aria-label="New here?"><p><b class="u">New here?</b> <span>1 Get a team · 2 Read your Strength Score · 3 Plan each match.</span></p><p class="zz-acts"><a class="zz-b" href="#tournaments" data-hmwelcome>Copy a Top Team</a><button type="button" class="zz-got" data-hmwelcome>Got It</button></p></section>`); },
    css: `.zz-wb{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--s2) var(--s6);padding:var(--s3) var(--gut);background:var(--surface);color:var(--ink);border-bottom:1px solid var(--rule)}
      .zz-wb p{margin:0;font:500 var(--t16)/1.5 var(--b)}.zz-wb b{font-size:var(--t17);margin-right:var(--s2)}
      .zz-acts{display:flex;align-items:center;gap:var(--s4)}
      .zz-b{display:inline-flex;align-items:center;min-height:44px;padding:0 var(--s5);border-radius:var(--r-s,4px);background:var(--plot);color:var(--on-main,#fff);font:700 var(--t16)/1 var(--b);text-decoration:none}
      .zz-got{min-height:44px;padding:0 var(--s2);border:0;background:none;color:var(--ink);font:700 var(--t16)/1 var(--b);text-decoration:underline;text-underline-offset:4px}`},
  // HOME-13 A: What's New as a slip in the post band (after an update only; × hides it for good)
  h13a: {hash: '#home', news: true, target: '.zz-nw', js: () => { const t = document.querySelector('.sdp-top'); if (!t) return; const E = V2.esc, tmp = document.createElement("div"); tmp.innerHTML = V2.homeNew(); const W = {items: [...tmp.querySelectorAll(".hm-newl li")].map(li => [li.querySelector("b").textContent, li.querySelector("span").textContent])};
      t.insertAdjacentHTML('afterend', `<section class="zz-nw"><details class="zz-f"${innerWidth >= 700 ? " open" : ""}><summary><span class="u zz-t">What's New</span><span class="zz-s">${W.items.length} updates${innerWidth >= 700 ? " to NastyPlot" : ": " + W.items.slice(0, 2).map(([a]) => E(a)).join(", ") + "…"}</span></summary><ul>${W.items.map(([a, b]) => `<li><b>${E(a)}</b> <span>${E(b)}</span></li>`).join('')}</ul></details><button type="button" class="zz-x" data-hmnewx aria-label="Dismiss What's New">×</button></section>`); },
    css: `.zz-nw{position:relative;margin:0 0 var(--s10);padding:var(--s4) var(--s12) var(--s4) var(--s5);border-radius:var(--r-s,4px);background:var(--pr-paper);color:var(--pr-ink);rotate:-.6deg;box-shadow:0 1px 2px var(--pr-shadow),0 12px 24px -12px var(--sd-post-shadow)}
      .zz-f summary{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--s1) var(--s4);min-height:44px;cursor:pointer;list-style:none}.zz-t{font-size:var(--t26)}.zz-s{font:600 var(--t15)/1.5 var(--b);color:var(--pr-ink2)}
      .zz-f ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:var(--s3) var(--s8);margin:var(--s3) 0 0;padding:0;list-style:none;font:500 var(--t15)/1.5 var(--b)}@media (min-width:1100px){.zz-f ul{grid-template-columns:repeat(3,minmax(0,1fr))}}.zz-f li b{display:block;font-weight:700}.zz-f li span{color:var(--pr-ink2)}
      .zz-x{position:absolute;top:var(--s2);right:var(--s2);width:44px;height:44px;border:0;background:none;color:var(--pr-ink);font:400 var(--t28)/1 var(--b)}`},
  // HOME-13 B: What's New as a slim bar at the top of the page, under the header (after an update only)
  h13b: {hash: '#home', news: true, target: '.zz-nb', top: true, js: () => { const s = document.querySelector('.sd'); if (!s) return; const E = V2.esc, tmp = document.createElement("div"); tmp.innerHTML = V2.homeNew(); const W = {items: [...tmp.querySelectorAll(".hm-newl li")].map(li => [li.querySelector("b").textContent, li.querySelector("span").textContent])};
      s.insertAdjacentHTML('beforebegin', `<section class="zz-nb"><details class="zz-f"><summary><span class="u zz-t">What's New</span><span class="zz-s">${W.items.length} updates: ${W.items.slice(0, 2).map(([a]) => E(a)).join(', ')}…</span></summary></details><button type="button" class="zz-x" data-hmnewx aria-label="Dismiss What's New">×</button></section>`); },
    css: `.zz-nb{position:relative;padding:var(--s2) calc(var(--gut) + 44px) var(--s2) var(--gut);background:var(--surface);color:var(--ink);border-bottom:1px solid var(--rule)}
      .zz-f summary{display:flex;flex-wrap:wrap;align-items:center;gap:0 var(--s4);min-height:44px;cursor:pointer}.zz-t{font-size:var(--t17)}.zz-s{font:500 var(--t15)/1.5 var(--b);color:var(--ink-2)}
      .zz-x{position:absolute;top:50%;right:var(--gut);translate:0 -50%;width:44px;height:44px;border:0;background:none;color:var(--ink);font:400 var(--t28)/1 var(--b)}`},
};
const b = await chromium.launch();
for (const id of (IDS || Object.keys(O).join(',')).split(',')) { const o = O[id];
  for (const th of ['day', 'night']) for (const w of [390, 1440]) {
    const c = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 900}, deviceScaleFactor: 2, reducedMotion: 'reduce'}); const q = await c.newPage();
    await q.addInitScript(([t, o]) => { window.__PL_TEST = 1; try { if (sessionStorage.getItem('zz')) return; sessionStorage.setItem('zz', '1'); localStorage.setItem('np2.theme', t);
      if (o.fresh) localStorage.removeItem('cc2.welcomed'); else localStorage.setItem('cc2.welcomed', '"1"');
      if (o.news) localStorage.setItem('cc2.seenNew', '"2020-01-01"'); } catch {} }, [th, {fresh: !!o.fresh, news: !!o.news}]);
    await q.goto('file://' + PAGE + o.hash); await q.waitForTimeout(3500);
    if (o.pre) await o.pre(q);
    await q.evaluate(o.js); await q.addStyleTag({content: o.css}); await q.waitForTimeout(600);
    await q.evaluate(([sel, top]) => { const e = document.querySelector(sel); if (top || !e) return scrollTo(0, 0); scrollTo(0, e.getBoundingClientRect().top + scrollY - (innerWidth < 700 ? 140 : 180)); }, [o.target, !!o.top]);
    await q.waitForTimeout(700);
    const f = `${OUT}/home-lost-${id}-${w}-${th === 'day' ? 'light' : 'dark'}.png`; await q.screenshot({path: f});
    const chk = await q.evaluate(sel => { const r = document.querySelector(sel); if (!r) return 'MISSING ' + sel; const out = []; if (document.documentElement.scrollWidth > innerWidth) out.push('sideways');
      for (const e of r.querySelectorAll('*')) { if (!e.getClientRects().length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 13) out.push('small ' + e.className + ' ' + fs); }
      return out.join(', ') || 'ok'; }, o.target);
    console.log(id, w, th, chk);
    await c.close(); } }
await b.close();
