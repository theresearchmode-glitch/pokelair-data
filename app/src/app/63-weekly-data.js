// ---------- This Week helpers and its share image, shared by today's page and the new build (Nov 15; moved unchanged from 63-weekly.js) ----------
const WK = {
  pc: (x, n) => n ? Math.round(100 * x / n) : 0,
  pc1: (x, n) => { if (!n) return '0'; const v = 100 * x / n; return v < 10 ? v.toFixed(1) : String(Math.round(v)); },
  d: s => { try { return new Date(s + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return s; } },
  range: w => { const a = WK.d(w.from), b = WK.d(w.to); return (a.split(' ')[0] === b.split(' ')[0] ? `${a} – ${b.split(' ')[1]}` : `${a} – ${b}`).replace(/ /g, '\u00a0'); },
  kind: {i: 'item', m: 'move', a: 'ability'},
  /* the week's notable results: official events first, then the biggest online ones, from meta/events */
  winners: W => { const E = META.events; if (!E || !W) return []; return E.events.filter(e => e.date >= W.a.from && e.date <= W.a.to && e.top[0] && e.top[0].place === 1 && (e.src === 'official' || e.players >= 64))
    .sort((x, y) => (y.src === 'official') - (x.src === 'official') || y.players - x.players).slice(0, 3); },
  styName: k => (typeof ARCH === 'object' && ARCH[k] ? ARCH[k].name : k)
};
/* ---------- Kind of option (Sim, Nov 4: "make it easy to tell if an item change, move change, nature change is what's rising") ----------
   One marker used site-wide: a line-drawn icon in the site's stroke style + the word + its own colour (colour is never the only
   signal). The kind always comes from the data's own field (weekly tech rows carry i / m / a from the pipeline; Popular sets and
   the Events team search keep each kind in its own list), never guessed from the name. Colours are tokens in manga.css (--kd-*),
   4.5:1+ for the label text in light and dark; the share card uses the same values. */
const KIND = {
  m: {w: 'Move', ic: 'M5 19 17 7M11 7h6v6M3 13l4-4M11 21l4-4'},
  i: {w: 'Item', ic: 'M3 3h8l10 10-8 8L3 11zM8.5 7.5a1 1 0 1 1-2 0 1 1 0 1 1 2 0'},
  a: {w: 'Ability', ic: 'M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z'},
  n: {w: 'Nature', ic: 'M5 19C5 10 11 5 19 5c0 8-5 14-14 14zM5 19l8-8'},
  /* share-card colours (canvas can't read CSS tokens): the same values as --kd-* */
  col: {light: {m: '#0d6a87', i: '#8f5300', a: '#7436b8', n: '#2b7530'}, dark: {m: '#4fc3e8', i: '#f2b544', a: '#c49cff', n: '#7ed482'}}
};
const KIND_OF = {move: 'm', item: 'i', ability: 'a', nature: 'n', m: 'm', i: 'i', a: 'a', n: 'n'};
const kindIcon = k => KIND[k] ? `<svg class="kdic kd-${k}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${KIND[k].ic}"/></svg>` : '';
function kindTag(k, extra) { k = KIND_OF[k] || k; return KIND[k] ? `<span class="kind kd-${k}${extra ? ' ' + extra : ''}">${kindIcon(k)}${KIND[k].w}</span>` : ''; }
/* the gap in points between the two shares as shown (6.6% → 4.0% reads ▼2.6; 70% → 94% reads ▲24), so the badge always adds up */
function wkDelta(xa, na, xb, nb) { const d = Math.abs(parseFloat(WK.pc1(xa, na)) - parseFloat(WK.pc1(xb, nb))); return Number.isInteger(d) ? String(d) : d.toFixed(1); }
/* the share image: 1200 wide and as tall as its content (up to 1350; a tall card reads well in Discord and on phones), Concept H light or Warm charcoal */
async function buildWeeklyCard() { const W = META.weekly; if (!W) return null;
  const dark = (CH.shareMode || document.documentElement.dataset.look) === 'dark';
  /* Polish (Nov 10): the share card's palette and type (ARB: paper, ink, PLOT blue; Unbounded slanted for headings and numbers,
     Instrument Sans for sentences; no misprint), so every image NastyPlot makes looks like one family */
  const A = ARB.PAL(dark), P = {paper: A.paper, ink: A.ink, mute: A.ink2, blue: A.blue, card: A.sheet, pen: A.blue, up: A.green, dn: dark ? '#9AA6FF' : '#4A5BF0', line: A.rule};
  try { await Promise.all(['800 30px Unbounded', 'italic 800 30px Unbounded', '700 16px "Instrument Sans"', '400 40px "Instrument Sans"'].map(f => document.fonts.load(f, 'NASTYPLOT 0123%▲▼'))); } catch (e) {}
  const nA = W.a.n, nB = W.b.n, up = W.enough ? W.up.slice(0, 4) : [], dn = W.enough ? W.down.slice(0, 4) : [], tech = W.enough ? W.tech.slice(0, 3) : [];
  /* the winner band is full height only when there is a winner to show (no empty blue band) */
  const rowsN = Math.max(up.length, dn.length, 1), Y0 = 392 + rowsN * 84 + 52, by = Y0 + 20 + Math.max(tech.length, 1) * 76 + 24, bh = WK.winners(W)[0] ? 230 : 104;
  const Wd = 1200, H = by + bh + 80, c = document.createElement('canvas'); c.width = Wd; c.height = H; const x = c.getContext('2d');
  x.fillStyle = P.paper; x.fillRect(0, 0, Wd, H);
  const src = id => (window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp', img = p => { const id = p && typeof SPRITE_ID === 'object' ? SPRITE_ID[p.n] : null; return id ? scImg(src(id)) : Promise.resolve(null); };
  const draw = (im, cx, cy, s) => { if (!im) return; const k = Math.min(s / im.width, s / im.height); x.drawImage(im, cx - im.width * k / 2, cy - im.height * k / 2, im.width * k, im.height * k); };
  const txt = (s, font, col, X, Y, max, al) => { x.font = font; x.fillStyle = col; x.textAlign = al || 'left'; let t = String(s); while (max && t.length > 3 && x.measureText(t).width > max) t = t.slice(0, -2) + '…'; x.fillText(t, X, Y); x.textAlign = 'left'; };
  const logo = new Image(); logo.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(npLogoSvg(dark));
  await new Promise(r => { logo.onload = r; logo.onerror = r; }); try { x.drawImage(logo, 44, 34, npLogoW(logo, 250), 250 * 196 / 761.34); } catch (e) {}
  txt('Pokémon Champions, VGC doubles, ' + REG_PROFILE.name + '', '700 20px "Instrument Sans", monospace', P.mute, 1156, 66, 0, 'right');
  txt('This week', 'italic 800 96px Unbounded, sans-serif', P.ink, 56, 232);
  txt(`${WK.range(W.a)} vs ${WK.range(W.b)}`, '700 22px "Instrument Sans", monospace', P.mute, 60, 272, 1080);
  txt(`${CH.n(W.a.n)} tournament teams from ${W.a.ev} events, against ${CH.n(W.b.n)} the week before`, '500 22px "Instrument Sans", sans-serif', P.mute, 60, 304, 1080);
  /* rising / falling */
  const [iu, idn] = await Promise.all([Promise.all(up.map(r => img(r.p))), Promise.all(dn.map(r => img(r.p)))]);
  const col = (title, rows, ims, X, isUp) => { txt(title, 'italic 800 34px Unbounded, sans-serif', isUp ? P.up : P.dn, X, 372);
    if (!rows.length) { txt(isUp ? 'Nothing rose enough to call it a trend' : 'Nothing dropped enough to call it a trend', '500 22px "Instrument Sans", sans-serif', P.mute, X, 414, 520); return; }
    rows.forEach((r, i) => { const Y = 392 + i * 84; x.fillStyle = P.card; scRound(x, X, Y, 520, 72, 14); x.fill(); x.strokeStyle = P.line; x.lineWidth = 2; x.stroke();
      /* the change first (its width decides the room left), then the name as big as fits beside it, never cut off */
      const d = wkDelta(r.xa, nA, r.xb, nB), dt = `${isUp ? '▲' : '▼'}${d} points`; x.font = 'italic 800 26px Unbounded, sans-serif'; const dw = x.measureText(dt).width;
      txt(dt, 'italic 800 26px Unbounded, sans-serif', isUp ? P.up : P.dn, X + 500, Y + 48, 0, 'right');
      const room = 500 - 86 - dw - 20; let nf = 24; do { x.font = `italic 800 ${nf}px Unbounded, sans-serif`; } while (x.measureText(r.p.d).width > room && --nf > 15);
      draw(ims[i], X + 42, Y + 34, 66); txt(r.p.d, `italic 800 ${nf}px Unbounded, sans-serif`, P.ink, X + 86, Y + 33, room);
      txt(`${WK.pc1(r.xb, nB)}% → ${WK.pc1(r.xa, nA)}% of teams`, '600 18px "Instrument Sans", sans-serif', P.mute, X + 86, Y + 58, room + dw); }); };
  col('Rising', up, iu, 56, true); col('Falling', dn, idn, 624, false);
  /* new tech */
  txt('New tech', 'italic 800 34px Unbounded, sans-serif', P.ink, 56, Y0); const it = await Promise.all(tech.map(t => img(t.p)));
  if (!tech.length) txt('Nothing jumped enough to call it a trend', '500 22px "Instrument Sans", sans-serif', P.mute, 56, Y0 + 42);
  const KC = KIND.col[dark ? 'dark' : 'light'];
  tech.forEach((t, i) => { const Y = Y0 + 20 + i * 76; draw(it[i], 92, Y + 32, 62);
    /* the kind: line icon + word in its colour, then the option underlined in the same colour (as on the page) */
    const kc = KC[t.k] || P.mute; x.save(); x.translate(134, Y + 3); x.scale(18 / 24, 18 / 24); x.strokeStyle = kc; x.lineWidth = 2.6; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(new Path2D(KIND[t.k].ic)); x.restore();
    txt(KIND[t.k].w, '700 17px "Instrument Sans", sans-serif', kc, 158, Y + 17); x.font = '700 17px "Instrument Sans", sans-serif'; const kw = x.measureText(KIND[t.k].w).width;
    x.font = 'italic 800 24px Unbounded, sans-serif'; const ow = Math.min(x.measureText(t.o).width, 600);
    txt(`${t.o} ${t.p.d}`, 'italic 800 24px Unbounded, sans-serif', P.ink, 168 + kw, Y + 17, 860 - kw); x.fillStyle = kc; x.fillRect(168 + kw, Y + 22, ow, 3);
    txt(`${WK.pc1(t.xb, t.mb)}% → ${WK.pc1(t.xa, t.ma)}% of ${t.p.d} teams (${CH.n(t.ma)} this week, ${CH.n(t.mb)} before)`, '700 18px "Instrument Sans", monospace', P.mute, 134, Y + 52, 1000);
    txt(`▲${wkDelta(t.xa, t.ma, t.xb, t.mb)} points`, 'italic 800 30px Unbounded, sans-serif', P.up, 1144, Y + 46, 0, 'right'); });
  /* the week's biggest winner, on the blue band */
  const w0 = WK.winners(W)[0];
  x.fillStyle = A.plate; x.fillRect(0, by, Wd, bh); /* the deep PLOT blue in both modes: white text stays readable on it */ x.fillStyle = 'rgba(255,255,255,.2)'; for (let yy = by + 4; yy < by + bh; yy += 9) for (let xx = (yy / 9 % 2) * 4.5; xx < Wd; xx += 9) { x.beginPath(); x.arc(xx, yy, 1.3, 0, 7); x.fill(); }
  if (w0) { const t = w0.top[0]; txt(`Winner: ${w0.name}`, '700 20px "Instrument Sans", monospace', '#fff', 56, by + 38, 1090);
    txt(`Champion, ${evDate(w0.date)}, ${CH.n(w0.players)} players`, 'italic 800 26px Unbounded, sans-serif', '#fff', 56, by + 72, 1090);
    const ims = await Promise.all(t.mons.map(m => img(byName.get(m.n)))); ims.forEach((im, i) => { if (!im) return; x.save(); x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowOffsetY = 4; draw(im, 110 + i * 196, by + 154, 132); x.restore(); }); }
  else txt('No big event finished this week', 'italic 800 28px Unbounded, sans-serif', '#fff', 56, by + 64);
  ARB.tagline(x, A, 1144, H - 32, 26);
  txt('NastyPlot, unofficial fan tool', '600 17px "Instrument Sans", sans-serif', P.mute, 58, H - 32);
  return c; }
