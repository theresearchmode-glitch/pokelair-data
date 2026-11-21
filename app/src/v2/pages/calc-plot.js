// ---------- the Damage Calc: "Plot the hit" (Sim, Nov 21; ported from the designer's plot4 mock-up, not redrawn) ----------
// A nasty plot is a scheme: the calc is the board where you plot the hit. Three things only: PHOTOS (the two Pokémon), MARKER (the hit
// is a hand-drawn arrow; a red circle = chosen; moves are highlighter swipes in their type colour; sky / ground / this turn are written
// on the board) and STICKY NOTES (only the two sets). Every colour means something: blue attacker, pink defender, type colours for moves
// and the damage, red marker = chosen, each weather / terrain its own. % of HP first, HP beside it (Sim, Nov 21, 8:39 AM; was real HP first, Q100). Every hook today's tests
// and handlers use is kept: data-dcmv, data-dcw, data-dcterr, data-dct, #dcSwap, data-arnpick (the photo opens "Choose the attacker /
// defender", Q46 A), data-arnmv (All moves), the set rows, data-arnst (stage), the KO Board. The title is "Plot the hit": "The plot" is
// the Build page (Sim, Nov 21: "fix the clashes as you see fit").
V2.PC_W = {title: 'Plot the hit', swap: 'swap them', muscle: 'the muscle', target: 'the target', move: 'the move', sky: 'the sky', ground: 'the ground', turn: 'this turn',
  kitA: "the muscle's kit", kitD: "the target's kit", N: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']};
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
// a photo: the Pokémon on its tint (blue attacker, pink defender, the target circled), its role and name; the photo is the picker button
V2.pcPhoto = (X, role, id) => { const E = V2.esc, W = V2.PC_W, d = V2.disp(X.p.n), mega = d.startsWith('Mega ');
  return `<div class="pc-ph ${role}"><span class="pc-pic">${V2.arnImg(X.p.n)}</span><small>${role === 'a' ? W.muscle : W.target}${mega ? ' · Mega' : ''}</small>
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
    <p class="pc-l2">${V2.PC_PCT_FIRST ? `of ${E(d)}'s HP: <b>${V2.pcDmg(r)} of ${r.hp} HP</b>.` : `damage (${V2.pcPct(r)}). ${E(d)} has <b>${r.hp} HP</b>.`}</p><p class="pc-vd u"><span>${E(V.big)}${V2.pcRing()}</span></p>${V.sm ? `<p class="pc-sm u">${E(V.sm).replace(/(\d+(?:–\d+)?(?: HP|%))/, '<span class="pc-nw">$1</span>')}</p>` : ''}</div>`; };
// a move: a highlighter swipe in its type's colour; its damage in HP and the short verdict; the chosen one circled
V2.pcMove = (C, m, i) => { const E = V2.esc, on = m.name === dc.mv, r = on ? C.r : V2.dcHit(C, m), t = (r && r.type) || m.type, V = r && r.max > 0 ? V2.pcVerdict(r) : null;
  const dmg = !r ? (m.cat ? 'Not calculated' : 'No damage') : r.max === 0 ? 'No effect' : (V2.PC_PCT_FIRST ? V2.pcPct(r) : V2.pcDmg(r)), tilt = [-1.5, 1, -1, 1.5][i % 4];
  return `<button type="button" class="pc-mv${on ? ' on' : ''}" style="--tc:var(--ty-${t});--r:${tilt}deg" data-dcmv="${E(m.name)}" aria-pressed="${on}" aria-label="${E(m.name)}: ${E(dmg)}${r && r.max > 0 ? (V2.PC_PCT_FIRST ? ` of its HP (${V2.pcDmg(r)} HP)` : ' damage') : ''}${V ? ', ' + E(V.chip) : ''}">
    <i class="pc-sw" aria-hidden="true"></i><b class="u">${E(m.name)}</b><em class="u">${r && r.max > 0 && V2.PC_PCT_FIRST ? V2.pcPctH(r) : E(dmg)}</em><small>${E(t)}${V ? ' · ' + E(V.chip) : ''}</small>${on ? V2.pcRing() : ''}</button>`; };
// sky / ground: icons and words written on the board in each one's colour; the chosen one circled
V2.pcFive = (k, L, cur, lab) => `<div class="pc-five" role="group" aria-label="${lab}">${L.map(([v, t]) => `<button type="button" ${k === 'wx' ? 'data-dcw' : 'data-dcterr'}="${v}" style="--k:var(--pc-k-${v || 'none'})" aria-pressed="${v === cur}"${v === '' ? ` aria-label="${t}: no ${lab.toLowerCase()}"` : ''}>${V2.arnIc(v)}<span>${t}</span>${v === cur ? V2.pcRing() : ''}</button>`).join('')}</div>`;
V2.pages.calc.draw = function () { let C; try { C = calcData(); } catch (e) { console.error(e); return `<div class="dc2 arn pc"><h1 class="vh">Damage Calculator</h1>${V2.battleToolsBar('calc')}<p class="tm-sub">The calc couldn't load. Try again in a moment.</p></div>`; }
  const E = V2.esc, W = V2.PC_W, AW = V2.ARN_W, wx = dc.weather || '', tr = dc.terrain || '';
  const set = C.mvs.pop.filter(m => m && m.bp > 0); let three = set.slice(0, 3); if (dc.mv && !three.some(m => m.name === dc.mv) && C.mv) three = [...three.slice(0, 2), C.mv];
  const sw = [['spread', 'Hits both foes'], ['screen', 'Screen up'], ['hh', 'Helping Hand'], ['fg', 'Friend Guard'], ['crit', 'Critical hit']];
  const swOn = k => k === 'spread' ? !!C.spread : !!dc[k];
  return `<div class="dc2 arn pc"><h1 class="vh">Damage Calculator · level 50 ${S.format === 'doubles' ? 'doubles' : 'singles'}</h1>${V2.battleToolsBar('calc')}
  <section class="pc-board" aria-label="${E(V2.disp(C.A.p.n))} attacks ${E(V2.disp(C.D.p.n))}">
    <div class="pc-top"><p class="pc-title u" aria-hidden="true">${W.title}</p><button type="button" class="pc-swap u" id="dcSwap" aria-label="Swap attacker and defender"><svg viewBox="0 0 60 34" aria-hidden="true"><path d="M4 10H52M42 3L54 10L42 17M56 24H8M18 17L6 24L18 31"/></svg>${W.swap}</button></div>
    ${V2.pcPhoto(C.A, 'a', 'dcA')}${V2.pcPhoto(C.D, 'd', 'dcD')}
    ${V2.pcAnswer(C)}
    <div class="pc-blk pc-mvb"><h2 class="u">${W.move}</h2><div class="pc-mvs" role="group" aria-label="${E(V2.disp(C.A.p.n))}'s moves">${three.map((m, i) => V2.pcMove(C, m, i)).join('')}${V2.arnAll(C).replace('class="arn-mv all"', 'class="arn-mv all pc-all"')}</div></div>
    <div class="pc-blk pc-sky"><h2 class="u">${W.sky}</h2>${V2.pcFive('wx', V2.DC_WX, wx, 'Weather')}</div>
    <div class="pc-blk pc-gnd"><h2 class="u">${W.ground}</h2>${V2.pcFive('tr', V2.DC_TR, tr, 'Terrain')}</div>
    <div class="pc-blk pc-turn"><h2 class="u">${W.turn}</h2><div class="pc-sws arn-sw" role="group" aria-label="In play">${sw.map(([k, t]) => `<button type="button" data-dct="${k}" aria-pressed="${swOn(k)}"><span>${t}</span>${swOn(k) ? V2.pcRing() : ''}</button>`).join('')}</div></div>
    ${V2.arnSets(C).replace('<div class="arn-sets">', '<div class="arn-sets pc-kits">').replace(`<b class="u">${AW.attacker}</b>`, `<b class="u">${W.kitA}</b>`).replace(`<b class="u">${AW.defender}</b>`, `<b class="u">${W.kitD}</b>`)}
    <div class="pc-kob">${V2.arnKB(C)}</div>
    <div class="pc-links arn-links"><a class="np-link" href="#method">${AW.how} ›</a>${V2.FB && V2.FB.ok ? `<a class="np-link" href="#feedback" data-fbmistake="calc" aria-label="Report a mistake in this hit">${AW.report} ›</a>` : ''}${V2.arnNotes(C)}</div>
  </section>${V2.arnKBFull(C)}</div>`; };
