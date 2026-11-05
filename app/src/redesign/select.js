// ---------- NastyPlot Redesign: Light touch Character Select (Sim, Nov 4) ----------
// Redesign build only (parts-redesign.json). Every number comes from the app's own data and functions (U, ratings, members,
// CH.four, CH.metaSix, CH.gradeOf, prepOf, homeSide, homeTrends, HOME_TILES); nothing is invented. Clicks reuse the app's
// own handlers: data-lt opens the Pokémon sheet, data-view switches page, data-evload loads an event team.
const RD = {sel: null};
/* logo: italic caps wordmark with the magenta skew mark */
/* feet on the floor: measure each sprite's empty rows at the bottom once (same-origin canvas), then shift it down by that much */
RD.pad = new Map();
RD.measure = img => { const src = img.getAttribute('src'); if (!src) return; if (RD.pad.has(src)) { img.style.setProperty('--pad', RD.pad.get(src)); return; }
  const go = () => { try { const n = 64, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(img, 0, 0, n, n);
      const d = x.getImageData(0, 0, n, n).data; let low = 0; for (let y = n - 1; y >= 0 && !low; y--) for (let i = 0; i < n; i++) if (d[(y * n + i) * 4 + 3] > 24) { low = y + 1; break; }
      const pad = low ? ((n - low) / n).toFixed(3) : '0'; RD.pad.set(src, pad); img.style.setProperty('--pad', pad); } catch (e) { RD.pad.set(src, '0'); } };
  if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, {once: true}); };
RD.feet = root => { try { (root || document).querySelectorAll('img.rdspr').forEach(RD.measure); } catch (e) {} };
RD.spr = (p, cls) => { const s = sprite(p, cls || ''); return s ? s.replace('<img ', '<img class="rdspr" ').replace(/class="rdspr" class="/, 'class="rdspr ') : ''; };
RD.glyph = t => typeof ticon === 'function' ? ticon(t, 'tic') : '';
RD.chips = p => (p.t || []).map(t => `<span class="ty" style="--tc:${TC[t]}">${RD.glyph(t)}${esc(t)}</span>`).join('');
RD.ta = p => `--ta:${TC[p.t[0]]};--tb:${TC[p.t[1] || p.t[0]]}`;
RD.spd = p => Math.floor(Math.floor(((2 * (p.sp || 0) + 31 + 63) * 50) / 100 + 5) * 1.1);
RD.top = n => { const seen = new Set(), out = []; for (const p of ROSTER.slice().sort((a, b) => U(b) - U(a))) { if (!(U(p) > 0) || seen.has(p.b)) continue; seen.add(p.b); out.push(p); if (out.length === n) break; } return out; };
RD.rate = p => { try { const r = ratings().get(p.n); return r ? r.total : null; } catch (e) { return null; } };
RD.selHtml = p => { if (!p) return ''; const r = RD.rate(p), u = U(p), sp = RD.spd(p), mine = members().some(m => m.p.n === p.n);
  return `<div class="rdport" style="${RD.ta(p)}"><span class="ghost" aria-hidden="true">${esc(p.d)}</span><span class="rdp1">P1</span>${RD.spr(p)}</div>
    <div class="rdselname"><b>${esc(p.d)}</b><span class="rdchips">${RD.chips(p)}</span></div>
    <div class="rdbars"><span>usage</span><span class="rdbar a"><i style="width:${Math.min(100, u / 50 * 100)}%"></i></span><output>${u.toFixed(1)}%</output>
      ${r != null ? `<span>rating</span><span class="rdbar"><i style="width:${Math.max(0, Math.min(100, r))}%"></i></span><output>${RS(r)}</output>` : ''}
      <span>speed</span><span class="rdbar"><i style="width:${Math.min(100, sp / 220 * 100)}%"></i></span><output>${sp}</output></div>
    <p class="rdk">${mine ? 'on your team · ' : ''}speed at level 50 with a +speed nature and 252 EVs (base ${p.sp || '?'})</p>
    <div class="rdselfoot"><button type="button" class="rdbtn p" data-lt="${esc(p.n)}">Full info</button><button type="button" class="rdbtn" data-abaround="${esc(p.n)}">Build around it</button></div>`; };
function rdHome() { const el = $('homeOut'); if (!el) return; const pane = document.querySelector('[data-pane="home"]'); if (pane && pane.hidden && el.innerHTML) return;
  el.classList.remove('chhome'); el.classList.add('rdhome');
  const ms = members(), v = ui.vsum || {}, nTeams = (RES && RES.teams) || 0, roster = RD.top(15), six = roster.slice(0, 6), F = CH.four(ms);
  const RDd = ms.length ? prepOf(ms) : null; let G = null; try { G = RDd ? CH.gradeOf(RDd, v.CK, ms) : null; } catch (e) {}
  if (!RD.sel || !roster.some(p => p.n === RD.sel)) RD.sel = roster[0] && roster[0].n;
  const selP = byName.get(RD.sel), mineSet = new Set(ms.map(m => m.p.n)), fmtN = n => n.toLocaleString ? n.toLocaleString('en-US') : String(n);
  const lead = F ? F.lead.map(n => ms.find(m => m.p.n === n)).filter(Boolean) : ms.slice(0, 2), back = F ? F.back.map(n => ms.find(m => m.p.n === n)).filter(Boolean) : [];
  const order = [...lead, ...back, ...ms.filter(m => !lead.includes(m) && !back.includes(m))].slice(0, 6);
  const slot = (m, i) => m ? `<button type="button" class="rdslot${lead.includes(m) ? ' lead' : ''}" style="${RD.ta(m.p)}" data-lt="${esc(m.p.n)}" aria-label="${esc(m.d)}: open its info"><span class="in">${RD.spr(m.p)}<span class="no">${i + 1}</span><span class="rl">${lead.includes(m) ? 'lead' : back.includes(m) ? 'back' : F ? 'bench' : ''}</span><span class="nm">${esc(m.d.replace(/^Mega /, 'M-'))}</span></span></button>`
    : `<button type="button" class="rdslot empty" data-view="report" aria-label="Add a Pokémon"><span class="in"><span></span><span class="no">${i + 1}</span><span class="rl">empty</span><span class="nm">add</span></span></button>`;
  const rank = RD.top(10), maxU = 50;
  const side = typeof homeSide === 'function' ? homeSide(v) : '', trends = typeof homeTrends === 'function' ? homeTrends() : '';
  const vsL = lead.length ? lead.slice(0, 2).map(m => m.p) : [], vsR = six.slice(0, 2);
  el.innerHTML = `
  <section class="rdhero">
    <div><div class="rdk">pokémon champions · vgc doubles · reg m-c</div><h1 class="rdtitle">Plot your <em>win.</em></h1></div>
    <div><p class="rdlede">From <b>${nTeams ? fmtN(nTeams) + ' real tournament teams' : 'real tournament results'}</b>. See their six, pick your four.${dataDateText() ? ` <span class="rdk">${esc(dataDateText().replace(/^Data as of/, "data as of"))}</span>` : ''}</p>
      <div class="rdacts"><button type="button" class="rdbtn p" data-view="${ms.length ? 'report' : 'auto'}">${ms.length ? 'Grade my team' : 'Build me a team'}</button><button type="button" class="rdbtn" data-view="${ms.length ? 'auto' : 'report'}">${ms.length ? 'Build a team' : 'Grade a team'}</button><button type="button" class="rdbtn" data-view="matchup">Plan a match</button></div></div>
  </section>
  <section class="rdstage" aria-label="Who everyone brings">
    <div class="rdsel" id="rdSel" aria-live="polite">${RD.selHtml(selP)}</div>
    <div><div class="rdrhead"><h2 class="rdh2">Who everyone brings</h2><span class="rdk">top 15 · % of teams · arrow keys to move</span></div>
      <div class="rdroster" role="group" aria-label="Most used Pokémon">${roster.map((p, i) => `<button type="button" class="rdcell" data-rdsel="${esc(p.n)}" aria-pressed="${p.n === RD.sel}" style="${RD.ta(p)}" aria-label="${esc(p.d)}, ${U(p).toFixed(1)}% of teams"><span class="in"><span class="pc">${U(p).toFixed(1)}%</span><span class="rk">${i + 1}</span>${mineSet.has(p.n) ? '<span class="mine" title="On your team"></span>' : ''}${RD.spr(p)}<span class="nm">${esc(p.d.replace(/^Mega /, 'M-'))}</span><span class="tg">${(p.t || []).map(t => `<span style="color:${TC[t]}">${RD.glyph(t)}</span>`).join('')}</span></span></button>`).join('')}</div>
      <div class="rdkey rdk"><span><i style="display:inline-block;width:7px;height:7px;background:var(--rd-acc);transform:rotate(45deg);margin-right:6px"></i>on your team</span><span>tap a Pokémon for its numbers · full info opens its sheet</span></div></div>
  </section>
  <section class="rdteam" aria-label="Your six">
    <div class="tt"><span class="rdk">your six · team order</span><b>${esc(ms.length ? teamTitleFor(ms) || 'My team' : 'No team yet')}</b></div>
    <div class="rdslots">${Array.from({length: 6}, (_, i) => slot(order[i], i)).join('')}</div>
    ${G ? `<button type="button" class="rdgrade" data-view="report"><b>${G.s != null ? G.s : ''}</b><span class="rdk">grade ${esc(G.letter)}</span></button>` : `<button type="button" class="rdbtn p" data-view="${ms.length ? 'report' : 'auto'}">${ms.length ? 'Grade it' : 'Build me a team'}</button>`}
  </section>
  ${vsL.length === 2 && vsR.length === 2 ? `<section class="rdsec"><div class="rdrhead"><h2 class="rdh2">Your leads vs the two most brought</h2><button type="button" class="rdbtn" data-view="matchup">Plan this match</button></div>
    <div class="rdvs"><span class="tag y">You</span><span class="tag t">Top threats</span><div class="side2">${vsL.map(p => RD.spr(p)).join('')}</div><div class="vs">VS</div><div class="side2">${vsR.map(p => RD.spr(p)).join('')}</div>
    <p class="cap rdk">${esc(vsL.map(p => p.d).join(' + '))} vs ${esc(vsR.map(p => p.d).join(' + '))} · on ${vsR.map(p => U(p).toFixed(1) + '%').join(' and ')} of teams</p></div></section>` : ''}
  <section class="rdsec"><div class="rdrhead"><h2 class="rdh2">Who's winning</h2><button type="button" class="rdbtn" data-view="ratings">All ratings</button></div>
    <div class="rdrank"><div class="rdrhd rdk"><span>#</span><span></span><span>pokémon</span><span class="bw">usage, 0–50% to scale</span><span>usage</span><span>rating</span></div>
    ${rank.map((p, i) => { const r = RD.rate(p); return `<button type="button" class="rdrow${mineSet.has(p.n) ? ' mine' : ''}" data-lt="${esc(p.n)}"><span class="r">${String(i + 1).padStart(2, '0')}</span>${RD.spr(p)}<span class="n">${esc(p.d)}<span class="tg">${(p.t || []).map(t => `<i style="background:${TC[t]}"></i>`).join('')}</span></span><span class="b bw"><i style="width:${Math.min(100, U(p) / maxU * 100)}%;background:${TC[p.t[0]]}"></i></span><output>${U(p).toFixed(1)}%</output><output class="${r != null && r >= 80 ? 'hi' : ''}">${r != null ? RS(r) : '–'}</output></button>`; }).join('')}</div></section>
  ${trends ? `<section class="rdsec rdtrends">${trends}</section>` : ''}
  ${side ? `<section class="rdsec"><h2 class="rdh2">Latest winner</h2>${side}</section>` : ''}
  <section class="rdsec"><div class="rdrhead"><h2 class="rdh2">Every tool</h2><span class="rdk">${HOME_TILES.length} tools · menu has the rest</span></div>
    <div class="rdtools">${HOME_TILES.map(([vw, t, d, ic]) => `<button type="button" class="rdtool" data-view="${vw}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><b>${esc(t)}</b><span>${esc(d)}</span></button>`).join('')}</div></section>`;
  RD.feet(el); }
/* Nov 5 (Sim): keep the original Home layout; rdHome is no longer used */
/* roster: tap or arrow keys move the P1 cursor; the selected panel updates in place */
document.addEventListener('click', e => { const c = e.target.closest && e.target.closest('[data-rdsel]'); if (!c) return; RD.pick(c.dataset.rdsel, c); });
RD.pick = (n, c) => { RD.sel = n; const wrap = c.closest('.rdroster'); if (wrap) wrap.querySelectorAll('.rdcell').forEach(x => x.setAttribute('aria-pressed', String(x === c)));
  const s = $('rdSel'); if (s) { s.innerHTML = RD.selHtml(byName.get(n)); RD.feet(s); } };
document.addEventListener('keydown', e => { const c = e.target.closest && e.target.closest('.rdcell'); if (!c) return; const cells = [...c.parentElement.children], i = cells.indexOf(c), cols = getComputedStyle(c.parentElement).gridTemplateColumns.split(' ').length;
  const j = {ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols}[e.key]; if (j == null || j < 0 || j >= cells.length) return; e.preventDefault(); cells[j].focus(); RD.pick(cells[j].dataset.rdsel, cells[j]); });
/* every other page: sprites that render later get feet-aligned too (cheap: only new rdspr images) */
try { new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches && n.matches('img.rdspr')) RD.measure(n); else if (n.querySelectorAll) n.querySelectorAll('img.rdspr').forEach(RD.measure); } }).observe(document.body, {childList: true, subtree: true}); } catch (e) {}
document.documentElement.classList.add('rd');
/* ---------- Nov 5 (Sim): your six as six art panels; no lead/back/bench labels on pictures ---------- */
try {
  const mgPanel0 = MG.panel;
  MG.panel = o => mgPanel0(o && o.cap ? Object.assign({}, o, {cap: Object.assign({}, o.cap, {role: ''})}) : o);
  const mgLine0 = MG.lineup;
  MG.lineup = ms => { const L = mgLine0(ms); const order = [...L.lead, ...L.back, ...L.home]; return {lead: order.slice(0, 2), back: order.slice(2, 6), home: [], by: L.by}; };
} catch (e) {}
/* Nov 5 (Sim: "plain black or white backgrounds are the laziest approach"): any flat near-black or near-white block in the page
   becomes a soft rounded tint (big blocks) or clear (small ones). Runs after each render, debounced. */
RD.soften = () => { try { const main = document.querySelector('main'); if (!main) return;
  main.querySelectorAll('div,section,article,li,button,a,details,table').forEach(e => { if (e.classList.contains('rdsoft') || e.classList.contains('rdclear') || e.closest('.mgpn,.rdcell') ) return;
    if (/\b(btn|chprimary|mgyel|mgact|primary|go)\b/.test(e.className)) return;
    const c = getComputedStyle(e).backgroundColor, m = c.match(/[\d.]+/g); if (!m) return; const [r, g, b, a = 1] = m.map(Number); if (a < .5) return;
    const s = r + g + b; if (s > 60 && s < 735) return; const box = e.getBoundingClientRect(); if (!box.width) return;
    e.classList.add(box.width > 220 && box.height > 70 ? 'rdsoft' : 'rdclear'); }); } catch (e) {} };
RD.softT = 0; try { new MutationObserver(() => { clearTimeout(RD.softT); RD.softT = setTimeout(RD.soften, 120); }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-look']}); } catch (e) {}
setTimeout(RD.soften, 600);
