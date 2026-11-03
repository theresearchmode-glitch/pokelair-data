/* ===== Info sheet tabs (Nov 2, Sim): "Info | Meta | Rating" =====
   Sim: tapping a Pokémon opened straight on its most-used moves, which pushed the info page down. The sheet now keeps the
   hero header and the three numbers on top and switches between three panels underneath:
   - Info: base stats, abilities, type matchups (with ability changes), Speed at level 50
   - Meta: the moves / items / brought-with block and the typical set (same content as before)
   - Rating: why it rates N, what the data says, other tier lists, plus links to how ratings work and the track record
   Switching only toggles which panel is shown: the hero (and its sprite) is never rebuilt. The last tab used is remembered
   on this device (LS 'cc2.lstab'); a first-time visitor starts on Info. Touch: a clear sideways swipe on the panels
   switches to the neighbouring tab. Nothing is removed: every section that was on the sheet is in one of the three tabs. */
const LST = {tabs: [['info', 'Info', 'stats · types'], ['meta', 'Meta', 'moves · items'], ['rating', 'Rating', 'why · data']]};
LST.ok = k => LST.tabs.some(t => t[0] === k);
LST.cur = (() => { const v = LS.get('cc2.lstab', null); return LST.ok(v) ? v : 'info'; })();
/* stat bar colours by value: cool for low, green for high, magenta for exceptional (never red: red is for opponents) */
LST.stCol = v => v >= 150 ? '#E048C8' : v >= 120 ? '#3FB618' : v >= 100 ? '#12B5A4' : v >= 80 ? '#2F9BFF' : v >= 50 ? '#5B6BF5' : '#9B6CFF';
LST.baseForm = p => { if (!p || !p.m) return null; const b = byName.get(p.b); return b && !b.m ? b : ROSTER.find(q => q.b === p.b && !q.m) || null; };
LST.abDesc = a => (typeof ABIL === 'object' && ABIL[a] ? String(ABIL[a]).replace(/Pokemon/g, 'Pokémon') : '');
/* type effectiveness in words (the Type chart page uses the same groups) */
LST.word = x => x === 0 ? 'no damage' : x === .25 ? '¼ damage' : x === .5 ? '½ damage' : x === 1 ? 'normal damage' : x === 1.25 ? 'a quarter more damage' : x === 2 ? '2× damage' : x === 4 ? '4× damage' : x + '× damage';
/* the matchups of p's typing, and what each ability it can have changes (ABILITY_MODS in engine/types.js, the same table
   the team checks and the Type chart use) */
LST.matchups = p => { const g = {q: [], d: [], h: [], qr: [], z: []}, abs = [...new Set(p.a)], only = abs.length === 1 && ABILITY_MODS[abs[0]] ? abs[0] : null;
  /* with only one possible ability (every Mega, Rotom's Levitate ...) the lists already count it; otherwise they are for the typing alone */
  for (const atk of TYPES) { const x = mult(atk, p.t, only, !!only); (x === 0 ? g.z : x >= 4 ? g.q : x >= 2 ? g.d : x <= .25 ? g.qr : x <= .5 ? g.h : []).push(atk); }
  const ab = [...new Set(p.a)].filter(a => ABILITY_MODS[a]).map(a => ({a, ch: TYPES.filter(t => mult(t, p.t, a, true) !== mult(t, p.t, null, false)).map(t => ({t, raw: mult(t, p.t, null, false), x: mult(t, p.t, a, true)}))})).filter(o => o.ch.length);
  return {g, ab, only}; };
/* Speed at level 50 from the app's own Champions maths (39-damage-calc-speed.js): calcStat = floor((base + 20 + points) × nature),
   spdCalc for Scarf / Tailwind / weather abilities, likelySpeed for what players run, outspeedOf for "outspeeds X% of the top 30" */
LST.speeds = p => { const rows = [], os = (v, tr) => { try { return outspeedOf(v, '', {tr: !!tr}); } catch (e) { return null; } };
  const maxN = calcStat(p, 'Spe', 32, 1.1);
  try { const s = likelySpeed(p, null), ab = abilityOf({p}), v = spdCalc(s.v, s.scarf, ab, '', {});
    rows.push({k: 'run', l: 'What players run', v, note: s.label.replace(/^./, c => c.toUpperCase()) + (s.scarf ? ', Choice Scarf' : ''), os: os(v), main: true}); } catch (e) {}
  rows.push({k: 'none', l: 'No Speed points', v: calcStat(p, 'Spe', 0, 1), note: 'neutral nature'});
  rows.push({k: 'max', l: 'Max Speed points', v: calcStat(p, 'Spe', 32, 1), note: '32 points, neutral nature'});
  rows.push({k: 'maxn', l: 'Max + Speed nature', v: maxN, note: '32 points, Speed-boosting nature (Timid, Jolly…)'});
  if (!p.m) rows.push({k: 'scarf', l: 'Choice Scarf', v: spdCalc(maxN, true, '', '', {}), note: 'max + Speed nature'});
  rows.push({k: 'tw', l: 'In Tailwind', v: spdCalc(maxN, false, '', '', {tw: true}), note: 'max + Speed nature, Speed doubled'});
  const WX = {sun: 'sun', rain: 'rain', sand: 'sand', snow: 'snow'};
  for (const a of [...new Set(p.a)]) { const w = typeof WEATHER_SPD_AB === 'object' && WEATHER_SPD_AB[a]; if (w) rows.push({k: 'wx', l: `${a} in ${WX[w] || w}`, v: spdCalc(maxN, false, a, w, {}), note: 'max + Speed nature, Speed doubled'}); }
  rows.push({k: 'tr', l: 'Trick Room build', v: calcStat(p, 'Spe', 0, .9), note: '0 points, Speed-lowering nature', tr: true});
  /* no repeated numbers (Sim, Nov 2): when what players run equals a standard row, that row is folded into it */
  const run = rows.find(r => r.k === 'run'), dup = run && rows.find(r => r !== run && !r.tr && r.k !== 'wx' && r.k !== 'tw' && r.v === run.v);
  if (dup) { run.note += ` · same as ${dup.l.replace(/^./, c => c.toLowerCase())}`; rows.splice(rows.indexOf(dup), 1); }
  for (const r of rows) if (r.os === undefined) r.os = os(r.v, r.tr);
  return rows; };
LST.info = p => { const st = (() => { try { return setFor(p) || {}; } catch (e) { return {}; } })(), bf = LST.baseForm(p);
  const L = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'], tot = p.st.reduce((a, b) => a + b, 0), btot = bf ? bf.st.reduce((a, b) => a + b, 0) : 0;
  const dif = (a, b) => { const d = a - b; return d ? `<em class="lstd${d < 0 ? ' dn' : ''}">${d > 0 ? '+' : '−'}${Math.abs(d)}</em>` : ''; };
  const stats = `<div class="lstats">${p.st.map((v, i) => `<div class="lstr"><span>${L[i]}</span><i><em style="width:${Math.max(3, Math.min(100, v / 2))}%;background:${LST.stCol(v)}"></em></i><b>${v}</b>${bf ? dif(v, bf.st[i]) || '<em class="lstd"></em>' : ''}</div>`).join('')}
    <div class="lstr lstot"><span>Total</span><i></i><b>${tot}</b>${bf ? dif(tot, btot) || '<em class="lstd"></em>' : ''}</div></div>${bf ? `<p class="t2 lsnote">Mega Evolved stats. The small numbers are the change from ${esc(bf.d)} (total ${btot}).</p>` : ''}`;
  /* abilities: every one it can have, the one players use most marked with its share (popular sets data) */
  const abSh = new Map((st.ab || []).map(([n, v]) => [n, v])), top = (st.ab || [])[0], sb = (() => { try { return setBasis(p, st, 'ab'); } catch (e) { return null; } })();
  /* most used first (Sim, Nov 3: Sneasler showed Pressure 0.1% above Unburden 88%); ones without set data keep their order after */
  const abl = [...new Set(p.a)].map((a, i) => ({a, i, v: abSh.has(a) ? +abSh.get(a) : -1})).sort((x, y) => y.v - x.v || x.i - y.i).map(o => o.a).map(a => { const v = abSh.get(a), isTop = top && top[0] === a && p.a.length > 1;
    return `<div class="lsab${isTop ? ' top' : ''}"><div class="lsabh"><b>${esc(a)}</b>${isTop ? `<span class="lsabu">Most used${v != null ? ' · ' + pctFmt(+v) : ''}</span>` : v != null && p.a.length > 1 ? `<span class="lsabs">${pctFmt(+v)}</span>` : ''}</div>${LST.abDesc(a) ? `<p>${esc(LST.abDesc(a))}</p>` : ''}</div>`; }).join('');
  const abNote = p.m && bf ? `<p class="t2 lsnote">The Mega's ability. Before Mega Evolving, ${esc(bf.d)} has ${[...new Set(bf.a)].map(esc).join(' or ')}.</p>`
    : p.a.length === 1 ? '<p class="t2 lsnote">Its only ability.</p>' : top && abSh.size ? `<p class="t2 lsnote">Share of players' sets with each ability${sb ? ' · ' + sb.html : ''}.</p>` : '<p class="t2 lsnote">No set data yet, so no ability is marked as most used.</p>';
  /* type matchups */
  const M = LST.matchups(p), line = (lab, arr, cls) => arr.length ? `<div class="lsty ${cls}"><span class="lstyl">${lab}</span><div class="chips">${arr.map(t => chip(t)).join('')}</div></div>` : '';
  const weak = M.g.q.length + M.g.d.length;
  const ty = `${line('4× weak', M.g.q, 'w4')}${line('2× weak', M.g.d, 'w2')}${weak ? '' : '<div class="lsty w2"><span class="lstyl">Weak to</span><div class="chips"><span class="none">Nothing</span></div></div>'}${line('Resists ½', M.g.h, 'r2')}${line('Resists ¼', M.g.qr, 'r4')}${line('Immune', M.g.z, 'im')}
    ${M.ab.map(o => { const v = abSh.get(o.a); return `<div class="lsabn"><div class="lsabnh">${M.only ? `${esc(o.a)} <span>(its only ability) changes these, already counted above</span>` : `With ${esc(o.a)} <span>${v != null ? pctFmt(+v) + ' of sets' : 'only if it has this ability'}, not counted above</span>`}</div>${o.ch.map(c => `<div class="lsabc">${chip(c.t)}<b>${c.x === 0 ? 'immune' : LST.word(c.x)}</b><span>${M.only ? 'its typing alone takes' : 'instead of'} ${LST.word(c.raw)}</span></div>`).join('')}</div>`; }).join('')}
    <p class="t2 lsnote">${M.only ? `Its typing${p.t.length > 1 ? ` (${p.t.join(' / ')})` : ''} with ${esc(M.only)}` : `For its typing${p.t.length > 1 ? ` (${p.t.join(' / ')})` : ''} alone`}. Every type not listed hits it for normal damage.</p>`;
  /* speed */
  const sp = LST.speeds(p);
  const spd = `<div class="lsvd">${sp.map(r => `<div class="lsvr${r.main ? ' main' : ''}${r.tr ? ' tr' : ''}"><span class="lsvl">${esc(r.l)}</span><b>${r.v}</b><span class="lsvn">${esc(r.note)}</span>${r.os ? `<span class="lsvo">${esc(outspeedTxt(r.os, {tr: r.tr}))}${r.tr ? ' under Trick Room' : ''}</span>` : ''}</div>`).join('')}</div>
    <p class="t2 lsnote">Level 50, as in Pokémon Champions: base Speed ${p.st[5]}, Speed points 0–32 add 1 each, a Speed nature adds 10%. "Top 30" = the 30 biggest threats at their usual Speed.</p>
    <button type="button" class="nplink" data-view="speed">Speed tiers <span aria-hidden="true">→</span></button>`;
  const sec = (k, t, h) => `<section class="lsi lsi-${k}"><h4>${t}</h4>${h}</section>`;
  return sec('st', 'Base stats', stats) + sec('ab', p.a.length > 1 ? 'Abilities' : 'Ability', abl + abNote) + sec('ty', 'Type matchups', ty) + sec('sp', 'Speed at level 50', spd); };
/* show one tab: only `hidden` and aria flip; the hero, its sprite and the other panels stay as they are */
LST.show = (k, o) => { o = o || {}; const sh = $('lairSheet'); if (!sh || !LST.ok(k)) return; const bar = sh.querySelector('.lstabs'); if (!bar) return;
  const was = LST.cur; LST.cur = k; if (o.save !== false) LS.set('cc2.lstab', k);
  bar.querySelectorAll('[role=tab]').forEach(b => { const on = b.dataset.lstab === k; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
  sh.querySelectorAll('.lstp').forEach(pn => { const on = pn.dataset.lstp === k; pn.hidden = !on; pn.classList.toggle('lsfade', on && !!o.anim && was !== k); });
  bar.dataset.on = k;
  /* keep the scroll sensible: if the tab bar has scrolled above view, bring the panel's top (right under the bar) back */
  const panel = sh.querySelector('.lspanel'), mark = sh.querySelector('.lstabmark');
  if (o.anim && panel && mark && panel.scrollTop > mark.offsetTop) panel.scrollTop = mark.offsetTop;
  if (o.focus) { const b = bar.querySelector(`[data-lstab="${k}"]`); if (b) try { b.focus({preventScroll: true}); } catch (e) {} } };
CH.wrap('lairSheet', n => { const sh = $('lairSheet'), p = n && byName.get(n); if (!sh || sh.hidden || !p) return; const body = sh.querySelector('.lsbody'); if (!body || body.querySelector('.lstabs')) return;
  const stats = body.querySelector(':scope > .chlstats'), data = body.querySelector(':scope > .chlsdata'), act = body.querySelector(':scope > .lsact');
  const P = {}; for (const [k] of LST.tabs) { const d = document.createElement('div'); d.className = 'lstp lstp-' + k; d.dataset.lstp = k; d.id = 'lstp-' + k; d.setAttribute('role', 'tabpanel'); d.setAttribute('aria-labelledby', 'lstb-' + k); d.tabIndex = -1; P[k] = d; }
  /* Info: new */
  P.info.innerHTML = LST.info(p);
  /* Meta: the moves / items / brought-with block, then the typical set; Rating: the rest, unfolded (the tabs already separate them) */
  if (data) P.meta.append(data);
  const kids = [...body.children].filter(x => x !== stats && x !== act && !x.classList.contains('lsmis'));
  for (const x of kids) { if (x.matches('details.chsec')) { const t = (x.querySelector('summary .cht') || {}).textContent || '', s = x.querySelector('.chbody > .lsec');
      if (s) { s.insertAdjacentHTML('afterbegin', `<h4>${esc(t)}</h4>`); (/^Typical set/.test(t) ? P.meta : P.rating).append(s); } x.remove(); }
    else if (x.classList.contains('lsec')) P.rating.append(x); }
  { const st = (() => { try { return setFor(p) || {}; } catch (e) { return {}; } })(), hasBw = !!(data && data.querySelector('.chbw'));
    if (!(st.mv && st.mv.length) && !(st.it && st.it.length) && !hasBw) P.meta.insertAdjacentHTML('afterbegin', `<p class="lsempty"><b>No tournament or ladder sets yet</b>Nobody has brought ${escName(p.d)} to the events and ladders we read, so the typical set below is a starting guess, not real teams.</p>`); }
  P.rating.insertAdjacentHTML('beforeend', `<div class="nplinks lslinks">${typeof npLink === 'function' ? npLink('rating', 'How ratings work') : ''}<button type="button" class="nplink" data-view="track">Track record <span aria-hidden="true">→</span></button></div>`);
  const bar = document.createElement('div'); bar.className = 'lstabs'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', `${p.d}: info, meta or rating`);
  bar.innerHTML = LST.tabs.map(([k, l, s]) => `<button type="button" role="tab" id="lstb-${k}" class="lstab lstab-${k}" data-lstab="${k}" aria-controls="lstp-${k}" aria-selected="false" tabindex="-1"><b>${l}</b><span>${s}</span></button>`).join('');
  const mark = document.createElement('div'); mark.className = 'lstabmark'; mark.setAttribute('aria-hidden', 'true');
  const wrap = document.createElement('div'); wrap.className = 'lstpw'; for (const [k] of LST.tabs) wrap.append(P[k]);
  if (stats) stats.after(mark, bar, wrap); else body.prepend(mark, bar, wrap);
  LST.show(LST.cur, {save: false}); });
document.addEventListener('click', e => { const t = e.target && e.target.closest; if (!t) return;
  const b = e.target.closest('#lairSheet [data-lstab]'); if (b) { LST.show(b.dataset.lstab, {anim: true}); return; }
  /* page links inside the sheet (Speed tiers, How ratings work, Track record) close it first */
  if (e.target.closest('#lairSheet [data-view]') && typeof lairClose === 'function') lairClose(); }, true);
document.addEventListener('keydown', e => { const b = e.target && e.target.closest && e.target.closest('#lairSheet [data-lstab]'); if (!b) return;
  const ks = LST.tabs.map(t => t[0]), i = ks.indexOf(b.dataset.lstab); let j = -1;
  if (e.key === 'ArrowRight') j = (i + 1) % ks.length; else if (e.key === 'ArrowLeft') j = (i + ks.length - 1) % ks.length; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = ks.length - 1;
  if (j < 0) return; e.preventDefault(); LST.show(ks[j], {anim: true, focus: true}); });
/* touch swipe (Sim, Nov 2): a clear sideways swipe on the panels moves to the neighbouring tab. Passive listeners only;
   ignored when it starts in something that scrolls sideways, in a form field, with two fingers, or while text is selected;
   vertical scrolls never count. Touch events only, so a desktop mouse never swipes. */
LST.sw = null;
LST.hScroll = (el, stop) => { for (let x = el; x && x !== stop; x = x.parentElement) { if (x.scrollWidth > x.clientWidth + 2) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') return true; } } return false; };
document.addEventListener('touchstart', e => { LST.sw = null; const w = e.target && e.target.closest && e.target.closest('#lairSheet .lstpw'); if (!w || e.touches.length !== 1) return;
  if (e.target.closest('input,select,textarea,[contenteditable]') || LST.hScroll(e.target, w)) return;
  const t = e.touches[0]; LST.sw = {x: t.clientX, y: t.clientY, t: Date.now()}; }, {passive: true});
document.addEventListener('touchmove', e => { if (LST.sw && e.touches.length !== 1) LST.sw = null; }, {passive: true});
document.addEventListener('touchend', e => { const s = LST.sw; LST.sw = null; if (!s || !e.changedTouches.length) return; const t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y;
  if (Math.abs(dx) <= 50 || Math.abs(dx) <= 1.5 * Math.abs(dy) || Date.now() - s.t > 900) return;
  try { const sel = getSelection(); if (sel && String(sel).trim()) return; } catch (x) {}
  const ks = LST.tabs.map(x => x[0]), i = ks.indexOf(LST.cur), j = dx < 0 ? i + 1 : i - 1; if (j < 0 || j >= ks.length) return; LST.show(ks[j], {anim: true}); }, {passive: true});
document.addEventListener('touchcancel', () => { LST.sw = null; }, {passive: true});
