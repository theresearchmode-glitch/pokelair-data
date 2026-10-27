// ---------- first visit + plain-language explainers ----------
// A short welcome on Home for first-time visitors (dismissed for good with "Got it"), and small "?" buttons next to
// the terms new players ask about. One popover at a time; tap outside or press Escape to close.
const TIPS = {
  teamscore: ['Team Score', 'Where your team stands among real tournament teams from the last 45 days: 50 is a typical tournament team. 75+ is Winner level (a typical recent event winner scores in the high 70s), 90+ is Elite. Winning also takes skill and reads, so even great teams rarely score 100. It comes from our win model, trained on real games with player skill removed and checked on events it never saw. Upside needs proof: a mix players haven\'t tried together, or a team without speed control, lead support, spread damage or a Mega, gets its edge cut; only your two best Megas count; and items and moves count (when the model has rated them) only as far as builds real players run. The rest of the checklist is advice and does not change the score.'],
  spread: ['Spread', 'How the 66 stat points are split across HP / Attack / Defense / Sp. Atk / Sp. Def / Speed (up to 32 each). We show the spread players use most for this Pokémon.'],
  rating: ['NastyPlot rating', 'A 0–100 score for every legal Pokémon from real tournament results: mostly how often it is on teams that reach top cut, adjusted by whether it makes top cut more than its usage predicts and by its win rate. A “?” means few games so far, so treat it as an estimate.'],
  winmodel: ['Win chance', 'Our model learned from real tournament games which Pokémon and pairs win (plus items and moves, when there are enough games to rate them), with player skill taken out. It is checked against recent events it never saw, and only used because it beats plain win rates.'],
  checklist: ['Checklist', 'The things most winning tournament teams have: speed control, spread damage, lead support (Fake Out, Intimidate or redirection), a Mega, and no big shared weakness.'],
};
const tip = k => TIPS[k] ? `<button type="button" class="tipq" data-tip="${k}" aria-label="What is ${esc(TIPS[k][0])}?">?</button>` : '';
function closeTip() { const p = $('tipPop'); if (p) p.remove(); }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-tip]');
  if (!b) { if (!(e.target.closest && e.target.closest('#tipPop'))) closeTip(); return; }
  e.preventDefault(); e.stopPropagation(); const open = $('tipPop'); if (open && open.dataset.k === b.dataset.tip) { closeTip(); return; } closeTip();
  const [t, d] = TIPS[b.dataset.tip] || []; if (!t) return;
  const p = document.createElement('div'); p.id = 'tipPop'; p.className = 'tippop'; p.dataset.k = b.dataset.tip; p.setAttribute('role', 'dialog');
  p.innerHTML = `<b>${esc(t)}</b><p>${esc(d)}</p>`; document.body.appendChild(p);
  const r = b.getBoundingClientRect(), w = Math.min(300, innerWidth - 24); p.style.width = w + 'px';
  const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)); p.style.left = left + 'px';
  const below = r.bottom + 8 + p.offsetHeight < innerHeight - 90; p.style.top = (below ? r.bottom + 8 : Math.max(12, r.top - 8 - p.offsetHeight)) + scrollY + 'px'; }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTip(); });
addEventListener('scroll', closeTip, {passive: true});
// welcome card for first-time visitors
function welcomeCard() { let seen = false; try { seen = !!LS.get('cc2.welcomed', ''); } catch (e) {} if (seen) return '';
  return `<div class="welcome" id="welcomeCard"><div class="wk">New here?</div><div class="wt">How NastyPlot works</div>
    <ol class="wsteps">
      <li><b>Get a team</b><span>Let us build one from real winning teams, copy a top team, or type your own six.</span></li>
      <li><b>Check your Team Score</b><span>One number for how ready it is, with exactly what to fix.</span></li>
      <li><b>Plan each match</b><span>Scout their six, see who moves first, run the damage, and get a turn 1 plan.</span></li></ol>
    <p class="t2">The team below is a sample to explore. Replace it any time on the Team page.</p>
    <div class="row"><button type="button" class="btn go sm" data-view="auto">Build me a team</button><button type="button" class="btn sm" data-view="top">Copy a top team</button><button type="button" class="btn ghost sm" data-welcomex="1">Got it</button></div></div>`; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-welcomex],#welcomeCard [data-view]'); if (!b) return;
  try { LS.set('cc2.welcomed', '1'); } catch (er) {} const c = $('welcomeCard'); if (c && b.dataset.welcomex) c.remove(); });
