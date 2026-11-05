// ---------- Champions arena, group C: Battle (red-orange) ----------
// Battle mode, the damage calc, speed tiers, the gauntlet, team preview practice and the type chart (theme/arena-battle.css).
// Only markup is added (art fields, the read's hero, move strips, the "vs" rule); every control keeps its element, id, data-*
// attribute and handler. Calls AR.* helpers (74-arena.js), never redefines them.
const ARBAT = {};
ARBAT.PANES = ['matchup', 'calc', 'speed', 'gauntlet', 'practice', 'types'];
ARBAT.SEL = ARBAT.PANES.map(p => `[data-pane="${p}"]`).join(',');
/* the six panes carry .arb, so arena-battle.css can scope its shared page rules to Battle's pages in one short selector */
document.querySelectorAll(ARBAT.SEL).forEach(p => p.classList.add('arb'));
/* sprite file -> Pokémon, for old markup that only carries the picture (gauntlet, practice) */
ARBAT._bySrc = null;
ARBAT.pOfImg = img => { if (!img) return null; if (!ARBAT._bySrc) { ARBAT._bySrc = new Map(); try { for (const n in SPRITE_ID) ARBAT._bySrc.set(String(SPRITE_ID[n]), n); } catch (e) {} }
  const m = /sp\/(\d+)\.webp/.exec(img.getAttribute('src') || ''); const n = m && ARBAT._bySrc.get(m[1]); return n ? byName.get(n) || null : null; };
/* two Pokémon on one field: the first type of each, blended like a dual type */
ARBAT.pairVars = (a, b) => { const ta = ((a && a.t) || ['Normal'])[0], tb = ((b && b.t) || ['Normal'])[0];
  const da = AR.dark(ta); return `--a:${AR.TC[ta] || TC.Normal};--b:${AR.TC[tb] || TC.Normal};--da:${da};--dm:${AR.mid(ta, tb)};--db:${AR.dark(tb)};--on:${AR.on(da)}`; };
/* Sim: no Lead / Back / Bench on the art. A plan's four splits into two small groups under headings ("Lead", "Back"); the tags
   inside the tiles stay in the markup, hidden. isLead(tile) says which group a tile goes in. */
ARBAT.groups = (box, tiles, isLead, cls) => { if (!box || box.classList.contains('ar-grouped') || !tiles.length) return; box.classList.add('ar-grouped');
  const mk = (h, list) => { if (!list.length) return null; const g = document.createElement('div'); g.className = 'ar-pgrp ' + cls; g.innerHTML = `<h4 class="ar-pgh">${h}</h4><div class="ar-pgrid"></div>`; list.forEach(t => g.lastChild.append(t)); return g; };
  const L = tiles.filter(isLead), B = tiles.filter(t => !isLead(t)); [mk('Lead', L), mk('Back', B)].forEach(g => g && box.append(g)); };
/* turn an existing tile (button or div holding the sprite and a name) into an arena art tile, in place */
ARBAT.artify = (el, p, size, nameSel) => { if (!el || !p || el.classList.contains('ar-art')) return;
  el.classList.add('ar-art', 'ar-' + (size || 's'), 'ar-below'); if (AR.isMega(p)) el.classList.add('is-mega');
  el.setAttribute('style', (el.getAttribute('style') || '').replace(/--t[ab]:[^;]*;?/g, '') + ';' + AR.tv(p));
  el.insertAdjacentHTML('afterbegin', '<span class="ar-f ar-field" aria-hidden="true"></span>');
  const img = el.querySelector('img.spr'); if (img) img.classList.add('ar-spr');
  const nm = nameSel && el.querySelector(nameSel); if (nm) nm.classList.add('ar-nm'); };

/* a small slanted type field behind a lone sprite (list rows, turn one, matchup prep), in place */
ARBAT.bf = (img, p) => { if (!img || !p || (img.parentElement && img.parentElement.classList.contains('ar-mini'))) return; const w = document.createElement('span');
  w.className = 'ar-mini ar-bf' + (AR.isMega(p) ? ' is-mega' : ''); w.setAttribute('style', AR.tv(p)); w.setAttribute('aria-hidden', 'true'); img.before(w); w.append(img); };

/* ======================= shared: arena controls on the old markup ======================= */
ARBAT.parts = () => { const P = ARBAT.SEL;
  document.querySelectorAll(`:is(${P}) .seg:not(.ar-seg)`).forEach(s => s.classList.add('ar-seg'));
  document.querySelectorAll(`:is(${P}) :is(button.btn,button.chghost,button.sdcopy):not(.ar-btn):not(.ar-link):not(.chprimary):not(.dcswap)`).forEach(b => b.classList.add(b.matches('[data-typesmonx]') ? 'ar-link' : 'ar-btn'));
  document.querySelectorAll(`:is(${P}) :is(button.linkbtn,button.nplink):not(.ar-link)`).forEach(b => b.classList.add('ar-link'));
  /* the one main action per page: the yellow strip with the black go-chevron */
  document.querySelectorAll(`:is(${P}) button.chprimary:not(.ar-btn)`).forEach(b => { b.classList.add('ar-btn', 'ar-primary');
    b.querySelectorAll(':scope > span[aria-hidden="true"]').forEach(s => { if (/[➜→›]/.test(s.textContent)) s.hidden = true; });
    if (!b.querySelector('.ar-go')) b.insertAdjacentHTML('beforeend', AR.ICON.go); });
  /* page titles: the word the old layer coloured in blue reads in ink like the rest of the title */
  document.querySelectorAll(`:is(${P}) .chpgt span[style]`).forEach(s => s.removeAttribute('style'));
  /* hover notes on table cells read as plain phrases (no middle dots) */
  document.querySelectorAll(`:is(${P}) :is(.bmdt,.dctab) [title*=" · "]`).forEach(e => { e.title = e.title.replace(/ · /g, '; '); });
  document.querySelectorAll(`:is(${P}) label.btn:not(.ar-btn)`).forEach(b => b.classList.add('ar-btn'));
  ARBAT.opp(); ARBAT.gauntlet(); ARBAT.practice(); ARBAT.types(); ARBAT.speed(); ARBAT.log(); };

/* ======================= Battle mode ======================= */
/* their six: art tiles (S), the remove button on the corner, "Likely lead" as a slanted tag under the name */
ARBAT.opp = () => { document.querySelectorAll('[data-pane="matchup"] .bmopp .bmslot.on:not(.ar-art)').forEach(sl => {
  const x = sl.querySelector('[data-bmx]'), n = x ? S.opp[+x.dataset.bmx] : '', p = n && byName.get(n); if (!p) return;
  ARBAT.artify(sl, p, 's', '.bmn'); sl.classList.remove('tyx'); });
  /* their likely lead: one line under the six (MG.battle marks the slots; the tag on the art is hidden) */
  document.querySelectorAll('[data-pane="matchup"] .bmopp').forEach(o => { const ll = [...o.querySelectorAll('.bmslot.mgllead .bmn')].map(n => n.textContent.trim()), nx = o.nextElementSibling;
    const txt = ll.length === 2 ? `Their likely lead: <b>${esc(ll[0])}</b> + <b>${esc(ll[1])}</b>` : '';
    if (nx && nx.classList.contains('ar-llline')) { if (!txt) nx.remove(); else if (nx.dataset.t !== txt) { nx.dataset.t = txt; nx.innerHTML = txt; } } else if (txt) { o.insertAdjacentHTML('afterend', '<p class="ar-llline"></p>'); o.nextElementSibling.dataset.t = txt; o.nextElementSibling.innerHTML = txt; } }); };
/* "The read": Battle's one hero. Your lead pair breaks out of a diagonal band (the page's one burst); their likely lead and their
   biggest threat are the two runner strips; Fake Out on their side is a plain numeral. Same data as before (71-manga.js). */
rzReadHtml = function () {
  const mine = members(), theirs = S.opp.map(n => byName.get(n)).filter(Boolean).map(oppMember);
  if (mine.length < 4 || !theirs.length) return '';
  const r = planMatchup(mine, theirs, true), lead = r.lead.map(i => mine[i]), C = r.chosen.map(i => mine[i]);
  const ll = r.B && theirs.length >= 2 ? likelyLead(theirs, r.B) : [];
  let threat = null;
  try { const W = bmWatch(C, theirs); const hi = W.find(w => w.out.some(o => o[0] === 'hi')) || W[0]; if (hi) threat = {o: hi.o, t: (hi.out.find(o => o[0] === 'hi') || hi.out[0])[1]}; } catch (e) {}
  const fo = theirs.filter(o => (o.moves || []).some(x => x && x.name === 'Fake Out')).length;
  const mega = p => AR.isMega(p) ? ' is-mega' : '';
  const hero = lead.length === 2 ? `<div class="ar-rhero" style="${AR.tv(lead[0].p)}"><span class="ar-rhero-bg ar-field" aria-hidden="true">${AR.BURST}</span>
      <span class="ar-rhero-mons" aria-hidden="true"><span class="ar-rmon${mega(lead[0].p)}" style="${AR.tv(lead[0].p)}">${AR.spr(lead[0].p)}</span><span class="ar-rmon${mega(lead[1].p)}" style="${AR.tv(lead[1].p)}">${AR.spr(lead[1].p)}</span></span>
      <span class="ar-rhero-copy"><span class="ar-rk">Your lead</span><span class="ar-rnm">${AR.nm(lead[0].d)}</span><span class="ar-rnm"><i>+</i> ${AR.nm(lead[1].d)}</span></span></div>` : '';
  const strip = (cls, vars, lab, nm, sub, mons) => `<div class="ar-rstrip ${cls}" style="${vars}"><span class="ar-rstrip-f ar-field" aria-hidden="true"></span><span class="ar-rstrip-in"><span class="ar-rk">${lab}</span><span class="ar-rstrip-nm">${nm}</span>${sub ? `<span class="ar-rstrip-sub">${sub}</span>` : ''}</span><span class="ar-rstrip-mons" aria-hidden="true">${mons}</span></div>`;
  const them = ll.length === 2 ? strip('them', AR.tv(ll[0].p), 'Their likely lead', `${AR.nm(ll[0].d)} + ${AR.nm(ll[1].d)}`, '', AR.spr(ll[0].p) + AR.spr(ll[1].p)) : '';
  const thr = threat ? strip('threat', AR.tv(threat.o.p), 'Biggest threat', AR.nm(threat.o.d), threat.o.d.toLowerCase().includes(String(threat.t).toLowerCase()) ? '' : esc(String(threat.t)), AR.spr(threat.o.p)) : '';
  return `<div class="rzread ar-read" role="region" aria-labelledby="arReadH"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2" id="arReadH">The read</h2></div>
    <div class="ar-rdeck">${hero}<div class="ar-rside">${them}${thr}<div class="ar-rfo"><div class="ar-stat"><span class="ar-num">${fo}</span><span class="ar-unit">Fake Out on their side</span></div><span class="rzlive">Updates as you type their six</span></div></div></div></div>`; };
/* the page head comes first (the read and the plan sit under it), whatever order the older wraps left it in */
ARBAT.battle = () => { const sec = $('matchup'), head = sec && sec.querySelector(':scope > .chbmhead'), out = $('bmOut'); if (!head || !out) return;
  if (sec.firstElementChild !== head) sec.prepend(head);
  head.classList.add('ar-bmhead');
  /* the empty states take the arena empty field (a faint slanted field with the most-used Pokémon), as the other Battle pages do */
  out.querySelectorAll('.empty-note:not(.mgempty)').forEach(e => { const q = CH.metaSix()[0]; e.classList.add('mgempty'); if (q) e.insertAdjacentHTML('afterbegin', `<span class="mgeart" aria-hidden="true">${sprite(q) || ''}</span>`); });
  /* the plan's four: art tiles with Lead / Back under the name (this is the plan, not the team showcase) */
  out.querySelectorAll('.bmpick:not(.ar-art)').forEach(b => { const p = ARBAT.pOfImg(b.querySelector('img.spr')); if (p) ARBAT.artify(b, p, 'm', '.bmpn'); });
  out.querySelectorAll('.bmpicks:not(.ar-grouped)').forEach(bx => ARBAT.groups(bx, [...bx.querySelectorAll(':scope > .bmpick')], t => t.classList.contains('lead'), 'ar-pgm'));
  /* turn one: each beat's Pokémon on a small type field */
  out.querySelectorAll('img.rzbspr, img.bmwspr').forEach(i => ARBAT.bf(i, ARBAT.pOfImg(i)));
  /* the damage calc card: your six and their Pokémon as small art */
  const cc = $('chCalcCard'); if (cc) { cc.querySelectorAll('.chcalcatk [data-dcgo]:not(.ar-art)').forEach(b => { const p = byName.get(b.dataset.dcgo.split('|')[0]); if (p) ARBAT.artify(b, p, 's', ':scope > span:not(.ar-f)'); });
    const d = cc.querySelector('.chcalcdef:not(.ar-art)'), pd = d && ARBAT.pOfImg(d.querySelector('img.spr')); if (pd) ARBAT.artify(d, pd, 's', ':scope > span:not(.ar-f)'); }
  /* the battle log's pick buttons are toggle chips */
  document.querySelectorAll('[data-pane="matchup"] .logpick:not(.ar-chip)').forEach(b => b.classList.add('ar-chip'));
  ARBAT.parts(); };
CH.wrap('renderBattle', () => ARBAT.battle());

/* the battle log: the four you brought are toggle chips; their order (Lead 1, Back 3...) is one line under them, not on the
   Pokémon (Sim: no Lead / Back on a Pokémon) */
ARBAT.log = () => { document.querySelectorAll('[data-pane="matchup"] .logpicks').forEach(bx => { const o = [...bx.querySelectorAll('.logpick')].map(b => { const k = b.querySelector('.logord'), n = b.querySelector('span');
    const m = k && /^(Lead|Back)\s*(\d)/i.exec(k.textContent.trim()); return m ? {r: m[1].toLowerCase(), i: +m[2], n: n ? n.textContent.trim() : ''} : null; }).filter(Boolean).sort((a, b) => a.i - b.i);
  const L = o.filter(x => x.r === 'lead').map(x => esc(x.n)), B = o.filter(x => x.r === 'back').map(x => esc(x.n));
  const txt = L.length || B.length ? `Order: ${L.length ? `lead <b>${L.join(' + ')}</b>` : ''}${L.length && B.length ? ', ' : ''}${B.length ? `back <b>${B.join(' + ')}</b>` : ''}.` : '';
  let ln = bx.nextElementSibling; if (!(ln && ln.classList.contains('ar-llline'))) { if (!txt) return; bx.insertAdjacentHTML('afterend', '<p class="ar-llline ar-logord"></p>'); ln = bx.nextElementSibling; }
  if (!txt) { ln.remove(); return; } if (ln.dataset.t !== txt) { ln.dataset.t = txt; ln.innerHTML = txt; } }); };
CH.wrap('renderLog', () => ARBAT.log());
/* the race track's names are 15px (body minimum): measure them at that size and give each lane room for name and number */
NPR.laneH = 76;
NPR.textW = (t, me) => { try { if (!NPR.ctx) NPR.ctx = document.createElement('canvas').getContext('2d');
    NPR.ctx.font = `${me ? 800 : 700} 15px "Instrument Sans", system-ui, sans-serif`; return Math.ceil(NPR.ctx.measureText(t).width) + 2; } catch (e) { return t.length * 9; } };

/* ======================= Damage calc ======================= */
/* attacker and defender stand on their type fields, facing each other across a slanted "vs" rule; the attacker's set moves are
   battle-menu strips (they pick the same <select>); the result is the cut-corner sheet with a big numeral and a slanted HP bar */
ARBAT.calc = () => { const el = $('dcOut'); if (!el) return;
  el.querySelectorAll('.chdcband:not(.ar-dcband)').forEach(b => { const sel = $(b.classList.contains('atk') ? 'dcA' : 'dcD'), p = sel && byName.get(sel.value); b.classList.add('ar-dcband'); if (!p) return;
    b.setAttribute('style', AR.tv(p)); if (AR.isMega(p)) b.classList.add('is-mega');
    b.insertAdjacentHTML('afterbegin', '<span class="ar-dcf ar-field" aria-hidden="true"></span>'); const img = b.querySelector('.dcspr'); if (img) img.classList.add('ar-spr'); });
  const grid = el.querySelector('.dcgrid'), sw = $('dcSwap');
  if (grid && sw && !grid.querySelector('.ar-dcvs')) { const a = $('dcA'), d = $('dcD'), pa = a && byName.get(a.value), pd = d && byName.get(d.value);
    const v = document.createElement('div'); v.className = 'ar-dcvs'; if (pa && pd) v.setAttribute('style', ARBAT.pairVars(pa, pd)); v.innerHTML = '<span class="ar-num ar-mp" aria-hidden="true">vs</span>'; sw.before(v); v.append(sw); }
  const mv = $('dcMv'), lab = mv && mv.closest('label');
  if (mv && lab && !el.querySelector('.ar-dcmoves')) { const set = [...mv.querySelectorAll('optgroup[label="Its set"] option')].map(o => o.value || o.textContent);
    if (set.length) lab.insertAdjacentHTML('beforebegin', `<div class="ar-dcmoves" role="group" aria-label="Its set: pick a move"><ul class="ar-strips">${set.map(n => `<li><button type="button" class="ar-strip" data-ardcmv="${esc(n)}" aria-pressed="${n === mv.value}" style="--m:${AR.TC[AR.moveType(n)] || TC.Normal}"><span>${esc(n)}</span></button></li>`).join('')}</ul></div>`);
    lab.classList.add('ar-dcmvsel');
    /* the strips are its set; the select below stays for any other move it can learn */
    if (set.length) { const t = [...lab.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim()); if (t) t.nodeValue = 'Other moves'; } }
  const res = el.querySelector('.dcres'); if (res && !res.closest('.ar-sheetwrap')) { const w = document.createElement('div'); w.className = 'ar-sheetwrap ar-dcwrap'; res.before(w); w.append(res); res.classList.add('ar-sheet');
    const pd = byName.get(($('dcD') || {}).value || ''), pa = byName.get(($('dcA') || {}).value || ''); if (pa && pd) res.setAttribute('style', ARBAT.pairVars(pa, pd)); }
  const big = el.querySelector('.dcbig'); if (big) big.classList.add('ar-num', 'ar-mp');
  ARBAT.parts(); };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-ardcmv]'); if (!b) return; const s = $('dcMv'); if (!s) return;
  const v = b.dataset.ardcmv; if (s.value === v) return; s.value = v; s.dispatchEvent(new Event('change', {bubbles: true})); });
CH.wrap('renderCalc', () => ARBAT.calc());

/* ======================= Speed tiers: the race track ======================= */
ARBAT.speed = () => { document.querySelectorAll('[data-pane="speed"] .nprm[data-lt]:not(.ar-nm2)').forEach(b => { const p = byName.get(b.dataset.lt); b.classList.add('ar-nm2'); if (!p) return;
  b.setAttribute('style', (b.getAttribute('style') || '') + ';' + AR.tv(p)); if (AR.isMega(p)) b.classList.add('is-mega'); }); };
CH.wrap('renderSpeed', () => ARBAT.parts());

/* ======================= Gauntlet: each top team's six as small art ======================= */
ARBAT.gauntlet = () => { document.querySelectorAll('[data-pane="gauntlet"] .prepcell img.spr').forEach(i => ARBAT.bf(i, ARBAT.pOfImg(i)));
  document.querySelectorAll('[data-pane="gauntlet"] .gmons .gm:not(.ar-gm)').forEach(g => { const p = ARBAT.pOfImg(g.querySelector('img')); g.classList.add('ar-gm'); if (!p) return;
  g.setAttribute('style', AR.tv(p)); if (AR.isMega(p)) g.classList.add('is-mega'); g.insertAdjacentHTML('afterbegin', '<span class="ar-field" aria-hidden="true"></span>'); }); };
CH.wrap('renderGauntlet', () => ARBAT.parts());

/* ======================= Team preview practice: both sixes as art ======================= */
ARBAT.practice = () => { const pane = document.querySelector('[data-pane="practice"]'); if (!pane) return;
  pane.querySelectorAll('.prm:not(.ar-art)').forEach(m => { const p = ARBAT.pOfImg(m.querySelector('img.spr')); if (p) ARBAT.artify(m, p, 's', '.prmn'); });
  pane.querySelectorAll('.prpick:not(.ar-art)').forEach(b => { const p = byName.get(b.dataset.prpick); if (p) ARBAT.artify(b, p, 'm', '.prmn'); if (b.classList.contains('on')) b.classList.add('is-sel'); });
  /* a four (yours, theirs, the strong players'): Lead and Back groups under headings, nothing printed on the art */
  pane.querySelectorAll('.prfour:not(.ar-grouped)').forEach(bx => ARBAT.groups(bx, [...bx.querySelectorAll(':scope > .prm')], t => !!t.querySelector('.prtag.lead'), 'ar-pgs'));
  /* your pick in progress: what you bring and who leads is one line under your six */
  pane.querySelectorAll('.prsix.mine').forEach(sx => { const nm = b => (b.querySelector('.prmn') || {}).textContent || '', on = [...sx.querySelectorAll('.prpick.on')], ld = on.filter(b => b.classList.contains('ld'));
    const txt = on.length ? `Bringing <b>${on.map(b => esc(nm(b))).join(', ')}</b>${ld.length ? `. Leading <b>${ld.map(b => esc(nm(b))).join(' + ')}</b>` : ''}.` : '';
    let ln = sx.nextElementSibling; if (!(ln && ln.classList.contains('ar-llline'))) { if (!txt) return; sx.insertAdjacentHTML('afterend', '<p class="ar-llline" aria-live="polite"></p>'); ln = sx.nextElementSibling; }
    if (ln.dataset.t !== txt) { ln.dataset.t = txt; ln.innerHTML = txt; } });
  pane.querySelectorAll('.prmini img.spr, .prrate img.spr').forEach(i => ARBAT.bf(i, ARBAT.pOfImg(i)));
  /* the two steps ("1 · Bring four"): the number becomes a numeral of its own, the words stay */
  pane.querySelectorAll('.prst:not(.ar-st)').forEach(st => { const t = st.firstChild, m = t && t.nodeType === 3 && /^\s*(\d)\s*[·,:]\s*/.exec(t.nodeValue); st.classList.add('ar-st'); if (!m) return;
    t.nodeValue = t.nodeValue.slice(m[0].length); st.insertAdjacentHTML('afterbegin', `<span class="ar-stn">${m[1]}</span>`); }); };
CH.wrap('renderPractice', () => ARBAT.parts());

/* ======================= Type chart: your team as small art buttons ======================= */
ARBAT.types = () => { document.querySelectorAll('[data-pane="types"] .ttmon[data-typesmon]:not(.ar-tt)').forEach(b => { const p = byName.get(b.dataset.typesmon); b.classList.add('ar-tt'); if (!p) return;
  b.setAttribute('style', AR.tv(p)); b.insertAdjacentHTML('afterbegin', `<span class="ar-mini ar-bf${AR.isMega(p) ? ' is-mega' : ''}" style="${AR.tv(p)}" aria-hidden="true">${sprite(p) || ''}</span>`); });
  document.querySelectorAll('#typeChart th[title]:not([style*="--tc"])').forEach(t => { const c = TC[t.title]; if (c) t.style.setProperty('--tc', c); });
  document.querySelectorAll('[data-pane="types"] .typebtn:not(.ar-ty2)').forEach(b => { b.classList.add('ar-ty2'); const t = b.dataset.type; if (t) b.style.setProperty('--on-t', AR.onType(t)); }); };
CH.wrap('renderTypes', () => ARBAT.parts());

/* run after the app draws (the same observer pattern as the other theme layers) */
{ let q = false; const run = () => { q = false; try { if (document.querySelector('[data-pane="calc"]:not([hidden]) .dcgrid')) ARBAT.calc(); ARBAT.battle(); ARBAT.parts(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true}); }
if (window.__PL_TEST) window.__ARBAT = ARBAT;
