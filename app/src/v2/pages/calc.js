// ---------- Damage Calc, "Their Side" (Nov 14; Sim's pick, brief docs/rebuild/calc/BRIEF.md, pictures beside it) ----------
// A card duel: both Pokemon are the info sheet's Card, the attacker's set moves are a hand of move cards, the move in play lies
// on the table, weather and terrain are field cards, the five conditions are tokens. The KO Board is "their side": on desktop
// it's laid out on the table around the defender; on phones it's its own section under the table. Every number is today's
// calc (39-damage-calc-speed.js calcData, calcResultNotes, calcNoResultText, damage, koText, bestHitOn, bulkToSurvive);
// the state is today's `dc`, and the pickers and set boxes keep today's ids so today's change handler updates it.
V2.DC_PAT = {Fighting: 'burst', Fire: 'burst', Electric: 'burst', Dragon: 'burst', Poison: 'drops', Water: 'drops', Grass: 'drops', Bug: 'drops', Fairy: 'drops',
  Normal: 'rings', Psychic: 'rings', Ghost: 'rings', Flying: 'rings', Ice: 'shards', Rock: 'shards', Steel: 'shards', Ground: 'shards', Dark: 'shards'};
V2.DC_WX = [['', 'None'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']];
V2.DC_TR = [['', 'None'], ['grassy', 'Grassy'], ['electric', 'Electric'], ['psychic', 'Psychic'], ['misty', 'Misty']];
V2.DC_WXC = {sun: 'var(--wx-sun)', rain: 'var(--ty-Water)', sand: 'var(--ty-Rock)', snow: 'var(--ty-Ice)', grassy: 'var(--ty-Grass)', electric: 'var(--ty-Electric)', psychic: 'var(--ty-Psychic)', misty: 'var(--ty-Fairy)'};
V2.dcPct = r => `${dmgP(100 * r.min / r.hp)}–${dmgP(100 * r.max / r.hp)}%`;
// one move's own result against the defender on the table (same sides and field as the move in play)
V2.dcHit = (C, m) => { if (!m) return null; try { const ord = dcOrder(C.A, C.D, m, dc.weather, dc.terrain);
  return damage({...C.opt, move: m, spread: m.name === dc.mv ? C.spread : !!m.spread, atkLast: !!(ord && ord.last)}); } catch (e) { return null; } };
V2.dcBar = (r, cls) => { if (!r || !r.hp) return ''; const lo = Math.min(100, 100 * r.min / r.hp), hi = Math.min(100, 100 * r.max / r.hp);
  return `<span class="dc2-bar${cls ? ' ' + cls : ''}" aria-hidden="true"><i class="lo" style="width:${lo.toFixed(1)}%"></i><i class="hi" style="left:${lo.toFixed(1)}%;width:${(hi - lo).toFixed(1)}%"></i></span>`; };

// a Pokemon on the table: the info sheet's Card with its role, a picker on its name, "nature, ability" and the spread tag
V2.dcPoke = (X, role, id) => { const E = V2.esc, n = X.p.n, d = V2.disp(n);
  const tag = X.src && X.src !== 'yours' ? `<span class="dc2-tag" title="${X.src === 'estimated' ? 'No spread data: points and nature are estimated' : 'Most common spread (or your nature on it); change it in the set below to match yours'}">${X.src === 'estimated' ? 'estimated' : 'assumed'} spread</span>` : '';
  const nameH = `<h2 class="u">${V2.nameHtml(d)}<i class="dc2-arw" aria-hidden="true"></i></h2>`;
  const sub = `<p class="dc2-na">${E(X.nat)}, ${E(X.ability)}</p>${tag}`;
  return `<div class="dc2-pc ${role.toLowerCase()}">${V2.msCard(X.p, n, nameH, sub)}<span class="dc2-role" aria-hidden="true">${role}</span><select class="dc2-pick" id="${id}" aria-label="${role}: ${E(d)}. Choose another Pokémon">${monOptions(n)}</select></div>`; };

// a move card: a small Card in its type colour with its own range, KO text and HP bar (the one in play lies on the table)
V2.dcMove = (C, m, play) => { const E = V2.esc, r = play ? C.r : V2.dcHit(C, m), t = (r && r.type) || m.type, pat = V2.DC_PAT[t] || 'rings';
  const none = r && r.max === 0, cat = m.cat === 2 ? 'Special' : m.cat === 1 ? 'Physical' : 'Status';
  const res = !r ? `<span class="ko">${E(m.cat ? 'Not calculated' : 'No damage')}</span>` : none ? `<span class="rg u">No effect</span><span class="ko">${E(r.fail ? r.fail + '.' : `${V2.disp(C.D.p.n)} is immune to ${r.type}.`)}</span>`
    : `<span class="rg u">${V2.dcPct(r)}</span><span class="ko">${E(koText(r))}</span>`;
  const body = `<span class="pw u" aria-hidden="true">${m.bp > 1 ? m.bp : ''}</span><span class="np-type" style="--tc:var(--ty-${t})">${E(t)}</span><b class="nm u">${E(m.name)}</b><small class="cat"><i class="${cat.toLowerCase()}" aria-hidden="true"></i>${cat}${m.bp > 1 ? ` · ${m.bp} power` : ''}</small><span class="out">${res}</span>${none ? '' : V2.dcBar(r)}`;
  if (play) return `<div class="dc2-mv play pat-${pat}${none ? ' none' : ''}" style="--tc:var(--ty-${t})"><span class="sheen" aria-hidden="true"></span>${body}</div>`;
  return `<button type="button" class="dc2-mv pat-${pat}${none ? ' none' : ''}" style="--tc:var(--ty-${t})" data-dcmv="${E(m.name)}" aria-label="Use ${E(m.name)}: ${r ? (none ? 'no effect' : V2.dcPct(r) + ', ' + koText(r)) : 'not calculated'}">${body}</button>`; };
// "Other moves": a face-down card; its picker holds every damaging move it learns (today's move box, id dcMv)
V2.dcOther = (C) => { const E = V2.esc, mv = C.mvs;
  return `<div class="dc2-mv back"><span class="pw u" aria-hidden="true">+</span><b class="nm u">Other moves</b><small class="cat">Every damaging move it learns</small><select class="dc2-pick" id="dcMv" aria-label="Move: ${E(dc.mv || 'none')}. Choose any move">${mv.pop.length ? `<optgroup label="Its set">${mv.pop.map(m => `<option${m.name === dc.mv ? ' selected' : ''}>${E(m.name)}</option>`).join('')}</optgroup>` : ''}<optgroup label="Other moves">${mv.rest.map(m => `<option${m.name === dc.mv ? ' selected' : ''}>${E(m.name)}</option>`).join('')}</optgroup></select></div>`; };
// weather / terrain field cards: label, value, five pips; a picker over the card
V2.dcField = (kind) => { const E = V2.esc, L = kind === 'w' ? V2.DC_WX : V2.DC_TR, cur = kind === 'w' ? dc.weather || '' : dc.terrain || '', i = Math.max(0, L.findIndex(x => x[0] === cur)), lab = kind === 'w' ? 'Weather' : 'Terrain';
  return `<div class="dc2-fc ${kind === 'w' ? 'wx' : 'tr'}${cur ? ' lit' : ''}" style="${cur ? `--fc:${V2.DC_WXC[cur]}` : ''}"><span class="lab">${lab}</span><b class="u">${E(L[i][1])}</b><span class="pips" aria-hidden="true">${L.map((x, j) => `<i${j === i ? ' class="on"' : ''}></i>`).join('')}</span>
    <select class="dc2-pick" data-dcfield="${kind}" aria-label="${lab}: ${E(L[i][1])}. Choose">${L.map(([k, t]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${t === 'None' ? `No ${lab.toLowerCase()}` : t}</option>`).join('')}</select></div>`; };
V2.dcTokens = (C) => `<div class="dc2-tok" role="group" aria-label="In play">${[['spread', 'Hits both foes'], ['screen', 'Screen up'], ['hh', 'Helping Hand'], ['fg', 'Friend Guard'], ['crit', 'Critical hit']].map(([k, t]) => `<button type="button" data-dct="${k}" aria-pressed="${k === 'spread' ? !!C.spread : !!dc[k]}">${t}</button>`).join('')}</div>`;

// the result: the range big, the move line, the KO text on a plate in the move's type colour, the damage bar, HP and effectiveness
V2.dcResult = (C) => { const E = V2.esc, r = C.r, mv = C.mv, t = (r && r.type) || (mv && mv.type) || 'Normal';
  const wx = {sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow'}[dc.weather], line = [mv ? mv.name : '', wx || '', C.spread ? 'Hits both foes' : ''].filter(Boolean).join(' · ');
  if (!mv) return `<section class="dc2-res empty"><p class="tm-sub">Pick a damaging move.</p></section>`;
  if (!r) return `<section class="dc2-res empty" style="--tc:var(--ty-${t})"><p class="dc2-line"><i aria-hidden="true"></i>${E(line)}</p><p class="tm-sub">${calcNoResultText(mv)}</p></section>`;
  if (r.max === 0) return `<section class="dc2-res" style="--tc:var(--ty-${t})"><b class="dc2-num u">No effect</b><div class="dc2-side"><p class="dc2-line"><i aria-hidden="true"></i>${E(line)}</p><p class="dc2-hp">${r.fail ? E(r.fail) + '.' : `${E(V2.disp(C.D.p.n))} is immune to ${E(r.type)}.`}</p></div></section>`;
  const eff = r.eff !== 1 ? `${E(r.type)} is ${r.eff >= 4 ? 'super effective twice over' : r.eff >= 2 ? 'super effective' : r.eff <= .25 ? 'resisted twice over' : 'resisted'}` : '';
  return `<section class="dc2-res" style="--tc:var(--ty-${t})" aria-live="polite"><b class="dc2-num u">${dmgP(100 * r.min / r.hp)}–${dmgP(100 * r.max / r.hp)}<small>%</small></b>
    <div class="dc2-side"><p class="dc2-line"><i aria-hidden="true"></i>${E(line)}</p><p class="dc2-ko"><b class="u">${E(koText(r))}</b><span class="dc2-hp">${r.min}–${r.max} of ${r.hp} HP${r.hits > 1 ? ` · ${r.hits} hits` : ''}</span></p>${V2.dcBar(r, 'big')}${eff ? `<p class="dc2-eff">${eff}</p>` : ''}</div></section>`; };

// the KO Board: each top-30 Pokemon with your best hit on it (or, switched, its best hit on your six), surest KO first
V2.dcKB = () => { const ms = members(), dir = dc.dir === 'theirs' ? 'theirs' : 'mine', key = [dir, S.format, metaVersion, ms.map(m => m.p.n + '/' + (m.item || '') + '/' + (m.ability || '') + '/' + (m.moves || []).map(x => x && x.name).join('+')).join(',')].join('|');
  if (V2._dcKB && V2._dcKB.key === key) return V2._dcKB.v;
  let thr = []; try { thr = metaThreats(30).map(x => x.p || x).filter(p => p && p.st); } catch (e) {}
  const myF = typeof sideField === 'function' ? sideField(ms) : {}, thF = t => typeof sideField === 'function' ? sideField([{p: t, ability: abilityOf({p: t})}]) : {};
  const v = thr.map(t => { let b = null;
    for (const m of ms) { const h = dir === 'mine' ? bestHitOn(m.p, m.moves, t, m, null, myF) : bestHitOn(t, popularMoves(t), m.p, null, m, thF(t));
      if (h && h.r && h.r.hp && (!b || h.r.max / h.r.hp > b.hi)) b = {hi: h.r.max / h.r.hp, lo: h.r.min / h.r.hp, mv: h.mv.name, other: m.p.n}; }
    return b && {n: t.n, ...b}; }).filter(Boolean).sort((a, b) => b.lo - a.lo || b.hi - a.hi);
  V2._dcKB = {key, v}; return v; };
V2.dcTile = (b, dir, onTable) => { const E = V2.esc, k = b.lo >= 1 ? 'ko' : b.hi >= 1 ? 'can' : 'sv', left = Math.max(0, 1 - b.hi), d = V2.disp(b.n), o = V2.disp(b.other);
  const lab = dir === 'mine' ? `${d}: your ${o}'s ${b.mv} does ${Math.round(100 * b.lo)}–${Math.round(100 * b.hi)}%` : `${d}'s ${b.mv} into your ${o}: ${Math.round(100 * b.lo)}–${Math.round(100 * b.hi)}%`;
  return `<button type="button" class="dc2-kt ${k}${onTable ? ' on' : ''}" data-dckb="${E(b.n)}" data-dckbo="${E(b.other)}" data-dckbm="${E(b.mv)}" aria-label="${E(lab)}${k === 'ko' ? ', down in one hit' : ''}. Put it on the table"${onTable ? ' aria-current="true"' : ''}>
    <span class="by" aria-hidden="true">${V2.mon(b.other, {iw: 24, bare: true})}</span>${V2.mon(b.n, {iw: 44, bare: true})}<span class="hp" aria-hidden="true"><i style="width:${(100 * left).toFixed(0)}%"></i><i class="r" style="left:${(100 * left).toFixed(0)}%;width:${(100 * Math.max(0, Math.min(1, b.hi) - Math.min(1, b.lo))).toFixed(0)}%"></i></span>${k === 'ko' ? '<span class="stamp u" aria-hidden="true">KO</span>' : ''}</button>`; };
V2.dcCounts = L => ({ko: L.filter(b => b.lo >= 1).length, can: L.filter(b => b.lo < 1 && b.hi >= 1).length, sv: L.filter(b => b.hi < 1).length});
V2.dcDir = () => `<div class="np-slide dc2-dir" role="group" aria-label="The KO Board shows" style="--n:2;--i:${dc.dir === 'theirs' ? 1 : 0}"><span class="thumb" aria-hidden="true"></span><button type="button" data-dcdir="mine" aria-pressed="${dc.dir !== 'theirs'}"><span>Your hits on them</span></button><button type="button" data-dcdir="theirs" aria-pressed="${dc.dir === 'theirs'}"><span>Their hits on you</span></button></div>`;
// phones (and below the desktop table): the board as its own section, in three groups under their counts
V2.dcBoard = (C) => { const E = V2.esc, dir = dc.dir === 'theirs' ? 'theirs' : 'mine', ms = C.ms;
  if (!ms.length) return `<section class="dc2-kb"><h2 class="u">The KO Board</h2><p class="tm-sub">Add Pokémon on My Team to see what your six do to the top 30.</p><a class="np-btn" href="#team">Go to My Team</a></section>`;
  const L = V2.dcKB(), c = V2.dcCounts(L), on = dir === 'mine' ? C.D.p.n : C.A.p.n;
  const grp = (k, t) => { const g = L.filter(b => (b.lo >= 1 ? 'ko' : b.hi >= 1 ? 'can' : 'sv') === k); return g.length ? `<div class="dc2-kg"><h3><b class="u">${g.length}</b> ${t}</h3><div class="dc2-kts">${g.map(b => V2.dcTile(b, dir, b.n === on)).join('')}</div></div>` : ''; };
  return `<section class="dc2-kb"><div class="dc2-kbh"><h2 class="u">The KO Board</h2>${V2.dcDir()}</div><p class="fine">${dir === 'mine' ? 'Your best hit on each of the top 30 (its usual set), surest KO first. The bar is the HP it has left. Tap one to put it on the table.' : 'Each of the top 30\'s best hit on your six (its usual set), surest KO first. The small picture is the one of yours it hits hardest; the bar is the HP yours has left. Tap one to put it on the table.'}</p>
    ${grp('ko', 'down in one hit')}${grp('can', 'can go down')}${grp('sv', 'survive')}</section>`; };
// desktop: the board's two wings beside the defender, 15 tiles each, with your counts as captions
V2.dcWings = (C) => { const dir = dc.dir === 'theirs' ? 'theirs' : 'mine'; if (!C.ms.length) return ['', ''];
  const L = V2.dcKB(), c = V2.dcCounts(L), on = dir === 'mine' ? C.D.p.n : C.A.p.n, h = Math.ceil(L.length / 2);
  return [`<div class="dc2-wing l"><p class="cap">The KO Board · ${c.ko} down in one hit</p><div class="dc2-kts">${L.slice(0, h).map(b => V2.dcTile(b, dir, b.n === on)).join('')}</div></div>`,
    `<div class="dc2-wing r"><p class="cap">${c.can} can go down · ${c.sv} survive</p><div class="dc2-kts">${L.slice(h).map(b => V2.dcTile(b, dir, b.n === on)).join('')}</div></div>`]; };

// under the scene: Details (notes, Not counted, Fewest points to always survive, the set readout, Report a mistake, How the calc
// works) and the two set folds with today's boxes
V2.dcDetails = (C) => { const E = V2.esc, {A, D, mv, r} = C; let notes = [], nc = [];
  if (mv && r && r.max > 0) { try { const x = calcResultNotes(A, D, mv, r, C.ord, C.ctx); notes = x.t; nc = x.nc; } catch (e) {} }
  let bulk = ''; if (r && r.max > 0) { try { const bs = bulkToSurvive(C.opt); if (bs) bulk = bs.none ? `${E(V2.disp(D.p.n))} can't survive this hit with any spread.` : `Fewest points to always survive: <b>${bs.hp} HP / ${bs.df} ${bs.stat}</b> (${bs.tot} total). ${r.max < r.hp ? 'This spread already survives.' : 'This spread does not.'}`; } catch (e) {} }
  const nt = [A.real || D.real ? 'spreads: most common on the Showdown ladder' : '', A.p.n === 'Aegislash' ? 'Aegislash attacks in Blade Forme (Atk/SpA 140)' : '', D.p.n === 'Aegislash' ? 'Aegislash takes hits in Shield Forme' : '', A.p.formNote || D.p.formNote ? 'Palafin in Hero Form' : '', dc.wSet || dc.tSet || !(dc.weather || dc.terrain) ? '' : 'field set by the Pokémon selected (change it above)'].filter(Boolean);
  const set = mv ? `<p class="dc2-set"><span>${E(A.p.d || A.p.n)} ${C.aShown} ${C.mvC && C.mvC.cat === 2 ? 'SpA' : 'Atk'} points ${E(A.nat)}${A.item ? ' ' + E(A.item) : ''}, ${E(dc.mv)}${C.spread ? ' (spread)' : ''}</span><span>vs ${E(D.p.d || D.p.n)} ${D.hpSp} HP / ${D.defSp} Def / ${D.spdSp} SpD ${E(D.nat)}${D.item ? ' ' + E(D.item) : ''}</span></p>${nt.length ? `<p class="fine">${E(nt.map(x => x[0].toUpperCase() + x.slice(1)).join('. '))}.</p>` : ''}` : '';
  const aSp = C.bp_ ? 'Defense points (Body Press)' : C.mvC && C.mvC.cat === 2 ? 'Sp. Atk points' : 'Attack points';
  const st = (b) => `stat stage ${b > 0 ? '+' : ''}${b}`;
  const aLine = `${C.aShown} ${C.bp_ ? 'Defense' : C.mvC && C.mvC.cat === 2 ? 'Sp. Atk' : 'Attack'} points · ${E(A.nat)} · ${E(A.item || 'No item')} · ${E(A.ability)} · ${st(A.boost)}`;
  const dLine = `${D.hpSp} HP / ${D.defSp} Def / ${D.spdSp} Sp. Def points · ${E(D.nat)} · ${E(D.item || 'No item')} · ${E(D.ability)} · ${st(D.boost)}`;
  const box = (lab, h) => `<label class="dc2-box"><span>${lab}</span>${h}</label>`, sel = C.sel, PTS = C.PTS;
  const aBoxes = `${box(aSp, sel('dcASp', PTS(C.aShown), String(C.aShown)))}${box('Nature', sel('dcANat', NATURES, A.nat))}${box('Item', C.itemSel('dcAIt', A))}${box('Ability', sel('dcAAb', A.p.a, A.ability))}${box(C.bp_ ? 'Defense stage (Body Press)' : 'Stat stage (Intimidate = −1)', sel('dcABo', C.boosts, String(A.boost)))}${A.ability === 'Supreme Overlord' || (mv && mv.name === 'Last Respects') ? box(`Allies fainted (${A.ability === 'Supreme Overlord' ? 'Supreme Overlord: +10% power each' : 'Last Respects: +50 power each'})`, sel('dcAFt', [0, 1, 2, 3].map(x => [String(x), String(x)]), String(Math.min(3, dc.fainted || 0)))) : ''}`;
  const dBoxes = `${box('HP points', sel('dcDHp', PTS(D.hpSp), String(D.hpSp)))}${box('Nature', sel('dcDNat', NATURES, D.nat))}${box('Def points', sel('dcDDf', PTS(D.defSp), String(D.defSp)))}${box('Sp. Def points', sel('dcDSd', PTS(D.spdSp), String(D.spdSp)))}${box('Item', C.itemSel('dcDIt', D))}${box('Ability', sel('dcDAb', D.p.a, D.ability))}${box('Stat stage', sel('dcDBo', C.boosts, String(D.boost)))}`;
  const fold = (k, who, line, boxes) => `<details class="dc2-fold" data-dcfold="${k}"${V2.dcOpen && V2.dcOpen[k] ? ' open' : ''}><summary><span><b>${E(who)}'s set</b><small>${line}</small></span><i aria-hidden="true">›</i></summary><div class="dc2-boxes">${boxes}</div></details>`;
  return `<section class="dc2-det"><div class="dc2-dl"><p class="np-eyebrow"><span>Details</span></p>
      ${notes.length ? `<p>${notes.join(' · ')}</p>` : ''}${nc.length ? `<p>Not counted: ${nc.join('; ')}.</p>` : ''}${bulk ? `<p>${bulk}</p>` : ''}${set}
      <p class="dc2-links"><a class="np-link" href="#feedback">Report a mistake</a><a class="np-link" href="#method">How the calc works →</a></p></div>
    <div class="dc2-dr">${fold('a', V2.disp(A.p.n), aLine, aBoxes)}${fold('d', V2.disp(D.p.n), dLine, dBoxes)}</div></section>`; };

V2.pages.calc = {place: 'battle', draw() { let C; try { C = calcData(); } catch (e) { console.error(e); return `<div class="dc2">${V2.battleToolsBar('calc')}<p class="tm-sub">The calc couldn't load. Try again in a moment.</p></div>`; }
  const set = C.mvs.pop.filter(m => m && m.bp > 0), hand = set.filter(m => m.name !== dc.mv).slice(0, 3), [wl, wr] = V2.dcWings(C);
  const play = C.mv ? V2.dcMove(C, C.mv, true) : `<div class="dc2-mv play empty"><b class="nm u">Pick a damaging move</b></div>`;
  return `<div class="dc2">${V2.battleToolsBar('calc')}<div class="dc2-top"><p class="np-eyebrow"><span><span class="dc2-bt">Battle · </span>Damage Calc · level 50 ${S.format === 'doubles' ? 'doubles' : 'singles'}</span></p><a class="np-link" href="#method">How the calc works →</a></div>
    ${V2.dcResult(C)}
    <section class="dc2-table" aria-label="The table"><div class="dc2-surface" aria-hidden="true"></div>
      <!-- keyboard and screen-reader order: attacker, its moves, Swap, defender, the field; every piece is placed on the table by the CSS grid -->
      ${V2.dcPoke(C.A, 'Attacker', 'dcA')}${play}<div class="dc2-hand" style="--hn:${hand.length + 1}" role="group" aria-label="${V2.esc(V2.disp(C.A.p.n))}'s moves">${hand.map(m => V2.dcMove(C, m)).join('')}${V2.dcOther(C)}</div>
      <button type="button" class="dc2-swap" id="dcSwap" aria-label="Swap attacker and defender"><i aria-hidden="true">⇄</i><span>Swap</span></button>${V2.dcPoke(C.D, 'Defender', 'dcD')}
      ${V2.dcField('w')}${V2.dcField('t')}${V2.dcTokens(C)}${wl}${wr}
    </section>${V2.dcBoard(C)}${V2.dcDetails(C)}</div>`; }};

// taps: a move card, a KO Board tile; the pickers' changes (today's ids go through today's handler first, then the page redraws)
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.dc2 [data-dcmv],.dc2 [data-dckb]'); if (!t) {
    const b = e.target.closest && e.target.closest('.dc2 [data-dcw],.dc2 [data-dct],.dc2 [data-dcdir],.dc2 [data-dcterr],.dc2 #dcSwap'); if (b) setTimeout(() => V2.redraw(), 0); return; }
  if (t.dataset.dcmv) { dc.mv = t.dataset.dcmv; dc.spread = null; }
  else if (dc.dir === 'theirs') { dc.a = t.dataset.dckb; dc.d = t.dataset.dckbo; dc.mv = t.dataset.dckbm; dc.spread = null; dc.wSet = dc.tSet = false; }
  else { dc.d = t.dataset.dckb; dc.a = t.dataset.dckbo; dc.mv = t.dataset.dckbm; dc.spread = null; dc.wSet = dc.tSet = false; }
  V2.redraw(); const tb = document.querySelector('.dc2-res'); if (t.dataset.dckb && tb && tb.getBoundingClientRect().top < 0) tb.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); });
document.addEventListener('change', e => { const t = e.target; if (!t.closest || !t.closest('.dc2')) return;
  if (t.dataset.dcfield) { if (t.dataset.dcfield === 'w') { dc.weather = t.value; dc.wSet = true; } else { dc.terrain = t.value; dc.tSet = true; } }
  setTimeout(() => V2.redraw(), 0); });
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('.dc2 [data-dcfold]')) return; V2.dcOpen = V2.dcOpen || {}; V2.dcOpen[d.dataset.dcfold] = d.open; }, true);
