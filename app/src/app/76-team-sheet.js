/* ---------- Team Sheet page (Sim, Nov 9) ----------
   "A page where we can see our entire team, every move, held item, Ability and stat spread in one quick look."
   One card per Pokémon: item and Ability, the four moves (type colours), the nature (what it raises and lowers) and the six
   stats as Champions stat points (0-32) with the real level-50 number (HP = base + 75 + points; others (base + 20 + points)
   x nature, calcStat in 39-damage-calc-speed.js). Every card says where the spread comes from: the player's own, their nature
   on the most common points (a team sheet gives no points), or the most common spread. Desktop 3 x 2 (the whole team on one
   screen), iPad 2 columns, phone 1. Tap a card to edit that Pokémon on My Team. My Team's own sheet fold is unchanged. */
Object.assign(VIEW_TITLE, {sheet: 'Team sheet'}); Object.assign(VIEW_PARENT, {sheet: 'report'});
const TS = {};
TS.STATS = [['HP', 'hp'], ['Atk', 'atk'], ['Def', 'def'], ['SpA', 'spa'], ['SpD', 'spd'], ['Spe', 'spe']];
TS.natBits = nat => { const up = Object.keys(NAT_UP).find(k => NAT_UP[k].includes(nat)), dn = Object.keys(NAT_DN).find(k => NAT_DN[k].includes(nat)); return {up, dn}; };
// the six stats: real value at level 50 (big), stat points (small), nature's + and −. Shared by this page and the
// "Open team sheet" fold on My Team (Sim, Nov 9: one team sheet everywhere, with the stat spread in it)
TS.stats = m => { const p = m.p, {sp, nat} = memberSpread(m), nb = nat ? TS.natBits(nat) : {};
  return TS.STATS.map(([S_, k]) => { const pts = sp ? +sp[k] || 0 : null, val = sp ? calcStat(p, S_, pts, natMul(nat, S_)) : null,
      mk = nb.up === S_ ? ' up' : nb.dn === S_ ? ' dn' : '';
    return `<div class="ts-st${mk}"><span class="ts-sl">${S_}${mk === ' up' ? '<i aria-label="raised by nature">+</i>' : mk === ' dn' ? '<i aria-label="lowered by nature">−</i>' : ''}</span><b class="ts-sv">${val == null ? '—' : val}</b><span class="ts-sp">${pts == null ? '' : pts}</span></div>`; }).join(''); };
// o (the "Open team sheet" fold on My Team, Nov 9): {fold: true, note: '<hint html>'} = tap opens the editor right there
// (data-chedit), with the remove button and the one-line hint the old sheet rows had
TS.card = (m, o = {}) => {
  const p = m.p, {sp, nat, src} = memberSpread(m), nb = nat ? TS.natBits(nat) : {};
  const stats = TS.stats(m);
  const mv = [0, 1, 2, 3].map(j => { const x = m.moves[j]; return x ? `<li style="--mt:${TC[x.type] || 'var(--ar-ink-3)'}">${esc(x.name)}</li>` : '<li class="none">No move</li>'; }).join('');
  const nl = nat ? `${esc(nat)}${nb.up && nb.dn && nb.up !== nb.dn ? ` <span class="ts-nb">+${nb.up} −${nb.dn}</span>` : ''}` : 'Nature unknown';
  return `<article class="ts-card${o.fold ? ' ts-fold' : ''}" role="button" tabindex="0" ${o.fold ? `data-chedit="${m.i}"` : `data-tsedit="${m.i}"`} style="${tyVars(p)}" aria-label="${esc(m.d)}: edit its set${o.fold ? '' : ' on My Team'}">
    ${o.fold ? `<button type="button" class="chrm ts-rm" data-chrm="${m.i}" aria-label="Remove ${esc(m.d)} from the team">−</button>` : ''}<header class="ts-hd">${sprite(p) || ''}<div class="ts-id"><h3 class="ts-nm">${esc(m.d)}</h3>
      <p class="ts-ia"><span><em>Item</em> ${esc(m.item || 'No item')}</span><span><em>Ability</em> ${esc(m.ability || '—')}</span></p></div></header>
    <ul class="ts-mv">${mv}</ul>${o.note || ''}
    <div class="ts-spr"><p class="ts-nat"><b>${nl}</b><span class="ts-src">${src}</span></p><div class="ts-stats" role="group" aria-label="Stats at level 50, with stat points below">${stats}</div></div>
  </article>`; };
TS.addCard = i => `<button type="button" class="ts-card ts-add" data-chedit="${i}" aria-label="Add a Pokémon to slot ${i + 1}"><span class="ts-plus" aria-hidden="true">+</span><span>Add a Pokémon</span></button>`;
function renderSheet() { const o = $('npSheetOut'); if (!o) return; const ms = members(), r = (typeof regInfo === 'function' && regInfo()) || {id: 'M-C'};
  const head = CH.head(`${ms.length ? esc(teamTitleFor(ms)) + ' · ' : ''}Reg ${esc(String(r.id).replace('-', '‑'))} doubles · level 50`, 'Team Sheet', '');
  if (!ms.length) { o.innerHTML = head + `<p class="ts-empty">No team yet. Add Pokémon on My Team and their full sets show here.</p><div class="ts-acts"><button type="button" class="ar-btn ar-primary" data-view="report"><span>Open My Team</span></button></div>`; return; }
  o.innerHTML = head + `<div class="ts-acts"><button type="button" class="ar-btn ar-primary" data-tsshare="1"><span>Share as image</span></button><button type="button" class="ar-btn" data-tscopy="1">Copy as text</button><span class="ts-key">Big number: the stat at level 50 · small number: stat points (0–32) · <b class="up">+</b>/<b class="dn">−</b> nature</span></div>
    <div class="ts-grid">${ms.map(TS.card).join('')}</div>`; }
CH.wrap('setView', v => { if (v === 'sheet') renderSheet(); });
CH.wrap('render', () => { if (typeof view !== 'undefined' && view === 'sheet') renderSheet(); });
document.addEventListener('click', async e => { const t = e.target && e.target.closest && e.target.closest('[data-tsedit],[data-tscopy],[data-tsopen],[data-tsshare]'); if (!t) return;
  if (t.dataset.tsopen != null) { setView('sheet'); window.scrollTo(0, 0); return; }
  if (t.dataset.tsshare != null) { CH.shareKind = 'sheet'; SHARE_KIND = null; openShareCard(); return; }
  if (t.dataset.tscopy != null) { toast((await copyText(exportPaste())) ? 'Team copied as text' : 'Copy failed: use Export on My Team'); return; }
  const i = +t.dataset.tsedit; setView('report'); requestAnimationFrame(() => { const b = document.querySelector(`[data-pane="report"] [data-chedit="${i}"]`); if (b) b.click(); }); });
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches('[data-tsedit]')) { e.preventDefault(); e.target.click(); } });

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
/* the third Share choice on My Team: Team card · Team poster · Team sheet */
{ const bsc = buildShareCard; buildShareCard = function () { return CH.shareKind === 'sheet' && !SHARE_KIND ? buildSheetImage(members()) : bsc.apply(this, arguments); }; }
