// ---------- My Team › Suggestions (R4, Nov 11): the controls, the cards and what sits around them ----------
// Every setting, list, number and word comes from today's shared logic (36-sug-data.js, 29-fix-planner.js, 36-lanes.js);
// this file only draws them in the new design and passes taps back. The planner run itself is in team.js (V2.plan).

// ---------- the settings: today's sliders, same choices, same saved settings, same messages ----------
V2.sgCtl = () => `<div class="sg2-ctl" role="group" aria-label="Suggestion settings">
  <div class="sg2-c sg2-pool"><span class="sg2-k">Suggest from</span>${V2.slide('sgpool', [['box', 'My Box'], ['boxfill', 'Box + catch'], ['all', 'Whole roster']], ui.pool, 'Suggest from')}</div></div>`;
// a new choice: the setting and its message at once; the page redraws once the plate has slid over (so the slide is seen)
V2.sgLater = fn => { clearTimeout(V2._sgT); V2._sgT = setTimeout(fn, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240); };
document.addEventListener('v2slide', e => { const {key, value} = e.detail;
  if (key === 'sgpool') { if (value === ui.pool) return; const say = setPool(value); toast(say); V2.sgLater(render); } });

// ---------- the section ----------
V2.sgSec = D => { const S2 = D.sug; if (!S2) return '';
  const side1 = (m, cls) => { const P = m.p || m; return `<span class="tm-sw${cls}"><img src="${V2.art(SPRITE_ID[P.n])}" alt=""><span>${V2.nameHtml(m.d || V2.disp(P.n))}</span></span>`; };
  const swap = x => `<div class="tm-chg" aria-label="${x.out ? V2.esc(x.out.d) + ' out, ' : 'Add '}${V2.esc(x.c.p.d)}${x.out ? ' in' : ''}">${x.out ? side1(x.out, '') : '<span class="tm-sw"></span>'}<span class="tm-ar" aria-hidden="true">${x.out ? '→' : '+'}</span>${side1(x.c.p, ' in')}</div>`;
  const body = S2.pending ? '<p class="tm-sub" role="status">Working out the best changes for your team…</p>'
    : S2.none ? '<p class="tm-sub">Nothing raises this team’s Strength Score right now, and every other swap would lower it.</p>'
    : `<p class="tm-sub">${S2.side ? 'Nothing raises this team’s Strength Score right now. These swaps keep every check and about the same score, with a different look:' : 'What to change, best first.'}</p>
    <ol class="tm-sug">${S2.top.map((x, k) => `<li><span class="np-eyebrow">Suggestion ${k + 1}</span>${x.d != null ? `<div class="tm-mv"><b>${x.d > 0 ? '+' + x.d : x.d < 0 ? '−' + Math.abs(x.d) : '±0'}</b><span>${x.r0} → ${x.r1}${x.word ? ' · ' + V2.esc(x.word) : ''}</span></div>` : ''}<div class="tm-swaps">${x.pl.ch.map(swap).join('')}</div><button type="button" class="np-btn" data-v2plan="${k}">Apply</button></li>`).join('')}</ol>`;
  return `<section class="tm-sec tm-sgs" id="tm-sg"><h2 class="u">Suggestions</h2>${V2.sgCtl()}${body}</section>`; };

// ---------- Apply (today's applyPlan: Undo kept, what it swapped out isn't offered straight back) ----------
// a second tap within half a second is ignored, as on today's page (a double tap can't apply two suggestions)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2plan]'); if (!b) return; const now = Date.now(); if (now - (V2._sgTap || 0) < 450) return; V2._sgTap = now;
  const pl = (ui.planList || [])[+b.dataset.v2plan]; if (!pl) return; applyPlan(pl); render(); toast(`Applied: ${pl.ch.map(x => x.c.p.d).join(' and ')}`, true); });
