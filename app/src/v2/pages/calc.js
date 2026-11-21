// ---------- Damage Calc, "The Arena" (Sim's prompt Nov 19, mock-ups docs/redesign/arena/) ----------
// The battle is the control panel: the sky is the weather switch, the ground is the terrain switch, the defender's HP bar is the
// answer. Every number is today's calc (39-damage-calc-speed.js: calcData, damage, koText, koShort, calcResultNotes, bulkToSurvive,
// bestHitOn); the state is today's `dc`, and every picker keeps today's id so today's change handler updates it. What opens from a
// name plate, All moves or a set row is a sheet (Q46 / Q47 A); the opened KO Board is Q57 A (tabs, under 1024) and Q58 C (the ladder, 1024+).

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
// the opened KO Board (Sim, Nov 19: Q57 A under 1024, Q58 C from 1024). Under 1024: three count tabs in the bar's colours over one group's
// tiles (V2.kobUi.g remembers the chosen group while the board stays open; first = "down in one hit"). From 1024: the board leaves the
// right column and spans the page under the Arena, the three groups side by side as columns of rows ("the ladder"). Both keep both
// directions, the intro line, the every-hit table fold and tap to put a hit on the table (data-dckb, the same handler as the tiles).
V2.KOB_G = [['ko', 'down in one hit'], ['can', 'can go down'], ['sv', 'survive']];
V2.kobUi = V2.kobUi || {g: 'ko'};
V2.kobWide = () => { try { return matchMedia('(min-width:1024px)').matches; } catch (e) { return false; } };
V2.kobOf = b => b.lo >= 1 ? 'ko' : b.hi >= 1 ? 'can' : 'sv';
V2.kobNone = {ko: 'None in this group: no hit here is a sure knockout.', can: 'None in this group: no hit here only might knock out.', sv: 'None in this group: every hit here can knock out.'};
// one rung of the ladder: the attacker's small picture, the threat's picture, its name, the move (its name only, Q68 A), the damage and the HP it has left
// (its spoken label is the tile's, word for word)
V2.kobRow = (b, dir, onTable) => { const E = V2.esc, k = V2.kobOf(b), left = Math.max(0, 1 - b.hi), d = V2.disp(b.n), o = V2.disp(b.other), pc = `${Math.round(100 * b.lo)}–${Math.round(100 * b.hi)}%`;
  /* Q68 A (Sim, Nov 20): the row's second line shows only the move ("Weather Ball"); the small picture already says whose. The spoken label keeps the full sentence */
  const mv = b.mv;
  const lab = dir === 'mine' ? `${d}: your ${o}'s ${b.mv} does ${pc}` : `${d}'s ${b.mv} into your ${o}: ${pc}`, say = `${k === 'ko' ? 'KO: ' : ''}${lab}${k === 'ko' ? ', down in one hit' : ''}`;
  return `<button type="button" class="kob-r ${k}${onTable ? ' on' : ''}" data-dckb="${E(b.n)}" data-dckbo="${E(b.other)}" data-dckbm="${E(b.mv)}" aria-label="${E(say)}. Put it on the table"${onTable ? ' aria-current="true"' : ''}>
    <span class="by" aria-hidden="true">${V2.mon(b.other, {iw: 24, bare: true})}</span><span class="th" aria-hidden="true">${V2.mon(b.n, {iw: 40, bare: true})}</span><span class="nm" aria-hidden="true">${E(d).replace(/ ([XYZ])$/, ' $1') /* "Raichu Y" never leaves its Y alone on a line */}</span><span class="mv" aria-hidden="true">${E(mv)}</span><b class="pc u" aria-hidden="true">${pc}</b><span class="hp" aria-hidden="true"><i style="width:${(100 * left).toFixed(0)}%"></i><i class="r" style="left:${(100 * left).toFixed(0)}%;width:${(100 * Math.max(0, Math.min(1, b.hi) - Math.min(1, b.lo))).toFixed(0)}%"></i></span></button>`; };
V2.dcBoard = (C, wide) => { const dir = dc.dir === 'theirs' ? 'theirs' : 'mine', ms = C.ms;
  if (!ms.length) return `<section class="dc2-kb"><h2 class="u">The KO Board</h2><p class="tm-sub">Add Pokémon on My Team to see what your six do to the top 30.</p><a class="np-btn" href="#team">Go to My Team</a></section>`;
  const L = V2.dcKB(), on = dir === 'mine' ? C.D.p.n : C.A.p.n, G = V2.KOB_G.map(([k, t]) => ({k, t, L: L.filter(b => V2.kobOf(b) === k)}));
  const head = `<div class="dc2-kbh"><h2 class="u">The KO Board</h2>${V2.dcDir()}</div><p class="fine">${dir === 'mine' ? 'Your best hit on each of the top 30 (its usual set), surest KO first. The bar is the HP it has left. Tap one to put it on the table.' : 'Each of the top 30\'s best hit on your six (its usual set), surest KO first. The small picture is the one of yours it hits hardest; the bar is the HP yours has left. Tap one to put it on the table.'}</p>`;
  if (wide) return `<section class="dc2-kb kob-c">${head}<div class="kob-cols">${G.map(g => `<section class="kob-col" data-g="${g.k}" aria-label="${g.L.length} ${g.t}"><h3><b class="u">${g.L.length}</b> ${g.t}</h3>${g.L.length ? `<div class="kob-rows">${g.L.map(b => V2.kobRow(b, dir, b.n === on)).join('')}</div>` : `<p class="fine kob-none">${V2.kobNone[g.k]}</p>`}</section>`).join('')}</div>${V2.dcGridHtml(C)}</section>`;
  const cur = G.some(g => g.k === V2.kobUi.g) ? V2.kobUi.g : 'ko';
  const tabs = `<div class="kob-tabs" role="tablist" aria-label="Show the group">${G.map(g => `<button type="button" role="tab" class="kob-t ${g.k}" id="kobt-${g.k}" data-kobg="${g.k}" aria-selected="${g.k === cur}" aria-controls="kobp-${g.k}" tabindex="${g.k === cur ? 0 : -1}"><b class="u">${g.L.length}</b><span>${g.t}</span></button>`).join('')}</div>`;
  const pans = G.map(g => `<div class="dc2-kg kob-p" role="tabpanel" id="kobp-${g.k}" data-g="${g.k}" aria-labelledby="kobt-${g.k}"${g.k === cur ? '' : ' hidden'}>${g.L.length ? `<div class="dc2-kts">${g.L.map(b => V2.dcTile(b, dir, b.n === on)).join('')}</div>` : `<p class="fine kob-none">${V2.kobNone[g.k]}</p>`}</div>`).join('');
  return `<section class="dc2-kb kob-a">${head}${tabs}${pans}${V2.dcGridHtml(C)}</section>`; };
// a tab: shows its group in place (no redraw, so nothing jumps); arrows, Home and End move between the tabs and choose (WAI-ARIA tabs)
V2.kobPick = (t, focus) => { const tl = t.closest('.kob-tabs'), kb = t.closest('.dc2-kb'); if (!tl || !kb) return; V2.kobUi.g = t.dataset.kobg;
  for (const x of tl.querySelectorAll('[role=tab]')) { const s = x === t; x.setAttribute('aria-selected', String(s)); x.tabIndex = s ? 0 : -1; }
  for (const p of kb.querySelectorAll('.kob-p')) p.hidden = p.dataset.g !== t.dataset.kobg; if (focus) t.focus(); };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.dc2 .kob-t'); if (t) V2.kobPick(t); });
document.addEventListener('keydown', e => { const t = e.target.closest && e.target.closest('.dc2 .kob-t'); if (!t) return; const L = [...t.closest('.kob-tabs').querySelectorAll('[role=tab]')], i = L.indexOf(t);
  const j = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % L.length : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i + L.length - 1) % L.length : e.key === 'Home' ? 0 : e.key === 'End' ? L.length - 1 : -1;
  if (j < 0) return; e.preventDefault(); V2.kobPick(L[j], true); });
// crossing 1024 (a window dragged wider or narrower) redraws the calc so the opened board takes that width's form
try { matchMedia('(min-width:1024px)').addEventListener('change', () => { if (document.querySelector('.dc2.arn') && V2.redraw) V2.redraw(); }); } catch (e) {}
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
// the scene's art (Sim, Nov 21; ported from the designer's art4 mock-up, not redrawn): one seeded drawing per (weather, terrain), the same
// picture every time and in day and night. Sky viewBox 1600x600 anchored to the horizon from above, ground 1600x500 from below.
// Ids are prefixed "arn" so they stay unique on the page. Colours are the picture's own art data (v2-guard: "colours inside SVG art data").
V2.arnArt = (() => {
const R = s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const f = n => Math.round(n * 10) / 10;
const SKY = {
  clear: { g: ['#1C66C9', '#4E9FE9', '#CDE6FA'], far: '#8DB8DE', near: '#6A9CCB', stand: '#3D5574', fog: '#DCEBF8', tint: 'rgba(170,210,255,.0)' },
  sun: { g: ['#C9471A', '#F08528', '#FFDDA0'], far: '#EDA066', near: '#D9793E', stand: '#6A3420', fog: '#FFD69C', tint: 'rgba(255,170,80,.16)' },
  rain: { g: ['#0F1522', '#263046', '#66748D'], far: '#46526A', near: '#323C52', stand: '#1C2232', fog: '#6F7E97', tint: 'rgba(20,30,50,.22)' },
  sand: { g: ['#7E4F22', '#BD8440', '#E9C88A'], far: '#D7A866', near: '#BF8C48', stand: '#5E4026', fog: '#E6C48A', tint: 'rgba(220,170,100,.22)' },
  snow: { g: ['#6585AA', '#A3BAD3', '#E6EEF7'], far: '#D3DFEC', near: '#A9BCD2', stand: '#4E6079', fog: '#EAF1F8', tint: 'rgba(235,242,250,.0)' }};
const GR = {
  none: ['#625C78', '#3A3550', '#1E1A2B'], grassy: ['#5DAE52', '#2E7A34', '#16451D'], electric: ['#2E2A58', '#17143A', '#090820'],
  psychic: ['#B2479C', '#6D1F6A', '#2E0B33'], misty: ['#F6D6EA', '#C99BC8', '#7D5A8E'] };
// the ground's perspective: world X across (-1..1 is the near edge), z depth (0 = the bottom edge of the picture)
const P = (X, z) => [800 + X * 900 / (1 + z), 500 / (1 + z)];
const poly = pts => 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
const ring = (X0, z0, r, n = 64) => 'M' + Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, p = P(X0 + Math.cos(a) * r, z0 + Math.sin(a) * r); return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'Z';
const line = (a, b) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
const COURT = { x: .98, z0: .03, z1: 2.7, zc: 1.05, cr: .3 };
const courtLines = () => { const { x, z0, z1, zc, cr } = COURT;
  return [poly([P(-x, z0), P(x, z0), P(x, z1), P(-x, z1)]), line(P(-x, zc), P(x, zc)), ring(0, zc, cr), ring(0, zc, .04, 20)].join(' '); };
// a cumulus: lit top, shaded belly, flat base
const cloud = (rnd, x, y, s, top, belly, op = 1) => { const n = 6 + Math.floor(rnd() * 3); let c = '';
  for (let i = 0; i < n; i++) { const t = i / (n - 1), cx = x + (t - .5) * s * 2.2, r = s * (.42 + Math.sin(t * Math.PI) * .5) * (.8 + rnd() * .35); c += `<circle cx="${f(cx)}" cy="${f(y - r * .35)}" r="${f(r)}"/>`; }
  return `<g opacity="${op}"><clipPath id="cc${f(x)}${f(y)}"><rect x="${f(x - s * 3)}" y="${f(y - s * 3)}" width="${f(s * 6)}" height="${f(s * 3 + s * .18)}"/></clipPath>
   <g clip-path="url(#cc${f(x)}${f(y)})"><g fill="${belly}">${c}</g><g fill="${top}" transform="translate(${f(-s * .08)} ${f(-s * .16)})">${c}</g></g></g>`; };
const streaks = (rnd, n, y0, y1, len, w, op, col, ang = .22) => { let d = ''; for (let i = 0; i < n; i++) { const x = rnd() * 1800 - 100, y = y0 + rnd() * (y1 - y0), l = len * (.6 + rnd() * .8); d += `M${f(x)} ${f(y)}l${f(-l * ang)} ${f(l)}`; }
  return `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" fill="none"/>`; };
const flakes = (rnd, n, y0, y1, r0, r1, op, filt = '') => { let c = ''; for (let i = 0; i < n; i++) c += `<circle cx="${f(rnd() * 1600)}" cy="${f(y0 + rnd() * (y1 - y0))}" r="${f(r0 + rnd() * (r1 - r0))}"/>`;
  return `<g fill="#fff" opacity="${op}"${filt}>${c}</g>`; };
const star = (x, y, s) => `M${f(x)} ${f(y - s)}Q${f(x + s * .12)} ${f(y - s * .12)} ${f(x + s)} ${f(y)}Q${f(x + s * .12)} ${f(y + s * .12)} ${f(x)} ${f(y + s)}Q${f(x - s * .12)} ${f(y + s * .12)} ${f(x - s)} ${f(y)}Q${f(x - s * .12)} ${f(y - s * .12)} ${f(x)} ${f(y - s)}Z`;
const defs = p => `<defs><filter id="${p}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter><filter id="${p}b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
 <filter id="${p}b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter><filter id="${p}b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
 <filter id="${p}b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs>`;

function sky(w, t) { const S = SKY[w], rnd = R(11), q = 'sk'; let o = defs(q);
  o += `<linearGradient id="skg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.g[0]}"/><stop offset=".55" stop-color="${S.g[1]}"/><stop offset="1" stop-color="${S.g[2]}"/></linearGradient><rect width="1600" height="600" fill="url(#skg)"/>`;
  // the light source
  if (w === 'sun') { o += `<circle cx="820" cy="500" r="420" fill="#FFE2A0" opacity=".45" filter="url(#skb40)"/>`;
    let rays = ''; for (let i = 0; i < 14; i++) { const a = -Math.PI + i / 13 * Math.PI, a2 = a + .07 + rnd() * .05; rays += `M820 500L${f(820 + Math.cos(a) * 1500)} ${f(500 + Math.sin(a) * 1500)}L${f(820 + Math.cos(a2) * 1500)} ${f(500 + Math.sin(a2) * 1500)}Z`; }
    o += `<path d="${rays}" fill="#FFF4D2" opacity=".16" filter="url(#skb8)"/><circle cx="820" cy="500" r="150" fill="#FFF1C4" opacity=".7" filter="url(#skb20)"/><circle cx="820" cy="500" r="78" fill="#FFFBEA"/>`;
    for (const [t, r, c, op] of [[.32, 22, '#FFF6D8', .4], [.48, 48, '#FFB36B', .22], [.62, 14, '#FFFFFF', .45], [.8, 70, '#FF9F5A', .14]]) o += `<circle cx="${f(820 + 560 * t)}" cy="${f(500 - 380 * t)}" r="${r}" fill="${c}" opacity="${op}"/>`; }
  if (w === 'clear') o += `<circle cx="1180" cy="120" r="160" fill="#FFFFFF" opacity=".35" filter="url(#skb40)"/><circle cx="1180" cy="120" r="34" fill="#FFFDF2"/>`;
  if (w === 'sand') o += `<circle cx="1020" cy="230" r="120" fill="#FFE9BC" opacity=".5" filter="url(#skb40)"/><circle cx="1020" cy="230" r="48" fill="#FFF0CF" opacity=".75"/>`;
  // clouds
  if (w === 'clear') { o += '<g filter="url(#skb1)">'; for (const [x, y, s] of [[500, 330, 58], [1240, 380, 66], [880, 430, 36], [330, 440, 30]]) o += cloud(rnd, x, y, s, '#FFFFFF', '#C3D7EC', .95); o += '</g>'; }
  if (w === 'sun') for (const [x, y, s] of [[1220, 190, 50], [380, 130, 32]]) o += cloud(rnd, x, y, s, '#FFD9A8', '#E99260', .7);
  if (w === 'rain') { for (let i = 0; i < 16; i++) o += cloud(rnd, rnd() * 1700 - 50, 120 + rnd() * 170, 70 + rnd() * 60, '#56627A', '#1C2333', .9);
    for (let i = 0; i < 12; i++) o += cloud(rnd, rnd() * 1700 - 50, 20 + rnd() * 120, 90 + rnd() * 70, '#3E4961', '#141A27', 1); }
  if (w === 'snow') { o += `<g filter="url(#skb20)" opacity=".75">`; for (let i = 0; i < 14; i++) o += `<ellipse cx="${f(rnd() * 1600)}" cy="${f(60 + rnd() * 260)}" rx="${f(160 + rnd() * 200)}" ry="${f(40 + rnd() * 50)}" fill="${rnd() < .5 ? '#F4F8FC' : '#B9CADD'}"/>`; o += `</g>`; }
  // distant land
  if (w === 'snow') { let m = 'M-50 600'; for (let x = -50; x <= 1650; x += 130 + rnd() * 90) m += `L${f(x)} ${f(380 + rnd() * 120)}`; o += `<path d="${m}L1650 600Z" fill="${S.far}"/>`;
    let caps = ''; m.slice(1).split('L').slice(1).forEach(pt => { const [x, y] = pt.split(' ').map(Number); if (y < 450) caps += `M${f(x - 46)} ${f(y + 34)}L${f(x)} ${f(y)}L${f(x + 46)} ${f(y + 34)}L${f(x + 18)} ${f(y + 26)}L${f(x)} ${f(y + 40)}L${f(x - 20)} ${f(y + 28)}Z`; }); o += `<path d="${caps}" fill="#FFFFFF" opacity=".9"/>`; }
  else if (w === 'sand') { o += `<path d="M-50 600V470C200 420 380 410 600 452C820 494 1000 420 1240 430C1420 438 1520 470 1650 460V600Z" fill="${S.far}"/><path d="M-50 600V520C260 486 500 500 760 532C1000 560 1260 496 1650 520V600Z" fill="${S.near}"/>`; }
  else { o += `<path d="M-50 600V430C150 396 320 380 520 420C700 456 880 392 1100 400C1300 408 1460 440 1650 420V600Z" fill="${S.far}" opacity=".85"/><path d="M-50 600V500C240 470 460 480 700 512C940 544 1180 470 1650 490V600Z" fill="${S.near}"/>`; }
  // the stadium on the horizon: stands, a rim of lights, two floodlight towers
  const lit = w === 'rain' || w === 'snow' || w === 'sand';
  o += `<path d="M-50 600V540C300 516 560 508 800 508C1040 508 1300 516 1650 540V600Z" fill="${S.stand}"/><path d="M-50 566C300 546 560 540 800 540C1040 540 1300 546 1650 566M-50 586C300 570 560 566 800 566C1040 566 1300 570 1650 586" stroke="#fff" stroke-opacity=".08" stroke-width="2" fill="none"/>`;
  let dots = ''; for (let x = -40; x < 1650; x += 26) { const y = 540 - 32 * Math.cos((x - 800) / 1700 * Math.PI) + 0; dots += `<circle cx="${x}" cy="${f(y + 2)}" r="2.2"/>`; } o += `<g fill="${lit ? '#FFF3C8' : '#FFFFFF'}" opacity="${lit ? .85 : .35}">${dots}</g>`;
  for (const x of [430, 1170]) { o += `<path d="M${x - 3} 600V300h6V600Z" fill="${S.stand}"/><rect x="${x - 34}" y="272" width="68" height="30" rx="4" fill="${S.stand}"/>`;
    o += `<g fill="${lit ? '#FFF6D6' : '#FFFFFF'}" opacity="${lit ? 1 : .45}">${[0, 1, 2, 3].map(i => `<rect x="${x - 29 + i * 15}" y="277" width="11" height="8" rx="2"/><rect x="${x - 29 + i * 15}" y="289" width="11" height="8" rx="2"/>`).join('')}</g>`;
    if (lit) o += `<ellipse cx="${x}" cy="287" rx="90" ry="44" fill="#FFF3C8" opacity=".35" filter="url(#skb20)"/><path d="M${x - 30} 300L${x - 230} 600H${x + 230}L${x + 30} 300Z" fill="#FFF3D0" opacity=".07"/>`; }
  // weather in the air
  if (w === 'sun') o += `<rect y="500" width="1600" height="100" fill="#FFE9B8" opacity=".35" filter="url(#skb8)"/>`;
  if (w === 'rain') o += `<rect y="430" width="1600" height="170" fill="${S.fog}" opacity=".35" filter="url(#skb20)"/>` + `<g filter="url(#skb1)">${streaks(rnd, 260, -60, 600, 50, 1.4, .3, '#C9D8F2')}</g>` + streaks(rnd, 120, -60, 600, 80, 2, .38, '#DCE6F8') + `<g filter="url(#skb1)">${streaks(rnd, 26, -60, 600, 160, 3.2, .45, '#EAF1FF')}</g>`;
  if (w === 'snow') o += `<rect y="440" width="1600" height="160" fill="#F2F6FB" opacity=".5" filter="url(#skb20)"/>` + flakes(rnd, 220, 0, 600, 1, 2, .7) + flakes(rnd, 70, 0, 600, 2.6, 3.8, .9) + flakes(rnd, 16, 0, 600, 7, 10, .85, ' filter="url(#skb3)"');
  if (w === 'sand') { let bands = ''; for (let i = 0; i < 9; i++) { const y = 60 + rnd() * 500; bands += `<path d="M-100 ${f(y)}C300 ${f(y - 60 - rnd() * 60)} 800 ${f(y + 50)} 1700 ${f(y - 40 - rnd() * 80)}" stroke="#FBE3B4" stroke-width="${f(22 + rnd() * 40)}" fill="none" opacity="${f(.12 + rnd() * .14)}"/>`; }
    o += `<g filter="url(#skb20)">${bands}</g><rect y="380" width="1600" height="220" fill="${S.fog}" opacity=".45" filter="url(#skb20)"/>`;
    let gr = ''; for (let i = 0; i < 420; i++) { const x = rnd() * 1600, y = rnd() * 600, l = 3 + rnd() * 9; gr += `M${f(x)} ${f(y)}l${f(l)} ${f(l * .16)}`; } o += `<path d="${gr}" stroke="#FFF1D4" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`; }
  const AU = { grassy: '#7BE06A', electric: '#FFD21F', psychic: '#FF6FD0', misty: '#FFC8EC' }[t];
  if (AU) o += `<linearGradient id="aug" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${AU}" stop-opacity="0"/><stop offset="1" stop-color="${AU}" stop-opacity="${t === 'misty' ? .75 : .6}"/></linearGradient><rect y="330" width="1600" height="270" fill="url(#aug)" style="mix-blend-mode:${t === 'misty' ? 'screen' : 'screen'}"/>`;
  return `<svg class="arn-sk" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${o}</svg>`; }

function ground(w, t) { const S = SKY[w], G = GR[t], rnd = R(29), q = 'gr'; let o = defs(q);
  o += `<linearGradient id="grg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G[0]}"/><stop offset=".4" stop-color="${G[1]}"/><stop offset="1" stop-color="${G[2]}"/></linearGradient><rect width="1600" height="500" fill="url(#grg)"/>`;
  const zs = []; for (let z = 0; z < 40; z = z * 1.0 + .32) zs.push(z);
  if (t === 'none') { o += `<path d="${poly([P(-COURT.x, COURT.z0), P(COURT.x, COURT.z0), P(COURT.x, COURT.z1), P(-COURT.x, COURT.z1)])}" fill="#FFFFFF" opacity=".05"/>`;
    o += `<path d="${courtLines()}" stroke="#FFFFFF" stroke-opacity=".72" stroke-width="7" fill="none" stroke-linejoin="round"/>`; }
  if (t === 'grassy') { let st = ''; for (let i = 0; i < zs.length - 1; i += 2) st += poly([P(-4, zs[i]), P(4, zs[i]), P(4, zs[i + 1]), P(-4, zs[i + 1])]);
    o += `<path d="${st}" fill="#FFFFFF" opacity=".07"/><path d="${courtLines()}" stroke="#FFFFFF" stroke-opacity=".72" stroke-width="7" fill="none"/>`;
    let tuft = ''; const greens = ['#8FD66E', '#6DBE55', '#4E9F43', '#A9E37F'];
    for (let i = 0; i < 170; i++) { const y = 40 + Math.pow(rnd(), .6) * 470, x = rnd() * 1600; if (Math.abs(x - 800) < 330 * y / 500 && y > 120 && rnd() < .8) continue; const s = 6 + y / 500 * 34;
      let d = ''; for (let k = 0; k < 5; k++) { const bx = x + (k - 2) * s * .22, tip = bx + (k - 2) * s * .18 + (rnd() - .5) * s * .3; d += `M${f(bx - s * .07)} ${f(y)}Q${f(bx)} ${f(y - s * .6)} ${f(tip)} ${f(y - s * (.8 + rnd() * .5))}Q${f(bx + s * .05)} ${f(y - s * .5)} ${f(bx + s * .07)} ${f(y)}Z`; }
      tuft += `<path d="${d}" fill="${greens[i % 4]}"/>`; }
    o += tuft; let fl = ''; for (let i = 0; i < 26; i++) { const y = 80 + rnd() * 420, x = rnd() * 1600, r = 1.5 + y / 500 * 4; fl += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${rnd() < .5 ? '#FFFFFF' : '#FFE36B'}"/>`; } o += fl;
    let mo = ''; for (let i = 0; i < 40; i++) mo += `<circle cx="${f(rnd() * 1600)}" cy="${f(rnd() * 480)}" r="${f(2 + rnd() * 4)}"/>`; o += `<g fill="#D9FFB0" opacity=".55" filter="url(#grb3)">${mo}</g>`; }
  if (t === 'electric') { let gl = ''; for (let X = -3; X <= 3.01; X += .25) gl += line(P(X, 0), P(X, 60)); for (const z of zs) gl += line(P(-6, z), P(6, z));
    o += `<path d="${gl}" stroke="#FFE14D" stroke-width="3" opacity=".5" fill="none"/>`;
    o += `<rect width="1600" height="140" fill="#FFE14D" opacity=".35" filter="url(#grb20)"/><g fill="#FFD21F" opacity=".42" filter="url(#grb40)"><ellipse cx="800" cy="250" rx="420" ry="90"/><ellipse cx="360" cy="430" rx="300" ry="80"/><ellipse cx="1260" cy="400" rx="300" ry="80"/></g>`;
    o += `<path d="${courtLines()}" stroke="#FFD21F" stroke-width="26" opacity=".95" fill="none" filter="url(#grb8)"/><path d="${courtLines()}" stroke="#FFF7B8" stroke-width="7" fill="none"/>`;
    let bolt = ''; for (let i = 0; i < 14; i++) { let X = (rnd() - .5) * 3, z = .2 + rnd() * 3, d = 'M' + P(X, z).map(f).join(' '); for (let k = 0; k < 7; k++) { X += (rnd() - .5) * .22; z += .08 + rnd() * .12; d += 'L' + P(X, z).map(f).join(' '); } bolt += d; }
    o += `<path d="${bolt}" stroke="#FFD21F" stroke-width="18" opacity=".9" fill="none" stroke-linejoin="round" filter="url(#grb3)"/><path d="${bolt}" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
    let sp = ''; for (let i = 0; i < 46; i++) sp += `<circle cx="${f(rnd() * 1600)}" cy="${f(rnd() * 490)}" r="${f(1.5 + rnd() * 3)}"/>`; o += `<g fill="#FFF6A8">${sp}</g>`; }
  if (t === 'psychic') { o += `<ellipse cx="800" cy="${f(P(0, COURT.zc)[1])}" rx="520" ry="150" fill="#FF7AD6" opacity=".35" filter="url(#grb40)"/>`;
    let rings = ''; [.18, .36, .58, .84, 1.14, 1.5, 1.95, 2.5].forEach((r, i) => { rings += `<path d="${ring(0, COURT.zc, r, 96)}" stroke-width="${i % 2 ? 3.5 : 7}"/>`; });
    o += `<g stroke="#FF7FDA" fill="none" opacity=".85" stroke-width="18" filter="url(#grb8)">${rings}</g><g stroke="#FFE2F7" fill="none" opacity=".95">${rings}</g>`;
    let mo = ''; for (let i = 0; i < 34; i++) { const x = rnd() * 1600, y = rnd() * 480, s = 3 + y / 500 * 12; mo += `<path d="M${f(x)} ${f(y - s)}L${f(x + s * .6)} ${f(y)}L${f(x)} ${f(y + s)}L${f(x - s * .6)} ${f(y)}Z" fill="${rnd() < .5 ? '#FFC6EF' : '#C9A2FF'}" opacity="${f(.5 + rnd() * .4)}"/>`; } o += mo; }
  if (t === 'misty') { o += `<path d="${courtLines()}" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="7" fill="none"/>`;
    let fog = ''; for (let i = 0; i < 16; i++) { const y = 20 + rnd() * 480, s = .5 + y / 500; fog += `<ellipse cx="${f(rnd() * 1700 - 50)}" cy="${f(y)}" rx="${f(220 * s + rnd() * 160)}" ry="${f(34 * s + rnd() * 24)}" fill="${rnd() < .6 ? '#FFFFFF' : '#FFD8F0'}" opacity="${f(.35 + rnd() * .3)}"/>`; }
    o += `<g filter="url(#grb20)">${fog}</g>`; let sp = ''; for (let i = 0; i < 34; i++) { const y = rnd() * 480; sp += `<path d="${star(rnd() * 1600, y, 3 + y / 500 * 10)}" fill="${rnd() < .6 ? '#FFFFFF' : '#FFC4E8'}"/>`; } o += `<g opacity=".9">${sp}</g>`; }
  // the weather on the ground
  if (w === 'sun') o += `<ellipse cx="820" cy="30" rx="760" ry="160" fill="#FFD27A" opacity=".3" filter="url(#grb40)"/><rect width="1600" height="500" fill="${S.tint}"/>`;
  if (w === 'rain') { o += `<rect width="1600" height="500" fill="#0A0F1C" opacity=".14"/>`;
    o += `<g filter="url(#grb20)" opacity=".4">${[430, 1170, 300, 760, 1320].map((x, i) => `<rect x="${x - 26}" y="0" width="52" height="${i < 2 ? 380 : 220}" fill="${i < 2 ? '#FFF2C8' : '#9FB2D4'}"/>`).join('')}</g>`;
    let pd = ''; for (let i = 0; i < 12; i++) { const y = 60 + rnd() * 430, s = y / 500; pd += `<ellipse cx="${f(rnd() * 1600)}" cy="${f(y)}" rx="${f(40 + 140 * s * (.6 + rnd()))}" ry="${f(6 + 24 * s * (.6 + rnd() * .6))}"/>`; }
    o += `<g fill="#8FA3C4" opacity=".22">${pd}</g>`; let rp = ''; for (let i = 0; i < 40; i++) { const y = 30 + rnd() * 470, s = y / 500, x = rnd() * 1600; rp += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + 30 * s)}" ry="${f(2 + 7 * s)}"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(16 + 60 * s)}" ry="${f(4 + 14 * s)}" opacity=".5"/>`; }
    o += `<g fill="none" stroke="#DCE7FA" stroke-width="1.5" opacity=".45">${rp}</g>` + streaks(rnd, 90, -40, 500, 70, 1.6, .3, '#D4E0F5') + `<g filter="url(#grb1)">${streaks(rnd, 20, -40, 500, 150, 3, .4, '#EAF1FF')}</g>`; }
  if (w === 'snow') { o += `<linearGradient id="sng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".75"/><stop offset="1" stop-color="#E8F0F8" stop-opacity=".35"/></linearGradient><rect width="1600" height="500" fill="url(#sng)"/>`;
    o += `<path d="M-50 500V470C80 430 180 452 300 440C420 428 470 470 560 500ZM1100 500C1180 456 1260 430 1380 444C1480 456 1560 420 1650 436V500Z" fill="#F7FAFD"/><path d="M-50 500V486C120 462 260 476 420 500ZM1240 500C1340 470 1500 462 1650 470V500Z" fill="#C9D7E6" opacity=".7"/>`;
    o += flakes(rnd, 80, 0, 500, 1.5, 3, .85) + flakes(rnd, 12, 0, 500, 7, 11, .85, ' filter="url(#grb3)"'); let sp = ''; for (let i = 0; i < 26; i++) sp += `<path d="${star(rnd() * 1600, 40 + rnd() * 460, 3 + rnd() * 4)}"/>`; o += `<g fill="#FFFFFF" opacity=".8">${sp}</g>`; }
  if (w === 'sand') { o += `<rect width="1600" height="500" fill="#D9AE6A" opacity=".34"/>`; let rip = ''; for (let i = 0; i < 34; i++) { const y = 20 + Math.pow(rnd(), .8) * 470, s = y / 500, x = rnd() * 1500 - 100, l = 120 + 420 * s; rip += `M${f(x)} ${f(y)}c${f(l * .25)} ${f(-8 * s - 2)} ${f(l * .5)} ${f(8 * s + 2)} ${f(l)} 0`; }
    o += `<path d="${rip}" stroke="#F7DCA6" stroke-width="2.5" fill="none" opacity=".6"/><path d="M-50 500V450C140 420 260 446 380 500ZM1180 500C1300 440 1460 426 1650 444V500Z" fill="#E2BC7C"/>`;
    o += `<rect width="1600" height="150" fill="${S.fog}" opacity=".5" filter="url(#grb20)"/>`; let gr = ''; for (let i = 0; i < 220; i++) { const x = rnd() * 1600, y = rnd() * 500, l = 4 + rnd() * 12; gr += `M${f(x)} ${f(y)}l${f(l)} ${f(l * .12)}`; } o += `<path d="${gr}" stroke="#FFF1D4" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>`; }
  const tx = { none: .5, grassy: .45, electric: .25, psychic: .25, misty: .2 }[t] + (w === 'sand' ? .2 : 0);
  o += `<filter id="grn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${t === 'grassy' ? '.9 .12' : '.7 .5'}" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1.1"/></filter><rect width="1600" height="500" filter="url(#grn)" opacity="${tx * .35}" style="mix-blend-mode:overlay"/>`;
  // the horizon: haze where the ground meets the sky
  o += `<linearGradient id="hzg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.fog}" stop-opacity="${w === 'clear' ? .45 : .6}"/><stop offset="1" stop-color="${S.fog}" stop-opacity="0"/></linearGradient><rect width="1600" height="95" fill="url(#hzg)"/>`;
  o += `<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient><rect width="1600" height="500" fill="url(#vg)"/>`;
  return `<svg class="arn-gd" viewBox="0 0 1600 500" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${o}</svg>`; }

const ids = s => s.replace(/ id="([^"]+)"/g, ' id="arn$1"').replace(/url\(#([^)]+)\)/g, 'url(#arn$1)');
  const cache = {};
  return (w, t) => { w = SKY[w] ? w : 'clear'; t = GR[t] ? t : 'none'; const k = w + '|' + t;
    return cache[k] || (cache[k] = ids(`<div class="arn-bg" aria-hidden="true"><div class="arn-skw">${sky(w, t)}</div><div class="arn-gdw">${ground(w, t)}</div><i class="arn-shade"></i></div>`)); };
})();
// the rows' icons (Nov 21 mock-up): one per option, in that weather's / terrain's colour (--arn-k-*)
V2.ARN_IC = {"": "<circle cx=\"12\" cy=\"12\" r=\"7\"/><path d=\"M7 17L17 7\"/>", "sun": "<circle cx=\"12\" cy=\"12\" r=\"4.2\" fill=\"currentColor\"/><path d=\"M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1\"/>", "rain": "<path d=\"M7 14.5a4 4 0 0 1 .6-7.9A5.5 5.5 0 0 1 18 8a3.3 3.3 0 0 1-.6 6.5Z\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3\"/>", "sand": "<path d=\"M3 8.5h11a2.5 2.5 0 1 0-2.5-2.5M3 12.5h15a2.5 2.5 0 1 1-2.5 2.5M3 16.5h8\"/>", "snow": "<path d=\"M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5\"/>", "grassy": "<path d=\"M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z\" fill=\"currentColor\" stroke=\"none\"/>", "electric": "<path d=\"M13.5 2.5L5 13.5h6l-1.5 8 9-11.5h-6Z\" fill=\"currentColor\" stroke=\"none\"/>", "psychic": "<path d=\"M12 12.2a1.2 1.2 0 1 1 1.6-1.2 2.8 2.8 0 1 1-3.6 3.2 4.6 4.6 0 1 1 6.8-5.4 6.6 6.6 0 1 1-10.4 2\"/>", "misty": "<path d=\"M12 3.5c3.2 4 5.5 7 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2.8 2.3-5.8 5.5-9.8Z\" fill=\"currentColor\" stroke=\"none\"/>"};
V2.arnIc = v => `<svg class="arn-ic" viewBox="0 0 24 24" aria-hidden="true">${V2.ARN_IC[v] || V2.ARN_IC['']}</svg>`;
V2.arnSide = (X, role) => { const W = V2.ARN_W; return X.src === 'yours' ? W.yours : X.src === 'estimated' ? W.estimated : W.mostUsed; };
V2.arnImg = (n, cls) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null; return id ? `<img class="${cls || ''}" src="${V2.art(id, true)}" alt="" decoding="async">` : ''; };
// the defender's plate: name (tap = today's Pokémon picker), the HP bar (green left, pink damage, stripes the roll's part), "x–y% HP left"
V2.arnHp = r => { if (!r || !r.hp) return {bar: '<span class="arn-hprow" aria-hidden="true"><span class="arn-hpl">HP</span><span class="arn-hpb"><i class="l" style="width:100%"></i></span></span>', txt: ''};
  const lo = Math.min(1, r.min / r.hp), hi = Math.min(1, r.max / r.hp), keep = 100 * (1 - hi), roll = 100 * (hi - lo);
  const a = Math.max(0, 100 - +dmgP(100 * r.max / r.hp)), b = Math.max(0, 100 - +dmgP(100 * r.min / r.hp)); const kl = Math.max(0, r.hp - r.max), kh = Math.max(0, r.hp - r.min);
  return {bar: `<span class="arn-hprow" aria-hidden="true"><span class="arn-hpl">HP</span><span class="arn-hpb"><i class="l" style="width:${keep.toFixed(1)}%"></i><i class="r" style="left:${keep.toFixed(1)}%;width:${roll.toFixed(1)}%"></i><i class="x" style="left:${(keep + roll).toFixed(1)}%"></i></span></span>`, txt: `<span class="arn-hpv u">${kl === kh ? kl : kl + '–' + kh}</span> <span class="arn-hpof">/ ${r.hp} ${V2.ARN_W.hpLeft}</span> <span class="arn-pct">${a === b ? a : a + '–' + b}%</span>`}; }; /* Sim, Nov 21 (Q100 A): real HP numbers, the percent small beside them */
V2.arnPlate = (X, role, id, r) => { const E = V2.esc, d = V2.disp(X.p.n), W = V2.ARN_W, hp = role === 'd' ? V2.arnHp(r) : null;
  return `<div class="arn-plate ${role === 'd' ? 'arn-dp' : 'arn-ap'}"><b class="u" data-arnname="${role}">${d.startsWith('Mega ') ? `<span class="mg">Mega </span>${E(d.slice(5)).replace(/ ([XYZ])$/, '\u00a0$1')}` : E(d)}<i class="arw" aria-hidden="true"></i></b>${hp ? hp.bar + `<span class="arn-hpt">${hp.txt}</span>` : ''}
    <button type="button" class="arn-pickbtn" data-arnpick="${id}" aria-haspopup="dialog" aria-label="${role === 'd' ? W.defender : W.attacker}: ${E(d)}${hp && hp.txt ? ', ' + E(hp.txt) : ''}. Choose another Pokémon"></button>
    <select class="arn-pick arn-pickhid" id="${id}" tabindex="-1" aria-hidden="true">${monOptions(X.p.n)}</select></div>`; };
/* Sim Q46 A (Nov 19, 8:33 PM): a name plate opens the site's search sheet for Pokémon only ("Choose the attacker" / "Choose the defender");
   before typing it lists the 12 most-used Pokémon; picking one sets today's picker (#dcA / #dcD, kept hidden and out of the tab order) and
   fires its usual change, so every calc rule (moves reset, sets, field) runs exactly as before */
V2.arnHit = p => `<button type="button" class="np-hit" data-arnpickmon="${V2.esc(p.n)}"><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy" decoding="async"><span class="nm"><b>${V2.nameHtml(V2.disp(p.n))}</b>${(() => { try { const r = rating(p).total; return r ? `<small aria-label="Rated ${RS(r)}, ${V2.esc(lTier(r).k)} tier">${RS(r)}\u00a0·\u00a0${V2.esc(lTier(r).k)}\u00a0tier</small>` : ''; } catch (e) { return ''; } })()}</span><span class="ty">${(p.t || []).map(V2.typeChip).join('')}</span></button>`;
V2.arnPick = id => { const sel = document.getElementById(id); if (!sel) return; const ok = new Set([...sel.options].map(o => o.value)), title = id === 'dcD' ? 'Choose the defender' : 'Choose the attacker';
  const sh = V2.sheet(`<div class="np-find"><h2 class="u">${title}</h2><label class="np-field">${V2.ICON.search}<input type="search" data-arnq placeholder="Find a Pokémon" aria-label="Find a Pokémon" autocomplete="off">${V2.CLR}</label><p class="vh" data-arnsay role="status"></p><div class="hits" data-arnhits></div></div>`, {label: title, small: true, focus: '[data-arnq]'});
  const inp = sh.querySelector('[data-arnq]'), out = sh.querySelector('[data-arnhits]'), say = sh.querySelector('[data-arnsay]');
  const top = () => [...V2.byName.values()].filter(p => ok.has(p.n)).sort((a, b) => (b.u || 0) - (a.u || 0)).slice(0, 12);
  const draw = () => { const q = inp.value.trim(), L = q ? V2.find(q).mons.filter(p => ok.has(p.n)) : top();
    out.innerHTML = (q ? '' : '<p class="fine">Most used right now. Type to find any other.</p>') + (L.length ? L.map(V2.arnHit).join('') : `<p class="fine">Nothing called “${V2.esc(q)}”. Try part of the name.</p>`);
    if (say) say.textContent = q ? (L.length ? `${L.length} result${L.length === 1 ? '' : 's'}` : 'No matches') : ''; };
  inp.addEventListener('input', draw);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const h = out.querySelector('.np-hit'); if (h) { e.preventDefault(); h.click(); } } });
  out.addEventListener('click', e => { const h = e.target.closest('[data-arnpickmon]'); if (!h) return; V2.closeSheet(); sel.value = h.dataset.arnpickmon; sel.dispatchEvent(new Event('change', {bubbles: true})); });
  draw(); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-arnpick]'); if (b) V2.arnPick(b.dataset.arnpick); });
// the verdict: phone two lines ("Heat Wave takes 88–104% of its HP" / the KO in plain words); desktop the KO words alone, with the
// damage as the big tilted tag in open sky
V2.arnVerdict = C => { const E = V2.esc, W = V2.ARN_W, r = C.r, mv = C.mv, chip = (tag = 'span') => `<${tag} class="arn-mvc"${r && V2.TYPES.includes(r.type) ? ` style="--tc:var(--ty-${r.type})"` : ''}>${E(mv.name)}</${tag}>`;
  if (!mv) return {v: `<div class="arn-verdict notag"><p class="l2 u">${W.pick}</p></div>`, tag: ''};
  if (!r) return {v: `<div class="arn-verdict notag"><p class="l1"><b>${E(mv.name)}</b></p><p class="l3">${calcNoResultText(mv)}</p></div>`, tag: ''};
  if (r.max === 0) return {v: `<div class="arn-verdict notag"><p class="l1"><b>${E(mv.name)}</b> · No effect</p><p class="l2 u">${r.fail ? E(r.fail) + '.' : `${E(V2.disp(C.D.p.n))} is immune to ${E(r.type)}.`}</p></div>`, tag: ''};
  return {v: `<div class="arn-verdict"><p class="l1">${chip()}<span class="arn-tk">takes <b>${r.min === r.max ? r.min : r.min + '–' + r.max} HP</b></span> <span class="arn-pct">${V2.dcPct(r)}</span></p><p class="l2 u">${W.long(koText(r))}</p></div>`,
    tag: `<p class="arn-tag" aria-hidden="true">${chip('small')}<b class="u">${r.min === r.max ? r.min : r.min + '–' + r.max}<span class="arn-hpu">HP</span></b><span class="arn-pct">${V2.dcPct(r)} of its HP</span></p>`}; };
// a move button: type-coloured edge, name, its own damage and short verdict (desktop adds type and power); the chosen one is filled
V2.arnMove = (C, m) => { const E = V2.esc, W = V2.ARN_W, on = m.name === dc.mv, r = on ? C.r : V2.dcHit(C, m), t = (r && r.type) || m.type;
  const dmg = !r ? (m.cat ? 'Not calculated' : 'No damage') : r.max === 0 ? 'No effect' : V2.dcPct(r), ko = r && r.max > 0 ? W.short(koShort(r)) : '';
  const dmH = `<span class="dm${r && r.max > 0 ? ' u' : ''}" aria-hidden="true">${E(dmg)}</span>`; /* phone: under the name beside the verdict; desktop: beside the name (one shown) */
  return `<button type="button" class="arn-mv${on ? ' on' : ''}" style="--tc:var(--ty-${t})" data-dcmv="${E(m.name)}" aria-pressed="${on}" aria-label="${E(m.name)}: ${E(dmg)}${ko ? ', ' + E(ko) : ''}">
    <span class="r1"><span class="nm u">${E(m.name)}</span>${dmH.replace('dm', 'dm d1')}</span><span class="r2"><span class="ty">${E(t)}${m.bp > 1 ? ' · ' + m.bp : ''}</span>${dmH.replace('dm', 'dm d2')}${ko ? `<span class="ko">${E(ko)}</span>` : ''}</span></button>`; };
// "All moves": today's move list (id dcMv: its set, then every damaging move it learns), kept hidden behind the dashed button
V2.arnAll = C => { const E = V2.esc, mv = C.mvs;
  return `<div class="arn-mv all"><span>${V2.ARN_W.allMoves}<i class="arw" aria-hidden="true"></i></span><button type="button" class="arn-pickbtn" data-arnmv aria-haspopup="dialog" aria-label="${V2.ARN_W.allMoves}: ${E(dc.mv || 'none')}. Choose any move"></button><select class="arn-pick arn-pickhid" id="dcMv" tabindex="-1" aria-hidden="true">${mv.pop.length ? `<optgroup label="Its set">${mv.pop.map(m => `<option${m.name === dc.mv ? ' selected' : ''}>${E(m.name)}</option>`).join('')}</optgroup>` : ''}<optgroup label="Other moves">${mv.rest.map(m => `<option${m.name === dc.mv ? ' selected' : ''}>${E(m.name)}</option>`).join('')}</optgroup></select></div>`; };
/* Sim Q47 A (Nov 19, 8:33 PM): All moves and the set rows open sheets in the search sheet's style instead of the phone's plain list. Each
   reads today's hidden select (its options, its value) and a pick sets that select and fires its usual change, so every calc rule runs as
   before (V2.arnSelPick); the opener is focused first, so focus comes back to it on close (a tap on a phone doesn't focus a button). */
V2.arnSelPick = (sel, v) => { V2.closeSheet(); if (sel.value === v) return; sel.value = v; sel.dispatchEvent(new Event('change', {bubbles: true})); };
// "Choose a move": a search box, its set ("Its usual set"), then every other damaging move it learns; each row has the type edge, the
// type and power, and the calc's own damage on the current defender with the current field (V2.dcHit, the move buttons' numbers).
// The rows are worked out once when the sheet opens (all of them; timed in the Q47 report); filtering reuses them.
V2.arnMvRow = (C, m) => { const E = V2.esc, W = V2.ARN_W, on = m.name === dc.mv, r = on ? C.r : V2.dcHit(C, m), t = (r && r.type) || m.type, tc = V2.TYPES.includes(t) ? t : 'Normal';
  /* Nov 21: Plot the hit (Sim, Nov 20: real damage and HP numbers, not percentages): each row's damage in HP of the defender's HP and the
     swipe's short verdict, as on the board (V2.pcDmg, V2.pcVerdict) */
  const dmg = !r ? '' : r.max === 0 ? 'No effect' : V2.PC_PCT_FIRST ? `${V2.pcPct(r)} · ${V2.pcDmg(r)} of ${r.hp} HP` : `${V2.pcDmg(r)} of ${r.hp} HP`, ko = r && r.max > 0 ? V2.pcVerdict(r).chip : '', info = `${t}${m.bp > 1 ? ' · ' + m.bp + ' power' : ''}${on ? ' · selected' : ''}`;
  return `<button type="button" class="np-hit arn-mvhit" style="--tc:var(--ty-${tc})" data-arnpickmv="${E(m.name)}"${on ? ' aria-current="true"' : ''} aria-label="${E(m.name)}: ${E(info)}${dmg ? ', ' + E(dmg) : ''}${ko ? ', ' + E(ko) : ''}"><span class="nm"><b class="u">${E(m.name)}</b><small>${E(info)}</small></span><span class="arn-mvd" aria-hidden="true">${dmg ? `<b class="${r.max > 0 ? 'u' : ''}">${r.max > 0 ? (V2.PC_PCT_FIRST ? `${E(V2.pcPct(r))}<span class="of"><span class="sep"> · </span>${E(V2.pcDmg(r))} of ${r.hp} HP</span>` : `${E(V2.pcDmg(r))}<span class="of"> of ${r.hp} HP</span>`) : E(dmg)}</b>` : ''}${ko ? `<small>${E(ko)}</small>` : ''}</span></button>`; };
V2.arnMvPick = () => { const sel = document.getElementById('dcMv'); if (!sel) return; let C; try { C = calcData(); } catch (e) { return; }
  const mine = (() => { try { return members().some(m => m.p.n === dc.a); } catch (e) { return false; } })(), t0 = performance.now();
  const L = [...sel.querySelectorAll('optgroup')].map(g => ({h: g.label === 'Its set' ? (mine ? 'Its set on your team' : 'Its usual set') : 'Every other move',
    rows: [...g.querySelectorAll('option')].map(o => { const m = mvByName.get(o.value); return {n: o.value, h: m ? V2.arnMvRow(C, m) : `<button type="button" class="np-hit arn-mvhit" style="--tc:var(--ty-Normal)" data-arnpickmv="${V2.esc(o.value)}"><span class="nm"><b class="u">${V2.esc(o.text)}</b></span></button>`}; })}));
  V2.arnMvMs = performance.now() - t0; /* how long the rows took (read by v2-q47) */
  const sh = V2.sheet(`<div class="np-find"><h2 class="u">Choose a move</h2><label class="np-field">${V2.ICON.search}<input type="search" data-arnmq placeholder="Find a move" aria-label="Find a move" autocomplete="off">${V2.CLR}</label><p class="fine">Damage on ${V2.esc(V2.disp(C.D.p.n))} as the field stands now.</p><p class="vh" data-arnsay role="status"></p><div class="hits" data-arnhits></div></div>`, {label: 'Choose a move', small: true, focus: '[data-arnmq]'});
  const inp = sh.querySelector('[data-arnmq]'), out = sh.querySelector('[data-arnhits]'), say = sh.querySelector('[data-arnsay]');
  const draw = () => { const q = inp.value.trim().toLowerCase(), G = L.map(g => ({h: g.h, rows: q ? g.rows.filter(r => r.n.toLowerCase().includes(q)) : g.rows})).filter(g => g.rows.length), n = G.reduce((a, g) => a + g.rows.length, 0);
    out.innerHTML = n ? G.map(g => `<h3 class="arn-grp">${g.h}</h3>${g.rows.map(r => r.h).join('')}`).join('') : `<p class="fine">No move called “${V2.esc(inp.value.trim())}”. Try part of the name.</p>`;
    if (say) say.textContent = q ? (n ? `${n} move${n === 1 ? '' : 's'}` : 'No matches') : ''; };
  inp.addEventListener('input', draw);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const h = out.querySelector('[data-arnpickmv]'); if (h) { e.preventDefault(); h.click(); } } });
  out.addEventListener('click', e => { const h = e.target.closest('[data-arnpickmv]'); if (h) V2.arnSelPick(sel, h.dataset.arnpickmv); });
  draw(); };
// a set row's sheet ("Attacker's item"): today's options, the current one marked selected, the most-used one marked "most used" (the usage
// the card's "most used set" comes from, sideDefaults: the top tournament item, metaAbility, the most common spread's nature and points)
V2.arnMostUsed = id => { const p = byName.get(id[2] === 'A' ? dc.a : dc.d), k = id.slice(3); if (!p) return null;
  try { if (k === 'It') { const it = topItem(p); return it && !STONE_RE.test(it[0]) ? it[0] : null; }
    if (k === 'Ab') return metaAbility(p) || null;
    if (k === 'Nat') { const cs = commonSpread(p); return (cs && cs.nat) || topNature(p) || null; }
    if (k === 'Sp') { const cs = commonSpread(p), m = mvByName.get(dc.mv); return cs ? String(m && m.name === 'Body Press' ? cs.def : m && m.cat === 2 ? cs.spa : cs.atk) : null; }
  } catch (e) {} return null; };
V2.arnSetPick = (id, title) => { const sel = document.getElementById(id); if (!sel || sel.disabled) return; const E = V2.esc, mu = V2.arnMostUsed(id);
  const rows = [...sel.options].map(o => { const cur = o.value === sel.value, m = mu != null && o.value === mu;
    return `<button type="button" class="np-hit arn-opt" data-arnopt="${E(o.value)}"${cur ? ' aria-current="true"' : ''} aria-label="${E(o.text)}${m ? ', most used' : ''}${cur ? ', selected' : ''}"><span class="nm"><b>${E(o.text)}</b></span><span class="arn-tags" aria-hidden="true">${m ? '<small class="arn-mu">most used</small>' : ''}${cur ? '<small class="arn-cur">selected</small>' : ''}</span></button>`; }).join('');
  const sh = V2.sheet(`<div class="np-find"><h2 class="u">${E(title)}</h2><div class="hits" data-arnopts>${rows}</div></div>`, {label: title, small: true, focus: '[data-arnopts] [aria-current="true"]'});
  sh.querySelector('[data-arnopts]').addEventListener('click', e => { const h = e.target.closest('[data-arnopt]'); if (h) V2.arnSelPick(sel, h.dataset.arnopt); }); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.dc2 [data-arnmv],.dc2 [data-arnset]'); if (!b) return; b.focus({preventScroll: true});
  if (b.hasAttribute('data-arnmv')) V2.arnMvPick(); else V2.arnSetPick(b.dataset.arnset, b.dataset.arntitle); });
// a stage row: names its stat; minus / plus within today's range (-2 to +2)
V2.arnStage = (who, lab, b) => `<div class="arn-f arn-st" role="group" aria-label="${lab}"><span class="lb">${lab}</span><span class="ctl"><button type="button" data-arnst="${who}" data-d="-1" aria-label="Lower ${lab}"${b <= -2 ? ' disabled' : ''}>−</button><output class="u" id="dc${who === 'a' ? 'A' : 'D'}Bo" aria-live="polite">${b > 0 ? '+' + b : b < 0 ? '−' + -b : '±0'}</output><button type="button" data-arnst="${who}" data-d="1" aria-label="Raise ${lab}"${b >= 2 ? ' disabled' : ''}>+</button></span></div>`;
V2.arnSel = (h, lab) => `<label class="arn-f"><span class="vh">${lab}</span>${h}<i class="arw" aria-hidden="true"></i></label>`;
// Sim Q47 A: a set row is a button over today's select (still drawn, so the row reads as before; out of touch, Tab and screen readers)
// that opens the row's sheet; a disabled select (a Mega's stone) stays as it is
V2.arnSetBtn = (id, title, cur) => `<button type="button" class="arn-pickbtn" data-arnset="${id}" data-arntitle="${V2.esc(title)}" aria-haspopup="dialog" aria-label="${V2.esc(title)}: ${cur}. Choose another"></button>`;
V2.arnRow = (h, lab, title) => { h = h.replace('<select class="field"', '<select class="arn-sel"'); if (/<select[^>]* disabled/.test(h)) return V2.arnSel(h, lab);
  const id = (/id="([^"]+)"/.exec(h) || [])[1], cur = (/<option[^>]* selected[^>]*>([^<]*)</.exec(h) || /<option[^>]*>([^<]*)</.exec(h) || [])[1] || '';
  return `<div class="arn-f"><span class="vh">${lab}</span>${h.replace('<select class="arn-sel"', '<select class="arn-sel" tabindex="-1" aria-hidden="true"')}${V2.arnSetBtn(id, title, cur)}<i class="arw" aria-hidden="true"></i></div>`; };
// the two set cards: item, Ability, nature, points, stage (today's ids; the defender's points open HP, Def and Sp. Def)
V2.arnSets = C => { const E = V2.esc, W = V2.ARN_W, {A, D, mvC, bp_} = C, sel = C.sel, PTS = C.PTS;
  const spec = mvC && mvC.cat === 2, aStat = bp_ ? 'Def' : spec ? 'Sp. Atk' : 'Atk', defPhys = !mvC || mvC.cat !== 2 || ['Psyshock', 'Psystrike', 'Secret Sword'].includes(mvC.name), dStat = defPhys ? 'Def' : 'Sp. Def';
  const aPts = `<div class="arn-f arn-ov"><span class="lb">${aStat}${bp_ ? ' (Body Press)' : ''} <small>points</small></span><b class="v">${C.aShown}</b><i class="arw" aria-hidden="true"></i>${sel('dcASp', PTS(C.aShown), String(C.aShown)).replace('<select class="field"', '<select class="arn-pick arn-pickhid" tabindex="-1" aria-hidden="true"')}${V2.arnSetBtn('dcASp', `${W.attacker}'s ${aStat}${bp_ ? ' (Body Press)' : ''} points`, C.aShown)}</div>`;
  const ft = A.ability === 'Supreme Overlord' || (C.mv && C.mv.name === 'Last Respects') ? V2.arnRow(sel('dcAFt', [0, 1, 2, 3].map(x => [String(x), `${x} allies fainted`]), String(Math.min(3, dc.fainted || 0))), `Allies fainted (${A.ability === 'Supreme Overlord' ? 'Supreme Overlord: +10% power each' : 'Last Respects: +50 power each'})`, 'Allies fainted') : '';
  const box = (lab, h) => `<label class="arn-box"><span>${lab}</span>${h}</label>`;
  const dPts = `<details class="arn-pts" data-dcfold="p"${V2.dcOpen && V2.dcOpen.p ? ' open' : ''}><summary class="arn-f"><span class="lb">HP <b>${D.hpSp}</b> · ${defPhys ? 'Def' : 'SpD'} <b>${defPhys ? D.defSp : D.spdSp}</b> <small>${W.pts}</small></span><i class="arw" aria-hidden="true"></i></summary>
    <div class="arn-ptsbox">${box('HP points', sel('dcDHp', PTS(D.hpSp), String(D.hpSp)))}${box('Def points', sel('dcDDf', PTS(D.defSp), String(D.defSp)))}${box('Sp. Def points', sel('dcDSd', PTS(D.spdSp), String(D.spdSp)))}<p class="fine">66 points at most in all; 32 in one stat.</p></div></details>`;
  const card = (k, X, role, rows) => `<section class="arn-set ${k}" aria-label="${role}'s set"><header>${V2.arnImg(X.p.n, 'mini')}<span><b class="u">${role}</b><small>${E(V2.arnSide(X))}</small></span></header>${rows}</section>`;
  const rw = (h, lab, role) => V2.arnRow(h, lab, `${role}'s ${lab === 'Ability' ? lab : lab.toLowerCase()}`);
  return `<div class="arn-sets">${card('a', A, W.attacker, `${rw(C.itemSel('dcAIt', A), 'Item', W.attacker)}${rw(sel('dcAAb', A.p.a, A.ability), 'Ability', W.attacker)}${rw(sel('dcANat', NATURES, A.nat), 'Nature', W.attacker)}${aPts}${ft}${V2.arnStage('a', aStat + ' ' + W.stage, A.boost)}`)}
    ${card('d', D, W.defender, `${rw(C.itemSel('dcDIt', D), 'Item', W.defender)}${rw(sel('dcDAb', D.p.a, D.ability), 'Ability', W.defender)}${rw(sel('dcDNat', NATURES, D.nat), 'Nature', W.defender)}${dPts}${V2.arnStage('d', dStat + ' ' + W.stage, D.boost)}`)}</div>`; };
// the KO Board bar: one tap away; it opens today's board (both directions, the three groups, every hit's table)
V2.arnKB = C => { const W = V2.ARN_W, open = V2.dcOpen && V2.dcOpen.k;
  if (!C.ms.length) return `<details class="arn-kb" data-dcfold="k"${open ? ' open' : ''}><summary class="arn-kbbar"><span class="t u">${W.kbEmpty}</span><i class="chev" aria-hidden="true">›</i></summary><div class="arn-kbin">${V2.dcBoard(C)}</div></details>`;
  const L = V2.dcKB(), c = V2.dcCounts(L), n = Math.max(1, L.length), dir = dc.dir === 'theirs', wide = V2.kobWide();
  return `<details class="arn-kb" data-dcfold="k"${open ? ' open' : ''}><summary class="arn-kbbar"${wide ? ' aria-controls="arn-kbfull"' : ''}><span class="t u">${dir ? W.kbTheirs : W.kbMine}</span><span class="c">${c.ko} down in one hit · ${c.can} can go down · ${c.sv} survive</span>
    <span class="bar" aria-hidden="true"><i class="ko" style="width:${(100 * c.ko / n).toFixed(1)}%"></i><i class="can" style="width:${(100 * c.can / n).toFixed(1)}%"></i><i class="sv" style="width:${(100 * c.sv / n).toFixed(1)}%"></i></span><i class="chev" aria-hidden="true">›</i></summary>${wide ? '' : `<div class="arn-kbin">${V2.dcBoard(C)}</div>`}</details>`; };
// Q58 C: from 1024 the opened board spans the page under the Arena; shown while the bar above is open (the toggle handler below)
V2.arnKBFull = C => C.ms.length && V2.kobWide() ? `<div class="arn-kbfull" id="arn-kbfull"${V2.dcOpen && V2.dcOpen.k ? '' : ' hidden'}>${V2.dcBoard(C, true)}</div>` : '';
// notes on this hit (today's Details: HP numbers, KO odds in today's words, effectiveness, notes, Not counted, fewest points to survive, the set readout)
V2.arnNotes = C => { const E = V2.esc, {A, D, mv, r} = C; let notes = [], nc = [];
  if (mv && r && r.max > 0) { try { const x = calcResultNotes(A, D, mv, r, C.ord, C.ctx); notes = x.t; nc = x.nc; } catch (e) {} }
  let bulk = ''; if (r && r.max > 0) { try { const bs = bulkToSurvive(C.opt); if (bs) bulk = bs.none ? `${E(V2.disp(D.p.n))} can't survive this hit with any spread.` : `Fewest points to always survive: <b>${bs.hp} HP / ${bs.df} ${bs.stat}</b> (${bs.tot} total). ${r.max < r.hp ? 'This spread already survives.' : 'This spread does not.'}`; } catch (e) {} }
  const nt = [A.real || D.real ? 'spreads: most common on the Showdown ladder' : '', A.p.n === 'Aegislash' ? 'Aegislash attacks in Blade Forme (Atk/SpA 140)' : '', D.p.n === 'Aegislash' ? 'Aegislash takes hits in Shield Forme' : '', A.p.formNote || D.p.formNote ? 'Palafin in Hero Form' : '', dc.wSet || dc.tSet || !(dc.weather || dc.terrain) ? '' : 'field set by the Pokémon selected (change it above)'].filter(Boolean);
  const eff = r && r.max > 0 && r.eff !== 1 ? `${E(r.type)} is ${r.eff >= 4 ? 'super effective twice over' : r.eff >= 2 ? 'super effective' : r.eff <= .25 ? 'resisted twice over' : 'resisted'}` : '';
  /* Nov 21: Plot the hit (Sim, Nov 20: real HP numbers, not percentages): the damage in HP of the defender's HP, then the board's verdict words */
  const hpL = r && r.max > 0 ? `<p><b>${V2.PC_PCT_FIRST ? V2.pcPct(r) + '</b> (' + V2.pcDmg(r) + ' of ' + r.hp + ' HP)' : V2.pcDmg(r) + ' of ' + r.hp + ' HP</b>'}${r.hits > 1 ? ` · ${r.hits} hits` : ''} · ${E(V2.pcVerdict(r).big)}${eff ? ' · ' + eff : ''}</p>` : '';
  const wx = {sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow'}[dc.weather], tr = dc.terrain ? dc.terrain[0].toUpperCase() + dc.terrain.slice(1) + ' Terrain' : '';
  const set = mv ? `<p class="dc2-set"><span>${E(A.p.d || A.p.n)} ${C.aShown} ${C.mvC && C.mvC.cat === 2 ? 'Sp. Atk' : 'Atk'} points ${E(A.nat)}${A.item ? ' ' + E(A.item) : ''}, ${E(dc.mv)}${C.spread ? ' (spread)' : ''}</span> <span>vs ${E(D.p.d || D.p.n)} ${D.hpSp} HP / ${D.defSp} Def / ${D.spdSp} SpD ${E(D.nat)}${D.item ? ' ' + E(D.item) : ''}</span></p>` : '';
  return `<details class="arn-notes" data-dcfold="n"${V2.dcOpen && V2.dcOpen.n ? ' open' : ''}><summary><span>${V2.ARN_W.notes}</span><i class="chev" aria-hidden="true">›</i></summary><div class="arn-notesin">
    <p>Level 50 ${S.format === 'doubles' ? 'doubles' : 'singles'} · ${[wx || 'no weather', tr || 'no terrain', C.spread ? 'hits both foes' : ''].filter(Boolean).join(' · ')}</p>${hpL}
    ${notes.length ? `<p>${notes.join(' · ')}</p>` : ''}${nc.length ? `<p>Not counted: ${nc.join('; ')}.</p>` : ''}${bulk ? `<p>${bulk}</p>` : ''}${set}${nt.length ? `<p class="fine">${E(nt.map(x => x[0].toUpperCase() + x.slice(1)).join('. '))}.</p>` : ''}</div></details>`; };

V2.pages.calc = {place: 'battle', after() { /* the move names are fitted (V2.fitWords) once the logo font has loaded, as the old hand's were */ if (document.fonts && document.fonts.ready && !V2._arnFont) { V2._arnFont = 1; document.fonts.ready.then(() => { if (document.querySelector('.arn') && V2.fitWords) V2.fitWords(); }); } }, draw() { let C; try { C = calcData(); } catch (e) { console.error(e); return `<div class="dc2 arn"><h1 class="vh">Damage Calculator</h1>${V2.battleToolsBar('calc')}<p class="tm-sub">The calc couldn't load. Try again in a moment.</p></div>`; }
  const E = V2.esc, W = V2.ARN_W, wx = dc.weather || '', tr = dc.terrain || '', V = V2.arnVerdict(C);
  const set = C.mvs.pop.filter(m => m && m.bp > 0); let three = set.slice(0, 3); if (dc.mv && !three.some(m => m.name === dc.mv) && C.mv) three = [...three.slice(0, 2), C.mv];
  const row = (k, L, cur, lab) => `<div class="arn-pills arn-${k}r" role="group" aria-label="${lab}">${L.map(([v, t]) => `<button type="button" ${k === 'wx' ? 'data-dcw' : 'data-dcterr'}="${v}" style="--k:var(--arn-k-${v || 'none'})" aria-pressed="${v === cur}"${v === '' ? ` aria-label="${t}: no ${lab.toLowerCase()}"` : ''}>${V2.arnIc(v)}<span>${t}</span></button>`).join('')}</div>`;
  const sw = [['spread', 'Hits both foes'], ['screen', 'Screen up'], ['hh', 'Helping Hand'], ['fg', 'Friend Guard'], ['crit', 'Critical hit']];
  return `<div class="dc2 arn"><h1 class="vh">Damage Calculator · level 50 ${S.format === 'doubles' ? 'doubles' : 'singles'}</h1>${V2.battleToolsBar('calc')}
  <div class="arn-grid">
    <section class="arn-scene arn-w-${wx || 'clear'} arn-t-${tr || 'none'}" aria-label="The battle: ${E(V2.disp(C.A.p.n))} attacks ${E(V2.disp(C.D.p.n))}">${V2.arnArt(wx || 'clear', tr || 'none')}
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
  </div>${V2.arnKBFull(C)}</div>`; }};

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
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('.dc2 [data-dcfold]')) return; V2.dcOpen = V2.dcOpen || {}; V2.dcOpen[d.dataset.dcfold] = d.open;
  if (d.dataset.dcfold === 'k') { const f = document.querySelector('.dc2 .arn-kbfull'); if (f) f.hidden = !d.open; if (!d.open) V2.kobUi.g = 'ko'; } }, true);
