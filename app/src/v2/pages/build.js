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
    : `<label class="np-field bd-find">${V2.ICON.search}<input type="search" data-bdfind value="${E(V2.bdUi.find)}" placeholder="Optional" aria-label="Build around a Pokémon (optional): type its name" autocomplete="off"></label><div class="bd-hits" data-bdhits></div>`;
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
// ---------- Build piece 2 (Nov 12): the answer, the best team built (mock-up's lock + six + four reasons + actions) ----------
// The option shown is today's abTeam('doubles') (ui.abIdx); its Strength Score is CH.gradeOf on its own RD and checks, the same call
// My Team makes, so both pages agree. Use / Save follow today's 34-events.js rules (Undo; 10 saved max; "Already saved as").
V2.BAND_K = {A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'};
V2.buildAnswer = () => { const E = V2.esc, r = ui.ab;
  if (r && r.busy) return '<p class="bd-busy" role="status">Building from real winning teams…</p>';
  const res = r && r.doubles; if (!res) return '';
  if (!res.teams || !res.teams.length) return `<p class="bd-none" role="status">${res.noMega != null ? `No team fits with ${res.noMega} Mega${res.noMega === 1 ? '' : 's'} from this pool.` : 'No team fits these settings.'} Try Whole roster, or another Megas number.</p>`;
  const t = abTeam('doubles'), n = res.teams.length, k = ((ui.abIdx && ui.abIdx.doubles) || 0) % n;
  let G = null, CK = null; try { CK = proChecks(t._ms, true); G = CH.gradeOf(t._rd, CK, t._ms); } catch (e) {}
  const s = G ? Math.round(G.s) : t.score, band = G ? V2.BAND_K[G.band] || 'solid' : 'solid', word = G ? CH.wordOf(G.s) : '';
  const kind = t.proven ? 'Proven team' : t.fresh ? 'Fresh take' : 'Built team';
  const chips = (t.gp || []).slice(0, 3).concat(t.megas > 1 ? [`${t.megas} Mega options`] : []);
  const six = t.mons.map(m => { const R = monRating(byName.get(m.n));
    return `<div class="bd-pk">${V2.mon(m.n, {iw: 120, bare: true})}<b>${m.n === ui.abLock ? '<span class="mg">Your pick</span> ' : ''}${V2.nameHtml(m.d)}</b><small>${E(m.it || '')}</small><small class="r">${E(String(m.role || '').replace(', Mega', ''))}${R ? ' · ' + E(R.tier) + ' tier ' + R.n : ''}</small></div>`; }).join('');
  const rows = t._rd && t._rd.rows || [], ans = rows.filter(x => x.level >= 2).length, sh = rows.filter(x => x.level === 1).length, no = rows.filter(x => x.level === 0).length;
  const basics = CK ? CK.items.filter(x => !x.skip && !x.note) : [] /* the 4 basics, Matchups included (as My Team's Team checks) */, notes = CK ? CK.items.filter(x => x.note && x.ok).map(x => x.label) : [];
  const core = (t.why || []).map(w => w.match(/^(.*): ([\d,]+) tournament teams, ([\d.]+)% wins$/)).find(Boolean);
  const pv = t.proven;
  const why = `<div class="bd-why">
    <div><span class="n">${ans}<span class="unit">/${rows.length}</span></span><span class="l">Matchups with an answer</span><p>Top ${rows.length} threats: ${sh} Shaky, ${no} No answer</p></div>
    <div><span class="n good">${basics.filter(x => x.ok).length}/${basics.length}</span><span class="l">Team checks: the ${basics.length} basics</span><p>${notes.length ? 'Notes met: ' + notes.map(E).join(', ') : 'No notes met'}</p></div>
    ${pv ? `<div><span class="n">${Math.round(pv.wr * 100)}<span class="unit">% won</span></span><span class="l">This exact six at events</span><p>${homeNum(pv.n)} players, ${homeNum(pv.g)} games</p></div>` : `<div><span class="n">New</span><span class="l">Not yet run at events</span><p>Built from cores that win; no player has run this exact six</p></div>`}
    ${core ? `<div><span class="n">${E(core[3])}<span class="unit">% wins</span></span><span class="l">Best core, ${E(core[2])} teams</span><p>${E(core[1])}</p></div>` : ''}</div>`;
  const nCatch = t.mons.filter(m => !m.box).length;
  const acts = `<div class="row bd-acts"><button type="button" class="np-btn" data-bduse>Use This Team</button><button type="button" class="np-btn2" data-bdsave${S.teams.length >= 10 ? ' disabled title="10 saved teams already"' : ''}><span>Save</span></button><button type="button" class="np-btn2" data-bdcopy><span>Copy for Showdown</span></button>
    <span class="bd-catch">${nCatch === 6 ? 'All six to catch: none is in your box yet' : nCatch ? `${nCatch} to catch` : 'All six are in your box'}</span></div>`;
  return `<section class="bd-ans" style="--band:var(--band-${band})"><div class="bd-lock"><p class="np-eyebrow">Option ${k + 1} of ${n} · ${kind}</p><h2 class="u">${E(t.label)}</h2>
    <div class="np-score bd-score"><b>${s}</b><div class="w"><span>${E(word)}</span><small>Strength Score</small></div></div>${G ? `<p class="bd-rank">${E(CH.pctTxt(G))}</p>` : ''}
    ${chips.length ? `<div class="bd-chips">${chips.map(c => `<span class="np-chip">${E(c)}</span>`).join('')}</div>` : ''}</div><div class="bd-six" style="background:${V2.buildLight(t.mons)}">${six}</div></section>${why}${acts}`; };
V2.pages.build.draw = () => `<div class="bd2">${V2.buildHead()}<div class="bd-result" aria-live="polite">${V2.buildAnswer()}</div></div>`;
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bduse],[data-bdsave],[data-bdcopy]'); if (!b) return; const t = abTeam('doubles'); if (!t) return;
  if (b.hasAttribute('data-bduse')) { keepUndo(); S.format = 'doubles'; S.slots = t.mons.map(m => ({n: m.n, a: null, lock: false})); S.loadedId = null; if (typeof persist === 'function') persist(); location.hash = '#team'; toast('Using the built team. Suggestions and the game plan now describe it.', true); return; }
  if (b.hasAttribute('data-bdsave')) { if (S.teams.length >= 10) return; const key = t.mons.map(m => m.n).sort().join('|'), dup = S.teams.find(x => x.slots.map(s => s.n).filter(Boolean).sort().join('|') === key); if (dup) { toast(`Already saved as "${dup.name}"`); return; }
    const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name = `${t.label || 'Built team'}`.slice(0, 40); S.teams.push({id, name, slots: t.mons.map(m => ({n: m.n, a: null, lock: false})), format: 'doubles', saved: Date.now()}); if (typeof persist === 'function') persist(); toast(`Saved "${name}"`); V2.redraw(); return; }
  if (b.hasAttribute('data-bdcopy')) { const txt = slotsPaste(t.mons.map(m => ({n: m.n, a: null, lock: false}))); try { navigator.clipboard.writeText(txt).then(() => toast('Team copied for Showdown'), () => toast('Could not copy here: open Export on My Team')); } catch (x) { toast('Could not copy here: open Export on My Team'); } } });
// the team's own light behind the six (mock-up: one low wash per Pokémon in its own colour, as My Team); stronger at night
V2.buildLight = mons => { const dk = V2.theme && V2.theme() === 'night', al = dk ? .22 : .11, ph = innerWidth < 700, xs = ph ? [17, 50, 83, 17, 50, 83] : [8, 25, 42, 58, 75, 92], ys = ph ? [30, 30, 30, 80, 80, 80] : [50, 50, 50, 50, 50, 50];
  return mons.map((m, i) => `radial-gradient(${ph ? 30 : 14}% ${ph ? 26 : 46}% at ${xs[i]}% ${ys[i]}%,rgba(${V2.cp(m.n)},${al}),transparent)`).join(','); };
