// ---------- News, "The Champions Dispatch" (#news; Sim, Nov 18). Brief: docs/rebuild/dispatch/BRIEF.md ----------
// The front page of a newspaper: one sheet of cream paper, ink plus the logo's blue and red. Builder rules (ours win over the
// mock-ups): docs/rebuild/stampede/RULES-FOR-BUILDERS.md. CSS: css/sd-dispatch.css (classes dp-*, colours --dp-* in tokens.css).
//
// THE PIECE (for Home's post band and anything else that shows the paper):
//   V2.dpFront(post = V2.postNow(), {compact = false} = {}) -> HTML string of one paper (an <article class="dp-paper">).
//   post: what V2.postNow() returns ({live, past, news, checked}); a plain array of news items is taken too.
//   compact: the small paper for Home: top line, name, the lead story (with its Ended stamp), up to four more headlines in two
//   columns (two on a narrow slot), and a black "Next event" bar. It sizes itself to its slot (container queries), so the band
//   only sets its width (and any tilt) on a wrapper. Every headline links to its source (new tab, rel="noopener").
//   The full page is V2.pages.news: breadcrumb + V2.dpFront(post) + "Earlier Editions" under the paper.
//
// WHERE EVERY WORD AND NUMBER COMES FROM
//   News and gifts: POST (src/data/post.js; its header gives the shape) through V2.postNow(); the series rounds from POST.series
//   (post.series when V2.postNow() passes it on, else POST.series). Headline, date, type and source link; never article text.
//   V2.dpItem reads a news item (title, date, type, url; t / headline / src / link are taken too). Gifts are read with the
//   Post Room's reader (V2.prG). Every link goes through V2.safeUrl (https only; post-data.js).
//   What goes on the front (V2.dpParts): maintenance notices (type Maintenance, or titled "Maintenance (Completion) Notice") only
//   when nothing else is there; they still count in Earlier Editions. The lead is the newest other story; when it announces a round
//   of the series (its link is the round's source), the series row sits under it: one column per round of that year, its gift
//   from gifts[] ("No gift listed" when it has none). The right column holds interviews when POST has any; the official feed has
//   none, so it then holds "In Brief": the next newest real headlines.
//   Top Ratings: lairRows / lairRank / monRating (the same numbers as Ratings and Home). Latest Result: homeChamp().
//   Next Events and Next event: META.calendar through CAL, with the same upcoming filter as the Events page (V2.evCal), so
//   "All N Next Events" is the Events page's "Show All N" under Next Events.
//   Days left and dates on a gift are the Post Room's (V2.prDaysLeft, V2.prDate): a day-only (approx) date is its UTC day, an exact one local.
//   The coupon's code is the Post Room's piece (V2.prCode: upright, digits blue, spelled for screen readers) with its Copy Code
//   button (data-prcopy, handled in postroom.js): one family.
V2.dpUi = V2.dpUi || {more: false};
V2.dpPick = (x, ks) => { for (const k of ks) if (x && x[k] != null && x[k] !== '') return x[k]; return ''; };
/* https only (V2.safeUrl, post-data.js; the Post Room's check): a javascript:, data: or http: link is dropped and the words stay plain text */
V2.dpSrc = x => { const v = V2.dpPick(x, ['url', 'src', 'link', 'source']); return V2.safeUrl(Array.isArray(v) ? (v[0] && (v[0].url || v[0])) || '' : typeof v === 'object' ? v.url || '' : v); };
V2.dpItem = x => ({t: String(V2.dpPick(x, ['title', 't', 'headline'])), date: String(x.date || ''), type: String(x.type || 'News'), sub: String(V2.dpPick(x, ['sub', 'format'])),
  url: String(V2.dpSrc(x) || ''), end: x.end || '', gift: String(x.gift || '')});
// a balance change is real news even when the feed files it under Maintenance (Nov 18: the Dec 2 Battle Balance Adjustments notice)
V2.dpMaint = x => !/balance/i.test(x.t) && (/^maintenance$/i.test(x.type) || /^maintenance( completion)? notice$/i.test(x.t.trim()));
// dates: a news date is a calendar day (read at local noon, so it never slips a day); a gift's start and end are UTC instants
V2.dpDay = s => { s = String(s || ''); const d = new Date(/^\d{4}-\d\d-\d\d$/.test(s) ? s + 'T12:00:00' : s); return isNaN(d) ? null : d; };
V2.dpShort = s => { const d = V2.dpDay(s); return d ? d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : ''; };
V2.dpLeftTxt = n => n == null ? '' : n <= 0 ? 'Ends today' : n === 1 ? '1 day left' : `${n} days left`;
V2.dpOrd = k => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'][k - 1] || `${k}th`;
V2.dpPlural = (n, w) => { w = w.toLowerCase(); return `${homeNum(n)} ${n === 1 || /[^s]s$/.test(w) ? w : /ss$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's'}`; };
// the upcoming events, as the Events page lists them (V2.evCal: from today, no national events)
V2.dpNext = () => { const C = META.calendar; if (!C || !Array.isArray(C.ev) || typeof CAL === 'undefined') return []; const t = CAL.today(); return C.ev.filter(e => e.e >= t && e.t !== 'national'); };
V2.dpPlace = e => e.t === 'online' ? '' : [e.city !== e.n ? e.city : '', CAL.country(e.cc)].filter(Boolean).join(', ');
// V2.evShort(e): an event's short name, the one rule for the tools band (Events plate) and the Dispatch: the code in its closing
// brackets ("... (NAIC)" -> "NAIC"), else its full name. V2.dpEvShort adds the city for an in-person event.
V2.evShort = e => (/\(([A-Z][A-Za-z]{1,7})\)\s*$/.exec(String(e && e.n || '')) || [])[1] || String(e && e.n || '');
V2.dpEvShort = e => { const s = V2.evShort(e); return s !== e.n ? `${s}${e.city && e.t !== 'online' ? ', ' + e.city : ''}` : e.n; };
// a headline as a link to its source (new tab); without a link it is plain text (a story is never invented a link)
/* 'Season M-8' never breaks after its hyphen (a word joiner, as the Events page's ticket names) */
V2.dpA = (it, inner, cls = '') => (inner = inner.replace(/\b([A-Z])-(\w)/g, '$1-\u2060$2'), it.url) ? `<a class="dp-hl${cls ? ' ' + cls : ''}" href="${V2.esc(it.url)}" target="_blank" rel="noopener">${inner}<span class="vh"> (opens the full story at its source, in a new tab)</span></a>` : `<span class="dp-hl${cls ? ' ' + cls : ''}">${inner}</span>`;
V2.dpKick = (it, withType = true) => `<p class="dp-k">${[withType ? it.type : '', it.sub, V2.dpShort(it.date)].filter(Boolean).map(V2.esc).join(' · ')}</p>`;
// what goes where: the lead (newest story that isn't an interview), its series' rounds, the interviews column, two more stories, the rest
V2.dpParts = post => { const P = Array.isArray(post) ? {news: post, live: [], past: []} : post || {}, now = Date.now(), dy = x => V2.dpDay(x.date);
  const all = (P.news || []).map(V2.dpItem).filter(x => x.t), G = new Map(((typeof POST === 'object' && POST && POST.gifts) || []).map(g => [g.id, g]));
  const front = all.filter(x => !V2.dpMaint(x)), pool = front.length ? front : all, lead = pool.find(x => !/^interview/i.test(x.type)) || pool[0] || null;
  const S = (P.series || (typeof POST === 'object' && POST && POST.series) || []).map(r => { const g = r.gift ? G.get(r.gift) : null;
    return {month: r.month || '', t: r.name || '', start: r.start || '', end: r.end || '', url: V2.dpSrc(r), battle: r.battle || '', gift: r.mon || (g && (g.mon || g.name)) || ''}; });
  // the series row: the lead's round when the lead announces one, else the newest round in the news (Nov 18: a balance notice can lead)
  const round = lead && lead.url ? S.find(r => r.url === lead.url) || null : null, sr = round || all.map(x => S.find(r => x.url && r.url === x.url)).find(Boolean) || null, rounds = sr ? S.filter(r => r.month.slice(0, 4) === sr.month.slice(0, 4)) : [];
  const roundNews = new Set(S.map(r => r.url).filter(Boolean)), rest0 = pool.filter(x => x !== lead && !roundNews.has(x.url));
  const inter = rest0.filter(x => /^interview/i.test(x.type)).slice(0, 3), stories = rest0.filter(x => !inter.includes(x)).slice(0, 2);
  const brief = inter.length ? [] : rest0.filter(x => !stories.includes(x)).slice(0, 4);
  const shown = new Set([lead, ...inter, ...stories, ...brief]), rest = all.filter(x => !shown.has(x));
  // the masthead's count and the kinds beside it count the same stories: the past 12 months (so January isn't empty), no maintenance
  // notices in either (they are not stories on the front either)
  const recent = all.filter(x => !V2.dpMaint(x) && dy(x) && dy(x) <= now && dy(x) > now - 365 * 864e5), byType = {};
  for (const x of recent) byType[x.type] = (byType[x.type] || 0) + 1;
  const live = (P.live || []).map(V2.prG).filter(Boolean), coupon = live.find(g => g.code) || null, end = round ? round.end : lead && lead.end;
  return {all, lead, round, sr, rounds, inter, stories, brief, rest, recent, byType, live, coupon, checked: P.checked || null, end, ended: !!(end && Date.parse(end) < now)}; };
// ---------- the masthead: top line, name, In the post / date / Next event ----------
V2.dpMast = (D, compact) => { const E = V2.esc, today = new Date(), next = V2.dpNext()[0];
  const top = `<p class="dp-top"><span>No. ${homeNum(D.all.length)} · Late Edition</span>${compact ? `<span>${E(today.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</span>` : `<span class="dp-topc">Pokémon Champions news, in one paper</span><span>Free · Unofficial</span>`}</p>`;
  const name = compact ? `<p class="dp-name u"><span>The Champions</span> <span class="dp-pl">Dispatch</span></p>` : `<h1 class="dp-name u"><span>The Champions</span> <span class="dp-pl">Dispatch</span></h1>`; /* the small paper sits on Home, which has its own h1 */
  if (compact) return `<header class="dp-mast">${top}${name}</header>`;
  const n = D.live.length, left = n ? V2.prDaysLeft(D.live[0]) : null, one = n > 1 ? 'One' : 'It';
  const ends = left == null ? '' : left <= 0 ? `${one} ends today` : left === 1 ? `${one} ends tomorrow` : `${one} ends in ${left} days`;
  const post = `<a class="dp-box dp-pk" href="#gifts" aria-label="In the post: ${n ? V2.dpPlural(n, 'gift') + ' waiting' + (ends ? '. ' + ends : '') : 'no gifts waiting right now'}. Open Mystery Gifts."><small>In the post</small><b class="u">${n ? V2.dpPlural(n, 'gift') + ' waiting' : 'No gifts waiting'}</b><span>${E(ends || 'Every Mystery Gift ›')}</span></a>`;
  const nx = next ? (() => { const w = CAL.when(next)[1].replace(/ /g, '\u00a0'); return `<button type="button" class="dp-box dp-bx" data-dpcal aria-label="Next event: ${E(next.n)}, ${E(CAL.range(next))}, ${E(w)}. Open the upcoming events."><small>Next event</small><b class="u">${E(V2.dpEvShort(next))}</b><span>${E(CAL.range(next))} · ${E(w)}</span></button>`; })()
    : `<span class="dp-box dp-bx"><small>Next event</small><b class="u">None listed</b><span>The calendar updates daily</span></span>`;
  const counts = Object.entries(D.byType).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t, k]) => V2.dpPlural(k, t)); /* the two biggest kinds (maintenance left out): all of them made a three-line date block */
  const mid = `<p class="dp-date"><b class="u"><span class="dp-dl">${E(today.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</span><span class="dp-ds">${E(today.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}))}</span></b><span>${D.recent.length ? [V2.dpPlural(D.recent.length, 'story') + ' in the past 12 months', ...counts].map(E).join(' · ') : 'No stories in the past 12 months'}</span></p>`;
  return `<header class="dp-mast">${top}${name}<div class="dp-boxes">${post}${mid}${nx}</div></header>`; };
// ---------- the lead story and its series row ----------
V2.dpMonGift = (g, cls, noName) => { const p = V2.byName.get(g), E = V2.esc; if (!p) return `<span class="dp-frame dp-ifr ${cls}" aria-hidden="true"></span><span class="dp-gn">${E(g)}</span>`;
  return `<button type="button" class="dp-gb" data-v2mon="${E(g)}" aria-label="${E(V2.disp(g))}: open its page"><span class="dp-frame ${cls}" aria-hidden="true">${V2.mon(g, {bare: true, iw: 80})}</span>${noName ? '' : `<span class="dp-gn">${V2.keepForm(E(V2.disp(g)))}</span>`}</button>`; };
V2.dpSeries = D => { const E = V2.esc, R = D.rounds; if (R.length < 2) return '';
  const cols = R.length <= 7 ? R.length : Math.ceil(R.length / 2), ph = R.length % 3 === 0 ? 3 : R.length % 4 === 0 ? 4 : R.length % 2 === 0 ? 2 : R.length <= 4 ? R.length : 4;
  return `<section class="dp-ser" style="--dp-sc:${cols};--dp-sp:${ph}" aria-label="The series so far"><h3 class="dp-sh u">The series so far, and the gift each round gave out</h3><ol class="dp-sr">${R.map(r => {
    const d = V2.dpDay(r.month.length === 7 ? r.month + '-15' : r.start), mo = d ? d.toLocaleDateString('en-US', {month: 'short'}) : '', cur = r === (D.sr || D.round);
    return `<li class="dp-rd${cur ? ' dp-cur' : ''}"${cur ? ' aria-current="true"' : ''}><b class="dp-mo u">${E(mo)}</b><span class="vh">${E(r.t)}: </span>${r.gift ? V2.dpMonGift(r.gift, 'dp-fs') : '<span class="dp-none">No gift listed</span>'}</li>`; }).join('')}</ol></section>`; };
V2.dpLead = (D, compact) => { const E = V2.esc, L = D.lead;
  if (!L) return `<section class="dp-lead dp-empty"><p class="dp-k">The news desk</p><h2 class="dp-lh u">No stories yet.</h2><p class="dp-sum">Headlines appear here once the news list is filled. Each one opens the full story at its source.</p></section>`;
  const R = D.round, k = R ? D.rounds.indexOf(R) + 1 : 0, when = R && R.start && R.end ? `${V2.dpShort(R.start)} – ${V2.dpShort(R.end)}` : D.end ? V2.dpShort(D.end) : '';
  const name = R ? R.t.replace(/^The /, '').replace(/\s+\S+\s+\d{4}$/, '') : '';
  const yr = R ? R.month.slice(0, 4) : '', sum = k ? `The ${V2.dpOrd(k)} round of ${name ? 'the ' + name : 'the series'} ${!yr || yr === String(new Date().getFullYear()) ? 'this year' : 'in ' + yr}.${D.ended ? ' It has now ended.' : when ? ` Battles run ${when}.` : ''}` : D.ended ? 'This event has now ended.' : '';
  const stamp = D.ended ? `<span class="dp-stamp u" aria-hidden="true">Ended</span>` : '';
  const L2 = R && R.battle && !L.sub ? Object.assign({}, L, {sub: R.battle + ' Battles'}) : L;
  return `<section class="dp-lead${L.t.length > 48 ? ' dp-long' : ''}" aria-label="Lead story">${V2.dpKick(L2)}${stamp}<h2 class="dp-lh u">${V2.dpA(L, E(L.t))}${D.ended ? '<span class="vh"> (ended)</span>' : ''}</h2>
    ${!compact && sum ? `<p class="dp-sum">${E(sum)}</p>` : ''}${stamp && !compact ? stamp.replace('dp-stamp', 'dp-stamp dp-stamp2') : ''}${compact ? '' : V2.dpSeries(D)}</section>`; };
// ---------- interviews, more stories, the coupon ----------
V2.dpBrief = D => { const E = V2.esc; if (!D.brief.length) return '';
  return `<section class="dp-int" aria-label="In brief"><h2 class="dp-ch u">In Brief</h2><ul class="dp-il">${D.brief.map(it => `<li>${V2.dpKick(it)}<h3 class="dp-ih u">${V2.dpA(it, E(it.t))}</h3></li>`).join('')}</ul></section>`; };
V2.dpInter = D => { const E = V2.esc; if (!D.inter.length) return '';
  return `<section class="dp-int" aria-label="Interviews"><h2 class="dp-ch u">Interviews</h2><ul class="dp-il">${D.inter.map(it => `<li>${V2.dpKick(it, false)}<h3 class="dp-ih u">${V2.dpA(it, E(it.t))}</h3>${it.url ? `<a class="dp-read" href="${E(it.url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">Read the Interview ›</a>` : ''}</li>`).join('')}</ul></section>`; };
V2.dpStory = it => { const E = V2.esc, p = it.gift && V2.byName.get(it.gift);
  return `<article class="dp-st">${V2.dpKick(it)}<h3 class="dp-sth u">${V2.dpA(it, E(it.t))}</h3>${it.url ? `<a class="dp-read" href="${E(it.url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">Read the Story ›</a>` : ''}
    ${p ? `<div class="dp-pic">${V2.dpMonGift(it.gift, 'dp-fp', true)}<p class="dp-cap">Gift listed with this story: ${E(V2.disp(it.gift))}.</p></div>` : it.gift ? `<p class="dp-cap">Gift listed with this story: ${E(it.gift)}.</p>` : ''}</article>`; };
V2.dpCoupon = D => { const E = V2.esc, g = D.coupon;
  if (!g) return `<aside class="dp-cpn dp-cpn0" aria-label="Clip and claim"><i class="dp-sc" aria-hidden="true">✂</i><p class="dp-k dp-rk">Clip and claim · Mystery Gift</p><h3 class="dp-cph u">Nothing to clip today.</h3><p class="dp-cpm">The next gift code lands here. <a class="dp-lk" href="#gifts">All Mystery Gifts ›</a></p></aside>`;
  /* the Post Room's reader (V2.prG), days left (V2.prDaysLeft) and dates (V2.prDate: a day-only date as its UTC day, an exact one local) */
  const md = {month: 'short', day: 'numeric'}, left = V2.prDaysLeft(g), when = [V2.prDate(g.start, md, g.dayStart), V2.prDate(g.end, md, g.dayEnd)].filter(Boolean).join(' – '), how = V2.PR_HOW[g.how] || '';
  return `<aside class="dp-cpn" aria-label="Clip and claim: ${E(g.name)}"><i class="dp-sc" aria-hidden="true">✂</i><p class="dp-k dp-rk">Clip and claim · Mystery Gift</p><h3 class="dp-cph u">${E(g.name)}</h3>
    ${V2.prCopyRow(g.code, ' dp-crow')}
    <p class="dp-cpm">${left != null && left >= 0 ? `<b>${E(V2.dpLeftTxt(left))}.</b> ` : ''}${E([how, when].filter(Boolean).join(', '))}${how || when ? '. ' : ''}Blue characters are numbers. <a class="dp-lk" href="#gifts">All Mystery Gifts ›</a></p></aside>`; };
// ---------- The Back Page: Latest Result, Top Ratings, Next Events (Sim, Nov 18, 2c: the word list's names, were The Standings / Fixtures) ----------
V2.dpLatest = () => { const E = V2.esc; let c = null; try { c = homeChamp(); } catch (e) {}
  if (!c) return `<section class="dp-bc dp-res"><h3 class="dp-ch u">Latest Result</h3><p class="dp-sum">Tournament results appear here after the next data refresh.</p></section>`;
  const ev = c.ev;
  return `<section class="dp-bc dp-res" aria-label="Latest result"><h3 class="dp-ch u">Latest Result</h3><button type="button" class="dp-evt u" data-evgo="${E(ev.id)}" aria-label="${E(V2.evTitle(ev.name))}: open the placings">${E(V2.evTitle(ev.name))}</button>
    <p class="dp-meta">${E(evDate(ev.date))} · ${ev.players > 0 ? homeNum(ev.players) + ' players · ' : ''}the winner's six</p><ul class="dp-six">${c.six.map(m => `<li>${V2.dpMonGift(m.p.n, 'dp-f6')}</li>`).join('')}</ul></section>`; };
V2.dpStand = () => { const E = V2.esc; let rows = []; try { rows = lairRows().filter(x => x.r && x.r.tc).slice(0, 5); } catch (e) {}
  return `<section class="dp-bc dp-std" aria-label="Top Ratings"><h3 class="dp-ch u">Top Ratings</h3>${rows.length ? `<ol class="dp-tb">${rows.map(x => { const R = monRating(x.p), k = lairRank(x.p);
    return `<li><button type="button" class="dp-row" data-v2mon="${E(x.p.n)}" aria-label="Rank ${k ? k.rank : ''}: ${E(x.p.d)}${R ? ', ' + R.tier + ' tier, rating ' + R.n : ''}. Open its page."><b class="dp-rk1 u" aria-hidden="true">${k ? k.rank : ''}</b><span class="dp-rn">${V2.keepForm(E(x.p.d))}</span><small aria-hidden="true">${R ? E(R.tier) + ' tier' : ''}</small><b class="dp-rv u" aria-hidden="true">${R ? R.n : ''}</b></button></li>`; }).join('')}</ol>` : '<p class="dp-sum">Ratings appear after the next data refresh.</p>'}
    <a class="dp-lk dp-all" href="#meta">All Ratings ›</a></section>`; };
V2.dpFix = () => { const E = V2.esc, next = V2.dpNext(), shown = next.slice(0, 3);
  return `<section class="dp-bc dp-fix" aria-label="Next Events"><h3 class="dp-ch u">Next Events</h3>${shown.length ? `<ul class="dp-fl">${shown.map(e => { const d = new Date(e.s + 'T12:00:00'), w = CAL.when(e)[1].replace(/ /g, '\u00a0'), pl = V2.dpPlace(e);
    const inner = `<b class="dp-fd u" aria-hidden="true">${d.getDate()}</b><span class="dp-fn">${E(e.n)}</span><small>${E(CAL.range(e))}${pl ? ' · ' + E(pl) : ''}\u00a0· ${E(w)}</small>`;
    const u = V2.safeUrl(e.url);
    return `<li>${u ? `<a class="dp-fr" href="${E(u)}" target="_blank" rel="noopener" aria-label="${E(e.n)}, ${E(CAL.range(e))}${pl ? ', ' + E(pl) : ''}, ${E(w)}: details (opens a new tab)">${inner}</a>` : `<span class="dp-fr">${inner}</span>`}</li>`; }).join('')}</ul>` : '<p class="dp-sum">No upcoming events listed right now.</p>'}
    ${next.length ? `<button type="button" class="dp-lk dp-all" data-dpcal>All ${homeNum(next.length)} Next Events ›</button>` : ''}</section>`; };
// ---------- Classifieds: four playful one-liners, each opening a tool (new words; Sim hasn't signed them off) ----------
V2.dpAds = () => { const E = V2.esc; let top = ''; try { const r = lairRows().filter(x => x.r && x.r.tc)[0]; top = r ? r.p.d : ''; } catch (e) {}
  const ads = [['Wanted', "A turn 1 plan for tonight's match.", 'Apply at Battle', 'battle'], ['For Hire', 'Team builder, works from real winning teams.', 'Ask for Build', 'build'],
    ['Lost', `One win streak.${top ? ` Last seen before a ${top}.` : ''}`, 'Check My Team', 'team'], ['Notice', 'Damage numbers checked while you wait.', 'See Damage Calc', 'calc']];
  return `<section class="dp-ads" aria-label="Classifieds"><h2 class="dp-adh u">Classifieds</h2><ul class="dp-al">${ads.map(([k, t, a, h]) => `<li><a class="dp-ad" href="#${h}"><small class="dp-adk">${E(k)}</small><span>${V2.keepForm(E(t))} <b>${E(a)} ›</b></span></a></li>`).join('')}</ul></section>`; };
// ---------- the piece ----------
V2.dpFront = (post, o = {}) => { const E = V2.esc; if (post === undefined) post = V2.postNow(); const D = V2.dpParts(post);
  if (o.compact) { const more = [...D.stories, ...(D.inter.length ? D.inter : D.brief)].slice(0, 4), nx = V2.dpNext()[0];
    return `<article class="dp-paper dp-small" aria-label="The Champions Dispatch, front page">${V2.dpMast(D, true)}${V2.dpLead(D, true)}
      ${more.length ? `<ul class="dp-more">${more.map(it => `<li>${V2.dpKick(it)}<p class="dp-mh u">${V2.dpA(it, E(it.t))}</p></li>`).join('')}</ul>` : ''}
      ${nx ? `<p class="dp-nbar"><b class="u">Next event</b><span>${E(V2.dpEvShort(nx))} · ${E(CAL.range(nx))} · ${E(CAL.when(nx)[1])}</span></p>` : ''}</article>`; }
  const side = D.inter.length ? V2.dpInter(D) : V2.dpBrief(D), right = side || V2.dpCoupon(D), row2 = [...D.stories.map(V2.dpStory), ...(side ? [V2.dpCoupon(D)] : [])];
  return `<article class="dp-paper" aria-label="The Champions Dispatch, front page">${V2.dpMast(D, false)}
    <div class="dp-r1${D.lead ? '' : ' dp-r1e'}">${V2.dpLead(D, false)}${right}</div>
    ${row2.length ? `<div class="dp-r2" style="--dp-cols:${side ? (D.stories.length ? `repeat(${D.stories.length},minmax(0,1fr)) ` : '') + 'minmax(0,1.2fr)' : `repeat(${row2.length},minmax(0,1fr))`}">${row2.join('')}</div>` : ''}
    <section class="dp-back" aria-label="The Back Page"><h2 class="dp-bar u"><span>The Back Page</span><small>From around NastyPlot</small></h2><div class="dp-bk">${V2.dpLatest()}${V2.dpStand()}${V2.dpFix()}</div></section>
    ${V2.dpAds()}</article>`; };
V2.pages.news = {place: 'home', draw() { const E = V2.esc, post = V2.postNow(), D = V2.dpParts(post), U = V2.dpUi;
  const note = `<p class="dp-note">${D.checked ? `News list checked ${E(V2.dpShort(D.checked))}. ` : ''}Each headline opens the full story at its source.</p>`;
  const earlier = D.rest.length ? `<button type="button" class="dp-lk dp-earl" data-dpmore aria-expanded="${!!U.more}" aria-controls="dp-earlier">Earlier Editions · ${V2.dpPlural(D.rest.length, 'more story')} ${U.more ? '‹' : '›'}</button>` : '';
  const list = D.rest.length && U.more ? `<ul class="dp-erl" id="dp-earlier">${D.rest.map(it => `<li>${V2.dpKick(it)}<p class="dp-mh u">${V2.dpA(it, E(it.t))}</p></li>`).join('')}</ul>` : '';
  return `<div class="dp"><p class="np-eyebrow dp-crumb"><span>Home · Champions News</span></p>${V2.dpFront(post)}<div class="dp-under${earlier ? '' : ' dp-solo'}">${earlier}${note}</div>${list}</div>`; }};
document.addEventListener('click', async e => { const b = e.target.closest && e.target.closest('[data-dpmore],[data-dpcal]'); if (!b) return; const d = b.dataset;
  if (d.dpmore != null) { V2.dpUi.more = !V2.dpUi.more; V2.redraw(); return; }
  if (d.dpcal != null) { V2.evUi.open = null; V2.evUi.cal = true; location.hash = '#events'; V2.evScrollTo('.ev-plate'); } });
