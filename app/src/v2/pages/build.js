// ---------- Build (R4, Nov 12): piece 1, the head and the options strip, from the approved mock-up (docs/rebuild/mocks/build.tpl.html) ----------
// Every setting is today's: the pool is ui.abSrc (saved as cc2.absrc, as 34-events.js), Megas on team is megaGoal()/setMegaGoal() (one
// value shared with My Team's slider), Build around is ui.abLock (as 52-sleepers.js / Home's Build Around It). The engine (runAutoBuild,
// 22-auto-build.js) is shared; the answer card and the lower sections are pieces 2 and 3.
V2.bdUi = V2.bdUi || {find: ''};
V2.buildHead = () => { const E = V2.esc, nBox = (S.box || []).length, lk = ui.abLock && byName.get(ui.abLock);
  const head = `<div class="bd-head"><div><p class="np-eyebrow"><span>Build ·<span class="bd-rw"> real winning teams ·</span> ${E(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C')} doubles</span></p><h1 class="u">Build me <span class="pl">a team.</span></h1></div>
    <div class="bd-side"><p>Winning tournament teams you can field from your box or the whole roster.</p><button type="button" class="np-link" data-bdhow>How it works ›</button></div></div>`;
  const src = V2.slide('bdsrc', [['box', `My Box ${nBox}`], ['all', 'Whole roster']], ui.abSrc === 'all' ? 'all' : 'box', 'Build from');
  const meg = V2.slide('sgmega', [['0', '0'], ['1', '1'], ['2', '2']], String(megaGoal()), 'Megas on team');
  const around = lk ? `<div class="bd-pick">${SPRITE_ID[lk.n] ? `<img src="${V2.art(SPRITE_ID[lk.n])}" alt="">` : ''}<b>${V2.nameHtml(V2.disp(lk.n))}</b><button type="button" class="bd-x" data-bdx aria-label="Stop building around ${E(V2.disp(lk.n))}">×</button></div>`
    : `<label class="np-field bd-find">${V2.ICON.search}<input type="search" data-bdfind value="${E(V2.bdUi.find)}" placeholder="Optional: pick a Pokémon" aria-label="Build around a Pokémon (optional)" autocomplete="off"></label><div class="bd-hits" data-bdhits></div>`;
  const busy = !!(ui.ab && ui.ab.busy), label = lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team';
  const opts = `<div class="bd-opts"><div class="bd-opt bd-src"><span class="bd-lab">Build from</span>${src}</div><div class="bd-opt bd-meg"><span class="bd-lab">Megas on team</span>${meg}</div>
    <div class="bd-opt bd-around"><span class="bd-lab">Build around a Pokémon <span>· optional</span></span>${around}</div>
    <div class="bd-opt bd-go"><button type="button" class="np-btn2" data-bdgo${busy ? ' aria-busy="true" disabled' : ''}><span>${label}${ui.ab && !busy ? ' ↻' : ''}</span></button></div></div>`;
  return head + opts; };
V2.buildHits = q => { q = String(q || '').trim().toLowerCase(); if (!q) return '';
  const r = ROSTER.filter(p => !p.m && (p.d || p.n).toLowerCase().includes(q)).slice(0, 6);
  return r.length ? r.map(p => `<button type="button" class="np-hit" data-bdpick="${V2.esc(p.n)}">${SPRITE_ID[p.n] ? `<img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy">` : ''}<b>${V2.esc(p.d || p.n)}</b></button>`).join('')
    : `<p class="fine">No Pokémon called “${V2.esc(q)}”.</p>`; };
V2.pages.build = {place: 'build', draw() { return `<div class="bd2">${V2.buildHead()}<section class="bd-result" aria-live="polite">${ui.ab && ui.ab.busy ? '<p class="fine">Building from real winning teams…</p>' : ''}</section></div>`; }};
// the pool: today's rule (34-events.js): save, and rebuild if results are showing
document.addEventListener('v2slide', e => { if (e.detail.key !== 'bdsrc') return; ui.abSrc = e.detail.value === 'all' ? 'all' : 'box'; try { LS.set('cc2.absrc', ui.abSrc); } catch (x) {} if (ui.ab && !ui.ab.busy) runAutoBuild(); V2.redraw(); });
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-bdfind]'); if (!i) return; V2.bdUi.find = i.value; const h = document.querySelector('[data-bdhits]'); if (h) h.innerHTML = V2.buildHits(i.value); });
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-bdfind]'); if (!i) return;
  if (e.key === 'Enter') { const h = document.querySelector('[data-bdhits] [data-bdpick]'); if (h) { e.preventDefault(); h.click(); } }
  else if (e.key === 'Escape') { V2.bdUi.find = ''; i.value = ''; const h = document.querySelector('[data-bdhits]'); if (h) h.innerHTML = ''; } });
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-bdpick],[data-bdx],[data-bdgo]'); if (!t) return;
  if (t.dataset.bdpick) { const p = byName.get(t.dataset.bdpick); if (!p) return; ui.abLock = p.n; if (typeof inBox === 'function' && !inBox(p)) ui.abSrc = 'all'; V2.bdUi.find = ''; if (ui.ab && !ui.ab.busy) ui.ab = null; V2.redraw(); return; }
  if (t.hasAttribute('data-bdx')) { ui.abLock = null; if (ui.ab && !ui.ab.busy) ui.ab = null; V2.redraw(); setTimeout(() => { const i = document.querySelector('[data-bdfind]'); if (i) i.focus(); }, 30); return; }
  if (t.hasAttribute('data-bdgo')) { runAutoBuild(); V2.redraw(); } });
// How it works (today's three points, 22-auto-build.js abStart; "Ready for the top threats" is "Matchups" in the word list)
V2.BUILD_HOW = [['Six that work together', 'Built from teams that win at real tournaments, filtered to what you own.'], ['The why', 'Each pick comes with its job on the team and what it fixes.'], ['Matchups', 'Which of the top threats it answers, and the one change that would help most.']];
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-bdhow]'))) return;
  V2.sheet(`<div class="bd-how"><p class="np-eyebrow">Build</p><h2 class="u">How it works</h2><ol class="hm-steps">${V2.BUILD_HOW.map(([t, d]) => `<li><b>${V2.esc(t)}</b><span>${V2.esc(d)}</span></li>`).join('')}</ol></div>`, {label: 'How Build works', fit: true}); });
