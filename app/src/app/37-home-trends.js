// ---------- Home: what changed this week ----------
function homeTrends(){const h=META.history;if(!h||!h.days||h.days.length<2)return '';const k='tour';const latest=h.days[h.days.length-1];
  const cutoff=new Date(new Date(latest.d).getTime()-7*864e5).toISOString().slice(0,10);const past=h.days.slice(0,-1).filter(x=>x.d>=cutoff)[0]||h.days[h.days.length-2];
  if(!past||!past[k]||!latest[k])return '';const now=latest[k],was=past[k];
  const rows=Object.keys(now).filter(n=>byName.get(n)&&now[n]<=40).map(n=>({p:byName.get(n),r:now[n],d:was[n]==null?null:was[n]-now[n]}));
  const up=rows.filter(x=>x.d==null?x.r<=30:x.d>=3).sort((a,b)=>(b.d==null?99:b.d)-(a.d==null?99:a.d)).slice(0,3);
  const dn=Object.keys(was).filter(n=>byName.get(n)&&was[n]<=30&&(now[n]==null||now[n]-was[n]>=3)).map(n=>({p:byName.get(n),r:now[n],d:now[n]==null?null:was[n]-now[n],w:was[n]})).sort((a,b)=>(a.d==null?-99:a.d)-(b.d==null?-99:b.d)).slice(0,3);
  if(!up.length&&!dn.length)return '';const fmt=new Date(past.d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const item=(x,good)=>`<button type="button" class="trow" data-lt="${esc(x.p.n)}">${sprite(x.p,'mini')}<span class="tn">${esc(x.p.d)}</span><span class="tr ${good?'up':'down'}">${x.d==null?(good?'NEW':'OUT'):(good?'▲':'▼')+Math.abs(x.d)}</span><span class="vsub">${x.r?'#'+x.r:'out of top 40'}</span></button>`;
  return `<div class="hsec"><div class="hsh"><h3>What changed this week</h3><button type="button" class="hlink" data-view="meta">Rankings ›</button></div>
    <p class="t2">Tournament usage rank now vs ${fmt}.</p><div class="trends"><div><h4>Rising</h4>${up.map(x=>item(x,true)).join('')||'<p class="t2">No big risers.</p>'}</div><div><h4>Falling</h4>${dn.map(x=>item(x,false)).join('')||'<p class="t2">No big drops.</p>'}</div></div></div>`}
