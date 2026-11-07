/* ---------- Design pass C (Nov 2): speed tiers as a race track, and the "wow" moments ---------- */

/* ===== Speed tiers as a race track =====
   The same rows as the list (spdLast from renderSpeed: likely Speed under the toggles), placed along a track: whoever moves
   first is on the left (the finish line), so under Trick Room the slowest lead. Your six run in their own blue lanes with
   their names; the top threats share the lanes below, neutral (they are not an opponent). Markers never overlap: the track
   widens until every one fits, and scrolls sideways inside its box when it is wider than the screen (signposted). The list
   stays one tap away ("List view"), and stays in the page (hidden) so nothing that reads it changes. */
let spdView = LS.get('cc2.sprv', 'track') === 'list' ? 'list' : 'track';
const NPR = {laneH: 66, headH: 22, axisH: 26, gap: 6, meMax: 2, thMax: 4};
NPR.ctx = null;
NPR.textW = (t, me) => { try { if (!NPR.ctx) NPR.ctx = document.createElement('canvas').getContext('2d');
    const ff = getComputedStyle(document.body).fontFamily || 'sans-serif'; NPR.ctx.font = `${me ? 800 : 700} 11.5px ${ff}`; return Math.ceil(NPR.ctx.measureText(t).width); } catch (e) { return t.length * 7; } };
/* greedy lanes: left to right, each marker goes in the first lane it fits; returns the lane count used */
NPR.lanes = (ms, max) => { const ends = []; for (const m of ms.slice().sort((a, b) => a.x - b.x)) { const l = m.x - m.w / 2; let k = ends.findIndex(e => e + NPR.gap <= l);
    if (k < 0) { if (ends.length >= max) return Infinity; k = ends.length; ends.push(0); } ends[k] = m.x + m.w / 2; m.lane = k; } return ends.length; };
function spdTrackHtml(rows, cw) {
  const vs = rows.map(r => r.v), lo = Math.min(...vs), hi = Math.max(...vs), tr = !!spdUi.tr;
  const ms = rows.map(r => { const nm = r.p.d || r.p.n; return {r, nm, w: Math.max(46, NPR.textW(nm, r.me) + (r.me ? 14 : 6))}; });
  const pad = Math.max(...ms.map(m => m.w)) / 2 + 22;
  /* turn order, left to right; the distance between two speeds grows with the gap (2.4px a point) but long gaps are shortened
     (44px at most), so one Choice Scarf user doesn't push everyone off screen. The ticks sit on the same scale. */
  const D = [...new Set(vs)].sort((a, b) => tr ? a - b : b - a), gapOf = (a, b) => Math.min(44, 6 + 2.4 * Math.abs(a - b));
  let X = new Map(), TW = 0, meL = 0, thL = 0, sc = 1;
  for (let it = 0; it < 40; it++) { X = new Map([[D[0], pad]]); for (let i = 1; i < D.length; i++) X.set(D[i], X.get(D[i - 1]) + gapOf(D[i], D[i - 1]) * sc);
    const last = X.get(D[D.length - 1]); if (last + pad < cw && last > pad) { const f = (cw - 2 * pad) / (last - pad); for (const [k, v] of X) X.set(k, pad + (v - pad) * f); }
    TW = Math.max(cw, Math.round(X.get(D[D.length - 1]) + pad));
    for (const m of ms) m.x = X.get(m.r.v);
    meL = NPR.lanes(ms.filter(m => m.r.me), NPR.meMax); thL = NPR.lanes(ms.filter(m => !m.r.me), NPR.thMax);
    if (meL !== Infinity && thL !== Infinity) break; sc *= 1.15; }
  if (meL === Infinity) meL = NPR.meMax; if (thL === Infinity) thL = NPR.thMax;
  meL = Math.max(1, meL); thL = Math.max(1, thL);
  const yMeHead = 0, yMe = NPR.headH, yThHead = yMe + meL * NPR.laneH, yTh = yThHead + NPR.headH, yAxis = yTh + thL * NPR.laneH, H = yAxis + NPR.axisH;
  /* axis ticks on round tens, placed between the speeds either side, at least 56px apart */
  const xAt = t => { if (D.length === 1) return X.get(D[0]); for (let i = 1; i < D.length; i++) { const a = D[i - 1], b = D[i]; if ((t - a) * (t - b) <= 0) return X.get(a) + (X.get(b) - X.get(a)) * (t - a) / (b - a); } return null; };
  let ticks = '', lastX = -1e9; for (let t = Math.ceil(lo / 10) * 10; t <= hi; t += 10) { const x = xAt(t); if (x == null || Math.abs(x - lastX) < 56) continue; ticks += `<span class="nprtick" style="left:${Math.round(x)}px">${t}</span>`; lastX = x; }
  const lane = (y, i, me) => `<div class="nprlane${me ? ' me' : ''} l${i % 4}" style="top:${y}px;height:${NPR.laneH}px"></div>`;
  let lanes = ''; for (let i = 0; i < meL; i++) lanes += lane(yMe + i * NPR.laneH, i, 1); for (let i = 0; i < thL; i++) lanes += lane(yTh + i * NPR.laneH, i, 0);
  const mk = m => { const r = m.r, y = (r.me ? yMe : yTh) + m.lane * NPR.laneH, nm = esc(m.nm);
    const note = `${r.v} Speed${r.me ? ' (yours)' : ''}: ${r.s.label}${r.s.scarf ? ', Choice Scarf' : ''}${r.wxUp ? `, ${r.ab} doubles it in this weather` : ''}${r.unb ? `, ${r.unb} after its item is used (Unburden)` : ''}`;
    return `<button type="button" class="nprm${r.me ? ' me' : ''}" data-lt="${esc(r.p.n)}" style="left:${Math.round(m.x)}px;top:${y}px" aria-label="${nm}, ${esc(note)}" title="${esc(note)}">${sprite(r.p, 'nprs') || ''}<b>${nm}</b><i>${r.v}</i></button>`; };
  const scroll = TW > cw + 4;
  return `<div class="nprace${scroll ? ' scrolls' : ''}">
    <p class="nprcap"><b>${tr ? 'Trick Room: the slowest moves first, so they lead.' : 'Fastest on the left.'}</b> Numbers are likely Speed at level 50; long gaps are shortened to fit. ${scroll ? '<span class="nprswipe">Swipe the track for the rest <span aria-hidden="true">→</span></span>' : ''}</p>
    <div class="nprscroll" tabindex="0" role="region" aria-label="Speed race track: ${rows.length} Pokémon in turn order, ${scroll ? 'scrolls sideways' : 'all shown'}"><div class="nprtrack" style="width:${TW}px;height:${H}px">
      ${lanes}<div class="nprfin" style="height:${yAxis}px" aria-hidden="true"></div>
      <div class="nprhead me" style="top:${yMeHead}px;height:${NPR.headH}px"><span>Your six</span></div>
      <div class="nprhead" style="top:${yThHead}px;height:${NPR.headH}px"><span>Top threats · ${rows.filter(r => !r.me).length} most used</span></div>
      ${ms.map(mk).join('')}
      <div class="npraxis" style="top:${yAxis}px;height:${NPR.axisH}px" aria-hidden="true">${ticks}</div>
    </div></div></div>`; }
CH.wrap('renderSpeed', () => { const el = $('spdOut'), list = el && el.querySelector('.spdlist'); if (!list || !spdLast || !spdLast.rows.length) return;
  const seg = `<div class="seg nprview" role="group" aria-label="Show speeds as"><button type="button" data-sprv="track" aria-pressed="${spdView === 'track'}">Race track</button><button type="button" data-sprv="list" aria-pressed="${spdView === 'list'}">List view</button></div>`;
  const cw = Math.round(el.clientWidth || (el.parentElement && el.parentElement.clientWidth) || 358);
  list.insertAdjacentHTML('beforebegin', seg + (spdView === 'track' ? spdTrackHtml(spdLast.rows, cw) : ''));
  list.hidden = spdView === 'track'; NPR.cw = cw;
  /* the hidden list keeps its rows (text) but not its pictures: otherwise the sprite-reuse observer (15-visual-helpers.js)
     hands the track's decoded pictures to the hidden list first and the track's reload, a flicker on every toggle */
  if (list.hidden) list.querySelectorAll('img.spr').forEach(i => i.remove()); });
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-sprv]'); if (!b) return; spdView = b.dataset.sprv === 'list' ? 'list' : 'track'; LS.set('cc2.sprv', spdView); renderSpeed(); });
/* the track is laid out in pixels: redraw when the speed page's width changes (rotate, resize) */
window.addEventListener('resize', () => { clearTimeout(NPR.rt); NPR.rt = setTimeout(() => { const el = $('spdOut'); if (!el || spdView !== 'track' || typeof view === 'undefined' || view !== 'speed') return;
  if (Math.abs((el.clientWidth || 0) - (NPR.cw || 0)) > 8) renderSpeed(); }, 200); });

/* ===== Wow moments =====
   S tier: a holographic foil (Extras A, 66-extras-a.js; it replaced the slow gold sheen) on the ratings hot list's top cards, the S row of the tier board and the info sheet's rating box
   (class nps; the foil is a hue-only blend under the text, so it never changes text contrast). The My team grade ring glows
   in the A colour when the letter is A (class npA), sparkles once when the grade goes up after a change (np-spark), and Fix
   it's Apply adds a popping "+N points ready" to its toast when it raised readiness. All motion is CSS, off with reduced motion. */
const npIsS = n => { try { const p = byName.get(n); return !!p && lTier(rating(p).total).k === 'S'; } catch (e) { return false; } };
CH.wrap('renderLair', () => { const sec = $('lair'); if (!sec) return;
  sec.querySelectorAll('#chHot .chhot[data-lt]').forEach(c => c.classList.toggle('nps', npIsS(c.dataset.lt)));
  sec.querySelectorAll('.ltier').forEach(t => { const b = t.querySelector('.ltl b'); t.classList.toggle('nps', !!b && b.textContent.trim() === 'S'); }); });
CH.wrap('lairSheet', n => { const sh = $('lairSheet'); if (!sh || sh.hidden) return; const r = sh.querySelector('.chlsr'); if (r) r.classList.toggle('nps', npIsS(n)); });
const NP_RANK = {A: 5, B: 4, C: 3, D: 2, F: 1, E: 1};
{ const gm = CH.gradeMotion; CH.gradeMotion = (head, G, RD) => { const prev = CH.npG; gm(head, G, RD);
    const ring = head.querySelector('.chring'); if (ring) ring.classList.toggle('npA', !!G && G.letter === 'A');
    const cur = G ? {L: G.letter, n: G.partial ? RD.score : G.s, part: !!G.partial, rec: !!G.rec} : null; CH.npG = cur;
    if (!ring || !cur || !prev || CH.reduced() || head.closest('[hidden]')) return;
    const up = (NP_RANK[cur.L] || 0) > (NP_RANK[prev.L] || 0) || (cur.L === prev.L && cur.part === prev.part && cur.rec === prev.rec && cur.n > prev.n);
    if (!up) return; ring.classList.remove('np-spark'); void ring.offsetWidth; ring.classList.add('np-spark');
    setTimeout(() => ring.classList.remove('np-spark'), 700); }; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-plan]'); if (!b) return;
  let before = null; try { const ms = members(); before = ms.length === 6 ? gradeTeam(ms) : null; } catch (x) {}
  if (before == null) return;
  setTimeout(() => { let after = null; try { const ms = members(); after = ms.length === 6 ? gradeTeam(ms) : null; } catch (x) {}
    const t = $('toast'); if (after == null || after === before || !t || t.hidden || t.querySelector('.npgain')) return;
    const u = t.querySelector('.tundo'), s = document.createElement('span'); s.className = 'npgain'; s.textContent = `Grade ${before} → ${after}`;
    if (u) u.before(s); else t.append(s); }, 80); }, true);
