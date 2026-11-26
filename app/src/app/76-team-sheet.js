/* ---------- Team Sheet page (Sim, Nov 9) ----------
   "A page where we can see our entire team, every move, held item, Ability and stat spread in one quick look."
   One card per Pokémon: item and Ability, the four moves (type colours), the nature (what it raises and lowers) and the six
   stats as Champions stat points (0-32) with the real level-50 number (HP = base + 75 + points; others (base + 20 + points)
   x nature, calcStat in 39-damage-calc-speed.js). Every card says where the spread comes from: the player's own, their nature
   on the most common points (a team sheet gives no points), or the most common spread. Desktop 3 x 2 (the whole team on one
   screen), iPad 2 columns, phone 1. Tap a card to edit that Pokémon on My Team. My Team's own sheet fold is unchanged. */
Object.assign(VIEW_TITLE, {sheet: 'Team sheet'}); Object.assign(VIEW_PARENT, {sheet: 'report'});
/* TS (with STATS and natBits) is created in 44-share-images.js (Nov 11); this file adds the Team Sheet page's helpers */
// the six stats: real value at level 50 (big), stat points (small), nature's + and −. Shared by this page and the
// "Open team sheet" fold on My Team (Sim, Nov 9: one team sheet everywhere, with the stat spread in it)
TS.stats = m => { return sheetData(m).stats.map(({S: S_, pts, val, mark}) => { const mk = mark ? ' ' + mark : '';
    return `<div class="ts-st${mk}"><span class="ts-sl">${S_}${mk === ' up' ? '<i aria-label="raised by nature">+</i>' : mk === ' dn' ? '<i aria-label="lowered by nature">−</i>' : ''}</span><b class="ts-sv">${val == null ? '—' : val}</b><span class="ts-sp">${pts == null ? '' : pts}</span></div>`; }).join(''); };
// o (the "Open team sheet" fold on My Team, Nov 9): {fold: true, note: '<hint html>'} = tap opens the editor right there
// (data-chedit), with the remove button and the one-line hint the old sheet rows had
TS.card = (m, o = {}) => {
  const p = m.p, {nat, src, up, dn} = sheetData(m), nb = {up, dn};
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

/* buildSheetImage (the Team Sheet image) lives in 44-share-images.js (Nov 11) */
/* the third Share choice on My Team: Team card · Team poster · Team sheet */
{ const bsc = buildShareCard; buildShareCard = function () { return CH.shareKind === 'sheet' && !SHARE_KIND ? buildSheetImage(members()) : bsc.apply(this, arguments); }; }
