// ---------- data health: say plainly when a source stops updating ----------
// Each data document carries its own date. Daily sources older than 2 days (op.gg 3) and the monthly ladder stats older
// than 45 days get a banner, so stale numbers are never shown as if they were fresh.
const HEALTH = [['doubles_tour', 'Tournament sets', 2], ['perf', 'Tournament win rates', 2], ['teams', 'Top teams', 2], ['events', 'Events', 2], ['model', 'Win model', 2], ['doubles_ingame', 'In-game rankings', 3], ['doubles', 'Showdown ladder stats', 45]];
function renderHealth() { const el = $('healthBar'); if (!el) return; const now = Date.now(), stale = [];
  for (const [k, label, days] of HEALTH) { const t = DATA_AT[k]; if (!t) continue; const age = Math.floor((now - t) / 864e5); if (age > days) stale.push(`${label} (${age} days old)`); }
  el.hidden = !stale.length;
  el.innerHTML = stale.length ? `<b>Data check:</b> ${stale.map(esc).join(', ')} ${stale.length > 1 ? 'have' : 'has'} not updated. The daily job may have failed; everything else is current.` : ''; }
