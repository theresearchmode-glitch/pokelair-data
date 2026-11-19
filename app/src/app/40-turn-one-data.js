// ---------- turn 1: what your two leads should do into their likely leads ----------
// Built from each side's usual moves, real damage (39-damage-calc-speed.js) and likely speed.
// Fake Out the biggest threat, set speed control when they outspeed you, otherwise take the best KO or the best damage.
// R3 (Nov 11): the logic is turnOneData (plain data and plain text, no HTML); turnOnePlan only draws it. Today's page and the
// rebuild's Battle page both draw from turnOneData, so the plan is worked out in one place. Same output: experiments/same-battle.mjs.
function turnOneData(mine, theirs, r) {
  if (r.lead.length < 2 || theirs.length < 2) return null;
  // one Mega per side (Sim's design review #1, Nov 18: both opposing leads were shown as Megas): only one Pokémon a side can Mega
  // Evolve in a battle, so when both leads of a side are Megas the second is shown and calculated as its base form (same set)
  // the base form: its own entry, or the one form listed under that name ('Floette' is only listed as 'Floette-Eternal')
  const baseP = p => { if (!p || !p.m || typeof byName !== 'object') return null; return byName.get(p.b) || [...byName.values()].find(q => q && !q.m && String(q.n).startsWith(p.b + '-')) || null; };
  // the base form's Ability: a real open team sheet's, when it is one the base form can have (a Mega's sheet lists the pre-Mega
  // Ability: Mega Charizard Y's 'Solar Power', Mega Mawile's 'Intimidate'), else the form's usual one (mechanics check, Nov 19)
  const baseAb = (x, bp) => { const o = x && (x._orig || x), a = o && o.real && o.sheetAb, c = a && typeof canonAbility === 'function' ? canonAbility(a, bp) : a;
    if (c && (bp.a || []).includes(c)) return c; try { return metaAbility(bp) || ''; } catch (e) { return ''; } };
  // the copy is the base form in full: its types and its own Ability (abilityOf falls back to the form's usual one), not a Mega (review, Nov 19)
  const baseOf = x => { const bp = baseP(x && x.p); return bp ? {...x, p: bp, d: bp.d, types: bp.t, ability: baseAb(x, bp), mega: 0, _orig: x._orig || x} : x; };
  // keep the first Mega; if the other can't be shown as its base form, keep that one as the Mega instead
  const oneMega = arr => { const mi = arr.map((x, i) => x && x.p && x.p.m ? i : -1).filter(i => i >= 0); if (mi.length < 2) return arr;
    const keep = baseP(arr[mi[1]].p) ? mi[0] : baseP(arr[mi[0]].p) ? mi[1] : -1; if (keep < 0) return arr;
    return arr.map((x, i) => mi.includes(i) && i !== keep ? baseOf(x) : x); };
  const opp = oneMega(r.B ? likelyLead(theirs, r.B) : theirs.slice(0, 2));
  const L0 = r.lead.map(i => mine[i]), L = oneMega(L0), names = m => new Set(memberMoves(m).moves.map(x => x.name));
  // your leads use their real items and spreads; the weather/terrain the four leads set is in play for every hit
  const mineM = m => { const o = m && m._orig || m; return L0.includes(o) ? o : L.includes(o) ? o : null; }; // _orig: the pre-Mega stand-in turnOneField passes
  // their lead from a real open team sheet (withSheet: real, item, Ability) is calculated with its sheet item and Ability, both
  // ways and for its Speed (Choice Scarf, Iron Ball); its spread is unknown, so the usual spread stays (sideDefaults). heldItem keeps
  // a Mega Stone held by a base-form copy (sideDefaults drops a stone from item). Without a sheet: null, so the calc keeps today's
  // most common item and Ability for that Pokémon.
  const theirM = m => { const o = m && m._orig || m, it = (m && m.item) || (o && o.item) || ''; return o && o.real && it && !mineM(m) ? {ability: m.ability, item: it, heldItem: it} : null; };
  const calcM = m => mineM(m) || theirM(m);
  const spe = m => { const s = likelySpeed(m.p, calcM(m)); return s.scarf ? Math.floor(s.v * 1.5) : s.v; };
  // a Cloud Nine / Air Lock lead switches the weather's effects off for every hit and speed (F0.wx)
  const F0 = typeof turnOneField === 'function' ? turnOneField([...L, ...opp], spe) : {}, F = {...F0, weather: F0.wx != null ? F0.wx : F0.weather};
  // priority blockers (review, Nov 19): Armor Tail, Queenly Majesty and Dazzling on ANY Pokémon of the target's side make priority
  // moves into that side fail (damage() only checks the target's own Ability), unless the user has Mold Breaker (Teravolt,
  // Turboblaze); Psychic Terrain blocks them into a grounded target whatever the Abilities. Such a move is left out, so the next
  // best is planned (for both sides' hits)
  const PRIO_BLOCK = ['Armor Tail', 'Queenly Majesty', 'Dazzling'], MOLD = ['Mold Breaker', 'Teravolt', 'Turboblaze'];
  const prioBlocked = (a, d) => { const side = L.includes(d) ? L : opp; return (!MOLD.includes(abilityOf(a)) && side.some(y => PRIO_BLOCK.includes(abilityOf(y)))) || (F.terrain === 'psychic' && grounded(d)); };
  // Intimidate (Nov 19 review: Mega Tyranitar's Knock Off 'KOs' Indeedee at −1 Attack too): it works when the leads come out,
  // before any move, both sides. Each opposing Intimidate lead lowers Attack by 1, unless the Ability blocks it (55-threats.js
  // NO_INTIM: Clear Body, Hyper Cutter, White Smoke, Full Metal Body, Inner Focus, Oblivious, Own Tempo, Scrappy; Mirror Armor sends
  // it back to the Intimidate user) or Flower Veil guards a Grass type; Defiant (−1 then +2), Guard Dog and Contrary end at +1
  // Attack, Competitive at −1 Attack and +2 Sp. Atk; White Herb undoes one drop. A Mega is still its base form when the leads come
  // out, so its base form's Ability counts then (a real open team sheet's, else its usual one) (Mega Gyarados: Intimidate; Mega Metagross: Clear Body); a Mega whose own
  // Ability is Intimidate (Mega Manectric) uses it when it Mega Evolves, before any move. Rattled (Gen 8 on; Showdown's rattled:
  // onAfterBoost) gives +1 Speed for each Intimidate that lowered its Attack, so it counts in turn one's order (speF).
  const INTIM_NO = ['Clear Body', 'Hyper Cutter', 'White Smoke', 'Full Metal Body', 'Inner Focus', 'Oblivious', 'Own Tempo', 'Scrappy', 'Mirror Armor'], INTIM_UP = ['Defiant', 'Guard Dog', 'Contrary'];
  const entryAb = x => { const bp = x && x.p && x.p.m ? baseP(x.p) : null; if (bp) { const a = baseAb(x, bp); if (a) return a; } return abilityOf(x); };
  const intimOf = y => entryAb(y) === 'Intimidate' || abilityOf(y) === 'Intimidate', sideOfX = x => L.includes(x) ? L : opp, foesOf = x => L.includes(x) ? opp : L;
  const stage = new Map([...L, ...opp].map(x => { const n = foesOf(x).filter(intimOf).length, ab = entryAb(x), it = sideDefaults(x.p, 'atk', calcM(x)).item; let atk = 0, spa = 0, spe = 0;
    if (n && !INTIM_NO.includes(ab) && !((x.types || x.p.t || []).includes('Grass') && sideOfX(x).some(y => entryAb(y) === 'Flower Veil'))) {
      if (INTIM_UP.includes(ab)) atk = n; else { atk = -n; if (ab === 'Competitive') spa = 2 * n; if (ab === 'Rattled') spe = n; if (it === 'White Herb') atk += 1; } }
    /* Mirror Armor sends the drop back to the Intimidate user (unless that user's own Ability blocks it) */
    if (intimOf(x) && !INTIM_NO.includes(ab) && !INTIM_UP.includes(ab)) atk -= foesOf(x).filter(y => entryAb(y) === 'Mirror Armor').length;
    return [x, {atk: Math.max(-6, Math.min(6, atk)), spa: Math.min(6, spa), spe: Math.min(6, spe)}]; }));
  const stOf = x => stage.get(x) || {atk: 0, spa: 0, spe: 0};
  // the stage a move hits with, in plain words for its line: 'at −1 Attack', 'at +2 Sp. Atk' (Body Press: Defense, untouched; Foul Play: the target's Attack)
  /* d: the target; Unaware (the target's) ignores the stage, as the calc does, so no note then (Nov 19 review); unless the attacker
     has Mold Breaker, Teravolt or Turboblaze, which ignore Unaware (the calc clears the target's Ability then; independent review) */
  const stageNote = (x, mv, d) => { if (!mv || ['Body Press', 'Foul Play'].includes(mv.name) || !mv.cat || (d && abilityOf(d) === 'Unaware' && !MOLD.includes(abilityOf(x)))) return ''; const s = stOf(x), v = mv.cat === 1 ? s.atk : s.spa; return v ? `at ${v > 0 ? '+' : '−'}${Math.abs(v)} ${mv.cat === 1 ? 'Attack' : 'Sp. Atk'}` : ''; };
  const hitNotes = (x, h, d) => [hitNote(h), stageNote(x, h && h.mv, d)].filter(Boolean).join(', ');
  const hitOn = (a, moves, d) => bestHitOn(a.p, prioBlocked(a, d) ? (moves || []).filter(mv => !mv || movePrio(mv, abilityOf(a), {terrain: F.terrain, grounded: grounded(a)}) <= 0) : moves, d.p, calcM(a), calcM(d), {...F, aStage: stOf(a), dAtkStage: stOf(d).atk});
  // speed in that field: Chlorophyll / Swift Swim / Sand Rush / Slush Rush double in their weather
  // a Speed stage (Rattled after Intimidate) multiplies first, as the game applies stages before other modifiers: +1 is ×1.5, +2 ×2
  const speF = x => { const k = stOf(x).spe || 0; return (k ? Math.floor(spe(x) * (2 + k) / 2) : spe(x)) * (typeof speedMul === 'function' ? speedMul(abilityOf(x), F.weather) : 1); };
  // their threat to each of my leads: the hardest single hit
  const danger = opp.map(o => { let worst = null; for (const m of L) { const h = hitOn(o, o.moves || [], m); if (h && (!worst || h.r.max / h.r.hp > worst.pct)) worst = {pct: h.r.max / h.r.hp, h, on: m}; } return {o, worst}; })
    .sort((a, b) => (b.worst ? b.worst.pct : 0) - (a.worst ? a.worst.pct : 0));
  const fast = opp.filter(o => L.some(m => speF(o) > speF(m))).length;
  // Fake Out's rules (design review #1; Nov 19 review): it fails into a priority blocker on the target's side (Armor Tail, Queenly
  // Majesty, Dazzling) and against a grounded target in Psychic Terrain; it has no effect on a Ghost type unless the user has Scrappy;
  // Inner Focus, Shield Dust and Covert Cloak take the hit but don't flinch. Mold Breaker (Teravolt, Turboblaze) ignores the
  // Abilities. foFx: 'ok' (flinches), 'none' (fails / no effect), 'hit' (takes the hit, no flinch).
  const itemOf = x => x.item || (x._orig && x._orig.item) || '';
  const foFx = (u, t, tSide) => { const mold = MOLD.includes(abilityOf(u));
    if ((!mold && tSide.some(y => PRIO_BLOCK.includes(abilityOf(y)))) || (F.terrain === 'psychic' && grounded(t))) return 'none';
    if ((t.types || t.p.t || []).includes('Ghost') && abilityOf(u) !== 'Scrappy') return 'none';
    if ((!mold && ['Inner Focus', 'Shield Dust'].includes(abilityOf(t))) || itemOf(t) === 'Covert Cloak') return 'hit';
    return 'ok'; };
  // their Fake Out is only planned when it can flinch one of your leads (second review, Nov 19: with your Farigiraf's Armor Tail up
  // they just attack, so their turn-one KO stays a turn-one KO)
  // Their Fake Out targets are decided up front, fastest first: each aims at your lead that threatens them most among those it can
  // flinch and no other Fake Out has taken; one with no such target attacks instead.
  const threatOf = m => { let v = 0; for (const o of opp) { const h = hitOn(m, memberMoves(m).moves, o); if (h) v = Math.max(v, h.r.max / h.r.hp); } return v; };
  const myByThreat = L.slice().sort((a, b) => threatOf(b) - threatOf(a)), theirFOT = new Map();
  // (third check, Nov 19) once your plan is known, a lead that moves before their Fake Out user (Protect at +4, or a faster Fake Out
  // of your own at +3) is skipped: it has already moved, so their Fake Out goes to your other lead (pickFOT below, after the plan)
  const pickFOT = (skip, stopped) => { theirFOT.clear(); for (const o of opp.filter(o => (o.moves || []).some(x => x && x.name === 'Fake Out')).sort((a, b) => (stopped ? stopped(a) - stopped(b) : 0) || speF(b) - speF(a))) {
    const t = myByThreat.find(t => ![...theirFOT.values()].includes(t) && foFx(o, t, L) === 'ok' && !skip(t, o)); if (t) theirFOT.set(o, t); } };
  pickFOT(() => false);
  // their bracket: Fake Out +3 when they use it; otherwise their likely attack's own priority (Extreme Speed +2, Sucker Punch +1,
  // Grassy Glide +1 in Grassy Terrain, Gale Wings…), as yours is (review, Nov 19: it was 0 for every attack)
  const oPr = o => { if (theirFOT.has(o)) return 3; const d = danger.find(x => x.o === o); return d && d.worst ? movePrio(d.worst.h.mv, abilityOf(o), {terrain: F.terrain, grounded: grounded(o)}) : 0; };
  let lines = [], used = new Set(); const mvOf = (m, n) => memberMoves(m).moves.find(x => x && x.name === n) || mvByName.get(n);
  // each action carries its priority bracket (Fake Out +3, Prankster Tailwind +1, Trick Room −7…) for the turn order below
  const pr = (m, n) => movePrio(mvOf(m, n), m.ability, {terrain: F.terrain, grounded: grounded(m)});
  const planLines = () => { lines = []; used = new Set();
  for (const m of L) { const mv = names(m), partner = L.find(x => x !== m);
    /* aim only where it flinches, and never at a faster Fake Out user that will already have moved (second review, Nov 19) */
    const fd = mv.has('Fake Out') && !used.has('fake') ? danger.find(d => foFx(m, d.o, opp) === 'ok' && !(theirFOT.has(d.o) && speF(d.o) > speF(m))) : null;
    if (fd) { used.add('fake'); lines.push([m, `Fake Out ${fd.o.d}`, fd.worst ? `stops its ${fd.worst.h.mv.name}, up to ${dmgP(100 * fd.worst.pct)}% to your ${fd.worst.on.d}` /* 'its': the target, named above it on the card */ : fd === danger[0] ? 'their biggest threat' : 'it can be flinched', pr(m, 'Fake Out'), fd.o]); continue; }
    if (mv.has('Tailwind') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Tailwind', `${fast === 1 ? '1 of their leads outspeeds' : fast + ' of their leads outspeed'} your side`, pr(m, 'Tailwind')]); continue; }
    if (mv.has('Trick Room') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Trick Room', 'they are faster. The order flips from turn 2' /* its −7 shows beside its Speed */, pr(m, 'Trick Room')]); continue; }
    // attack: prefer a KO (not one Focus Sash or Sturdy survives), then the most damage; spread moves count both targets; a move that charges first or hits your own
    // partner says so
    // never a move that can KO your own partner (design review #1: Earthquake was planned while it does up to 161% to your Sneasler):
    // such a move is dropped and the next best is planned; one that only dents the partner stays, with its note
    let best = null, pool = memberMoves(m).moves;
    for (let tries = 0; tries < 6; tries++) { best = null;
      for (const o of opp) { const h = hitOn(m, pool, o); if (!h) continue; const pct = h.r.max / h.r.hp, ko = h.r.min >= h.r.hp && !h.charge && !h.r.sash;
        const hitsAlly = h.mv.ally && allyHit(h.mv, partner);
        const val = (ko ? 2 : 0) + pct * (h.charge ? .3 : 1) * (h.acc / 100) + (h.mv.spread ? .3 : 0) - (hitsAlly ? .4 : 0); if (!best || val > best.val) best = {o, h, pct, ko, val, hitsAlly}; }
      if (best && best.hitsAlly) { const r2 = hitOn(m, [best.h.mv], partner); if (r2 && r2.r.max >= r2.r.hp) { const bad = best.h.mv.name; pool = pool.filter(x => x && x.name !== bad); best = null; continue; } }
      break; }
    // [4] is a Fake Out's target; [5] the attack itself (target, hit, partner hit), read by the KO pass after the turn order
    if (best) lines.push([m, `${best.h.mv.name} ${best.h.mv.spread ? '(hits both)' : 'into ' + best.o.d}`, hitWhy(m, best.h, best.o, best.hitsAlly), pr(m, best.h.mv.name), null, {o: best.o, h: best.h, hitsAlly: best.hitsAlly}]);
    else lines.push([m, 'Protect or switch', 'no good attack into these leads', 4]); } };
  // one wording for an attack's why (the plan line and a re-aimed one): 'KOs' when the lowest roll KOs, else up to N% and the KO odds
  // (Nov 19 wording pass) a spread move names its foe ('KOs their X', 'up to N% of their X's HP'); the partner it also hits is a
  // second short sentence. Never 'KOs' when Focus Sash or Sturdy holds it at 1 HP (h.r.sash; damage() clears it for multi-hit moves,
  // which break the Sash): 'up to N% of its HP, Sash holds' (koShort) instead
  function hitWhy(m, h, o, hitsAlly) { const partner = L.find(x => x !== m), nt = hitNotes(m, h, o), ko = h.r.min >= h.r.hp && !h.charge && !h.r.sash;
    const ally = hitsAlly ? (() => { const r2 = hitOn(m, [h.mv], partner); return `. Also hits your ${partner.d}${r2 ? ' (up to ' + dmgP(100 * r2.r.max / r2.r.hp) + '%)' : ''}`; })() : '';
    return `${ko ? 'KOs' + (h.mv.spread ? ' their ' + o.d : '') : 'up to ' + dmgP(100 * h.r.max / h.r.hp) + '% of ' + (h.mv.spread ? `their ${o.d}'s` : 'its') + ' HP, ' + koShort(h.r)}${nt ? ' (' + nt + ')' : ''}${ally}`; }
  planLines();
  // their Fake Out targets again, now skipping your leads that move before each user, and letting a user your faster Fake Out
  // surely flinches choose last (it takes no target from its partner); re-plan if that changed them (at most 3 rounds)
  const myPr = t => { const ln = lines.find(l => l[0] === t); return ln ? ln[3] || 0 : 0; }, fotKey = () => [...theirFOT].map(([o, t]) => opp.indexOf(o) + ':' + L.indexOf(t)).join();
  for (let k = 0; k < 3; k++) { const was = fotKey(); pickFOT((t, o) => myPr(t) > 3 || (myPr(t) === 3 && speF(t) > speF(o)), o => +lines.some(l => l[4] === o && speF(l[0]) > speF(o) && !opp.some(u => u !== o && (u.moves || []).some(x => x && x.name === 'Fake Out') && speF(u) >= speF(l[0])))); if (fotKey() === was) break; planLines(); }
  // turn order: priority bracket first (your planned move; theirs: Fake Out if they carry it), then Speed inside a bracket
  // (Stall always moves last inside its bracket)
  // Tailwind re-orders the rest of the turn (review, Nov 19): from Gen 8 on (Showdown too), the queue is re-sorted by current Speed
  // after every action, so once a side's Tailwind is up, its partner that hasn't moved yet moves at double Speed this same turn.
  // Pokémon Champions follows Gen 9's rules; this re-sort is assumed there, not confirmed in Champions. (Trick Room: −7, so it only
  // flips the order from next turn.) Ties are found as each mover is picked, at the Speed it moves with.
  const cand = [...L, ...opp].map(x => { const me = L.includes(x), ln = me ? lines.find(l => l[0] === x) : null; return {x, s: speF(x), me, p: me ? (ln ? ln[3] || 0 : 0) : oPr(x), st: abilityOf(x) === 'Stall' ? 1 : 0, act: me && ln ? ln[1] : ''}; });
  const twUp = {true: false, false: false}, order = [];
  const cmp = (a, b) => b.p - a.p || a.st - b.st || b.es - a.es;
  while (cand.length) { cand.forEach(c => { c.tw = twUp[c.me]; c.es = c.s * (c.tw ? 2 : 1); }); cand.sort(cmp); const c = cand.shift();
    const n = cand.find(y => y.me !== c.me && y.p === c.p && y.st === c.st && y.es === c.es); if (n) c.tie = n.x;
    order.push(c); if (c.act === 'Tailwind') twUp[c.me] = true; }
  // their Fake Out line names its target from the start, so a flinched user's plan says whom it meant (third check, Nov 19)
  const theirAct = o => { const d = danger.find(x => x.o === o); if (!d || !d.worst) return null; const fo = theirFOT.has(o);
    return fo ? [`Fake Out ${theirFOT.get(o).d}`, ''] : [`${d.worst.h.mv.name} into ${d.worst.on.d}`, `up to ${dmgP(100 * d.worst.pct)}% of its HP, ${koShort(d.worst.h.r)}${hitNotes(o, d.worst.h, d.worst.on) ? ' (' + hitNotes(o, d.worst.h, d.worst.on) + ')' : ''}`]; }; /* hitNotes: '90% to hit', 'at −1 Attack' as yours says (Nov 19 review) */ /* one wording for both lines (audit Nov 15) */
  // the beats, in move order: who moves, their Speed and bracket, the action and one short why (all plain text)
  // Why lines (Nov 19 wording pass, after a visual check found 10-line notes): each beat's why is its main fact, and the notes that
  // gather on it (_n: rank r, lower first; k: kind) are folded at the end into at most one short note, plus at most one short tag.
  // Every other Pokémon named in a note says 'your' or 'their' (mirrors have the same name on both sides), and notes never say 'it'
  // (in a main fact 'its' is the target). Ranks: 0 the move can't work / its target is gone; 1 a risk to this move (a Fake Out or a KO
  // first, a Fake Out speed tie); 2 the target changed; 3 double Speed from Tailwind; 4 a speed tie.
  const sideOf = x => L.includes(x) ? 'your' : 'their', nm = x => `${sideOf(x)} ${x.d}`;
  const beats = order.map(o => { const ln = o.me ? lines.find(l => l[0] === o.x) : null, th = o.me ? null : theirAct(o.x);
    const why = ln ? ln[2] : th ? th[1] : 'no damaging move found into your leads', tw = o.me ? 'your' : 'their';
    return {x: o.x, me: o.me, speed: o.es, prio: o.p, act: ln ? ln[1] : th ? th[0] : theirFOT.has(o.x) ? `Fake Out ${theirFOT.get(o.x).d}` : 'Unknown move', ...(o.tw ? {tw: 1} : {}), _tie: o.tie, why, _h: ln ? (ln[5] ? ln[5].h : null) : th && !theirFOT.has(o.x) ? danger.find(x => x.o === o.x).worst.h : null,
      _n: o.tw ? [{r: 3, s: `moves at double Speed: ${tw} Tailwind is up`, tag: `Double Speed (${tw} Tailwind)`}] /* Gen 9 turn order (the queue re-sorts after each move); assumed for Champions, not confirmed in the game */ : []}; });
  const note = (tb, n) => { tb._n.push(n); };
  // a speed tie between the two sides in one bracket: either may move first
  beats.forEach(b => { const n = b._tie ? beats.find(y => y.x === b._tie) : null; delete b._tie; if (n && !(/^Fake Out\b/.test(b.act) && /^Fake Out\b/.test(n.act))) note(b, {r: 4, s: `speed tie with ${nm(n.x)}: either can go first`, tag: 'Speed tie'}); });
  // Fake Out's flinch (design review #1: flinched Pokémon still acted, two Fake Outs and Garchomp still attacked). Fake Out works on
  // turn one only; the target can't move this turn if it hasn't moved yet, unless Inner Focus, Shield Dust, Covert Cloak, a Ghost
  // type, or a priority blocker on its side (Armor Tail, Queenly Majesty, Dazzling; Psychic Terrain for grounded targets) stops it.
  // Your Fake Out aims at their biggest threat (above); theirs is assumed to aim at your lead that threatens them most (their likely
  // target, said as such), a second Fake Out at your other lead.
  const flinched = new Map(), done = new Set();
  // Only a sure flinch (your Fake Out, moving first, no speed tie) replaces a move with 'Flinches'; a flinch that depends on their
  // choice or a speed tie keeps the planned move and says so, so the plan (and Home's plan board) still shows what to click.
  const tieOf = (a, b) => a && b && a.prio === b.prio && a.speed === b.speed;
  // (third check, Nov 19: your own Fake Out is 'not sure' when your user may be flinched first; 'their likely target' is their wording)
  // (Nov 19 wording pass) 'May not move: their Rillaboom's Fake Out'; 'may' carries what isn't sure (their choice of target, your Fake
  // Out user being flinched first)
  const mayNote = (tb, f) => { tb.flinch = 'likely'; note(tb, {r: 1, k: 'flinch', u: f.u, tie: f.tie, s: `may not move: ${nm(f.u)}'s Fake Out`, ...(f.tie ? {sfx: ' (speed tie)'} : {})}); }; /* sfx: shown while the line has room ('may' says it already) */
  // KOs inside turn one (Nov 19: a Pokémon KO'd earlier in the turn still showed its own move). A sure KO is your attack whose
  // lowest roll KOs, 100% to hit, not charging first, with no Focus Sash / Sturdy holding on, from a lead that isn't at risk of
  // being flinched or KO'd first. Its target, if it hasn't moved yet (no speed tie), is 'Fainted' (its plan kept as plan, as a sure
  // flinch is), and later attacks into it go to the other foe (as in the game, a move aimed at a fainted foe goes to the other
  // one; here the best move of the same priority into it is planned), or say that no foe is left. A KO that only might happen
  // (OHKO 6%, 90% to hit, a speed tie) is a 'may KO it first' note on its target. Their KO on your lead is a guess (their likely
  // move, as their Fake Out is): a note on your lead's beat, and your lead's own KO is then no longer sure.
  const down = new Map(), fainted = new Map(), at = x => beats.findIndex(y => y.x === x);
  const sureKO = h => !!(h && h.r && h.r.hp && h.r.min >= h.r.hp && !h.charge && h.acc >= 100 && !h.r.sash);
  // the best move into the one foe left, in the same priority bracket (the turn order is already set), weighed as the plan weighs
  // moves (bestHitOn: accuracy, charging, recharging); no move that also hits your partner; one foe left: no spread reduction
  const reAim = (m, ln, o2) => { const pool = memberMoves(m).moves.filter(mv => mv && mv.bp && !mv.ally && pr(m, mv.name) === ln[3]).map(mv => mv.spread ? {...mv, spread: false} : mv);
    const h = pool.length ? hitOn(m, pool, o2) : null; return h && h.r && h.r.hp && h.r.max ? h : null; };
  // (Nov 19 review: 80 of 104 'Fainted' targets carry Protect, 20 have a Follow Me / Rage Powder partner) a sure KO is only
  // 'Fainted' when nothing of theirs can stop it: the target has no Protect-family move, no lead of theirs has Wide Guard (a spread
  // move) or can redirect it (Follow Me; Rage Powder, which a Grass type or Overcoat ignores; not a spread move, not Stalwart,
  // Propeller Tail or Snipe Shot; not a partner KO'd or surely flinched first). Otherwise the target keeps its move with a 'may be
  // KO'd first ... (if no Protect)' note. guardOf names what could stop it ('' when nothing can)
  const PROTECT = ['Protect', 'Detect', 'Spiky Shield', "King's Shield", 'Baneful Bunker', 'Silk Trap', 'Burning Bulwark', 'Obstruct'];
  const movesOf = y => (y.moves || []).filter(Boolean).map(x => x.name || x);
  // (independent review, Nov 19) Quick Guard and Wide Guard (+3) can't go up when their user is gone before a +3 move: KO'd earlier
  // by a move above +3, or at +3 by a faster Pokémon; or surely flinched by a Fake Out (+3) from a faster Pokémon. A user KO'd or
  // flinched later in the order (a sure flinch at a lower bracket than +3 only beats its planned move) could still have used it first
  const gone3 = y => { const d = down.get(y), f = flinched.get(y), first = (u, p) => p > 3 || (p === 3 && speF(u) > speF(y));
    return !!((d && d.u && first(d.u, d.p)) || (f && f.sure && first(f.u, 3))); };
  const guardOf = (o, a, mv) => { const g = [], pm = movesOf(o).find(n => PROTECT.includes(n)); if (pm) g.push(pm);
    /* Quick Guard blocks a priority move (Nov 19 review) */
    if (movePrio(mv, abilityOf(a), {terrain: F.terrain, grounded: grounded(a)}) > 0 && opp.some(y => !gone3(y) && movesOf(y).includes('Quick Guard'))) g.push('Quick Guard');
    if (mv.spread) { if (opp.some(y => !gone3(y) && movesOf(y).includes('Wide Guard'))) g.push('Wide Guard'); }
    else if (!['Stalwart', 'Propeller Tail'].includes(abilityOf(a)) && mv.name !== 'Snipe Shot') {
      const rp = !(a.types || a.p.t || []).includes('Grass') && abilityOf(a) !== 'Overcoat';
      const rd = opp.find(y => y !== o && !down.has(y) && !(flinched.get(y) || {}).sure && movesOf(y).some(n => n === 'Follow Me' || (n === 'Rage Powder' && rp)));
      if (rd) g.push(movesOf(rd).includes('Follow Me') ? 'Follow Me' : 'Rage Powder'); }
    return g.join(' or '); };
  // their likely attack that can KO its target on some roll (the hit, its target), or null; the same test their koPass uses
  const theirKOHit = y => { const d = danger.find(x => x.o === y.x), h = d && d.worst && d.worst.h, t = d && d.worst && d.worst.on;
    return h && !theirFOT.has(y.x) && y.act === `${h.mv.name} into ${t.d}` && h.r && h.r.hp && !h.charge && !h.r.sash && h.r.max >= h.r.hp ? {h, t} : null; };
  // (independent review, Nov 19) a foe in a speed tie with your lead that can KO it may go first: your lead's KO is then not sure.
  // Worked out when your lead moves (the tied foe comes later in the list), so its target is never 'Fainted' while your lead's own
  // line says 'may be KO'd first ... (speed tie)'. A tied foe already KO'd or surely flinched can't
  const tiedKORisk = b => beats.some(y => !y.me && tieOf(y, b) && !done.has(y.x) && !down.has(y.x) && !(flinched.get(y.x) || {}).sure && (theirKOHit(y) || {}).t === b.x);
  const koPass = b => { const i = at(b.x);
    if (!b.me) { const k = theirKOHit(b), h = k && k.h, t = k && k.t;
      if (!k || ((at(t) <= i || done.has(t)) && !tieOf(beats[at(t)], b))) return; /* in a speed tie theirs may go first (Nov 19 review) */
      /* a KO that only might happen (some rolls, under 100% to hit) is a risk too (Nov 19 review): the note says the chance, as
         yours does, and your lead's own KO is then no longer sure */
      const tb = beats[at(t)], k1 = (h.r.rolls || [h.r.min, h.r.max]).filter(v => v >= h.r.hp).length / (h.r.rolls || [1, 1]).length;
      const why = [k1 < 1 ? koShort(h.r) : '', h.acc < 100 ? h.acc + '% to hit' : '', tieOf(tb, b) ? 'speed tie' : ''].filter(Boolean).join(', ');
      tb.koRisk = 1; note(tb, {r: 1, k: 'ko', u: b.x, s: `may be KO'd first by their ${b.x.d}${why ? ' (' + why + ')' : ''}`}); return; }
    const ln = lines.find(l => l[0] === b.x), A = ln && ln[5]; if (!A || b.act !== ln[1]) return;
    if (tiedKORisk(b)) b.koRisk = 1; /* its note comes from the tied foe's own pass */
    let hits = A.h.mv.spread ? opp.map(o => ({o, h: o === A.o ? A.h : hitOn(b.x, [A.h.mv], o)})) : [{o: A.o, h: A.h}];
    const gone = hits.filter(x => down.has(x.o)).map(x => x.o);
    if (gone.length) { const left = opp.filter(o => !down.has(o)), was = gone.map(o => 'their ' + o.d).join(' and ') + (gone.length > 1 ? ' are' : ' is') + " KO'd earlier this turn";
      const h2 = left.length === 1 ? reAim(b.x, ln, left[0]) : null;
      /* nothing to hit (Nov 19 review): the act names no fainted target (Battle's card would draw it) and the why says so */
      if (!h2) { if (/ into /.test(b.act)) b.act = A.h.mv.name; b._h = null; b.why = `${was}: ${left.length ? 'no effect on ' + left.map(o => 'their ' + o.d).join(' or ') : 'no foe is left to hit'}`; return; }
      b.act = `${h2.mv.name} into ${left[0].d}`; b._h = h2; b.why = hitWhy(b.x, h2, left[0], false); note(b, {r: 2, s: was}); hits = [{o: left[0], h: h2}]; }
    for (const {o, h} of hits) { if (!h || !h.r || !h.r.hp || h.charge || h.r.max < h.r.hp || h.r.sash || down.has(o)) continue;
      const j = at(o), tb = beats[j], later = j > i && !done.has(o), tie = tieOf(tb, b), by = `your ${b.x.d}`;
      const g = sureKO(h) && b.flinch !== 'likely' && !b.koRisk ? guardOf(o, b.x, h.mv) : '';
      if (sureKO(h) && b.flinch !== 'likely' && !b.koRisk && !g) { down.set(o, {by, mv: h.mv.name, u: b.x, p: b.prio}); if (later && !tie) fainted.set(o, down.get(o));
        else if (later) { tb.koRisk = 1; note(tb, {r: 1, k: 'ko', u: b.x, s: `may be KO'd first by ${by} (speed tie)`}); } }
      else if (g) { if (later) { tb.koRisk = 1; note(tb, {r: 1, k: 'ko', u: b.x, s: `may be KO'd first by ${by} (${tie ? 'speed tie, ' : ''}if no ${g})`}); } }
      else if (later) { const k1 = (h.r.rolls || [h.r.min, h.r.max]).filter(v => v >= h.r.hp).length / (h.r.rolls || [1, 1]).length;
        /* the chance in a few words; 'may' also covers your lead being flinched or KO'd first (b.flinch, b.koRisk) */
        const why = [k1 < 1 ? koShort(h.r) : '', h.acc < 100 ? h.acc + '% to hit' : '', tie ? 'speed tie' : ''].filter(Boolean).join(', ');
        tb.koRisk = 1; note(tb, {r: 1, k: 'ko', u: b.x, s: `may be KO'd first by ${by}${why ? ' (' + why + ')' : ''}`}); } } };
  for (const b of beats) {
    if (fainted.has(b.x)) { const f = fainted.get(b.x); b.plan = b.act; b.act = 'Fainted'; b.fainted = 'sure'; b.why = `KO'd first by ${f.by}'s ${f.mv}`; b._n = []; done.add(b.x); continue; }
    if (flinched.has(b.x)) { const f = flinched.get(b.x);
      if (f.sure) { b.plan = b.act; b.act = 'Flinches'; b.flinch = 'sure'; b.why = `can't move: ${nm(f.u)}'s Fake Out hits first`; b._n = []; done.add(b.x); continue; }
      mayNote(b, f); }
    if (/^Fake Out\b/.test(b.act)) {
      const side = b.me ? opp : L, ln = b.me ? lines.find(l => l[0] === b.x) : null;
      const t = b.me ? (ln && ln[4]) || null : theirFOT.get(b.x) || null;
      if (!b.me && t) b.act = `Fake Out ${t.d}`;
      const fx = t ? foFx(b.x, t, side) : 'none', tb = t ? beats.find(y => y.x === t) : null, tie = tieOf(tb, b);
      if (t && fx === 'ok' && (!done.has(t) || tie)) {
        const f = {u: b.x, sure: b.me && !tie && b.flinch !== 'likely' && ![...theirFOT].some(([o, u]) => u === b.x && speF(o) >= speF(b.x)), tie}; /* not sure when your Fake Out user may be flinched first (their Fake Out at it is faster or tied) */ if (done.has(t)) mayNote(tb, f); else flinched.set(t, f);
        /* theirs is a guess (if they carry it, at their likely target); a risk to it (your faster Fake Out) stays as its note */
        if (!b.me) b.why = 'if they have it: a flinch. Protect blocks it'; /* its target is on the line above (act 'Fake Out X') */
        if (tie) note(b, {r: 1, k: 'fotie', t, s: `speed tie: works only if ${b.me ? 'yours' : 'theirs'} goes first`, tag: 'Speed tie'}); }
      else if (t) b.why = fx === 'none' ? `Fake Out has no effect on ${nm(t)} here` : fx === 'hit' ? `${nm(t)} takes the hit but can't flinch` : `${nm(t)} has already moved: no flinch`; }
    koPass(b); done.add(b.x); }
  // fold each beat's notes into one short line: the main fact, the most important note, at most one short tag while the line stays within 100 characters (about 3 lines on a phone card; b.main: the main fact
  // alone, which Battle's card reads its damage and KO stamp from)
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  // koSure (Nov 19 review): Battle's KO stamp is drawn only for a sure KO, told from the hit, not the text: every roll KOs, 100% to
  // hit, not charging first, no Focus Sash / Sturdy, and the attacker isn't at risk of being flinched or KO'd first
  for (const b of beats) { b.koSure = !!(b._h && / into /.test(b.act) && sureKO(b._h) && !b.koRisk && b.flinch !== 'likely'); delete b._h; }
  for (const b of beats) { let ns = b._n || []; delete b._n; b.main = cap(b.why);
    /* two Fake Outs at each other in a speed tie: one line for both */
    const ft = ns.find(n => n.k === 'fotie'), fl = ft && ns.find(n => n.k === 'flinch' && n.u === ft.t && n.tie);
    if (fl) ns = ns.filter(n => n !== ft && n !== fl).concat({r: 1, s: 'speed tie: the first Fake Out flinches the other'});
    /* more than one risk to this move: named together */
    const risk = ns.filter(n => n.k === 'flinch' || n.k === 'ko');
    if (risk.length > 1) { const who = [...new Set(risk.filter(n => n.k === 'ko').map(n => nm(n.u)))];
      ns = ns.filter(n => !risk.includes(n)).concat({r: 1, s: risk.every(n => n.k === 'ko') ? `may be KO'd first by ${who.join(' or ')}` : 'may not move: ' + [...risk.filter(n => n.k === 'flinch').map(n => `${nm(n.u)}'s Fake Out`), ...who.map(w => `a KO from ${w}`)].join(' or ')}); }
    ns.sort((a, c) => a.r - c.r); const parts = [b.main]; if (ns[0]) parts.push(cap(ns[0].s) + (ns[0].sfx && b.main.length + ns[0].s.length + ns[0].sfx.length + 2 <= 100 ? ns[0].sfx : ''));
    /* a tag the line already says ('… (speed tie)') is not repeated (independent review, Nov 19) */
    const tag = ns.slice(1).find(n => n.tag); if (tag && !parts.join('. ').toLowerCase().includes(tag.tag.toLowerCase()) && (tag.k === 'fotie' || (parts.join('. ') + '. ' + tag.tag).length <= 100)) parts.push(tag.tag); /* a Fake Out speed tie always shows: without it, 'Stops' would overclaim */
    /* the house rule's 130 characters: a long line drops its stage words ('at −1 Attack'; the numbers keep the stage) first */
    if (parts.filter(Boolean).join('. ').length > 130) parts[0] = parts[0].replace(/ \(at [+−]\d (?:Attack|Sp\. Atk)\)|, at [+−]\d (?:Attack|Sp\. Atk)(?=\))/, '');
    b.why = parts.filter(Boolean).join('. '); }
  // a threat that can't act on turn one (your Fake Out stops it, or it uses its own Fake Out) is still a threat from turn two on
  const later = o => theirFOT.has(o) || (flinched.get(o) || {}).sure;
  // every name says whose it is (Nov 19: mirrors have one name on both sides): 'their Pelipper's Weather Ball can KO your Rillaboom'
  const warn = danger.filter(x => x.worst && x.worst.pct >= .8).map(x => `their ${x.o.d}'s ${x.worst.h.mv.name} can KO your ${x.worst.on.d}${fainted.has(x.o) ? ` if ${fainted.get(x.o).by} doesn't KO it first` : later(x.o) ? ' from turn 2' : ''}`);
  return {leads: L, opp, beats, warn, field: F0, terrain: F.terrain};
}
