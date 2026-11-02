/* ---------- This week (Nov): what changed in the last 7 days of tournament teams vs the 7 before ----------
   meta/weekly (out/weekly.json from weekly.mjs). The pipeline decides what counts as a change (enough teams, a big enough
   gap, 3+ standard errors, and it survives dropping the one event that pushes it most); the page only shows it, always
   with the counts it's based on. Winners come from meta/events for the same seven days. */
function cleanWeekly(v) { try {
  if (!v || typeof v !== 'object' || !v.a || !v.b) return null;
  const n = x => { const k = num(x); return k == null ? 0 : k; }, day = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? String(s) : '';
  const wk = w => ({from: day(w.from), to: day(w.to), ev: n(w.ev), n: n(w.n)});
  const a = wk(v.a), b = wk(v.b); if (!a.from || !a.to || !b.from) return null;
  const mon = r => Array.isArray(r) && byName.has(r[0]) ? {p: byName.get(r[0]), xa: n(r[1]), xb: n(r[2])} : null;
  const rows = x => (Array.isArray(x) ? x : []).map(mon).filter(Boolean).slice(0, 8);
  const tech = (Array.isArray(v.tech) ? v.tech : []).map(r => Array.isArray(r) && byName.has(r[0]) && ['i', 'm', 'a'].includes(r[1]) && str(r[2], 40) && n(r[4]) > 0 && n(r[6]) > 0
    ? {p: byName.get(r[0]), k: r[1], o: str(r[2], 40).replace(/[’‘]/g, "'"), xa: n(r[3]), ma: n(r[4]), xb: n(r[5]), mb: n(r[6])} : null).filter(Boolean).slice(0, 10);
  const sty = x => (Array.isArray(x) ? x : []).filter(r => Array.isArray(r) && typeof ARCH === 'object' && ARCH[r[0]]).map(r => ({k: r[0], xa: n(r[1]), xb: n(r[2])}));
  const fresh = (Array.isArray(v.fresh) ? v.fresh : []).map(r => Array.isArray(r) && byName.has(r[1]) && (r[0] === 'p' || (r[0] === 's' && str(r[2], 40)))
    ? {kind: r[0], p: byName.get(r[1]), i: str(r[2], 40), k: n(r[3]), ev: str(r[4], 90), who: str(r[5], 40), pl: n(r[6]), d: day(r[7]), players: n(r[8])} : null).filter(Boolean).slice(0, 10);
  const th = v.th && typeof v.th === 'object' ? v.th : {};
  return {a, b, enough: !!v.enough && a.n > 0 && b.n > 0, updated: str(v.updated, 40), up: rows(v.up), down: rows(v.down), top: rows(v.top), tech,
    sty: {up: sty(v.sty && v.sty.up), down: sty(v.sty && v.sty.down)}, styAll: sty(v.styAll), fresh, cutA: n(v.cutA),
    th: {teams: n(th.teams) || 200, z: n(th.z) || 3, pts: n(th.pts) || 2, monTeams: n(th.monTeams) || 60, techPts: n(th.techPts) || 6, techMin: n(th.techMin) || 12, cut: n(th.cut) || 8, cutPlayers: n(th.cutPlayers) || 32}}; } catch (e) { return null; } }
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
/* the gap in points between the two shares as shown (6.6% → 4.0% reads ▼2.6; 70% → 94% reads ▲24), so the badge always adds up */
function wkDelta(xa, na, xb, nb) { const d = Math.abs(parseFloat(WK.pc1(xa, na)) - parseFloat(WK.pc1(xb, nb))); return Number.isInteger(d) ? String(d) : d.toFixed(1); }
function renderWeekly() {
  const el = $('wkOut'); if (!el) return; const W = META.weekly;
  if (!W) { el.innerHTML = '<div class="empty-note">This week\'s changes appear after the next data refresh.</div>'; return; }
  const A = W.a, B = W.b, nA = A.n, nB = B.n;
  const sub = `${CH.n(nA)} tournament teams from ${A.ev} events (${WK.range(A)}), against ${CH.n(nB)} from ${B.ev} events the week before (${WK.range(B)}).`;
  const monRow = (r, up) => { const d = wkDelta(r.xa, nA, r.xb, nB);
    return `<button type="button" class="wkrow" data-lt="${esc(r.p.n)}" aria-label="${esc(r.p.d)}: ${up ? 'up' : 'down'} ${d} points, ${WK.pc1(r.xb, nB)}% to ${WK.pc1(r.xa, nA)}% of teams">${sprite(r.p, 'wkspr') || ''}<span class="wkn"><b>${esc(r.p.d)}</b><span>${WK.pc1(r.xb, nB)}% → <b>${WK.pc1(r.xa, nA)}%</b> of teams</span></span><span class="wkar ${up ? 'up' : 'dn'}">${up ? '▲' : '▼'}${d}<small> pts</small></span></button>`; };
  const none = t => `<p class="wknone">${t}</p>`;
  const moves = W.enough ? `<div class="wkcols"><div><h4 class="wkh up">Rising</h4>${W.up.slice(0, 4).map(r => monRow(r, true)).join('') || none('No Pokémon rose enough to call it a trend.')}</div>
      <div><h4 class="wkh dn">Falling</h4>${W.down.slice(0, 4).map(r => monRow(r, false)).join('') || none('No Pokémon dropped enough to call it a trend.')}</div></div>`
    : none(`Not enough teams to compare this week (each week needs ${W.th.teams}+).`);
  /* most used this week: context only, no arrows (a small change here is not a trend) */
  const top = W.top.length ? `<div class="wktop" aria-label="Most used this week">${W.top.slice(0, 5).map(r => `<button type="button" class="wktm" data-lt="${esc(r.p.n)}" aria-label="${esc(r.p.d)}: ${WK.pc1(r.xa, nA)}% of teams this week">${sprite(r.p, 'wkspr') || ''}<b>${WK.pc1(r.xa, nA)}%</b><span>${esc(r.p.d)}</span></button>`).join('')}</div>
    <p class="t2 wkcap">Most used this week, % of ${CH.n(nA)} teams.</p>` : '';
  const techRow = t => `<button type="button" class="wkrow wktech" data-lt="${esc(t.p.n)}" aria-label="${esc(t.o)} on ${esc(t.p.d)}: up ${wkDelta(t.xa, t.ma, t.xb, t.mb)} points, ${WK.pc1(t.xb, t.mb)}% to ${WK.pc1(t.xa, t.ma)}% of ${esc(t.p.d)} teams">${sprite(t.p, 'wkspr') || ''}<span class="wkn"><b>${esc(t.o)} <i>${esc(t.p.d)}</i></b><span>${WK.pc1(t.xa, t.ma)}% of ${CH.n(t.ma)} ${esc(t.p.d)} teams, up from ${WK.pc1(t.xb, t.mb)}% of ${CH.n(t.mb)}</span></span><span class="wkar up">▲${wkDelta(t.xa, t.ma, t.xb, t.mb)}<small> pts</small></span></button>`;
  const tech = W.enough ? (W.tech.slice(0, 4).map(techRow).join('') || none('No item, move or ability jumped enough on any Pokémon this week.')) : none('Needs more teams this week.');
  const upS = new Set(W.sty.up.map(s => s.k)), dnS = new Set(W.sty.down.map(s => s.k));
  const styles = W.styAll.length ? `<div class="wkstyles">${W.styAll.map(s => { const c = upS.has(s.k) ? 'up' : dnS.has(s.k) ? 'dn' : '';
      return `<span class="wkst ${c}"><b>${esc(WK.styName(s.k))}</b> ${WK.pc1(s.xa, nA)}%${c ? ` <i>${c === 'up' ? '▲ up' : '▼ down'} ${wkDelta(s.xa, nA, s.xb, nB)} pts from ${WK.pc1(s.xb, nB)}%</i>` : ''}</span>`; }).join('')}</div>
    <p class="t2 wkcap">% of teams with a Trick Room or Tailwind user, or a weather or terrain setter. Arrows only on real changes.</p>` : '';
  const ws = WK.winners(W);
  const winners = ws.length ? ws.map(e => { const w = e.top[0];
    return `<button type="button" class="wkev" data-wkev="${esc(e.id)}"><span class="wkevt"><b>${esc(e.name)}</b>${e.src === 'official' ? '<span class="tag evoff">OFFICIAL</span>' : ''}</span>
      <span class="t2">${evDate(e.date)} · ${CH.n(e.players)} players · won by <b>${esc(w.player)}</b></span><span class="wksix">${w.mons.map(m => sprite(byName.get(m.n), 'wkspr')).join('')}</span></button>`; }).join('')
    : none(META.events ? 'No official event or 64+ player event finished this week.' : 'Event results appear after the next data refresh.');
  const fresh = W.fresh.length ? `<div class="wkfresh">${W.fresh.slice(0, 4).map(f => `<button type="button" class="wkfr" data-lt="${esc(f.p.n)}">${sprite(f.p, 'wkspr') || ''}<span><b>${f.kind === 's' ? esc(f.i) + ' ' : ''}${esc(f.p.d)}</b><span>#${f.pl} · ${esc(f.ev)}${f.players ? ` · ${CH.n(f.players)} players` : ''}</span></span></button>`).join('')}</div>`
    : none('Nothing new reached a top 8 this week.');
  const T = W.th;
  el.innerHTML = `<div class="wkhead"><p class="chpgs">${sub}</p><button type="button" class="chprimary wkshare" id="wkShare">Share this week <span aria-hidden="true">➜</span></button></div>
    <section class="wkcard"><h3 class="wkt">Pokémon on the move</h3>${moves}${top}</section>
    <section class="wkcard"><h3 class="wkt">New tech</h3><p class="t2 wkcap">An item, move or ability that jumped on one Pokémon (60+ of its teams each week).</p>${tech}</section>
    <section class="wkcard"><h3 class="wkt">Winners this week</h3>${winners}</section>
    <section class="wkcard"><h3 class="wkt">Team styles</h3>${styles || none('No style data this week.')}</section>
    <section class="wkcard"><h3 class="wkt">New in top cut</h3><p class="t2 wkcap">First time in a top ${T.cut} this regulation (online events with ${T.cutPlayers}+ players and official events).</p>${fresh}</section>
    <details class="wkfoot"><summary>How we decide what changed</summary><p>We compare the share of full teams at standard Reg M-C tournaments on Limitless (whole fields; themed and restricted cups left out) in the last 7 days against the 7 days before. A change is shown only when: each week has ${T.teams}+ teams; it moved at least ${T.pts} points (${T.techPts} for an item, move or ability, counted among that Pokémon's own teams, with ${T.monTeams}+ of them each week and ${T.techMin}+ using it); a two-proportion test puts it ${T.z}+ standard errors from no change; and it still holds with the single event that pushes it most left out, so one big event can't make a trend. Everything else is treated as noise.${W.updated ? ` Updated ${WK.d(W.updated.slice(0, 10))}.` : ''}</p></details>`;
}
CH.wrap('renderWeekly', () => CH.pagehead($('weekly'), 'Meta · last 7 days', 'This week', ''));
CH.wrap('setView', v => { if (v === 'weekly') safe('weekly', renderWeekly); });
CH.wrap('render', () => { if (typeof view !== 'undefined' && view === 'weekly') safe('weekly', renderWeekly); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wkev],#wkShare,[data-view="weekly"]'); if (!b) return;
  if (b.id === 'wkShare') { SHARE_KIND = {build: buildWeeklyCard, file: 'This week in Reg M-C - NastyPlot.png', alt: 'This week in Reg M-C as a NastyPlot share card', empty: 'Nothing to share yet'}; openShareCard(); return; }
  if (b.dataset.wkev) { evUi.open = b.dataset.wkev; setView('events'); return; } });

/* the share image: 1200 wide and as tall as its content (up to 1350; a tall card reads well in Discord and on phones), Concept H light or Warm charcoal */
async function buildWeeklyCard() { const W = META.weekly; if (!W) return null;
  const dark = (CH.shareMode || document.documentElement.dataset.look) === 'dark';
  const P = dark ? {paper: '#232120', ink: '#F3EBDC', mute: '#E6DDCD', blue: '#1E8FE8', card: '#2C2A28', pen: '#7CC4FF', up: '#3DBE78', dn: '#8C9BFF', line: '#4A4542'}
    : {paper: '#F1E9DA', ink: '#1D2140', mute: '#4E5068', blue: '#0078BF', card: '#FBF6EC', pen: '#005A90', up: '#1E8E4E', dn: '#4A5BF0', line: '#D8CCB6'};
  try { await Promise.all(['400 80px Anton', '800 30px Archivo', '700 16px "Space Mono"', '400 40px "Permanent Marker"'].map(f => document.fonts.load(f, 'NASTYPLOT 0123%▲▼'))); } catch (e) {}
  const nA = W.a.n, nB = W.b.n, up = W.enough ? W.up.slice(0, 4) : [], dn = W.enough ? W.down.slice(0, 4) : [], tech = W.enough ? W.tech.slice(0, 3) : [];
  const rowsN = Math.max(up.length, dn.length, 1), Y0 = 392 + rowsN * 84 + 52, by = Y0 + 20 + Math.max(tech.length, 1) * 76 + 24, bh = 230;
  const Wd = 1200, H = by + bh + 80, c = document.createElement('canvas'); c.width = Wd; c.height = H; const x = c.getContext('2d');
  x.fillStyle = P.paper; x.fillRect(0, 0, Wd, H);
  const src = id => (window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp', img = p => { const id = p && typeof SPRITE_ID === 'object' ? SPRITE_ID[p.n] : null; return id ? scImg(src(id)) : Promise.resolve(null); };
  const draw = (im, cx, cy, s) => { if (!im) return; const k = Math.min(s / im.width, s / im.height); x.drawImage(im, cx - im.width * k / 2, cy - im.height * k / 2, im.width * k, im.height * k); };
  const txt = (s, font, col, X, Y, max, al) => { x.font = font; x.fillStyle = col; x.textAlign = al || 'left'; let t = String(s); while (max && t.length > 3 && x.measureText(t).width > max) t = t.slice(0, -2) + '…'; x.fillText(t, X, Y); x.textAlign = 'left'; };
  const logo = new Image(); logo.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(NP_SVG[dark ? 'hdrD' : 'hdrL']);
  await new Promise(r => { logo.onload = r; logo.onerror = r; }); try { x.drawImage(logo, 44, 34, 250, 250 * 196 / 761.34); } catch (e) {}
  txt('POKÉMON CHAMPIONS · VGC DOUBLES · REG M-C', '700 20px "Space Mono", monospace', P.mute, 1156, 66, 0, 'right');
  txt('THIS WEEK', '400 112px Anton, Impact, sans-serif', P.blue, 62, 238); txt('THIS WEEK', '400 112px Anton, Impact, sans-serif', P.ink, 56, 232);
  txt(`${WK.range(W.a).toUpperCase()} VS ${WK.range(W.b).toUpperCase()}`, '700 22px "Space Mono", monospace', P.mute, 60, 272, 1080);
  txt(`${CH.n(W.a.n)} tournament teams from ${W.a.ev} events, against ${CH.n(W.b.n)} the week before`, '600 22px Archivo, sans-serif', P.mute, 60, 304, 1080);
  /* rising / falling */
  const [iu, idn] = await Promise.all([Promise.all(up.map(r => img(r.p))), Promise.all(dn.map(r => img(r.p)))]);
  const col = (title, rows, ims, X, isUp) => { txt(title, '400 40px Anton, Impact, sans-serif', isUp ? P.up : P.dn, X, 372);
    if (!rows.length) { txt(isUp ? 'Nothing rose enough to call it a trend' : 'Nothing dropped enough to call it a trend', '600 22px Archivo, sans-serif', P.mute, X, 414, 520); return; }
    rows.forEach((r, i) => { const Y = 392 + i * 84; x.fillStyle = P.card; scRound(x, X, Y, 520, 72, 14); x.fill(); x.strokeStyle = P.line; x.lineWidth = 2; x.stroke();
      draw(ims[i], X + 42, Y + 34, 66); txt(r.p.d, '800 26px Archivo, sans-serif', P.ink, X + 86, Y + 33, 270);
      txt(`${WK.pc1(r.xb, nB)}% → ${WK.pc1(r.xa, nA)}% of teams`, '700 18px "Space Mono", monospace', P.mute, X + 86, Y + 58, 300);
      const d = wkDelta(r.xa, nA, r.xb, nB); txt(`${isUp ? '▲' : '▼'}${d} pts`, '400 38px Anton, Impact, sans-serif', isUp ? P.up : P.dn, X + 500, Y + 50, 0, 'right'); }); };
  col('RISING', up, iu, 56, true); col('FALLING', dn, idn, 624, false);
  /* new tech */
  txt('NEW TECH', '400 40px Anton, Impact, sans-serif', P.ink, 56, Y0); const it = await Promise.all(tech.map(t => img(t.p)));
  if (!tech.length) txt('Nothing jumped enough to call it a trend', '600 22px Archivo, sans-serif', P.mute, 56, Y0 + 42);
  tech.forEach((t, i) => { const Y = Y0 + 20 + i * 76; draw(it[i], 92, Y + 32, 62); txt(`${t.o} ${t.p.d}`, '800 26px Archivo, sans-serif', P.ink, 134, Y + 30, 860);
    txt(`${WK.pc1(t.xb, t.mb)}% → ${WK.pc1(t.xa, t.ma)}% of ${t.p.d} teams (${CH.n(t.ma)} this week, ${CH.n(t.mb)} before)`, '700 18px "Space Mono", monospace', P.mute, 134, Y + 56, 1000);
    txt(`▲${wkDelta(t.xa, t.ma, t.xb, t.mb)} pts`, '400 38px Anton, Impact, sans-serif', P.up, 1144, Y + 46, 0, 'right'); });
  /* the week's biggest winner, on the blue band */
  const w0 = WK.winners(W)[0];
  x.fillStyle = P.blue; x.fillRect(0, by, Wd, bh); x.fillStyle = 'rgba(255,255,255,.2)'; for (let yy = by + 4; yy < by + bh; yy += 9) for (let xx = (yy / 9 % 2) * 4.5; xx < Wd; xx += 9) { x.beginPath(); x.arc(xx, yy, 1.3, 0, 7); x.fill(); }
  if (w0) { const t = w0.top[0]; txt(`WINNER · ${w0.name}`.toUpperCase(), '700 20px "Space Mono", monospace', '#fff', 56, by + 38, 1090);
    txt(`${t.player} · ${evDate(w0.date)} · ${CH.n(w0.players)} players`, '800 26px Archivo, sans-serif', '#fff', 56, by + 72, 1090);
    const ims = await Promise.all(t.mons.map(m => img(byName.get(m.n)))); ims.forEach((im, i) => { if (!im) return; x.save(); x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowOffsetY = 4; draw(im, 110 + i * 196, by + 154, 132); x.restore(); }); }
  else txt('No big event finished this week', '800 28px Archivo, sans-serif', '#fff', 56, by + 120);
  txt('Plot your win.', '400 32px "Permanent Marker", cursive', P.pen, 58, H - 28);
  txt('NASTYPLOT · UNOFFICIAL FAN TOOL', '700 19px "Space Mono", monospace', P.mute, 1144, H - 32, 0, 'right');
  return c; }

/* ---------- Upcoming events (Nov): the official VGC calendar with a countdown, at the top of Events ----------
   meta/calendar (out/calendar.json from calendar.mjs, read from Victory Road's season calendar). Dates are the event's own
   local dates (VGC days), so the countdown counts calendar days from the viewer's today. */
function cleanCalendar(v) { try {
  if (!v || typeof v !== 'object' || !Array.isArray(v.ev)) return null; const day = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? String(s) : '';
  const T = ['worlds', 'international', 'regional', 'sc', 'pbl', 'national', 'online'];
  const ev = v.ev.slice(0, 120).map(e => e && typeof e === 'object' && str(e.n, 80) && day(e.s) && day(e.e) && e.e >= e.s ? {n: str(e.n, 80), city: str(e.city, 50), cc: /^[A-Z]{2}$/.test(e.cc) ? e.cc : '', s: e.s, e: e.e, t: T.includes(e.t) ? e.t : 'regional', url: /^https:\/\//.test(e.url) ? str(e.url, 200) : ''} : null).filter(Boolean);
  return ev.length ? {ev, checked: day(v.checked) || str(v.updated, 10), src: {name: str(v.src && v.src.name, 80) || 'Victory Road', url: /^https:\/\//.test(v.src && v.src.url) ? str(v.src.url, 200) : ''}} : null; } catch (e) { return null; } }
const CAL = {
  today: () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; },
  days: (a, b) => Math.round((Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10)) - Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10))) / 864e5),
  type: {worlds: 'Worlds', international: 'International', regional: 'Regional', sc: 'Special', pbl: 'Premier Ball League', national: 'National', online: 'Online'},
  country: cc => { try { return cc ? new Intl.DisplayNames(['en'], {type: 'region'}).of(cc) : ''; } catch (e) { return cc; } },
  when: e => { const t = CAL.today(); if (e.s <= t && e.e >= t) return ['live', 'Live now']; const d = CAL.days(e.s, t);
    return d === 1 ? ['soon', 'Tomorrow'] : d <= 7 ? ['soon', `in ${d} days`] : ['', `in ${d} days`]; },
  range: e => { const o = {month: 'short', day: 'numeric'}, a = new Date(e.s + 'T12:00:00'), b = new Date(e.e + 'T12:00:00');
    if (e.s === e.e) return a.toLocaleDateString('en-US', o); return a.getMonth() === b.getMonth() ? `${a.toLocaleDateString('en-US', o)}–${b.getDate()}` : `${a.toLocaleDateString('en-US', o)} – ${b.toLocaleDateString('en-US', o)}`; },
  /* a finished official event with results in meta/events: same city, within 3 days */
  results: e => { const E = META.events; if (!E) return null; const nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(), c = nz(e.city.split(',')[0]);
    return c ? E.events.find(x => x.src === 'official' && nz(x.name).includes(c) && Math.abs(CAL.days(x.date, e.s)) <= 3) || null : null; }
};
let calUi = {all: false};
function calendarHTML() { const C = META.calendar;
  if (!C) return '<div class="calbox"><h3 class="wkt">Next events</h3><p class="wknone">The event calendar appears after the next data refresh.</p></div>';
  const t = CAL.today(), next = C.ev.filter(e => e.e >= t && e.t !== 'national'), past = C.ev.filter(e => e.e < t && ['regional', 'sc', 'international', 'worlds'].includes(e.t)).slice(-3).reverse();
  const shown = calUi.all ? next : next.slice(0, 4), age = C.checked ? CAL.days(t, C.checked) : 0;
  const row = e => { const [k, w] = CAL.when(e), d = new Date(e.s + 'T12:00:00'), place = e.t === 'online' ? '' : [e.city !== e.n ? e.city : '', CAL.country(e.cc)].filter(Boolean).join(', ');
    const inner = `<div class="calday" aria-hidden="true"><b>${d.getDate()}</b><span>${d.toLocaleDateString('en-US', {month: 'short'})}</span></div>
      <div class="calmain"><b>${esc(e.n)}</b><span>${esc(CAL.range(e))}${place ? ' · ' + esc(place) : ''} · <i class="caltype">${CAL.type[e.t]}</i></span></div><span class="calcd ${k}">${w}</span>`;
    return e.url ? `<a class="calrow ${e.t}" href="${esc(e.url)}" target="_blank" rel="noopener" aria-label="${esc(e.n)}, ${esc(CAL.range(e))}, ${w}: details (opens a new tab)">${inner}</a>` : `<div class="calrow ${e.t}">${inner}</div>`; };
  const pastH = past.length ? `<div class="calpast"><span class="t2">Recent:</span>${past.map(e => { const r = CAL.results(e); return r ? `<button type="button" class="linkbtn" data-evopen="${esc(r.id)}">${esc(e.n)} results ›</button>` : `<span class="t2">${esc(e.n)} · results not in yet</span>`; }).join('')}</div>` : '';
  return `<div class="calbox"><div class="calhd"><h3 class="wkt">Next events</h3><span class="t2">${next.length} on the calendar</span></div>
    ${shown.map(row).join('') || '<p class="wknone">No upcoming events listed right now.</p>'}
    ${next.length > 4 ? `<button type="button" class="linkbtn calmore" data-calall="1" aria-expanded="${calUi.all}">${calUi.all ? 'Show fewer' : `Show all ${next.length}`}</button>` : ''}
    ${pastH}<p class="t2 calsrc">VGC days, in each event's local dates. From <a href="${esc(C.src.url || 'https://victoryroad.pro/')}" target="_blank" rel="noopener">${esc(C.src.name)}</a>${C.checked ? `, checked ${WK.d(C.checked)}${age > 2 ? ` (${age} days ago)` : ''}` : ''}.</p></div>`; }
CH.wrap('renderEvents', () => { const out = $('evOut'); if (!out) return; let box = $('evCal');
  if (!box) { box = document.createElement('div'); box.id = 'evCal'; out.before(box); }
  box.hidden = !!evUi.open; if (!evUi.open) box.innerHTML = calendarHTML(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-calall]'); if (!b) return; calUi.all = !calUi.all; keepScroll(() => renderEvents()); });
/* the countdown moves at midnight: redraw once when the day changes */
{ let last = CAL.today(); setInterval(() => { const t = CAL.today(); if (t === last) return; last = t; if (typeof view !== 'undefined' && (view === 'events' || view === 'home')) scheduleRender(); }, 5 * 60e3); }
/* Home bits, built but OFF until Sim decides (they push the phone Home longer): a "This week" teaser and a "Next event" chip */
const WK_HOME = {teaser: false, chip: false};
function homeWeekTeaser() { const W = META.weekly; if (!W || !W.enough) return ''; const nA = W.a.n, nB = W.b.n;
  const bits = [...W.up.slice(0, 2).map(r => [r, 'up']), ...W.down.slice(0, 2).map(r => [r, 'dn'])];
  const t0 = W.tech[0];
  return `<button type="button" class="wkteaser" data-view="weekly"><span class="chk">This week · ${esc(WK.range(W.a))}</span>
    <span class="wkteb">${bits.map(([r, k]) => `<span class="wkst ${k}">${sprite(r.p, 'wkspr') || ''}<b>${esc(r.p.d)}</b> <i>${k === 'up' ? '▲' : '▼'}${wkDelta(r.xa, nA, r.xb, nB)} pts</i></span>`).join('')}${t0 ? `<span class="wkst up">${sprite(t0.p, 'wkspr') || ''}<b>${esc(t0.o)} ${esc(t0.p.d)}</b> <i>▲${wkDelta(t0.xa, t0.ma, t0.xb, t0.mb)} pts</i></span>` : ''}</span>
    <span class="linkbtn">What changed ›</span></button>`; }
function homeNextChip() { const C = META.calendar; if (!C) return ''; const t = CAL.today(), e = C.ev.find(x => x.e >= t && x.t !== 'national' && x.t !== 'online'); if (!e) return ''; const [k, w] = CAL.when(e);
  return `<button type="button" class="calchip" data-view="events"><span class="chk">Next event</span><b>${esc(e.n)}</b><span class="calcd ${k}">${w}</span></button>`; }
CH.wrap('renderHome', () => { if (!WK_HOME.teaser && !WK_HOME.chip) return; const o = $('homeOut'); if (!o || o.querySelector('.wkhome')) return;
  const h = (WK_HOME.chip ? homeNextChip() : '') + (WK_HOME.teaser ? homeWeekTeaser() : ''); if (!h) return;
  const at = o.querySelector('.chmcard.them') || o.querySelector('.chmhero'); const d = document.createElement('div'); d.className = 'wkhome'; d.innerHTML = h; if (at) at.after(d); else o.prepend(d); });
