// ---------- Share image "Team Sheet" in the Tale of the Tape look (Sim, Nov 15: "this team sheet also in Share Your Team ... designed in
// the best way for share your team") ----------
// The same facts as the Team Sheet page (sheetData, the same function the page and today's sheet image read): the six across the top on
// their type-coloured cards, Item / Ability / Nature / Moves read across, the stats at level 50 with the team best on a blue plate and
// ▲ ▼ for nature. Made for sharing: tall 1080 x 1350 (the size feeds show largest on a phone), bigger type than the page, the team name
// and its Strength Score at the top (as The Slab), the logo and tagline at the bottom; nothing that only works on the page (tap to
// edit, buttons). Light or dark, from the share window's choice.
V2.tapeImage = async (ms, dark) => { ms = (ms || members()).slice(0, 6); if (!ms.length) return null; await ARB.fonts();
  const W = 1080, H = 1350, M = 44, P = ARB.PAL(dark), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic';
  const D = ms.map(m => sheetData(m)), n = ms.length, LW = 96, CW = (W - 2 * M - LW) / n, colX = i => M + LW + CW * i + CW / 2;
  const css = getComputedStyle(document.documentElement), ty = t => (css.getPropertyValue('--ty-' + t) || '').trim() || AR.TC[t] || '#888';
  const best = (D[0] ? D[0].stats : []).map((_, k) => Math.max(...D.map(d => d.stats[k].val == null ? -1 : d.stats[k].val)));
  const onMark = dark ? '#12121B' : '#FFFFFF'; /* text on the blue plates: white in day, dark at night (the site's --on-mark; white on night blue was ~2.4:1) */
  const red = dark ? '#FF8A80' : '#B3261E', up = P.blue, f = ARB.facts(ms), sc = ARB.score(f.G), word = f.G ? CH.wordOf(f.G.s) : '';
  let LU = null; try { LU = ms.length >= 4 ? teamLineup(ms) : null; } catch (e) {}
  const fit = (t, max, font, min) => { let s = font[1]; do { ARB.fnt(x, font[0].replace('#', s), font[2]); } while (x.measureText(t).width > max && --s > (min || 12)); return s; };
  // the field: a plain sheet, fine diagonal lines very faintly (the site's slanted texture)
  x.fillStyle = P.sheet; x.fillRect(0, 0, W, H); x.strokeStyle = dark ? 'rgba(255,255,255,.025)' : 'rgba(22,20,26,.03)'; x.lineWidth = 1; for (let k = -H; k < W + H; k += 14) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k - H, H); x.stroke(); }
  // top: the logo, the format line; the eyebrow, the team name, the score
  await ARB.logo(x, dark, M, 34, 180);
  ARB.fnt(x, '700 17px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.textAlign = 'right'; x.fillText('POKÉMON CHAMPIONS · ' + regName().toUpperCase() + ' DOUBLES · LEVEL 50', W - M, 62); x.textAlign = 'left';
  x.fillStyle = P.blue; ARB.para(x, M + 14, 118, 28, 12, 2); x.fill(); ARB.fnt(x, 'italic 900 22px Unbounded, sans-serif', true); x.fillStyle = P.blue; x.fillText('Team Sheet', M + 40, 131);
  const hasScore = sc && /^\d+$/.test(sc.num), nameMax = hasScore ? 700 : W - 2 * M;
  const ns = fit(f.name, nameMax, ['italic 900 #px Unbounded, sans-serif', 58, true], 30); x.fillStyle = P.ink; x.fillText(scFit(x, f.name, nameMax), M, 196);
  if (hasScore) { ARB.fnt(x, 'italic 900 112px Unbounded, sans-serif', true); x.fillStyle = P.ink; x.textAlign = 'right'; x.fillText(sc.num, W - M - 6, 190);
    ARB.fnt(x, 'italic 900 22px Unbounded, sans-serif', true); const ww = x.measureText(word).width + 30; x.fillStyle = P.blue; ARB.para(x, W - M - ww / 2 - 4, 204, ww, 34, 4); x.fill(); x.fillStyle = onMark; x.textAlign = 'center'; x.fillText(word, W - M - ww / 2 - 4, 229);
    ARB.fnt(x, '800 14px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.textAlign = 'right'; x.fillText('STRENGTH SCORE', W - M - ww - 18, 227); x.textAlign = 'left'; }
  // the key, one line
  ARB.fnt(x, '600 16px "Instrument Sans", sans-serif'); let kx = M; const key = (draw, t) => { draw(kx); kx += 22; x.fillStyle = P.ink2; x.fillText(t, kx, 270); kx += x.measureText(t).width + 26; };
  key(X => { x.fillStyle = P.blue; ARB.para(x, X + 8, 258, 18, 12, 2); x.fill(); }, 'team best in that stat'); key(X => { x.fillStyle = up; x.fillText('▲', X, 270); }, 'raised by nature');
  key(X => { x.fillStyle = red; x.fillText('▼', X, 270); }, 'lowered by nature'); x.fillStyle = P.ink2; x.fillText('points = stat points (0–32)', kx, 270);
  // the six: numbered cards in their type colours, the Pokémon on them, the name under (Mega above it, Lead under it)
  const imgs = await ARB.imgs(ms), cy = 286, ch = 140, cw = Math.min(CW - 14, 150);
  let NS = 20; for (const m of ms) { const d = V2.disp(m.p.n), base = /^Mega /.test(d) ? d.slice(5) : d; while (NS > 13) { ARB.fnt(x, `italic 900 ${NS}px Unbounded, sans-serif`, true); if (x.measureText(base).width <= CW - 16) break; NS--; } } /* one size for all six names, so they read as a set and never touch */
  ms.forEach((m, i) => { const t = m.p.t || ['Normal'], a = ty(t[0]), b = ty(t[1] || t[0]), X = colX(i);
    x.save(); ARB.para(x, X, cy, cw, ch, 6); x.clip(); const g = x.createLinearGradient(X - cw / 2, cy, X + cw / 2, cy + ch); g.addColorStop(0, ARB.mixc(a, '#000000', dark ? .25 : .05)); g.addColorStop(1, ARB.mixc(b, '#000000', dark ? .25 : .05)); x.fillStyle = g; x.fillRect(X - cw, cy, cw * 2, ch);
    x.strokeStyle = 'rgba(255,255,255,.12)'; for (let k = -ch; k < cw + ch; k += 10) { x.beginPath(); x.moveTo(X - cw / 2 + k, cy); x.lineTo(X - cw / 2 + k - ch, cy + ch); x.stroke(); }
    const im = imgs[i]; if (im) { const s = ch * 1.02, k = Math.min(s / im.width, s / im.height), dw = im.width * k, dh = im.height * k; x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowBlur = 10; x.shadowOffsetY = 6; x.drawImage(im, X - dw / 2, cy + ch - dh + 6, dw, dh); x.shadowColor = 'transparent'; }
    x.restore(); ARB.fnt(x, 'italic 900 30px Unbounded, sans-serif', true); x.lineWidth = 1.5; x.strokeStyle = '#FFFFFF'; x.strokeText(String(i + 1).padStart(2, '0'), X - cw / 2 + 16, cy + 32);
    const d = V2.disp(m.p.n), mega = /^Mega /.test(d), base = mega ? d.slice(5) : d; x.textAlign = 'center';
    if (mega) { ARB.fnt(x, 'italic 900 15px Unbounded, sans-serif', true); x.fillStyle = P.blue; x.fillText('Mega', X, cy + ch + 22); }
    ARB.fnt(x, `italic 900 ${NS}px Unbounded, sans-serif`, true); x.fillStyle = P.ink; x.fillText(base, X, cy + ch + 46);
    if (LU && LU.lead.includes(m)) { ARB.fnt(x, 'italic 900 13px Unbounded, sans-serif', true); const lw = x.measureText('Lead').width + 18; x.fillStyle = P.blue; ARB.para(x, X, cy + ch + 54, lw, 22, 3); x.fill(); x.fillStyle = onMark; x.fillText('Lead', X, cy + ch + 70); }
    x.textAlign = 'left'; });
  // the rows read across: a blue label in the left column, a thin rule between rows
  const label = (t, y, size) => { ARB.fnt(x, `italic 900 ${size || 20}px Unbounded, sans-serif`, true); x.fillStyle = P.blue; x.textAlign = 'left'; x.fillText(t, M, y); };
  const rule = (y, strong) => { x.fillStyle = strong ? P.blue : P.rule; x.fillRect(M + (strong ? LW : 0), y, W - 2 * M - (strong ? LW : 0), strong ? 3 : 1); };
  let y = cy + ch + 88; rule(y, true);
  const txtRow = (lab, get, h) => { label(lab, y + h / 2 + 8); ms.forEach((m, i) => { const t = get(m, i); x.textAlign = 'center'; fit(t, CW - 10, ['600 #px "Instrument Sans", sans-serif', 18], 12); x.fillStyle = P.ink; x.fillText(t, colX(i), y + h / 2 + 7); }); x.textAlign = 'left'; y += h; rule(y); };
  txtRow('Item', m => m.heldItem || m.item || 'No item', 44); txtRow('Ability', m => m.ability || '—', 44);
  label('Nature', y + 38); ms.forEach((m, i) => { const d = D[i], X = colX(i); x.textAlign = 'center'; fit(d.nat || '—', CW - 10, ['700 #px "Instrument Sans", sans-serif', 18], 12); x.fillStyle = P.ink; x.fillText(d.nat || '—', X, y + 28);
    if (d.up && d.dn && d.up !== d.dn) { ARB.fnt(x, '700 15px "Instrument Sans", sans-serif'); const a = '+' + d.up, b = '−' + d.dn, wa = x.measureText(a + ' ').width, wb = x.measureText(b).width; x.textAlign = 'left'; x.fillStyle = up; x.fillText(a, X - (wa + wb) / 2, y + 50); x.fillStyle = red; x.fillText(b, X - (wa + wb) / 2 + wa, y + 50); } });
  x.textAlign = 'left'; y += 64; rule(y);
  // the moves: four slanted chips per column in each move's type colour
  label('Moves', y + 80); ms.forEach((m, i) => { for (let j = 0; j < 4; j++) { const mv = m.moves[j], X = colX(i), yy = y + 12 + j * 35; ARB.para(x, X, yy, CW - 14, 30, 3);
    if (mv) { x.fillStyle = ty(V2.TYPES.includes(mv.type) ? mv.type : 'Normal'); x.fill(); x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; fit(mv.name, CW - 30, ['700 #px "Instrument Sans", sans-serif', 16], 11); x.fillText(mv.name, X, yy + 21); }
    else { x.strokeStyle = P.rule; x.lineWidth = 1.5; x.stroke(); } } }); x.textAlign = 'left'; y += 156; rule(y);
  // the stats at level 50: the number big, its points small; the team best on a blue plate; nature ▲ blue, ▼ red
  y += 36; ARB.fnt(x, 'italic 900 26px Unbounded, sans-serif', true); x.fillStyle = P.ink; x.fillText('Stats', M, y); const sw = x.measureText('Stats').width; ARB.fnt(x, '600 16px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('at level 50', M + sw + 12, y);
  y += 12; rule(y, true); y += 3; const RH = Math.min(64, (H - 98 - y) / Math.max(1, (D[0] ? D[0].stats.length : 6)));
  (D[0] ? D[0].stats : []).forEach((s, k) => { if (k % 2) { x.fillStyle = dark ? 'rgba(255,255,255,.04)' : 'rgba(22,20,26,.035)'; x.fillRect(M, y, W - 2 * M, RH); }
    label(s.S, y + RH / 2 + 10, 24);
    ms.forEach((m, i) => { const v = D[i].stats[k], X = colX(i), top = v.val != null && v.val === best[k];
      if (top) { x.fillStyle = P.blue; ARB.para(x, X, y + 5, CW - 18, RH - 10, 4); x.fill(); }
      ARB.fnt(x, 'italic 900 32px Unbounded, sans-serif', true); x.textAlign = 'center'; x.fillStyle = top ? onMark : v.mark === 'up' ? up : v.mark === 'dn' ? red : P.ink; x.fillText(v.val == null ? '—' : String(v.val), X, y + RH / 2 + 6);
      ARB.fnt(x, '700 13px "Instrument Sans", sans-serif'); x.fillStyle = top ? onMark : P.ink2; const pt = (v.mark === 'up' ? '▲ ' : v.mark === 'dn' ? '▼ ' : '') + (v.pts == null ? '' : v.pts + ' points'); x.fillText(pt, X, y + RH / 2 + 24); });
    x.textAlign = 'left'; y += RH; });
  // bottom: the tagline and the fan-tool line
  rule(H - 84); ARB.tagline(x, P, W - M, H - 40, 30); ARB.fnt(x, '600 16px "Instrument Sans", sans-serif'); x.fillStyle = P.ink2; x.fillText('NastyPlot, unofficial fan tool', M, H - 42);
  return c; };
