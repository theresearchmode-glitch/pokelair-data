// Concept 1, "The script" (Nov 22, round 2). The villain writes turn one before it happens: the page opens like a script,
// with its cast list (your four, their six), then turn one written in the game's own battle text ("The opposing Sneasler used
// Fake Out!"), each line with the target's HP after it, stage directions for the ifs, and the next scene (turn 2's danger).
const castT = (n, o) => `<li class="c1-ct ${o.cls || ''}"><img src="${art(n)}" alt=""><b class="u"><small>${E(kn(n).form) || '&nbsp;'}</small>${E(kn(n).name)}</b><i>${E(o.sub || '')}</i>${o.tag ? `<em class="u">${o.tag}</em>` : ''}</li>`;
const them = D.them, lead = them.filter(s => s.lead), rest = them.filter(s => !s.lead);
const cast = `<div class="c1-cast">
  <section class="c1-side you"><h2 class="c1-ck u">Your cast <small>bring four · lead two</small></h2><ul class="c1-cl n4">${D.you.lead.map(n => castT(n, {cls: 'lead', sub: D.you.items[n], tag: 'Lead'})).join('')}${D.you.back.map(n => castT(n, {sub: D.you.items[n], tag: 'Back'})).join('')}</ul>
    <p class="c1-home"><span class="u">Left home</span>${D.you.home.map(n => `<img src="${art(n)}" alt="">${E(nm(n))}`).join(' · ')}</p></section>
  <section class="c1-side them"><h2 class="c1-ck u">Their cast <small>as seen at team preview</small></h2><ul class="c1-cl n6">${lead.map(s => castT(s.n, {cls: 'lead', sub: s.item, tag: 'Likely lead'})).join('')}${rest.map(s => castT(s.n, {sub: s.item})).join('')}</ul></section></div>`;
const who = (n, side) => side === 'them' ? `The opposing <em class="th">${E(nm(n))}</em>` : `<em class="yo">${E(nm(n))}</em>`;
const box = (h) => `<span class="c1-mv" style="--mc:var(--ty-${h.type})">${E(h.mv)}</span>`;
const hp = (n, rem, lo, hi, type, note) => `<div class="c1-hp"><p><img src="${art(n)}" alt=""><b>${E(nm(n))}</b><span>${E(note)}</span></p><span class="c1-bar" style="--rem:${rem};--lo:${lo};--hi:${hi};--tc:var(--tyn-${type})"><i class="r"></i><i class="g"></i><i class="d"></i></span></div>`;
const beats = [
  {h: D.turn[0], said: `${who('Sneasler', 'them')} used ${box(D.turn[0])}!`, then: `Your Mega Charizard Y flinched and couldn't move!`, dir: 'If they run Fake Out (42% of Sneasler sets). Protect blocks it.', hp: hp('Charizard-Mega-Y', 100, 0, 0, 'Normal', 'no damage · loses its turn')},
  {h: D.turn[1], said: `${who('Incineroar', 'them')} used ${box(D.turn[1])}!`, then: `Your Garchomp flinched and couldn't move!`, dir: '+3 priority: Fake Out goes first whatever the Speed, and only on its first turn out.', hp: hp('Garchomp', 100, 0, 0, 'Normal', 'no damage · loses its turn')},
  {h: D.turn[2], said: `${who('Garchomp', 'you')} used ${box(D.turn[2])}!`, then: `It hits both foes. The opposing Sneasler lost up to 90% of its HP.`, dir: 'Only if Garchomp wasn\'t the one flinched. 2HKO.', hp: hp('Sneasler', 10, 76, 90, 'Ground', '76–90% lost')},
  {h: D.turn[3], said: `${who('Charizard-Mega-Y', 'you')} used ${box(D.turn[3])}!`, then: `The opposing Sneasler fainted!`, dir: 'Fire in the sun: 96–113% of its HP, a 75% chance to KO in one hit.', hp: hp('Sneasler', 0, 96, 113, 'Fire', '75% chance · KO'), ko: 1}];
const script = `<div class="c1-scr"><div class="c1-sh"><b class="u">Turn 1</b><span>as the game will tell it · fastest first</span><span class="c1-key"><i class="th"></i>them <i class="yo"></i>you</span></div>
  <ol class="c1-bs">${beats.map(b => `<li class="c1-b ${b.h.side}${b.ko ? ' ko' : ''}"><div class="c1-who"><span class="c1-n u">${b.h.n}</span><img src="${art(b.h.who)}" alt=""><small>${b.h.sp} Speed${b.h.pri ? `<em>${b.h.pri} priority</em>` : ''}</small></div>
    <div class="c1-txt"><p class="c1-said u">${b.said}</p><p class="c1-then">${E(b.then)}</p><p class="c1-dir">(${E(b.dir)})</p></div>${b.hp}</li>`).join('')}</ol>
  <p class="c1-next"><span class="u">Next scene</span>Turn 2, if Sneasler is still standing: its Rock Slide can KO your Mega Charizard Y.</p></div>`;
const css = `<style>
.c1-top{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:var(--s6) var(--s10);align-items:end}.c1-top .k-head{grid-column:1/-1}.c1-top .k-lead{max-width:none}
.c1-top .k-h1 em{display:block;color:var(--k-nasty-text);font-style:inherit}.c1-top .k-lead{margin-bottom:var(--s5)}
.c1-v{padding:var(--s5) var(--s6);background:var(--k-plot);color:var(--k-on-plot);clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%)}
.c1-v small{display:block;font:800 var(--t13)/1.3 var(--u);font-style:italic;letter-spacing:.04em}.c1-v b{display:block;margin:var(--s1) 0 var(--s2);font-size:var(--t34);font-style:italic;line-height:1.1}.c1-v p{margin:0;font:600 var(--t13)/1.45 var(--b)}
.c1-cast{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,6fr);gap:var(--s10);margin-top:var(--s10);padding:var(--s5) 0 var(--s4);border-top:2px solid var(--k-ink);border-bottom:1px solid var(--k-rule)}
.c1-side.them{padding-left:var(--s10);border-left:1px solid var(--k-rule)}
.c1-ck{margin:0 0 var(--s3);font-size:var(--t20);font-style:italic}.c1-ck small{margin-left:var(--s2);font:600 var(--t13)/1 var(--b);color:var(--k-ink2)}.c1-side.you .c1-ck{color:var(--k-plot-text)}.c1-side.them .c1-ck{color:var(--k-nasty-text)}
.c1-cl{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s3)}.c1-cl.n6{grid-template-columns:repeat(6,minmax(0,1fr))}
.c1-ct{display:grid;align-content:start;min-width:0;padding-bottom:var(--s2)}
.c1-ct img{width:100%;height:84px;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 4px 3px var(--k-art-shadow))}
.c1-ct b{display:grid;margin-top:var(--s2);font-size:var(--t15);font-style:italic;line-height:1.2}.c1-ct b small{font:700 var(--t13)/1.1 var(--b);font-style:normal;color:var(--k-ink2)}
.c1-ct i{font:500 var(--t13)/1.3 var(--b);font-style:normal;color:var(--k-ink2)}
.c1-ct em{justify-self:start;margin-top:var(--s2);padding:1px 8px;font-size:var(--t13);font-style:italic;transform:skewX(-10deg);border:2px solid var(--k-neutral);color:var(--k-ink)}
.c1-side.you .lead em{background:var(--k-plot);border-color:var(--k-plot);color:var(--k-on-plot)}.c1-side.them .lead em{background:var(--k-nasty);border-color:var(--k-nasty);color:#fff}
.c1-side.you .lead b{color:var(--k-plot-text)}.c1-side.them .lead b{color:var(--k-nasty-text)}
.c1-cl.n6 .c1-ct:not(.lead) img{height:64px;margin-top:20px}.c1-cl.n6 .c1-ct:not(.lead) b{font:700 var(--t15)/1.2 var(--b)}.c1-ct em{white-space:nowrap}
.c1-home{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s1) var(--s2);margin:var(--s2) 0 0;font:600 var(--t13)/1.3 var(--b);color:var(--k-ink2)}.c1-home span{margin-right:var(--s2);font-style:italic;font-size:var(--t13)}.c1-home img{width:24px;height:24px;object-fit:contain;filter:grayscale(1);opacity:.6}
.c1-scr{--fr:#17161A;--on:#fff;--on2:rgba(255,255,255,.68);position:relative;margin-top:var(--s8);padding:var(--s6) var(--s8) var(--s5);background:var(--fr);color:var(--on);box-shadow:10px 10px 0 var(--k-nasty)}
:root[data-theme="night"] .c1-scr{--fr:var(--surface)}
.c1-sh{display:flex;align-items:baseline;gap:var(--s4);padding-bottom:var(--s4);border-bottom:2px solid rgba(255,255,255,.18)}.c1-sh b{font-size:var(--t34);font-style:italic;line-height:1}.c1-sh span{font:600 var(--t15)/1.3 var(--b);color:var(--on2)}
.c1-key{margin-left:auto;display:flex;align-items:center;gap:var(--s2)}.c1-key i{display:inline-block;width:14px;height:14px;transform:skewX(-12deg)}.c1-key i.th{background:var(--k-nasty)}.c1-key i.yo{background:#62BEF7;margin-left:var(--s3)}
.c1-bs{margin:0;padding:0;list-style:none}
.c1-b{display:grid;grid-template-columns:128px minmax(0,1fr) 300px;gap:var(--s6);align-items:center;padding:var(--s5) 0;border-bottom:1px solid rgba(255,255,255,.12)}
.c1-who{position:relative;display:grid;justify-items:center}.c1-who img{width:104px;height:88px;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 6px 4px rgba(0,0,0,.5))}
.c1-n{position:absolute;left:0;top:0;display:grid;place-items:center;width:32px;height:32px;font-size:var(--t17);font-style:italic;transform:skewX(-10deg)}.c1-b.them .c1-n{background:var(--k-nasty)}.c1-b.you .c1-n{background:#62BEF7;color:#12121B}
.c1-who small{display:flex;flex-direction:column;align-items:center;margin-top:var(--s1);font:700 var(--t13)/1.3 var(--b);color:var(--on2)}.c1-who em{white-space:nowrap;margin-top:2px;padding:0 6px;background:var(--k-nasty);color:#fff;font-style:italic;transform:skewX(-10deg)}
.c1-said{margin:0;font-size:var(--t26);font-style:italic;line-height:1.2}.c1-said em{font-style:inherit}.c1-said .th{color:#FF8193}.c1-said .yo{color:#62BEF7}
.c1-mv{display:inline-block;padding:0 var(--s2);background:var(--mc);color:#fff;transform:skewX(-8deg)}
.c1-then{margin:var(--s2) 0 0;font:600 var(--t17)/1.4 var(--b)}.c1-b.ko .c1-then{font:800 var(--t22)/1.2 var(--u);font-style:italic;color:#62BEF7}
.c1-dir{margin:var(--s1) 0 0;font:500 var(--t15)/1.45 var(--b);font-style:italic;color:var(--on2)}
.c1-hp p{display:flex;align-items:center;gap:var(--s2);margin:0 0 var(--s2);font:700 var(--t15)/1.2 var(--b)}.c1-hp p img{width:36px;height:36px;object-fit:contain}.c1-hp p span{margin-left:auto;font:600 var(--t13)/1.2 var(--b);color:var(--on2)}
.c1-bar{position:relative;display:block;height:20px;background:rgba(255,255,255,.12);transform:skewX(-20deg);overflow:hidden}
.c1-bar .r{position:absolute;left:0;top:0;bottom:0;width:calc(var(--rem) * 1%);background:#fff}
.c1-bar .g{position:absolute;left:calc(var(--rem) * 1%);top:0;bottom:0;width:calc((var(--hi) - var(--lo)) * 1%);background:color-mix(in srgb,var(--tc) 55%,transparent)}
.c1-bar .d{position:absolute;right:0;top:0;bottom:0;width:calc(min(var(--lo),100) * 1%);background:var(--tc)}
.c1-b.ko .c1-bar .g{display:none}.c1-b.ko .c1-bar .d{width:100%}
.c1-b.ko{margin:0 calc(var(--s8) * -1);padding-left:var(--s8);padding-right:var(--s8);background:linear-gradient(90deg,rgba(98,190,247,.16),rgba(98,190,247,.04))}
.c1-next{display:flex;align-items:baseline;gap:var(--s4);margin:var(--s4) 0 0;font:600 var(--t16)/1.45 var(--b)}.c1-next span{flex:none;padding:2px 10px;background:var(--k-nasty);color:#fff;font-size:var(--t13);font-style:italic;transform:skewX(-10deg)}
@media (max-width:1099.98px){.c1-top{grid-template-columns:minmax(0,1fr)}.c1-cast{grid-template-columns:minmax(0,1fr)}.c1-side.them{padding-left:0;border-left:0}.c1-b{grid-template-columns:100px minmax(0,1fr) 220px}}
@media (max-width:699.98px){
 .c1-top{gap:var(--s4)}.c1-top .k-lead{margin-bottom:var(--s3)}.c1-v{padding:var(--s3) var(--s5)}.c1-v b{font-size:var(--t28)}
 .c1-cast{margin-top:var(--s6);gap:var(--s4);padding:var(--s3) 0}.c1-ck{margin-bottom:var(--s1);font-size:var(--t17)}.c1-ck small{display:block;margin:var(--s1) 0 0}
 .c1-cl{gap:var(--s2)}.c1-ct b,.c1-cl.n6 .c1-ct:not(.lead) b{font:700 var(--t13)/1.2 var(--b)}.c1-ct b small{display:none}.c1-cl.n6 .c1-ct:not(.lead) img{height:40px;margin-top:0}.c1-cl.n6 .c1-ct img{height:52px}.c1-ct{padding-bottom:0}
 .c1-b.them .c1-hp{display:none}.c1-v p{font-size:var(--t13)}.c1-top .k-lead{font-size:var(--t16)}.c1-cl.n6{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:var(--s1)}.c1-ct img{height:60px}.c1-cl.n6 .c1-ct:not(.lead) img{height:48px;margin-top:12px}.c1-ct b{font-size:var(--t13)}.c1-ct i{display:none}.c1-ct em{padding:0 6px}
 .c1-scr{margin-top:var(--s6);padding:var(--s4) var(--s4) var(--s3);box-shadow:6px 6px 0 var(--k-nasty)}.c1-sh{flex-wrap:wrap;gap:var(--s1) var(--s3);padding-bottom:var(--s2)}.c1-sh b{font-size:var(--t26)}.c1-sh span{font-size:var(--t13)}.c1-key{display:none}
 .c1-b{grid-template-columns:64px minmax(0,1fr);gap:var(--s2) var(--s3);align-items:start;padding:var(--s4) 0}
 .c1-who img{width:60px;height:56px}.c1-n{width:24px;height:24px;font-size:var(--t13);left:-4px}.c1-who small{font-size:var(--t13)}
 .c1-said{font-size:var(--t17)}.c1-then{font-size:var(--t15)}.c1-b.ko .c1-then{font-size:var(--t17)}.c1-dir{font-size:var(--t13)}
 .c1-hp{grid-column:1/-1}.c1-hp p{margin-bottom:var(--s1);font-size:var(--t13)}.c1-hp p img{width:24px;height:24px}.c1-bar{height:14px}
 .c1-b.ko{margin:0 calc(var(--s4) * -1);padding-left:var(--s4);padding-right:var(--s4)}
 .c1-next{flex-direction:column;gap:var(--s1);font-size:var(--t15)}
}
</style>`;
return `${X_CSS}${css}<div class="ra bt3">${V2.battleToolsBar()}
  <div class="c1-top">${V2.kHead({kicker: 'THE SCRIPT · TURN ONE', h1Html: 'Turn one is <em>already written.</em>', lead: 'Bring your Mega Charizard Y, Garchomp, Sneasler and Whimsicott. Lead the first two into their likely Sneasler + Incineroar. Here is how the game will tell it.'}).replace(/<p class="k-lead">[\s\S]*<\/p>/, '')}<div><p class="k-lead">Bring your Mega Charizard Y, Garchomp, Sneasler and Whimsicott. Lead the first two into their likely Sneasler + Incineroar. Here is how the game will tell it.</p>${changeRow()}</div>
    <div class="c1-v"><small>From real games</small><b class="u">${D.verdict.word}.</b><p>${D.verdict.ladder} ladder games: players who led this pair won more than their rating predicted. ${D.verdict.tour} tournament games agree.</p></div></div>
  ${cast}${script}${X_READ}</div>`;
