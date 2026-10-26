// ---------- Home ----------
// The front door: what PokéLair is, where your team stands, what's winning right now, and one tap to each tool.
const HOME_TILES = [
  ['matchup', 'Matchup', 'Scout an opponent from a team-preview screenshot', '<path d="M4 4l9 9M4 4h4M4 4v4M20 4l-9 9M20 4h-4M20 4v4M8.5 15.5l-4 4M15.5 15.5l4 4"/>'],
  ['ratings', 'Ratings', 'Every legal Pokémon on one tier board', '<path d="m12 3.2 2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.6l-5.3 2.9 1.1-5.9-4.4-4.1 6-.8z"/>'],
  ['top', 'Top teams', 'Copy a team that won and make it yours', '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 20h8"/>'],
  ['sets', 'Popular sets', 'Moves, items and natures players run', '<path d="M5 4h14v16H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>'],
  ['calc', 'Damage calc', 'Real damage with stats, items and spread moves', '<path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4"/>'],
  ['speed', 'Speed tiers', 'Who moves first, with Tailwind and Trick Room', '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-6"/>'],
  ['gauntlet', 'Gauntlet', 'Run your team into the top 20 tournament teams', '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>']];
function homeMini(p, r, extra) { return `<button type="button" class="hmini" data-lt="${esc(p.n)}" style="--ta:${TC[p.t[0]]};--tb:${TC[p.t[1] || p.t[0]]}" title="${esc(p.d)}">${sprite(p, 'hmspr') || ''}<span class="hmn">${esc(p.d.replace(/^Mega /, 'M-'))}</span><span class="hms"><b>${r.total}</b>${extra || ''}</span></button>`; }
function renderHome() { const el = $('homeOut'); if (!el) return; const pane = document.querySelector('[data-pane="home"]'); if (pane && pane.hidden && el.innerHTML) return;
  const rows = lairRows(), top = rows.slice(0, 10), gems = rows.filter(x => isGem(x.p)).slice(0, 4);
  const lineup = rows.filter(x => SPRITE_ID[x.p.n]).slice(0, 6);
  const ms = members(), v = ui.vsum || {}, nTeams = (RES && RES.teams) || 0;
  const cores = RES && Array.isArray(RES.cores) ? RES.cores.filter(c => c[3] >= 60 && c.slice(0, 3).every(n => byName.get(n))).sort((a, b) => b[4] - a[4]).slice(0, 3) : [];
  const L = Array.isArray(S.log) ? S.log : [], ls = L.length ? logStats(L) : null;
  const fmtN = n => n.toLocaleString ? n.toLocaleString('en-US') : String(n);
  const mine = S.slots.map((s, i) => ({p: byName.get(s.n), i})).filter(x => x.p);
  el.innerHTML = `
  <div class="hhero">
    <div class="hhk">Pokémon Champions · Reg M-C · VGC doubles</div>
    <div class="hht" role="heading" aria-level="2">Build teams that <em>actually win.</em></div>
    <p class="hhs">Ratings, builds and matchups from ${nTeams ? fmtN(nTeams) + ' real tournament teams' : 'real tournament results'}, refreshed every morning${dataDateText() ? ' (' + dataDateText().replace(/^Data from/, 'latest:') + ')' : ''}.</p>
    <div class="hhline" aria-hidden="true">${lineup.map(x => sprite(x.p, 'hhspr')).join('')}</div>
    <div class="hhfloor" aria-hidden="true"></div>
    <div class="hhacts"><button type="button" class="btn go" data-view="auto">Build me a team</button><button type="button" class="btn hghost" data-view="build">${ms.length ? 'Check my team' : 'Start from scratch'}</button></div>
  </div>
  ${ms.length ? `<button type="button" class="hteam ${v.lvl || 'mid'}" data-view="build">
      <div class="htk"><span>Your team · ${mine.length}/6</span><span class="thbadge">${esc(shortHead(v.head))}</span></div>
      <div class="htn">${esc(teamTitleFor(ms))}</div>
      <div class="htl">${mine.map(x => sprite(x.p, 'htspr') || '').join('')}</div>
      <div class="htf">${v.TS ? `<span><b>${v.TS.score}</b> Team Score</span>` : ''}${v.tr ? `<span><b>${v.tr.w}–${v.tr.l}</b> your record</span>` : ''}${v.CK ? `<span><b>${v.CK.pass}/${v.CK.n}</b> checklist</span>` : ''}${v.best ? `<span><b>${Math.round(v.best.wr * 100)}%</b> at events</span>` : ''}<span class="htgo">Open ›</span></div></button>`
    : `<div class="hstart"><div class="hsk">New here?</div><div class="hst">Three ways to start</div>
      <div class="startacts"><button class="startbtn" type="button" data-view="auto"><b>Build for me</b><span>A real winning team you can field from your box</span></button><button class="startbtn" type="button" data-view="top"><b>Copy a top team</b><span>Load a team that won and tweak it</span></button><button class="startbtn" type="button" data-view="build"><b>Start from scratch</b><span>Type any Pokémon into a slot</span></button></div></div>`}
  <div class="htiles">${HOME_TILES.map(([v2, t, d, ic]) => `<button type="button" class="htile" data-view="${v2}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><b>${t}</b><span>${d}</span></button>`).join('')}</div>
  <div class="hsec"><div class="hsh"><h3>Top of the meta</h3><button type="button" class="hlink" data-view="ratings">All ratings ›</button></div>
    <p class="t2">Highest PokéLair ratings right now. Tap one for the full breakdown.</p>
    <div class="hrow">${top.map(x => homeMini(x.p, x.r)).join('')}</div></div>
  ${homeTrends()}
  ${gems.length ? `<div class="hsec"><div class="hsh"><h3>Hidden gems</h3><button type="button" class="hlink" data-view="ratings">More ›</button></div>
    <p class="t2">Rated 55+ but rarely used. Results hold up so far.</p>
    <div class="hrow">${gems.map(x => homeMini(x.p, x.r, '<i>◆</i>')).join('')}</div></div>` : ''}
  ${cores.length ? `<div class="hsec"><div class="hsh"><h3>Winning cores</h3><button type="button" class="hlink" data-view="top">Top teams ›</button></div>
    <p class="t2">Three-Pokémon cores with the best win rates at Limitless events (60+ teams each).</p>
    <div class="hcores">${cores.map(c => { const ps = c.slice(0, 3).map(n => byName.get(n)); return `<div class="hcore"><div class="hcs">${ps.map(p => sprite(p, 'hcspr') || '').join('')}</div><div class="hcn">${ps.map(p => esc(p.d)).join(' · ')}</div><div class="hcw"><b>${Math.round(c[4] * 100)}%</b> win rate · ${fmtN(c[3])} teams</div></div>`; }).join('')}</div></div>` : ''}
  <div class="hsec hlog"><div class="hsh"><h3>Your battles</h3><button type="button" class="hlink" data-view="matchup">Battle log ›</button></div>
    ${ls ? `<div class="hlogs"><div><b>${ls.w}–${ls.l}</b><span>${ls.pct}% wins</span></div><div><b>${ls.n}</b><span>logged</span></div><div class="hdots">${L.slice(-10).map(e => `<i class="${e.r === 'W' ? 'w' : 'l'}" title="${e.r === 'W' ? 'Win' : 'Loss'}"></i>`).join('')}</div></div>`
      : '<p class="t2">Log each game in Matchup (the 4 you brought, then Win or Loss) and your record shows up here and on your team.</p>'}</div>
  <p class="hfoot">${esc((RES && RES.source) || '')}${RES && RES.source ? ' · ' : ''}Ratings blend Limitless, official VGC events, in-game ranked and Showdown.</p>`; }

