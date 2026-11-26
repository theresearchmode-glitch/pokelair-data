// Calc'd logo directions. Real Unbounded weight-900 outlines (glyphs.js), the kit's die-cut sticker (white edge, ink outline, block
// shadow), slanted like the headlines. Every mark lives in a 120x120 box. c(role) gives a role's colour, so one drawing makes all layers.
const K={pink:'#E8364F',blue:'#0078BF',ink:'#17161A',white:'#FFFFFF',dim:'#2C2B36',paper:'#F7F5F0',night:'#14131C'};
const TAN=Math.tan(12*Math.PI/180), sk=cy=>`matrix(1 0 ${-TAN} 1 ${(TAN*cy).toFixed(2)} 0)`;
// the letter's outline scaled into place in its own numbers (a transform would shrink the sticker strokes with the letter)
const scaleD=(d,x,y,s)=>{ let out='', cmd='', k=0; for(const t of d.match(/[A-Za-z]|-?[\d.]+(?:e-?\d+)?/g)){ if(/[A-Za-z]/.test(t)){ cmd=t; k=0; out+=t; continue; }
  const v=+t, isX = cmd==='H' ? true : cmd==='V' ? false : k%2===0; out+=(isX? v*s+x : v*s+y).toFixed(2)+' '; k++; } return out; };
const G=(ch,x,y,s,W=900)=>`<path d="${scaleD(GL[W][ch].d,x,y,s)}"/>`, GW=(ch,W=900)=>GL[W][ch].w;
const rr=(x,y,w,h,r)=>`M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`;
let UID=0;
// ---- A · THE KO CHUNK: the C is an HP ring with a bite out of its side; the bite is the damage, knocked out in pink mid-flight.
// Built as plain paths (no clipping), so the sticker's white edge and ink outline follow every cut cleanly.
function cRing({x0=8,y0=8,x1=112,y1=112,R=36,t=28,m0=46,m1=74}={}){ const xi0=x0+t, xi1=x1-t, yi0=y0+t, yi1=y1-t, r=Math.max(6,R-t);
  const c=`M${x1} ${m0}V${y0+R}Q${x1} ${y0} ${x1-R} ${y0}H${x0+R}Q${x0} ${y0} ${x0} ${y0+R}V${y1-R}Q${x0} ${y1} ${x0+R} ${y1}H${x1-R}Q${x1} ${y1} ${x1} ${y1-R}V${m1}`+
    `H${xi1}V${yi1-r}Q${xi1} ${yi1} ${xi1-r} ${yi1}H${xi0+r}Q${xi0} ${yi1} ${xi0} ${yi1-r}V${yi0+r}Q${xi0} ${yi0} ${xi0+r} ${yi0}H${xi1-r}Q${xi1} ${yi0} ${xi1} ${yi0+r}V${m0}Z`;
  return {c, chunk:`M${xi1+2} ${m0+2}H${x1}V${m1-2}H${xi1+2}Z`, cx:(xi1+x1)/2, cy:(m0+m1)/2}; }
function markA(c){ const g=cRing();
  return `<g transform="${sk(60)}"><path d="${g.c}" fill="${c('blue')}"/><g transform="translate(12 -8) rotate(-14 ${g.cx} ${g.cy})"><path d="${g.chunk}" fill="${c('pink')}"/></g></g>`; }
// ---- B · THE TICK: the apostrophe is a check mark. Calculated = checked. A blue C with a pink tick springing from its mouth.
function markB(c){ const s=0.104, w=GW('C')*s; const tick='M56 64L70 80L104 26';
  return `<g transform="${sk(60)}"><g fill="${c('blue')}">${G('C',60-w/2-8,100,s)}</g>
  <path d="${tick}" fill="none" stroke="${c('pink')}" stroke-width="${c('tickW')}" stroke-linecap="round" stroke-linejoin="round"/></g>`; }
// ---- C · THE READOUT: a damage-calc display. Seven-segment C'd on a slanted ink plate, unlit segments ghosted like a real screen.
const SEG={a:[[1,0],[5,0]],b:[[6,1],[6,5]],c:[[6,7],[6,11]],d:[[1,12],[5,12]],e:[[0,7],[0,11]],f:[[0,1],[0,5]],g:[[1,6],[5,6]]};
function seg7(x,y,u,on,colOn,colOff,t){ let s=''; for(const [k,[[x1,y1],[x2,y2]]] of Object.entries(SEG)){ const lit=on.includes(k);
  s+=`<path d="M${x+x1*u} ${y+y1*u}L${x+x2*u} ${y+y2*u}" stroke="${lit?colOn:colOff}" stroke-width="${t}" stroke-linecap="round"/>`; } return s; }
function readout(c,chars,{u=6,gap=14,t=8.5}={}){ // chars: [[segments, colourRole] | "'"]
  let x=0, s=''; for(const ch of chars){ if(ch==="'"){ s+=`<path d="M${x+3} ${0}L${x+3} ${u*3}" stroke="${c('white2')}" stroke-width="${t}" stroke-linecap="round"/>`; x+=gap-2; continue; }
    s+=seg7(x,0,u,ch[0],c(ch[1]),c('off'),t); x+=6*u+gap; } return {s,w:x-gap}; }
function markC(c){ const R=readout(c,[['adef','pink'],"'",['bcdeg','blue']],{u:5.8,gap:12,t:8}), w=R.w, x0=60-w/2, y0=20;
  return `<g transform="${sk(60)}"><path d="${rr(4,10,112,106,14)}" fill="${c('plate')}"/><g transform="translate(${x0} ${y0})">${R.s}</g>
  <path d="M20 104H100" stroke="${c('off')}" stroke-width="5" stroke-linecap="round"/><path d="M20 104H74" stroke="${c('pink')}" stroke-width="5" stroke-linecap="round"/></g>`; }
const MARK={A:markA,B:markB,C:markC};
const BASE={pink:K.pink,blue:K.blue,plate:K.ink,off:K.dim,white2:K.white,tickW:17};
let roleC=fixed=>r=> fixed ? (r==='tickW' ? null : fixed) : BASE[r];
// Die-cut sticker: white edge + block shadow, ink outline + block shadow, colour on top. Strokes widen every shape, so a stroked
// shape (the tick, the segments) is widened by its own stroke plus the layer's.
function sticker(draw,{edge=20,line=8,dx=4,dy=5}={}){ const L=(col,sw,t)=>{ const inner=draw(r=> r==='tickW' ? BASE.tickW+sw : col).replace(/stroke-width="([\d.]+)"/g,(m,v)=>`stroke-width="${(+v+sw).toFixed(1)}"`);
    return `<g transform="translate(${t})" fill="${col}" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${inner.replace(/stroke="[^"]*"/g,`stroke="${col}"`).replace(/fill="(?!none)[^"]*"/g,`fill="${col}"`)}</g>`; };
  return (edge?L(K.white,edge,`${dx} ${dy}`)+L(K.white,edge,'0 0'):'')+L(K.ink,line,`${dx} ${dy}`)+L(K.ink,line,'0 0')+draw(roleC(null)); }
// Wordmarks. A: the mark is the first C, then ALC'D. B: CALC + the tick as apostrophe + D. C: the whole name on the readout.
const SEGL={C:'adef',A:'abcefg',L:'def',D:'bcdeg'};
function wordmark(k){ const s=0.1, tr=-14, cap=75;
  if(k==='C'){ const chars=[[SEGL.C,'pink'],[SEGL.A,'pink'],[SEGL.L,'pink'],[SEGL.C,'pink'],"'",[SEGL.D,'blue']], R0=readout(roleC(null),chars,{u:7.5,gap:15,t:10});
    const W=R0.w+56, H=140; return {w:W,h:H,draw:c=>{ const R=readout(c,chars,{u:7.5,gap:15,t:10}); return `<g transform="${sk(H/2)}"><path d="${rr(0,0,W,H,18)}" fill="${c('plate')}"/><g transform="translate(28 12)">${R.s}</g>
      <path d="M28 ${H-14}H${W-28}" stroke="${c('off')}" stroke-width="6" stroke-linecap="round"/><path d="M28 ${H-14}H${(W-28)*0.66}" stroke="${c('pink')}" stroke-width="6" stroke-linecap="round"/></g>`; }}; }
  let x=0; const parts=[]; const put=(ch,col)=>{ parts.push([ch,x,col]); x+=GW(ch)*s+tr; };
  let mark=null;
  if(k==='A'){ const sc=cap*1.04/104; mark={x:-8*sc,y:cap-112*sc+1,sc}; x=112*sc+2; for(const ch of 'ALC') put(ch,'blue'); x+=6; put("'",'pink'); x+=4; put('D','blue'); }
  if(k==='B'){ for(const ch of 'CALC') put(ch,'blue'); mark={tick:x+6}; x+=44; put('D','pink'); }
  return {w:x+16,h:100,draw:c=>`<g transform="${sk(cap)}">`+parts.map(([ch,gx,col])=>`<g fill="${c(col)}">${G(ch,gx,cap,s)}</g>`).join('')+
    (mark&&mark.tick!=null?`<path d="M${mark.tick} ${8}L${mark.tick+9} ${20}L${mark.tick+30} ${-12}" fill="none" stroke="${c('pink')}" stroke-width="${c('tickW')==null?BASE.tickW*0.8:c('tickW')*0.8}" stroke-linecap="round" stroke-linejoin="round"/>`:'')+`</g>`+
    (mark&&mark.sc?`<g transform="translate(${mark.x} ${mark.y}) scale(${mark.sc})">${markA(c)}</g>`:'')}; }
const svg=(inner,vb,h,w)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ${h?`height="${h}"`:''} ${w?`width="${w}"`:''}>${inner}</svg>`;
const markSVG=(k,px)=>svg(sticker(MARK[k]),'-24 -24 172 172',px,px);
const tileSVG=(k,px)=>svg(`<rect width="120" height="120" rx="27" fill="${K.ink}"/><g transform="translate(19 17) scale(.68)">${sticker(MARK[k],{edge:14,line:7,dx:4,dy:5})}</g>`,'0 0 120 120',px,px);
const favSVG=(k,px)=>svg(sticker(MARK[k],{edge:px<=16?28:22,line:px<=16?12:9,dx:0,dy:0}),'-24 -22 170 170',px,px);
const lockSVG=(k,h)=>{ const W=wordmark(k); return svg(sticker(W.draw,{edge:16,line:7,dx:4,dy:5}),`-16 -34 ${W.w+36} ${W.h+52}`,h); };
