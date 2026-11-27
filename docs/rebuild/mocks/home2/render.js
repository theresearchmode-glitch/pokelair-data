(X, V) => { const E = V2.esc, chip = V2.typeChip, mon = (n, o = {}) => V2.mon(n, {bare: true, ...o}), nm = d => V2.nameHtml(d);
  const cp = n => { const m = (typeof ART_META === 'object' && ART_META[SPRITE_ID[n]]) || [150, 150, 165]; return `${m[0]},${m[1]},${m[2]}`; };
  const go = `<div class="h2-go"><a class="np-btn">Score My Team</a><a class="np-btn2"><span>Build a Team</span></a><a class="np-btn2"><span>Plan a Match</span></a></div><p class="h2-imp">Already have a team? <a class="np-link">Import from Showdown</a></p>`;
  const score = `<div class="h2-score"><b class="u">${X.s}</b><span><i class="u">${E(X.word)}</i><small>Strength Score</small></span></div>`;
  const ud = X.ud, udD = ud ? V2.disp(ud) : '';
  const tools = ['Battle Mode', 'Teams', 'Type Chart', 'Ratings', 'Damage Calc', 'Events', 'Test Run', 'Popular Sets', 'Speed Tiers', 'Archetypes', 'Winning Cores', 'How We Calculate'];
  if (V === 'A') { // FIGHT NIGHT: Home as an event poster
    const side = (list, cls) => `<div class="fa-side ${cls}">${list.map((x, i) => `<span class="fa-f" style="--cp:${cp(x.n)};--i:${i}">${mon(x.n)}</span>`).join('')}</div>`;
    const card = (x, i) => `<div class="fa-uc" style="--ta:var(--ty-${x.t[0]})"><span class="fa-ur u">${x.k}</span>${mon(x.n)}<b>${nm(x.d)}</b><span class="fa-us u">${x.r}</span></div>`;
    return `<div class="fa">
      <section class="fa-poster"><p class="fa-band"><span>Tonight's main event</span><span>Reg M-C · VGC doubles</span><span>${X.teams.toLocaleString('en-US')} real tournament teams</span></p>
        <h1 class="u fa-h"><span>Sharply raise</span> <span class="pl">your win rate.</span></h1>
        <div class="fa-ring">${side(X.mine.slice(0, 6), 'you')}<div class="fa-mid"><p class="fa-k">Your six</p><p class="u fa-name">${E(X.title)}</p>${score}<p class="u fa-vs">VS</p><p class="fa-k">The Champion's six</p><p class="u fa-name">${E(X.champ.ev)}</p><p class="fa-who">${E(X.champ.who)} · ${E(X.champ.date)}</p></div>${side(X.champ.six, 'them')}</div>
        <div class="fa-act">${go.replace('Score My Team', 'Prep vs the Champion')}</div></section>
      <section class="fa-under"><div class="fa-uh"><h2 class="u">The undercard.</h2><p>The Meta, right now: NastyPlot's top 10, from real tournament results.</p><nav class="fa-sw"><a class="on">Top Rated</a><a>Hidden Gems</a></nav></div><div class="fa-strip">${X.top.map(card).join('')}</div></section>
      <section class="fa-dog" style="--cp:${ud ? cp(ud) : '150,150,165'}">${ud ? mon(ud, {ft: true}) : ''}<div><p class="fa-k">Underdog of the night</p><h2 class="u">${E(udD)}. <span class="pl">Somebody's favourite.</span></h2><p>Rarely picked in tournaments, but every Pokémon deserves its moment.</p><div class="h2-go"><a class="np-btn2"><span>Build Around It</span></a><a class="np-link">Info Sheet</a></div></div></section>
      <section class="fa-tools"><h2 class="u">Everything NastyPlot does.</h2><div class="fa-marq">${tools.map(t => `<a>${t}</a>`).join('')}</div></section></div>`; }
  if (V === 'B') { // THE HAND: your six as the info sheet's trading cards, fanned; the score is the rare card
    const cardOf = (x, i) => { const p = byName.get(x.n); return `<div class="hb-c" style="--r:${(i - 2.5) * 7}deg;--y:${Math.abs(i - 2.5) * 14}px">${V2.msCard(p, x.n, `<h2 class="u">${nm(x.d)}</h2>`, `<div class="ms-ty">${p.t.map(chip).join('')}</div>`)}</div>`; };
    const mini = x => `<div class="hb-m" style="--ta:var(--ty-${x.t[0]})">${mon(x.n)}<span class="u">${x.r}</span><b>${nm(x.d)}</b></div>`;
    return `<div class="hb">
      <section class="hb-hero"><div class="hb-lead"><p class="np-eyebrow"><span>Pokémon Champions · Reg M-C · VGC doubles</span></p><h1 class="u"><span>Sharply raise</span> <span class="pl">your win rate.</span></h1><p class="h2-intro">Score your team, see what beats it, and plan every match, from ${X.teams.toLocaleString('en-US')} real tournament teams.</p>${go}</div>
        <div class="hb-table"><div class="hb-hand">${X.mine.slice(0, 6).map(cardOf).join('')}</div><div class="hb-rare"><p class="fa-k">Your hand · ${E(X.title)}</p>${score}<a class="np-link">Open My Team ›</a></div></div></section>
      <section class="hb-deck"><div class="hb-dh"><h2 class="u">The Meta, right now.</h2><p>The cards everyone's playing: NastyPlot's top 10.</p></div><div class="hb-spread">${X.top.map(mini).join('')}</div></section>
      <section class="hb-foil" style="--cp:${ud ? cp(ud) : '150,150,165'}"><div class="hb-fc">${ud ? V2.msCard(byName.get(ud), ud, `<h2 class="u">${nm(udD)}</h2>`, `<div class="ms-ty">${byName.get(ud).t.map(chip).join('')}</div>`) : ''}</div><div><p class="fa-k">Today's underdog · a rare pull</p><h2 class="u">Somebody's <span class="pl">favourite.</span></h2><p>Rarely picked in tournaments, but every Pokémon deserves its moment.</p><div class="h2-go"><a class="np-btn2"><span>Build Around It</span></a><a class="np-link">Info Sheet</a></div></div></section></div>`; }
  // THE COVER: Home as a magazine cover
  const one = X.used[0], d = new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  const line = (big, small, href) => `<a class="hc-line">${big.startsWith('<') ? big : `<b class="u">${big}</b>`}<span>${small}</span></a>`;
  return `<div class="hc">
    <section class="hc-cover" style="--cp:${cp(one.n)};--ta:var(--ty-${one.t[0]})"><p class="hc-mast"><span>The NastyPlot report</span><span>Reg M-C · ${E(d)}</span><span>${X.teams.toLocaleString('en-US')} teams inside</span></p>
      <div class="hc-star">${mon(one.n, {ft: true})}</div><p class="hc-one u">#1 most used: ${nm(one.d)} <small>${E(String(one.pct))}% of teams</small></p>
      <h1 class="u hc-h"><span>Sharply</span> <span>raise your</span> <span class="pl">win rate.</span></h1>
      <div class="hc-lines">${line(String(X.s), `Your team's Strength Score: ${E(X.word)}. What to change, inside.`)}${line('VS', `The Champion's six: ${E(X.champ.ev)}. Your game plan against it.`)}${line('#1', `The Meta, right now: ${E(X.top[0].d)} leads the ratings at ${X.top[0].r}.`)}${line(ud ? mon(ud) : '', `${E(udD)}: somebody's favourite. Today's underdog.`)}</div>
      <div class="hc-act">${go}</div></section>
    <section class="hc-contents"><h2 class="u">Inside this issue.</h2><ol>${tools.map((t, i) => `<li><span class="u">${String(i + 1).padStart(2, '0')}</span><b>${t}</b></li>`).join('')}</ol></section></div>`; }
