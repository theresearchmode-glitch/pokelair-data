/* ---------- Compare two teams side by side (Nov) ----------
   Any two of: My team, a saved team, a winning tournament team, or a pasted Showdown team. Each side is worked out with the
   same functions the Team page uses (members via teamRating, readiness via prepOf, the 7 checks via proChecks, the letter
   via CH.gradeOf / CH.gradeWhy), on a copy of the slots: S.slots is never touched, so nothing re-renders or saves.
   Results are cached per team and data version, and worked out a frame after the tap so the page answers at once.
   Rows show what differs first; rows that are the same on both sides fold away. Facts only, no head-to-head prediction. */
const CX = {cache: new Map(), busy: false};
ui.cx = ui.cx || {A: null, B: null, pick: null, paste: {}, same: false, wmore: 0};
/* a tournament sheet (events.json shape) as slots, the same mapping loadSheet uses, without loading it */
function cxSheetSlots(mons) { return normSlots(mons.map(m => { const p = byName.get(m.n); const mv = (m.mv || []).filter(x => mvByName.has(x)); while (mv.length < 4) mv.push('');
  return {n: m.n, a: p.a.includes(m.a) ? m.a : null, lock: false, ...(mv.some(Boolean) ? {mv: {doubles: mv.slice(0, 4)}} : {}), ...(!p.m && m.i && typeof m.i === 'string' ? {it: {doubles: m.i}} : {})}; })); }
/* a source: 'cur' | 's:<saved id>' | 'e:<event id>#<k>' | 't:<top team index>' | 'p:A' / 'p:B' (pasted) */
function cxResolve(src) { if (!src) return null; try {
  if (src === 'cur') { const ms = members(); return {name: ms.length ? teamTitleFor(ms) : 'My team', sub: 'My team · open now', slots: JSON.parse(JSON.stringify(S.slots))}; }
  const k = src.slice(2);
  if (src.startsWith('s:')) { const t = S.teams.find(x => x.id === k); return t ? {name: t.name, sub: 'Saved team', slots: t.slots} : null; }
  if (src.startsWith('e:')) { const x = evTeam(k); return x ? {name: `${x.t.player}'s team`, sub: `${x.t.place ? placeTxt(x.t.place) + ' · ' : ''}${x.ev.name}`, slots: cxSheetSlots(x.t.mons)} : null; }
  if (src.startsWith('t:')) { const t = META.teams && META.teams.teams[+k]; if (!t) return null; let slots = null;
    /* the event's full sheet when we have it (moves, items, abilities), like Load team */
    try { const key = t.mons.slice().sort().join('|'); for (const ev of (META.events && META.events.events) || []) for (const x of ev.top || []) if (!slots && x.player === t.player && x.mons.map(m => m.n).sort().join('|') === key) slots = cxSheetSlots(x.mons); } catch (e) {}
    return {name: `${t.player}'s team`, sub: [t.record, t.event].filter(Boolean).join(' · '), slots: slots || normSlots(t.mons.map(n => ({n, a: null, lock: false})))}; }
  if (src.startsWith('p:')) { const p = ui.cx.paste[k]; return p ? {name: 'Pasted team', sub: 'From a Showdown paste', slots: p} : null; }
  } catch (e) {} return null; }
const cxKey = slots => metaVersion + '|' + megaGoal() + '|' + JSON.stringify(slots);
/* everything one side needs, from the existing engines */
function cxInfo(slots) { const key = cxKey(slots); if (CX.cache.has(key)) return CX.cache.get(key);
  const {ms, a} = teamRating(slots); let o = {ms, a, n: ms.length};
  if (ms.length) {
    try { o.RD = prepOf(ms); } catch (e) {}
    try { o.CK = proChecks(ms, true); } catch (e) {}
    try { o.G = o.RD ? Object.assign(CH.gradeOf(o.RD, o.CK, ms), {r: o.RD.score}) : null; } catch (e) {}
    try { o.A = teamArchetype(ms); } catch (e) {}
    try { o.pr = teamProfile(ms, true); } catch (e) {}
    try { const F = sideField(ms); o.wx = F.weather;
      o.spd = ms.map(m => { const s = likelySpeed(m.p, m); return {m, v: spdCalc(s.v, s.scarf, m.ability, F.weather, {}), scarf: s.scarf}; }).sort((x, y) => y.v - x.v); o.wxS = F.weather; } catch (e) {}
    o.thr = new Map(o.RD ? o.RD.rows.map(r => [r.t.n, r]) : []);
    try { o.rec = typeof myGames === 'function' ? myGames(ms) : null; } catch (e) {}
  }
  if (CX.cache.size > 24) CX.cache.delete(CX.cache.keys().next().value); CX.cache.set(key, o); return o; }
/* open the page: sides as source strings ('' = pick one) */
function cxGo(a, b) { if (a === 'cur' && !members().length) { a = b; b = ''; }
  ui.cx.A = a || null; ui.cx.B = b || null; ui.cx.pick = !ui.cx.A ? 'A' : !ui.cx.B ? 'B' : null; ui.cx.same = false;
  if (view !== 'compare') setView('compare'); else renderCompare(); }
const cxBadge = s => `<span class="cxbadge ${s === 'A' ? 'a' : 'b'}" aria-hidden="true">${s}</span>`;
const cxDn = n => (byName.get(n) || {}).d || n;
function cxWho(ms, n = 3) { return ms.slice(0, n).map(m => esc(m.d)).join(', ') + (ms.length > n ? ` +${ms.length - n}` : ''); }
/* the picker: where a side can come from */
function cxPicker(side) { const other = ui.cx[side === 'A' ? 'B' : 'A'];
  const opt = (src, title, sub, sprites) => `<button type="button" class="cxopt${other === src ? ' dim' : ''}" data-cxset="${side}|${esc(src)}"><span class="cxot"><b>${esc(title)}</b>${sub ? `<span class="t2">${esc(sub)}</span>` : ''}</span><span class="cxos">${sprites}</span></button>`;
  const spr = names => names.map(n => sprite(byName.get(n), 'tiny') || '').join('');
  const mine = members(), parts = [];
  if (mine.length) parts.push(`<div class="chk">My team</div>${opt('cur', teamTitleFor(mine), 'Open now', spr(mine.map(m => m.p.n)))}`);
  const sv = S.teams.filter(t => t.format !== 'singles');
  if (sv.length) parts.push(`<div class="chk">Saved teams</div>${sv.map(t => opt('s:' + t.id, t.name, '', spr(teamRating(t.slots).ms.map(m => m.p.n)))).join('')}`);
  { const pool = typeof tsPool === 'function' ? tsPool().filter(x => x.t.place === 1) : [], cap = 6 + ui.cx.wmore * 10;
    if (pool.length) parts.push(`<div class="chk">Winning teams · event winners, newest first</div>${pool.slice(0, cap).map(x => opt('e:' + x.key, `${x.t.player}'s team`, `Won ${x.ev.name} · ${evDate(x.ev.date)}`, spr(x.t.mons.map(m => m.n)))).join('')}${pool.length > cap ? `<button type="button" class="chghost cxmore" data-cxwmore="1">Show ${Math.min(10, pool.length - cap)} more winners</button>` : ''}<p class="t2">Any other tournament team: tap Compare on its card in Winning teams.</p>`); }
  parts.push(`<div class="chk">Paste a Showdown team</div><textarea class="field paste cxpaste" id="cxPaste" rows="5" placeholder="Paste a team from Showdown, Pokémon Zone, Pikalytics or Victory Road" aria-label="Showdown team text"></textarea><div class="row"><button type="button" class="chghost" data-cxpaste="${side}">Use this team</button></div><div class="t2" id="cxPasteNote" aria-live="polite"></div>`);
  return `<div class="cxpick" id="cxPick"><div class="cxpickh">${cxBadge(side)}<b>Pick team ${side}</b>${ui.cx[side] ? `<button type="button" class="linkbtn" data-cxpickx="1">Cancel</button>` : ''}</div>${parts.join('')}</div>`; }
/* one side's header card */
function cxHead(side, R, I) {
  if (!R) return `<button type="button" class="cxhead empty ${side === 'A' ? 'a' : 'b'}" data-cxpick="${side}">${cxBadge(side)}<span class="cxnm">Pick team ${side}</span><span class="t2">My team, saved, winning or pasted</span></button>`;
  const ms = I ? I.ms : teamRating(R.slots).ms;
  return `<div class="cxhead ${side === 'A' ? 'a' : 'b'}">${cxBadge(side)}<div class="cxnm">${esc(R.name)}</div><div class="t2 cxsub">${esc(R.sub || '')}</div>
    <div class="cxsix">${ms.map(m => `<span title="${esc(m.d)}">${sprite(m.p) || esc(m.d)}</span>`).join('')}${Array.from({length: Math.max(0, 6 - ms.length)}, () => '<span class="cxe" aria-hidden="true"></span>').join('')}</div>
    <button type="button" class="linkbtn cxchg" data-cxpick="${side}" aria-label="Change team ${side}">Change</button></div>`; }
/* the rows, each [key, label, htmlA, htmlB, differs, sentence] */
function cxRows(RA, RB, a, b) { const rows = [], NA = 'Team A', NB = 'Team B';
  const add = (k, label, x, y, diff, say) => rows.push({k, label, x, y, diff: !!diff, say: say || ''});
  /* grade */
  const gl = I => I.G ? `<span class="cxgr" style="color:${CH.gcol(I.G.letter)}">${I.G.letter}</span><span class="cxgs">${I.G.rec ? `Tournament record: won ${Math.round(I.G.rec.wr * 100)}% of ${CH.n(I.G.rec.g)} games` : I.G.partial ? `grade ${I.G.s} so far` : `grade ${CH.gradeSumS(I.G, I.RD)}`}</span>` : '<span class="t2">Add Pokémon first</span>';
  add('grade', 'Grade', gl(a), gl(b), a.G && b.G && a.G.letter !== b.G.letter, a.G && b.G && a.G.letter !== b.G.letter ? `Grade: ${a.G.letter} for ${NA}, ${b.G.letter} for ${NB}.` : '');
  /* readiness */
  const lv = I => { const c = [0, 0]; for (const r of (I.RD ? I.RD.rows : [])) if (r.level < 2) c[r.level]++; return c; };
  const rd = I => I.RD ? `<span class="cxl"><b>${I.RD.score}%</b> ready</span><span class="cxl dbhand">${hRing(CH.hand(I.RD), 24)}${CH.handTxt(I.RD, true)}</span><span class="t2 cxl">${lv(I)[1]} shaky · ${lv(I)[0]} unanswered</span>` : '—';
  add('ready', 'Ready for the top 30 threats', rd(a), rd(b), a.RD && b.RD && a.RD.score !== b.RD.score, a.RD && b.RD && Math.abs(a.RD.score - b.RD.score) >= 3 ? `${a.RD.score > b.RD.score ? NA : NB} is ready for more of the top 30 threats (${Math.max(a.RD.score, b.RD.score)}% vs ${Math.min(a.RD.score, b.RD.score)}% ready).` : '');
  /* threats one handles (Handled or better) and the other doesn't */
  const only = (X, Y) => X.RD && Y.RD ? X.RD.rows.filter(r => r.level >= 2 && (Y.thr.get(r.t.n) || {level: 0}).level < 2).sort((p, q) => q.t.w - p.t.w) : [];
  const oA = only(a, b), oB = only(b, a);
  const tl = L => L.length ? `<div class="cxthr">${L.slice(0, 5).map(r => `<span>${sprite(byName.get(r.t.n), 'tiny') || ''}${esc(r.t.d)}</span>`).join('')}${L.length > 5 ? `<span class="t2">+${L.length - 5} more</span>` : ''}</div>` : '<span class="t2">None</span>';
  const nm = L => L.slice(0, 3).map(r => r.t.d).join(', ') + (L.length > 3 ? ` and ${L.length - 3} more` : '');
  add('thr', 'Top threats only this team handles', tl(oA), tl(oB), oA.length || oB.length, [oA.length ? `${NA} handles ${nm(oA)}; ${NB} doesn't.` : '', oB.length ? `${NB} handles ${nm(oB)}; ${NA} doesn't.` : ''].filter(Boolean).join(' '));
  /* the 7 team checks */
  const ck = (I, k) => { const x = I.CK && I.CK.items.find(i => i.k === k); return x ? (x.skip ? null : !!x.ok) : null; };
  const keys = (a.CK || b.CK || {items: []}).items.map(x => [x.k, x.label]);
  for (const [k, label] of keys) { const x = ck(a, k), y = ck(b, k), m = v => v == null ? '<span class="cxck un" title="Not counted">?</span>' : v ? '<span class="cxck ok" aria-label="Yes">✓</span>' : '<span class="cxck no" aria-label="No">✗</span>';
    add('ck:' + k, label, m(x), m(y), x != null && y != null && x !== y, k !== 'reach' && x != null && y != null && x !== y ? `${label}: only ${x ? NA : NB} has it.` : ''); }
  /* speed */
  /* Nov 2: each speed in plain terms too, against the top 30 threats (outspeedOf, the Speed tiers page's count) */
  const osT = (I, x) => { const r = typeof outspeedOf === 'function' ? outspeedOf(x.v, I.wxS || '', {}) : null; return r ? `<span class="t2 cxl">outspeeds ${r.pct}% of the top ${r.n}</span>` : ''; };
  const sp = I => I.spd && I.spd.length ? `<span class="cxl">Fastest <b>${esc(I.spd[0].m.d)}</b> ${I.spd[0].v}</span>${osT(I, I.spd[0])}<span class="cxl">Slowest <b>${esc(I.spd[I.spd.length - 1].m.d)}</b> ${I.spd[I.spd.length - 1].v}</span>${osT(I, I.spd[I.spd.length - 1])}` : '—';
  add('spd', 'Speed (likely stat)', sp(a), sp(b), a.spd && b.spd && a.spd.length && b.spd.length && (a.spd[0].v !== b.spd[0].v || a.spd[a.spd.length - 1].v !== b.spd[b.spd.length - 1].v), '');
  const sc = I => { const t = I.A ? I.A.setters.tw : [], r = I.A ? I.A.setters.tr : []; return {t, r, txt: [t.length ? `Tailwind: ${cxWho(t, 2)}` : '', r.length ? `Trick Room: ${cxWho(r, 2)}` : ''].filter(Boolean)}; };
  const sa = sc(a), sb = sc(b), mode = s => (s.t.length ? 'T' : '') + (s.r.length ? 'R' : '');
  const scSay = (() => { const out = []; for (const [w, lab] of [['t', 'Tailwind'], ['r', 'Trick Room']]) { const x = sa[w].length > 0, y = sb[w].length > 0; if (x !== y) out.push(`${x ? NA : NB} has ${lab}; ${x ? NB : NA} doesn't.`); } return out.join(' '); })();
  add('sc', 'Tailwind / Trick Room', sa.txt.length ? sa.txt.map(x => `<span class="cxl">${x}</span>`).join('') : '<span class="t2">Neither</span>', sb.txt.length ? sb.txt.map(x => `<span class="cxl">${x}</span>`).join('') : '<span class="t2">Neither</span>', mode(sa) !== mode(sb), scSay);
  /* weather and terrain */
  /* every weather or terrain a Pokémon on the team sets; one nothing on the team uses says so */
  const fx = I => I.A ? I.A.field : [], fl = I => fx(I).map(x => x.name);
  const fa = fl(a), fb = fl(b), fj = I => fx(I).length ? fx(I).map(x => `<span class="cxl"><b>${esc(x.name)}</b>${x.active ? '' : ' <span class="t2">(nothing uses it)</span>'}</span>`).join('') : '<span class="t2">None</span>';
  const fSay = (() => { const out = []; for (const x of fa) if (!fb.includes(x)) out.push(`${NA} sets ${x.toLowerCase()}; ${NB} doesn't.`); for (const x of fb) if (!fa.includes(x)) out.push(`${NB} sets ${x.toLowerCase()}; ${NA} doesn't.`); return out.join(' '); })();
  add('field', 'Weather / terrain', fj(a), fj(b), fa.join() !== fb.join(), fSay);
  /* types */
  const weak = I => I.a ? I.a.rows.filter(r => r.w - r.r >= 2).sort((p, q) => (q.w - q.r) - (p.w - p.r)).map(r => r.atk) : [];
  const wa = weak(a), wb = weak(b), tj = (L, none) => L.length ? `<span class="cxty">${L.slice(0, 4).map(t => chip(t)).join('')}${L.length > 4 ? `<span class="t2">+${L.length - 4}</span>` : ''}</span>` : `<span class="t2">${none}</span>`;
  const wSay = (() => { const x = wa.filter(t => !wb.includes(t)), y = wb.filter(t => !wa.includes(t)); return [x.length ? `${NA} is weak to ${x.slice(0, 2).join(' and ')}; ${NB} isn't.` : '', y.length ? `${NB} is weak to ${y.slice(0, 2).join(' and ')}; ${NA} isn't.` : ''].filter(Boolean).join(' '); })();
  add('weak', 'Weak to (hits 2+ more than resist)', tj(wa, 'No type hits 2+ more than resist'), tj(wb, 'No type hits 2+ more than resist'), wa.join() !== wb.join(), wSay);
  const ur = I => I.a ? I.a.unresisted : [];
  add('unres', 'Types nobody resists', tj(ur(a), 'Every type is resisted'), tj(ur(b), 'Every type is resisted'), ur(a).join() !== ur(b).join(), '');
  const off = I => I.pr ? I.pr.off : null;
  add('off', 'Types it hits super effectively', off(a) != null ? `<span class="cxl"><b>${off(a)}</b> of 18</span>` : '—', off(b) != null ? `<span class="cxl"><b>${off(b)}</b> of 18</span>` : '—', off(a) !== off(b), '');
  /* archetype */
  const ar = I => I.A ? `<span class="archchips">${archChips(I.A.label)}</span>` : '—';
  add('arch', 'Archetype', ar(a), ar(b), (a.A && a.A.label) !== (b.A && b.A.label), '');
  /* your own games, kept apart from the tournament record */
  if ((a.rec && a.rec.n) || (b.rec && b.rec.n)) { const yg = I => I.rec && I.rec.n ? `<span class="cxl"><b>${I.rec.w}–${I.rec.l}</b></span><span class="t2 cxl">${I.rec.n} game${I.rec.n === 1 ? '' : 's'} you logged</span>` : '<span class="t2">None logged</span>';
    add('mine', 'Your games with this six', yg(a), yg(b), true, ''); }
  return rows; }
function renderCompare() { const el = $('cxOut'); if (!el) return; const sec = $('compare'); try { CH.pagehead(sec, 'Compare · two teams side by side', 'Compare teams', ''); } catch (e) {}
  const RA = cxResolve(ui.cx.A), RB = cxResolve(ui.cx.B); if (!RA) ui.cx.A = null; if (!RB) ui.cx.B = null;
  if (!ui.cx.pick && (!RA || !RB)) ui.cx.pick = !RA ? 'A' : 'B';
  const IA = RA && CX.cache.get(cxKey(RA.slots)), IB = RB && CX.cache.get(cxKey(RB.slots));
  const heads = `<div class="cxheads">${cxHead('A', RA, IA)}${cxHead('B', RB, IB)}</div>${RA && RB ? '<div class="cxswap"><button type="button" class="linkbtn" data-cxswap="1">Swap A and B</button></div>' : ''}`;
  const pick = ui.cx.pick ? cxPicker(ui.cx.pick) : '';
  if (!RA || !RB) { el.innerHTML = heads + pick; return; }
  /* work out what isn't cached yet a frame later, one side at a time, so the tap answers at once */
  if (!IA || !IB) { el.innerHTML = heads + pick + '<div class="empty-note abbusy cxbusy" role="status"><span class="abspin" aria-hidden="true"></span>Working out both teams: grade, threats, checks and speed…</div>';
    if (!CX.busy) { CX.busy = true; const step = () => requestAnimationFrame(() => setTimeout(() => { try { const R = [cxResolve(ui.cx.A), cxResolve(ui.cx.B)].find(r => r && !CX.cache.has(cxKey(r.slots))); if (R) { cxInfo(R.slots); step(); return; } } catch (e) {} CX.busy = false; if (view === 'compare') renderCompare(); }, 0)); step(); }
    return; }
  const rows = cxRows(RA, RB, IA, IB), diff = rows.filter(r => r.diff), same = rows.filter(r => !r.diff), says = ['thr', 'sc', 'field', 'grade', 'ready', 'weak'].map(k => (rows.find(r => r.k === k) || {}).say).concat(rows.filter(r => r.k.startsWith('ck:')).map(r => r.say)).filter(Boolean);
  const row = r => `<div class="cxrow${r.diff ? ' diff' : ''}"><div class="cxlab">${esc(r.label)}</div><div class="cxc a">${r.x}</div><div class="cxc b">${r.y}</div></div>`;
  const why = IA.G || IB.G ? `<details class="cxwhy"><summary>Why these grades</summary>${[['A', IA], ['B', IB]].map(([s, I]) => I.G ? `<div class="cxwhyi">${cxBadge(s)}${CH.gradeWhy(I.G).replace(' id="chGwhy"', '')}</div>` : '').join('')}<p class="t2">${esc(CH.LEGEND)}</p></details>` : '';
  el.innerHTML = heads + pick
    + (says.length ? `<div class="cxsum"><div class="chk">What's different</div><ul>${says.slice(0, 6).map(s => `<li>${esc(s).replace(/Team A/g, '<span class="cxtm a">Team A</span>').replace(/Team B/g, '<span class="cxtm b">Team B</span>')}</li>`).join('')}</ul></div>` : `<div class="cxsum"><div class="chk">What's different</div><p class="t2">These two line up the same on every row below.</p></div>`)
    + `<div class="cxgrid">${diff.map(row).join('')}</div>${why}`
    + (same.length ? `<details class="cxsame"${ui.cx.same ? ' open' : ''}><summary>Same on both <span class="t2">${same.length} row${same.length === 1 ? '' : 's'}</span></summary><div class="cxgrid">${same.map(row).join('')}</div></details>` : '')
    + `<p class="t2 cxfoot">Grades and readiness are the same as on My team: preparation for the top 30 threats, not a prediction. Speeds are the likely stat (your spread, or the most common one), in each team's own weather.</p>`; }
document.addEventListener('toggle', e => { const d = e.target; if (d && d.classList && d.classList.contains('cxsame')) ui.cx.same = d.open; }, true);
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-cxgo],[data-cxset],[data-cxpick],[data-cxpickx],[data-cxswap],[data-cxpaste],[data-cxwmore]'); if (!b) return; const d = b.dataset;
  if (d.cxgo != null) { const [a, c] = d.cxgo.split('|'); cxGo(a, c); return; }
  if (d.cxset) { const i = d.cxset.indexOf('|'), side = d.cxset.slice(0, i); ui.cx[side] = d.cxset.slice(i + 1); ui.cx.pick = !ui.cx.A ? 'A' : !ui.cx.B ? 'B' : null; ui.cx.wmore = 0; renderCompare(); try { $('cxOut').scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (er) {} return; }
  if (d.cxpick) { ui.cx.pick = ui.cx.pick === d.cxpick ? null : d.cxpick; renderCompare(); const p = $('cxPick'); if (p && p.scrollIntoView) p.scrollIntoView({block: 'nearest', behavior: 'smooth'}); return; }
  if (d.cxpickx) { ui.cx.pick = null; renderCompare(); return; }
  if (d.cxwmore) { ui.cx.wmore++; keepScroll(() => renderCompare()); return; }
  if (d.cxswap) { const t = ui.cx.A; ui.cx.A = ui.cx.B; ui.cx.B = t; const p = ui.cx.paste; if (p.A || p.B) { ui.cx.paste = {A: p.B, B: p.A}; if (ui.cx.A === 'p:B') ui.cx.A = 'p:A'; if (ui.cx.B === 'p:A') ui.cx.B = 'p:B'; } renderCompare(); return; }
  if (d.cxpaste) { const side = d.cxpaste, ta = $('cxPaste'), note = $('cxPasteNote'); let r = null; try { r = parsePaste(ta ? ta.value : ''); } catch (er) {}
    if (!r || !r.slots.length) { if (note) note.textContent = 'No Pokémon found in that text. Paste the team as Showdown exports it.'; return; }
    ui.cx.paste[side] = normSlots(r.slots); ui.cx[side] = 'p:' + side; ui.cx.pick = !ui.cx.A ? 'A' : !ui.cx.B ? 'B' : null; renderCompare(); if (r.notes.length) toast(r.notes[0]); } });
