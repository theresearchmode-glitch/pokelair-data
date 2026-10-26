// ---------- Matchup: read a team preview screenshot ----------
// Claude looks at the screenshot and names both teams; the names are checked against the roster here, never trusted as-is.
// Team preview shows Pokémon before they Mega Evolve, so an opponent that usually runs its Mega Stone is read as its Mega.
const shot = {sample: null, lim: null, ready: false, busy: false, res: null, url: null};
function shotAvail(ok) { shot.ready = ok; const box = $('shotBox'); if (!box) return; box.hidden = false;
  box.classList.toggle('off', !ok); $('shotPick').disabled = !ok;
  $('shotSub').textContent = ok ? 'or choose a file · you can also paste it here' : 'Screenshot reading works when this page is open in Claude. You can still enter them by hand below.'; }
(async () => { try { const c = window.claude; if (!c || !c.use) return shotAvail(false);
  const s = await c.use('sample'); if (!s) return shotAvail(false);
  const l = await s.limits().catch(() => null); shot.sample = s; shot.lim = l && l.images ? l.images : null; shotAvail(!!shot.lim);
} catch (e) { shotAvail(false); } })();
// Name from Claude -> a roster entry. Exact name first, then display name, then the paste and search matchers.
function shotResolve(raw) {
  if (!raw || typeof raw !== 'string') return null; raw = raw.trim().slice(0, 60); if (!raw) return null;
  if (byName.has(raw)) return byName.get(raw);
  const k = norm(raw); for (const p of ROSTER) if (norm(p.n) === k || norm(p.d) === k) return p;
  const sp = speciesFromPaste(raw); if (sp) return sp;
  const m = raw.match(/^mega\s+(.+?)(?:\s+([xyz]))?$/i); if (m) { const b = shotResolve(m[1]); const q = b && byName.get(b.n + '-Mega' + (m[2] ? '-' + m[2].toUpperCase() : '')); if (q) return q; }
  return searchMon(raw, 1)[0] || null;
}
// How often this species runs its Mega Stone in the current format, and which Mega. Official in-game data first.
function stoneShare(p) {
  if (p.m) return null; const megas = ROSTER.filter(q => q.m && ownKey(q) === p.n); if (!megas.length) return null;
  let best = null; const take = (share, form, src) => { if (form && form.m && share > 0 && (!best || share > best.share)) best = {share, form, src}; };
  const fromItems = (it, src) => { if (!it || !it.length) return; const st = it.filter(([n]) => STONE_RE.test(n) && n !== 'Eviolite'); if (!st.length) return;
    const tot = st.reduce((a, [, v]) => a + (+v || 0), 0); take(tot, megaFormFor(p, {it: [[st[0][0], 100]]}), src); };
  const live = findIn(S.format === 'singles' ? META.singles : META.doubles_ingame, p, true); if (live) fromItems(live.it, 'in-game');
  if (!best) { const g = gameRow(p, S.format); if (g) fromItems(g.it, 'in-game'); }
  if (!best && S.format === 'doubles' && META.doubles_tour) { const top = META.doubles_tour.top; const mr = top.find(t => megas.some(q => q.n === t.n)), br = top.find(t => t.n === p.n);
    if (mr && mr.teams) take(br && br.teams ? Math.min(100, 100 * mr.teams / br.teams) : 90, byName.get(mr.n), 'tournament'); }
  return best;
}
function shotPrompt() {
  const dbl = S.format === 'doubles';
  const mine = members().map(m => m.p.n);
  return `This image should be a screenshot of the team preview screen from Pokémon Champions (the 2026 Pokémon battle game), in ${dbl ? 'Doubles (each player brings 6 and picks 4)' : 'Singles (each player brings 6 and picks 3)'}.
Team preview shows two teams of up to six Pokémon: the player's own team (usually on the left or bottom, often with more detail such as names, held items or moves) and the opponent's team (usually on the right or top, often only the Pokémon's pictures). Identify every Pokémon on both sides.

How to identify each one:
- If its name is printed, use the name.
- Otherwise identify it from its picture: overall shape, colours and signature features. Look closely before you decide.
- Check alternate forms carefully: regional forms (Alolan, Galarian, Hisuian, Paldean), gender forms (Indeedee, Basculegion, Meowstic), Rotom appliance forms, Lycanroc forms, Paldean Tauros breeds, Squawkabilly plumages, Gourgeist sizes, Toxtricity forms, and Floette (only the Eternal Flower Floette is in this game).
- Pokémon appear here before Mega Evolving, so give the regular form. Only give a Mega name if the picture clearly shows a Mega Evolved Pokémon.
- If a held item icon or name is readable, report it in "item" (for example "Salamencite"); otherwise leave it empty.
- Use only names from this list, spelled exactly as written: ${ROSTER.map(p => p.n).join(', ')}.
${mine.length ? `- The player's team in their planner is: ${mine.join(', ')}. It may not match the screenshot; use it only to tell which side is theirs.\n` : ''}
Reply with only JSON in this shape:
{"mine":[{"name":"Exact roster name","alt":"second most likely name, or empty","item":"","sure":true}],"opp":[ same shape ],"note":"short note only if this isn't a team preview or something is unreadable, else empty"}
List each side in on-screen order. Set "sure" to false when you are not confident. Leave a side empty if it isn't visible. Never include a Pokémon that isn't in the image.`;
}
// Downsize anything too big or in a format the viewer can't send.
async function shotBlob(file) {
  const L = shot.lim; const okType = L && L.mediaTypes.includes(file.type);
  if (okType && file.size <= L.maxInputBytes) return file;
  const url = URL.createObjectURL(file);
  try { const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const sc = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight)); const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * sc); cv.height = Math.round(img.naturalHeight * sc); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return await new Promise(res => cv.toBlob(b => res(b), 'image/jpeg', .9));
  } finally { URL.revokeObjectURL(url); }
}
const SHOT_ERR = {not_granted: 'Screenshot reading needs your OK to send the image to Claude. You can allow it from this page\'s permissions.', rate_limited: 'Too many reads in a row. Wait a minute and try again.', images_unavailable: 'Images can\'t be sent from this view.', image_rejected: 'That file type can\'t be read. Try a PNG or JPEG screenshot.'};
async function readShot(file) {
  if (!shot.ready || shot.busy || !file || !/^image\//.test(file.type || '')) { if (file && !/^image\//.test(file.type || '')) toast('That isn\'t an image'); return; }
  shot.busy = true; if (shot.url) URL.revokeObjectURL(shot.url); shot.url = URL.createObjectURL(file); shot.res = {busy: true}; renderShot(); if (view === 'matchup') safe('battle', renderBattle);
  try {
    const blob = await shotBlob(file); if (!blob) throw {code: 'image_rejected'};
    const out = await shot.sample.json(shotPrompt(), {images: [blob], modelTier: 'complex', cache: false});
    shot.res = applyShot(out);
  } catch (e) { shot.res = {err: SHOT_ERR[e && e.code] || 'Couldn\'t read that screenshot. Try a sharp, full-screen capture of team preview, or enter the Pokémon by hand below.'}; }
  finally { shot.busy = false; renderShot(); if (view === 'matchup') safe('battle', renderBattle); }
}
function shotSide(arr) {
  const out = [], seen = new Set();
  for (const x of (Array.isArray(arr) ? arr : []).slice(0, 8)) { if (!x || typeof x !== 'object') continue;
    const p = shotResolve(x.name); if (!p) { out.push({miss: String(x.name || '?').slice(0, 40)}); continue; }
    const key = ownKey(p); if (seen.has(key)) continue; seen.add(key);
    const alt = shotResolve(x.alt); out.push({p, item: typeof x.item === 'string' ? x.item.slice(0, 40).trim() : '', sure: x.sure !== false, alt: alt && alt.n !== p.n ? alt : null}); }
  return out.slice(0, 6);
}
function applyShot(o) {
  if (!o || typeof o !== 'object') return {err: 'Couldn\'t read that screenshot.'};
  const opp = shotSide(o.opp), mine = shotSide(o.mine), note = typeof o.note === 'string' ? o.note.slice(0, 200) : '';
  const found = opp.filter(x => x.p);
  if (!found.length) return {err: note || 'No opposing Pokémon found. Make sure the whole team preview screen is in the shot.'};
  // Megas: a visible stone decides; otherwise assume the Mega when most players run its stone (at most 2 per team)
  const guesses = [];
  found.forEach(x => { x.base = x.p;
    if (x.p.m) return;
    if (x.item) { if (STONE_RE.test(x.item)) { const f = megaFormFor(x.p, {it: [[x.item, 100]]}); if (f.m && ownKey(f) === x.p.n) x.p = f; } return; }
    const s = stoneShare(x.p); if (s && s.share >= 40) guesses.push({x, s}); });
  guesses.sort((a, b) => b.s.share - a.s.share).slice(0, 2).forEach(g => { g.x.p = g.s.form; g.x.mega = g.s; });
  S.opp = found.map(x => x.p.n); while (S.opp.length < 6) S.opp.push(''); persist(); renderMatchup();
  // Their own side: does it match the team in the builder?
  const mineP = mine.filter(x => x.p); let mineState = null;
  if (mineP.length >= 4) { const a = new Set(mineP.map(x => ownKey(x.p))), b = new Set(members().map(m => ownKey(m.p)));
    mineState = a.size === b.size && [...a].every(k => b.has(k)) ? 'same' : 'diff'; }
  return {opp, found, mine: mineP, mineState, note, megas: found.filter(x => x.mega)};
}
function renderShot() {
  const el = $('shotOut'); if (!el) return; const r = shot.res;
  const drop = $('shotDrop'); if (drop) drop.classList.toggle('busy', !!shot.busy);
  const thumb = shot.url ? `<img class="shotthumb" src="${shot.url}" alt="Your screenshot">` : '';
  if (!r) { el.innerHTML = ''; return; }
  if (r.busy) { el.innerHTML = `<div class="shotres">${thumb}<div class="shotmsg"><span class="spin" aria-hidden="true"></span> Reading both teams…</div></div>`; return; }
  if (r.err) { el.innerHTML = `<div class="shotres">${thumb}<div class="shotmsg"><span class="sev hi">Not read</span> ${esc(r.err)}</div></div>`; return; }
  const lines = [];
  lines.push(`<div><b>Their team:</b> ${r.found.map(x => esc(x.p.d)).join(', ')}${r.found.length < 6 ? ` <span class="t2">(${r.found.length} of 6 read; add the rest below)</span>` : ''}</div>`);
  const unsure = r.found.filter(x => !x.sure); const missed = r.opp.filter(x => x.miss);
  if (unsure.length) lines.push(`<div class="warnline">Double-check: ${unsure.map(x => esc(x.base.d) + (x.alt ? ` (could be ${esc(x.alt.d)})` : '')).join(', ')}. Tap × on a slot to change it.</div>`);
  if (missed.length) lines.push(`<div class="warnline">Couldn't match: ${missed.map(x => esc(x.miss)).join(', ')}</div>`);
  if (r.megas.length) lines.push(`<div class="t2">Read as Mega, since most players run the stone: ${r.megas.map(x => `${esc(x.base.d)} → ${esc(x.p.d)} (${Math.round(x.mega.share)}% ${esc(x.mega.src)})`).join(', ')}. <button class="linkbtn" type="button" id="shotNoMega">Use regular forms</button></div>`);
  if (r.mineState === 'same') lines.push(`<div class="t2"><span class="sev ok">Your side</span> matches the team in your builder.</div>`);
  else if (r.mineState === 'diff') lines.push(`<div><span class="sev mid">Your side</span> shows ${r.mine.map(x => esc(x.p.d)).join(', ')}, which isn't the team in your builder. <button class="btn sm" type="button" id="shotUseMine">Use these as my team</button></div>`);
  if (r.note) lines.push(`<div class="t2">${esc(r.note)}</div>`);
  el.innerHTML = `<div class="shotres">${thumb}<div class="shotmsg">${lines.join('')}</div></div>`;
}
function shotWire() {
  const drop = $('shotDrop'), file = $('shotFile'); if (!drop || !file) return;
  $('shotPick').addEventListener('click', () => file.click());
  file.addEventListener('change', () => { const f = file.files && file.files[0]; file.value = ''; if (f) readShot(f); });
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); if (shot.ready) drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => { const f = e.dataTransfer && [...(e.dataTransfer.files || [])].find(x => /^image\//.test(x.type)); if (f) readShot(f); else toast('Drop an image of team preview'); });
  { const sec = $('matchup'); if (sec) { sec.addEventListener('dragover', e => { if (shot.ready) e.preventDefault(); });
    sec.addEventListener('drop', e => { if (e.target.closest && e.target.closest('#shotDrop')) return; e.preventDefault(); const f = e.dataTransfer && [...(e.dataTransfer.files || [])].find(x => /^image\//.test(x.type)); if (f) readShot(f); }); } }
  document.addEventListener('paste', e => { if (view !== 'matchup' || !e.clipboardData) return; const it = [...e.clipboardData.items].find(x => x.kind === 'file' && /^image\//.test(x.type));
    if (it) { e.preventDefault(); readShot(it.getAsFile()); } });
  $('shotOut').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !shot.res || !shot.res.found) return;
    if (b.id === 'shotNoMega') { shot.res.megas.forEach(x => { const i = S.opp.indexOf(x.p.n); if (i >= 0) S.opp[i] = x.base.n; x.p = x.base; }); shot.res.megas = []; persist(); renderMatchup(); renderShot(); toast('Using regular forms'); }
    else if (b.id === 'shotUseMine') { const keep = members();
      S.slots = normSlots(shot.res.mine.map(x => { let p = x.p; const had = keep.find(m => ownKey(m.p) === ownKey(p));
        if (had) p = had.p; else if (x.item && STONE_RE.test(x.item)) { const f = megaFormFor(p, {it: [[x.item, 100]]}); if (f.m && ownKey(f) === p.n) p = f; }
        return {n: p.n, a: had ? S.slots[had.i].a : null, lock: false}; }));
      S.loadedId = null; shot.res.mineState = 'same'; render(); renderShot(); toast('Your team now matches the screenshot'); } });
}
shotWire();

