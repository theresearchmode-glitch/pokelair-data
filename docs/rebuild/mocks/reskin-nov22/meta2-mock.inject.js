// Ratings (#meta) ROUND 2 (Sim, ~12:2x PM: "make it less boring ... i dont want the big piles of lists"; keeps direction A). Nov 22 (helper hM; Sim's TOP PRIORITY: "we need to see pokemon rankings clearly"). MOCK-UP ONLY: injected into
// the real built page (inside the shared closure, through the test hook __ev). Today's own pieces are reused as they are (V2.pages.meta.draw()
// is drawn into a scratch box and its search, Types grid, Jump-to bar, Grandstand/List switch, Grandstand, legend and About are moved over, so
// every data-* hook, id and test class stays); the new parts use the kit and the shared logic (lairRows, lairRank, lTier, RS, V2.raNums, winFmt).
// window.RAOPT: 'A' (recommended) = the stairs: the Top 10 as ten slanted plot bars, stepping down by rank (ties stand level), each
//               Pokémon standing on its own bar with its rank and rating on it. One strong idea: the ranking IS the chart.
//               'B' = the podium: #1-#3 on a podium beside the headline, #4-#10 as a row of small slanted tiles.
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
/* ===== round 2: the stairs (A) ===== */
.rs-wrap{margin:8px 0 0}.ram-A2 .rs-wrap{margin-top:-64px}
.rs-st{list-style:none;margin:0;padding:56px 0 0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:10px;align-items:end}
.rs-st li{min-width:0}
.rs-b{position:relative;display:grid;justify-items:center;width:100%;padding:0;border:0;background:none;color:var(--k-ink);font:inherit;cursor:pointer}
.rs-b .np-mon{--iw:92px;position:relative;z-index:1;margin-bottom:-14px;filter:drop-shadow(0 6px 6px var(--k-art-shadow))}
.rs-col{position:relative;display:grid;align-content:space-between;width:100%;height:var(--h);padding:18px 8px 8px;background:linear-gradient(170deg,color-mix(in srgb,var(--b1) 62%,var(--k-card)),color-mix(in srgb,var(--b2) 34%,var(--k-card)));clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%);box-shadow:inset 0 -6px 0 var(--tc)}
.rs-rk{position:relative;z-index:2;justify-self:start;padding:0 6px;background:var(--k-chip);color:var(--k-on-chip);font-size:var(--t20);line-height:1.3;transform:skewX(-10deg)}
.rs-b.one .rs-rk{background:var(--k-nasty);color:#fff}
.rs-sc{justify-self:end;font-size:var(--t34);line-height:1;color:var(--k-ink);padding-right:8px}
.rs-nm{display:block;margin-top:8px;min-height:2.6em;font-size:var(--t15);font-weight:700;line-height:1.25;text-align:center;color:var(--k-ink)}
.rs-nm small{display:block;font-size:var(--t13);color:var(--k-plot-text);font-family:var(--u);font-style:italic;font-weight:800}
.rs-mv{position:absolute;right:6px;top:6px;font-size:var(--t13);font-weight:800}.rs-mv.up{color:var(--k-plot-text)}.rs-mv.dn{color:var(--k-nasty-text)}
.rs-cap{display:flex;justify-content:space-between;gap:12px;margin:4px 0 0;font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.ram2 .gs-top{grid-template-columns:minmax(0,1fr) minmax(0,560px);align-items:end}.ram-A2 .gs-top{margin-bottom:0}.ram-A2 .ra-h{padding-bottom:0}
.ram2 .ram-spot{margin-top:0}
/* the controls band: tighter, one line each on desktop */
.ram2 .gs-ctl .k-sent,.ram2 .ra-tbar .k-sent{font-size:var(--t17);gap:6px 8px}.ram2 .ra-tbar{margin:4px 0}.ram2 .gs-ctl{margin:0}.ram2 .gs-ctl .k-w,.ram2 .ra-tbar .k-w{padding:0 10px}
.ram2 .ram-cl{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:8px 20px;align-items:center}.ram2 .ram-cl .k-sent{margin:0}.ram2 .ram-cl .k-hint{grid-column:1/-1}
.ram2 .k-step:first-child .k-sec{margin-top:24px}
/* ===== round 2: the podium (B) ===== */
.rp-pod{list-style:none;margin:0;padding:120px 0 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:end}
.rp-pod li:nth-child(1){order:2}.rp-pod li:nth-child(2){order:1}.rp-pod li:nth-child(3){order:3}
.rp-pod .np-mon{--iw:150px}.rp-pod .rs-sc{font-size:var(--d-kgo,40px)}
.rp-tiles{list-style:none;margin:24px 0 0;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px}
.rp-t{position:relative;display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;width:100%;padding:8px 8px 10px;border:0;background:var(--k-card);color:var(--k-ink);font:inherit;cursor:pointer;clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%);box-shadow:inset 0 -5px 0 var(--tc)}
.rp-t .np-mon{--iw:64px}.rp-t .rs-rk{position:absolute;left:12px;top:8px;font-size:var(--t15)}.rp-t b.s{font-size:var(--t26);line-height:1;color:var(--k-plot-text)}.rp-t .rs-nm{margin-top:2px;min-height:0;font-size:var(--t13)}
@media (max-width:1099.98px){.ram2 .gs-top{grid-template-columns:minmax(0,1fr)}.ram-A2 .rs-wrap{margin-top:8px}.ram-B2 .gs-top{display:flex;flex-direction:column}.ram-B2 .gs-top>div:first-child{display:contents}.ram-B2 .ra-h{order:1}.ram-B2 .gs-top>div:last-child{order:2}.ram-B2 .ra-spotw{order:3}.rs-st{grid-template-columns:repeat(5,minmax(0,1fr));row-gap:24px}.rp-tiles{grid-template-columns:repeat(4,minmax(0,1fr))}.ram2 .ram-cl{grid-template-columns:minmax(0,1fr)}}
@media (max-width:699.98px){
 .rs-st{display:flex;gap:8px;overflow-x:auto;padding:40px 16px 8px;margin:0 -16px;scroll-snap-type:x proximity;-webkit-mask-image:linear-gradient(90deg,var(--k-mask) 86%,transparent);mask-image:linear-gradient(90deg,var(--k-mask) 86%,transparent)}
 .rs-st li{flex:0 0 84px;scroll-snap-align:start}.rs-b .np-mon{--iw:80px;margin-bottom:-22px}.rs-col{height:calc(var(--h) * .6);padding:24px 6px 6px}.rs-sc{font-size:var(--t24);padding-right:4px}.rs-rk{font-size:var(--t15)}.rs-nm{font-size:var(--t13)}
 .rp-pod{padding-top:72px;gap:6px;grid-template-columns:repeat(3,minmax(0,104px));justify-content:center}.rp-pod .np-mon{--iw:80px}.rp-pod .rs-col{height:calc(var(--h) * .5)}.rp-pod .rs-sc{font-size:var(--t20)}
 .rp-tiles{display:flex;overflow-x:auto;margin:16px -16px 0;padding:0 16px 8px;-webkit-mask-image:linear-gradient(90deg,var(--k-mask) 86%,transparent);mask-image:linear-gradient(90deg,var(--k-mask) 86%,transparent)}.rp-tiles li{flex:0 0 100px}
 .ram2 .gs-ctl .k-sent,.ram2 .ra-tbar .k-sent{font-size:var(--t15)}.rs-cap{display:none}.rs-sc{padding-right:10px}.rp-pod .np-mon,.rp-pod .np-mon img{width:80px!important;height:auto!important;max-height:96px}.ram-A2{display:flex;flex-direction:column}.ram-A2 .gs-top{display:contents}.ram-A2 .ra-h{order:1}.ram-A2 .rs-wrap{order:2;margin-top:0}.ram-A2 .ra-spotw{order:3}.ram-A2 .ra-sub{order:4}.ram-A2 .gs-body{order:5}.ram-B2 .gs-top>div:last-child{min-width:0;width:100%;overflow:hidden}
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
const stair = (x, i, big) => { const p = x.p, k = lairRank(p), T = tierOf(x), N = V2.raNums(p), sc = RS(x.r.total), mv = wk.get(p.n) || 0, rank = megas || U.f.nomega ? i + 1 : k ? k.rank : i + 1, nm = V2.kName(p.n);
  const h = big ? [0, 230, 180, 140][Math.min(3, rank)] || 140 : 72 + (11 - Math.min(10, rank)) * 10;
  return `<li><button type="button" class="rs-b${rank === 1 ? ' one' : ''}" data-v2mon="${E(p.n)}" data-raspot="${E(p.n)}" style="--b1:var(--ty-${p.t[0]});--b2:var(--ty-${p.t[1] || p.t[0]});--tc:var(--tier-${T.k.toLowerCase()});--h:${h}px" aria-label="Number ${rank}: ${E(p.d)}, rated ${sc}, ${T.k} tier${N.u != null ? ', on ' + E(V2.raPct(N.u)) + ' of teams' : ''}${mv ? (mv > 0 ? ', up ' : ', down ') + Math.abs(mv) + ' this week' : ''}: open its page">${V2.mon(p.n, {bare: true, iw: big ? 150 : 104})}<span class="rs-col" aria-hidden="true"><b class="rs-rk u">#${rank}</b>${mv ? `<i class="rs-mv ${mv > 0 ? 'up' : 'dn'}">${mv > 0 ? '▲' : '▼'}${Math.abs(mv)}</i>` : ''}<b class="rs-sc u">${sc}</b></span><span class="rs-nm" aria-hidden="true">${nm.form ? `<small>${E(nm.form)}</small>` : ''}${E(nm.name).replace(/ (\S)$/, ' $1')}</span></button></li>`; };
const tile = (x, i) => { const p = x.p, k = lairRank(p), T = tierOf(x), sc = RS(x.r.total), rank = megas || U.f.nomega ? i + 1 : k ? k.rank : i + 1, nm = V2.kName(p.n);
  return `<li><button type="button" class="rp-t" data-v2mon="${E(p.n)}" data-raspot="${E(p.n)}" style="--tc:var(--tier-${T.k.toLowerCase()})" aria-label="Number ${rank}: ${E(p.d)}, rated ${sc}, ${T.k} tier: open its page"><b class="rs-rk u" aria-hidden="true">#${rank}</b>${V2.mon(p.n, {bare: true, iw: 64})}<b class="s u" aria-hidden="true">${sc}</b><span class="rs-nm" aria-hidden="true">${nm.form ? `<small>${E(nm.form)}</small>` : ''}${E(nm.name).replace(/ (\S)$/, ' $1')}</span></button></li>`; };
const title = megas ? 'The top 10 Megas' : U.f.nomega ? 'The top 10, no Megas' : 'The top 10';
const cap = `<p class="rs-cap"><span>${E(title)} · rank, rating 0–100, ${top.length && tierOf(top[top.length - 1]).k === 'S' ? 'every one S tier' : 'tier colour at the foot'} · tap one for its page</span><span>${OPT === 'B' ? 'The podium: #1 to #3' : 'Taller = higher rank'}</span></p>`;
const ctl2 = `<div class="gs-ctl ram-cl">${pick('.ra-find')}${sent}${pick('.ra-types')}</div>`;
const tiers2 = `${ctl2}<div class="ram-tb">${pick('.ra-tbar')}${pick('.gs-view')}</div>${pick('.gs') || pick('.ra-list')}${pick('.ra-legend')}`;
const step1 = V2.kStep(1, 'Every tier.', `S to F · ${all.length} rated`, tiers2);
let html;
if (OPT === 'B') html = `<div class="ra gsp ram ram2 ram-B2"><div class="gs-top"><div>${head}${spot}</div><div><ol class="rp-pod">${top.slice(0, 3).map((x, i) => stair(x, i, true)).join('')}</ol></div></div><div class="rs-wrap"><ol class="rp-tiles">${top.slice(3).map((x, i) => tile(x, i + 3)).join('')}</ol>${cap}</div>${tabs}<div class="gs-body">${V2.kPlan(step1 + s3(2))}</div></div>`;
else html = `<div class="ra gsp ram ram2 ram-A2"><div class="gs-top">${head}${spot}</div><div class="rs-wrap"><ol class="rs-st">${top.map((x, i) => stair(x, i)).join('')}</ol>${cap}</div>${tabs}<div class="gs-body">${V2.kPlan(step1 + s3(2))}</div></div>`;
document.querySelector('#main').innerHTML = css + html; scrollTo(0, 0); })();
