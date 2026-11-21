// ---------- Build: The Plot (Sim locked the direction Nov 20, 7:51 PM; build before the switch, 7:52 PM) ----------
// Mock-ups and pictures: docs/rebuild/pics/nov20/Q93-Q98; spec: docs/rebuild/plot-spec.md; plan: docs/rebuild/plot-build-plan.md.
// Piece a (this file, first): the page before a build. The spec is one sentence you edit:
//   "My plot: build from [My Box] or [Whole Roster] with [0][1][2] Megas, around [Any Pokémon]. [Hatch it.]"
// The blue words are the same controls as before, so nothing else changes: the source and Megas plates are [data-v2slide] groups
// ('bdsrc', 'sgmega': shell.js V2.slidePick fires the same v2slide events build.js and sugs.js already listen to), the search is the same
// [data-bdfind] input with [data-bdhits] under it, a pick is [data-bdpick], its clear is [data-bdx], and Hatch it is [data-bdgo].
// A thin red "plot line" runs down the page with numbered steps; before a build, steps 2-4 wait, faint, and today's underdog keeps them
// company (V2.underdog, the empty-screen rule: never beside a team's data). After a build the Blueprint sheet still draws (pieces b-f next).
V2.plotPicks = () => { try { return ROSTER.filter(p => !p.m && !/-Mega/.test(p.n)).sort((a, b) => U(b) - U(a)).slice(0, 4).map(p => p.n); } catch (e) { return []; } };
V2.plotGrp = (key, items, on, label) => `<span class="pl-grp" role="group" aria-label="${V2.esc(label)}" data-v2slide="${V2.esc(key)}">${items.map(([v, t], k) =>
  (k && items.length === 2 ? '<span class="pl-or" aria-hidden="true">or</span>' : '') + `<button type="button" class="pl-pl" data-v="${V2.esc(v)}" aria-pressed="${v === on}"><span>${V2.esc(t)}</span></button>`).join('')}</span>`;
V2.plotSent = (row) => { const E = V2.esc, lk = ui.abLock && byName.get(ui.abLock), busy = !!(ui.ab && ui.ab.busy);
  const src = V2.plotGrp('bdsrc', [['box', 'My Box'], ['all', 'Whole Roster']], ui.abSrc === 'all' ? 'all' : 'box', 'Build from');
  const meg = V2.plotGrp('sgmega', [['0', '0'], ['1', '1'], ['2', '2']], String(megaGoal()), 'Megas on team');
  const around = lk ? `<span class="pl-pl pl-pick" aria-pressed="true">${SPRITE_ID[lk.n] ? `<img src="${V2.art(SPRITE_ID[lk.n])}" alt="">` : ''}<span>${E(V2.disp(lk.n))}</span><button type="button" class="pl-x" data-bdx aria-label="Stop building around ${E(V2.disp(lk.n))}"><span aria-hidden="true">×</span></button></span>`
    : `<label class="pl-pl pl-find">${V2.ICON.search}<input type="search" data-bdfind value="${E(V2.bdUi.find || '')}" placeholder="Any Pokémon" aria-label="Build around a Pokémon (optional): type its name" autocomplete="off"></label>`;
  return `<div class="pl-sw"><div class="pl-sent u${row ? ' pl-row' : ''}" role="group" aria-label="Your plot"><span class="pl-ln"><span class="pl-w">My plot: build from</span></span> <span class="pl-ln">${src}</span> <span class="pl-ln"><span class="pl-w">with</span> ${meg} <span class="pl-w">Megas.</span></span> <span class="pl-ln"><span class="pl-w pl-opt">Optional: build around</span> <span class="pl-ar">${around}</span></span> <span class="pl-ln"><button type="button" class="pl-go" data-bdgo${busy ? ' aria-busy="true" disabled' : ''}><span>${row ? 'Hatch another' : 'Hatch it.'}</span><span class="vh"> ${row ? (lk ? `Rebuild Around ${E(V2.disp(lk.n))}` : 'Rebuild') : lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team'}</span></button></span></div><div class="bd-hits pl-hits" data-bdhits>${V2.bdUi.find && !lk ? V2.buildHits(V2.bdUi.find) : ''}</div></div>`; };
V2.plotHelp = () => { const E = V2.esc, lk = ui.abLock && byName.get(ui.abLock), picks = V2.plotPicks().filter(n => byName.get(n));
  let tip = ''; try { const M = V2.bpMegaShare(); tip = M && M.wins != null ? `${Math.round(M.wins)}% of event winners carry 2 Mega options. ` : ''; } catch (e) {}
  const chip = n => `<button type="button" class="pl-chip" data-bdpick="${E(n)}"${lk && lk.n === n ? ' aria-pressed="true"' : ''}>${SPRITE_ID[n] ? `<img src="${V2.art(SPRITE_ID[n])}" alt="" loading="lazy" decoding="async">` : ''}<span>${E(V2.disp(n))}</span></button>`;
  return `<div class="pl-help"><div class="pl-hc pl-hb"><b>Build from</b><p>My Box: only the Pokémon you own. Whole Roster: any Pokémon.</p></div>
    <div class="pl-hc pl-hb"><b>Megas on team</b><p>${E(tip)}Only one can Mega Evolve per battle.</p></div>
    <div class="pl-hc pl-hb"><b>Build around a Pokémon <span>· optional</span></b><p class="pl-ht2">${lk ? `${E(V2.disp(lk.n))} will be on the team. Tap × to clear it.` : 'Type a name, or tap one:'}</p>${picks.length ? `<div class="pl-chips">${picks.map(chip).join('')}</div>` : ''}</div>
    <div class="pl-hc pl-hr"><b>${lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team'}</b><p><span class="pl-ht">Six from real winning teams, in an instant. </span><button type="button" class="np-link" data-bdhow>How It Works ›</button></p></div></div>`; };
V2.plotWait = () => { const n = V2.underdog ? V2.underdog() : 'Flapple', d = V2.esc(V2.disp(n));
  const st = (k, h) => `<div class="pl-step pl-wait"><span class="pl-node" aria-hidden="true">${k}</span><h2 class="u pl-h">${h}</h2><span class="pl-w8">waiting for your plot</span></div>`;
  return `<div class="pl-waits"><div class="pl-wl">${st(2, 'The accomplices')}<div class="pl-places" aria-hidden="true"><i></i><i></i><i></i></div>${st(3, 'Why it works')}${st(4, 'Got a Plan B?')}</div>
    <aside class="pl-dog" aria-label="Today's underdog"><p><b>${d} is waiting to see what you hatch.</b> Today's underdog. Somebody's favourite.</p><button type="button" class="pl-dogst" data-v2mon="${V2.esc(n)}" aria-label="${d}: open its info">${V2.mon(n, {bare: true})}</button></aside></div>`; };
V2.plotPage0 = () => { V2.bdSrcDefault(); /* a new visitor's untouched sample box starts on Whole Roster (S17), as buildHead did */ const win = V2.buildWinners(true), cor = V2.buildCores(true), tab = V2.bdTab(false, !!win), busy = !!(ui.ab && ui.ab.busy), none = !busy && ui.ab ? V2.buildAnswer0() : '';
  return `<div class="bd2 pl2${busy ? ' bd-rebuild' : ''}"><h1 class="vh">Build</h1><div class="bd-result" aria-live="polite"${busy ? ' aria-busy="true"' : ''}>${busy ? '<p class="bd-busy" role="status">Building from real winning teams…</p>' : ''}${none}
    <section class="pl pl0"><div class="pl-step pl-s1"><span class="pl-node" aria-hidden="true">1</span><div class="pl-top"><div><p class="np-eyebrow"><span>Build ·<span class="bd-rw"> real winning teams ·</span> ${V2.esc(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C')} doubles</span></p><p class="pl-intro">Winning tournament teams you can field from your box or the whole roster.</p></div><p class="pl-hint">Blue words are buttons. Tap one to change your plot.</p></div>${V2.plotSent()}${V2.plotHelp()}</div>${V2.plotWait()}</section></div>
    ${V2.buildJump(false, !!win, tab)}<div class="bd-lower bp-lower" data-bdtab="${tab}"><div class="bd-lcol">${win}</div>${cor}</div></div>`; };
(() => { const draw = V2.pages.build.draw; V2.pages.build.draw = () => { const M = V2.bpModel(); if (M || (ui.ab && ui.ab.busy && V2.bpLastM)) return draw(); return V2.plotPage0(); }; })();
/* The sentence fills the page width (Q95 fit rule): each line is laid out on one row at the base size; if the widest is wider than the
   page, the size steps down so it fits (never below 20 px); only then may a line wrap (very narrow phones). Runs after each draw, on
   resize and once the logo font has loaded (the width depends on it). */
V2.plotInput = s => { const i = s.querySelector('[data-bdfind]'); if (!i) return; const cs = getComputedStyle(i), c = V2.plotInput.c || (V2.plotInput.c = document.createElement('canvas').getContext('2d'));
  c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const t = String(i.value || i.placeholder || '').toUpperCase();
  i.style.width = Math.ceil(c.measureText(t).width + parseFloat(cs.fontSize) * 0.9) + 'px'; };
V2.plotFit = () => document.querySelectorAll('.pl-sent:not(.pl-row)').forEach(s => { s.style.removeProperty('--d-plot'); s.classList.remove('pl-wrap'); V2.plotInput(s);
  const W = s.clientWidth; if (W < 2) return; const fs = parseFloat(getComputedStyle(s).fontSize) || 24;
  const wide = Math.max(...[...s.querySelectorAll('.pl-ln')].map(l => l.scrollWidth)); if (wide <= W + 1) return;
  const px = Math.floor(fs * W / wide * 0.99); if (px >= 20) s.style.setProperty('--d-plot', px + 'px'); else { s.style.setProperty('--d-plot', '20px'); s.classList.add('pl-wrap'); } V2.plotInput(s); });
(() => { const after = V2.pages.build.after; V2.pages.build.after = () => { try { if (after) after(); } finally { V2.plotFit(); V2.plotRowFit(); } }; })();
V2.plotRowFit = () => document.querySelectorAll('.pl-row').forEach(s => { if (innerWidth < 700) { const i = s.querySelector('[data-bdfind]'); if (i) i.style.width = ''; } else V2.plotInput(s); });
addEventListener('resize', () => requestAnimationFrame(() => { if (document.querySelector('.pl-sent')) { V2.plotFit(); V2.plotRowFit(); } }));
try { document.fonts.ready.then(() => { V2.plotFit(); V2.plotRowFit(); }); document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(() => { V2.plotFit(); V2.plotRowFit(); })); } catch (e) {}
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('.pl-sent [data-bdfind]'); if (i) V2.plotInput(i.closest('.pl-sent')); });

// ---------- Piece 2 (Q97 A / Q98, Sim locked 8:17 PM): after a build ----------
// Step 1 becomes the plot as a control row (the same sentence and controls, small; HATCH ANOTHER = data-bdgo), and the answer is the
// title + the six standing on the red plot line + the score seal. The Blueprint's Spec and Rebuild leave the sheet (they are the control
// row now); its six figures, actions, Revisions and Notes stay until pieces 3-4. Hooks kept for the tests: .bd-ans.bp, .bd-lock with the
// hidden "Option k of n · kind" eyebrow, .bd-score (b = number, .w span = band word, small = "Strength Score · rank"), data-v2mon.
V2.plotTitleK = s => { const n = String(s || '').length; return n <= 18 ? 's' : 'm'; };
V2.plotAnswer = M => { const E = V2.esc, t = M.t, chips = t.gp || [], rk = M.G && CH.rkOf(M.G) != null ? CH.pctTxt(M.G) : '';
  const ey = `${M.n > 1 ? `Option ${M.k + 1} of ${M.n} · ` : ''}${M.kind}${t.megas > 1 ? ` · ${t.megas} Mega options` : ''}`;
  const six = V2.bpOrder(t.mons).map(m => { const d = V2.disp(m.n); return `<button type="button" class="pl-mon${m.box ? '' : ' pl-catch'}" data-v2mon="${E(m.n)}" aria-label="${E(d)}${m.box ? '' : ', to catch'}: open its info">${SPRITE_ID[m.n] ? `<img src="${V2.art(SPRITE_ID[m.n])}" alt="" decoding="async">` : `<b>${E(d)}</b>`}</button>`; }).join('');
  const tags = [M.n > 1 ? `Plan ${'ABCDEFGH'[M.k]} of ${M.n}` : '', M.kind, t.megas ? `${t.megas} Mega${t.megas === 1 ? '' : 's'}` : ''].filter(Boolean).map(x => `<span class="pl-tag">${E(x)}</span>`).join('')
    + (M.nCatch ? `<span class="pl-tag pl-tagr">${M.nCatch === 6 ? 'All six to catch' : `${M.nCatch} to catch`}</span>` : '') + chips.map(c => `<span class="pl-tag">${E(c)}</span>`).join('');
  const lockup = t.mons.filter(m => !m.box).map(m => V2.disp(m.n));
  return `<div class="bd-lock pl-ans"><p class="np-eyebrow vh">${E(ey)}</p><p class="pl-eb u">The plot:</p>
    <div class="pl-arow"><div class="pl-tl"><h2 class="u pl-title pl-t${V2.plotTitleK(t.label)}">${E(t.label).replace(/ · /g, ' · ')}</h2><div class="pl-six" role="group" aria-label="The six">${six}</div></div>
      <div class="pl-seal np-score bd-score" role="img" aria-label="Strength Score ${E(String(M.s))}, ${E(M.word)}"><small>Strength Score${rk ? `<span class="vh"> · ${E(rk)}</span>` : ''}</small><b class="u">${M.s}</b><div class="w"><span class="u">${E(M.word)}</span></div></div></div>
    <div class="pl-meta"><div class="pl-tags">${tags}</div>${lockup.length && lockup.length < 6 ? `<p class="pl-cline">${lockup.length > 1 ? `${['', 'One', 'Two', 'Three', 'Four', 'Five'][lockup.length]} accomplices` : 'One accomplice'} still at large: ${E(lockup.length > 1 ? lockup.slice(0, -1).join(', ') + ' and ' + lockup[lockup.length - 1] : lockup[0])} ${lockup.length > 1 ? 'are' : 'is'} not in your box yet.</p>` : ''}</div>
    ${t.fresh ? '<p class="bd-fresh pl-fresh">A fresh take: built on raw power and fit instead of popularity, with at most 2 meta staples. Fewer people will have prepared for it.</p>' : ''}<div class="pl-meta2">${rk ? `<b>${E(rk)}</b>` : ''}${M.G ? V2.buildBrk(M.G) : ''}</div></div>`; };
(() => { const sheet = V2.buildSheet; V2.buildSheet = M => { let h = sheet(M); const a = h.indexOf('<p class="bp-line">'), b = h.indexOf('<div class="bd-six bp-six');
  if (a > 0 && b > a) h = h.slice(0, a) + V2.plotAnswer(M) + h.slice(b);
  /* the Spec and Rebuild are the control row now */
  return h.replace(/<p class="bp-k">Spec · tap a field to change it<\/p>[\s\S]*?(?=<p class="bp-k">Revisions|<div class="bd-opt bd-go">)/, '').replace(/<div class="bd-opt bd-go"><button type="button" class="bp-rebuild[\s\S]*?<\/button><\/div>/, ''); }; })();
V2.bpPage = M => { const win = V2.buildWinners(true), cor = V2.buildCores(true), tab = V2.bdTab(false, !!win);
  return `<div class="bd2 bp2 pl2"><h1 class="vh">Build</h1><section class="pl pl1"><div class="pl-step pl-s1"><span class="pl-node" aria-hidden="true">1</span>${V2.plotSent(true)}</div></section><div class="bd-result" aria-live="polite">${V2.buildSheet(M)}</div>${V2.buildJump(false, !!win, tab)}<div class="bd-lower bp-lower" data-bdtab="${tab}"><div class="bd-lcol">${win}</div>${cor}</div></div>`; };

// ---------- Piece 3 (spec section 8): the six on type-coloured plates ----------
// Each plate shows exactly what Copy for Showdown exports (slotsPaste, the same call as data-bdcopy), so the page and the copy never
// disagree: item, Ability and the four moves. A Mega shows its Mega form's Ability (the export names the base form's, which changes in
// battle). Tier as "S tier 92", "Not in your box yet · to catch" for a Pokémon to catch, "Built around" for the pick; data-v2mon opens info.
V2.plotSets = t => { const key = t.mons.map(m => m.n + '@' + (m.it || '')).join('|'); if (V2.plotSets.k === key) return V2.plotSets.v;
  let txt = ''; try { txt = slotsPaste(t.mons.map(m => ({n: m.n, a: null, lock: false}))); } catch (e) {}
  const blocks = txt.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean), v = {};
  t.mons.forEach((m, i) => { const b = blocks[i] || '', it = (b.match(/@\s*(.+)$/m) || [])[1], ab = (b.match(/^Ability:\s*(.+)$/m) || [])[1], mv = [...b.matchAll(/^-\s*(.+)$/gm)].map(x => x[1].trim());
    const p = byName.get(m.n); v[m.n] = {it: (it || m.it || '').trim(), ab: p && p.m && p.a && p.a[0] ? p.a[0] : (ab || '').trim(), mv: mv.slice(0, 4)}; });
  V2.plotSets.k = key; V2.plotSets.v = v; return v; };
V2.plotPlate = (m, set) => { const E = V2.esc, p = byName.get(m.n), R = monRating(p), d = V2.disp(m.n), mega = /^Mega /.test(d), ba = !!ui.abLock && m.n === ui.abLock, ty = p && p.t ? p.t[0] : 'Normal';
  return `<button type="button" class="pl-plate${ba ? ' pl-ba' : ''}" style="--pt:var(--pt-${E(ty)})" data-v2mon="${E(m.n)}" aria-label="${E(d)}${ba ? ', built around' : ''}${set.it ? ', ' + E(set.it) : ''}${R ? `, ${E(R.tier)} tier ${R.n}` : ''}${m.box ? '' : ', to catch'}: open its info">
    <span class="pl-art" aria-hidden="true">${SPRITE_ID[m.n] ? `<img src="${V2.art(SPRITE_ID[m.n])}" alt="" decoding="async">` : ''}</span>
    ${R ? `<span class="pl-tier u">${E(R.tier)}<span class="vh"> tier</span> ${R.n}</span>` : ''}${ba ? '<span class="pl-batag">Built around</span>' : ''}
    <span class="pl-mg u">${mega ? 'Mega' : '&nbsp;'}</span><b class="pl-nm u">${E(mega ? d.slice(5) : d)}</b>
    <span class="pl-fact${m.box ? '' : ' pl-out'}">${m.box ? 'In your box' : '<span class="pl-olong">Not in your box yet<span class="vh"> · to catch</span></span><span class="pl-oshort" aria-hidden="true">To catch</span>'}</span>
    ${set.it ? `<span class="pl-pc pl-it"><i>Item</i><span class="pl-t">${E(set.it)}</span></span>` : ''}${set.ab ? `<span class="pl-pc pl-ab"><i>Ability</i><span class="pl-t">${E(set.ab)}</span></span>` : ''}
    <span class="pl-mvs">${set.mv.map(x => `<span class="pl-pc pl-mv"><span class="pl-t">${E(x)}</span></span>`).join('')}</span></button>`; };
(() => { const sheet = V2.buildSheet; V2.buildSheet = M => { const h = sheet(M), a = h.indexOf('<div class="bd-six bp-six'), b = h.indexOf('<div class="bp-near">');
  if (a < 0 || b < a) return h; const sets = V2.plotSets(M.t);
  return h.slice(0, a) + `<div class="pl-step pl-s2"><span class="pl-node" aria-hidden="true">2</span><h2 class="u pl-h2">The accomplices</h2><p class="pl-sub">Each with the set most players run. Tap one for its full info.</p><div class="bd-six pl-plates">${V2.bpOrder(M.t.mons).map(m => V2.plotPlate(m, sets[m.n] || {it: m.it || '', ab: '', mv: []})).join('')}</div></div>` + h.slice(b); }; })();
/* a move, item or Ability too long for a narrow plate (phones: "Stomping Tantrum" in a 96 px plate) is drawn narrower (scaleX, down to
   .72), never cut and never broken mid-word; runs after each draw, on resize and when the fonts load (as V2.fitWords does for names) */
V2.plotChipFit = () => document.querySelectorAll('.pl-plate .pl-t').forEach(t => { t.style.transform = ''; t.style.display = 'inline-block';
  const w = t.parentElement.clientWidth - (t.previousElementSibling && getComputedStyle(t.previousElementSibling).display !== 'none' ? t.previousElementSibling.offsetWidth + 8 : 0) - 8, n = t.scrollWidth;
  if (w > 0 && n > w) t.style.transform = `scaleX(${Math.max(.72, w / n).toFixed(3)})`; });
(() => { const after = V2.pages.build.after; V2.pages.build.after = () => { try { if (after) after(); } finally { V2.plotChipFit(); } }; })();
addEventListener('resize', () => requestAnimationFrame(() => { if (document.querySelector('.pl-plate')) V2.plotChipFit(); }));
try { document.fonts.ready.then(() => V2.plotChipFit()); } catch (e) {}

// ---------- Piece 4 (spec section 9): 3 Why it works, 4 Got a Plan B? ----------
// The Blueprint's title block (Spec, Revisions, Rebuild | Notes) gives way to two steps on the plot line. Same numbers and words as the
// Notes (V2.bpNotes) and the same options and hook as the Revisions (data-bdshow, .bd-others for the kit), in sentences with white plates.
V2.plotWhy = M => { const E = V2.esc, pv = M.t.proven, nb = M.basics.filter(x => x.ok).length;
  const line = (lead, plate, tail, small, extra = '') => `<li class="pl-wl"><p class="u pl-ws">${lead} <span class="pl-wp">${plate}</span> ${tail}${extra}</p><small>${small}</small></li>`;
  const trio = M.core ? M.core[1].split(' + ').map(s => s.trim()) : [];
  const trioArt = trio.map(d => { const p = ROSTER.find(x => V2.disp(x.n) === d || x.d === d); return p && SPRITE_ID[p.n] ? `<img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy" decoding="async">` : ''; }).join('');
  return `<div class="pl-step pl-s3"><span class="pl-node" aria-hidden="true">3</span><h2 class="u pl-h2">Why it works</h2><p class="pl-sub">The evidence, for the record.</p>
    <ul class="pl-why">${line('It answers', `${M.ans} of ${M.rows.length}`, 'top threats.', `Matchups with an answer. Top ${M.rows.length} threats: ${M.sh} Shaky, ${M.no} No answer.`)}
    ${line('It passes', `${nb} of ${M.basics.length}`, 'team checks.', `Team checks: the ${M.basics.length} basics. ${M.notes.length ? 'Notes met: ' + M.notes.map(E).join(', ') + '.' : 'No notes met.'}`)}
    ${pv ? line(pv.swapped ? 'Its six (1 swap) wins' : 'This exact six wins', `${(pv.wr * 100).toFixed(1)}%`, 'at events.', `${homeNum(pv.n)} players${pv.g ? `, ${homeNum(pv.g)} games at events` : ''}${pv.swapped && pv.ours && pv.theirs ? `, with ${E(V2.disp(pv.ours))} in place of ${E(V2.disp(pv.theirs))}` : ''}.`)
      : line('This exact six is', 'New', 'at events.', 'Built from cores that win; no player has run this exact six yet.')}
    ${M.core ? line('Its best trio wins', `${E(M.core[3])}%`, '', `${E(M.core[1])}, ${E(M.core[2])} teams.`, trioArt ? ` <span class="pl-trio" aria-hidden="true">${trioArt}</span>` : '') : ''}</ul>
    ${pv && !pv.swapped && pv.wr >= .55 ? '<p class="bd-catch bd-prov pl-prov">This exact team has won at real events. Treat these as optional tweaks, not problems.</p>' : ''}</div>`; };
V2.plotPlans = M => { const E = V2.esc, L = 'ABCDEFGH'; if (M.n < 2 && !M.res.freshPending) return '';
  const col = (t, i) => { let G = null, CK = null; try { CK = proChecks(t._ms, true); G = CH.gradeOf(t._rd, CK, t._ms); } catch (e) {}
    const rows = t._rd && t._rd.rows || [], ans = rows.filter(x => x.level >= 2).length, bas = CK ? CK.items.filter(x => !x.skip && !x.note) : [], on = i === M.k, s = G ? Math.round(G.s) : '–';
    const kind = t.proven ? (t.proven.swapped ? 'Proven team, 1 swap' : 'Proven team') : t.fresh ? 'Fresh take' : 'Built team';
    return `<div class="pl-plan${on ? ' on' : ''}" role="listitem"><p class="pl-pk">Plan ${L[i] || i + 1} · ${E(kind)}${on ? ' · shown above' : ''}</p><p class="pl-ps"><b class="u">${s}</b> <span class="u">${G ? E(CH.wordOf(G.s)) : ''}</span></p>
      <p class="pl-pn u">${V2.dotWrap(E(t.label))}</p><p class="pl-pm">${ans}/${rows.length} matchups · ${bas.filter(x => x.ok).length}/${bas.length} team checks</p>
      <div class="pl-psix" aria-hidden="true">${V2.bpOrder(t.mons).map(m => `<span class="${m.box ? '' : 'pl-catch'}">${SPRITE_ID[m.n] ? `<img src="${V2.art(SPRITE_ID[m.n])}" alt="" loading="lazy" decoding="async">` : ''}</span>`).join('')}</div>
      ${on ? '<p class="pl-pon">Shown above</p>' : `<button type="button" class="pl-sw2 u" data-bdshow="${i}" aria-label="Option ${i + 1}, ${E(t.label)}, Strength Score ${s}: show this one">Switch to Plan ${L[i] || i + 1}</button>`}</div>`; };
  return `<div class="pl-step pl-s4"><span class="pl-node" aria-hidden="true">4</span><h2 class="u pl-h2">Got a Plan B?</h2><p class="pl-sub">${M.n - 1} more from this build. One tap to switch.</p>
    <div class="bd-others pl-plans" role="list">${M.res.teams.map(col).filter((x, i) => i !== M.k).join('')}${M.res.freshPending ? '<div class="pl-plan pl-pwait" role="listitem"><p class="pl-pk">Finding a fresh take…</p><p class="pl-pm">A different six, worked out next</p></div>' : ''}</div></div>`; };
(() => { const sheet = V2.buildSheet; V2.buildSheet = M => { const h = sheet(M), a = h.indexOf('<div class="bp-tb">'), b = h.lastIndexOf('</section>');
  if (a < 0 || b < a) return h; return h.slice(0, a) + V2.plotWhy(M) + V2.plotPlans(M) + h.slice(b); }; })();
