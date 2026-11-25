// Shared by the three round-2 Battle concepts (Nov 22): helpers and the parts every concept keeps from today's page, drawn once
// so all three carry the same features: The Read (biggest threat, Fake Outs, Watch Out, From Real Games, the three detail tabs),
// Your Games (log a win or loss, Showdown replay), change their six, practice links. Runs in the built page via __ev.
const E = V2.esc, art = n => V2.art(SPRITE_ID[n], true), nm = n => V2.disp(n), kn = n => V2.kName(n);
const mv = (name, type) => { let h = V2.kMove(name); if (name === 'Weather Ball') h = h.replace(/var\(--ty-Normal\)/, 'var(--ty-Fire)').replace(/kty-Normal/, 'kty-Fire').replace(/<span>Normal<\/span>/, '<span>Fire</span>').replace(/<small>[^<]*<\/small>/, '<small>Special · 100 in sun</small>'); return h; };
const tyOf = n => (byName.get(n) || {t: ['Normal']}).t[0];
const changeRow = cls => `<p class="x-chg ${cls || ''}"><button type="button" class="x-b u">Change Their Six</button>${V2.kLink('Pick a top tournament team', {href: '#battle'})}</p>`;
const X_READ = `<div class="x-read">
  <section><h3 class="x-h3 u">The Read</h3><div class="x-thr"><img src="${art('Sneasler')}" alt=""><p><small class="u">Biggest threat</small><b class="u">Sneasler</b>Fake Out turn one; Rock Slide KOs your Mega Charizard Y from turn 2.</p></div>
    <ul class="x-wl"><li><b class="u">2</b><span><strong>Fake Outs</strong> Sneasler, Incineroar: each can flinch one of your leads</span></li><li><img src="${art('Incineroar')}" alt=""><span><strong>Intimidate</strong> −1 Attack to Garchomp, Sneasler</span></li><li><img src="${art('Whimsicott')}" alt=""><span><strong>Prankster Tailwind</strong> their Speed doubles for 4 turns</span></li></ul></section>
  <section><h3 class="x-h3 u">From real games</h3><ul class="x-real">${D.real.map(r => `<li>${V2.kTag(r[0], r[1])}<span>${E(r[2])}</span></li>`).join('')}</ul>
    <p class="x-links">${V2.kLink('Damage Both Ways', {href: '#battle'})}${V2.kLink('Who Moves First', {href: '#battle'})}${V2.kLink('Deeper Read', {href: '#battle'})}</p></section>
  <section><h3 class="x-h3 u">Your games</h3><p class="x-yg">No games logged yet. After the match, log it with this four.</p><p class="x-btns"><button type="button" class="x-b u">Log a Win</button><button type="button" class="x-b u">Log a Loss</button></p>
    <p class="x-links">${V2.kLink('Log from a Showdown Replay', {href: '#battle'})}</p><p class="x-links x-prac">${V2.kLink('Team Preview Practice', {href: '#practice'})}${V2.kLink('Test Run', {href: '#gauntlet'})}${V2.kLink('Damage Calculator', {href: '#calc'})}</p></section></div>`;
const X_CSS = `<style>
.bt3 .k-kicker{margin-top:0}
.x-b{min-height:44px;padding:0 var(--s5);border:2px solid var(--k-ink);background:transparent;color:var(--k-ink);font-size:var(--t15);font-style:italic;transform:skewX(-10deg);cursor:pointer;white-space:nowrap}
.x-chg{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s5);margin:0}
.x-read{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(0,.95fr);gap:var(--s10);margin-top:var(--s12);padding-top:var(--s6);border-top:2px solid var(--k-ink)}
.x-h3{margin:0 0 var(--s4);font-size:var(--t22);font-style:italic;line-height:1.1}
.x-thr{display:grid;grid-template-columns:88px minmax(0,1fr);gap:var(--s4);align-items:center;padding-bottom:var(--s3);border-bottom:1px solid var(--k-rule)}
.x-thr img{width:88px;height:88px;object-fit:contain;filter:drop-shadow(0 6px 4px var(--k-art-shadow))}
.x-thr p{margin:0;font:500 var(--t15)/1.45 var(--b);color:var(--k-ink2)}.x-thr small{display:block;font-size:var(--t13);font-style:italic;color:var(--k-ink2)}.x-thr b{display:block;font-size:var(--t24);font-style:italic;line-height:1.15;color:var(--k-nasty-text)}
.x-wl,.x-real{margin:0;padding:0;list-style:none}
.x-wl li{display:grid;grid-template-columns:40px minmax(0,1fr);gap:var(--s3);align-items:center;padding:var(--s2) 0;border-bottom:1px solid var(--k-rule);font:500 var(--t15)/1.4 var(--b);color:var(--k-ink2)}
.x-wl li>b{display:grid;place-items:center;width:36px;height:36px;font-size:var(--t20);font-style:italic;color:#fff;background:var(--k-nasty);transform:skewX(-10deg)}
.x-wl img{width:40px;height:40px;object-fit:contain}.x-wl strong{color:var(--k-ink);margin-right:var(--s1)}
.x-real li{display:flex;align-items:center;gap:var(--s3);padding:var(--s3) 0;border-bottom:1px solid var(--k-rule);font:500 var(--t15)/1.4 var(--b)}.x-real .k-tag{flex:none;min-width:112px;text-align:center}
.x-links{display:flex;flex-wrap:wrap;gap:0 var(--s5);margin:var(--s2) 0 0}
.x-yg{margin:0;font:500 var(--t15)/1.5 var(--b);color:var(--k-ink2)}
.x-btns{display:flex;gap:var(--s3);margin:var(--s3) 0 0}
.x-prac{margin-top:var(--s3);padding-top:var(--s2);border-top:1px solid var(--k-rule)}
@media (max-width:1099.98px){.x-read{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.x-read>section:last-child{grid-column:1/-1}}
@media (max-width:699.98px){.x-read{grid-template-columns:minmax(0,1fr);gap:var(--s6);margin-top:var(--s8)}.x-h3{font-size:var(--t20);margin-bottom:var(--s2)}.x-thr{grid-template-columns:64px minmax(0,1fr)}.x-thr img{width:64px;height:64px}.x-thr b{font-size:var(--t20)}.x-links .k-link{min-height:40px}}
</style>`;
