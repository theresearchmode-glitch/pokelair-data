// ---------- Meta > Track Record (Nov 15): Sim's pick "The Receipt" (docs/rebuild/mocks/thisweek-trackrecord/BRIEF.md) ----------
// Everything today's Track Record page holds (64-track.js renderTrack), from the same data and shared logic (META.track, TR_BANDS,
// TR_MIN, trRates, trPct, trWeek, trAdd in 64-track-data.js): the question, the three counts, the three steps and the fair-test line with
// its "?", Top-8 Teams by the Rating We Gave with its four bands, the verdict sentence (the big "N×" is that same live figure and is not
// drawn without a verdict), Biggest Hits and Biggest Misses with each line and rating, the note about "Rated", Week by Week with its
// legend, Coming as the data grows, Events Checked, and How Ratings Work. Band colours are the tier colours of each band's rating.
// The paper (the receipt, the slips, the chart sheet) is white with dark words in both themes: a design choice waiting on Sim's yes.
V2.trBandC = b => { try { const k = lTier([80, 60, 40, 0][b]).k.toLowerCase(); return `var(--tier-${k})`; } catch (e) { return 'var(--ink-3)'; } };
// Sim (Nov 17, 'recommended'): no dots on the cards: the big number already says 'Rated N', each fact on its own line
/* reskin (Nov 22, Sim approved HH's track2 direction, 12:34 PM; mock docs/rebuild/mocks/reskin-nov22/track-mock.inject.js): each call is the kit's
   roster card (V2.kCard: the Pokémon bursting out of its plate, its rated score in the name row) with the verdict tag UNDER the card (never over a
   name: HYBRID's fix for the CALLED IT wrap). A miss that won one event says "won 1 event" so the six cards stay even; the event's full name
   stays in the card's spoken label. 'text' is HTML and already escaped (review Nov 17 #8), so the label only drops tags and guards quotes */
V2.trSlip = (m, hit, text, i) => { const E = V2.esc, p = byName.get(m.n); if (!p) return '';
  /* on screen the approved mock's short fact (track2, HH Nov 22): a call "105 top 8s" / "won 10" on two lines (the mock's dot left out: Sim, Nov 17 Q1, no dots on the cards); a miss "won 1 event", or its first line
     ("on 4 top-8 teams" / "no top 8 in N events") when it won nothing; the full sentence (events, the event's name) stays in the spoken label */
  const said = text.replace(/<br>/g, ', ').replace(/<[^>]+>/g, '').replace(/"/g, '&quot;'), T = '\u0001F\u0001';
  const shown = hit ? `${homeNum(m.c)} top 8${m.c === 1 ? '' : 's'}<br>${m.w ? `won ${homeNum(m.w)}` : 'no wins'}` : m.w ? `won ${homeNum(m.w)} event${m.w === 1 ? '' : 's'}` : text.split('<br>')[0].replace(/^(on [\d,]+ top-8 teams?).*/, '$1');
  const card = V2.kCard(m.n, {score: RS(m.r), tier: 'rated', fact: T, attrs: {'data-v2mon': m.n}}).replace(T, shown)
    .replace('class="k-card', `class="trk-slip ${hit ? 'hit' : 'miss'} k-card`).replace(/ aria-pressed="[^"]*"/, '')
    .replace('<button type="button"', `<button type="button" aria-label="${E(p.d)}, rated ${RS(m.r)}, ${said}. ${hit ? 'Called it' : 'Missed'}."`);
  return `<li>${card.replace(/<span class="k-plate">/, '<span class="k-plate" aria-hidden="true">')}${V2.kTag(hit ? 'good' : 'bad', hit ? 'CALLED IT' : 'MISSED').replace('<span ', '<span aria-hidden="true" ')}</li>`; };
V2.trChart = T => { const W = new Map(); for (const e of T.ev) { const k = trWeek(e.date); if (!W.has(k)) W.set(k, []); W.get(k).push(e); }
  const wk = [...W.keys()].sort(); if (wk.length < TR_MIN.weeks) return null; const R = wk.map(k => trRates(W.get(k)));
  const mx = Math.max(.01, ...R.flat().filter(x => x != null)), w = innerWidth >= 700 ? 960 : 340, h = innerWidth >= 700 ? 280 : 240, /* wide screens get a wider drawing, so the chart isn't taller than it needs to be */ L = 48, Rr = 96, Tp = 12, B = 32, X = i => L + (wk.length === 1 ? 0 : i * (w - L - Rr) / (wk.length - 1)), Y = v => Tp + (1 - v / mx) * (h - Tp - B);
  const grid = [0, .5, 1].map(f => `<line x1="${L}" x2="${w - Rr}" y1="${Y(f * mx)}" y2="${Y(f * mx)}" class="trk-grid"/><text x="${L - 6}" y="${Y(f * mx) + 5}" class="trk-ax" text-anchor="end">${trPct(f * mx)}</text>`).join('');
  const ends = [0, 1, 2, 3].map(b => { let i = R.length - 1; while (i >= 0 && R[i][b] == null) i--; return {b, y: i < 0 ? null : Y(R[i][b])}; }).filter(o => o.y != null).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) ends[i].y = Math.max(ends[i].y, ends[i - 1].y + 16); const labY = new Map(ends.map(o => [o.b, o.y]));
  const lines = [0, 1, 2, 3].map(b => { const pts = R.map((r, i) => r[b] == null ? null : [X(i), Y(r[b])]).filter(Boolean); if (!pts.length) return ''; const c = V2.trBandC(b), last = pts[pts.length - 1];
    const P = pts.map(p => p.join(',')).join(' '); /* audit Nov 16 (WCAG 1.4.11): the tier colours stay (Sim); a thin dark edge under each line and round each dot gives 3:1 against the white card */
    return `<polyline points="${P}" fill="none" class="trk-edge" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${P}" fill="none" style="stroke:${c}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="5" style="fill:${c}" class="trk-dot"/>`).join('')}<text x="${last[0] + 10}" y="${(labY.get(b) ?? last[1]) + 5}" class="trk-lab">${TR_BANDS[b]}</text>`; }).join('');
  const xl = wk.map((k, i) => (i === 0 || i === wk.length - 1 || wk.length <= 6) ? `<text x="${X(i)}" y="${h - 8}" class="trk-ax" text-anchor="middle">${evDate(k)}</text>` : '').join('');
  /* audit Nov 16 (screen readers): the chart's numbers as a table, read but not shown */
  const tbl = `<div class="vh"><table><caption>Share of top-8 teams per Pokémon, week by week, by rating band</caption><tr><th scope="col">Week</th>${[0, 1, 2, 3].map(b => `<th scope="col">${TR_BANDS[b]}</th>`).join('')}</tr>${wk.map((k, i) => `<tr><th scope="row">${evDate(k)}</th>${[0, 1, 2, 3].map(b => `<td>${R[i][b] == null ? 'no data' : trPct(R[i][b])}</td>`).join('')}</tr>`).join('')}</table></div>`;
  return `<svg class="trk-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Share of top-8 teams per Pokémon, week by week, by rating band">${grid}${xl}${lines}</svg>${tbl}
    <p class="trk-leg">${TR_BANDS.map((t, b) => `<span><i style="background:${V2.trBandC(b)}"></i>Rated ${t}</span>`).join('')}</p>`; };
V2.pages.track = {place: 'meta', draw() { const E = V2.esc, T = META.track;
  const head = `<header class="k-head trk-h"><p class="k-kicker np-eyebrow">META · THE RECEIPTS</p><h1 class="k-h1 u">We <em>called it.</em><br>Check the receipts.</h1><p class="k-lead">How right have our ratings been? Each morning's ratings are saved, then checked against events they never saw.</p></header>`;
  const tip = V2.wkTip('trhow', 'How the check works', "Every morning, every rating is saved. An event is played after that. We compare its top 8 with what we'd rated. The ratings couldn't have seen these events, so it's a fair test. Events: online ones with 32+ players and official ones; each uses the newest ratings saved before its day.");
  const how = `<section class="trk-how"><ol class="trk-flow"><li><b class="u">1</b>Ratings saved each morning</li><li><b class="u">2</b>An event is played</li><li><b class="u">3</b>Its top 8 compared</li></ol><p class="fine">A fair test: the ratings never saw these <span class="nw">events${tip}</span></p></section>`;
  const foot = `<p class="trk-links"><a class="np-link" href="#method=rating">How Ratings Work ›</a></p>`;
  if (!T) return `<div class="ra gsp trk">${head}${how}<section class="trk-empty"><h2 class="u">Collecting</h2><p>The first results appear here after the next morning's data refresh.</p></section>${foot}</div>`;
  const n = T.ev.length, early = n < TR_MIN.verdict, days = Math.max(1, Math.round((Date.parse(T.last + 'T12:00:00Z') - Date.parse(T.since + 'T12:00:00Z')) / 864e5) + 1);
  const stats = `<ul class="k-facts trk-stats"><li><b class="u">${E(evDate(T.since))}</b><span>tracking since</span></li><li><b class="u">${days}</b><span>day${days === 1 ? '' : 's'} of ratings saved</span></li><li><b class="u k-key">${n}</b><span>event${n === 1 ? '' : 's'} checked <span class="trk-nw">so far</span></span></li></ul>`;
  let receipt = '';
  if (!n) receipt = `<section class="trk-rc"><p class="trk-rn u">NastyPlot</p><p class="trk-rk">* * * Track Record * * *</p><p class="trk-rs">Collecting. No event has been played after the first saved ratings yet. The first check appears the morning after one finishes.</p></section>`;
  else { const r = trRates(T.ev), ratio = r[0] && r[3] ? r[0] / r[3] : null, big = !early && ratio && isFinite(ratio), x = big ? (ratio >= 100 ? Math.round(ratio / 10) * 10 + '×' : ratio >= 10 ? Math.round(ratio) + '×' : ratio.toFixed(1) + '×') : ''; /* the real figure, rounded (Sim, Nov 18, Q11: 'rounded'; was capped at 20×) */
    const says = big ? `Pokémon we rated ${TR_BANDS[0]} were on top-8 teams <b>${ratio >= 10 ? 'about ' + x : x}</b> as often as Pokémon we rated ${TR_BANDS[3].toLowerCase()}.` : '';
    receipt = `<section class="trk-rc" aria-label="Top-8 teams, by the rating we gave"><i class="trk-tape" aria-hidden="true"></i><p class="trk-rn u" aria-hidden="true">NastyPlot</p><p class="trk-rk" aria-hidden="true">* * * Track Record * * *</p>
      <h2 class="trk-rt">Top-8 Teams by the Rating We Gave</h2><p class="trk-rs">How often each Pokémon was on a top-8 team, on average · ${n} event${n === 1 ? '' : 's'}, ${CH.n(T.ev.reduce((a, e) => a + e.teams, 0))} top-8 teams</p>
      ${early ? `<p class="trk-early"><b>Early:</b> only ${n} event${n === 1 ? '' : 's'} so far${V2.wkTip('trearly', 'What early means here', `Only ${n} event${n === 1 ? '' : 's'}. Too few to judge yet, so these numbers will move. A verdict appears after ${TR_MIN.verdict} events.`)}</p>` : ''}
      <ul class="trk-lines">${r.map((v, b) => { const m = T.mb[b]; return `<li><span class="trk-ln"><b>Rated ${TR_BANDS[b]}</b><i aria-hidden="true"></i><b class="u">${v == null ? '–' : trPct(v)}</b></span><small>${m[1]} of ${m[0]} made at least one top 8</small></li>`; }).join('')}</ul>
      ${big ? `<p class="trk-tot"><span>Total</span><b class="u">${x}</b></p><p class="trk-say">${says}</p>` : ''}
      <p class="trk-bar" aria-hidden="true"><i></i><b class="trk-stamp u fair">Fair test</b></p><p class="trk-last">The ratings never saw these events</p></section>`; }
  // the calls: today's hits and misses, same picks and lines
  const ms = T.mons, hits = ms.filter(m => m.r >= 70 && m.c > 0).sort((a, b) => b.c - a.c || b.r - a.r).slice(0, 3);
  const lows = ms.filter(m => m.r < 50 && m.c > 0).sort((a, b) => b.w - a.w || b.c - a.c || a.r - b.r).slice(0, 3);
  const highs = n >= TR_MIN.misses ? ms.filter(m => m.r >= 75 && m.c === 0 && m.ev >= TR_MIN.misses).sort((a, b) => b.r - a.r).slice(0, 3) : [];
  const won = m => m.w ? (m.w === 1 ? `won ${E(V2.evTitle(m.best))}` : `won ${m.w} events`) : `on ${m.c} top-8 team${m.c === 1 ? '' : 's'}${m.best ? ` (${E(V2.evTitle(m.best))})` : ''}`;
  const misses = [...lows.map(m => [m, won(m)]), ...highs.map(m => [m, `no top 8 in ${m.ev} events`])];
  /* the six calls as one roster (hits first), each group named; the 'Rated' note under them */
  const hitL = hits.map((m, i) => V2.trSlip(m, true, `on ${m.c} top-8 team${m.c === 1 ? '' : 's'} in ${m.ev} event${m.ev === 1 ? '' : 's'}${m.w ? `<br>won ${m.w === 1 ? E(V2.evTitle(m.best)) : m.w + ' events'}` : ''}`, i)).filter(Boolean),
    missL = misses.map(([m, t], i) => V2.trSlip(m, false, t, i)).filter(Boolean);
  const calls = n ? `<section class="trk-calls"><div class="trk-cols"><div class="trk-hits"><h3 class="trk-gh">Biggest Hits${V2.kTag('good', 'CALLED IT').replace('<span ', '<span aria-hidden="true" ')}</h3>${hitL.length ? `<ul class="k-roster trk-slips" data-n="${hitL.length}">${hitL.join('')}</ul>` : '<p class="trk-none">None yet.</p>'}</div>
      <div class="trk-miss"><h3 class="trk-gh">Biggest Misses${V2.kTag('bad', 'MISSED').replace('<span ', '<span aria-hidden="true" ')}</h3>${missL.length ? `<ul class="k-roster trk-slips" data-n="${missL.length}">${missL.join('')}</ul>` : '<p class="trk-none">None yet.</p>'}${n < TR_MIN.misses ? `<p class="fine">High ratings that miss every top 8 show here after ${TR_MIN.misses} events.</p>` : ''}</div></div>
    <p class="fine">"Rated" is the average of the ratings saved before each event. Tap a Pokémon for its page.</p></section>` : '';
  const chart = n ? V2.trChart(T) : null, firstWk = n ? trWeek(T.ev[0].date) : T.since, chartAt = trAdd(firstWk, 7 * (TR_MIN.weeks - 1));
  const weeks = `<section class="trk-wk"><h2 class="u">Week by Week</h2>${chart ? `<p class="fine trk-wkcap">Each date is the Monday that week starts on.</p><div class="trk-paper">${chart}</div>` : `<p class="trk-none"><b>From about ${E(evDate(chartAt))}</b>: a line for each rating band, once there are ${TR_MIN.weeks} weeks of events.</p>`}</section>`;
  const next = [early ? `A one-line verdict after ${TR_MIN.verdict} events (${n} so far)` : '', n < TR_MIN.misses ? `High-rated misses after ${TR_MIN.misses} events` : ''].filter(Boolean);
  const coming = next.length ? `<section class="trk-next"><h2 class="u">Coming as the Data Grows</h2><ul>${next.map(x => `<li>${x}</li>`).join('')}</ul></section>` : '';
  const evl = n ? `<details class="wk-fold trk-evs"${(() => { try { return LS.get('cc2.chf.trevents', null) ? ' open' : ''; } catch (e) { return ''; } })()}><summary>Events Checked <small>${n} event${n === 1 ? '' : 's'}, newest first</small></summary><ul>${T.ev.slice().reverse().slice(0, 60).map(e => `<li><b>${E(V2.evTitle(e.name))}</b><span>${E(evDate(e.date))} · ${e.players} players${e.off ? ' · official' : ''} · ratings from ${E(evDate(e.snap))}</span></li>`).join('')}</ul></details>` : '';
  /* the plan: 1 the receipt (beside it the verdict stamp and the page's one pink move), 2 the calls, 3 how we check, week by week, events checked */
  let say = '';
  if (n && !early) { const r = trRates(T.ev), ratio = r[0] && r[3] ? r[0] / r[3] : null; if (ratio && isFinite(ratio)) say = ratio >= 100 ? Math.round(ratio / 10) * 10 + '×' : ratio >= 10 ? Math.round(ratio) + '×' : ratio.toFixed(1) + '×'; }
  const side = `<div class="trk-say2">${say ? `<p class="trk-big u" aria-hidden="true">${E(say)} more top 8s</p><p class="trk-sl">The ratings called the top 8s before the events were played.</p>` : ''}${V2.kGo('SEE HOW WE RATE.', {href: '#method=rating'})}</div>`;
  const s1 = V2.kStep(1, 'The receipt.', 'top-8 teams, by the rating we gave', `<div class="trk-r1">${receipt}${side}</div>`);
  const s2 = n ? V2.kStep(2, 'The calls.', 'three we called, three we missed', calls) : '';
  const s3 = V2.kStep(n ? 3 : 2, 'How we check.', 'every rating saved, then checked later', `${how}${weeks}${coming}${evl}${foot}`);
  return `<div class="ra gsp trk trk2"><div class="trk-top">${head}${stats}</div>${V2.kPlan(s1 + s2 + s3)}</div>`; }};

// Nov 15 (re-audit #14): the chart dates are week starts (trWeek, Monday), so the first point reads Oct 26 while tracking began Thursday Oct 29; the caption says so
// Nov 15 (test TRACK-07): Events Checked remembers open / closed on this device, under today's key (cc2.chf.trevents)
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('trk-evs')) { try { LS.set('cc2.chf.trevents', e.target.open ? 1 : 0); } catch (er) {} } }, true);
