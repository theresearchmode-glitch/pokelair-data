// How We Calculate (#method) direction mock-up, Nov 22 (helper hM). PAGES.md idea: "SHOW OUR WORK", the plotter's notebook. MOCK-UP ONLY:
// injected into the real built page (test hook __ev). Today's ten parts are moved over as they are (their <details class="inf-tile">, the
// working inside, data-mth, '#method=<key>' and the cc2.chf.np_<key> memory all stay); the new parts are the kit head, ONE visual key
// (the 0-100 scale as a slanted plot bar in the tier colours, the Strength Score bands under it), and the Track Record as the page's pink move.
// window.MTOPT: 'A' = the four groups are the plan's steps (Your team / Pokémon / Tools / The data);
//               'B' (recommended) = one step, the ten parts in one grid as today (shorter; no lone tiles).
(() => { const E = V2.esc, OPT = window.MTOPT || 'A', tmp = document.createElement('div'); tmp.innerHTML = V2.pages.method.draw();
const tile = k => { const d = tmp.querySelector(`.inf-tile[data-mth="${k}"]`); return d ? d.outerHTML : ''; };
const teams = typeof RES !== 'undefined' && RES && RES.teams, g = META.model && META.model.games, fr = typeof npFresh === 'function' ? npFresh() : '', T = META.track;
const css = `<style>
.mtm .k-head .k-kicker{display:table;width:max-content}
.mtm-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,480px);gap:24px 56px;align-items:center}
.mtm-key{display:grid;gap:12px;padding:20px 24px;background:var(--k-card);box-shadow:inset 4px 0 0 var(--k-plot),0 6px 18px var(--k-card-shadow)}
.mtm-key h2{margin:0;font-size:var(--t20);line-height:1.2;color:var(--k-ink)}.mtm-key p{margin:0;font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.mtm-scale{display:grid;grid-template-columns:50fr 10fr 10fr 10fr 10fr 10fr;height:40px;transform:skewX(-14deg);margin:0 8px}
.mtm-scale i{display:grid;place-items:center;background:var(--c);color:#fff;font:800 italic var(--t17)/1 var(--u);font-synthesis:style}.mtm-scale i span{transform:skewX(14deg)}
.mtm-ax{position:relative;height:18px;margin:0 8px;font-size:var(--t13);font-weight:700;color:var(--k-ink2)}.mtm-ax span{position:absolute;transform:translateX(-50%)}.mtm-ax span:first-child{transform:none}.mtm-ax span:last-child{transform:translateX(-100%)}
.mtm-bands{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:var(--t13);font-weight:600;color:var(--k-ink2)}.mtm-bands b{font-weight:800}
.mtm .k-facts{margin-top:20px}
.mtm .inf-tiles{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:12px;margin:0}
.mtm .inf-tile{min-width:0}
.mtm .inf-tile[open]{grid-column:1/-1}
.mtm-read{margin:24px 0 0}.mtm-read summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:var(--t15);font-weight:700;color:var(--k-plot-text)}
.mtm .inf-legend{margin:0;padding:0;background:none}.mtm .inf-legend .chk,.mtm .inf-legend .nplrow{display:none}.mtm .npdots{margin:4px 0 0;padding:0 0 0 16px;font-size:var(--t13);line-height:1.5;color:var(--k-ink2)}.mtm .npdots b{color:var(--k-ink)}
.mtm .k-h1{font-size:var(--d64)}.mtm .inf-legend>:first-child,.mtm .inf-legend .nplegend>:first-child{}
.mtm-go{display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px}.mtm-go p{margin:0;font-size:var(--t15);color:var(--k-ink2)}
@media (max-width:959.98px){.mtm-top{grid-template-columns:minmax(0,1fr)}.mtm .inf-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:699.98px){.mtm .inf-tiles{grid-template-columns:minmax(0,1fr);gap:6px}.mtm .k-h1{font-size:var(--t34)}.mtm-ax span:last-child{display:none}.mtm .inf-tile summary>span{display:none}.mtm .k-facts b{font-size:var(--t20)}.mtm-key{padding:16px}.mtm-scale{height:32px}.mtm-scale i{font-size:var(--t15)}}
</style>`;
const fine0 = tmp.querySelector('.inf-legend'), fine = fine0 ? fine0.outerHTML : '';
const tiers = [['F', 'f', 'under 50'], ['D', 'd', '50s'], ['C', 'c', '60s'], ['B', 'b', '70s'], ['A', 'a', '80s'], ['S', 's', '90+']];
const key = `<aside class="mtm-key" aria-label="How to read our numbers"><h2 class="u">How to read our numbers</h2>
  <div class="mtm-scale" role="img" aria-label="Pokémon ratings, 0 to 100: F under 50, D 50s, C 60s, B 70s, A 80s, S 90 and up">${tiers.map(([k, c]) => `<i style="--c:var(--tier-${c})"><span>${k}</span></i>`).join('')}</div>
  <p class="mtm-ax" aria-hidden="true">${[0, 50, 60, 70, 80, 90, 100].map(v => `<span style="left:${v}%">${v}</span>`).join('')}</p>
  <p class="mtm-bands"><span><b>Strength Score</b>, out of 100:</span><span><b style="color:var(--band-top)">90+</b> Top tier</span><span><b style="color:var(--band-ready)">80s</b> Tournament ready</span><span><b style="color:var(--band-solid)">70s</b> Solid</span><span><b style="color:var(--band-work-text)">60s</b> Needs work</span><span><b style="color:var(--band-miss)">under 60</b> Missing a basic</span></p>${fine}</aside>`;
const facts = V2.kFacts([...(teams ? [[homeNum(teams), 'tournament teams', true]] : []), ...(g ? [[homeNum(g), 'games in the team model']] : []), ...(fr ? [[fr.replace(/^updated /i, ''), 'last update']] : [])]);
const head = `<div class="mtm-top"><div class="k-head"><p class="k-kicker">META · SHOW OUR WORK</p><h1 class="k-h1 u">Every number,<br><em>and where it comes from.</em></h1><p class="k-lead">How NastyPlot works out each score, rating and calc, in plain words. Reg M‑C doubles; real results and real damage calcs.</p>${facts}</div>${key}</div>`;
// the rest of today's legend (bars, #20 of 321, likely 80-88, %), one tap away: it is the fine print of the key above
const legend = '';
const trk = T && T.ev ? `Tracking since ${npDay(T.since)} · ${T.ev.length} event${T.ev.length === 1 ? '' : 's'} checked` : 'Every rating is saved daily and checked against later events';
const go = `<div class="mtm-go">${V2.kGo('CHECK THE RECEIPTS.', {href: '#track', class: 'k-go u inf-track'})}<p>How right have our ratings been? ${E(trk)}.</p></div>`;
const groups = V2.MTH, note = {"Your team": 'what My Team shows you', 'Pokémon': 'ratings, usage, sets', 'Tools': 'the calc, speed and the builders', 'The data': 'what we keep and how fresh it is'};
const step = (n, grp, L, extra = '') => V2.kStep(n, grp + '.', note[grp] || '', `<div class="inf-tiles" style="--n:${L.length}">${L.map(([k]) => tile(k)).join('')}</div>${extra}`);
const body = OPT === 'B' ? V2.kStep(1, 'Ten parts.', 'tap one for the working', `<div class="inf-tiles" style="--n:5">${groups.flatMap(([, L]) => L.map(([k]) => tile(k))).join('')}</div>${legend}`) + V2.kStep(2, 'Check the receipts.', 'every rating, checked later', go)
  : groups.map(([grp, L], i) => step(i + 1, grp, L, i === groups.length - 1 ? `<div style="margin-top:28px">${go}</div>` : i === 0 ? legend : '')).join('');
document.querySelector('#main').innerHTML = css + `<div class="ra gsp infp mtm">${head}${V2.kPlan(body)}</div>`; scrollTo(0, 0); })();
