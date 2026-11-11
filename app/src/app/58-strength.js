// ---------- Strength Score: the grade's working-out (R4, Nov 11) ----------
// Moved unchanged from 60-concept-h.js so the rebuild (app/src/v2) uses the same numbers: the score, its band word, how sure it
// is, the likely range, the six's own record, partial teams, the rank among real teams and how many top threats it handles.
// No HTML here. 60-concept-h.js adds the drawing to the same CH object.
const CH = {};
/* GRADE v2 (Nov 7, Sim: "more reflective of the actual team and not have our stats contradicting each other").
   The grade answers one question: how often should this six win? Its strength is the real-games team model (Pokémon, pairs and
   sets, player skill taken out) plus this exact six's own tournament record, also with its players' skill and its opponents'
   strength taken out, and trusted more the more games it has (six.mjs, daily). Tested on later games it had not seen
   (experiments/grade-v2.mjs): it picked the winner in 56.1% of games, against 53.6% for the grade it replaces.
   Shown as the expected win rate against today's tournament field; the number behind the letter is where the six ranks among
   real tournament teams (0-100), and the letter comes from that rank: A top 10%, B next 20%, C middle 40%, D next 20%, F bottom
   10%. How the six handles the top threats is shown on its own, as Matchups: it explains what beats the team, it isn't part of
   the grade (it predicted wins far less well). A team of fewer than six keeps the old check, marked "so far". */
/* STRENGTH SCORE (Sim, Nov 9; docs/strength-score.md). The 0-100 number says how strong the team is altogether, not where it ranks:
   80 + 122 × (chance to beat today's tournament teams − 50%), the chance being CH.fieldWin (player skill taken out, recomputed daily
   from real teams). A team that beats today's tournament teams half the time scores 80; the best 2% of real sheets about 92; no Mega
   lands in the 50s. Same ranking as the old grade (scoreboard Nov 9: identical picks); each 10-point band won more than the one
   below on later games. The rank among real teams is kept as G.rk (small print). Letters: one per 10 points (A 90+, B 80s, C 70s,
   D 60s, F under 60) until the band words replace them (Step B). */
CH.SS_MID = 80; CH.SS_K = 122;
CH.ssOfE = e => e == null || !isFinite(e) ? null : Math.max(0, Math.min(100, CH.SS_MID + CH.SS_K * (e - .5)));
CH.WORDS = [[90, 'Top tier'], [80, 'Tournament ready'], [70, 'Solid'], [60, 'Needs work'], [-1, 'Missing a basic']];
CH.wordOf = s => s == null ? '' : CH.WORDS.find(w => s >= w[0])[1];
CH.wordOfL = L => ({A: 'Top tier', B: 'Tournament ready', C: 'Solid', D: 'Needs work', F: 'Missing a basic'})[String(L || '')[0]] || '';
CH.grade = s => s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : 'F'; // the band (colours, data-band)
// Nov 9 (Sim chose: plus/minus on every letter, so players feel the difference inside a band): same ranking, finer labels.
// Tested on later games: the top and bottom bands differ clearly; neighbouring steps differ by ~1-2 wins per 100 games, too small to
// confirm with today's data, so a step is a rank (where the team sits), not a promise of more wins. F stays plain.
CH.gradeFull = s => CH.grade(s);
CH.gradeOld = s => s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : 'F';
// this exact six's own record (δ in team-strength units, and its games), from model.sixes
CH.sixOf = ms => { const S = META.model && META.model.sixes; if (!S || !ms || ms.length !== 6) return null; const v = S[ms.map(m => (m.p || m).n).sort().join('|')]; if (!Array.isArray(v)) return null;
  // Deep Check, Nov 8: the record was earned with the sets real players ran, so it only counts for Pokémon on a set like
  // theirs. A Pokémon counts as changed when you gave it a move outside its 6 most-run moves, or an item outside its 3
  // most-run items (an imported real team sheet keeps its record); a six with every set changed keeps none of it.
  const off = m => { try { const pm = new Set((typeof popularMoves === 'function' ? popularMoves(m.p) : []).map(x => x && (x.name || x)));
      const mv = (m.custom ? (m.moves || []) : []).map(x => x && (x.name || x)).filter(Boolean);
      const ti = typeof topItems === 'function' ? (topItems(m.p) || []).slice(0, 3).map(x => Array.isArray(x) ? x[0] : x) : [];
      return (pm.size && mv.some(x => !pm.has(x))) || (m.heldItem && !m.itemDefault && !m.p.m && ti.length && !ti.includes(m.heldItem)); } catch (e) { return false; } };
  const mine = ms.filter(m => m && m.p && off(m)).length, share = (6 - mine) / 6;
  return {d: (+v[0] || 0) * share, g: +v[1] || 0, share}; };
// how sure the rating is (Nov 8, step 5): the spread of the team's strength from how much real evidence stands behind each of
// its Pokémon and pairs (model.monSd / pairSd), widened by CH.SD_K, the factor that made those spreads match later results
// (experiments/unsure.mjs); a six's own record narrows it. Shown as an 80% range on the 0-100 rating.
CH.SD_K = .7; // experiments/unsure.mjs (Nov 8): the raw spreads were about 30% wider than later results showed
/* Sim, Nov 8: one word instead of a range (an honest range is wide and makes the grade feel vague): High when the team's
   parts are backed by lots of real games (spread ≤ .12, about a well-known six), Medium up to .2, Low beyond. A six with
   100+ games of its own is at least Medium. */
CH.sureOf = (ms, six) => { const sd = CH.sdOf(ms); if (sd == null) return null; let k = sd <= .12 ? 2 : sd <= .2 ? 1 : 0; if (six && six.g >= 100) k = Math.max(k, 1);
  return [{w: 'Low', t: 'few real games back this exact mix, so it could move a lot as results come in'}, {w: 'Medium', t: 'its Pokémon are well known, but this mix of them less so'}, {w: 'High', t: 'its Pokémon and pairings are backed by lots of real games'}][k]; };
CH.sdOf = ms => { const M = META.model; if (!(CH.SD_K > 0) || !M || !M.monSd || !ms || ms.length !== 6) return null; const ns = ms.map(m => (m.p || m).n), mx = Math.max(...Object.values(M.monSd)), p0 = +M.pairSd0 || .05;
  let v = 0; for (const n of ns) v += (M.monSd[n] ?? mx) ** 2;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = ns[i] < ns[j] ? ns[i] + '|' + ns[j] : ns[j] + '|' + ns[i]; v += ((M.pairSd || {})[k] ?? p0) ** 2; }
  return Math.sqrt(v) * CH.SD_K; };
CH.rangeOf = (ms, y) => { const sd = CH.sdOf(ms); if (sd == null || y == null) return null; const a = CH.ssOfE(CH.fieldWin(y - 1.2816 * sd)), b = CH.ssOfE(CH.fieldWin(y + 1.2816 * sd));
  return a == null || b == null ? null : [Math.round(a), Math.round(b)]; };
// win chance against today's field: the average over real tournament teams (the shipped percentiles)
CH.fieldWin = y => { const q = META.model && META.model.dist && META.model.dist.q; if (!Array.isArray(q) || q.length !== 101) return null; const c = calibK(); let t = 0; for (const v of q) t += sig(c * (y - v)); return t / q.length; };
// strength, rank among real teams (0-100) and expected win rate, with and without the six's own record
/* Sim, Nov 7: "I don't want it to be the case just because the team isn't a tournament team it gets discredited too much if the
   six Pokémon are all strong picks and cover the meta". Tested on later games (experiments/grade-v2.mjs):
   - matchups (readiness against the top 30: offense and defense calcs) help a little on top of strength, at a small weight
     (more makes predictions worse): CH.MU_K per point of readiness above or below the average real team (79%), about ±0.7 of
     expected win rate between a team that covers the meta like the top tenth and one with the holes of the bottom tenth;
   - the 7 team checks added nothing, so they are checklist advice only, no longer a discount on strength;
   - the caution for sixes whose pairs are rarely seen together made no measurable difference, so it is eased: at most a quarter
     of above-average strength is held back for a never-seen combination (it was half). */
CH.MU_K = .003; CH.MU_AVG = 79;
CH.strengthOf = (ms, ready) => { try { if (!ms || ms.length !== 6 || typeof modelOK !== 'function' || !modelOK()) return null; const names = ms.map(m => m.p.n);
  if (new Set(names.map(n => (byName.get(n) || {}).b || n)).size < 6) return null; const xs = strengthX(names, ms); if (!xs || !isFinite(xs.x0)) return null;
  const M = META.model, mx = M.meanX || 0, k = typeof testedPairs === 'function' ? testedPairs(names) : null, cr = k == null || !M.supK ? 1 : .75 + .25 * Math.min(1, k / M.supK);
  const dv = xs.x0 - mx, x = mx + (dv > 0 ? dv * cr : dv), mu = ready == null ? 0 : CH.MU_K * (ready - CH.MU_AVG);
  const six = CH.sixOf(ms), y0 = x + mu, y = y0 + (six ? six.d : 0), pct = strengthPct(y), e = CH.fieldWin(y); if (pct == null || e == null) return null;
  const e0 = CH.fieldWin(x), eMu = CH.fieldWin(y0); return {x, y, six, mu, pct, ss: CH.ssOfE(e), ss0: CH.ssOfE(e0), ssMu: CH.ssOfE(eMu), pct0: strengthPct(x), pMu: strengthPct(y0), e, e0, eMu, rg: CH.rangeOf(ms, y), su: CH.sureOf(ms, six)}; } catch (e) { return null; } };
/* Partial teams on the same scale (Nov 8, foundation plan Phase 1): a team of 1-5 is rated as if each empty slot were an
   average tournament pick, so the number means the same thing as for a full six and each Pokémon you add moves it in a way
   you can follow. Known Pokémon, their pairs and their sets count as for a full team; an empty slot counts 1/6 of an average
   team's strength; matchups and the six's own record wait for all six. Marked "so far" everywhere. CH.PARTIAL_V2=false: old check. */
CH.PARTIAL_V2 = true;
CH.partialOf = ms => { try { if (!ms || !ms.length || ms.length >= 6 || typeof modelOK !== 'function' || !modelOK()) return null; const names = ms.map(m => m.p.n);
  if (new Set(names.map(n => (byName.get(n) || {}).b || n)).size < names.length) return null; const M = META.model, mx = M.meanX || 0;
  const xk = strengthX(names, ms).x0; if (!isFinite(xk)) return null; const y = xk + (6 - names.length) / 6 * mx, pct = strengthPct(y), e = CH.fieldWin(y); if (pct == null || e == null) return null;
  const ss = CH.ssOfE(e); return {x: y, y, six: null, mu: 0, pct, ss, ss0: ss, ssMu: ss, pct0: pct, pMu: pct, e, e0: e, eMu: e, rg: null, su: null, partialN: names.length}; } catch (e) { return null; } };
// The letter (Sim, Oct 30): readiness for the top 30 threats, minus 6 points for each of the team checklist's checks it misses.
// Measured on 904 tournament teams with records: each missed check cost about 1% of games won, and 6 points per miss put the
// letters in the same order as the teams' finishes most often. Weather and Taunt/Encore aren't checks: teams without them won
// just as often.
CH.GMISS = 6;
// Real results first (Sim, Oct 30): when these exact six have 30+ tournament games, the letter comes from how often they won.
// On 339 real teams, our own grade didn't line up with their records (higher grades didn't win more), so a real record wins.
// 50% is an average team; each letter is 5 points of win rate. The win rate is already pulled toward the field for small samples.
CH.REC_MIN = 30;
CH.recLetter = wr => wr >= .6 ? 'A' : wr >= .55 ? 'B' : wr >= .5 ? 'C' : wr >= .45 ? 'D' : 'F';
CH._recMap = null; CH._recSrc = null;
// every six with 30+ games (results.records, winners and losers alike); older data only has the winning ones (results.proven)
CH.recList = () => RES && (Array.isArray(RES.records) ? RES.records : Array.isArray(RES.proven) ? RES.proven : null);
CH.recOf = ms => { const L = CH.recList(); if (!ms || ms.length !== 6 || !L) return null;
  if (CH._recSrc !== L) { CH._recSrc = L; CH._recMap = new Map(); for (const [ns, n, wr, g] of L) if (Array.isArray(ns) && ns.length === 6 && g != null && +g >= CH.REC_MIN) CH._recMap.set(ns.slice().sort().join('|'), {n: +n, wr: +wr, g: +g}); }
  return CH._recMap.get(ms.map(m => (m.p || m).n).sort().join('|')) || null; };
// Teams with no record of their own (Sim, Oct 30: "accuracy on point"): the grade adds what the team-strength model (trained on
// 35k real games, player skill taken out) says about these Pokémon and sets. Tested on events neither had seen
// (experiments/grade-eval.mjs): newest 20% of Limitless games, who won: readiness alone 52.5%, model alone 54.8%, grade + 0.75×model
// 55.1%; official RK9 events, top 8 vs the rest: grade 0.586, model 0.515, blend 0.586. So the blend is the best on both. The model
// part is 0.75 × the grade's spread (15 points) per standard deviation of real teams' model strength, centred on the median team.
// Re-tested Oct 31 on cleaned data (themed events removed; 'ready for the top threats' no longer charged twice): blend 55.3% of
// held-out games, 0.576 at official events; the grade's spread is now 12.1 points, so 0.75 of it is 9.1 per model SD.
CH.GMODEL = 9.1;
CH.modelPts = ms => { try { if (!ms || ms.length !== 6 || typeof modelOK !== 'function' || !modelOK()) return null; const q = META.model.dist && META.model.dist.q; if (!Array.isArray(q) || q.length !== 101) return null;
  const sd = (q[84] - q[16]) / 2; if (!(sd > 0)) return null; const x = strengthX(ms.map(m => m.p.n), ms).x0; return isFinite(x) ? Math.max(-25, Math.min(25, CH.GMODEL * (x - q[50]) / sd)) : null; } catch (e) { return null; } };
// 'Ready for the top threats' is itself the readiness score, so it isn't charged again as a missed check (sweep, Oct 31: it
// made a 7-point cliff between 74% and 75% ready). The letter comes from the score as shown, rounded.
/* ONE GRADE (Nov 7, Sim: "why are we not able to make this simple?"). Every team has one grade out of 100, always 0-100, and
   its letter comes only from that number (A 90+, B 80+, C 70+, D 60+, F). It blends our own check with how this exact six did
   in real tournaments, gradually: the more real games, the more they count (151 games: 60% real results, 40% our check; no
   games: our check alone). A real win rate is put on the same scale: 60% wins = 90, 55% = 80, 50% = 70, 45% = 60.
   The real win rate itself is shown as its own line under the grade, never as a second grade. */
CH.REC_K = 100;
CH.recScore = wr => Math.min(100, Math.max(0, Math.round(70 + (wr - .5) * 200)));
/* Letter buffer (Nov 9, Sim asked): the daily data update moves an unchanged team's grade by ~1-2 points, which with plus/minus
   letters would flip a team sitting on a line (B / B+) with nothing changed. For the player's own teams (My Team and saved teams),
   the letter they last saw is kept until the grade clearly crosses into another letter (by 1.5 points). Editing the team makes a new
   key, so a real change shows at once. Kept in this browser only (a per-viewer convenience); without storage it just shows the plain letter. */
CH.STICKY = 1.5;
CH.letterBounds = L => { const T = [[90, 101, 'A'], [80, 90, 'B'], [70, 80, 'C'], [60, 70, 'D'], [-1, 60, 'F']].find(t => t[2] === L); return T ? [T[0], T[1]] : null; };
CH.teamKey = ms => (ms || []).map(m => [m.p && m.p.n, m.heldItem || '', m.ability || '', (m.moves || []).map(x => x && x.name).join(',')].join('|')).sort().join(';');
CH.ownKeys = () => { const sig = JSON.stringify(S.slots) + '#' + JSON.stringify((S.teams || []).map(t => t.slots)); if (CH._okC && CH._okC.sig === sig) return CH._okC.ks; const ks = new Set(); CH._okC = {sig, ks}; try { const cur = typeof members === 'function' ? members() : []; if (cur.length) ks.add(CH.teamKey(cur));
  for (const t of S.teams || []) { const r = typeof teamRating === 'function' ? teamRating(t.slots) : null; if (r && r.ms && r.ms.length) ks.add(CH.teamKey(r.ms)); } } catch (e) {} return ks; };
CH.sticky = (ms, s) => { const now = CH.gradeFull(s); let map; try { map = JSON.parse(localStorage.getItem('np.gl') || '{}') || {}; } catch (e) { return now; }
  const k = CH.teamKey(ms); if (!k) return now; const prev = map[k]; let out = now;
  if (prev && prev !== now) { const b = CH.letterBounds(prev); if (b && s >= b[0] - CH.STICKY && s < b[1] + CH.STICKY) out = prev; }
  if (map[k] !== out && !CH._ownBusy) { CH._ownBusy = true; let own; try { own = CH.ownKeys(); } finally { CH._ownBusy = false; }
    if (own.has(k)) { map[k] = out; const ks = Object.keys(map); if (ks.length > 60) delete map[ks[0]]; try { localStorage.setItem('np.gl', JSON.stringify(map)); } catch (e) {} } }
  return out; };
CH.gradeOf = (RD, CK, ms) => { if (!RD) return null; const miss = CK ? CK.items.filter(x => !x.skip && !x.ok && !x.note && x.k !== 'reach') : [], mp = CH.modelPts(ms), rec = CH.recOf(ms);
  const illegal = !!(CK && CK.items.some(x => x.k === 'items' && !x.ok)), partial = !ms || ms.length < 6, st = partial ? (CH.PARTIAL_V2 ? CH.partialOf(ms) : null) : CH.strengthOf(ms, RD.score);
  if (st) { const s = Math.round(st.ss * 10) / 10; const L = CH._ownBusy ? CH.gradeFull(s) : CH.sticky(ms, s); return {v: 2, s, letter: L, band: L[0] === 'F' ? 'F' : L[0], word: CH.wordOf(s), rk: st.pct, e: Math.round(st.e * 1000) / 10, e0: Math.round(st.e0 * 1000) / 10, eMu: Math.round(st.eMu * 1000) / 10, pct0: st.ss0, pMu: st.ssMu, six: st.six, st, r: RD.score, illegal, partial, miss, CK, rec, mp, h: CH.hand(RD)}; }
  // fewer than six (or the model not loaded yet): the old check, marked so far
  const raw = RD.score - CH.GMISS * miss.length + (mp || 0), clamp = v => Math.min(100, Math.max(0, Math.round(v))), chk = clamp(raw);
  let s = chk, w = 0, real = null; if (rec) { w = rec.g / (rec.g + CH.REC_K); real = CH.recScore(rec.wr); s = clamp((1 - w) * raw + w * real); }
  return {v: 1, s, letter: CH.gradeOld(s), chk, real, w, r: RD.score, illegal, partial, miss, CK, rec, mp, h: CH.hand(RD)}; };
// the third line under every grade: the real win rate, or that there is none yet
const pct1 = x => Math.round(x * 1000) / 10 + '%';
// v2: where the six ranks among real teams, and what the grade rests on (its own games, or our estimate)
CH.rkOf = G => G.rk != null ? G.rk : CH.rankOfS(G.s);
CH.pctTxt = G => CH.rankShort(CH.rkOf(G)) + ' of tournament teams';
CH.pctShort = G => CH.rankShort(CH.rkOf(G));
// a grade number (a rank among real teams) as its expected win rate, for explanations
// a Strength Score as its chance to beat today's tournament teams (%), and as a rank among real teams (0-100)
CH.eOfS = s => s == null || !(META.model && META.model.dist) ? null : Math.round((.5 + (s - CH.SS_MID) / CH.SS_K) * 1000) / 10;
CH.rankOfS = s => { const q = META.model && META.model.dist && META.model.dist.q; if (s == null || !Array.isArray(q) || q.length !== 101) return null; const e = .5 + (s - CH.SS_MID) / CH.SS_K;
  let lo = q[0] - 3, hi = q[100] + 3; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, f = CH.fieldWin(m); if (f == null) return null; if (f < e) lo = m; else hi = m; } return strengthPct((lo + hi) / 2); };
/* a change, on suggestion cards and after Apply (Sim, Nov 7: "giving win percentage is so weird… seems arbitrary"): the grade
   letter and the team rating, the 0-100 rank among real tournament teams the letter comes from: "Grade C → B · rating 41 → 58",
   or "Grade C · rating 41 → 46" when the letter stays. A tiny win-rate change ("−0.6%") claimed more precision than there is. */
/* Shown as a rank (Sim, Nov 8: "77 for a 9-1 team seems so low"): the 0-100 number is where the six ranks among real tournament
   teams, but "77 / 100" reads like a test score (a C+), so the page says "Top 23%" instead. */
CH.rankShort = s => { const p = Math.round(s); return p >= 99 ? 'Top 1%' : p >= 50 ? `Top ${100 - p}%` : `Bottom ${Math.max(1, p)}%`; };
/* how many of the top threats the team handles (Handled or Well handled), from the same rows the readiness uses */
CH.hand = RD => RD && Array.isArray(RD.rows) && RD.rows.length ? {x: RD.rows.filter(r => r.level >= 2).length, n: RD.rows.length} : null;

// ---------- matchups and the lead pair (moved unchanged from 60-concept-h.js, R4 Nov 11) ----------
CH.LV = ['No answer', 'Shaky', 'Handles it', 'Beats it'];
// the meta's six: the most-used Pokémon at tournaments, one per species
CH.metaSix = () => { const seen = new Set(), out = []; for (const p of ROSTER.slice().sort((a, b) => U(b) - U(a))) { if (!(U(p) > 0) || seen.has(p.b)) continue; seen.add(p.b); out.push(p); if (out.length === 6) break; } return out; };
// your four vs the meta's six: the Battle mode planner (same as Gauntlet), cached per team
CH._four = {key: null, v: null};
CH.four = ms => { if (!ms || ms.length < 4) return null; const six = CH.metaSix(); if (six.length < 4) return null;
  const key = metaVersion + '|' + six.map(p => p.n).join() + '|' + ms.map(m => m.p.n + '@' + (m.item || '') + ':' + m.moves.map(x => x.name).join(',')).join('|');
  if (CH._four.key === key) return CH._four.v; let v = null;
  try { const useA = $('useAbil') ? $('useAbil').checked : true, r = planMatchup(ms, six.map(oppMember), useA); v = {lead: r.lead.map(i => ms[i].p.n), back: r.back.map(i => ms[i].p.n)}; } catch (e) { v = null; }
  CH._four = {key, v}; return v; };
// your four against any six (the Battle mode planner), cached
CH._fv = {key: null, v: null};
CH.fourVs = (ms, names) => { const key = metaVersion + '|' + names.join() + '|' + ms.map(m => m.p.n + '@' + (m.item || '') + ':' + m.moves.map(x => x.name).join(',')).join('|'); if (CH._fv.key === key) return CH._fv.v; let v = null;
  try { const useA = $('useAbil') ? $('useAbil').checked : true, r = planMatchup(ms, withSheet(names.map(n => oppMember(byName.get(n))), realSheetFor(names, null)), useA); v = {lead: r.lead.map(i => ms[i].p.n), back: r.back.map(i => ms[i].p.n)}; } catch (e) { v = null; }
  CH._fv = {key, v}; return v; };
CH.leadWhy = m => { const mv = new Set(m.moves.map(x => x.name)); if (mv.has('Tailwind')) return 'Tailwind turn 1'; if (mv.has('Trick Room')) return 'Trick Room turn 1'; if (mv.has('Fake Out')) return 'Fake Out pressure';
  if (m.ability === 'Intimidate') return 'Intimidate on entry'; if (mv.has('Follow Me') || mv.has('Rage Powder')) return 'redirects attacks'; return ''; };
// one real KO for a red-pen note: the most-used top threat one of yours OHKOs as its solid answer
CH.koNote = RD => { if (!RD) return null; let best = null;
  for (const r of RD.rows) for (const x of r.solid || []) { const du = x.du; if (du && du.win && du.nM === 1 && du.o && x.m && (!best || r.t.w > best.w)) best = {w: r.t.w, n: x.m.n, txt: `${du.o.name || String(du.o.mv).replace(/ \(.*\)$/, '')} OHKOs ${r.t.d}`}; }
  return best; };
CH.lvCount = RD => [0, 1, 2, 3].map(l => RD ? RD.rows.filter(r => r.level === l).length : 0);
CH.order = RD => RD ? RD.rows.slice().sort((a, b) => a.level - b.level || b.t.w - a.t.w) : [];
/* Threats from real results first (Nov 8 readiness test: the damage-calc verdicts didn't predict who wins, −0.2 ±1.4 pts over
   11,800 tournament games; the matchups learned from real games did). For each threat: how teams with your Pokémon have done
   against teams with it (ctrVal, skill and team strength taken out), summed over your six. The calc reading stays underneath. */
CH.realVs = (t, ms) => { try { if (typeof ctrVal !== 'function') return null; const ns = (ms || members()).map(m => m.p.n); let v = 0, k = 0;
  for (const a of ns) { const c = ctrVal(a, t); if (c != null) { v += c; k++; } } if (!k) return null; const pts = (sig(v) - .5) * 100;
  return pts >= 1.5 ? {w: 'Favoured', c: 'ok', pts} : pts <= -1.5 ? {w: 'Unfavoured', c: 'bad', pts} : {w: 'Even match', c: 'mid', pts}; } catch (e) { return null; } };

// ---------- suggestions: the side options (moved unchanged from CH.sugs in 60-concept-h.js, R4 Nov 11) ----------
// When nothing raises the Strength Score: up to 3 swaps from the planner's "more" list that keep every check and about the same
// grade (at most 2 points less, and matchups at most 2 less), never bringing back a Pokémon you just swapped out with Apply.
CH.sideGrades = (more, g0, base) => { const ok = []; for (const pl of more) { if (ok.length >= 3) break; if (pl.ch.some(x => (swOutNow() || new Set()).has(x.c.p.b))) continue;
      if (pl._ts === undefined && pl.team && pl.team.length === 6) { try { pl._ts = tsOf(pl.team); } catch (e) { pl._ts = null; } }
      const gg = g0 != null ? planGrade(pl) : null; if ((gg != null && gg < g0 - 2) || (base != null && pl._ts != null && pl._ts < base - 2)) continue; ok.push(pl); }
  return ok; };

// moved unchanged from 60-concept-h.js (R4, Nov 11)
/* Strength Score (Nov 9): a change shows in score points, "+7 (76 → 83)", and the band word when it changes */
CH.gradeMove = (g0, g1) => { const r0 = Math.round(g0), r1 = Math.round(g1), d = r1 - r0, w0 = CH.wordOf(g0), w1 = CH.wordOf(g1);
  return `${d > 0 ? '+' + d : d < 0 ? '\u2212' + Math.abs(d) : '\u00b10'} (${r0} \u2192 ${r1})${w0 !== w1 ? ', ' + w1 : ''}`; };
// ---------- text helpers for the score (moved from 60-concept-h.js, Nov 11; the share images and the new build use them) ----------
CH.gradeNum = G => !G ? '' : G.v === 2 ? `${Math.round(G.s)} \u00b7 ${CH.wordOfL(G.letter)}${G.partial ? ' so far' : ''}` : `${G.s} / 100${G.partial ? ' so far' : ''}`;
CH.recLine = (G, short) => !G ? '' : G.v === 2 ? (G.six ? (short ? `${CH.n(G.six.g)} real games` : `Based on ${G.six.g.toLocaleString('en-US')} real games`) : (short ? 'Our estimate' : 'Our estimate, not played in tournaments yet')) : G.rec ? (short ? `${pct1(G.rec.wr)} wins in ${CH.n(G.rec.g)} games` : `Real win rate: ${pct1(G.rec.wr)} in ${G.rec.g.toLocaleString("en-US")} games`) : (short ? 'Our estimate · no tournament games yet' : 'Our estimate · not played in tournaments yet');
CH.readyN = RD => { const h = CH.hand(RD); return h ? `${h.x}/${h.n}` : ''; };
CH.n = n => n.toLocaleString ? n.toLocaleString('en-US') : String(n);
// "Why this score?" as data (R4, Nov 11; today's CH.gradeWhy and the new build both draw it): the Strength Score's three parts,
// which add up to it, and what the number means in real games
CH.WHY_TEST = 'Tested on 6,270 later tournament games: teams scoring 90+ won 58.5%, the 80s 53-54%, the 70s 46-50%, the 60s 38-41%. Every 10 points really means more wins.';
CH.whyData = G => { if (!G || G.v !== 2) return null; const t = Math.round(G.s), a = Math.round(G.pct0), b = Math.round(G.pMu);
  return {s: t, letter: G.letter, word: CH.wordOfL(G.letter), e: Math.round(G.e), rank: CH.pctTxt(G), partial: !!G.partial, k: G.partial ? (G.st && G.st.partialN || 0) : null,
    base: a, mu: b - a, own: t - b, hasSix: !!G.six, ownGames: G.six ? G.six.g : null, ready: G.h ? G.h.x + '/' + G.h.n : '', sure: (G.st && G.st.su) || null, illegal: !!G.illegal}; };
