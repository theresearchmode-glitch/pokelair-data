/* ===== The stage (Nov 3 redesign, approved by Sim) =====
   My team: the team on one colour stage. The app suggests who leads, who comes in behind and who stays home (the same
   "your four against the meta's six" planner as Battle mode, CH.four; with fewer than four or no meta data, setters and
   Fake Out lead). Tap the set panel's Lead / Back / Leave home to change it; the change is kept for that six on this device.
   The two leads stand large in front, the back pair smaller and a touch dimmer behind, the leave-home pair in a quiet row
   under the stage. Nothing overlaps: every sprite's real outline (src/data/sprite-shape.js) is placed on a grid so no wing,
   arm or tail crosses another. Tap any Pokémon: its set slides in under the stage.
   Stage colour = the team's plan (Sim, Nov 3): Tailwind indigo, Trick Room pink, rain blue, sun orange, sand rock, snow
   ice, a terrain its type, otherwise the team's most common type, else indigo. Red is never a stage colour (opponents).
   Info sheet: the same stage in the Pokémon's own type (Fighting uses its second type), name and plain "Rating · S tier",
   the scoreboard strip, the one yellow Add to my team, then the quiet Info | Meta | Rating tabs. */
const STG = {};
/* deep stage colours [light theme, dark theme]; white text on each is 6.8:1 or more (app/test/stage.mjs checks) */
STG.PAL = {Normal: ['#625B3F', '#575138'], Fire: ['#A03D04', '#973A04'], Water: ['#2158B0', '#1E4F9F'], Electric: ['#775403', '#6B4C03'], Grass: ['#28681A', '#245E18'],
  Ice: ['#0E6460', '#0D5B58'], Fighting: ['#8B491D', '#7D411A'], Poison: ['#5B2A86', '#4D2373'], Ground: ['#7D5024', '#714921'], Flying: ['#3533A1', '#2E2C8C'],
  Psychic: ['#A7206C', '#981D63'], Bug: ['#525F11', '#4B570F'], Rock: ['#715526', '#654D22'], Ghost: ['#6B3FBD', '#6139AA'], Dragon: ['#6138D9', '#5629D6'],
  Dark: ['#423A4A', '#3A3341'], Steel: ['#445B7E', '#3E5372'], Fairy: ['#A31F7B', '#941C70']};
STG.col = t => STG.PAL[t] || STG.PAL.Flying;
STG.vars = t => { const c = STG.col(t); return `--stg:${c[0]};--stgd:${c[1]}`; };
STG.pat = t => 'npty-' + String(t || 'flying').toLowerCase();
/* the info sheet's stage type: its first type, but Fighting (red-orange, too close to the opponents' red) uses its second;
   a pure Fighting type gets the deep brown-orange Fighting tone */
STG.sheetType = p => p.t[0] === 'Fighting' ? (p.t[1] || 'Fighting') : p.t[0];
/* the team's plan -> a type colour */
STG.FIELD = {rain: 'Water', sun: 'Fire', sand: 'Rock', snow: 'Ice', elec: 'Electric', psy: 'Psychic', grassy: 'Grass', misty: 'Fairy'};
STG.planType = ms => { if (!ms || !ms.length) return {t: 'Flying', why: 'brand'};
  let a = null; try { a = teamArchetype(ms); } catch (e) {}
  if (a && (a.speed === 'tw' || a.speed === 'tailroom')) return {t: 'Flying', why: 'Tailwind'};
  if (a && (a.speed === 'tr' || a.speed === 'hardtr')) return {t: 'Psychic', why: 'Trick Room'};
  let k = null; try { k = typeof wxKeyOf === 'function' ? wxKeyOf(ms) : null; } catch (e) {}
  if (k && STG.FIELD[k]) return {t: STG.FIELD[k], why: k};
  const n = {}; ms.forEach((m, i) => (m.types || m.p.t || []).forEach((t, j) => { if (t === 'Fighting') return; n[t] = n[t] || {c: 0, o: i * 2 + j}; n[t].c++; }));
  const ts = Object.keys(n).sort((x, y) => n[y].c - n[x].c || n[x].o - n[y].o);
  return ts.length ? {t: ts[0], why: 'type'} : {t: 'Flying', why: 'brand'}; };
/* ---------- lead / back / leave home ---------- */
STG.score = m => { const mv = new Set((m.moves || []).map(x => x && x.name)); let s = 0;
  if (mv.has('Tailwind') || mv.has('Trick Room')) s += 4; if ((typeof WEATHER_OF === 'object' && WEATHER_OF[m.ability]) || (typeof TERRAIN_OF === 'object' && TERRAIN_OF[m.ability])) s += 3;
  if (mv.has('Fake Out')) s += 3; if (mv.has('Follow Me') || mv.has('Rage Powder')) s += 2; if (m.ability === 'Intimidate') s += 1; return s; };
STG.suggest = ms => { let F = null; if (ms.length >= 4) try { F = CH.four(ms); } catch (e) {}
  const has = n => ms.some(m => m.p.n === n);
  if (F && F.lead && F.lead.length && F.lead.every(has) && (F.back || []).every(has)) return {lead: F.lead.slice(0, 2), back: (F.back || []).slice(0, 2), by: 'meta'};
  const ord = ms.slice().sort((a, b) => STG.score(b) - STG.score(a) || a.i - b.i).map(m => m.p.n);
  return {lead: ord.slice(0, 2), back: ord.slice(2, 4), by: 'roles'}; };
STG.key = ms => ms.map(m => m.p.n).sort().join('|');
STG.saved = () => { const o = LS.get('cc2.lineup', {}); return o && typeof o === 'object' ? o : {}; };
STG.lineup = ms => { const sug = STG.suggest(ms), o = STG.saved()[STG.key(ms)], names = new Set(ms.map(m => m.p.n));
  let L = sug, custom = false;
  if (o && Array.isArray(o.lead) && Array.isArray(o.back) && o.lead.length <= 2 && o.back.length <= 2 && [...o.lead, ...o.back].every(n => names.has(n)) && new Set([...o.lead, ...o.back]).size === o.lead.length + o.back.length
    && o.lead.length === Math.min(2, ms.length) && o.back.length === Math.min(2, Math.max(0, ms.length - 2))) { L = o; custom = true; }
  const by = n => ms.find(m => m.p.n === n), lead = L.lead.map(by).filter(Boolean), back = L.back.map(by).filter(Boolean), used = new Set([...lead, ...back]);
  return {lead, back, home: ms.filter(m => !used.has(m)), custom, by: sug.by, sug}; };
/* move one Pokémon to a group; a full group hands its last member back to where this one came from */
STG.move = (ms, name, g) => { const L = STG.lineup(ms), cur = {lead: L.lead.map(m => m.p.n), back: L.back.map(m => m.p.n), home: L.home.map(m => m.p.n)};
  const from = Object.keys(cur).find(k => cur[k].includes(name)); if (!from || from === g) return;
  cur[from] = cur[from].filter(n => n !== name); const cap = {lead: 2, back: 2, home: 6};
  if (cur[g].length >= cap[g]) { const out = cur[g].pop(); cur[from].push(out); } cur[g].push(name);
  const all = STG.saved(), k = STG.key(ms), sug = L.sug, same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
  if (same(cur.lead, sug.lead) && same(cur.back, sug.back)) delete all[k]; else all[k] = {lead: cur.lead, back: cur.back};
  LS.set('cc2.lineup', all); };
STG.reset = ms => { const all = STG.saved(); delete all[STG.key(ms)]; LS.set('cc2.lineup', all); };
STG.role = (L, m) => L.lead.includes(m) ? 'lead' : L.back.includes(m) ? 'back' : 'home';
/* ---------- sprite outlines and the placement ---------- */
STG._sh = new Map();
STG.shape = p => { const id = p && typeof SPRITE_ID === 'object' ? SPRITE_ID[p.n] : null; if (!id) return null; if (STG._sh.has(id)) return STG._sh.get(id);
  const s = typeof SPRITE_SHAPE === 'object' ? SPRITE_SHAPE[id] : null;
  const v = s ? {id, x0: s[0] / 1000, y0: s[1] / 1000, x1: s[2] / 1000, y1: s[3] / 1000, rows: Array.from({length: 16}, (_, i) => parseInt(s[4].slice(i * 4, i * 4 + 4), 16))}
    : {id, x0: .15, y0: .15, x1: .85, y1: .95, rows: Array(16).fill(0xffff)};
  v.ar = (v.x1 - v.x0) / (v.y1 - v.y0); STG._sh.set(id, v); return v; };
STG.C = 6; // grid cell, px
STG.grid = (W, H) => ({W, H, c: Math.ceil(W / STG.C), r: Math.ceil(H / STG.C), a: new Uint8Array(Math.ceil(W / STG.C) * Math.ceil(H / STG.C))});
/* cells a placed outline covers (with a one-cell margin so outlines never touch) */
STG.cells = (G, sh, x, y, w, h, pad) => { const out = new Set(), C = STG.C, d = pad == null ? 1 : pad;
  for (let r = 0; r < 16; r++) { const row = sh.rows[r]; if (!row) continue;
    for (let c = 0; c < 16; c++) { if (!(row & (1 << (15 - c)))) continue;
      const px0 = x + c * w / 16, px1 = x + (c + 1) * w / 16, py0 = y + r * h / 16, py1 = y + (r + 1) * h / 16;
      for (let gy = Math.floor(py0 / C) - d; gy <= Math.ceil(py1 / C) - 1 + d; gy++) for (let gx = Math.floor(px0 / C) - d; gx <= Math.ceil(px1 / C) - 1 + d; gx++)
        if (gx >= 0 && gy >= 0 && gx < G.c && gy < G.r) out.add(gy * G.c + gx); } }
  return out; };
STG.fits = (G, cells) => { for (const i of cells) if (G.a[i]) return false; return true; };
STG.mark = (G, cells) => { for (const i of cells) G.a[i] = 1; };
/* size by what you see: h = the outline's height; wide ones are capped so their width stays within maxW */
STG.box = (sh, h, maxW) => { let w = h * sh.ar; if (w > maxW) { h = maxW / sh.ar; w = maxW; } return {w: Math.round(w), h: Math.round(h)}; };
STG._lay = {key: null, v: null};
STG.layout = (W, H, lead, back, o) => { o = o || {}; const top = o.top || 100, f0 = o.floor || 36, key = [W, H, top, ...lead.map(p => p.n), '/', ...back.map(p => p.n)].join(',');
  if (STG._lay.key === key) return STG._lay.v;
  const lsh = lead.map(STG.shape), bsh = back.map(STG.shape), maxL = Math.min(Math.round(H * .52), H - top - f0 - 4);
  let best = null;
  for (let hL = maxL; hL >= 140 && !best; hL -= 8) {
    const G = STG.grid(W, H), pos = []; let ok = true;
    if (lead.length === 1) { const b = STG.box(lsh[0], hL, W * .7), x = Math.round((W - b.w) / 2); pos.push({p: lead[0], x, y: H - f0 - b.h, ...b, sh: lsh[0], g: 'lead'}); }
    else if (lead.length === 2) { const b1 = STG.box(lsh[0], hL, W * .54), b2 = STG.box(lsh[1], hL, W * .54);
      pos.push({p: lead[0], x: 4, y: H - f0 - b1.h, ...b1, sh: lsh[0], g: 'lead'}, {p: lead[1], x: W - b2.w - 4, y: H - f0 - b2.h, ...b2, sh: lsh[1], g: 'lead'}); }
    for (const q of pos) { const cs = STG.cells(G, q.sh, q.x, q.y, q.w, q.h); if (!STG.fits(G, cs)) { ok = false; break; } STG.mark(G, cs); }
    if (!ok) continue;
    if (!back.length) { best = pos; break; }
    let done = null;
    for (let hB = Math.round(hL * .64); hB >= Math.round(hL * .44) && !done; hB -= 6) {
      const bb = bsh.map(s => STG.box(s, hB, W * .4));
      for (let fb = f0 + 70; fb <= H - top - Math.max(...bb.map(b => b.h)) && !done; fb += 6) {
        if (back.length === 1) { const b = bb[0];
          for (let dx = 0; dx <= W / 2 && !done; dx += 6) for (const sgn of [1, -1]) { const x = Math.round((W - b.w) / 2 + sgn * dx); if (x < 6 || x + b.w > W - 6) continue;
            const cs = STG.cells(G, bsh[0], x, H - fb - b.h, b.w, b.h); if (STG.fits(G, cs)) { done = [{p: back[0], x, y: H - fb - b.h, ...b, sh: bsh[0], g: 'back'}]; break; } }
          continue; }
        /* the back pair stands together, centred behind the leads: the smallest gap that fits, then the nearest to the middle */
        const [b1, b2] = bb;
        for (let gap = 6; gap <= W - b1.w - b2.w - 24 && !done; gap += 12) { const span = b1.w + gap + b2.w, mid = Math.round((W - span) / 2);
          for (let dx = 0; dx <= W && !done; dx += 6) for (const sgn of dx ? [1, -1] : [1]) { const x1 = mid + sgn * dx, x2 = x1 + b1.w + gap; if (x1 < 10 || x2 + b2.w > W - 10) continue;
            const c1 = STG.cells(G, bsh[0], x1, H - fb - b1.h, b1.w, b1.h); if (!STG.fits(G, c1)) continue;
            const G2 = {...G, a: G.a.slice()}; STG.mark(G2, c1); const c2 = STG.cells(G2, bsh[1], x2, H - fb - b2.h, b2.w, b2.h);
            if (STG.fits(G2, c2)) { done = [{p: back[0], x: x1, y: H - fb - b1.h, ...b1, sh: bsh[0], g: 'back'}, {p: back[1], x: x2, y: H - fb - b2.h, ...b2, sh: bsh[1], g: 'back'}]; break; } } } } }
    if (done) best = [...pos, ...done]; }
  if (!best) { /* never seen in testing: small leads in the corners, backs above */
    const pos = [], hL = 140; lead.forEach((p, i) => { const b = STG.box(lsh[i], hL, W * .45); pos.push({p, x: i ? W - b.w - 4 : 4, y: H - f0 - b.h, ...b, sh: lsh[i], g: 'lead'}); });
    back.forEach((p, i) => { const b = STG.box(bsh[i], 80, W * .3); pos.push({p, x: i ? W - b.w - 40 : 40, y: top, ...b, sh: bsh[i], g: 'back'}); }); best = pos; }
  STG._lay = {key, v: best}; return best; };
/* how many grid cells two placed outlines share (0 = they never touch); used by the tests */
STG.overlap = (W, H, a, b) => { const G = STG.grid(W, H), A = STG.cells(G, a.sh, a.x, a.y, a.w, a.h, 0), B = STG.cells(G, b.sh, b.x, b.y, b.w, b.h, 0); let n = 0; for (const i of A) if (B.has(i)) n++; return n; };
/* ---------- My team ---------- */
STG.img = (p, cls, style) => { const s = typeof sprite === 'function' ? sprite(p, cls) : ''; return s ? s.replace('<img ', `<img style="${style || ''}" `) : ''; };
STG.H = () => (typeof matchMedia === 'function' && matchMedia('(min-width:1000px)').matches ? 470 : 438);
STG.place = st => { if (!st || !st.isConnected) return; const W = st.clientWidth; if (!W) return; const H = STG.H(), ms = members(); if (!ms.length) return;
  const L = STG.lineup(ms), head = st.querySelector('.stg-head'), top = head ? Math.max(96, head.offsetHeight + 12) : 100;
  const pos = STG.layout(W, H, L.lead.map(m => m.p), L.back.map(m => m.p), {top});
  for (const q of pos) { const b = st.querySelector(`.pk[data-stgpk="${CSS.escape(q.p.n)}"]`); if (!b) continue; const sh = q.sh, S = q.h / (sh.y1 - sh.y0);
    b.style.cssText = `left:${q.x}px;top:${q.y}px;width:${q.w}px;height:${q.h}px`;
    const im = b.querySelector('img'); if (im) im.style.cssText = `width:${S.toFixed(1)}px;height:${S.toFixed(1)}px;left:${(-sh.x0 * S).toFixed(1)}px;top:${(-sh.y0 * S).toFixed(1)}px`; }
  st.dataset.w = W; };
STG.RO = typeof ResizeObserver === 'function' ? new ResizeObserver(es => es.forEach(e => { const st = e.target; if (+st.dataset.w !== st.clientWidth) STG.place(st); })) : null;
STG.sel = null;
STG.setHtml = (m, L) => { if (!m) return ''; const r = (() => { try { return rating(m.p); } catch (e) { return null; } })(), T = r ? lTier(r.total) : null;
  const g = STG.role(L, m), gl = {lead: 'Lead', back: 'Back', home: 'Leave home'}[g], why = g === 'lead' && typeof CH.leadWhy === 'function' ? CH.leadWhy(m) : '';
  const mv = (m.moves || []).map(x => x && x.name).filter(Boolean).slice(0, 4);
  return `<div class="set-top"><span class="set-art">${sprite(m.p) || ''}</span><div class="set-id"><div class="set-name">${escName(m.d)}</div><div class="set-ty">${(m.types || m.p.t).map(t => `<span><i style="background:${TC[t]}" aria-hidden="true"></i>${esc(t)}</span>`).join('')}</div></div>
    ${r ? `<div class="set-rate"><b class="stgnum">${RS(r.total)}</b><span>${T.k} tier${typeof rankTxt === 'function' && rankTxt(m.p) ? ' · ' + rankTxt(m.p, 1) : ''}</span></div>` : ''}</div>
    <dl class="set-kv"><div><dt>Item</dt><dd>${esc(m.item || 'No item')}</dd></div><div><dt>Ability</dt><dd>${esc(m.ability || '–')}</dd></div><div><dt>Role</dt><dd>${gl}${why ? ' · ' + esc(why) : ''}</dd></div></dl>
    ${mv.length ? `<ul class="set-mv">${mv.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    <div class="set-line"><span id="stgRoleL">Bring it as</span><div class="set-seg" role="group" aria-labelledby="stgRoleL">${[['lead', 'Lead'], ['back', 'Back'], ['home', 'Leave home']].map(([k, l]) => `<button type="button" data-stgrole="${k}" aria-pressed="${k === g}">${l}</button>`).join('')}</div></div>
    ${L.custom ? '<p class="set-why">You changed who leads. The suggestion is one tap away.</p>' : `<p class="set-why">${L.by === 'meta' ? 'Suggested from your four against the most common six.' : 'Suggested: speed control, weather and Fake Out lead.'}</p>`}
    <div class="set-links"><button type="button" data-chedit="${m.i}">Edit set</button><button type="button" data-lt="${esc(m.p.n)}">Info</button>${L.custom ? '<button type="button" data-stgreset="1">Use the suggestion</button>' : ''}</div>`; };
STG.apply = () => { const head = $('chTeam'); if (!head) return; const ms = members(); head.classList.toggle('stgon', !!ms.length);
  const old = head.querySelector(':scope > .stgteam'); if (old) old.remove(); if (!ms.length) return;
  const RD = prepOf(ms), v = ui.vsum || {}, G = Object.assign(CH.gradeOf(RD, v.CK, ms) || {}, {r: RD.score}), hd = CH.hand(RD), c = CH.lvCount(RD), L = STG.lineup(ms), P = STG.planType(ms);
  if (!STG.sel || !ms.some(m => m.p.n === STG.sel)) STG.sel = (L.lead[0] || ms[0]).p.n;
  let title = teamTitleFor(ms); const smp = /\s*\(sample\)\s*$/i.test(title); if (smp) title = title.replace(/\s*\(sample\)\s*$/i, ''); const tl = title.toLowerCase();
  let a = null; try { a = teamArchetype(ms); } catch (e) {}
  const k = typeof wxKeyOf === 'function' ? wxKeyOf(ms) : null, wn = k && typeof WXFX === 'object' && WXFX[k] ? WXFX[k].n : '';
  const sp = a ? {tw: 'Tailwind', tr: 'Trick Room', hardtr: 'Trick Room', tailroom: 'Tailwind and Trick Room'}[a.speed] || '' : '';
  const sub = [ms.length < 6 ? `${ms.length} of 6` : '', ...[wn, sp].filter(x => x && !tl.includes(x.toLowerCase()))];
  if (!sub.filter(Boolean).length && a && a.label && a.label.toLowerCase() !== tl) sub.push(a.label);
  if (smp) sub.push('sample team');
  const gl = G.rec ? `Grade ${G.letter} · real record` : G.partial ? `Grade ${G.letter} so far` : `Grade ${G.letter}`;
  const pk = (m, g) => `<button type="button" class="pk ${g === 'lead' ? 'pkf' : 'pkb'}" data-stgpk="${esc(m.p.n)}" aria-pressed="${m.p.n === STG.sel}" aria-label="${esc(m.d)}, ${g === 'lead' ? 'lead' : 'back'}: show its set" style="visibility:hidden"><span class="pksh" aria-hidden="true"></span>${sprite(m.p) || ''}</button>`;
  const names = L.lead.map(m => `<p><span>Lead</span>${escName(m.d)}</p>`).join('');
  const html = `<div class="stg stg-team" style="${STG.vars(P.t)}" data-plan="${esc(P.why)}"><div class="stg-pat ${STG.pat(P.t === 'Flying' ? 'flying' : P.t)}" aria-hidden="true"></div>${k === 'sun' || k === 'psy' ? STG.fx(k) : k && typeof wxLayer === 'function' ? wxLayer(k) : ''}<div class="stg-shade" aria-hidden="true"></div><div class="stg-floor" aria-hidden="true"></div>
      <div class="stg-head"><div><div class="stg-tn" role="heading" aria-level="1">${esc(title)}</div>${sub.filter(Boolean).length ? `<div class="stg-ts">${esc(sub.filter(Boolean).join(' · '))}</div>` : ''}</div>
        <div class="stg-gr"><b class="stgnum" data-stgnum="${G.s}">${G.s}</b><span>${gl}</span></div></div>
      <div class="stg-figs">${L.lead.map(m => pk(m, 'lead')).join('')}${L.back.map(m => pk(m, 'back')).join('')}</div>
      <div class="stg-names" aria-hidden="true">${names}</div></div>
    ${L.home.length ? `<div class="stg-bench"><div class="stg-bl" id="stgHomeL">Leave home</div><div class="stg-bns" role="group" aria-labelledby="stgHomeL">${L.home.map(m => `<button type="button" class="bn" data-stgpk="${esc(m.p.n)}" aria-pressed="${m.p.n === STG.sel}" aria-label="${esc(m.d)}, leave home: show its set"><span class="bpic">${m.p.m ? `<span class="halo" style="--mc:${TC[m.p.t[0]]}" aria-hidden="true"></span>` : ''}${sprite(m.p) || ''}</span><span>${escName(m.d)}</span></button>`).join('')}</div></div>` : ''}
    <ul class="stg-score" aria-label="Against the top ${hd ? hd.n : 30} threats">
      <li><b class="stgnum">${hd ? hd.x : '–'}<small>/${hd ? hd.n : 30}</small></b><span>handled</span></li>
      <li class="${c[1] ? 's-sh' : ''}"><b class="stgnum">${c[1]}</b><span>shaky</span></li>
      <li class="${c[0] ? 's-un' : ''}"><b class="stgnum">${c[0]}</b><span>no answer</span></li>
      <li><b class="stgnum">${v.CK ? v.CK.pass : '–'}<small>/${v.CK ? v.CK.n : '–'}</small></b><span>checks</span></li></ul>
    ${G.illegal || v.legal === false ? '<p class="stg-legal">Not legal yet: fix the items first.</p>' : ''}
    <div data-stgslot="acts"></div><div data-stgslot="why"></div>
    <div class="stg-set" id="stgSet" aria-live="polite">${STG.setHtml(ms.find(m => m.p.n === STG.sel), L)}</div>
    <div data-stgslot="rec"></div>`;
  /* the entrance plays once per line-up: later redraws (suggestions finishing, edits elsewhere) don't replay it */
  const ak = [...L.lead, '/', ...L.back].map(m => m.p ? m.p.n : m).join('|'), w = document.createElement('div'); w.className = 'stgteam' + (ak === STG.animKey ? ' stgquiet' : ''); STG.animKey = ak; w.innerHTML = html;
  const acts = $('chActs'), why = $('chGwhy'), rec = $('myRec');
  if (acts) { acts.insertAdjacentHTML('afterbegin', `<button type="button" class="stgwhy" data-chgrade="1" aria-expanded="${ui.gwhy ? 'true' : 'false'}" aria-controls="chGwhy">Why ${G.s}?</button>`); w.querySelector('[data-stgslot="acts"]').replaceWith(acts); }
  const sw = w.querySelector('[data-stgslot="why"]'); if (why) sw.replaceWith(why); else sw.remove();
  const sr = w.querySelector('[data-stgslot="rec"]'); if (rec) sr.replaceWith(rec); else sr.remove();
  const th = head.querySelector('.chthead'); if (th) th.after(w); else head.prepend(w);
  const st = w.querySelector('.stg-team'); STG.place(st); w.querySelectorAll('.pk').forEach(b => { b.style.visibility = ''; }); if (STG.RO) STG.RO.observe(st);
  if (typeof wxWatch === 'function') wxWatch(st);
  STG.count(w.querySelector('[data-stgnum]')); };
/* sun and Psychic Terrain on the stage (Nov 3, Sim): the page's sun glow and psychic waves are colour washes, which break the
   stage colour, so the stage gets its own: slow drifting warm motes of light for sun, small soft sparkles for Psychic Terrain.
   Fixed positions (a seeded sequence), transform/opacity only, off under reduced motion. */
STG.fx = k => { const n = k === 'sun' ? 16 : 14, rnd = i => { const x = Math.sin((i + 1) * 12.9898 + (k === 'sun' ? 3 : 7) * 78.233) * 43758.5453; return x - Math.floor(x); };
  let h = ''; for (let i = 0; i < n; i++) h += `<i style="--x:${(4 + rnd(i) * 92).toFixed(1)}%;--y:${(18 + rnd(i + 30) * 74).toFixed(1)}%;--d:${(.75 + rnd(i + 60) * .6).toFixed(2)};--o:${(rnd(i + 90) * 10).toFixed(2)}s;--s:${(.7 + rnd(i + 120) * .7).toFixed(2)}"></i>`;
  return `<div class="stgfx stgfx-${k}" aria-hidden="true">${h}</div>`; };
/* the grade counts up once per new value (off under reduced motion) */
STG.lastN = null;
STG.count = el => { if (!el) return; const to = +el.dataset.stgnum, from = STG.lastN; STG.lastN = to;
  if (from == null || from === to || (typeof CH.reduced === 'function' && CH.reduced()) || !isFinite(to)) return;
  const t0 = performance.now(), d = 600, f = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1 && el.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f); };
CH.wrap('chTeamRender', () => STG.apply());
/* tap a Pokémon: it steps forward and its set slides in */
STG.show = n => { STG.sel = n; const ms = members(), m = ms.find(x => x.p.n === n), box = $('stgSet'); if (!m || !box) return;
  document.querySelectorAll('#chTeam [data-stgpk]').forEach(b => b.setAttribute('aria-pressed', b.dataset.stgpk === n ? 'true' : 'false'));
  const L = STG.lineup(ms), put = () => { box.innerHTML = STG.setHtml(m, L); };
  if (typeof CH.reduced === 'function' && CH.reduced()) { put(); return; }
  box.classList.add('out'); setTimeout(() => { put(); box.classList.remove('out'); box.classList.add('pre'); void box.offsetWidth; box.classList.remove('pre'); }, 140); };
document.addEventListener('click', e => { const t = e.target && e.target.closest; if (!t) return;
  const b = e.target.closest('#chTeam [data-stgpk]'); if (b) { STG.show(b.dataset.stgpk); return; }
  const r = e.target.closest('#stgSet [data-stgrole]'); if (r && STG.sel) { STG.move(members(), STG.sel, r.dataset.stgrole); safe('stage', chTeamRender); const s = document.querySelector(`#chTeam [data-stgpk="${CSS.escape(STG.sel)}"]`); if (s) try { s.focus({preventScroll: true}); } catch (x) {} return; }
  if (e.target.closest('#stgSet [data-stgreset]')) { STG.reset(members()); safe('stage', chTeamRender); return; }
  const g = e.target.closest('#chTeam .stgwhy'); if (g) setTimeout(() => g.setAttribute('aria-expanded', ui.gwhy ? 'true' : 'false'), 0); });
/* arrow keys move between the Pokémon on the stage and in the leave-home row */
document.addEventListener('keydown', e => { const b = e.target && e.target.closest && e.target.closest('#chTeam [data-stgpk]'); if (!b || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const all = [...document.querySelectorAll('#chTeam [data-stgpk]')], i = all.indexOf(b), j = (i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length; e.preventDefault();
  all[j].focus(); STG.show(all[j].dataset.stgpk); });
/* ---------- Info sheet ---------- */
CH.wrap('lairSheet', n => { const sh = $('lairSheet'), p = n && byName.get(n); if (!sh || sh.hidden || !p) return; const panel = sh.querySelector('.lspanel'), head = panel && panel.querySelector('.lshead');
  if (!head || head.classList.contains('stgsheet')) return;
  const t = STG.sheetType(p), r = rating(p), T = lTier(r.total), stats = panel.querySelector('.chlstats');
  const thin = !!(stats && stats.querySelector('.basis.thin')), img = head.querySelector('img.lsspr') || head.querySelector('img'), x = head.querySelector('.lsx');
  panel.setAttribute('style', (panel.getAttribute('style') || '') + ';' + STG.vars(t)); panel.dataset.stg = t;
  head.className = 'lshead stgsheet'; head.removeAttribute('style');
  head.innerHTML = `<div class="stg-pat ${STG.pat(t)}" aria-hidden="true"></div><div class="stg-shade" aria-hidden="true"></div><div class="stg-floor" aria-hidden="true"></div><div class="stg-head"><div><h3 class="stg-tn">${escName(p.d)}</h3><div class="stg-ts">${p.t.map(esc).join(' · ')}${p.m ? ' · Mega' : ''}</div></div>
    <div class="stg-gr"><b class="stgnum">${RS(r.total)}</b><span>Rating · ${T.k} tier${thin ? ' · early read' : ''}</span></div></div><div class="stg-hero"><span class="pksh" aria-hidden="true"></span></div>`;
  if (img) { img.removeAttribute('style'); head.querySelector('.stg-hero').prepend(img); }
  const bar = document.createElement('div'); bar.className = 'stgbar'; bar.innerHTML = '<span class="grab" aria-hidden="true"></span>'; if (x) bar.append(x); head.before(bar);
  if (stats) { const k0 = stats.firstElementChild; if (k0 && k0.classList.contains('chlsr')) k0.remove(); const rk = typeof lairRank === 'function' ? lairRank(p) : null;
    stats.insertAdjacentHTML('beforeend', `<div><b>${rk ? '#' + rk.rank : '–'}</b><span>rated<i>${rk ? 'of ' + rk.of : 'no results yet'}</i></span></div>`); }
  /* the one yellow button: Add to my team (or where it already is) */
  const act = panel.querySelector('.lsact'), add = act && act.querySelector('[data-laddteam]'), note = act && act.querySelector(':scope > span.t2');
  const box = document.createElement('div'); box.className = 'stgadd';
  if (add) { box.innerHTML = `<button type="button" class="stgyel" data-laddteam="${esc(add.dataset.laddteam)}">Add to my team</button>`; add.remove(); }
  else if (note) { box.innerHTML = `<p>${esc(note.textContent)}</p>`; note.remove(); }
  if (box.innerHTML) { if (stats) stats.after(box); else panel.querySelector('.lsbody').prepend(box); }
  /* base stats: the best one in the stage colour */
  const rows = [...panel.querySelectorAll('.lstp-info .lstats .lstr:not(.lstot)')]; if (rows.length) { const vals = rows.map(x => +((x.querySelector('b') || {}).textContent || 0)), mx = Math.max(...vals); rows.forEach((x, i) => x.classList.toggle('best', vals[i] === mx)); } });
if (window.__PL_TEST) window.__STG = STG;
