// Page not found (any bad hash, #notfound) direction mock-up, Nov 22 (helper hM). PAGES.md: "WRONG TURN: the underdog + a way home".
// MOCK-UP ONLY: injected into the real built page (test hook __ev). Today's words (V2.nfHtml) and today's underdog (V2.underdog, the same
// rotating featured Pokémon as the empty My Team; celebrated, never mocked); data-v2nf stays (the title 'Page not found' hangs on it).
(() => { const E = V2.esc, n = V2.underdog ? V2.underdog() : 'Flapple', d = V2.disp(n);
const css = `<style>
.nfm.nf-pg{display:block;max-width:none;width:auto}.nfm .k-h1{max-width:none}
.nfm .k-head .k-kicker{display:table;width:max-content}
.nfm-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,320px);gap:24px 64px;align-items:end;padding-bottom:48px}
.nfm .k-go{margin-top:28px}
.nfm-dog{position:relative;margin-top:120px}
.nfm-dog .k-scrib{position:absolute;left:-220px;top:150px;max-width:200px;text-align:right;font-size:var(--t20);line-height:1.2}
@media (max-width:699.98px){.nfm-two{grid-template-columns:minmax(0,1fr);gap:8px;padding-bottom:24px}.nfm-dog{display:grid;grid-template-columns:150px minmax(0,1fr);align-items:end;gap:12px;margin:64px 0 0}.nfm-dog .k-scrib{position:static;text-align:left;max-width:none;order:2;align-self:center}.nfm-dog .k-plate{min-height:0;padding:96px 10px 10px}.nfm-dog .k-art{top:-56px;height:150px}.nfm-dog .k-name{font-size:var(--t20)}.nfm .k-go{margin-top:12px}.nfm .k-lead{font-size:var(--t15);margin-top:4px}.nfm .k-kicker{margin-top:8px}}
</style>`;
const head = `<div class="k-head"><p class="k-kicker">PAGE NOT FOUND · WRONG TURN</p><h1 class="k-h1 u">Nothing here.<br><em>Wrong turn.</em></h1><p class="k-lead">This address doesn't match a page on NastyPlot. It may be an old or mistyped link.</p>${V2.kGo('GO TO HOME.', {href: '#home'})}</div>`;
const dog = `<aside class="nfm-dog nf-dog" aria-label="Today's underdog">${V2.kScrib(`Lost? ${d}'s been here all along.`)}${V2.kCard(n, {size: 'hero', form: "Today's underdog", fact: 'Tap to meet it', attrs: {'data-v2mon': n, class: 'nf-dogst', 'aria-label': `${d}: open its info`}})}</aside>`;
document.querySelector('#main').innerHTML = css + `<div class="ra gsp nf-pg nfm" data-v2nf><div class="nfm-two">${head}${dog}</div></div>`; scrollTo(0, 0); })();
