// About (#about) direction mock-up, Nov 22 (helper hM). PAGES.md: "THE CREW BEHIND IT: the promise chips + privacy, plain and friendly".
// MOCK-UP ONLY: injected into the real built page (test hook __ev). The words are today's (V2.ABT_SAVED, ABT_PARTS through V2.pages.about.draw();
// the seven <details class="inf-row" id="abt-…"> are moved over as they are, so '#about=<part>', Show Email (data-abtmail) and every link stay).
// window.ABOPT: 'A' (recommended) = "Everything we save" as a printed receipt (the Track Record's receipt, the site's paper for a record):
//               each thing we keep is a line item with a dotted leader to where it lives, its plain-words detail under it.
//               'B' = Sim's PC mock as drawn: six white cards in a 3 x 2 grid with a blue tag each.
(() => { const E = V2.esc, OPT = window.ABOPT || 'A', tmp = document.createElement('div'); tmp.innerHTML = V2.pages.about.draw();
const rows = [...tmp.querySelectorAll('details.inf-row')].map(d => d.outerHTML);
const css = `<style>
.abm .k-head .k-kicker{display:table;width:max-content}
.abm-chips{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 0;padding:0;list-style:none}
.abm-chips li{padding:6px 18px;border:3px solid var(--k-nasty);color:var(--k-nasty-text);font-size:var(--t22);line-height:1.2;transform:rotate(var(--r,-2deg))}
.abm-two{display:grid;grid-template-columns:minmax(0,560px) minmax(0,1fr);gap:24px 56px;align-items:start}
.abm-rc{position:relative;padding:28px 32px 40px;background:#fff;color:#17161A;box-shadow:0 10px 28px rgba(0,0,0,.14);transform:rotate(-1deg);-webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 10px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/20px 10px repeat-x}
.abm-rc::before{content:"";position:absolute;left:50%;top:-12px;width:120px;height:26px;translate:-50% 0;background:color-mix(in srgb,#0078BF 30%,transparent)}
.abm-rn{margin:0;text-align:center;font-size:var(--t28);color:#17161A}
.abm-rk{margin:4px 0 16px;text-align:center;font-size:var(--t13);font-weight:700;letter-spacing:.12em;color:#4a4850}
.abm-rc ul{list-style:none;margin:0;padding:12px 0 0;border-top:2px dashed #b9b6ad}
.abm-rc li{padding:10px 0;border-bottom:1px dotted #d0cdc4}
.abm-ln{display:flex;align-items:baseline;gap:8px;margin:0;font-size:var(--t16);font-weight:700}.abm-ln i{flex:1;border-bottom:2px dotted #8d8a82;transform:translateY(-4px)}.abm-ln span{font-weight:600;color:#005d94}
.abm-rc li p.d{margin:4px 0 0;font-size:var(--t13);line-height:1.5;color:#4a4850}
.abm-tot{display:flex;justify-content:space-between;align-items:baseline;margin:16px 0 0;font-size:var(--t17);font-weight:800}.abm-tot b{font-size:var(--t26);color:#C41E35}
.abm-end{margin:12px 0 0;font-size:var(--t13);line-height:1.5;color:#4a4850}
.abm-fine details{margin:0}
.abm-note{margin:12px 0 0;font-size:var(--t13);font-weight:600;line-height:1.5;color:var(--k-ink2)}
/* B: cards */
.abm-cards{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.abm-cards li{padding:20px;background:var(--k-card);box-shadow:0 6px 18px var(--k-card-shadow)}.abm-cards h3{margin:0;font-size:var(--t20);color:var(--k-ink)}.abm-cards .k-tag{margin:8px 0}.abm-cards p{margin:0;font-size:var(--t13);line-height:1.5;color:var(--k-ink2)}
.abm-rows2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
@media (max-width:959.98px){.abm-two,.abm-rows2{grid-template-columns:minmax(0,1fr)}.abm-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:699.98px){.abm-rc{padding:16px 12px 24px;transform:none}.abm-rc li{padding:6px 0}.abm-rc li p.d{line-height:1.4}.abm-rn{font-size:var(--t22)}.abm-end{margin-top:6px}.abm-tot{margin-top:8px}.abm-rk{margin-bottom:8px}.abm .inf-row summary{padding-top:8px;padding-bottom:8px;min-height:44px}.abm .k-lead{margin-top:8px}.abm-chips{margin-top:12px;display:grid;grid-template-columns:repeat(2,max-content)}.abm .k-step:first-child .k-sec{margin-top:24px}.abm-ln{font-size:var(--t15)}.abm-chips{gap:8px}.abm-chips li{font-size:var(--t17);padding:4px 12px}.abm-cards{grid-template-columns:minmax(0,1fr)}}
</style>`;
const head = `<div class="k-head"><p class="k-kicker">ABOUT · THE CREW BEHIND IT</p><h1 class="k-h1 u">Made by fans, <em>for doubles players.</em></h1><p class="k-lead">A team builder for Pokémon Champions VGC doubles.</p>
  <ul class="abm-chips u" aria-label="The promise">${['Free', 'No ads', 'Fan-made', 'Unofficial'].map((t, i) => `<li style="--r:${[-2, 1.5, -1, 2][i]}deg">${t}</li>`).join('')}</ul></div>`;
const neverL = 'NastyPlot never asks for your name, email or any contact details, and never reads them from your Claude account.';
const endL = 'Nothing else: no cookies, no ads or trackers. Want your saved data or feedback deleted? Email us (Removal & Contact).';
const receipt = `<section class="abm-rc inf-saved" id="abt-priv" aria-label="Everything we save"><p class="abm-rn u" aria-hidden="true">NastyPlot</p><p class="abm-rk" aria-hidden="true">* * * EVERYTHING WE SAVE * * *</p>
  <ul>${V2.ABT_SAVED.map(([a, b, full]) => `<li><p class="abm-ln"><b>${E(a)}</b><i aria-hidden="true"></i><span>${E(b)}</span></p><p class="d">${E(full)}</p></li>`).join('')}</ul>
  <p class="abm-tot"><span>Your name or email</span><b class="u">NEVER</b></p><p class="abm-end">${E(neverL)} ${E(endL)}</p></section>`;
const cards = `<ul class="abm-cards inf-saved" id="abt-priv">${V2.ABT_SAVED.map(([a, b, full]) => `<li><h3 class="u">${E(a)}</h3>${V2.kTag('good', b)}<p>${E(full)}</p></li>`).join('')}</ul><p class="abm-note">${E(neverL)} ${E(endL)}</p>`;
const fine = `<div class="abm-fine">${rows.join('')}</div>`;
const body = OPT === 'B' ? V2.kStep(1, 'Everything we save.', 'and nothing else', cards) + V2.kStep(2, 'The fine print.', 'tap one to read it', `<div class="abm-rows2">${rows.join('')}</div>`)
  : V2.kStep(1, 'The receipt.', 'everything we save, and where it lives', `<div class="abm-two">${receipt}<div><h3 class="k-h2 u" style="font-size:var(--t28);margin:0 0 12px">The fine print.</h3>${fine}</div></div>`);
document.querySelector('#main').innerHTML = css + `<div class="ra gsp infp abm">${head}${V2.kPlan(body)}</div>`; scrollTo(0, 0); })();
