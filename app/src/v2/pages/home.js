// ---------- Home (R4 Home, Nov 12): built piece by piece from the approved mock-up (docs/rebuild/mocks/home.tpl.html) ----------
// Every Home feature of today's site is kept (behaviour tests HOME-01..16). Numbers come from shared logic (05-home-data.js,
// CH.metaSix, RES), so both sites say the same thing. Piece 1: the hero (tagline, start buttons, Import, Most used right now).
V2.homeHero = () => { const E = V2.esc, ms = members(), has = ms.length > 0, six = CH.metaSix(), n = (typeof RES === 'object' && RES && RES.teams) || 0;
  // start buttons (today's order: Score my team first with a team, Build me a team first with none; then Plan a match)
  const go = has ? `<a class="np-btn" href="#team">Score My Team</a><a class="np-btn2" href="#build"><span>Build a Team</span></a>`
    : `<a class="np-btn" href="#build">Build Me a Team</a><a class="np-btn2" href="#team"><span>Score My Team</span></a>`;
  // Most used: the mock-up's three on one floor (Nov 12, Sim: keep every detail of the mock-up): #1 bigger, its name big and slanted;
  // each % big and slanted with a small unit; a floor line across all three at the feet
  const used = (p, rank) => p ? `<button type="button" class="hm-used${rank === 1 ? ' one' : ''}" data-v2mon="${E(p.n)}" aria-label="${E(V2.disp(p.n))}, most used #${rank}, ${homePct(p)}% of teams: open its info">${V2.mon(p.n, {iw: rank === 1 ? 260 : 150, bare: true})}<span class="hm-ut"><b>${V2.nameHtml(V2.disp(p.n))}</b><small><span class="num">${homePct(p)}<span class="unit">%</span></span> of teams${rank === 1 ? ' · #1' : ''}</small></span></button>` : '';
  return `<section class="hm-hero"><div class="hm-lead"><div class="np-eyebrow"><span>Pokémon Champions · Reg M-C · VGC doubles</span></div>
    <h1 class="u hm-tag"><span>Sharply raise</span> <span class="pl">your win rate.</span></h1>
    <p class="hm-intro">Score your team, see what beats it, and plan every match, from ${n ? homeNum(n) + ' real tournament teams' : 'real tournament results'}.</p>
    <div class="hm-go">${go}<a class="np-btn2" href="#battle"><span>Plan a Match</span></a></div>
    <p class="hm-imp">Already have a team? <button type="button" class="np-link" data-v2homeimport>Import from Showdown</button></p></div>
    <div class="hm-usedw"><p class="hm-k">Most used right now</p><div class="hm-three"><i class="hm-floor" aria-hidden="true"></i>${used(six[1], 2)}${used(six[0], 1)}${used(six[2], 3)}</div><p class="fine hm-src">${E(homeSrcLine())}</p></div></section>`; };
// Piece 2: the duel (mock-up "duel"; today's HOME-09 / HOME-10): the Champion's six beside your six. Both sides share the same
// rows (head, six, plan, actions: one grid, subgrid rows), so the two sixes always start on the same line (Sim, Nov 12).
V2.hmUi = V2.hmUi || {};
// the event's name as a heading (Home duel): today's evName, minus emoji and a trailing prize line, so a title such as
// "Amyverse VGC Champions Arena #18 ❤️ Cash Prize!" reads "Amyverse VGC Champions Arena #18", and a trailing money prize ("50€ Amazon
// Gift Cards") goes too (the mock-up showed a short name)
V2.evTitle = n => evName(n).replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ').replace(/[\s\-–|·:!]*(cash prizes?|prize pool|prizes?|\$\s?\d[\d,.]*\s*(usd|prize( pool)?)?)[\s!]*$/i, '').replace(/\s+(?:[$€£]\s?\d[\d,.]*|\d[\d,.]*\s?[$€£])\s*(?:amazon|gift|cash|prize|usd|eur)?[^#]*$/i, '').replace(/\s+/g, ' ').trim() || evName(n);
V2.homeDuel = () => { const E = V2.esc, C = homeChamp(), ms = members();
  const tile = (n, sub, attrs) => `<button type="button" class="hm-pk" ${attrs}>${V2.mon(n, {iw: 96, bare: true})}<b>${V2.nameHtml(V2.disp(n))}</b><small>${sub ? E(sub) : '&nbsp;'}</small></button>`;
  let them = '<div class="hm-side"></div>', FC = null;
  if (C) { const {ev, t} = C, key = ev.id + '#' + ev.top.indexOf(t), sure = V2.hmUi.sure === key;
    try { FC = ms.length >= 4 ? CH.fourVs(ms, C.six.map(x => x.p.n)) : null; } catch (e) { FC = null; }
    them = `<div class="hm-side hm-them"><div class="hm-hd"><p class="hm-k2">The Champion's six · latest winner</p><h3 class="u">${E(V2.evTitle(ev.name))}</h3>
      <p class="hm-who"><b>${E(teamWho(t))}</b> <small>· ${E(evDate(ev.date))}${ev.players ? ` · ${ev.players} players` : ''}</small></p></div>
      <div class="hm-six">${C.six.map(x => tile(x.p.n, x.it, `data-v2mon="${E(x.p.n)}" aria-label="${E(V2.disp(x.p.n))}${x.it ? ', ' + E(x.it) : ''}: open its info"`)).join('')}</div>
      <div class="row hm-acts"><button type="button" class="np-btn2" data-hmload="${E(key)}"><span>${sure ? 'Tap Again to Replace Your Team' : 'Load This Team'}</span></button><button type="button" class="np-btn2" data-hmcopy="${E(key)}"><span>Copy for Showdown</span></button><a class="np-link" href="#meta">All ${C.n} events ›</a></div></div>`; }
  // your six: lead, back, bench for the plan vs the Champion's six (or the meta's six without one); your own lead pick wins (today's AR.home)
  let F = FC, vs = C ? "vs the Champion's six" : '';
  if (!F && ms.length >= 4) { try { F = CH.four(ms); vs = "vs the meta's top six"; } catch (e) { F = null; } }
  const UL = userLeads(ms); if (UL && F) { F = {lead: UL.map(m => m.p.n), back: F.lead.concat(F.back).filter(n => !UL.some(m => m.p.n === n)).slice(0, 2)}; vs = vs ? vs + ', your leads' : 'your leads'; }
  const byN = n => ms.find(m => m.p.n === n), lead = F ? F.lead.map(byN).filter(Boolean) : [], back = F ? F.back.map(byN).filter(Boolean).filter(m => !lead.includes(m)) : [];
  const bench = ms.filter(m => !lead.includes(m) && !back.includes(m)), ord = [...lead, ...back, ...bench].slice(0, 6), pair = g => g.map(m => E(m.d)).join(' + ');
  const title = ms.length ? teamTitleFor(ms) : 'Your six goes here', s = V2.scoreNow ? V2.scoreNow() : null;
  let G = null; try { const RD = ms.length ? prepOf(ms) : null; G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } catch (e) {}
  const band = G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid' : 'solid';
  const score = s != null && G ? `<div class="np-score sm hm-score" style="--band:var(--band-${band})"><b>${s}</b><div class="w"><span>${E(CH.wordOf(G.s))}</span><small>Strength Score</small></div></div>` : '';
  const six = ms.length ? ord.map(m => tile(m.p.n, '', `data-v2mon="${E(m.p.n)}" aria-label="${E(m.d)}: open its info"`)).join('')
    : Array.from({length: 6}, (_, i) => `<button type="button" class="hm-pk hm-add" data-v2search aria-label="Add a Pokémon to slot ${i + 1}"><span class="hm-plus" aria-hidden="true">+</span><b>Add a Pokémon</b><small>&nbsp;</small></button>`).join('');
  const plan = lead.length >= 2 ? `<p class="hm-plan"><strong>Game plan ${E(vs)}:</strong> lead ${pair(lead)}${back.length ? `, back ${pair(back)}` : ''}${bench.length ? `, bench ${pair(bench)}` : ''}.</p>` : '<div class="hm-plan"></div>';
  const acts = ms.length ? `${C && FC ? `<button type="button" class="np-btn" data-hmprep="${E(C.ev.id + '#' + C.ev.top.indexOf(C.t))}">Prep vs the Champion</button>` : ''}<a class="np-link" href="#team">Open My Team ›</a>` : '<a class="np-btn" href="#build">Add Your Six</a>';
  const you = `<div class="hm-side hm-you"><div class="hm-hd"><p class="hm-k2">Your six · ${E(title)}</p>${score}</div><div class="hm-six">${six}</div>${plan}<div class="row hm-acts">${acts}</div></div>`;
  return `<section class="hm-duel">${them}${you}</section>`; };
V2.pages.home = {place: 'home', draw() { return `<div class="hm2">${V2.homeHero()}${V2.homeDuel()}</div>`; }};
// Load this team (HOME-09): with a team of your own, the first tap asks ("Tap again"); the second loads it with Undo (today's loadSheet)
document.addEventListener('click', async e => { const L = e.target.closest('[data-hmload]'), Cp = e.target.closest('[data-hmcopy]'), P = e.target.closest('[data-hmprep]');
  if (L) { const k = L.dataset.hmload, x = evTeam(k); if (!x) return; if (members().length && V2.hmUi.sure !== k) { V2.hmUi.sure = k; clearTimeout(V2.hmUi.t); V2.hmUi.t = setTimeout(() => { V2.hmUi.sure = null; if (V2.route() === 'home') V2.redraw(); }, 6000); V2.redraw(); return; }
    V2.hmUi.sure = null; keepUndo(); S.slots = sheetSlots(x.t); S.format = 'doubles'; S.loadedId = null; location.hash = '#team'; render(); toast(`${teamWho(x.t).split(' · ')[0]}'s team loaded with its moves and items`, true); return; }
  if (Cp) { const x = evTeam(Cp.dataset.hmcopy); if (!x) return; const r = sheetPaste(x.t.mons); toast((await V2.copy(r.text)) ? (r.filled ? 'Team copied for Showdown. ' + SD_NOTE_TOUR : 'Team copied for Showdown') : 'Copy failed. Try again.'); return; }
  if (P) { const x = evTeam(P.dataset.hmprep); if (!x) return; S.opp = x.t.mons.map(m => m.n); ui.oppFrom = {who: x.t.player, key: S.opp.slice().sort().join('|')}; persist(); location.hash = '#battle'; toast(`Opponent set: ${teamWho(x.t)}`); } });
// "Import from Showdown" (HOME-07): My Team with the Import box open, as today
document.addEventListener('click', e => { if (!e.target.closest('[data-v2homeimport]')) return; location.hash = '#team'; setTimeout(() => V2.openImport(), 120); });
