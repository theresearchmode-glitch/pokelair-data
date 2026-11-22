// ---------- Speed Tiers, Battle's tool: who moves first, your six against the 20 most-used others ----------
// Reskin proposal (Nov 22, helper hT2, NOT approved yet): "Your six cut the line". One ladder in move order (fastest first; slowest first
// under Trick Room): each of the top 20 is a type-coloured Speed bar with the Pokémon riding its tip; each of yours is a Plot blue band cut
// across the ladder at its own Speed, its art bursting out of the band and its numbers written on the cut (its outspeed share of the top 30
// and the Speed points that pass the threat just above). Everything above a cut moves before it; everything under it, after.
// Every number comes from today's shared logic (39-damage-calc-speed.js speedData: likely Speed, item, weather abilities, Tailwind, -1,
// paralysis, Trick Room, Unburden, the outspeed share of the top 30 and the Speed points it takes to pass the threat above); nothing here
// works anything out. Today's controls all stay (data-spd / data-spdwx / data-spview): the six conditions and the weather (your team's
// weather, none, or any of the four) as the kit's plot sentence, Track / List, and each list row's spread, item and notes.
V2.spView = () => V2.LS.get('np2.spview') === 'list' ? 'list' : 'track';
V2.spName = r => V2.rowName(V2.disp(r.p.n));
// one row's small print, as today's list: spread, Scarf, weather doubling, Unburden, the ability note and base Speed
V2.spNote = (r, W) => [r.s.label, r.s.scarf ? 'Choice Scarf' : '', r.wxUp ? `${r.ab} ×2 in ${W}` : '', r.unb ? `${r.unb} after its item is used (Unburden)` : '',
  (typeof spdAbNote === 'function' ? spdAbNote(r.ab) : '').replace(/^ · /, ''), `base ${r.p.st[5]}`].filter(Boolean).join(' · ');
V2.spTie = (rows, r) => rows.some(o => o !== r && o.v === r.v && o.me !== r.me);

// the header (kit): kicker, headline, lead, then the conditions and the weather as two plot sentences (at most 6 blue words each)
V2.spHead = D => { const E = V2.esc, tr = spdUi.tr, cond = [spdUi.tw ? 'your Tailwind' : '', spdUi.up ? 'your six at +1 Speed' : '', spdUi.twOpp ? 'their Tailwind' : '', spdUi.icy ? 'their −1 Speed' : '',
    spdUi.par ? 'they\'re paralyzed' : '', tr ? 'Trick Room: the slowest moves first' : ''].filter(Boolean);
  const wx = spdUi.wx === 'auto' ? (D.autoW ? `weather: ${D.autoW}, from your team` : 'no weather on your team') : spdUi.wx ? `weather: ${spdUi.wx}` : 'no weather';
  const tog = (k, w) => ({w, on: !!spdUi[k], attrs: {'data-spd': k}}), wxb = (k, w) => ({w, on: spdUi.wx === k, attrs: {'data-spdwx': k}});
  const h1 = `<span>Who moves <em>first.</em></span> <span class="pl">${D.mine.length ? `Your six vs the top ${D.thr.length}.` : `The top ${D.thr.length}.`}</span>`;
  return `<section class="sp2-h">${V2.kHead({kicker: 'Battle · Speed Tiers · level 50', h1Html: h1, lead: `${tr ? 'Slowest first' : 'Fastest first'}, with each side's usual spread and item; ${wx}${cond.length ? `; ${cond.join(', ')}` : ''}.`})}
    <div class="sp2-ctl">${V2.kSent(['With', tog('tw', 'Your Tailwind'), tog('up', 'You +1'), 'vs', tog('twOpp', 'Their Tailwind'), tog('icy', 'Them −1'), tog('par', 'They\'re Paralyzed'), 'or', tog('tr', 'Trick Room')], {label: 'Speed conditions', hint: false})}
    <div class="sp2-wx">${V2.kSent(['In', wxb('auto', D.autoW ? `Your Weather (${D.autoW})` : 'Your Weather (None)'), wxb('', 'No Weather'), wxb('sun', 'Sun'), wxb('rain', 'Rain'), wxb('sand', 'Sand'), wxb('snow', 'Snow')], {label: 'Weather'})}</div></div></section>`; };

// the ladder's scale: a thin rule every 50 Speed (100 when the top is very fast), the labels on top
V2.spScale = rows => { const mx = Math.max(1, ...rows.map(r => r.v)), step = mx > 400 ? 100 : 50, ticks = []; for (let t = step; t < mx; t += step) ticks.push(t); return {mx, step, ticks}; };
V2.spSum = (D, r) => D.sums.find(x => x.p.n === r.p.n);
// the words on a cut: today's summary line (the outspeed share of the top 30) and its Speed-point tip, as the old ".sp2-sum" lines
V2.spCutParts = (D, s) => { const E = V2.esc; if (!s) return null;
  const head = s.os ? `${outspeedTxt(s.os, {tr: spdUi.tr})} threats${s.cond ? ` (${s.cond})` : ''}` : `moves first against ${s.beat} of the ${D.thr.length} here`;
  const tip = !s.tip ? '' : s.tip.need != null ? `${s.tip.need - s.tip.cur} more Speed points (${s.tip.need} total) outspeeds ${V2.disp(s.tip.above.p.n)}` : `Can't outspeed ${V2.disp(s.tip.above.p.n)} with this nature`;
  return {head, tip, html: `<span class="sp2-cs"><span class="sp2-cs-m"><b class="sp2-cs-n vh">${E(V2.disp(s.p.n))}</b> ${E(head).replace(/(\d+%)/, '<b class="u">$1</b>')}</span>${tip ? `<small>${E(tip)}</small>` : ''}</span>`}; };

// Track: the ladder. A row of the top 20 = its Speed, its name, its bar (its first type's colour) with the Pokémon at the tip.
// A row of yours = the cut: a Plot blue band across the whole ladder, the same three columns, white bar, its art bursting out of the band
V2.spLadder = D => { const E = V2.esc, rows = D.rows, {mx, ticks} = V2.spScale(rows), pct = v => (100 * v / mx).toFixed(2);
  /* phones pair the top 20 two to a row between your cuts; the last of an odd run takes the whole row (no half-filled row) */
  const solo = new Set(); { let run = []; for (const r of [...rows, null]) { if (!r || r.me) { if (run.length % 2) solo.add(run[run.length - 1]); run = []; } else run.push(r); } }
  const row = r => { const t = (r.p.t || [])[0], tie = V2.spTie(rows, r), d = V2.disp(r.p.n), k = d.startsWith('Mega ') ? {form: 'Mega', name: d.slice(5).replace(/ (\S)$/, '\u00a0$1')} : {form: '', name: d};
    const cs = r.me ? V2.spCutParts(D, V2.spSum(D, r)) : null;
    const lab = `${r.v} ${E(V2.disp(r.p.n))}: Speed${r.me ? ', yours' : ''}${tie ? ', a tie' : ''}${cs ? E(`; ${cs.head}${cs.tip ? '; ' + cs.tip : ''}`) : ''}; open its info`;
    const nm = r.me ? `<span class="nm"><small class="sp2-form">${k.form ? E(k.form) : ''}</small><b class="u">${E(k.name)}</b>${V2.kMine('Yours')}</span>` : `<span class="nm">${V2.spName(r)}${tie ? V2.kTag('neutral', 'Tie') : ''}</span>`;
    const btn = `<button type="button" class="sp2-m${r.me ? ' me' : ''}" data-v2mon="${E(r.p.n)}" aria-label="${lab}"><b class="v u">${r.v}</b>${nm}${cs ? cs.html : ''}<span class="sp2-tr" aria-hidden="true"><span class="sp2-bar" style="--w:${pct(r.v)}%${V2.TYPES.includes(t) ? `;--c:var(--tyn-${t})` : ''}"><i></i>${V2.mon(r.p.n, {iw: r.me ? 104 : 48, bare: true})}</span></span></button>`;
    return `<li class="${r.me ? 'sp2-cut' : 'sp2-fr'}${solo.has(r) ? ' solo' : ''}">${btn}</li>`; };
  const scale = `<div class="sp2-sc" aria-hidden="true"><span class="u">Speed</span><span></span><span class="sp2-tr">${ticks.map(t => `<i style="--x:${pct(t)}%">${t}</i>`).join('')}</span></div>`;
  return `<div class="sp2-track${D.mine.length ? ' mine' : ''}" style="--tick:${pct(ticks[0] || mx)}%">${scale}<ol class="sp2-lad" aria-label="Turn order, ${spdUi.tr ? 'slowest' : 'fastest'} first${D.mine.length ? ': your six are the blue bands; everything above a band moves before it' : ''}">${rows.map(row).join('')}</ol>
    <p class="sp2-k"><span>↑ ${spdUi.tr ? 'Trick Room: moves first' : 'Moves first'}</span><span>${D.mine.length ? 'Each blue band is one of yours: above it moves before it, under it after' : `The top ${D.thr.length}`}</span><span>Moves last ↓</span></p></div>`; };

// List: every row with today's small print (spread, item, notes, base Speed) and You / Tie tags; yours are the same blue cuts with their words
V2.spList = D => `<ol class="sp2-list">${D.rows.map(r => { const t = (r.p.t || [])[0]; return `<li class="${r.me ? 'me' : ''}"${V2.TYPES.includes(t) ? ` style="--c:var(--tyn-${t})"` : ''}><b class="v u">${r.v}</b><button type="button" class="sp2-li" data-v2mon="${V2.esc(r.p.n)}" aria-label="${V2.esc(V2.disp(r.p.n))}: open its info">${V2.mon(r.p.n, {iw: 40, bare: true})}<span class="nm">${V2.spName(r)}<small>${V2.esc(V2.spNote(r, D.W))}</small></span></button><span class="tag">${r.me ? V2.kMine('You') : ''}${V2.spTie(D.rows, r) ? V2.kTag('neutral', 'Tie') : ''}</span>${r.me ? ((V2.spCutParts(D, V2.spSum(D, r)) || {}).html || '') : ''}</li>`; }).join('')}</ol>`;

// the view switch (Track / List) as two blue words beside the step title
V2.spViewSw = view => `<div class="sp2-view">${V2.kSent(['Show it as', {w: 'Track', on: view !== 'list', attrs: {'data-spview': 'track'}}, {w: 'List', on: view === 'list', attrs: {'data-spview': 'list'}}], {label: 'Show as', hint: false})}</div>`;

V2.pages.speed = {place: 'battle', draw() { let D; try { D = speedData(); } catch (e) { console.error(e); D = null; }
  const view = V2.spView();
  if (!D) return `<div class="sp2">${V2.battleToolsBar('speed')}<p class="k-lead">Speed Tiers couldn't load. Try again in a moment.</p></div>`;
  const empty = !D.mine.length ? `<div class="sp2-empty"><p class="k-lead">Add Pokémon on My Team to place them against the top ${D.thr.length}.</p>${V2.kGo('GO TO MY TEAM.', {href: '#team'})}</div>` : '';
  const n30 = (D.sums.find(x => x.os) || {}).os; /* audit v199 #7 (Nov 17): the shares count the top 30, the ladder shows 20 of them; say so once */
  const note = n30 ? `<p class="sp2-sum-k">Each share counts all top ${n30.n} threats; the ladder shows the ${D.thr.length} most used that aren't on your team.</p>` : '';
  const body = view === 'list' ? V2.spList(D) : V2.spLadder(D);
  const foot = `<p class="fine sp2-foot">Level 50, 31 IVs. Yours use your items, and your spreads where you set them. Theirs are assumed, since their real spreads and items are hidden: the most common natures and items, fast Pokémon at 32 Speed points. Weather speed Abilities (Chlorophyll, Swift Swim, Sand Rush, Slush Rush) double Speed in their weather.</p>`;
  const go = D.mine.length ? V2.kGo('PLAN TURN ONE.', {href: '#battle'}) : '';
  return `<div class="sp2">${V2.battleToolsBar('speed')}${V2.spHead(D)}${empty}${V2.kPlan(
    V2.kStep(1, D.mine.length ? 'Your six cut the line.' : 'Who gets the jump.', spdUi.tr ? 'slowest first' : 'fastest first', body).replace(/(<div class="k-sec">[\s\S]*?)<\/div>/, (m, a) => a + V2.spViewSw(view) + '</div>')
    + V2.kStep(2, 'The fine print.', 'how the speeds are worked out', note + foot + go))}</div>`; }};

document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.sp2 [data-spview]'); if (t) { V2.LS.set('np2.spview', t.dataset.spview); V2.redraw(); return; }
  const b = e.target.closest && e.target.closest('.sp2 [data-spd],.sp2 [data-spdwx]'); if (!b) return; e.stopImmediatePropagation();
  if (b.dataset.spdwx != null) spdUi.wx = b.dataset.spdwx; else { const k = b.dataset.spd; spdUi[k] = !spdUi[k]; } V2.redraw(); }, true);
