// Three further ideas in the rebuild's style, real data: (1) Ratings page with search, hover peek and the team dock, (2) first-visit My Team, (3) shareable result picture.
// Usage: node ideas.cjs <design6Repo> <d6Dir(tokens.css)> <outDir>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const [REPO, D6, OUT] = process.argv.slice(2), rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const days = rd('ratings_log.json').days, last = days[days.length - 1], R = last.r, L = rd('limitless.json'), mons = L.results.mons;
console.log('ratings day keys', Object.keys(last).join(','), '| teams', L.teams, 'tournaments', L.tournaments, 'games', L.games);
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8'), dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const sp = n => path.join(REPO, 'app/sp', SPRITE_ID[n] + '.webp'), has = n => SPRITE_ID[n] && fs.existsSync(sp(n)), spr = n => 'data:image/webp;base64,' + fs.readFileSync(sp(n)).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : ''));
const info = n => { const i = dataJs.indexOf('{"n":"' + n + '",'), s = dataJs.slice(i, i + 400); return {t: JSON.parse(s.match(/"t":(\[[^\]]+\])/)[1]), sp: +s.match(/"sp":(\d+)/)[1]}; };
const mon = n => ({n, d: disp(n), r: R[n] || 0, u: mons[n] ? +(mons[n][0] / L.teams * 100).toFixed(1) : 0, w: mons[n] ? +(mons[n][1] * 100).toFixed(1) : 0, ...info(n), img: spr(n)});
const top = Object.keys(mons).filter(n => has(n) && mons[n][0] / L.teams >= .015 && R[n]).sort((a, b) => R[b] - R[a]).slice(0, 12).map(mon);
const TEAM = ['Garchomp', 'Charizard-Mega-Y', 'Sneasler', 'Whimsicott', 'Basculegion', 'Kingambit'];
// score values are the ones the rebuild's My Team mock-up shows for its sample team
const DATA = {top, team: TEAM.map(mon), roles: ['Lead', 'Lead', 'Back', 'Back', 'Bench', 'Bench'], teams: L.teams, tours: L.tournaments, games: L.games, score: {s: 91, band: 'Top tier', rank: 'Top 2% of tournament teams', name: 'Sun Tailwind', style: 'Sun · Tailwind'}};
console.log(top.map(m => `${m.d} ${m.r} ${m.u}% ${m.w}%`).join(' | '));
const TOK = fs.readFileSync(path.join(D6, 'tokens.css'), 'utf8');
const page = (theme, scene) => `<!doctype html><html lang="en" data-theme="${theme}" data-scene="${scene}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@300..900&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap">
<style>${TOK}
:root[data-theme="dusk"]{--bg:#12121B;--surface:#1D1C29;--wash:#201F2D;--ink:#E4E0DA;--ink-2:#C4BFCB;--ink-3:#B0AAB8;--rule:rgba(228,224,236,.10);--good:#74D3A0;--good-text:#86D9AC;--plate:#343348;--on-plate:#F1EDE7}
:root{--gut:96px;--lift:0 1px 2px rgba(30,20,50,.10),0 10px 18px -8px rgba(30,20,50,.2),0 30px 50px -24px rgba(30,20,50,.34)}:root[data-theme="dusk"]{--lift:0 1px 2px rgba(0,0,0,.4),0 10px 18px -8px rgba(0,0,0,.5),0 30px 50px -20px rgba(0,0,0,.7)}
body{width:1440px}.page{position:relative;overflow:hidden;min-height:1000px}
[data-theme="dusk"] .page{background:linear-gradient(180deg,#0C0C14 0,#12121C 280px,#181826 520px,#12121B 100%)}
header{height:76px;display:flex;align-items:center;gap:36px;padding:0 var(--gut);position:relative;z-index:2}header .logo svg{height:36px;display:block}
nav{display:flex;gap:36px;margin-left:40px}nav a{font:500 15px/1 var(--b);color:var(--ink-2)}nav a.on{color:var(--ink);font-weight:700;position:relative}nav a.on::after{content:"";position:absolute;left:0;right:0;bottom:-10px;height:5px;background:var(--plot);transform:skewX(var(--slant))}
.find{margin-left:auto;width:340px;height:44px;display:flex;align-items:center;gap:10px;padding:0 18px;border:1.5px solid var(--ink);transform:skewX(-10deg);font:500 15px/1 var(--b);color:var(--ink-3)}.find>*{transform:skewX(10deg)}.find kbd{margin-left:auto;font:600 13px/1 var(--b);color:var(--ink-3);border:1px solid var(--rule);padding:4px 7px;border-radius:4px}
[data-theme="dusk"] .find{border-color:rgba(228,224,236,.42)}[data-theme="dusk"] .btn2{border-color:rgba(228,224,236,.42)}
h1{font-size:48px;margin:12px 0 12px}h1 em{font-style:inherit;color:var(--plot)}.lede{font-size:17px;color:var(--ink-2);max-width:380px}
.num{font-family:var(--u);font-style:italic;font-weight:900;letter-spacing:-.03em}
.pan{position:absolute;transform:skewY(-7deg);border-radius:6px;background:linear-gradient(150deg,rgba(var(--cp),.9),rgba(var(--cp),.55));box-shadow:inset 0 1px 0 rgba(255,255,255,.6),var(--lift)}
[data-theme="dusk"] .pan{background:linear-gradient(150deg,rgba(var(--cp),.78),rgba(var(--cp),.34));box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 0 0 1px rgba(var(--cp),.25),0 24px 50px -24px rgba(var(--cp),.6)}
.pool{position:absolute;border-radius:50%;background:radial-gradient(closest-side,var(--contact),transparent 60%) center/46% 50% no-repeat,radial-gradient(closest-side,rgba(var(--cp),.62),rgba(var(--cp),.3) 55%,transparent)}
[data-theme="dusk"] .pool{background:radial-gradient(closest-side,rgba(var(--cp),.9),rgba(var(--cp),.32) 45%,transparent)}
:root[data-theme="light"]{--contact:rgba(30,20,50,.42)}
.art{position:absolute;object-fit:contain;filter:drop-shadow(4px 7px 7px rgba(30,20,50,.16))}[data-theme="dusk"] .art{filter:drop-shadow(0 0 .6px rgba(255,255,255,.55)) drop-shadow(0 -1px 5px rgba(var(--cp),.3))}
[data-theme="dusk"] .btn{background:linear-gradient(180deg,#63C0F8,#3FA2E2);color:#08131E;box-shadow:inset 0 1px 0 rgba(255,255,255,.55)}
[data-theme="dusk"] .plate{background:linear-gradient(180deg,#3E3D56,#2C2B3D);box-shadow:inset 0 1px 0 rgba(255,255,255,.28)}
.plate{display:inline-flex;align-items:center;height:36px;padding:0 16px;background:var(--plate);color:var(--on-plate);font:900 15px/1 var(--u);font-style:italic;clip-path:polygon(11px 0,100% 0,calc(100% - 11px) 100%,0 100%)}
/* ---- ratings ---- */
.rat{display:grid;grid-template-columns:380px minmax(0,1fr);gap:56px;padding:28px var(--gut) 120px;position:relative;z-index:1}
.feat{position:relative;height:300px;margin-top:20px}.hint{margin-top:10px;font:500 13px/1.4 var(--b);color:var(--ink-3)}.facts dd{font-size:22px}.facts dt{font:500 13px/1.3 var(--b);color:var(--ink-3)}.go{display:flex;gap:24px;margin-top:6px;font:600 15px/1 var(--b)}.go a:first-child{border-bottom:1.5px solid currentColor;padding-bottom:2px}.go a:last-child{color:var(--ink-2)}.src{margin-top:10px;font:500 13px/1.4 var(--b);color:var(--ink-3)}.feat .pan{left:0;right:20px;top:70px;height:190px}.feat .art{left:50%;width:270px;height:270px;margin-left:-145px;top:0}.feat .plate{position:absolute;left:-6px;top:244px}
.facts{display:grid;grid-template-columns:repeat(3,1fr);margin-top:28px;border-top:1px solid var(--rule)}.facts div{padding:14px 0}.facts b{display:block;font-size:22px}.facts span{font:500 13px/1.3 var(--b);color:var(--ink-3)}
.tb .hd,.tb .rw{display:grid;grid-template-columns:36px 60px minmax(0,1fr) 170px 96px 96px;align-items:center;gap:12px}
.tb .hd{height:36px;font:600 13px/1 var(--b);color:var(--ink-3)}.tb .hd span:nth-child(n+4){text-align:right}
.tb .rw{height:60px;border-top:1px solid var(--rule);position:relative}.tb .rw.hov{background:var(--surface);box-shadow:var(--lift);border-color:transparent;z-index:3;margin:0 -16px;padding:0 16px}
.tb .k{font:900 15px/1 var(--u);font-style:italic;color:var(--ink-3)}.tb .ic{position:relative;height:60px}.tb .ic .pool{left:2px;top:42px;width:56px;height:12px}.tb .ic img{position:absolute;left:4px;top:4px;width:52px;height:52px;object-fit:contain}
.tb .nm{font:700 16px/1.2 var(--b);display:flex;align-items:center;gap:10px;white-space:nowrap;flex-wrap:wrap;row-gap:4px}.tb .nm .mine{flex:1 0 100%}.tb .rw{height:58px}.tb .rw.me{height:66px}.tb .nm .chip.type{height:22px;padding:0 10px;font-size:13px}
.tb .mine{display:inline-flex;align-items:center;gap:6px;font:600 13px/1 var(--b);color:var(--plot-text)}.tb .mine::before{content:"";width:12px;height:6px;background:var(--plot);transform:skewX(var(--slant))}
.tb .rt{display:flex;align-items:center;gap:12px;justify-content:flex-end}.tb .rt i{flex:1;height:6px;background:var(--rule);transform:skewX(var(--slant));position:relative}.tb .rt i b{position:absolute;left:0;top:0;bottom:0;background:var(--ink)}.tb .rt .num{font-size:22px;width:44px;text-align:right}
.tb .v{text-align:right;font:600 16px/1 var(--b)}
.peek{position:absolute;z-index:6;right:-8px;top:52px;width:330px;padding:18px 20px 18px;background:var(--surface);border-radius:10px;box-shadow:var(--lift)}
.peek .top{display:flex;gap:14px;align-items:center}.peek .ph{position:relative;width:92px;height:92px;flex:none}.peek .ph .pan{left:4px;right:4px;top:22px;height:56px}.peek .ph img{position:absolute;inset:0;width:92px;height:92px;object-fit:contain}
.peek b.n{display:block;font:700 17px/1.2 var(--b);margin-bottom:6px}.peek .chip.type{height:22px;padding:0 10px;font-size:13px}
.peek dl{display:grid;grid-template-columns:repeat(3,1fr);margin-top:14px;border-top:1px solid var(--rule);padding-top:12px}.peek dt{font:500 13px/1.2 var(--b);color:var(--ink-3)}.peek dd{font-size:20px}
.peek .go{display:flex;justify-content:space-between;margin-top:14px;font:600 15px/1 var(--b)}.peek .go a:first-child{border-bottom:1.5px solid currentColor;padding-bottom:2px}.peek .go a:last-child{color:var(--ink-2)}
.cursor{position:absolute;z-index:7;right:372px;top:30px;width:22px}
.dock{position:absolute;left:0;right:0;bottom:0;height:72px;z-index:8;display:flex;align-items:center;gap:24px;padding:0 var(--gut);background:color-mix(in srgb,var(--bg) 72%,transparent);-webkit-backdrop-filter:blur(18px) saturate(1.6);backdrop-filter:blur(18px) saturate(1.6);border-top:1px solid var(--rule);box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
[data-theme="dusk"] .dock{box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.dock .t{font:700 15px/1.2 var(--b)}.dock .t small{display:block;font:500 13px/1.2 var(--b);color:var(--ink-3)}.dock .sc{display:flex;align-items:baseline;gap:8px}.dock .sc .num{font-size:30px}.dock .sc span{font:900 15px/1 var(--u);font-style:italic;color:var(--plot)}
.dock .six{display:flex;gap:6px;margin-left:8px}.dock .six div{position:relative;width:52px;height:56px}.dock .six .pool{left:4px;top:42px;width:44px;height:10px}.dock .six img{position:absolute;left:2px;top:2px;width:48px;height:48px;object-fit:contain}
.dock .btn2{margin-left:auto;height:40px}
/* ---- first visit ---- */
.empty{display:grid;grid-template-columns:470px minmax(0,1fr);gap:48px;padding:28px var(--gut) 0;position:relative;z-index:1;align-items:start}
.empty h1{font-size:40px;margin-top:14px}.ways .btn{flex:1 0 100%}.ways .btn2{flex:1}.empty .lede{max-width:440px}.ways{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}.ways .btn{height:52px}.ways .btn2{height:48px}
.note{margin-top:20px;font:500 13px/1.5 var(--b);color:var(--ink-3);max-width:420px}
.slots{position:relative;height:300px;margin-top:20px}.slots .floor{position:absolute;left:-30px;right:-30px;top:214px;height:110px;background:linear-gradient(90deg,transparent,var(--fl) 12%,var(--fl) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,var(--fs),transparent)}
:root{--fl:rgba(23,22,26,.13);--fs:rgba(60,40,110,.055)}:root[data-theme="dusk"]{--fl:rgba(214,218,255,.3);--fs:rgba(150,160,255,.2)}
.slots .sl{position:absolute;top:0;width:106px;text-align:center}.slots .sl i{position:absolute;left:10px;right:10px;top:108px;height:96px;transform:skewY(-7deg);border-radius:6px;border:1.5px dashed color-mix(in srgb,var(--ink) 30%,transparent)}
.slots .sl u{position:absolute;left:0;right:0;top:138px;text-decoration:none;font:900 26px/1 var(--u);color:var(--ink-3)}.slots .sl span{position:absolute;left:0;right:0;top:228px;font:900 15px/1 var(--u);font-style:italic;color:var(--ink-3)}.slots .sl.ld span{color:var(--plot)}
.starts{padding:36px var(--gut) 0;position:relative;z-index:1}.starts h2{font-size:22px}.starts p{font-size:15px;color:var(--ink-2);margin:4px 0 8px}
.srow{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;position:relative}.srow .floor{position:absolute;left:-30px;right:-30px;top:132px;height:90px;background:linear-gradient(90deg,transparent,var(--fl) 12%,var(--fl) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,var(--fs),transparent)}
.st{position:relative;height:210px;text-align:center}.st .pool{left:50%;top:120px;width:124px;height:24px;margin-left:-62px}.st .art{left:50%;top:6px;width:128px;height:128px;margin-left:-64px}
.st .tx{position:absolute;left:0;right:0;top:144px;font:700 15px/1.25 var(--b)}.st .tx small{display:block;font:500 13px/1.3 var(--b);color:var(--ink-2)}
/* ---- share picture ---- */
[data-scene="share"] body{width:1200px}[data-scene="share"] .page{min-height:630px;height:630px}
.share{position:absolute;inset:0;padding:44px 56px}.share .logo svg{height:40px;display:block}.share .tag{position:absolute;right:56px;top:54px;font:900 15px/1 var(--u);font-style:italic}.share .tag em{font-style:inherit;color:var(--plot)}
.share .lk{position:absolute;left:56px;top:176px}.share .lk .eyebrow{margin-bottom:6px}.share .lk .nm{font-size:30px}.share .lk .big{display:flex;align-items:flex-end;gap:16px;margin-top:10px}.share .lk .big b{font:900 190px/.84 var(--u);font-style:italic;letter-spacing:-.05em}
.share .lk .big span{font:900 30px/1.05 var(--u);font-style:italic;color:var(--plot);padding-bottom:18px}.share .lk .big small{display:block;font:600 14px/1.3 var(--b);color:var(--ink-2);margin-top:6px;font-style:normal;letter-spacing:0}
.share .lk p{margin-top:18px;font:600 19px/1.3 var(--b)}
.share .row{position:absolute;left:520px;right:40px;top:120px;height:460px}.share .row .floor{display:none;position:absolute;left:-30px;right:-10px;top:292px;height:110px;background:linear-gradient(90deg,transparent,var(--fl) 12%,var(--fl) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,var(--fs),transparent)}
.share .m{position:absolute;width:210px;text-align:center}.share .m .pool{left:50%;width:150px;height:28px;margin-left:-75px}.share .m .art{left:50%;width:170px;height:170px;margin-left:-85px}.share .m .tx{position:absolute;left:0;right:0;font:700 15px/1.2 var(--b)}
[data-theme="dusk"] .lk .big b{color:#D6D1CA}[data-theme="dusk"] .lk .big span,[data-theme="dusk"] .dock .sc span{color:#62BEF7}
</style></head><body><div class="page" id="page"></div><script>
const D=${JSON.stringify(DATA)},LOGO=${JSON.stringify(sb.NP_SVG[theme === 'dusk' ? 'hdrD' : 'hdrL'])},SCENE=${JSON.stringify(scene)};
const TY={Dragon:'#5060E1',Ground:'#9A6230',Fighting:'#D9631B',Poison:'#8E3FC8',Dark:'#5A4A56',Steel:'#4F8FA6',Fire:'#DD4420',Water:'#2A78D8',Grass:'#2E9A46',Fairy:'#C953C2',Flying:'#5F97D8',Ghost:'#6A4BB8',Psychic:'#D93E78',Ice:'#1E9FBF',Rock:'#8F8556',Electric:'#B88A00',Normal:'#8E908C',Bug:'#7F9A12'};
function hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;}return[h,s,l];}
function norm(c){let[h,s]=hsl(...c);s=Math.max(s,.72);const l=.56,k=(1-Math.abs(2*l-1))*s,x=k*(1-Math.abs((h/60)%2-1)),m=l-k/2;return[[k,x,0],[x,k,0],[0,k,x],[0,x,k],[x,0,k],[k,0,x]][Math.floor(h/60)%6].map(v=>Math.round((v+m)*255)).join(',');}
async function meta(src){const im=new Image();im.src=src;await im.decode();const S=64,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.drawImage(im,0,0,S,S);const d=x.getImageData(0,0,S,S).data,B=Array.from({length:18},()=>[0,0,0,0]);let y1=0;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<60)continue;y1=Math.max(y1,Math.floor(i/4/S));if(d[i+3]<200)continue;const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(s<.28||l<.2||l>.86)continue;const b=B[Math.floor(h/20)%18],w=s*s;b[0]+=d[i]*w;b[1]+=d[i+1]*w;b[2]+=d[i+2]*w;b[3]+=w;}
  const o=B.map(b=>({w:b[3],c:b[3]?b.slice(0,3).map(v=>Math.round(v/b[3])):[150,150,170]})).sort((a,b)=>b.w-a.w);return{cp:norm(o[0].c),bot:(y1+1)/S};}
const ty=t=>t.map(x=>'<span class="chip type" style="background:'+TY[x]+'">'+x+'</span>').join(' '),n0=v=>v.toLocaleString('en-US');
(async()=>{const M={};await Promise.all([...D.top,...D.team].map(async m=>{M[m.n]=M[m.n]||await meta(m.img);}));
  // a Pokemon standing with its feet on y=floor: art box of size z placed so the lowest drawn pixel touches the floor
  const stand=(m,z,floor)=>'top:'+(floor-M[m.n].bot*z)+'px';
  const head=(on,find)=>'<header><div class="logo">'+LOGO+'</div><nav>'+['Build','My Team','Battle','Meta'].map(a=>'<a'+(a==on?' class="on"':'')+'>'+a+'</a>').join('')+'</nav>'+(find?'<div class="find"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span style="white-space:nowrap">Search Pokémon, moves, items</span><kbd>/</kbd></div>':'<span style="margin-left:auto;font:500 15px/1 var(--b);color:var(--ink-2)">Search</span>')+'</header>';
  const mine=n=>D.team.some(t=>t.n===n);let h='';
  if(SCENE==='ratings'){const hov=3,p=D.top[hov],f=p;
    h=head('Meta',1)+'<div class="rat"><div><div class="eyebrow">Meta · Ratings</div><h1 class="u">Who wins <em>right now.</em></h1><p class="lede">Every Pokémon rated from real tournament results, not opinion.</p><p class="src">'+n0(D.teams)+' teams · '+n0(D.tours)+' tournaments · '+n0(D.games)+' games</p>'+
      '<div class="feat" style="--cp:'+M[f.n].cp+'"><div class="pan"></div><img class="art" src="'+f.img+'"><div class="plate">#'+(hov+1)+' · '+f.d+' · Rated '+f.r+'</div></div>'+
      '<dl class="facts"><div><dt>Base Speed</dt><dd class="num">'+p.sp+'</dd></div><div><dt>On teams</dt><dd class="num">'+p.u.toFixed(1)+'<span class="unit">%</span></dd></div><div><dt>Win rate</dt><dd class="num">'+p.w.toFixed(1)+'<span class="unit">%</span></dd></div></dl><div class="go"><a>Open info sheet</a><a>Build around it</a></div><p class="hint">Point at any row and it steps up here. Nothing covers the table.</p></div>'+
      '<div class="tb"><div class="hd"><span></span><span></span><span>Pokémon</span><span>Rating</span><span>On teams</span><span>Win rate</span></div>'+
      D.top.map((m,i)=>'<div class="rw'+(i==hov?' hov':'')+(mine(m.n)?' me':'')+'" style="--cp:'+M[m.n].cp+'"><span class="k">'+(i+1)+'</span><div class="ic"><i class="pool"></i><img src="'+m.img+'"></div><div class="nm">'+m.d+' '+ty(m.t)+(mine(m.n)?'<span class="mine">On your team</span>':'')+'</div>'+
        '<div class="rt"><i><b style="width:'+m.r+'%"></b></i><span class="num">'+m.r+'</span></div><div class="v">'+m.u.toFixed(1)+'<span class="unit">%</span></div><div class="v">'+m.w.toFixed(1)+'<span class="unit">%</span></div>'+
        ''+'</div>').join('')+'</div></div>'+
      '<div class="dock"><div class="t">'+D.score.name+'<small>My Team · '+D.score.style+'</small></div><div class="sc"><b class="num">'+D.score.s+'</b><span>'+D.score.band+'</span></div><div class="six">'+D.team.map(m=>'<div style="--cp:'+M[m.n].cp+'"><i class="pool"></i><img src="'+m.img+'"></div>').join('')+'</div><div class="btn2"><span>Open My Team</span></div></div>';}
  if(SCENE==='empty'){const w=106,gap=(730-6*w)/5;
    h=head('My Team',0)+'<div class="empty"><div><div class="eyebrow">My Team · no team yet</div><h1 class="u">Six empty spots. <em>Start plotting.</em></h1><p class="lede">Build a team, paste one from Showdown, or try the sample team to see how NastyPlot scores it.</p>'+
      '<div class="ways"><div class="btn">Try the sample team</div><div class="btn2"><span>Paste from Showdown</span></div><div class="btn2"><span>Build from scratch</span></div></div><p class="note">Your team is saved on this device only. No account, no name, no email.</p></div>'+
      '<div class="slots"><div class="floor"></div>'+['Lead','Lead','Back','Back','Bench','Bench'].map((r,i)=>'<div class="sl'+(i<2?' ld':'')+'" style="left:'+(i*(w+gap))+'px"><i></i><u>+</u><span>'+r+'</span></div>').join('')+'</div></div>'+
      '<div class="starts"><h2 class="u">Or start from a winner</h2><p>Today\\'s six highest-rated Pokémon. Pick one and build around it.</p><div class="srow"><div class="floor"></div>'+D.top.slice(0,6).map(m=>'<div class="st" style="--cp:'+M[m.n].cp+'"><i class="pool"></i><img class="art" src="'+m.img+'" style="'+stand(m,128,132)+'"><div class="tx">'+m.d+'<small>Rated '+m.r+' · on '+m.u.toFixed(1)+'% of teams</small></div></div>').join('')+'</div></div>';}
  if(SCENE==='share'){const xs=[0,210,420,0,210,420];
    h='<div class="share"><div class="logo">'+LOGO+'</div><div class="tag">Sharply raise <em>your win rate.</em></div><div class="lk"><div class="eyebrow">'+D.score.style+'</div><div class="nm u">'+D.score.name+'</div><div class="big"><b>'+D.score.s+'</b><span>'+D.score.band+'<small>Strength Score</small></span></div><p>'+D.score.rank+'</p></div>'+
      '<div class="row">'+D.team.map((m,i)=>{const z=176,f=i<3?170:400;return '<div class="m" style="left:'+xs[i]+'px;top:0;--cp:'+M[m.n].cp+'"><i class="pool" style="top:'+(f-14)+'px"></i><img class="art" src="'+m.img+'" style="width:'+z+'px;height:'+z+'px;margin-left:-'+z/2+'px;'+stand(m,z,f)+'"><div class="tx" style="top:'+(f+16)+'px">'+m.d+'</div></div>';}).join('')+'</div></div>';}
  document.getElementById('page').innerHTML=h;document.body.dataset.ready=1;})();
</script></body></html>`;
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  const jobs = [['ratings', 'light', 1440, 1000], ['ratings', 'dusk', 1440, 1000], ['empty', 'light', 1440, 840], ['empty', 'dusk', 1440, 840], ['share', 'dusk', 1200, 630], ['share', 'light', 1200, 630]];
  await Promise.all(jobs.map(async ([scene, theme, w, h]) => { const f = path.join(OUT, `idea-${scene}-${theme}.html`); fs.writeFileSync(f, page(theme, scene));
    const pg = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2})).newPage(); pg.on('pageerror', e => console.log('ERR', scene, e.message));
    await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}).catch(() => console.log('NOT READY', scene)); await pg.waitForTimeout(400);
    await pg.screenshot({path: path.join(OUT, `nastyplot-idea-${scene}-${theme === 'dusk' ? 'night' : 'day'}.png`), clip: {x: 0, y: 0, width: w, height: h}}); await pg.close(); }));
  await b.close();
})();
