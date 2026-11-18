// ---------- Mystery Gifts, "The Post Room" (#gifts; Sim, Nov 18). Brief: docs/rebuild/postroom/BRIEF.md ----------
// Every Mystery Gift is a parcel: live gifts wait at the counter with the code on the shipping label; every past gift becomes a postage
// stamp, postmarked the day it ended. Data: V2.postNow() (post-data.js) from POST in src/data/post.js; live vs past by the clock.
//
// Shared pieces (one family: Home's post band, stampede-post.js, and the Dispatch coupon use these too). Each returns HTML.
//   V2.prParcel(gift, {compact})  a kraft parcel: tape, the shipping label (V2.prLabel) and the days-left rubber stamp (V2.prRubber).
//                                 compact: a smaller parcel for a band or a coupon (label in one column, smaller type, no barcode).
//   V2.prLabel(gift, {compact})   the white shipping label alone: "Mystery Gift", Contents, how it is given + sent date, Collect by,
//                                 the code (V2.prCode) with a Copy Code button (data-prcopy; handled on every page), a barcode.
//   V2.prCode(code)               the code, digits in blue and letters in ink (so 1/I and 0/O differ), with screen-reader text that
//                                 spells it ("L, A, 1, ..."); the visible code stays selectable text. '' for no code.
//   V2.prStamp(gift)              a perforated postage stamp for a past gift: framed picture (Pokémon render or item line drawing),
//                                 month and year, name, how it was given (pink event / blue serial code / gold Battle Pass) and the
//                                 round "Ended" postmark. A Pokémon stamp is a button: its nature and moves if POST has them, else its page.
//   V2.prDaysLeft(gift, now?)     whole days to the gift's last day (a day-only end: UTC day against UTC today; an exact end: the
//                                 viewer's local days): 0 = ends today (never below 0 while live), -1 = ended, null = no end date.
//                                 Red at 7 or fewer (V2.PR_SOON), blue above. The Dispatch and Home's band use it too.
//   V2.prCopyRow(code, cls)       the code box with its Copy Code button (the label and the Dispatch coupon).
//   V2.prRubber(gift)             the rubber stamp with the days left ("5 days left", "Last day"), red when soon, blue otherwise.
//   V2.prArt(gift)                the stamp picture alone (Pokémon render, or the item's inline SVG line drawing).
//
// A gift in POST.gifts. The fields this page reads (also accepted, in brackets, for the data helper's spelling):
//   name    what's inside, as the game names it ("2 Training Tickets") [contents, title]; a Pokémon gift may leave it out
//   mon     a Pokémon gift: its name as the site writes it (V2.byName keys: "Indeedee-F", "Incineroar") [pokemon]
//   how     'event' (Event gift), 'serial' (Serial code) or 'pass' (Battle Pass) [via, method, type]; a gift with a code and no
//           'how' is a serial code
//   start, end   UTC times (ISO); no end = "End date not confirmed"
//   code    the shared code, only from a cited source; null for gifts that need none
//   item    'ticket' | 'coupon' | 'shirt' | 'vp' | 'gift' (its picture) [icon]; read from the name when missing
//   amount  the number on a coupon or VP stamp; read from the name when missing
//   nature, ability, held, moves[]   a Pokémon gift's set, only from a cited source (its stamp then opens them)
//   src     [{name, url}] source links [sources; a single url string also works]
//   id      a unique key (default: name and end)
V2.PR_SOON = 7; // days: most event codes run 1-2 weeks (docs/rebuild/research/mystery-gift-sources-nov18.md), so 7 or fewer is "its last week"
V2.prUi = {f: 'all', all: false};
V2.PR_KIND = {'event gift': 'event', 'early download': 'early', 'serial code': 'serial', 'battle pass': 'pass', 'competition prize': 'prize', 'livestream reward': 'stream'};
V2.PR_ITEM = {'quick coupon': 'coupon', 'training ticket': 'ticket', 'teammate ticket': 'ticket', 'vp': 'vp', 'clothing': 'shirt', 'trainer icon': 'icon'};
V2.prG = g => { if (!g) return null; const s = x => (x == null ? '' : String(x)).trim();
  const isMon = g.kind === 'pokemon' || (!g.kind && !!(g.mon || g.pokemon)), mon = isMon ? s(g.mon || g.pokemon || g.name) : '', code = s(g.code).replace(/\s+/g, '') || null;
  const hw = s(g.how || g.via || g.method || g.type).toLowerCase(), how = V2.PR_KIND[hw] || (/pass/.test(hw) ? 'pass' : /serial|code/.test(hw) ? 'serial' : /prize|competition/.test(hw) ? 'prize' : /stream|twitch/.test(hw) ? 'stream' : /early/.test(hw) ? 'early' : code ? 'serial' : 'event');
  const base = s(g.name || g.contents || g.title) || (mon ? V2.disp(mon) : 'Mystery Gift'), nm = (s(g.item || g.icon) + ' ' + base).toLowerCase();
  const item = isMon ? null : V2.PR_ITEM[s(g.item || g.icon).toLowerCase()] || (/coupon/.test(nm) ? 'coupon' : /ticket/.test(nm) ? 'ticket' : /\bvp\b|victory point/.test(nm) ? 'vp' : /shirt|cloth|cap\b|hat\b|apparel|outfit|jacket|hoodie/.test(nm) ? 'shirt' : /icon|title/.test(nm) ? 'icon' : 'gift');
  const n = +String(g.amount == null ? '' : g.amount).replace(/,/g, ''), many = !isMon && n > 1;
  // "100 Quick Coupons", "2 Training Tickets", "5,000 VP": the amount goes in front, unless the name already carries a number
  const name = many && !/\d/.test(base) ? `${n.toLocaleString('en-US')} ${base}${/(s|VP)$/.test(base) ? '' : 's'}` : base;
  const am = !isMon ? (Number.isFinite(n) && n > 0 ? n.toLocaleString('en-US') : ((base.match(/\d[\d,]*/) || [''])[0])) : '';
  const host = u => { try { return V2.officialHost(u) ? 'the official news' : new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'Source'; } };
  const src = (Array.isArray(g.src || g.sources) ? (g.src || g.sources) : (g.src || g.source) ? [g.src || g.source] : []).map(x => typeof x === 'string' ? {name: host(x), url: x} : x)
    .filter(x => x && V2.safeUrl(x.url)).map(x => ({...x, url: V2.safeUrl(x.url)})); /* https only (V2.safeUrl, post-data.js): the same check as the Dispatch */
  const ap = Array.isArray(g.approx) ? g.approx : [];
  const known = mon && V2.byName && V2.byName.get(mon) ? mon : null; /* audit (Nov 18): a Pokémon's name is the site's own (V2.disp: 'Indeedee (F)') */
  return {raw: g, id: s(g.id) || base + '|' + s(g.end), name: known ? V2.disp(known) : name, mon: mon && V2.byName && V2.byName.get(mon) ? mon : null, isMon, monName: mon, how, code, item, amount: am,
    start: Date.parse(g.start), end: Date.parse(g.end), dayStart: ap.includes('start'), dayEnd: ap.includes('end'), extras: (g.extras || []).map(s).filter(Boolean),
    nature: s(g.nature), ability: s(g.ability), held: s(g.held && typeof g.held === 'string' ? g.held : ''), moves: (g.moves || []).map(s).filter(Boolean), src}; };
V2.PR_HOW = {event: 'Event gift', early: 'Early download', serial: 'Serial code', pass: 'Battle Pass', prize: 'Competition prize', stream: 'Livestream reward'};
// a gift with no code says why on its label (the words follow post.js's meaning of each 'how')
V2.PR_NOCODE = {event: 'No code: it waits in your in-game mailbox while the campaign runs.', early: 'No code: the early-download bonus arrives in your mailbox.',
  pass: 'No code: earn it in the free Battle Pass this season.', prize: 'No code: finish 3 or more matches in the online competition.',
  stream: 'No shared code: each viewer gets a personal code from the official stream.', serial: 'The code is not confirmed by a source yet.'};
V2.prYr = (t, utc) => Number.isFinite(t) && new Date(t)[utc ? 'getUTCFullYear' : 'getFullYear']() !== new Date().getFullYear() ? {year: 'numeric'} : {}; // one date style (audit W15): "Nov 22", the year only when it isn't this year
V2.prDate = (t, o, utc) => { if (!Number.isFinite(t)) return ''; o = o || {month: 'short', day: 'numeric', ...V2.prYr(t, utc)}; return new Date(t).toLocaleDateString('en-US', utc ? {...o, timeZone: 'UTC'} : o); };
V2.prDayOf = x => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(x || '')); return m ? new Date(+m[1], m[2] - 1, +m[3]).getTime() : Date.parse(x); }; // a date with no time ('checked') is that calendar day, not UTC midnight
V2.prDay = t => { const d = new Date(t); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }; // the viewer's local calendar day, as a number
// THE days-left and dates piece for the whole family (the Post Room, the Dispatch and Home's post band all use these; review, Nov 18):
//   a day-only (approx) date is the source's day, so it is read and shown as its UTC day everywhere (V2.prDate(t, o, true));
//   an exact time is shown in the viewer's own time zone (V2.prDate(t, o)).
// V2.prDayN(t, utc): the calendar day of t as a number, the UTC day or the viewer's local day. Days left compare like with like (the
// UTC day of a day-only end against the UTC day now; a local end against local today), so a gift that is still live is never
// counted as ended in any time zone: 0 on its last day, never -1 ("Last day", "Ends today").
V2.prDayN = (t, utc) => { const d = new Date(t); return utc ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) : V2.prDay(t); };
V2.prDaysLeft = (gift, now = Date.now()) => { const g = gift && gift.raw ? gift : V2.prG(gift); if (!g || !Number.isFinite(g.end)) return null; if (g.end < now) return -1;
  return Math.max(0, Math.round((V2.prDayN(g.end, g.dayEnd) - V2.prDayN(now, g.dayEnd)) / 864e5)); };
V2.prRubber = (gift, now) => { const d = V2.prDaysLeft(gift, now); if (d === -1) return '';
  const soon = d != null && d <= V2.PR_SOON, txt = d == null ? '<span>No end date</span>' : d === 0 ? '<span>Last day</span>' : `<b>${d}</b> <span>${d === 1 ? 'day' : 'days'} left</span>`;
  return `<p class="pr-rub u ${soon ? 'pr-soon' : 'pr-plenty'}">${txt}</p>`; };
// the code: digits blue, letters ink; spelled for screen readers; the spelled copy is never selected with the code
V2.prCode = code => { const c = String(code || '').replace(/\s+/g, ''); if (!c) return '';
  const vis = [...c].map(ch => /\d/.test(ch) ? `<b class="pr-d">${ch}</b>` : V2.esc(ch)).join('');
  return `<span class="pr-code"><span class="pr-cv" aria-hidden="true">${vis}</span><span class="vh pr-spell">${V2.esc([...c].join(', '))}</span></span>`; };
// the Copy Code row: the code box and its Copy Code button (data-prcopy, handled below); the Post Room label and the Dispatch coupon
// (cls ' dp-crow') share it. Home's code slip keeps its own layout (stampede-post.js).
V2.prCopyRow = (code, cls = '') => `<div class="pr-crow${cls}"><div class="pr-cbox"><p class="pr-k">Code</p>${V2.prCode(code)}</div><button type="button" class="np-btn pr-copy" data-prcopy="${V2.esc(String(code || '').replace(/\s+/g, ''))}"><span>Copy Code</span></button></div>`;
// a barcode drawn from the code (decorative), so each label's bars differ
V2.prBars = key => { let h = 2166136261; const s = String(key || 'gift'); let x = 0, out = '';
  for (let i = 0; x < 236; i++) { h = Math.imul(h ^ s.charCodeAt(i % s.length) ^ i, 16777619) >>> 0; const w = 1 + (h & 3), gap = 1 + ((h >> 3) & 1) + ((h >> 5) & 1); out += `<rect x="${x}" width="${w}" height="24"/>`; x += w + gap; }
  return `<svg class="pr-bars" viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">${out}</svg>`; };
V2.prLabel = (gift, o = {}) => { const g = gift && gift.raw ? gift : V2.prG(gift), E = V2.esc; if (!g) return '';
  const left = V2.prDaysLeft(g), end = !Number.isFinite(g.end) ? 'End date not confirmed' : g.dayEnd ? V2.prDate(g.end, undefined, true) : `${V2.prDate(g.end)}<small>until ${new Date(g.end).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}</small>`;
  const code = g.code ? V2.prCopyRow(g.code) : `<p class="pr-none">${V2.PR_NOCODE[g.how]}</p>`;
  const src = g.src.length && !o.compact ? `<p class="pr-src">Source: ${g.src.slice(0, 2).map(x => `<a href="${E(x.url)}" target="_blank" rel="noopener noreferrer">${E(x.name || 'Source')}</a>`).join(' and ')}</p>` : '';
  return `<div class="pr-label${o.compact ? ' pr-cpt' : ''}"><p class="pr-lt u">Mystery Gift</p><dl class="pr-meta"><div class="pr-what"><dt>Contents</dt><dd class="u">${E(g.name)}</dd>${g.extras.length && !o.compact ? `<dd class="pr-also">Also inside: ${g.extras.map(E).join(', ')}</dd>` : ''}</div>
    <div><dt>${V2.PR_HOW[g.how]}</dt><dd>${Number.isFinite(g.start) ? 'Sent ' + V2.prDate(g.start, {month: 'short', day: 'numeric'}, g.dayStart) : 'Sent date not confirmed'}</dd></div>
    <div><dt>Collect by</dt><dd>${end}</dd></div></dl>${code}${o.compact ? '' : V2.prBars(g.code || g.id)}${src}${left != null && left >= 0 ? `<span class="vh">, ${left === 0 ? 'last day to collect it' : `${left} ${left === 1 ? 'day' : 'days'} left`}</span>` : ''}</div>`; };
V2.prParcel = (gift, o = {}) => { const g = gift && gift.raw ? gift : V2.prG(gift); if (!g) return '';
  return `<article class="pr-parcel${o.compact ? ' pr-cpt' : ''}" aria-label="Mystery Gift: ${V2.esc(g.name)}"><i class="pr-tape" aria-hidden="true"></i>${V2.prLabel(g, o)}<div aria-hidden="true">${V2.prRubber(g)}</div></article>`; };
// item pictures: our own line drawings (no image files; Sim's open point: stand-ins)
V2.PR_ART = {
  ticket: '<path d="M6 10h52v9a5 5 0 0 0 0 10v9H6v-9a5 5 0 0 0 0-10z"/><path d="M42 12v24" stroke-dasharray="3 4"/>',
  coupon: '<path d="M6 10h52v9a5 5 0 0 0 0 10v9H6v-9a5 5 0 0 0 0-10z"/><circle cx="25" cy="19" r="3"/><circle cx="39" cy="29" r="3"/><path d="M41 16 23 32"/>',
  shirt: '<path d="M24 7 10 13l5 11 6-3v21h22V21l6 3 5-11-14-6c-1 4-4 6-8 6s-7-2-8-6z"/>',
  vp: '<circle cx="32" cy="24" r="17"/><path d="m22 17 5 14 5-14M37 31V17h5a4 4 0 0 1 0 8h-5"/>',
  ball: '<circle cx="32" cy="24" r="18"/><path d="M14 24h12M38 24h12"/><circle cx="32" cy="24" r="6"/>',
  icon: '<rect x="14" y="6" width="36" height="36" rx="6"/><circle cx="32" cy="20" r="6"/><path d="M21 36c2-6 6-9 11-9s9 3 11 9"/>',
  gift: '<path d="M12 20h40v20H12zM8 13h48v7H8zM32 13v27"/><path d="M32 13c-4-7-12-7-12-2s8 2 12 2c4 0 12 3 12-2s-8-5-12 2z"/>'};
V2.prArt = gift => { const g = gift && gift.raw ? gift : V2.prG(gift); if (!g) return '';
  if (g.mon) return `<span class="pr-mon">${V2.mon(g.mon, {bare: true, iw: 120})}</span>`;
  const amt = (g.item === 'coupon' || g.item === 'vp') && g.amount ? `<b class="pr-amt u">${V2.esc(g.amount)}</b>` : '', k = g.isMon ? 'ball' : g.item; /* a Pokémon with no sprite in our art: a Poké Ball line drawing */
  return `<span class="pr-item">${amt}<svg viewBox="0 0 64 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${V2.PR_ART[k] || V2.PR_ART.gift}</g></svg></span>`; };
V2.prStamp = gift => { const g = gift && gift.raw ? gift : V2.prG(gift), E = V2.esc; if (!g) return '';
  const t = Number.isFinite(g.start) ? g.start : g.end, tu = Number.isFinite(g.start) ? g.dayStart : g.dayEnd, my = Number.isFinite(t) ? `${V2.prDate(t, {month: 'short'}, tu)} '${V2.prDate(t, {year: '2-digit'}, tu)}` : '';
  const set = g.mon && (g.nature || g.moves.length), ended = Number.isFinite(g.end) ? `ended ${V2.prDate(g.end, undefined, g.dayEnd)}` : 'end date not confirmed';
  const inner = `<span class="pr-pic"><span class="pr-my u" aria-hidden="true">${E(my)}</span>${V2.prArt(g)}</span><span class="pr-nm">${E(g.name)}</span><span class="pr-how">${V2.PR_HOW[g.how]}</span>`
    + `<span class="vh">${my ? `, from ${E(V2.prDate(t, {month: 'long', year: 'numeric'}, tu))}` : ''}, ${ended}${g.mon ? (set ? '. Opens its nature and moves' : `. Opens ${E(V2.disp(g.mon))}'s page`) : ''}</span>`;
  const st = g.mon ? `<button type="button" class="pr-st" ${set ? `data-prset="${E(g.id)}"` : `data-v2mon="${E(g.mon)}"`}>${inner}</button>` : `<div class="pr-st">${inner}</div>`;
  const pm = Number.isFinite(g.end) ? `<span class="pr-pm" aria-hidden="true"><svg viewBox="0 0 60 24" focusable="false"><path d="M0 6q7.5-5 15 0t15 0 15 0 15 0M0 12q7.5-5 15 0t15 0 15 0 15 0M0 18q7.5-5 15 0t15 0 15 0 15 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span><span class="pr-pmw">Ended<br></span>${E(V2.prDate(g.end, {month: 'short', day: 'numeric'}, g.dayEnd))}</span></span>` : '';
  return `<li class="pr-sw pr-${g.how}">${st}${pm}</li>`; };
// the set a Pokémon gift came with (only when POST has it, from a cited source)
V2.prSet = id => { const P = V2.postNow(), g = [...P.live, ...P.past].map(V2.prG).find(x => x.id === id), E = V2.esc; if (!g) return;
  const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${E(v)}</dd></div>` : '';
  V2.sheet(`<div class="pr-setsh"><p class="np-eyebrow"><span>Mystery Gift · ${V2.PR_HOW[g.how]}</span></p><h2 class="u">${E(g.name)}</h2>${V2.mon(g.mon, {bare: true, iw: 160})}
    <dl class="pr-setdl">${row('Nature', g.nature)}${row('Ability', g.ability)}${row('Held item', g.held)}${row('Also inside', g.extras.join(', '))}${g.moves.length ? `<div><dt>Moves</dt><dd><ul>${g.moves.map(m => `<li>${E(m)}</li>`).join('')}</ul></dd></div>` : ''}</dl>
    ${g.src.length ? `<p class="pr-src">Source: ${g.src.map(x => `<a href="${E(x.url)}" target="_blank" rel="noopener noreferrer">${E(x.name || 'Source')}</a>`).join(', ')}</p>` : ''}
    <button type="button" class="np-btn2" data-v2mon="${E(g.mon)}"><span>Open ${E(V2.disp(g.mon))}'s Page</span></button></div>`, {label: g.name, small: true}); };
// the empty counter: an empty parcel shelf and one line (Sim decides the final words)
V2.prShelf = () => `<div class="pr-shelf"><svg class="pr-box0" viewBox="0 0 120 72" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M14 30h92v38H14z"/><path d="M14 30 4 14h48l8 16M106 30l10-16H68l-8 16"/><path d="M48 46h24" stroke-dasharray="4 5"/></g></svg>
  <p class="u">Nothing at the counter right now.</p><p>The next gift will wait here.</p></div>`;
V2.prHow = () => `<aside class="pr-howto" aria-labelledby="prHowH"><h3 class="u" id="prHowH">How to collect</h3><ol><li>In the game, open the Submenu and choose Mystery Gift.</li><li>Enter the code from the label.</li><li>The gift arrives in your Mailbox.</li></ol>
  <p>A code can stop early or not work in every account. Real codes never ask for your password.</p></aside>`;
V2.pages.gifts = {place: 'home', draw() { const E = V2.esc, U = V2.prUi, P = V2.postNow(), live = P.live.map(V2.prG), past = P.past.map(V2.prG), now = Date.now();
  const left = live.map(g => V2.prDaysLeft(g, now)).filter(d => d != null && d >= 0), soonest = left.length ? Math.min(...left) : null;
  const since = !live.length && past.length && Number.isFinite(past[0].end) ? Math.round((V2.prDayN(now, past[0].dayEnd) - V2.prDayN(past[0].end, past[0].dayEnd)) / 864e5) : null;
  const num = (n, l) => `<p><b class="u">${n}</b><span>${l}</span></p>`;
  // a day count of 0 shows the word "Today", never a lone "0" beside "ends today" (review, Nov 18); no "0 gifts so far" when there are none
  const nums = live.length ? num(live.length, 'to claim') + (soonest != null ? (soonest === 0 ? num('Today', 'one ends') : num(soonest, soonest === 1 ? 'day until one ends' : 'days until one ends')) : '') + num(live.length + past.length, 'gifts so far')
    : num(0, 'to claim') + (since != null ? (since === 0 ? num('Today', 'the last one ended') : num(since, since === 1 ? 'day since the last one ended' : 'days since the last one ended')) : '') + (past.length ? num(past.length, 'gifts so far') : '');
  const stats = `<div class="pr-stats"><p class="ev-pk${live.length ? '' : ' pr-pk-off'}">${live.length ? 'Live right now' : 'Nothing live right now'}</p><div class="pr-nums">${nums}</div></div>`;
  const head = `<div class="pr-top"><section class="ra-h"><p class="np-eyebrow"><span><a class="np-back" href="#home">Home</a> · Mystery Gifts</span></p><h1 class="u"><span>Special delivery.</span> <span class="pl">No postage due.</span></h1>
    <p class="ra-lede">Every Mystery Gift in Pokémon Champions, parcel by parcel. The code is on the label, and so is the last day to collect it.</p></section>${stats}</div>`;
  const key = live.some(g => g.code && /\d/.test(g.code)) ? `<p class="pr-key"><span class="pr-cv" aria-hidden="true"><b class="pr-d">1</b> <b class="pr-d">0</b> <b class="pr-d">2</b></span> Blue characters are numbers. The rest are letters.</p>` : '';
  const counter = `<section class="pr-counter" aria-labelledby="prCtrH"><header class="pr-sh"><h2 class="u" id="prCtrH">Waiting at the Counter</h2>${key}</header>
    ${live.length ? `<div class="pr-parcels${live.length % 2 ? ' odd' : ''}">${live.map(g => V2.prParcel(g)).join('')}${V2.prHow()}</div>` : V2.prShelf()}</section>`;
  const n = {all: past.length, mon: past.filter(g => g.isMon).length, item: past.filter(g => !g.isMon).length};
  const list = U.f === 'mon' ? past.filter(g => g.isMon) : U.f === 'item' ? past.filter(g => !g.isMon) : past, cap = 12, shown = U.all ? list : list.slice(0, cap);
  // blank stamp spaces finish the last row at every width (6, 4, 3 or 2 across): a blank shows only where its row needs it
  const pad = c => (c - shown.length % c) % c, bl = Math.max(pad(6), pad(4), pad(3), pad(2));
  const blanks = shown.length ? Array.from({length: bl}, (_, i) => `<li class="pr-blank${i < pad(6) ? ' b6' : ''}${i < pad(4) ? ' b4' : ''}${i < pad(3) ? ' b3' : ''}${i < pad(2) ? ' b2' : ''}" aria-hidden="true"></li>`).join('') : '';
  const mons = past.filter(g => g.mon), sets = mons.filter(g => g.nature || g.moves.length).length; /* the line promises only what POST holds (audit W14) */
  const chips = `<div class="ev-f pr-f" role="group" aria-label="Which stamps">${[['all', 'All'], ['mon', 'Pokémon'], ['item', 'Items']].map(([k, t]) => `<button type="button" class="np-chip ev-fc" data-prf="${k}" aria-pressed="${U.f === k}">${t}<small>${n[k]}</small></button>`).join('')}</div>`;
  const more = list.length > cap ? `<button type="button" class="np-link pr-more" data-prmore aria-expanded="${U.all}">${U.all ? 'Show Fewer Stamps' : `Show All ${list.length} Stamps ›`}</button>` : '';
  const note = `<p class="fine pr-note">${P.checked ? `Gift list checked ${E(V2.prDate(V2.prDayOf(P.checked), {month: 'short', day: 'numeric'}))}. ` : ''}Dates are each campaign's listed end times, shown in your time zone. A code can stop working early.</p>`;
  const sheet = `<section class="pr-stamps" aria-labelledby="prStH"><header class="pr-sh"><h2 class="u" id="prStH">The Stamp Sheet</h2><p>Every gift so far gets a stamp, postmarked the day it ended. ${!mons.length ? '' : sets === mons.length ? 'Tap a Pokémon for the nature and moves it came with.' : sets ? 'Tap a Pokémon for its page, or for the nature and moves it came with where a source lists them.' : 'Tap a Pokémon to open its page.'}</p></header>
    ${past.length ? chips : ''}${shown.length ? `<ul class="pr-sheet">${shown.map(V2.prStamp).join('')}${blanks}</ul>` : `<p class="pr-nost">${past.length ? 'No stamps of this kind yet.' : 'No stamps yet. Each gift gets one the day it ends.'}</p>`}${more}${note}</section>`;
  return `<div class="ra pr">${head}${counter}${sheet}</div>`; }};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-prcopy],[data-prf],[data-prmore],[data-prset]'); if (!b) return; const d = b.dataset;
  if (d.prcopy) { const c = d.prcopy; V2.copy(c).then(ok => V2.toast(ok ? `Copied ${V2.esc(c)}` : 'Could not copy here: your browser blocked it. Select the code on the label instead.')); /* the shared copy with its fallback, as Build's Copy for Showdown */ return; }
  if (d.prset) { V2.prSet(d.prset); return; }
  if (d.prf) { V2.prUi.f = d.prf; V2.prUi.all = false; } else if (d.prmore != null) V2.prUi.all = !V2.prUi.all;
  V2.redraw(); });
