// ---------- My Team: the frame (Sim, Nov 21; ported from the designer's party4 mock-up, not redrawn) ----------
// Three parts in one black frame: Your six (a numbered list), the one you tapped (big, with its whole set and its buttons) and
// Suggestions. The six are equal spots: no Lead / Back / Bench (Sim, Nov 20), no Box, no drag-and-drop. Every feature of today's six
// and editing panel is kept with today's hooks: data-tmsel (pick a Pokémon), data-v2edit (Edit Set), data-v2rep (Replace), data-v2rm
// (Remove), data-v2lock (Lock), data-v2mon (Pokémon Page), data-v2addto (an empty spot), data-v2gplan (the Game Plan sheet).
// Phone (under 1000): the six are one row of six taps and the tapped Pokémon opens right under it; desktop shows all six sets.
V2.MTF_W = {six: 'Your six', tap: 'tap one to see it', of: (k, n) => `${k} of ${n}`, add: 'Add a Pokémon', plan: "How to play this six against the meta's top six."};
V2.mtfImg = (n, cls = '') => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null; return id ? `<img class="${cls}" src="${V2.art(id)}" alt="" loading="lazy" decoding="async">` : ''; };
V2.mtfTy = t => V2.TYPES.includes(t) ? t : 'Normal';
// every width (Sim, Nov 21, 7:05 AM: squeezed names 'really rough'): the form on a small line above, the name one clean line, never squeezed
V2.mtfSplit = d => { const q = []; let mg = false; if (d.startsWith('Mega ')) { mg = true; q.push('Mega'); d = d.slice(5); }
  const rg = d.match(/^(Alolan|Galarian|Hisuian|Paldean) (.*)$/); if (rg) { q.push(rg[1]); d = rg[2]; }
  const pm = d.match(/^(.*) \((.*)\)$/); if (pm) { d = pm[1]; q.push({F: 'Female', M: 'Male'}[pm[2]] || pm[2]); }
  return `<span class="ns"><span class="q${mg ? ' mega' : ''}">${q.length ? V2.esc(q.join(' · ')) : '&nbsp;'}</span>${V2.esc(d).replace(/ ([XYZ])$/, '\u00a0$1')}</span>`; };
// one row of Your six: number, picture, name, item · Ability, rating and tier, the four moves 2×2; its left edge in its first type's colour
V2.mtfRow = (D, m, sel) => { const E = V2.esc, k = D.ms.indexOf(m), on = m === sel, R = monRating(m.p), it = m.heldItem || m.item || 'No item', lk = !!(S.slots[m.i] && S.slots[m.i].lock), d = V2.disp(m.p.n);
  const mv = m.moves.filter(Boolean).map(v => `<i style="--tc:var(--ty-${V2.mtfTy(v.type)})">${E(v.name)}</i>`).join('');
  return `<button type="button" class="mtf-row tm-pick${on ? ' on' : ''}${lk ? ' locked' : ''}" style="--c:var(--ty-${V2.mtfTy((m.p.t || [])[0])})" data-tmsel="${k}" aria-pressed="${on}" aria-label="${E(d)}, spot ${m.i + 1}${R ? `, rated ${R.n}${R.tier ? ' ' + E(R.tier) + ' tier' : ''}` : ''}, ${E(it)}${lk ? ', locked' : ''}">
    <i class="no u" aria-hidden="true">${m.i + 1}</i>${V2.mtfImg(m.p.n, 'pic')}<span class="nm"><b class="u">${V2.mtfSplit(d)}</b><small>${V2.keepForm(E(it))} · ${E(m.ability || 'None')}</small></span>
    ${R ? `<em class="rt u" aria-hidden="true"><b>${R.n}</b>${R.tier ? `<span>${E(R.tier)} tier</span>` : ''}</em>` : ''}${lk ? '<svg class="lkm" viewBox="0 0 24 24" role="img" aria-label="Locked"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg>' : ''}<span class="m4" aria-hidden="true">${mv}</span></button>`; };
// an empty spot (a team of one to five): a dashed row that opens today's Pokémon picker for that spot (design question for Sim, brief s1)
V2.mtfAdd = i => `<button type="button" class="mtf-row mtf-add" data-v2addto="${i}" aria-label="Add a Pokémon to slot ${i + 1}"><i class="no u" aria-hidden="true">${i + 1}</i><span class="plus" aria-hidden="true">+</span><span class="nm"><b class="u">Add<span class="mtf-addr"> a Pokémon</span></b><small>Spot ${i + 1}</small></span></button>`;
// the one you tapped: ‹ name k of n ›, a stage in its two type colours with the rating big, then its types, Item and Ability, nature and
// stat points (today's editing panel), the four moves as big bars, and Edit Set / Replace / Remove; Lock and Pokémon Page kept beside them
V2.mtfDetail = (D, sel) => { const E = V2.esc, {ms} = D; if (!sel || !ms.includes(sel)) return ''; const k = ms.indexOf(sel), R = monRating(sel.p), N = natInfo(sel), lk = !!(S.slots[sel.i] && S.slots[sel.i].lock), d = V2.disp(sel.p.n), t = sel.p.t || [], it = sel.heldItem || sel.item || 'No item';
  const mv = sel.moves.filter(Boolean).map(v => `<li style="--tc:var(--ty-${V2.mtfTy(v.type)})">${E(v.name)}</li>`).join('');
  return `<section class="mtf-sum" id="tm-set" aria-label="${E(d)}, ${V2.MTF_W.of(k + 1, ms.length)}" style="--c:var(--ty-${V2.mtfTy(t[0])});--c2:var(--ty-${V2.mtfTy(t[1] || t[0])})">
    <div class="mtf-bar mtf-nav"><button type="button" class="mtf-step" data-mtfstep="-1" aria-label="Previous Pokémon"${ms.length < 2 ? ' disabled' : ''}>‹</button><h2 class="u">${V2.nameHtml(d)}</h2><span>${V2.MTF_W.of(k + 1, ms.length)}</span><button type="button" class="mtf-step" data-mtfstep="1" aria-label="Next Pokémon"${ms.length < 2 ? ' disabled' : ''}>›</button></div>
    <div class="mtf-stage">${R ? `<p class="rate u" aria-label="Rated ${R.n}${R.tier ? ', ' + E(R.tier) + ' tier' : ''}"><b>${R.n}</b>${R.tier ? `<span>${E(R.tier)} tier</span>` : ''}</p>` : ''}${V2.mtfImg(sel.p.n, 'big')}</div>
    <div class="mtf-inf"><div class="ms-ty mtf-ty">${t.map(V2.typeChip).join('')}</div>
      <dl class="mtf-ia"><div><dt>Item</dt><dd>${V2.keepForm(E(it))}</dd></div><div><dt>Ability</dt><dd>${E(sel.ability || 'None')}</dd></div>${N.nat ? `<div><dt>Nature</dt><dd>${E(N.nat)}${N.natNote ? ` <small>${V2.noteWord(N.natNote)}</small>` : ''}</dd></div>` : ''}${N.words ? `<div><dt>Stat points</dt><dd>${E(N.words)}${N.ptsNote ? ` <small>${V2.noteWord(N.ptsNote)}</small>` : ''}</dd></div>` : ''}</dl>
      ${mv ? `<ul class="mtf-mv" aria-label="Moves">${mv}</ul>` : ''}
      <div class="mtf-do"><button type="button" class="mtf-btn u" data-v2edit="${sel.i}">Edit Set</button><button type="button" class="mtf-btn u ghost" data-v2rep="${sel.i}" aria-label="Replace ${E(d)}: pick the Pokémon to take its place">Replace</button><button type="button" class="mtf-btn u red" data-v2rm="${sel.i}" aria-label="Remove ${E(d)} from your team">Remove</button></div>
      <p class="mtf-more"><button type="button" class="np-link sx-a${lk ? ' on' : ''}" data-v2lock="${sel.i}" aria-pressed="${lk}" aria-label="${lk ? 'Unlock' : 'Lock'} ${E(d)}: suggestions never swap out a locked Pokémon">${lk ? 'Unlock' : 'Lock'}</button><button type="button" class="np-link sx-info" data-v2mon="${E(sel.p.n)}">Pokémon Page ›</button></p></div></section>`; };
V2.mtfFrame = (D, sel, sg) => { const {ms} = D, at = i => ms.find(m => m.i === i);
  const rows = [0, 1, 2, 3, 4, 5].map(i => at(i) ? V2.mtfRow(D, at(i), sel) : V2.mtfAdd(i)).join(''); /* the six in the team's own slot order (Sim, Nov 20: no plan order) */
  return `<div class="mtf"><div class="mtf-party" role="group" aria-label="${V2.MTF_W.six}"><p class="mtf-bar"><b class="u">${V2.MTF_W.six}</b><span>${V2.MTF_W.tap}</span></p><div class="mtf-rows">${rows}</div></div>
    ${V2.mtfDetail(D, sel)}<div class="mtf-sg">${sg || ''}</div></div>
    ${ms.length >= 6 ? `<button type="button" class="mtf-plan" data-v2gplan aria-label="Game Plan: ${V2.MTF_W.plan}"><b class="u">Game Plan ›</b><span>${V2.MTF_W.plan}</span></button>` : ''}
    ${ms.length ? `<p class="mtf-lead">Who leads depends on who you face. <a class="np-link" href="#battle">Plan it in Battle ›</a></p>` : ''}`; }; /* the lead advice lives in Battle (Sim, Nov 20: 'that should be done in the lead calc'); the line Sim saw on Nov 20 stays, under the Game Plan */
// ‹ › in the detail bar: the previous / next Pokémon
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-mtfstep]'); if (!b) return; const D = V2.teamData(); if (!D || !D.ms.length) return;
  const n = D.ms.length, k = Math.min(V2.ui.sel, n - 1); V2.ui.sel = (k + +b.dataset.mtfstep + n) % n; V2.ui.picked = true; V2.redraw();
  requestAnimationFrame(() => { const x = document.querySelector(`#main [data-mtfstep="${b.dataset.mtfstep}"]`); if (x) x.focus({preventScroll: true}); }); });
// each name in Your six stays on ONE line (the brief's flaw: names broke mid-word, "Whimsi-cott"); it is narrowed to fit
// (scaleX, down to 0.7, as Build's chips) and only then cut with "…"; "Mega" sits on its own small line above the name
V2.mtfFit = () => { /* every width (Nov 21): a long name is never cut ('…') or split inside a word, and never over two lines
  (Sim, Nov 18 C). One line, narrowed down to 70%; if that is not enough it wraps at spaces in a wider box (at most two lines) that is
  then narrowed to the tile (down to 55%), so 'Paldean Tauros (Combat)' in a 55px tile reads 'Paldean Tauros / (Combat)' */
  document.querySelectorAll('#main .mtf-row:not(.mtf-add) .nm b').forEach(b => { b.style.transform = ''; b.style.whiteSpace = ''; b.style.width = ''; const c = b.parentElement.clientWidth; if (!(c > 0) || b.querySelector('.ns')) return; /* the split name never needs narrowing */
    const n = b.scrollWidth; if (n <= c) return; if (n * 0.7 <= c - 2) { b.style.transform = `scaleX(${((c - 2) / n).toFixed(3)})`; return; }
    const mg = b.querySelector('.mg'), mh = mg ? mg.offsetHeight : 0, lh = parseFloat(getComputedStyle(b).lineHeight) || 15; b.style.whiteSpace = 'normal';
    let k = 0.95; for (; k > 0.49; k -= 0.05) { b.style.width = `${Math.floor((c - 2) / k)}px`; if (b.scrollWidth <= Math.floor((c - 2) / k) && b.offsetHeight - mh <= lh * 2 + 1) break; }
    k = Math.max(0.5, k); b.style.width = `${Math.floor((c - 2) / k)}px`; b.style.transform = `scaleX(${k.toFixed(3)})`; }); };
{ let t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => V2.mtfFit && V2.mtfFit(), 120); }); }
// '#team=set|mu|sg|ck' (old phone-tab links; h12 found them dead in the frame): in the frame there are no tabs, so the page scrolls once
// to that section (its scroll-margin keeps the heading under the sticky bars) and focuses its heading
{ const want = u => { const m = /#team=(set|mu|sg|ck)$/.exec(u || ''); return m ? m[1] : ''; };  /* the router turns '#team=sg' into '#team' before the page draws, so the wish is read from the URL as it arrived */
  V2._mtfWant = want(location.hash); addEventListener('hashchange', e => { const w = want(e.newURL); if (w) V2._mtfWant = w; }); }
V2.mtfHashJump = () => { const k = V2._mtfWant; if (!k || !document.querySelector('#main .mtf')) return; V2._mtfWant = '';
  requestAnimationFrame(() => { const e = document.getElementById('tm-' + k); if (!e) return; e.scrollIntoView({block: 'start'}); const h = e.querySelector('h2, h3'); if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({preventScroll: true}); }
    /* Suggestions finish about a second later and grow (+360px at 390), which pushed Matchups and Team Checks down (h16): for 4 s,
       while the player hasn't scrolled, the section is brought back under the bars whenever the page grows */
    let moved = false; const stop = () => { moved = true; }; ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(t => addEventListener(t, stop, {once: true, passive: true}));
    const ro = new ResizeObserver(() => { const x = document.getElementById('tm-' + k); if (!moved && x) x.scrollIntoView({block: 'start'}); }); const m = document.getElementById('main'); if (m) ro.observe(m);
    setTimeout(() => { ro.disconnect(); ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(t => removeEventListener(t, stop)); }, 4000); }); };
