// ---------- Compare (Nov 14): Sim's pick "The Face-Off" (docs/rebuild/mocks/compare-faceoff/BRIEF.md) ----------
// A fight poster split in two (Team A PLOT blue, Team B the site's existing pink --pick: Sim, Nov 14, no new colours), a tale of the tape
// of tug-of-war bars (Strength Score, Fastest, Slowest), then each team's "Only Team X handles" column with three small facts. Every
// number and sentence comes from today's cxFacts / cxResolve / teamLineup / outspeedOf; every other row that differs stays listed below.
V2.cxfHero = ms => { try { const L = teamLineup(ms); if (L && L.lead && L.lead[0]) return L.lead[0]; } catch (e) {} return ms[0]; };
V2.cxfHalf = (side, R, I) => { const E = V2.esc, ms = teamRating(R.slots).ms, G = I.G, h = V2.cxfHero(ms), s = side.toLowerCase();
  return `<div class="cxf-half ${s}"><div class="cxf-id"><span class="cxf-badge u" aria-hidden="true">${side}</span><div><h2 class="u"><span class="vh">Team ${side}: </span>${E(R.name)}</h2><p>${E(R.sub || '')} · <button type="button" class="np-link" data-cxp="${side}" aria-label="Change team ${side}">Change</button></p></div></div>
    ${G ? `<div class="cxf-score"><i class="cxf-ghost u" aria-hidden="true">${Math.round(G.s)}</i><b class="u">${Math.round(G.s)}</b><span class="u">${E(CH.wordOf(G.s))}</span><small>Strength Score · ${E(CH.recLine(G, true))}</small></div>` : '<p class="fine">No Strength Score yet</p>'}
    ${h ? `<div class="cxf-hero" aria-hidden="true">${V2.mon(h.p.n, {bare: true})}</div>` : ''}
    <ul class="cxf-six">${ms.map(m => `<li>${V2.mon(m.p.n, {iw: 56, bare: true})}<b>${E(m.d)}</b></li>`).join('')}</ul></div>`; };
// a tug-of-war band: A's part and B's part in proportion to the two numbers, the leader tagged when higher is plainly better
V2.cxfBand = (name, a, b, da, db, tag) => { const E = V2.esc, t = a + b || 1, lead = tag && a !== b ? (a > b ? 'A' : 'B') : '';
  return `<div class="cxf-band" role="group" aria-label="${E(name)}: Team A ${a}${da ? ', ' + E(da) : ''}; Team B ${b}${db ? ', ' + E(db) : ''}${lead ? `; Team ${lead} ahead` : ''}"><p class="cxf-bn"><b class="u">${E(name)}</b>${lead ? `<span class="cxf-ahead ${lead.toLowerCase()}">Team ${lead} ahead</span>` : ''}</p>
    <div class="cxf-bar" aria-hidden="true" style="--a:${Math.max(18, Math.round(100 * a / t))}"><span class="a"><b class="u">${a}</b><small>${E(da || '')}</small></span><span class="b"><small>${E(db || '')}</small><b class="u">${b}</b></span></div></div>`; };
V2.cxfTape = (IA, IB) => { const parts = [];
  if (IA.G && IB.G) parts.push(V2.cxfBand('Strength Score', Math.round(IA.G.s), Math.round(IB.G.s), CH.wordOf(IA.G.s), CH.wordOf(IB.G.s), true));
  const os = (x, I) => { const r = typeof outspeedOf === 'function' ? outspeedOf(x.v, I.wxS || '', {}) : null; return `${x.m.d}${r ? ` · outspeeds ${r.pct}% of the top ${r.n}` : ''}`; };
  if (IA.spd && IA.spd.length && IB.spd && IB.spd.length) { const fa = IA.spd[0], fb = IB.spd[0], la = IA.spd[IA.spd.length - 1], lb = IB.spd[IB.spd.length - 1];
    parts.push(V2.cxfBand('Fastest', fa.v, fb.v, os(fa, IA), os(fb, IB), true), V2.cxfBand('Slowest', la.v, lb.v, os(la, IA), os(lb, IB), false)); }
  return parts.length ? `<section class="cxf-tape"><h2 class="u">Tale of the Tape</h2>${parts.join('')}</section>` : ''; };
V2.cxfCol = (side, rows) => { const E = V2.esc, k = side.toLowerCase(), v = r => r ? r[k] : null, thr = rows.find(r => r.k === 'thr'), ws = rows.find(r => /weak spots/i.test(r.label)), fl = rows.find(r => r.k === 'field'), ar = rows.find(r => r.k === 'arch');
  const L = v(thr) || [], ck = v(ws), F = v(fl) || [];
  return `<div class="cxf-col ${k}"><h3 class="u"><span class="cxf-badge u" aria-hidden="true">${side}</span>Only Team ${side} handles</h3>
    ${L.length ? `<ul class="cxf-thr">${L.slice(0, 5).map(r => `<li><img src="${V2.art(SPRITE_ID[r.t.n])}" alt="" loading="lazy">${V2.rowName(r.t.d)}</li>`).join('')}${L.length > 5 ? `<li class="fine">+${L.length - 5} more</li>` : ''}</ul>` : '<p class="fine">None of the top threats</p>'}
    <dl class="cxf-facts">${ws ? `<div><dt>${E(ws.label)}</dt><dd class="${ck == null ? '' : ck ? 'ok' : 'no'}">${ck == null ? '–' : ck ? '<span aria-hidden="true">✓</span> Yes' : '<span aria-hidden="true">✗</span> No'}</dd></div>` : ''}
      <div><dt>Weather / terrain</dt><dd class="cxf-tm">${F.length ? F.map(x => E(x.name)).join(', ') : 'None'}</dd></div><div><dt>Archetype</dt><dd>${ar && v(ar) && v(ar).label ? E(String(v(ar).label)) : '–'}</dd></div></dl></div>`; };
(() => { const before = V2.pages.compare.draw; V2.pages.compare.draw = () => { const RA = cxResolve(ui.cx.A), RB = cxResolve(ui.cx.B); if (!RA || !RB) return before();
  const IA = CX.cache.get(cxKey(RA.slots)), IB = CX.cache.get(cxKey(RB.slots)); if (!IA || !IB) return before();
  const html = before(), rows = V2.cxRows(IA, IB), shown = r => ['grade', 'spd', 'thr', 'field', 'arch'].includes(r.k) || /weak spots/i.test(r.label);
  const head = `<div class="cx2-top cxf-top"><div class="np-eyebrow"><span><a class="np-back" href="#team">← My Team</a> · Compare · two teams side by side</span></div><h1 class="u">Compare Teams</h1><button type="button" class="np-link cx2-swap" data-cxswap2>Swap A and B ⇄</button></div>
    <section class="cxf-poster" aria-label="Team A against Team B">${V2.cxfHalf('A', RA, IA)}<i class="cxf-vs u" aria-hidden="true">VS</i>${V2.cxfHalf('B', RB, IB)}</section>${V2.cxfTape(IA, IB)}<section class="cxf-cols">${V2.cxfCol('A', rows)}${V2.cxfCol('B', rows)}</section>`;
  /* today's page from "What's Different" down, with the rows already drawn above left out of its differing-rows grid (they are all still on the page) */
  const tmp = document.createElement('div'); tmp.innerHTML = html; const sec = tmp.querySelector('.cx2'); if (!sec) return html;
  sec.querySelector('.cx2-top')?.remove(); sec.querySelector('.cx2-heads')?.remove();
  const grid = sec.querySelector(':scope > .cx2-grid'); if (grid) { const keep = rows.filter(r => r.diff && !shown(r)); [...grid.children].forEach((el, i) => { const r = rows.filter(x => x.diff)[i]; if (r && shown(r)) el.remove(); }); if (!keep.length) grid.remove(); else grid.insertAdjacentHTML('beforebegin', '<h2 class="u cxf-more">Also Different</h2>' + V2.cxHrow()); /* Nov 15 (re-audit #5): say which column is which */ }
  sec.querySelectorAll('.cx2-tm').forEach(b => b.classList.add('cxf-tm'));
  sec.classList.add('cxf'); sec.insertAdjacentHTML('afterbegin', head); return tmp.innerHTML; }; })();
