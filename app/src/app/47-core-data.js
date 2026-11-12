// ---------- Winning cores: the data (moved unchanged from 48-cores.js, Nov 12; shared by today's page and the new build) ----------
// Today's drawing and actions (renderCores, bindCoreIn, useCore) stay in 48-cores.js.
let coreUi = {kind: 'pairs', sort: 'win', mon: null, more: 0, confirm: null};
const CORE_MIN = {pairs: 60, trios: 0, teams: 3};
function coreRows() {
  if (!RES) return [];
  // shrinkage (Oct 28 audit): a core's win rate is pulled toward average as if 300 average teams had also run it, so a
  // high rate over a few dozen teams can't top the list (it was 40, which let 63-team cores lead). Full teams have few
  // entries each, so they get a smaller prior of 20.
  const base = +RES.base || .5, tot = +RES.teams || 0, k = coreUi.kind === 'teams' ? 20 : 300, adj = (wr, n) => (wr * n + base * k) / (n + k);
  // what its members win on their own (each shrunk the same way): a core that only wins because one member always wins
  // (or because strong players favour that member) shows little "together" gain
  const own = n => { const r = RES.mons && RES.mons[n]; return r ? adj(+r[1], +r[0]) : base; };
  let rows = [];
  if (coreUi.kind === 'pairs') rows = Object.entries(RES.pairs || {}).map(([key, v]) => ({ns: key.split('|'), n: +v[0], wr: +v[1]})).filter(x => x.n >= CORE_MIN.pairs);
  else if (coreUi.kind === 'trios') rows = (RES.cores || []).map(c => ({ns: c.slice(0, 3), n: +c[3], wr: +c[4]})).filter(x => x.n >= (RES.minCore || 6));
  else rows = (RES.proven || []).map(x => ({ns: x[0], n: +x[1], wr: +x[2]})).filter(x => Array.isArray(x.ns) && x.n >= CORE_MIN.teams);
  rows = rows.filter(x => x.ns.every(n => byName.get(n)));
  if (coreUi.mon) { const b = (byName.get(coreUi.mon) || {}).b; rows = rows.filter(x => x.ns.some(n => n === coreUi.mon || (byName.get(n) || {}).b === b)); }
  rows.forEach(x => { x.score = adj(x.wr, x.n); x.use = tot ? 100 * x.n / tot : 0; x.d = x.wr - base; x.tog = x.ns.length <= 3 ? x.score - x.ns.reduce((a, n) => a + own(n), 0) / x.ns.length : null; });
  rows.sort((a, b) => coreUi.sort === 'use' ? b.n - a.n : b.score - a.score);
  return rows; }
let coreTagCache = new Map();
function coreTags(ns) { const key = metaVersion + '|' + ns.join(','); if (coreTagCache.has(key)) return coreTagCache.get(key);
  let out = []; try { withFormat('doubles', () => { const ms = ns.map(n => abMember(byName.get(n))), r = teamRoles(ms);
    for (const a of r.arch) if (a.active) out.push(a.name);
    const tr = ms.filter(m => relMove(m, ROLE.tr)[0] >= .5), tw = ms.filter(m => relMove(m, ROLE.tw)[0] >= .5);
    if (tr.length) out.push('Trick Room'); if (tw.length) out.push('Tailwind'); else if (r.speed.length && !tr.length) out.push('Speed control');
    if (r.fake.length) out.push('Fake Out'); if (r.redirect.length) out.push('Redirection'); if (r.intim.length) out.push('Intimidate');
    if (ms.filter(m => m.mega).length) out.push('Mega'); }); } catch (e) {}
  out = [...new Set(out)].slice(0, 2); if (coreTagCache.size > 400) coreTagCache.clear(); coreTagCache.set(key, out); return out; }
// a core joins your team: it goes first, your other Pokémon keep their places after it. On a full team the ones that make
// room are the least needed: never a locked slot, your Megas last, then the lowest rated (audit, Oct 30: it used to drop the
// last two slots, which could be the team's only Mega)
function corePlan(ns) {
  const cur = S.slots.filter(s => byName.get(s.n)), same = s => ns.includes(s.n) || ns.some(n => (byName.get(n) || {}).b === (byName.get(s.n) || {}).b);
  const keep = cur.filter(s => !same(s)), room = Math.max(0, ns.length + keep.length - 6);
  // what each one does for the team: speed control (Tailwind, Trick Room) and lead support (Fake Out, Intimidate, redirection)
  // only it brings stays too, so a core never takes away the team's only Tailwind
  const mem = new Map(members().map(m => [m.p.n, m])), job = (s, k) => { const m = mem.get(s.n); try { return m && relMove(m, ROLE[k])[0] >= .5; } catch (e) { return false; } };
  const only = (s, k) => job(s, k) && !keep.some(o => o !== s && job(o, k)) && !ns.some(n => { const m = mem.get(n) || (byName.get(n) && abMember(byName.get(n))); try { return m && relMove(m, ROLE[k])[0] >= .5; } catch (e) { return false; } });
  const val = s => { const p = byName.get(s.n); let r = 0; try { r = rating(p).total; } catch (e) {} const m = mem.get(s.n);
    return (s.lock ? 2000 : 0) + (p && p.m ? 1000 : 0) + (only(s, 'tw') || only(s, 'tr') ? 500 : 0) + ((only(s, 'fake') || only(s, 'redir') || (m && m.ability === 'Intimidate' && !keep.some(o => o !== s && (mem.get(o.n) || {}).ability === 'Intimidate'))) ? 200 : 0) + r; };
  const drop = new Set(keep.slice().sort((a, b) => val(a) - val(b)).slice(0, room));
  const next = [...ns.map(n => cur.find(s => s.n === n) || {n, a: null, lock: false}), ...keep.filter(s => !drop.has(s))];
  const megas = next.filter(s => (byName.get(s.n) || {}).m).length;
  return {cur, next, dropped: keep.filter(s => drop.has(s)).map(s => (byName.get(s.n) || {}).d).filter(Boolean), megas};
}
const andList = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
function coreConfirmText(ns) { if (ns.length > 3) return 'Replace your team?'; const c = corePlan(ns);
  // warn when the core brings a weather that fights one already on the team (sweep, Oct 31: Pelipper in next to Charizard Y)
  let wx = ''; try { const nt = c.next.map(s => byName.get(s.n)).filter(Boolean).map(p => abMember(p)), ws = wxSetsOf(nt);
    if (ws.length > 1) wx = ` The team would set both ${ws.map(w => ARCH[w].name.toLowerCase()).join(' and ')}, which cancel each other out.`; } catch (e) {}
  return `Replace ${andList(c.dropped)}?${c.megas > 2 ? ` Your team would have ${c.megas} Megas (only one can Mega Evolve per battle).` : ''}${wx}`; }

// the full explanation behind the cores "?" (moved from 48-cores.js, Nov 12, so the new Build shows the same words)
function coreWhyText(what, base) { return `A core is a group of Pokémon that cover each other: one sets up, protects or speeds the other, or they handle each other's bad matchups. These are ${what}, from ${(+RES.teams || 0).toLocaleString('en-US')} tournament teams. Average team wins ${winFmt(100 * base)} of games. ${coreUi.sort === 'win' ? `Ranked by win rate pulled toward the average as if ${coreUi.kind === 'teams' ? 20 : 300} average teams had also run it, so a high rate over a few teams sits below a slightly lower one over many. "Together" compares it with what its members win on their own. Win rates also reflect who plays them: strong players' favourite picks look better than they are.` : 'Ranked by how many teams used it.'}`; }
