// ---------- Champions arena, group B: My team's sub-pages and the team overlays (theme/arena-team.css) ----------
// Saved teams, My box, Compare, All suggestions, the team editor, the threat sheet, the share card and My team's fold bodies.
// Arena markup only: every number, name and control comes from the app's own data, and every control keeps its element, its
// data-* attributes and its handler. Pokémon shown as plain sprites become art tiles (AR.art's field, sprite and name).
const ARB = {};
/* sprite file -> Pokémon (the reverse of SPRITE_ID), so a drawn sprite can take its own type colours */
ARB._spr = null;
ARB.pOf = img => { if (!ARB._spr) { ARB._spr = new Map(); try { for (const [n, id] of Object.entries(SPRITE_ID)) { const p = byName.get(n); if (p && !ARB._spr.has(String(id))) ARB._spr.set(String(id), p); } } catch (e) {} }
  const m = img && /sp\/(\d+)\.webp/.exec(img.getAttribute('src') || ''); return m ? ARB._spr.get(m[1]) || null : null; };
/* turn an element that holds a sprite into an art tile in place: the element, its children and its attributes stay */
ARB.tile = (el, p, size, name) => { if (!el || !p || el.classList.contains('ar-art')) return;
  el.classList.add('ar-art', 'ar-' + (size || 's'), 'ar-below'); if (AR.isMega(p)) el.classList.add('is-mega');
  el.style.cssText += ';' + AR.tv(p); const img = el.querySelector('img'); if (img) img.classList.add('ar-spr');
  el.insertAdjacentHTML('afterbegin', '<span class="ar-f ar-field" aria-hidden="true"></span>'); if (name) name.classList.add('ar-nm'); };
/* a sprite in a list: a small slanted type field behind it (the .ar-row field, sized for strips and chips) */
ARB.mini = (img, cls) => { if (!img || !img.parentNode || img.parentNode.classList.contains('arb-mf')) return; const p = ARB.pOf(img); if (!p) return;
  const w = document.createElement('span'); w.className = 'arb-mf' + (cls ? ' ' + cls : '') + (AR.isMega(p) ? ' is-mega' : ''); w.style.cssText = AR.tv(p); w.setAttribute('aria-hidden', 'true');
  w.innerHTML = '<span class="arb-mf-f ar-field"></span>'; img.before(w); w.append(img); };

/* ===== Saved teams: each six as art tiles ===== */
ARB.saved = () => { const L = $('savedList'); if (!L) return;
  L.querySelectorAll('.svt').forEach(card => { const six = card.querySelector('.svsix'); if (!six || six.classList.contains('arb-six')) return;
    const k = card.querySelector('[data-load],[data-delok],[data-rnok],[data-cmp]'), id = k && (k.dataset.load || k.dataset.delok || k.dataset.rnok || k.dataset.cmp);
    const t = id && S.teams.find(x => x.id === id); if (!t) return; let ms = []; try { ms = teamRating(t.slots).ms; } catch (e) {}
    six.classList.add('arb-six', 'ar-six'); six.setAttribute('role', 'group');
    six.innerHTML = ms.map(m => AR.art(m.p, {tag: 'div', size: 's', below: 1, name: m.d, attrs: `title="${esc(m.d)}"`})).join('') + Array.from({length: Math.max(0, 6 - ms.length)}, () => AR.emptyArt('s')).join('');
    card.querySelectorAll('.svacts .btn.primary[data-load]').forEach(b => b.classList.add('arb-open')); }); };
CH.wrap('renderSaved', () => ARB.saved());

/* ===== My box: every Pokémon you own as an art tile, its remove button on the tile ===== */
ARB.box = () => { const L = $('boxList'); if (!L) return;
  L.querySelectorAll('.boxchip').forEach(c => { const x = c.querySelector('[data-unbox]'), p = x && byName.get(x.dataset.unbox); if (p) ARB.tile(c, p, 's', c.querySelector(':scope > b')); }); };
CH.wrap('renderBox', () => ARB.box());

/* ===== Compare: the two sixes as art tiles, the picker's teams as small type fields ===== */
ARB.compare = () => { const el = $('cxOut'); if (!el) return;
  el.querySelectorAll('.cxsix > span').forEach(s => { const p = ARB.pOf(s.querySelector('img')); if (p && !s.classList.contains('ar-art')) { s.insertAdjacentHTML('beforeend', `<span class="ar-nm">${escName(p.d)}</span>`); ARB.tile(s, p, 's', s.querySelector('.ar-nm')); } });
  el.querySelectorAll('.cxos img.spr, .cxthr img.spr').forEach(ARB.mini); };
CH.wrap('renderCompare', () => ARB.compare());

/* ===== All suggestions: each suggested Pokémon on its own type field ===== */
ARB.recs = () => { document.querySelectorAll('#recList .addcard .rtop img.spr, #sugs .plan .swap img.spr').forEach(i => ARB.mini(i, 'arb-lg')); };
CH.wrap('renderRecs', () => ARB.recs()); CH.wrap('renderPlans', () => ARB.recs());

/* ===== the overlays: the editor's strip and set card, the threat sheet, Log a game (they redraw often, so one watcher) ===== */
ARB.field = (el, p) => { if (!el || !p || el.querySelector(':scope > .arb-f')) return; el.style.cssText += ';' + AR.tv(p); if (AR.isMega(p)) el.classList.add('is-mega');
  el.insertAdjacentHTML('afterbegin', '<span class="arb-f ar-field" aria-hidden="true"></span>'); };
ARB.overlays = () => { const ed = $('chEdit');
  if (ed && !ed.hidden) { ed.querySelectorAll('.chst').forEach(b => ARB.field(b, ARB.pOf(b.querySelector('img'))));
    ed.querySelectorAll('.tcard .thead > img.tspr').forEach(i => ARB.mini(i, 'arb-xl')); }
  const sc = $('chScout'); if (sc && !sc.hidden) { sc.querySelectorAll('.chdet img.spr, .chlist .it > img.spr, .chbest img.spr').forEach(i => ARB.mini(i, 'arb-lg'));
    sc.querySelectorAll('.chtile[data-chthr]').forEach(b => ARB.field(b, byName.get(b.dataset.chthr)));
    const d = sc.querySelector('.chdet'), p = d && CH.sel && byName.get(CH.sel); if (d && p && !d.dataset.arb) { d.dataset.arb = 1; d.style.cssText += ';' + AR.tv(p); } }
  /* My team's fold bodies: the vs-top-12 chart's sprites and the All 30 rows on small type fields */
  document.querySelectorAll('[data-pane="report"] #chVsOut .chchart img.spr').forEach(i => ARB.mini(i));
  document.querySelectorAll('[data-pane="report"] #thrCard .thrrow > summary > img.spr, [data-pane="report"] .pfix .qtop > img.spr').forEach(i => ARB.mini(i, 'arb-lg'));
  document.querySelectorAll('.myrec .qlog .logpick, .myrec .qlog [data-qllead]').forEach(b => ARB.field(b, ARB.pOf(b.querySelector('img')))); };
{ let q = false; const run = () => { q = false; try { ARB.overlays(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']}); }

/* ===== the share card (1200x675) and the team poster (1080x1350), drawn in the arena style ======
   Paper, ink and the section blue; each Pokémon on its own slanted type field with the light streaks, the sprite breaking out of
   the top, Megas with the two-colour contour; the name in Archivo italic under the art; the headline numeral with the misprint
   offset. Sentence case and commas (no all-caps, no middle dots). The same facts as before: the team's name, its archetype, the
   grade (from the record with 30+ games, as on My team), readiness and how many of the top 30 threats it handles. */
ARB.dots = t => String(t || '').replace(/\s*·\s*/g, ', ');
ARB.facts = (ms, name) => { const f = posterFacts(ms, name); f.name = ARB.dots(f.name); f.arch = ARB.dots(f.arch); return f; };
/* one name size for the whole six, so the names read as a set */
ARB.nameSize = (x, ms, w, max) => { let f = max; for (const m of ms) { if (!m) continue; const nm = m.d || m.p.d; while (f > 16) { ARB.fnt(x, `italic 800 ${f}px Archivo, sans-serif`, true); if (x.measureText(nm).width <= w + 10) break; f--; } } return f; };
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
  x.textAlign = 'center'; x.fillStyle = P.ink; const nm = m.d || m.p.d; let f = nameSize; do { ARB.fnt(x, `italic 800 ${f}px Archivo, "Instrument Sans", sans-serif`, true); } while (x.measureText(nm).width > w + 10 && --f > 14);
  x.fillText(nm, cx - ARB.SK * 0, y + h + nameSize * 1.25);
  if (sub) { ARB.fnt(x, `600 ${Math.round(nameSize * .7)}px "Instrument Sans", sans-serif`); x.fillStyle = P.ink2; x.fillText(scFit(x, sub, w + 6), cx, y + h + nameSize * 1.25 + nameSize * .95); }
  x.textAlign = 'left'; };
/* the score as on My team: the record's win rate with 30+ games, else the grade out of 100 */
ARB.score = (G) => !G ? null : G.rec ? {num: (G.rec.wr * 100).toFixed(1) + '%', top: `Grade ${G.letter}`, basis: 'tournament win rate'} : {num: String(G.s), top: `Grade ${G.letter}${G.partial ? ' so far' : ''}`, basis: 'out of 100'};
ARB.numeral = (x, P, txt, X, Y, size, align) => { ARB.fnt(x, `italic 900 ${size}px Archivo, sans-serif`, true); x.textAlign = align || 'left'; const o = size * .05;
  x.fillStyle = P.mis; x.fillText(txt, X + o, Y + o * .8); x.fillStyle = P.ink; x.fillText(txt, X, Y); x.textAlign = 'left'; };
ARB.tab = (x, P, X, Y, s) => { x.fillStyle = P.blue; ARB.para(x, X + s / 2, Y - s, s, s, 4); x.fill(); };
ARB.logo = async (x, dark, X, Y, w) => { const lg = new Image(); lg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(NP_SVG[dark ? 'hdrD' : 'hdrL']); await new Promise(r => { lg.onload = r; lg.onerror = r; }); try { x.drawImage(lg, X, Y, w, w * 196 / 761.34); } catch (e) {} };
ARB.imgs = ms => { const src = id => (window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp'; return Promise.all(ms.map(m => { const id = typeof SPRITE_ID === 'object' && SPRITE_ID ? SPRITE_ID[m.p.n] : null; return id ? scImg(src(id)) : Promise.resolve(null); })); };
ARB.fonts = async () => { try { await Promise.all(['italic 800 40px Archivo', 'italic 900 40px Archivo', '600 20px "Instrument Sans"', '500 20px "Instrument Sans"'].map(f => document.fonts.load(f, 'Aa0123%'))); } catch (e) {} };
ARB.lines = (x, text, max) => { if (x.measureText(text).width <= max) return [text]; const w = text.split(' '); let best = null;
  for (let i = 1; i < w.length; i++) { const L = [w.slice(0, i).join(' '), w.slice(i).join(' ')], m = Math.max(...L.map(l => x.measureText(l).width)); if (m <= max && (!best || m < best.m)) best = {L, m}; } return best ? best.L : null; };
ARB.card = async function () { const ms = members().slice(0, 6); if (!ms.length) return null; const dark = (CH.shareMode || document.documentElement.dataset.look) === 'dark', P = ARB.PAL(dark); await ARB.fonts();
  const W = 1200, H = 675, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic'; x.fillStyle = P.paper; x.fillRect(0, 0, W, H);
  const f = ARB.facts(ms), sc = ARB.score(f.G), RD = f.RD;
  /* readiness, top right */
  if (RD) { ARB.numeral(x, P, RD.score + '%', W - 60, 132, 104, 'right'); x.textAlign = 'right'; ARB.fnt(x, '600 22px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('ready for the top 30 threats', W - 60, 168);
    if (sc) { ARB.fnt(x, '700 24px "Instrument Sans", sans-serif'); x.fillStyle = P.ink; x.fillText(`${sc.top}, ${sc.num} ${sc.basis}`, W - 60, 202); } x.textAlign = 'left'; }
  /* the title on its slanted tab */
  let fz = 70; do { ARB.fnt(x, `italic 800 ${fz}px Archivo, sans-serif`, true); } while (x.measureText(f.name).width > 640 && --fz > 38);
  const tt = scFit(x, f.name, 660); ARB.tab(x, P, 56, 116, 40); x.fillStyle = P.ink; x.fillText(tt, 112, 116);
  ARB.fnt(x, '500 22px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('Pokémon Champions, VGC doubles, Reg M-C, bring 6 pick 4', 58, 160);
  if (f.arch && f.arch !== f.name) { ARB.fnt(x, '700 22px "Instrument Sans", sans-serif'); const t = scFit(x, f.arch, 520), w = x.measureText(t).width + 36; x.fillStyle = P.plate; ARB.para(x, 58 + w / 2, 182, w, 40, 6); x.fill(); x.fillStyle = '#fff'; x.fillText(t, 76, 209); }
  /* the six */
  const imgs = await ARB.imgs(ms), cw = (W - 112) / 6, ns = ARB.nameSize(x, ms, cw - 26, 25);
  for (let i = 0; i < 6; i++) { const cx = 56 + cw * i + cw / 2, m = ms[i];
    if (!m) { x.fillStyle = P.bar; ARB.para(x, cx, 330, cw - 26, 150, 14); x.fill(); continue; }
    const ti = typeof topItems === 'function' ? topItems(m.p) : null, item = m.item || (ti && ti.it && ti.it[0] ? ti.it[0][0] : '');
    ARB.drawTile(x, P, dark, m, imgs[i], cx, 330, cw - 26, 150, 172, ns, item); }
  /* footer */
  x.fillStyle = P.rule; x.fillRect(56, 586, W - 112, 2); await ARB.logo(x, dark, 50, 604, 200);
  x.textAlign = 'right'; ARB.fnt(x, 'italic 800 30px Archivo, sans-serif', true); x.fillStyle = P.blue; x.fillText('Plot your win.', W - 56, 640);
  ARB.fnt(x, '600 17px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('NastyPlot, unofficial fan tool', W - 56, 662); x.textAlign = 'left';
  return c; };
ARB.poster = async function (ms, opt) { opt = opt || {}; if (!ms || !ms.length) return null; ms = ms.slice(0, 6);
  const dark = (opt.dark != null ? opt.dark : (CH.shareMode || document.documentElement.dataset.look) === 'dark'), P = ARB.PAL(dark); await ARB.fonts();
  const f = ARB.facts(ms, opt.name), sc = ARB.score(f.G), {W, H} = PO, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic';
  x.fillStyle = P.paper; x.fillRect(0, 0, W, H);
  /* a soft slanted blue stage behind the six (the My team stage) */
  x.save(); x.beginPath(); x.moveTo(0, 360); x.lineTo(W, 330); x.lineTo(W, 1010); x.lineTo(0, 1040); x.closePath(); const sg = x.createLinearGradient(0, 330, W, 1040);
  sg.addColorStop(0, dark ? ARB.mixc('#0E0E10', '#0078BF', .2) : ARB.mixc('#ECE7E0', '#0078BF', .22)); sg.addColorStop(1, dark ? '#0E0E10' : ARB.mixc('#ECE7E0', '#0078BF', .08)); x.fillStyle = sg; x.fill(); x.restore();
  ARB.fnt(x, '600 26px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('My team, Pokémon Champions, Reg M-C doubles', 60, 86);
  /* the name, as big as fits, up to two lines, on its slanted tab */
  let fz = 104, L = null; for (; fz >= 52; fz -= 4) { ARB.fnt(x, `italic 800 ${fz}px Archivo, sans-serif`, true); L = ARB.lines(x, f.name, W - 190); if (L && (L.length === 1 || fz <= 92)) break; }
  if (!L) L = [scFit(x, f.name, W - 190)]; let ty = 110 + fz * .9; ARB.tab(x, P, 60, ty - fz * .12, fz * .62); for (const l of L) { x.fillStyle = P.ink; x.fillText(l, 60 + fz * .78, ty); ty += fz * 1.02; }
  if (f.arch && f.arch !== f.name) { ARB.fnt(x, '700 28px "Instrument Sans", sans-serif'); const t = scFit(x, f.arch, 700), w = x.measureText(t).width + 44, yy = ty - fz * 1.02 + 30; x.fillStyle = P.plate; ARB.para(x, 64 + w / 2, yy, w, 48, 6); x.fill(); x.fillStyle = '#fff'; x.fillText(t, 86, yy + 33); }
  /* the six: 3 by 2 art tiles */
  const imgs = await ARB.imgs(ms), cw = (W - 120) / 3, rows = [470, 760], ns = ARB.nameSize(x, ms, cw - 40, 32);
  for (let i = 0; i < 6; i++) { const cx = 60 + cw * (i % 3) + cw / 2, y = rows[Math.floor(i / 3)], m = ms[i];
    if (!m) { x.fillStyle = P.bar; ARB.para(x, cx, y, cw - 40, 170, 16); x.fill(); continue; }
    ARB.drawTile(x, P, dark, m, imgs[i], cx, y, cw - 40, 170, 230, ns); }
  /* the grade and the threats */
  const gy = 1128;
  if (sc) { const nz = sc.num.length > 3 ? 104 : 124; ARB.numeral(x, P, sc.num, 60, gy, nz); ARB.fnt(x, `italic 900 ${nz}px Archivo, sans-serif`, true); const nw = x.measureText(sc.num).width + 28;
    ARB.fnt(x, '700 32px "Instrument Sans", sans-serif'); x.fillStyle = P.ink; x.fillText(sc.top, 60 + nw, gy - 44); ARB.fnt(x, '500 24px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText(sc.basis, 60 + nw, gy - 8); }
  else { ARB.fnt(x, '600 26px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText(`${ms.length} of 6 Pokémon`, 60, gy - 50); ARB.fnt(x, 'italic 800 40px Archivo, sans-serif', true); x.fillStyle = P.ink; x.fillText('The grade comes with a full six', 60, gy); }
  if (f.hd) { const ry = 1206; ARB.fnt(x, '600 26px "Instrument Sans", sans-serif'); x.fillStyle = P.ink; const t = `Handles ${f.hd.x} of the top ${f.hd.n} threats`; x.fillText(t, 60, ry); const tx = 60 + x.measureText(t).width + 28, bw = W - 60 - tx, fr = Math.max(0, Math.min(1, f.hd.x / f.hd.n));
    if (bw > 80) { x.fillStyle = P.bar; ARB.para(x, tx + bw / 2, ry - 18, bw, 14, 3); x.fill(); x.save(); ARB.para(x, tx + bw / 2, ry - 18, bw, 14, 3); x.clip(); x.fillStyle = P.green; x.fillRect(tx - 10, ry - 18, (bw + 10) * fr, 14); x.restore(); } }
  /* footer */
  x.fillStyle = P.rule; x.fillRect(60, 1240, W - 120, 2); await ARB.logo(x, dark, 54, 1258, 260);
  x.textAlign = 'right'; ARB.fnt(x, 'italic 800 40px Archivo, sans-serif', true); x.fillStyle = P.blue; x.fillText('Plot your win.', W - 60, 1300);
  ARB.fnt(x, '600 20px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('NastyPlot, unofficial fan tool', W - 60, 1330); x.textAlign = 'left';
  return c; };
buildTeamPoster = ARB.poster;
buildShareCard = function () { return CH.shareKind === 'poster' && !SHARE_KIND ? buildTeamPoster(members()) : ARB.card(); };

if (window.__PL_TEST) window.__ARB = {setView: v => setView(v), edit: i => chEditOpen(i), scout: n => chScoutOpen(n), share: () => openShareCard(), members: () => members(), S: () => S, ARB};
