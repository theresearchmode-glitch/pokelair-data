// ---------- move edits ----------
function teamOffense(){const ms=members(),useA=$('useAbil').checked,ctx=teamContext(useA?ms:[]);return offenseCount(ms.flatMap(m=>attackEntries({...m,ability:useA?m.ability:null},memberMoves(m).moves,ctx)))}
function setMove(i,j,name){const s=S.slots[i],p=byName.get(s.n);if(!p)return;
  if(name&&!(LEARN[p.n]||[]).some(k=>MV[k].name===name)){toast(`${p.d} can't learn ${name}`);render();return}
  const before=teamOffense();
  const sm=slotMoves(s,p);const names=sm.names.slice();const old=names[j];names[j]=name||'';
  const pop=popularMoves(p).slice(0,4).map(x=>x.name);while(pop.length<4)pop.push('');
  const mv={...(s.mv||{})};if(names.join('|')===pop.join('|'))delete mv[S.format];else mv[S.format]=names;
  if(Object.keys(mv).length)s.mv=mv;else delete s.mv;render();
  const pm=popularMoves(p),pc=pm.pct&&pm.pct.get(name);
  const after=teamOffense();
  toast(`${name?name:'Move removed'}${old&&name?' replaces '+old:''} · Offense ${before===after?'stays at '+after:before+' → '+after} of 18${name&&pc==null&&pm.pct&&pm.pct.size?' · rarely used':''}`)}
