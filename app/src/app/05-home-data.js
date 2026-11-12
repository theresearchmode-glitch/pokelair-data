// ---------- Home's numbers (R4 Home, Nov 12): shared by today's page (71-manga.js MG.month / srcLine / pct) and the new build ----------
// Moved here unchanged so both builds say exactly the same thing. Data only, no HTML.
// the month of a usage period "2026-10" -> "October"
const homeMonth = per => { const m = /^(\d{4})-(\d{2})/.exec(per || ''); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, 15)).toLocaleString('en-US', {month: 'long', timeZone: 'UTC'}) : ''; };
// the data line under the most-used Pokémon: "Most used in October, Showdown ladder 1630+. Data as of Nov 10"
const homeSrcLine = () => { const d = typeof META === 'object' && META && META[S.format]; if (!d) return 'Share of teams that bring each one';
  const src = String(d.source || '').replace(/\s*\(.*$/, '').trim(), mo = homeMonth(d.period); return `Most used${mo ? ' in ' + mo : ''}${src ? ', ' + src : ''}${typeof dataDateText === 'function' && dataDateText() ? '. ' + dataDateText() : ''}`; };
// a Pokémon's share of teams, one decimal ("35.6"), '' when unknown
const homePct = p => { const u = U(p); return u ? u.toFixed(1) : ''; };
// 13826 -> "13,826"
const homeNum = n => n && n.toLocaleString ? n.toLocaleString('en-US') : String(n || 0);
// an event's name without its prize note (moved unchanged from 60-concept-h.js)
const evName = n => String(n || '').replace(/\s*\((?:[^()]*?(?:prize|USD|\$)[^()]*)\)\s*$/i, '').trim();
// the latest winner's six (moved unchanged from 74-arena.js AR.champ): {ev, t, n, six:[{p, it, ab}]}, or null
const homeChamp = () => { const E = META.events; if (!E || !Array.isArray(E.events)) return null;
  for (const e of E.events) { const t = (e.top || []).find(x => x && x.place === 1 && x.mons && x.mons.length === 6 && x.mons.every(m => byName.get(m.n))); if (t) return {ev: e, t, n: E.events.length, six: t.mons.map(m => ({p: byName.get(m.n), it: m.i || '', ab: m.a || ''}))}; }
  return null; };

// what changed this week in tournament usage ranks (moved unchanged from 37-home-trends.js homeTrends, Nov 12): {past, up, dn}, or
// null when there's no history; up = new or 3+ places up into the top 30, dn = out of or 3+ places down from the top 30, 3 each
function homeTrendData(){const h=META.history;if(!h||!h.days||h.days.length<2)return null;const k='tour';const latest=h.days[h.days.length-1];
  const cutoff=new Date(new Date(latest.d).getTime()-7*864e5).toISOString().slice(0,10);const past=h.days.slice(0,-1).filter(x=>x.d>=cutoff)[0]||h.days[h.days.length-2];
  if(!past||!past[k]||!latest[k])return null;const now=latest[k],was=past[k];
  const rows=Object.keys(now).filter(n=>byName.get(n)&&now[n]<=40).map(n=>({p:byName.get(n),r:now[n],d:was[n]==null?null:was[n]-now[n]}));
  const up=rows.filter(x=>x.d==null?x.r<=30:x.d>=3).sort((a,b)=>(b.d==null?99:b.d)-(a.d==null?99:a.d)).slice(0,3);
  const dn=Object.keys(was).filter(n=>byName.get(n)&&was[n]<=30&&(now[n]==null||now[n]-was[n]>=3)).map(n=>({p:byName.get(n),r:now[n],d:now[n]==null?null:was[n]-now[n],w:was[n]})).sort((a,b)=>(a.d==null?-99:a.d)-(b.d==null?-99:b.d)).slice(0,3);
  return {past,up,dn};}
// a list of logged games -> {w, l, n, pct} (moved unchanged from 26-battle-log.js, Nov 12)
function logStats(entries) { const w = entries.filter(e => e.r === 'W').length; return {w, l: entries.length - w, n: entries.length, pct: entries.length ? Math.round(100 * w / entries.length) : 0}; }
// Doubles is played in pairs (moved unchanged from 60-concept-h.js, Nov 12): for each of the meta's six, the partner it is most often
// brought with in Showdown replays (each pair once): [{a, b, pct, g}], up to max
function homePairs(six, max) { const bw = RES && RES.tc && RES.tc.bw; let pairs = []; if (bw) { const used = new Set(); for (const p of six) { const k = brKeyOf(p), L = bw[k]; if (!L) continue; const x = L.find(y => !used.has(k + '|' + y[0]) && byName.get(y[0])); if (!x) continue; used.add(x[0] + '|' + k); pairs.push({a: p, b: byName.get(x[0]), pct: x[1], g: x[2]}); if (pairs.length === max) break; } } return pairs; }
