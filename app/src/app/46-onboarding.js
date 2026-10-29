// ---------- first visit + plain-language explainers ----------
// A short welcome on Home for first-time visitors (dismissed for good with "Got it"), and small "?" buttons next to
// the terms new players ask about. One popover at a time; tap outside or press Escape to close.
const TIPS = {
  readiness: ['Ready for the top threats', 'Of the 30 Pokémon that make top cut most often (weighted by how often), the share your team is prepared for. For each one we run real damage calcs with your sets against the set most players run: a Pokémon of yours that moves first and OHKOs it, survives and OHKOs back, or walls it and 2HKOs it is a solid answer; Intimidate, Will-O-Wisp, Wide Guard or Taunt are partial answers. Support Pokémon (Trick Room, screens, Follow Me) are judged by answers to what they do: Taunt, screen breakers, Fake Out, spread attacks, KOing the setter. Well handled = 2+ solid answers, Handled = 1, Shaky = partial only, Unanswered = none (one level lower if fewer than 3 of your six hold up against it, since you bring 4). It measures how many top threats your team has answers for. It is preparation, not a forecast: the player still decides the game.'],
  spread: ['Spread', 'How the 66 stat points are split across HP / Attack / Defense / Sp. Atk / Sp. Def / Speed (up to 32 each). We show the spread players use most for this Pokémon.'],
  rating: ['NastyPlot rating', 'A 0–100 score for every legal Pokémon from real tournament results: mostly how often it is on teams that reach top cut and how often strong players pick it, adjusted by whether it makes top cut more than its usage predicts and by its win rate. A “?” means few games so far, so treat it as an estimate.'],
  checklist: ['Checklist', 'The things most winning tournament teams have: speed control, spread damage, lead support (Fake Out, Intimidate or redirection), a Mega, no big shared weakness, items that work, and readiness for the top threats. ~ means partly there and is not counted as passed.'],

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
      <li><b>Read your scouting report</b><span>Which top threats your team is ready for, the checks it passes, and exactly what to fix.</span></li>
      <li><b>Plan each match</b><span>Scout their six, see who moves first, run the damage, and get a turn 1 plan.</span></li></ol>
    <p class="t2">The team below is a sample to explore. Replace it any time on My team.</p>
    <div class="row"><button type="button" class="btn go sm" data-view="auto">Build me a team</button><button type="button" class="btn sm" data-view="top">Copy a top team</button><button type="button" class="btn ghost sm" data-welcomex="1">Got it</button></div></div>`; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-welcomex],#welcomeCard [data-view]'); if (!b) return;
  try { LS.set('cc2.welcomed', '1'); } catch (er) {} const c = $('welcomeCard'); if (c && b.dataset.welcomex) c.remove(); });
