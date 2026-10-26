// ---------- share card: a branded 1200x675 image of your team to post anywhere ----------
// Drawn on a canvas in the daylight look (paper, ink, magenta, the logo's pink offset shadow). Sprites come from sp/.
// Saved through the downloads capability when the viewer allows it; otherwise shown full size to press-and-hold save.
const SC_LOOP = new Path2D('M21.4 45.5L22.7 43.4L24.7 41.4L27.0 39.3L29.6 37.3L32.6 35.3L35.9 33.3L39.5 31.3L43.5 29.4L47.7 27.5L52.3 25.7L57.1 23.9L62.2 22.2L67.5 20.5L73.0 18.9L78.8 17.4L84.7 15.9L90.8 14.5L97.1 13.2L103.5 11.9L110.0 10.8L116.5 9.7L123.2 8.7L129.8 7.9L136.6 7.1L143.3 6.4L150.0 5.7L156.7 5.2L163.4 4.8L170.0 4.5L176.6 4.3L183.1 4.1L189.6 4.1L196.0 4.2L202.3 4.3L208.5 4.6L214.6 4.9L220.6 5.4L226.4 5.9L232.2 6.6L237.8 7.3L243.2 8.1L248.5 9.0L253.6 10.0L258.5 11.1L263.2 12.3L267.6 13.5L271.8 14.9L275.8 16.3L279.4 17.9L282.8 19.4L285.9 21.1L288.6 22.9L291.0 24.7L293.1 26.6L294.7 28.5L296.0 30.5L297.0 32.6L297.5 34.7L297.7 36.9L297.4 39.0L296.8 41.3L295.8 43.5L294.5 45.8L292.7 48.1L290.6 50.4L288.2 52.6L285.4 54.9L282.3 57.2L278.9 59.4L275.3 61.6L271.3 63.8L267.1 65.9L262.6 68.0L257.9 70.0L253.0 71.9L247.9 73.8L242.6 75.7L237.1 77.4L231.5 79.1L225.6 80.7L219.7 82.2L213.5 83.6L207.3 84.9L200.9 86.2L194.4 87.3L187.7 88.4L181.0 89.3L174.2 90.2L167.3 91.0L160.3 91.7L153.2 92.2L146.1 92.7L139.0 93.1L131.9 93.4L124.7 93.6L117.6 93.7L110.6 93.7L103.6 93.6L96.7 93.4L89.9 93.1L83.2 92.7L76.7 92.3L70.4 91.7L64.3 91.0L58.4 90.2L52.8 89.4L47.4 88.4L42.3 87.3L37.5 86.2L32.9 84.9L28.7 83.6L24.9 82.2L21.3 80.7L18.1 79.1L15.2 77.5L12.7 75.7L10.5 73.9L8.6 72.1L7.1 70.2L5.9 68.2L5.0 66.2L4.7 64.1L4.3 62.1L4.1 60.0L4.2 57.9L4.7 55.8L5.4 53.6L6.4 51.5L7.7 49.3L9.3 47.1L11.1 44.9L13.3 42.7L15.7 40.6L18.4 38.4L21.5 36.3L24.8 34.2L28.4 32.1L32.3 30.1L36.5 28.1L41.0 26.2L41.5 26.6L37.0 28.5L32.8 30.5L28.9 32.5L25.3 34.5L22.0 36.6L19.0 38.7L16.3 40.8L13.8 42.9L11.7 45.1L9.9 47.2L8.3 49.4L7.0 51.5L6.0 53.7L5.3 55.8L4.8 57.9L4.7 60.0L4.8 62.0L5.3 64.0L6.4 65.9L7.7 67.7L9.2 69.5L11.0 71.2L13.0 72.8L15.4 74.4L18.1 75.9L21.1 77.3L24.4 78.6L27.9 79.9L31.8 81.0L36.0 82.1L40.5 83.1L45.3 84.0L50.3 84.8L55.6 85.5L61.1 86.1L66.9 86.7L72.9 87.1L79.0 87.5L85.3 87.7L91.8 87.9L98.3 88.0L105.0 88.0L111.8 88.0L118.6 87.8L125.4 87.6L132.2 87.3L139.1 86.9L145.9 86.4L152.7 85.9L159.4 85.2L166.1 84.5L172.7 83.7L179.2 82.9L185.6 81.9L191.9 80.9L198.1 79.9L204.1 78.7L210.1 77.5L215.9 76.2L221.6 74.8L227.1 73.4L232.4 71.9L237.6 70.4L242.7 68.8L247.5 67.1L252.2 65.4L256.6 63.6L260.9 61.8L264.9 60.0L268.6 58.1L272.1 56.3L275.4 54.3L278.3 52.4L280.9 50.5L283.3 48.6L285.3 46.6L286.9 44.7L288.3 42.8L289.2 40.9L289.8 39.0L290.1 37.2L290.0 35.4L289.5 33.7L288.6 32.0L287.4 30.3L285.8 28.7L283.9 27.2L281.7 25.7L279.1 24.2L276.2 22.9L273.0 21.6L269.6 20.4L265.9 19.2L261.9 18.1L257.7 17.1L253.3 16.1L248.7 15.2L243.9 14.4L238.9 13.7L233.7 13.0L228.5 12.5L223.0 11.9L217.5 11.5L211.8 11.1L206.0 10.9L200.2 10.6L194.2 10.5L188.1 10.4L182.0 10.5L175.8 10.6L169.5 10.7L163.2 11.0L156.8 11.3L150.4 11.7L143.9 12.2L137.5 12.8L131.0 13.4L124.6 14.1L118.1 14.9L111.8 15.8L105.5 16.8L99.3 17.8L93.2 18.9L87.2 20.0L81.4 21.3L75.7 22.6L70.3 23.9L65.0 25.4L60.0 26.8L55.1 28.4L50.6 29.9L46.3 31.5L42.3 33.2L38.6 34.9L35.1 36.7L32.0 38.4L29.1 40.2L26.5 42.0L24.2 43.9L21.9 45.7Z');
const SC = {W: 1200, H: 675, ink: '#14071c', mute: '#6b5f86', hot: '#ff3ea5', vio: '#b47bff', pink: '#ffb1d8', paper: '#fbf8ff', acc: '#6a35e8'};
function scImg(src) { return new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; }); }
function scSkew(ctx, x, y, f) { ctx.save(); ctx.setTransform(1, 0, -Math.tan(9 * Math.PI / 180), 1, x, y); f(); ctx.restore(); }
// the logo: N ^ S T Y in Unbounded with the pink offset shadow, the PLOT plate circled in ink
function scLogo(ctx, x, y, s) {
  const fs = 64 * s; ctx.font = `900 ${fs}px Unbounded, "Sofia Sans", sans-serif`; ctx.textBaseline = 'alphabetic';
  const sh = 4 * s, cap = fs * .72, aw = cap * 1.18, wN = ctx.measureText('N').width, tr = -fs * .045;
  const draw = (dx, dy, col, chev) => { scSkew(ctx, x + dx, y + dy, () => { ctx.fillStyle = col; ctx.fillText('N', 0, 0);
      const ax = wN + tr + fs * .02; ctx.save(); ctx.translate(ax, -cap); ctx.scale(aw / 24, cap / 20); ctx.fillStyle = chev || col;
      ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(12, 0); ctx.lineTo(24, 20); ctx.lineTo(17.6, 20); ctx.lineTo(12, 10.2); ctx.lineTo(6.4, 20); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.fillStyle = col; ctx.fillText('STY', ax + aw + fs * .02 + tr, 0); }); };
  draw(sh, sh, SC.pink, SC.pink); draw(0, 0, SC.ink, SC.hot);
  // PLOT plate + the marker loop
  const px = x + 82 * s, py = y + 14 * s, pf = 27 * s; ctx.font = `900 ${pf}px Unbounded, sans-serif`;
  const letters = 'PLOT'.split(''), sp = pf * .34, lw = letters.reduce((a, l) => a + ctx.measureText(l).width, 0) + sp * 3, pw = lw + 38 * s, ph = pf + 10 * s, k = 9 * s;
  ctx.fillStyle = SC.hot; ctx.beginPath(); ctx.moveTo(px + k, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw - k, py + ph); ctx.lineTo(px, py + ph); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SC.ink; let cx = px + 19 * s; for (const l of letters) { ctx.fillText(l, cx, py + ph - 7 * s); cx += ctx.measureText(l).width + sp; }
  ctx.save(); ctx.translate(px - 24 * s, py - 19 * s); ctx.scale((pw + 48 * s) / 300, (ph + 38 * s) / 96); ctx.fillStyle = SC.ink; ctx.fill(SC_LOOP); ctx.restore();
}
function scRound(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function scFit(ctx, text, max) { let t = text; while (t.length > 3 && ctx.measureText(t).width > max) t = t.slice(0, -2) + '…'; return t; }
async function buildShareCard() {
  const ms = members(); if (!ms.length) return null;
  try { await Promise.all([document.fonts.load('900 40px Unbounded', 'NASTYPLO'), document.fonts.load('italic 800 40px "Sofia Sans Condensed"'), document.fonts.load('700 20px "Sofia Sans"'), document.fonts.load('700 15px "JetBrains Mono"')]); } catch (e) {}
  const c = document.createElement('canvas'); c.width = SC.W; c.height = SC.H; const ctx = c.getContext('2d');
  // paper, soft color and the chevron pattern
  ctx.fillStyle = SC.paper; ctx.fillRect(0, 0, SC.W, SC.H);
  const g1 = ctx.createRadialGradient(1120, -40, 0, 1120, -40, 620); g1.addColorStop(0, 'rgba(255,62,165,.20)'); g1.addColorStop(1, 'rgba(255,62,165,0)'); ctx.fillStyle = g1; ctx.fillRect(0, 0, SC.W, SC.H);
  const g2 = ctx.createRadialGradient(40, 720, 0, 40, 720, 560); g2.addColorStop(0, 'rgba(180,123,255,.24)'); g2.addColorStop(1, 'rgba(180,123,255,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, SC.W, SC.H);
  ctx.strokeStyle = 'rgba(36,18,79,.05)'; ctx.lineWidth = 1.4;
  for (let yy = 0; yy < SC.H; yy += 48) for (let xx = 0; xx < SC.W; xx += 56) { ctx.beginPath(); ctx.moveTo(xx + 6, yy + 18); ctx.lineTo(xx + 14, yy + 11); ctx.lineTo(xx + 22, yy + 18); ctx.moveTo(xx + 6, yy + 24); ctx.lineTo(xx + 14, yy + 17); ctx.lineTo(xx + 22, yy + 24); ctx.stroke(); }
  scLogo(ctx, 64, 104, 1);
  // Team Score, top right
  const TS = (ui.vsum || {}).TS;
  if (TS) { ctx.textAlign = 'right'; ctx.font = 'italic 800 104px "Sofia Sans Condensed", sans-serif';
    ctx.fillStyle = SC.pink; ctx.fillText(String(TS.score), 1145, 137); ctx.fillStyle = SC.ink; ctx.fillText(String(TS.score), 1140, 132);
    ctx.font = '700 15px "JetBrains Mono", monospace'; ctx.fillStyle = SC.acc; ctx.fillText(('Team Score' + (TS.label ? ' · ' + TS.label : '')).toUpperCase(), 1140, 160); ctx.textAlign = 'left'; }
  // team name
  const title = (typeof teamTitleFor === 'function' ? teamTitleFor(ms) : '') || 'My team';
  ctx.font = 'italic 800 62px "Sofia Sans Condensed", sans-serif'; const tt = scFit(ctx, title.toUpperCase(), 1070);
  ctx.fillStyle = SC.pink; ctx.fillText(tt, 68, 266); ctx.fillStyle = SC.ink; ctx.fillText(tt, 64, 262);
  ctx.font = '700 15px "JetBrains Mono", monospace'; ctx.fillStyle = SC.mute; ctx.fillText('POKÉMON CHAMPIONS · VGC DOUBLES · REG M-C', 66, 296);
  // the six
  const cw = 170, gap = 14, x0 = (SC.W - (6 * cw + 5 * gap)) / 2, y0 = 330, chh = 262;
  const imgs = await Promise.all(ms.map(m => { const id = typeof SPRITE_ID === 'object' && SPRITE_ID ? SPRITE_ID[m.p.n] : null; return id ? scImg('sp/' + id + '.webp') : Promise.resolve(null); }));
  for (let i = 0; i < 6; i++) { const x = x0 + i * (cw + gap), m = ms[i];
    ctx.save(); ctx.shadowColor = 'rgba(29,11,46,.10)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; scRound(ctx, x, y0, cw, chh, 18);
    ctx.fillStyle = m ? '#fff' : 'rgba(255,255,255,.5)'; ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#ebe3f5'; ctx.lineWidth = 1.5; scRound(ctx, x, y0, cw, chh, 18); ctx.stroke();
    if (!m) continue;
    const tc = t => (typeof TC === 'object' && TC && TC[t]) || SC.vio;
    ctx.fillStyle = tc(m.p.t[0]); ctx.globalAlpha = .14; scRound(ctx, x + 10, y0 + 10, cw - 20, 132, 12); ctx.fill(); ctx.globalAlpha = 1;
    const im = imgs[i]; if (im) { const r = Math.min(140 / im.width, 140 / im.height); ctx.drawImage(im, x + (cw - im.width * r) / 2, y0 + 6 + (140 - im.height * r) / 2, im.width * r, im.height * r); }
    ctx.textAlign = 'center'; ctx.fillStyle = SC.ink; const nm = (m.p.d || m.p.n).toUpperCase(); let fz = 25;
    do { ctx.font = `italic 800 ${fz}px "Sofia Sans Condensed", sans-serif`; } while (ctx.measureText(nm).width > cw - 14 && --fz > 16);
    ctx.fillText(scFit(ctx, nm, cw - 14), x + cw / 2, y0 + 176);
    const ti = typeof topItems === 'function' ? topItems(m.p) : null, item = ti && ti.it && ti.it[0] ? ti.it[0][0] : '';
    ctx.font = '600 15px "Sofia Sans", sans-serif'; ctx.fillStyle = SC.mute; if (item) ctx.fillText(scFit(ctx, item, cw - 16), x + cw / 2, y0 + 200);
    const ts = m.p.t || []; ctx.font = '700 11px "JetBrains Mono", monospace';
    const wts = ts.map(t => ctx.measureText(t.toUpperCase()).width + 16), tw = wts.reduce((a, b) => a + b, 0) + (ts.length - 1) * 6; let tx = x + (cw - tw) / 2;
    ts.forEach((t, j) => { ctx.fillStyle = tc(t); scRound(ctx, tx, y0 + 216, wts[j], 22, 6); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(t.toUpperCase(), tx + wts[j] / 2, y0 + 231); tx += wts[j] + 6; });
    ctx.textAlign = 'left'; }
  // footer
  ctx.font = '700 15px "JetBrains Mono", monospace'; ctx.fillStyle = SC.acc; ctx.fillText('PLOT YOUR WIN.', 66, 640);
  ctx.textAlign = 'right'; ctx.fillStyle = SC.mute; ctx.font = '600 15px "Sofia Sans", sans-serif'; ctx.fillText('Built on NastyPlot · unofficial fan tool', 1136, 640); ctx.textAlign = 'left';
  return c;
}
function closeShare() { const b = $('shareBox'); if (!b || b.hidden) return; b.hidden = true; const im = b.querySelector('img'); if (im && im.src.startsWith('blob:')) URL.revokeObjectURL(im.src); b.innerHTML = ''; }
async function openShareCard() {
  const btn = $('shareBtn'); if (btn) btn.disabled = true;
  try { const c = await buildShareCard(); if (!c) { toast('Add some Pokémon first'); return; }
    let blob = null; try { blob = await new Promise(r => c.toBlob(r, 'image/png')); } catch (e) {}
    const url = blob ? URL.createObjectURL(blob) : null;
    let box = $('shareBox'); if (!box) { box = document.createElement('div'); box.id = 'shareBox'; box.className = 'sharebox'; document.body.appendChild(box); }
    const name = ((typeof teamTitleFor === 'function' ? teamTitleFor(members()) : '') || 'My team').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + ' - NastyPlot.png';
    box.hidden = false;
    box.innerHTML = `<div class="sharein" role="dialog" aria-label="Share card"><div class="sharehd"><b>Share card</b><button type="button" class="btn ghost sm" data-shareclose>Close</button></div>
      ${url ? `<img class="shareimg" src="${url}" alt="Your team as a NastyPlot share card">` : '<p class="t2">Could not draw the card in this view.</p>'}
      <div class="row sharerow">${blob ? '<button type="button" class="btn go" id="shareSave">Save image</button>' : ''}<span class="t2" id="shareMsg">On a phone you can also press and hold the image to save or share it.</span></div></div>`;
    box.onclick = async e => { const t = e.target;
      if (t === box || t.closest('[data-shareclose]')) { closeShare(); return; }
      if (t.id !== 'shareSave' || !blob) return;
      const msg = $('shareMsg'); let dl = null; try { dl = await claude.use('downloads'); } catch (e2) {}
      if (dl) { try { await dl.save({filename: name, data: blob}); if (msg) msg.textContent = 'Saved.'; }
        catch (err) { if (msg) msg.textContent = err && err.code === 'declined' ? 'Not saved.' : 'Saving is not available here. Press and hold the image instead.'; } }
      else { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } };
  } finally { if (btn) btn.disabled = false; }
}
document.addEventListener('click', e => { if (e.target && e.target.id === 'shareBtn') openShareCard(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeShare(); });
