// Ratings (#meta) direction mock-up, Nov 22 (helper hM; Sim's TOP PRIORITY: "we need to see pokemon rankings clearly"). MOCK-UP ONLY: injected into
// the real built page (inside the shared closure, through the test hook __ev). Today's own pieces are reused as they are (V2.pages.meta.draw()
// is drawn into a scratch box and its search, Types grid, Jump-to bar, Grandstand/List switch, Grandstand, legend and About are moved over, so
// every data-* hook, id and test class stays); the new parts use the kit and the shared logic (lairRows, lairRank, lTier, RS, V2.raNums, winFmt).
// window.RAOPT: 'A' (recommended) = the scoreboard: the Top 10 beside the headline, the first thing on the page.
//               'B' = the podium: #1 as the hero card, #2 and #3 as cards, #4 to #10 as rows, under the headline.
(() => { const E = V2.esc, U = V2.raUi, OPT = window.RAOPT || 'A'; V2.raLoad();
const tmp = document.createElement('div'); tmp.innerHTML = V2.pages.meta.draw(); const pick = s => { const n = tmp.querySelector(s); return n ? n.outerHTML : ''; };
const all = lairRows(), megas = !!U.f.mega, pool = megas ? all.filter(x => x.p.m) : U.f.nomega ? all.filter(x => !x.p.m) : all, top = pool.slice(0, 10);
const tierOf = x => lTier(x.r.total), reg = ((typeof regInfo === 'function' && regInfo()) || {id: 'M-C'}).id.replace('-', '‑'), teams = RES && +RES.teams > 0 ? +RES.teams : 0;
const css = `<style>
.ram .gs-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,600px);gap:24px 48px;align-items:start}
.ram .ra-h{min-width:0}.ram .ra-h .k-kicker{display:table;width:max-content}
.ram .ra-kick{margin:16px 0 0;font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.ram .ra-links{display:flex;gap:24px;margin:4px 0 0}
.ram-board{min-width:0;margin-top:28px}
.ram-bh{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 4px}
.ram-bh h2{margin:0;font-size:var(--t28);line-height:1.1;color:var(--k-ink)}.ram-bh span{font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.ram-list{list-style:none;margin:0;padding:0}
.ram-r{display:grid;grid-template-columns:40px 44px minmax(0,1fr) minmax(0,120px) 52px 64px;align-items:center;gap:10px;width:100%;min-height:46px;padding:1px 0;border:0;border-top:1px solid var(--k-rule);background:none;color:var(--k-ink);font:inherit;text-align:left;cursor:pointer}
.ram-r:hover{background:color-mix(in srgb,var(--k-plot) 6%,transparent)}
.ram-rk{font-size:var(--t26);line-height:1;color:var(--k-ink);text-align:right}
.ram-r .np-mon{--iw:44px}
.ram-nm{display:grid;min-width:0;line-height:1.2}.ram-nm b{font-size:var(--t16);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:clip}
.ram-nm small{display:flex;gap:4px;flex-wrap:wrap;margin-top:2px}
.ram-bar{display:block;height:10px;transform:skewX(-14deg);background:color-mix(in srgb,var(--k-ink) 8%,transparent)}.ram-bar>i{display:block;height:100%;background:var(--k-plot)}
.ram-sc{font-size:var(--t28);line-height:1;color:var(--k-plot-text);text-align:right}
.ram-tier{justify-self:start;display:inline-block;min-width:56px;padding:0 8px;border:2px solid var(--tc);border-left-width:8px;color:var(--k-ink);font-size:var(--t13);font-weight:800;font-style:italic;text-align:center;white-space:nowrap;transform:skewX(-8deg)}
.ram-r.one .ram-rk{color:var(--k-nasty-text)}
.ram-mv{font-style:normal;font-size:var(--t13);font-weight:700}.ram-mv.up{color:var(--k-plot-text)}.ram-mv.dn{color:var(--k-nasty-text)}
/* the spotlight: #1 by default; on a mouse screen the Pokémon under the pointer steps up here (data-raspotw, today's hover) */
.ram-spot{display:grid;grid-template-columns:112px minmax(0,1fr);gap:4px 20px;align-items:center;margin-top:24px;padding:16px 20px;background:var(--k-card);box-shadow:inset 4px 0 0 var(--k-nasty),0 6px 18px var(--k-card-shadow)}
.ram-spot .np-mon{--iw:112px;grid-row:1/4}
.ram .ram-spot .gs-tag{display:block;width:auto;padding:0;background:none;transform:none;margin:0;font-size:var(--t13);font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--k-nasty-text)}
.ram-spot h2{margin:0;font-size:var(--t28);line-height:1.1;color:var(--k-ink)}
.ram-spot .gs-facts{display:flex;flex-wrap:wrap;gap:4px 24px;margin:4px 0 0}.ram-spot .gs-facts p{display:grid;margin:0}.ram-spot .gs-facts span{font-size:var(--t13);font-weight:600;color:var(--k-ink2)}.ram-spot .gs-facts b{font-size:var(--t22);line-height:1.1;color:var(--k-ink)}
.ram-spot .gs-facts p:first-child b{color:var(--k-plot-text)}
.ram-acts{display:flex;flex-wrap:wrap;align-items:center;gap:4px 20px;grid-column:1/-1}.ram-acts .k-go{margin:8px 0 0;font-size:var(--t22)}
/* option B: the podium */
.ram-pod{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr);gap:24px;align-items:end;margin-top:120px}
.ram-pod .k-card.k-hero-c .k-plate{min-height:280px}
.ram-pod-side{display:grid;gap:16px}
.ram-rest{margin-top:24px;columns:2;column-gap:48px}.ram-rest li{break-inside:avoid}
.ram-b-sp .ram-spot{margin-top:40px}
/* the controls and tiers step */
.ram .gs-ctl{margin:0 0 8px}
.ram .gs-ctl .k-sent{margin-top:12px;font-size:var(--t24)}.ram .gs-ctl .k-w{min-height:44px;padding:0 12px}
.ram .ra-tbar .k-sent{font-size:var(--t24);margin:0}.ram .ra-tbar{margin:12px 0}.ram .ra-tbar .k-w{min-height:44px}
.ram-tb{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 24px}.ram-tb .gs-view{margin:0}.ram-lph{display:none}
.ram .k-step:first-child .k-sec{margin-top:32px}

@media (max-width:1099.98px){.ram .gs-top{grid-template-columns:minmax(0,1fr)}.ram-board{margin-top:8px}.ram-pod{grid-template-columns:repeat(2,minmax(0,1fr))}.ram-pod>:first-child{grid-column:1/-1}}
@media (max-width:699.98px){
 .ram-A .ram-list{columns:2;column-gap:12px}.ram-list li{break-inside:avoid}
 .ram-r{grid-template-columns:18px 28px minmax(0,1fr) 30px;gap:4px;min-height:46px}.ram-r .ram-bar,.ram-r .ram-tier{display:none}.ram-r .np-mon{--iw:28px}.ram-nm b{font-size:var(--t13)!important;line-height:1.2;overflow:visible}.ram-rk{font-size:var(--t15)}.ram-sc{font-size:var(--t17)}.ram-mv{display:none}
 .ram-nm small{display:none}.ram-nm b{font-size:var(--t15);white-space:normal}
 .ram-spot{grid-template-columns:72px minmax(0,1fr);padding:12px;gap:4px 12px}.ram-spot .np-mon{--iw:72px}.ram-spot h2{font-size:var(--t22)}.ram-spot .gs-facts b{font-size:var(--t17)}
 .ram-acts{gap:0 16px}.ram-acts .k-go{margin-top:4px;padding:10px 16px;font-size:var(--t17)}.ram .gs-ctl .k-sent,.ram .ra-tbar .k-sent{font-size:var(--t15);gap:6px}.ram .gs-ctl .k-w,.ram .ra-tbar .k-w{padding:0 8px}
 .ram .ra-find{display:flex;align-items:center;gap:12px}.ram .ra-find .ra-q{flex:1;min-width:0}.ram .ra-find .ra-count{margin:0;white-space:nowrap}
 .ram-spot .gs-facts{gap:2px 16px}.ram-spot .gs-facts b{font-size:var(--t15)!important}.ram-acts .k-go{display:inline-block;width:auto}
 .ram .ra-h .k-lead{font-size:var(--t15)}
 .ram .k-step:first-child .k-sec{margin-top:16px}.ram-bh{margin-top:4px}
 .ram .ra-h .ra-links{display:none}.ram .ra-spotw{margin:0;padding:0}.ram-A .gs-top{gap:12px}.ram-acts .k-link{display:none}.ram-lph{display:flex!important;gap:24px}.ram-A .gs-top{display:flex;flex-direction:column}.ram-A .gs-top>div:first-child{display:contents}.ram-A .ra-h{order:1}.ram-A .ram-board{order:2;margin-top:4px}.ram-A .ra-spotw{order:3}.ram-spot{margin-top:16px}.ram-acts .k-go{font-size:var(--t15)}.ram-bh span{display:none}
 .ram .k-step:last-child .k-sec,.ram .k-step:last-child .k-n{display:none}.ram .k-step:last-child{margin-top:16px}.ram .ra-links{margin-top:0}.ram .ra-kick{margin-top:8px}
 .ram-pod{margin-top:96px;gap:72px 8px}.ram-rest{columns:1}
 .ram-bh h2{font-size:var(--t24)}
}
</style>`;
const wk = V2.gsWeek();
const row = (x, i) => { const p = x.p, k = lairRank(p), T = tierOf(x), N = V2.raNums(p), sc = RS(x.r.total), mv = wk.get(p.n) || 0, rank = megas || U.f.nomega ? i + 1 : k ? k.rank : i + 1;
  return `<li><button type="button" class="ram-r${i === 0 ? ' one' : ''}" data-v2mon="${E(p.n)}" data-raspot="${E(p.n)}" aria-label="Number ${rank}: ${E(p.d)}, rated ${sc}, ${T.k} tier${N.u != null ? ', on ' + E(V2.raPct(N.u)) + ' of teams' : ''}: open its page"><b class="ram-rk u" aria-hidden="true">${rank}</b>${V2.mon(p.n, {bare: true, iw: 44})}<span class="ram-nm" aria-hidden="true"><b>${E(p.d).replace(/ (\S)$/, "\u00a0$1")}</b></span><i class="ram-bar" aria-hidden="true"><i style="width:${sc}%"></i></i><b class="ram-sc u" aria-hidden="true">${sc}${mv ? ` <i class="ram-mv ${mv > 0 ? 'up' : 'dn'}">${mv > 0 ? '▲' : '▼'}${Math.abs(mv)}</i>` : ''}</b><span class="ram-tier u" style="--tc:var(--tier-${T.k.toLowerCase()})" aria-hidden="true">${T.k} tier</span></button></li>`; };
// the spotlight, smaller and in the kit; today's hover keeps swapping it (V2.raSpot is what the pointer handler calls)
V2.raSpot = n => { const x = pool.find(y => y.p.n === n) || all.find(y => y.p.n === n) || pool[0]; if (!x) return ''; const p = x.p, T = tierOf(x), k = lairRank(p), N = V2.raNums(p), topOne = x === pool[0];
  const tag = topOne ? (megas ? 'The top Mega right now' : '#1 right now') : k ? `#${k.rank} of ${k.of}` : 'Rated';
  return `<div class="ram-spot gs-spot ra-spot">${V2.mon(p.n, {bare: true, iw: 112})}<p class="gs-tag u">${E(tag)} · ${T.k} tier · ${RS(x.r.total)}</p><h2 class="u">${V2.nameHtml(p.d)}</h2>
    <div class="gs-facts gs-big">${V2.gsShare(N.u != null ? V2.raPct(N.u) : null, 'tournament')}<p><span>Win rate</span><b class="u">${N.w != null ? E(winFmt(N.w)) : '–'}</b></p><p><span>Base Speed</span><b class="u">${p.st[5]}</b></p></div>
    <div class="ram-acts">${V2.kGo('BUILD AROUND IT.', {'data-hmaround': p.n})}${V2.kLink('Pokémon Page', {href: null, role: 'button', 'data-v2mon': p.n})}</div></div>`; };
const spot = `<div class="ra-spotw" data-raspotw>${V2.raSpot(U.spot)}</div>`;
const tabs = pick('.ra-sub');
const head = `<section class="ra-h"><p class="k-kicker np-eyebrow">META · THE LINE-UP</p><h1 class="k-h1 u">Who wins <em>right now.</em></h1><p class="k-lead ra-lede">Every Pokémon rated 0–100 from real tournament results, not opinion.</p>
  <p class="ra-kick">Reg ${E(reg)} doubles${teams ? ` · ${E(basisNum(teams))} tournament teams` : ''}${V2.tip('numbers')}</p><p class="ra-links">${V2.kLink('How Ratings Work', {href: '#method=rating'})}${V2.kLink('Track Record', {href: '#track'})}</p></section>`;
const boardHead = `<div class="ram-bh"><h2 class="u">${megas ? 'The top 10 Megas.' : U.f.nomega ? 'The top 10, no Megas.' : 'The top 10.'}</h2><span>rank · rating · tier</span></div>`;
// controls: search (today's box, data-raq) + the filters as the kit's plot sentence (6 boxed words; "everyone" is today's All / Clear)
const gems = all.filter(x => isGem(x.p)).length, f = U.f, filtered = V2.raFiltered();
const sent = V2.kSent(['Show me', {w: 'everyone', on: !filtered, attrs: {'data-raflag': 'all'}}, {w: 'Megas', on: !!f.mega, attrs: {'data-raflag': 'mega'}}, {w: 'no Megas', on: !!f.nomega, attrs: {'data-raflag': 'nomega'}}, ...(gems ? [{w: `◆ gems · ${gems}`, on: !!f.gem, attrs: {'data-raflag': 'gem'}}] : []), {w: 'my box', on: !!f.box, attrs: {'data-raflag': 'box'}}, {w: U.ty.length ? U.ty.join(' + ') : 'any type', menu: true, attrs: {'data-ratypes': true, 'aria-expanded': String(!!U.types)}}], {label: 'Filter', hint: 'Blue words are buttons. Tap a Pokémon for its page.'});
const ctl = `<div class="gs-ctl">${pick('.ra-find')}${sent}${pick('.ra-types')}</div>`;
const tiers = `${ctl}<div class="ram-tb">${pick('.ra-tbar')}${pick('.gs-view')}</div>${pick('.gs') || pick('.ra-list')}${pick('.ra-legend')}`;
const s2 = (n) => V2.kStep(n, 'Every tier.', `S to F · ${all.length} rated`, tiers);
const s3 = (n) => V2.kStep(n, 'How we rate.', 'the recipe, its sources and its track record', pick('.ra-about') + `<p class="ram-lph">${V2.kLink('How Ratings Work', {href: '#method=rating'})}${V2.kLink('Track Record', {href: '#track'})}</p>`);
let html;
if (OPT === 'B') { const [a, b, c] = top, card = (x, i, hero) => V2.kCard(x.p.n, {size: hero ? 'hero' : 'normal', score: RS(x.r.total), tier: `#${i + 1} · ${tierOf(x).k} tier`, fact: (() => { const N = V2.raNums(x.p); return N.u != null ? `On ${V2.raPct(N.u)} of teams` : ''; })(), attrs: {'data-v2mon': x.p.n, 'data-raspot': x.p.n}});
  const pod = `<div class="ram-pod">${a ? card(a, 0, true) : ''}${b ? card(b, 1) : ''}${c ? card(c, 2) : ''}</div><ol class="ram-list ram-rest" start="4">${top.slice(3).map((x, i) => row(x, i + 3)).join('')}</ol>`;
  html = `<div class="ra gsp ram ram-B"><div class="gs-top">${head}<div class="ram-b-sp">${spot}</div></div>${tabs}<div class="gs-body">${V2.kPlan(V2.kStep(1, megas ? 'The top 10 Megas.' : 'The top 10.', 'rank · rating · tier', pod) + s2(2) + s3(3))}</div></div>`; }
else html = `<div class="ra gsp ram ram-A"><div class="gs-top"><div>${head}${spot}</div><div class="ram-board">${boardHead}<ol class="ram-list">${top.map(row).join('')}</ol></div></div>${tabs}<div class="gs-body">${V2.kPlan(s2(1) + s3(2))}</div></div>`;
document.querySelector('#main').innerHTML = css + html; scrollTo(0, 0); })();
