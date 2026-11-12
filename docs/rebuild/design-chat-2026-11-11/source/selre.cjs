// Three redesigns of how My Team shows the selected Pokemon (no colour panel behind it). Standalone pages in the rebuild's tokens, real sample-team values
// as the new build shows them (score 93, Top tier; Mega Charizard Y selected). Usage: node selre.cjs <design6Repo> <d6Dir(tokens.css)> <outDir>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const [REPO, D6, OUT] = process.argv.slice(2);
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const spr = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(REPO, 'app/sp', SPRITE_ID[n] + '.webp')).toString('base64');
// the sample team as the new build's My Team shows it (plan order), Nov 11 preview data
const TEAM = [['Charizard-Mega-Y', 'Mega Charizard Y', 'Lead', 'Charizardite Y'], ['Garchomp', 'Garchomp', 'Lead', 'Choice Scarf'], ['Whimsicott', 'Whimsicott', 'Back', 'Focus Sash'], ['Sneasler', 'Sneasler', 'Back', 'White Herb'], ['Basculegion', 'Basculegion', 'Bench', 'Life Orb'], ['Kingambit', 'Kingambit', 'Bench', 'Chople Berry']]
  .map(t => ({n: t[0], d: t[1], role: t[2], item: t[3], img: spr(t[0])}));
const DATA = {team: TEAM, sel: {ability: 'Drought', rating: 94, tier: 'S tier', types: ['Fire', 'Flying']}, score: 93, band: 'Top tier', win: 'Teams scoring like this win about 60% against today\u2019s tournament teams', rank: 'Top 1% of tournament teams', name: 'Sun Tailwind (sample)', style: '6 of 6 · Sun team'};
const TOK = fs.readFileSync(path.join(D6, 'tokens.css'), 'utf8');
const page = (theme, scene) => `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@300..900&family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400..700&display=swap">
<style>${TOK}
:root[data-theme="dusk"]{--bg:#12121B;--surface:#1D1C29;--wash:#201F2D;--ink:#E4E0DA;--ink-2:#C4BFCB;--ink-3:#B0AAB8;--rule:rgba(228,224,236,.10);--plate:#343348;--on-plate:#F1EDE7;--plot:#62BEF7;--plot-text:#62BEF7}
:root{--gut:96px;--fl:rgba(23,22,26,.13);--fs:rgba(60,40,110,.055);--contact:rgba(30,20,50,.42);--slab:#17161A;--slab2:#3A3842}
:root[data-theme="dusk"]{--fl:rgba(214,218,255,.3);--fs:rgba(150,160,255,.2);--slab:#E9E5DE;--slab2:#B9B4AC}
.page{position:relative;overflow:hidden}[data-theme="dusk"] .page{background:linear-gradient(180deg,#0C0C14 0,#12121C 200px,#181826 430px,#12121B 100%)}
header{height:76px;display:flex;align-items:center;gap:36px;padding:0 var(--gut)}header .logo svg{height:36px;display:block}
nav{display:flex;gap:36px;margin:0 auto}nav a{font:500 15px/1 var(--b);color:var(--ink-2)}nav a.on{color:var(--ink);font-weight:700;position:relative}nav a.on::after{content:"";position:absolute;left:0;right:0;bottom:-10px;height:5px;background:var(--plot);transform:skewX(var(--slant))}
header .s{font:500 15px/1 var(--b);color:var(--ink-2)}
.band{display:grid;grid-template-columns:400px minmax(0,1fr);gap:48px;padding:24px var(--gut) 40px;align-items:start}
.lk h1{font-size:24px;margin:8px 0 4px}.lk .big{display:flex;align-items:flex-end;gap:14px}.lk .big b{font:900 150px/.86 var(--u);font-style:italic;letter-spacing:-.05em}
.lk .big span{font:900 26px/1.05 var(--u);font-style:italic;color:var(--plot);padding-bottom:14px}.lk .big small{display:block;font:600 13px/1.3 var(--b);color:var(--ink-2);margin-top:6px;font-style:normal;letter-spacing:0}
.lk p{margin-top:16px;font-size:16px;color:var(--ink-2);max-width:380px}.lk p.r{margin-top:6px;color:var(--ink);font-weight:600;font-size:15px}
.acts{display:flex;gap:12px;margin-top:20px}.acts .btn{height:48px;white-space:nowrap;padding:0 22px}.acts .btn2{height:44px}
[data-theme="dusk"] .lk .big b{color:#D6D1CA}[data-theme="dusk"] .acts .btn{background:linear-gradient(180deg,#63C0F8,#3FA2E2);color:#08131E}[data-theme="dusk"] .btn2{border-color:rgba(228,224,236,.42)}
.stage{position:relative}.stage>*{position:absolute}
.floor{left:-30px;right:-30px;height:100px;background:linear-gradient(90deg,transparent,var(--fl) 10%,var(--fl) 90%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,var(--fs),transparent);pointer-events:none}
.pool{border-radius:50%;background:radial-gradient(closest-side,var(--contact),transparent 60%) center/46% 50% no-repeat,radial-gradient(closest-side,rgba(var(--cp),.62),rgba(var(--cp),.3) 55%,transparent)}
[data-theme="dusk"] .pool{background:radial-gradient(closest-side,rgba(var(--cp),.9),rgba(var(--cp),.32) 45%,transparent)}
.art{object-fit:contain;filter:drop-shadow(4px 7px 7px rgba(30,20,50,.16))}[data-theme="dusk"] .art{filter:drop-shadow(0 0 .6px rgba(255,255,255,.55)) drop-shadow(0 -1px 5px rgba(var(--cp),.3))}
.tx{text-align:center;font:700 15px/1.25 var(--b)}.tx small{display:block;font:500 13px/1.3 var(--b);color:var(--ink-2)}.tx.s{font-size:13px;font-stretch:88%}.tx.on{font-weight:800}
.tx .mg{color:var(--plot-text);font-style:italic;font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase;display:block}
.gl{display:flex;align-items:center;gap:8px;font:900 15px/1 var(--u);font-style:italic;color:var(--ink-2)}.gl i{width:14px;height:7px;transform:skewX(var(--slant));background:var(--ink-3)}.gl.ld i{background:var(--plot)}
.ctl{display:flex;gap:14px;justify-content:center;font:600 13px/1 var(--b);color:var(--ink-2)}.ctl span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.ctl svg{width:13px;height:13px}
.role{display:inline-flex;align-items:center;height:26px;padding:0 12px;background:var(--plot);color:#fff;font:900 13px/1 var(--u);font-style:italic;clip-path:polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%)}[data-theme="dusk"] .role{color:#08131E}
.info h2{font-size:26px;margin:10px 0 6px;line-height:1.1}.info h2 em{font-style:inherit;color:var(--plot)}.info .sub{font-size:15px;color:var(--ink-2)}.info .row{display:flex;align-items:center;gap:16px;margin-top:14px;flex-wrap:wrap}
.plate{display:inline-flex;align-items:center;height:34px;padding:0 14px;background:var(--plate);color:var(--on-plate);font:900 13px/1 var(--u);font-style:italic;clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%)}
[data-theme="dusk"] .plate{background:linear-gradient(180deg,#3E3D56,#2C2B3D)}
.info .btn2{height:40px;padding:0 16px}.hint{font:500 13px/1.3 var(--b);color:var(--ink-3)}
/* B: podium */
.slab{transform:skewX(-16deg);background:linear-gradient(180deg,var(--slab2) 0 34%,var(--slab) 34%);box-shadow:0 14px 18px -10px rgba(20,12,40,.5)}
/* C: light from above */
.beam{clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(var(--cp),0),rgba(var(--cp),.30) 70%,rgba(var(--cp),.42));pointer-events:none}
[data-theme="dusk"] .beam{background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.13) 60%,rgba(var(--cp),.34))}
.spot{border-radius:50%;background:radial-gradient(closest-side,rgba(var(--cp),.85),rgba(var(--cp),.45) 55%,transparent)}
@media (max-width:699px){:root{--gut:16px}header{height:60px}nav{display:none}header .s{margin-left:auto}.band{display:block;padding:8px var(--gut) 28px}.lk .big b{font-size:112px}.lk .big span{font-size:21px}.lk p{font-size:15px}.stage{margin-top:22px}.acts{display:none}.info h2{font-size:21px}}
</style></head><body><div class="page"><header><div class="logo">${sb.NP_SVG[theme === 'dusk' ? 'hdrD' : 'hdrL']}</div><nav><a>Home</a><a>Build</a><a class="on">My Team</a><a>Battle</a><a>Meta</a></nav><span class="s">Search</span></header>
<div class="band"><div class="lk"><div class="eyebrow">My Team · ${DATA.style}</div><h1 class="u">${DATA.name}</h1><div class="big"><b>${DATA.score}</b><span>${DATA.band}<small>Strength Score</small></span></div><p>${DATA.win}</p><p class="r">${DATA.rank}</p>
<div class="acts"><div class="btn">Update Saved Team</div><div class="btn2"><span>Share</span></div><div class="btn2"><span>More</span></div></div></div><div class="stage" id="stage"></div></div></div>
<script>const D=${JSON.stringify(DATA)},SCENE=${JSON.stringify(scene)};
function hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;}return[h,s,l];}
function norm(c){let[h,s]=hsl(...c);s=Math.max(s,.72);const l=.56,k=(1-Math.abs(2*l-1))*s,x=k*(1-Math.abs((h/60)%2-1)),m=l-k/2;return[[k,x,0],[x,k,0],[0,k,x],[0,x,k],[x,0,k],[k,0,x]][Math.floor(h/60)%6].map(v=>Math.round((v+m)*255)).join(',');}
async function meta(src){const im=new Image();im.src=src;await im.decode();const S=64,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.drawImage(im,0,0,S,S);const d=x.getImageData(0,0,S,S).data,B=Array.from({length:18},()=>[0,0,0,0]);let y1=0;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<60)continue;y1=Math.max(y1,Math.floor(i/4/S));if(d[i+3]<200)continue;const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(s<.28||l<.2||l>.86)continue;const b=B[Math.floor(h/20)%18],w=s*s;b[0]+=d[i]*w;b[1]+=d[i+1]*w;b[2]+=d[i+2]*w;b[3]+=w;}
  const o=B.map(b=>({w:b[3],c:b[3]?b.slice(0,3).map(v=>Math.round(v/b[3])):[150,150,170]})).sort((a,b)=>b.w-a.w);return{cp:norm(o[0].c),bot:(y1+1)/S};}
const LOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>',X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const nm=m=>m.d.startsWith('Mega ')?'<span class="mg">Mega</span>'+m.d.slice(5):m.d;
(async()=>{const st=document.getElementById('stage'),W=st.clientWidth,PH=W<500,M={};await Promise.all(D.team.map(async m=>{M[m.n]=await meta(m.img);}));
  // one Pokemon standing with its feet at (cx, floor); z is the art box size; lift raises it off the floor
  const mon=(m,z,cx,fl,o={})=>'<i class="pool" style="--cp:'+M[m.n].cp+';left:'+(cx-z*.55*(o.pw||1))+'px;top:'+(fl-z*.1)+'px;width:'+z*1.1*(o.pw||1)+'px;height:'+z*.2+'px;'+(o.pool||'')+'"></i><img class="art" src="'+m.img+'" style="--cp:'+M[m.n].cp+';left:'+(cx-z/2)+'px;top:'+(fl-(o.lift||0)-M[m.n].bot*z)+'px;width:'+z+'px;height:'+z+'px">';
  const lab=(m,cx,top,w,cls,extra)=>'<div class="tx '+(cls||'')+'" style="left:'+(cx-w/2)+'px;top:'+top+'px;width:'+w+'px">'+nm(m)+(extra||'')+'</div>';
  const ctl=(cx,top)=>'<div class="ctl" style="left:'+(cx-80)+'px;top:'+top+'px;width:160px"><span>'+LOCK+'Lock</span><span>'+X+'Remove</span></div>';
  const S=D.team[0],O=D.team.slice(1);let h='',H=0;
  if(SCENE==='stage'){ // A: the selected one is taken out of the row and stands large; the other five wait small on the same floor
    if(!PH){const fl=300;h='<i class="floor" style="top:'+fl+'px"></i>'+mon(S,270,150,fl)+
      '<div class="info" style="left:318px;top:6px;width:'+(W-318)+'px"><span class="role">'+S.role+'</span><h2 class="u"><em>Mega</em> Charizard Y</h2><div class="sub">'+S.item+' · '+D.sel.ability+'</div><div class="row"><span class="plate">'+D.sel.rating+' · '+D.sel.tier+'</span><div class="btn2"><span>Edit Set</span></div><div class="ctl" style="position:static"><span>'+LOCK+'Lock</span><span>'+X+'Remove</span></div></div></div>'+
      O.map((m,i)=>{const cx=372+i*((W-372-46)/4);return mon(m,92,cx,fl)+lab(m,cx,fl+16,104,'s','<small>'+m.role+'</small>');}).join('')+'<div class="hint" style="left:318px;top:178px">Tap any of the five to bring it forward.</div>';H=fl+70;}
    else{const fl=214,f2=372;h='<i class="floor" style="top:'+fl+'px"></i>'+mon(S,196,96,fl)+
      '<div class="info" style="left:200px;top:6px;width:'+(W-200)+'px"><span class="role">'+S.role+'</span><h2 class="u"><em>Mega</em> Charizard Y</h2><div class="sub">'+S.item+'<br>'+D.sel.ability+'</div><div class="row" style="margin-top:10px"><span class="plate">'+D.sel.rating+' · '+D.sel.tier+'</span></div></div>'+
      '<div class="ctl" style="left:0;top:'+(fl+22)+'px;width:'+W+'px;justify-content:flex-start;gap:18px"><span style="color:var(--ink);border-bottom:1.5px solid currentColor;padding-bottom:2px">Edit Set</span><span>'+LOCK+'Lock</span><span>'+X+'Remove</span></div>'+
      '<i class="floor" style="top:'+f2+'px"></i>'+O.map((m,i)=>{const cx=34+i*((W-68)/4);return mon(m,66,cx,f2)+lab(m,cx,f2+12,74,'s','<small>'+m.role+'</small>');}).join('');H=f2+58;}}
  else{ // B and C keep the row of six on one floor
    const z=PH?96:112,cols=PH?3:6,cw=W/cols,rowH=PH?232:0,fl0=PH?150:226,pos=i=>PH?[cw*(Math.floor(i/2)+.5),fl0+(i%2)*rowH]:[cw*(i+.5),fl0];
    const groups=['Lead','Back','Bench'].map((g,k)=>'<div class="gl'+(k?'':' ld')+'" style="left:'+(PH?cw*k+8:cw*k*2+10)+'px;top:0"><i></i>'+g+'</div>').join('');
    h=groups+(PH?[0,1].map(r=>'<i class="floor" style="top:'+(fl0+r*rowH)+'px"></i>').join(''):'<i class="floor" style="top:'+fl0+'px"></i>');
    D.team.forEach((m,i)=>{const[cx,fl]=pos(i),on=i===0,extra='<small>'+m.item+'</small>';
      if(on&&SCENE==='podium'){const sw=z*1.24,sh=26;h+='<i class="slab" style="left:'+(cx-sw/2)+'px;top:'+(fl-sh+8)+'px;width:'+sw+'px;height:'+sh+'px"></i>'+mon(m,z*1.12,cx,fl,{lift:sh-10,pool:'display:none'})+lab(m,cx,fl+22,cw+10,'on',extra)+ctl(cx,fl+(PH?78:82));}
      else if(on&&SCENE==='beam'){const bw=z*1.5,bt=PH?fl-z-34:-8;h+='<i class="beam" style="--cp:'+M[m.n].cp+';left:'+(cx-bw/2)+'px;top:'+bt+'px;width:'+bw+'px;height:'+(fl-bt+4)+'px"></i><i class="spot" style="--cp:'+M[m.n].cp+';left:'+(cx-bw/2)+'px;top:'+(fl-15)+'px;width:'+bw+'px;height:34px"></i>'+mon(m,z*1.12,cx,fl,{pool:'display:none'})+lab(m,cx,fl+22,cw+10,'on',extra)+ctl(cx,fl+(PH?78:82));}
      else h+=mon(m,z,cx,fl)+lab(m,cx,fl+16,cw+6,'',extra);});
    H=PH?fl0+rowH+70:fl0+112;}
  st.style.height=H+'px';st.innerHTML=h;document.body.dataset.ready=1;})();
</script></body></html>`;
const SC = {stage: ['A. Centre stage', 'The selected Pokémon leaves the row and stands large, with its details and controls beside it. The other five wait on the same floor; tap one to bring it forward.'],
  podium: ['B. Podium', 'The row stays. The selected Pokémon steps up onto a slanted slab, the same shape as the site\u2019s plates, and its controls sit under its name.'],
  beam: ['C. Light from above', 'The row stays. A cone of light in the Pokémon\u2019s own colour falls on the selected one and pools on the floor around it.']};
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch(), uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64'), jobs = [];
  for (const k of Object.keys(SC)) for (const [vw, theme] of [[1440, 'light'], [1440, 'dusk'], [390, 'light'], [390, 'dusk']]) jobs.push(async () => { const f = path.join(OUT, `selre-${k}-${vw}-${theme}.html`); fs.writeFileSync(f, page(theme, k));
    const pg = await (await b.newContext({viewport: {width: vw, height: 900}, deviceScaleFactor: 2})).newPage(); pg.on('pageerror', e => console.log('ERR', k, e.message.slice(0, 120)));
    await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}).catch(() => console.log('NOT READY', k)); await pg.waitForTimeout(400);
    const h = await pg.evaluate(() => Math.ceil(document.querySelector('.band').getBoundingClientRect().bottom + 8)); await pg.screenshot({path: path.join(OUT, `selre-${k}-${vw}-${theme}.png`), clip: {x: 0, y: 0, width: vw, height: h}, fullPage: true}); await pg.close(); });
  for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(f => f()));
  for (const k of Object.keys(SC)) { const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap">
<style>*{box-sizing:border-box;margin:0}body{width:2000px;background:#E9E7E2;font:500 16px/1.4 "Instrument Sans",system-ui,sans-serif;color:#17161A;padding:32px 36px 36px}h1{font-weight:700;font-size:28px}p{color:#48454F;margin-top:6px;max-width:1150px}
.g{display:grid;gap:20px;margin-top:20px;grid-template-columns:1200px 344px 344px;align-items:start}.c b{display:block;font-weight:600;font-size:15px;margin-bottom:8px;color:#48454F}img{display:block;width:100%;border-radius:10px;box-shadow:0 0 0 1px rgba(23,22,26,.12)}</style>
<h1>${SC[k][0]}</h1><p>${SC[k][1]}</p><div class="g"><div><div class="c"><b>Desktop, day</b><img src="${uri(`selre-${k}-1440-light.png`)}"></div><div class="c" style="margin-top:20px"><b>Desktop, night</b><img src="${uri(`selre-${k}-1440-dusk.png`)}"></div></div>
<div class="c"><b>Phone, day</b><img src="${uri(`selre-${k}-390-light.png`)}"></div><div class="c"><b>Phone, night</b><img src="${uri(`selre-${k}-390-dusk.png`)}"></div></div>`;
    const f = path.join(OUT, `nastyplot-selected-${k}.html`); fs.writeFileSync(f, html); const pg = await (await b.newContext({viewport: {width: 2000, height: 900}, deviceScaleFactor: 1})).newPage(); await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
    await pg.screenshot({path: path.join(OUT, `nastyplot-selected-${k}.png`), fullPage: true}); await pg.close(); }
  await b.close();
})();
