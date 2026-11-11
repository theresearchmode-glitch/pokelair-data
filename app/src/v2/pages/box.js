// ---------- My Box (R4, Nov 11) ----------
// Sim's chosen concept (docs/redesign/box/NOTES.md, Nov 10): an in-game Pokémon box in the light design. Boxes of 30 (six across
// on wide screens, five on phones), a wallpaper mixed from the types inside, the picked Pokémon lifted onto a tile with its
// summary beside the box (on phones: a sheet from the bottom), your team underneath. Every step is today's shared code
// (31-box-data.js, 45-team-links.js): sort, add, remove, reset, Undo, box links. Rule fixes from NOTES.md: slanted chips, not
// rounded pills; one size per kind of text (long names use the narrower width of the same font, never a smaller size); dark mode.

V2.bx = {page: 0, sel: null, ask: false};
// no icons: only Rating has one in the slider's set, and one taller button breaks the row (ik 'none' turns them off)
const BX_SORTS = [['az', 'A–Z', 'none'], ['type', 'Type', 'none'], ['new', 'Newest', 'none'], ['old', 'Oldest', 'none'], ['rating', 'Rating', 'none']];
V2.bxPer = () => 30;
// the box's pages: 30 each, in the chosen order
V2.bxData = () => { const so = boxSortNow(), rows = boxRows(so), per = V2.bxPer(), pages = Math.max(1, Math.ceil(rows.length / per));
  if (V2.bx.page >= pages) V2.bx.page = pages - 1; if (V2.bx.page < 0) V2.bx.page = 0;
  const on = new Set(members().map(m => ownKey(m.p)));
  if (!V2.bx.sel || !S.box.includes(V2.bx.sel)) V2.bx.sel = (rows[V2.bx.page * per] || [])[0] || null;
  return {so, rows, per, pages, on, here: rows.slice(V2.bx.page * per, V2.bx.page * per + per)}; };
// what the page header says about this box's range: letters for A–Z, types for Type, the order otherwise
V2.bxRange = (so, here) => { if (!here.length) return ''; const a = here[0], z = here[here.length - 1];
  if (so === 'az' || so === 'za') return `${a[1][0]} to ${z[1][0]}`;
  if (so === 'type') { const t = r => ((byName.get(r[0]) || {}).t || [''])[0]; return t(a) === t(z) ? t(a) : `${t(a)} to ${t(z)}`; }
  return {new: 'Newest first', old: 'Oldest first', rating: 'Highest rated first'}[so] || ''; };
// the wallpaper: one soft colour per corner from the four most common types in this box (ties: A–Z), rays over it
V2.bxWall = here => { const c = {}; for (const [n] of here) { const p = byName.get(n); if (p) for (const t of p.t) c[t] = (c[t] || 0) + (t === p.t[0] ? 2 : 1); }
  const ts = Object.keys(c).sort((a, b) => c[b] - c[a] || a.localeCompare(b)); while (ts.length < 4) ts.push(ts[ts.length - 1] || 'Normal');
  return ts.slice(0, 4).map((t, i) => `--w${i}:var(--ty-${t})`).join(';'); };

V2.bxTile = (n, d, on, sel) => `<button type="button" class="bx-t${sel ? ' sel' : ''}" data-bxsel="${V2.esc(n)}" aria-pressed="${sel}" aria-label="${V2.esc(d)}${on ? ', on your team' : ''}">${on ? '<i class="bx-on" aria-hidden="true"></i>' : ''}${V2.mon(n, {iw: 96, bare: true})}<b>${V2.esc(d)}</b></button>`;

// the summary of the picked Pokémon (beside the box on wide screens, in a sheet on phones)
V2.bxSum = (n, o = {}) => { const p = byName.get(n); if (!p) return ''; const E = V2.esc, r = rating(p), rs = RS(r.total), T = lTier(r.total), H = lairHead(p);
  const onTeam = members().some(m => ownKey(m.p) === n), st = V2.addState(n), full = st === 'full';
  const num = (b, l) => `<div class="bx-n"><b>${b}</b><span>${l}</span></div>`;
  return `<div class="bx-sum${o.sheet ? ' in-sheet' : ''}"><div class="bx-art">${V2.mon(n, {sel: true, iw: o.sheet ? 140 : 240, bare: true})}<p class="bx-plate"><b>Rated ${rs}</b> · ${E(T.k)} tier</p></div>
    <div class="bx-sumb"><h2 class="u">${V2.nameHtml(V2.disp(n))}</h2><div class="bx-ty">${(p.t || []).map(V2.typeChip).join('')}${onTeam ? '<span class="np-chip bx-chip">On your team</span>' : ''}</div>
    <div class="bx-nums">${num(H.hU != null ? E(pctFmt(H.hU)) : '–', 'of teams')}${num(H.hW != null ? E(pctFmt(H.hW)) : '–', 'win rate')}${num(p.st[5], 'base Speed')}</div>
    <div class="bx-acts"><button type="button" class="np-btn" data-v2mon="${E(n)}">Info Sheet</button>${onTeam ? '' : `<button type="button" class="np-btn2" data-bxteam="${E(n)}"><span>${full ? 'Swap Into My Team' : 'Add to My Team'}</span></button>`}<button type="button" class="np-btn2" data-bxrm="${E(n)}"><span>Remove from Box</span></button></div></div></div>`; };

V2.bxEmpty = () => { const n = V2.underdog(), d = V2.esc(V2.disp(n));
  return `<div class="bx-empty">${V2.mon(n, {iw: 200, bare: true})}<div><h2 class="u">Your box is empty.</h2><p>Add the Pokémon you own, and Build for Me and the suggestions pick from them. ${d} would love a spot.</p>
    <div class="row"><button type="button" class="np-btn" data-bxadd><span>Add a Pokémon</span></button><button type="button" class="np-btn2" data-bxaddn="${V2.esc(n)}"><span>Add ${d}</span></button></div></div></div>`; };

V2.pages.box = {place: 'team', draw() { const D = V2.bxData(), E = V2.esc, n = S.box.length;
  const head = `<div class="bx-lead"><div class="np-eyebrow"><span><a class="np-back" href="#team">← My Team</a> · The Pokémon you own</span></div><h1 class="u">My Box</h1>
    <p class="bx-count">${n} Pokémon${n ? ` · ${D.pages} box${D.pages > 1 ? 'es' : ''}` : ''}</p><p class="bx-why">Build for Me and the suggestions pick from these when set to “My Box”.</p>
    <button type="button" class="bx-add" data-bxadd><span>Add a Pokémon</span><b aria-hidden="true">+</b></button></div>`;
  const sort = `<div class="bx-sort"><span class="lbl">Arrange by</span>${V2.slide('box-sort', BX_SORTS, D.so === 'za' ? 'az' : D.so, 'Arrange by')}</div>`;
  const tools = `<div class="bx-tools"><ul class="bx-links"><li><button type="button" data-bxlink="copy">Copy Box Link</button></li><li><button type="button" data-bxlink="open" aria-expanded="${!!V2.bx.linkOpen}">Open a Box Link</button>
      <div class="bx-linkin"${V2.bx.linkOpen ? '' : ' hidden'}><p class="fine">Paste a box link or code from another device, account or friend.</p><label class="np-field"><input data-bxlinkin aria-label="Box link or code" autocomplete="off" value="${E(V2.bx.linkVal || '')}"></label>
      <div class="row"><button type="button" class="np-btn2" data-bxlink="add"><span>Add to My Box</span></button><button type="button" class="np-btn2" data-bxlink="replace"><span>Replace My Box</span></button></div><p class="bx-msg" data-bxmsg role="status">${E(V2.bx.msg || '')}</p></div></li>
      <li><button type="button" data-bxreset>${V2.bx.ask ? 'Tap Again to Reset' : 'Reset Box'}</button></li></ul>
    <p class="fine bx-sync">${E(syncText(ui.syncSt || 'local'))}</p><p class="bx-key"><i class="bx-on" aria-hidden="true"></i>On your team</p></div>`;
  if (!n) return `<section class="bx2 is-empty">${head}<div class="bx-mid">${V2.bxEmpty()}</div>${tools}</section>`;
  const nav = D.pages > 1, dots = nav ? `<div class="bx-dots" role="group" aria-label="Boxes">${Array.from({length: D.pages}, (_, i) => `<button type="button" data-bxpage="${i}" aria-label="Box ${i + 1}" aria-pressed="${i === V2.bx.page}"></button>`).join('')}</div>` : '';
  const box = `<div class="bx-box" style="${V2.bxWall(D.here)}" data-bxswipe><div class="bx-hd">${nav ? '<button type="button" class="bx-arr" data-bxgo="-1" aria-label="Previous box"><span>◀</span></button>' : '<span></span>'}
      <div class="bx-name"><h2 class="u">Box ${V2.bx.page + 1}</h2><p>${D.here.length} of ${n} · ${E(V2.bxRange(D.so, D.here))}</p></div>${nav ? '<button type="button" class="bx-arr" data-bxgo="1" aria-label="Next box"><span>▶</span></button>' : '<span></span>'}</div>
    <div class="bx-grid">${D.here.map(([b, d]) => V2.bxTile(b, d, D.on.has(b), b === V2.bx.sel)).join('')}</div>${dots}</div>`;
  const ms = members(), four = ms.length >= 4 ? CH.four(ms) : null, role = m => !four ? '' : four.lead.includes(m.p.n) ? 'Lead' : four.back.includes(m.p.n) ? 'Back' : 'Bench';
  const team = `<div class="bx-team"><div class="bx-teamhd"><h2 class="u">Your Team</h2><a class="np-link" href="#team">${ms.length} of 6 · Open My Team</a></div>
    ${ms.length ? `<ul>${ms.map(m => `<li>${V2.mon(m.p.n, {iw: 72, sub: role(m)})}</li>`).join('')}</ul>` : '<p class="fine">No team yet. Pick a Pokémon in your box and add it.</p>'}</div>`;
  return `<section class="bx2">${head}<div class="bx-mid">${sort}${box}${team}</div><aside class="bx-side" aria-label="Picked Pokémon">${V2.bx.sel ? V2.bxSum(V2.bx.sel) : ''}</aside>${tools}</section>`; }};

// ---------- actions ----------
const bxRe = () => V2.redraw();
V2.bxNarrow = () => matchMedia('(max-width:899px)').matches;
V2.bxPick = n => { V2.bx.sel = n; if (V2.bxNarrow()) { bxRe(); V2.sheet(V2.bxSum(n, {sheet: true}), {label: V2.disp(n), small: true}); return; } bxRe();
  const t = document.querySelector(`[data-bxsel="${CSS.escape(n)}"]`); if (t) t.focus({preventScroll: true}); };
V2.bxToast = t => V2.toast(V2.esc(t) + ' <button type="button" data-bxundo>Undo</button>', 6000);
V2.bxAddPick = () => { const sh = V2.sheet(`<div class="np-find"><h2 class="u">Add to My Box</h2><label class="np-field">${V2.ICON.search}<input type="search" data-bxq placeholder="Find a Pokémon you own" aria-label="Add a Pokémon to your box" autocomplete="off"></label><div class="hits" data-bxhits aria-live="polite"></div></div>`, {label: 'Add to My Box', small: true, focus: '[data-bxq]'});
  const inp = sh.querySelector('[data-bxq]'), out = sh.querySelector('[data-bxhits]');
  const draw = () => { const q = inp.value.trim(), r = q ? V2.find(q).mons.filter(p => !p.m && !inBox(p)) : []; // as today: base forms only, and not ones already in the box
    out.innerHTML = !q ? '<p class="fine">Type a Pokémon\'s name. Mega forms come with their Pokémon.</p>' : !r.length ? `<p class="fine">Nothing called “${V2.esc(q)}”. Try part of the name.</p>`
      : r.map(p => { const has = inBox(p); return `<button type="button" class="np-hit" data-bxaddn="${V2.esc(p.n)}"${has ? ' aria-disabled="true"' : ''}><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy"><b>${V2.nameHtml(V2.disp(p.n))}</b><span class="ty">${has ? '<small>In your box</small>' : (p.t || []).map(V2.typeChip).join('')}</span></button>`; }).join(''); };
  inp.addEventListener('input', draw); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const h = out.querySelector('.np-hit:not([aria-disabled])'); if (h) { e.preventDefault(); h.click(); } } }); draw(); };
V2.bxAdd = n => { const p = byName.get(n); if (!p) return; if (!boxAdd(p)) { toast(`${p.d} is already in your box`); return; } V2.closeSheet(true);
  V2.bx.sel = p.n; const D = V2.bxData(), i = D.rows.findIndex(r => r[0] === p.n); if (i >= 0) V2.bx.page = Math.floor(i / D.per); render(); toast(p.d + ' added to your box'); };
// add to the team (an empty spot) or swap it in for one of the six (today's addMon; Undo brings the team back)
V2.bxTeam = n => { const p = byName.get(n); if (!p) return; const st = V2.addState(n);
  if (st === 'have') { toast(`${p.d} is already on your team`); return; }
  if (st === 'ok') { keepUndo(); addMon(S.slots.findIndex(x => !byName.get(x.n)), p); V2.closeSheet(true); render(); toast(`${p.d} added to your team`, true); return; }
  V2.sheet(`<div class="bx-swap"><div class="np-eyebrow">Swap into my team</div><h2 class="u">${V2.esc(V2.disp(n))} replaces…</h2><ul>${members().map(m => `<li><button type="button" class="bx-swapb" data-bxswap="${m.i}">${V2.mon(m.p.n, {iw: 72})}</button></li>`).join('')}</ul></div>`, {label: 'Swap into my team', small: true});
  document.querySelectorAll('[data-bxswap]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.bxswap, out = S.slots[i] && byName.get(S.slots[i].n);
    keepUndo(); addMon(i, p); V2.closeSheet(true); render(); toast(`${out ? out.d + ' → ' : ''}${p.d}`, true); })); };
V2.bxGo = d => { const D = V2.bxData(); V2.bx.page = (V2.bx.page + d + D.pages) % D.pages; V2.bx.sel = (V2.bxData().here[0] || [])[0] || null; bxRe(); };

document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('[data-bxsel],[data-bxgo],[data-bxpage],[data-bxadd],[data-bxaddn],[data-bxteam],[data-bxrm],[data-bxreset],[data-bxlink],[data-bxundo]'); if (!t) return;
  const d = t.dataset;
  if (d.bxsel) V2.bxPick(d.bxsel);
  else if (d.bxgo) V2.bxGo(+d.bxgo);
  else if (d.bxpage !== undefined) { V2.bx.page = +d.bxpage; V2.bx.sel = null; bxRe(); }
  else if (d.bxadd !== undefined) V2.bxAddPick();
  else if (d.bxaddn) { if (t.getAttribute('aria-disabled') !== 'true') V2.bxAdd(d.bxaddn); }
  else if (d.bxteam) V2.bxTeam(d.bxteam);
  else if (d.bxrm) { const p = byName.get(d.bxrm); boxRemove(d.bxrm); V2.closeSheet(true); render(); V2.bxToast(`Removed ${p ? p.d : d.bxrm} from your box`); }
  else if (d.bxundo !== undefined) { if (boxRestore()) { render(); toast('Box restored'); } }
  else if (d.bxreset !== undefined) { if (!V2.bx.ask) { V2.bx.ask = true; bxRe(); clearTimeout(V2.bx._t); V2.bx._t = setTimeout(() => { V2.bx.ask = false; if (V2.route() === 'box') bxRe(); }, 3500); return; }
    V2.bx.ask = false; boxReset(); V2.bx.page = 0; V2.bx.sel = null; render(); V2.bxToast('Box reset to the default list'); }
  else if (d.bxlink === 'copy') { const l = boxLink(); if (!l) { toast('Add some Pokémon to your box first'); return; }
    if (await copyText(l)) toast(`Box link copied (${S.box.length} Pokémon)`); else { V2.bx.linkOpen = true; V2.bx.linkVal = l; V2.bx.msg = 'Copy the link above.'; bxRe(); const f = document.querySelector('[data-bxlinkin]'); if (f) f.select(); } }
  else if (d.bxlink === 'open') { V2.bx.linkOpen = !V2.bx.linkOpen; V2.bx.msg = ''; bxRe(); if (V2.bx.linkOpen) { const f = document.querySelector('[data-bxlinkin]'); if (f) f.focus(); } }
  else if (d.bxlink === 'add' || d.bxlink === 'replace') { const f = document.querySelector('[data-bxlinkin]'), x = decodeBox(f && f.value);
    if (!x || !x.names.length) { V2.bx.linkVal = f ? f.value : ''; V2.bx.msg = 'That doesn’t look like a box link. Copy it again with Copy Box Link, then paste the whole thing.'; bxRe(); return; }
    V2.bx.linkVal = ''; V2.bx.msg = x.skipped ? `${x.skipped} Pokémon in that link aren’t in ${REG_NAME}, so they were left out.` : ''; if (!x.skipped) V2.bx.linkOpen = false;
    applyBox(x, d.bxlink); V2.bx.page = 0; V2.bx.sel = null; bxRe(); } });
document.addEventListener('input', e => { if (e.target.matches && e.target.matches('[data-bxlinkin]')) V2.bx.linkVal = e.target.value; });
document.addEventListener('v2slide', e => { if (e.detail.key !== 'box-sort') return; setBoxSort(e.detail.value); V2.bx.page = 0; V2.bx.sel = null; bxRe(); });
// arrows move the cursor through the box like the game; at the edges they flip to the next box
document.addEventListener('keydown', e => { const t = e.target.closest && e.target.closest('[data-bxsel]'); if (!t || !/^Arrow/.test(e.key)) return;
  const all = [...document.querySelectorAll('.bx-grid [data-bxsel]')], i = all.indexOf(t), cols = getComputedStyle(t.parentElement).gridTemplateColumns.split(' ').length;
  const j = i + ({ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols})[e.key]; e.preventDefault();
  if (j >= 0 && j < all.length) { all[j].focus(); return; }
  if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && V2.bxData().pages > 1) { V2.bxGo(e.key === 'ArrowRight' ? 1 : -1); const g = [...document.querySelectorAll('.bx-grid [data-bxsel]')]; const k = e.key === 'ArrowRight' ? g[0] : g[g.length - 1]; if (k) k.focus(); } });
// swipe between boxes on touch screens: only a clearly sideways swipe, so it never fights scrolling
let bxT = null; document.addEventListener('touchstart', e => { const b = e.target.closest && e.target.closest('[data-bxswipe]'); bxT = b && e.touches.length === 1 ? [e.touches[0].clientX, e.touches[0].clientY] : null; }, {passive: true});
document.addEventListener('touchend', e => { if (!bxT) return; const t = e.changedTouches[0], dx = t.clientX - bxT[0], dy = t.clientY - bxT[1]; bxT = null;
  if (Math.abs(dx) > 56 && Math.abs(dx) > 2 * Math.abs(dy) && V2.bxData().pages > 1) V2.bxGo(dx < 0 ? 1 : -1); }, {passive: true});
// a box link opened directly (site#box=…): My Box with the link filled in; nothing changes until Add or Replace (as today)
V2.checkBoxLink = () => { let raw = ''; try { raw = location.hash || ''; } catch (e) {} if (!/box=/.test(raw)) return; const x = decodeBox(raw);
  try { history.replaceState(history.state, '', location.pathname + location.search + '#box'); } catch (e) {}
  if (!x || !x.names.length) { V2.draw(); toast('That box link didn’t work: it may be cut off'); return; }
  V2.bx.linkOpen = true; V2.bx.linkVal = raw.replace(/^#/, ''); V2.bx.msg = `A box link with ${x.names.length} Pokémon. Add them to your box, or replace your box with them.`; V2.draw(); };
window.addEventListener('hashchange', () => { if (/box=/.test(location.hash)) V2.checkBoxLink(); });
setTimeout(V2.checkBoxLink, 0);
