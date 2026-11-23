// player review 3j (Nov 17): a first visit's box is the built-in sample (DEFAULT_BOX, as cleaned at load in 02-set-data.js); while it is
// unchanged it says so, as the sample team does
V2.boxSample = () => { try { const d = new Set(DEFAULT_BOX.map(b => b === 'Rotom' ? 'Rotom-Wash' : b).filter(b => byName.has(b) && !byName.get(b).m));
  return S.box.length === d.size && S.box.every(b => d.has(b)); } catch (e) { return false; } };
// ---------- My Box: "The PC" (Sim chose the design Nov 23; the six new items approved 7:48 AM) ----------
// Brief docs/rebuild/reskin/mybox-pc-brief.md, mock-up docs/mockups/mybox-pc/. The game's PC box on the kit: Your Six on the left (each
// member's real item · Ability and rating, the Strength Score under them), the box in the middle (boxes of 30, six across and five down on
// every screen, the blue wallpaper, the logo's chevron as the cursor over the picked slot), and the foil trading card on the right with the
// picked Pokémon ("Box 1 · Slot 2"). 700-1279: Your Six becomes a strip on top, box and card side by side; phones: one column, the card
// inline under the box (no bottom sheet). Every step is today's shared code (31-box-data.js, 45-team-links.js): sort, add, remove, reset,
// Undo, box links. Hooks kept for the tests: data-bx*, .bx-grid, .bx-count, .bx-side, .bx-empty, [data-v2slide="box-sort"].
// Earlier: R4 (Nov 11), Sim's in-game box concept (docs/redesign/box/NOTES.md).

V2.bx = {page: 0, sel: null, ask: false};
const BX_SORTS = [['az', 'A–Z'], ['type', 'Type'], ['new', 'Newest'], ['old', 'Oldest'], ['rating', 'Rating']];
V2.bxPer = () => 30;
// the box's pages: 30 each, in the chosen order
V2.bxData = () => { const so = boxSortNow(), rows = boxRows(so), per = V2.bxPer(), pages = Math.max(1, Math.ceil(rows.length / per));
  if (V2.bx.page >= pages) V2.bx.page = pages - 1; if (V2.bx.page < 0) V2.bx.page = 0;
  const on = new Set(members().map(m => ownKey(m.p)));
  // E18 (Sim's check, Nov 12): nothing is picked until the player taps; the card shows the first slot meanwhile ("shown"), and only that
  // slot wears the cursor (its button is not pressed). The PC (Nov 23): the card is on every screen now (phones too, inline), so the
  // shown slot has the cursor on phones as well.
  if (V2.bx.sel && !S.box.includes(V2.bx.sel)) V2.bx.sel = null;
  const here = rows.slice(V2.bx.page * per, V2.bx.page * per + per);
  if (V2.bx.sel && !here.some(r => r[0] === V2.bx.sel)) V2.bx.sel = null; /* a pick on another box (after a sort) is let go: the card shows this box */
  return {so, rows, per, pages, on, here, shown: V2.bx.sel || (here[0] || [])[0] || null}; };
// what the box bar says about this box's range: letters for A–Z, types for Type, the order otherwise (screen readers; the bar shows "n of N")
V2.bxRange = (so, here) => { if (!here.length) return ''; const a = here[0], z = here[here.length - 1];
  if (so === 'az' || so === 'za') return `${a[1][0]} to ${z[1][0]}`;
  if (so === 'type') { const t = r => ((byName.get(r[0]) || {}).t || [''])[0]; return t(a) === t(z) ? t(a) : `${t(a)} to ${t(z)}`; }
  return {new: 'Newest first', old: 'Oldest first', rating: 'Highest rated first'}[so] || ''; };
// the cursor: the logo's chevron (Home's "raise" arrow, V2.sdhChv), pink over blue with its ink and white edges
V2.bxChv = () => (V2.sdhChv ? V2.sdhChv() : '').replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '').replace('<svg ', '<svg class="mb-cur" aria-hidden="true" ');
// one slot: the sprite on its floor, the name (hidden where the slot is too narrow: phones), the on-your-team corner flag, the cursor
V2.bxTile = (n, d, on, sel, shown, k) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null;
  return `<button type="button" class="bx-t mb-t${sel ? ' sel' : ''}${shown ? ' mb-cur-on' : ''}" data-bxsel="${V2.esc(n)}" aria-pressed="${sel}" aria-label="${V2.esc(d)}, slot ${k}${on ? ', on your team' : ''}">${on ? '<i class="mb-flag" aria-hidden="true"></i>' : ''}${shown ? V2.bxChv() : ''}<i class="mb-fl" aria-hidden="true"></i>${id ? `<img src="${V2.art(id)}" alt="" loading="lazy" decoding="async">` : ''}<b>${V2.tileName(d)}</b></button>`; };
const bxTierC = k => `var(--tier-${String(k || 'f').toLowerCase()})`;
const bxTierChip = k => `<span class="mb-tier u" style="--tc:${bxTierC(k)}">${V2.esc(k)}&nbsp;tier</span>`;
// Your Six: the team in its order, each row tinted with its first type, its real item · Ability (the team's set) and its rating
V2.bxSix = ms => { const E = V2.esc;
  const row = m => { const id = SPRITE_ID[m.p.n], k = V2.kName(m.p.n), R = monRating(m.p), it = m.heldItem || m.item || 'No item', t = (m.p.t || [])[0];
    return `<li class="mb-pm" style="--ac:var(--ty-${V2.TYPES.includes(t) ? t : 'Normal'})"><img src="${V2.art(id)}" alt="" loading="lazy" decoding="async"><span class="mb-pn"><small${k.form ? '' : ' aria-hidden="true"'}>${k.form ? E(k.form) : '&nbsp;'}</small><b class="u" data-kmax="3">${E(k.name).replace(/ (\S)$/, '&nbsp;$1')}</b><em><span data-kmax="2">${V2.keepForm(E(it))}</span>${m.ability ? `<span data-kmax="2"><span class="vh">, </span>${E(m.ability)}</span>` : ''}</em></span>${R ? `<span class="mb-pr"><b class="u">${R.n}</b>${bxTierChip(R.tier)}</span>` : ''}</li>`; };
  const empty = Array.from({length: Math.max(0, 6 - ms.length)}, () => '<li class="mb-pm mb-pe"><span>Empty spot</span></li>').join('');
  return `<ol class="mb-six" aria-label="Your Six">${ms.map(row).join('')}${empty}</ol>`; };
// the team's Strength Score: the same number and band word My Team shows (team.js), the team's name under it
V2.bxScoreOf = ms => { if (!ms.length) return null; try { const RD = prepOf(ms), G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; if (!G) return null;
  return {s: Math.round(G.s), word: CH.wordOf(G.s), so: G.partial ? ' so far' : '', band: ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid'}; } catch (e) { return null; } };

// the card: the picked Pokémon as a foil trading card (the strip names its box and slot, and says if it is on your team)
// F (Sim, Nov 12): a species with more than one form (a Mega) shows a Forms row; the tapped form's rating and numbers fill the card, the
// Pokémon Page opens that form and Add / Swap adds that form. The box keeps the species (n); Remove from Box removes the species.
V2.bxSum = (n, o = {}) => { const b = byName.get(n); if (!b) return ''; const fs = ROSTER.filter(q => q.b === b.b), F = V2.bx.form && V2.bx.form.of === n && fs.some(q => q.n === V2.bx.form.f) ? V2.bx.form.f : n;
  const p = byName.get(F), E = V2.esc, r = rating(p), rs = RS(r.total), T = lTier(r.total), H = lairHead(p), id = SPRITE_ID[F];
  const kn = V2.kName(F), onTeam = members().some(m => ownKey(m.p) === n), st = V2.addState(F), full = st === 'full', t1 = (p.t || [])[0], t2 = (p.t || [])[1] || t1;
  const forms = fs.length > 1 ? `<div class="mb-forms"><p class="mb-cap">Forms · tap one to show it</p><div class="mb-fr" role="group" aria-label="Forms of ${E(V2.disp(b.b))}">${fs.map(q => { const rq = rating(q);
    return `<button type="button" class="mb-f" data-bxform="${E(q.n)}" data-bxof="${E(n)}" aria-pressed="${q.n === F}"><img src="${V2.art(SPRITE_ID[q.n])}" alt="" loading="lazy" decoding="async"><span><b>${V2.nameHtml(V2.disp(q.n))}</b><small>${RS(rq.total)} · ${E(lTier(rq.total).k)} tier</small></span></button>`; }).join('')}</div></div>` : '';
  // Usage / Win rate / Speed: win rate needs 30+ tournament games, as today (Box Q3 B, Sim Nov 13: too few games said in words)
  const few = !(H.hW != null && H.hG >= 30), ad = (V2.asOf && V2.asOf().match(/[A-Z][a-z]{2} \d{1,2}/)) || null;
  const src = (H.hU != null ? 'Online tournaments' : 'No tournament games yet') + (ad ? ', ' + ad[0] : '');
  const rk = rankTxt(p, 'cap');
  const main = onTeam ? `<button type="button" class="np-btn mb-main" data-hmaround="${E(F)}">Build Around It</button>`
    : `<button type="button" class="np-btn mb-main" data-bxteam="${E(F)}">${full ? 'Swap into My Team' : 'Add to My Team'}</button><button type="button" class="np-btn2 k-btn" data-hmaround="${E(F)}"><span>Build Around It</span></button>`;
  return `<div class="mb-cw" style="--t1:var(--ty-${V2.TYPES.includes(t1) ? t1 : 'Normal'});--t2:var(--ty-${V2.TYPES.includes(t2) ? t2 : 'Normal'})"><div class="mb-card bx-sum${fs.length > 1 ? ' mb-hasf' : ''}">
    <p class="mb-strip"><span>${o.slot ? `Box ${o.box} · Slot ${o.slot}` : 'In your box'}</span><span>${onTeam ? 'On your team' : 'Not on your team'}</span></p>
    <div class="mb-top"><div class="mb-ph"><span class="mb-gh u" aria-hidden="true">${rs}</span><img src="${V2.art(id, true)}" alt="" decoding="async"></div>
    <div class="mb-idn"><p class="mb-form"${kn.form ? '' : ' aria-hidden="true"'}>${kn.form ? E(kn.form) : '&nbsp;'}</p><h2 class="mb-nm u" data-kmax="3">${E(kn.name).replace(/ (\S)$/, '&nbsp;$1')}</h2><div class="mb-ty">${(p.t || []).map(V2.typeChip).join('')}</div>
    <div class="mb-rr"><b class="u">${rs}</b>${bxTierChip(T.k)}<small>${rk ? E(rk) : 'No tournament results yet'}</small></div><p class="mb-rk">${rk ? E(rk) : 'No tournament results yet'}</p></div></div>${forms}
    <dl class="mb-nums"><div><dt>Usage</dt><dd class="u">${E(V2.shareTxt(H))}</dd></div><div${few ? ' class="few"' : ''}><dt>Win rate</dt><dd class="u">${few ? 'Too few' : E(pctFmt(H.hW))}</dd>${few ? `<small>${H.hG ? Math.round(H.hG) + ' games' : 'No games yet'}</small>` : ''}</div><div><dt>Speed</dt><dd class="u">${p.st[5]}</dd></div></dl>
    <p class="mb-src">${E(src)}</p>
    <div class="mb-acts">${main}</div>
    <p class="mb-links"><button type="button" class="np-link" data-v2mon="${E(F)}">Pokémon Page ›</button><button type="button" class="np-link mb-rm" data-bxrm="${E(n)}">Remove from Box</button></p></div></div>`; }; // Build Around It: Sim, Nov 13 (My Box Q2 B); Home's handler (ui.abLock, then Build)

// E20 (Sim's check, Nov 12): the shared syncText names the Claude account, which can't be on the public site; plain words here.
V2.syncTxt = st => !V2.canStore ? V2.noStoreTxt : st === 'local' ? 'Saved in this browser only. To use your box on another device, copy its box link.' : 'Saved and kept in step across your devices.';
// E19 (Sim's check, Nov 12): a 0 share with tournament games is under 0.05%: "<0.1%"; no tournament games at all stays "–"
V2.shareTxt = H => H.hU == null ? '–' : +H.hU === 0 && H.hG > 0 ? '<0.1%' : pctFmt(H.hU);
V2.bxEmpty = () => { const n = V2.underdog(), d = V2.esc(V2.disp(n));
  return `<div class="bx-empty"><button type="button" class="bx-mon" data-v2mon="${V2.esc(n)}" aria-label="${d}: open its info">${V2.mon(n, {bare: true, ft: true})}</button><div><h2 class="u">Your box is empty.</h2><p>Add the Pokémon you own, and Build and the suggestions pick from them. ${d} would love a spot.</p>
    <div class="row"><button type="button" class="np-btn" data-bxadd><span>Add a Pokémon</span></button><button type="button" class="np-btn2 k-btn" data-bxaddn="${V2.esc(n)}"><span>Add ${d}</span></button></div></div></div>`; };

V2.pages.box = {place: 'box', draw() { const D = V2.bxData(), E = V2.esc, n = S.box.length, smp = V2.boxSample(), ms = members();
  const onN = S.box.filter(b => D.on.has(b)).length;
  const head = `<div class="mb-head"><header class="k-head"><p class="k-kicker"><a class="mb-back" href="#team">← My Team</a> · The Pokémon you own</p><h1 class="k-h1 u">My <em>Box</em></h1>
    <p class="k-lead">${smp ? 'A sample box to start with: add the Pokémon you own and remove the rest. ' : ''}Build and the suggestions pick from these when set to “My Box”.</p></header>
    <div class="mb-tally bx-count"><p><b class="u">${n}</b><span>Pokémon${smp ? ' (sample)' : ''}</span></p>${n ? `<p><b class="u">${D.pages}</b><span>${D.pages > 1 ? 'Boxes' : 'Box'}</span></p><p><b class="u">${onN}</b><span><i class="mb-flag mb-key" aria-hidden="true"></i>On your team</span></p>` : ''}</div></div>`;
  const sort = `<div class="mb-sort"><span class="mb-cap" id="mb-sortl">Arrange by</span><div class="mb-seg" role="group" aria-labelledby="mb-sortl" data-v2slide="box-sort">${BX_SORTS.map(([v, t]) => `<button type="button" class="k-chip" data-v="${v}" aria-pressed="${(D.so === 'za' ? 'az' : D.so) === v}"><span>${t}</span></button>`).join('')}</div></div>`;
  const tools = `<div class="mb-tools"><button type="button" class="mb-add u" data-bxadd><span><b aria-hidden="true">+</b> Add a Pokémon</span></button><span class="mb-links2"><button type="button" class="np-link" data-bxlink="copy">Copy Box Link</button><button type="button" class="np-link" data-bxlink="open" aria-expanded="${!!V2.bx.linkOpen}">Open a Box Link</button><button type="button" class="np-link mb-reset" data-bxreset>${V2.bx.ask ? 'Tap Again to Reset' : 'Reset Box'}</button></span></div>`;
  const linkRow = `<div class="mb-linkrow">${V2.bx.linkOpen ? `<div class="bx-linkin"><p class="fine">Paste a box link or code from another device, account or friend.</p><div class="mb-linkf"><label class="np-field"><input data-bxlinkin aria-label="Box link or code" autocomplete="off" value="${E(V2.bx.linkVal || '')}"></label>
      <button type="button" class="np-btn2 k-btn" data-bxlink="add"><span>Add to My Box</span></button><button type="button" class="np-btn2 k-btn" data-bxlink="replace"><span>Replace My Box</span></button></div><p class="bx-msg" data-bxmsg role="status">${E(V2.bx.msg || '')}</p></div>` : ''}
    <p class="fine bx-sync">${E(V2.syncTxt(ui.syncSt || 'local'))}</p></div>`;
  if (!n) return `<section class="bx2 mb is-empty">${head}${V2.bxEmpty()}${tools}${linkRow}</section>`;
  const nav = D.pages > 1, k0 = D.here.findIndex(r => r[0] === D.shown);
  const dots = nav ? `<span class="mb-dots" role="group" aria-label="Boxes">${Array.from({length: D.pages}, (_, i) => `<button type="button" data-bxpage="${i}" aria-label="Box ${i + 1}" aria-pressed="${i === V2.bx.page}"></button>`).join('')}</span>` : '';
  const arr = d => nav ? `<button type="button" class="mb-arr" data-bxgo="${d}" aria-label="${d < 0 ? 'Previous' : 'Next'} box"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="${d < 0 ? 'M9 1 3 6l6 5z' : 'M3 1l6 5-6 5z'}"/></svg></button>` : '<span></span>';
  const bar = `<div class="mb-bar">${arr(-1)}<div class="mb-bt"><h2 class="u">Box ${V2.bx.page + 1}</h2><span>${D.here.length} of ${n}<span class="vh"> · ${E(V2.bxRange(D.so, D.here))}</span></span>${dots}</div>${arr(1)}</div>`;
  const wall = `<div class="mb-wall" data-bxswipe><div class="bx-grid">${D.here.map(([b, d], i) => V2.bxTile(b, d, D.on.has(b), b === V2.bx.sel, b === D.shown, i + 1)).join('')}${'<i class="bx-slot" aria-hidden="true"></i>'.repeat(Math.max(0, D.per - D.here.length))}</div></div>`;
  const sc = V2.bxScoreOf(ms), title = ms.length ? teamTitleFor(ms) : '';
  const sixh = `<div class="mb-sixh"><h2 class="u">Your Six${sc ? `<span class="mb-sixs"> · <span style="--band:var(--band-${sc.band})">${sc.s} ${E(sc.word)}</span></span>` : ''}</h2><a class="k-link" href="#team">Open My Team&nbsp;›</a></div>`;
  const score = `<div class="mb-score"${sc ? ` style="--band:var(--band-${sc.band})"` : ''}>${sc ? `<b class="u">${sc.s}</b><div><strong class="u">${E(sc.word)}</strong><span>Strength Score${sc.so}${title ? ' · ' + E(title) : ''}</span></div>` : `<div><strong class="u">${ms.length ? 'Not rated yet' : 'No team yet'}</strong><span>${ms.length ? `${ms.length} of 6 picked. The Strength Score shows once the team can be rated.` : 'Pick a Pokémon in your box and add it.'}</span></div>`}</div>`;
  const card = `<aside class="mb-side bx-side" aria-label="Picked Pokémon">${D.shown ? V2.bxSum(D.shown, {box: V2.bx.page + 1, slot: k0 + 1}) : ''}</aside>`;
  return `<section class="bx2 mb">${head}<div class="mb-grid">${sixh}${bar}${V2.bxSix(ms)}${wall}${score}<div class="mb-foot">${sort}${tools}</div>${card}</div>${linkRow}</section>`; }};

// ---------- actions ----------
const bxRe = () => V2.redraw();
// The PC (Nov 23): the card is on the page at every width (phones: under the box), so a pick never opens a sheet. On phones, when the card
// is below the screen, the page brings its top into view; focus stays on the slot, so the arrow keys keep moving through the box.
V2.bxPick = n => { V2.bx.sel = n; V2.bx.form = null; bxRe();
  const t = document.querySelector(`[data-bxsel="${CSS.escape(n)}"]`); if (t) t.focus({preventScroll: true});
  const c = document.querySelector('#main .mb-side'); if (c && innerWidth < 700) { const r = c.getBoundingClientRect(); if (r.top > innerHeight - 96) scrollBy({top: r.top - innerHeight + Math.min(r.height, innerHeight * .6), behavior: V2.smooth ? V2.smooth() : 'auto'}); } };
V2.bxToast = t => V2.toast(V2.esc(t) + ' <button type="button" data-bxundo>Undo</button>', V2.UNDO_MS);
V2.bxAddPick = () => { const sh = V2.sheet(`<div class="np-find"><h2 class="u">Add to My Box</h2><label class="np-field">${V2.ICON.search}<input type="search" data-bxq placeholder="Find a Pokémon you own" aria-label="Add a Pokémon to your box" autocomplete="off">${V2.CLR}</label><div class="hits" data-bxhits aria-live="polite"></div></div>`, {label: 'Add to My Box', small: true, focus: '[data-bxq]'});
  const inp = sh.querySelector('[data-bxq]'), out = sh.querySelector('[data-bxhits]');
  // E16 (Sim's check, Nov 12): a name that is already in the box says so, instead of "Nothing called ..."
  const draw = () => { const q = inp.value.trim(), all = q ? V2.find(q).mons.filter(p => !p.m) : [], r = all.filter(p => !inBox(p)), had = all.filter(inBox); // as today: base forms only, and not ones already in the box
    out.innerHTML = !q ? '<p class="fine">Type a Pokémon\'s name. Mega forms come with their Pokémon.</p>' : !r.length ? (had.length ? `<p class="fine">${had.slice(0, 3).map(p => V2.esc(V2.disp(p.n))).join(', ')} ${had.length === 1 ? 'is' : 'are'} already in your box.</p>` : `<p class="fine">Nothing called “${V2.esc(q)}”. Try part of the name.</p>`)
      : r.map(p => { const has = inBox(p); return `<button type="button" class="np-hit" data-bxaddn="${V2.esc(p.n)}"${has ? ' aria-disabled="true"' : ''}><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy" decoding="async"><b>${V2.nameHtml(V2.disp(p.n))}</b><span class="ty">${has ? '<small>In your box</small>' : (p.t || []).map(V2.typeChip).join('')}</span></button>`; }).join(''); };
  inp.addEventListener('input', draw); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const h = out.querySelector('.np-hit:not([aria-disabled])'); if (h) { e.preventDefault(); h.click(); } } }); draw(); };
V2.bxAdd = n => { const p = byName.get(n); if (!p) return; if (!boxAdd(p)) { toast(`${p.d} is already in your box`); return; } V2.closeSheet(true);
  V2.bx.sel = p.n; const D = V2.bxData(), i = D.rows.findIndex(r => r[0] === p.n); if (i >= 0) V2.bx.page = Math.floor(i / D.per); render(); toast(p.d + ' added to your box'); };
// add to the team (an empty spot) or swap it in for one of the six (today's addMon; Undo brings the team back)
// Sim, Nov 12: adding a Mega form when the team already has a Mega stops and asks first (only one Pokemon can Mega Evolve per
// battle). `skip` is the slot being replaced (replacing the team's own Mega needs no warning).
V2.bxMegaOk = (p, skip, go) => { const other = p.m && members().find(m => m.mega && m.i !== skip); if (!other) return go();
  V2.sheet(`<div class="bx-swap"><div class="np-eyebrow">Two Megas</div><h2 class="u">Add ${V2.esc(V2.disp(p.n))} too?</h2><p>Your team already has ${V2.esc(V2.disp(other.p.n))}. Only one Pok\u00e9mon can Mega Evolve in a battle.</p><div class="bx-acts"><button type="button" class="np-btn2 k-btn" data-bxmegago><span>Add Anyway</span></button><button type="button" class="np-btn2 k-btn" data-bxmegano><span>Cancel</span></button></div></div>`, {label: 'Two Megas', small: true});
  const yes = document.querySelector('[data-bxmegago]'), no = document.querySelector('[data-bxmegano]');
  if (yes) yes.addEventListener('click', go); if (no) no.addEventListener('click', () => V2.closeSheet()); if (no) no.focus(); };
// win rate needs 30+ tournament games, as on today's site (Sim, Nov 12: go)
V2.bxTeam = n => { const p = byName.get(n); if (!p) return; const st = V2.addState(n);
  if (st === 'have') { toast(`${p.d} is already on your team`); return; }
  if (st === 'ok') { const at = S.slots.findIndex(x => !byName.get(x.n)); V2.bxMegaOk(p, -1, () => { keepUndo(); addMon(at, p); V2.closeSheet(true); render(); toast(`${p.d} added to your team`, true); }); return; }
  V2.sheet(`<div class="bx-swap"><div class="np-eyebrow">Swap Into My Team</div><h2 class="u">${V2.esc(V2.disp(n))} replaces…</h2><ul>${members().map(m => `<li><button type="button" class="bx-swapb" data-bxswap="${m.i}">${V2.mon(m.p.n, {iw: 72})}</button></li>`).join('')}</ul></div>`, {label: 'Swap Into My Team', small: true});
  document.querySelectorAll('[data-bxswap]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.bxswap, out = S.slots[i] && byName.get(S.slots[i].n);
    V2.bxMegaOk(p, i, () => { keepUndo(); addMon(i, p); V2.closeSheet(true); render(); toast(`${out ? out.d + ' → ' : ''}${p.d}`, true); }); })); };
V2.bxGo = d => { const D = V2.bxData(); V2.bx.page = (V2.bx.page + d + D.pages) % D.pages; V2.bx.sel = null; bxRe(); };

document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('[data-bxsel],[data-bxform],[data-bxgo],[data-bxpage],[data-bxadd],[data-bxaddn],[data-bxteam],[data-bxrm],[data-bxreset],[data-bxlink],[data-bxundo]'); if (!t) return;
  const d = t.dataset;
  if (d.bxsel) V2.bxPick(d.bxsel);
  else if (d.bxform) { V2.bx.sel = d.bxof; V2.bx.form = {of: d.bxof, f: d.bxform}; bxRe();
    const k = document.querySelector(`.bx-side [data-bxform="${CSS.escape(d.bxform)}"]`); if (k) k.focus({preventScroll: true}); }
  else if (d.bxgo) V2.bxGo(+d.bxgo);
  else if (d.bxpage !== undefined) { V2.bx.page = +d.bxpage; V2.bx.sel = null; bxRe(); }
  else if (d.bxadd !== undefined) V2.bxAddPick();
  else if (d.bxaddn) { if (t.getAttribute('aria-disabled') !== 'true') V2.bxAdd(d.bxaddn); }
  else if (d.bxteam) V2.bxTeam(d.bxteam);
  // E15 (Sim's check, Nov 12): the button pressed belonged to the Pokémon just removed, so focus fell to the page top; it now goes to
  // the box tile in the same place (the next Pokémon), or the last one
  else if (d.bxrm) { const p = byName.get(d.bxrm), tiles = [...document.querySelectorAll('[data-bxsel]')], at = Math.max(0, tiles.findIndex(x => x.dataset.bxsel === d.bxrm));
    boxRemove(d.bxrm); V2.closeSheet(true); render(); V2.bxToast(`Removed ${p ? p.d : d.bxrm} from your box`);
    const now = [...document.querySelectorAll('[data-bxsel]')].filter(x => x.getClientRects().length), f = now[Math.min(at, now.length - 1)]; if (f) f.focus({preventScroll: false}); }
  else if (d.bxundo !== undefined) { document.querySelectorAll('.np-sheet-undo').forEach(x => x.remove()); if (boxRestore()) { render(); toast('Box restored'); } }
  else if (d.bxreset !== undefined) { if (!V2.bx.ask) { V2.bx.ask = true; bxRe(); clearTimeout(V2.bx._t); V2.bx._t = setTimeout(() => { V2.bx.ask = false; if (V2.route() === 'box') bxRe(); }, 3500); return; }
    V2.bx.ask = false; boxReset(); V2.bx.page = 0; V2.bx.sel = null; render(); V2.bxToast('Box reset to the default list'); }
  else if (d.bxlink === 'copy') { const l = boxLink(); if (!l) { toast('Add some Pokémon to your box first'); return; }
    if (await V2.copy(l)) toast(`Box link copied (${S.box.length} Pokémon)`); else { V2.bx.linkOpen = true; V2.bx.linkVal = l; V2.bx.msg = 'Copy the link above.'; bxRe(); const f = document.querySelector('[data-bxlinkin]'); if (f) { f.focus(); f.select(); } } } /* E15: focus goes to the link box, not the page top */
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
