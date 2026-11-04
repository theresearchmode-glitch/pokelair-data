// ---------- Extras B (Nov 2): the team's weather on its header, and the Team poster ----------

/* ===== Weather on your team header =====
   When the six sets a weather or a terrain (the same reading as the archetype: teamArchetype().field, setters by ability),
   the My team header gets a quiet moving backdrop: rain streaks, sun glow and rays, drifting sand, snowflakes, or for
   terrains green leaves (Grassy), pink shimmer (Psychic), small sparks (Electric), pink mist (Misty). A team with both
   shows its weather. A visible word ("Rain team") says it in text. The particles sit behind the text, move with
   transform/opacity only, pause off screen and in a hidden tab, and stay still (a static tint) under reduced motion.
   The animation clock follows performance.now(), so a redraw of the header does not restart the particles. */
const WXFX = {rain: {n: 'Rain', p: 22}, sun: {n: 'Sun', p: 2}, sand: {n: 'Sand', p: 26}, snow: {n: 'Snow', p: 22},
  grassy: {n: 'Grassy Terrain', p: 9}, psy: {n: 'Psychic Terrain', p: 3}, elec: {n: 'Electric Terrain', p: 10}, misty: {n: 'Misty Terrain', p: 12}};
function wxKeyOf(ms) { if (!ms || !ms.length) return null; let a = null; try { a = teamArchetype(ms); } catch (e) {} if (!a || !a.field) return null;
  /* a weather beats a terrain; within each, one the team uses (active) beats a setter on its own */
  const pick = keys => { const f = a.field.filter(x => keys.includes(x.key)); const x = f.find(y => y.active) || f[0]; return x ? x.key : null; };
  return pick(WEATHER_KEYS) || pick(TERRAIN_KEYS); }
const wxName = k => WXFX[k] ? WXFX[k].n + ' team' : '';
/* the particles: positions and timings from a fixed sequence, so every redraw puts them in the same places */
function wxLayer(k, cls) { const F = WXFX[k]; if (!F) return '';
  const rnd = i => { const x = Math.sin((i + 1) * 12.9898 + k.length * 78.233) * 43758.5453; return x - Math.floor(x); };
  const ph = -(performance.now() / 1000).toFixed(2);
  let h = ''; for (let i = 0; i < F.p; i++) { const a = rnd(i), b = rnd(i + 40), c = rnd(i + 80), d = rnd(i + 120);
    h += `<i style="--x:${(3 + a * 94).toFixed(1)}%;--y:${(4 + b * 88).toFixed(1)}%;--d:${(.8 + c * .5).toFixed(2)};--o:${(d * 9).toFixed(2)}s;--s:${(.7 + b * .6).toFixed(2)}"><b></b></i>`; }
  return `<div class="wxfx wx-${k}${cls ? ' ' + cls : ''}" style="--ph:${ph}s" aria-hidden="true">${h}</div>`; }
/* pause what is off screen or in a hidden tab */
const WXIO = typeof IntersectionObserver === 'function' ? new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('wxp', !e.isIntersecting)), {rootMargin: '40px'}) : null;
document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('wxhid', document.hidden));
function wxWatch(root) { if (WXIO && root) root.querySelectorAll('.wxfx').forEach(x => WXIO.observe(x)); }
CH.wrap('chTeamRender', () => { const th = document.querySelector('#chTeam .chthead'); if (!th) return; const k = wxKeyOf(members());
  th.classList.toggle('wxon', !!k); if (!k) return; th.insertAdjacentHTML('afterbegin', wxLayer(k)); th.dataset.wx = k;
  const ck = th.querySelector('.chk'); if (ck) ck.insertAdjacentHTML('beforeend', ` · <span class="wxlbl">${esc(wxName(k))}</span>`);
  wxWatch(th); });
/* Home's Your team card: the same weather as a small labelled window next to the card's heading line (the card's white
   text on blue sits too close to 4.5:1 for particles behind it) */
CH.wrap('renderHome', () => { const k = wxKeyOf(members()); if (!k) return; const el = $('homeOut'); if (!el) return;
  el.querySelectorAll('.chmcard.you > .chk, .chband.you > .chk, .chblock > .chk').forEach(ck => { if (ck.closest('.chblock') && !ck.parentElement.querySelector('.chshow:not(.empty)')) return; if (ck.querySelector('.wxchip')) return;
    ck.insertAdjacentHTML('beforeend', ` <span class="wxchip wx-${k}">${wxLayer(k, 'mini')}<span>${esc(wxName(k))}</span></span>`); });
  wxWatch(el); });

/* ===== Team poster =====
   A 1080x1350 portrait image of the six for social posts: a bold banner in the team's own type colours, big sprites,
   the team name, the archetype, the grade (letter in its band colour + the number) and how many of the top 30 threats it
   handles, with the NastyPlot logo and "Plot your win." Light or Warm charcoal, like the share card. No win-chance words.
   Sprites come from sp/ on the same origin, so the canvas stays exportable. */
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
async function buildTeamPoster(ms, opt) { opt = opt || {}; if (!ms || !ms.length) return null; ms = ms.slice(0, 6);
  const dark = (opt.dark != null ? opt.dark : (CH.shareMode || document.documentElement.dataset.look) === 'dark');
  const P = dark ? {paper: '#232120', ink: '#F3EBDC', mute: '#D9D0C2', pen: '#7CC4FF', line: '#4A4541', card: '#2C2A28'} : {paper: '#F1E9DA', ink: '#1D2140', mute: '#4E5068', pen: '#005A90', line: '#D8CCB6', card: '#FBF6EC'};
  try { await Promise.all(['400 80px Anton', '800 30px Archivo', '700 16px "Instrument Sans"', '400 40px "Instrument Sans"'].map(f => document.fonts.load(f, 'NASTYPLOT 0123%'))); } catch (e) {}
  const f = posterFacts(ms, opt.name), {W, H} = PO, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic';
  x.fillStyle = P.paper; x.fillRect(0, 0, W, H);
  /* the banner: the team's type colours, a diagonal hem, halftone dots */
  const col = PO.colours(ms), c1 = dark ? PO.mix(col.c[0], '#171615', .28) : col.c[0], c2 = dark ? PO.mix(col.c[1], '#171615', .28) : col.c[1];
  const by = 950; x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, by - 60); x.lineTo(0, by + 30); x.closePath(); x.clip();
  const g = x.createLinearGradient(0, 0, W, by); g.addColorStop(0, c1); g.addColorStop(.4, c1); g.addColorStop(.6, c2); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, W, by + 40);
  if (dark) { const gl = x.createRadialGradient(W * .8, 0, 0, W * .8, 0, 700); gl.addColorStop(0, 'rgba(255,255,255,.14)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(0, 0, W, by + 40); }
  x.fillStyle = 'rgba(255,255,255,.16)'; for (let yy = 6; yy < by + 40; yy += 12) for (let xx = (yy / 12 % 2) * 6; xx < W; xx += 12) { x.beginPath(); x.arc(xx, yy, 1.8, 0, 7); x.fill(); }
  x.restore();
  /* text on the banner: ink or white, whichever reads better on both colours */
  const ink = '#1D2140', TX = Math.min(PO.cr('#ffffff', c1), PO.cr('#ffffff', c2)) >= Math.min(PO.cr(ink, c1), PO.cr(ink, c2)) ? '#ffffff' : ink, SH = TX === '#ffffff' ? 'rgba(20,16,40,.55)' : 'rgba(255,255,255,.7)';
  x.font = '700 24px "Instrument Sans", monospace'; x.fillStyle = TX; x.fillText('MY TEAM · POKÉMON CHAMPIONS · REG M-C DOUBLES', 56, 78);
  /* the name: as big as fits, up to two lines */
  /* a " · " stays with the word before it, so no line starts with a dot */
  const title = f.name.toUpperCase(), words = title.replace(/ · /g, '\u00a0· ').split(/ +/); let fz = 132, lines = [title];
  for (; fz >= 64; fz -= 4) { x.font = `400 ${fz}px Anton, Impact, sans-serif`; if (x.measureText(title).width <= 968) { lines = [title]; break; }
    let best = null; for (let i = 1; i < words.length; i++) { const L = [words.slice(0, i).join(' '), words.slice(i).join(' ')]; const w = Math.max(...L.map(l => x.measureText(l).width)); if (w <= 968 && (!best || w < best.w)) best = {L, w}; }
    if (best && fz <= 116) { lines = best.L; break; } }
  if (fz < 64) { fz = 64; x.font = `400 ${fz}px Anton, Impact, sans-serif`; lines = [scFit(x, title, 968)]; }
  let ty = 96 + fz * .92; for (const l of lines) { x.fillStyle = SH; x.fillText(l, 62, ty + 6); x.fillStyle = TX; x.fillText(l, 56, ty); ty += fz * .98; }
  /* the archetype chip */
  let cy = ty - fz * .98 + 34;
  /* an unsaved team is named after its archetype: then the chip would only repeat the name, so it is left out */
  if (f.arch && f.arch.toUpperCase() !== title.replace(/\u00a0/g, ' ')) { x.font = '800 30px Archivo, sans-serif'; const t = scFit(x, f.arch, 900), w = x.measureText(t).width + 48; x.fillStyle = TX; PO.round(x, 56, cy, w, 54, 27); x.fill();
    x.fillStyle = TX === '#ffffff' ? PO.mix(c1, '#000000', .35) : '#ffffff'; if (PO.cr(x.fillStyle, TX) < 4.5) x.fillStyle = TX === '#ffffff' ? ink : '#ffffff'; x.fillText(t, 80, cy + 38); cy += 54; }
  /* the six: big sprites in two rows of three, each name on a white tag */
  const src = id => (window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp';
  const imgs = await Promise.all(ms.map(m => { const id = typeof SPRITE_ID === 'object' && SPRITE_ID ? SPRITE_ID[m.p.n] : null; return id ? scImg(src(id)) : Promise.resolve(null); }));
  const top = Math.max(cy + 24, 330), rowH = (by - 40 - top) / 2, cw = (W - 60) / 3, sz = Math.min(250, rowH - 58);
  for (let i = 0; i < 6; i++) { const m = ms[i], cx = 30 + cw * (i % 3) + cw / 2, y0 = top + rowH * Math.floor(i / 3);
    if (!m) { x.strokeStyle = TX; x.globalAlpha = .45; x.setLineDash([10, 10]); x.lineWidth = 4; x.beginPath(); x.arc(cx, y0 + sz / 2, sz * .36, 0, 7); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; continue; }
    x.fillStyle = 'rgba(10,8,30,.22)'; x.beginPath(); x.ellipse(cx, y0 + sz - 6, sz * .34, 14, 0, 0, 7); x.fill();
    const im = imgs[i]; if (im) { const s = Math.min(sz / im.width, sz / im.height); x.save(); x.shadowColor = 'rgba(0,0,0,.28)'; x.shadowOffsetX = 4; x.shadowOffsetY = 6; x.shadowBlur = 6;
      x.drawImage(im, cx - im.width * s / 2, y0 + sz - im.height * s, im.width * s, im.height * s); x.restore(); }
    const nm = (m.d || m.p.d || m.p.n).toUpperCase(); let f2 = 28; do { x.font = `800 ${f2}px Archivo, sans-serif`; } while (x.measureText(nm).width > cw - 44 && --f2 > 15);
    const nw = x.measureText(nm).width + 28; x.fillStyle = dark ? '#171615' : '#ffffff'; PO.round(x, cx - nw / 2, y0 + sz + 6, nw, 42, 21); x.fill();
    x.fillStyle = dark ? '#F3EBDC' : ink; x.textAlign = 'center'; x.fillText(nm, cx, y0 + sz + 37); x.textAlign = 'left'; }
  /* grade and threats, under the banner */
  const gy = 1100;
  if (f.G) { const L = f.G.letter, bc = CH.gcol(L), lc = PO.cr(bc, '#1D2140') >= PO.cr(bc, '#ffffff') ? '#1D2140' : '#ffffff';
    x.fillStyle = bc; x.beginPath(); x.arc(150, gy, 92, 0, 7); x.fill();
    x.save(); x.translate(150, gy); x.rotate(-.12); x.strokeStyle = P.pen; x.lineWidth = 6; x.beginPath(); x.ellipse(0, 0, 112, 104, 0, .3, Math.PI * 2 + .05); x.stroke(); x.restore();
    x.fillStyle = lc; x.textAlign = 'center'; x.font = '400 118px "Instrument Sans",system-ui,sans-serif'; x.fillText(L, 150, gy + 42); x.textAlign = 'left';
    x.font = '700 24px "Instrument Sans", monospace'; x.fillStyle = P.mute; x.fillText('GRADE', 282, gy - 52);
    x.font = '400 112px Anton, Impact, sans-serif'; x.fillStyle = bc; const nw = x.measureText(String(f.G.s)).width; x.fillStyle = P.ink; x.fillText(String(f.G.s), 282, gy + 62);
    x.fillStyle = bc; x.fillRect(282, gy + 76, nw, 8); }
  else { x.font = '700 24px "Instrument Sans", monospace'; x.fillStyle = P.mute; x.fillText(`${ms.length} OF 6 POKÉMON`, 56, gy - 30); x.font = '800 34px Archivo, sans-serif'; x.fillStyle = P.ink; x.fillText('Grade comes with a full six', 56, gy + 20); }
  if (f.hd) { const rx = 640, r = 74, fr = Math.max(0, Math.min(1, f.hd.x / f.hd.n));
    x.lineWidth = 18; x.strokeStyle = P.line; x.beginPath(); x.arc(rx, gy, r, 0, 7); x.stroke();
    x.strokeStyle = dark ? '#3DBE78' : '#1E8E4E'; x.lineCap = 'round'; x.beginPath(); x.arc(rx, gy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fr); x.stroke(); x.lineCap = 'butt';
    x.textAlign = 'center'; x.font = '400 70px Anton, Impact, sans-serif'; x.fillStyle = P.ink; x.fillText(String(f.hd.x), rx, gy + 25); x.textAlign = 'left';
    x.font = '800 34px Archivo, sans-serif'; x.fillStyle = P.ink; x.fillText(`Handles ${f.hd.x} of`, 744, gy - 8); x.fillText(`the top ${f.hd.n} threats`, 744, gy + 34); }
  /* footer: the logo and the line */
  x.fillStyle = P.line; x.fillRect(56, 1236, W - 112, 3);
  const logo = new Image(); logo.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(NP_SVG[dark ? 'hdrD' : 'hdrL']);
  await new Promise(r => { logo.onload = r; logo.onerror = r; }); try { x.drawImage(logo, 50, 1252, 300, 300 * 196 / 761.34); } catch (e) {}
  x.textAlign = 'right'; x.font = '400 50px "Instrument Sans",system-ui,sans-serif'; x.fillStyle = P.pen; x.fillText('Plot your win.', W - 56, 1302);
  x.font = '700 18px "Instrument Sans", monospace'; x.fillStyle = P.mute; x.fillText('NASTYPLOT · UNOFFICIAL FAN TOOL', W - 56, 1332); x.textAlign = 'left';
  return c; }
/* My team's Share: "Team card" (the wide card, as before) or "Team poster" (portrait) */
CH.shareKind = 'card';
{ const bsc = buildShareCard; buildShareCard = function () { return CH.shareKind === 'poster' && !SHARE_KIND ? buildTeamPoster(members()) : bsc.apply(this, arguments); }; }
/* runs once the (async) share box is drawn: the poster title and size, the Team card / Team poster choice, and the Light / Dark
   style choice when it is not there yet (the style choice decides the poster's look too) */
function wxShareDecor() { const box = $('shareBox'); if (!box || box.hidden) return; const hd = box.querySelector('.sharehd'); if (!hd) return;
  const K = SHARE_KIND, poster = K ? !!K.poster : CH.shareKind === 'poster';
  if (poster) { const b = hd.querySelector('b'); if (b) b.textContent = 'Team poster'; const im = box.querySelector('.shareimg'); if (im) { im.classList.add('poster'); im.alt = K && K.alt ? K.alt : 'Your team as a NastyPlot team poster'; } }
  if (!K && !box.querySelector('.wxkind')) hd.insertAdjacentHTML('afterend', `<div class="seg wxkind" role="group" aria-label="What to share">${[['card', 'Team card'], ['poster', 'Team poster']].map(([k, t]) => `<button type="button" data-shkind="${k}" aria-pressed="${CH.shareKind === k}">${t}</button>`).join('')}</div>`);
  if (!box.querySelector('.chshmode')) { const cur = CH.shareMode || document.documentElement.dataset.look || 'light'; (box.querySelector('.wxkind') || hd).insertAdjacentHTML('afterend', `<div class="seg chshmode" role="group" aria-label="Card style">${[['light', 'Light'], ['dark', 'Dark']].map(([k, t]) => `<button type="button" data-chshm="${k}" aria-pressed="${cur === k}">${t}</button>`).join('')}</div>`); } }
{ const osc = openShareCard; openShareCard = async function () { const r = await osc.apply(this, arguments); safe('share decor', wxShareDecor); return r; }; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-shkind]'); if (!b) return; CH.shareKind = b.dataset.shkind; const box = $('shareBox'); if (box) { box.hidden = true; box.innerHTML = ''; } openShareCard(); });
/* Saved teams ⋯: Team poster for that saved six */
CH.wrap('renderSaved', () => { document.querySelectorAll('#savedList .svmore .mmpop').forEach(p => { if (p.querySelector('[data-poster]')) return; const rn = p.querySelector('[data-rn]'); if (!rn) return;
  rn.insertAdjacentHTML('beforebegin', `<button class="btn ghost" data-poster="${esc(rn.dataset.rn)}" type="button">Team poster</button>`); }); });
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-poster]'); if (!b) return; const t = S.teams.find(x => x.id === b.dataset.poster); if (!t) return;
  const ms = teamRating(t.slots).ms;
  SHARE_KIND = {poster: true, build: () => buildTeamPoster(ms, {name: t.name}), file: t.name.replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + ' poster - NastyPlot.png', alt: `${t.name} as a NastyPlot team poster`, empty: 'This saved team has no Pokémon'};
  openShareCard(); });
