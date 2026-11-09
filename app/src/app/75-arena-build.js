// ---------- Champions arena, phase 2 group A: Build (gold) and the site-wide overlays ----------
// Arena markup for Build for me, Build around a core, the ⋯ menu, Jump search, Feedback, Copy for Showdown, the welcome card,
// What's new, toasts, the shared-link bar, the health and regulation bars and the footer (theme/arena-build.css, ARENA.md).
// It calls AR.* helpers (74-arena.js) and never redefines them. Every control keeps its element, id, data-* and handler; the
// only nodes replaced are drawings without controls (the built team's old halftone card).
const ARBLD = {};
ARBLD.byD = new Map();
/* a Pokémon from its shown name (team sheet tiles carry the name in their title) */
ARBLD.mon = d => { if (!d) return null; if (byName.get(d)) return byName.get(d); if (!ARBLD.byD.size) ROSTER.forEach(p => ARBLD.byD.set(p.d, p)); return ARBLD.byD.get(d) || null; };
ARBLD.cls = (sel, c) => document.querySelectorAll(sel).forEach(b => b.classList.add(...c.split(' ')));

/* ======================= Build for me ======================= */
/* the main button: the arena go chevron instead of the arrow glyph (its text and handler are the app's) */
CH.wrap('abAroundRender', () => { const go = $('abBtn'); if (!go) return; go.classList.add('ar-btn', 'arb-go');
  const ar = go.querySelector('span[aria-hidden="true"]:not(.ar-go)'); if (ar) ar.remove(); if (!go.querySelector('.ar-go')) go.insertAdjacentHTML('beforeend', AR.ICON.go);
  /* the picked Pokémon stands on its own type field */
  const lk = ui.abLock && byName.get(ui.abLock), chip = document.querySelector('#abAround .abchip'); if (chip && lk) chip.setAttribute('style', AR.tv(lk)); });

/* a built team: the six as equal art tiles on a gold stage, the grade as a big numeral, the checks as pips */
ARBLD.stage = col => { if (col.querySelector('.arb-stage')) return; const use = col.querySelector('[data-abuse]'), fmt = use ? use.dataset.abuse : 'doubles';
  let tm = null; try { tm = abTeam(fmt); } catch (e) {} if (!tm) return;
  const head = col.querySelector('.abhead'), old = col.querySelector('.chabsix');
  const kind = tm.fresh ? 'Fresh take' : tm.proven ? (tm.proven.swapped ? 'Proven team, 1 swap' : 'Proven team') : 'Your build';
  const opt = head && head.querySelector(':scope > .vsub'), optT = opt ? opt.textContent.trim() : '';
  const tiles = tm.mons.map(m => { const p = byName.get(m.n); return p ? AR.art(p, {size: 'm', below: 1, name: m.d, sub: m.it, attrs: `data-lt="${esc(p.n)}" aria-label="${esc(m.d)}${m.it ? ', ' + esc(m.it) : ''}: open its info"`}) : ''; }).join('');
  const G = tm._g, RD = tm._rdv; let score = '', stats = '';
  if (G) { const tt = head && head.querySelector('.npgb'), title = tt ? tt.getAttribute('title') : '';
    // grade first, the win rate under it with the average for scale (Sim, Nov 5: "63.0% Grade A" was confusing)
    score = `<div class="arb-score arb-gfirst"${title ? ` title="${esc(title)}"` : ''}><span class="arb-grade">${G.v === 2 ? 'Strength Score' : 'Grade'}${G.partial ? ' so far' : ''}</span><span class="ar-num ar-mp">${G.v === 2 ? Math.round(G.s) : esc(G.letter)}</span><span class="arb-basis">${G.v === 2 ? `<b style="color:${CH.gcol(G.letter)}">${esc(CH.wordOfL(G.letter))}</b><small class="ar-gsub">${CH.pctTxt(G)}</small>` : `<b>${G.s}</b> / 100`}</span>${G.st && G.st.su && G.st.su.w === 'Low' ? '<small class="ar-gsub">Few real games back this mix yet, so it\'s a best guess</small>' : ''}</div>`; }
  if (RD) { const c = CH.lvCount(RD), h = CH.hand(RD);
    /* plain words (Nov 9): one number, like My Team's Matchups box; what's left in a short line */
    const left = (c[0] || 0) + (c[1] || 0), muLine = left ? `${c[0] ? `${c[0]} with no answer${c[1] ? ', ' : ''}` : ''}${c[1] ? `${c[1]} shaky` : ''}` : 'Every top threat has an answer';
    stats = `<div class="ar-trio arb-trio arb-mu">${AR.cell(h ? h.x + '/' + h.n : RD.score + '%', 'ready for top threats')}<span class="ar-muline">${muLine}</span></div>`; }
  const ck = tm.grade, pips = ck ? `<div class="arb-checks"><b>${ck.pass}/${ck.n}</b><span>team checks</span><span class="ar-pips" aria-hidden="true">${Array.from({length: ck.n}, (_, i) => `<i${i < ck.pass ? '' : ' class="off"'}></i>`).join('')}</span></div>` : '';
  const st = document.createElement('div'); st.className = 'arb-stage';
  st.innerHTML = `<div class="arb-sthead"><div><p class="ar-kick">${esc(kind)}</p><h2 class="ar-h2">${esc(String(tm.label || 'Your six').split(/\s*·\s*/).join(', '))}</h2>${optT ? `<p class="arb-opt">${esc(optT.charAt(0).toUpperCase() + optT.slice(1))}</p>` : ''}</div>${score}</div>
    <div class="ar-six">${tiles}</div><div class="arb-nums">${stats}${pips}</div>`;
  (old || head || col.firstChild).before(st); if (old) old.remove();
  /* the checks line ("missing: …", the full list in its tooltip) moves under the pips */
  const mk = head && head.querySelector('.minick'), cks = st.querySelector('.arb-checks'); if (mk && cks) cks.append(mk);
  if (head) head.classList.add('arb-hidehead');
  /* the six in the fold: each sprite on its small type field */
  col.querySelectorAll('.abmons .abmon').forEach((r, i) => { const m = tm.mons[i], p = m && byName.get(m.n), img = r.querySelector(':scope > img.spr'); if (!p || !img || img.parentElement.classList.contains('ar-row-f')) return;
    const ch = r.querySelector(':scope > .chips'); if (ch && !ch.dataset.arb) { ch.dataset.arb = '1'; ch.innerHTML = (p.t || []).map(AR.tag).join(''); }
    const f = document.createElement('span'); f.className = 'ar-row-f ar-field arb-rf'; f.setAttribute('style', AR.tv(p)); f.setAttribute('aria-hidden', 'true'); img.before(f); f.append(img); });
  /* the actions: Use this team is the one yellow button once a team is built */
  col.querySelectorAll('.row > button.btn').forEach(b => { b.classList.add('ar-btn'); if (b.dataset.abuse) { b.classList.add('ar-primary'); if (!b.querySelector('.ar-go')) b.insertAdjacentHTML('beforeend', AR.ICON.go); } });
  col.querySelectorAll('.row > .sdcopy').forEach(b => b.classList.add('ar-btn')); };

/* team sheet cards (recent winners) on Build: each Pokémon on its own type field */
ARBLD.sheets = root => { root.querySelectorAll('.evteam .tgm:not(.arb-t)').forEach(t => { const p = ARBLD.mon(t.getAttribute('title')); t.classList.add('arb-t'); if (!p) return; t.setAttribute('style', AR.tv(p));
    /* Megas read "Mega Charizard Y" with the power-up contour, as on Home and My team (no "M" square) */
    if (AR.isMega(p)) t.classList.add('is-mega'); const n = t.querySelector('.tgn'); if (n) n.innerHTML = AR.nm(p.d); });
  root.querySelectorAll('.evteam .evbtns > button.btn, .evteam .evbtns > .sdcopy').forEach(b => b.classList.add('ar-btn'));
  root.querySelectorAll('.evteam .evbtns > button.linkbtn').forEach(b => b.classList.add('ar-link')); };

ARBLD.build = () => { const sec = $('autobuild'), pane = document.querySelector('[data-pane="auto"]'); if (!sec || !pane) return;
  const out = $('abOut'), built = !!(out && out.querySelector('[data-abuse]'));
  sec.classList.toggle('arb-has', built); pane.classList.add('arb-pane');
  const go = $('abBtn'); if (go) { go.classList.add('ar-btn', 'arb-go'); go.classList.toggle('ar-primary', !built); }
  sec.querySelectorAll('.abhero .seg:not(.ar-seg)').forEach(s => s.classList.add('ar-seg'));
  if (out) { out.querySelectorAll('.abcol').forEach(c => { try { ARBLD.stage(c); } catch (e) {} }); ARBLD.sheets(out); } };
CH.wrap('renderAutoBuild', () => ARBLD.build());

/* ======================= Build around a core ======================= */
ARBLD.cores = () => { const el = $('coreOut'); if (!el) return; const sec = $('cores'); if (sec) sec.classList.add('arb-cores');
  el.querySelectorAll('.seg:not(.ar-seg)').forEach(s => s.classList.add('ar-seg'));
  el.querySelectorAll('.corerow:not(.arb-row)').forEach(r => { r.classList.add('arb-row'); const key = (r.dataset.dbbox || '').replace(/^core:/, ''), ns = key.split('|');
    const imgs = r.querySelectorAll('.coresprs > img'); imgs.forEach((img, i) => { const p = byName.get(ns[i]); const f = document.createElement('span'); f.className = 'arb-cf' + (p && AR.isMega(p) ? ' is-mega' : '');
      if (p) f.setAttribute('style', AR.tv(p)); f.innerHTML = '<span class="arb-cff ar-field" aria-hidden="true"></span>'; img.before(f); f.append(img); });
    if (r.classList.contains('chcbig') && !r.querySelector('.coretags')) { const m = r.querySelector('.coremain'); if (m) m.insertAdjacentHTML('beforeend', '<div class="coretags arb-notags" aria-hidden="true"></div>'); }
    r.querySelectorAll('.corebtns > button.btn').forEach(b => b.classList.add('ar-btn')); r.querySelectorAll('.corebtns > .sdcopy').forEach(b => b.classList.add('ar-btn'));
    r.querySelectorAll('.corebtns > button.linkbtn').forEach(b => b.classList.add('ar-link')); });
  el.querySelectorAll('.morebar > button.btn').forEach(b => b.classList.add('ar-btn'));
  const lk = coreUi.mon && byName.get(coreUi.mon), chip = el.querySelector('.corefind .corechip'); if (chip && lk) chip.setAttribute('style', AR.tv(lk)); };
CH.wrap('renderCores', () => ARBLD.cores());

/* ======================= the ⋯ menu ======================= */
/* each group takes its section colour (Build gold, My team blue, Battle red-orange, Meta purple) */
ARBLD.side = () => { const side = $('side'); if (!side || side.dataset.arb) return; side.dataset.arb = '1';
  const map = {Build: 'ar-gold', 'My team': 'ar-blue', Battle: 'ar-orange', Meta: 'ar-purple', Info: 'ar-purple'};
  side.querySelectorAll('.sidenav .sgroup').forEach(g => { const l = g.querySelector('.sgl'), t = l ? l.textContent.trim() : ''; g.classList.add(map[t] || 'ar-pink', 'arb-g'); });
  side.querySelectorAll('.themeseg').forEach(s => s.classList.add('ar-seg'));
  const x = $('sideClose'); if (x) x.classList.add('ar-x'); };

/* ======================= Jump search ======================= */
/* each Pokémon result stands on its own small type field; the keyboard hint without middle dots */
CH.wrap('jumpRender', () => { const el = $('jumpList'); if (!el) return;
  el.querySelectorAll('li[data-jo]').forEach(li => { const x = jumpList[+li.dataset.jo]; if (!x || !x.p) { li.classList.add('arb-tool'); return; } li.setAttribute('style', AR.tv(x.p));
    const img = li.querySelector(':scope > img'); if (img && !img.parentElement.classList.contains('arb-jf')) { const f = document.createElement('span'); f.className = 'arb-jf ar-field'; f.setAttribute('aria-hidden', 'true'); img.before(f); f.append(img); } });
  const h = document.querySelector('#jump .jhint'); if (h && !h.dataset.arb) { h.dataset.arb = '1'; h.innerHTML = '<span><kbd>↑</kbd><kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span>'; } });

/* ======================= Feedback, Copy for Showdown: arena dialogs ======================= */
ARBLD.dlg = () => { const fb = document.querySelector('#fbSheet .fbbox:not(.arb-d)');
  if (fb) { fb.classList.add('arb-d'); fb.querySelectorAll('.seg').forEach(s => s.classList.add('ar-seg')); const x = fb.querySelector('.fbx'); if (x) x.classList.add('ar-x');
    const s = $('fbSend'); if (s) { s.classList.add('ar-btn', 'ar-primary'); if (!s.querySelector('.ar-go')) s.insertAdjacentHTML('beforeend', AR.ICON.go); }
    const C = typeof FB === 'object' && FB.ctx, p = C && C.mon && byName.get(C.mon), cx = fb.querySelector('.fbctx'); if (cx && p) { cx.setAttribute('style', AR.tv(p)); cx.classList.add('arb-ctx'); } }
  const sd = document.querySelector('#sdSheet .sdbox:not(.arb-d)');
  if (sd) { sd.classList.add('arb-d'); const x = sd.querySelector('.sdx'); if (x) x.classList.add('ar-x'); sd.querySelectorAll('.row > button.btn').forEach(b => b.classList.add('ar-btn')); } };

/* ======================= welcome card, What's new, shared link, footer ======================= */
ARBLD.home = () => { const w = $('welcomeCard'); if (w && !w.dataset.arb) { w.dataset.arb = '1';
    w.querySelectorAll('.wsteps > li').forEach((li, i) => { if (!li.querySelector('.ar-step')) li.insertAdjacentHTML('afterbegin', `<span class="ar-step" aria-hidden="true"><span>${i + 1}</span></span>`); });
    w.querySelectorAll('.row > button').forEach(b => { /* Got it is a strip too, in the card's pink (Sim, Nov 7: the link looked off theme) */ b.classList.add('ar-btn'); b.style.setProperty('--edge', b.dataset.welcomex ? 'var(--ar-pink)' : b.dataset.view === 'auto' ? 'var(--ar-gold)' : 'var(--ar-purple)'); }); }
  const sb = $('sharedBar'); if (sb && !sb.dataset.arb) { sb.dataset.arb = '1'; sb.querySelectorAll('button').forEach(b => b.classList.add(b.dataset.sharedx ? 'ar-link' : 'ar-btn')); }
  document.querySelectorAll('footer.legal button.linkbtn:not(.ar-link)').forEach(b => b.classList.add('ar-link')); };

/* ======================= keyboard and phones: overlays take, keep and give back focus ======================= */
/* the menu, Jump search, Copy for Showdown and Feedback: on open, focus moves in (the current page's row in the menu); Tab and
   Shift+Tab stay inside; on close, focus goes back to the control that opened it */
ARBLD.OV = [['side', () => { const s = $('side'); return !!(s && s.classList.contains('open')); }, s => s.querySelector('.sidenav [aria-selected="true"]') || $('sideClose')],
  ['jump', () => { const j = $('jump'); return !!(j && !j.hidden); }, () => $('jumpIn')],
  ['sdSheet', () => { const j = $('sdSheet'); return !!(j && !j.hidden); }, () => $('sdText')],
  ['fbSheet', () => { const j = $('fbSheet'); return !!(j && !j.hidden); }, () => $('fbText')]];
ARBLD.was = {}; ARBLD.opener = {}; ARBLD.hist = [];
/* the last few focused controls outside the overlays (a copy fallback focuses a throwaway textarea, so the newest may be gone) */
document.addEventListener('focusin', e => { const t = e.target; if (t && t.closest && !t.closest('#side,#jump,#sdSheet,#fbSheet')) { try { t._arbKey = ARBLD.key(t); } catch (er) {} ARBLD.hist.push(t); if (ARBLD.hist.length > 6) ARBLD.hist.shift(); } }, true);
/* a control the page redrew meanwhile is found again by its id or its first data-* attribute */
ARBLD.key = o => { if (!o || !o.attributes) return null; if (o.id) return '#' + CSS.escape(o.id); const d = [...o.attributes].find(x => x.name.startsWith('data-')); return d ? `${o.tagName.toLowerCase()}[${d.name}="${CSS.escape(d.value)}"]` : null; };
ARBLD.back = (id, list) => { for (let i = list.length - 1; i >= 0; i--) { let o = list[i]; if (!o || o === document.body) continue;
    if (!o.isConnected) { const k = o._arbKey; o = k ? [...document.querySelectorAll(k)].find(x => x.getClientRects().length) : null; }
    if (o && o.isConnected && o.getClientRects().length) return o; }
  return id === 'jump' ? [...document.querySelectorAll('[data-jumpbtn]')].find(x => x.getClientRects().length) : id === 'side' ? [...document.querySelectorAll('#moreBtn')].find(x => x.getClientRects().length) : null; };
ARBLD.tabbable = el => [...el.querySelectorAll('button,[href],input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.tabIndex >= 0 && x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden');
ARBLD.focusTick = () => { for (const [id, open, first] of ARBLD.OV) { const on = open(), el = $(id);
    if (on && !ARBLD.was[id]) { ARBLD.opener[id] = ARBLD.hist.slice(); const f = first(el); if (f && !el.contains(document.activeElement)) setTimeout(() => { try { f.focus({preventScroll: true}); } catch (e) {} }, 40); }
    if (!on && ARBLD.was[id]) { const o = ARBLD.back(id, ARBLD.opener[id] || []), a = document.activeElement; if (o && (!a || a === document.body || (el && el.contains(a)))) try { o.focus({preventScroll: true}); } catch (e) {} ARBLD.opener[id] = null; }
    ARBLD.was[id] = on; } };
new MutationObserver(() => ARBLD.focusTick()).observe(document.body, {attributes: true, attributeFilter: ['hidden', 'class'], subtree: true, childList: true});
document.addEventListener('keydown', e => { if (e.key !== 'Tab' || e.defaultPrevented) return; const o = ARBLD.OV.find(([, open]) => open()); if (!o) return; const el = $(o[0]); if (!el) return;
  const L = ARBLD.tabbable(el); if (!L.length) return; const i = L.indexOf(document.activeElement);
  if (e.shiftKey && (i <= 0)) { e.preventDefault(); L[L.length - 1].focus(); } else if (!e.shiftKey && (i === -1 || i === L.length - 1)) { e.preventDefault(); L[0].focus(); } });
/* phones: a Pokémon field (Build around, cores) moves up when focused, so its suggestions open above the bottom bar */
document.addEventListener('focusin', e => { const t = e.target; if (!t || !t.matches || !t.matches('#abAroundIn,#coreMonIn') || innerWidth > 1000) return;
  setTimeout(() => { const r = t.getBoundingClientRect(); if (r.top > innerHeight * .3) { const rm = matchMedia('(prefers-reduced-motion: reduce)').matches; scrollBy({top: r.top - Math.max(80, innerHeight * .14), behavior: rm ? 'auto' : 'smooth'}); } }, 60); });

/* run after the app draws (the same observer pattern as 74-arena.js) */
{ let q = false; const run = () => { q = false; for (const f of [ARBLD.side, ARBLD.dlg, ARBLD.home]) try { f(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true}); run(); }

if (window.__PL_TEST) window.__ARBLD = {ARBLD, setView, jumpOpen, fbOpen, fbMistake, sdSheetOpen, exportPaste, SD_NOTE_BUILT, toast, keepUndo, teamCode, renderHealth, DATA_AT, META,
  renderAutoBuild, abAroundRender, renderCores, get ui() { return ui; }, get S() { return S; }};
