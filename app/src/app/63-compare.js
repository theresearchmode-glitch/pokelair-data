/* ---------- Compare two teams side by side (Nov) ----------
   Any two of: My team, a saved team, a winning tournament team, or a pasted Showdown team. Each side is worked out with the
   same functions the Team page uses (members via teamRating, readiness via prepOf, the 7 checks via proChecks, the letter
   via CH.gradeOf / CH.gradeWhy), on a copy of the slots: S.slots is never touched, so nothing re-renders or saves.
   Results are cached per team and data version, and worked out a frame after the tap so the page answers at once.
   Rows show what differs first; rows that are the same on both sides fold away. Facts only, no head-to-head prediction. */
/* CX, cxSheetSlots, cxResolve, cxKey, cxInfo and cxFacts live in 62-compare-data.js (shared with the new build, R4 Nov 11) */
/* open the page: sides as source strings ('' = pick one) */
function cxGo(a, b) { if (a === 'cur' && !members().length) { a = b; b = ''; }
  ui.cx.A = a || null; ui.cx.B = b || null; ui.cx.pick = !ui.cx.A ? 'A' : !ui.cx.B ? 'B' : null; ui.cx.same = false;
  if (view !== 'compare') setView('compare'); else renderCompare(); }
const cxBadge = s => `<span class="cxbadge ${s === 'A' ? 'a' : 'b'}" aria-hidden="true">${s}</span>`;
const cxDn = n => (byName.get(n) || {}).d || n;
/* the picker: where a side can come from */
function cxPicker(side) { const other = ui.cx[side === 'A' ? 'B' : 'A'];
  const opt = (src, title, sub, sprites) => `<button type="button" class="cxopt${other === src ? ' dim' : ''}" data-cxset="${side}|${esc(src)}"><span class="cxot"><b>${esc(title)}</b>${sub ? `<span class="t2">${esc(sub)}</span>` : ''}</span><span class="cxos">${sprites}</span></button>`;
  const spr = names => names.map(n => sprite(byName.get(n), 'tiny') || '').join('');
  const mine = members(), parts = [];
  if (mine.length) parts.push(`<div class="chk">My team</div>${opt('cur', teamTitleFor(mine), 'Open now', spr(mine.map(m => m.p.n)))}`);
  const sv = S.teams.filter(t => t.format !== 'singles');
  if (sv.length) parts.push(`<div class="chk">Saved teams</div>${sv.map(t => opt('s:' + t.id, t.name, '', spr(teamRating(t.slots).ms.map(m => m.p.n)))).join('')}`);
  { const pool = typeof tsPool === 'function' ? tsPool().filter(x => x.t.place === 1) : [], cap = 6 + ui.cx.wmore * 10;
    if (pool.length) parts.push(`<div class="chk">Winning teams · event winners, newest first</div>${pool.slice(0, cap).map(x => opt('e:' + x.key, 'Champion', `Won ${x.ev.name} · ${evDate(x.ev.date)}`, spr(x.t.mons.map(m => m.n)))).join('')}${pool.length > cap ? `<button type="button" class="chghost cxmore" data-cxwmore="1">Show ${Math.min(10, pool.length - cap)} more winners</button>` : ''}<p class="t2">Any other tournament team: tap Compare on its card in Winning teams.</p>`); }
  parts.push(`<div class="chk">Paste a Showdown team</div><textarea class="field paste cxpaste" id="cxPaste" rows="5" placeholder="Paste a team from Showdown, Pokémon Zone, Pikalytics or Victory Road" aria-label="Showdown team text"></textarea><div class="row"><button type="button" class="chghost" data-cxpaste="${side}">Use this team</button></div><div class="t2" id="cxPasteNote" aria-live="polite"></div>`);
  return `<div class="cxpick" id="cxPick"><div class="cxpickh">${cxBadge(side)}<b>Pick team ${side}</b>${ui.cx[side] ? `<button type="button" class="linkbtn" data-cxpickx="1">Cancel</button>` : ''}</div>${parts.join('')}</div>`; }
/* one side's header card */
function cxHead(side, R, I) {
  if (!R) return `<button type="button" class="cxhead empty ${side === 'A' ? 'a' : 'b'}" data-cxpick="${side}">${cxBadge(side)}<span class="cxnm">Pick team ${side}</span><span class="t2">My team, saved, winning or pasted</span></button>`;
  const ms = I ? I.ms : teamRating(R.slots).ms;
  return `<div class="cxhead ${side === 'A' ? 'a' : 'b'}">${cxBadge(side)}<div class="cxnm">${esc(R.name)}</div><div class="t2 cxsub">${esc(R.sub || '')}</div>
    <div class="cxsix">${ms.map(m => `<span title="${esc(m.d)}">${sprite(m.p) || esc(m.d)}</span>`).join('')}${Array.from({length: Math.max(0, 6 - ms.length)}, () => '<span class="cxe" aria-hidden="true"></span>').join('')}</div>
    <button type="button" class="linkbtn cxchg" data-cxpick="${side}" aria-label="Change team ${side}">Change</button></div>`; }
/* today's cells for each row of cxFacts (unchanged HTML) */
const CXF = {
  grade: G => G ? `<span class="cxgr" style="color:${CH.gcol(G.letter)}">${G.v === 2 ? Math.round(G.s) : G.letter}</span><span class="cxgs">${CH.gradeNum(G)} · ${esc(CH.recLine(G, true))}</span>` : '<span class="t2">Add Pokémon first</span>',
  ready: v => v ? `<span class="cxl"><b>${CH.readyN(v.RD)}</b> ready for top threats</span><span class="cxl dbhand">${hRing(CH.hand(v.RD), 24)}${CH.handTxt(v.RD, true)}</span><span class="t2 cxl">${v.lv[1]} shaky · ${v.lv[0]} with no answer</span>` : '—',
  thr: L => L.length ? `<div class="cxthr">${L.slice(0, 5).map(r => `<span>${sprite(byName.get(r.t.n), 'tiny') || ''}${esc(r.t.d)}</span>`).join('')}${L.length > 5 ? `<span class="t2">+${L.length - 5} more</span>` : ''}</div>` : '<span class="t2">None</span>',
  ck: v => v == null ? '<span class="cxck un" title="Not counted">?</span>' : v ? '<span class="cxck ok" aria-label="Yes">✓</span>' : '<span class="cxck no" aria-label="No">✗</span>',
  /* Nov 2: each speed in plain terms too, against the top 30 threats (outspeedOf, the Speed tiers page's count) */
  spd: v => { if (!v) return '—'; const osT = x => { const r = typeof outspeedOf === 'function' ? outspeedOf(x.v, v.wxS || '', {}) : null; return r ? `<span class="t2 cxl">outspeeds ${r.pct}% of the top ${r.n}</span>` : ''; }, f = v.spd[0], l = v.spd[v.spd.length - 1];
    return `<span class="cxl">Fastest <b>${esc(f.m.d)}</b> ${f.v}</span>${osT(f)}<span class="cxl">Slowest <b>${esc(l.m.d)}</b> ${l.v}</span>${osT(l)}`; },
  sc: s => s.txt.length ? s.txt.map(x => `<span class="cxl">${esc(x)}</span>`).join('') : '<span class="t2">Neither</span>',
  field: L => L.length ? L.map(x => `<span class="cxl"><b>${esc(x.name)}</b>${x.active ? '' : ' <span class="t2">(nothing uses it)</span>'}</span>`).join('') : '<span class="t2">None</span>',
  weak: L => L.length ? `<span class="cxty">${L.slice(0, 4).map(t => chip(t)).join('')}${L.length > 4 ? `<span class="t2">+${L.length - 4}</span>` : ''}</span>` : '<span class="t2">No type hits 2+ more than resist</span>',
  unres: L => L.length ? `<span class="cxty">${L.slice(0, 4).map(t => chip(t)).join('')}${L.length > 4 ? `<span class="t2">+${L.length - 4}</span>` : ''}</span>` : '<span class="t2">Every type is resisted</span>',
  off: n => n != null ? `<span class="cxl"><b>${n}</b> of 18</span>` : '—',
  arch: v => v ? `<span class="archchips">${archChips(v.label)}</span>` : '—',
  mine: I => I && I.n ? `<span class="cxl"><b>${I.w}–${I.l}</b></span><span class="t2 cxl">${I.n} game${I.n === 1 ? '' : 's'} you logged</span>` : '<span class="t2">None logged</span>'};
function cxRows(RA, RB, a, b) { return cxFacts(a, b).map(r => { const f = CXF[r.k.startsWith('ck:') ? 'ck' : r.k]; return {k: r.k, label: r.label, x: f(r.a), y: f(r.b), diff: r.diff, say: r.say}; }); }
function renderCompare() { const el = $('cxOut'); if (!el) return; const sec = $('compare'); try { CH.pagehead(sec, 'Compare · two teams side by side', 'Compare teams', ''); } catch (e) {}
  const RA = cxResolve(ui.cx.A), RB = cxResolve(ui.cx.B); if (!RA) ui.cx.A = null; if (!RB) ui.cx.B = null;
  if (!ui.cx.pick && (!RA || !RB)) ui.cx.pick = !RA ? 'A' : 'B';
  const IA = RA && CX.cache.get(cxKey(RA.slots)), IB = RB && CX.cache.get(cxKey(RB.slots));
  const heads = `<div class="cxheads">${cxHead('A', RA, IA)}${cxHead('B', RB, IB)}</div>${RA && RB ? '<div class="cxswap"><button type="button" class="linkbtn" data-cxswap="1">Swap A and B</button></div>' : ''}`;
  const pick = ui.cx.pick ? cxPicker(ui.cx.pick) : '';
  if (!RA || !RB) { el.innerHTML = heads + pick; return; }
  /* work out what isn't cached yet a frame later, one side at a time, so the tap answers at once */
  if (!IA || !IB) { el.innerHTML = heads + pick + '<div class="empty-note abbusy cxbusy" role="status"><span class="abspin" aria-hidden="true"></span>Working out both teams: grade, threats, checks and speed…</div>';
    if (!CX.busy) { CX.busy = true; const step = () => requestAnimationFrame(() => setTimeout(() => { try { const R = [cxResolve(ui.cx.A), cxResolve(ui.cx.B)].find(r => r && !CX.cache.has(cxKey(r.slots))); if (R) { cxInfo(R.slots); step(); return; } } catch (e) {} CX.busy = false; if (view === 'compare') renderCompare(); }, 0)); step(); }
    return; }
  const rows = cxRows(RA, RB, IA, IB), diff = rows.filter(r => r.diff), same = rows.filter(r => !r.diff), says = ['thr', 'sc', 'field', 'grade', 'ready', 'weak'].map(k => (rows.find(r => r.k === k) || {}).say).concat(rows.filter(r => r.k.startsWith('ck:')).map(r => r.say)).filter(Boolean);
  const row = r => `<div class="cxrow${r.diff ? ' diff' : ''}"><div class="cxlab">${esc(r.label)}</div><div class="cxc a">${r.x}</div><div class="cxc b">${r.y}</div></div>`;
  const why = IA.G || IB.G ? `<details class="cxwhy"><summary>Why these grades</summary>${[['A', IA], ['B', IB]].map(([s, I]) => I.G ? `<div class="cxwhyi">${cxBadge(s)}${CH.gradeWhy(I.G).replace(' id="chGwhy"', '')}</div>` : '').join('')}<p class="t2">${esc(CH.LEGEND)}</p></details>` : '';
  el.innerHTML = heads + pick
    + (says.length ? `<div class="cxsum"><div class="chk">What's different</div><ul>${says.slice(0, 6).map(s => `<li>${esc(s).replace(/Team A/g, '<span class="cxtm a">Team A</span>').replace(/Team B/g, '<span class="cxtm b">Team B</span>')}</li>`).join('')}</ul></div>` : `<div class="cxsum"><div class="chk">What's different</div><p class="t2">These two line up the same on every row below.</p></div>`)
    + `<div class="cxgrid">${diff.map(row).join('')}</div>${why}`
    + (same.length ? `<details class="cxsame"${ui.cx.same ? ' open' : ''}><summary>Same on both <span class="t2">${same.length} row${same.length === 1 ? '' : 's'}</span></summary><div class="cxgrid">${same.map(row).join('')}</div></details>` : '')
    + `<p class="t2 cxfoot">Grades and readiness are the same as on My team: preparation for the top 30 threats, not a prediction. Speeds are the likely stat (your spread, or the most common one), in each team's own weather.</p>`; }
document.addEventListener('toggle', e => { const d = e.target; if (d && d.classList && d.classList.contains('cxsame')) ui.cx.same = d.open; }, true);
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-cxgo],[data-cxset],[data-cxpick],[data-cxpickx],[data-cxswap],[data-cxpaste],[data-cxwmore]'); if (!b) return; const d = b.dataset;
  if (d.cxgo != null) { const [a, c] = d.cxgo.split('|'); cxGo(a, c); return; }
  if (d.cxset) { const i = d.cxset.indexOf('|'), side = d.cxset.slice(0, i); ui.cx[side] = d.cxset.slice(i + 1); ui.cx.pick = !ui.cx.A ? 'A' : !ui.cx.B ? 'B' : null; ui.cx.wmore = 0; renderCompare(); try { $('cxOut').scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (er) {} return; }
  if (d.cxpick) { ui.cx.pick = ui.cx.pick === d.cxpick ? null : d.cxpick; renderCompare(); const p = $('cxPick'); if (p && p.scrollIntoView) p.scrollIntoView({block: 'nearest', behavior: 'smooth'}); return; }
  if (d.cxpickx) { ui.cx.pick = null; renderCompare(); return; }
  if (d.cxwmore) { ui.cx.wmore++; keepScroll(() => renderCompare()); return; }
  if (d.cxswap) { const t = ui.cx.A; ui.cx.A = ui.cx.B; ui.cx.B = t; const p = ui.cx.paste; if (p.A || p.B) { ui.cx.paste = {A: p.B, B: p.A}; if (ui.cx.A === 'p:B') ui.cx.A = 'p:A'; if (ui.cx.B === 'p:A') ui.cx.B = 'p:B'; } renderCompare(); return; }
  if (d.cxpaste) { const side = d.cxpaste, ta = $('cxPaste'), note = $('cxPasteNote'); let r = null; try { r = parsePaste(ta ? ta.value : ''); } catch (er) {}
    if (!r || !r.slots.length) { if (note) note.textContent = 'No Pokémon found in that text. Paste the team as Showdown exports it.'; return; }
    ui.cx.paste[side] = normSlots(r.slots); ui.cx[side] = 'p:' + side; ui.cx.pick = !ui.cx.A ? 'A' : !ui.cx.B ? 'B' : null; renderCompare(); if (r.notes.length) toast(r.notes[0]); } });
