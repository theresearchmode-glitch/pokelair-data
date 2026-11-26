(() => {
const css = `
.pty{position:relative;padding:36px max(24px,calc((100% - 1240px)/2)) 32px;background:#0078BF;background-image:repeating-linear-gradient(-60deg,rgba(255,255,255,.06) 0 14px,transparent 14px 40px);color:#fff;overflow:hidden}
.pty-top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end;margin-bottom:22px}
.pty-k{display:inline-block;margin:0 0 10px;padding:5px 14px;background:#17161A;font:800 15px/1.2 Unbounded,sans-serif;font-style:italic;letter-spacing:.06em;transform:skewX(-10deg)}
.pty-name{margin:0;font:900 84px/.92 Unbounded,sans-serif;font-style:italic;letter-spacing:-.03em;color:#fff;-webkit-text-stroke:.08em #17161A;paint-order:stroke fill;filter:drop-shadow(.05em .05em 0 #17161A)}
.pty-name em{font-style:inherit;color:#FFD84D}
.pty-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.pty-chips span{padding:4px 12px;background:rgba(23,22,26,.55);border:2px solid rgba(255,255,255,.5);font:800 13px/1.2 'Instrument Sans',sans-serif;transform:skewX(-10deg)}
.pty-chips span b{color:#FFD84D}
.pty-score{display:grid;grid-template-columns:auto auto;align-items:center;column-gap:16px;padding:14px 26px 14px 20px;background:#17161A;transform:skewX(-10deg);box-shadow:8px 8px 0 #E8364F}
.pty-score>*{transform:skewX(10deg)}
.pty-score .n{grid-row:1/3;font:900 96px/.85 Unbounded,sans-serif;font-style:italic;color:#fff}
.pty-score .b{font:900 26px/1 Unbounded,sans-serif;font-style:italic;color:#62BEF7}
.pty-score small{font:600 13px/1.3 'Instrument Sans',sans-serif;color:#C9C4D6;font-style:normal}
.pty-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,8fr);gap:18px;align-items:stretch}
.pty-lead{position:relative;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:0 12px;padding:18px 20px 18px 22px;background:#fff;color:#17161A;border:4px solid #17161A;box-shadow:10px 10px 0 #E8364F;transform:skewX(-4deg)}
.pty-lead>*{transform:skewX(4deg)}
.pty-lead .tag{grid-column:1/-1;justify-self:start;margin-bottom:6px;padding:4px 12px;background:#E8364F;color:#fff;font:900 14px/1.2 Unbounded,sans-serif;font-style:italic;letter-spacing:.05em}
.pty-lead .art{grid-column:2;grid-row:2/6;align-self:center;justify-self:center;width:160%;height:360px;margin-left:-30%;object-fit:contain;object-position:50% 100%;margin-right:-14%;filter:drop-shadow(0 14px 10px rgba(0,0,0,.3))}
.pty-lead .who{grid-column:1}
.pty-lead i.fm{display:block;font:800 14px/1 Unbounded,sans-serif;color:#0078BF;font-style:normal}
.pty-lead b.nm{display:block;font:900 38px/1 Unbounded,sans-serif;font-style:italic}
.pty-types{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.pty-types span{padding:3px 10px;background:var(--c);color:#fff;font:800 12px/1.3 'Instrument Sans',sans-serif;text-transform:uppercase;letter-spacing:.05em;transform:skewX(-10deg)}
.pty-kv{grid-column:1;display:grid;grid-template-columns:auto 1fr;gap:2px 10px;margin:4px 0 10px;font:600 13px/1.4 'Instrument Sans',sans-serif}
.pty-kv dt{color:#5A5663}.pty-kv dd{margin:0;font-weight:800}
.pty-mvs{grid-column:1;display:grid;gap:4px}
.pty-mv{display:flex;align-items:center;justify-content:space-between;gap:8px;white-space:nowrap;padding:4px 8px;background:color-mix(in srgb,var(--mc) 18%,#fff);border-left:6px solid var(--mc);font:800 13px/1.2 'Instrument Sans',sans-serif;transform:skewX(-8deg)}
.pty-mv>*{transform:skewX(8deg)}.pty-mv small{font-weight:600;color:#5A5663}
.pty-lead .pty-bar{grid-column:1/-1;margin-top:14px}
.pty-bar{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;font:800 12px/1 'Instrument Sans',sans-serif;letter-spacing:.06em}
.pty-bar .pty-tr{display:block;height:16px;background:#E8E4DC;transform:skewX(-14deg);overflow:hidden}
.pty-bar .pty-fill{display:block;height:100%;width:var(--w);background:var(--bc)}
.pty-bar b{font:900 32px/1 Unbounded,sans-serif;font-style:italic;color:#0078BF}
.pty-bar em{font:800 12px/1 Unbounded,sans-serif;font-style:italic;color:#5A5663}
.pty-list{display:grid;gap:10px}
.pty-row{position:relative;display:grid;grid-template-columns:92px minmax(0,1fr) minmax(0,1.15fr) 190px;align-items:center;gap:14px;padding:6px 18px 6px 8px;background:#17161A;border-left:10px solid var(--c);transform:skewX(-8deg);box-shadow:5px 5px 0 rgba(0,0,0,.35)}
.pty-row>*{transform:skewX(8deg)}
.pty-row img{width:92px;height:78px;margin:-14px 0 -4px;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 6px 5px rgba(0,0,0,.5))}
.pty-row .nm i{display:block;font:800 11px/1 Unbounded,sans-serif;color:#62BEF7;font-style:normal}.pty-row .nm b{display:block;font:900 22px/1.05 Unbounded,sans-serif;font-style:italic;color:#fff}
.pty-row .nm small{display:block;margin-top:4px;font:600 12px/1.3 'Instrument Sans',sans-serif;color:#C9C4D6}
.pty-row .pty-types{margin:4px 0 0}.pty-row .pty-types span{font-size:10px;padding:2px 7px}
.pty-row .mvs{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.pty-row .mvs span{padding:3px 7px;background:color-mix(in srgb,var(--mc) 70%,#000);border-left:4px solid var(--mc);font:700 12px/1.25 'Instrument Sans',sans-serif;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pty-row .pty-bar{grid-template-columns:minmax(0,1fr) auto;row-gap:4px;color:#C9C4D6}.pty-row .pty-bar>span:first-child{display:none}.pty-row .pty-bar .pty-tr{grid-column:1/-1;grid-row:2}.pty-row .pty-bar b{grid-column:2;grid-row:1}.pty-row .pty-bar em{grid-column:1;grid-row:1;align-self:end}.pty-row .pty-bar .pty-tr{background:#34323F;height:12px}.pty-row .pty-bar b{color:#fff;font-size:26px;min-width:40px;text-align:right}.pty-row .pty-bar em{color:#C9C4D6}
.pty-acts{display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px;margin-top:22px}
.pty-acts a,.pty-acts button{padding:9px 16px;background:#fff;color:#17161A;border:0;font:800 14px/1.2 'Instrument Sans',sans-serif;transform:skewX(-10deg);box-shadow:4px 4px 0 #17161A;cursor:pointer}
.pty-acts .new{margin-left:auto;display:flex;align-items:center;gap:10px;font:900 24px/1 Unbounded,sans-serif;font-style:italic}
.pty-acts .new button{padding:8px 16px;background:#17161A;color:#fff;font:900 20px/1.1 Unbounded,sans-serif;font-style:italic;box-shadow:4px 4px 0 #E8364F}
.tm-hero{display:none !important}
.tmk-work .k-plan>.k-step:first-child{display:none}
.tmk-work .k-plan>.k-step .k-n{counter-increment:none}
@media (min-width:1100px){.tmk-work .k-plan{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);column-gap:48px;align-items:start}
.tmk-work .k-plan>.k-step:nth-child(2){grid-column:1;grid-row:1}.tmk-work .k-plan>.k-step:nth-child(3){grid-column:2;grid-row:1/3}.tmk-work .k-plan>.k-step:nth-child(4){grid-column:1;grid-row:2}
.tmk-work .tm-sgs,.tmk-work .tm-cks,.tmk-work .tm-yg,.tmk-work .tm-mus{max-width:none;width:auto}
.tmk-work .k-plan>.k-step:nth-child(3) .mu-out{grid-template-columns:minmax(0,1fr)}
.tmk-work .k-plan>.k-step:nth-child(3) .mu-row{grid-template-columns:56px minmax(0,1fr) auto}}
@media (max-width:1279.98px){.pty-row{grid-template-columns:80px minmax(0,1fr) 150px}.pty-row .mvs{display:none}}
@media (max-width:899.98px){.pty-grid{grid-template-columns:1fr}.pty-top{grid-template-columns:1fr}.pty-score{justify-self:start}}
@media (max-width:699.98px){.pty{padding:20px 16px 24px}.pty-name{font-size:40px}.pty-chips{margin-top:10px;gap:6px}.pty-chips span{font-size:12px;padding:3px 9px}
.pty-score{padding:10px 18px 10px 14px;margin-top:4px}.pty-score .n{font-size:56px}.pty-score .b{font-size:20px}.pty-score small{font-size:12px}
.pty-lead{grid-template-columns:minmax(0,1fr) 130px;padding:12px 14px;box-shadow:6px 6px 0 #E8364F}.pty-lead .tag{font-size:12px}
.pty-lead .art{grid-column:2;grid-row:2/4;width:150px;height:130px;margin:0;align-self:start}.pty-lead b.nm{font-size:24px}
.pty-kv{grid-column:1/-1;margin:2px 0 8px}.pty-mvs{grid-column:1/-1;grid-template-columns:1fr}.pty-mv{font-size:13px}.pty-lead .pty-bar{margin-top:10px}.pty-bar b{font-size:26px}
.pty-row{grid-template-columns:56px minmax(0,1fr) auto;gap:10px;padding:4px 12px 4px 6px}.pty-row img{width:56px;height:52px;margin:-8px 0 -2px}
.pty-row .nm b{font-size:16px}.pty-row .nm small{display:none}.pty-row .pty-types{margin-top:2px}
.pty-row .pty-bar{grid-template-columns:auto;gap:2px;justify-items:end}.pty-row .pty-bar .pty-tr{display:none}.pty-row .pty-bar em{display:none}.pty-row .pty-bar b{grid-row:1;font-size:24px}
.pty-acts{gap:8px}.pty-acts a,.pty-acts button{padding:7px 12px;font-size:13px}.pty-acts .new{margin-left:0;font-size:18px;flex-wrap:wrap}.pty-acts .new button{font-size:15px}}
`;
const tierCol=n=>n>=90?'#62BEF7':n>=80?'#A78BFA':n>=70?'#B9B5C2':n>=60?'#F5B14C':'#E07A5F';
const apply=()=>{if(document.querySelector('.pty'))return;const main=document.querySelector('#main');const hero=document.querySelector('.tm-hero');if(!hero)return;
let st=document.getElementById('ptycss');if(!st){st=document.createElement('style');st.id='ptycss';st.textContent=css;document.head.append(st);}
const D=window.__ev('V2.teamData()');const cards=[...document.querySelectorAll('.mtf-party .k-card')];
const name=hero.querySelector('.tm-name');const nm=name?name.cloneNode(true):null;if(nm)nm.querySelectorAll('.mtf-smp').forEach(x=>x.remove());
const score=(hero.querySelector('.mtf-score .n')||{}).textContent||'';const band=(hero.querySelector('.mtf-sw .band')||{}).textContent||'';
const mvInfo=n=>{try{const h=window.__ev('V2.kMove('+JSON.stringify(n)+')');const m=h.match(/--ty-([A-Za-z]+)/);const s=h.match(/<small>([^<]*)<\/small>/);return {t:m?m[1]:'Normal',s:s?s[1].replace(/&nbsp;/g,' '):''}}catch(e){return {t:'Normal',s:''}}};
const info=(m,i)=>{const c=cards[i];return {img:c?c.querySelector('img').getAttribute('src'):'',sc:c?+c.querySelector('.k-score').textContent:0,tier:c?(c.querySelector('.k-tier')||{}).textContent:'',fm:c&&c.querySelector('.k-form')?c.querySelector('.k-form').textContent:'',nm:c?c.querySelector('.k-name').textContent:m.p.n,t:m.p.t||[],it:m.heldItem||m.item||'',ab:m.ability||'',mv:(m.moves||[]).filter(Boolean).map(x=>x.name||x)}};
const types=t=>`<div class="pty-types">${t.map(x=>`<span style="--c:var(--ty-${x})">${x}</span>`).join('')}</div>`;
const bar=x=>`<div class="pty-bar"><span>RATING</span><span class="pty-tr"><span class="pty-fill" style="--w:${x.sc}%;--bc:${tierCol(x.sc)}"></span></span><b>${x.sc}</b><em>${x.tier}</em></div>`;
const L=info(D.ms[0],0);
const lead=`<div class="pty-lead"><span class="tag">LEADING THE PARTY</span><img class="art" src="${L.img}" alt=""><div class="who"><i class="fm">${L.fm}</i><b class="nm">${L.nm}</b>${types(L.t)}</div><dl class="pty-kv"><dt>Item</dt><dd>${L.it}</dd><dt>Ability</dt><dd>${L.ab}</dd></dl><div class="pty-mvs">${L.mv.map(n=>{const q=mvInfo(n);return `<span class="pty-mv" style="--mc:var(--ty-${q.t})"><span>${n}</span> <small>${q.s}</small></span>`}).join('')}</div>${bar(L)}</div>`;
const rows=D.ms.slice(1).map((m,k)=>{const x=info(m,k+1);return `<div class="pty-row" style="--c:var(--ty-${x.t[0]})"><img src="${x.img}" alt=""><div class="nm"><i>${x.fm}</i><b>${x.nm}</b>${types(x.t)}<small>${x.it} · ${x.ab}</small></div><div class="mvs">${x.mv.map(n=>`<span style="--mc:var(--ty-${mvInfo(n).t})">${n}</span>`).join('')}</div>${bar(x)}</div>`}).join('');
const sec=document.createElement('section');sec.className='pty';
sec.innerHTML=`<div class="pty-top"><div><p class="pty-k">MY TEAM · THE PARTY</p><h1 class="pty-name">${nm?nm.innerHTML:''}</h1><div class="pty-chips"><span><b>6</b> of 6</span><span>Sun team</span><span>Legal for <b>Reg M-C</b></span><span>Saved ✓</span></div></div><div class="pty-score"><span class="n">${score}</span><span class="b">${band}</span><small>Strength Score · top 1% of tournament teams</small></div></div><div class="pty-grid">${lead}<div class="pty-list">${rows}</div></div><div class="pty-acts"><button>Why This Score?</button><button>Team Sheet</button><button>Share as Image</button><button>Saved Teams</button><button>More ···</button><span class="new">New crew? <button>BUILD ME A TEAM</button><button>IMPORT</button></span></div>`;
main.prepend(sec);};
apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
})();
