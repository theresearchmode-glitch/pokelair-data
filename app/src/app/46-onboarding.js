// ---------- first visit + plain-language explainers ----------
// A short welcome on Home for first-time visitors (dismissed for good with "Got it"), and small "?" buttons next to
// the terms new players ask about. One popover at a time; tap outside or press Escape to close.
/* TIPS (the explainers' words) live in 36-sug-data.js, shared with the rebuild (R4, Nov 11) */
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
  /* Darkrai (Sim's plan: tip bubbles, Nov 9): small, peeking over the bubble's corner; decoration only (alt=""), never on data */
  const dk = typeof window !== 'undefined' && window.NP_MASCOT ? `<img class="tipdk" src="${window.NP_MASCOT}" alt="" width="48" height="48" decoding="async">` : '';
  p.innerHTML = `${dk}<b>${esc(t)}</b><p>${esc(d)}</p>${typeof methodTipLink === 'function' ? methodTipLink(b.dataset.tip) : ''}`; if (dk) p.classList.add('hasdk'); document.body.appendChild(p); b.setAttribute('aria-expanded', 'true');
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
