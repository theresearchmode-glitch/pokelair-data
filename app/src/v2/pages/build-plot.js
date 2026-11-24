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
    : `<label class="pl-pl pl-find">${V2.ICON.search}<input type="search" data-bdfind value="${E(V2.bdUi.find || '')}" placeholder="Any Pokémon" aria-label="Build around a Pokémon (optional): type its name" autocomplete="off">${V2.CLR}</label>`;
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
  return `<div class="pl-waits"><div class="pl-wl">${st(2, 'The accomplices')}<div class="pl-places" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>${st(3, 'Why it works')}${st(4, 'Got a Plan B?')}</div>
    <aside class="pl-dog" aria-label="Today's underdog"><p><b>${d} is waiting to see what you hatch.</b> Today's underdog. Somebody's favourite.</p><button type="button" class="pl-dogst" data-v2mon="${V2.esc(n)}" aria-label="${d}: open its info">${V2.mon(n, {bare: true})}</button></aside></div>`; };
/* Nov 20, piece 5: the lower half is V2.plotLower (Plots that worked + Partners in crime, no V2.buildJump tabs); before a build its line is dashed and there is no end */
V2.plotPage0 = () => { V2.bdSrcDefault(); /* a new visitor's untouched sample box starts on Whole Roster (S17), as buildHead did */ const busy = !!(ui.ab && ui.ab.busy), none = !busy && ui.ab ? V2.buildAnswer0() : '';
  return `<div class="bd2 pl2${busy ? ' bd-rebuild' : ''}"><h1 class="vh">Build</h1><div class="bd-result" aria-live="polite"${busy ? ' aria-busy="true"' : ''}>${busy ? '<p class="bd-busy" role="status">Building from real winning teams…</p>' : ''}${none}
    <section class="pl pl0"><!-- Nov 22 (Sim chose A, 6:58 AM): the top is one short label, then the sentence; the old intro line and the long hint were cut, the hint now sits under the sentence --><div class="pl-step pl-s1"><span class="pl-node" aria-hidden="true">1</span><div class="pl-top"><p class="np-eyebrow"><span>Build · ${V2.esc(REG_PROFILE.name)} doubles</span></p></div>${V2.plotSent()}<p class="pl-hint pl-hint2">Blue words are buttons.</p>${V2.plotHelp()}</div>${V2.plotWait()}</section></div>
    ${V2.plotLower(false)}</div>`; };
(() => { const draw = V2.pages.build.draw; V2.pages.build.draw = () => { const M = V2.bpModel(); if (M || (ui.ab && ui.ab.busy && V2.bpLastM)) return draw(); return V2.plotPage0(); }; })();
/* The sentence fills the page width (Q95 fit rule): each line is laid out on one row at the base size; if the widest is wider than the
   page, the size steps down so it fits (never below 20 px); only then may a line wrap (very narrow phones). Runs after each draw, on
   resize and once the logo font has loaded (the width depends on it). */
V2.plotInput = s => { const i = s.querySelector('[data-bdfind]'); if (!i) return; const cs = getComputedStyle(i), c = V2.plotInput.c || (V2.plotInput.c = document.createElement('canvas').getContext('2d'));
  c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const t = String(i.value || i.placeholder || '').toUpperCase();
  i.style.width = Math.ceil(c.measureText(t).width + parseFloat(cs.fontSize) * 0.9) + 'px'; };
V2.plotFit = () => document.querySelectorAll('.pl-sent:not(.pl-row)').forEach(s => { s.style.removeProperty('--d-plot'); s.classList.remove('pl-wrap'); V2.plotInput(s);
  const W = s.clientWidth; if (W < 2) return; const fs = parseFloat(getComputedStyle(s).fontSize) || 24;
  /* (piece 6) measured with the search plate at its full width: it may shrink (max-width 100%), so its line never reported the overflow and
     at 480 "ANY POKÉMON" was cut to "ANY POKÉMO" instead of the sentence stepping down */
  s.classList.add('pl-meas'); const wide = Math.max(...[...s.querySelectorAll('.pl-ln')].map(l => l.scrollWidth)); s.classList.remove('pl-meas'); if (wide <= W + 1) return;
  const px = Math.floor(fs * W / wide * 0.99); if (px >= 20) s.style.setProperty('--d-plot', px + 'px'); else { s.style.setProperty('--d-plot', '20px'); s.classList.add('pl-wrap'); } V2.plotInput(s); });
(() => { const after = V2.pages.build.after; V2.pages.build.after = () => { try { if (after) after(); } finally { V2.plotFit(); V2.plotRowFit(); } }; })();
V2.plotRowFit = () => document.querySelectorAll('.pl-row').forEach(s => { if (innerWidth < 700) { const i = s.querySelector('[data-bdfind]'); if (i) i.style.width = ''; } else V2.plotInput(s); });
addEventListener('resize', () => requestAnimationFrame(() => { if (document.querySelector('.pl-sent')) { V2.plotFit(); V2.plotRowFit(); } }));
try { document.fonts.ready.then(() => { V2.plotFit(); V2.plotRowFit(); }); document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(() => { V2.plotFit(); V2.plotRowFit(); })); } catch (e) {}
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('.pl-sent [data-bdfind]'); if (i) V2.plotInput(i.closest('.pl-sent')); });
/* the site's own × in the plot's search plate (X-05, as every search box has: V2.CLR, shown only while the box has text, the browser's own
   hidden in plot.css). shell.js clears boxes inside an .np-field; the plate is a .pl-find, so it is cleared here the same way: focus kept
   (pointerdown never takes it, shell.js), the box emptied, its 'input' fired so the name list goes back */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.pl-find [data-v2clr]'); if (!b) return; e.preventDefault();
  const i = b.closest('.pl-find').querySelector('input'); if (!i) return; try { i.focus({preventScroll: true}); } catch (x) { i.focus(); } i.value = ''; i.dispatchEvent(new Event('input', {bubbles: true})); });

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
    + (M.nCatch ? `<span class="pl-tag pl-tagr">${M.nCatch === 6 ? 'All six to catch' : `${M.nCatch} to catch`}</span>` : '') + chips.map(c => `<span class="pl-tag pl-gp">${E(c)}</span>`).join('');
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
V2.bpPage = M => `<div class="bd2 bp2 pl2"><h1 class="vh">Build</h1><section class="pl pl1"><div class="pl-step pl-s1"><span class="pl-node" aria-hidden="true">1</span>${V2.plotSent(true)}</div></section><div class="bd-result" aria-live="polite">${V2.buildSheet(M)}</div>${V2.plotLower(true)}</div>`;

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
  /* Nov 22 (HH, design authority to 9 AM Mon; info words, Sim approved): the plate is no longer one big button, so its item, Ability and moves can
     be words that open their info sheets (a button can't hold buttons). The name is the plate's button and still covers the whole plate
     (.pl-nmb::after), so a tap anywhere else on it opens the Pokémon as before */
  const lab = `${E(d)}${ba ? ', built around' : ''}${set.it ? ', ' + E(set.it) : ''}${R ? `, ${E(R.tier)} tier ${R.n}` : ''}${m.box ? '' : ', to catch'}: open its info`;
  const w = (k, n) => k === 'it' ? V2.kItem(n) : V2.kAbil(n);
  return `<div class="pl-plate${ba ? ' pl-ba' : ''}" style="--pt:var(--pt-${E(ty)})" data-v2mon="${E(m.n)}">
    <span class="pl-art" aria-hidden="true">${SPRITE_ID[m.n] ? `<img src="${V2.art(SPRITE_ID[m.n])}" alt="" decoding="async">` : ''}</span>
    ${R ? `<span class="pl-tier u">${E(R.tier)}<span class="vh"> tier</span> ${R.n}</span>` : ''}${ba ? '<span class="pl-batag">Built around</span>' : ''}
    <span class="pl-mg u">${mega ? 'Mega' : '&nbsp;'}</span><b class="pl-nm u"><button type="button" class="pl-nmb" aria-label="${lab}">${E(mega ? d.slice(5) : d)}</button></b>
    <span class="pl-fact${m.box ? '' : ' pl-out'}">${m.box ? 'In your box' : '<span class="pl-olong">Not in your box yet<span class="vh"> · to catch</span></span><span class="pl-oshort" aria-hidden="true">To catch</span>'}</span>
    ${set.it ? `<span class="pl-pc pl-it"><i>Item</i><span class="pl-t">${w('it', set.it)}</span></span>` : ''}${set.ab ? `<span class="pl-pc pl-ab"><i>Ability</i><span class="pl-t">${w('ab', set.ab)}</span></span>` : ''}
    <span class="pl-mvs">${set.mv.map(x => `<button type="button" class="pl-pc pl-mv" data-v2info="mv" data-v2infon="${E(x)}" aria-haspopup="dialog"><span class="pl-t">${E(x)}</span></button>`).join('')}</span></div>`; };
(() => { const sheet = V2.buildSheet; V2.buildSheet = M => { const h = sheet(M), a = h.indexOf('<div class="bd-six bp-six'), b = h.indexOf('<div class="bp-near">');
  if (a < 0 || b < a) return h; const sets = V2.plotSets(M.t);
  return h.slice(0, a) + `<div class="pl-step pl-s2"><span class="pl-node" aria-hidden="true">2</span><div class="pl-hd"><h2 class="u pl-h2">The accomplices</h2><p class="pl-sub">Each with the set most players run. Tap one for its full info.</p></div><div class="bd-six pl-plates">${V2.bpOrder(M.t.mons).map(m => V2.plotPlate(m, sets[m.n] || {it: m.it || '', ab: '', mv: []})).join('')}</div></div>` + h.slice(b); }; })();
/* a move, item or Ability too long for a narrow plate (phones: "Stomping Tantrum" in a 96 px plate) is drawn narrower (scaleX, down to
   .72), never cut and never broken mid-word; runs after each draw, on resize and when the fonts load (as V2.fitWords does for names) */
/* (piece 6) the room is the chip less BOTH its side paddings and, with its label showing, the label and the gap (it took one 8 px for
   both: at 1200 "Adaptability" was cut 8 px short) */
V2.plotChipFit = () => document.querySelectorAll('.pl-plate .pl-t').forEach(t => { t.style.transform = ''; t.style.display = 'inline-block';
  const c = t.parentElement, cs = getComputedStyle(c), lb = t.previousElementSibling, lw = lb && getComputedStyle(lb).display !== 'none' ? lb.offsetWidth + (parseFloat(cs.columnGap) || 0) : 0;
  const w = c.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0) - lw, n = t.scrollWidth;
  /* squeezed from where its words start: after the label (the chip's room ends at its right edge), or from the middle when centred */
  if (w > 0 && n > w) { t.style.transform = `scaleX(${Math.max(.72, w / n).toFixed(3)})`; t.style.transformOrigin = cs.justifyContent === 'center' ? 'center' : 'left'; } else t.style.transformOrigin = ''; });
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
  return `<div class="pl-step pl-s3"><span class="pl-node" aria-hidden="true">3</span><div class="pl-hd"><h2 class="u pl-h2">Why it works</h2><p class="pl-sub">The evidence, for the record.</p></div>
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
  return `<div class="pl-step pl-s4"><span class="pl-node" aria-hidden="true">4</span><div class="pl-hd"><h2 class="u pl-h2">Got a Plan B?</h2><p class="pl-sub">${M.n - 1} more from this build. One tap to switch.</p></div>
    <div class="bd-others pl-plans" role="list">${M.res.teams.map(col).filter((x, i) => i !== M.k).join('')}${M.res.freshPending ? '<div class="pl-plan pl-pwait" role="listitem"><p class="pl-pk">Finding a fresh take…</p><p class="pl-pm">A different six, worked out next</p></div>' : ''}</div></div>`; };
(() => { const sheet = V2.buildSheet; V2.buildSheet = M => { const h = sheet(M), a = h.indexOf('<div class="bp-tb">'), b = h.lastIndexOf('</section>');
  if (a < 0 || b < a) return h; return h.slice(0, a) + V2.plotWhy(M) + V2.plotPlans(M) + h.slice(b); }; })();

// ---------- Piece 5 (spec section 9, Q98): 5 Plots that worked, 6 Partners in crime, then the end, on an ink band ----------
// The same three winners and the same cores as V2.buildWinners / V2.buildCores (build.js), drawn as the approved picture
// (docs/rebuild/pics/nov20/Q98/Q98-4b-1440-after.png). No phone tabs (Sim, Nov 20: no buried folds or tabs): both sections show and the
// page scrolls. Hooks kept: one element per winner carries data-bdwin (its key, for evTeam); data-hmload (with V2.hmSure's Replace / Cancel),
// data-hmcopy, data-hmprep, data-bdcx; the cores' data-bdcore, data-bdcteams, data-bdcprep, data-bdccopy, data-bdcmore, data-bdcwhy, the
// "With a Pokémon…" box (V2.buildCoreFind: data-bdcfind / data-bdcpick / data-bdcmx) and the v2slide keys bdckind / bdcsort; the classes
// .bd-lower, .bd-wins, .bd-cores. A winner's full sets are the only fold ("Full sets ›", data-plwsets). The end's HATCH ANOTHER is
// data-plgo (tests count the visible [data-bdgo]: there is one, in the control row); it presses that one.
V2.plotWinPicks = () => { const EV = META.events; if (!EV || !EV.events) return []; /* the same three as V2.buildWinners: newest 1st-place teams from official events or 64+ players */
  return EV.events.filter(e => e.src === 'official' || e.players >= 64).filter(e => e.top[0] && e.top[0].place === 1).slice(0, 3); };
V2.plotWin = (ev, big) => { const E = V2.esc, t = ev.top[0], key = ev.id + '#0', sure = V2.hmUi && V2.hmUi.sure === key, open = V2.bdUi.win === key;
  const sets = t.mons.map(m => { const p = byName.get(m.n); return `<li class="bd-set">${V2.mon(m.n, {iw: 48, bare: true})}<div><b>${V2.rowName(p ? p.d : m.n)}</b>${m.i ? ` <span class="bd-at">@ ${V2.keepForm(E(m.i))}</span>` : ''}
    <small>${E(m.a || '')}${m.nt ? ' · ' + E(m.nt) : ''}</small><small class="bd-mv">${(m.mv || []).map(E).join(' · ')}</small></div></li>`; }).join('');
  const six = t.mons.map(m => `<span>${SPRITE_ID[m.n] ? `<img src="${V2.art(SPRITE_ID[m.n])}" alt="" loading="lazy" decoding="async">` : ''}</span>`).join('');
  /* reskin proposal (Nov 21): the newest winner's six as kit roster cards (THEME 2.4), the art bursting out; the other two keep the strip */
  const sixK = big && V2.kRoster ? V2.kRoster(t.mons.map(m => V2.kCard(m.n, {size: 'small'}))) : '';
  /* the line beside the record (piece 6): "1st of 68 players · Nov 7"; never a lone "1st ·" or a trailing "·": with no player count a
     record reads "1st place · Nov 7" (phones: "Nov 7"), with no record the plate already says "1st", and a missing date drops its "·" */
  const dt = ev.date ? evDate(ev.date) : '', who = t.record ? (ev.players ? `<span class="pl-w1">1st<span class="vh"> place</span> of </span>${E(String(ev.players))} players` : '<span class="pl-w1">1st place</span>') : ev.players ? `${E(String(ev.players))} players` : '';
  const wm = who && dt ? `<span>${who} ·</span> <span>${E(dt)}</span>` : who ? `<span>${who}</span>` : dt ? `<span>${E(dt)}</span>` : '';
  return `<div class="pl-win${sixK ? ' pl-big' : ''}" role="listitem" data-bdwin="${E(key)}">
    <div class="pl-wr"><span class="pl-rec u">${E(t.record || '1st')}</span><span class="pl-wm">${wm}</span>${sure ? '' : `<button type="button" class="pl-out2 u" data-hmload="${E(key)}"><span>Load Team</span></button>`}</div>
    ${sure ? V2.hmSure(key) : ''}<div class="pl-wt"><h3 class="pl-wev u">${E(V2.evTitle(ev.name))}</h3><details class="pl-wsets" data-plwsets="${E(key)}"${open ? ' open' : ''}><summary><span>Full sets ›</span></summary><p class="bd-wwho">${E(teamWho(t))}'s six, full sets</p><ul class="bd-sets">${sets}</ul></details></div>
    ${sixK ? `<div class="pl-wsixk" role="group" aria-label="${E(t.mons.map(m => V2.disp(m.n)).join(', '))}">${sixK}</div>` : `<div class="pl-wsix" role="img" aria-label="${E(t.mons.map(m => V2.disp(m.n)).join(', '))}">${six}</div>`}
    <div class="pl-wa"><button type="button" class="np-link" data-hmcopy="${E(key)}">Copy for Showdown</button><button type="button" class="np-link" data-hmprep="${E(key)}">Set as Opponent ›</button><button type="button" class="np-link" data-bdcx="${E(key)}">Compare ›</button></div></div>`; };
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('[data-plwsets]')) return; if (d.open) V2.bdUi.win = d.dataset.plwsets; else if (V2.bdUi.win === d.dataset.plwsets) V2.bdUi.win = null; }, true);
/* the cores list: 8 then 16 more from 1180 wide (two columns from 1200), 7 then 15 in one column, 4 then 15 on phones (spec section 9:
   "8 rows desktop, 4 phone"); crossing 700 while resizing redraws, as V2.CORES_WIDE does at 1180 */
V2.CORES_PHONE = window.matchMedia ? matchMedia('(max-width:699.98px)') : null;
if (V2.CORES_PHONE) { const f = () => { if (V2.route && V2.route() === 'build') V2.redraw(); }; if (V2.CORES_PHONE.addEventListener) V2.CORES_PHONE.addEventListener('change', f); else if (V2.CORES_PHONE.addListener) V2.CORES_PHONE.addListener(f); }
V2.plotCores = n => { const E = V2.esc, rows = coreRows(), wide = !!(V2.CORES_WIDE && V2.CORES_WIDE.matches), ph = !wide && !!(V2.CORES_PHONE && V2.CORES_PHONE.matches);
  const first = wide ? 8 : ph ? 4 : 7, step = wide ? 16 : 15, shown = rows.slice(0, first + step * (coreUi.more || 0)), base = RES && +RES.base ? +RES.base : .5;
  const kindW = {pairs: 'pairs', trios: 'trios', teams: 'full teams'}[coreUi.kind] || 'pairs';
  const row = (r, i) => { const tags = coreTags(r.ns).filter(x => x !== 'Mega'), pts = r.tog == null ? null : Math.round(r.tog * 1000) / 10, use = coreUi.sort === 'use', w = use ? r.wr : r.score, dv = use ? r.d : r.score - base;
    /* polish triage #3 (Nov 24): the points number never parts from its word (no-break space), so no "+1" is left alone at a line's end.
       Keeping "375 teams" or whole facts together too made cores a line taller in the 212px columns at 1280, so only this space is fixed */
    return `<li class="pl-core pl-c${Math.min(r.ns.length, 4)}"><i class="vh">${i + 1}</i><span class="pl-csp" aria-hidden="true">${r.ns.map(n => SPRITE_ID[n] ? `<img src="${V2.art(SPRITE_ID[n])}" alt="" loading="lazy" decoding="async">` : '').join('')}</span>
      <span class="pl-cwho"><b>${r.ns.map(n => V2.rowName(V2.disp(n))).join(' + ')}</b><small>${tags.length ? `${E(tags.slice(0, 2).join(', '))} · ` : ''}${homeNum(r.n)} teams${r.use != null ? ` (${E(pctTxt(r.use))})` : ''}${pts != null ? ` · ${pts > 0 ? '+' : ''}${pts}\u00a0point${Math.abs(pts) === 1 ? '' : 's'} together` : ''}</small>${r.ns.length > 3
        ? `<span class="pl-cacts"><button type="button" class="np-link" data-bdcprep="${E(r.ns.join('|'))}">Set as Opponent ›</button><button type="button" class="np-link" data-bdccopy="${E(r.ns.join('|'))}">Copy for Showdown</button></span>`
        : `<span class="pl-cacts"><button type="button" class="np-link" data-bdcteams="${E(r.ns.join('|'))}">Teams with It ›</button></span>`}</span>
      <span class="pl-cwv" title="${E(pctTxt(r.use))} of all tournament teams"><b class="u"${use ? '' : ` title="Win rate, pulled toward average until there are enough games (raw: ${E(winFmt(100 * r.wr))})"`}>${E(winFmt(100 * w))}</b><small>wins<span class="pl-cdot"> ·</span> <span class="pl-cvs">${dv >= 0 ? '+' : '−'}${E(ptsTxt(Math.abs(100 * dv)))} vs avg</span></small></span>
      <button type="button" class="pl-out2 pl-cadd u" data-bdcore="${E(r.ns.join('|'))}" aria-label="${r.ns.length > 3 ? 'Load' : 'Add'} ${E(r.ns.map(x => V2.disp(x)).join(' and '))} ${r.ns.length > 3 ? 'as your team' : 'to your team'}"><span>${r.ns.length > 3 ? 'Load Team' : 'Add'}</span></button></li>`; };
  return `<div class="pl-step pl-s6 bd-cores"><span class="pl-node" aria-hidden="true">${n}</span><div class="pl-hd"><h2 class="u pl-h2">Partners in crime</h2><p class="pl-sub">Pick a pair or trio that wins, then fill the rest.</p></div>
    <div class="pl-ctl">${V2.slide('bdckind', [['pairs', 'Pairs'], ['trios', 'Trios'], ['teams', 'Full Teams']], coreUi.kind, 'Kind of core')}${V2.slide('bdcsort', [['win', 'Top Rated'], ['use', 'Most Used']], coreUi.sort, 'Sort cores')}${V2.buildCoreFind()}
      <p class="pl-chint bd-hint">${homeNum(rows.length)} ${kindW} from ${homeNum(RES && RES.teams)} tournament teams. Average team wins ${E(winFmt(base * 100))} of games. ${coreUi.sort === 'use' ? 'Ranked by how many teams used it.' : 'Ranked by win rate, pulled toward the average.'} <button type="button" class="np-link" data-bdcwhy>How Cores Are Ranked ›</button></p></div>
    ${shown.length ? `<ol class="pl-cores bd-clist">${shown.map(row).join('')}</ol>` : '<p class="bd-cnone">No cores match. Try another Pokémon.</p>'}${rows.length > shown.length ? `<button type="button" class="np-link pl-cmore bd-cmore" data-bdcmore>Show ${Math.min(step, rows.length - shown.length)} More ${kindW.replace(/\b[a-z]/g, c => c.toUpperCase())} ›</button>` : ''}</div>`; };
V2.plotLower = end => { const E = V2.esc, picks = V2.plotWinPicks(), lk = ui.abLock && byName.get(ui.abLock), busy = !!(ui.ab && ui.ab.busy);
  const win = picks.length ? `<div class="pl-step pl-s5 bd-wins"><span class="pl-node" aria-hidden="true">5</span><div class="pl-hd"><h2 class="u pl-h2">Plots that worked</h2><p class="pl-sub">Real winners at recent tournaments. Borrow one.</p></div><div class="pl-wins" role="list">${picks.map((ev, i) => V2.plotWin(ev, i === 0)).join('')}</div></div>` : '';
  const fin = end ? `<div class="pl-step pl-end"><span class="pl-node" aria-hidden="true"></span><div class="pl-endn"><h2 class="u pl-h2">The end. Or is it?</h2><button type="button" class="pl-go pl-goend u" data-plgo${busy ? ' aria-busy="true" disabled' : ''}><span>Hatch another</span></button><span class="pl-endq">${lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team'}</span></div></div>` : '';
  return `<section class="pl pl-low bd-lower${end ? ' pl-low1' : ' pl-low0'}" aria-label="More ways to start">${win}${V2.plotCores(picks.length ? 6 : 5)}${fin}</section>`; };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-plgo]'); if (!b) return; const go = document.querySelector('.pl1 [data-bdgo]'); if (!go || go.disabled) return; go.click();
  /* back up to the plot at once (a smooth scroll was cut short by the redraws a build makes: measured -2,056 px, Nov 20) */
  requestAnimationFrame(() => scrollTo({top: 0, behavior: 'instant'})); });
