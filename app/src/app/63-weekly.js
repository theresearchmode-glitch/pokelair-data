/* ---------- This week (Nov): what changed in the last 7 days of tournament teams vs the 7 before ----------
   meta/weekly (out/weekly.json from weekly.mjs). The pipeline decides what counts as a change (enough teams, a big enough
   gap, 3+ standard errors, and it survives dropping the one event that pushes it most); the page only shows it, always
   with the counts it's based on. Winners come from meta/events for the same seven days. */
// cleanWeekly: moved to 05-data-clean.js (R4, Nov 11; shared with the rebuild)
// WK, KIND, KIND_OF, kindIcon, kindTag, wkDelta and the share image (buildWeeklyCard): moved to 63-weekly-data.js (Nov 15; shared with the rebuild)
function renderWeekly() {
  const el = $('wkOut'); if (!el) return; const W = META.weekly;
  if (!W) { el.innerHTML = '<div class="empty-note">This week\'s changes appear after the next data refresh.</div>'; return; }
  const A = W.a, B = W.b, nA = A.n, nB = B.n, T = W.th;
  /* round words: the two weeks as labelled number cells (dates once, in the line above them) instead of one long sentence */
  const wc = (v, l) => `<span class="wdc"><b>${v}</b><small>${l}</small></span>`;
  const sub = `<div class="wdl">Tournament teams, ${WK.range(A)} against ${WK.range(B)}</div><div class="wdrow wdin" role="group" aria-label="This week, ${WK.range(A)}"><span class="wdl">This week</span>${wc(CH.n(nA), 'teams')}${wc(A.ev, 'events')}</div><div class="wdrow wdin" role="group" aria-label="The week before, ${WK.range(B)}"><span class="wdl">Week before</span>${wc(CH.n(nB), 'teams')}${wc(B.ev, 'events')}</div>`;
  const tq = (k, t, b) => typeof tipText === 'function' ? ' ' + tipText(k, t, b) : '';
  const monRow = (r, up) => { const d = wkDelta(r.xa, nA, r.xb, nB);
    return `<button type="button" class="wkrow tyacc" style="${tyv(r.p)}" data-lt="${esc(r.p.n)}" aria-label="${esc(r.p.d)}: ${up ? 'up' : 'down'} ${d} points, ${WK.pc1(r.xb, nB)}% to ${WK.pc1(r.xa, nA)}% of teams">${sprite(r.p, 'wkspr') || ''}<span class="wkn"><b>${esc(r.p.d)}</b><span>${WK.pc1(r.xb, nB)}% → <b>${WK.pc1(r.xa, nA)}%</b> of teams</span></span><span class="wkar ${up ? 'up' : 'dn'}">${up ? '▲' : '▼'}${d}<small> points</small></span></button>`; };
  const none = t => `<p class="wknone">${t}</p>`;
  const moves = W.enough ? `<div class="wkcols"><div><h4 class="wkh up">Rising</h4>${W.up.slice(0, 4).map(r => monRow(r, true)).join('') || none('No Pokémon rose enough to call it a trend.')}</div>
      <div><h4 class="wkh dn">Falling</h4>${W.down.slice(0, 4).map(r => monRow(r, false)).join('') || none('No Pokémon dropped enough to call it a trend.')}</div></div>`
    : none(`Not enough teams to compare this week (each week needs ${W.th.teams}+).`);
  /* most used this week: context only, no arrows (a small change here is not a trend) */
  const top = W.top.length ? `<div class="wktop" aria-label="Most used this week">${W.top.slice(0, 5).map(r => `<button type="button" class="wktm tyacc" style="${tyv(r.p)}" data-lt="${esc(r.p.n)}" aria-label="${esc(r.p.d)}: ${WK.pc1(r.xa, nA)}% of teams this week">${sprite(r.p, 'wkspr') || ''}<b>${WK.pc1(r.xa, nA)}%</b><span>${esc(r.p.d)}</span></button>`).join('')}</div>
    <p class="t2 wkcap">Most used this week, % of teams.</p>` : '';
  const techRow = t => `<button type="button" class="wkrow wktech tyacc" style="${tyv(t.p)}" data-lt="${esc(t.p.n)}" data-kind="${t.k}" aria-label="${KIND[t.k].w}: ${esc(t.o)}, on ${esc(t.p.d)}: up ${wkDelta(t.xa, t.ma, t.xb, t.mb)} points, ${WK.pc1(t.xb, t.mb)}% to ${WK.pc1(t.xa, t.ma)}% of ${esc(t.p.d)} teams">${sprite(t.p, 'wkspr') || ''}<span class="wkn">${kindTag(t.k)}<b><span class="kdopt kd-${t.k}">${esc(t.o)}</span> <i>${esc(t.p.d)}</i></b><span>${WK.pc1(t.xb, t.mb)}% → <b>${WK.pc1(t.xa, t.ma)}%</b> of its teams<span class="dbsec"> (${CH.n(t.ma)} ${esc(t.p.d)} teams this week, ${CH.n(t.mb)} the week before)</span></span></span><span class="wkar up">▲${wkDelta(t.xa, t.ma, t.xb, t.mb)}<small> points</small></span></button>`;
  const tech = W.enough ? (W.tech.slice(0, 4).map(techRow).join('') || none('No item, move or ability jumped enough on any Pokémon this week.')) : none('Needs more teams this week.');
  const upS = new Set(W.sty.up.map(s => s.k)), dnS = new Set(W.sty.down.map(s => s.k));
  const sN = W.styAll.length, sD = sN % 4 === 0 ? 4 : sN % 3 === 0 ? 3 : sN % 5 === 0 ? 5 : 4, sM = sN % 3 === 0 ? 3 : sN % 5 === 0 ? 5 : sN % 4 === 0 ? 4 : 3;
  const styles = sN ? `<div class="wkstyles" style="--wkd:${sD};--wkm:${sM}">${W.styAll.map(s => { const c = upS.has(s.k) ? 'up' : dnS.has(s.k) ? 'dn' : '';
      return `<span class="wkst ${c}"><b>${esc(WK.styName(s.k))}</b> ${WK.pc1(s.xa, nA)}%${c ? ` <i>${c === 'up' ? '▲ up' : '▼ down'} ${wkDelta(s.xa, nA, s.xb, nB)} points from ${WK.pc1(s.xb, nB)}%</i>` : ''}</span>`; }).join('')}</div>
    <p class="t2 wkcap wdsub">% of teams using each style${tq('wksty', 'What the team styles count', '% of teams with a Trick Room or Tailwind user, or a weather or terrain setter. Arrows only on real changes.')}</p>` : '';
  const ws = WK.winners(W);
  const winners = ws.length ? ws.map(e => { const w = e.top[0];
    return `<button type="button" class="wkev" data-wkev="${esc(e.id)}"><span class="wkevt"><b>${esc(e.name)}</b>${e.src === 'official' ? '<span class="tag evoff">OFFICIAL</span>' : ''}</span>
      <span class="t2">${evDate(e.date)} · ${CH.n(e.players)} players</span><span class="wksix">${w.mons.map(m => sprH(byName.get(m.n), 'wkspr')).join('')}</span></button>`; }).join('')
    : none(META.events ? 'No official event or 64+ player event finished this week.' : 'Event results appear after the next data refresh.');
  const fresh = W.fresh.length ? `<div class="wkfresh">${W.fresh.slice(0, 4).map(f => `<button type="button" class="wkfr tyacc" style="${tyv(f.p)}" data-lt="${esc(f.p.n)}">${sprite(f.p, 'wkspr') || ''}<span><b>${f.kind === 's' ? esc(f.i) + ' ' : ''}${esc(f.p.d)}</b><span>#${f.pl} · ${esc(f.ev)}${f.players ? ` · ${CH.n(f.players)} players` : ''}</span></span></button>`).join('')}</div>`
    : none('Nothing new reached a top 8 this week.');
  el.innerHTML = `<div class="wkhead"><div class="chpgs wdstats" aria-label="Tournament teams this week and the week before">${sub}</div><button type="button" class="chprimary wkshare" id="wkShare">Share this week <span aria-hidden="true">➜</span></button></div>
    <section class="wkcard"><h3 class="wkt">Pokémon on the move</h3>${moves}${top}</section>
    <section class="wkcard"${dbAttr('wktech')}><div class="dbhd"><h3 class="wkt">New tech</h3>${dbBtn('wktech', 'team counts')}</div><p class="t2 wkcap wdsub">Rising items, moves and abilities, per Pokémon${tq('wktech', 'What counts as new tech', `An item, move or ability that jumped on one Pokémon (${T.monTeams}+ of its teams each week). Each row names its kind: Move (slash icon, teal), Item (tag icon, amber) or Ability (spark icon, violet).`)}</p>${tech}</section>
    <section class="wkcard"><h3 class="wkt">Winners this week</h3>${winners}</section>
    <section class="wkcard"><h3 class="wkt">Team styles</h3>${styles || none('No style data this week.')}</section>
    <section class="wkcard"><h3 class="wkt">New in top cut</h3><p class="t2 wkcap wdsub">First top ${T.cut} this regulation${tq('wkfresh', 'What counts as new in top cut', `First time in a top ${T.cut} this regulation (online tournaments with ${T.cutPlayers}+ players and official events).`)}</p>${fresh}</section>
    <details class="wkfoot"><summary>How we decide what changed</summary><p>We compare the share of full teams at standard Reg M-C tournaments on Limitless (whole fields; themed and restricted cups left out) in the last 7 days against the 7 days before. A change is shown only when: each week has ${T.teams}+ teams; it moved at least ${T.pts} points (${T.techPts} for an item, move or ability, counted among that Pokémon's own teams, with ${T.monTeams}+ of them each week and ${T.techMin}+ using it); a two-proportion test puts it ${T.z}+ standard errors from no change; and it still holds with the single event that pushes it most left out, so one big event can't make a trend. Everything else is treated as noise.${W.updated ? ` Updated ${WK.d(W.updated.slice(0, 10))}.` : ''}</p></details>`;
}
CH.wrap('renderWeekly', () => CH.pagehead($('weekly'), 'Meta · last 7 days', 'This week', ''));
CH.wrap('setView', v => { if (v === 'weekly') safe('weekly', renderWeekly); });
CH.wrap('render', () => { if (typeof view !== 'undefined' && view === 'weekly') safe('weekly', renderWeekly); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wkev],#wkShare,[data-view="weekly"]'); if (!b) return;
  if (b.id === 'wkShare') { SHARE_KIND = {build: buildWeeklyCard, file: 'This week in Reg M-C - NastyPlot.png', alt: 'This week in Reg M-C as a NastyPlot share card', empty: 'Nothing to share yet'}; openShareCard(); return; }
  if (b.dataset.wkev) { evUi.open = b.dataset.wkev; setView('events'); return; } });

// CAL (the calendar helpers): moved to 63-calendar-data.js (Nov 14; shared with the rebuild)
let calUi = {all: false};
function calendarHTML() { const C = META.calendar;
  if (!C) return '<div class="calbox"><h3 class="wkt">Next events</h3><p class="wknone">The event calendar appears after the next data refresh.</p></div>';
  const t = CAL.today(), next = C.ev.filter(e => e.e >= t && e.t !== 'national'), past = C.ev.filter(e => e.e < t && ['regional', 'sc', 'international', 'worlds'].includes(e.t)).slice(-3).reverse();
  const shown = calUi.all ? next : next.slice(0, 4), age = C.checked ? CAL.days(t, C.checked) : 0;
  const row = e => { const [k, w] = CAL.when(e), d = new Date(e.s + 'T12:00:00'), place = e.t === 'online' ? '' : [e.city !== e.n ? e.city : '', CAL.country(e.cc)].filter(Boolean).join(', ');
    const inner = `<div class="calday" aria-hidden="true"><b>${d.getDate()}</b><span>${d.toLocaleDateString('en-US', {month: 'short'})}</span></div>
      <div class="calmain"><b>${esc(e.n)}</b><span>${esc(CAL.range(e))}${place ? ' · ' + esc(place) : ''}${e.n.toLowerCase().includes(CAL.type[e.t].toLowerCase()) ? '' : ` · <i class="caltype">${CAL.type[e.t]}</i>`}</span></div><span class="calcd ${k}">${w}</span>`;
    return e.url ? `<a class="calrow ${e.t}" href="${esc(e.url)}" target="_blank" rel="noopener" aria-label="${esc(e.n)}, ${esc(CAL.range(e))}, ${w}: details (opens a new tab)">${inner}</a>` : `<div class="calrow ${e.t}">${inner}</div>`; };
  const pastH = past.length ? `<div class="calpast"><span class="t2">Recent:</span>${past.map(e => { const r = CAL.results(e); return r ? `<button type="button" class="linkbtn" data-evopen="${esc(r.id)}">${esc(e.n)} results ›</button>` : `<span class="t2">${esc(e.n)} · results not in yet</span>`; }).join('')}</div>` : '';
  return `<div class="calbox"><div class="calhd"><h3 class="wkt">Next events</h3><span class="t2">${next.length} on the calendar</span></div>
    ${shown.map(row).join('') || '<p class="wknone">No upcoming events listed right now.</p>'}
    ${next.length > 4 ? `<button type="button" class="linkbtn calmore" data-calall="1" aria-expanded="${calUi.all}">${calUi.all ? 'Show fewer' : `Show all ${next.length}`}</button>` : ''}
    ${pastH}<p class="t2 calsrc wdsub">From <a href="${esc(C.src.url || 'https://victoryroad.pro/')}" target="_blank" rel="noopener">${esc(C.src.name)}</a>${C.checked ? `, checked ${WK.d(C.checked)}${age > 2 ? ` (${age} days ago)` : ''}` : ''}${typeof tipText === 'function' ? ' ' + tipText('caldates', 'How event dates work', "VGC days, in each event's local dates.") : ''}</p></div>`; }
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
    <span class="wkteb">${bits.map(([r, k]) => `<span class="wkst ${k}">${sprite(r.p, 'wkspr') || ''}<b>${esc(r.p.d)}</b> <i>${k === 'up' ? '▲' : '▼'}${wkDelta(r.xa, nA, r.xb, nB)} points</i></span>`).join('')}${t0 ? `<span class="wkst up">${sprite(t0.p, 'wkspr') || ''}${kindTag(t0.k)}<b>${esc(t0.o)} ${esc(t0.p.d)}</b> <i>▲${wkDelta(t0.xa, t0.ma, t0.xb, t0.mb)} points</i></span>` : ''}</span>
    <span class="linkbtn">What changed ›</span></button>`; }
function homeNextChip() { const C = META.calendar; if (!C) return ''; const t = CAL.today(), e = C.ev.find(x => x.e >= t && x.t !== 'national' && x.t !== 'online'); if (!e) return ''; const [k, w] = CAL.when(e);
  return `<button type="button" class="calchip" data-view="events"><span class="chk">Next event</span><b>${esc(e.n)}</b><span class="calcd ${k}">${w}</span></button>`; }
CH.wrap('renderHome', () => { if (!WK_HOME.teaser && !WK_HOME.chip) return; const o = $('homeOut'); if (!o || o.querySelector('.wkhome')) return;
  const h = (WK_HOME.chip ? homeNextChip() : '') + (WK_HOME.teaser ? homeWeekTeaser() : ''); if (!h) return;
  const at = o.querySelector('.chmcard.them') || o.querySelector('.chmhero'); const d = document.createElement('div'); d.className = 'wkhome'; d.innerHTML = h; if (at) at.after(d); else o.prepend(d); });
