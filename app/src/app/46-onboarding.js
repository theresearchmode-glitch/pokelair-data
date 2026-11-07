// ---------- first visit + plain-language explainers ----------
// A short welcome on Home for first-time visitors (dismissed for good with "Got it"), and small "?" buttons next to
// the terms new players ask about. One popover at a time; tap outside or press Escape to close.
const TIPS = {
  readiness: ['Ready for the top threats', 'Of the 30 Pokémon that make top cut most often (weighted by how often), the share your team is prepared for. Well handled counts in full, Handled 80%, Shaky 40% and Unanswered 0. For each one we run real damage calcs with your sets against the set most players run: a Pokémon of yours that moves first and OHKOs it, survives and OHKOs back, or walls it and 2HKOs it is a solid answer; Intimidate, Will-O-Wisp, Wide Guard or Taunt are partial answers. Support Pokémon (Trick Room, screens, Follow Me) are judged by answers to what they do: Taunt, screen breakers, Fake Out, spread attacks, KOing the setter. Well handled = 2+ solid answers, Handled = 1, Shaky = partial only, Unanswered = none (one level lower if fewer than 3 of your six hold up against it, since you bring 4). It measures how many top threats your team has answers for. It is preparation, not a forecast: the player still decides the game.'],
  spread: ['Spread', 'How the 66 stat points are split across HP / Attack / Defense / Sp. Atk / Sp. Def / Speed (up to 32 each). We show the spread players use most for this Pokémon.'],
  /* Nov 2: the rating reads like a school grade; the scale, the rank and the "?" in plain words, no multipliers */
  rating: ['What a rating means', 'Ratings read like school grades: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50. They come from real tournament results, mostly how often a Pokémon is on teams that make top cut and how often strong players pick it. “#20 of N” is its rank among the N Pokémon with tournament results. A “?” means few games so far, so treat it as an estimate.'],
  bars: ['What the bars mean', 'Each bar ranks this Pokémon among the Pokémon with tournament results: 94 means it beats 94% of them, so it is in the top 6%. The colours are the same grade bands as the rating.'],
  tiers: ['Tiers', 'Each tier is a grade band: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50. The number is the rating; tap a Pokémon for its rank and the full breakdown.'],
  numbers: ['How to read our numbers', 'Numbers read like school grades. Pokémon ratings: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50. Team grades: how often the six should win against today\'s tournament field (its Pokémon, pairs and sets, plus its own record with players\' skill taken out); the letter is its rank among real teams: A top 10%, B next 20%, C middle 40%, D next 20%, F bottom 10%. Matchups (% ready, handled, shaky) are shown on their own: they say what beats the team. Bars are a rank among all Pokémon (94 = better than 94% of them). A % always says what it is of: % of teams, % wins, % ready.'],
  checklist: ['Checklist', 'The things most winning tournament teams have: speed control, spread damage, lead support (Fake Out, Intimidate or redirection), a Mega, no big shared weakness, items that work, and readiness for the top threats. ~ means partly there and is not counted as passed.'],

};
/* the rating tip names the real count (it was a fixed "#20 of 313", Nov 4): read when the "?" opens, from the same rank as the sheet */
{ const base = TIPS.rating; Object.defineProperty(TIPS, 'rating', {configurable: true, enumerable: true, get() { let n = null; try { const k = lairRank(lairRows()[0].p); n = k && k.of; } catch (e) {}
  return n ? [base[0], base[1].replace(/N\b/g, String(n))] : [base[0], base[1].replace('“#20 of N” is its rank among the N Pokémon', '“#20 of …” is its rank among the Pokémon')]; }, set(v) { Object.defineProperty(TIPS, 'rating', {value: v, writable: true, configurable: true, enumerable: true}); }}); }
const tip = k => TIPS[k] ? `<button type="button" class="tipq" data-tip="${k}" aria-expanded="false" aria-label="${/^(What|How)\b/.test(TIPS[k][0]) ? esc(TIPS[k][0]) : `What is ${esc(TIPS[k][0])}?`}">?</button>` : '';
/* round words (Sim: "some of our pages can be very wordy"): fine print built from live data (sources, rules, thresholds) goes behind the
   same "?" as the fixed tips. tipText registers the text under a key and returns the button; the text is not shortened, only moved. */
const tipText = (k, title, body) => { TIPS[k] = [title, body]; return tip(k); };
function closeTip() { const p = $('tipPop'); if (p) p.remove(); document.querySelectorAll('[data-tip][aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-tip]');
  if (!b) { if (!(e.target.closest && e.target.closest('#tipPop'))) closeTip(); return; }
  e.preventDefault(); e.stopPropagation(); const open = $('tipPop'); if (open && open.dataset.k === b.dataset.tip) { closeTip(); return; } closeTip();
  const [t, d] = TIPS[b.dataset.tip] || []; if (!t) return;
  const p = document.createElement('div'); p.id = 'tipPop'; p.className = 'tippop'; p.dataset.k = b.dataset.tip; p.setAttribute('role', 'dialog');
  p.innerHTML = `<b>${esc(t)}</b><p>${esc(d)}</p>${typeof methodTipLink === 'function' ? methodTipLink(b.dataset.tip) : ''}`; document.body.appendChild(p); b.setAttribute('aria-expanded', 'true');
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
    <div class="row"><button type="button" class="btn go sm" data-view="auto">Build me a team</button><button type="button" class="btn sm" data-view="top">Copy a top team</button><button type="button" class="btn sm" data-welcomex="1">Got it</button></div></div>`; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-welcomex],#welcomeCard [data-view]'); if (!b) return;
  try { LS.set('cc2.welcomed', '1'); } catch (er) {} const c = $('welcomeCard'); if (c && b.dataset.welcomex) c.remove(); });
