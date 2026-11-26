// ---------- nastyplot.org front page: the receipt flooded with Pokémon colour (Job Z, Nov 26; PROPOSAL ONLY, Sim picks) ----------
// Sim (Nov 26): "i like the receipt but it needs more color. our website is mainly colored by pokemon". Three takes, --home=c1|c2|c3:
// c1 "The crew behind the counter": the winning six as big official art crowding behind the receipt, on a slanted band in their types' colours.
// c2 "Type ink": the receipt printed in colour: every line on a slanted strip in its Pokémon's type colour (with the type's name), sprites
//    breaking out, fat white Ratings, the 87 in Nasty pink on a burst; the page split in the team's two most common types.
// c3 "Receipt pile": the last six winning teams' receipts fanned out, each headed in its lead's type colour with its six peeking over the
//    top; today's champion's on top, the Reg M-D stamp on it.
// Every colour that means something is named on screen (type word on the strip / legend chips). Shared: pubhome.js, pubhome-x.js.
V2.phTypes = ms => { const n = {}; for (const m of ms) for (const t of (m.p.t || [])) n[t] = (n[t] || 0) + (t === m.p.t[0] ? 2 : 1);
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(x => x[0]).filter(t => V2.TYPES.includes(t)); };
V2.phTyChip = t => `<span class="ph-tyc" style="--tc:var(--ty-${t})">${V2.kTy ? V2.kTy(t) : ''}<span>${V2.esc(t)}</span></span>`;
V2.phBig = (n, cls, st) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null; return id == null ? '' : `<img class="${cls}" src="${V2.art(id, true)}" alt="" decoding="async"${st ? ` style="${st}"` : ''}>`; };
// the last N winning teams (the same rule as homeChamp: an event's 1st place with six known Pokémon), newest first
V2.phChamps = N => { const E = typeof META === 'object' && META.events, out = []; if (!E || !Array.isArray(E.events)) return out;
  for (const e of E.events) { const t = (e.top || []).find(x => x && x.place === 1 && x.mons && x.mons.length === 6 && x.mons.every(m => byName.get(m.n)));
    if (t) out.push({ev: e, six: t.mons.map(m => byName.get(m.n))}); if (out.length >= N) break; } return out; };
V2.phScore = X => X && X.G ? Math.round(X.G.s) : null;

// ---- c1. The crew behind the counter ----
V2.PH_CREW = [ /* left %, bottom %, height px (desktop), z: the six posed like a group photo, back row up and small, front row big and cut by the frame */
  [34, 36, 340, 2], [62, 50, 300, 1], [44, 4, 380, 3], [18, 52, 300, 0], [72, -6, 360, 3], [82, 40, 280, 1]];
V2.phC1 = () => { const E = V2.esc, F = V2.phFacts(), X = V2.phChamp();
  if (!X || !X.ms.length) return `<div class="ph ph-a ph-c1"><section class="ph-a-top" aria-labelledby="ph-h1">${V2.phCopy(F)}<div class="ph-crew"></div></section></div>`;
  const ty = V2.phTypes(X.ms), t1 = ty[0] || 'Normal', t2 = ty[1] || t1, s = V2.phScore(X), band = V2.phBand(X.G);
  const crew = X.ms.map((m, i) => { const [l, b, h, z] = V2.PH_CREW[i]; return V2.phBig(m.p.n, 'ph-cr', `--l:${l}%;--b:${b}%;--h:${h}px;--z:${z}`); }).join('');
  const rc = `<figure class="ph-cr-rc" aria-labelledby="ph-rc-h"><p class="ph-rc-hd"><span class="u">NastyPlot</span><span>${E(V2.phDate(X.C.ev.date))}</span></p>
    <h2 class="ph-rc-h" id="ph-rc-h">${V2.phEvent(X.C)}</h2><ol class="ph-rc-ls">${V2.phLines(X.ms, 'ph-rl')}</ol>
    ${s != null ? `<p class="ph-cr-tot"><span class="u">Strength Score</span><b class="u">${s}</b></p><p class="ph-rc-band"><i aria-hidden="true" style="--bd:var(--band-${band})"></i><span class="u">${E(CH.wordOf(X.G.s))}</span></p>` : ''}
    ${F.beforeMD ? '<p class="ph-cr-stamp u" aria-hidden="true">Reg M-D · Dec 2</p>' : ''}</figure>`;
  return `<div class="ph ph-a ph-c1"><section class="ph-a-top ph-crs" aria-labelledby="ph-h1" style="--t1:var(--tyn-${t1});--t2:var(--tyn-${t2})">${V2.phCopy(F)}
    <div class="ph-crew"><div class="ph-crew-band" aria-hidden="true"></div><div class="ph-crew-six" aria-hidden="true">${crew}</div>${rc}
    <p class="ph-crew-leg">The winning six's colours: ${V2.phTyChip(t1)}${t2 !== t1 ? V2.phTyChip(t2) : ''}</p></div></section>
    ${V2.phListA(F)}${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };

// ---- c2. Type ink ----
V2.phC2 = () => { const E = V2.esc, F = V2.phFacts(), X = V2.phChamp();
  if (!X || !X.ms.length) return `<div class="ph ph-a ph-c2"><section class="ph-a-top" aria-labelledby="ph-h1">${V2.phCopy(F)}</section></div>`;
  const ty = V2.phTypes(X.ms), t1 = ty[0] || 'Normal', t2 = ty[1] || t1, s = V2.phScore(X), band = V2.phBand(X.G);
  const lines = X.ms.map((m, i) => { const t = m.p.t[0], r = V2.phRate(m.p.n);
    return `<li style="--tc:var(--ty-${t});--i:${i}">${V2.phMon('ph-ink', m.p, `${V2.phBig(m.p.n, 'ph-ink-a')}<span class="ph-ink-n"><b>${E(V2.disp(m.p.n))}</b><small>${V2.kTy ? V2.kTy(t) : ''}${E(t)}${m.heldItem ? ' · ' + V2.keepForm(E(m.heldItem)) : ''}</small></span><b class="ph-ink-r u">${r != null ? r : '–'}</b>`, `${V2.disp(m.p.n)}, ${t} type${r != null ? ', rated ' + r : ''}: open its page`)}</li>`; }).join('');
  const bars = X.ms.map(m => { const r = V2.phRate(m.p.n) || 50; return `<i style="--tc:var(--ty-${m.p.t[0]});--h:${Math.max(16, Math.min(100, (r - 40) * 100 / 60)).toFixed(0)}%"></i>`; }).join('');
  const rc = `<figure class="ph-ink-rc" aria-labelledby="ph-rc-h" style="--t1:var(--ty-${t1});--t2:var(--ty-${t2})"><p class="ph-rc-hd"><span class="u">NastyPlot</span><span>Strength Score receipt</span></p>
    <h2 class="ph-rc-h" id="ph-rc-h">${V2.phEvent(X.C)}</h2><ol class="ph-ink-ls">${lines}</ol>
    <div class="ph-ink-foot"><div class="ph-ink-bars" aria-hidden="true">${bars}</div>
    ${s != null ? `<p class="ph-ink-sc"><span class="ph-burst" aria-hidden="true"></span><b class="u">${s}</b><small class="u">${E(CH.wordOf(X.G.s))}</small></p>` : ''}</div>
    ${F.beforeMD ? '<p class="ph-ink-stamp u" aria-hidden="true">Reg M-D · Dec 2</p>' : ''}</figure>`;
  return `<div class="ph ph-a ph-c2"><section class="ph-a-top ph-inks" aria-labelledby="ph-h1" style="--t1:var(--tyn-${t1});--t2:var(--tyn-${t2})">
    <div class="ph-ink-copy">${V2.phCopy(F)}</div>${rc}<p class="ph-ink-leg">The page in the winning six's two most common types: ${V2.phTyChip(t1)}${t2 !== t1 ? V2.phTyChip(t2) : ''}</p></section>
    ${V2.phListA(F)}${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };

// ---- c3. Receipt pile ----
V2.PH_PILE = [[-14, -4, 72], [9, 34, 48], [-6, 60, 88], [12, 8, 120], [-10, 48, 100]]; /* rotate deg, left %, top px: the older receipts under today's */
V2.phC3 = () => { const E = V2.esc, F = V2.phFacts(), X = V2.phChamp(), all = V2.phChamps(6);
  const old = all.slice(1, 6).map((c, k) => { const lead = c.six[0], t = lead.t[0], [rot, l, top] = V2.PH_PILE[k];
    return `<div class="ph-pl" style="--tc:var(--ty-${t});--r:${rot}deg;--l:${l}%;--top:${top}px;--k:${k}" aria-hidden="true">
      <div class="ph-pl-peek">${c.six.map(p => V2.mon(p.n, {bare: true, iw: 56})).join('')}</div>
      <p class="ph-pl-hd">${V2.kTy ? V2.kTy(t) : ''}<span>${E(t)} lead</span><b class="u">${E(V2.disp(lead.n))}</b></p>
      <p class="ph-pl-ev">${E(c.ev.name)}${c.ev.date ? ' · ' + E(V2.phDate(c.ev.date)) : ''}</p><i class="ph-pl-lines"></i></div>`; }).join('');
  let top = ''; if (X && X.ms.length) { const s = V2.phScore(X), band = V2.phBand(X.G), t = X.ms[0].p.t[0];
    top = `<figure class="ph-pl ph-pl-top" style="--tc:var(--ty-${t});--r:-3deg" aria-labelledby="ph-rc-h">
      <div class="ph-pl-peek ph-pl-peek-big" aria-hidden="true">${X.ms.map(m => V2.mon(m.p.n, {bare: true, iw: 72})).join('')}</div>
      <p class="ph-pl-hd">${V2.kTy ? V2.kTy(t) : ''}<span>${E(t)} lead · the newest winner</span></p>
      <h2 class="ph-rc-h" id="ph-rc-h">${V2.phEvent(X.C)}</h2><ol class="ph-rc-ls">${V2.phLines(X.ms, 'ph-rl')}</ol>
      ${s != null ? `<p class="ph-cr-tot"><span class="u">Strength Score</span><b class="u">${s}</b></p><p class="ph-rc-band"><i aria-hidden="true" style="--bd:var(--band-${band})"></i><span class="u">${E(CH.wordOf(X.G.s))}</span></p>` : ''}
      ${F.beforeMD ? '<p class="ph-pl-stamp u" aria-hidden="true">Reg M-D · Dec 2</p>' : ''}</figure>`; }
  return `<div class="ph ph-a ph-c3"><section class="ph-a-top ph-pls" aria-labelledby="ph-h1">${V2.phCopy(F, {lead: `The last ${Math.max(all.length, 1)} winning teams, each with its receipt. Add your six and NastyPlot scores it out of 100 against ${E(V2.phNum(F.teams))} real tournament teams.`})}
    <div class="ph-pile">${old}${top}<p class="ph-pile-leg">Each receipt is headed in its lead Pokémon's type colour.</p></div></section>
    ${V2.phListA(F)}${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };
