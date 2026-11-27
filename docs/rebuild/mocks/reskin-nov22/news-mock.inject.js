// News (#news) direction mock-up, Nov 22 (helper hM). MOCK-UP ONLY: injected into the real built page (inside the shared closure, through the
// test hook __ev). Call: "Keep as drawn" = Sim's PC mock (origin/claude/cohesion-mocks pages/news.html), with small fixes, drawn with the kit
// helpers and the page's OWN data and helpers (V2.dpParts(V2.postNow()), V2.dpNext, homeChamp, lairRows, V2.prCode, CAL). Nothing invented.
// One direction (Keep as drawn): no real choice to offer. Phone keeps today's Q41 cuts (2 briefs + 'N more', top 3 ratings, 2 events).
(() => { const E = V2.esc, post = V2.postNow(), D = V2.dpParts(post), OPT = window.NWOPT || 'A', today = new Date();
const css = `<style>
.nwm{padding-bottom:8px}
.nwm .k-plan{padding-bottom:24px}
.nwm .k-head .k-kicker{display:table;margin-top:4px}
.nwm-crumb{display:inline-flex;align-items:center;min-height:44px;margin-top:8px;font-size:var(--t15);font-weight:700;color:var(--k-plot-text);text-decoration:none}
.nwm-paper{margin:24px 0 0;padding:20px 28px 24px;background:var(--k-card);border-top:4px double var(--k-ink);box-shadow:0 10px 28px var(--k-card-shadow)}
.nwm.nwm-B .nwm-paper{padding:16px 0 0;background:none;box-shadow:none}
.nwm-top{display:flex;justify-content:space-between;gap:8px 24px;flex-wrap:wrap;margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid var(--k-rule);font-size:var(--t13);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--k-ink2)}
.nwm-r1{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:32px;align-items:start}
.nwm-k{margin:0 0 6px;font-size:var(--t13);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--k-nasty-text)}
.nwm-lh{margin:0;font-size:var(--t34);line-height:1.1;color:var(--k-ink)}
.nwm-lh a,.nwm-ib a{color:inherit;text-decoration:none}.nwm-lh a:hover,.nwm-ib a:hover{text-decoration:underline}
.nwm-ar{color:var(--k-plot-text);font-style:normal}
.nwm-sum{margin:8px 0 0;font-size:var(--t15);line-height:1.5;color:var(--k-ink2)}
.nwm-sh{margin:20px 0 8px;font-size:var(--t13);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--k-nasty-text)}
.nwm-ser{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:8px}
.nwm-ser button{display:grid;justify-items:center;gap:2px;width:100%;padding:0;border:0;background:none;color:var(--k-ink);font:inherit;cursor:pointer}
.nwm-ser .np-mon{--iw:64px}
.nwm-ser b{font-size:var(--t17);line-height:1.1}.nwm-ser small{font-size:var(--t13);line-height:1.3;color:var(--k-ink2);text-align:center}
.nwm-ser .cur b{color:var(--k-plot-text)}
.nwm-box{display:grid;gap:4px;width:100%;margin:0 0 12px;padding:12px 16px;border:2px solid var(--k-ink);background:var(--k-paper);color:var(--k-ink);font:inherit;text-align:left;text-decoration:none;cursor:pointer}
.nwm-box small{font-size:var(--t13);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--k-nasty-text)}
.nwm-box b{font-size:var(--t22);line-height:1.15}.nwm-box>span:not(.k-tag){font-size:var(--t15);color:var(--k-ink2)}.nwm-box .k-tag{justify-self:start}
.nwm-ib{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
.nwm-ib li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px 16px;min-height:56px;padding:6px 0;border-top:1px solid var(--k-rule)}
.nwm-ib p{margin:0;font-size:var(--t13);color:var(--k-ink2)}.nwm-ib h3{margin:0;font-size:var(--t16);font-weight:700;line-height:1.35;color:var(--k-ink)}
.nwm-ib .k-link{grid-row:1/3;grid-column:2}
.nwm-cp{display:flex;flex-wrap:wrap;align-items:center;gap:12px 28px}
.nwm-code{font-size:var(--d-ksent);line-height:1;letter-spacing:.02em;color:var(--k-ink)}
.nwm .nwm-code .pr-code,.nwm .nwm-code .pr-code *{font-family:var(--u);font-style:italic;font-weight:800;font-size:var(--d-ksent);line-height:1;font-synthesis:style}
.nwm-cp .k-go{margin:0}
.nwm-fine{margin:12px 0 0;font-size:var(--t13);font-weight:600;line-height:1.5;color:var(--k-ink2)}
.nwm-bk{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 48px;align-items:start}
.nwm-h3{margin:0 0 6px;font-size:var(--t13);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--k-nasty-text)}
.nwm-h3+*{margin-top:0}
.nwm-ev{display:inline;padding:0;border:0;background:none;color:var(--k-plot-text);font:inherit;font-size:var(--t17);text-align:left;cursor:pointer}
.nwm-six{list-style:none;margin:4px 0 16px;padding:0;display:flex;gap:4px}.nwm-six button{padding:0;border:0;background:none;cursor:pointer}.nwm-six .np-mon{--iw:56px}
.nwm-rows{list-style:none;margin:0;padding:0}
.nwm-rows button,.nwm-rows a{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;min-height:44px;padding:2px 0;border:0;border-top:1px solid var(--k-rule);background:none;color:var(--k-ink);font:inherit;text-align:left;text-decoration:none;cursor:pointer}
.nwm-rows .nm{font-size:var(--t15);font-weight:700}.nwm-rows small{font-size:var(--t13);color:var(--k-ink2)}
.nwm-rows .sc{font-size:var(--t26);color:var(--k-plot-text)}
.nwm-rows .dd{font-size:var(--t26);color:var(--k-nasty-text);text-align:center}
.nwm-rows a span{display:grid;line-height:1.3}
.nwm-ads{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.nwm-ads a{display:block;min-height:32px;font-size:var(--t15);line-height:1.5;color:var(--k-ink);text-decoration:none}.nwm-ads a b.u{margin-right:6px;color:var(--k-nasty-text)}.nwm-ads a em{font-style:normal;font-weight:700;color:var(--k-plot-text)}
.nwm-note{margin:0;font-size:var(--t13);color:var(--k-ink2)}
@media (max-width:959.98px){.nwm-r1{grid-template-columns:minmax(0,1fr)}.nwm-side{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.nwm-box{margin:0}}
@media (max-width:699.98px){
 .nwm-paper{margin-top:20px;padding:12px 16px 16px}.nwm-top>span:nth-child(3){display:none}
 .nwm-lh{font-size:var(--t26)}
 .nwm-ser{grid-template-columns:repeat(4,minmax(0,1fr));row-gap:12px}.nwm-ser .np-mon{--iw:48px}
 .nwm-side{grid-template-columns:minmax(0,1fr);gap:8px}.nwm-box{padding:10px 12px}.nwm-box b{font-size:var(--t20)}
 .nwm-ib{grid-template-columns:minmax(0,1fr)}.nwm-ib:not(.on)>li:nth-child(n+3){display:none}.nwm-ib .k-link{display:none}
 .nwm-cp{gap:8px}.nwm-code{font-size:var(--t28)}
 .nwm-bk{grid-template-columns:minmax(0,1fr)}
 .nwm-tb>li:nth-child(n+4),.nwm-fx>li:nth-child(n+3){display:none}
 .nwm-six{justify-content:space-between;gap:0}.nwm-six .np-mon{--iw:44px}.nwm-ib li{grid-template-columns:minmax(0,1fr)}
}
</style>`;
const head = `<div class="k-head">${''}<a class="nwm-crumb" href="#home">‹ Home</a><p class="k-kicker">HOME · WORD ON THE STREET</p><h1 class="k-h1 u">The Champions <em>Dispatch.</em></h1>
  <p class="k-lead">Pokémon Champions news, in one paper. ${D.recent.length ? [V2.dpPlural(D.recent.length, 'story') + ' in the past 12 months', ...Object.entries(D.byType).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t, k]) => V2.dpPlural(k, t))].map(E).join(' · ') + '. ' : ''}Each headline opens the full story at its source.</p></div>`;
// the paper: the lead story, its series, In the post and Next event
const L = D.lead, n = D.live.length, left = n ? V2.prDaysLeft(D.live[0]) : null, one = n > 1 ? 'One' : 'It', ends = left == null ? '' : left <= 0 ? `${one} ends today` : left === 1 ? `${one} ends tomorrow` : `${one} ends in ${left} days`;
const nx = V2.dpNext()[0];
const R = D.rounds, ser = R.length >= 2 ? `<p class="nwm-sh">The series so far, and the gift each round gave out</p><ol class="nwm-ser" style="--n:${R.length}">${R.map(r => { const d = V2.dpDay(r.month.length === 7 ? r.month + '-15' : r.start), mo = d ? d.toLocaleDateString('en-US', {month: 'short'}) : '', cur = r === (D.sr || D.round);
  return `<li${cur ? ' class="cur" aria-current="true"' : ''}>${r.gift && V2.byName.get(r.gift) ? `<button type="button" class="dp-gb" data-v2mon="${E(r.gift)}" aria-label="${E(r.t)}: ${E(V2.disp(r.gift))}. Open its page.">${V2.mon(r.gift, {bare: true, iw: 64})}<b class="u">${E(mo)}</b><small>${E(V2.disp(r.gift))}</small></button>` : `<b class="u">${E(mo)}</b><small>No gift listed</small>`}</li>`; }).join('')}</ol>` : '';
const lead = L ? `<section aria-label="Lead story"><p class="nwm-k">${[L.type, L.sub, V2.dpShort(L.date)].filter(Boolean).map(E).join(' · ')}</p><h2 class="nwm-lh u">${V2.dpA(L, E(L.t) + ' <i class="nwm-ar" aria-hidden="true">↗</i>')}</h2><p class="nwm-sum">Opens the full story at its source, in a new tab.</p>${ser}</section>`
  : `<section><h2 class="nwm-lh u">No stories yet.</h2><p class="nwm-sum">Headlines appear here once the news list is filled.</p></section>`;
const side = `<div class="nwm-side"><a class="nwm-box" href="#gifts"><small>In the post</small><b class="u">${n ? V2.dpPlural(n, 'gift') + ' waiting' : 'No gifts waiting'}</b>${ends ? V2.kTag('live', ends) : '<span>Every Mystery Gift ›</span>'}</a>
  ${nx ? `<button type="button" class="nwm-box" data-dpcal><small>Next event</small><b class="u">${E(V2.dpEvShort(nx))}</b><span>${E(CAL.range(nx))} · ${E(CAL.when(nx)[1])}</span></button>` : `<span class="nwm-box"><small>Next event</small><b class="u">None listed</b></span>`}</div>`;
const paper = `<article class="nwm-paper" aria-label="The Champions Dispatch, front page"><p class="nwm-top"><span>No. ${homeNum(D.all.length)} · Late Edition</span><span>${E(today.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</span><span>Free · Unofficial</span></p><div class="nwm-r1">${lead}${side}</div></article>`;
// 1 In brief: the two stories and the brief, each opens at its source
const items = [...D.stories, ...D.inter, ...D.brief];
const ib = `<ul class="nwm-ib${V2.dpUi.brief ? ' on' : ''}" id="dp-briefl">${items.map(it => `<li><p>${[it.type, it.sub, V2.dpShort(it.date)].filter(Boolean).map(E).join(' · ')}</p><h3>${V2.dpA(it, E(it.t) + ' <span aria-hidden="true">↗</span>')}</h3>${it.url ? `<a class="k-link" href="${E(it.url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">Read&nbsp;›</a>` : ''}</li>`).join('')}</ul>${items.length > 2 ? `<div class="nwm-ph">${V2.dpBriefBtn(items.length - 2, !!V2.dpUi.brief)}</div>` : ''}`;
const s1 = V2.kStep(1, 'In brief.', 'the latest stories · each opens at its source', ib, D.rest.length ? {link: {label: `Earlier Editions · ${V2.dpPlural(D.rest.length, 'more story')}`, attrs: {href: null, 'data-dpmore': true, role: 'button'}}} : {});
// 2 Clip and claim: the live code, the page's ONE pink move copies it
const g = D.coupon, md = {month: 'short', day: 'numeric'};
const s2 = g ? V2.kStep(2, 'Clip and claim.', `Mystery Gift · ${g.name}`, `<div class="nwm-cp"><span class="nwm-code u">${V2.prCode(g.code)}</span>${V2.kGo('COPY CODE.', {'data-prcopy': String(g.code).replace(/\s+/g, '')})}</div>
  <p class="nwm-fine">${(() => { const l = V2.prDaysLeft(g), when = [V2.prDate(g.start, md, g.dayStart), V2.prDate(g.end, md, g.dayEnd)].filter(Boolean).join(' – '), how = V2.PR_HOW[g.how] || ''; return `${l != null && l >= 0 ? `<b>${E(V2.dpLeftTxt(l))}.</b> ` : ''}${E([how, when].filter(Boolean).join(', '))}. Blue characters are numbers.`; })()}</p>`, {link: {label: 'All Mystery Gifts', attrs: {href: '#gifts'}}})
  : V2.kStep(2, 'Clip and claim.', 'Mystery Gift', '<p class="nwm-fine">Nothing to clip today. The next gift code lands here.</p>', {link: {label: 'All Mystery Gifts', attrs: {href: '#gifts'}}});
// 3 The back page: latest result + top ratings | next events + classifieds
let c = null; try { c = homeChamp(); } catch (e) {}
const latest = c ? `<p class="nwm-h3">Latest result</p><button type="button" class="nwm-ev u" data-evgo="${E(c.ev.id)}">${E(V2.evTitle(c.ev.name))}</button><p class="nwm-note">${E(evDate(c.ev.date))} · ${c.ev.players > 0 ? homeNum(c.ev.players) + ' players · ' : ''}the winner's six</p><ul class="nwm-six">${c.six.map(m => `<li><button type="button" data-v2mon="${E(m.p.n)}" aria-label="${E(m.p.d)}: open its page">${V2.mon(m.p.n, {bare: true, iw: 56})}</button></li>`).join('')}</ul>` : '';
let rows = []; try { rows = lairRows().filter(x => x.r && x.r.tc).slice(0, 5); } catch (e) {}
const stand = `<p class="nwm-h3">Top ratings</p><ol class="nwm-rows nwm-tb">${rows.map(x => { const Rt = monRating(x.p), k = lairRank(x.p); return `<li><button type="button" data-v2mon="${E(x.p.n)}">${V2.mon(x.p.n, {bare: true, iw: 40})}<span class="nm">${k ? k.rank + '. ' : ''}${V2.keepForm(E(x.p.d))}</span><b class="sc u">${Rt ? Rt.n : ''}</b></button></li>`; }).join('')}</ol>${V2.kLink('All Ratings', {href: '#meta'})}`;
const next = V2.dpNext(), fix = `<p class="nwm-h3">Next events</p><ul class="nwm-rows nwm-fx">${next.slice(0, 3).map(e => { const d = new Date(e.s + 'T12:00:00'), pl = V2.dpPlace(e), u = V2.safeUrl(e.url);
  const inner = `<b class="dd u">${d.getDate()}</b><span><b class="nm">${E(e.n)}</b><small>${E(CAL.range(e))}${pl ? ' · ' + E(pl) : ''} · ${E(CAL.when(e)[1])}</small></span><i></i>`;
  return `<li>${u ? `<a href="${E(u)}" target="_blank" rel="noopener">${inner}</a>` : `<span>${inner}</span>`}</li>`; }).join('')}</ul>${next.length ? `<button type="button" class="k-link" data-dpcal style="border:0;background:none;padding:0;cursor:pointer">All ${homeNum(next.length)} Next Events&nbsp;›</button>` : ''}`;
let top = ''; try { const r = lairRows().filter(x => x.r && x.r.tc)[0]; top = r ? r.p.d : ''; } catch (e) {}
const ads = `<p class="nwm-h3" style="margin-top:24px">Classifieds</p><ul class="nwm-ads">${[['Wanted', "A turn 1 plan for tonight's match.", 'Apply at Battle', 'battle'], ['For hire', 'Team builder, works from real winning teams.', 'Ask for Build', 'build'], ['Lost', `One win streak.${top ? ` Last seen before a ${top}.` : ''}`, 'Check My Team', 'team'], ['Notice', 'Damage numbers checked while you wait.', 'See Damage Calculator', 'calc']].map(([k, t, a, h]) => `<li><a href="#${h}"><b class="u">${E(k)}</b>${E(t)} <em>${E(a)}&nbsp;›</em></a></li>`).join('')}</ul>`;
const s3 = V2.kStep(3, 'The back page.', 'from around NastyPlot', `<div class="nwm-bk"><div>${latest}${stand}</div><div>${fix}${ads}</div></div>${D.checked ? `<p class="nwm-fine">News list checked ${E(V2.dpShort(D.checked, true))}. Each headline opens the full story at its source.</p>` : ''}`);
document.querySelector('#main').innerHTML = css + `<div class="ra nwm nwm-${OPT}">${head}${paper}${V2.kPlan(s1 + s2 + s3)}</div>`; scrollTo(0, 0); })();
