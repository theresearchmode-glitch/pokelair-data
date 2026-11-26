// Concept 3, "The target" (Nov 22, round 2). A villain picks one mark. Their biggest threat, Sneasler, leads; your whole turn one
// is aimed at it. The hero is Sneasler's HP bar in the war-room night panel: Garchomp's Earthquake (Ground brown) and Mega Charizard
// Y's Weather Ball (Fire red) stacked in real damage, spilling past 100% into overkill, with the two Fake Outs as the honest risk
// above it. Then who to bring, their six, the danger, The Read and Your Games.
const S = 210; // the track runs 0–210% of Sneasler's HP; the frame is the first 100%
const pct = v => (100 * v / S).toFixed(2) + '%';
const eq = D.turn[2], wb = D.turn[3];
const bar = `<div class="c3-track" role="img" aria-label="Sneasler's HP: Earthquake takes 76 to 90%, Weather Ball 96 to 113% more: a sure KO if both land">
  <span class="c3-frame" style="width:${pct(100)}"><b class="u">100%</b></span>
  <i class="c3-seg g" style="left:0;width:${pct(eq.lo)}"></i><i class="c3-seg g lt" style="left:${pct(eq.lo)};width:${pct(eq.hi - eq.lo)}"></i>
  <i class="c3-seg f" style="left:${pct(eq.hi)};width:${pct(wb.lo)}"></i><i class="c3-seg f lt" style="left:${pct(eq.hi + wb.lo)};width:${pct(wb.hi - wb.lo)}"></i>
  <span class="c3-ok u" style="left:${pct(100)}">KO</span><span class="c3-over u" style="left:${pct(100)};width:${pct(eq.hi + wb.hi - 100)}">overkill</span></div>`;
const hit = (h, txt) => `<li class="c3-hit" style="--tc:var(--tyn-${h.type})"><span class="c3-hn u">${h.n}</span><img src="${art(h.who)}" alt=""><div><p><b>Your ${E(nm(h.who))}</b><span class="c3-mvp" style="--mc:var(--ty-${h.type})">${E(h.mv)}</span> ${mv(h.mv)}</p><p class="c3-ht">${txt}</p></div><p class="c3-hv"><b class="u">${h.lo}–${h.hi}%</b>${V2.kTag(h.tag[0], h.tag[1])}</p></li>`;
const hero = `<div class="c3-hero">
  <div class="c3-mark"><span class="c3-tg u">Target</span><img src="${art('Sneasler')}" alt=""><b class="u">Sneasler</b><p>Their biggest threat · 172 Speed<br>White Herb · Unburden</p></div>
  <div class="c3-plan"><p class="c3-risk"><span class="u">1–2 first</span>Their Fake Outs go first at +3 priority: Sneasler's into your Mega Charizard Y, Incineroar's into Garchomp, if they run it. Each one stops half of this. Protect blocks it.</p>
    <p class="c3-bk u">Sneasler's HP, turn one</p>${bar}
    <ol class="c3-hits">${hit(eq, 'Hits both foes, 231 Speed: moves third. Up to 90% on its own: a 2HKO.')}${hit(wb, 'Fire in the sun, 167 Speed: moves last. On its own a 75% chance to KO.')}</ol>
    <p class="c3-sum"><b class="u">Both land: Sneasler is gone.</b><span>Even the low rolls add up to 172%.</span></p></div></div>`;
const t = (n, cls, tag, sub) => `<li class="${cls || ''}"><img src="${art(n)}" alt=""><b>${E(kn(n).name)}</b>${sub ? `<i>${E(sub)}</i>` : ''}${tag ? `<small class="u">${tag}</small>` : ''}</li>`;
const cast = `<div class="c3-cast"><section><h2 class="c3-h u">Bring these four</h2><ul class="c3-ts">${D.you.lead.map(n => t(n, 'you', 'Lead', D.you.items[n])).join('')}${D.you.back.map(n => t(n, '', 'Back', D.you.items[n])).join('')}</ul><p class="c3-home">Leave home: ${D.you.home.map(n => E(nm(n))).join(', ')}</p></section>
  <section><h2 class="c3-h u">Their six</h2><ul class="c3-ts six">${D.them.map(s => t(s.n, s.n === 'Sneasler' ? 'them tgt' : s.lead ? 'them' : '', s.n === 'Sneasler' ? 'Target' : s.lead ? 'Leads' : '', '')).join('')}</ul></section>
  <div class="c3-v"><small class="u">From real games</small><b class="u">${D.verdict.word}.</b><p>${D.verdict.ladder} ladder games: players who led this pair won more than their rating predicted.</p></div></div>
  <p class="c3-watch"><b class="u">Watch</b>If Sneasler survives turn one, its Rock Slide can KO your Mega Charizard Y from turn 2.</p>`;
const css = `<style>
.c3-top{position:relative}.c3-top .k-h1 em{color:var(--k-nasty-text);font-style:inherit}.c3-top .x-chg{position:absolute;right:0;bottom:0}.c3-top .k-lead{max-width:700px}.c3-top .k-head{padding-bottom:var(--s2)}
.c3-hero{--fr:#17161A;--on:#fff;--on2:rgba(255,255,255,.7);display:grid;grid-template-columns:300px minmax(0,1fr);gap:var(--s10);margin-top:var(--s8);padding:var(--s8);background:var(--fr);color:var(--on);box-shadow:10px 10px 0 var(--k-nasty)}
:root[data-theme="night"] .c3-hero{--fr:var(--surface)}
.c3-mark{position:relative;display:grid;justify-items:center;align-content:start;text-align:center}
.c3-mark img{width:280px;height:280px;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 14px 10px rgba(0,0,0,.55))}
.c3-mark::before{content:"";position:absolute;left:10px;right:10px;top:150px;height:150px;background:radial-gradient(closest-side,color-mix(in srgb,var(--k-nasty) 60%,transparent),transparent)}
.c3-mark img,.c3-mark b,.c3-mark p{position:relative}
.c3-tg{position:absolute;left:0;top:0;z-index:2;padding:4px 14px;background:var(--k-nasty);color:#fff;font-size:var(--t15);font-style:italic;transform:skewX(-10deg)}
.c3-mark b{margin-top:var(--s2);font-size:var(--t34);font-style:italic;line-height:1;color:#FF8193}
.c3-mark p{margin:var(--s2) 0 0;font:600 var(--t15)/1.45 var(--b);color:var(--on2)}
.c3-risk{display:flex;gap:var(--s4);align-items:baseline;margin:0 0 var(--s6);padding:var(--s3) var(--s4);background:rgba(232,54,79,.16);border-left:6px solid var(--k-nasty);font:500 var(--t15)/1.5 var(--b)}
.c3-risk span{flex:none;padding:0 8px;background:var(--k-nasty);font-size:var(--t13);font-style:italic;transform:skewX(-10deg)}
.c3-bk{margin:0 0 var(--s8);font-size:var(--t17);font-style:italic}
.c3-track{position:relative;height:64px;margin-bottom:var(--s8)}
.c3-frame{position:absolute;left:0;top:0;bottom:0;border:3px solid #fff;transform:skewX(-14deg);z-index:2;pointer-events:none}
.c3-frame b{position:absolute;right:-4px;top:-26px;font-size:var(--t13);font-style:italic;transform:skewX(14deg)}
.c3-seg{position:absolute;top:3px;bottom:3px;transform:skewX(-14deg)}
.c3-seg.g{background:var(--tyn-Ground)}.c3-seg.f{background:var(--tyn-Fire)}.c3-seg.lt{opacity:.5}
.c3-track::before{content:"";position:absolute;left:0;top:3px;bottom:3px;width:calc(100% * 100 / ${S});background:rgba(255,255,255,.1);transform:skewX(-14deg)}
.c3-over{position:absolute;top:100%;margin-top:6px;padding-left:var(--s3);font-size:var(--t13);font-style:italic;color:var(--on2);border-top:2px dashed var(--on2);padding-top:4px}
.c3-ok{position:absolute;top:50%;z-index:3;transform:translate(-50%,-50%) skewX(-10deg);padding:4px 12px;background:#fff;color:#17161A;font-size:var(--t20);font-style:italic}
.c3-hits{margin:0;padding:0;list-style:none;border-top:1px solid rgba(255,255,255,.16)}
.c3-hit{display:grid;grid-template-columns:32px 72px minmax(0,1fr) auto;gap:var(--s4);align-items:center;padding:var(--s3) 0;border-bottom:1px solid rgba(255,255,255,.16)}
.c3-hn{display:grid;place-items:center;width:30px;height:30px;background:#62BEF7;color:#12121B;font-size:var(--t16);font-style:italic;transform:skewX(-10deg)}
.c3-hit img{width:72px;height:64px;object-fit:contain;filter:drop-shadow(0 4px 3px rgba(0,0,0,.5))}
.c3-hit p{margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s3);font:700 var(--t15)/1.3 var(--b)}
.c3-hit .k-move{min-width:240px;background:transparent;color:var(--on)}.c3-hit .k-move small{color:var(--on2)}
.c3-mvp{display:none;padding:0 var(--s2);background:var(--mc);color:#fff;transform:skewX(-8deg)}
.c3-ht{margin-top:var(--s1) !important;font-weight:500 !important;color:var(--on2)}
.c3-hv{display:grid !important;justify-items:end;gap:var(--s1) !important}.c3-hv b{font-size:var(--t28);font-style:italic;color:var(--tc)}
.c3-sum{display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--s2) var(--s4);margin:var(--s4) 0 0}.c3-sum b{font-size:var(--t26);font-style:italic;color:#62BEF7}.c3-sum span{font:600 var(--t15)/1.4 var(--b);color:var(--on2)}
.c3-cast{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,5fr) minmax(0,2.6fr);gap:var(--s8);margin-top:var(--s10);align-items:start}
.c3-h{margin:0 0 var(--s3);padding-top:var(--s3);border-top:2px solid var(--k-ink);font-size:var(--t17);font-style:italic}
.c3-ts{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s2)}.c3-ts.six{grid-template-columns:repeat(6,minmax(0,1fr))}
.c3-ts li{display:grid;justify-items:center;align-content:start;text-align:center;font:700 var(--t13)/1.2 var(--b)}
.c3-ts img{width:100%;height:64px;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 4px 3px var(--k-art-shadow))}
.c3-ts b{margin-top:var(--s1)}.c3-ts i{font:500 var(--t13)/1.3 var(--b);font-style:normal;color:var(--k-ink2)}
.c3-ts small{margin-top:var(--s1);padding:0 8px;font-size:var(--t13);font-style:italic;border:2px solid var(--k-neutral);transform:skewX(-10deg)}
.c3-ts li.you b{color:var(--k-plot-text)}.c3-ts li.you small{background:var(--k-plot);border-color:var(--k-plot);color:var(--k-on-plot)}
.c3-ts li.them b{color:var(--k-nasty-text)}.c3-ts li.them small{background:var(--k-nasty);border-color:var(--k-nasty);color:#fff}
.c3-home{margin:var(--s2) 0 0;font:600 var(--t13)/1.4 var(--b);color:var(--k-ink2)}
.c3-v{padding:var(--s4) var(--s5);background:var(--k-plot);color:var(--k-on-plot);clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}
.c3-v small{font-size:var(--t13);font-style:italic}.c3-v b{display:block;margin:var(--s1) 0;font-size:var(--t28);font-style:italic;line-height:1.1}.c3-v p{margin:0;font:600 var(--t13)/1.45 var(--b)}
.c3-vchip{display:none;margin:var(--s3) 0 0;padding:var(--s2) var(--s3);background:var(--k-plot);color:var(--k-on-plot);font:600 var(--t13)/1.4 var(--b);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}.c3-vchip b{margin-right:var(--s1);font-size:var(--t17);font-style:italic}
.c3-watch{display:flex;align-items:baseline;gap:var(--s3);margin:var(--s6) 0 0;padding:var(--s3) var(--s4);border-left:6px solid var(--k-nasty);background:color-mix(in srgb,var(--k-nasty) 10%,transparent);font:600 var(--t16)/1.45 var(--b)}.c3-watch b{font-style:italic;color:var(--k-nasty-text)}
@media (max-width:1099.98px){.c3-hero{grid-template-columns:minmax(0,1fr)}.c3-cast{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.c3-v{grid-column:1/-1}}
@media (max-width:699.98px){
 .c3-top .x-chg{position:static;margin-top:var(--s3)}.c3-vchip{display:block}.c3-v{display:none}.c3-top .k-lead{font-size:var(--t16)}
 .c3-hero{gap:var(--s4);margin-top:var(--s5);padding:var(--s4);box-shadow:6px 6px 0 var(--k-nasty)}
 .c3-mark{grid-template-columns:120px minmax(0,1fr);justify-items:start;text-align:left;align-items:center;column-gap:var(--s3)}.c3-mark img{grid-row:1/3;width:120px;height:120px}.c3-mark::before{display:none}.c3-mark b{margin:0;align-self:end;font-size:var(--t28)}.c3-mark p{align-self:start;margin-top:var(--s1);font-size:var(--t13)}.c3-tg{font-size:var(--t13)}
 .c3-risk{display:block;margin-bottom:var(--s5);font-size:var(--t13)}.c3-risk span{display:inline-block;margin-right:var(--s2)}
 .c3-track{height:44px;margin-bottom:var(--s8)}.c3-ok{font-size:var(--t15)}
 .c3-hit{grid-template-columns:28px 48px minmax(0,1fr);gap:var(--s2) var(--s3);align-items:start}.c3-hit img{width:48px;height:44px}.c3-hv{grid-column:2/-1;display:flex !important;flex-direction:row;align-items:center;justify-items:start}.c3-hv b{font-size:var(--t22)}
 .c3-hit .k-move{display:none}.c3-mvp{display:inline-block}.c3-ht{font-size:var(--t13)}
 .c3-sum b{font-size:var(--t20)}
 .c3-cast{grid-template-columns:minmax(0,1fr);gap:var(--s5);margin-top:var(--s6)}.c3-ts.six{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s2)}.c3-ts.six img{height:48px}.c3-ts i{display:none}.c3-ts small{padding:0 4px}
 .c3-watch{display:block;font-size:var(--t15)}.c3-watch b{margin-right:var(--s2)}
}
</style>`;
return `${X_CSS}${css}<div class="ra bt3">${V2.battleToolsBar()}
  <div class="c3-top">${V2.kHead({kicker: 'THE TARGET · TURN ONE', h1Html: 'Take out <em>Sneasler first.</em>', lead: 'Their biggest threat leads. Lead Mega Charizard Y + Garchomp and turn one is aimed at it.'})}${changeRow()}<p class="c3-vchip"><b class="u">Favoured</b> in real games: 13,000 ladder games with this lead</p></div>
  ${hero}${cast}${X_READ}</div>`;
