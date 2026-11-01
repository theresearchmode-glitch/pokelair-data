// ---------- PROPOSALS (preview only, Nov 1) ----------
// Mockups for Sim to choose from; nothing here is on unless the preview switch is set:
//   localStorage np.mock = "paths-a" | "paths-b" | "short"   (or several, comma separated)
// paths-a / paths-b: Home with three clear starting paths (3b). short: shorter Home and My team (5a).
// Not for the live page until Sim picks; the lead drops this part (and its parts.json line) or turns one into the real thing.
const NPM = (() => { try { return String(JSON.parse(localStorage.getItem('np.mock') || '""')).split(','); } catch (e) { return []; } })();
const npOn = k => NPM.includes(k);
// 3b · three paths. The yellow (main) button follows the player: no team yet → "Build me a team"; a team → "Grade it".
function npPaths(variant) { const ms = members(), has = ms.length > 0, main = has ? 'grade' : 'build';
  const P = [['build', 'auto', 'I have no team', 'Build me a team', 'Six picked from your box and the meta', '<path d="M12 3v18M3 12h18"/>'],
    ['grade', 'report', 'I have a team', 'Grade it', has ? `${ms.length}/6 in · see what beats it and what to fix` : 'Paste or pick your six, get a grade and fixes', '<path d="m5 13 4 4L19 7"/>'],
    ['plan', 'matchup', 'I have a match soon', 'Plan the matchup', 'Type their six: leads, your four, turn 1', '<path d="M5 19 19 5M14 5h5v5M5 5l5 5M19 19l-5-5"/>']];
  if (variant === 'a') return `<div class="npaths">${P.map(([k, v, q, t, d, ic]) => `<button type="button" class="nppath${k === main ? ' main' : ''}" data-view="${v}"><span class="npic"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg></span><span class="nptx"><small>${q}</small><b>${t}</b><span>${d}</span></span><span class="npgo" aria-hidden="true">➜</span></button>`).join('')}</div>`;
  const sel = ui.npPath || main, cur = P.find(x => x[0] === sel);
  return `<div class="npb"><div class="chk">Where are you?</div><div class="seg npseg" role="group" aria-label="Where are you?">${P.map(([k, , q]) => `<button type="button" data-nppath="${k}" aria-pressed="${k === sel}">${q.replace(/^I have /, '').replace(/^no team$/, 'No team yet').replace(/^a team$/, 'Have a team').replace(/^a match soon$/, 'Match soon')}</button>`).join('')}</div>
    <button type="button" class="${sel === main ? 'chprimary' : 'chghost'} npgo2" data-view="${cur[1]}">${cur[3]} <span aria-hidden="true">➜</span></button><p class="t2 npd">${cur[4]}</p></div>`; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-nppath]'); if (!b) return; ui.npPath = b.dataset.nppath; safe('home', renderHome); });
if (NPM.some(Boolean)) {
  const homeOld = renderHome;
  renderHome = function () { homeOld.apply(this, arguments);
    const acts = document.querySelector('[data-pane="home"] .chmacts');
    if (acts && (npOn('paths-a') || npOn('paths-b'))) acts.outerHTML = npPaths(npOn('paths-a') ? 'a' : 'b');
    if (npOn('short')) safe('short home', npShortHome); };
  // 5a · Home: champion's six and your six in one card (two rows of six), the tools as 6 + "All tools"
  function npShortHome() { const pane = document.querySelector('[data-pane="home"]'); if (!pane) return;
    const them = pane.querySelector('.chmcard.them'), you = pane.querySelector('.chmcard.you'); if (them && you && !pane.querySelector('.npvs')) {
      const strip = (card, cls) => { const g = card.querySelector('.chmgrid'); if (g) g.classList.add('npstrip', cls); };
      strip(them, 'r'); strip(you, 'b'); them.classList.add('npcompact'); you.classList.add('npcompact'); }
    const tiles = pane.querySelector('.htiles'); if (tiles && !tiles.dataset.np) { tiles.dataset.np = '1'; [...tiles.children].slice(6).forEach(x => x.hidden = true);
      tiles.insertAdjacentHTML('afterend', `<button type="button" class="chsec chmorebtn npmore">All ${tiles.children.length} tools ›</button>`);
      tiles.nextElementSibling.addEventListener('click', ev => { [...tiles.children].forEach(x => x.hidden = false); ev.currentTarget.remove(); }); } }
  // 5a · My team: one suggestion first (See all suggestions has the rest), the open team sheet as a 3-across grid
  if (npOn('short')) { const chOld = chTeamRender; chTeamRender = function () { chOld.apply(this, arguments); document.documentElement.classList.add('np-short'); }; }
}
