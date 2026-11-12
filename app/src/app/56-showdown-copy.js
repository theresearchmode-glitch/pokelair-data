// ---------- Copy for Showdown: one tap on every team shown (Nov) ----------
// Every team card carries a small "Copy for Showdown" button (data-sdcopy="<kind>:<key>"). The text is the same
// Showdown paste the Export panel writes (19-showdown-paste.js), so Showdown's teambuilder and our own importer read it:
//   Species @ Item / Ability: X / Level: 50 / EVs: 32 HP / 2 Def / 32 Spe (Champions stat points, 0-32 each, as Showdown's
//   gen9championsvgc2026regmc teambuilder writes them) / Adamant Nature / - Move x4.
// A Mega is written as its base Pokémon holding its Mega Stone, with the base form's ability (as Showdown writes it).
// Tournament teams use the exact open team sheet (item, ability, nature, moves). Team sheets never list stat points,
// so no EVs line is written for them (never guessed). Only when a sheet lacks a move or item is it filled from the most
// common set, and the copy then says so. Teams that are only six names (built teams, cores, a few tournament lists)
// get the most common sets from real play, the same as loading the team would give, and say so too.
const SD_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>';
function sdBtn(spec, cls) { return `<button type="button" class="sdcopy${cls ? ' ' + cls : ''}" data-sdcopy="${esc(spec)}" aria-label="Copy this team for Pokémon Showdown">${SD_ICON}<span>Copy for Showdown</span></button>`; }
// SD_NOTE_TOUR / SD_NOTE_BUILT, sdBlock, sdSpecies and sheetPaste moved to 19-showdown-paste.js (Nov 12) so the new build's Home shares them
// slotsPaste (any list of slots as Showdown text) lives in 19-showdown-paste.js, beside exportPaste, so the new build shares it
// the open team sheet for a list of six names (and the player, when known); null when no event has it
function sdSheetFor(names, player) { const E = META.events && META.events.events || [], key = names.filter(Boolean).slice().sort().join('|'); let any = null;
  for (const ev of E) for (const t of ev.top || []) if (t.mons.map(m => m.n).sort().join('|') === key) { if (!player || t.player === player) return t; any = any || t; }
  return player ? null : any; }
function sdNames(names, player) { const t = sdSheetFor(names, player); if (t) { const r = sheetPaste(t.mons); return {text: r.text, note: r.filled ? SD_NOTE_TOUR : ''}; }
  return {text: slotsPaste(names.filter(n => byName.get(n)).map(n => ({n, a: null, lock: false}))), note: SD_NOTE_TOUR}; }
// what each kind of button copies
function sdResolve(spec) { const i = String(spec).indexOf(':'), kind = i < 0 ? spec : spec.slice(0, i), key = i < 0 ? '' : spec.slice(i + 1);
  if (kind === 'mine') return members().length ? {text: exportPaste(), note: ''} : null;
  if (kind === 'saved') { const t = S.teams.find(x => x.id === key); return t ? {text: slotsPaste(t.slots), note: ''} : null; }
  if (kind === 'ev') { const x = evTeam(key); if (!x) return null; const r = sheetPaste(x.t.mons); return {text: r.text, note: r.filled ? SD_NOTE_TOUR : ''}; }
  if (kind === 'tt') { const t = META.teams && META.teams.teams[+key]; return t ? sdNames(t.mons, t.player) : null; }
  if (kind === 'gaunt') { const x = (gauntCache.rows || []).find(r => r.ix === +key); return x ? sdNames(x.t.mons, x.t.player) : null; }
  if (kind === 'ab') { const t = abTeam(key); return t ? {text: slotsPaste(t.mons.map(m => ({n: m.n, a: null, lock: false}))), note: SD_NOTE_BUILT} : null; }
  if (kind === 'core') { const ns = key.split('|').filter(n => byName.get(n)); return ns.length ? {text: slotsPaste(ns.map(n => ({n, a: null, lock: false}))), note: SD_NOTE_BUILT} : null; }
  if (kind === 'opp') { const t = sdOppSheet(); if (!t) return null; const r = sheetPaste(t.mons); return {text: r.text, note: r.filled ? SD_NOTE_TOUR : ''}; }
  return null; }
// the opponent on the Battle page, when their six is a real team sheet (from Winning teams, Events or the Gauntlet)
function sdOppSheet() { const opp = (S.opp || []).filter(Boolean); if (opp.length !== 6) return null;
  const who = ui.oppFrom && ui.oppFrom.key === opp.slice().sort().join('|') ? ui.oppFrom.who : null;
  return sdSheetFor(opp, who) || sdSheetFor(opp); }
// copy: the clipboard API first, then the classic select-and-copy, then a sheet with the text selected to copy by hand
function sdCopyText(text, note) { const done = () => toast('Copied — paste into Showdown\'s teambuilder' + (note ? '. ' + note : ''));
  const legacy = () => { let ok = false; const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.append(ta); try { ta.select(); ta.setSelectionRange(0, text.length); ok = document.execCommand && document.execCommand('copy'); } catch (e) { ok = false; } ta.remove(); return ok; };
  const fallback = () => { if (legacy()) done(); else sdSheetOpen(text, note); };
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback(); } catch (e) { fallback(); } }
function sdSheetOpen(text, note) { let el = $('sdSheet');
  if (!el) { el = document.createElement('div'); el.id = 'sdSheet'; el.className = 'sdsheet'; document.body.append(el); }
  el.innerHTML = `<div class="sdbox" role="dialog" aria-modal="true" aria-labelledby="sdT"><div class="sdh"><b id="sdT">Copy for Showdown</b><button type="button" class="sdx" data-sdx="1" aria-label="Close">×</button></div>
    <p class="t2">Copying was blocked here, so the team is selected below: press Ctrl+C (Cmd+C on a Mac), or press and hold, then Copy. Paste it into Showdown's teambuilder with Import from text.</p>
    <textarea class="field paste" id="sdText" readonly rows="12" aria-label="Team in Showdown format">${esc(text)}</textarea>${note ? `<p class="t2 sdnote">${esc(note)}</p>` : ''}
    <div class="row"><button type="button" class="btn sm" data-sdsel="1">Select all</button><button type="button" class="btn sm" data-sdx="1">Done</button></div></div>`;
  el.hidden = false; const ta = $('sdText'); if (ta) { try { ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length); } catch (e) {} } }
function sdSheetClose() { const el = $('sdSheet'); if (el) el.hidden = true; }
document.addEventListener('click', e => { const t = e.target && e.target.closest; if (!t) return;
  const x = e.target.closest('[data-sdx]'); if (x || e.target.id === 'sdSheet') { sdSheetClose(); return; }
  if (e.target.closest('[data-sdsel]')) { const ta = $('sdText'); if (ta) { ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length); } return; }
  const b = e.target.closest('[data-sdcopy]'); if (!b) return; e.preventDefault(); e.stopPropagation();
  let r = null; try { r = sdResolve(b.dataset.sdcopy); } catch (er) { r = null; }
  if (!r || !r.text) { toast('Nothing to copy yet'); return; }
  b.classList.add('sddone'); clearTimeout(b._sd); b._sd = setTimeout(() => b.classList.remove('sddone'), 1600);
  sdCopyText(r.text, r.note); }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') sdSheetClose(); });
