// ---------- Build: The Blueprint (Sim's pick, Nov 14; brief docs/rebuild/mocks/build-blueprint/BRIEF.md) ----------
// A built team is drawn as one drafting sheet: the header line (Sheet k of n, its kind), the team and its Strength Score, a dimension line,
// six numbered figures, then the title block: Spec (today's three options), Revisions (every option; was Other Options) and Build Me a Team;
// Notes (the four proof numbers) and the actions. Same engine, data and words as the page before (build.js: abTeam, CH.gradeOf, proChecks,
// t.why, t.proven); same hooks (data-bdgo, data-bdshow, data-bduse/save/copy, data-bdwhy, data-v2mon, the slides bdsrc / sgmega, data-bdfind).
// The page before a first build is Sheet 0 of the same sheet (Q83 item 1, Sim Nov 20; V2.bpSheet0 below).
V2.bpModel = () => { const res = ui.ab && !ui.ab.busy && ui.ab.doubles; if (!res || !res.teams || !res.teams.length) return null;
  const t = abTeam('doubles'), n = res.teams.length, k = ((ui.abIdx && ui.abIdx.doubles) || 0) % n;
  let G = null, CK = null; try { CK = proChecks(t._ms, true); G = CH.gradeOf(t._rd, CK, t._ms); } catch (e) {}
  const kind = t.proven ? (t.proven.swapped ? 'Proven team, 1 swap' : 'Proven team') : t.fresh ? 'Fresh take' : 'Built team';
  const rows = t._rd && t._rd.rows || [], basics = CK ? CK.items.filter(x => !x.skip && !x.note) : [], notes = CK ? CK.items.filter(x => x.note && x.ok).map(x => x.label) : [];
  const core = (t.why || []).map(w => w.match(/^(.*): ([\d,]+) tournament teams, ([\d.]+)% wins$/)).find(Boolean);
  return {res, t, n, k, G, CK, s: G ? Math.round(G.s) : '–' /* never the builder's own number (code review A1-M4) */, band: G ? V2.BAND_K[G.band] || 'solid' : 'solid', word: G ? CH.wordOf(G.s) : '', kind, rows, basics, notes, core,
    ans: rows.filter(x => x.level >= 2).length, sh: rows.filter(x => x.level === 1).length, no: rows.filter(x => x.level === 0).length, nCatch: t.mons.filter(m => !m.box).length}; };
V2.bpFig = (m, i, coreNames, showTags) => { const E = V2.esc, p = byName.get(m.n), R = monRating(p), d = V2.disp(m.n), mega = /^Mega /.test(d);
  const tag = [!m.box ? 'to catch' : '', m.offMeta ? 'off‑meta' : ''].filter(Boolean).join(' · ');
  const ba = !!ui.abLock && m.n === ui.abLock; /* Q83 item 5 (Sim, Nov 20): the Pokémon you built around is figure 01 with a small "Built around" tag
     (was a "Your pick" line over its name). Sim, Nov 17: no role headings (Sun, Tailwind, Priority) and no Core badge; only this one is marked */
  return `<button type="button" class="bp-fig${ba ? ' bp-ba' : ''}" data-v2mon="${E(m.n)}" aria-label="${E(d)}${ba ? ', built around' : ''}${m.it ? ', ' + E(m.it) : ''}${R ? `, ${E(R.tier)} tier ${R.n}` : ''}${tag ? ', ' + tag : ''}: open its info">
    <span class="bp-no u" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${ba ? '<span class="bp-batag" aria-hidden="true">Built around</span>' : ''}
    <span class="bp-art" aria-hidden="true"><i class="bp-ring"></i>${V2.mon(m.n, {bare: true})}</span><i class="bp-base" aria-hidden="true" style="--b1:var(--ty-${p ? p.t[0] : 'Normal'});--b2:var(--ty-${p ? p.t[1] || p.t[0] : 'Normal'})"></i>
    <span class="bp-mg u">${mega ? 'Mega' : '&nbsp;'}</span><b>${E(mega ? d.slice(5) : d)}</b><small>${E(m.it || '')}</small><small class="r">${R ? `${E(R.tier)} tier ${R.n}` : ''}${showTags && tag ? ' · ' + tag : ''}</small></button>`; };
/* Q83 item 5: the engine puts the picked Pokémon anywhere in its six (measured Nov 20: Garchomp 4th, 3rd, 4th); the sheet draws it first.
   Display only: the team, its order on Load Team / Save / Copy and every number stay the engine's. */
V2.bpOrder = mons => { const L = ui.abLock, i = L ? mons.findIndex(m => m.n === L) : -1; return i > 0 ? [mons[i], ...mons.filter((m, j) => j !== i)] : mons; };
V2.bpSpec = () => { const E = V2.esc, lk = ui.abLock && byName.get(ui.abLock);
  const src = V2.slide('bdsrc', [['box', 'My Box'], ['all', 'Whole Roster']], ui.abSrc === 'all' ? 'all' : 'box', 'Build from');
  const meg = V2.slide('sgmega', [['0', '0'], ['1', '1'], ['2', '2']], String(megaGoal()), 'Megas on team');
  const around = lk ? `<div class="bd-pick">${SPRITE_ID[lk.n] ? `<img src="${V2.art(SPRITE_ID[lk.n])}" alt="">` : ''}<b>${V2.nameHtml(V2.disp(lk.n))}</b><button type="button" class="bd-x" data-bdx aria-label="Stop building around ${E(V2.disp(lk.n))}">×</button></div>`
    : `<label class="np-field bd-find">${V2.ICON.search}<input type="search" data-bdfind value="${E(V2.bdUi.find || '')}" placeholder="Any Pokémon" aria-label="Build around a Pokémon (optional): type its name" autocomplete="off">${V2.CLR}</label><div class="bd-hits" data-bdhits></div>`;
  return `<div class="bp-spec bd-opts"><div class="bd-opt bd-src"><span class="bd-lab">Build from</span>${src}</div><div class="bd-opt bd-meg"><span class="bd-lab">Megas on team</span>${meg}</div><div class="bd-opt bd-around"><span class="bd-lab">Build around <span>· optional</span></span>${around}</div></div>${V2.bpMegaTip()}`; };
/* Q13d (Sim, Nov 18, answer B): today's Megas tip, back under the Spec. Today's page typed "73% ... 81%" into a title tooltip (body.html);
   here both numbers are counted from the live data, and the tip is left out when neither can be counted:
   - tournament teams: results.megaN from the daily job (update.mjs: full sixes with 0 / 1 / 2 / 3+ Mega options; experiments/mega-share.mjs)
   - event winners: each event's winner with a full known six, as ckWinRefresh lists them for "(N% bring 2)" (06-helpers.js), counted
     here directly so Build doesn't start that ~120-team pass */
V2.bpMegaShare = () => { const R = (typeof META === 'object' && META.results) || (typeof RES === 'object' && RES) || null, mg = R && Array.isArray(R.megaN) && R.megaN.length === 4 ? R.megaN.map(Number) : null;
  const tot = mg ? mg.reduce((a, b) => a + b, 0) : 0, Ev = typeof META === 'object' && META.events && Array.isArray(META.events.events) ? META.events.events : [];
  const win = Ev.map(ev => ev.top && ev.top[0]).filter(t => t && t.place === 1 && t.mons && t.mons.length === 6 && t.mons.every(m => byName.get(m.n)));
  return {teams: tot >= 100 ? 100 * mg[2] / tot : null, nTeams: tot, wins: win.length >= 20 ? 100 * win.filter(t => t.mons.filter(m => byName.get(m.n).m).length === 2).length / win.length : null, nWins: win.length}; };
V2.bpMegaTip = () => { let M = null; try { M = V2.bpMegaShare(); } catch (e) {} if (!M || (M.teams == null && M.wins == null)) return '';
  const who = [M.teams != null ? `${pctFmt(M.teams)} of tournament teams` : '', M.wins != null ? `${pctFmt(M.wins)} of event winners` : ''].filter(Boolean).join(' and ');
  return `<p class="bd-mtip">${who} carry 2 Mega options. Only one can Mega Evolve per battle.</p>`; };
V2.bpRevs = M => { const E = V2.esc, L = 'ABCDEFGH';
  return `<div class="bd-others bp-revs" role="list">${M.res.teams.map((t, i) => { let G = null, CK = null; try { CK = proChecks(t._ms, true); G = CH.gradeOf(t._rd, CK, t._ms); } catch (e) {}
    const rows = t._rd && t._rd.rows || [], ans = rows.filter(x => x.level >= 2).length, bas = CK ? CK.items.filter(x => !x.skip && !x.note) : [], on = i === M.k;
    return `<div role="listitem"><button type="button" class="bp-rev${on ? ' on' : ''}" data-bdshow="${i}"${on ? ' aria-current="true"' : ''} aria-label="Option ${i + 1}, ${E(t.label)}, Strength Score ${G ? Math.round(G.s) : '–'}${on ? ', shown' : ': show this one'}">
      <span class="bp-rl u" aria-hidden="true">${L[i] || i + 1}</span><span class="bp-rn"><b>${V2.dotWrap(E(t.label))}</b><span class="bp-rsix" aria-hidden="true">${V2.bpOrder(t.mons).map(m => V2.mon(m.n, {iw: 36, bare: true})).join('') /* Q83 item 3: each option's six as small sprites */}</span><small><span class="bp-lf">${ans}/${rows.length} matchups with an answer · ${bas.filter(x => x.ok).length}/${bas.length} team checks</span><span class="bp-sh">${ans}/${rows.length} matchups · ${bas.filter(x => x.ok).length}/${bas.length} checks</span></small></span><span class="bp-rs u" aria-hidden="true">${G ? Math.round(G.s) : '–'}</span>${on ? '' : '<span class="vh">Show This One ›</span>'}</button></div>`; }).join('')}${M.res.freshPending ? '<div role="listitem"><div class="bp-rev bp-revwait"><span class="bp-rl u" aria-hidden="true">…</span><span class="bp-rn"><b>Finding a fresh take…</b><small>A different six, worked out next</small></span></div></div>' : ''}</div>`; }; /* the fresh take's row is held while it's worked out (Nov 15: the list grew 82 px a moment after the result) */
V2.bpNotes = M => { const E = V2.esc, pv = M.t.proven, li = (n, u, l, s) => `<li><span class="n u">${n}${u ? `<span class="unit">${u}</span>` : ''}</span><span class="bp-nt"><b>${l}</b><small>${s}</small></span></li>`;
  return `<ol class="bp-notes">${li(M.ans, '/' + M.rows.length, 'Matchups with an answer', `Top ${M.rows.length} threats: ${M.sh} Shaky, ${M.no} No answer`)}
    ${li(`${M.basics.filter(x => x.ok).length}`, '/' + M.basics.length, `Team checks: the ${M.basics.length} basics`, M.notes.length ? 'Notes met: ' + M.notes.map(E).join(', ') : 'No notes met')}
    ${pv ? li((pv.wr * 100).toFixed(1), '% wins', /* re-audit Nov 15: the same word and precision as the core line below; Sim Q3 (7:00 AM): 'games at events' here, '479 of this six's games at events' in Why This Score */ pv.swapped ? 'Their six at events, 1 swap' : 'This exact six at events', `${homeNum(pv.n)} players${pv.g ? `, ${homeNum(pv.g)} games at events` : ''}${pv.swapped && pv.ours && pv.theirs ? `, with ${E(V2.disp(pv.ours))} in place of ${E(V2.disp(pv.theirs))}` : ''}`) : li('New', '', 'Not yet run at events', 'Built from cores that win; no player has run this exact six')}
    ${M.core ? li(E(M.core[3]), '% wins', `Best trio, ${E(M.core[2])} teams`, E(M.core[1])) : ''}</ol>`; };
V2.buildSheet = M => { const E = V2.esc, t = M.t, busy = !!(ui.ab && ui.ab.busy), lk = ui.abLock && byName.get(ui.abLock);
  const coreNames = M.core ? M.core[1].split(' + ').map(s => s.trim()) : [], tags = t.mons.some(x => !x.box || x.offMeta), chips = t.gp || [] /* every plan chip, as today (Nov 18, OL-i15: a cap of 3 dropped Lead support); four go 2 + 2 where one row can't hold them */;
  const tips = (t.why || []).filter(w => /^(Best single catch|To reach 90\+)/.test(w) || /isn't in your box: /.test(w)); /* the engine's catch tip and box lines (22-auto-build.js), as today's card showed them (Nov 18, OL-i15) */
  const ey = `${M.n > 1 ? `Option ${M.k + 1} of ${M.n} · ` : ''}${M.kind}${t.megas > 1 ? ` · ${t.megas} Mega options` : ''}`;
  const acts = `<div class="row bd-acts"><button type="button" class="np-btn" data-bduse>Load Team</button><button type="button" class="np-btn2 k-btn" data-bdsave${S.teams.length >= 10 ? ' disabled title="10 saved teams already"' : ''}><span>Save</span></button><button type="button" class="np-btn2 k-btn" data-bdcopy><span>Copy for Showdown</span></button>
    <span class="bd-catch">${M.nCatch === 6 ? 'All six to catch: none is in your box yet' : M.nCatch ? `${M.nCatch} to catch` : 'All six are in your box'}</span></div>${tips.map(w => `<p class="bd-catch">${E(w)}</p>`).join('')}`;
  /* scan S16 (Nov 20) put the actions right under the six under 1100 wide; Q83 item 2 (Sim, Nov 20): at every width now. Still one Load Team (C4). */
  return `<section class="bd-ans bp" style="--band:var(--band-${M.band});--band-on:var(--on-band-${M.band})"><i class="bp-x xtl" aria-hidden="true"></i><i class="bp-x xtr" aria-hidden="true"></i><i class="bp-x xbl" aria-hidden="true"></i><i class="bp-x xbr" aria-hidden="true"></i>
    <p class="bp-line"><span class="bp-plate u">Sheet ${M.k + 1} of ${M.n}</span><span class="bp-kind">${E(M.kind)}${t.megas > 1 ? ` · ${t.megas} Mega options` : ''}</span><span class="bp-src">${E(regName())} doubles · drawn from real winning teams</span></p>
    <div class="bd-lock bp-top"><p class="np-eyebrow vh">${ey}</p><div class="bp-team"><p class="bp-k">Team</p><h2 class="u">${E(t.label).replace(/ · /g, '\u00a0· ')}</h2>${chips.length ? `<div class="bd-chips bp-chips${chips.length === 4 ? ' n4' : ''}">${chips.map(c => `<span class="np-chip">${E(c)}</span>`).join('')}</div>` : ''}${t.fresh ? '<p class="bd-fresh">A fresh take: built on raw power and fit instead of popularity, with at most 2 meta staples. Fewer people will have prepared for it.</p>' : ''}</div>
      <div class="bp-meas"><div class="np-score bd-score bp-score"><b class="u">${M.s}</b><div class="w"><span class="bp-stk"><span class="bp-stamp u">${E(M.word)}</span></span><small>Strength Score${M.G && CH.rkOf(M.G) != null ? ' · ' + E(CH.pctTxt(M.G)) : ''}</small></div></div>${M.G ? V2.buildBrk(M.G) : ''}</div></div>
    <p class="bp-dim"><span>Team of six${t.megas ? ` · ${t.megas} Mega${t.megas === 1 ? '' : 's'}` : ''}</span></p>
    <div class="bd-six bp-six${t.mons.some(m => { const d = V2.disp(m.n); return (/^Mega /.test(d) ? d.slice(5) : d).length > 9; }) ? ' lg' : ''}">${V2.bpOrder(t.mons).map((m, i) => V2.bpFig(m, i, coreNames, tags)).join('')}</div><div class="bp-near">${acts}</div>
    <div class="bp-tb"><div class="bp-left"><p class="bp-k">Spec · tap a field to change it</p>${V2.bpSpec()}${M.n > 1 ? `<p class="bp-k">Revisions · tap one to see it</p>${V2.bpRevs(M)}` : ''}
        <div class="bd-opt bd-go"><button type="button" class="bp-rebuild u" data-bdgo${busy ? ' aria-busy="true" disabled' : ''}${lk ? ` aria-label="Rebuild around ${E(V2.disp(lk.n))}"` : ''}><span>Rebuild${lk ? ` Around ${E(V2.disp(lk.n))}` : ''} ↻</span></button></div></div>
      <div class="bp-right"><p class="bp-k">Notes</p>${V2.bpNotes(M)}${t.proven && !t.proven.swapped && t.proven.wr >= .55 ? /* Q13d (Sim, Nov 18, B): today's proven-team note, same words and the same rule as today's My Team (08-render-all.js: this exact six, 55%+ wins at events); "these" are the gaps in the Notes above it */ '<p class="bd-catch bd-prov">This exact team has won at real events. Treat these as optional tweaks, not problems.</p>' : ''}</div></div></section>`; };
// the page: today's head (eyebrow, headline, intro and How It Works), the sheet, then Recent Winners and Cores as today (not redesigned yet)
// ---------- Blueprint lower half (designer's roughs, Nov 14): Recent Winners as "Reference sheets", Cores as "Parts list" ----------
// Same sections, hooks and actions as today (build.js buildWinners / buildCores); only the frame, the header and the winner's six change.
V2.bpCorners = () => ['tl', 'tr', 'bl', 'br'].map(k => `<i class="bp-x ${k}" aria-hidden="true"></i>`).join('');
V2.bpHead = (plate, h, src) => `<div class="bp-line"><span class="bp-plate u" aria-hidden="true">${plate}</span><h2 class="bp-h">${h}</h2><span class="bp-src">${V2.esc(src)}</span></div>`;
V2.bpWinSix = t => { const E = V2.esc, nm = d => /^Mega /.test(d) ? d.slice(5) : d, lg = t.mons.some(m => nm(V2.disp(m.n)).length > 9);
  return `<p class="bp-champ"><span>${E(teamWho(t))}'s six, full sets</span></p><ul class="bp-six bp-wsix${lg ? ' lg' : ''}">${t.mons.map((m, i) => { const p = byName.get(m.n), d = V2.disp(m.n), mega = /^Mega /.test(d);
    return `<li class="bp-fig bp-wfig"><span class="bp-no u" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="bp-art" aria-hidden="true"><i class="bp-ring"></i>${V2.mon(m.n, {bare: true})}</span><i class="bp-base" aria-hidden="true" style="--b1:var(--ty-${p ? p.t[0] : 'Normal'});--b2:var(--ty-${p ? p.t[1] || p.t[0] : 'Normal'})"></i>
      <span class="bp-mg u">${mega ? 'Mega' : '&nbsp;'}</span><b>${E(nm(d))}</b><small>${E(m.i || '')}</small><small class="r">${E(m.a || '')}${m.nt ? ' · ' + E(m.nt) : ''}</small><span class="bp-mvs">${(m.mv || []).map(x => `<small>${E(x)}</small>`).join('')}</span></li>`; }).join('')}</ul>`; };
V2.bpPage = M => { const win = V2.buildWinners(true), cor = V2.buildCores(true), tab = V2.bdTab(false, !!win);
  const head = V2.buildHead().split('<div class="bd-opts">')[0];
  return `<div class="bd2 bp2">${head}<div class="bd-result" aria-live="polite">${V2.buildSheet(M)}</div>${V2.buildJump(false, !!win, tab).replace('</nav>', M.n > 1 ? '<span class="bp-tnote">The other teams from this build are now the Revisions on the sheet above.</span></nav>' : '</nav>')}<div class="bd-lower bp-lower" data-bdtab="${tab}"><div class="bd-lcol">${win}</div>${cor}</div></div>`; };
/* Sim, Nov 15: while a new build runs the page kept switching to the older layout for a moment (no result yet), which was jarring.
   Now the last Blueprint stays, faded and inert, with "Building…" pinned over it; the new one replaces it in place. */
/* Q83 item 1 (Sim, Nov 20): before the first build the page is Sheet 0 of the same drawing world: six empty numbered rings, the Spec in the
   Spec place and Build Me a Team as the one main button. Pressing it fills this sheet in place (Sheet 1 of N). While the first build runs,
   Sheet 0 stays, faded, under "Building…"; a build with no team keeps Sheet 0, today's note above it. The picked "Build around" Pokémon already
   stands in ring 01. No .bd-ans / .bd-six / data-v2mon here: there is no team yet (the behaviour kit reads those as a built team). */
V2.bpSheet0 = () => { const E = V2.esc, busy = !!(ui.ab && ui.ab.busy), lk = ui.abLock && byName.get(ui.abLock), none = !busy && ui.ab ? V2.buildAnswer0() : '';
  const ring = i => `<span class="bp-fig bp-fig0${i === 0 && lk ? ' bp-ba' : ''}"><span class="bp-no u">${String(i + 1).padStart(2, '0')}</span>${i === 0 && lk ? '<span class="bp-batag">Built around</span>' : ''}<span class="bp-art"><i class="bp-ring"></i>${i === 0 && lk ? V2.mon(lk.n, {bare: true}) : '<b class="bp-q u">?</b>'}</span></span>`;
  return `${none}<section class="bp bp0"><i class="bp-x xtl" aria-hidden="true"></i><i class="bp-x xtr" aria-hidden="true"></i><i class="bp-x xbl" aria-hidden="true"></i><i class="bp-x xbr" aria-hidden="true"></i>
    <p class="bp-line"><span class="bp-plate u">Sheet 0</span><span class="bp-kind">Waiting for a plan</span><span class="bp-src">${E(regName())} doubles · drawn from real winning teams</span></p>
    <p class="bp-dim"><span>Team of six</span></p>
    <div class="bp-six bp-six0" role="img" aria-label="Six empty places${lk ? `, the first is ${E(V2.disp(lk.n))}` : ''}: Build Me a Team fills them">${[0, 1, 2, 3, 4, 5].map(ring).join('')}</div>
    <div class="bp-tb"><div class="bp-left"><p class="bp-k">Spec · set it, then build</p>${V2.bpSpec()}</div>
      <div class="bp-right bp-go0"><p class="bp-k">Build</p><div class="bd-opt bd-go"><button type="button" class="np-btn" data-bdgo${busy ? ' aria-busy="true" disabled' : ''}><span>${lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team'}</span></button></div><p class="bp-gonote">Fills this sheet with six from real winning teams.</p></div></div></section>`; };
V2.bpPage0 = () => { const win = V2.buildWinners(true), cor = V2.buildCores(true), tab = V2.bdTab(false, !!win), busy = !!(ui.ab && ui.ab.busy), head = V2.buildHead().split('<div class="bd-opts">')[0];
  return `<div class="bd2 bp2${busy ? ' bd-rebuild' : ''}">${head}<div class="bd-result" aria-live="polite"${busy ? ' aria-busy="true"' : ''}>${busy ? '<p class="bd-busy" role="status">Building from real winning teams…</p>' : ''}${V2.bpSheet0()}</div>${V2.buildJump(false, !!win, tab)}<div class="bd-lower bp-lower" data-bdtab="${tab}"><div class="bd-lcol">${win}</div>${cor}</div></div>`; };
(() => { V2.pages.build.draw = () => { const M = V2.bpModel(); if (M) { V2.bpLastM = M; return V2.bpPage(M); }
  if (ui.ab && ui.ab.busy && V2.bpLastM) { try { return V2.bpPage(V2.bpLastM).replace('<div class="bd2 bp2">', '<div class="bd2 bp2 bd-rebuild">').replace('<div class="bd-result" aria-live="polite">', '<div class="bd-result" aria-live="polite" aria-busy="true"><p class="bd-busy" role="status">Building from real winning teams…</p>'); } catch (e) {} }
  return V2.bpPage0(); }; })();

/* Q83 (behaviour X-07): on phones Sheet 0 puts Build around lower than the old form row did; focusing it lifts it into the upper screen
   so its list of names has room under it (the keyboard takes the lower half) */
document.addEventListener('focusin', e => { const i = e.target; if (!i.matches || !i.matches('[data-bdfind]') || innerWidth >= 700) return;
  const r = i.getBoundingClientRect(); if (r.top > innerHeight * .4) scrollTo({top: Math.max(0, scrollY + r.top - 96), behavior: 'auto'}); });
