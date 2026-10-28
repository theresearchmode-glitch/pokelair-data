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
  const tools = `<div class="htiles">${HOME_TILES.map(([v2, t2, d, ic]) => `<button type="button" class="htile" data-view="${v2}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><b>${t2}</b><span>${d}</span></button>`).join('')}</div>`;
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
    ${ms.length ? `<div class="chlist6">${ord2.map(m => row(sprite(m.p) || '', m.d, [m.item, m.ability].filter(Boolean).join(' · '), tag2(m))).join('')}</div><div class="chwl" style="justify-content:flex-start"><button type="button" class="chghost onblue" data-view="build">Open my team</button></div>`
      : `<div class="chlist6 empty">${Array.from({length: 6}, () => '<div class="chhr2"><span class="emp"></span><div class="chbd2"><b>&nbsp;</b></div></div>').join('')}</div><button type="button" class="chghost onblue" data-view="build">Add your six</button>`}</div>`;
  const themH = champ ? `<div class="chband them chhalf chcol"><div class="chk" style="text-align:right">Latest winner · ${esc(ev.name)} ●</div><div class="chcolt" style="text-align:right">The champion's six</div>
    <div class="chwho">${esc(t.player)}${t.record ? ` · <b>${esc(t.record)}</b>` : ''} · ${evDate(ev.date)}${ev.players ? ` · ${ev.players} players` : ''}${sameSix ? ' · <span class="chpen" style="color:#fff">same six as yours!</span>' : ''}</div>
    <div class="chlist6">${champ.map(x => row(sprite(x.p) || '', x.p.d, [x.it, x.ab].filter(Boolean).join(' · '), '', true)).join('')}</div>
    <div class="chwl"><button class="chghost onred" type="button" data-evload="${esc(ev.id)}#${ev.top.indexOf(t)}">Load this team</button><button class="linkbtn" type="button" data-view="events">All ${E.events.length} events ›</button></div></div>` : `<div class="chband them chhalf chcol"><div class="chk" style="text-align:right">The meta's six · % of teams</div><div class="chsix">${six.map(p => `<div>${sprite(p) || ''}<div class="pc">${U(p).toFixed(1)}%</div></div>`).join('')}</div></div>`;
  const midH = `<div class="chmid"><div class="chk">Team preview · Reg M-C doubles</div><div class="chdisp chh1" role="heading" aria-level="2">Plot your win.</div><div class="sub">Before turn one.</div>
    <p>From <b>${nTeams ? CH.n(nTeams) + ' real tournament teams' : 'real tournament results'}</b>. See their six, pick your four.</p>
    ${F2 && cl.length ? `<div class="ch64"><span class="n b">6</span><span class="chk">bring</span><span style="font-size:26px" aria-hidden="true">→</span><span class="n r">4</span><span class="chk">pick</span></div>
    <div class="chk" style="margin:2px 0 6px">NastyPlot's four vs ${foe}</div><div class="chfour">${[...cl, ...cb].map((m, i) => `<div>${sprite(m.p) || ''}<div class="lab${i < 2 ? ' lead' : ''}">${i < 2 ? 'LEAD' : 'BACK'}</div></div>`).join('')}</div>` : ''}
    <div class="chacts"><button type="button" class="chprimary" data-view="auto">Build me a team <span aria-hidden="true">➜</span></button><button type="button" class="chghost" data-view="build">${ms.length ? 'Check my team' : 'Start from scratch'}</button></div></div>`;
  // phone Home: one story top to bottom. What this is + the one button, then the latest champion, then your six.
  const mon = (p, sub, tg) => `<div class="chmmon">${sprite(p) || ''}<b>${esc(p.d)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}${tg || ''}</div>`;
  const pickLine = F2 && cl.length && cb.length ? `<div class="chmwho">NastyPlot's pick vs ${foe}: lead <b>${cl.map(m => esc(m.d)).join(' + ')}</b>, back ${cb.map(m => esc(m.d)).join(' + ')}</div>` : '';
  const phoneH = `<div class="chmh">
    <section class="chmhero"><div class="chk">Pokémon Champions · Reg M-C doubles</div><div class="chdisp chh1" role="heading" aria-level="2">Plot your win.</div><div class="chdisp sub">Before turn one.</div>
      <p>Teams, sets and matchups from <b>${nTeams ? CH.n(nTeams) + ' real tournament teams' : 'real tournament results'}</b>.</p>
      <div class="chmacts"><button type="button" class="chprimary" data-view="auto">Build me a team <span aria-hidden="true">➜</span></button><button type="button" class="chghost" data-view="build">${ms.length ? 'Check my team' : 'Start from scratch'}</button></div></section>
    ${champ ? `<section class="chmcard them"><div class="chk">Latest winner · ${esc(ev.name)}</div><div class="chmct">The champion's six</div>
      <div class="chmwho">${esc(t.player)}${t.record ? ` · <b>${esc(t.record)}</b>` : ''} · ${evDate(ev.date)}${ev.players ? ` · ${ev.players} players` : ''}${sameSix ? ' · <span class="chpen">same six as yours!</span>' : ''}</div>
      <div class="chmgrid">${champ.map(x => mon(x.p, x.it)).join('')}</div>
      <div class="chmrow"><button class="chghost onred" type="button" data-evload="${esc(ev.id)}#${ev.top.indexOf(t)}">Load this team</button><button class="linkbtn" type="button" data-view="events">All ${E.events.length} events ›</button></div></section>` : ''}
    <section class="chmcard you"><div class="chk">Your team${ms.length ? ` · ${ms.length}/6` : ''}</div><div class="chmct">${ms.length ? esc(teamTitleFor(ms)) : 'Your six goes here'}</div>
      ${ms.length ? `${pickLine}<div class="chmgrid">${ord2.map(m => mon(m.p, '', tag2(m))).join('')}</div><div class="chmrow"><button type="button" class="chghost onblue" data-view="build">Open my team</button>${FC && !sameSix ? `<button type="button" class="linkbtn" data-evvs="${esc(ev.id)}#${ev.top.indexOf(t)}">Prep vs the champion ›</button>` : ''}</div>`
        : `<div class="chmwho">Add six Pokémon and NastyPlot scouts the top threats for you.</div><div class="chmrow"><button type="button" class="chghost onblue" data-view="build">Add your six</button></div>`}</section>
  </div>`;
  const topH = phoneH + `<div class="chsplit chdesk">${youH}${midH}${themH}</div>`;  el.innerHTML = topH + `
    <div class="chpad">${typeof welcomeCard === 'function' ? welcomeCard() : ''}${typeof whatsNewCard === 'function' ? whatsNewCard() : ''}</div>
    ${pr}
    <div class="chfolds">${RD ? CH.fold('vs', 'Your six vs the top 12', (() => { const r = RD.rows.slice().sort((a, b) => b.t.w - a.t.w).slice(0, 12), bad = r.filter(x => x.level <= 1).length; return bad ? `${bad} of the top 12 ${bad === 1 ? 'is' : 'are'} unanswered or shaky · tap a row for details` : 'Every one of the top 12 is handled · tap a row for details'; })(), CH.chart(RD, ms)) : ''}
      ${CH.fold('more', 'More on Home', `All ${HOME_TILES.length} tools · top of the meta${trends ? ' · what changed' : ''}${coresH ? ' · cores' : ''} · your battles`, `<div class="chk">All tools</div>${tools}<div class="chk" style="margin-top:14px">${ui.homeGems && gems.length ? 'Hidden gems' : 'Top of the meta'}</div>${topMeta}${trends ? `<div class="chk" style="margin-top:14px">What changed this week</div>${trends}` : ''}${coresH ? `<div class="chk" style="margin-top:14px">Winning cores</div>${coresH}` : ''}<div class="chk" style="margin-top:14px">Your battles${ls ? ' · ' + ls.w + '–' + ls.l : ''}</div>${battles}<p class="hfoot">${esc((RES && RES.source) || '')}${RES && RES.source ? ' · ' : ''}Ratings: top-cut presence, conversion and win rate at real tournaments.</p>`)}




      ${ui.usageOwner ? `<details class="hsec usebox" id="usageBox"><summary><b>What people use</b> <span class="vsub">only you see this</span></summary><div id="usageOut"></div></details>
      <details class="hsec usebox" id="fbBox"><summary><b>Feedback</b> <span class="vsub">only you see this</span></summary><div id="fbOut"></div></details>` : ''}
      ${typeof FB !== 'undefined' && FB.ok ? '<div class="hfb"><span>Something off or missing?</span><button type="button" class="btn sm fbbtn" data-fbopen="1">Send feedback</button></div>' : ''}
</div>`; };
// replay keys fold Megas into their species (same as the ratings sheet)
function brKeyOf(p) { return p.n === 'Floette-Mega' ? 'Floette-Eternal' : p.n.replace(/-Mega(-[XYZ])?$/, ''); }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chhthr]'); if (!b) return; const n = b.dataset.chhthr; setView('build'); setTimeout(() => chScoutOpen(n), 50); });
// ---------- Team page ----------
function chTeamInit() { const pane = document.querySelector('[data-pane="build"]'); if (!pane || pane.dataset.ch) return; pane.dataset.ch = '1';
  const team = $('team'), def = $('defense'), fixes = $('fixes'), rep = $('repFold'); if (!team || !def || !fixes || !rep) return;
  const head = document.createElement('div'); head.id = 'chTeam'; head.className = 'chteam'; const sub = pane.querySelector('.subnav'); if (sub) sub.after(head); else pane.prepend(head);
  const mk = (key, title, open) => { const w = document.createElement('div'); w.innerHTML = CH.fold(key, title, '', '', open); const d = w.firstElementChild; d.querySelector('.chs') || d.querySelector('summary > div').insertAdjacentHTML('beforeend', '<div class="chs"></div>'); return d; };
  const fEdit = mk('edit', 'Edit team', false); fEdit.id = 'chfEdit'; fEdit.querySelector('.chbody').append(team);
  // the full scouting report stays a fold of its own (the bottom sheet is the quick read)
  rep.classList.add('chsec'); rep.dataset.chf = 'report'; { const o = LS.get('cc2.chf.report', 0); if (o) rep.setAttribute('open', ''); else rep.removeAttribute('open'); }
  rep.querySelector('summary').innerHTML = `${CH.tog()}<div style="flex:1;min-width:0"><div class="cht">Scouting report</div><div class="chs" id="chRepSub"></div></div>`;
  // inside the full report: each card is its own fold (closed), so opening the report stays short
  { const R = rep.querySelector('.report'), nm = {thrCard: 'Threat preparation', chkCard: 'Winning-team checklist', defCard: 'Defense', offCard: 'Offense'};
    if (R) [...R.children].forEach(el => { const key = el.id || (el.classList.contains('gpcard') ? 'gplan' : ''); if (!key) return; const d = document.createElement('details'); d.className = 'chsub'; d.dataset.chf = 'rep-' + key;
      if (LS.get('cc2.chf.rep-' + key, 0)) d.open = true; d.innerHTML = `<summary>${CH.tog()}<span>${nm[key] || 'Game plan'}</span></summary>`; el.before(d); d.append(el); }); }  const cols = fixes.querySelectorAll('.fixcol'); const fFix = mk('fix', 'Fix these', false), fPlan = mk('plans', 'Fix plans', false);
  fFix.id = 'chfFix'; fPlan.id = 'chfPlan'; if (cols[0]) fFix.querySelector('.chbody').append(cols[0]); if (cols[1]) fPlan.querySelector('.chbody').append(cols[1]);
  const cta = document.createElement('div'); cta.className = 'chcta'; cta.id = 'chCta'; cta.innerHTML = '<button type="button" class="chprimary" data-chscout="">Open scouting report <span aria-hidden="true">➜</span></button>';
  head.after(fEdit); fEdit.after(def); def.after(fFix); fFix.after(fPlan); fPlan.after(cta); fixes.hidden = true;
  // Save / Share / ⋯ live in the team header; Import and Export open the edit fold so their panels show
  const acts = team.querySelector('.teamhead .row'); if (acts) { acts.classList.add('chacts2'); head.dataset.acts = '1'; CH.acts = acts; }
  document.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('#importBtn,#exportBtn,#saveBtn,#shareBtn'); if (t && t.id !== 'shareBtn') fEdit.open = true; }, true);
  // the bottom sheet
  const scrim = document.createElement('div'); scrim.className = 'chscrim'; scrim.id = 'chScrim'; scrim.hidden = true;
  const sh = document.createElement('div'); sh.className = 'chscout'; sh.id = 'chScout'; sh.hidden = true; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', 'Scouting report');
  document.body.append(scrim, sh); scrim.addEventListener('click', () => chScoutClose()); }
function chTeamRender() { const head = $('chTeam'); if (!head) return; const ms = members(), RD = ms.length ? prepOf(ms) : null, v = ui.vsum || {}, c = CH.lvCount(RD);
  const F = CH.four(ms), lead = F ? ms.find(m => m.p.n === F.lead[0]) || null : null, ko = CH.koNote(RD);
  const slots = S.slots.map((s, i) => ({m: ms.find(x => x.i === i), i})).filter(x => x.m);
  const note = m => { if (lead && m === lead) { const w = CH.leadWhy(m); return `<div class="chpen">↑ Lead vs the meta's six${w ? ' · ' + esc(w) : ''}</div>`; } if (ko && m.p.n === ko.n && !(lead && lead.p.n === ko.n)) return `<div class="chpen">${esc(ko.txt)}</div>`; return ''; };
  const row = ({m, i}) => `<button type="button" class="chrow" data-chedit="${i}" aria-label="Edit ${esc(m.d)}"><span class="ix">${i + 1}</span>${sprite(m.p) || ''}<div class="chbd"><div class="nm">${esc(m.d)}${m.spread && m.spread.assumed ? ' <span class="chtag ass" title="No stat points on the sheet: your nature on the most common spread">spread assumed</span>' : ''}</div><div class="mono">${esc(m.item || 'No item')} · ${esc(m.ability || '')}</div><div class="mono mv">${m.moves.map(x => esc(x.name)).join(' · ')}</div>${note(m)}</div></button>`;
  const title = ms.length ? teamTitleFor(ms) : 'New team';
  head.innerHTML = `<div class="chthead"><div style="flex:1;min-width:0"><div class="chk">Your team · open team sheet · ${ms.length} of 6</div><div class="nm" role="heading" aria-level="2">${esc(title)}</div>
      ${RD ? `<div class="rd"><b>${RD.score}% ready</b> for the top 30 threats${typeof tip === 'function' ? tip('readiness') : ''} · ${c[0]} unanswered · ${c[1]} shaky${v.legal === false ? ' · <b style="color:var(--bad)">not legal yet</b>' : ''}</div>` : `<div class="rd">Type a Pokémon into a slot, or let NastyPlot draft one.</div>`}
      ${RD ? `<div class="chlegend">${CH.LEGEND}</div>` : ''}<div class="chacts2" id="chActs"></div></div>${RD ? `<div class="chring" title="Readiness grade">${CH.grade(RD.score)}</div>` : ''}</div>
    <div class="chtleft">${slots.length ? `<div class="chshow chteamshow"><span class="chshs">${slots.map(({m, i}) => `<button type="button" class="chshm" data-chedit="${i}" aria-label="Edit ${esc(m.d)}">${sprite(m.p) || `<b>${esc(m.d)}</b>`}</button>`).join('')}</span><span class="chshf" aria-hidden="true"></span></div>` : ''}
    ${RD ? `<div class="chside"><div class="chk">Ready for</div><div style="display:flex;align-items:center;gap:14px"><span class="chdisp" style="font-size:64px">${RD.score}%</span><span class="chring sm">${CH.grade(RD.score)}</span></div><div class="t2" style="margin-bottom:8px">of the top 30 threats · ${c[0]} unanswered · ${c[1]} shaky</div>${CH.tiles(RD, 'data-chthr')}${CH.legendRow(RD)}<button type="button" class="chprimary" data-chscout="">Open scouting report <span aria-hidden="true">➜</span></button></div>` : ''}</div>
    <div class="chsheet"><div class="hd"><span class="chdisp">Open team sheet</span><span class="mono">REG M-C · BRING 6 PICK 4</span></div>${slots.length ? slots.map(row).join('') : '<div class="chempty">No Pokémon yet. Open <b>Edit team</b> below to add your six, or use <b>Build</b> for a full team.</div>'}</div>`;
  if (CH.acts) $('chActs').append(CH.acts);
  // fold summaries
  const sum = (id, t) => { const d = $(id); const s = d && d.querySelector('.chs'); if (s) s.textContent = t; };
  sum('chfEdit', ms.length ? `${ms.length}/6 · tap a row on the sheet to edit its set` : 'Add your six here');
  if (!ms.length) { const f = $('chfEdit'); if (f) f.open = true; }
  { const s = $('chRepSub'); if (s) s.textContent = RD ? `${c[0]} unanswered · ${c[1]} shaky${v.CK ? ` · ${v.CK.pass}/${v.CK.n} checks` : ''}` : 'Add Pokémon to see it'; }
  { const nd = $('needs'), n = $('needsSub'), w = nd && nd.querySelector('.prob-row:not(.minor) .sev'); sum('chfFix', (n && n.textContent ? n.textContent : ms.length ? 'Nothing big to fix' : '') + (w ? ' · worst: ' + w.textContent.toLowerCase() : '')); }
  { const b = chBestPlan(); sum('chfPlan', b ? `Best: ${b.txt}${b.d != null ? ` · ${b.d > 0 ? '+' : ''}${b.d}% ready` : ''}` : ms.length ? 'Opens with the plans for this team' : ''); }
  const cta = $('chCta'); if (cta) cta.hidden = !RD;
  if (!$('chScout').hidden) chScoutRender(); }
// the top plan, as one line (the plans themselves are worked out by the fix planner)
function chBestPlan() { const L = ui.planList || []; const pl = L[0]; if (!pl || !pl.ch) return null; const base = ui.vsum && ui.vsum.RD ? ui.vsum.RD.score : null;
  return {pl, txt: pl.ch.map(x => x.out ? `${x.out.d} → ${x.c.p.d}` : `add ${x.c.p.d}`).join(', '), d: pl._ts != null && base != null ? pl._ts - base : null}; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chedit]'); if (!b) return; const i = +b.dataset.chedit, f = $('chfEdit'); if (f) f.open = true;
  if (ui.tview === 'grid') { ui.tview = 'full'; LS.set('cc2.tview', 'full'); renderSlots(); }
  requestAnimationFrame(() => { const el = $('slot' + i); if (el) { try { el.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (err) {} el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 900); } }); });
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
  const b = document.querySelector('.bnav [data-view="auto"]'); if (b && !b.querySelector('.chfab')) b.insertAdjacentHTML('afterbegin', `<span class="chfab" aria-hidden="true">${CH.chev2()}</span>`);
  // More moves to the header (next to search); the bottom bar keeps 2 + Build + 2, symmetric
  const mb = $('moreBtn'), row = document.querySelector('.band .titlerow'); if (mb && row && !mb.closest('.band')) { mb.classList.add('chmenubtn'); mb.setAttribute('aria-label', 'More pages and settings'); row.append(mb); } }// hook into the page: after every render, redraw the Team header; Home is redrawn by render() itself
safe('concept h', () => { chBrand(); chTeamInit(); });
const chRenderOld = render;
// the Team header only redraws while the Team page shows (and when it opens), so other pages stay fast
CH.stale = true;
render = function () { chRenderOld.apply(this, arguments); if (typeof view === 'undefined' || view === 'build') { CH.stale = false; safe('concept h team', chTeamRender); } else CH.stale = true; };
const chSetViewOld = setView;
setView = function (v) { chSetViewOld.apply(this, arguments); if (view === 'build' && CH.stale) { CH.stale = false; safe('concept h team', chTeamRender); } };
if (window.__PL_TEST) window.__CH = {open: chScoutOpen, close: chScoutClose, four: CH.four, grade: CH.grade};
