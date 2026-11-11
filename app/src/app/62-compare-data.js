/* ---------- Compare: the data part (R4, Nov 11; shared by today's page and the new build, moved from 63-compare.js) ----------
   Each side is worked out with the same functions the Team page uses, on a copy of the slots (S.slots is never touched). */
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
  if (src.startsWith('e:')) { const x = evTeam(k); return x ? {name: teamWho(x.t), sub: `${x.t.place ? placeTxt(x.t.place) + ' · ' : ''}${x.ev.name}`, slots: cxSheetSlots(x.t.mons)} : null; }
  if (src.startsWith('t:')) { const t = META.teams && META.teams.teams[+k]; if (!t) return null; let slots = null;
    /* the event's full sheet when we have it (moves, items, abilities), like Load team */
    try { const key = t.mons.slice().sort().join('|'); for (const ev of (META.events && META.events.events) || []) for (const x of ev.top || []) if (!slots && x.player === t.player && x.mons.map(m => m.n).sort().join('|') === key) slots = cxSheetSlots(x.mons); } catch (e) {}
    return {name: `${teamWho(t)}`, sub: [t.record, t.event].filter(Boolean).join(' · '), slots: slots || normSlots(t.mons.map(n => ({n, a: null, lock: false})))}; }
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
/* the rows as data (R4, Nov 11; today's cxRows draws them, so does the new build): {k, label, a, b, diff, say}, a/b being each side's value */
function cxFacts(a, b) { const rows = [], NA = 'Team A', NB = 'Team B';
  const add = (k, label, va, vb, diff, say) => rows.push({k, label, a: va, b: vb, diff: !!diff, say: say || ''});
  add('grade', 'Strength Score', a.G || null, b.G || null, a.G && b.G && a.G.s !== b.G.s, a.G && b.G && a.G.s !== b.G.s ? `Strength Score: ${CH.gradeNum(a.G)} for ${NA}, ${CH.gradeNum(b.G)} for ${NB}.` : '');
  /* readiness: the rows each side has no answer for (level 0) and is shaky against (level 1) */
  const lv = I => { const c = [0, 0]; for (const r of (I.RD ? I.RD.rows : [])) if (r.level < 2) c[r.level]++; return c; };
  add('ready', 'Ready for the top 30 threats', a.RD ? {RD: a.RD, lv: lv(a)} : null, b.RD ? {RD: b.RD, lv: lv(b)} : null, a.RD && b.RD && a.RD.score !== b.RD.score, a.RD && b.RD && Math.abs(a.RD.score - b.RD.score) >= 3 ? `${a.RD.score > b.RD.score ? NA : NB} is ready for more of the top 30 threats (${Math.max(a.RD.score, b.RD.score)}% vs ${Math.min(a.RD.score, b.RD.score)}% ready).` : '');
  /* threats one handles (Handled or better) and the other doesn't */
  const only = (X, Y) => X.RD && Y.RD ? X.RD.rows.filter(r => r.level >= 2 && (Y.thr.get(r.t.n) || {level: 0}).level < 2).sort((p, q) => q.t.w - p.t.w) : [];
  const oA = only(a, b), oB = only(b, a);
  const nm = L => L.slice(0, 3).map(r => r.t.d).join(', ') + (L.length > 3 ? ` and ${L.length - 3} more` : '');
  add('thr', 'Top threats only this team handles', oA, oB, oA.length || oB.length, [oA.length ? `${NA} handles ${nm(oA)}; ${NB} doesn't.` : '', oB.length ? `${NB} handles ${nm(oB)}; ${NA} doesn't.` : ''].filter(Boolean).join(' '));
  /* the team checks: true / false, or null when not counted */
  const ck = (I, k) => { const x = I.CK && I.CK.items.find(i => i.k === k); return x ? (x.skip ? null : !!x.ok) : null; };
  const keys = (a.CK || b.CK || {items: []}).items.map(x => [x.k, x.label]);
  for (const [k, label] of keys) { const x = ck(a, k), y = ck(b, k);
    add('ck:' + k, label, x, y, x != null && y != null && x !== y, k !== 'reach' && x != null && y != null && x !== y ? `${label}: only ${x ? NA : NB} has it.` : ''); }
  /* speed: fastest and slowest likely stat, in the side's own weather */
  const sv = I => I.spd && I.spd.length ? {spd: I.spd, wxS: I.wxS} : null;
  add('spd', 'Speed (likely stat)', sv(a), sv(b), a.spd && b.spd && a.spd.length && b.spd.length && (a.spd[0].v !== b.spd[0].v || a.spd[a.spd.length - 1].v !== b.spd[b.spd.length - 1].v), '');
  const sc = I => { const t = I.A ? I.A.setters.tw : [], r = I.A ? I.A.setters.tr : []; return {t, r, txt: [t.length ? `Tailwind: ${cxWho(t, 2)}` : '', r.length ? `Trick Room: ${cxWho(r, 2)}` : ''].filter(Boolean)}; };
  const sa = sc(a), sb = sc(b), mode = s => (s.t.length ? 'T' : '') + (s.r.length ? 'R' : '');
  const scSay = (() => { const out = []; for (const [w, lab] of [['t', 'Tailwind'], ['r', 'Trick Room']]) { const x = sa[w].length > 0, y = sb[w].length > 0; if (x !== y) out.push(`${x ? NA : NB} has ${lab}; ${x ? NB : NA} doesn't.`); } return out.join(' '); })();
  add('sc', 'Tailwind / Trick Room', sa, sb, mode(sa) !== mode(sb), scSay);
  /* every weather or terrain a Pokémon on the team sets; active = something on the team uses it */
  const fx = I => I.A ? I.A.field : [], fl = I => fx(I).map(x => x.name);
  const fa = fl(a), fb = fl(b);
  const fSay = (() => { const out = []; for (const x of fa) if (!fb.includes(x)) out.push(`${NA} sets ${x.toLowerCase()}; ${NB} doesn't.`); for (const x of fb) if (!fa.includes(x)) out.push(`${NB} sets ${x.toLowerCase()}; ${NA} doesn't.`); return out.join(' '); })();
  add('field', 'Weather / terrain', fx(a), fx(b), fa.join() !== fb.join(), fSay);
  const weak = I => I.a ? I.a.rows.filter(r => r.w - r.r >= 2).sort((p, q) => (q.w - q.r) - (p.w - p.r)).map(r => r.atk) : [];
  const wa = weak(a), wb = weak(b);
  const wSay = (() => { const x = wa.filter(t => !wb.includes(t)), y = wb.filter(t => !wa.includes(t)); return [x.length ? `${NA} is weak to ${x.slice(0, 2).join(' and ')}; ${NB} isn't.` : '', y.length ? `${NB} is weak to ${y.slice(0, 2).join(' and ')}; ${NA} isn't.` : ''].filter(Boolean).join(' '); })();
  add('weak', 'Weak to (hits 2+ more than resist)', wa, wb, wa.join() !== wb.join(), wSay);
  const ur = I => I.a ? I.a.unresisted : [];
  add('unres', 'Types nobody resists', ur(a), ur(b), ur(a).join() !== ur(b).join(), '');
  const off = I => I.pr ? I.pr.off : null;
  add('off', 'Types it hits super effectively', off(a), off(b), off(a) !== off(b), '');
  add('arch', 'Archetype', a.A ? {label: a.A.label} : null, b.A ? {label: b.A.label} : null, (a.A && a.A.label) !== (b.A && b.A.label), '');
  /* your own games, kept apart from the tournament record */
  if ((a.rec && a.rec.n) || (b.rec && b.rec.n)) add('mine', 'Your games with this six', a.rec, b.rec, true, '');
  return rows; }
const cxWho = (ms, n = 3) => ms.slice(0, n).map(m => m.d).join(', ') + (ms.length > n ? ` +${ms.length - n}` : '');
