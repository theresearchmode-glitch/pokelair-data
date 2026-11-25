// This Week (#weekly) direction mock-up, Nov 22 (helper hM). MOCK-UP ONLY: injected into the real built page (inside the shared closure, through
// the test hook __ev), drawn with the kit helpers (V2.kPlan/kStep/kCard/kRoster/kMove/kGo/kTag) and the page's OWN data (META.weekly, WK,
// wkDelta, V2.homeWeek, WK.winners, V2.ticket). Nothing invented. Option A (window.WKOPT='A', recommended): "the slope" - every mover is a
// plot bar from last week's share to this week's (the gap is the move). Option B: the movers as roster cards.
(() => { const E = V2.esc, W = META.weekly, A = W.a, B = W.b, nA = A.n, nB = B.n, T = W.th, OPT = window.WKOPT || 'A';
const pc = (x, n) => WK.pc1(x, n), sh = (x, n) => 100 * x / n;
const css = `<style>
.wkm .gs-top{align-items:end}
.wkm .ra-h .k-kicker{display:inline-block;width:auto;justify-self:start;align-self:start}
.wkm-bn .k-tag{justify-self:start}
.wkm-used .k-fact{white-space:nowrap}
.wkm-wn{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:24px 48px;align-items:start}.wkm-wn .wkm-new{grid-template-columns:minmax(0,1fr)}
.wkm-wn .wk-tix{display:grid;gap:12px}
.wkm-wn .wk-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}.wkm .wkm-wn .wk-tile{min-height:108px}.wkm .wkm-wn .wkm-sub{margin-top:0}.wkm .wkm-wn .wk-wx .wkm-sub{margin-top:24px}
.wkm .k-step:first-child .k-sec{margin-top:24px}
.wkm-side{display:grid;gap:8px;justify-items:start}
.wkm-side .k-facts{margin:0}
.wkm-side .k-go{margin-top:12px}
.wkm-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 48px}
.wkm-col{min-width:0}
.wkm-col>.k-tag{margin-bottom:12px}
/* the slope: a plot bar from last week's share to this week's */
.wkm-big{display:grid;grid-template-columns:minmax(0,200px) minmax(0,1fr);gap:24px;align-items:end;margin:28px 0 12px}
.wkm-big .k-plate{min-height:180px;padding-top:88px}
.wkm-bn{display:grid;gap:4px}
.wkm-bn b{font-size:var(--t34);line-height:1;color:var(--k-ink);white-space:nowrap}
.wkm-bn b em{font-style:inherit;color:var(--wkc)}
.wkm-bn>span:last-child{font-size:var(--t15);font-weight:600;color:var(--k-ink2)}
.wkm-rows{list-style:none;margin:0;padding:0;display:grid}
.wkm-r{display:grid;grid-template-columns:40px minmax(0,150px) minmax(0,1fr) 72px;align-items:center;gap:12px;width:100%;min-height:52px;padding:6px 0;border:0;border-top:1px solid var(--k-rule);background:none;color:var(--k-ink);font:inherit;text-align:left;cursor:pointer}
.wkm-r .wkm-nm{display:grid;min-width:0;line-height:1.25}.wkm-r .wkm-nm b{font-size:var(--t15);font-weight:700}.wkm-r .wkm-nm small{font-size:var(--t13);color:var(--k-ink2)}
.wkm-tr{position:relative;display:block;height:14px;transform:skewX(-14deg);background:color-mix(in srgb,var(--k-ink) 7%,transparent)}
.wkm-tr>i{position:absolute;top:0;bottom:0;left:0;background:color-mix(in srgb,var(--k-ink) 28%,transparent)}
.wkm-tr>s{position:absolute;top:0;bottom:0;background:var(--wkc)}
.wkm-tr.dn>s{background:repeating-linear-gradient(90deg,var(--wkc) 0 3px,transparent 3px 6px);box-shadow:inset 0 0 0 2px var(--wkc)}
.wkm-r .wkm-pt{justify-self:end;font-size:var(--t17);color:var(--wkc);white-space:nowrap}
.wkm-up{--wkc:var(--k-plot-text)}.wkm-dn{--wkc:var(--k-nasty-text)}
.wkm-key{display:flex;flex-wrap:wrap;gap:4px 20px;margin:12px 0 0;font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.wkm-key i{display:inline-block;width:20px;height:10px;margin-right:6px;vertical-align:middle;transform:skewX(-14deg)}
/* ratings on the move: one quiet strip */
.wkm-rm{margin-top:24px}
.wkm .k-sec+.wkm-used .wkm-sub{margin-top:0}
.wkm-rm h3{margin:0 0 8px;font-size:var(--t20);line-height:1.2;color:var(--k-ink)}
.wkm-rm ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 24px}
.wkm-rc{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;min-height:52px;padding:4px 0;border:0;border-top:1px solid var(--k-rule);background:none;color:var(--k-ink);font:inherit;text-align:left;cursor:pointer}
.wkm-rc span{display:grid;min-width:0;line-height:1.25}.wkm-rc span b{font-size:var(--t15)}.wkm-rc span small{font-size:var(--t13);color:var(--k-ink2)}
.wkm-rc>b{font-size:var(--t17);color:var(--wkc);white-space:nowrap}
/* option B: movers as roster cards */
.wkm-stack{grid-template-columns:minmax(0,1fr)}
.wkm-b .k-roster{padding-top:48px}
.wkm-b .k-score{color:var(--wkc)}
/* step 2 */
.wkm-sub{margin:28px 0 4px;font-size:var(--t20);line-height:1.2;color:var(--k-ink)}
.wkm-cap{margin:0 0 8px;font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.wkm-tech{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 48px}
.wkm-tech button{display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;padding:8px 0;border:0;border-top:1px solid var(--k-rule);background:none;color:var(--k-ink);font:inherit;text-align:left;cursor:pointer}
.wkm-tech .k-move{min-height:44px}
.wkm-tech .wkm-it{display:grid;grid-template-columns:80px minmax(0,1fr);align-items:center;gap:12px;min-height:44px;padding-right:12px;background:var(--k-card);box-shadow:inset 0 0 0 1px var(--k-rule)}
.wkm-tech .wkm-it>span:first-child{align-self:stretch;display:grid;place-items:center;background:var(--k-chip);color:var(--k-on-chip);font-size:var(--t13);font-weight:800;letter-spacing:.04em;text-transform:uppercase;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)}
.wkm-tech .wkm-it b{font-size:var(--t16)}
.wkm-tw{display:grid;gap:6px;min-width:0;container-type:inline-size}
.wkm-tw p{margin:0;font-size:var(--t13);line-height:1.4;color:var(--k-ink2)}.wkm-tw p b{color:var(--k-ink)}
.wkm-tech .wkm-pt{font-size:var(--t20);color:var(--k-plot-text);white-space:nowrap}
.wkm-new{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
.wkm-new button{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;min-height:52px;padding:6px 0;border:0;border-top:1px solid var(--k-rule);background:none;color:var(--k-ink);font:inherit;text-align:left;cursor:pointer}
.wkm-new span{display:grid;min-width:0;line-height:1.3}.wkm-new span b{font-size:var(--t15)}.wkm-new span small{font-size:var(--t13);color:var(--k-ink2)}
.wkm-win .wk-tix{margin-top:8px}
.wkm .wk-tiles{margin-top:8px}
.wkm .wk-fold{margin-top:32px}
.wkm-x{}
@media (max-width:959.98px){.wkm-wn,.wkm-two,.wkm-tech,.wkm-new{grid-template-columns:minmax(0,1fr)}.wkm-rm ul{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:699.98px){
 .wkm-big{grid-template-columns:132px minmax(0,1fr);gap:16px;margin:32px 0 8px}.wkm-big .k-plate{min-height:0;padding:72px 8px 8px}.wkm-big .k-art{top:-40px;height:112px}.wkm-big .k-name{font-size:var(--t17)}
 .wkm-bn b{font-size:var(--t24)}
 .wkm-r{grid-template-columns:40px minmax(0,1fr) 64px;grid-template-areas:"p n t" "p b b";row-gap:4px}.wkm-r>img,.wkm-r>.np-mon,.wkm-r>:first-child{grid-area:p}.wkm-r .wkm-nm{grid-area:n}.wkm-r .wkm-tr{grid-area:b}.wkm-r .wkm-pt{grid-area:t}
 .wkm-rm ul{grid-template-columns:minmax(0,1fr);gap:0}
 .wkm-used .k-roster .k-fact,.wkm-b .k-roster .k-fact{display:block}
 .wkm-tech #wk-techl:not(.on)>li:nth-child(n+3){display:none}
 .wkm-win .wk-tix>:nth-child(n+2){display:none}
 .wkm-sub{margin-top:28px}
}
</style>`;
const sideA = (L, up) => { if (!L.length) return `<p class="wk-none">${up ? 'No Pokémon rose enough to call it a trend.' : 'No Pokémon dropped enough to call it a trend.'}</p>`;
  const r0 = L[0], a = up ? '▲' : '▼', d0 = wkDelta(r0.xa, nA, r0.xb, nB), top = Math.max(...[...W.up, ...W.down].slice(0, 99).map(r => Math.max(sh(r.xa, nA), sh(r.xb, nB)))) * 1.08;
  const big = `<div class="wkm-big">${V2.kCard(r0.p.n, {attrs: {'data-v2mon': r0.p.n, 'aria-label': `${r0.p.d}: ${up ? 'up' : 'down'} ${d0} points, ${pc(r0.xb, nB)}% to ${pc(r0.xa, nA)}% of teams. Biggest ${up ? 'rise' : 'fall'}. Open its page.`}})}<div class="wkm-bn">${V2.kTag(up ? 'good' : 'bad', `${a} Biggest ${up ? 'rise' : 'fall'}`)}<b class="u">${pc(r0.xb, nB)}% → <em>${pc(r0.xa, nA)}%</em></b><span>of teams · ${a}${d0} points</span></div></div>`;
  const row = r => { const d = wkDelta(r.xa, nA, r.xb, nB), lo = Math.min(sh(r.xa, nA), sh(r.xb, nB)), hi = Math.max(sh(r.xa, nA), sh(r.xb, nB));
    return `<li><button type="button" class="wkm-r" data-v2mon="${E(r.p.n)}" aria-label="${E(r.p.d)}: ${up ? 'up' : 'down'} ${d} points, ${pc(r.xb, nB)}% to ${pc(r.xa, nA)}% of teams. Open its page.">${V2.mon(r.p.n, {iw: 40, bare: true})}<span class="wkm-nm"><b>${E(r.p.d)}</b><small>${pc(r.xb, nB)}% → ${pc(r.xa, nA)}%</small></span><i class="wkm-tr ${up ? 'up' : 'dn'}" aria-hidden="true"><i style="width:${(100 * lo / top).toFixed(1)}%"></i><s style="left:${(100 * lo / top).toFixed(1)}%;width:${(100 * (hi - lo) / top).toFixed(1)}%"></s></i><b class="wkm-pt u">${a}${d}</b></button></li>`; };
  return `${big}<ul class="wkm-rows">${L.slice(1, 4).map(row).join('')}</ul>`; };
const sideB = (L, up) => { const a = up ? '▲' : '▼';
  return `<div class="wkm-b">${V2.kTag(up ? 'good' : 'bad', up ? 'Rising' : 'Falling')}${V2.kRoster(L.slice(0, 4).map((r, i) => V2.kCard(r.p.n, {score: `${a}${wkDelta(r.xa, nA, r.xb, nB)}`, tier: 'points', fact: `${pc(r.xb, nB)}% → ${pc(r.xa, nA)}% of teams`, attrs: {'data-v2mon': r.p.n}})))}</div>`; };
const moves = OPT === 'B' ? `<div class="wkm-two wkm-stack"><div class="wkm-col wkm-up">${sideB(W.up, true)}</div><div class="wkm-col wkm-dn">${sideB(W.down, false)}</div></div>`
  : `<div class="wkm-two"><div class="wkm-col wkm-up">${sideA(W.up, true)}</div><div class="wkm-col wkm-dn">${sideA(W.down, false)}</div></div><p class="wkm-key"><span><i style="background:color-mix(in srgb,var(--k-ink) 28%,transparent)"></i>share both weeks</span><span><i style="background:var(--k-plot)"></i>gained this week</span><span><i style="background:repeating-linear-gradient(90deg,var(--k-nasty) 0 3px,transparent 3px 6px);box-shadow:inset 0 0 0 2px var(--k-nasty)"></i>lost this week</span></p>`;
const HW = V2.homeWeek(12);
const rates = HW.length ? `<section class="wkm-rm"><h3 class="u">Our ratings moved too.</h3><ul>${HW.map(w => { const up = w.d > 0, n = Math.abs(w.d);
  return `<li class="${up ? 'wkm-up' : 'wkm-dn'}"><button type="button" class="wkm-rc" data-v2mon="${E(w.n)}" aria-label="${E(V2.disp(w.n))} ${up ? 'up' : 'down'} ${n} points this week, rating ${w.r}">${V2.mon(w.n, {iw: 40, bare: true})}<span><b>${E(V2.disp(w.n))}</b><small>Rating ${w.r}</small></span><b class="u">${up ? '▲' : '▼'}${n}</b></button></li>`; }).join('')}</ul></section>` : '';
const step1 = V2.kStep(1, 'Who’s on the move.', 'share of tournament teams, last week → this week', (W.enough ? moves : `<p class="wk-none">Not enough teams to compare this week (each week needs ${T.teams}+).</p>`) + rates);
// step 2: the most used (a roster of six), new tech (move tickets), new faces in top cut
const top6 = W.top.slice(0, 6);
const used = `<h3 class="wkm-sub u">Most used this week</h3>${V2.kRoster(top6.map((r, i) => V2.kCard(r.p.n, {fact: `${pc(r.xa, nA)}% of teams · #${i + 1}`, attrs: {'data-v2mon': r.p.n}})))}`;
const techL = W.tech.slice(0, 4);
const techRow = t => { const d = wkDelta(t.xa, t.ma, t.xb, t.mb), kw = KIND[t.k].w;
  const tk = t.k === 'm' ? V2.kMove(t.o, {plain: true}) : `<span class="wkm-it"><span>${E(kw)}</span><b>${E(t.o)}</b></span>`;
  return `<li><button type="button" class="wk-tr" data-v2mon="${E(t.p.n)}" aria-label="${kw}: ${E(t.o)}, on ${E(t.p.d)}: up ${d} points">${V2.mon(t.p.n, {iw: 48, bare: true})}<span class="wkm-tw">${tk}<p><b>${E(t.p.d)}</b> · ${pc(t.xb, t.mb)}% → ${pc(t.xa, t.ma)}% of its teams (${CH.n(t.ma)} teams this week, ${CH.n(t.mb)} the week before)</p></span><b class="wkm-pt u">▲${d}</b></button></li>`; };
const tech = `<h3 class="wkm-sub u">New tech${V2.wkTip('wktech', 'What counts as new tech', `An item, move or ability that jumped on one Pokémon (${T.monTeams}+ of its teams each week).`)}</h3><p class="wkm-cap">Rising items, moves and Abilities, per Pokémon · points of its own teams</p>
  ${W.tech.length ? `<ul id="wk-techl" class="wkm-tech">${techL.map(techRow).join('')}</ul>${techL.length > 2 ? `<div class="wkm-ph">${V2.wkTechBtn(techL.length, false)}</div>` : ''}` : '<p class="wk-none">No item, move or ability jumped enough on any Pokémon this week.</p>'}`;
const fresh = `<h3 class="wkm-sub u">New in top cut${V2.wkTip('wkfresh', 'What counts as new in top cut', `First time in a top ${T.cut} this regulation (online tournaments with ${T.cutPlayers}+ players and official events).`)}</h3><p class="wkm-cap">First top ${T.cut} this regulation</p>
  <ul class="wkm-new">${W.fresh.slice(0, 4).map(f => `<li><button type="button" class="wk-fr" data-v2mon="${E(f.p.n)}" aria-label="${E(f.p.d)}: #${f.pl}, ${E(V2.evTitle(f.ev))}. Open its page.">${V2.mon(f.p.n, {iw: 40, bare: true})}<span><b>${f.kind === 's' ? E(f.i) + ' ' : ''}${E(f.p.d)}</b><small>#${f.pl} · ${E(V2.evTitle(f.ev))}${f.players ? ` · ${CH.n(f.players)} players` : ''}</small></span>${V2.kTag('neutral', 'New')}</button></li>`).join('')}</ul>`;
const step2 = V2.kStep(2, 'What the crews are packing.', 'the most used, and the new tech', `<div class="wkm-used">${used}</div><section class="wk-tech">${tech}</section>`);
// step 3: the winners (the Events ticket) and the weather (the Archetypes scenes), then how we decide
const ws = WK.winners(W), upS = new Set(W.sty.up.map(s => s.k)), dnS = new Set(W.sty.down.map(s => s.k));
const win = `<section class="wk-win wkm-win"><h3 class="wkm-sub u">Winners this week</h3><div class="wk-tix">${ws.map(e => V2.ticket(e)).join('')}</div></section>`;
const wx = `<section class="wk-wx"><h3 class="wkm-sub u">The weather${V2.wkTip('wksty', 'What the team styles count', '% of teams with a Trick Room or Tailwind user, or a weather or terrain setter. Arrows only on real changes.')}</h3><p class="wkm-cap">Team styles: % of this week’s tournament teams using each style</p><ul class="wk-tiles" style="--n:${W.styAll.length}">${W.styAll.map(s => { const c = upS.has(s.k) ? 'up' : dnS.has(s.k) ? 'dn' : '', nm = WK.styName(s.k), p = pc(s.xa, nA);
  return `<li class="wk-tile ${V2.arScene(s.k)}${c ? ' ch' : ''}" aria-label="${E(nm)}: ${p}% of teams"><b class="u">${E(nm)}</b><span class="u">${p}%</span>${c ? `<i class="wk-chg ${c}"><b>${c === 'up' ? '▲' : '▼'} ${wkDelta(s.xa, nA, s.xb, nB)} points</b>from ${pc(s.xb, nB)}%</i>` : ''}</li>`; }).join('')}</ul></section>`;
const fold = `<details class="wk-fold"><summary>How We Decide What Changed</summary><p>We compare the share of full teams at standard Reg M-C tournaments on Limitless (whole fields; themed and restricted cups left out) in the last 7 days against the 7 days before. A change is shown only when: each week has ${T.teams}+ teams; it moved at least ${T.pts} points (${T.techPts} for an item, move or ability, counted among that Pokémon's own teams, with ${T.monTeams}+ of them each week and ${T.techMin}+ using it); a two-proportion test puts it ${T.z}+ standard errors from no change; and it still holds with the single event that pushes it most left out, so one big event can't make a trend. Everything else is treated as noise.</p></details>`;
const step3 = V2.kStep(3, 'Who won, and how.', 'winners, new faces in top cut, the weather', `<div class="wkm-wn">${win}<div><section class="wk-new">${fresh}</section>${wx}</div></div>` + fold, {link: {label: 'All of this week’s winners on Events', attrs: {href: '#events', class: 'k-link wk-evall'}}});
const tabs = V2.tourTabs('weekly');
const head = `<section class="ra-h"><p class="k-kicker np-eyebrow">META · THE BRIEFING</p><h1 class="k-h1 u">This week, <em>who moved.</em></h1>
  <p class="k-lead ra-lede">Tournament teams, ${WK.range(A)} against ${WK.range(B)}: what rose, what fell, and who won.</p>${tabs}</section>`;
const side = `<div class="ra-spotw wkm-side">${V2.kFacts([[CH.n(nA), `teams, ${WK.range(A)}`, true], [String(A.ev), 'events'], [CH.n(nB), `teams the week before · ${B.ev} events`]])}${V2.kGo('SHARE THIS WEEK.', {'data-wkshare': true})}</div>`;
document.querySelector('#main').innerHTML = css + `<div class="ra gsp wk wkm"><div class="gs-top">${head}${side}${tabs}</div><div class="gs-body">${V2.kPlan(step1 + step2 + step3)}</div></div>`;
scrollTo(0, 0); })();
