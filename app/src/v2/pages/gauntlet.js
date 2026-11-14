// ---------- Test Run (Nov 14), Battle's tool: your six against the top tournament teams ----------
// Sim's pick: 'Scoreboard + match cards' (mock-ups docs/rebuild/mocks/gauntlet, A). The logic is today's shared code
// (38-gauntlet-data.js: gauntletTeams, gauntletScore, gauntletPrep); the rows, sort, counts and words follow today's renderGauntlet.
V2.trCache = {key: null, rows: null};
V2.trRows = ms => { const T = gauntletTeams(); if (!T.length) return [];
  const key = metaVersion + '|' + ms.map(m => m.p.n + '/' + m.ability + '@' + (m.item || '') + ':' + m.moves.map(x => x.name).join(',')).join('|');
  if (V2.trCache.key !== key) V2.trCache = {key, rows: T.map((t, ix) => { const names = t.mons.filter(n => byName.get(n)), theirs = names.map(n => byName.get(n)).map(oppMember); if (theirs.length < 4) return null;
    const g = gauntletScore(ms, theirs, true); let pr = null; try { pr = gauntletPrep(ms, names); } catch (e) { pr = null; }
    const un = pr ? pr.you.map((r, j) => r.level === 0 ? j : -1).filter(j => j >= 0) : g.loose;
    return {ix, t, theirs, pr, un, r: g.r, e: pr ? pr.yN - pr.tN : 0}; }).filter(Boolean).sort((a, b) => a.e - b.e)};
  return V2.trCache.rows; };
V2.trCp = n => { const m = (typeof ART_META === 'object' && ART_META[SPRITE_ID[n]]) || [150, 150, 165]; return `${m[0]},${m[1]},${m[2]}`; };
V2.trUi = {more: false};
TIPS.gauntcalc = ['How each verdict is worked out', "Each verdict is a real damage calc with your sets against each team's usual sets, the same as the threat preparation in your scouting report. The suggested four come from the Battle mode planner. Least prepared matchups first."];
V2.trHead = n => `<section class="tr-h"><p class="np-eyebrow"><span>Battle · Test Run</span></p><h1 class="u"><span>Your six vs the</span> <span class="pl">top${n ? ' ' + n : ''}.</span></h1></section>`;

V2.pages.gauntlet = {place: 'battle', draw() { const E = V2.esc, ms = members(), tools = V2.battleToolsBar('gauntlet');
  if (ms.length < 4) return `<div class="tr">${tools}${V2.trHead(0)}<p class="tm-sub">Add at least 4 Pokémon on My team to start a Test Run.${ms.length ? ` You have ${ms.length}.` : ''}</p><div class="tr-btns"><a class="np-btn" href="#team"><span>Go to My team</span></a></div></div>`;
  let rows = []; try { rows = V2.trRows(ms); } catch (e) { rows = []; }
  if (!rows.length) return `<div class="tr">${tools}${V2.trHead(0)}<p class="tm-sub">Top tournament teams load with the daily data. Check back after the next refresh.</p></div>`;
  const all = V2.trUi.more, more = rows.filter(x => x.e >= 2).length, less = rows.filter(x => x.e <= -2).length, cls = e => e >= 2 ? 'up' : e <= -2 ? 'dn' : 'ev';
  const verdict = e => e >= 2 ? "You're better prepared" : e <= -2 ? "They're better prepared" : 'About even', nm = i => E(ms[i].d);
  const cell = r => { const p = byName.get(r.t.n); return `<div class="tr-cell l${r.level}">${p ? V2.mon(p.n, {iw: 48, bare: true}) : '<span></span>'}<div><b>${E(r.t.d)}</b><i class="u">${E(r.label)}</i><small>${E(THR.evidence(r))}</small></div></div>`; };
  const card = x => { const pr = x.pr, e = x.e, mineN = ms.length;
    const six = `<div class="tr-six">${x.theirs.map((o, j) => { const no = x.un.includes(j), r = pr && pr.you[j];
      return `<span class="m${no ? ' no' : ''}" style="--cp:${V2.trCp(o.p.n)}" role="img" aria-label="${E(o.d)}${r ? ': ' + E(r.label) : ''}" title="${E(o.d)}${r ? ': ' + E(r.label) + ' · ' + E(THR.evidence(r)) : ''}">${V2.mon(o.p.n, {iw: 72, bare: true})}${no ? '<b class="bang u" aria-hidden="true">!</b>' : ''}</span>`; }).join('')}</div>`;
    const tug = pr ? `<div class="tr-tug" role="img" aria-label="You: ready for ${pr.yN} of their ${pr.n}. Them: ready for ${pr.tN} of your ${mineN}"><div class="you"><span class="lab">You</span><b class="u">${pr.yN}<small>/${pr.n}</small></b><i style="--w:${Math.round(pr.yN / pr.n * 100)}%"></i></div><div class="them"><span class="lab">Them</span><b class="u">${pr.tN}<small>/${mineN}</small></b><i style="--w:${Math.round(pr.tN / mineN * 100)}%"></i></div></div>` : '';
    const plan = `<p class="tr-plan">Bring <b>${x.r.lead.map(nm).join(' + ')}</b> up front, ${x.r.back.map(nm).join(' + ')} in back.${x.un.length ? ` Watch <b class="w">${x.un.map(j => E(x.theirs[j].d)).join(', ')}</b>.` : ''}</p>`;
    const prep = pr ? `<details class="tr-prep"><summary class="u">Matchup prep</summary><p class="tr-lbl">You against their six</p><div class="tr-cells">${pr.you.map(cell).join('')}</div><p class="tr-lbl">Their six against yours</p><div class="tr-cells">${pr.them.map(cell).join('')}</div></details>` : '';
    return `<article class="tr-card ${cls(e)}"><div class="tr-ct"><p class="tr-v u">${verdict(e)}</p><p class="tr-who"><b>${E(x.t.who)}</b>${x.t.ev ? `<span>${E(x.t.ev)}</span>` : ''}</p></div>
      <div class="tr-mid">${six}${tug}</div>${plan}${prep}<div class="tr-btns"><button type="button" class="np-btn" data-trbat="${x.ix}"><span>Practice in Battle mode</span></button><button type="button" class="np-btn2" data-trcopy="${x.ix}"><span>Copy for Showdown</span></button></div></article>`; };
  return `<div class="tr">${tools}${V2.trHead(rows.length)}
    <p class="tr-lede">Take a test run: the latest top tournament teams, least prepared first.</p>
    <details class="tr-how" data-trfold><summary><span class="u">How it works</span><small>Same calcs as your scouting report, both ways</small></summary><p>Your six against real top tournament teams, with the same calcs as your scouting report: how many of their Pokémon you're ready for, and how many of yours they're ready for. A red <b class="w">!</b> marks one of theirs you have no answer to. Preparation, not a forecast: the player still decides the game.</p></details>
    <div class="tr-board"><div class="up"><b class="u">${more}</b><span>you're better prepared</span></div><div class="ev"><b class="u">${rows.length - more - less}</b><span>about even</span></div><div class="dn"><b class="u">${less}</b><span>they're better prepared</span></div></div>
    <div class="tr-list">${(all ? rows : rows.slice(0, 3)).map(card).join('')}</div>
    ${rows.length > 3 ? `<button type="button" class="tr-more" data-trmore aria-expanded="${all}"><b class="u">${all ? 'Show fewer' : `${rows.length - 3} more teams`}</b><span>${all ? 'Fold the rest away' : `Showing 3 of ${rows.length}`}</span></button>` : ''}
    <p class="fine tr-foot">Real damage calcs, least prepared matchups first ${V2.tip('gauntcalc')}</p></div>`; }};

document.addEventListener('click', async e => { if (e.target.closest('[data-trmore]')) { V2.trUi.more = !V2.trUi.more; V2.redraw(); return; } const b = e.target.closest('[data-trbat],[data-trcopy]'); if (!b) return;
  const ix = +(b.dataset.trbat != null ? b.dataset.trbat : b.dataset.trcopy), x = (V2.trCache.rows || []).find(r => r.ix === ix); if (!x) return;
  if (b.dataset.trcopy != null) { const r = sheetPaste(x.t.mons); toast((await V2.copy(r.text)) ? (r.filled ? 'Team copied for Showdown. ' + SD_NOTE_TOUR : 'Team copied for Showdown') : 'Copy failed. Try again.'); return; }
  const ns = x.t.mons.map(m => (m && m.n) || m).filter(n => byName.get(n)).slice(0, 6);
  V2.btSetOpp(ns, {who: x.t.player, label: x.t.who, key: ns.slice().sort().join('|'), ev: x.t.ev || ''}); location.hash = '#battle'; toast('Loaded as your opponent'); });
