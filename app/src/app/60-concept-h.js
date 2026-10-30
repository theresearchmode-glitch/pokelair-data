// ---------- Concept H: Team Preview × Riso Zine (Oct 28, approved with Warm charcoal dark mode) ----------
// Home and Team in the new look. Everything on screen comes from the same data as before (readiness from the threat
// engine, the bring-four planner from Battle mode, events, Showdown replays); nothing is invented. Older pages keep their
// layout and pick up the palette through the shared tokens (concept-h.css). Every feature stays reachable: older Home
// sections and the full scouting report sit in folds that open with the logo's chevron pair (up = closed, down = open).
const CH = {};
CH.chev = (x, y, c) => { const p = (dy, col) => `<path d="M${x + 2} ${y + 22 + dy} L${x + 18} ${y + 8 + dy} L${x + 34} ${y + 22 + dy}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`; return p(3, '#FFE800') + p(0, c) + p(13, '#FFE800') + p(10, c); };
// the logo: two +2 chevrons (blue = you, red = them) over the back two slots
CH.logo = (s = 34, tile = '#1D2140') => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="${tile}"/>${CH.chev(12, 22, '#0078BF')}${CH.chev(52, 22, '#FF4C65')}<rect x="20" y="64" width="22" height="18" rx="6" fill="none" stroke="#F1E9DA" stroke-width="6"/><rect x="58" y="64" width="22" height="18" rx="6" fill="#F1E9DA"/></svg>`;
// the final logo's two chevrons (blue under red): up = closed, flipped = open. Exactly two chevrons, always.
CH.chev2 = (cls = '') => `<svg class="`+cls+`" viewBox="124 72 264 293" aria-hidden="true"><path d="M144 284.64L256 172.64L368 284.64L368 345.12L256 233.12L144 345.12Z" fill="var(--chblue,#0078BF)"/><path d="M144 204L256 92L368 204L368 264.48L256 152.48L144 264.48Z" fill="var(--chred,#E8364F)"/></svg>`;
CH.tog = () => `<span class="chtog" aria-hidden="true">${CH.chev2()}</span>`;
// the logo: full lockup (Home), compact header lockup (top bar, menu, footer); light and Warm charcoal
// each copy gets its own mask ids: a hidden copy (the closed menu) would otherwise break the mask for every other copy
CH._lk = 0; CH.uniq = svg => { const n = ++CH._lk; return svg.replace(/id="(np[^"]+)"/g, (m, id) => `id="${id}-${n}"`).replace(/url\(#(np[^)]+)\)/g, (m, id) => `url(#${id}-${n})`); };
CH.lockup = k => `<span class="nplk ${k}" role="img" aria-label="NastyPlot"><span class="lt">${CH.uniq(NP_SVG[k + 'L'])}</span><span class="dk">${CH.uniq(NP_SVG[k + 'D'])}</span></span>`;
// readiness grade: preparation for the top 30 threats, never a win chance
CH.grade = s => s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : 'F';
CH.LEGEND = 'Grade = top threats answered: A 90%+ · B 80+ · C 70+ · D 60+ · F below. Preparation, not a prediction.';
CH.LV = ['Unanswered', 'Shaky', 'Handled', 'Well handled'];
CH.n = n => n.toLocaleString ? n.toLocaleString('en-US') : String(n);
// a fold: remembers open/closed per device
CH.fold = (key, title, sub, body, open) => { const o = LS.get('cc2.chf.' + key, null); const isOpen = o == null ? !!open : !!o;
  return `<details class="chsec chfold" data-chf="${key}"${isOpen ? ' open' : ''}><summary>${CH.tog()}<div style="flex:1;min-width:0"><div class="cht">${title}</div>${sub ? `<div class="chs">${sub}</div>` : ''}</div></summary><div class="chbody">${body}</div></details>`; };
document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.chf) LS.set('cc2.chf.' + d.dataset.chf, d.open ? 1 : 0); }, true);
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
  try { const useA = $('useAbil') ? $('useAbil').checked : true, r = planMatchup(ms, names.map(n => oppMember(byName.get(n))), useA); v = {lead: r.lead.map(i => ms[i].p.n), back: r.back.map(i => ms[i].p.n)}; } catch (e) { v = null; }
  CH._fv = {key, v}; return v; };
CH.leadWhy = m => { const mv = new Set(m.moves.map(x => x.name)); if (mv.has('Tailwind')) return 'Tailwind turn 1'; if (mv.has('Trick Room')) return 'Trick Room turn 1'; if (mv.has('Fake Out')) return 'Fake Out pressure';
  if (m.ability === 'Intimidate') return 'Intimidate on entry'; if (mv.has('Follow Me') || mv.has('Rage Powder')) return 'redirects attacks'; return ''; };
// one real KO for a red-pen note: the most-used top threat one of yours OHKOs as its solid answer
CH.koNote = RD => { if (!RD) return null; let best = null;
  for (const r of RD.rows) for (const x of r.solid || []) { const du = x.du; if (du && du.win && du.nM === 1 && du.o && x.m && (!best || r.t.w > best.w)) best = {w: r.t.w, n: x.m.n, txt: `${du.o.name || String(du.o.mv).replace(/ \(.*\)$/, '')} OHKOs ${r.t.d}`}; }
  return best; };
CH.lvCount = RD => [0, 1, 2, 3].map(l => RD ? RD.rows.filter(r => r.level === l).length : 0);
CH.order = RD => RD ? RD.rows.slice().sort((a, b) => a.level - b.level || b.t.w - a.t.w) : [];
CH.tiles = (RD, attr) => `<div class="chtiles" role="group" aria-label="Top 30 threats, worst first">${CH.order(RD).map(r => { const p = byName.get(r.t.n); return `<button type="button" class="chtile l${r.level}" ${attr}="${esc(r.t.n)}" aria-label="${esc(r.t.d)}: ${CH.LV[r.level]}" title="${esc(r.t.d)}: ${CH.LV[r.level]}">${sprite(p) || `<span class="chk">${esc(r.t.d.slice(0, 3))}</span>`}</button>`; }).join('')}</div>`;
// the 10 most common threats by name (sprite, name, how ready you are), then the other 20 as a small strip, worst first
CH.threats10 = (RD, attr) => { const top = RD.rows.slice().sort((a, b) => b.t.w - a.t.w).slice(0, 10), set = new Set(top), rest = CH.order(RD).filter(r => !set.has(r));
  const lv = ['bad', 'shaky', 'mid', 'ok'];
  return `<div class="chtl10">${top.map((r, i) => { const p = byName.get(r.t.n); return `<button type="button" class="chtr l${r.level}" ${attr}="${esc(r.t.n)}" aria-label="${esc(r.t.d)}: ${CH.LV[r.level]}"><span class="rk">${i + 1}</span>${sprite(p) || ''}<span class="tx"><b>${esc(r.t.d)}</b><span class="st ${lv[r.level]}">${CH.LV[r.level]}</span></span></button>`; }).join('')}</div>
    ${rest.length ? `<div class="chk chtk">The next ${rest.length}, worst first</div><div class="chtiles chsm" role="group" aria-label="The next ${rest.length} threats">${rest.map(r => { const p = byName.get(r.t.n); return `<button type="button" class="chtile l${r.level}" ${attr}="${esc(r.t.n)}" aria-label="${esc(r.t.d)}: ${CH.LV[r.level]}" title="${esc(r.t.d)}: ${CH.LV[r.level]}">${sprite(p) || `<span class="chk">${esc(r.t.d.slice(0, 3))}</span>`}</button>`; }).join('')}</div>` : ''}`; };
// suggestions on the report: the top fix plans, one tap to apply (same plans as Build › Swaps)
CH.sugs = () => { let L = ui.planList || [], side = false; const base = ui.vsum && ui.vsum.RD ? ui.vsum.RD.score : null;
  // nothing makes the team readier: show the side-grades (different picks that keep every check) instead of a dead end
  if (ui.plans && !ui.plans.length && Array.isArray(ui.plans.more) && ui.plans.more.length) { L = ui.planList = ui.plans.more.slice(0, 3); side = true; }
  const top = L.slice(0, 2); if (!top.length) return ''; // top 2 here; All suggestions has the rest
  return `<section class="chsugs" aria-label="Suggestions">${side ? '<p class="t2 chsidek">Nothing makes this team readier for the top threats. These swaps keep every check and give it a different look:</p>' : ''}
    ${top.map((pl, k) => { if (pl._ts === undefined && pl.team && pl.team.length === 6) { try { pl._ts = tsOf(pl.team); } catch (e) { pl._ts = null; } } const d = pl._ts != null && base != null ? pl._ts - base : null;
      const pics = pl.ch.map(x => `${x.out ? `<span class="o">${sprite(x.out.p) || ''}</span><span class="ar" aria-hidden="true">→</span>` : '<span class="ar" aria-hidden="true">+</span>'}<span class="i">${sprite(x.c.p) || ''}</span>`).join('');
      const words = pl.ch.map(x => `<b>${esc(x.c.p.d)}</b>${x.out ? ` <span class="for">for ${esc(x.out.d)}</span>` : ' <span class="for">added</span>'}`).join('<br>');
      // Why?: the same reasons the full plan card gives, one tap away
      const why = (pl._why && pl._why.length ? pl._why : side ? ['Keeps every check and your speed control', 'About as ready for the top threats as now, with a different look'] : []);
      const wk = pl._wk ? `<li>Weak spots: <b>${esc(pl._wk[0])}</b> → <b>${esc(pl._wk[1])}</b></li>` : '';
      const nr = why.length + (wk ? 1 : 0);
      const whyH = nr ? `<details class="chwhy"><summary><span class="q">Why?</span><span class="n">${nr} reason${nr === 1 ? '' : 's'}</span></summary><ul>${wk}${why.map(l => `<li>${l}</li>`).join('')}</ul></details>` : '';
      const dlH = d != null ? `<span class="dl ${d > 0 ? 'up' : d < 0 ? 'dn' : ''}">${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)}% ready</span>` : '', apH = `<button type="button" class="${k ? 'chghost' : 'chprimary'} chapply" data-plan="${k}">Apply</button>`;
      // two or more changes: one row per change, then the readiness and Apply underneath (Oct 30, Sim: the squeezed column looked unpolished)
      if (pl.ch.length > 1) return `<div class="chsugw"><div class="chsug multi"><div class="chml">${pl.ch.map(x => `<div class="chmc"><div class="pics">${x.out ? `<span class="o">${sprite(x.out.p) || ''}</span><span class="ar" aria-hidden="true">→</span>` : '<span class="ar" aria-hidden="true">+</span>'}<span class="i">${sprite(x.c.p) || ''}</span></div><div class="txt"><b>${esc(x.c.p.d)}</b>${x.out ? ` <span class="for">for ${esc(x.out.d)}</span>` : ' <span class="for">added</span>'}</div></div>`).join('')}</div><div class="chmf">${dlH}${apH}</div></div>${whyH}</div>`;
      return `<div class="chsugw"><div class="chsug"><div class="pics">${pics}</div><div class="txt">${words}${dlH}</div>${apH}</div>${whyH}</div>`; }).join('')}<button type="button" class="linkbtn chseeall" data-view="coverage">See all suggestions ›</button></section>`; };
CH.legendRow = RD => { const c = CH.lvCount(RD); return `<div class="chleg">${[[0, 'var(--chbad)'], [1, 'var(--chshaky)'], [2, 'var(--chmid)'], [3, 'var(--chok)']].map(([l, col]) => `<span><i style="background:${col}"></i>${CH.LV[l]} ${c[l]}</span>`).join('')}</div>`; };
// ---------- Home ----------
const chHomeOld = renderHome;
renderHome = function () { const el = $('homeOut'); if (!el) return; const pane = document.querySelector('[data-pane="home"]'); if (pane && pane.hidden && el.innerHTML) return;
  el.classList.add('chhome');
  const ms = members(), v = ui.vsum || {}, RD = ms.length ? prepOf(ms) : null, six = CH.metaSix(), F = CH.four(ms), nTeams = (RES && RES.teams) || 0;
  const byN = n => ms.find(m => m.p.n === n), fl = F ? F.lead.map(byN).filter(Boolean) : [], fb = F ? F.back.map(byN).filter(Boolean) : [];
  const tagOf = m => !F ? '' : fl.includes(m) ? '<div class="chtag lead">Lead</div>' : fb.includes(m) ? '<div class="chtag">Back</div>' : '<div class="chtag">Bench</div>';
  const mine = ms.slice(0, 6), ord = F ? [...fl, ...fb, ...mine.filter(m => !fl.includes(m) && !fb.includes(m))] : mine;
  const you = `<div class="chband you chhalf"><div class="chk">● You${ms.length ? ' · ' + esc(teamTitleFor(ms)) : ''}</div><div class="chsix">${ms.length ? ord.map(m => `<div>${sprite(m.p) || ''}${tagOf(m)}</div>`).join('') : Array.from({length: 6}, () => '<div><div class="empty"></div></div>').join('')}</div>${ms.length ? '' : '<div class="chk" style="margin-top:6px">Your six goes here</div>'}</div>`;
  const them = `<div class="chband them chhalf"><div class="chk" style="text-align:right">The meta's six · % of teams</div><div class="chsix">${six.map(p => `<div>${sprite(p) || ''}<div class="pc">${U(p).toFixed(1)}%</div></div>`).join('')}</div></div>`;
  const mid = `<div class="chmid">
    ${F ? `<div class="ch64"><span class="n b">6</span><span class="chk">bring</span><span style="font-size:26px" aria-hidden="true">→</span><span class="n r">4</span><span class="chk">pick</span><span class="chpen" style="margin-left:auto;transform:rotate(-3deg)">your four vs the meta's six <span class="chup">↑</span><span class="chdn">↓</span></span></div>
    <div class="chfour">${[...fl, ...fb].map((m, i) => `<div>${sprite(m.p) || ''}<div class="lab${i < 2 ? ' lead' : ''}">${i < 2 ? 'LEAD' : 'BACK'}</div></div>`).join('')}</div>` : ''}
    </div>`;
  // 01 latest winner
  const E = META.events; let ev = null, t = null;
  if (E && Array.isArray(E.events)) for (const e of E.events) { const w = (e.top || []).find(x => x && x.place === 1 && x.mons && x.mons.length === 6 && x.mons.every(m => byName.get(m.n))); if (w) { ev = e; t = w; break; } }
  const sameSix = !!(t && ms.length === 6 && t.mons.every(m => ms.some(x => x.p.n === m.n)));
  const win = ev ? `<div class="chwinwrap"><div class="chk">Latest winner · ${esc(ev.name)}</div><div class="chwh">The champion brought ${sameSix ? '<span class="hl">your</span>' : 'these'} six.</div>
    <div class="chwin"><div class="top">${t.record ? `<span class="rec">${esc(t.record)}</span>` : ''}<div><div class="who">${esc(t.player)}</div><div class="chk">${evDate(ev.date)}${ev.players ? ` · ${ev.players} players` : ''}</div>${sameSix ? '<div class="chpen">Same six as yours!</div>' : ''}</div></div>
    <div class="chwsix">${t.mons.map(m => `<span title="${esc(byName.get(m.n).d)}">${sprite(byName.get(m.n)) || esc(byName.get(m.n).d)}</span>`).join('')}</div>
    <div class="row"><button class="chghost" type="button" data-evload="${esc(ev.id)}#${ev.top.indexOf(t)}">Load this team</button><button class="linkbtn" type="button" data-view="events">All ${E.events.length} events ›</button></div></div></div>` : '';
  // 02 your team: readiness, tiles worst first
  // Your team on Home: the six as big sprites (the readiness tool lives on the Team page and its scouting sheet)
  const ready = ms.length ? `<div class="chblock"><div class="chk">Your team · ${ms.length}/6</div>
    <button type="button" class="chshow" data-view="build" aria-label="Open my team: ${esc(teamTitleFor(ms))}"><span class="chshn">${esc(teamTitleFor(ms))}</span>
    <span class="chshs">${ord.map(m => `<span class="chshm" title="${esc(m.d)}">${sprite(m.p) || `<b>${esc(m.d)}</b>`}${F && (fl.includes(m) || fb.includes(m)) ? `<i class="${fl.includes(m) ? 'lead' : ''}">${fl.includes(m) ? 'Lead' : 'Back'}</i>` : ''}</span>`).join('')}</span><span class="chshf" aria-hidden="true"></span></button>
    <button type="button" class="chghost" data-view="build" style="margin-top:10px">Open my team</button></div>`
    : `<div class="chblock"><div class="chk">Your team</div><div class="chshow empty"><span class="chshn">Your six goes here</span>
    <span class="chshs">${six.map(p => `<span class="chshm" title="${esc(p.d)}">${sprite(p) || ''}</span>`).join('')}</span><span class="chshf" aria-hidden="true"></span>
    <span class="t2" style="display:block;padding:0 14px 12px">The six most-used Pokémon at tournaments right now. Build me a team drafts a full six from real winning teams.</span></div>
    <button type="button" class="chghost" data-view="build" style="margin-top:10px">Start from scratch</button></div>`;
  // 03 doubles is played in pairs: Showdown replays, how often the first brings the second
  const bw = RES && RES.tc && RES.tc.bw, games = RES && RES.tc && RES.tc.games;
  let pairs = []; if (bw) { const used = new Set(); for (const p of six) { const k = brKeyOf(p), L = bw[k]; if (!L) continue; const x = L.find(y => !used.has(k + '|' + y[0]) && byName.get(y[0])); if (!x) continue; used.add(x[0] + '|' + k); pairs.push({a: p, b: byName.get(x[0]), pct: x[1], g: x[2]}); if (pairs.length === (PHONE() ? 2 : 4)) break; } }
  const pr = pairs.length >= 2 ? `<div class="chblock"><div class="chk">Team preview · Showdown replays${games ? ` · ${CH.n(games)} games` : ''}</div><h3>Doubles is played in <span class="hl">pairs.</span></h3>
    <div class="chpair4">${pairs.map(x => `<button type="button" data-lt="${esc(x.b.n)}" aria-label="${esc(x.a.d)} and ${esc(x.b.d)}: brought together ${x.pct}%"><div class="sp">${sprite(x.a) || ''}${sprite(x.b) || ''}</div><div><div class="pct">${x.pct}<i>%</i></div><div class="nm">${esc(x.a.d)} + ${esc(x.b.d)}</div><div class="t2">${CH.n(x.g)} games</div></div></button>`).join('')}</div><div class="t2" style="margin-top:6px">% = how often the pair is brought together when both are on the team.</div></div>` : '';
  // the older Home sections, folded (nothing removed)
  const rows = lairRows(), top = rows.slice(0, 10), gems = rows.filter(x => isGem(x.p)).slice(0, 4);
  const cores = RES && Array.isArray(RES.cores) ? RES.cores.filter(c3 => c3[3] >= 60 && c3.slice(0, 3).every(n => byName.get(n))).sort((a, b) => b[4] - a[4]).slice(0, 3) : [];
  const L = Array.isArray(S.log) ? S.log : [], ls = L.length ? logStats(L) : null;
  // phones show a one-line label so the tools fit in fewer screens
  const HOME_SHORT = {matchup: 'Leads and turn 1', top: 'Search winning teams', cores: 'Pairs that win', ratings: 'Every Pokémon rated', calc: 'Real damage numbers', gauntlet: 'vs top 20 teams', events: 'Recent tournaments', sets: 'What players run', speed: 'Who moves first', arch: 'Beat each style', types: 'What hits what'};
  const tools = `<div class="htiles">${HOME_TILES.map(([v2, t2, d, ic]) => `<button type="button" class="htile" data-view="${v2}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><b>${t2}</b><span class="hld">${d}</span><span class="hsd">${HOME_SHORT[v2] || d}</span></button>`).join('')}</div>`;
  const topMeta = `<div class="hpick">${gems.length ? `<div class="seg" role="group" aria-label="Show"><button type="button" data-hgems="0" aria-pressed="${!ui.homeGems}">Top rated</button><button type="button" data-hgems="1" aria-pressed="${!!ui.homeGems}">Hidden gems</button></div>` : ''}<p class="t2">${ui.homeGems && gems.length ? 'Rated 55+ but rarely used. Results hold up so far.' : 'Highest NastyPlot ratings right now. Tap one for the breakdown.'}</p></div>
    <div class="hrow">${ui.homeGems && gems.length ? gems.map(x => homeMini(x.p, x.r, '<i>◆</i>')).join('') : top.map(x => homeMini(x.p, x.r)).join('')}</div><button type="button" class="linkbtn" data-view="ratings">All ratings ›</button>`;
  const coresH = cores.length ? `<p class="t2">Trios with the best win rates at tournaments (60+ teams each).</p><div class="hcores">${cores.map(c3 => { const ps = c3.slice(0, 3).map(n => byName.get(n)); return `<button type="button" class="hcore" data-view="cores"><div class="hcs">${ps.map(p => sprite(p, 'hcspr') || '').join('')}</div><div class="hcn">${ps.map(p => esc(p.d)).join(' · ')}</div><div class="hcw"><b>${Math.round(c3[4] * 100)}%</b> win rate · ${CH.n(c3[3])} teams</div></button>`; }).join('')}</div><button type="button" class="linkbtn" data-view="cores">All cores ›</button>` : '';
  const battles = ls ? `<div class="hlogs"><div><b>${ls.w}–${ls.l}</b><span>${ls.pct}% wins</span></div><div><b>${ls.n}</b><span>logged</span></div><div class="hdots">${L.slice(-10).map(e => `<i class="${e.r === 'W' ? 'w' : 'l'}" title="${e.r === 'W' ? 'Win' : 'Loss'}"></i>`).join('')}</div></div><button type="button" class="linkbtn" data-view="matchup">Battle log ›</button>`
    : '<div class="hempty"><p class="t2">Log your games after each match and your record shows up here.</p><button type="button" class="btn sm" data-view="matchup">Log a game</button></div>';
  let trends = ''; try { trends = homeTrends(); } catch (e) { trends = ''; }
  // the split hero: your six (blue) · plot your win (cream) · the latest champion's six (red), live from the events data
  const logo = CH.lockup('full');
  const champ = t ? t.mons.map(m => ({p: byName.get(m.n), it: m.i || '', ab: m.a || ''})).filter(x => x.p) : null;
  const FC = champ && ms.length >= 4 ? CH.fourVs(ms, champ.map(x => x.p.n)) : null, foe = FC ? 'the champion\'s six' : 'the meta\'s six', F2 = FC || F;
  const cl = F2 ? F2.lead.map(byN).filter(Boolean) : [], cb = F2 ? F2.back.map(byN).filter(Boolean) : [];
  const ord2 = F2 ? [...cl, ...cb, ...mine.filter(m => !cl.includes(m) && !cb.includes(m))] : mine;
  const tag2 = m => !F2 ? '' : cl.includes(m) ? '<span class="chtag lead">Lead</span>' : cb.includes(m) ? '<span class="chtag">Back</span>' : '<span class="chtag">Bench</span>';
  const row = (sp, nm, line, tg, right) => `<div class="chhr2${right ? ' r' : ''}">${sp}<div class="chbd2"><b>${esc(nm)}</b>${line ? `<span>${esc(line)}</span>` : ''}</div>${tg || ''}</div>`;
  const youH = `<div class="chband you chhalf chcol"><div class="chk">● You · ${ms.length ? 'pick 4' : 'your six'}</div><div class="chcolt">${ms.length ? esc(teamTitleFor(ms)) : 'Your six'}</div>
    ${ms.length ? `<div class="chlist6">${ord2.map(m => row(sprite(m.p) || '', m.d, [m.item, m.ability].filter(Boolean).join(' · '), tag2(m))).join('')}</div><div class="chwl" style="justify-content:flex-start"><button type="button" class="chghost onblue" data-view="report">Open my team</button></div>`
      : `<div class="chlist6 empty">${Array.from({length: 6}, () => '<div class="chhr2"><span class="emp"></span><div class="chbd2"><b>&nbsp;</b></div></div>').join('')}</div><button type="button" class="chghost onblue" data-view="build">Add your six</button>`}</div>`;
  const themH = champ ? `<div class="chband them chhalf chcol"><div class="chk" style="text-align:right">Latest winner · ${esc(ev.name)} ●</div><div class="chcolt" style="text-align:right">The champion's six</div>
    <div class="chwho">${esc(t.player)}${t.record ? ` · <b>${esc(t.record)}</b>` : ''} · ${evDate(ev.date)}${ev.players ? ` · ${ev.players} players` : ''}${sameSix ? ' · <span class="chpen" style="color:#fff">same six as yours!</span>' : ''}</div>
    <div class="chlist6">${champ.map(x => row(sprite(x.p) || '', x.p.d, [x.it, x.ab].filter(Boolean).join(' · '), '', true)).join('')}</div>
    <div class="chwl"><button class="chghost onred" type="button" data-evload="${esc(ev.id)}#${ev.top.indexOf(t)}">Load this team</button><button class="linkbtn" type="button" data-view="events">All ${E.events.length} events ›</button></div></div>` : `<div class="chband them chhalf chcol"><div class="chk" style="text-align:right">The meta's six · % of teams</div><div class="chsix">${six.map(p => `<div>${sprite(p) || ''}<div class="pc">${U(p).toFixed(1)}%</div></div>`).join('')}</div></div>`;
  const midH = `<div class="chmid"><div class="chk">Team preview · Reg M-C doubles</div><div class="chdisp chh1" role="heading" aria-level="2">Plot your win.</div><div class="sub">Before turn one.</div>
    <p>From <b>${nTeams ? CH.n(nTeams) + ' real tournament teams' : 'real tournament results'}</b>. See their six, pick your four.</p>
    ${F2 && cl.length ? `<div class="ch64"><span class="n b">6</span><span class="chk">bring</span><span style="font-size:26px" aria-hidden="true">→</span><span class="n r">4</span><span class="chk">pick</span></div>
    <div class="chk" style="margin:2px 0 6px">NastyPlot's four vs ${foe}</div><div class="chfour">${[...cl, ...cb].map((m, i) => `<div>${sprite(m.p) || ''}<div class="lab${i < 2 ? ' lead' : ''}">${i < 2 ? 'LEAD' : 'BACK'}</div></div>`).join('')}</div>` : ''}
    <div class="chacts"><button type="button" class="chprimary" data-view="auto">Build me a team <span aria-hidden="true">➜</span></button><button type="button" class="chghost" data-view="report">${ms.length ? 'Check my team' : 'Start from scratch'}</button></div></div>`;
  // phone Home: one story top to bottom. What this is + the one button, then the latest champion, then your six.
  const mon = (p, sub, tg) => `<div class="chmmon">${sprite(p) || ''}<b>${esc(p.d)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}${tg || ''}</div>`;
  const pickLine = F2 && cl.length && cb.length ? `<div class="chmwho">NastyPlot's pick vs ${foe}: lead <b>${cl.map(m => esc(m.d)).join(' + ')}</b>, back ${cb.map(m => esc(m.d)).join(' + ')}</div>` : '';
  const phoneH = `<div class="chmh">
    <section class="chmhero"><div class="chk">Pokémon Champions · Reg M-C doubles</div><div class="chdisp chh1" role="heading" aria-level="2">Plot your win.</div><div class="chdisp sub">Before turn one.</div>
      <p>Teams, sets and matchups from <b>${nTeams ? CH.n(nTeams) + ' real tournament teams' : 'real tournament results'}</b>.</p>
      <div class="chmacts"><button type="button" class="chprimary" data-view="auto">Build me a team <span aria-hidden="true">➜</span></button><button type="button" class="chghost" data-view="report">${ms.length ? 'Check my team' : 'Start from scratch'}</button></div></section>
    ${champ ? `<section class="chmcard them"><div class="chk">Latest winner · ${esc(ev.name)}</div><div class="chmct">The champion's six</div>
      <div class="chmwho">${esc(t.player)}${t.record ? ` · <b>${esc(t.record)}</b>` : ''} · ${evDate(ev.date)}${ev.players ? ` · ${ev.players} players` : ''}${sameSix ? ' · <span class="chpen">same six as yours!</span>' : ''}</div>
      <div class="chmgrid">${champ.map(x => mon(x.p, x.it)).join('')}</div>
      <div class="chmrow"><button class="chghost onred" type="button" data-evload="${esc(ev.id)}#${ev.top.indexOf(t)}">Load this team</button><button class="linkbtn" type="button" data-view="events">All ${E.events.length} events ›</button></div></section>` : ''}
    <section class="chmcard you"><div class="chk">Your team${ms.length ? ` · ${ms.length}/6` : ''}</div><div class="chmct">${ms.length ? esc(teamTitleFor(ms)) : 'Your six goes here'}</div>
      ${ms.length ? `${pickLine}<div class="chmgrid">${ord2.map(m => mon(m.p, '', tag2(m))).join('')}</div><div class="chmrow"><button type="button" class="chghost onblue" data-view="report">Open my team</button>${FC && !sameSix ? `<button type="button" class="linkbtn" data-evvs="${esc(ev.id)}#${ev.top.indexOf(t)}">Prep vs the champion ›</button>` : ''}</div>`
        : `<div class="chmwho">Add six Pokémon and NastyPlot scouts the top threats for you.</div><div class="chmrow"><button type="button" class="chghost onblue" data-view="build">Add your six</button></div>`}</section>
  </div>`;
  const topH = phoneH + `<div class="chsplit chdesk">${youH}${midH}${themH}</div>`;  el.innerHTML = topH + `
    <div class="chpad">${typeof welcomeCard === 'function' ? welcomeCard() : ''}${typeof whatsNewCard === 'function' ? whatsNewCard() : ''}</div>
    <section class="chblock chhtop"><div class="chk">${ui.homeGems && gems.length ? 'Rated 55+ but rarely used' : 'NastyPlot ratings · from real tournament results'}</div><h3>Top of the <span class="hl">meta.</span></h3>${topMeta}</section>
    <section class="chblock chhtools"><div class="chk">Everything NastyPlot does</div><h3>All ${HOME_TILES.length} <span class="hl">tools.</span></h3>${tools}</section>
    <div class="chfolds">
      ${CH.fold('more', 'More on Home', `Doubles is played in pairs${trends ? ' · what changed' : ''}${coresH ? ' · winning cores' : ''} · your battles`, `${pr}${trends ?`<div class="chk" style="margin-top:14px">What changed this week</div>${trends}` : ''}${coresH ? `<div class="chk" style="margin-top:14px">Winning cores</div>${coresH}` : ''}<div class="chk" style="margin-top:14px">Your battles${ls ? ' · ' + ls.w + '–' + ls.l : ''}</div>${battles}<p class="hfoot">${esc((RES && RES.source) || '')}${RES && RES.source ? ' · ' : ''}Ratings: top-cut presence, conversion and win rate at real tournaments.</p>`)}




      ${ui.usageOwner ? `<details class="hsec usebox" id="usageBox"><summary><b>What people use</b> <span class="vsub">only you see this</span></summary><div id="usageOut"></div></details>
      <details class="hsec usebox" id="fbBox"><summary><b>Feedback</b> <span class="vsub">only you see this</span></summary><div id="fbOut"></div></details>` : ''}
      ${typeof FB !== 'undefined' && FB.ok ? '<div class="hfb"><span>Something off or missing?</span><button type="button" class="btn sm fbbtn" data-fbopen="1">Send feedback</button></div>' : ''}
</div>`; };
// replay keys fold Megas into their species (same as the ratings sheet)
function brKeyOf(p) { return p.n === 'Floette-Mega' ? 'Floette-Eternal' : p.n.replace(/-Mega(-[XYZ])?$/, ''); }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chhthr]'); if (!b) return; const n = b.dataset.chhthr; if (view !== 'report') setView('report'); setTimeout(() => chScoutOpen(n), 50); });
// ---------- My team: one page in four parts (Fix it · Threats · How your team plays · Your six) ----------
// Every original card and table is moved in whole, so its renderer, ids and handlers keep working. Editing a set happens
// in a panel that slides up (the whole editor lives there), so there is no separate Edit page.
CH.seg = (key, opts, on) => `<div class="seg chseg" role="group" data-chseg="${key}">${opts.map(([k, t]) => `<button type="button" data-chsegv="${k}" aria-pressed="${k === on}">${t}</button>`).join('')}</div>`;
CH.part = (id, n, title, q) => { const s = document.createElement('section'); s.className = 'chpart'; s.id = id; s.innerHTML = `<div class="chparth"><span class="n">${n}</span><div><h2 class="chdisp">${title}</h2><p>${q}</p></div></div><div class="chpartb"></div>`; return s; };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chsegv]'); if (!b) return; const g = b.closest('[data-chseg]'), key = g.dataset.chseg, v = b.dataset.chsegv;
  LS.set('cc2.seg.' + key, v); g.querySelectorAll('[data-chsegv]').forEach(x => x.setAttribute('aria-pressed', x === b)); document.querySelectorAll(`[data-chsegp="${key}"]`).forEach(p => { p.hidden = p.dataset.chsegk !== v; }); });
function chTeamInit() { const rp = document.querySelector('[data-pane="report"]'); if (!rp || rp.dataset.ch) return; rp.dataset.ch = '1';
  const team = $('team'), fixes = $('fixes'), rep = $('repFold'); if (!team || !fixes || !rep) return;
  const cols = fixes.querySelectorAll('.fixcol');
  const mk = (key, title, open) => { const w = document.createElement('div'); w.innerHTML = CH.fold(key, title, '', '', open); const d = w.firstElementChild; d.querySelector('.chs') || d.querySelector('summary > div').insertAdjacentHTML('beforeend', '<div class="chs"></div>'); return d; };
  const flat = (sid, keepFold) => { const s = $(sid); if (!s) return null; const h = s.querySelector(':scope > .head'); if (h) { const p = h.querySelector('.hint'); if (p) { p.classList.add('t2'); h.before(p); } h.remove(); } if (!keepFold) s.querySelectorAll('.phonefold').forEach(x => { x.open = true; x.classList.add('chflat'); }); return s; };
  const panel = (key, k, nodes, on) => { const d = document.createElement('div'); d.dataset.chsegp = key; d.dataset.chsegk = k; d.hidden = k !== on; nodes.filter(Boolean).forEach(n => d.append(n)); return d; };
  const head = document.createElement('div'); head.id = 'chTeam'; head.className = 'chteam'; rp.prepend(head);
  // 1 · Fix it: suggestions, then everything still to look at (problems, checklist, legal and items)
  const p1 = CH.part('chP1', '1', 'Fix it', 'What to change, best first'); const b1 = p1.querySelector('.chpartb');
  b1.innerHTML = '<div class="chpoolrow"><span class="chk">Suggest from</span><div class="seg chpool" role="group" aria-label="Suggest from"><button type="button" data-chpool="box">My box</button><button type="button" data-chpool="boxfill">Box + catch</button><button type="button" data-chpool="all">Whole roster</button></div></div><div id="chSugOut"></div>'; if (cols[0]) { const h = cols[0].querySelector(':scope > .head h2'); if (h) h.remove(); }
  const fx = mk('rfix', 'Problems and checklist', false); fx.id = 'chfFix'; const fb = fx.querySelector('.chbody'); [cols[0], $('chkCard'), $('verdict')].filter(Boolean).forEach(n => fb.append(n)); b1.append(fx);
  // 2 · Threats: one section, three views of the same 30 threats
  const p2 = CH.part('chP2', '2', 'Threats', 'Who beats you, and who handles them'); const b2 = p2.querySelector('.chpartb'), on2 = LS.get('cc2.seg.thr', 'top');
  b2.append(Object.assign(document.createElement('div'), {innerHTML: CH.seg('thr', [['top', 'Top 10'], ['grid', 'vs top 12'], ['all', 'All 30']], on2)}).firstElementChild);
  b2.append(panel('thr', 'top', [Object.assign(document.createElement('div'), {id: 'chThrTop'})], on2), panel('thr', 'grid', [Object.assign(document.createElement('div'), {id: 'chVsOut'})], on2), panel('thr', 'all', [$('thrCard'), flat('thrSec')], on2));
  // 3 · How your team plays: the game plan, then what you hit hard and what hits you
  const p3 = CH.part('chP3', '3', 'How your team plays', 'Leads, what to bring, what you hit and what hits you'); const b3 = p3.querySelector('.chpartb'), on3 = LS.get('cc2.seg.types', 'off');
  const gp = rep.querySelector('.gpcard'); if (gp) { const g = mk('rgplan', 'Game plan', false); g.id = 'chfGplan'; g.querySelector('.chbody').append(gp); b3.append(g); }
  // Types sits in a fold like Game plan, so My team fits in about three phone screens
  { const ty = mk('rtypes', 'Types', false); ty.id = 'chfTypes'; ty.querySelector('.chs').textContent = 'What you hit and what hits you'; const tb = ty.querySelector('.chbody');
    tb.append(Object.assign(document.createElement('div'), {innerHTML: CH.seg('types', [['off', 'Offense: what you hit'], ['def', 'Defense: what hits you']], on3)}).firstElementChild);
    tb.append(panel('types', 'off', [$('offCard'), flat('offense', true)], on3), panel('types', 'def', [$('defCard'), flat('defSec', true)], on3)); b3.append(ty); }
  // 4 · Your six: the sheet; tap a row to edit that set
  const p4 = CH.part('chP4', '4', 'Your six', 'Tap a Pokémon to edit its set'); p4.querySelector('.chpartb').innerHTML = '<div id="chSheetOut"></div>';
  const grid = document.createElement('div'); grid.className = 'chparts'; grid.append(p1, p2, p3, p4); head.after(grid);
  // How scoring works: a small link at the bottom that opens the explainer
  const foot = document.querySelector('[data-pane="coverage"] details.foot'); if (foot) { grid.after(foot); foot.className = 'chsec chfold chhow'; foot.dataset.chf = 'rhow'; const s = foot.querySelector('summary'), body = document.createElement('div'); body.className = 'chbody';
    [...foot.children].filter(x => x !== s).forEach(x => body.append(x)); foot.append(body); if (s) s.innerHTML = `${CH.tog()}<div style="flex:1;min-width:0"><div class="cht">How scoring works</div></div>`; }
  rep.hidden = true; const dsec = $('defense'); if (dsec) dsec.hidden = true;
  // the edit panel: the whole team editor, slid up over the page, showing the one set you tapped
  const acts = team.querySelector('.teamhead .row'); if (acts) { acts.classList.add('chacts2'); CH.acts = acts; }
  const ed = document.createElement('div'); ed.className = 'chedit'; ed.id = 'chEdit'; ed.hidden = true; ed.setAttribute('role', 'dialog'); ed.setAttribute('aria-modal', 'true'); ed.setAttribute('aria-label', 'Edit team');
  ed.innerHTML = '<div class="chedh"><b id="chEditT">Edit</b><button type="button" class="chghost" id="chEditDone">Done</button></div><div class="chedb"></div>';
  const escrim = document.createElement('div'); escrim.className = 'chscrim'; escrim.id = 'chEditScrim'; escrim.hidden = true;
  document.body.append(escrim, ed); ed.querySelector('.chedb').append(team); escrim.addEventListener('click', () => chEditClose()); $('chEditDone').addEventListener('click', () => chEditClose());
  // All suggestions (the Swaps page) keeps the bigger plans under the one-Pokémon swaps
  const ps = $('planSec'); if (ps && cols[1]) ps.append(cols[1]); fixes.hidden = true;
  // the threat sheet (one threat at a time, from a tile or a chart row)
  const scrim = document.createElement('div'); scrim.className = 'chscrim'; scrim.id = 'chScrim'; scrim.hidden = true;
  const sh = document.createElement('div'); sh.className = 'chscout'; sh.id = 'chScout'; sh.hidden = true; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', 'Threat');
  document.body.append(scrim, sh); scrim.addEventListener('click', () => chScoutClose()); }
// open the editor on one slot (or the whole team for import, export and saving)
function chEditOpen(i) { const ed = $('chEdit'); if (!ed) return; ed.dataset.slot = i == null ? 'all' : String(i);
  if (ui.tview === 'grid') { ui.tview = 'full'; LS.set('cc2.tview', 'full'); try { renderSlots(); } catch (e) {} }
  const m = i == null ? null : members().find(x => x.i === +i); $('chEditT').textContent = i == null ? 'Edit team' : m ? 'Edit ' + m.d : 'Add a Pokémon';
  ed.classList.toggle('chadd', i != null && !m); ed.hidden = false; $('chEditScrim').hidden = false; document.documentElement.classList.add('chlock'); ed.scrollTop = 0; { const eb = ed.querySelector('.chedb'); if (eb) eb.scrollTop = 0; }
  // an empty slot: focus its name box right away, inside the tap, so phones open the keyboard
  try { chEditStrip(); } catch (e) {}
  if (i != null && !m) { const inp = ed.querySelector(`#pk${i}`) || ed.querySelector(`#slot${i} input`); if (inp) { try { inp.focus({preventScroll: true}); } catch (e) { inp.focus(); } } } }
// the edit panel's team strip: your six as mini sprites (tap to switch), + for an empty slot; and a clear Remove button
function chEditStrip() { const ed = $('chEdit'); if (!ed || ed.hidden) return; let st = ed.querySelector('.chedstrip'); if (!st) { st = document.createElement('div'); st.className = 'chedstrip'; st.setAttribute('role', 'group'); st.setAttribute('aria-label', 'Your six'); ed.querySelector('.chedh').after(st); }
  const cur = ed.dataset.slot, mm = new Map(members().map(m => [m.i, m]));
  st.innerHTML = S.slots.map((x, i) => { const m = mm.get(i); return `<button type="button" class="chst${String(i) === cur ? ' on' : ''}${m ? '' : ' add'}" data-chedit="${i}" aria-label="${m ? 'Edit ' + esc(m.d) : 'Add a Pokémon in slot ' + (i + 1)}"${String(i) === cur ? ' aria-current="true"' : ''}>${m ? (sprite(m.p, 'mini') || esc(m.d.slice(0, 3))) : '<span aria-hidden="true">+</span>'}</button>`; }).join('');
  let rb = ed.querySelector('.chedrm'); const m = cur !== 'all' ? mm.get(+cur) : null;
  if (!rb) { rb = document.createElement('button'); rb.type = 'button'; rb.className = 'chghost chedrm'; ed.querySelector('.chedb').append(rb); }
  rb.hidden = !m; if (m) { rb.dataset.chrm = cur; rb.textContent = `Remove ${m.d} from the team`; } }
function chEditClose() { const ed = $('chEdit'); if (!ed || ed.hidden) return; ed.hidden = true; $('chEditScrim').hidden = true; document.documentElement.classList.remove('chlock'); }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chedit]'); if (!b) return; chEditOpen(b.dataset.chedit === 'all' ? null : +b.dataset.chedit); });
// Import, Export and Save show their panels inside the editor
document.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('#importBtn,#exportBtn,#saveBtn'); if (t && $('chEdit') && $('chEdit').hidden) chEditOpen(null); }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') chEditClose(); });
function chTeamRender() { const head = $('chTeam'); if (!head) return; const ms = members(), RD = ms.length ? prepOf(ms) : null, v = ui.vsum || {}, c = CH.lvCount(RD);
  const F = CH.four(ms), lead = F ? ms.find(m => m.p.n === F.lead[0]) || null : null, ko = CH.koNote(RD);
  const note = m => { if (lead && m === lead) { const w = CH.leadWhy(m); return `<div class="chpen">↑ Lead vs the meta's six${w ? ' · ' + esc(w) : ''}</div>`; } if (ko && m.p.n === ko.n && !(lead && lead.p.n === ko.n)) return `<div class="chpen">${esc(ko.txt)}</div>`; return ''; };
  const all = S.slots.map((s, i) => ({m: ms.find(x => x.i === i), i})).slice(0, 6);
  // a filled card is a tappable box (not a button) so it can hold its own − (remove) button
  const row = ({m, i}) => m ? `<div role="button" tabindex="0" class="chrow" data-chedit="${i}" aria-label="Edit ${esc(m.d)}"><button type="button" class="chrm" data-chrm="${i}" aria-label="Remove ${esc(m.d)} from the team">−</button><span class="ix">${i + 1}</span>${sprite(m.p) || ''}<div class="chbd"><div class="nm">${esc(m.d)}${m.spread && m.spread.assumed ? ' <span class="chtag ass" title="No stat points on the sheet: your nature on the most common spread">spread assumed</span>' : ''}</div><div class="mono">${esc(m.item || 'No item')} · ${esc(m.ability || '')}</div><div class="mono mv">${m.moves.map(x => esc(x.name)).join(' · ')}</div>${note(m)}</div><span class="chedi" aria-hidden="true">Edit</span></div>`
    : `<button type="button" class="chrow empty" data-chedit="${i}" aria-label="Add a Pokémon to slot ${i + 1}"><span class="ix">${i + 1}</span><span class="chadd">+</span><div class="chbd"><div class="nm">Add a Pokémon</div></div></button>`;
  const ck = v.CK ? `<span class="chpill ${v.CK.pass === v.CK.n ? 'ok' : ''}">${v.CK.pass}/${v.CK.n} checks</span>` : '';
  const legal = ms.length ? `<span class="chpill ${v.legal === false ? 'bad' : 'ok'}">${v.legal === false ? 'Not legal yet' : 'Legal'}</span>` : '';
  head.innerHTML = `<div class="chthead"><div style="flex:1;min-width:0"><div class="chk">My team · ${ms.length} of 6</div><div class="nm" role="heading" aria-level="1">${esc(ms.length ? teamTitleFor(ms) : 'No team yet')}</div>
      ${RD ? `<div class="rd"><b>${RD.score}% ready</b> for the top 30 threats${typeof tip === 'function' ? tip('readiness') : ''} · ${c[0]} unanswered · ${c[1]} shaky</div>` : `<div class="rd">Add your six and NastyPlot scouts the top 30 threats for you.</div>`}
      <div class="chpills">${legal}${ck}</div>
      ${ms.length ? `<div class="chsix6">${all.filter(x => x.m).map(({m, i}) => `<button type="button" data-chedit="${i}" aria-label="Edit ${esc(m.d)}">${sprite(m.p) || esc(m.d)}</button>`).join('')}</div>` : ''}
      <div class="chacts2" id="chActs"><button type="button" class="chghost" data-view="teams">Saved teams</button><button type="button" class="chghost" data-view="box">My box</button></div></div>
    ${RD ? `<div class="chring" title="Readiness grade: preparation, not a prediction">${CH.grade(RD.score)}</div>` : ''}</div>
    ${ms.length ? '' : `<div class="chempty2"><button type="button" class="chprimary" data-chedit="0">Add your first Pokémon <span aria-hidden="true">➜</span></button><button type="button" class="chghost" data-view="auto">Build me a team</button></div>`}`;
  if (CH.acts) $('chActs').append(CH.acts);
  document.querySelectorAll('#chP1,#chP2,#chP3').forEach(p => { p.hidden = !ms.length; });
  // empty team: nothing to save, share, export or clear (Import stays in ⋯), and "Your six" is the only part, so no step number
  ['saveBtn', 'shareBtn', 'exportBtn', 'clearTeam'].forEach(id => { const x = $(id); if (x) x.hidden = !ms.length; });
  { const n = document.querySelector('#chP4 .chparth .n'); if (n) n.hidden = !ms.length; const q = document.querySelector('#chP4 .chparth p'); if (q) q.textContent = ms.length ? 'Tap a Pokémon to edit its set' : 'Tap a slot to add a Pokémon'; }
  document.querySelectorAll('[data-chpool]').forEach(b => b.setAttribute('aria-pressed', b.dataset.chpool === ui.pool));
  // part 1: suggestions
  { const o = $('chSugOut'); if (o) o.innerHTML = ms.length ? (CH.sugs() || '<p class="t2">No change readies this team for more of the top threats. Nice.</p>') : ''; }
  const sum = (id, t) => { const d = $(id); const s = d && d.querySelector('.chs'); if (s) s.textContent = t; };
  { const nd = $('needs'), n = $('needsSub'); sum('chfFix', [n && n.textContent ? n.textContent : 'Nothing big to fix', v.CK ? `${v.CK.pass}/${v.CK.n} checks` : '', v.legal === false ? 'not legal yet' : 'legal'].filter(Boolean).join(' · ')); }
  { const g = document.querySelector('#chfGplan .gpcard'), tags = g ? [...g.querySelectorAll('.gphead .tag, .gphead .chip, .gphead .arch')].map(x => x.textContent.trim()).filter(Boolean) : []; sum('chfGplan', (tags.length ? tags.map(x => x.charAt(0) + x.slice(1).toLowerCase()).join(' + ') + ' · ' : '') + 'leads, backups and what to watch'); }
  // part 2: threats
  { const o = $('chThrTop'); if (o) o.innerHTML = RD ? `<div class="chside">${CH.threats10(RD, 'data-chthr')}${CH.legendRow(RD)}</div>` : ''; const g = $('chVsOut'); if (g) g.innerHTML = RD ? CH.chart(RD, ms) : ''; }
  // part 4: the sheet, every slot (empty ones say Add)
  { const o = $('chSheetOut'); if (o) o.innerHTML = `<div class="chsheet"><div class="hd"><span class="chdisp">Open team sheet</span><span class="mono">REG M-C · BRING 6 PICK 4</span></div>${all.map(row).join('')}</div>`; }
  if (!$('chScout').hidden) chScoutRender(); try { chEditStrip(); } catch (e) {} }
// the Teams ▾ menu
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('#chTeamsBtn'), m = $('chTeamsMenu'); if (!m) return;
  if (b) { m.hidden = !m.hidden; b.setAttribute('aria-expanded', !m.hidden); return; } if (!e.target.closest || !e.target.closest('#chTeamsMenu')) { m.hidden = true; } else setTimeout(() => { m.hidden = true; }, 0); });
// the top plan, as one line (the plans themselves are worked out by the fix planner)
function chBestPlan() { const L = ui.planList || []; const pl = L[0]; if (!pl || !pl.ch) return null; const base = ui.vsum && ui.vsum.RD ? ui.vsum.RD.score : null;
  return {pl, txt: pl.ch.map(x => x.out ? `${x.out.d} → ${x.c.p.d}` : `add ${x.c.p.d}`).join(', '), d: pl._ts != null && base != null ? pl._ts - base : null}; }
// ---------- the scouting report bottom sheet ----------
CH.sel = null; CH.last = null;
function chScoutOpen(sel) { const sh = $('chScout'); if (!sh) return; CH.sel = sel || null; CH.last = document.activeElement; chScoutRender(); sh.hidden = false; $('chScrim').hidden = false;
  const x = sh.querySelector('.x'); if (x) x.focus(); }
function chScoutClose() { const sh = $('chScout'); if (!sh || sh.hidden) return; sh.hidden = true; $('chScrim').hidden = true; try { if (CH.last && CH.last.focus) CH.last.focus(); } catch (e) {} }
function chScoutRender() { const sh = $('chScout'); if (!sh) return; const ms = members(), RD = ms.length ? prepOf(ms) : null, v = ui.vsum || {};
  if (!RD) { sh.innerHTML = '<div class="grab"></div><button type="button" class="x" data-chclose aria-label="Close">×</button><div class="chh" role="heading" aria-level="2">Scouting report</div><p class="t2">Add Pokémon to your team to see how ready it is for the top threats.</p>'; return; }
  const c = CH.lvCount(RD), need = c[0] + c[1], ord = CH.order(RD), sel = CH.sel && RD.rows.find(r => r.t.n === CH.sel);
  const dot = (r, m) => { const n = m.p.n, has = a => (a || []).some(x => x.m && x.m.n === n);
    const k = has(r.solid) ? ['var(--chok)', 'answers it'] : has(r.soft) ? ['var(--chshaky)', 'partial answer'] : has(r.losers) ? ['var(--chbad)', 'loses 1-on-1'] : ['var(--line2)', 'no direct matchup'];
    return `<span title="${esc(m.d)}: ${k[1]}">${sprite(m.p) || ''}<i style="background:${k[0]}"></i>${k[1]}</span>`; };
  const det = sel ? `<div class="chdet" aria-live="polite"><div class="top">${sprite(byName.get(sel.t.n)) || ''}<div style="flex:1"><div class="nm" style="font:800 15px var(--body);text-transform:uppercase">${esc(sel.t.d)} <span class="chk">${(+sel.t.w).toFixed(1)}% of top cuts</span></div><div class="t2">${esc(THR.evidence(sel))}</div></div><span class="chlv l${sel.level}">${CH.LV[sel.level].toUpperCase()}</span></div><div class="chdots">${ms.map(m => dot(sel, m)).join('')}</div></div>` : '';
  const list = ord.filter(r => r.level <= 1).slice(0, 5).map(r => `<div class="it">${sprite(byName.get(r.t.n)) || ''}<div style="flex:1;min-width:0"><div class="nm">${esc(r.t.d)} <span class="chk" style="font-weight:400">${(+r.t.w).toFixed(1)}% of top cuts</span></div><div class="t2">${esc(THR.evidence(r))}</div></div><span class="chlv l${r.level}">${CH.LV[r.level].toUpperCase()}</span></div>`).join('');
  const ck = v.CK ? `<div class="chk" style="margin-top:14px">Checklist · ${v.CK.pass}/${v.CK.n}</div><div class="chleg">${v.CK.items.filter(x => !x.skip).map(x => `<span><i style="background:${x.ok ? 'var(--chok)' : 'var(--chbad)'}"></i>${esc(x.label)}</span>`).join('')}</div>` : '';
  const b = chBestPlan();
  const best = b ? `<div class="chbest"><div class="chk">Best fix${b.d != null ? ` · ${b.d > 0 ? '+' : ''}${b.d}% ready` : ''}</div><div class="sw">${b.pl.ch.map(x => `${x.out ? `${sprite(x.out.p, 'out') || ''}<span aria-hidden="true" style="color:var(--chyel);font-size:22px">→</span>` : '+'}${sprite(x.c.p) || ''}`).join(' ')}<span>${esc(b.txt)}</span></div><button type="button" class="chprimary" data-plan="0">Apply this fix <span aria-hidden="true">➜</span></button></div>` : '';
  sh.innerHTML = `<div class="grab"></div><button type="button" class="x" data-chclose aria-label="Close">×</button>
    <div style="display:flex;align-items:center;gap:12px;padding-right:48px"><div style="flex:1"><div class="chk">Scouting report · top 30 threats</div><div class="chh" role="heading" aria-level="2">${need ? `${need} threat${need === 1 ? '' : 's'} need${need === 1 ? 's' : ''} <em>a plan.</em>` : 'Ready for <em>every</em> top threat.'}</div></div><div class="chring sm">${CH.grade(RD.score)}</div></div>
    <div style="font-size:14px;color:var(--chink2);margin-top:6px"><b style="color:var(--chink)">${RD.score}% ready</b> · ${CH.LEGEND}</div>
    ${CH.legendRow(RD)}${CH.tiles(RD, 'data-chthr')}${det}
    ${list ? `<div class="chlist" style="margin-top:8px">${list}</div>` : ''}${ck}${best}
    <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap"><button type="button" class="chghost" data-chfull="">Full report</button><button type="button" class="chghost" data-chclose="">Close</button></div>`;
  sh.querySelectorAll('[data-chthr]').forEach(t => t.setAttribute('aria-pressed', t.dataset.chthr === CH.sel ? 'true' : 'false')); }
document.addEventListener('click', e => { const t = e.target; if (!t || !t.closest) return;
  if (t.closest('[data-chscout]')) { chScoutOpen(t.closest('[data-chscout]').dataset.chscout || null); return; }
  if (t.closest('[data-chclose]')) { chScoutClose(); return; }
  if (t.closest('[data-chfull]')) { chScoutClose(); const r = $('repFold'); if (r) { r.open = true; try { r.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (er) {} } return; }
  const th = t.closest('[data-chthr]'); if (th && !th.closest('#chScout')) { chScoutOpen(th.dataset.chthr); return; } if (th) { CH.sel = CH.sel === th.dataset.chthr ? null : th.dataset.chthr; chScoutRender(); const d = $('chScout').querySelector('.chdet'); if (d) try { d.scrollIntoView({block: 'nearest'}); } catch (er) {} return; }
  if (t.closest('#chScout [data-plan]')) setTimeout(chScoutClose, 0); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') chScoutClose(); });
// ---------- brand: the new logo in the top bar, the menu and the footer ----------
function chBrand() { document.querySelectorAll('.band .brand, .sidetop .logo, .lgbrand').forEach(el => { if (el.querySelector('.nplk')) return; el.insertAdjacentHTML('afterbegin', CH.lockup('hdr')); });
  const b = document.querySelector('.bnav [data-view="report"]'); if (b && !b.querySelector('.chfab')) b.insertAdjacentHTML('afterbegin', `<span class="chfab" aria-hidden="true">${CH.chev2()}</span>`);
  // More moves to the header (next to search); the bottom bar keeps 2 + Build + 2, symmetric
  const mb = $('moreBtn'), row = document.querySelector('.band .titlerow'); if (mb && row && !mb.closest('.band')) { mb.classList.add('chmenubtn'); mb.setAttribute('aria-label', 'More pages and settings'); row.append(mb); } }// hook into the page: after every render, redraw the Team header; Home is redrawn by render() itself
safe('concept h', () => { chBrand(); chTeamInit(); });
const chRenderOld = render;
// the Team header only redraws while the Team page shows (and when it opens), so other pages stay fast
CH.stale = true;
render = function () { chRenderOld.apply(this, arguments); if (typeof view === 'undefined' || view === 'build' || view === 'report') { CH.stale = false; safe('concept h team', chTeamRender); } else CH.stale = true; };
const chSetViewOld = setView;
setView = function (v) { chSetViewOld.apply(this, arguments); if ((view === 'build' || view === 'report') && CH.stale) { CH.stale = false; safe('concept h team', chTeamRender); } };
if (window.__PL_TEST) window.__CH = {open: chScoutOpen, close: chScoutClose, four: CH.four, grade: CH.grade};

// Suggest from (My team): the same setting as Plan settings › Pick from
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chpool]'); if (!b) return; const v = b.dataset.chpool; if (v === ui.pool) return;
  ui.pool = v; LS.set('cc2.pool', v); const sel = $('poolSel'); if (sel) sel.value = v; render();
  toast({box: 'Suggestions only use your box', boxfill: 'Your box first, then the best Pokémon to catch', all: 'Suggestions use the full roster'}[v]); });
// − on a Your six card (or Remove in the edit panel): take that Pokémon off the team, with Undo. Runs before the card's own tap.
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chrm]'); if (!b) return; e.stopPropagation(); e.preventDefault();
  const i = +b.dataset.chrm, was = byName.get((S.slots[i] || {}).n); keepUndo(); S.slots[i] = blank(); render(); if (was) toast(`Removed ${was.d}`, true);
  const ed = $('chEdit'); if (ed && !ed.hidden && b.closest('#chEdit')) chEditOpen(i); }, true);
// a Your six card opens with Enter or Space too
document.addEventListener('keydown', e => { const r = e.target; if (!r || !r.matches || !r.matches('div.chrow[data-chedit]') || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault(); r.click(); });
