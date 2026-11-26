// Concept 2, "Pink over blue" (Nov 22, round 2). NastyPlot's own two-chevron mark is pink over blue, and a Pokémon battle screen
// is them over you: so the matchup IS the mark's shape. Their likely lead rides the pink chevron, your lead the blue one, names
// running along the arms. Beside it the answers (verdict, your four, the rest of their six, the danger); under it turn one in
// four slanted panels, fastest first. Drawn with CSS shapes (not the logo file, which is never redrawn or recoloured).
const lead = D.them.filter(s => s.lead), rest = D.them.filter(s => !s.lead);
const arm = (n, side, pos) => `<img class="c2-art ${side} ${pos}" src="${art(n)}" alt=""><b class="c2-nm u ${side} ${pos}">${E(nm(n))}</b>`;
const stage = `<div class="c2-stage" role="img" aria-label="Their likely lead Sneasler and Incineroar on a pink chevron above your lead Mega Charizard Y and Garchomp on a blue chevron">
  <span class="c2-sh pink"></span><span class="c2-sh blue"></span><span class="c2-chev pink"></span><span class="c2-chev blue"></span>
  <span class="c2-tag them u">Their likely lead</span><span class="c2-tag you u">Your lead</span>
  ${arm('Sneasler', 'them', 'l')}${arm('Incineroar', 'them', 'r')}${arm('Charizard-Mega-Y', 'you', 'l')}${arm('Garchomp', 'you', 'r')}<p class="c2-pay u"><small>The payoff, turn one</small>Sneasler goes down: <em>75% KO</em></p></div>`;
const mini = (n, tag, cls) => `<li class="${cls || ''}"><img src="${art(n)}" alt=""><b>${E(kn(n).name)}</b>${tag ? `<small class="u">${tag}</small>` : ''}</li>`;
const side = `<div class="c2-side">
  <div class="c2-v"><small class="u">From real games</small><b class="u">${D.verdict.word}.</b><p>${D.verdict.ladder} ladder games: players who led this pair won more than their rating predicted.</p></div>
  <div class="c2-g"><p class="c2-gk u">Bring these four</p><ul class="c2-mini">${D.you.lead.map(n => mini(n, 'Lead', 'you')).join('')}${D.you.back.map(n => mini(n, 'Back')).join('')}</ul><p class="c2-home">Leave home: ${D.you.home.map(n => E(nm(n))).join(', ')}</p></div>
  <div class="c2-g"><p class="c2-gk u">Their other four</p><ul class="c2-mini">${rest.map(s => mini(s.n)).join('')}</ul></div>
  <p class="c2-watch"><b class="u">Watch</b>${E(D.watch)}</p></div>`;
const panel = h => `<li class="c2-p ${h.side}${h.n === 4 ? ' pay' : ''}"><div class="c2-ph"><span class="c2-pn u">${h.n}</span><img src="${art(h.who)}" alt=""><p><small>${h.side === 'you' ? 'Your' : 'Their'}</small><b class="u">${E(kn(h.who).name)}</b></p><span class="c2-sp"><b class="u">${h.sp}</b>${h.pri ? `<em class="u">${h.pri}</em>` : '<small>Speed</small>'}</span></div>
  <div class="c2-pb">${mv(h.mv)}<p class="c2-into"><span class="c2-mvp" style="--mc:var(--ty-${h.type})">${E(h.mv)}</span>into <b>${h.to.map(n => E(nm(n))).join(' + ')}</b></p>
  ${h.hi ? `<p class="c2-dl"><b class="u">${h.hi}%</b>${V2.kTag(h.tag[0], h.tag[1])}</p><span class="pk-dmg c2-dmg" style="--lo:${h.lo};--hi:${Math.min(h.hi, 150)};--tc:var(--tyn-${h.type})"><i></i></span>` : `<p class="c2-dl"><b class="u">Flinch</b></p>`}
  <p class="c2-line">${E(h.line)}</p></div></li>`;
const turn = `<section class="c2-turn"><h2 class="c2-h2 u">Turn one <small>fastest first: +3 priority, then Speed</small></h2><ol class="c2-ps">${D.turn.map(panel).join('')}</ol></section>`;
const css = `<style>
.c2-top .k-h1 em{display:block;color:var(--k-plot-text);font-style:inherit}.c2-top .k-h1 .pk{color:var(--k-nasty-text)}.c2-top .k-lead{max-width:760px}
.c2-top{position:relative}.c2-top .x-chg{position:absolute;right:0;bottom:0}
.c2-main{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:var(--s10);margin-top:var(--s8);align-items:start}
.c2-stage{position:relative;container-type:inline-size;aspect-ratio:100/83}
.c2-in{position:absolute;inset:0}
.c2-chev,.c2-sh{position:absolute;left:0;width:100cqw;height:32cqw;clip-path:polygon(0 62%,50% 0,100% 62%,100% 100%,50% 38%,0 100%)}
.c2-sh{background:var(--k-ink);transform:translate(1.2cqw,1.2cqw)}:root[data-theme="night"] .c2-sh{background:#000}
.c2-chev.pink,.c2-sh.pink{top:13cqw}.c2-chev.blue,.c2-sh.blue{top:45cqw}
.c2-chev.pink{background:var(--k-nasty)}.c2-chev.blue{background:var(--k-plot)}
.c2-art{position:absolute;width:26cqw;height:21cqw;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 1cqw .8cqw rgba(0,0,0,.35));z-index:2}
.c2-art.them.l{left:12cqw;top:3.6cqw}.c2-art.them.r{left:62cqw;top:3.6cqw}.c2-art.you.l{left:12cqw;top:35.6cqw}.c2-art.you.r{left:62cqw;top:35.6cqw}
.c2-nm{position:absolute;z-index:3;white-space:nowrap;font-size:max(13px,2.7cqw);font-style:italic;line-height:1;color:#fff;transform:translate(-50%,-50%) rotate(var(--a))}
.c2-nm.l{left:25cqw;--a:-22.25deg}.c2-nm.r{left:75cqw;--a:22.25deg}.c2-nm.them{top:29cqw}.c2-nm.you{top:61cqw;color:var(--k-on-plot)}
.c2-tag{position:absolute;z-index:3;left:50cqw;transform:translate(-50%,-50%) skewX(-10deg);padding:.5cqw 1.8cqw;background:var(--k-chip);color:var(--k-on-chip);font-size:max(13px,2cqw);font-style:italic;white-space:nowrap}
.c2-tag.them{top:8cqw}.c2-tag.you{top:38.5cqw}
.c2-side{display:grid;gap:var(--s5)}
.c2-v{padding:var(--s5) var(--s6);background:var(--k-plot);color:var(--k-on-plot);clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%)}
.c2-v small{font-size:var(--t13);font-style:italic}.c2-v b{display:block;margin:var(--s1) 0 var(--s2);font-size:var(--t34);font-style:italic;line-height:1.1}.c2-v p{margin:0;font:600 var(--t13)/1.45 var(--b)}
.c2-g{padding-top:var(--s3);border-top:2px solid var(--k-ink)}
.c2-gk{margin:0 0 var(--s2);font-size:var(--t15);font-style:italic}
.c2-mini{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s2)}
.c2-mini li{display:grid;justify-items:center;text-align:center;font:700 var(--t13)/1.2 var(--b)}.c2-mini img{width:64px;height:60px;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 4px 3px var(--k-art-shadow))}
.c2-mini b{margin-top:var(--s1)}.c2-mini small{margin-top:var(--s1);padding:0 8px;font-size:var(--t13);font-style:italic;border:2px solid var(--k-neutral);transform:skewX(-10deg)}
.c2-mini li.you b{color:var(--k-plot-text)}.c2-mini li.you small{background:var(--k-plot);border-color:var(--k-plot);color:var(--k-on-plot)}
.c2-home{margin:var(--s2) 0 0;font:600 var(--t13)/1.4 var(--b);color:var(--k-ink2)}
.c2-watch{margin:0;padding:var(--s3) var(--s4);background:color-mix(in srgb,var(--k-nasty) 12%,transparent);border-left:6px solid var(--k-nasty);font:600 var(--t15)/1.45 var(--b)}.c2-watch b{display:block;font-size:var(--t15);font-style:italic;color:var(--k-nasty-text)}
.c2-turn{margin-top:var(--s10)}
.c2-h2{margin:0 0 var(--s4);font-size:var(--d-ksec);font-style:italic;line-height:1.05}.c2-h2 small{margin-left:var(--s3);font:600 var(--t15)/1 var(--b);font-style:normal;color:var(--k-ink2)}
.c2-ps{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s4)}
.c2-p{display:grid;grid-template-rows:auto 1fr;background:var(--k-card);box-shadow:0 8px 16px var(--k-card-shadow);clip-path:polygon(0 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%)}
.c2-ph{position:relative;display:grid;grid-template-columns:auto 56px minmax(0,1fr) auto;gap:var(--s2);align-items:center;padding:var(--s3) var(--s4);color:#fff}
.c2-p.them .c2-ph{background:var(--k-nasty)}.c2-p.you .c2-ph{background:var(--k-plot);color:var(--k-on-plot)}
.c2-pn{display:grid;place-items:center;width:28px;height:28px;background:rgba(0,0,0,.25);font-size:var(--t16);font-style:italic;transform:skewX(-10deg)}
.c2-ph img{width:56px;height:52px;object-fit:contain;margin:-14px 0 -6px;filter:drop-shadow(0 4px 3px rgba(0,0,0,.3))}
.c2-ph p{margin:0;display:grid;min-width:0}.c2-ph p small{font:600 var(--t13)/1.2 var(--b);opacity:.85}.c2-ph p b{font-size:var(--t15);font-style:italic;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.c2-sp{display:grid;justify-items:end}.c2-sp b{font-size:var(--t22);font-style:italic;line-height:1}.c2-sp small{font:600 var(--t13)/1.2 var(--b);opacity:.85}.c2-sp em{margin-top:2px;padding:0 6px;background:#fff;color:#17161A;font-size:var(--t13);font-style:italic;transform:skewX(-10deg)}
.c2-pb{padding:var(--s4) var(--s4) var(--s5)}
.c2-into{margin:var(--s2) 0 0;font:500 var(--t13)/1.3 var(--b);color:var(--k-ink2)}.c2-into b{color:var(--k-ink)}
.c2-dl{display:flex;align-items:center;gap:var(--s3);margin:var(--s3) 0 0}.c2-dl b.u{font-size:var(--t28);font-style:italic;line-height:1}.c2-p.them .c2-dl b.u{color:var(--k-nasty-text)}
.c2-dmg{display:block;height:12px;margin-top:var(--s2);grid-column:auto;grid-row:auto}.c2-mvp{display:none;margin-right:var(--s2);padding:0 var(--s2);background:var(--mc);color:#fff;font-weight:700;transform:skewX(-8deg)}
.c2-pay{position:absolute;z-index:3;left:50cqw;top:76cqw;transform:translate(-50%,-50%);margin:0;text-align:center;white-space:nowrap;font-size:max(13px,2.6cqw);font-style:italic;line-height:1.15;color:var(--k-ink)}.c2-pay small{display:block;font:700 max(12px,1.6cqw)/1.3 var(--b);font-style:normal;color:var(--k-ink2)}.c2-pay em{font-style:inherit;color:var(--k-plot-text)}
.c2-line{margin:var(--s2) 0 0;font:500 var(--t15)/1.45 var(--b);color:var(--k-ink2)}
.c2-p.pay{box-shadow:0 0 0 3px var(--k-plot),0 8px 16px var(--k-card-shadow)}
@media (max-width:1099.98px){.c2-main{grid-template-columns:minmax(0,1fr)}.c2-ps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:699.98px){
 .c2-top .x-chg{position:static;margin-top:var(--s3)}.c2-top .k-lead{font-size:var(--t16)}
 .c2-main{margin-top:var(--s5);gap:var(--s5)}
 .c2-v{padding:var(--s3) var(--s5)}.c2-v b{font-size:var(--t28)}
 .c2-h2{font-size:var(--t26)}.c2-h2 small{display:block;margin:var(--s1) 0 0;font-size:var(--t13)}
 .c2-ps{grid-template-columns:minmax(0,1fr);gap:var(--s3)}.c2-pb{padding:var(--s3) var(--s4) var(--s4)}.c2-pb .k-move{display:none}.c2-mvp{display:inline-block}.c2-into{margin:0;font-size:var(--t15)}.c2-dl{margin-top:var(--s2)}
 .c2-pay{font-size:max(13px,3.4cqw)}.c2-line{font-size:var(--t13)}.c2-dl b.u{font-size:var(--t22)}
}
</style>`;
return `${X_CSS}${css}<div class="ra bt3">${V2.battleToolsBar()}
  <div class="c2-top">${V2.kHead({kicker: 'PINK OVER BLUE', h1Html: '<span class="pk">They lead pink.</span> <em>You answer blue.</em>', lead: 'Their likely lead on top, yours underneath, the way the battle screen shows it. Bring Mega Charizard Y, Garchomp, Sneasler and Whimsicott.'})}${changeRow()}</div>
  <div class="c2-main">${stage}${side}</div>${turn}${X_READ}</div>`;
