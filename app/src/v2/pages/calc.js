// ---------- Damage Calc, "The Arena" (Sim's prompt Nov 19, mock-ups docs/redesign/arena/) ----------
// The battle is the control panel: the sky is the weather switch, the ground is the terrain switch, the defender's HP bar is the
// answer. Every number is today's calc (39-damage-calc-speed.js: calcData, damage, koText, koShort, calcResultNotes, bulkToSurvive,
// bestHitOn); the state is today's `dc`, and every picker keeps today's id so today's change handler updates it. What opens from a
// name plate, All moves, a set row and the KO Board is today's picker / board until Sim approves designs for them.

// THE NEW WORDS (Q35 / Q36, waiting on Sim): every new word of the Arena is in this one table, so a "no" is a one-line swap.
// The long verdict and the short one are today's koText / koShort put in plain words; anything not listed (Focus Sash, Sturdy, Focus
// Band) keeps today's words.
V2.ARN_W = {
  clear: 'Clear', none: 'None', allMoves: 'All moves', mostUsed: 'most used set', estimated: 'estimated set', yours: 'your set',
  report: 'Report a Mistake', how: 'How the Calc Works', notes: 'Notes on this hit',
  kbMine: 'KO Board: your six against the top 30', kbTheirs: 'KO Board: the top 30 against your six', kbEmpty: 'KO Board: add your six on My Team',
  hpLeft: 'HP left', pts: 'pts', stage: 'stage', attacker: 'Attacker', defender: 'Defender', pick: 'Pick a damaging move',
  N: ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
  // today's koText -> plain words; <em> is the chance, drawn in pink
  long(t) { const W = V2.ARN_W, sfx = (t.match(/ \(Focus Band.*$/) || [''])[0], s = t.slice(0, t.length - sfx.length); let m, o = null;
    if (s === 'Guaranteed OHKO') o = '<em>Knocks it out</em>';
    else if ((m = /^(\d+)% chance to OHKO$/.exec(s))) o = `<em>${m[1]}% chance</em> to knock it out`;
    else if (s === 'Guaranteed 2HKO') o = 'Two hits to knock it out';
    else if ((m = /^(\d+)% chance to 2HKO$/.exec(s))) o = `<em>${m[1]}% chance</em> to knock it out in two hits`;
    else if (s === 'Possible 2HKO') o = 'Two hits may knock it out';
    else if (s === 'Guaranteed 3HKO') o = 'Three hits to knock it out';
    else if ((m = /^(\d+)HKO or worse$/.exec(s))) o = `${W.N[+m[1]] || m[1]} hits or more`;
    return o ? o + V2.esc(sfx) : V2.esc(t); },
  // today's koShort -> the move buttons' short verdict
  short(t) { let m; if (t === 'OHKO') return 'Knocks out'; if ((m = /^OHKO (\d+)%$/.exec(t))) return m[1] + '% KO'; if (t === '2HKO') return 'Two hits';
    if ((m = /^2HKO (\d+)%$/.exec(t))) return `Two hits ${m[1]}%`; if (t === '2HKO?') return 'Two hits?'; if (t === '3HKO') return 'Three hits';
    if ((m = /^(\d+)HKO\+$/.exec(t))) return m[1] + '+ hits'; if (t === 'no effect') return 'No effect'; return t; }
};
V2.DC_WX = [['', V2.ARN_W.clear], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']];
V2.DC_TR = [['', V2.ARN_W.none], ['grassy', 'Grassy'], ['electric', 'Electric'], ['psychic', 'Psychic'], ['misty', 'Misty']];
// audit #13 (Nov 15): a Mega always holds its stone; the set line names it instead of 'No item' (today's stoneFor, 19-showdown-paste.js)
V2.dcStone = p => { try { return p && /-Mega/.test(p.n) && typeof stoneFor === 'function' ? stoneFor(p) || '' : ''; } catch (e) { return ''; } };
V2.dcPct = r => `${dmgP(100 * r.min / r.hp)}–${dmgP(100 * r.max / r.hp)}%`;
// one move's own result against the defender (same sides and field as the move in play)
V2.dcHit = (C, m) => { if (!m) return null; try { const ord = dcOrder(C.A, C.D, m, dc.weather, dc.terrain);
  return damage({...C.opt, move: m, spread: m.name === dc.mv ? C.spread : !!m.spread, atkLast: !!(ord && ord.last)}); } catch (e) { return null; } };
// the KO Board: each top-30 Pokemon with your best hit on it (or, switched, its best hit on your six), surest KO first
V2.dcKB = () => { const ms = members(), dir = dc.dir === 'theirs' ? 'theirs' : 'mine', key = [dir, S.format, metaVersion, ms.map(m => m.p.n + '/' + (m.item || '') + '/' + (m.ability || '') + '/' + (m.moves || []).map(x => x && x.name).join('+') + '/' + (m.spread ? JSON.stringify(m.spread) : '')).join(',')].join('|');
  if (V2._dcKB && V2._dcKB.key === key) return V2._dcKB.v;
  let thr = []; try { thr = metaThreats(30).map(x => x.p || x).filter(p => p && p.st); } catch (e) {}
  const myF = typeof sideField === 'function' ? sideField(ms) : {}, thF = t => typeof sideField === 'function' ? sideField([{p: t, ability: abilityOf({p: t})}]) : {};
  const v = thr.map(t => { let b = null;
    for (const m of ms) { const h = dir === 'mine' ? bestHitOn(m.p, m.moves, t, m, null, myF) : bestHitOn(t, popularMoves(t), m.p, null, m, thF(t));
      if (h && h.r && h.r.hp && (!b || h.r.max / h.r.hp > b.hi)) b = {hi: h.r.max / h.r.hp, lo: h.r.min / h.r.hp, mv: h.mv.name, other: m.p.n}; }
    return b && {n: t.n, ...b}; }).filter(Boolean).sort((a, b) => b.lo - a.lo || b.hi - a.hi);
  V2._dcKB = {key, v}; return v; };
/* audit Nov 16 (WCAG 2.5.3): a KO tile's name starts with the KO it shows */
V2.dcTile = (b, dir, onTable) => { const E = V2.esc, k = b.lo >= 1 ? 'ko' : b.hi >= 1 ? 'can' : 'sv', left = Math.max(0, 1 - b.hi), d = V2.disp(b.n), o = V2.disp(b.other);
  const lab = dir === 'mine' ? `${d}: your ${o}'s ${b.mv} does ${Math.round(100 * b.lo)}–${Math.round(100 * b.hi)}%` : `${d}'s ${b.mv} into your ${o}: ${Math.round(100 * b.lo)}–${Math.round(100 * b.hi)}%`;
  const say = `${k === 'ko' ? 'KO: ' : ''}${lab}${k === 'ko' ? ', down in one hit' : ''}`; /* Q22 A (Sim, Nov 19): the same words show on hover or keyboard focus (mouse screens) */
  return `<button type="button" class="dc2-kt ${k}${onTable ? ' on' : ''}" data-dckb="${E(b.n)}" data-dckbo="${E(b.other)}" data-dckbm="${E(b.mv)}" data-dctip="${E(say)}" aria-label="${E(say)}. Put it on the table"${onTable ? ' aria-current="true"' : ''}>
    <span class="by" aria-hidden="true">${V2.mon(b.other, {iw: 24, bare: true})}</span>${V2.mon(b.n, {iw: 44, bare: true})}<span class="hp" aria-hidden="true"><i style="width:${(100 * left).toFixed(0)}%"></i><i class="r" style="left:${(100 * left).toFixed(0)}%;width:${(100 * Math.max(0, Math.min(1, b.hi) - Math.min(1, b.lo))).toFixed(0)}%"></i></span><span class="nm" aria-hidden="true">${V2.tileName(d) /* Q22 A: the short name under the tile, touch screens only (no hover) */}</span>${k === 'ko' ? '<span class="stamp u" aria-hidden="true">KO</span>' : ''}</button>`; };
V2.dcCounts = L => ({ko: L.filter(b => b.lo >= 1).length, can: L.filter(b => b.lo < 1 && b.hi >= 1).length, sv: L.filter(b => b.hi < 1).length});
V2.dcDir = () => `<div class="np-slide dc2-dir" role="group" aria-label="The KO Board shows" style="--n:2;--i:${dc.dir === 'theirs' ? 1 : 0}"><span class="thumb" aria-hidden="true"></span><button type="button" data-dcdir="mine" aria-pressed="${dc.dir !== 'theirs'}"><span>Your hits on them</span></button><button type="button" data-dcdir="theirs" aria-pressed="${dc.dir === 'theirs'}"><span>Their hits on you</span></button></div>`;
// phones (and below the desktop table): the board as its own section, in three groups under their counts
V2.dcBoard = (C) => { const E = V2.esc, dir = dc.dir === 'theirs' ? 'theirs' : 'mine', ms = C.ms;
  if (!ms.length) return `<section class="dc2-kb"><h2 class="u">The KO Board</h2><p class="tm-sub">Add Pokémon on My Team to see what your six do to the top 30.</p><a class="np-btn" href="#team">Go to My Team</a></section>`;
  const L = V2.dcKB(), c = V2.dcCounts(L), on = dir === 'mine' ? C.D.p.n : C.A.p.n;
  const grp = (k, t) => { const g = L.filter(b => (b.lo >= 1 ? 'ko' : b.hi >= 1 ? 'can' : 'sv') === k); return g.length ? `<div class="dc2-kg"><h3><b class="u">${g.length}</b> ${t}</h3><div class="dc2-kts">${g.map(b => V2.dcTile(b, dir, b.n === on)).join('')}</div></div>` : ''; };
  return `<section class="dc2-kb"><div class="dc2-kbh"><h2 class="u">The KO Board</h2>${V2.dcDir()}</div><p class="fine">${dir === 'mine' ? 'Your best hit on each of the top 30 (its usual set), surest KO first. The bar is the HP it has left. Tap one to put it on the table.' : 'Each of the top 30\'s best hit on your six (its usual set), surest KO first. The small picture is the one of yours it hits hardest; the bar is the HP yours has left. Tap one to put it on the table.'}</p>
    ${grp('ko', 'down in one hit')}${grp('can', 'can go down')}${grp('sv', 'survive')}${V2.dcGridHtml(C)}</section>`; };
// every hit (today's best-hits table, kept: brief 0): your six across, the top 30 down, each cell the best hit with its usual set;
// switched with the board's "Their hits on you". Folded under the board; the KO Board shows only each one's single best.
V2.dcGrid = () => { const ms = members(), dir = dc.dir === 'theirs' ? 'theirs' : 'mine', key = 'grid|' + (V2._dcKB ? V2._dcKB.key : '') + dir;
  if (V2._dcGr && V2._dcGr.key === key) return V2._dcGr.v;
  let thr = []; try { thr = metaThreats(30).map(x => x.p || x).filter(p => p && p.st); } catch (e) {}
  const myF = typeof sideField === 'function' ? sideField(ms) : {}, thF = t => typeof sideField === 'function' ? sideField([{p: t, ability: abilityOf({p: t})}]) : {};
  const v = {ms, thr, cells: thr.map(t => ms.map(m => { const h = dir === 'mine' ? bestHitOn(m.p, m.moves, t, m, null, myF) : bestHitOn(t, popularMoves(t), m.p, null, m, thF(t));
    return h && h.r && h.r.hp ? {hi: h.r.max / h.r.hp, lo: h.r.min / h.r.hp, mv: h.mv.name, note: hitNote(h)} : null; }))};
  V2._dcGr = {key, v}; return v; };
V2.dcGridHtml = (C) => { if (!C.ms.length) return ''; const E = V2.esc, dir = dc.dir === 'theirs' ? 'theirs' : 'mine', G = V2.dcGrid();
  const title = dir === 'mine' ? 'Your best hit on each top threat' : "Each top threat's best hit on your team";
  const cell = c => { if (!c) return '<td class="z">–</td>'; const k = c.lo >= 1 ? 'k1' : c.hi >= 1 ? 'k1m' : c.lo >= .5 ? 'k2' : c.hi >= .5 ? 'k2m' : 'k3';
    return `<td class="${k}"><b>${Math.round(100 * c.hi)}%</b><small>${E(c.mv)}${c.note ? ' *' : ''}</small></td>`; };
  return `<details class="dc2-fold dc2-all" data-dcfold="g"${V2.dcOpen && V2.dcOpen.g ? ' open' : ''}><summary><span><b>${title}</b><small>${dir === 'mine' ? 'Every one of your six into each of the top 30' : 'Each of the top 30 into every one of your six'}: the best hit with its usual set, as % of HP</small></span><i aria-hidden="true">›</i></summary>
    <div class="dc2-gw"><table class="dc2-grid"><thead><tr><th scope="col"><span class="vh">${dir === 'mine' ? 'Top 30 (defending)' : 'Top 30 (attacking)'}</span></th>${G.ms.map(m => `<th scope="col" title="${E(V2.disp(m.p.n))}">${V2.mon(m.p.n, {iw: 32, bare: true})}<span class="vh">${E(V2.disp(m.p.n))}</span></th>`).join('')}</tr></thead>
    <tbody>${G.thr.map((t, i) => `<tr><th scope="row">${V2.mon(t.n, {iw: 28, bare: true})}<span>${V2.rowName(V2.disp(t.n))}</span></th>${G.cells[i].map(cell).join('')}</tr>`).join('')}</tbody></table></div>
    <p class="fine">KOs in one hit: red · can KO: light red · two hits: amber · more: grey. * charges first, may miss, must recharge or is a one-hit KO move.</p></details>`; };


// ---------- the Arena ----------
// the scene's art: sky (sun, clouds, hills), ground (perspective grid, sparks); every colour is a token, set per weather / terrain in arena-calc.css
V2.ARN_ART = `<div class="arn-bg" aria-hidden="true"><div class="arn-sky"><i class="arn-sun"></i><i class="arn-clouds"></i>
  <svg class="arn-hills" viewBox="0 0 400 60" preserveAspectRatio="none"><path class="h2" d="M0 60V30C50 16 110 10 190 22C260 32 320 12 400 20V60Z"/><path class="h1" d="M0 60V44C70 30 150 38 220 46C290 54 350 34 400 38V60Z"/></svg></div>
  <div class="arn-ground"><svg viewBox="0 0 400 100" preserveAspectRatio="none"><g class="g">${[-200, -120, -40, 40, 120, 200, 280, 360, 440, 520, 600].map(x => `<path d="M200 -30L${x} 100"/>`).join('')}${[5, 13, 24, 38, 56, 78].map(y => `<path d="M0 ${y}H400"/>`).join('')}</g>
  <g class="z"><path d="M8 18L30 10L44 24L66 14L80 30L104 20"/><path d="M14 62L36 48L50 60L74 44L90 58"/><path d="M120 8L142 18L158 6L182 16L200 4"/><path d="M226 10L250 4L262 16L288 8L304 20"/><path d="M40 88L60 74L78 86L98 70L116 84"/><path d="M150 40L166 30L176 44L194 34"/></g></svg></div>
  <div class="arn-fx"></div></div>`;
V2.arnSide = (X, role) => { const W = V2.ARN_W; return X.src === 'yours' ? W.yours : X.src === 'estimated' ? W.estimated : W.mostUsed; };
V2.arnImg = (n, cls) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null; return id ? `<img class="${cls || ''}" src="${V2.art(id, true)}" alt="" decoding="async">` : ''; };
// the defender's plate: name (tap = today's Pokémon picker), the HP bar (green left, pink damage, stripes the roll's part), "x–y% HP left"
V2.arnHp = r => { if (!r || !r.hp) return {bar: '<span class="arn-hpb" aria-hidden="true"><i class="l" style="width:100%"></i></span>', txt: ''};
  const lo = Math.min(1, r.min / r.hp), hi = Math.min(1, r.max / r.hp), keep = 100 * (1 - hi), roll = 100 * (hi - lo);
  const a = Math.max(0, 100 - +dmgP(100 * r.max / r.hp)), b = Math.max(0, 100 - +dmgP(100 * r.min / r.hp));
  return {bar: `<span class="arn-hpb" aria-hidden="true"><i class="l" style="width:${keep.toFixed(1)}%"></i><i class="r" style="left:${keep.toFixed(1)}%;width:${roll.toFixed(1)}%"></i></span>`, txt: `${a === b ? a : a + '–' + b}% ${V2.ARN_W.hpLeft}`}; };
V2.arnPlate = (X, role, id, r) => { const E = V2.esc, d = V2.disp(X.p.n), W = V2.ARN_W, hp = role === 'd' ? V2.arnHp(r) : null;
  return `<div class="arn-plate ${role === 'd' ? 'arn-dp' : 'arn-ap'}"><b class="u" data-arnname="${role}">${d.startsWith('Mega ') ? `<span class="mg">Mega </span>${E(d.slice(5)).replace(/ ([XYZ])$/, '\u00a0$1')}` : E(d)}<i class="arw" aria-hidden="true"></i></b>${hp ? hp.bar + `<span class="arn-hpt">${hp.txt}</span>` : ''}
    <select class="arn-pick" id="${id}" aria-label="${role === 'd' ? W.defender : W.attacker}: ${E(d)}${hp && hp.txt ? ', ' + E(hp.txt) : ''}. Choose another Pokémon">${monOptions(X.p.n)}</select></div>`; };
// the verdict: phone two lines ("Heat Wave takes 88–104% of its HP" / the KO in plain words); desktop the KO words alone, with the
// damage as the big tilted tag in open sky
V2.arnVerdict = C => { const E = V2.esc, W = V2.ARN_W, r = C.r, mv = C.mv;
  if (!mv) return {v: `<div class="arn-verdict notag"><p class="l2 u">${W.pick}</p></div>`, tag: ''};
  if (!r) return {v: `<div class="arn-verdict notag"><p class="l1"><b>${E(mv.name)}</b></p><p class="l3">${calcNoResultText(mv)}</p></div>`, tag: ''};
  if (r.max === 0) return {v: `<div class="arn-verdict notag"><p class="l1"><b>${E(mv.name)}</b> · No effect</p><p class="l2 u">${r.fail ? E(r.fail) + '.' : `${E(V2.disp(C.D.p.n))} is immune to ${E(r.type)}.`}</p></div>`, tag: ''};
  return {v: `<div class="arn-verdict"><p class="l1">${E(mv.name)} takes <b>${V2.dcPct(r)}</b> of its HP</p><p class="l2 u">${W.long(koText(r))}</p></div>`,
    tag: `<p class="arn-tag" aria-hidden="true"><small>${E(mv.name)}</small><b class="u">${V2.dcPct(r)}</b></p>`}; };
// a move button: type-coloured edge, name, its own damage and short verdict (desktop adds type and power); the chosen one is filled
V2.arnMove = (C, m) => { const E = V2.esc, W = V2.ARN_W, on = m.name === dc.mv, r = on ? C.r : V2.dcHit(C, m), t = (r && r.type) || m.type;
  const dmg = !r ? (m.cat ? 'Not calculated' : 'No damage') : r.max === 0 ? 'No effect' : V2.dcPct(r), ko = r && r.max > 0 ? W.short(koShort(r)) : '';
  const dmH = `<span class="dm${r && r.max > 0 ? ' u' : ''}" aria-hidden="true">${E(dmg)}</span>`; /* phone: under the name beside the verdict; desktop: beside the name (one shown) */
  return `<button type="button" class="arn-mv${on ? ' on' : ''}" style="--tc:var(--ty-${t})" data-dcmv="${E(m.name)}" aria-pressed="${on}" aria-label="${E(m.name)}: ${E(dmg)}${ko ? ', ' + E(ko) : ''}">
    <span class="r1"><span class="nm u">${E(m.name)}</span>${dmH.replace('dm', 'dm d1')}</span><span class="r2"><span class="ty">${E(t)}${m.bp > 1 ? ' · ' + m.bp : ''}</span>${dmH.replace('dm', 'dm d2')}${ko ? `<span class="ko">${E(ko)}</span>` : ''}</span></button>`; };
// "All moves": today's move list (id dcMv: its set, then every damaging move it learns) under a dashed button
V2.arnAll = C => { const E = V2.esc, mv = C.mvs;
  return `<div class="arn-mv all"><span>${V2.ARN_W.allMoves}<i class="arw" aria-hidden="true"></i></span><select class="arn-pick" id="dcMv" aria-label="${V2.ARN_W.allMoves}: ${E(dc.mv || 'none')}. Choose any move">${mv.pop.length ? `<optgroup label="Its set">${mv.pop.map(m => `<option${m.name === dc.mv ? ' selected' : ''}>${E(m.name)}</option>`).join('')}</optgroup>` : ''}<optgroup label="Other moves">${mv.rest.map(m => `<option${m.name === dc.mv ? ' selected' : ''}>${E(m.name)}</option>`).join('')}</optgroup></select></div>`; };
// a stage row: names its stat; minus / plus within today's range (-2 to +2)
V2.arnStage = (who, lab, b) => `<div class="arn-f arn-st" role="group" aria-label="${lab}"><span class="lb">${lab}</span><span class="ctl"><button type="button" data-arnst="${who}" data-d="-1" aria-label="Lower ${lab}"${b <= -2 ? ' disabled' : ''}>−</button><output class="u" id="dc${who === 'a' ? 'A' : 'D'}Bo" aria-live="polite">${b > 0 ? '+' + b : b < 0 ? '−' + -b : '±0'}</output><button type="button" data-arnst="${who}" data-d="1" aria-label="Raise ${lab}"${b >= 2 ? ' disabled' : ''}>+</button></span></div>`;
V2.arnSel = (h, lab) => `<label class="arn-f"><span class="vh">${lab}</span>${h}<i class="arw" aria-hidden="true"></i></label>`;
// the two set cards: item, Ability, nature, points, stage (today's ids; the defender's points open HP, Def and Sp. Def)
V2.arnSets = C => { const E = V2.esc, W = V2.ARN_W, {A, D, mvC, bp_} = C, sel = C.sel, PTS = C.PTS;
  const spec = mvC && mvC.cat === 2, aStat = bp_ ? 'Def' : spec ? 'Sp. Atk' : 'Atk', defPhys = !mvC || mvC.cat !== 2 || ['Psyshock', 'Psystrike', 'Secret Sword'].includes(mvC.name), dStat = defPhys ? 'Def' : 'Sp. Def';
  const aPts = `<label class="arn-f arn-ov"><span class="lb">${aStat}${bp_ ? ' (Body Press)' : ''} <small>points</small></span><b class="v">${C.aShown}</b><i class="arw" aria-hidden="true"></i>${sel('dcASp', PTS(C.aShown), String(C.aShown)).replace('<select class="field"', `<select class="arn-pick" aria-label="${aStat} points: ${C.aShown}"`)}</label>`;
  const ft = A.ability === 'Supreme Overlord' || (C.mv && C.mv.name === 'Last Respects') ? V2.arnSel(sel('dcAFt', [0, 1, 2, 3].map(x => [String(x), `${x} allies fainted`]), String(Math.min(3, dc.fainted || 0))), `Allies fainted (${A.ability === 'Supreme Overlord' ? 'Supreme Overlord: +10% power each' : 'Last Respects: +50 power each'})`) : '';
  const box = (lab, h) => `<label class="arn-box"><span>${lab}</span>${h}</label>`;
  const dPts = `<details class="arn-pts" data-dcfold="p"${V2.dcOpen && V2.dcOpen.p ? ' open' : ''}><summary class="arn-f"><span class="lb">HP <b>${D.hpSp}</b> · ${defPhys ? 'Def' : 'SpD'} <b>${defPhys ? D.defSp : D.spdSp}</b> <small>${W.pts}</small></span><i class="arw" aria-hidden="true"></i></summary>
    <div class="arn-ptsbox">${box('HP points', sel('dcDHp', PTS(D.hpSp), String(D.hpSp)))}${box('Def points', sel('dcDDf', PTS(D.defSp), String(D.defSp)))}${box('Sp. Def points', sel('dcDSd', PTS(D.spdSp), String(D.spdSp)))}<p class="fine">66 points at most in all; 32 in one stat.</p></div></details>`;
  const card = (k, X, role, rows) => `<section class="arn-set ${k}" aria-label="${role}'s set"><header>${V2.arnImg(X.p.n, 'mini')}<span><b class="u">${role}</b><small>${E(V2.arnSide(X))}</small></span></header>${rows}</section>`;
  const sl = (h, lab) => V2.arnSel(h.replace('<select class="field"', '<select class="arn-sel"'), lab);
  return `<div class="arn-sets">${card('a', A, W.attacker, `${sl(C.itemSel('dcAIt', A), 'Item')}${sl(sel('dcAAb', A.p.a, A.ability), 'Ability')}${sl(sel('dcANat', NATURES, A.nat), 'Nature')}${aPts}${ft.replace('<select class="field"', '<select class="arn-sel"')}${V2.arnStage('a', aStat + ' ' + W.stage, A.boost)}`)}
    ${card('d', D, W.defender, `${sl(C.itemSel('dcDIt', D), 'Item')}${sl(sel('dcDAb', D.p.a, D.ability), 'Ability')}${sl(sel('dcDNat', NATURES, D.nat), 'Nature')}${dPts}${V2.arnStage('d', dStat + ' ' + W.stage, D.boost)}`)}</div>`; };
// the KO Board bar: one tap away; it opens today's board (both directions, the three groups, every hit's table)
V2.arnKB = C => { const W = V2.ARN_W, open = V2.dcOpen && V2.dcOpen.k;
  if (!C.ms.length) return `<details class="arn-kb" data-dcfold="k"${open ? ' open' : ''}><summary class="arn-kbbar"><span class="t u">${W.kbEmpty}</span><i class="chev" aria-hidden="true">›</i></summary><div class="arn-kbin">${V2.dcBoard(C)}</div></details>`;
  const L = V2.dcKB(), c = V2.dcCounts(L), n = Math.max(1, L.length), dir = dc.dir === 'theirs';
  return `<details class="arn-kb" data-dcfold="k"${open ? ' open' : ''}><summary class="arn-kbbar"><span class="t u">${dir ? W.kbTheirs : W.kbMine}</span><span class="c">${c.ko} down in one hit · ${c.can} can go down · ${c.sv} survive</span>
    <span class="bar" aria-hidden="true"><i class="ko" style="width:${(100 * c.ko / n).toFixed(1)}%"></i><i class="can" style="width:${(100 * c.can / n).toFixed(1)}%"></i><i class="sv" style="width:${(100 * c.sv / n).toFixed(1)}%"></i></span><i class="chev" aria-hidden="true">›</i></summary><div class="arn-kbin">${V2.dcBoard(C)}</div></details>`; };
// notes on this hit (today's Details: HP numbers, KO odds in today's words, effectiveness, notes, Not counted, fewest points to survive, the set readout)
V2.arnNotes = C => { const E = V2.esc, {A, D, mv, r} = C; let notes = [], nc = [];
  if (mv && r && r.max > 0) { try { const x = calcResultNotes(A, D, mv, r, C.ord, C.ctx); notes = x.t; nc = x.nc; } catch (e) {} }
  let bulk = ''; if (r && r.max > 0) { try { const bs = bulkToSurvive(C.opt); if (bs) bulk = bs.none ? `${E(V2.disp(D.p.n))} can't survive this hit with any spread.` : `Fewest points to always survive: <b>${bs.hp} HP / ${bs.df} ${bs.stat}</b> (${bs.tot} total). ${r.max < r.hp ? 'This spread already survives.' : 'This spread does not.'}`; } catch (e) {} }
  const nt = [A.real || D.real ? 'spreads: most common on the Showdown ladder' : '', A.p.n === 'Aegislash' ? 'Aegislash attacks in Blade Forme (Atk/SpA 140)' : '', D.p.n === 'Aegislash' ? 'Aegislash takes hits in Shield Forme' : '', A.p.formNote || D.p.formNote ? 'Palafin in Hero Form' : '', dc.wSet || dc.tSet || !(dc.weather || dc.terrain) ? '' : 'field set by the Pokémon selected (change it above)'].filter(Boolean);
  const eff = r && r.max > 0 && r.eff !== 1 ? `${E(r.type)} is ${r.eff >= 4 ? 'super effective twice over' : r.eff >= 2 ? 'super effective' : r.eff <= .25 ? 'resisted twice over' : 'resisted'}` : '';
  const hpL = r && r.max > 0 ? `<p><b>${V2.dcPct(r)}</b>: ${r.min}–${r.max} of ${r.hp} HP${r.hits > 1 ? ` · ${r.hits} hits` : ''} · ${E(koText(r))}${eff ? ' · ' + eff : ''}</p>` : '';
  const wx = {sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow'}[dc.weather], tr = dc.terrain ? dc.terrain[0].toUpperCase() + dc.terrain.slice(1) + ' Terrain' : '';
  const set = mv ? `<p class="dc2-set"><span>${E(A.p.d || A.p.n)} ${C.aShown} ${C.mvC && C.mvC.cat === 2 ? 'Sp. Atk' : 'Atk'} points ${E(A.nat)}${A.item ? ' ' + E(A.item) : ''}, ${E(dc.mv)}${C.spread ? ' (spread)' : ''}</span> <span>vs ${E(D.p.d || D.p.n)} ${D.hpSp} HP / ${D.defSp} Def / ${D.spdSp} SpD ${E(D.nat)}${D.item ? ' ' + E(D.item) : ''}</span></p>` : '';
  return `<details class="arn-notes" data-dcfold="n"${V2.dcOpen && V2.dcOpen.n ? ' open' : ''}><summary><span>${V2.ARN_W.notes}</span><i class="chev" aria-hidden="true">›</i></summary><div class="arn-notesin">
    <p>Level 50 ${S.format === 'doubles' ? 'doubles' : 'singles'} · ${[wx || 'no weather', tr || 'no terrain', C.spread ? 'hits both foes' : ''].filter(Boolean).join(' · ')}</p>${hpL}
    ${notes.length ? `<p>${notes.join(' · ')}</p>` : ''}${nc.length ? `<p>Not counted: ${nc.join('; ')}.</p>` : ''}${bulk ? `<p>${bulk}</p>` : ''}${set}${nt.length ? `<p class="fine">${E(nt.map(x => x[0].toUpperCase() + x.slice(1)).join('. '))}.</p>` : ''}</div></details>`; };

V2.pages.calc = {place: 'battle', after() { /* the move names are fitted (V2.fitWords) once the logo font has loaded, as the old hand's were */ if (document.fonts && document.fonts.ready && !V2._arnFont) { V2._arnFont = 1; document.fonts.ready.then(() => { if (document.querySelector('.arn') && V2.fitWords) V2.fitWords(); }); } }, draw() { let C; try { C = calcData(); } catch (e) { console.error(e); return `<div class="dc2 arn"><h1 class="vh">Damage Calculator</h1>${V2.battleToolsBar('calc')}<p class="tm-sub">The calc couldn't load. Try again in a moment.</p></div>`; }
  const E = V2.esc, W = V2.ARN_W, wx = dc.weather || '', tr = dc.terrain || '', V = V2.arnVerdict(C);
  const set = C.mvs.pop.filter(m => m && m.bp > 0); let three = set.slice(0, 3); if (dc.mv && !three.some(m => m.name === dc.mv) && C.mv) three = [...three.slice(0, 2), C.mv];
  const row = (k, L, cur, lab) => `<div class="arn-pills arn-${k}r" role="group" aria-label="${lab}">${L.map(([v, t]) => `<button type="button" ${k === 'wx' ? 'data-dcw' : 'data-dcterr'}="${v}" aria-pressed="${v === cur}"${v === '' ? ` aria-label="${t}: no ${lab.toLowerCase()}"` : ''}>${k === 'tr' && v ? `<i class="dot t-${v}" aria-hidden="true"></i>` : ''}${t}</button>`).join('')}</div>`;
  const sw = [['spread', 'Hits both foes'], ['screen', 'Screen up'], ['hh', 'Helping Hand'], ['fg', 'Friend Guard'], ['crit', 'Critical hit']];
  return `<div class="dc2 arn"><h1 class="vh">Damage Calculator · level 50 ${S.format === 'doubles' ? 'doubles' : 'singles'}</h1>${V2.battleToolsBar('calc')}
  <div class="arn-grid">
    <section class="arn-scene arn-w-${wx || 'clear'} arn-t-${tr || 'none'}" aria-label="The battle: ${E(V2.disp(C.A.p.n))} attacks ${E(V2.disp(C.D.p.n))}">${V2.ARN_ART}
      ${row('wx', V2.DC_WX, wx, 'Weather')}
      ${V2.arnPlate(C.D, 'd', 'dcD', C.r)}<div class="arn-spr d">${V2.arnImg(C.D.p.n)}</div>
      <div class="arn-spr a">${V2.arnImg(C.A.p.n)}</div>${V2.arnPlate(C.A, 'a', 'dcA')}
      ${V.v}${V.tag}<button type="button" class="arn-swap" id="dcSwap" aria-label="Swap attacker and defender"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h14m-4-4 4 4-4 4M20 16H6m4-4-4 4 4 4"/></svg></button>
      ${row('tr', V2.DC_TR, tr, 'Terrain')}
    </section>
    <div class="arn-side">
      <div class="arn-sw" role="group" aria-label="In play">${sw.map(([k, t]) => `<button type="button" data-dct="${k}" aria-pressed="${k === 'spread' ? !!C.spread : !!dc[k]}"><i aria-hidden="true"></i>${t}</button>`).join('')}</div>
      <div class="arn-mvs${(three.length + 1) % 2 ? ' odd' : ''}" role="group" aria-label="${E(V2.disp(C.A.p.n))}'s moves">${three.map(m => V2.arnMove(C, m)).join('')}${V2.arnAll(C)}</div>
      ${V2.arnSets(C)}
      ${V2.arnKB(C)}
      <div class="arn-links"><a class="np-link" href="#method">${W.how} ›</a>${V2.FB && V2.FB.ok ? `<a class="np-link" href="#feedback" data-fbmistake="calc" aria-label="Report a mistake in this hit">${W.report} ›</a>` : ''}${V2.arnNotes(C)}</div>
    </div>
  </div></div>`; }};

// taps: a move button, a KO Board tile, a stage step; the pickers' changes (today's ids go through today's handler first, then the page redraws)
document.addEventListener('click', e => { const s = e.target.closest && e.target.closest('.dc2 [data-arnst]');
  if (s) { const I = dc.inv[(s.dataset.arnst === 'a' ? 'atk:' + dc.a : 'def:' + dc.d)]; if (I) I.boost = Math.max(-2, Math.min(2, (+I.boost || 0) + +s.dataset.d)); V2.redraw(); return; }
  const t = e.target.closest && e.target.closest('.dc2 [data-dcmv],.dc2 [data-dckb]'); if (!t) {
    const b = e.target.closest && e.target.closest('.dc2 [data-dcw],.dc2 [data-dct],.dc2 [data-dcdir],.dc2 [data-dcterr],.dc2 #dcSwap'); if (b) setTimeout(() => V2.redraw(), 0); return; }
  if (t.dataset.dcmv) { if (dc.mv === t.dataset.dcmv) return; dc.mv = t.dataset.dcmv; dc.spread = null; }
  else if (dc.dir === 'theirs') { dc.a = t.dataset.dckb; dc.d = t.dataset.dckbo; dc.mv = t.dataset.dckbm; dc.spread = null; dc.wSet = dc.tSet = false; }
  else { dc.d = t.dataset.dckb; dc.a = t.dataset.dckbo; dc.mv = t.dataset.dckbm; dc.spread = null; dc.wSet = dc.tSet = false; }
  V2.redraw(); const sc = document.querySelector('.arn-scene'); if (t.dataset.dckb && sc && sc.getBoundingClientRect().top < 0) sc.scrollIntoView({block: 'start', behavior: V2.smooth()}); });
/* Q22 A (Sim, Nov 19): on mouse screens a KO tile's name and damage (its spoken label) show in a small label above it on hover or keyboard
   focus; one label for the page, outside the tiles (their cut corners clip anything inside). Escape or leaving hides it; a scroll moves it
   with its tile (focusing a tile off screen scrolls it into view). */
V2.dcTipOk = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
V2.dcTipHide = () => { const el = document.querySelector('body > .dc2-tip'); if (el) el.classList.remove('show'); };
V2.dcTipShow = t => { V2.dcTipT = t; let el = document.querySelector('body > .dc2-tip'); if (!el) { el = document.createElement('div'); el.className = 'dc2-tip'; el.setAttribute('aria-hidden', 'true'); document.body.append(el); }
  el.style.left = el.style.top = '0px'; el.textContent = t.dataset.dctip; el.classList.add('show'); /* measured at the left edge: its width is not squeezed by the last spot */ const r = t.getBoundingClientRect(), cw = document.documentElement.clientWidth, w = el.offsetWidth, h = el.offsetHeight, m = 8;
  let y = r.top - h - 6; if (y < m) y = r.bottom + 6;
  el.style.left = Math.round(Math.max(m, Math.min(cw - m - w, r.left + r.width / 2 - w / 2))) + 'px'; el.style.top = Math.round(y) + 'px'; };
const dcTipOf = e => e.target.closest && e.target.closest('.dc2 .dc2-kt[data-dctip]');
document.addEventListener('mouseover', e => { const t = dcTipOf(e); if (t && V2.dcTipOk()) V2.dcTipShow(t); });
document.addEventListener('mouseout', e => { const t = dcTipOf(e); if (t && !t.contains(e.relatedTarget) && !t.matches(':focus-visible')) V2.dcTipHide(); });
document.addEventListener('focusin', e => { const t = dcTipOf(e); if (t && V2.dcTipOk()) V2.dcTipShow(t); else V2.dcTipHide(); });
document.addEventListener('focusout', e => { if (dcTipOf(e)) V2.dcTipHide(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') V2.dcTipHide(); });
addEventListener('scroll', () => { const el = document.querySelector('body > .dc2-tip.show'); if (el) { if (V2.dcTipT && V2.dcTipT.isConnected) V2.dcTipShow(V2.dcTipT); else V2.dcTipHide(); } }, {passive: true}); addEventListener('hashchange', V2.dcTipHide);
document.addEventListener('change', e => { const t = e.target; if (!t.closest || !t.closest('.dc2')) return; setTimeout(() => V2.redraw(), 0); });
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('.dc2 [data-dcfold]')) return; V2.dcOpen = V2.dcOpen || {}; V2.dcOpen[d.dataset.dcfold] = d.open; }, true);
