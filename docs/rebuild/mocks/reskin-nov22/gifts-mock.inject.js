// Mystery Gifts (#gifts) direction mock-up, Nov 22 (helper hM). Call: "Keep as drawn (fix the code wrap)" = Sim's PC mock (origin/claude/
// cohesion-mocks pages/gifts.html) on the kit, real data. MOCK-UP ONLY: injected into the real built page (test hook __ev). Uses the Post Room's
// own logic (V2.postNow, V2.prG, V2.prDaysLeft, V2.prDate, V2.PR_HOW, V2.PR_NOCODE, V2.prCode, V2.prEm, V2.prStamp) and today's hooks
// (data-prcopy, data-prf, data-prmore, data-prset, data-v2mon). The code-wrap fix: each code sizes itself to its label (container query on the
// code box, using the code's measured width V2.prEm), so a long code shrinks instead of wrapping, at every width.
(() => { const E = V2.esc, U = V2.prUi, P = V2.postNow(), live = P.live.map(V2.prG), past = P.past.map(V2.prG), now = Date.now();
const css = `<style>
.grm .k-head .k-kicker{display:table;width:max-content}
.grm-crumb{display:inline-flex;align-items:center;min-height:44px;font-size:var(--t15);font-weight:700;color:var(--k-plot-text);text-decoration:none}
.grm-top{display:grid;gap:8px}.grm .k-kicker{margin-top:8px}.grm .k-facts{margin-top:12px}.grm .k-step:first-child .k-sec{margin-top:40px}.grm .grm-parcels{margin-top:28px}
.grm .k-facts b{font-size:var(--d-kgo,40px)}.grm .k-facts li:first-child b{color:var(--k-nasty-text)}
.grm-parcels{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:24px;align-items:start}
.grm-box{position:relative;padding:28px 16px 16px;background:linear-gradient(90deg,transparent 46%,rgba(0,0,0,.1) 46% 54%,transparent 54%) top/100% 28px no-repeat,#C8A26B}
.grm-lab{position:relative;display:grid;gap:8px;padding:16px;background:#fff;color:#17161A;box-shadow:0 2px 6px rgba(0,0,0,.15)}
.grm-k{margin:0;font-size:var(--t13);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#C41E35}
.grm-lab h3{margin:0;font-size:var(--t24);line-height:1.15;color:#17161A}
.grm-when{margin:0;font-size:var(--t13);line-height:1.4;color:#4a4850}
.grm-code{container-type:inline-size;padding:8px 12px;border:2px dashed #17161A}
.grm-code .pr-code{display:block;white-space:nowrap;font-family:var(--u);font-style:italic;font-weight:800;font-synthesis:style;line-height:1.1;letter-spacing:.02em;font-size:min(var(--t28),calc(100cqw / var(--prw)))}
.grm-code .pr-code *{font:inherit}
.grm-lab .k-go{margin:4px 0 0;justify-self:start;font-size:var(--t22);padding:10px 20px}
.grm-cp2{justify-self:start;min-height:44px;padding:0 16px;border:3px solid #0078BF;background:#fff;color:#005d94;font:800 italic var(--t17)/1 var(--u);font-synthesis:style;transform:skewX(-8deg);cursor:pointer}
.grm-none{margin:0;font-size:var(--t15);line-height:1.5;color:#17161A}
.grm-src{margin:0;font-size:var(--t13);line-height:1.4;color:#4a4850}.grm-src a{color:#005d94}
.grm-st{position:absolute;right:12px;top:-18px;z-index:1;display:grid;justify-items:center;min-width:88px;padding:4px 8px;border:3px solid #C41E35;background:#fff;color:#C41E35;font:800 italic var(--t13)/1.1 var(--u);font-synthesis:style;text-transform:uppercase;transform:rotate(4deg)}
.grm-st b{font-size:var(--t26);line-height:1}
.grm-how{list-style:none;margin:0;padding:0;counter-reset:h}
.grm-how li{display:grid;grid-template-columns:40px minmax(0,1fr);align-items:center;gap:16px;min-height:52px;border-top:1px solid var(--k-rule);font-size:var(--t17);font-weight:600;color:var(--k-ink)}
.grm-how li::before{counter-increment:h;content:counter(h);display:grid;place-items:center;width:32px;height:28px;background:var(--k-plot);color:var(--k-on-plot);font:800 italic var(--t15)/1 var(--u);font-synthesis:style;transform:skewX(-10deg)}
.grm-fine{margin:12px 0 0;font-size:var(--t13);font-weight:600;line-height:1.5;color:var(--k-ink2)}
.grm .pr-sheet{margin-top:16px}
@media (max-width:1099.98px){.grm-parcels{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:699.98px){.grm .k-facts b{font-size:var(--t22)}.grm-parcels{grid-template-columns:minmax(0,1fr);gap:32px}.grm-box{padding:24px 12px 12px}.grm-lab{padding:12px}.grm-lab h3{font-size:var(--t20)}.grm-how li{font-size:var(--t15)}}
</style>`;
const left = live.map(g => V2.prDaysLeft(g, now)).filter(d => d != null && d >= 0), soonest = left.length ? Math.min(...left) : null;
const facts = live.length ? [[String(live.length), 'to claim · live right now'], ...(soonest != null ? [[soonest === 0 ? 'Today' : String(soonest), soonest === 0 ? 'one ends' : soonest === 1 ? 'day until one ends' : 'days until one ends']] : []), [String(live.length + past.length), 'gifts so far']] : [['0', 'to claim'], [String(past.length), 'gifts so far']];
const head = `<a class="grm-crumb" href="#home">‹ Home</a><div class="grm-top"><div class="k-head"><p class="k-kicker">HOME · THE LOOT</p><h1 class="k-h1 u">Special delivery.<br><em>No postage due.</em></h1>
  <p class="k-lead">Every Mystery Gift in Pokémon Champions, parcel by parcel. The code is on the label, and so is the last day to collect it.</p></div>${V2.kFacts(facts)}</div>`;
// 1 the parcels: the first code gets the page's one pink move; the others a blue outlined copy button (same data-prcopy)
let pink = false;
const parcel = g => { const d = V2.prDaysLeft(g, now), md = {month: 'short', day: 'numeric'};
  const end = !Number.isFinite(g.end) ? 'end date not confirmed' : g.dayEnd ? V2.prDate(g.end, undefined, true) : `${V2.prDate(g.end)} · until ${new Date(g.end).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}`;
  const code = g.code ? `<div class="grm-code" style="--prw:${V2.prEm(g.code) || 1}">${V2.prCode(g.code)}</div>${!pink && (pink = true) ? V2.kGo('COPY CODE.', {'data-prcopy': g.code.replace(/\s+/g, '')}) : `<button type="button" class="grm-cp2" data-prcopy="${E(g.code.replace(/\s+/g, ''))}">copy code</button>`}` : `<p class="grm-none">${V2.PR_NOCODE[g.how]}</p>`;
  return `<article class="grm-box pr-parcel" aria-label="Mystery Gift: ${E(g.name)}">${d != null && d >= 0 ? `<span class="grm-st" aria-hidden="true">${d === 0 ? '<b>Last</b>day' : `<b>${d}</b>${d === 1 ? 'day left' : 'days left'}`}</span>` : ''}<div class="grm-lab">
    <p class="grm-k">Mystery Gift · ${E(V2.PR_HOW[g.how])}</p><h3 class="u">${E(g.name)}</h3><p class="grm-when">Sent ${Number.isFinite(g.start) ? V2.prDate(g.start, md, g.dayStart) : 'date not confirmed'} · collect by ${end}${g.extras.length ? ` · also inside: ${g.extras.map(E).join(', ')}` : ''}</p>
    ${code}${g.src.length ? `<p class="grm-src">Source: ${g.src.slice(0, 2).map(x => `<a href="${E(x.url)}" target="_blank" rel="noopener noreferrer">${E(x.name || 'Source')}</a>`).join(' and ')}</p>` : ''}${d != null && d >= 0 ? `<span class="vh">, ${d === 0 ? 'last day to collect it' : `${d} ${d === 1 ? 'day' : 'days'} left`}</span>` : ''}</div></article>`; };
const s1 = V2.kStep(1, 'Waiting at the counter.', live.some(g => g.code && /\d/.test(g.code)) ? 'blue characters are numbers; the rest are letters' : '', live.length ? `<div class="grm-parcels" style="--n:${Math.min(3, live.length)}">${live.map(parcel).join('')}</div>` : V2.prShelf());
const s2 = V2.kStep(2, 'How to collect.', '', `<ol class="grm-how"><li>In the game, open the Submenu and choose Mystery Gift.</li><li>Enter the code from the label.</li><li>The gift arrives in your Mailbox.</li></ol><p class="grm-fine">A code can stop early or not work in every account. Real codes never ask for your password.</p>`);
// 3 the stamp sheet: today's stamps (V2.prStamp), the filter as the kit's sentence (data-prf)
const n = {all: past.length, mon: past.filter(g => g.isMon).length, item: past.filter(g => !g.isMon).length};
const list = U.f === 'mon' ? past.filter(g => g.isMon) : U.f === 'item' ? past.filter(g => !g.isMon) : past, cap = 12, shown = U.all ? list : list.slice(0, cap);
const per = M => { const k = shown.length || 1, r = Math.ceil(k / M); return Math.ceil(k / r); };
const sent = past.length ? V2.kSent(['Show', ...[['all', 'all'], ['mon', 'Pokémon'], ['item', 'items']].map(([k, t]) => ({w: `${t} · ${n[k]}`, on: U.f === k, attrs: {'data-prf': k}}))], {label: 'Which stamps', hint: 'Blue words are buttons. Tap a Pokémon for its page.'}) : '';
const more = list.length > 6 ? `<button type="button" class="np-link pr-more${list.length > cap ? '' : ' pr-mph'}" data-prmore aria-expanded="${U.all}" aria-controls="pr-sheet-l">${U.all ? 'Show Fewer Stamps' : `Show All ${list.length} Stamps ›`}</button>` : '';
const sheet = `${sent}${shown.length ? `<ul class="pr-sheet${U.all ? ' on' : ''}" id="pr-sheet-l" style="--pc8:${per(8)};--pc6:${per(6)};--pc4:${per(4)};--pc3:${per(3)}">${shown.map(V2.prStamp).join('')}</ul>` : `<p class="pr-nost">${past.length ? 'No stamps of this kind yet.' : 'No stamps yet. Each gift gets one the day it ends.'}</p>`}${more}
  <p class="grm-fine">${P.checked ? `Gift list checked ${E(V2.prDate(V2.prDayOf(P.checked), {month: 'short', day: 'numeric'}))}. ` : ''}Dates are each campaign's listed end times, shown in your time zone. A code can stop working early.</p>`;
const s3 = V2.kStep(3, 'The stamp sheet.', 'every gift so far, postmarked the day it ended', sheet);
document.querySelector('#main').innerHTML = css + `<div class="ra pr grm">${head}${V2.kPlan(s1 + s2 + s3)}</div>`; scrollTo(0, 0); })();
