// Track Record (#track) direction mock-up, Nov 22 (helper hM). Call: "HH's track2 mock" (origin/claude/cohesion-mocks track2.html, picture
// docs/rebuild/pics/nov21/cohesion/v2-2-track-1440.png) on the kit, with real data, and HYBRID's fix for the CALLED IT tag wrap. MOCK-UP ONLY:
// injected into the real built page (test hook __ev). Today's own pieces are reused as they are (V2.pages.track.draw() drawn into a scratch box;
// the receipt, Week by Week and Events Checked are moved over, so their classes, the "?" tips and cc2.chf.trevents stay). The calls use the
// same picks and lines as today (T.mons), drawn as the kit's roster cards. track2's "Show me [all events] [official only]" is NOT drawn: today's
// page has no such filter and it would be a new feature (Sim's call).
(() => { const E = V2.esc, T = META.track, tmp = document.createElement('div'); tmp.innerHTML = V2.pages.track.draw(); const pick = s => { const n = tmp.querySelector(s); return n ? n.outerHTML : ''; };
const n = T.ev.length, early = n < TR_MIN.verdict, days = Math.max(1, Math.round((Date.parse(T.last + 'T12:00:00Z') - Date.parse(T.since + 'T12:00:00Z')) / 864e5) + 1), top8 = T.ev.reduce((a, e) => a + e.teams, 0);
const r = trRates(T.ev), ratio = r[0] && r[3] ? r[0] / r[3] : null, big = !early && ratio && isFinite(ratio), x = big ? (ratio >= 100 ? Math.round(ratio / 10) * 10 + '×' : ratio >= 10 ? Math.round(ratio) + '×' : ratio.toFixed(1) + '×') : '';
const css = `<style>
.tkm .k-head .k-kicker{display:table;width:max-content}
.tkm .k-facts{margin-top:20px}
.tkm-r1{display:grid;grid-template-columns:minmax(0,520px) minmax(0,1fr);gap:40px 56px;align-items:center}
.tkm .trk-rc{margin:0}
.tkm-say{display:grid;gap:16px;justify-items:start}
.tkm-big{display:inline-block;padding:4px 20px;border:4px solid var(--k-nasty);color:var(--k-nasty-text);font-size:var(--d-kgo,44px);line-height:1.1;transform:rotate(-4deg)}
.tkm-say p{margin:0;max-width:440px;font-size:var(--t17);line-height:1.5;color:var(--k-ink2)}.tkm-say p b{color:var(--k-ink)}
.tkm-say .k-go{margin-top:4px}
.tkm-calls .k-roster>li{display:grid;grid-template-rows:1fr auto;gap:12px;justify-items:start}.tkm-calls .k-card{width:100%;align-self:end}
.tkm-calls .k-fact{white-space:normal}
.tkm-calls .k-tier{text-transform:none}
.tkm-cap{margin:12px 0 0;font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.tkm-flow{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.tkm-flow li{display:grid;grid-template-columns:36px minmax(0,1fr);align-items:center;gap:12px;min-height:56px;padding:8px 16px;background:var(--k-card);font-size:var(--t16);font-weight:600;color:var(--k-ink);clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%)}
.tkm-flow b{display:grid;place-items:center;width:32px;height:28px;background:var(--k-plot);color:var(--k-on-plot);font-size:var(--t15);transform:skewX(-10deg)}
.tkm .trk-wk h2{display:none}.tkm .trk-wk{margin-top:20px}
.tkm .trk-evs{margin-top:16px}
@media (max-width:959.98px){.tkm-r1{grid-template-columns:minmax(0,1fr)}.tkm .trk-rc{max-width:520px}}
@media (max-width:699.98px){.tkm-flow{grid-template-columns:minmax(0,1fr);gap:8px}.tkm-flow li{min-height:48px}.tkm-big{font-size:var(--t22);white-space:nowrap}.tkm-say p{display:none}.tkm-say{grid-template-columns:auto;gap:8px}.tkm-say p{font-size:var(--t15)}
 .tkm-calls .k-roster{grid-template-columns:repeat(3,minmax(0,1fr))}.tkm-calls .k-roster .k-fact{display:block;font-size:var(--t13)}.tkm-calls .k-tag{font-size:var(--t13);padding:2px 8px}}
</style>`;
const head = `<div class="k-head"><p class="k-kicker">META · THE RECEIPTS</p><h1 class="k-h1 u">We <em>called it.</em><br>Check the receipts.</h1>
  <p class="k-lead">Each morning's ratings are saved, then checked against events they never saw. ${n} event${n === 1 ? '' : 's'} since ${E(evDate(T.since))}, ${CH.n(top8)} top-8 teams.</p>
  ${V2.kFacts([[evDate(T.since), 'tracking since'], [String(days), `day${days === 1 ? '' : 's'} of ratings saved`], [String(n), `event${n === 1 ? '' : 's'} checked so far`, true]])}</div>`;
const says = big ? `Pokémon we rated ${TR_BANDS[0]} were on top-8 teams <b>${ratio >= 10 ? 'about ' + x : x}</b> as often as Pokémon we rated ${TR_BANDS[3].toLowerCase()}.` : '';
const s1 = V2.kStep(1, 'The receipt.', 'how often each Pokémon made a top 8, by the rating we gave', `<div class="tkm-r1">${pick('.trk-rc')}<div class="tkm-say">${big ? `<span class="tkm-big u" aria-hidden="true">${x} more top 8s</span><p>The ratings called the top 8s before the events were played.</p>` : `<p>A one-line verdict after ${TR_MIN.verdict} events (${n} so far).</p>`}${V2.kGo('SEE HOW WE RATE.', {href: '#method=rating'})}</div></div>`);
// the calls: today's picks and lines (track.js), as roster cards; the verdict tag under each card (never on top of a name: no wrap)
const ms = T.mons, hits = ms.filter(m => m.r >= 70 && m.c > 0).sort((a, b) => b.c - a.c || b.r - a.r).slice(0, 3);
const lows = ms.filter(m => m.r < 50 && m.c > 0).sort((a, b) => b.w - a.w || b.c - a.c || a.r - b.r).slice(0, 3);
const highs = n >= TR_MIN.misses ? ms.filter(m => m.r >= 75 && m.c === 0 && m.ev >= TR_MIN.misses).sort((a, b) => b.r - a.r).slice(0, 3) : [];
const won = m => m.w ? (m.w === 1 ? `won ${V2.evTitle(m.best)}` : `won ${m.w} events`) : `on ${m.c} top-8 team${m.c === 1 ? '' : 's'}`;
const card = (m, hit, fact, said = fact) => { const p = byName.get(m.n); if (!p) return ''; return V2.kCard(m.n, {score: RS(m.r), tier: 'rated', fact, attrs: {'data-v2mon': m.n, class: `trk-slip ${hit ? 'hit' : 'miss'}`, 'aria-label': `${p.d}, rated ${RS(m.r)}, ${said}. ${hit ? 'Called it' : 'Missed'}.`}}) + V2.kTag(hit ? 'good' : 'bad', hit ? 'CALLED IT' : 'MISSED'); };
const cards = [...hits.map(m => card(m, true, `${m.c} top 8s · ${m.w ? 'won ' + m.w : 'no wins'}`)), ...[...lows.map(m => [m, won(m)]), ...highs.map(m => [m, `no top 8 in ${m.ev} events`])].map(([m, t]) => card(m, false, m.w ? `won ${m.w} event${m.w === 1 ? '' : 's'}` : t.replace(/^(on \d+ top-8 teams?).*/, '$1'), t))].filter(Boolean);
const s2 = V2.kStep(2, 'The calls.', 'three we called, three we missed', `<div class="tkm-calls trk-calls">${V2.kRoster(cards)}<p class="tkm-cap">"Rated" is the average of the ratings saved before each event. Tap a Pokémon for its page.</p></div>`);
const tip = V2.wkTip('trhow', 'How the check works', "Every morning, every rating is saved. An event is played after that. We compare its top 8 with what we'd rated. The ratings couldn't have seen these events, so it's a fair test. Events: online ones with 32+ players and official ones; each uses the newest ratings saved before its day.");
const s3 = V2.kStep(3, 'How we check.', 'a fair test: the ratings never saw these events', `<ol class="tkm-flow trk-how"><li><b class="u">1</b>Ratings saved each morning</li><li><b class="u">2</b>An event is played</li><li><b class="u">3</b>Its top 8 compared</li></ol><p class="tkm-cap">How the check works ${tip}</p>${pick('.trk-wk')}${pick('.trk-next')}${pick('.trk-evs')}`);
document.querySelector('#main').innerHTML = css + `<div class="ra gsp trk tkm">${head}${V2.kPlan(s1 + s2 + s3)}</div>`; scrollTo(0, 0); })();
