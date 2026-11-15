// ---------- How we calculate: the page (the sections, sources and helpers are in 63-method-data.js, shared with the new site, Nov 15) ----------
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-msec]'); if (!b) return; ui.msec = b.dataset.msec; try { closeTip(); } catch (x) {} }, true);
function renderMethod() { const el = $('methodOut'); if (!el) return; const g = META.model && META.model.games, teams = RES && RES.teams;
  const sub = [teams ? `Built from ${CH.n(teams)} tournament teams` : '', g ? `${CH.n(g)} games in the team model` : '', npFresh()].filter(Boolean).join(' · ');
  const T = META.track, tr = T ? `Tracking since ${npDay(T.since)} · ${T.ev.length} event${T.ev.length === 1 ? '' : 's'} checked` : 'Every rating is saved daily and checked against later events';
  const want = ui.msec; ui.msec = null;
  /* round words 2: the "Built from" sentence becomes number cells; the sentence and the intro go behind "?" (moved, not cut) */
  const tq = (k, t, b) => typeof tipText === 'function' ? tipText(k, t, b) : '';
  const fr = npFresh(), wc = (v, l) => `<span class="wdc"><b>${CH.n(v)}</b><small>${l}</small></span>`;
  const cells = teams || g ? `<div class="wdstats npstats"><div class="wdrow" role="group" aria-label="What the numbers are built from"><span class="wdl">${fr ? fr[0].toUpperCase() + fr.slice(1) : 'Built from'}<span class="wdq">${tq('npsrc', 'What the numbers are built from', (sub ? sub.replace(/ · /g, ', ') + '. ' : '') + "Every grade, rating and verdict here comes from real tournament results and real damage calcs. Tap a part to see exactly how it's worked out.")}</span></span>${teams ? wc(teams, 'tournament teams') : ''}${g ? wc(g, 'games') : ''}</div></div>` : '';
  el.innerHTML = CH.head('Reg M‑C doubles · plain words', 'How we calculate', cells ? '' : esc(sub || 'Every number on NastyPlot, and where it comes from.')).replace(/<\/div>$/, cells + '</div>')
    + `<p class="npintro wdsub">Real results and real damage calcs. Tap a part for the working.</p>` + npLegend()
    + NP_SECTIONS.map(([k, t, s, body]) => { let b = ''; try { b = body(); } catch (e) { b = '<p class="t2">This part needs the day’s data.</p>'; } return CH.fold('np_' + k, t, s, b, k === want).replace('<details ', `<details id="np-${k}" `); }).join('')
    + `<button type="button" class="nptrack" data-view="track"><span class="chk">Track record</span><b>How right have our ratings been?</b><span>${esc(tr)}</span><span class="arr" aria-hidden="true">→</span></button>`;
  if (want) { const d = $('np-' + want); if (d) { d.open = true; setTimeout(() => { try { d.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (e) {} }, 80); } } }
// entry points: "How we calculate →" under the grade's explanation (My team) and under the Ratings heading
CH.gradeWhy = (old => (G, o) => { const h = old(G, o); return h ? h.replace(/<\/div>$/, `<div class="nprow">${npLink('grade', 'How the grade works')}</div></div>`) : h; })(CH.gradeWhy);
CH.wrap('renderLair', () => { const sec = $('lair'), h = sec && sec.querySelector(':scope > .chpghead'); if (!h || sec.querySelector('.nplinks')) return;
  h.insertAdjacentHTML('afterend', `<div class="nplinks">${npLink('rating', 'How ratings work')}<button type="button" class="nplink" data-view="track">Track record <span aria-hidden="true">→</span></button></div>`); });
