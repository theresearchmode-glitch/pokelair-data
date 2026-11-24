// ---------- Home, The Stampede: the hero band (see stampede.js and docs/rebuild/stampede/BRIEF.md) ----------
// V2.sdHero = () => html; V2.sdHeroAfter = () => {} runs after every draw and redraw (lays the herd out, adds the crowd once).
// Every Pokémon the Ratings page rates (V2.sdData().herd, live data) is in the picture, sized by its rating: the ones with tournament
// results in rating order, the rest at the back of the crowd. Two layouts, chosen by the window width (CSS and V2.sdhRow agree at 900px):
//   row  (900+):  the top four huge in the front row with white plates (3rd, 1st, 2nd, 4th left to right), ranks 5-12 mid-sized in the
//                 gaps, the rest a crowd shrinking back to the horizon behind the tagline.
//   pair (<900):  the top two huge with plates inset evenly from their edges, 3 and 4 above them, then 5-10 mid-sized, the crowd.
// Speed: the tagline, buttons, the top four and the mid-sized ones are drawn at once (14 pictures); the crowd (330+ small pictures) is
// added once the page has loaded and those 14 are in (V2.sdHeroAfter), highest rated asked for first, so it never competes with the
// first screen. Measured Nov 18 (4x CPU, slow 4G): buttons and top four appear at the same time with or without the crowd; the crowd
// adds 4.6 MB (7.5 MB with one sprite size, the Claude-hosted build) and finishes about 40 s later.
// Motion (Sim approved Nov 18): the herd surges forward once on arrival and the ticker scrolls slowly (sd-motion.css, V2.sdhTick
// below); nothing moves with prefers-reduced-motion. The crowd and the mid-sized herd are decorative (aria-hidden); every named
// Pokémon (plate, ticker) is a button that opens its page (data-v2mon).
V2.sdhUi = {crowd: null, key: '', ro: null, el: null, raf: 0, armed: false};
V2.SDH_SLOPE = 0.05; // the tilt (rises 5% to the right, as the mock-up's band edges): about 2.86 degrees
V2.sdhRow = () => !window.matchMedia || matchMedia('(min-width:900px)').matches;
V2.sdhTier = x => { try { return lTier(rating(x.p).total).k; } catch (e) { return ''; } };
V2.sdhSay = x => `${V2.disp(x.n)} ${x.r}: rated${x.rank ? ' number ' + x.rank : ''}${V2.sdhTier(x) ? ', ' + V2.sdhTier(x) + ' tier' : ''}: open its page`;
// the herd: every rated Pokémon the Ratings page lists (sdData().herd: with tournament results first, the rest at the back)
V2.sdhRows = () => { const D = V2.sdData(); return D.herd && D.herd.length ? D.herd : D.rows || []; };
V2.sdhSrc = (x, big) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[x.n] : null; return id == null ? '' : V2.art(id, big); };
V2.sdHero = () => {
  const E = V2.esc, D = V2.sdData(), R = V2.sdhRows(), top = R[0] ? R[0].r : 1;
  let has = false; try { has = members().length > 0; } catch (e) {}
  const num = n => Number(n || 0).toLocaleString('en-US');
  // the top four: front sprites (decorative, also clickable) and their plates (the buttons). f1..f4 = rank; CSS puts them in place.
  const k = x => Math.max(0.6, Math.min(1, Math.pow(x.r / top, 2))).toFixed(3); // a lower rating stands a little smaller, never larger
  const front = R.slice(0, 4).map((x, i) => `<div class="sdh-f f${i + 1}" style="--k:${k(x)}" data-v2mon="${E(x.n)}" aria-hidden="true"><span><img src="${V2.sdhSrc(x, true)}" alt="" decoding="async"${i < 2 ? ' fetchpriority="high"' : ''}></span></div>`).join('');
  const plates = R.slice(0, 4).map((x, i) => `<li class="f${i + 1}"><button type="button" class="sdh-plate" data-v2mon="${E(x.n)}" aria-label="${E(V2.sdhSay(x))}"><span class="nm u">${V2.keepForm(E(V2.disp(x.n)))}</span><span class="rt u">${x.r}</span></button></li>`).join('');
  // the herd's named-size part (ranks 3-12): drawn now; JS (V2.sdhLay) places them. No dark name tags on them (Sim, Nov 18: "remove the
  // incineroar and kingambit tags. its too much", then desktop's too): only the white plates name Pokémon in the hero; the ticker names the rest
  const herd = R.slice(2, 12).map((x, j) => { const i = j + 2;
    return `<div class="sdh-m${i < 4 ? ' p34' : ''}" data-sdhi="${i}" data-v2mon="${E(x.n)}" aria-hidden="true"><img src="${V2.sdhSrc(x, true)}" alt="" decoding="async"></div>`; }).join('');
  // the ticker: the next ratings down the list, after the ones with a plate (V2.sdhLayout hides those, and any name that
  // would be cut at the edge)
  const tick = R.slice(2, 20).map((x, j) => `<li data-sdhi="${j + 2}"><button type="button" data-v2mon="${E(x.n)}" aria-label="${E(V2.sdhSay(x))}"><span class="nm u">${V2.keepForm(E(V2.disp(x.n)))}</span> <span class="rt u">${x.r}</span></button></li>`).join('');
  // today's Home order (HOME-06): Score My Team first with a team, Build Me a Team first with none
  const go = has ? `<a class="sdh-b1" data-sdgo href="#team">Score My Team</a><a class="sdh-b2" data-sdgo href="#build"><span>Build Me a Team</span></a>`
    : `<a class="sdh-b1" data-sdgo href="#build">Build Me a Team</a><a class="sdh-b2" data-sdgo href="#team"><span>Score My Team</span></a>`;
  const say = R.length ? `Every one of the ${num(R.length)} Pokémon NastyPlot rates is in this charge. The bigger it stands, the higher its rating${D.teams ? `, worked out from ${num(D.teams)} real tournament teams${V2.freshAgo() ? ` (${V2.freshAgo()})` : ''}` : ''}.`
    : 'Every Pokémon NastyPlot rates is in this charge. The bigger it stands, the higher its rating.';
  return `<section class="sd-band sd-hero sdh${V2.sdhUi.surged || !V2.sdMotion() ? '' : ' sdh-surge'}" aria-labelledby="sdh-h">
    <div class="sdh-fold"><div class="sdh-scene">
      <svg class="sdh-lines" aria-hidden="true" focusable="false"></svg>
      <div class="sdh-crowd" aria-hidden="true"></div><i class="sdh-haze" aria-hidden="true"></i>
      <h1 class="u sdh-h" id="sdh-h"><span class="k-kicker sdh-k"><span class="sdh-ka">The </span>Pokémon Champions coach</span><span class="l1">Sharply raise</span> <span class="l2">your win rate.</span></h1>${V2.sdhChv()}
      <div class="sdh-herd">${herd}</div>
      <div class="sdh-front">${front}</div>
    </div>
    <div class="sdh-ledge"><ul class="sdh-plates" aria-label="The four highest rated">${plates}</ul>
      <p class="sdh-say">${E(say)} <a class="sdh-all" href="#meta">All Ratings ›</a></p>
      <div class="sdh-go hm-go">${go}</div></div></div>
    ${tick ? `<div class="sdh-tick"><ul aria-label="Next in the ratings">${tick}</ul></div>` : ''}
  </section>`; };

// a small fixed pseudo-random number per index (the crowd's jitter stays the same on every draw)
V2.sdhRnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// where each herd member stands. w, h: the scene in px; cx: the four (or two) plate centres; returns [{x, y (feet), s (size), z}] by rank
// index (2..n-1). z: 'm' = in front of the tagline (the mid-sized), 'c' = the crowd behind it, '' = not shown (stands in the front row).
V2.sdhLay = (n, w, h, row, cx, hb) => {
  const out = [], g = (cx[1] - cx[0]) || w / 4;
  if (row) { // mid-sized in the gaps between the front four (cx = centres of the 3rd, 1st, 2nd, 4th): sizes fall with rank
    const gap = i => (cx[i] + cx[i + 1]) / 2, M = [[gap(0), .80, .40], [gap(2), .79, .385], [gap(1), .76, .36], [cx[0] - g * .62, .78, .34], [cx[3] + g * .62, .77, .33],
      [(cx[0] + gap(0)) / 2 - g * .12, .70, .29], [(gap(2) + cx[3]) / 2 + g * .12, .70, .28], [(gap(1) + cx[2]) / 2 + g * .1, .69, .27]];
    out[2] = out[3] = null; M.forEach((m, j) => { out[4 + j] = {x: m[0], y: m[1] * h, s: m[2] * h, z: 'm'}; }); }
  else { // pair: 3 and 4 above the big pair's shoulders, 5-10 smaller between and behind
    // (feet as a share of the room between the tagline and the scene's bottom, so a short phone squeezes them, never the tagline)
    const M = [[.15, .62, .34], [.85, .58, .335], [.50, .5, .30], [.07, .5, .27], [.93, .46, .265], [.35, .4, .24], [.65, .38, .235], [.5, .3, .21]], b = hb || h * .5;
    M.forEach((m, j) => { out[2 + j] = {x: m[0] * w, y: b + m[1] * (h - b), s: Math.min(m[2] * h, m[2] * 1.5 * w), z: 'm'}; }); }
  // the mid-sized stand in front of the crowd and just below the tagline: a head may touch the second line, never climb into it
  // (hb = the tagline's bottom); sizes never grow down the list
  if (hb) { let last = Infinity; for (let j = 2; j < 12; j++) { const p = out[j]; if (!p) continue; p.s = Math.max(0, Math.min(p.s, p.y - (p.x - w / 2) * V2.SDH_SLOPE - hb, last)); last = p.s; } } /* Q13f B (Sim, Nov 18): the head stops at the tagline, never over its words; the feet's tilt (below) counted */
  // the crowd: rows from near to far; the size and the feet line shrink toward the horizon. The spacing factor f is searched so the rows
  // between the near and the far line hold everyone (no empty sky, no Pokémon left out)
  const first = row ? 12 : 10, N = n - first; if (N <= 0) return out;
  const yN = (row ? .66 : .56) * h, yF = (row ? .10 : .07) * h, sN = (row ? .17 : .15) * h, sF = Math.max(14, (row ? .05 : .045) * h), W = w * 1.08;
  const sAt = y => sF + (sN - sF) * (y - yF) / (yN - yF);
  const rows = f => { const r = []; let y = yN, c = 0; while (y >= yF - 1 && c < N) { const s = sAt(y), k = Math.max(3, Math.round(W / (s * f))); r.push({y, s, k}); c += k; y -= s * f * .5; } return {r, c}; };
  let lo = .12, hi = 2.5; for (let it = 0; it < 30; it++) { const mid = (lo + hi) / 2; if (rows(mid).c >= N) lo = mid; else hi = mid; }
  const {r} = rows(lo); let i = first, cap = Infinity; for (let j = 2; j < first; j++) if (out[j]) cap = Math.min(cap, out[j].s);
  r.forEach((q, ri) => { const k = Math.min(q.k, n - i), step = W / k, off = (ri % 2 ? .5 : 0) * step - (W - w) / 2;
    for (let j = 0; j < k && i < n; j++, i++) { const u = V2.sdhRnd(i), v = V2.sdhRnd(i + 999); out[i] = {x: off + (j + .5) * step + (u - .5) * step * .5, y: q.y + (v - .5) * q.s * .18, s: Math.min(q.s, cap), z: 'c'}; /* one size per row: a lower rating never stands larger */ } });
  // the tilt: the floor rises to the right like the band edge
  for (let j = 2; j < n; j++) if (out[j]) out[j].y -= (out[j].x - w / 2) * V2.SDH_SLOPE;
  return out; };
// put one herd picture in place (px; sizes are the square box the picture stands in, feet at its bottom centre)
V2.sdhPut = (el, p) => { if (!p) { el.hidden = true; return; } el.hidden = false; const s = Math.round(p.s);
  el.style.cssText = `left:${Math.round(p.x - s / 2)}px;top:${Math.round(p.y - s)}px;width:${s}px;height:${s}px`;
  const c = el.dataset.cs && V2.sdhSheet(el.dataset.cs); if (!c) return; // a sheet picture: the same square box as a file, its part of the sheet
  const [k, x, y, w, h] = c.m, f = s / 128, bw = w * f, bh = h * f, b = el.firstElementChild; // drawn as object-fit: contain, feet at the bottom centre
  b.style.cssText = `left:${((s - bw) / 2).toFixed(1)}px;width:${bw.toFixed(1)}px;height:${bh.toFixed(1)}px;background-image:url("${c.url}");background-size:${(c.w * f).toFixed(1)}px ${(c.h * f).toFixed(1)}px;background-position:${(-x * f).toFixed(1)}px ${(-y * f).toFixed(1)}px`; };
// the crowd's sprite sheets (Sim Q7a B, Nov 18): the 35 nearest crowd members (highest rated) keep their own 384px file; the rest come from
// 4 sheets at 128px (art/crowd-<n>.webp, ART_CROWD from experiments/v2-crowd-sheets.py): about 300 requests become 4
V2.SDH_NEAR = 35;
V2.sdhSheet = id => { const C = typeof ART_CROWD === 'object' && ART_CROWD, m = C && C.m && C.m[id]; if (!m) return null;
  return {m, w: C.s[m[0]][0], h: C.s[m[0]][1], url: V2.ART_BASE.replace(/\/?$/, '/') + 'crowd-' + m[0] + '.webp'}; };
// the speed lines: dashed streaks converging on the horizon
V2.sdhLines = (svg, w, h, row) => { const vx = w / 2, vy = (row ? .1 : .07) * h; let d = '';
  for (let i = 0; i < 26; i++) { const t = (i + .5) / 26, ex = -1.4 * w + t * 3.8 * w, ey = h * 1.05, a = .42 + V2.sdhRnd(i + 50) * .2;
    d += `M${(vx + (ex - vx) * a).toFixed(1)} ${(vy + (ey - vy) * a).toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`; }
  svg.setAttribute('viewBox', `0 0 ${Math.round(w)} ${Math.round(h)}`); svg.innerHTML = `<path d="${d}"/>`; };
/* Q30 (Sim, Nov 19, 11:08 AM): the logo's chevron (red over blue, the A of NASTY: 'raise') beside the tagline, a sticker that takes no
   space, so the words never move. Two copies, one shown: after 'raise' when 'raise' shares the first line with 'Sharply' (desktop), else
   after 'Sharply' (phones), decided from where the words fall, so odd window widths work too. Hidden from screen readers (decoration). */
/* the chevron is the brand kit's own file, unchanged (docs/brand/nastyplot-brand-assets/1-logo/chevron/svg/nastyplot-chevron-flat.svg;
   logo guide: never recolour, stretch, rotate or add effects) */
V2.sdhChv = () => `<span class="sdh-chv" aria-hidden="true" hidden><svg xmlns="http://www.w3.org/2000/svg" viewBox="96 44 320 352" focusable="false"><g><path d="M144 204L256 92L368 204L368 264.48L256 152.48L144 264.48Z" transform="translate(0 0)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="44" stroke-linejoin="round" stroke-linecap="round"/><path d="M144 284.64L256 172.64L368 284.64L368 345.12L256 233.12L144 345.12Z" transform="translate(0 0)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="44" stroke-linejoin="round" stroke-linecap="round"/><path d="M144 204L256 92L368 204L368 264.48L256 152.48L144 264.48Z" transform="translate(7 9)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="44" stroke-linejoin="round" stroke-linecap="round"/><path d="M144 284.64L256 172.64L368 284.64L368 345.12L256 233.12L144 345.12Z" transform="translate(7 9)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="44" stroke-linejoin="round" stroke-linecap="round"/></g><g><path d="M144 204L256 92L368 204L368 264.48L256 152.48L144 264.48Z" transform="translate(0 0)" fill="#17161A" stroke="#17161A" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/><path d="M144 284.64L256 172.64L368 284.64L368 345.12L256 233.12L144 345.12Z" transform="translate(0 0)" fill="#17161A" stroke="#17161A" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/><path d="M144 204L256 92L368 204L368 264.48L256 152.48L144 264.48Z" transform="translate(7 9)" fill="#17161A" stroke="#17161A" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/><path d="M144 284.64L256 172.64L368 284.64L368 345.12L256 233.12L144 345.12Z" transform="translate(7 9)" fill="#17161A" stroke="#17161A" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/></g><path d="M144 204L256 92L368 204L368 264.48L256 152.48L144 264.48Z" fill="#E8364F" stroke="#E8364F" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M144 284.64L256 172.64L368 284.64L368 345.12L256 233.12L144 345.12Z" fill="#0078BF" stroke="#0078BF" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg></span>`;
/* Placed beside the word, outside the heading (Nov 19: inside it, Safari's engine read the heading as 'Sharply raiseyour win rate.',
   CI run 44582229986, and a screen reader could too): after 'raise' when it shares the first line with 'Sharply' (desktop), else after
   'Sharply' (phones); sized from the headline's font size; a zero-size marker read once gives the word's baseline, then is removed */
V2.sdhChvPlace = () => { const S = document.querySelector('#main .sdh-scene'), h = S && S.querySelector('.sdh-h'), c = S && S.querySelector('.sdh-chv'); if (!h || !c) return;
  const t = h.querySelector('.l1') && h.querySelector('.l1').firstChild; if (!t || t.nodeType !== 3) return; const txt = t.textContent, i = txt.indexOf('raise');
  const end = k => { const rg = document.createRange(); rg.setStart(t, k - 1); rg.setEnd(t, k); return [...rg.getClientRects()].filter(r => r.width).pop(); };
  const a = end(txt.indexOf('Sharply') + 7), b = end(i + 5); if (!a || !b) return; const wd = Math.abs(b.top - a.top) < a.height / 2, k = wd ? i + 5 : txt.indexOf('Sharply') + 7;
  const m = document.createElement('i'); m.style.cssText = 'display:inline-block;width:0;height:0'; const rg = document.createRange(); rg.setStart(t, k); rg.collapse(true); rg.insertNode(m);
  const B = m.getBoundingClientRect(), Sb = S.getBoundingClientRect(), fs = parseFloat(getComputedStyle(h).fontSize); m.remove(); h.querySelector('.l1').normalize();
  const ht = fs * (wd ? .62 : .66), up = fs * (wd ? .1 : .4); c.style.height = ht + 'px'; c.style.left = (B.left - Sb.left + fs * .06) + 'px'; c.style.top = (B.top - Sb.top - up - ht) + 'px'; c.hidden = false; };
V2.SDH_ROOM = 150;
V2.sdhLayout = () => { const S = document.querySelector('#main .sdh'); if (!S) return; if (!V2._sdhGrow) { const fd = S.querySelector('.sdh-fold'); if (fd) fd.style.minHeight = ''; } try { V2.sdhChvPlace(); } catch (e) {}
  // the first screen: the window height less everything above the hero (header, a data note) and the phone tab bar
  const bar = document.querySelector('.np-bar'), bh = bar && getComputedStyle(bar).position === 'fixed' ? bar.offsetHeight : 0, t0 = Math.round(S.getBoundingClientRect().top + scrollY + bh);
  if (S.style.getPropertyValue('--sdh-top') !== t0 + 'px') S.style.setProperty('--sdh-top', t0 + 'px');
  const sc = S.querySelector('.sdh-scene'), w = sc.clientWidth, h = sc.clientHeight; if (!w || !h) return;
  const row = V2.sdhRow(), n = V2.sdhRows().length, sr = sc.getBoundingClientRect();
  const cx = [...S.querySelectorAll('.sdh-plates li')].filter(l => l.getClientRects().length).map(l => { const b = l.getBoundingClientRect(); return {o: +getComputedStyle(l).gridColumnStart || 0, x: b.left + b.width / 2 - sr.left}; }).sort((a, b) => a.o - b.o).map(c => c.x);
  const hb = S.querySelector('.sdh-h').getBoundingClientRect().bottom - sr.top, P = V2.sdhLay(n, w, h, row, cx.length >= (row ? 4 : 2) ? cx : [w * .125, w * .375, w * .625, w * .875], hb);
  for (const el of S.querySelectorAll('.sdh-m')) { const i = +el.dataset.sdhi; V2.sdhPut(el, P[i]); }
  // the front row stops under the tagline's last line (Q13f B, Sim Nov 18: sprites never cover its words at any width)
  const fr = S.querySelector('.sdh-front'), fs = parseFloat(getComputedStyle(S.querySelector('.sdh-h')).fontSize) || 0;
  if (fr) { fr.style.removeProperty('--fcap'); const room = Math.round(fr.getBoundingClientRect().bottom - sr.top - hb - V2.SDH_SLOPE * w * (row ? .375 : .25)), fd = S.querySelector('.sdh-fold');
    /* Sim, Nov 23 (iPhone in the Claude app, a short window): the front two climbed over 'win rate.' because the room under the tagline was
       under the 80px floor. On phones the scene now grows until they have SDH_ROOM px, so they never cover the words (the buttons may then
       sit just under the first screen on a very short window) */
    if (!row && fd && room < V2.SDH_ROOM && !V2._sdhGrow) { V2._sdhGrow = 1; fd.style.minHeight = (fd.offsetHeight + V2.SDH_ROOM - room) + 'px'; try { V2.sdhLayout(); } finally { V2._sdhGrow = 0; } return; }
    fr.style.setProperty('--fcap', Math.max(80, room) + 'px'); } /* Q13f B: clear of the words, the tilt's rise at the outer columns counted */
  const named = new Set(row ? [0, 1, 2, 3] : [0, 1]);
  // the two start buttons: if either one's words would break onto a second line (a narrow window; a desktop window measures differently
  // from a phone at the same width), both step down to 13px together, so they stay side by side and level (polish, Nov 18)
  const go = S.querySelector('.sdh-go'); if (go) { go.classList.remove('sm'); if ([...go.querySelectorAll('a')].some(a => { const t = a.querySelector('span') || a, rg = document.createRange(); rg.selectNodeContents(t); return new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size > 1; })) go.classList.add('sm'); }
  // plates: if one plate's number has to drop under its name, all four do, so the row stays even
  const pl = S.querySelector('.sdh-plates'); if (pl) { pl.classList.remove('stk'); if ([...pl.querySelectorAll('.sdh-plate')].some(b => b.getClientRects().length && b.lastElementChild.offsetTop > b.firstElementChild.offsetTop + 4)) pl.classList.add('stk'); }
  const C = V2.sdhUi.crowd; if (C) for (const im of C.children) V2.sdhPut(im, P[+im.dataset.sdhi]);
  V2.sdhLines(S.querySelector('.sdh-lines'), w, h, row);
  V2.sdhTick(S, true); // motion: set the moving ticker up (or take it down) before its names are measured
  // the still ticker shows whole names only (audit L8): items that wrap to a second line are hidden (and so not focusable)
  const tk = S.querySelector('.sdh-tick ul'); if (tk) { const li = [...tk.children]; li.forEach(l => { l.hidden = named.has(+l.dataset.sdhi); }); const t0 = li.find(l => l.getClientRects().length);
    if (t0) { const y0 = t0.offsetTop; let cut = false; li.forEach(l => { if (!l.hidden && (cut || l.offsetTop > y0 + 2)) { l.hidden = true; cut = true; } }); } }
  V2.sdhTick(S); }; /* in order: after the first that doesn't fit, none */
// the crowd: built once per set of data, added after the page has loaded; nearest (highest rated) pictures are asked for first
V2.sdhCrowd = () => { const S = document.querySelector('#main .sdh'); if (!S) return; const box = S.querySelector('.sdh-crowd'), R = V2.sdhRows(), U = V2.sdhUi;
  const key = R.length + '|' + R.map(x => x.n).join(','); if (U.key !== key || !U.crowd) { const f = document.createDocumentFragment(), ims = [];
    for (let i = 12; i < R.length; i++) { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[R[i].n] : null, sh = i >= 12 + V2.SDH_NEAR && id != null && V2.sdhSheet(id);
      if (sh) { const e = document.createElement('i'); e.className = 'sdh-c sdh-cs'; e.dataset.sdhi = i; e.dataset.cs = id; e.append(document.createElement('b')); ims.push(e); continue; } /* from a sheet */
      const im = new Image(); im.alt = ''; im.decoding = 'async'; im.setAttribute('fetchpriority', 'low'); im.dataset.sdhi = i; im.className = 'sdh-c'; ims.push(im); }
    ims.forEach((im, j) => { if (im.tagName === 'IMG') im.src = V2.sdhSrc(R[j + 12], false); }); /* the nearest asked for in rating order; the sheets load with the first sheet picture drawn */
    for (let j = ims.length - 1; j >= 0; j--) f.append(ims[j]); /* far (lowest rated) first in the page, so nearer ones stand in front */
    const c = document.createElement('div'); c.className = 'sdh-crowdset'; c.append(f); U.crowd = c; U.key = key; }
  if (U.crowd.parentNode !== box) box.replaceChildren(U.crowd); V2.sdhLayout(); };
V2.sdHeroAfter = () => { const S = document.querySelector('#main .sdh'), U = V2.sdhUi; if (!S) return;
  U.surged = true; /* the surge (sd-motion.css) plays on the first draw only, never on a redraw */ V2.sdhLayout();
  const sc = S.querySelector('.sdh-scene'); if (U.el !== sc && window.ResizeObserver) { if (U.ro) U.ro.disconnect(); U.el = sc;
    U.ro = new ResizeObserver(() => { cancelAnimationFrame(U.raf); U.raf = requestAnimationFrame(V2.sdhLayout); }); U.ro.observe(sc); }
  if (U.crowd) { V2.sdhCrowd(); return; } // a redraw: the crowd is already loaded, put it straight back
  if (U.armed) return; U.armed = true;
  // the crowd waits for the page's load and for the first screen's own pictures (the front row and the mid-sized), so its 300+ small
  // files never compete with them; 8 s at most, so a picture that never answers can't keep the crowd away
  const mine = [...S.querySelectorAll('.sdh-f img, .sdh-m img')].filter(i => !i.complete).map(i => new Promise(r => { i.addEventListener('load', r, {once: true}); i.addEventListener('error', r, {once: true}); }));
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, {once: true}));
  Promise.race([Promise.all([loaded, ...mine]), new Promise(r => setTimeout(r, 8000))]).then(() => requestAnimationFrame(() => setTimeout(() => { U.armed = false; V2.sdhCrowd(); }, 0))); };
// ---------- motion: the ticker (Sim approved Nov 18, "recommended for all"; all the CSS is in sd-motion.css) ----------
// It scrolls slowly: the list plus an aria-hidden copy (its buttons out of the tab order) in one moving track, so it loops without a
// seam. A pause button sits on it (WCAG 2.2.2); it also pauses under the mouse, goes back to its start while a keyboard user is in it
// (so the focused name is on screen), and rests while off screen. With prefers-reduced-motion: reduce none of this is built.
V2.SDH_PXS = 40; // the ticker's speed, px per second
// prep (before the names are measured): build or take down the track and the button; otherwise: refresh the copy when the shown
// names change, and the duration from the list's width
// Motion is ON (Sim, Nov 18, Q6 A: "recommend for all is good"). prefers-reduced-motion: reduce still stops all of it (sd-motion.css
// rules sit inside no-preference; V2.sdhTick builds nothing). window.NP_SD_MOTION = 0 turns it off, for a check that needs the still page.
V2.sdMotion = () => window.NP_SD_MOTION !== 0;
V2.sdhTick = (S, prep) => { const U = V2.sdhUi, tk = S.querySelector('.sdh-tick'), ul = tk && tk.querySelector('ul'); if (!ul || !V2.sdMotion()) return;
  const mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null, run = !!mq && !mq.matches;
  if (mq && !U.mq) { U.mq = 1; mq.addEventListener('change', () => V2.sdhLayout()); }
  let tr = tk.querySelector('.sdh-trk');
  if (!run) { if (tr) { tk.classList.remove('sdh-run', 'sdh-hold'); tr.replaceWith(ul); tk.querySelector('.sdh-tpz').remove(); } return; }
  if (!tr) { if (!prep) return; tr = document.createElement('div'); tr.className = 'sdh-trk'; ul.replaceWith(tr); tr.append(ul);
    const pz = document.createElement('button'); pz.type = 'button'; pz.className = 'sdh-tpz'; pz.setAttribute('aria-label', 'Pause the moving ratings'); pz.innerHTML = '<i aria-hidden="true"></i>';
    const hold = on => { U.hold = on; tk.classList.toggle('sdh-hold', on); pz.setAttribute('aria-pressed', String(on)); };
    pz.addEventListener('click', () => hold(!U.hold)); tr.addEventListener('focusout', e => { if (!tr.contains(e.relatedTarget)) tk.scrollLeft = 0; });
    tk.append(pz); tk.classList.add('sdh-run'); hold(!!U.hold);
    if (window.IntersectionObserver) { if (U.io) U.io.disconnect(); U.io = new IntersectionObserver(es => es.forEach(e => tk.classList.toggle('sdh-off', !e.isIntersecting))); U.io.observe(tk); }
    return; } // on one line now: nothing is cut, only the ones with a plate stay hidden
  if (prep) return;
  const key = [...ul.children].map(l => l.hidden ? 0 : 1).join(''); if (!tr.children[1] || tr.children[1].dataset.key !== key) {
    const cp = ul.cloneNode(true); cp.setAttribute('aria-hidden', 'true'); cp.removeAttribute('aria-label'); cp.dataset.key = key; cp.querySelectorAll('button').forEach(b => { b.tabIndex = -1; });
    if (tr.children[1]) tr.children[1].replaceWith(cp); else tr.append(cp); }
  const d = Math.max(20, Math.round(ul.offsetWidth / V2.SDH_PXS)) + 's'; if (tk.style.getPropertyValue('--sdh-tdur') !== d) tk.style.setProperty('--sdh-tdur', d); };
