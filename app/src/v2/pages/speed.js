// ---------- Speed Tiers (Nov 13), Battle's tool: who moves first, your six against the 20 most-used others ----------
// Sim's picks (Nov 13, morning): Speed Q1 A (desktop: the race track, your six above the line, the field below) and Speed Q2 A
// (phones: the slim vertical track). Every number comes from today's shared logic (39-damage-calc-speed.js speedData: likely
// Speed, item, weather abilities, Tailwind, -1, paralysis, Trick Room, Unburden, the outspeed share of the top 30 and the Speed
// points it takes to pass the threat above); nothing here works anything out. Today's controls all stay: the five conditions and
// the weather (your team's weather, none, or any of the four), Track / List, and each list row's spread, item and notes.
V2.spView = () => V2.LS.get('np2.spview') === 'list' ? 'list' : 'track';
V2.spName = r => V2.rowName(V2.disp(r.p.n));
// one row's small print, as today's list: spread, Scarf, weather doubling, Unburden, the ability note and base Speed
V2.spNote = (r, W) => [r.s.label, r.s.scarf ? 'Choice Scarf' : '', r.wxUp ? `${r.ab} ×2 in ${W}` : '', r.unb ? `${r.unb} after its item is used (Unburden)` : '',
  (typeof spdAbNote === 'function' ? spdAbNote(r.ab) : '').replace(/^ · /, ''), `base ${r.p.st[5]}`].filter(Boolean).join(' · ');
V2.spTie = (rows, r) => rows.some(o => o !== r && o.v === r.v && o.me !== r.me);

V2.spHead = (D, view) => { const E = V2.esc, tr = spdUi.tr, cond = [spdUi.tw ? 'your Tailwind' : '', spdUi.twOpp ? 'their Tailwind' : '', spdUi.icy ? 'their −1 Speed' : '',
    spdUi.par ? 'they\'re paralyzed' : '', tr ? 'Trick Room: the slowest moves first' : ''].filter(Boolean);
  const wx = spdUi.wx === 'auto' ? (D.autoW ? `weather: ${D.autoW}, from your team` : 'no weather on your team') : spdUi.wx ? `weather: ${spdUi.wx}` : 'no weather';
  const tog = (k, t) => `<button type="button" class="np-chip" data-spd="${k}" aria-pressed="${!!spdUi[k]}">${t}</button>`;
  const wxb = (k, t) => `<button type="button" class="np-chip" data-spdwx="${k}" aria-pressed="${spdUi.wx === k}">${t}</button>`;
  return `<section class="sp2-h"><p class="np-eyebrow"><span>Battle · Speed Tiers · level 50</span></p><h1 class="u"><span>Who moves first.</span> <span class="pl">${D.mine.length ? `Your six vs the top ${D.thr.length}.` : `The top ${D.thr.length}.`}</span></h1>
    <p class="tm-sub">${tr ? 'Slowest first' : 'Fastest first'}, with each side's usual spread and item; ${E(wx)}${cond.length ? `; ${E(cond.join(', '))}` : ''}.</p></section>
    <div class="sp2-ctl"><div class="np-slide" role="group" aria-label="Show as" style="--n:2;--i:${view === 'list' ? 1 : 0}"><span class="thumb" aria-hidden="true"></span><button type="button" data-spview="track" aria-pressed="${view !== 'list'}"><span>Track</span></button><button type="button" data-spview="list" aria-pressed="${view === 'list'}"><span>List</span></button></div>
      <div class="chips" role="group" aria-label="Speed conditions">${tog('tw', 'Your Tailwind')}${tog('twOpp', 'Their Tailwind')}${tog('icy', 'Them −1')}${tog('par', 'They\'re Paralyzed')}${tog('tr', 'Trick Room')}</div></div>
    <div class="sp2-wx chips" role="group" aria-label="Weather">${wxb('auto', D.autoW ? `Your Weather (${E(D.autoW)})` : 'Your Weather (None)')}${wxb('', 'No Weather')}${wxb('sun', 'Sun')}${wxb('rain', 'Rain')}${wxb('sand', 'Sand')}${wxb('snow', 'Snow')}</div>`; };

// desktop race track (1024+): x by Speed, your six in lanes above the line, the field in lanes below, so no two names touch
V2.spTrack = D => { const rows = D.rows, tr = spdUi.tr, Wd = (() => { const el = document.querySelector('.sp2'); if (!el) return 1200; const cs = getComputedStyle(el); return Math.max(600, el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)); })(), pad = 48;
  const vs = rows.map(r => r.v), mx = Math.max(...vs), mn = Math.min(...vs), span = mx - mn || 1;
  const x = v => Math.round(pad + (Wd - 2 * pad) * (tr ? v - mn : mx - v) / span);
  const lanes = (list, wid) => { const last = []; return list.map(r => { const X = x(r.v); let k = 0; while (last[k] != null && Math.abs(X - last[k]) < wid) k++; last[k] = X; return {...r, X, k}; }); };
  const M = lanes(rows.filter(r => r.me), 120), T = lanes(rows.filter(r => !r.me), 84), mk = M.length ? Math.max(...M.map(r => r.k)) + 1 : 0, tk = Math.max(...T.map(r => r.k)) + 1;
  const AY = mk * 152 + 16, H = AY + 16 + tk * 104;
  const mon = (r, iw, top, w) => `<button type="button" class="sp2-m${r.me ? ' me' : ''}" data-v2mon="${V2.esc(r.p.n)}" style="left:${r.X}px;top:${top}px;--mw:${w}px" aria-label="${V2.esc(V2.disp(r.p.n))}, ${r.v} Speed${r.me ? ', yours' : ''}${V2.spTie(rows, r) ? ', a tie' : ''}: open its info"><span class="v u">${r.v}</span>${V2.mon(r.p.n, {iw, bare: true})}<span class="nm">${V2.spName(r)}</span></button>`;
  return `<div class="sp2-track" style="--h:${H}px;--ay:${AY}px"><i class="sp2-axis" aria-hidden="true"></i>
    ${M.map(r => mon(r, 64, AY - 152 * (r.k + 1) + 8, 120)).join('')}${T.map(r => mon(r, 36, AY + 16 + 104 * r.k, 80)).join('')}</div>
    <p class="sp2-k"><span>← Moves first</span><span>${D.mine.length ? `Your six above the line · the top ${D.thr.length} below` : `The top ${D.thr.length}`}</span><span>Moves last →</span></p>`; };

// phones and tablets (under 1024): the slim vertical track, fastest at the top (slowest under Trick Room), equal speeds share a row
V2.spVTrack = D => { const g = []; for (const r of D.rows) { const l = g[g.length - 1]; if (l && l.v === r.v) l.items.push(r); else g.push({v: r.v, items: [r]}); }
  return `<ol class="sp2-vt" aria-label="Turn order">${g.map(G => `<li class="${G.items.some(r => r.me) ? 'me' : ''}"><b class="v u">${G.v}</b><i class="dot" aria-hidden="true"></i><span class="who">${G.items.map(r =>
    `<button type="button" class="chip2${r.me ? ' me' : ''}" data-v2mon="${V2.esc(r.p.n)}" aria-label="${V2.esc(V2.disp(r.p.n))}, ${r.v} Speed${r.me ? ', yours' : ''}${G.items.length > 1 && G.items.some(o => o.me !== r.me) ? ', a tie' : ''}: open its info">${V2.mon(r.p.n, {iw: r.me ? 40 : 32, bare: true})}<span>${V2.spName(r)}</span></button>`).join('')}${G.items.length > 1 && G.items.some(r => r.me) && G.items.some(r => !r.me) ? '<span class="tie">Tie</span>' : ''}</span></li>`).join('')}</ol>`; };

// Sim, Nov 14 (12:0x AM): "hard to tell which 6 are ours and 20 are the meta". Two candidate looks for the slim track, drawn for her
// pictures (V2.spLook = 'split' | 'band'); the plain track above stays until she picks.
V2.spVSplit = D => { const g = []; for (const r of D.rows) { const l = g[g.length - 1]; if (l && l.v === r.v) l.items.push(r); else g.push({v: r.v, items: [r]}); }
  const one = r => `<button type="button" class="chip2${r.me ? ' me' : ''}" data-v2mon="${V2.esc(r.p.n)}" aria-label="${V2.esc(V2.disp(r.p.n))}, ${r.v} Speed${r.me ? ', yours' : ''}: open its info">${r.me ? `<span>${V2.spName(r)}</span>${V2.mon(r.p.n, {iw: 40, bare: true})}` : `${V2.mon(r.p.n, {iw: 32, bare: true})}<span>${V2.spName(r)}</span>`}</button>`;
  return `<div class="sp2-vs-h"><span class="u">Your six</span><span>Speed</span><span class="u">Top ${D.thr.length}</span></div><ol class="sp2-vs" aria-label="Turn order">${g.map(G => `<li><span class="mine">${G.items.filter(r => r.me).map(one).join('')}</span><b class="v u${G.items.some(r => r.me) ? ' me' : ''}">${G.v}</b><span class="them">${G.items.filter(r => !r.me).map(one).join('')}</span></li>`).join('')}</ol>`; };

// the list: every row with today's small print (spread, item, notes, base Speed) and You / Tie tags
V2.spList = D => `<ol class="sp2-list">${D.rows.map(r => `<li class="${r.me ? 'me' : ''}"><b class="v u">${r.v}</b><button type="button" class="sp2-li" data-v2mon="${V2.esc(r.p.n)}" aria-label="${V2.esc(V2.disp(r.p.n))}: open its info">${V2.mon(r.p.n, {iw: 40, bare: true})}<span class="nm">${V2.spName(r)}<small>${V2.esc(V2.spNote(r, D.W))}</small></span></button><span class="tag">${r.me ? 'You' : ''}${V2.spTie(D.rows, r) ? `${r.me ? ' · ' : ''}Tie` : ''}</span></li>`).join('')}</ol>`;

// one line per member of yours: today's outspeed share of the top 30 and the Speed points to pass the threat just above
V2.spSums = D => { const E = V2.esc; if (!D.sums.length) return '';
  return `<div class="sp2-sum">${D.sums.map(({p, beat, tip, os, cond}) => `<p><b>${E(V2.disp(p.n))}</b> ${os ? `${outspeedTxt(os, {tr: spdUi.tr})} threats${cond ? ` (${E(cond)})` : ''}` : `moves first against ${beat} of the ${D.thr.length} here`}${!tip ? ''
    : tip.need != null ? `<small>${tip.need - tip.cur} more Speed points (${tip.need} total) outspeeds ${E(V2.disp(tip.above.p.n))}</small>` : `<small>Can't outspeed ${E(V2.disp(tip.above.p.n))} with this nature</small>`}</p>`).join('')}</div>`; };

V2.pages.speed = {place: 'battle', draw() { let D; try { D = speedData(); } catch (e) { console.error(e); D = null; }
  const view = V2.spView(), wide = matchMedia('(min-width:1024px)').matches;
  if (!D) return `<div class="sp2">${V2.battleToolsBar('speed')}<p class="tm-sub">Speed Tiers couldn't load. Try again in a moment.</p></div>`;
  const empty = !D.mine.length ? `<div class="sp2-empty"><p class="tm-sub">Add Pokémon on My Team to place them against the top ${D.thr.length}.</p><a class="np-btn" href="#team">Go to My Team</a></div>` : '';
  const body = view === 'list' ? V2.spList(D) : wide ? V2.spTrack(D) : V2.spLook === 'split' ? V2.spVSplit(D) : V2.spVTrack(D);
  return `<div class="sp2">${V2.battleToolsBar('speed')}${V2.spHead(D, view)}${empty}${body}${V2.spSums(D)}
    <p class="fine sp2-foot">Level 50, 31 IVs. Yours use your items, and your spreads where you set them. Theirs are assumed, since their real spreads and items are hidden: the most common natures and items, fast Pokémon at 32 Speed points. Weather speed Abilities (Chlorophyll, Swift Swim, Sand Rush, Slush Rush) double Speed in their weather.</p></div>`; }};

document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.sp2 [data-spview]'); if (t) { V2.LS.set('np2.spview', t.dataset.spview); V2.redraw(); return; }
  const b = e.target.closest && e.target.closest('.sp2 [data-spd],.sp2 [data-spdwx]'); if (!b) return; e.stopImmediatePropagation();
  if (b.dataset.spdwx != null) spdUi.wx = b.dataset.spdwx; else { const k = b.dataset.spd; spdUi[k] = !spdUi[k]; } V2.redraw(); }, true);
// the track is placed in pixels: redraw when the window is resized across a width that changes it
(() => { let w = innerWidth, t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (Math.abs(innerWidth - w) < 8) return; w = innerWidth; if (document.querySelector('.sp2')) V2.redraw(); }, 150); }); })();
