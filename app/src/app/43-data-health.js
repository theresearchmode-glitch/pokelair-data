// ---------- data health: say plainly when a source stops updating ----------
// Each data document carries its own date. A source past its usual age (the same limits as the daily job's health gate,
// health.mjs) gets a calm amber note on Home and the Meta pages (CSS shows #healthBar only there), naming it and the day it
// was last updated, so stale numbers are never shown as if they were fresh. A missing document is simply not listed.
const HEALTH = [['doubles_tour', 'Tournament sets', 2], ['perf', 'Tournament win rates', 2], ['teams', 'Top teams', 2], ['model', 'Win model', 2], ['events', 'Events', 3], ['doubles_ingame', 'In-game rankings', 3], ['practice', 'Team preview practice', 4], ['track', 'Ratings track record', 2], ['doubles', 'Showdown ladder stats', 45]];
const healthDay = t => { try { return new Date(t).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return ''; } };
function healthStale(now) { now = now || Date.now(); const out = []; const at = typeof DATA_AT === 'object' ? DATA_AT : {};
  for (const [k, label, days] of HEALTH) { const t = at[k]; if (!t) continue; const age = Math.floor((now - t) / 864e5); if (age > days) out.push({k, label, age, day: healthDay(t)}); }
  return out; }
function renderHealth() { try { renderReg(); } catch (e) {} const el = $('healthBar'); if (!el) return; const stale = healthStale();
  el.hidden = !stale.length;
  el.innerHTML = stale.length ? `<b>Some data is older than usual:</b> ${stale.map(x => `${esc(x.label)}, last updated ${esc(x.day)}`).join('; ')}.<span class="t2">Everything else is current.</span>` : ''; }
/* ---------- regulation banner (Nov 1) ----------
   meta/perf.reg (reg.mjs → perf.json): the regulation every number is built from, and a newer one being played. The data job
   never mixes two regulations; while a new one is short of data the page keeps the old numbers and says so calmly on Home
   and the Meta pages (CSS shows #regBar only there). PAGE_REG is the regulation this page's rules are built for. */
const PAGE_REG = 'M-C';
function regInfo() { const r = META.perf && META.perf.reg; if (!r || typeof r !== 'object' || !/^[A-Z]-[A-Z]$/.test(r.id)) return null;
  const day = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) ? String(d) : '', now = r.now && typeof r.now === 'object' && /^[A-Z]-[A-Z]$/.test(r.now.id) && r.now.id !== r.id && day(r.now.since) ? r.now : null;
  return {id: r.id, since: day(r.since), now: now ? {id: now.id, since: day(now.since), events: +now.events || 0, players: +now.players || 0, need: now.need && +now.need.events > 0 ? +now.need.events : null} : null}; }
const regDay = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}); } catch (e) { return d; } };
function renderReg() { const el = $('regBar'); if (!el) return; const r = regInfo(); let h = '';
  if (r && r.now) h = `<b>New regulation (Reg ${esc(r.now.id)}) started ${esc(regDay(r.now.since))}</b> — data is rebuilding; numbers below are from Reg ${esc(r.id)} until there's enough.`
    + `<span class="t2">${r.now.events ? `${r.now.events.toLocaleString('en-US')} Reg ${esc(r.now.id)} event${r.now.events === 1 ? '' : 's'} so far${r.now.need ? `, switches at ${r.now.need}` : ''}` : `Seen on the Showdown ladder; no Reg ${esc(r.now.id)} tournaments yet`}. The two are never mixed.</span>`;
  else if (r && r.id !== PAGE_REG) h = `<b>Numbers are from Reg ${esc(r.id)}</b>${r.since ? ` (started ${esc(regDay(r.since))})` : ''}.<span class="t2">Reg ${esc(PAGE_REG)} results are no longer counted. Anything new in Reg ${esc(r.id)} may be missing until NastyPlot is updated for it.</span>`;
  el.hidden = !h; el.innerHTML = h; }
