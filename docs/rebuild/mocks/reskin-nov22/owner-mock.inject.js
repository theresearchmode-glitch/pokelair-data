// Owner page (#owner, only Sim sees it) direction mock-up, Nov 22 (helper hM). Lowest priority; PAGES.md: "keep it plain in the kit".
// MOCK-UP ONLY: injected into the real built page (test hook __ev), drawn as if the viewer were the owner (V2.OWN). My copy has no usage or
// feedback documents (the Preview can't read them), so the two boxes show today's own "can't read here" words; NOTHING is invented.
// Kept: data-ownuse / data-ownfb (V2.ownerFill fills them on the real site, tables own-tab, own-fb and own-sum unchanged).
(() => { const css = `<style>
.owm .k-head .k-kicker{display:table;width:max-content}
.owm-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 48px;align-items:start}
.owm-box{min-height:160px;padding:20px 24px;background:var(--k-card);box-shadow:inset 4px 0 0 var(--k-plot),0 6px 18px var(--k-card-shadow)}
.owm-box h2{margin:0 0 12px;font-size:var(--t28);line-height:1.1;color:var(--k-ink)}
.owm-box .fine{font-size:var(--t15);color:var(--k-ink2)}
.owm .k-plan{padding-bottom:32px}
@media (max-width:959.98px){.owm-two{grid-template-columns:minmax(0,1fr)}}@media (max-width:699.98px){.owm-box{min-height:0;padding:16px}.owm-box h2{font-size:var(--t22)}.owm .k-sec,.owm .k-n{display:none}.owm-two{gap:12px;padding-top:20px}.owm .k-plan{padding-bottom:16px}}
</style>`;
const head = `<div class="k-head"><p class="k-kicker">OWNER · ONLY YOU SEE THIS</p><h1 class="k-h1 u">What people<br><em>use and say.</em></h1><p class="k-lead">Anonymous counts and feedback. No names, nothing typed except feedback people chose to send.</p></div>`;
const use = `<section class="owm-box"><h2 class="u">What they use.</h2><div data-ownuse><p class="fine">The preview can't read the counts. They show on the real site.</p></div></section>`;
const say = `<section class="owm-box"><h2 class="u">What they say.</h2><div data-ownfb><p class="fine">The preview can't read feedback. It shows on the real site.</p></div></section>`;
document.querySelector('#main').innerHTML = css + `<div class="ra gsp infp owm" style="display:block">${head}${V2.kPlan(V2.kStep(1, 'The counts and the notes.', 'newest first · people, not visits', `<div class="owm-two">${use}${say}</div>`))}</div>`; scrollTo(0, 0); })();
