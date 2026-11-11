// ---------- Daily data cleaners (R4, Nov 11) ----------
// Each daily data document (meta/<k>) is checked and trimmed by one of these before the site uses it. They were spread across
// the pages that show the data; they are moved here unchanged so the rebuild (app/src/v2) reads the daily data the same way.
// No HTML. The rest of the cleaners (cleanMeta, cleanPerf, cleanStatus in 01-state.js, cleanHistory in 18-archetypes.js) stay put.
// from 29-fix-planner.js
function cleanResults(v){try{if(!v||typeof v!=='object')return null;const ok=Array.isArray(v.proven)&&v.proven.length>=100&&Array.isArray(v.cores)&&v.cores.length>=100&&v.pairs&&typeof v.pairs==='object'&&v.mons&&typeof v.mons==='object'&&+v.base>.4&&+v.base<.6;
  if(!ok)return null;const proven=v.proven.filter(x=>Array.isArray(x)&&Array.isArray(x[0])&&x[0].length===6&&x[0].every(n=>byName.has(n))&&isFinite(+x[2]));
  const fin=x=>typeof x==='number'&&Number.isFinite(x);
  const cores=v.cores.filter(c=>Array.isArray(c)&&c.length===5&&c.slice(0,3).every(n=>byName.has(n))&&fin(c[3])&&fin(c[4]));
  // per-Pokémon and per-pair [games, win rate]: a bad row is dropped, never shown as NaN (stress test, Oct 28)
  const rows=o=>{const r={};if(o&&typeof o==='object'&&!Array.isArray(o))for(const k of Object.keys(o)){const x=o[k];if(Array.isArray(x)&&fin(x[0])&&x[0]>=0&&fin(x[1])&&x[1]>=0&&x[1]<=1)r[k]=x}return r};
  const out={...v,proven:proven.filter(x=>fin(x[1])&&fin(x[2])),cores,base:+v.base,minCore:+v.minCore||40,mons:rows(v.mons),pairs:rows(v.pairs)};
  if(!(fin(v.teams)&&v.teams>0))delete out.teams;
  if(v.tc&&typeof v.tc==='object'&&v.tc.rows&&typeof v.tc.rows==='object')out.tc={...v.tc,base:fin(v.tc.base)?v.tc.base:.5,rows:Object.fromEntries(Object.entries(v.tc.rows).filter(([,x])=>Array.isArray(x)&&x.length>=5&&x.every(fin)))};else delete out.tc;
  return out.proven.length>=100?out:null}catch(e){return null}}
// from 49-events.js
function cleanEvents(v) { try {
  if (!v || typeof v !== 'object' || !Array.isArray(v.events) || !Array.isArray(v.dict)) return null;
  const D = v.dict.map(x => typeof x === 'string' ? x.slice(0, 60) : ''), g = i => D[i] || '';
  const sheet = s => { if (!Array.isArray(s)) return null; const n = g(s[0]); if (!byName.has(n)) return null;
    // ability spelled by hand on the sheet → the Pokémon's real ability; curly apostrophes in move names (King’s Shield)
    // item names typed by hand too ("Chopple Berry", "Grassy Seeds") → the real item
    return {n, i: typeof canonItem === 'function' ? canonItem(g(s[1])) : g(s[1]), a: canonAbility(g(s[2]), byName.get(n)), nt: g(s[3]), mv: (Array.isArray(s[4]) ? s[4] : []).slice(0, 4).map(x => g(x).replace(/[’‘]/g, "'")).filter(Boolean).map(x => typeof canonMove === 'function' ? canonMove(x, byName.get(n)) : x)}; };
  const events = v.events.slice(0, 200).map(e => { if (!e || !Array.isArray(e.top)) return null;
    const top = e.top.slice(0, 16).map(t => { if (!Array.isArray(t) || !Array.isArray(t[3])) return null; const mons = t[3].map(sheet).filter(Boolean); if (mons.length !== 6) return null;
      return {player: str(t[0], 60), place: +t[1] || 0, record: str(t[2], 20), mons}; }).filter(Boolean);
    if (!top.length) return null;
    return {id: str(e.id, 120), name: str(e.name, 140), date: str(e.date, 10), players: +e.players || 0, src: e.src === 'official' ? 'official' : 'limitless', top,
      field: (Array.isArray(e.field) ? e.field : []).map(f => Array.isArray(f) ? [g(f[0]), +f[1] || 0] : null).filter(f => f && byName.has(f[0])).slice(0, 8)}; }).filter(Boolean);
  return events.length ? {source: str(v.source, 200), updated: str(v.updated, 40), events} : null; } catch (e) { return null; } }
// from 63-practice.js
function cleanPractice(v) { try {
  if (!v || typeof v !== 'object' || !Array.isArray(v.dict) || !Array.isArray(v.opp) || !Array.isArray(v.rounds)) return null;
  const D = v.dict.map(x => typeof x === 'string' && byName.has(x) ? x : null), nm = i => Number.isInteger(i) ? D[i] || null : null;
  const list = (a, len) => { if (!Array.isArray(a) || (len && a.length !== len)) return null; const o = a.map(nm); return o.every(Boolean) ? o : null; };
  const cnt = x => Number.isFinite(+x) && +x >= 0 ? Math.round(+x) : 0;
  const opp = v.opp.slice(0, 500).map(o => { if (!Array.isArray(o)) return null; const six = list(o[0], 6); if (!six) return null; const mons = {};
    (Array.isArray(o[2]) ? o[2] : []).forEach(r => { if (!Array.isArray(r)) return; const n = nm(r[0]), c = [cnt(r[1]), cnt(r[2]), cnt(r[3])]; if (n && c[0] > 0 && c[1] <= c[0] && c[2] <= c[0]) mons[n] = c; });
    return {six, n: cnt(o[1]), mons}; });
  const rounds = v.rounds.slice(0, 2000).map((r, i) => { if (!Array.isArray(r) || !opp[r[0]]) return null;
    const mine = list(r[1], 6), b = list(r[2], 4), l = list(r[3], 2), tb = list(r[7]), tl = list(r[8]), p = Array.isArray(r[9]) ? r[9] : null;
    if (!mine || !b || !l || !tb || !tl || !p) return null; const four = list(p[1], 4), lead = list(p[3], 2); if (!four || !lead) return null;
    return {i, o: r[0], mine, b, l, r: cnt(r[4]), tr: cnt(r[5]), won: r[6] === 1, tb, tl, pair: {n: Math.max(1, cnt(p[0])), four, fourN: Math.max(1, cnt(p[2])), lead, leadN: Math.max(1, cnt(p[4]))}}; }).filter(Boolean);
  if (!rounds.length) return null;
  return {opp, rounds, minR: cnt(v.minR), source: str(v.source, 200), updated: str(v.updated, 40), from: cnt(v.from), to: cnt(v.to)}; } catch (e) { return null; } }
// from 63-weekly.js
function cleanWeekly(v) { try {
  if (!v || typeof v !== 'object' || !v.a || !v.b) return null;
  const n = x => { const k = num(x); return k == null ? 0 : k; }, day = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? String(s) : '';
  const wk = w => ({from: day(w.from), to: day(w.to), ev: n(w.ev), n: n(w.n)});
  const a = wk(v.a), b = wk(v.b); if (!a.from || !a.to || !b.from) return null;
  const mon = r => Array.isArray(r) && byName.has(r[0]) ? {p: byName.get(r[0]), xa: n(r[1]), xb: n(r[2])} : null;
  const rows = x => (Array.isArray(x) ? x : []).map(mon).filter(Boolean).slice(0, 8);
  const tech = (Array.isArray(v.tech) ? v.tech : []).map(r => Array.isArray(r) && byName.has(r[0]) && ['i', 'm', 'a'].includes(r[1]) && str(r[2], 40) && n(r[4]) > 0 && n(r[6]) > 0
    ? {p: byName.get(r[0]), k: r[1], o: str(r[2], 40).replace(/[’‘]/g, "'"), xa: n(r[3]), ma: n(r[4]), xb: n(r[5]), mb: n(r[6])} : null).filter(Boolean).slice(0, 10);
  const sty = x => (Array.isArray(x) ? x : []).filter(r => Array.isArray(r) && typeof ARCH === 'object' && ARCH[r[0]]).map(r => ({k: r[0], xa: n(r[1]), xb: n(r[2])}));
  const fresh = (Array.isArray(v.fresh) ? v.fresh : []).map(r => Array.isArray(r) && byName.has(r[1]) && (r[0] === 'p' || (r[0] === 's' && str(r[2], 40)))
    ? {kind: r[0], p: byName.get(r[1]), i: str(r[2], 40), k: n(r[3]), ev: str(r[4], 90), who: str(r[5], 40), pl: n(r[6]), d: day(r[7]), players: n(r[8])} : null).filter(Boolean).slice(0, 10);
  const th = v.th && typeof v.th === 'object' ? v.th : {};
  return {a, b, enough: !!v.enough && a.n > 0 && b.n > 0, updated: str(v.updated, 40), up: rows(v.up), down: rows(v.down), top: rows(v.top), tech,
    sty: {up: sty(v.sty && v.sty.up), down: sty(v.sty && v.sty.down)}, styAll: sty(v.styAll), fresh, cutA: n(v.cutA),
    th: {teams: n(th.teams) || 200, z: n(th.z) || 3, pts: n(th.pts) || 2, monTeams: n(th.monTeams) || 60, techPts: n(th.techPts) || 6, techMin: n(th.techMin) || 12, cut: n(th.cut) || 8, cutPlayers: n(th.cutPlayers) || 32}}; } catch (e) { return null; } }
// from 63-weekly.js
function cleanCalendar(v) { try {
  if (!v || typeof v !== 'object' || !Array.isArray(v.ev)) return null; const day = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? String(s) : '';
  const T = ['worlds', 'international', 'regional', 'sc', 'pbl', 'national', 'online'];
  const ev = v.ev.slice(0, 120).map(e => e && typeof e === 'object' && str(e.n, 80) && day(e.s) && day(e.e) && e.e >= e.s ? {n: str(e.n, 80), city: str(e.city, 50), cc: /^[A-Z]{2}$/.test(e.cc) ? e.cc : '', s: e.s, e: e.e, t: T.includes(e.t) ? e.t : 'regional', url: /^https:\/\//.test(e.url) ? str(e.url, 200) : ''} : null).filter(Boolean);
  return ev.length ? {ev, checked: day(v.checked) || str(v.updated, 10), src: {name: str(v.src && v.src.name, 80) || 'Victory Road', url: /^https:\/\//.test(v.src && v.src.url) ? str(v.src.url, 200) : ''}} : null; } catch (e) { return null; } }
// from 64-track.js
function cleanTrack(v) { try {
  if (!v || typeof v !== 'object' || !Array.isArray(v.ev) || !/^\d{4}-\d{2}-\d{2}$/.test(String(v.since || ''))) return null;
  const n4 = a => Array.isArray(a) && a.length === 4 && a.every(x => isFinite(+x) && +x >= 0) ? a.map(Number) : null;
  const ev = v.ev.slice(-2000).map(e => { if (!Array.isArray(e)) return null; const bs = n4(e[7]), ap = n4(e[8]), teams = +e[6];
    if (!bs || !ap || !(teams > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(String(e[1]))) return null;
    const tops = Array.isArray(e[9]) ? e[9].filter(t => Array.isArray(t) && byName.has(t[0])).map(t => ({n: t[0], r: +t[1] || 0, c: +t[2] || 0, p: +t[3] || 0})) : null;
    return {id: str(e[0], 120), date: e[1], name: str(e[2], 120), players: +e[3] || 0, off: !!e[4], snap: str(e[5], 10), teams, bs, ap, tops}; }).filter(Boolean);
  const mons = (Array.isArray(v.mons) ? v.mons : []).filter(m => Array.isArray(m) && byName.has(m[0])).map(m => ({n: m[0], ev: +m[1] || 0, r: +m[2] || 0, c: +m[3] || 0, w: +m[4] || 0, best: str(m[5], 120)}));
  const mb = Array.isArray(v.mb) && v.mb.length === 4 ? v.mb.map(x => Array.isArray(x) ? [+x[0] || 0, +x[1] || 0] : [0, 0]) : [[0, 0], [0, 0], [0, 0], [0, 0]];
  const fw = (Array.isArray(v.fw) ? v.fw : []).filter(x => Array.isArray(x) && isFinite(+x[1]) && +x[2] > 0).map(x => ({d: str(x[0], 10), acc: +x[1], games: +x[2]}));
  const mv = Array.isArray(v.mv) && /^\d{4}-\d{2}-\d{2}$/.test(String(v.mv[1])) && Array.isArray(v.mv[2]) ? {from: str(v.mv[0], 10), to: str(v.mv[1], 10),
    list: v.mv[2].filter(m => Array.isArray(m) && byName.has(m[0]) && isFinite(+m[2]) && +m[2] !== 0).slice(0, 4).map(m => ({n: m[0], r: +m[1] || 0, d: +m[2]}))} : null;
  return {since: v.since, snaps: +v.snaps || 0, last: str(v.last, 10), top: +v.top || 8, updated: str(v.updated, 40), ev, mons, mb, fw, mv}; } catch (e) { return null; } }
