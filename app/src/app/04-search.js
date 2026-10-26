// ---------- search ----------
function searchMon(q,limit=8){
  const toks=q.toLowerCase().split(/[\s\-()]+/).map(norm).filter(Boolean);
  if(!toks.length)return [];
  const res=[];
  for(const p of ROSTER){
    if(!toks.every(t=>p.tok.some(x=>x.startsWith(t))||p.k.includes(t)))continue;
    let s=0;const nd=norm(p.d);const qj=toks.join('');
    if(nd===qj||norm(p.n)===qj)s+=1000;if(nd.startsWith(qj))s+=300;if(p.tok.some(x=>x.startsWith(toks[0])))s+=100;
    if(inBox(p))s+=40;s+=U(p)*2;s-=p.d.length*.5;
    res.push([s,p])}
  return res.sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>x[1]);
}
