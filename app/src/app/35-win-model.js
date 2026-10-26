// ---------- win model (trained on real tournament games, player skill removed) + your own battle log ----------
function modelOK(){const m=META.model;return !!(m&&m.ships&&m.mons&&Object.keys(m.mons).length)}
function modelX(names){const m=META.model;let x=0;for(const n of names)x+=m.mons[n]||0;
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const a=names[i]<names[j]?names[i]+'|'+names[j]:names[j]+'|'+names[i];x+=m.pairs[a]||0}return x}
// Set features (item and moves per Pokémon), when the model kept them: each member's usual item (or Mega Stone) and its 4 moves.
function setX(ms){const sets=META.model&&META.model.sets;if(!sets||!ms)return 0;let x=0;
  for(const m of ms){const p=m.p;if(!p)continue;let it='';try{it=p.m?stoneFor(p):((topItem(p)||[])[0]||'')}catch(e){}
    if(it)x+=sets[p.n+'@'+it]||0;for(const mv of (m.moves||[]))if(mv&&mv.name)x+=sets[p.n+':'+mv.name]||0}
  return x}
const sig=z=>1/(1+Math.exp(-z));
// Your own results, shrunk hard toward zero: 10 games of prior per Pokémon, so a few wins barely move anything.
function personalAdj(){const L=Array.isArray(S.log)?S.log:[];if(L.length<5)return null;const w=new Map(),g=new Map();
  for(const e of L)for(const n of e.b){g.set(n,(g.get(n)||0)+1);if(e.r==='W')w.set(n,(w.get(n)||0)+1)}
  const out=new Map();for(const [n,k] of g){const p=((w.get(n)||0)+5)/(k+10);out.set(n,Math.log(p/(1-p))*.5)}return out}
function winVsField(names,mine){if(!modelOK()||names.length<6)return null;let x=modelX(names)+(mine?setX(members()):0)-(META.model.meanX||0);
  const pa=mine?personalAdj():null;let xp=null;if(pa){xp=x;for(const n of names)xp+=(pa.get(n)||0)/4}
  return {p:sig(x),pYou:xp==null?null:sig(xp)}}
function winVs(a,b,ma,mb){if(!modelOK())return null;return sig(modelX(a)+setX(ma)-modelX(b)-setX(mb))}
function modelLine(){const m=META.model;if(!m||!m.eval)return '';const e=m.eval,t=e.model_teams_only,r=e.raw_win_rates;
  return `Trained on ${(m.games||0).toLocaleString('en-US')} real games with player skill taken out. ${m.sets&&Object.keys(m.sets).length?'It reads items and moves too. ':''}On ${e.test_games.toLocaleString('en-US')} held-out games it called ${(t.acc*100).toFixed(1)}% of winners (raw win rates: ${(r.acc*100).toFixed(1)}%).`}

