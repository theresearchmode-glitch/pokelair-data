// ---------- Share card "The Slab" (Nov 15; Sim's pick Q4 A: The Slab first, Print and Aurora later as styles; docs/rebuild/mocks/share-cards) ----------
// Drawn on a canvas with today's share helpers (ARB.facts, ARB.score, CH.hand, CH.pctTxt, ARB.logo, ARB.tagline, ARB.imgs, AR.TC), so every
// fact is today's card's: the team name (with "(sample)" when it has it), the style, the Strength Score and its word, the matchups line, the
// rank line, the six with their items, Mega on its own line. New on the card (brief section 7): the two leads (teamLineup) drawn larger.
// Near-black, one slanted band in the two leads' type colours, the leads as big dark Cards on it (tilted), the other four small below.
V2.slabCard = (x, m, im, cx, cy, w, h, tilt, big, ic) => { const t = m.p.t || ['Normal'], a = AR.TC[t[0]] || '#888', b = AR.TC[t[1] || t[0]] || a, item = (() => { const ti = typeof topItems === 'function' ? topItems(m.p) : null; return m.item || (ti && ti.it && ti.it[0] ? ti.it[0][0] : ''); })();
  x.save(); x.translate(cx, cy); x.rotate(tilt * Math.PI / 180);
  const c = 16; const path = () => { x.beginPath(); x.moveTo(-w / 2 + c, -h / 2); x.lineTo(w / 2, -h / 2); x.lineTo(w / 2, h / 2 - c); x.lineTo(w / 2 - c, h / 2); x.lineTo(-w / 2, h / 2); x.lineTo(-w / 2, -h / 2 + c); x.closePath(); };
  // the dark Card: deep panel, a wash of its type colours, a two-colour edge
  x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 30; x.shadowOffsetY = 14; path(); x.fillStyle = '#17151C'; x.fill(); x.shadowColor = 'transparent';
  x.save(); path(); x.clip(); const g = x.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, ARB.mixc('#17151C', a, .42)); g.addColorStop(1, ARB.mixc('#17151C', b, .42)); x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h);
  x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 1; for (let k = -h; k < w + h; k += 9) { x.beginPath(); x.moveTo(-w / 2 + k, -h / 2); x.lineTo(-w / 2 + k - h, h / 2); x.stroke(); }
  const fl = x.createLinearGradient(0, h * .1, 0, h / 2); fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = fl; x.fillRect(-w / 2, -h / 2, w, h); x.restore();
  const eg = x.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); eg.addColorStop(0, a); eg.addColorStop(1, b); path(); x.strokeStyle = eg; x.lineWidth = big ? 4 : 3; x.stroke();
  // the Pokémon breaks out of its Card: drawn larger than the frame, standing on the lower part of the Card
  if (im) { const sz = big ? w * 1.18 : w * .98, k = Math.min(sz / im.width, sz / im.height), dw = im.width * k, dh = im.height * k; x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 16; x.shadowOffsetY = 10;
    x.drawImage(im, -dw / 2, h / 2 - h * (big ? .26 : .3) - dh, dw, dh); x.restore(); }
  // the name inside the Card at the bottom, Mega on its own line
  const nm = V2.disp(m.p.n), mega = /^Mega /.test(nm), base = mega ? nm.slice(5) : nm; x.textAlign = 'center'; x.fillStyle = '#FFFFFF';
  let f = big ? 40 : 22; do { ARB.fnt(x, `italic 900 ${f}px Unbounded, sans-serif`, true); } while (x.measureText(base).width > w - 28 && --f > 13);
  x.fillText(base, 0, h / 2 - (big ? 26 : 16));
  if (mega) { ARB.fnt(x, `italic 900 ${Math.round(f * .78)}px Unbounded, sans-serif`, true); x.fillStyle = '#62BEF7'; x.fillText('Mega', 0, h / 2 - (big ? 26 : 16) - f * 1.05); }
  x.restore();
  // the item just under the Card, in plain text (straight, for reading)
  if (item) { x.textAlign = 'center'; ARB.fnt(x, `600 ${big ? 26 : 18}px "Instrument Sans", sans-serif`); x.fillStyle = ic || '#D9D4DE'; x.fillText(scFit(x, item, w + 20), cx, cy + h / 2 + (big ? 44 : 32)); }
  x.textAlign = 'left'; };
V2.slab = async (ms, shape, light) => { /* light (Nov 15): the same look on a cream field, for the share window's Light choice; the Cards stay dark */
  const K = light ? {bg: '#F3EEE7', line: 'rgba(22,20,26,.05)', line2: 'rgba(255,255,255,.12)', ink: '#16141A', ink2: '#4A4550', ink3: '#1F1C24', blue: '#0068AD', band: .5, chipText: '#FBF8F4'} : {bg: '#0E0D12', line: 'rgba(255,255,255,.035)', line2: 'rgba(255,255,255,.06)', ink: '#FFFFFF', ink2: '#C9C3CC', ink3: '#D9D4DE', blue: '#62BEF7', band: .85, chipText: '#14110F'}; ms = (ms || members()).slice(0, 6); if (!ms.length) return null; await ARB.fonts();
  const tall = shape !== 'wide', W = tall ? 1080 : 1200, H = tall ? 1350 : 675, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.textBaseline = 'alphabetic';
  const f = ARB.facts(ms), sc = ARB.score(f.G), hd = f.RD ? CH.hand(f.RD) : null, rank = f.G ? CH.pctTxt(f.G) : '', word = f.G ? CH.wordOf(f.G.s) : '';
  let L = null; try { L = teamLineup(ms); } catch (e) {} const lead = L && L.lead && L.lead.length >= 2 ? L.lead.slice(0, 2) : ms.slice(0, 2), rest = ms.filter(m => !lead.includes(m)).slice(0, 4);
  const order = [...lead, ...rest], imgs = await ARB.imgs(order);
  // near-black, fine diagonal lines
  x.fillStyle = K.bg; x.fillRect(0, 0, W, H); x.strokeStyle = K.line; x.lineWidth = 1; for (let k = -H; k < W + H; k += 14) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k - H, H); x.stroke(); }
  // one slanted band in the two leads' type colours
  const ta = (lead[0].p.t || ['Normal'])[0], tb = (lead[1] ? lead[1].p.t || ['Normal'] : [ta])[0], ca = AR.TC[ta] || '#888', cb = AR.TC[tb] || ca;
  const by = tall ? [470, 640, 900, 730] : [130, 250, 470, 350], bx0 = tall ? 0 : 560;
  x.save(); x.beginPath(); x.moveTo(bx0, by[1]); x.lineTo(W, by[0]); x.lineTo(W, by[3]); x.lineTo(bx0, by[2]); x.closePath(); const bg = x.createLinearGradient(bx0, 0, W, 0); bg.addColorStop(0, ARB.mixc(K.bg, ca, K.band)); bg.addColorStop(1, ARB.mixc(K.bg, cb, K.band)); x.fillStyle = bg; x.fill();
  x.clip(); x.strokeStyle = K.line2; for (let k = -H; k < W + H; k += 12) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k - H, H); x.stroke(); } x.restore();
  // words
  const proof = [hd ? `Beats or handles ${hd.x} of the top ${hd.n}` : '', rank].filter(Boolean);
  const name = f.name, arch = f.arch && f.arch !== name ? f.arch.toUpperCase() : '';
  const nameLines = (maxW, start, min) => { for (let s = start; s >= min; s -= 2) { ARB.fnt(x, `italic 900 ${s}px Unbounded, sans-serif`, true); const Ln = ARB.wrapN(x, name, maxW, 2); if (Ln) return {s, Ln}; } ARB.fnt(x, `italic 900 ${min}px Unbounded, sans-serif`, true); return {s: min, Ln: [scFit(x, name, maxW)]}; };
  if (tall) {
    await ARB.logo(x, !light, 48, 40, 230);
    ARB.fnt(x, '700 20px "Instrument Sans", sans-serif'); x.fillStyle = K.ink2; x.textAlign = 'right'; x.fillText('POKÉMON CHAMPIONS · VGC DOUBLES · REG M-C', W - 48, 82); x.textAlign = 'left';
    if (arch) { ARB.fnt(x, '800 22px "Instrument Sans", sans-serif'); x.fillStyle = K.blue; x.fillText(scFit(x, arch, 520), 60, 186); }
    const N = nameLines(560, 92, 44); x.fillStyle = K.ink; ARB.fnt(x, `italic 900 ${N.s}px Unbounded, sans-serif`, true); N.Ln.forEach((l, i) => x.fillText(l, 56, 186 + N.s * 1.05 * (i + 1)));
    if (sc && /^\d+$/.test(sc.num)) { ARB.fnt(x, 'italic 900 230px Unbounded, sans-serif', true); x.fillStyle = K.ink; x.textAlign = 'right'; x.fillText(sc.num, W - 40, 340);
      ARB.fnt(x, 'italic 900 34px Unbounded, sans-serif', true); const ww = x.measureText(word).width + 36; x.fillStyle = K.ink; ARB.para(x, W - 56 - ww / 2, 362, ww, 50, 6); x.fill(); x.fillStyle = K.chipText; x.textAlign = 'center'; x.fillText(word, W - 56 - ww / 2, 398);
      ARB.fnt(x, '800 18px "Instrument Sans", sans-serif'); x.fillStyle = K.ink2; x.textAlign = 'right'; x.fillText('STRENGTH SCORE', W - 60, 438); x.textAlign = 'left'; }
    V2.slabCard(x, order[0], imgs[0], 320, 705, 340, 400, -4, true, K.ink3); if (order[1]) V2.slabCard(x, order[1], imgs[1], 760, 690, 340, 400, 4, true, K.ink3);
    order.slice(2).forEach((m, i) => V2.slabCard(x, m, imgs[i + 2], 150 + i * 260, 1112, 190, 186, i % 2 ? 2 : -2, false, K.ink3));
    if (proof.length) { ARB.fnt(x, '600 24px "Instrument Sans", sans-serif'); x.fillStyle = K.ink3; x.textAlign = 'center'; x.fillText(scFit(x, proof.join(' · '), W - 120), W / 2, 1268); x.textAlign = 'left'; }
    ARB.tagline(x, ARB.PAL(!light), 600, 1314, 34); ARB.fnt(x, '600 20px "Instrument Sans", sans-serif'); x.fillStyle = K.ink2; x.textAlign = 'right'; x.fillText('NastyPlot, unofficial fan tool', W - 48, 1312); x.textAlign = 'left';
  } else {
    await ARB.logo(x, !light, 40, 28, 190);
    
    if (arch) { ARB.fnt(x, '800 18px "Instrument Sans", sans-serif'); x.fillStyle = K.blue; x.fillText(scFit(x, arch, 440), 44, 128); }
    const N = nameLines(460, 64, 34); x.fillStyle = K.ink; ARB.fnt(x, `italic 900 ${N.s}px Unbounded, sans-serif`, true); N.Ln.forEach((l, i) => x.fillText(l, 40, 128 + N.s * 1.05 * (i + 1)));
    const y0 = 128 + N.s * 1.05 * N.Ln.length;
    if (sc && /^\d+$/.test(sc.num)) { ARB.fnt(x, 'italic 900 150px Unbounded, sans-serif', true); x.fillStyle = K.ink; x.fillText(sc.num, 36, y0 + 150);
      ARB.fnt(x, 'italic 900 26px Unbounded, sans-serif', true); const ww = x.measureText(word).width + 28; x.fillStyle = K.ink; ARB.para(x, 44 + ww / 2, y0 + 172, ww, 40, 6); x.fill(); x.fillStyle = K.chipText; x.textAlign = 'center'; x.fillText(word, 44 + ww / 2, y0 + 201);
      ARB.fnt(x, '800 15px "Instrument Sans", sans-serif'); x.fillStyle = K.ink2; x.textAlign = 'left'; x.fillText('STRENGTH SCORE', 64 + ww, y0 + 198); }
    ARB.fnt(x, '600 20px "Instrument Sans", sans-serif'); x.fillStyle = K.ink3; proof.forEach((p, i) => x.fillText(scFit(x, p, 460), 44, y0 + 250 + i * 28));
    V2.slabCard(x, order[0], imgs[0], 760, 215, 210, 250, -4, true, K.ink3); if (order[1]) V2.slabCard(x, order[1], imgs[1], 1010, 205, 210, 250, 4, true, K.ink3);
    order.slice(2).forEach((m, i) => V2.slabCard(x, m, imgs[i + 2], 660 + i * 145, 548, 112, 100, i % 2 ? 2 : -2, false, K.ink3));
    ARB.tagline(x, ARB.PAL(!light), 520, 646, 26);
    ARB.fnt(x, '600 15px "Instrument Sans", sans-serif'); x.fillStyle = K.ink2; x.fillText('Pokémon Champions · VGC doubles · Reg M-C · NastyPlot, unofficial fan tool', 44, 604); /* in the words column: the leads stand where the mock had it, the items fill the bottom right */
  }
  return c; };
