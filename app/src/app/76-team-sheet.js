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
TS.card = m => {
  const p = m.p, own = m.spread, sp = own || (typeof commonSpread === 'function' ? commonSpread(p) : null);
  const nat = sp && sp.nat ? sp.nat : ((setFor(p).na || [])[0] || [])[0] || '', nb = nat ? TS.natBits(nat) : {};
  const src = own ? (own.assumed ? 'Your nature, most common points' : 'Your spread') : sp ? 'Most common spread' : 'No spread data yet';
  const stats = TS.STATS.map(([S_, k]) => { const pts = sp ? +sp[k] || 0 : null, val = sp ? calcStat(p, S_, pts, natMul(nat, S_)) : null,
      mk = nb.up === S_ ? ' up' : nb.dn === S_ ? ' dn' : '';
    return `<div class="ts-st${mk}"><span class="ts-sl">${S_}${mk === ' up' ? '<i aria-label="raised by nature">+</i>' : mk === ' dn' ? '<i aria-label="lowered by nature">−</i>' : ''}</span><b class="ts-sv">${val == null ? '—' : val}</b><span class="ts-sp">${pts == null ? '' : pts}</span></div>`; }).join('');
  const mv = [0, 1, 2, 3].map(j => { const x = m.moves[j]; return x ? `<li style="--mt:${TC[x.type] || 'var(--ar-ink-3)'}">${esc(x.name)}</li>` : '<li class="none">No move</li>'; }).join('');
  const nl = nat ? `${esc(nat)}${nb.up && nb.dn && nb.up !== nb.dn ? ` <span class="ts-nb">+${nb.up} −${nb.dn}</span>` : ''}` : 'Nature unknown';
  return `<article class="ts-card" role="button" tabindex="0" data-tsedit="${m.i}" style="${tyVars(p)}" aria-label="${esc(m.d)}: edit its set on My Team">
    <header class="ts-hd">${sprite(p) || ''}<div class="ts-id"><h3 class="ts-nm">${esc(m.d)}</h3>
      <p class="ts-ia"><span><em>Item</em> ${esc(m.item || 'No item')}</span><span><em>Ability</em> ${esc(m.ability || '—')}</span></p></div></header>
    <ul class="ts-mv">${mv}</ul>
    <div class="ts-spr"><p class="ts-nat"><b>${nl}</b><span class="ts-src">${src}</span></p><div class="ts-stats" role="group" aria-label="Stats at level 50, with stat points below">${stats}</div></div>
  </article>`; };
function renderSheet() { const o = $('npSheetOut'); if (!o) return; const ms = members(), r = (typeof regInfo === 'function' && regInfo()) || {id: 'M-C'};
  const head = CH.head(`${ms.length ? esc(teamTitleFor(ms)) + ' · ' : ''}Reg ${esc(String(r.id).replace('-', '‑'))} doubles · level 50`, 'Team Sheet', '');
  if (!ms.length) { o.innerHTML = head + `<p class="ts-empty">No team yet. Add Pokémon on My Team and their full sets show here.</p><div class="ts-acts"><button type="button" class="ar-btn ar-primary" data-view="report"><span>Open My Team</span></button></div>`; return; }
  o.innerHTML = head + `<div class="ts-acts"><button type="button" class="ar-btn" data-tscopy="1">Copy as text</button><span class="ts-key">Big number: the stat at level 50 · small number: stat points (0–32) · <b class="up">+</b>/<b class="dn">−</b> nature</span></div>
    <div class="ts-grid">${ms.map(TS.card).join('')}</div>`; }
CH.wrap('setView', v => { if (v === 'sheet') renderSheet(); });
CH.wrap('render', () => { if (typeof view !== 'undefined' && view === 'sheet') renderSheet(); });
document.addEventListener('click', async e => { const t = e.target && e.target.closest && e.target.closest('[data-tsedit],[data-tscopy],[data-tsopen]'); if (!t) return;
  if (t.dataset.tsopen != null) { setView('sheet'); window.scrollTo(0, 0); return; }
  if (t.dataset.tscopy != null) { toast((await copyText(exportPaste())) ? 'Team copied as text' : 'Copy failed: use Export on My Team'); return; }
  const i = +t.dataset.tsedit; setView('report'); requestAnimationFrame(() => { const b = document.querySelector(`[data-pane="report"] [data-chedit="${i}"]`); if (b) b.click(); }); });
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches('[data-tsedit]')) { e.preventDefault(); e.target.click(); } });
