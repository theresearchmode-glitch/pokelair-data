// ---------- Shady Paw, NastyPlot's mascot (Sim, Nov 8: "I love your ideas. lets see your vision through") ----------
// A PLACEHOLDER drawing until the illustrator's art arrives: same rules as the rest of the site (flat ink, PLOT blue eyes,
// the pink rim the Pokémon sprites have, leaning at the cards' slant). Five poses: smirk (default), think (loading),
// point (tips), cheer (grade went up), sleep (empty screens). He only appears in human moments, never beside grades or data.
// Swapping in the real art: replace the SVG bodies below with <img> tags of the five transparent PNGs; nothing else changes.
const SP_INK = '#17151F', SP_EYE = '#2F8EE6', SP_PINK = '#E8458B', SP_GOLD = '#F2B33D';
function spArt(pose, size) { pose = pose || 'smirk'; const s = size || 72, k = `fill="${SP_INK}" stroke="var(--sp-rim,${SP_PINK})" stroke-width="1" stroke-linejoin="round"`;
  const ears = `<path ${k} d="M33 32 30 8l16 12zM67 32l3-24-16 12z"/><path fill="${SP_PINK}" opacity=".75" d="M34 26 32 13l8 7zM66 26l2-13-8 7z"/>`;
  const head = `<path ${k} d="M32 40c0-14 8-22 18-22s18 8 18 22c0 12-8 18-18 18s-18-6-18-18z"/>`;
  const sly = `<path fill="${SP_EYE}" d="M38 39q6-6 11 0q-5 3-11 0zM51 39q5-6 11 0q-6 3-11 0z"/><path fill="${SP_INK}" d="M37 39q7-8 13-1v-4H37zM50 38q6-7 13 1v-4H50z"/><ellipse fill="${SP_INK}" cx="44" cy="39.5" rx=".9" ry="2.1"/><ellipse fill="${SP_INK}" cx="56" cy="39.5" rx=".9" ry="2.1"/>`;
  const smirk = `<path fill="none" stroke="${SP_PINK}" stroke-width="1.8" stroke-linecap="round" d="M47 48q4 3 9-1"/>`;
  const body = `<path ${k} d="M30 92c-4-22 2-38 20-42 18 4 24 20 20 42z"/>`, tail = `<path fill="none" stroke="${SP_INK}" stroke-width="6" stroke-linecap="round" d="M68 88c16-2 20-18 14-28"/><path fill="${SP_EYE}" d="m78 62 4-10 5 10z"/>`;
  let art;
  if (pose === 'sleep') art = `<ellipse ${k} cx="54" cy="76" rx="34" ry="16"/><path fill="none" stroke="${SP_INK}" stroke-width="6" stroke-linecap="round" d="M86 78c4 10-14 14-30 12"/>
    <path ${k} d="M18 70c0-10 6-16 14-16s14 6 14 16-6 12-14 12-14-2-14-12z"/><path ${k} d="m19 62-2-14 10 8zm26 0 2-14-10 8z"/>
    <path fill="none" stroke="${SP_EYE}" stroke-width="1.8" stroke-linecap="round" d="M23 69q3 2 6 0M35 69q3 2 6 0"/><text x="52" y="46" fill="${SP_EYE}" font-family="Unbounded,system-ui,sans-serif" font-weight="800" font-size="12">z</text><text x="62" y="36" fill="${SP_EYE}" font-family="Unbounded,system-ui,sans-serif" font-weight="800" font-size="9">z</text>`;
  else if (pose === 'cheer') art = `${tail}${body}<path fill="none" stroke="${SP_INK}" stroke-width="6" stroke-linecap="round" d="M36 62 24 40M64 62l12-22"/>${ears}${head}
    <path fill="none" stroke="${SP_EYE}" stroke-width="2.2" stroke-linecap="round" d="M39 40q5-6 10 0M51 40q5-6 10 0"/><path fill="${SP_PINK}" d="M45 47h10q-5 6-10 0z"/>
    <path fill="${SP_GOLD}" d="m18 26 2 5 5 2-5 2-2 5-2-5-5-2 5-2zm66-6 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/>`;
  else if (pose === 'point') art = `${tail}${body}<path fill="none" stroke="${SP_INK}" stroke-width="6.5" stroke-linecap="round" d="M62 64 88 56"/><circle fill="${SP_INK}" cx="89" cy="55.5" r="4.5"/>${ears}${head}${sly}${smirk}`;
  else if (pose === 'think') art = `${tail}${body}${ears}${head}<path fill="${SP_EYE}" d="M38 39q6-6 11 0q-5 3-11 0zM51 39q5-6 11 0q-6 3-11 0z"/><ellipse fill="${SP_INK}" cx="45" cy="37.6" rx=".9" ry="2"/><ellipse fill="${SP_INK}" cx="57" cy="37.6" rx=".9" ry="2"/>
    <path fill="none" stroke="${SP_INK}" stroke-width="6" stroke-linecap="round" d="M60 74q6-10 0-20"/><circle fill="${SP_INK}" cx="58" cy="53" r="4.5"/><path fill="none" stroke="${SP_PINK}" stroke-width="1.8" stroke-linecap="round" d="M46 48h6"/>`;
  else art = `${tail}${body}${ears}${head}${sly}${smirk}`;
  return `<svg class="sp-art sp-${pose}" viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true" focusable="false"><g transform="skewX(-6) translate(5 0)">${art}</g></svg>`; }
// his one line in an empty My Team (a little smug, never chatty)
const SP_LINE = 'Nothing here yet. Let’s plot something.';
// the places he appears, refreshed after every render: My Team with no team (big, with his line), tip bubbles (pointing)
function spPlace() {
  document.querySelectorAll('.chempty2:not([data-sp])').forEach(e => { e.dataset.sp = 1; e.insertAdjacentHTML('afterbegin', `<div class="sp-empty">${spArt('smirk', 112)}<p>${SP_LINE}</p></div>`); });
  const tp = document.getElementById('tipPop'); if (tp && !tp.querySelector('.sp-art')) tp.insertAdjacentHTML('afterbegin', `<span class="sp-tip">${spArt('point', 40)}</span>`); }
document.addEventListener('click', () => setTimeout(spPlace, 0), true);
let spRaf = 0; addEventListener('load', () => { spPlace(); try { new MutationObserver(() => { if (!spRaf) spRaf = requestAnimationFrame(() => { spRaf = 0; spPlace(); }); }).observe(document.body, {childList: true, subtree: true}); } catch (e) {} });
