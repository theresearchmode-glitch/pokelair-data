// Round 2: characters that take over from the NastyPlot devil. Drawn upright, then tilted like the kit (--tilt -7deg).
const T=cx=>`rotate(-7 60 60)`;
// 1 · CHIP: a calculator gremlin. Blue body, ink screen for a face with sly white eyes and pink pupils, a smirk, pink horns, a keypad
//      whose "=" key is pink. The devil's horns and grin, rebuilt as the thing the site is.
function chip(c){ const key=(x,y,col)=>`<path d="${rr(x,y,17,11,3)}" fill="${c(col)}"/>`;
  return `<g transform="${T()}"><path d="M28 24L35 0L50 18Z" fill="${c('pink')}"/><path d="M70 18L85 0L92 24Z" fill="${c('pink')}"/>
  <path d="${rr(16,12,88,104,24)}" fill="${c('blue')}"/><path d="${rr(26,23,68,46,11)}" fill="${c('ink')}"/>
  <path d="M32 36L57 43L57 53L33 49Z" fill="${c('white')}"/><path d="M88 36L63 43L63 53L87 49Z" fill="${c('white')}"/>
  <path d="M47 42L57 44.5L57 53L47 51.5Z" fill="${c('pink')}"/><path d="M73 42L63 44.5L63 53L73 51.5Z" fill="${c('pink')}"/>
  <path d="M46 60Q60 66 76 56" fill="none" stroke="${c('white')}" stroke-width="${c('w4')}" stroke-linecap="round"/>
  ${key(28,78,'ink')}${key(51.5,78,'ink')}${key(75,78,'ink')}${key(28,96,'ink')}${key(51.5,96,'ink')}${key(75,96,'pink')}</g>`; }
// 2 · CHOMP: the C becomes a head. Its open jaw is the C's mouth, lined with white teeth, biting a pink HP chunk out of the air;
//      a sly half-lidded eye and a pink crest. It is the first C of the name.
function chomp(c){ const jaw='M62 62L113 30Q115 63 113 96Z';
  return `<g transform="${T()}"><path d="M30 18L40 -4L54 14Z" fill="${c('pink')}"/><path d="M52 12L66 -8L76 12Z" fill="${c('pink')}"/>
  <path d="${rr(6,8,108,106,44)}" fill="${c('blue')}"/><path d="${jaw}" fill="${c('ink')}"/>
  <path d="M72 56L80 64L84 51ZM87 47L94 56L98 43ZM101 38L107 47L110 36Z" fill="${c('white')}"/><path d="M72 68L84 74L79 62ZM87 77L99 83L94 70ZM101 86L110 91L107 80Z" fill="${c('white')}"/>
  <path d="M36 34Q52 22 68 34Q52 48 36 34Z" fill="${c('white')}"/><circle cx="56" cy="36" r="6.5" fill="${c('pink')}"/><circle cx="57.5" cy="34.5" r="2.2" fill="${c('ink')}"/>
  <path d="M33 33Q52 20 71 30" fill="none" stroke="${c('ink')}" stroke-width="${c('w5')}" stroke-linecap="round"/>
  <g transform="translate(116 58) rotate(-18)"><path d="${rr(-2,-9,22,18,3)}" fill="${c('pink')}"/></g></g>`; }
// 3 · SCOUT: a fox-eared rival in a pink scouter visor. Sharp white eye slits behind the visor, a crosshair on one, a smirk.
function scout(c){ return `<g transform="${T()}"><path d="M16 40L22 0L50 22Z" fill="${c('blue')}"/><path d="M104 40L98 0L70 22Z" fill="${c('blue')}"/>
  <path d="M22 26L25 9L38 20Z" fill="${c('pink')}"/><path d="M98 26L95 9L82 20Z" fill="${c('pink')}"/>
  <path d="M60 116C28 116 12 96 12 70C12 40 32 18 60 18C88 18 108 40 108 70C108 96 92 116 60 116Z" fill="${c('blue')}"/>
  <path d="M2 50L118 40L118 68L2 78Z" fill="${c('pink')}"/>
  <path d="M24 60L50 54L50 62L26 66Z" fill="${c('white')}"/><path d="M96 51L70 54L70 62L94 59Z" fill="${c('white')}"/>
  <circle cx="83" cy="57" r="9" fill="none" stroke="${c('ink')}" stroke-width="${c('w3')}"/><path d="M83 45V69M71 57H95" stroke="${c('ink')}" stroke-width="${c('w2')}"/>
  <path d="M48 94Q62 100 76 90" fill="none" stroke="${c('ink')}" stroke-width="${c('w5')}" stroke-linecap="round"/></g>`; }
const CH={A:chip,B:chomp,C:scout};
Object.assign(BASE,{ink:K.ink,white:K.white,w2:2.5,w3:3,w4:4,w5:5});
// a role that is a stroke width stays a number in the sticker's white and ink layers
const _roleC=roleC; roleC=fixed=>r=> /^w\d$/.test(r) ? BASE[r] : _roleC(fixed)(r);
function sticker2(draw,{edge=20,line=8,dx=4,dy=5}={}){ const L=(col,sw,t)=>{ const inner=draw(r=> /^w\d$/.test(r) ? BASE[r]+sw : col).replace(/stroke-width="([\d.]+)"/g,(m,v)=>`stroke-width="${(+v+sw).toFixed(1)}"`);
    return `<g transform="translate(${t})" fill="${col}" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${inner.replace(/stroke="[^"]*"/g,`stroke="${col}"`).replace(/fill="(?!none)[^"]*"/g,`fill="${col}"`)}</g>`; };
  return (edge?L(K.white,edge,`${dx} ${dy}`)+L(K.white,edge,'0 0'):'')+L(K.ink,line,`${dx} ${dy}`)+L(K.ink,line,'0 0')+draw(r=>BASE[r]); }
// lockups: CHOMP is the first C of the name; CHIP and SCOUT stand before the name
function word2(k){ const s=0.1, tr=-14, cap=75; let x=0; const parts=[]; const put=(ch,col)=>{ parts.push([ch,x,col]); x+=GW(ch)*s+tr; };
  let m;
  if(k==='B'){ const sc=cap*1.18/106; m={x:-2,y:cap-114*sc+6,sc}; x=118*sc; for(const ch of 'ALC') put(ch,'blue'); x+=6; put("'",'pink'); x+=4; put('D','blue'); }
  else { const sc=1.02; m={x:-6,y:-40,sc}; x=126*sc; for(const ch of 'CALC') put(ch,'blue'); x+=6; put("'",'pink'); x+=4; put('D','blue'); }
  return {w:x+16,h:100,draw:c=>`<g transform="${sk(cap)}">`+parts.map(([ch,gx,col])=>`<g fill="${c(col)}">${G(ch,gx,cap,s)}</g>`).join('')+`</g><g transform="translate(${m.x} ${m.y}) scale(${m.sc})">${CH[k](c)}</g>`}; }
const markSVG2=(k,px)=>svg(sticker2(CH[k]),'-26 -30 176 176',px,px);
const tileSVG2=(k,px)=>svg(`<rect width="120" height="120" rx="27" fill="${K.ink}"/><g transform="translate(20 22) scale(.66)">${sticker2(CH[k],{edge:14,line:7,dx:4,dy:5})}</g>`,'0 0 120 120',px,px);
const favSVG2=(k,px)=>svg(sticker2(CH[k],{edge:px<=16?26:20,line:px<=16?11:9,dx:0,dy:0}),'-24 -26 170 170',px,px);
const lockSVG2=(k,h)=>{ const W=word2(k); return svg(sticker2(W.draw,{edge:16,line:7,dx:4,dy:5}),`-20 -60 ${W.w+40} ${W.h+82}`,h); };
