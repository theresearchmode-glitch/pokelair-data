// ---------- the Damage Calc: "Plot the hit" (Sim, Nov 21; ported from the designer's plot4 mock-up, not redrawn) ----------
// A nasty plot is a scheme: the calc is the board where you plot the hit. Three things only: PHOTOS (the two Pokémon), MARKER (the hit
// is a hand-drawn arrow; a red circle = chosen; moves are highlighter swipes in their type colour; sky / ground / this turn are written
// on the board) and STICKY NOTES (only the two sets). Every colour means something: blue attacker, pink defender, type colours for moves
// and the damage, red marker = chosen, each weather / terrain its own. % of HP first, HP beside it (Sim, Nov 21, 8:39 AM; was real HP first, Q100). Every hook today's tests
// and handlers use is kept: data-dcmv, data-dcw, data-dcterr, data-dct, #dcSwap, data-arnpick (the photo opens "Choose the attacker /
// defender", Q46 A), data-arnmv (All moves), the set rows, data-arnst (stage), the KO Board. The title is "Plot the hit": "The plot" is
// the Build page (Sim, Nov 21: "fix the clashes as you see fit").
V2.PC_W = {title: 'Plot the hit', swap: 'swap them', move: 'the move', sky: 'the sky', ground: 'the ground', turn: 'this turn',
  N: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']};
// the marker circle: one hand-drawn loop, stretched to whatever it circles (red = chosen)
V2.pcRing = (cls = '') => `<svg class="pc-ring${cls ? ' ' + cls : ''}" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><path d="M52 5C20 2 4 16 5 31C6 48 32 57 56 55C80 53 97 43 95 27C93 11 70 2 38 7"/></svg>`;
const pcGcd = (a, b) => b ? pcGcd(b, a % b) : a;
// the verdict in real HP from the engine's 16 damage rolls (r.rolls) and the defender's HP (r.hp). Focus Sash / Sturdy / Focus Band keep
// today's words. Returns {big, sm, chip}: the circled line, the small marker line under it, the move swipe's short line.
V2.pcVerdict = r => { const W = V2.PC_W; if (!r) return null; if (r.max === 0) return {big: 'No effect', sm: '', chip: 'no effect'};
  if (r.sash || r.band) return {big: V2.ARN_W.long(koText(r)).replace(/<[^>]+>/g, ''), sm: '', chip: V2.ARN_W.short(koShort(r)).toLowerCase()};
  const rolls = (r.rolls && r.rolls.length ? r.rolls : [r.min, r.max]), n = rolls.length, ko = rolls.filter(v => v >= r.hp), k = ko.length;
  if (k === n) return {big: 'Always faints', sm: '', chip: 'always faints'};
  if (k > 0) { const g = pcGcd(k, n), a = k / g, b = n / g, rest = rolls.filter(v => v < r.hp), lo = r.hp - Math.max(...rest), hi = r.hp - Math.min(...rest), o = b - a;
    return {big: `Faints ${a} time${a > 1 ? 's' : ''} in ${b}`, sm: `hangs on with ${V2.pcLeft(lo, hi, r.hp)} the other ${o <= 10 ? W.N[o] : o}`, chip: `faints ${a} in ${b}`}; }
  const nx = r.next || r, t = koText0(r); let m;
  if (t === 'Guaranteed 2HKO') return {big: 'Faints in 2 hits', sm: `hangs on with ${V2.pcLeft(r.hp - r.max, r.hp - r.min, r.hp)} after one`, chip: '2 hits'};
  if ((m = /^(\d+)% chance to 2HKO$/.exec(t))) return {big: `Faints in 2 hits, ${m[1]}% of the time`, sm: `hangs on with ${V2.pcLeft(r.hp - r.max, r.hp - r.min, r.hp)} after one`, chip: '2 hits?'};
  if (t === 'Possible 2HKO') return {big: 'May faint in 2 hits', sm: `hangs on with ${V2.pcLeft(r.hp - r.max, r.hp - r.min, r.hp)} after one`, chip: '2 hits?'};
  if (t === 'Guaranteed 3HKO') return {big: 'Faints in 3 hits', sm: `hangs on with ${V2.pcLeft(r.hp - r.max, r.hp - r.min, r.hp)} after one`, chip: '3 hits'};
  const h = 1 + Math.ceil((r.hp - r.max) / Math.max(1, nx.max)); return {big: `Takes ${h}+ hits`, sm: `hangs on with ${V2.pcLeft(r.hp - r.max, r.hp - r.min, r.hp)} after one`, chip: `${h}+ hits`}; };
V2.pcDmg = r => r.min === r.max ? String(r.min) : `${r.min}–${r.max}`;
/* Sim, Nov 21, 8:39 AM: one unit first everywhere, the other small beside it. A = % of HP first (matches the KO Board); this reverses
   Q100 (Nov 20, 11:27 PM: HP first, % small), so it is one switch: false brings back HP first */
V2.PC_PCT_FIRST = true;
V2.pcPctOf = (v, hp) => Math.round(100 * v / hp); /* rounded like the KO Board (calc.js kobRow) */
V2.pcPct = r => r.min === r.max ? `${V2.pcPctOf(r.min, r.hp)}%` : `${V2.pcPctOf(r.min, r.hp)}–${V2.pcPctOf(r.max, r.hp)}%`;
V2.pcPctH = r => V2.pcPct(r).replace(/%$/, '<span class="pc-pc">%</span>'); /* the % sign smaller, so the number keeps its width */
V2.pcLeft = (lo, hi, hp) => V2.PC_PCT_FIRST ? `${lo === hi ? V2.pcPctOf(lo, hp) : V2.pcPctOf(lo, hp) + '–' + V2.pcPctOf(hi, hp)}%` : `${lo === hi ? lo : lo + '–' + hi} HP`;
// a photo: the Pokémon on its tint (blue attacker, pink defender, the defender circled), its form line ('Mega') and name (Sim, Nov 21: names, not 'the muscle' / 'the target'); the photo is the picker button
V2.pcPhoto = (X, role, id) => { const E = V2.esc, W = V2.PC_W, d = V2.disp(X.p.n), mega = d.startsWith('Mega ');
  return `<div class="pc-ph ${role}"><span class="pc-pic">${V2.arnImg(X.p.n)}</span><small>${mega ? 'Mega' : '&nbsp;'}</small>
    <b class="u" data-arnname="${role}">${E(mega ? d.slice(5) : d).replace(/ ([XYZ])$/, ' $1')}<i class="arw" aria-hidden="true"></i></b>${role === 'd' ? V2.pcRing('pc-ring-ph') : ''}
    <button type="button" class="arn-pickbtn" data-arnpick="${id}" aria-haspopup="dialog" aria-label="${role === 'd' ? V2.ARN_W.defender : V2.ARN_W.attacker}: ${E(d)}. Choose another Pokémon"></button>
    <select class="arn-pick arn-pickhid" id="${id}" tabindex="-1" aria-hidden="true">${monOptions(X.p.n)}</select></div>`; };
// the answer: the marker arrow, "Heat Wave does", the damage big in the move's type colour, the defender's HP, the circled verdict
V2.pcAnswer = C => { const E = V2.esc, r = C.r, mv = C.mv, d = V2.disp(C.D.p.n), arrow = `<svg class="pc-arrow" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true"><path d="M4 52C90 8 250 2 388 34"/><path d="M362 12L390 35L354 50"/></svg>`;
  if (!mv) return `<div class="pc-ans" aria-live="polite">${arrow}<p class="pc-vd u"><span>${V2.ARN_W.pick}</span></p></div>`;
  const t = (r && r.type) || mv.type, ty = V2.TYPES.includes(t) ? ` style="--tc:var(--ty-${t});--tcn:var(--pcn-${t},var(--tyn-${t}))"` : ''; /* --tcn: the big number at night (Q105 B) */
  if (!r) return `<div class="pc-ans" aria-live="polite">${arrow}<p class="pc-l1"><span class="pc-ty"${ty}>${E(t)}</span> ${E(mv.name)}</p><p class="pc-l2">${calcNoResultText(mv)}</p></div>`;
  const V = V2.pcVerdict(r);
  if (r.max === 0) return `<div class="pc-ans"${ty} aria-live="polite">${arrow}<p class="pc-l1"><span class="pc-ty">${E(t)}</span> ${E(mv.name)} does</p><p class="pc-big u">0</p>
    <p class="pc-l2">${r.fail ? E(r.fail) + '.' : `${E(d)} is immune to ${E(r.type)}.`}</p><p class="pc-vd u"><span>No effect${V2.pcRing()}</span></p></div>`;
  return `<div class="pc-ans"${ty} aria-live="polite">${arrow}<p class="pc-l1"><span class="pc-ty">${E(t)}</span> ${E(mv.name)} does</p><p class="pc-big u${V2.PC_PCT_FIRST ? ' pc-pctf' : ''}">${V2.PC_PCT_FIRST ? V2.pcPctH(r) : V2.pcDmg(r)}</p>
    <p class="pc-l2">${V2.PC_PCT_FIRST ? `of ${E(d)}'s HP: <b>${V2.pcDmg(r)} damage · ${r.hp} HP</b>.` /* Sim, Nov 21, 4:49 PM: 'x–y damage · N HP' (was 'x–y of N HP') */ : `damage (${V2.pcPct(r)}). ${E(d)} has <b>${r.hp} HP</b>.`}</p><p class="pc-vd u"><span>${E(V.big)}${V2.pcRing()}</span></p>${V.sm ? `<p class="pc-sm u">${E(V.sm).replace(/(\d+(?:–\d+)?(?: HP|%))/, '<span class="pc-nw">$1</span>')}</p>` : ''}</div>`; };
// a move: a highlighter swipe in its type's colour; its damage in HP and the short verdict; the chosen one circled
V2.pcMove = (C, m, i) => { const E = V2.esc, on = m.name === dc.mv, r = on ? C.r : V2.dcHit(C, m), t = (r && r.type) || m.type, V = r && r.max > 0 ? V2.pcVerdict(r) : null;
  const dmg = !r ? (m.cat ? 'Not calculated' : 'No damage') : r.max === 0 ? 'No effect' : (V2.PC_PCT_FIRST ? V2.pcPct(r) : V2.pcDmg(r)), tilt = [-1.5, 1, -1, 1.5][i % 4];
  return `<button type="button" class="pc-mv${on ? ' on' : ''}" style="--tc:var(--ty-${t});--r:${tilt}deg" data-dcmv="${E(m.name)}" aria-pressed="${on}" aria-label="${E(m.name)}: ${E(dmg)}${r && r.max > 0 ? (V2.PC_PCT_FIRST ? ` of its HP (${V2.pcDmg(r)} HP)` : ' damage') : ''}${V ? ', ' + E(V.chip) : ''}">
    <i class="pc-sw" aria-hidden="true"></i><b class="u">${E(m.name)}</b><em class="u">${r && r.max > 0 && V2.PC_PCT_FIRST ? V2.pcPctH(r) : E(dmg)}</em><small>${E(t)}${V ? ' · ' + E(V.chip) : ''}</small>${on ? V2.pcRing() : ''}</button>`; };
// sky / ground: icons and words written on the board in each one's colour; the chosen one circled
V2.pcFive = (k, L, cur, lab) => `<div class="pc-five" role="group" aria-label="${lab}">${L.map(([v, t]) => `<button type="button" ${k === 'wx' ? 'data-dcw' : 'data-dcterr'}="${v}" style="--k:var(--pc-k-${v || 'none'})" aria-pressed="${v === cur}"${v === '' ? ` aria-label="${t}: no ${lab.toLowerCase()}"` : ''}>${V2.arnIc(v)}<span>${t}</span>${v === cur ? V2.pcRing() : ''}</button>`).join('')}</div>`;
/* ---------- the reskin on the shared kit (Sim, Nov 21: hybrid rules approved 12:15 PM; the Calc's call "keep as drawn, small fixes") ----------
   The kit header (kicker, "Plot the hit.", one lead line), the plot sentence ("[attacker ▾] hits [defender ▾] with [move ▾]", each word opens
   today's picker sheet), then the plan line: 1 The hit (the graph paper stays: it is the Calc's own hero), 2 The move, 3 The conditions and
   the kits, 4 The KO Board (its counts, its top rows, the page's one pink move opens the board). Every hook today's tests and handlers use
   stays where it was (data-dcmv, data-dcw, data-dcterr, data-dct, #dcSwap, data-arnpick on the photos, data-arnmv on All moves, the set rows,
   data-arnst, .arn-kb > summary.arn-kbbar with its .t and .c). The sentence's words use their own hooks (data-pcpick, data-pcmv) so each
   of today's hooks stays on one element. */
V2.PC_K = {kicker: 'BATTLE · PLOT THE HIT', h1: 'Plot <em>the hit.</em>', hint: 'Blue words are buttons.',
  s1: 'The hit', s2: 'The move', s2n: 'tap one to try it', s3: 'The conditions and the kits', s3n: 'the sky, the ground, this turn; each side’s set', s4: 'The KO Board',
  go: 'OPEN THE KO BOARD.', close: 'CLOSE THE KO BOARD.', mine: 'your six against the top 30', theirs: 'the top 30 against your six', empty: 'Add your six on My Team to see what they do to the top 30.'};
// one row of the KO Board's top: the threat's picture, its name, whose move, the damage; a tap puts that hit on the table (data-dckb, the tiles' handler)
V2.pcKoRow = (b, dir) => { const E = V2.esc, d = V2.disp(b.n), o = V2.disp(b.other), pc = `${Math.round(100 * b.lo)}–${Math.round(100 * b.hi)}%`, k = V2.kobOf(b);
  const sub = dir === 'mine' ? `your ${o}’s ${b.mv}` : `its ${b.mv} into your ${o}`, say = dir === 'mine' ? `${d}: your ${o}'s ${b.mv} does ${pc}` : `${d}'s ${b.mv} into your ${o}: ${pc}`;
  return `<li><button type="button" class="pc-kr ${k}" data-dckb="${E(b.n)}" data-dckbo="${E(b.other)}" data-dckbm="${E(b.mv)}" aria-label="${E(say)}. Put it on the table">${V2.mon(b.n, {iw: 40, bare: true})}<span class="pc-krn"><b>${E(d).replace(/ ([XYZ])$/, ' $1')}</b><small>${E(sub)}</small></span><b class="pc-krv u">${pc}</b></button></li>`; };
V2.pcKoStep = C => { const K = V2.PC_K, W = V2.ARN_W, open = V2.dcOpen && V2.dcOpen.k, dir = dc.dir === 'theirs' ? 'theirs' : 'mine', wide = V2.kobWide();
  if (!C.ms.length) return {note: K.mine, body: `<p class="pc-kempty">${K.empty}</p>${V2.kLink('Go to My Team', {href: '#team'})}
    <details class="arn-kb pc-kgo" data-dcfold="k"${open ? ' open' : ''}><summary class="arn-kbbar k-go u" data-kmax="2"><span class="t">${K.go}</span><span class="t2" aria-hidden="true">${K.close}</span><span class="c vh">${W.kbEmpty}</span></summary><div class="arn-kbin">${V2.dcBoard(C)}</div></details>`};
  const L = V2.dcKB(), c = V2.dcCounts(L), mine = dir === 'mine';
  const facts = V2.kFacts([[c.ko, 'down in one hit', mine], [c.can, 'can go down'], [c.sv, 'survive']]);
  return {note: mine ? K.mine : K.theirs, body: `${facts}<ul class="pc-krs">${L.slice(0, 6).map(b => V2.pcKoRow(b, dir)).join('')}</ul>
    <details class="arn-kb pc-kgo" data-dcfold="k"${open ? ' open' : ''}><summary class="arn-kbbar k-go u" data-kmax="2"${wide ? ' aria-controls="arn-kbfull"' : ''}><span class="t">${K.go}</span><span class="t2" aria-hidden="true">${K.close}</span><span class="c vh">${mine ? W.kbMine : W.kbTheirs}: ${c.ko} down in one hit · ${c.can} can go down · ${c.sv} survive</span></summary>${wide ? '' : `<div class="arn-kbin">${V2.dcBoard(C)}</div>`}</details>`}; };
// the sentence's words open today's sheets (the photo's and All moves' own buttons keep data-arnpick / data-arnmv)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.dc2 [data-pcpick],.dc2 [data-pcmv]'); if (!b) return; b.focus({preventScroll: true});
  if (b.hasAttribute('data-pcmv')) V2.arnMvPick(); else V2.arnPick(b.dataset.pcpick); });
V2.pages.calc.draw = function () { let C; try { C = calcData(); } catch (e) { console.error(e); return `<div class="dc2 arn pc"><h1 class="vh">Damage Calculator</h1>${V2.battleToolsBar('calc')}<p class="tm-sub">The calc couldn't load. Try again in a moment.</p></div>`; }
  const E = V2.esc, W = V2.PC_W, AW = V2.ARN_W, K = V2.PC_K, wx = dc.weather || '', tr = dc.terrain || '';
  const set = C.mvs.pop.filter(m => m && m.bp > 0); let three = set.slice(0, 3); if (dc.mv && !three.some(m => m.name === dc.mv) && C.mv) three = [...three.slice(0, 2), C.mv];
  const sw = [['spread', 'Hits both foes'], ['screen', 'Screen up'], ['hh', 'Helping Hand'], ['fg', 'Friend Guard'], ['crit', 'Critical hit']];
  const swOn = k => k === 'spread' ? !!C.spread : !!dc[k];
  const dA = V2.disp(C.A.p.n), dD = V2.disp(C.D.p.n), fmt = S.format === 'doubles' ? 'doubles' : 'singles', t = C.mv ? ((C.r && C.r.type) || C.mv.type) : '';
  const sent = V2.kSent([{w: dA, menu: true, attrs: {'data-pcpick': 'dcA', 'aria-label': `The attacker, ${dA}: choose another Pokémon`}}, 'hits',
    {w: dD, menu: true, attrs: {'data-pcpick': 'dcD', 'aria-label': `The defender, ${dD}: choose another Pokémon`}}, 'with',
    {w: dc.mv || 'a move', menu: true, attrs: {'data-pcmv': '', 'aria-label': `The move, ${dc.mv || 'none'}: choose any move`}}], {label: 'The hit', hint: false});
  const KO = V2.pcKoStep(C);
  return `<div class="dc2 arn pc pck">${V2.battleToolsBar('calc')}
  ${V2.kHead({kicker: K.kicker, h1Html: K.h1, lead: `Damage Calculator · level 50 ${fmt}.`})}
  ${sent}<p class="k-hint pc-hint">${K.hint} <button type="button" class="pc-swap" id="dcSwap" aria-label="Swap attacker and defender"><svg viewBox="0 0 60 34" aria-hidden="true"><path d="M4 10H52M42 3L54 10L42 17M56 24H8M18 17L6 24L18 31"/></svg>${W.swap}</button></p>
  ${V2.kPlan(`${V2.kStep(1, K.s1, C.mv ? `${C.mv.name} · ${t}` : '', `<section class="pc-board" aria-label="${E(dA)} attacks ${E(dD)}">${V2.pcPhoto(C.A, 'a', 'dcA')}${V2.pcPhoto(C.D, 'd', 'dcD')}${V2.pcAnswer(C)}</section>`)}
  ${V2.kStep(2, K.s2, K.s2n, `<div class="pc-blk pc-mvb"><div class="pc-mvs" role="group" aria-label="${E(dA)}'s moves">${three.map((m, i) => V2.pcMove(C, m, i)).join('')}${V2.arnAll(C).replace('class="arn-mv all"', 'class="arn-mv all pc-all"')}</div></div>`)}
  ${V2.kStep(3, K.s3, K.s3n, `<div class="pc-conds"><div class="pc-blk pc-sky"><h3>${W.sky}</h3>${V2.pcFive('wx', V2.DC_WX, wx, 'Weather')}</div>
    <div class="pc-blk pc-gnd"><h3>${W.ground}</h3>${V2.pcFive('tr', V2.DC_TR, tr, 'Terrain')}</div>
    <div class="pc-blk pc-turn"><h3>${W.turn}</h3><div class="pc-sws arn-sw" role="group" aria-label="In play">${sw.map(([k, t]) => `<button type="button" data-dct="${k}" aria-pressed="${swOn(k)}"><span>${t}</span>${swOn(k) ? V2.pcRing() : ''}</button>`).join('')}</div></div></div>
    ${V2.arnSets(C).replace('<div class="arn-sets">', '<div class="arn-sets pc-kits">').replace(`<b class="u">${AW.attacker}</b>`, `<b class="u">${E(dA)}'s\u00a0set</b>`).replace(`<b class="u">${AW.defender}</b>`, `<b class="u">${E(dD)}'s\u00a0set</b>`)}`)}
  ${V2.kStep(4, K.s4, KO.note, `<div class="pc-kob">${KO.body}</div>
    <div class="pc-links arn-links"><a class="np-link k-link" href="#method">${AW.how}&nbsp;›</a>${V2.FB && V2.FB.ok ? `<a class="np-link k-link" href="#feedback" data-fbmistake="calc" aria-label="Report a mistake in this hit">${AW.report}&nbsp;›</a>` : ''}${V2.arnNotes(C)}</div>`)}`)}
  ${V2.arnKBFull(C)}</div>`; };
