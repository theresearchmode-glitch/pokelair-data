// MY TEAM, three concepts that start from what Pokemon players already do (picture mock-ups only):
// 1 The Box (party + Box, drag in to try), 2 Team Preview (bring six, lead two, pick a threat to face), 3 The Check-Up (the Center's machine).
// Real words and numbers from today's My Team (sample team). The Box's extra Pokemon are PLACEHOLDERS (only Mega Floette is a real suggestion).
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const REPO = 'C:/Users/simra/code/pl-mascot'; const { chromium } = createRequire(REPO + '/package.json')('playwright');
const OUT = REPO + '/my-team-options/pokemon'; fs.mkdirSync(OUT, { recursive: true }); const PAGE = path.resolve(REPO, 'app/dist/v2.html'); const only = process.argv[2];
const img = (id, c = '') => `<img class="${c}" src="../src/v2/art/${id}.webp" alt="">`;
const TY = { Fire: '#D2411E', Flying: '#5B7FD6', Dragon: '#4F45C9', Ground: '#A8742A', Grass: '#28843C', Fairy: '#C2479A', Fighting: '#BE5718', Poison: '#8E3FC8', Water: '#2A73C9', Ghost: '#5B4A9E', Dark: '#4A3F46', Steel: '#5E7487', Normal: '#737571' };
const MV = { 'Heat Wave': 'Fire', 'Protect': 'Normal', 'Solar Beam': 'Grass', 'Weather Ball': 'Fire', 'Dragon Claw': 'Dragon', 'Earthquake': 'Ground', 'Rock Slide': 'Ground', 'Stomping Tantrum': 'Ground', 'Encore': 'Normal', 'Moonblast': 'Fairy', 'Tailwind': 'Flying', 'Close Combat': 'Fighting', 'Dire Claw': 'Poison', 'Fake Out': 'Normal', 'Aqua Jet': 'Water', 'Flip Turn': 'Water', 'Last Respects': 'Ghost', 'Wave Crash': 'Water', 'Kowtow Cleave': 'Dark', 'Sucker Punch': 'Dark', 'Swords Dance': 'Normal' };
const SIX = [
 { id: 10035, n: 'Mega Charizard Y', r: 94, t: 'S', ty: ['Fire', 'Flying'], it: 'Charizardite Y', ab: 'Drought', mv: ['Heat Wave', 'Protect', 'Solar Beam', 'Weather Ball'], g: 'Lead' },
 { id: 445, n: 'Garchomp', r: 92, t: 'S', ty: ['Dragon', 'Ground'], it: 'Choice Scarf', ab: 'Rough Skin', mv: ['Dragon Claw', 'Earthquake', 'Rock Slide', 'Stomping Tantrum'], g: 'Lead' },
 { id: 547, n: 'Whimsicott', r: 88, t: 'A', ty: ['Grass', 'Fairy'], it: 'Focus Sash', ab: 'Prankster', mv: ['Encore', 'Moonblast', 'Protect', 'Tailwind'], g: 'Back' },
 { id: 903, n: 'Sneasler', r: 97, t: 'S', ty: ['Fighting', 'Poison'], it: 'White Herb', ab: 'Unburden', mv: ['Close Combat', 'Dire Claw', 'Fake Out', 'Protect'], g: 'Back' },
 { id: 902, n: 'Basculegion', r: 92, t: 'S', ty: ['Water', 'Ghost'], it: 'Life Orb', ab: 'Adaptability', mv: ['Aqua Jet', 'Flip Turn', 'Last Respects', 'Wave Crash'], g: 'Bench' },
 { id: 983, n: 'Kingambit', r: 96, t: 'S', ty: ['Dark', 'Steel'], it: 'Chople Berry', ab: 'Defiant', mv: ['Kowtow Cleave', 'Protect', 'Sucker Punch', 'Swords Dance'], g: 'Bench' }];
const SUBS = { Lead: 'start the battle', Back: 'come in next', Bench: 'stay out this game' };
const THREATS = [[10035, 'Mega Charizard Y', 0, 'Mirror · calc: beats it'], [981, 'Farigiraf', 0, ''], [10089, 'Mega Salamence', 0, ''], [10186, 'Indeedee (F)', 0, ''], [10305, 'Mega Raichu Y', 1, ''], [637, 'Volcarona', 1, ''], [1013, 'Sinistcha', 1, ''], [10316, 'Mega Golisopod', 1, '']];
const BOX = [10296, 812, 727, 1018, 700, 350, 279, 1000, 637, 981, 1013, 10089];
const tys = p => `<span class="zty">${p.ty.map(t => `<i style="--c:${TY[t]}">${t}</i>`).join('')}</span>`;
const mvs = p => `<span class="zmv">${p.mv.map(m => `<i style="--c:${TY[MV[m]]}">${m}</i>`).join('')}</span>`;
const sheet = p => `<button class="zsh"><b class="u">${p.n}</b><em class="u"><b>${p.r}</b> ${p.t} tier</em>${tys(p)}<small>${p.it} · ${p.ab}</small>${mvs(p)}</button>`;
const HEAD = (extra = '') => `<div class="zhd"><div class="zname"><p class="zk">My team · 6 of 6 · Sun team · Legal for Reg M-C ✓</p><h1 class="u">Sun Tailwind <span>(sample)</span></h1><p class="zsmp">This is a sample team, here to show how NastyPlot works.</p>
  <p class="zbb"><button class="zbtn u">Build Me a Team ›</button><button class="zbtn u ghost">Import a Team ›</button></p></div>${extra}
  <p class="zacts"><a>Why This Score? ›</a><a>Team Sheet ↗</a><a>Share as Image</a><a>Saved Teams 1</a><a>More ⋯</a><span class="u">Saved ✓</span></p></div>`;
const SCORE = `<div class="zscore"><p class="lab">Strength Score</p><p class="n u">94</p><p class="band u">Top tier</p><p class="win">Teams scoring like this win about <b>61%</b> against today's tournament teams. <b>Top 1% of tournament teams.</b></p></div>`;
const PLAN = `<button class="zplan"><b class="u">Game Plan ›</b><span>vs the meta's top six: lead <b>Mega Charizard Y + Garchomp</b>, back Whimsicott + Sneasler, bench Basculegion + Kingambit.</span></button>`;
const JUMP = `<p class="zjump"><a>Matchups</a><a>Suggestions</a><a>Team Checks</a><a>Your Games</a></p>`;
const MUH = `<h2 class="u">Matchups</h2><p class="zsub">Against the top 30 threats. Verdicts from real tournament games with your Pokémon; a row notes when the calc disagrees.</p>
 <p class="zcnt u"><span class="f"><b>4</b>Favoured</span><span class="e"><b>22</b>Even match</span><span class="x"><b>4</b>Unfavoured</span></p><p class="zcalc">Damage calc: No answer 0 · Shaky 9 · Handles it 9 · Beats it 12</p>
 <p class="ztabs">${['Stand-Outs', 'Top 10', 'Top 12 Grid', 'All 30'].map((t, i) => `<button class="${i ? '' : 'on'}">${t}</button>`).join('')}</p>`;
const THR = (sel = -1) => `<div class="zthr">${THREATS.map(([id, n, fav, note], i) => `<button class="zth ${fav ? 'f' : 'x'}${i === sel ? ' on' : ''}">${img(id)}<b>${n}</b><em>${fav ? 'Favoured' : 'Unfavoured'}</em>${note ? `<small>${note}</small>` : ''}</button>`).join('')}</div>`;
const SWAP = `<div class="zswap"><p class="s1 u">Suggestion 1 <b>+1</b><span>94 → 95</span></p><p class="opt">Optional swap: a small change. Real games can't tell it apart from what you have.</p>
  <div class="sw">${img(903)}<b>Sneasler</b><i>→</i>${img(10296)}<b>Mega Floette<small>To catch</small></b></div><p class="sa"><button class="zbtn u">Apply</button><a>Why? 13 reasons ›</a></p></div>`;
const SGTXT = `<p class="zp"><b>Nothing to fix.</b> Your team has every basic and no swap clearly beats it in real games. Your edge now comes from how you play it: plan each matchup in Battle, and tune your sets.</p><p class="zlk"><a>Battle ›</a><a>Popular Sets ›</a></p>`;
const SGLK = `<p class="zlk"><a>See All Suggestions ›</a><a>Never Suggest ›</a><a>Refresh Suggestions ›</a></p><button class="zrow"><b class="u">Adjust Suggestions ›</b><small>Box + Catch · 2 Megas · Swap Mega: No · Abilities: Yes</small></button>`;
const SG = `<div class="zsg"><h2 class="u">Suggestions</h2>${SGTXT}${SWAP}${SGLK}</div>`;
const CK = `<div class="zck"><h2 class="u">Team Checks</h2><p class="zsub">The 4 basics count toward the score; the notes are advice. <a class="zq">?</a></p>
 <button class="zrow ok"><b class="u">✓ All 4 basics and all 3 notes pass ›</b></button><button class="zrow"><b class="u">Things to Know ›</b><small>7 minor weak spots, type chart, legal</small></button></div>`;
const GM = `<div class="zgm"><h2 class="u">Your Games</h2><p class="none u">None logged yet</p><button class="zbtn u">Log a Game</button><p class="zsub">After 5 logged games, Build Me a Team weighs your own results and this record shows what beats you.</p></div>`;
const MU = `<div class="zmu">${MUH}${THR()}</div>`;
const BASE = `
@media (max-width:699.98px){.np-bar{position:static!important}}
.w{--tx:#17161A;--tx2:#5E5A66;--pk:#E8364F;--pkd:#C41E35;--bl:#0078BF;--link:#0068AD;--card:#fff;color:#17161A;font:400 16px/1.5 var(--b);overflow:hidden;padding:16px var(--gut) 44px;background:#F4F1EC}
.w *{box-sizing:border-box;margin:0}.w .u{font-family:var(--u)!important;font-weight:900!important;font-style:italic!important;font-synthesis:style;letter-spacing:-.02em}.w img{display:block;object-fit:contain;max-width:none}
:where(.w) button{font:inherit;color:inherit;background:none;border:0;border-radius:0;cursor:pointer;text-align:left;padding:0}
.w a{display:inline-flex;align-items:center;min-height:44px;font:800 15px/1.1 var(--b);color:var(--link);text-decoration:underline 2px;text-underline-offset:6px;cursor:pointer}.w a.zq{display:inline;min-height:0}
.w h2{font-size:26px;line-height:1.1;margin-bottom:6px}.zsub{font:500 14px/1.5 var(--b);color:var(--tx2)}.zp{font:500 15px/1.5 var(--b)}
.zhd{display:grid;gap:12px}.zk{font:700 13px/1.4 var(--b);color:var(--tx2)}.zname h1{font-size:30px;line-height:1.05;margin:2px 0 4px}.zname h1 span{font-size:.55em;color:var(--tx2)}.zsmp{font:500 14px/1.5 var(--b);color:var(--tx2)}.zbb{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.zbtn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 22px;background:#17161A;color:#fff;font-size:14px;clip-path:polygon(9px 0,100% 0,calc(100% - 9px) 100%,0 100%);white-space:nowrap}.zbtn.ghost{background:none;color:#17161A;box-shadow:inset 0 0 0 3px #17161A}.zbtn.red{background:none;color:var(--pkd);box-shadow:inset 0 0 0 3px var(--pkd)}
.zscore{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:0 16px}.zscore .n{grid-row:1/4;font-size:96px;line-height:.9;color:var(--bl)}.zscore .lab{font:700 13px/1.2 var(--b);color:var(--tx2)}.zscore .band{font-size:24px;line-height:1.1;color:var(--bl)}.zscore .win{font:500 13px/1.45 var(--b);color:var(--tx2)}.zscore .win b{color:#17161A}
.zacts{display:flex;flex-wrap:wrap;align-items:center;gap:0 20px}.zacts span{font-size:14px;color:var(--bl)}
.zty{display:flex;flex-wrap:wrap;gap:3px}.zty i{padding:0 7px;background:var(--c);color:#fff;font:700 11px/1.6 var(--b);font-style:normal;clip-path:polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)}
.zmv{display:grid;gap:3px}.zmv i{padding:3px 8px;background:var(--c);color:#fff;font:700 12px/1.3 var(--b);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zsh{display:grid;align-content:start;gap:4px;min-width:0;padding:10px 10px 12px;background:#fff}.zsh>b{font-size:13.5px;line-height:1.15}.zsh em{font-size:10.5px;color:var(--tx2)}.zsh em b{font-size:17px;color:var(--bl)}.zsh small{font:600 12px/1.3 var(--b);color:var(--tx2)}
.zplan{display:grid;gap:2px;width:100%;margin-top:16px;padding:14px 18px;background:#17161A;color:#fff;font:500 15px/1.5 var(--b);clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}.zplan b.u{font-size:17px}
.zjump{display:flex;flex-wrap:wrap;gap:0 22px;margin-top:16px;border-top:3px solid #17161A;padding-top:4px}.zjump a{color:#17161A;text-decoration:none}
.zlow{display:grid;gap:30px;margin-top:14px}.zlow>*{min-width:0}
.zcnt{display:flex;flex-wrap:wrap;gap:6px 22px;margin:12px 0 2px;font-size:14px;line-height:1}.zcnt span{display:flex;align-items:baseline;gap:6px}.zcnt b{font-size:34px}.zcnt .f{color:var(--bl)}.zcnt .x{color:var(--pkd)}.zcnt .e{color:var(--tx2)}
.zcalc{font:500 13px/1.5 var(--b);color:var(--tx2)}.ztabs{display:flex;flex-wrap:wrap;gap:4px;margin:10px 0 14px}.ztabs button{display:flex;align-items:center;min-height:46px;padding:0 14px;background:#fff;font:800 14px/1 var(--b);clip-path:polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%)}.ztabs .on{background:#17161A;color:#fff}
.zthr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.zth{display:grid;justify-items:start;gap:1px;min-width:0;padding:8px 10px 10px;background:#fff;box-shadow:inset 0 5px 0 var(--k)}.zth.f{--k:var(--bl)}.zth.x{--k:var(--pk)}.zth img{width:72px;height:72px}
.zth b{font:800 13px/1.2 var(--b)}.zth em{font:800 13px/1.2 var(--b);font-style:normal}.zth.f em{color:var(--link)}.zth.x em{color:var(--pkd)}.zth small{font:500 12px/1.2 var(--b);color:var(--tx2)}.zth.on{background:#17161A;color:#fff}.zth.on em{color:#FF8A9A}.zth.on small{color:#C9C5D0}
.zlk{display:flex;flex-wrap:wrap;gap:0 20px}.zswap{display:grid;gap:6px;margin:8px 0;padding:16px 18px;background:#fff;box-shadow:inset 6px 0 0 var(--bl)}
.zswap .s1{display:flex;align-items:baseline;gap:8px;font-size:14px}.zswap .s1 b{font-size:28px;line-height:1;color:var(--link)}.zswap .s1 span{font:700 13px/1 var(--b);font-style:normal;letter-spacing:0}.zswap .opt{font:500 13.5px/1.4 var(--b)}
.zswap .sw{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.zswap .sw img{width:52px;height:52px}.zswap .sw i{font:900 20px/1 var(--b);font-style:normal}.zswap .sw b{font:800 14px/1.2 var(--b)}.zswap .sw small{display:block;font:500 12.5px/1.2 var(--b)}.zswap .sa{display:flex;align-items:center;gap:18px;margin-top:4px}
.zrow{display:flex;align-items:center;flex-wrap:wrap;gap:2px 10px;width:100%;min-height:56px;padding:8px 0;border-top:3px solid #17161A}.zrow b{font-size:15px}.zrow small{flex-basis:100%;font:500 13px/1.3 var(--b);color:var(--tx2)}.zrow.ok b{color:#1F6B2D}
.zgm{display:grid;justify-items:start;gap:8px;align-content:start}.zgm .none{font-size:16px;color:var(--tx2)}.zhint{font:700 13px/1.4 var(--b);color:var(--tx2)}
.zgl{display:flex;align-items:baseline;gap:8px}.zgl b{font-size:16px;line-height:1.2}.zgl span{font:700 12.5px/1.2 var(--b);color:var(--tx2)}
@media (min-width:1000px){.w{padding:22px var(--gut) 60px}.w h2{font-size:32px}.zhd{grid-template-columns:minmax(0,1fr) 440px;gap:6px 40px;align-items:center}.zname h1{font-size:52px}.zacts{grid-column:1/-1}.zscore .n{font-size:140px}.zscore .band{font-size:32px}.zscore .win{font-size:14px}
 .zlow{grid-template-columns:repeat(12,minmax(0,1fr));gap:34px 28px}.zthr{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.zcnt b{font-size:44px}.zcnt{font-size:16px}.zplan{grid-template-columns:auto minmax(0,1fr);align-items:baseline;gap:14px;padding:16px 26px;font-size:16px}}
`;
// =====================================================================================================================
// 1 · THE BOX
const slot = (p, sel) => `<button class="sl${sel ? ' on' : ''}">${img(p.id)}<span><b class="u">${p.n}</b><small><b>${p.r}</b> · ${p.t} tier · ${p.it}</small></span></button>`;
const SEL = SIX[3];
const ONE = { name: '1-the-box', css: `
.bx{display:grid;gap:18px;margin-top:14px}
.party{display:grid;gap:6px;align-content:start}.party .zgl{margin-top:8px}.party .zgl:first-child{margin-top:0}
.sl{display:grid;grid-template-columns:52px minmax(0,1fr);align-items:center;gap:10px;min-height:64px;padding:6px 14px 6px 8px;background:#fff;clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%)}.sl img{width:52px;height:52px}
.sl b.u{font-size:14px;line-height:1.15;white-space:nowrap}.sl small{display:block;font:600 12px/1.3 var(--b);color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sl small b{color:var(--bl);font-weight:900}
.sl.on{background:#17161A;color:#fff}.sl.on small{color:#C9C5D0}.sl.on small b{color:#9BDCFF}
.sum{display:grid;gap:8px;justify-items:start;align-content:start;padding:16px;background:#fff}.sum>img{justify-self:center;width:190px;height:190px}.sum h3{font-size:22px;line-height:1.1}.sum em{font-size:12px;color:var(--tx2)}.sum em b{font-size:22px;color:var(--bl)}
.sum small{font:600 13.5px/1.3 var(--b);color:var(--tx2)}.sum .zmv{width:100%;grid-template-columns:repeat(2,minmax(0,1fr))}.sum .zmv i{padding:6px 10px;font-size:13px}.sum .do{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}.sum .do .zbtn{padding:0 16px}
.boxp{display:grid;gap:10px;align-content:start;min-width:0}.btabs{display:flex;gap:4px;flex-wrap:wrap}.btabs button{display:flex;align-items:center;min-height:46px;padding:0 14px;background:#fff;font:800 14px/1 var(--b);clip-path:polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%)}.btabs .on{background:var(--bl);color:#fff}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:12px;background:repeating-linear-gradient(135deg,#D8ECF9 0 22px,#CFE6F7 22px 44px);box-shadow:inset 0 0 0 4px var(--bl)}
.grid button{position:relative;display:grid;place-items:center;aspect-ratio:1;min-height:44px;background:rgba(255,255,255,.55)}.grid img{width:84%;height:84%}.grid .sug{background:#fff;box-shadow:0 0 0 4px #FFE14D}.grid .sug i{position:absolute;right:-6px;top:-8px;padding:1px 8px;background:#FFE14D;font:900 14px/1.4 var(--u);font-style:italic}
.try{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:12px;padding:12px 16px;background:#17161A;color:#fff}.try b.u{font-size:26px;line-height:1;color:#FFE14D;white-space:nowrap}.try span{font:600 14px/1.4 var(--b)}
@media (min-width:1000px){.bx{grid-template-columns:300px minmax(0,1fr) minmax(0,1.15fr);gap:28px;align-items:start}.grid{grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;padding:16px}.sum>img{width:230px;height:230px}.sum{padding:20px}
 .zmu{grid-column:1/9}.zside{grid-column:9/13;display:grid;gap:30px;align-content:start}}
`, html: () => `<div class="w">${HEAD(SCORE)}
 <section class="bx"><div class="party">${['Lead', 'Back', 'Bench'].map(g => `<p class="zgl"><b class="u">${g}</b><span>${SUBS[g]}</span></p>${SIX.filter(p => p.g === g).map(p => slot(p, p === SEL)).join('')}`).join('')}<p class="zhint" style="margin-top:6px">Tap one to see it. Drag to change the order.</p></div>
  <div class="sum">${img(SEL.id)}<em class="u"><b>${SEL.r}</b> ${SEL.t} tier</em><h3 class="u">${SEL.n}</h3>${tys(SEL)}<small>${SEL.it} · ${SEL.ab}</small>${mvs(SEL)}<p class="do"><button class="zbtn u">Edit set</button><button class="zbtn u ghost">Replace</button><button class="zbtn u red">Remove</button></p></div>
  <div class="boxp"><h2 class="u">Suggestions</h2><p class="btabs"><button class="on">Your Box</button><button>Suggestions 1</button><button>Saved Teams 1</button></p>
   <div class="grid">${BOX.map((id, i) => `<button class="${i ? '' : 'sug'}">${img(id)}${i ? '' : '<i>+1</i>'}</button>`).join('')}</div>
   <p class="try"><b class="u">94 → 95</b><span>Drag one onto a party spot to try it. The score updates before you keep it.</span></p>${SGTXT}${SWAP}${SGLK}</div></section>
 ${PLAN}${JUMP}<div class="zlow">${MU}<div class="zside">${CK}${GM}</div></div></div>` };
// =====================================================================================================================
// 2 · TEAM PREVIEW
const fld = (p, cls) => `<button class="fm ${cls}">${img(p.id)}<span class="tg u">${p.n}</span></button>`;
const TWO = { name: '2-team-preview', css: `
.tp{margin-top:14px}.pick{display:flex;gap:8px;overflow:hidden;flex-wrap:wrap;margin-bottom:12px}.pick button{display:flex;align-items:center;gap:6px;min-height:52px;padding:2px 14px 2px 4px;background:#fff;box-shadow:inset 0 -5px 0 var(--k);font:800 13px/1.15 var(--b)}.pick img{width:44px;height:44px}.pick .f{--k:var(--bl)}.pick .x{--k:var(--pk)}.pick .on{background:#17161A;color:#fff}
.field{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px 8px;padding:16px 10px 18px;background:linear-gradient(90deg,#DCEEFA 0 50%,#FBE0E5 50%);overflow:hidden}
.field::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:4px;margin-left:-2px;background:#fff}
.side{position:relative;display:grid;gap:8px;align-content:start;min-width:0}.side h3{font-size:14px;line-height:1.2}.side.them{justify-items:end;text-align:right}
.leads{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;width:100%}.rest{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;width:100%}
.fm{position:relative;display:grid;justify-items:center;min-width:0;min-height:44px}.fm img{position:relative;z-index:1;width:100%;max-width:150px;aspect-ratio:1;height:auto}.fm::before{content:"";position:absolute;left:8%;right:8%;bottom:20px;height:22px;border-radius:50%;background:rgba(23,22,26,.16)}
.fm .tg{position:relative;z-index:2;margin-top:-6px;padding:2px 8px;background:#17161A;color:#fff;font-size:10.5px;line-height:1.4;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.fm.sm{min-width:44px;min-height:48px}.fm.sm img{max-width:76px}.fm.sm .tg{font-size:9px;padding:1px 5px}.fm.bn{opacity:.55}.them .fm img{transform:scaleX(-1);max-width:170px}
.verd{grid-column:1/3;position:relative;z-index:3;justify-self:center;display:grid;justify-items:center;gap:2px;padding:10px 26px 12px;background:#17161A;color:#fff;text-align:center;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}.verd b{font-size:24px;line-height:1.1;color:#FF8A9A}.verd small{font:600 13px/1.3 var(--b)}
.rl{font:700 12px/1.3 var(--b);color:var(--tx2)}.six{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
@media (min-width:1000px){.field{gap:6px 40px;padding:22px 28px 26px;align-items:end}.verd{margin-top:6px;padding:16px 34px 18px}.verd b{font-size:34px}.verd small{font-size:14px}
 .side h3{font-size:17px}.leads{grid-template-columns:repeat(2,200px);justify-content:center;gap:10px}.fm img{max-width:200px}.fm .tg{font-size:13px;padding:3px 12px}.rest{grid-template-columns:repeat(4,96px);gap:8px}.fm.sm img{max-width:96px}.fm.sm .tg{font-size:10px}
 .you{grid-template-columns:auto minmax(0,1fr);align-items:end;gap:6px 18px}.you h3{grid-column:1/-1;grid-row:1}.you .rest{grid-row:2;grid-column:1;grid-template-columns:repeat(2,96px);width:auto}.you .leads{grid-row:2;grid-column:2}.you .rl{grid-column:1/-1}.them .fm img{max-width:230px}.them{align-self:end;justify-items:center!important;text-align:center!important}
 .six{grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.zmuh{grid-column:1/-1}.zsg{grid-column:1/6}.zck{grid-column:6/10}.zgm{grid-column:10/13}}
`, html: () => `<div class="w">${HEAD(SCORE)}
 <section class="tp">${MUH}<p class="zhint" style="margin-bottom:8px">Pick a threat to put it across from your leads.</p>
  <div class="pick">${THREATS.map(([id, n, fav], i) => `<button class="${fav ? 'f' : 'x'}${i ? '' : ' on'}">${img(id)}${n}</button>`).join('')}</div>
  <div class="field"><div class="side you"><h3 class="u">Your side</h3><div class="rest">${fld(SIX[2], 'sm')}${fld(SIX[3], 'sm')}${fld(SIX[4], 'sm bn')}${fld(SIX[5], 'sm bn')}</div><div class="leads">${fld(SIX[0], '')}${fld(SIX[1], '')}</div>
    <p class="rl">Lead: the two in front. Back: Whimsicott and Sneasler. Bench: the two faded. Drag to change who leads.</p></div>
   <div class="side them"><h3 class="u">The threat</h3><button class="fm">${img(10035)}<span class="tg u">Mega Charizard Y</span></button></div>
   <p class="verd u"><b>Unfavoured</b><small>Mirror · calc: beats it</small></p></div>
  <p class="zhint" style="margin:10px 0 0;text-align:center">Tap one of your six to edit, replace or remove it.</p>
  <div class="six">${SIX.map(sheet).join('')}</div></section>
 ${PLAN}${JUMP}<div class="zlow">${SG}${CK}${GM}</div></div>` };
// =====================================================================================================================
// 3 · THE CHECK-UP
const ball = p => `<button class="bl">${img(p.id)}<i class="pb"></i><span class="tg u">${p.n}</span></button>`;
const THREE = { name: '3-the-check-up', css: `
.cu{margin-top:14px;display:grid;gap:14px}
.mach{display:grid;gap:14px;padding:16px;background:linear-gradient(180deg,#FFFFFF,#E6E9EF);box-shadow:inset 0 0 0 4px #C9CED8,0 16px 20px -14px rgba(0,0,0,.35);border-radius:18px}
.scr{position:relative;display:grid;gap:4px;align-content:center;padding:16px 18px;background:#0E2A22;color:#7DF2AE;border-radius:10px;box-shadow:inset 0 0 0 4px #17161A;overflow:hidden}
.scr::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 4px);pointer-events:none}
.scr .lab{font:700 13px/1.2 var(--b);color:#B7F5D0}.scr .n{font-size:84px;line-height:.9;color:#fff}.scr .band{font-size:22px;line-height:1.1}.scr .win{font:500 13px/1.45 var(--b);color:#B7F5D0}.scr .win b{color:#fff}
.scr svg{width:100%;height:34px;margin:4px 0}.scr .rd{display:grid;gap:2px;margin-top:4px;font:700 13.5px/1.5 var(--b);color:#fff}.scr .rd i{font-style:normal;color:#7DF2AE;margin-right:6px}
.tray{display:grid;gap:12px;align-content:end}.tr3{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 8px;padding:10px 8px 12px;background:#D5DAE3;border-radius:12px;box-shadow:inset 0 3px 0 rgba(0,0,0,.12)}.tr3 .zgl{grid-column:1/-1}
.bl{position:relative;display:grid;justify-items:center;min-width:0}.bl img{position:relative;z-index:2;width:100%;max-width:130px;aspect-ratio:1;height:auto;margin-bottom:-22px;filter:drop-shadow(0 0 10px rgba(125,242,174,.9))}
.pb{position:relative;z-index:1;width:54px;height:54px;border-radius:50%;background:linear-gradient(180deg,#E8364F 0 46%,#17161A 46% 54%,#fff 54%);box-shadow:inset 0 0 0 3px #17161A,0 0 0 6px #B9C0CC}.pb::after{content:"";position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px #17161A}
.bl .tg{position:relative;z-index:3;margin-top:6px;padding:2px 8px;background:#17161A;color:#fff;font-size:10.5px;line-height:1.3;text-align:center;max-width:100%}
.six3{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.w .rx{background:#fff;padding:18px 18px 14px;box-shadow:inset 0 8px 0 var(--bl)}.rx .zswap{box-shadow:inset 0 0 0 3px #17161A;background:#F4F1EC}
@media (min-width:1000px){.mach{grid-template-columns:400px minmax(0,1fr);gap:22px;padding:22px}.scr{padding:22px 26px}.scr .n{font-size:128px}.scr .band{font-size:30px}.tray{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-content:stretch}.tr3{padding:14px 12px 16px;align-content:space-between}.bl img{max-width:190px}.pb{width:64px;height:64px}.bl .tg{font-size:12px}
 .six3{grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.zmu{grid-column:1/9}.zsg{grid-column:9/13}.zck{grid-column:1/7}.zgm{grid-column:7/13}}
`, html: () => `<div class="w">${HEAD('')}
 <section class="cu"><div class="mach"><div class="scr"><p class="lab">Strength Score</p><p class="n u">94</p><p class="band u">Top tier</p>
    <svg viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20H60L70 6L82 30L92 12L100 20H170L180 4L192 32L202 14L210 20H300" fill="none" stroke="#7DF2AE" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>
    <p class="win">Teams scoring like this win about <b>61%</b> against today's tournament teams. <b>Top 1% of tournament teams.</b></p>
    <p class="rd"><span><i>✓</i>All 4 basics pass</span><span><i>✓</i>All 3 notes pass</span><span><i>!</i>7 minor weak spots</span><span><i>✓</i>Legal for Reg M-C</span></p></div>
   <div class="tray">${['Lead', 'Back', 'Bench'].map(g => `<div class="tr3"><p class="zgl"><b class="u">${g}</b><span>${SUBS[g]}</span></p>${SIX.filter(p => p.g === g).map(ball).join('')}</div>`).join('')}</div></div>
  <p class="zhint" style="text-align:center">Tap one to edit, replace or remove it. Drag a ball to another spot to change who leads.</p>
  <div class="six3">${SIX.map(sheet).join('')}</div></section>
 ${PLAN}${JUMP}<div class="zlow">${MU}<div class="zsg rx"><h2 class="u">Suggestions</h2>${SGTXT}${SWAP}${SGLK}</div>${CK}${GM}</div></div>` };
// =====================================================================================================================
const b = await chromium.launch(); const stats = [];
for (const d of [ONE, TWO, THREE].filter(x => !only || x.name.startsWith(only))) for (const [dev, o] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }]]) {
  const c = await b.newContext(o), p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', 'day'); } catch (e) {} });
  await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
  await p.evaluate(({ html, css }) => { document.documentElement.setAttribute('data-theme', 'day'); const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const m = document.getElementById('main'), m2 = m.cloneNode(false); m2.innerHTML = html; m.replaceWith(m2); scrollTo(0, 0);
    document.getElementById = () => null; document.querySelector = () => null; document.querySelectorAll = () => []; }, { html: d.html(), css: BASE + d.css });
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {}); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const m = await p.evaluate(() => { const W = document.getElementsByClassName('w')[0], small = [], cut = [];
    for (const e of W.getElementsByTagName('*')) { if (/^(BUTTON|A)$/.test(e.tagName) && !e.classList.contains('zq')) { const r = e.getBoundingClientRect(); if (r.width && (r.height < 43.5 || r.width < 43.5)) small.push((e.textContent.trim() || '?').slice(0, 16) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); } }
    return { s: (W.getBoundingClientRect().height / innerHeight).toFixed(2), sw: document.documentElement.scrollWidth > innerWidth, small }; });
  await p.screenshot({ path: path.join(OUT, `${d.name}-${dev}-light.png`), fullPage: true });
  stats.push(`${d.name} ${dev}: ${m.s} screens${m.sw ? ' SIDEWAYS' : ''}, small ${m.small.length}${m.small.length ? ' (' + m.small.slice(0, 6).join(', ') + ')' : ''}`); await c.close(); }
await b.close(); console.log(stats.join('\n'));
