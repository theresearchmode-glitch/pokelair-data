// ---------- Track record (Nov 1, Sim approved): how right have our ratings been? ----------
// meta/track (out/track.json from track.mjs): each recent event checked against the ratings saved BEFORE it was played.
// The history is short (snapshots started Oct 29), so the page says exactly how much it rests on, shows the numbers as
// "early" until there are enough events, and lists what appears when. It never claims more than the data supports.
/* track.mjs buckets the saved (internal) totals at 80 / 60 / 40; the labels show those cut points on the shown school
   scale (RS), so "Rated 90+" here means the same as 90+ everywhere else (Nov 2) */
const TR_CUT = [80, 60, 40], TR_BANDS = [`${RS(TR_CUT[0])}+`, `${RS(TR_CUT[1])}–${RS(TR_CUT[0]) - 1}`, `${RS(TR_CUT[2])}–${RS(TR_CUT[1]) - 1}`, `Under ${RS(TR_CUT[2])}`], TR_MIN = {verdict: 10, misses: 5, weeks: 3};
// cleanTrack: moved to 05-data-clean.js (R4, Nov 11; shared with the rebuild)
const trPct = x => pctFmt(100 * x);
const trAdd = (d, n) => { const t = new Date(d + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const trWeek = d => { const t = new Date(d + 'T12:00:00Z'), w = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - w); return t.toISOString().slice(0, 10); };
// per band: the average share of top-8 teams each Pokémon in the band was on
function trRates(evs) { const a = [0, 0, 0, 0], s = [0, 0, 0, 0]; for (const e of evs) for (let b = 0; b < 4; b++) { a[b] += e.ap[b]; s[b] += e.bs[b] * e.teams; } return a.map((x, b) => s[b] ? x / s[b] : null); }
function trBars(T) { const r = trRates(T.ev), mx = Math.max(...r.filter(x => x != null), .01);
  return `<div class="trbars" role="img" aria-label="Average share of top-8 teams per Pokémon, by the rating we gave it: ${r.map((x, b) => `rated ${TR_BANDS[b]} ${x == null ? 'no data' : trPct(x)}`).join(', ')}">${r.map((x, b) => { const m = T.mb[b];
    return `<div class="trbar" title="Rated ${TR_BANDS[b]}: on ${x == null ? '–' : trPct(x)} of top-8 teams on average · ${m[1]} of ${m[0]} made a top 8"><div class="trbl"><b>Rated ${TR_BANDS[b]}</b><span>${m[1]} of ${m[0]} Pokémon made a top 8</span></div>
      <div class="trbt"><i style="width:${x == null ? 0 : Math.max(1.5, 100 * x / mx).toFixed(1)}%;background:var(--trb${b})"></i><em>${x == null ? '–' : trPct(x)}</em></div></div>`; }).join('')}</div>`; }
// week by week, one line per band (only once there are 3+ weeks of events)
function trLines(T) { const W = new Map(); for (const e of T.ev) { const k = trWeek(e.date); if (!W.has(k)) W.set(k, []); W.get(k).push(e); }
  const wk = [...W.keys()].sort(); if (wk.length < TR_MIN.weeks) return null; const R = wk.map(k => trRates(W.get(k)));
  const mx = Math.max(.01, ...R.flat().filter(x => x != null)), w = 340, h = 170, L = 34, Rr = 70, Tp = 10, B = 24, X = i => L + (wk.length === 1 ? 0 : i * (w - L - Rr) / (wk.length - 1)), Y = v => Tp + (1 - v / mx) * (h - Tp - B);
  const grid = [0, .5, 1].map(f => `<line x1="${L}" x2="${w - Rr}" y1="${Y(f * mx)}" y2="${Y(f * mx)}" class="trgrid"/><text x="${L - 4}" y="${Y(f * mx) + 4}" class="trax" text-anchor="end">${trPct(f * mx)}</text>`).join('');
  const ends = [0, 1, 2, 3].map(b => { let i = R.length - 1; while (i >= 0 && R[i][b] == null) i--; return {b, y: i < 0 ? null : Y(R[i][b])}; }).filter(o => o.y != null).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) ends[i].y = Math.max(ends[i].y, ends[i - 1].y + 12); const labY = new Map(ends.map(o => [o.b, o.y]));
  const lines = [0, 1, 2, 3].map(b => { const pts = R.map((r, i) => r[b] == null ? null : [X(i), Y(r[b])]).filter(Boolean); if (!pts.length) return '';
    const last = pts[pts.length - 1]; return `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--trb${b})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--trb${b})" stroke="var(--chc)" stroke-width="2"/>`).join('')}<text x="${last[0] + 8}" y="${(labY.get(b) ?? last[1]) + 4}" class="trlab">${TR_BANDS[b]}</text>`; }).join('');
  const xl = wk.map((k, i) => (i === 0 || i === wk.length - 1 || wk.length <= 6) ? `<text x="${X(i)}" y="${h - 6}" class="trax" text-anchor="middle">${npDay(k)}</text>` : '').join('');
  return `<svg class="trline" viewBox="0 0 ${w} ${h}" role="img" aria-label="Share of top-8 teams per Pokémon, week by week, by rating band">${grid}${xl}${lines}</svg>
    <div class="trleg">${TR_BANDS.map((t, b) => `<span><i style="background:var(--trb${b})"></i>Rated ${t}</span>`).join('')}</div>`; }
function trMonRow(m, text) { const p = byName.get(m.n); return `<button type="button" class="trmon" data-lt="${esc(m.n)}">${sprite(p, 'tiny') || ''}<span class="trmb"><b>${esc(p.d)}</b><span>${text}</span></span><span class="trr" style="--tc:${lTier(m.r).c}"${bandAt(m.r)}>${RS(m.r)}</span></button>`; }
function renderTrack() { const el = $('trackOut'); if (!el) return; const T = META.track;
  const head = CH.head('Ratings · checked against later events', 'Track record', 'How right have our ratings been?');
  /* round words 2: three short steps, the full method behind "?" (moved, not cut) */
  const howTip = typeof tipText === 'function' ? ' ' + tipText('trhow', 'How the check works', "Every morning, every rating is saved. An event is played after that. We compare its top 8 with what we'd rated. The ratings couldn't have seen these events, so it's a fair test. Events: online ones with 32+ players and official ones; each uses the newest ratings saved before its day.") : '';
  const how = `<div class="trflow" aria-label="How the check works"><span><b>1</b>Ratings saved each morning</span><span><b>2</b>An event is played</span><span><b>3</b>Its top 8 compared</span></div>
    <p class="t2 wdsub">A fair test: the ratings never saw these events${howTip}</p>`;
  if (!T) { el.innerHTML = head + how + `<div class="trcard trempty"><b>Collecting</b><p>The first results appear here after the next morning's data refresh.</p></div><div class="nprow">${npLink('rating', 'How ratings work')}</div>`; return; }
  const E = T.ev.length, early = E < TR_MIN.verdict, days = Math.max(1, Math.round((Date.parse(T.last + 'T12:00:00Z') - Date.parse(T.since + 'T12:00:00Z')) / 864e5) + 1);
  const stats = `<div class="trstats"><span><b>${npDay(T.since)}</b>tracking since</span><span><b>${days}</b>day${days === 1 ? '' : 's'} of ratings saved</span><span><b>${E}</b>event${E === 1 ? '' : 's'} checked so far</span></div>`;
  let main = '';
  if (!E) main = `<div class="trcard trempty"><b>Collecting</b><p>No event has been played after the first saved ratings yet. The first check appears the morning after one finishes.</p></div>`;
  else { const r = trRates(T.ev), ratio = r[0] && r[3] ? r[0] / r[3] : null;
    main = `<div class="trcard"><div class="chk">Top-8 teams, by the rating we gave</div><div class="trsub">How often each Pokémon was on a top-8 team, on average · ${E} event${E === 1 ? '' : 's'}, ${CH.n(T.ev.reduce((a, e) => a + e.teams, 0))} top-8 teams</div>
      ${early ? `<div class="trearly wdsub"><b>Early:</b> only ${E} event${E === 1 ? "" : "s"} so far${typeof tipText === 'function' ? ' ' + tipText('trearly', 'What early means here', `Only ${E} event${E === 1 ? '' : 's'}. Too few to judge yet, so these numbers will move. A verdict appears after ${TR_MIN.verdict} events.`) : ''}</div>` : ''}
      ${trBars(T)}${!early && ratio && isFinite(ratio) ? `<p class="trverdict">Pokémon we rated ${TR_BANDS[0]} were on top-8 teams <b>${ratio >= 20 ? 'more than 20×' : ratio >= 10 ? Math.round(ratio) + '×' : ratio.toFixed(1) + '×'}</b> as often as Pokémon we rated ${TR_BANDS[3].toLowerCase()}.</p>` : ''}</div>`; }
  // hits and misses: average of the ratings saved before each event
  const ms = T.mons, hits = ms.filter(m => m.r >= 70 && m.c > 0).sort((a, b) => b.c - a.c || b.r - a.r).slice(0, 3);
  const lows = ms.filter(m => m.r < 50 && m.c > 0).sort((a, b) => b.w - a.w || b.c - a.c || a.r - b.r).slice(0, 3);
  const highs = E >= TR_MIN.misses ? ms.filter(m => m.r >= 75 && m.c === 0 && m.ev >= TR_MIN.misses).sort((a, b) => b.r - a.r).slice(0, 3) : [];
  const won = m => m.w ? (m.w === 1 ? `won ${esc(m.best)}` : `won ${m.w} events`) : `on ${m.c} top-8 team${m.c === 1 ? '' : 's'}${m.best ? ` (${esc(m.best)})` : ''}`;
  const hm = E ? `<div class="trhm"><div class="trcard"><div class="chk">Biggest hits</div>${hits.length ? hits.map(m => trMonRow(m, `Rated ${RS(m.r)} · on ${m.c} top-8 team${m.c === 1 ? '' : 's'} in ${m.ev} event${m.ev === 1 ? '' : 's'}${m.w ? ` · won ${m.w === 1 ? esc(m.best) : m.w + ' events'}` : ''}`)).join('') : '<p class="t2">None yet.</p>'}</div>
    <div class="trcard"><div class="chk">Biggest misses</div>${lows.map(m => trMonRow(m, `Rated only ${RS(m.r)} · ${won(m)}`)).join('')}${highs.map(m => trMonRow(m, `Rated ${RS(m.r)} · no top 8 in ${m.ev} events`)).join('')}
      ${!lows.length && !highs.length ? '<p class="t2">None yet.</p>' : ''}${E < TR_MIN.misses ? `<p class="t2">High ratings that miss every top 8 show here after ${TR_MIN.misses} events.</p>` : ''}</div></div>
    <p class="t2">"Rated" is the average of the ratings saved before each event. Tap a Pokémon for its sheet.</p>` : '';
  // over time
  const lines = E ? trLines(T) : null, firstWk = E ? trWeek(T.ev[0].date) : T.since, chartAt = trAdd(firstWk, 7 * (TR_MIN.weeks - 1));
  const time = `<div class="trcard"><div class="chk">Week by week</div>${lines || `<div class="trsoon"><b>From about ${npDay(chartAt)}</b><span>A line for each rating band, once there are ${TR_MIN.weeks} weeks of events.</span></div>`}</div>`;
  // the games check (scoreboard.mjs: a snapshot 14+ days old, 300+ later games)
  const fw = T.fw.length ? T.fw[T.fw.length - 1] : null, fwAt = trAdd(T.since, 14);
  const games = `<div class="trcard"><div class="chk">Games check</div>${fw ? `<p>In <b>${CH.n(fw.games)}</b> tournament games played after a saved rating at least 14 days old, the side whose six had the higher total rating won <b>${Math.round(fw.acc * 100)}%</b> of them (50% would be a coin flip). Checked ${npDay(fw.d)}.</p>`
    : `<div class="trsoon"><b>From about ${npDay(fwAt)}</b><span>Needs ratings saved 14+ days earlier and 300+ games played since.</span></div>`}</div>`;
  const next = [E < TR_MIN.verdict ? `A one-line verdict after ${TR_MIN.verdict} events (${E} so far)` : '', E < TR_MIN.misses ? `High-rated misses after ${TR_MIN.misses} events` : ''].filter(Boolean);
  const evl = E ? CH.fold('trevents', 'Events checked', `${E} event${E === 1 ? '' : 's'}, newest first`, `<ul class="trevs">${T.ev.slice().reverse().slice(0, 60).map(e => `<li><b>${esc(e.name)}</b><span>${npDay(e.date)} · ${e.players} players${e.off ? ' · official' : ''} · ratings from ${npDay(e.snap)}</span></li>`).join('')}</ul>`, false) : '';
  /* Nov 1 (Sim): no games-won percentage on the page, to stay clear of win-odds talk */
  el.innerHTML = head + stats + how + main + hm + time
    + (next.length ? `<div class="trcard"><div class="chk">Coming as the data grows</div><ul class="trnext">${next.map(x => `<li>${x}</li>`).join('')}</ul></div>` : '') + evl
    + `<div class="nprow">${npLink('rating', 'How ratings work')}</div>`; }
