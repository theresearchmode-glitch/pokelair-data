// Chip, refined. Flags: small (16-60 px: no tail, ghost digits or key symbols), face: 'smug' | 'locked' | 'ko'.
Object.assign(BASE,{deep:'#00507F',ghost:'#26252F',w1:1.8,w6:6});
function chip2(c,{small=false,face='smug'}={}){ const S=[];
  if(!small) S.push(`<path d="M98 106Q126 112 128 86Q129 72 136 62" fill="none" stroke="${c('deep')}" stroke-width="${c('w6')}" stroke-linecap="round"/><path d="M128 62L141 47L144 67Z" fill="${c('pink')}"/>`);
  S.push(`<path d="M31 24Q22 6 36 -4Q35 9 47 18Z" fill="${c('pink')}"/><path d="M89 24Q98 6 84 -4Q85 9 73 18Z" fill="${c('pink')}"/>`);
  S.push(`<path d="${rr(21,17,88,104,24)}" fill="${c('deep')}"/><path d="${rr(16,12,88,104,24)}" fill="${c('blue')}"/>`);
  // solar panel: two cell strips set as an angry brow
  S.push(`<path d="M28 16L58 23L58 29L28 22Z" fill="${c('ink')}"/><path d="M92 16L62 23L62 29L92 22Z" fill="${c('ink')}"/>`);
  if(!small) S.push(`<path d="M38 18.3L38 24.3M48 20.6L48 26.6M82 18.3L82 24.3M72 20.6L72 26.6" stroke="${c('deep')}" stroke-width="${c('w1')}"/>`);
  S.push(`<path d="${rr(26,31,68,42,10)}" fill="${c('ink')}"/>`);
  if(!small){ let g=''; for(const x0 of [37,63]) for(const [x1,y1,x2,y2] of [[1,0,5,0],[6,1,6,5],[6,7,6,11],[1,12,5,12],[0,7,0,11],[0,1,0,5],[1,6,5,6]]) g+=`M${x0+x1*3.3} ${35+y1*2.8}L${x0+x2*3.3} ${35+y2*2.8}`;
    S.push(`<path d="${g}" stroke="${c('ghost')}" stroke-width="${c('w4')}" stroke-linecap="round"/>`); }
  if(face==='ko') S.push(`<path d="M36 40L52 54M52 40L36 54M68 40L84 54M84 40L68 54" stroke="${c('pink')}" stroke-width="${c('w5')}" stroke-linecap="round"/><path d="M50 64Q60 58 70 64" fill="none" stroke="${c('white')}" stroke-width="${c('w4')}" stroke-linecap="round"/>`);
  else { const lid=face==='locked'?3:0;
    S.push(`<path d="M33 ${40+lid}L57 46L57 55L34 ${51}Z" fill="${c('white')}"/><path d="M87 ${40+lid}L63 46L63 55L86 51Z" fill="${c('white')}"/>`);
    S.push(face==='locked' ? `<path d="M49 45L57 47L57 55L49 53.5Z" fill="${c('pink')}"/><path d="M63 47L71 45L71 53.5L63 55Z" fill="${c('pink')}"/>`
                           : `<path d="M47 44L57 46.5L57 55L47 53Z" fill="${c('pink')}"/><path d="M73 44L63 46.5L63 55L73 53Z" fill="${c('pink')}"/>`);
    S.push(`<path d="M45 62Q60 70 77 60" fill="none" stroke="${c('white')}" stroke-width="${c('w4')}" stroke-linecap="round"/><path d="M65 65.5L71 64L68.5 70Z" fill="${c('white')}"/>`); }
  const key=(x,y,col)=>`<path d="${rr(x,y,18,12,3)}" fill="${c(col)}"/>`, K6=[[28,82],[51,82],[74,82],[28,99],[51,99],[74,99]];
  S.push(K6.map(([x,y],i)=>key(x,y,i===5?'pink':'ink')).join(''));
  if(!small){ const sym=['M34 88H40M37 85V91','M57 88H63','M77.5 85.5L82.5 90.5M82.5 85.5L77.5 90.5','M34 105H40M37 102.6V102.8M37 107.2V107.4','M54.5 108L59.5 101.5M55 102.3V102.5M59 107.2V107.4','M80 103.5H86M80 106.5H86'];
    S.push(sym.map((d,i)=>`<path d="${d}" stroke="${c(i===5?'ink':'white')}" stroke-width="${c('w1')}" stroke-linecap="round"/>`).join('')); }
  return `<g transform="rotate(-7 60 60)">${S.join('')}</g>`; }
Object.assign(BASE,{});
const C2={big:c=>chip2(c),small:c=>chip2(c,{small:true}),locked:c=>chip2(c,{face:'locked'}),ko:c=>chip2(c,{face:'ko'})};
function word3(){ const s=0.1, tr=-14, cap=75; let x=0; const parts=[]; const put=(ch,col)=>{ parts.push([ch,x,col]); x+=GW(ch)*s+tr; };
  const sc=1.04; x=128*sc; for(const ch of 'CALC') put(ch,'blue'); x+=6; put("'",'pink'); x+=4; put('D','blue');
  return {w:x+16,h:100,draw:c=>`<g transform="${sk(cap)}">`+parts.map(([ch,gx,col])=>`<g fill="${c(col)}">${G(ch,gx,cap,s)}</g>`).join('')+`</g><g transform="translate(-8 -42) scale(${sc})">${chip2(c)}</g>`}; }
