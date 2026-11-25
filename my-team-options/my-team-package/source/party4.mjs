// MY TEAM · party + the one you tapped + Suggestions (picture mock-up only). No Box, no drag-and-drop, no Lead/Back/Bench.
// Real words and numbers from today's My Team (sample team).
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const REPO = 'C:/Users/simra/code/pl-mascot'; const { chromium } = createRequire(REPO + '/package.json')('playwright');
const OUT = REPO + '/my-team-options/my-team-package'; fs.mkdirSync(OUT, { recursive: true }); const PAGE = path.resolve(REPO, 'app/dist/v2.html');
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ''));
const BASE = /const BASE = `([\s\S]*?)`;\n\/\/ =====/.exec(fs.readFileSync(path.join(HERE, 'pk.mjs'), 'utf8'))[1];
const img = (id, c = '') => `<img class="${c}" src="../src/v2/art/${id}.webp" alt="">`;
const TY = { Fire: '#D2411E', Flying: '#5B7FD6', Dragon: '#4F45C9', Ground: '#A8742A', Grass: '#28843C', Fairy: '#C2479A', Fighting: '#BE5718', Poison: '#8E3FC8', Water: '#2A73C9', Ghost: '#5B4A9E', Dark: '#4A3F46', Steel: '#5E7487', Normal: '#737571' };
const MV = { 'Heat Wave': 'Fire', 'Protect': 'Normal', 'Solar Beam': 'Grass', 'Weather Ball': 'Fire', 'Dragon Claw': 'Dragon', 'Earthquake': 'Ground', 'Rock Slide': 'Ground', 'Stomping Tantrum': 'Ground', 'Encore': 'Normal', 'Moonblast': 'Fairy', 'Tailwind': 'Flying', 'Close Combat': 'Fighting', 'Dire Claw': 'Poison', 'Fake Out': 'Normal', 'Aqua Jet': 'Water', 'Flip Turn': 'Water', 'Last Respects': 'Ghost', 'Wave Crash': 'Water', 'Kowtow Cleave': 'Dark', 'Sucker Punch': 'Dark', 'Swords Dance': 'Normal' };
const SIX = [
 { id: 10035, n: 'Mega Charizard Y', r: 94, t: 'S', ty: ['Fire', 'Flying'], it: 'Charizardite Y', ab: 'Drought', mv: ['Heat Wave', 'Protect', 'Solar Beam', 'Weather Ball'] }, { id: 445, n: 'Garchomp', r: 92, t: 'S', ty: ['Dragon', 'Ground'], it: 'Choice Scarf', ab: 'Rough Skin', mv: ['Dragon Claw', 'Earthquake', 'Rock Slide', 'Stomping Tantrum'] },
 { id: 547, n: 'Whimsicott', r: 88, t: 'A', ty: ['Grass', 'Fairy'], it: 'Focus Sash', ab: 'Prankster', mv: ['Encore', 'Moonblast', 'Protect', 'Tailwind'] }, { id: 903, n: 'Sneasler', r: 97, t: 'S', ty: ['Fighting', 'Poison'], it: 'White Herb', ab: 'Unburden', mv: ['Close Combat', 'Dire Claw', 'Fake Out', 'Protect'] },
 { id: 902, n: 'Basculegion', r: 92, t: 'S', ty: ['Water', 'Ghost'], it: 'Life Orb', ab: 'Adaptability', mv: ['Aqua Jet', 'Flip Turn', 'Last Respects', 'Wave Crash'] }, { id: 983, n: 'Kingambit', r: 96, t: 'S', ty: ['Dark', 'Steel'], it: 'Chople Berry', ab: 'Defiant', mv: ['Kowtow Cleave', 'Protect', 'Sucker Punch', 'Swords Dance'] }];
const THREATS = [[10035, 'Mega Charizard Y', 0, 'Mirror · calc: beats it'], [981, 'Farigiraf', 0, ''], [10089, 'Mega Salamence', 0, ''], [10186, 'Indeedee (F)', 0, ''], [10305, 'Mega Raichu Y', 1, ''], [637, 'Volcarona', 1, ''], [1013, 'Sinistcha', 1, ''], [10316, 'Mega Golisopod', 1, '']];
const S = SIX[3];
const slot = (p, i) => `<button class="sl${p === S ? ' on' : ''}" style="--c:${TY[p.ty[0]]}"><i class="no u">${i + 1}</i>${img(p.id)}<i class="sn">${p.n}</i><span><b class="u">${p.n}</b><small>${p.it} · ${p.ab}</small></span><em class="u"><b>${p.r}</b>${p.t} tier</em><span class="m4">${p.mv.map(m => `<i style="--c:${TY[MV[m]]}">${m}</i>`).join('')}</span></button>`;
const HTML = `<div class="w"><div class="zhd"><div class="zname"><p class="zk">My team · 6 of 6 · Sun team · Legal for Reg M-C ✓</p><h1 class="u">Sun Tailwind <span>(sample)</span></h1><p class="zsmp">This is a sample team, here to show how NastyPlot works.</p>
   <p class="zbb"><button class="zbtn u">Build Me a Team ›</button><button class="zbtn u ghost">Import a Team ›</button></p></div>
  <div class="zscore"><p class="lab">Strength Score</p><p class="n u">94</p><p class="band u">Top tier</p><p class="win">Teams scoring like this win about <b>61%</b> against today's tournament teams. <b>Top 1% of tournament teams.</b></p></div>
  <p class="zacts"><a>Why This Score? ›</a><a>Team Sheet ↗</a><a>Share as Image</a><a>Saved Teams 1</a><a>More ⋯</a><span class="u">Saved ✓</span></p></div>
 <section class="pc">
  <div class="party"><p class="bar"><b class="u">Your six</b><span>tap one to see it</span></p>${SIX.map(slot).join('')}</div>
  <div class="sum" style="--c:${TY[S.ty[0]]};--c2:${TY[S.ty[1]]}"><p class="bar nav"><button aria-label="Previous Pokémon">‹</button><b class="u">${S.n}</b><span>4 of 6</span><button aria-label="Next Pokémon">›</button></p><div class="stage"><p class="rate u"><b>${S.r}</b><span>${S.t} tier</span></p>${img(S.id)}</div>
   <div class="inf"><span class="zty">${S.ty.map(t => `<i style="--c:${TY[t]}">${t}</i>`).join('')}</span>
    <p class="ia"><span><small>Item</small><b>${S.it}</b></span><span><small>Ability</small><b>${S.ab}</b></span></p>
    <p class="mv4">${S.mv.map(m => `<i style="--c:${TY[MV[m]]}">${m}</i>`).join('')}</p>
    <p class="do"><button class="zbtn u">Edit set</button><button class="zbtn u ghost">Replace</button><button class="zbtn u red">Remove</button></p></div></div>
  <div class="sgp"><p class="bar yl"><b class="u">Suggestions</b></p><div class="in">
    <p class="zp"><b>Nothing to fix.</b> Your team has every basic and no swap clearly beats it in real games. Your edge now comes from how you play it: plan each matchup in Battle, and tune your sets.</p><p class="zlk"><a>Battle ›</a><a>Popular Sets ›</a></p>
    <div class="card"><p class="s1 u">Suggestion 1 <b>+1</b><span>94 → 95</span></p>
     <div class="vs"><span>${img(903)}<b>Sneasler</b></span><i class="u">→</i><span class="new">${img(10296)}<b>Mega Floette<small>To catch</small></b></span></div>
     <p class="opt">Optional swap: a small change. Real games can't tell it apart from what you have.</p><p class="sa"><button class="zbtn u yl">Apply</button><a>Why? 13 reasons ›</a></p></div>
    <p class="zlk"><a>See All Suggestions ›</a><a>Never Suggest ›</a><a>Refresh Suggestions ›</a></p>
    <button class="zrow"><b class="u">Adjust Suggestions ›</b><small>Box + Catch · 2 Megas · Swap Mega: No · Abilities: Yes</small></button></div></div></section>
 <button class="zplan"><b class="u">Game Plan ›</b><span>How to play this six against the meta's top six.</span></button>
 <p class="zjump"><a>Matchups</a><a>Suggestions</a><a>Team Checks</a><a>Your Games</a></p>
 <div class="zlow"><div class="zmu"><h2 class="u">Matchups</h2><p class="zsub">Against the top 30 threats. Verdicts from real tournament games with your Pokémon; a row notes when the calc disagrees.</p>
   <p class="zcnt u"><span class="f"><b>4</b>Favoured</span><span class="e"><b>22</b>Even match</span><span class="x"><b>4</b>Unfavoured</span></p><p class="zcalc">Damage calc: No answer 0 · Shaky 9 · Handles it 9 · Beats it 12</p>
   <p class="ztabs">${['Stand-Outs', 'Top 10', 'Top 12 Grid', 'All 30'].map((t, i) => `<button class="${i ? '' : 'on'}">${t}</button>`).join('')}</p>
   <div class="zthr">${THREATS.map(([id, n, fav, note]) => `<button class="zth ${fav ? 'f' : 'x'}">${img(id)}<b>${n}</b><em>${fav ? 'Favoured' : 'Unfavoured'}</em>${note ? `<small>${note}</small>` : ''}</button>`).join('')}</div></div>
  <div class="zside"><div class="zck"><h2 class="u">Team Checks</h2><p class="zsub">The 4 basics count toward the score; the notes are advice. <a class="zq">?</a></p>
    <button class="zrow ok"><b class="u">✓ All 4 basics and all 3 notes pass ›</b></button><button class="zrow"><b class="u">Things to Know ›</b><small>7 minor weak spots, type chart, legal</small></button></div>
   <div class="zgm"><h2 class="u">Your Games</h2><p class="none u">None logged yet</p><button class="zbtn u">Log a Game</button><p class="zsub">After 5 logged games, Build Me a Team weighs your own results and this record shows what beats you.</p></div></div></div></div>`;
const CSS = BASE + `
.pc{display:grid;gap:6px;margin:16px 10px 26px 0;padding:6px;background:#17161A;box-shadow:10px 10px 0 var(--pk)}
.bar{display:flex;align-items:center;gap:10px;min-height:52px;padding:0 16px;color:#fff}.bar.nav{padding:0 2px;background:#17161A}.bar.nav b{flex:none;margin-left:4px}.bar.nav span{flex:1}.bar.nav button{display:grid;place-items:center;width:48px;height:48px;font:900 28px/1 var(--b)}.bar b{font-size:18px;line-height:1}.bar span{font:600 13px/1.3 var(--b);color:#C9C5D0}.bar.yl{background:#FFE14D;color:#17161A}
.party{display:grid;gap:4px;align-content:start}
.sl{position:relative;display:grid;grid-template-columns:18px 60px minmax(0,1fr) auto;align-items:center;gap:4px 10px;min-height:68px;padding:8px 14px 10px 12px;background:#F4F1EC;box-shadow:inset 6px 0 0 var(--c)}.sl .m4{grid-column:2/5;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px}.sl .m4 i{padding:3px 8px;background:var(--c);color:#fff;font:700 11.5px/1.3 var(--b);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sl small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sl>span{min-width:0}.sl .no{font-size:13px;text-align:right;color:var(--tx2)}.sl img{width:60px;height:60px;margin:-4px -2px}
.sl b.u{display:block;font-size:14px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sl small{font:600 12px/1.3 var(--b);color:var(--tx2)}.sl em{display:grid;justify-items:end;font-size:9.5px;line-height:1.1;color:var(--tx2)}.sl em b{font-size:20px;line-height:1;color:var(--bl)}
.sl .sn{display:none}.sl.on{background:#FFE14D;box-shadow:inset 6px 0 0 #17161A}.sl.on::after{content:"";position:absolute;right:-14px;top:50%;z-index:3;width:16px;height:30px;margin-top:-15px;background:#FFE14D;clip-path:polygon(0 0,100% 50%,0 100%);display:none}.sl.on small,.sl.on em,.sl.on .no{color:#17161A}.sl.on em b{color:#17161A}
.sum{display:grid;background:#F4F1EC;min-width:0}.stage{position:relative;display:grid;place-items:center;height:250px;overflow:hidden;background:linear-gradient(135deg,color-mix(in srgb,var(--c) 34%,#fff),color-mix(in srgb,var(--c2) 34%,#fff))}
.rate{position:absolute;left:16px;top:12px;z-index:2;display:grid;line-height:1}.rate b{font-size:64px;line-height:.9;color:#17161A}.rate span{justify-self:start;margin-top:6px;padding:2px 10px 3px;background:#17161A;color:#fff;font-size:13px}.stage img{position:relative;width:230px;height:230px}
.stage::after{content:"";position:absolute;left:10%;right:10%;bottom:18px;height:26px;border-radius:50%;background:rgba(23,22,26,.14)}.stage img{z-index:1}
.inf{display:grid;gap:10px;justify-items:start;align-content:start;padding:16px}.inf h2{font-size:28px;margin:0}.ia{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%}.ia span{display:grid;padding:8px 12px;background:#fff}.ia small{font:600 12px/1.2 var(--b);color:var(--tx2)}.ia b{font:800 16px/1.3 var(--b)}
.mv4{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:100%}.mv4 i{display:flex;align-items:center;min-height:44px;padding:0 14px;background:var(--c);color:#fff;font:800 15px/1.2 var(--b);font-style:normal;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.do{display:flex;flex-wrap:wrap;gap:8px}.do .zbtn{padding:0 18px}
.sgp{display:grid;align-content:start;background:#F4F1EC;min-width:0}.sgp .in{display:grid;gap:6px;padding:14px 16px 10px}
.card{display:grid;gap:8px;padding:14px 16px 16px;background:#17161A;color:#fff}.card .s1{display:flex;align-items:baseline;gap:8px;font-size:14px;color:#FFE14D}.card .s1 b{font-size:34px;line-height:1}.card .s1 span{font:700 13px/1 var(--b);font-style:normal;letter-spacing:0;color:#fff}
.vs{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:6px}.vs span{display:grid;justify-items:center;gap:2px;padding:8px 4px;background:rgba(255,255,255,.1);text-align:center}.vs img{width:84px;height:84px}.vs b{font:800 13.5px/1.2 var(--b)}.vs small{display:block;font:500 12px/1.2 var(--b);color:#C9C5D0}
.vs .new{background:rgba(255,225,77,.22);box-shadow:inset 0 0 0 3px #FFE14D}.vs i{font-size:24px;font-style:normal}.card .opt{font:500 13.5px/1.4 var(--b);color:#D9D5E0}.card .sa{display:flex;align-items:center;gap:18px}.card a{color:#9BDCFF}.zbtn.yl{background:#FFE14D;color:#17161A}
@media (min-width:1000px){.pc{grid-template-columns:372px minmax(0,1fr) 400px;margin:18px 14px 34px 0;box-shadow:14px 14px 0 var(--pk)}.sl b.u{font-size:15px}.sl.on::after{display:block}
 .sum{grid-template-rows:auto minmax(300px,1fr) auto}.stage{height:auto}.stage img{width:320px;height:320px}.rate b{font-size:96px}.rate span{font-size:15px}.inf{padding:18px 22px 22px}
 .zmu{grid-column:1/9}.zside{grid-column:9/13;display:grid;gap:30px;align-content:start}}

@media (max-width:999.98px){
 .w{padding-top:12px}.zhd{gap:8px}.zname h1{font-size:26px}.zsmp{font-size:13px}
 .zbb{flex-wrap:nowrap;gap:6px;margin-top:6px}.zbb .zbtn{flex:1;min-width:0;padding:0 6px;font-size:11.5px}
 .zscore{gap:0 12px}.zscore .n{font-size:64px}.zscore .band{font-size:20px}.zscore .win{font-size:12.5px}
 .zacts{gap:0 16px}.zacts a{font-size:14px}
 .pc{margin:10px 8px 18px 0;box-shadow:8px 8px 0 var(--pk)}
 .party{grid-template-columns:repeat(6,minmax(0,1fr));gap:3px}.party .bar{grid-column:1/-1;min-height:44px}
 .sl{grid-template-columns:minmax(0,1fr);justify-items:center;gap:0;min-height:72px;padding:4px 0 6px;box-shadow:inset 0 5px 0 var(--c)}.sl .no,.sl>span,.sl .m4{display:none}.sl img{width:48px;height:48px;margin:0}
 .sl{align-content:start}.sl .sn{display:block;order:3;padding:0 1px;font:700 9.5px/1.15 var(--b);font-style:normal;text-align:center;color:#17161A}.sl em{order:2;justify-items:center;font-size:0}.sl em b{font-size:15px}.sl.on{box-shadow:inset 0 5px 0 #17161A}
 .bar.nav{min-height:48px}.stage{height:168px}.stage img{width:164px;height:164px}.stage::after{bottom:10px;height:18px}.rate b{font-size:46px}.rate span{font-size:12px;margin-top:4px}
 .inf{gap:8px;padding:12px}.ia span{padding:6px 10px}.ia b{font-size:15px}.mv4 i{font-size:14px;padding:0 10px}
 .do{flex-wrap:nowrap;gap:6px;width:100%}.do .zbtn{flex:1;min-width:0;padding:0 4px;font-size:12.5px}
 .sgp .in{padding:12px 12px 6px;gap:4px}.zp{font-size:14px}.card{padding:12px;gap:6px}.vs img{width:56px;height:56px}.vs span{padding:6px 4px}.card .s1 b{font-size:28px}
 .zplan{margin-top:0;padding:12px 16px;font-size:14px}.zjump{flex-wrap:nowrap;justify-content:space-between;margin-top:10px;gap:0}.zjump a{font-size:13px}
 .zlow{gap:20px;margin-top:8px}.w h2{font-size:22px}
 .zcnt{flex-wrap:nowrap;gap:10px;margin:8px 0 2px;font-size:10.5px;white-space:nowrap}.zcnt b{font-size:24px}.zcnt span{gap:3px}
 .ztabs{flex-wrap:nowrap;margin:8px 0 10px}.ztabs button{flex:1;justify-content:center;padding:0 4px;font-size:12.5px}
 .zthr{gap:6px}.zth{grid-template-columns:44px minmax(0,1fr);column-gap:8px;align-content:center;min-height:56px;padding:9px 8px 5px}.zth img{grid-row:1/4;width:44px;height:44px;align-self:center}.zth b{font-size:12.5px}.zth em{font-size:12.5px}.zth small{font-size:11.5px}
 .zside{display:grid;gap:20px}.zrow{min-height:50px;padding:6px 0}.zgm{gap:6px}
}`;
const b = await chromium.launch(); const stats = [];
for (const [dev, o] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }]]) {
  const c = await b.newContext(o), p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', 'day'); } catch (e) {} });
  await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
  await p.evaluate(({ html, css }) => { document.documentElement.setAttribute('data-theme', 'day'); const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const m = document.getElementById('main'), m2 = m.cloneNode(false); m2.innerHTML = html; m.replaceWith(m2); scrollTo(0, 0);
    document.getElementById = () => null; document.querySelector = () => null; document.querySelectorAll = () => []; }, { html: HTML, css: CSS });
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {}); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const m = await p.evaluate(() => { const W = document.getElementsByClassName('w')[0], small = [], cut = [];
    for (const e of W.getElementsByTagName('*')) { if (/^(BUTTON|A)$/.test(e.tagName) && !e.classList.contains('zq')) { const r = e.getBoundingClientRect(); if (r.width && (r.height < 43.5 || r.width < 43.5)) small.push((e.textContent.trim() || e.getAttribute('aria-label') || '?').slice(0, 16) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      if (!e.children.length && e.textContent.trim() && e.clientWidth && e.scrollWidth > e.clientWidth + 1) cut.push(e.textContent.trim().slice(0, 18)); }
    return { s: (W.getBoundingClientRect().height / innerHeight).toFixed(2), sw: document.documentElement.scrollWidth > innerWidth, small, cut }; });
  await p.screenshot({ path: path.join(OUT, `my-team-${dev}-light.png`), fullPage: true });
  stats.push(`party ${dev}: ${m.s} screens${m.sw ? ' SIDEWAYS' : ''}, small ${m.small.length}${m.small.length ? ' (' + m.small.slice(0, 6).join(', ') + ')' : ''}, cut ${m.cut.length}${m.cut.length ? ' (' + m.cut.slice(0, 6).join(', ') + ')' : ''}`); await c.close(); }
await b.close(); console.log(stats.join('\n'));
