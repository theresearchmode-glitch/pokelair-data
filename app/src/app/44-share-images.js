// ---------- share images (R4, Nov 11; shared with the new build): Team Card, Team Poster and Team Sheet, drawn on a canvas ----------
// Moved verbatim: the colour helpers PO and posterFacts (from 66-extras-b.js), the arena card and poster renderers ARB.*
// (from 75-arena-team.js, which adds its own helpers to the same ARB) and buildSheetImage (from 76-team-sheet.js).
const ARB = {};
// the Team Sheet's stat labels and nature parts (moved from 76-team-sheet.js, which adds its page helpers to the same TS)
const TS = {};
TS.STATS = [['HP', 'hp'], ['Atk', 'atk'], ['Def', 'def'], ['SpA', 'spa'], ['SpD', 'spd'], ['Spe', 'spe']];
TS.natBits = natBits; // shared (39-damage-calc-speed.js, R4 Nov 11)
// colour maths (OKLCH; moved from 71-manga.js, which adds its other MG helpers to the same object)
const MG = {};
MG.s2l = c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; MG.l2s = c => c <= .0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - .055;
MG.ok = h => { const [r, g, b] = [1, 3, 5].map(i => MG.s2l(parseInt(h.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, B = .0259040371 * l + .7827717662 * m - .808675766 * s; return [Math.hypot(A, B), Math.atan2(B, A) * 180 / Math.PI]; };
MG.hex = (L, C, H) => { const a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  return '#' + [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s]
    .map(v => Math.round(Math.min(1, Math.max(0, MG.l2s(v))) * 255).toString(16).padStart(2, '0')).join(''); };
// the arena type palette (moved from 74-arena.js, which adds its other AR helpers to the same object). Dark reads brown and Normal
// khaki on a field (Sim: no brown, olive or khaki fills), so both get their own colours. 74-arena.js still applies them to TC at the
// same moment as before; the new build applies them in its bridge.
const AR = {};
AR.TC_FIX = {Dark: '#5E5068', Normal: '#A6A2AE'};
AR.TC = Object.assign({}, TC, AR.TC_FIX);
AR._d = new Map(); AR._k = new Map();
AR.dark = t => { if (AR._d.has(t)) return AR._d.get(t); let v = TC.Normal;
  try { const [C, H] = MG.ok(AR.TC[t] || TC.Normal), h = (H + 360) % 360, L = C < .03 ? .7 : h >= 70 && h < 130 ? .76 : h >= 38 && h < 70 ? .64 : .5, c = Math.max(Math.min(C, .17), Math.min(C, .05));
    v = MG.hex(L, c, H); AR._k.set(t, {L, c, h}); } catch (e) {}
  AR._d.set(t, v); return v; };
AR.isMega = p => !!(p && (p.m || /-Mega/.test(p.n || '')));
// fit text to a width on a canvas (moved from 44-share-card.js)
function scFit(ctx, text, max) { let t = text; while (t.length > 3 && ctx.measureText(t).width > max) t = t.slice(0, -2) + '…'; return t; }
/* Share images draw the stored logo SVG as a picture, where the site's colour overrides (blue PLOT circle, no yellow shadow)
   never reach it. This fills each var(--x, fallback) in it with the value the live header logo uses, so every share card
   matches the logo on the site in both looks (Sim, Nov 5: "our share card still uses our old logo"). */
function npLogoSvg(dark) { const raw = NP_SVG[dark ? 'hdrD' : 'hdrL'];
  /* Polish (Nov 10): a share image in the other mode than the page uses that logo's own colours (a dark image made from the light
     page drew NASTY in the light page's dark ink: invisible on black) */
  if (!!dark !== (document.documentElement.dataset.look === 'dark')) return raw.replace(/var\((--[\w-]+)\s*,\s*([^)]*)\)/g, (m, v, fb) => fb);
  const el = [...document.querySelectorAll('.nplk')].find(e => e.getClientRects().length) || document.querySelector('.nplk'); if (!el) return raw;
  const cs = getComputedStyle(el); return raw.replace(/var\((--[\w-]+)\s*,\s*([^)]*)\)/g, (m, v, fb) => { const x = cs.getPropertyValue(v).trim(); return x || fb; }); }
// load an image for a canvas (null when it fails); moved from 44-share-card.js
function scImg(src) { return new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; }); }
const PO = {W: 1080, H: 1350};
PO.hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
PO.mix = (a, b, t) => { const A = PO.hex(a), B = PO.hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
PO.lum = h => { const c = PO.hex(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
PO.cr = (a, b) => { const x = PO.lum(a), y = PO.lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
PO.hue = h => { const [r, g, b] = PO.hex(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return {h: 0, s: 0};
  const hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return {h: (hh * 60 + 360) % 360, s: d / (1 - Math.abs(mx + mn - 1))}; };
/* the team's two most common types, skipping red (red is for opponents) and the dull ones (Normal, Dark, Steel) */
PO.colours = ms => { const n = {}; ms.forEach(m => (m.types || m.p.t || []).forEach(t => { n[t] = (n[t] || 0) + 1; }));
  const ok = t => { const c = TC[t]; if (!c || ['Normal', 'Dark', 'Steel'].includes(t)) return false; const {h, s} = PO.hue(c); return s > .35 && !(h < 12 || h > 352); };
  const ts = Object.keys(n).filter(ok).sort((a, b) => n[b] - n[a] || Object.keys(TC).indexOf(a) - Object.keys(TC).indexOf(b));
  /* two neighbours of red (Psychic pink next to Fire orange) would read as red together: the second goes to the next type */
  const warm = t => { const {h} = PO.hue(TC[t]); return h < 30 || h > 330; }, pick = ts.slice(0, 1); for (const t of ts.slice(1)) { if (pick.length < 2 && !(warm(pick[0]) && warm(t))) pick.push(t); }
  const c = pick.map(t => TC[t]); if (!c.length) c.push('#0078BF'); if (c.length < 2) c.push(PO.mix(c[0], '#6a3cee', .55)); return {c, types: pick}; };
PO.round = (x, X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
/* the facts the poster shows, worked out the same way as My team and Saved teams */
function posterFacts(ms, name) { const RD = ms.length ? prepOf(ms) : null; let ck = null; try { ck = ms === members() && ui.vsum && ui.vsum.CK ? ui.vsum.CK : proChecks(ms, true); } catch (e) {}
  const G = RD && ms.length === 6 ? CH.gradeOf(RD, ck, ms) : null; let arch = ''; try { const a = teamArchetype(ms); arch = a && a.label || ''; } catch (e) {}
  return {RD, G, hd: CH.hand(RD), arch, name: name || (typeof teamTitleFor === 'function' ? teamTitleFor(ms) : '') || 'My team'}; }

/* ===== the share card (1200x675) and the team poster (1080x1350), drawn in the arena style ======
   Paper, ink and the section blue; each Pokémon on its own slanted type field with the light streaks, the sprite breaking out of
   the top, Megas with the two-colour contour; the name in Unbounded (slanted) under the art; the headline numeral (no misprint since Nov 10)
   offset. Sentence case and commas (no all-caps, no middle dots). The same facts as before: the team's name, its archetype, the
   grade (from the record with 30+ games, as on My team), readiness and how many of the top 30 threats it handles. */
ARB.dots = t => String(t || '').replace(/\s*·\s*/g, ', ');
ARB.facts = (ms, name) => { const f = posterFacts(ms, name); f.name = ARB.dots(f.name); f.arch = ARB.dots(f.arch); return f; };
/* one name size for the whole six, so the names read as a set */
ARB.nameSize = (x, ms, w, max) => { let f = max; for (const m of ms) { if (!m) continue; const nm = m.d || m.p.d; while (f > 16) { ARB.fnt(x, `italic 800 ${f}px Unbounded, sans-serif`, true); if (x.measureText(nm).width <= w + 10) break; f--; } } return f; };
ARB.PAL = d => d ? {paper: '#000000', sheet: '#1A191D', ink: '#F4F1EC', ink2: '#C9C3CC', rule: 'rgba(255,255,255,.16)', blue: '#4FB2F0', plate: '#0068AD', mis: '#E8364F', green: '#5FD08F', bar: 'rgba(255,255,255,.14)'}
  : {paper: '#ECE7E0', sheet: '#FBF8F4', ink: '#16141A', ink2: '#4A4550', rule: 'rgba(22,20,26,.14)', blue: '#0078BF', plate: '#0068AD', mis: '#FF5C8A', green: '#2E9E5B', bar: 'rgba(22,20,26,.1)'};
ARB.SK = Math.tan(12 * Math.PI / 180);
ARB.fnt = (x, f, wide) => { x.font = f; try { x.fontStretch = wide ? 'expanded' : 'normal'; } catch (e) {} };
ARB.mixc = (a, b, t) => { try { return PO.mix(a, b, t); } catch (e) { return a; } };
/* a slanted rounded parallelogram centred on cx, from y to y + h */
ARB.para = (x, cx, y, w, h, r) => { const k = ARB.SK * h / 2; x.beginPath();
  const pts = [[cx - w / 2 + k, y], [cx + w / 2 + k, y], [cx + w / 2 - k, y + h], [cx - w / 2 - k, y + h]];
  x.moveTo((pts[0][0] + pts[1][0]) / 2, y); for (let i = 1; i <= 4; i++) { const p = pts[i % 4], q = pts[(i + 1) % 4]; x.arcTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, r); } x.closePath(); };
ARB.tint = (im, col) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return c; };
/* one art tile: the field, the streaks in its top 60%, the sprite (Mega contour), the name and an optional line under it */
ARB.drawTile = (x, P, dark, m, im, cx, y, w, h, sz, nameSize, sub) => { const t = m.p.t || ['Normal'], a = AR.TC[t[0]] || TC.Normal, b = AR.TC[t[1] || t[0]] || TC.Normal;
  const ca = dark ? AR.dark(t[0]) : ARB.mixc(P.sheet, a, .58), cb = dark ? AR.dark(t[1] || t[0]) : ARB.mixc(P.sheet, b, .58);
  x.save(); x.shadowColor = dark ? 'rgba(0,0,0,.8)' : 'rgba(40,20,40,.35)'; x.shadowBlur = 22; x.shadowOffsetY = 12; ARB.para(x, cx, y, w, h, 14); const g = x.createLinearGradient(cx - w / 2, y, cx + w / 2, y + h); g.addColorStop(.1, ca); g.addColorStop(.9, cb); x.fillStyle = g; x.fill(); x.restore();
  x.save(); ARB.para(x, cx, y, w, h, 14); x.clip(); const s = [[.46, .53, .42], [.58, .61, .26], [.66, .675, .18]];
  for (const [p0, p1, al] of s) { x.fillStyle = `rgba(255,255,255,${dark ? al * .55 : al})`; x.beginPath(); const L = cx - w / 2 - h, span = w + 2 * h;
    x.moveTo(L + span * p0, y); x.lineTo(L + span * p1, y); x.lineTo(L + span * p1 - h * .62 * 1.6, y + h * .62); x.lineTo(L + span * p0 - h * .62 * 1.6, y + h * .62); x.closePath(); x.fill(); }
  x.restore();
  if (im) { const k = Math.min(sz / im.width, sz / im.height), dw = im.width * k, dh = im.height * k, dx = cx - dw / 2, dy = y + h - dh - h * .06;
    if (AR.isMega(m.p)) { const d = Math.max(3, sz / 60), A = ARB.tint(im, a), B = ARB.tint(im, b); x.drawImage(A, dx + d, dy, dw, dh); x.drawImage(B, dx - d, dy, dw, dh); x.drawImage(B, dx, dy + d, dw, dh); x.drawImage(A, dx, dy - d, dw, dh); }
    x.save(); x.shadowColor = 'rgba(30,10,40,.25)'; x.shadowBlur = 10; x.shadowOffsetY = 8; x.drawImage(im, dx, dy, dw, dh); x.restore(); }
  x.textAlign = 'center'; x.fillStyle = P.ink; const nm = m.d || m.p.d; let f = nameSize; do { ARB.fnt(x, `italic 800 ${f}px Unbounded, "Instrument Sans", sans-serif`, true); } while (x.measureText(nm).width > w + 10 && --f > 14);
  x.fillText(nm, cx - ARB.SK * 0, y + h + nameSize * 1.25);
  if (sub) { const sz2 = Math.max(20, Math.round(nameSize * .82)); ARB.fnt(x, `600 ${sz2}px "Instrument Sans", sans-serif`); x.fillStyle = P.ink2; x.fillText(scFit(x, sub, w + 12), cx, y + h + nameSize * 1.25 + sz2 * 1.25); }
  x.textAlign = 'left'; };
/* the score as on My team: the record's win rate with 30+ games, else the grade out of 100 */
ARB.score = (G) => { if (!G) return null; // grade first: a big "63.0%" beside "Grade A" read like a contradiction (Sim, Nov 5)
  const so = G.partial ? ' so far' : '', wr = G.rec ? pctFmt(G.rec.wr * 100) : '', av = pctFmt(100 * ((typeof RES !== 'undefined' && RES && +RES.base) || .5));
  /* one grade (Nov 7): the letter, the grade out of 100, the real win rate or none yet */
  const n = CH.gradeNum(G);
  if (G.v === 2) { const w = CH.wordOfL(G.letter); return {num: String(Math.round(G.s)), top: 'Strength Score' + so, basis: `${w} \u00b7 ${CH.recLine(G, true)}`, line: `Strength Score ${Math.round(G.s)}${so}: ${w} \u00b7 ${CH.recLine(G)}`}; }
  return {num: G.letter, top: 'Grade' + so, basis: `${n} · ${CH.recLine(G, true)}`, line: `Grade ${G.letter}${so}: ${n} · ${CH.recLine(G)}`}; };
ARB.numeral = (x, P, txt, X, Y, size, align) => { ARB.fnt(x, `italic 900 ${size}px Unbounded, sans-serif`, true); x.textAlign = align || 'left'; const o = size * .05;
  /* Polish (Nov 10): no misprint offset (retired Nov 7); the numeral stands alone, as on the site */
  x.fillStyle = P.ink; x.fillText(txt, X, Y); x.textAlign = 'left'; };
/* the tagline as on the site: "Sharply raise" in ink, "your win rate." in PLOT blue; right-aligned at X */
ARB.tagline = (x, P, X, Y, size) => { ARB.fnt(x, `italic 800 ${size}px Unbounded, sans-serif`, true); x.textAlign = 'left'; const a = 'Sharply raise ', b = 'your win rate.', wa = x.measureText(a).width, wb = x.measureText(b).width;
  x.fillStyle = P.ink; x.fillText(a, X - wa - wb, Y); x.fillStyle = P.blue; x.fillText(b, X - wb, Y); };
ARB.tab = (x, P, X, Y, s) => { x.fillStyle = P.blue; ARB.para(x, X + s / 2, Y - s, s, s, 4); x.fill(); };
/* the logo on share cards; X/Y the top left, w the width */
ARB.logo = async (x, dark, X, Y, w) => { /* Sim (Nov 5): the original logo, N(chevron)STY with the circled PLOT */
  const im = new Image(); im.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(npLogoSvg(dark));
  await new Promise(r => { im.onload = r; im.onerror = r; }); try { x.drawImage(im, X, Y, w, w * 196 / 761.34); } catch (e) {} };
ARB.imgs = ms => { const src = id => (window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp'; return Promise.all(ms.map(m => { const id = typeof SPRITE_ID === 'object' && SPRITE_ID ? SPRITE_ID[m.p.n] : null; return id ? scImg(src(id)) : Promise.resolve(null); })); };
ARB.fonts = async () => { try { await Promise.all(['800 40px Unbounded', '900 40px Unbounded', '600 20px "Instrument Sans"', '500 20px "Instrument Sans"'].map(f => document.fonts.load(f, 'Aa0123%'))); } catch (e) {} };
ARB.lines = (x, text, max) => { if (x.measureText(text).width <= max) return [text]; const w = text.split(' '); let best = null;
  for (let i = 1; i < w.length; i++) { const L = [w.slice(0, i).join(' '), w.slice(i).join(' ')], m = Math.max(...L.map(l => x.measureText(l).width)); if (m <= max && (!best || m < best.m)) best = {L, m}; } return best ? best.L : null; };
/* greedy wrap into at most n lines that fit max, or null */
ARB.wrapN = (x, text, max, n) => { const w = text.split(' '), L = []; let cur = '';
  for (const word of w) { const t = cur ? cur + ' ' + word : word; if (x.measureText(t).width <= max) cur = t; else { if (!cur) return null; L.push(cur); cur = word; if (x.measureText(cur).width > max) return null; } }
  if (cur) L.push(cur); return L.length <= n ? L : null; };
ARB.card = async function () { const ms = members().slice(0, 6); if (!ms.length) return null; const dark = (CH.shareMode || document.documentElement.dataset.look) === 'dark', P = ARB.PAL(dark); await ARB.fonts();
  const W = 1200, H = 675, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic'; x.fillStyle = P.paper; x.fillRect(0, 0, W, H);
  const f = ARB.facts(ms), sc = ARB.score(f.G), RD = f.RD;
  /* readiness, top right */
  /* Polish (Nov 10): the team's number leads, as on the site (word list: Strength Score, with its band word); the matchups count
     sits under it in the word list's words (Beats it / Handles it), not the old 'ready for top threats' */
  if (sc && /^\d+$/.test(sc.num)) { ARB.numeral(x, P, sc.num, W - 60, 140, 112, 'right'); x.textAlign = 'right';
    ARB.fnt(x, '700 24px "Instrument Sans", sans-serif'); x.fillStyle = P.ink; x.fillText(`Strength Score: ${String(sc.basis).split(' · ')[0]}`, W - 60, 176);
    const h = RD ? CH.hand(RD) : null; if (h) { ARB.fnt(x, '500 20px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText(`Matchups: beats or handles ${h.x} of the top ${h.n}`, W - 60, 206); } x.textAlign = 'left'; }
  else if (RD) { ARB.numeral(x, P, CH.readyN(RD) || RD.score + '%', W - 60, 132, 104, 'right'); x.textAlign = 'right'; ARB.fnt(x, '600 22px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('Matchups: beaten or handled', W - 60, 168); x.textAlign = 'left'; }
  /* the title on its slanted tab: one line as big as fits, else two lines (never cut off) */
  let fz = 70, TL = null; for (; fz >= 34; fz -= 2) { ARB.fnt(x, `italic 800 ${fz}px Unbounded, sans-serif`, true); if (x.measureText(f.name).width <= 640) { TL = [f.name]; break; } if (fz <= 50) { const L2 = ARB.lines(x, f.name, 640); if (L2) { TL = L2; break; } } }
  if (!TL) for (fz = 40; fz >= 26 && !TL; fz -= 2) { ARB.fnt(x, `italic 800 ${fz}px Unbounded, sans-serif`, true); TL = ARB.wrapN(x, f.name, 640, 3); }
  if (!TL) { fz = 26; TL = [scFit(x, f.name, 640)]; }
  const ty0 = TL.length > 2 ? 64 : TL.length > 1 ? 84 : 116; ARB.tab(x, P, 56, ty0, 40); x.fillStyle = P.ink; TL.forEach((l, i) => x.fillText(l, 112, ty0 + i * fz * 1.02));
  const sy = ty0 + (TL.length - 1) * fz * 1.02 + 40;
  ARB.fnt(x, '500 22px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('Pokémon Champions, VGC doubles, Reg M-C', 58, sy); /* Nov 9, Sim: no 'bring 6 pick 4' on the clean share card */
  if (f.arch && f.arch !== f.name) { ARB.fnt(x, '700 22px "Instrument Sans", sans-serif'); const t = scFit(x, f.arch, 520), w = x.measureText(t).width + 36; x.fillStyle = P.plate; ARB.para(x, 58 + w / 2, sy + 18, w, 40, 6); x.fill(); x.fillStyle = '#fff'; x.fillText(t, 76, sy + 45); }
  /* the six */
  const imgs = await ARB.imgs(ms), cw = (W - 112) / 6, ns = ARB.nameSize(x, ms, cw - 26, 25);
  for (let i = 0; i < 6; i++) { const cx = 56 + cw * i + cw / 2, m = ms[i];
    if (!m) { x.fillStyle = P.bar; ARB.para(x, cx, 330, cw - 26, 150, 14); x.fill(); continue; }
    const ti = typeof topItems === 'function' ? topItems(m.p) : null, item = m.item || (ti && ti.it && ti.it[0] ? ti.it[0][0] : '');
    ARB.drawTile(x, P, dark, m, imgs[i], cx, 322, cw - 26, 146, 168, ns, item); }
  /* footer */
  x.fillStyle = P.rule; x.fillRect(56, 586, W - 112, 2); await ARB.logo(x, dark, 50, 604, 200);
  ARB.tagline(x, P, W - 56, 640, 26); x.textAlign = 'right';
  ARB.fnt(x, '600 17px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('NastyPlot, unofficial fan tool', W - 56, 662); x.textAlign = 'left';
  return c; };
ARB.poster = async function (ms, opt) { opt = opt || {}; if (!ms || !ms.length) return null; ms = ms.slice(0, 6);
  const dark = (opt.dark != null ? opt.dark : (CH.shareMode || document.documentElement.dataset.look) === 'dark'), P = ARB.PAL(dark); await ARB.fonts();
  const f = ARB.facts(ms, opt.name), sc = ARB.score(f.G), {W, H} = PO, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic';
  x.fillStyle = P.paper; x.fillRect(0, 0, W, H);
  /* a soft slanted blue stage behind the six (the My team stage) */
  x.save(); x.beginPath(); x.moveTo(0, 360); x.lineTo(W, 330); x.lineTo(W, 1010); x.lineTo(0, 1040); x.closePath(); const sg = x.createLinearGradient(0, 330, W, 1040);
  sg.addColorStop(0, dark ? '#16151A' : ARB.mixc('#ECE7E0', '#0078BF', .22)); sg.addColorStop(1, dark ? '#121114' : ARB.mixc('#ECE7E0', '#0078BF', .08)); x.fillStyle = sg; x.fill();
  if (dark) { x.fillStyle = '#0078BF'; x.beginPath(); x.moveTo(0, 360); x.lineTo(0, 1040); x.lineTo(8, 1040); x.lineTo(8, 360); x.fill(); } x.restore();
  ARB.fnt(x, '600 26px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('My team, Pokémon Champions, Reg M-C doubles', 60, 86);
  /* the name, as big as fits, up to two lines, on its slanted tab */
  let fz = 104, L = null; for (; fz >= 52; fz -= 4) { ARB.fnt(x, `italic 800 ${fz}px Unbounded, sans-serif`, true); L = ARB.lines(x, f.name, W - 190); if (L && (L.length === 1 || fz <= 92)) break; }
  if (!L) for (fz = 60; fz >= 40 && !L; fz -= 4) { ARB.fnt(x, `italic 800 ${fz}px Unbounded, sans-serif`, true); L = ARB.wrapN(x, f.name, W - 190, 3); }
  if (!L) { fz = 40; L = [scFit(x, f.name, W - 190)]; } let ty = 110 + fz * .9; ARB.tab(x, P, 60, ty - fz * .12, fz * .62); for (const l of L) { x.fillStyle = P.ink; x.fillText(l, 60 + fz * .78, ty); ty += fz * 1.02; }
  if (f.arch && f.arch !== f.name) { ARB.fnt(x, '700 28px "Instrument Sans", sans-serif'); const t = scFit(x, f.arch, 700), w = x.measureText(t).width + 44, yy = ty - fz * 1.02 + 30; x.fillStyle = P.plate; ARB.para(x, 64 + w / 2, yy, w, 48, 6); x.fill(); x.fillStyle = '#fff'; x.fillText(t, 86, yy + 33); }
  /* the six: 3 by 2 art tiles */
  const imgs = await ARB.imgs(ms), cw = (W - 120) / 3, rows = [470, 760], ns = ARB.nameSize(x, ms, cw - 40, 32);
  for (let i = 0; i < 6; i++) { const cx = 60 + cw * (i % 3) + cw / 2, y = rows[Math.floor(i / 3)], m = ms[i];
    if (!m) { x.fillStyle = P.bar; ARB.para(x, cx, y, cw - 40, 170, 16); x.fill(); continue; }
    ARB.drawTile(x, P, dark, m, imgs[i], cx, y, cw - 40, 170, 230, ns); }
  /* the grade and the threats */
  const gy = 1128 + 44 /* Nov 9: centred in the space the threats bar left */;
  if (sc) { const nz = sc.num.length > 3 ? 104 : 124; ARB.numeral(x, P, sc.num, 60, gy, nz); ARB.fnt(x, `italic 900 ${nz}px Unbounded, sans-serif`, true); const nw = x.measureText(sc.num).width + 28;
    ARB.fnt(x, '700 32px "Instrument Sans", sans-serif'); x.fillStyle = P.ink; x.fillText(sc.top, 60 + nw, gy - 44); ARB.fnt(x, '500 24px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText(String(sc.basis).split(' · ')[0], 60 + nw, gy - 8); } /* Nov 9, Sim: no 'Our estimate' note on the poster */
  else { ARB.fnt(x, '600 26px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText(`${ms.length} of 6 Pokémon`, 60, gy - 50); ARB.fnt(x, 'italic 800 40px Unbounded, sans-serif', true); x.fillStyle = P.ink; x.fillText('The grade comes with a full six', 60, gy); }
  /* Nov 9, Sim: the poster doesn't need "handles x of the top 30 threats" */
  if (false && f.hd) { const ry = 1206; ARB.fnt(x, '600 26px "Instrument Sans", sans-serif'); x.fillStyle = P.ink; const t = `Handles ${f.hd.x} of the top ${f.hd.n} threats`; x.fillText(t, 60, ry); const tx = 60 + x.measureText(t).width + 28, bw = W - 60 - tx, fr = Math.max(0, Math.min(1, f.hd.x / f.hd.n));
    if (bw > 80) { x.fillStyle = P.bar; ARB.para(x, tx + bw / 2, ry - 18, bw, 14, 3); x.fill(); x.save(); ARB.para(x, tx + bw / 2, ry - 18, bw, 14, 3); x.clip(); x.fillStyle = P.green; x.fillRect(tx - 10, ry - 18, (bw + 10) * fr, 14); x.restore(); } }
  /* footer */
  x.fillStyle = P.rule; x.fillRect(60, 1240, W - 120, 2); await ARB.logo(x, dark, 54, 1258, 260);
  ARB.tagline(x, P, W - 60, 1300, 34); x.textAlign = 'right';
  ARB.fnt(x, '600 20px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('NastyPlot, unofficial fan tool', W - 60, 1330); x.textAlign = 'left';
  return c; };

/* ===== Team sheet image (Sim, Nov 9): the third Share option, "everything in one screenshot" =====
   1080 x 1350 portrait like the Team poster: all six sets in a 2 x 3 grid with item, Ability, nature (+/-), the four moves in type
   colours and the six stats at level 50 with their stat points, and where each spread comes from. Light or Dark, from the share box.
   Fonts: Unbounded (slanted) for names and numbers, Instrument Sans for the rest, as on the site. Sprites from sp/ (same origin). */
async function buildSheetImage(ms, opt) { opt = opt || {}; if (!ms || !ms.length) return null; ms = ms.slice(0, 6);
  const dark = (opt.dark != null ? opt.dark : (CH.shareMode || document.documentElement.dataset.look) === 'dark');
  const P = dark ? {paper: '#1C1B1F', card: '#28272C', ink: '#F3EFE8', mute: '#B9B4AC', faint: '#8E8A84', line: '#3A3940', up: '#4CD08A', dn: '#FF7AA8', pen: '#5DB4FF'}
    : {paper: '#EEE8DF', card: '#FBF8F3', ink: '#17161A', mute: '#4A4852', faint: '#6E6B75', line: '#DDD5C8', up: '#1B7A45', dn: '#C0185A', pen: '#005A90'};
  const DISP = 'Unbounded, "Instrument Sans", sans-serif', BODY = '"Instrument Sans", system-ui, sans-serif';
  try { await Promise.all(['italic 800 40px Unbounded', '800 40px Unbounded', '600 20px "Instrument Sans"', '400 20px "Instrument Sans"'].map(f => document.fonts.load(f, 'Team Sheet 0123'))); } catch (e) {}
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic';
  const fit = (t, max) => scFit(x, String(t), max), rr = (X, Y, w, h, r) => PO.round(x, X, Y, w, h, r);
  x.fillStyle = P.paper; x.fillRect(0, 0, W, H);
  /* head: kicker, team name, the key */
  const r = (typeof regInfo === 'function' && regInfo()) || {id: 'M-C'}, name = opt.name || (typeof teamTitleFor === 'function' ? teamTitleFor(ms) : '') || 'My team';
  x.font = `600 20px ${BODY}`; x.fillStyle = P.mute; x.fillText(`Team sheet · Pokémon Champions · Reg ${String(r.id).toUpperCase()} doubles · Level 50`, 40, 54);
  let fz = 52; do { x.font = `italic 800 ${fz}px ${DISP}`; } while (x.measureText(name).width > W - 80 && --fz > 28);
  x.fillStyle = P.ink; x.fillText(fit(name, W - 80), 40, 54 + 16 + fz);
  const ky = 54 + 16 + fz + 34; x.font = `400 19px ${BODY}`; x.fillStyle = P.mute;
  const key1 = 'Big number: the stat at level 50 · small number: stat points (0–32) · ', kw = x.measureText(key1).width; x.fillText(key1, 40, ky);
  x.font = `700 19px ${BODY}`; x.fillStyle = P.up; x.fillText('+', 40 + kw, ky); const pw = x.measureText('+').width; x.fillStyle = P.mute; x.font = `400 19px ${BODY}`; x.fillText(' / ', 40 + kw + pw, ky);
  const sw = x.measureText(' / ').width; x.font = `700 19px ${BODY}`; x.fillStyle = P.dn; x.fillText('−', 40 + kw + pw + sw, ky); const mw = x.measureText('−').width; x.font = `400 19px ${BODY}`; x.fillStyle = P.mute; x.fillText(' nature', 40 + kw + pw + sw + mw, ky);
  /* the six cards */
  const src = id => (window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp';
  const imgs = await Promise.all(ms.map(m => { const id = typeof SPRITE_ID === 'object' && SPRITE_ID ? SPRITE_ID[m.p.n] : null; return id ? scImg(src(id)) : Promise.resolve(null); }));
  const top = ky + 22, gap = 16, cw = (W - 80 - gap) / 2, chh = (1244 - top - gap * 2) / 3;
  ms.forEach((m, i) => { const X = 40 + (cw + gap) * (i % 2), Y = top + (chh + gap) * Math.floor(i / 2), p = m.p, ta = TC[p.t[0]] || P.pen;
    x.fillStyle = P.card; rr(X, Y, cw, chh, 14); x.fill();
    x.save(); rr(X, Y, cw, chh, 14); x.clip(); x.fillStyle = ta; x.fillRect(X, Y, 8, chh); x.restore();
    const L = X + 26, R = X + cw - 20; let y = Y + 16;
    const im = imgs[i]; if (im) { const s = Math.min(88 / im.width, 88 / im.height); x.drawImage(im, L - 4, y, im.width * s, im.height * s); }
    const tx = L + 96; let nf = 28; do { x.font = `italic 800 ${nf}px ${DISP}`; } while (x.measureText(m.d).width > R - tx && --nf > 16);
    x.fillStyle = P.ink; x.fillText(m.d, tx, y + 30);
    const {sp, nat, src: from} = memberSpread(m), nb = nat ? TS.natBits(nat) : {};
    const row = (lab, val, yy, extra) => { x.font = `600 17px ${BODY}`; x.fillStyle = P.faint; x.fillText(lab, tx, yy); x.font = `600 19px ${BODY}`; x.fillStyle = P.ink;
      const vx = tx + 72, v = fit(val, R - vx - (extra ? extra.w : 0)); x.fillText(v, vx, yy); return vx + x.measureText(v).width; };
    row('Item', m.item || 'No item', y + 58); row('Ability', m.ability || '—', y + 82);
    const ne = row('Nature', nat || 'Unknown', y + 106);
    if (nb.up && nb.dn && nb.up !== nb.dn) { x.font = `700 17px ${BODY}`; x.fillStyle = P.up; const u = ` +${nb.up}`; x.fillText(u, ne + 6, y + 106); const uw = x.measureText(u).width; x.fillStyle = P.dn; x.fillText(` −${nb.dn}`, ne + 6 + uw, y + 106); }
    /* moves, 2 x 2 */
    y += 122; const mw2 = (R - L - 10) / 2;
    for (let j = 0; j < 4; j++) { const mv = m.moves[j], mx = L + (mw2 + 10) * (j % 2), my = y + 42 * Math.floor(j / 2), col = mv ? (TC[mv.type] || P.faint) : P.line;
      x.fillStyle = mv ? PO.mix(col, P.card, dark ? .74 : .83) : P.card; rr(mx, my, mw2, 34, 6); x.fill(); x.fillStyle = col; x.fillRect(mx, my, 5, 34);
      x.font = `600 18px ${BODY}`; x.fillStyle = mv ? P.ink : P.faint; x.fillText(fit(mv ? mv.name : 'No move', mw2 - 22), mx + 14, my + 23); }
    /* stats */
    y += 86; x.fillStyle = P.line; x.fillRect(L, y, R - L, 2);
    x.font = `400 15px ${BODY}`; x.fillStyle = P.faint; x.textAlign = 'right'; x.fillText(from, R, y + 20); x.textAlign = 'left';
    const colw = (R - L) / 6; TS.STATS.forEach(([S_, k], j) => { const cx = L + colw * j + colw / 2, pts = sp ? +sp[k] || 0 : null, val = sp ? calcStat(p, S_, pts, natMul(nat, S_)) : null,
        tone = nb.up === S_ ? P.up : nb.dn === S_ ? P.dn : null; x.textAlign = 'center';
      x.font = `600 16px ${BODY}`; x.fillStyle = tone || P.mute; x.fillText(S_ + (tone === P.up ? '+' : tone === P.dn ? '−' : ''), cx, y + 42);
      x.font = `italic 800 24px ${DISP}`; x.fillStyle = tone || P.ink; x.fillText(val == null ? '—' : String(val), cx, y + 72);
      x.font = `500 15px ${BODY}`; x.fillStyle = P.faint; if (pts != null) x.fillText(String(pts), cx, y + 92); x.textAlign = 'left'; }); });
  /* foot: the logo and the line */
  x.fillStyle = P.line; x.fillRect(40, 1262, W - 80, 2);
  const logo = new Image(); logo.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(npLogoSvg(dark));
  await new Promise(res => { logo.onload = res; logo.onerror = res; }); try { x.drawImage(logo, 36, 1276, 230, 230 * 196 / 761.34); } catch (e) {}
  x.textAlign = 'right'; x.font = `italic 800 26px ${DISP}`; x.fillStyle = P.ink; const t2 = 'your win rate.', t1 = 'Sharply raise ', w2 = x.measureText(t2).width;
  x.fillStyle = P.pen; x.fillText(t2, W - 40, 1314); x.fillStyle = P.ink; x.fillText(t1, W - 40 - w2, 1314);
  x.font = `600 15px ${BODY}`; x.fillStyle = P.faint; x.fillText('NastyPlot, unofficial fan tool', W - 40, 1338); x.textAlign = 'left';
  return c; }
