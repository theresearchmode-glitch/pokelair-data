// ---------- set check (Phase 3, Nov 9, Sim chose this) ----------
// Item, move and Ability tips come from what tournament players run, NOT from the grade: on later real games the grade picked the
// better of two sheets of the same six only ~52% of the time for item changes and ~56% for move changes (experiments/set-pairs.mjs),
// so a "Grade B → A" claim for a set change would be noise. A tip appears only for a choice the player made (never for the default
// set), when almost nobody runs it (under 5% of that Pokémon's tournament teams) and a clear favourite exists. Item Clause respected.
function tourEntry(p) { const T = META.doubles_tour; if (!T || !p) return null; return [...(T.top || []), ...(T.more || [])].find(x => x.n === p.n) || null; }
function setTips() { if (S.format !== 'doubles') return []; const out = [], pct = (arr, n) => { const x = (arr || []).find(a => a[0] === n); return x ? +x[1] : 0; };
  const held = S.slots.map(s => { const p = byName.get(s.n); return p ? slotItem(s, p) : null; });
  S.slots.forEach((s, i) => { const p = byName.get(s.n); if (!p) return; const r = tourEntry(p); if (!r || !(r.teams >= 20)) return; const N = (+r.teams).toLocaleString('en-US');
    const it = slotItem(s, p);
    if (it && !p.m && r.it && r.it.length && pct(r.it, it) < 5) { const others = new Set(held.filter((h, j) => h && j !== i));
      const alt = r.it.find(([n, v]) => n !== it && +v >= 25 && !others.has(n) && !(typeof isMegaStone === 'function' && isMegaStone(n)));
      if (alt) out.push({i, k: 'it', from: it, to: alt[0], p, why: `${Math.round(alt[1])}% of ${N} tournament ${p.d} hold ${alt[0]}; ${pct(r.it, it) ? Math.round(pct(r.it, it) * 10) / 10 + '%' : 'almost none'} hold ${it}.`}); }
    if (s.a && r.ab && r.ab.length && pct(r.ab, s.a) < 5) { const alt = r.ab.find(([n, v]) => n !== s.a && +v >= 50 && p.a.includes(n));
      if (alt) out.push({i, k: 'ab', from: s.a, to: alt[0], p, why: `${Math.round(alt[1])}% of ${N} tournament ${p.d} run ${alt[0]}; ${pct(r.ab, s.a) ? Math.round(pct(r.ab, s.a) * 10) / 10 + '%' : 'almost none'} run ${s.a}.`}); }
    const c = s.mv && s.mv[S.format];
    if (Array.isArray(c)) { const learn = new Set((LEARN[p.n] || []).map(k => MV[k].name)), have = new Set(c.filter(Boolean)), used = new Set();
      c.forEach((nm, j) => { if (!nm || pct(r.mv, nm) >= 5) return; const alt = (r.mv || []).find(([n, v]) => !have.has(n) && !used.has(n) && +v >= 30 && learn.has(n)); if (!alt) return; used.add(alt[0]);
        out.push({i, k: 'mv', j, from: nm, to: alt[0], p, why: `${Math.round(alt[1])}% of ${N} tournament ${p.d} run ${alt[0]}; ${pct(r.mv, nm) ? Math.round(pct(r.mv, nm) * 10) / 10 + '%' : 'almost none'} run ${nm}.`}); }); } });
  return out; }
function setTipsHtml() { let tips = []; try { tips = setTips(); } catch (e) { return ''; } ui.setTips = tips; if (!tips.length) return '';
  const what = t => t.k === 'it' ? 'item' : t.k === 'ab' ? 'Ability' : 'move';
  return `<div class="settips"><h4 class="settips-h">Set check: what most players run</h4>${tips.map((t, x) => `<div class="settip"><div class="settip-t"><b>${esc(t.p.d)}: ${esc(t.to)}</b> instead of ${esc(t.from)} <span class="vsub">(${what(t)})</span></div><div class="t2">${esc(t.why)} This tip comes from what players run, not from the grade.</div><button class="btn sm" type="button" data-settip="${x}">Use ${esc(t.to)}</button></div>`).join('')}</div>`; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-settip]'); if (!b) return; const t = (ui.setTips || [])[+b.dataset.settip]; if (!t) return;
  const s = S.slots[t.i], p = byName.get(s && s.n); if (!p || p.n !== t.p.n) return; keepUndo();
  if (t.k === 'it') s.it = {...(s.it || {}), [S.format]: t.to};
  else if (t.k === 'ab') s.a = t.to;
  else { const names = slotMoves(s, p).names.slice(); if (names[t.j] !== t.from) return; names[t.j] = t.to; s.mv = {...(s.mv || {}), [S.format]: names}; }
  undoMark(`${t.to} on ${p.d}`); keepScroll(() => render()); toast(`${p.d}: ${t.to} instead of ${t.from}`, true); });
