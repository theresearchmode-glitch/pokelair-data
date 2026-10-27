// ---------- win model (trained on real tournament games, player skill removed) + your own battle log ----------
function modelOK(){const m=META.model;return !!(m&&m.ships&&m.mons&&Object.keys(m.mons).length)}
function modelX(names){const m=META.model;let x=0;for(const n of names)x+=m.mons[n]||0;
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const a=names[i]<names[j]?names[i]+'|'+names[j]:names[j]+'|'+names[i];x+=m.pairs[a]||0}return x}
// Set features (item and moves per Pokémon), when the model kept them: each member's usual item (or Mega Stone) and its 4 moves.
// v2 models center them within the species: a feature counts (1 − how often that species runs it) when the set has it and
// (− how often) when it doesn't, so the usual set adds about nothing and a Pokémon's strength sits in its own shrunk number.
let spFeatCache={m:null,map:null};
function spFeats(){const m=META.model;if(spFeatCache.m===m)return spFeatCache.map;const map=new Map();
  for(const k of Object.keys((m&&m.sets)||{})){const sp=k.split(/[@:]/)[0];if(!map.has(sp))map.set(sp,[]);map.get(sp).push(k)}spFeatCache={m,map};return map}
function setX(ms){return (ms||[]).reduce((a,m)=>a+setOne(m),0)}
function setOne(m){const M=META.model,sets=M&&M.sets;if(!sets||!m)return 0;let x=0;const ms=[m];const center=!!M.center,fq=M.setFreq||{},F=center?spFeats():null;
  for(const m of ms){const p=m.p;if(!p)continue;let it='';try{it=p.m?stoneFor(p):m._deadItem?'':(m.heldItem||m.item||(topItem(p)||[])[0]||'')}catch(e){}
    if(center){const mv=new Set((m.moves||[]).map(v=>v&&v.name).filter(Boolean));
      let u=0;for(const k of (F.get(p.n)||[])){const i=k.indexOf('@')===p.n.length,has=i?k.slice(p.n.length+1)===it:mv.has(k.slice(p.n.length+1));u+=sets[k]*((has?1:0)-(fq[k]||0))}
      // a build only counts as much as real builds of this Pokémon have shown (10th-90th percentile of real decks)
      const r=M.setRange&&M.setRange[p.n];x+=r?Math.max(r[0],Math.min(r[1],u)):u;continue}
    if(it)x+=sets[p.n+'@'+it]||0;for(const mv of (m.moves||[]))if(mv&&mv.name)x+=sets[p.n+':'+mv.name]||0}
  return x}
const sig=z=>1/(1+Math.exp(-z));
// Your own results, shrunk hard toward zero: 10 games of prior per Pokémon, so a few wins barely move anything.
function personalAdj(){const L=Array.isArray(S.log)?S.log:[];if(L.length<5)return null;const w=new Map(),g=new Map();
  for(const e of L)for(const n of e.b){g.set(n,(g.get(n)||0)+1);if(e.r==='W')w.set(n,(w.get(n)||0)+1)}
  const out=new Map();for(const [n,k] of g){const p=((w.get(n)||0)+5)/(k+10);out.set(n,Math.log(p/(1-p))*.5)}return out}
// calibration from held-out events: edges are scaled by how well they held up on games the model never saw
const calibK=()=>{const c=+(META.model&&META.model.calib);return c>0&&c<3?c:1};
// raw team strength x (the model's own units), and the chance to beat an average tournament team
// Only one Pokémon can Mega Evolve per game, and real teams bring at most 3 Mega options (2 on 73% of them), so only the
// two strongest Mega options count; any extra Mega counts as an average Pokémon. Stacking Megas can't raise the score.
function teamX(names,ms){let x=modelX(names);const M=META.model,byN=new Map((ms||[]).map(m=>[m.p.n,m]));
  const val=n=>(M.mons[n]||0)+(byN.has(n)?setOne(byN.get(n)):0);
  const megas=names.filter(n=>{const p=byName.get(n);return p&&p.m}).sort((a,b)=>val(b)-val(a));
  for(const n of megas.slice(2))x-=M.mons[n]||0;
  if(ms)for(const m of ms)if(!megas.slice(2).includes(m.p.n))x+=setOne(m);
  return x}
// tested pairs: how many of the team's 15 pairs real players brought together on 15+ tournament teams (shipped by the model)
let testedCache={m:null,set:null};
function testedPairs(names){const M=META.model;if(!M||!Array.isArray(M.tested))return null;if(testedCache.m!==M)testedCache={m:M,set:new Set(M.tested)};let k=0;
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const a=names[i],b=names[j];if(testedCache.set.has(a<b?a+'|'+b:b+'|'+a))k++}return k}
// an untried mix gets its edge pulled toward the average: credit 0.5 + 0.5 × min(1, tested pairs / supK)
function mixCredit(names){const M=META.model,k=testedPairs(names);if(k==null||!M.supK)return 1;return .5+.5*Math.min(1,k/M.supK)}
// the pillars at least 82% of recent event winners have (see the checklist): the model learned from teams that have them,
// so it can't vouch for the upside of a team without them. Same for a weather or terrain the team needs but never sets.
// Each missing piece cuts the above-average edge by 15% (never below 40% of it in all). Oct 27: plans that can't work
// count too, a Trick Room team without slow attackers (30%) and items you picked that never activate (15% each).
const PILLARS={speed:'no speed control',fake:'no lead support (Fake Out, Intimidate or redirection)',spread:'no spread damage',mega:'no Mega'};
function structCredit(ms){if(ms.length!==6)return {c:1,miss:[]};let CK=null;try{CK=proChecks(ms,true)}catch(e){}if(!CK)return {c:1,miss:[]};
  // the Mega rule is fixed (at least one Mega), so the score never depends on your "Megas on team" setting
  const miss=CK.items.filter(x=>PILLARS[x.k]&&x.k!=='mega'&&!x.ok&&!x.skip).map(x=>PILLARS[x.k]);if(!ms.some(m=>m.p&&m.p.m))miss.push(PILLARS.mega);
  let w=.15*miss.length;const add=(t,k)=>{miss.push(t);w+=k};
  // a Pokémon whose ability needs weather or terrain that nothing on the team sets (Swift Swim with no rain) is a broken piece
  try{const fullMs=ms.map(m=>m._mv&&m._mv.length?m:{...m,_mv:memberMoves(m).moves});const gp=gamePlan(fullMs);for(const r of gp.rows)if((r.k==='weather'||r.k==='terrain')&&r.st==='miss')add(String(r.note||(r.k==='weather'?'weather it needs':'terrain it needs')).replace(/[.\s]+$/,''),.15);
    // a Trick Room team (no Tailwind) with at most one slow Pokémon besides its setters. Real Limitless teams built like
    // that won 47.9% of games vs 51.6% with two slow attackers (Oct 27): about half the edge of a strong team, so 30%.
    const tp=trPlan(fullMs);if(tp&&!tp.tw){const att=tp.slow.filter(m=>!tp.set.includes(m));if(att.length<=1)add(`Trick Room with ${att.length?'only one slow attacker ('+att[0].d+')':'no slow attackers'} to use it`,.3)}
    // the Trick Room setter itself holds Choice Scarf: it moves last under its own room and is locked into the move
    if(tp&&tp.scarf.some(m=>tp.set.includes(m)))add(`${tp.scarf.filter(m=>tp.set.includes(m)).map(m=>m.d).join(', ')} sets Trick Room while holding Choice Scarf`,.15);
    // an item you picked that can never work (a Terrain Seed with no terrain, Room Service with no Trick Room)
    for(const d of deadItems(fullMs))add(d.why,.15)}catch(e){}
  return {c:Math.max(.4,1-w),miss}}
// Team strength in the model's own units, adjusted exactly as the Team Score adjusts it. Team Score, fix plans, Best
// additions, Build for me and the Gauntlet all read this one number, so they can never disagree about which team is stronger.
// upside needs proof: an untried mix, or a team missing what nearly every winning team has, gets its above-average edge cut
// Every team is read the same way: 4 moves (an opponent's likely-move list keeps its 4 most used), its default item when
// none is set, then Item Clause and dead items (a mirror of your own six in the Gauntlet is exactly even).
function strengthX(names,ms){if(ms){ms=resolveItems(ms.map(m=>{if(!m||!m.p)return m;let o=m;if(o.moves&&o.moves.length>4)o={...o,moves:o.moves.slice(0,4)};if(!o.item&&!o.p.m)o={...o,item:defaultItem(o.p)};return o}));const all=ms;ms=ms.map(m=>m&&m.heldItem&&!itemWorks(all,m.heldItem)?{...m,_deadItem:true}:m)}const mx=META.model.meanX||0,xRaw0=teamX(names,ms),dev=xRaw0-mx;
  const cr=dev>0?mixCredit(names):1,sc=dev>0&&ms?structCredit(ms):{c:1,miss:[]};return {xRaw:mx+(dev>0?dev*cr*sc.c:dev),x0:xRaw0,cr,sc}}
// The model is trained on doubles tournament games only.
function winVsField(names,mine,msIn){if(!modelOK()||names.length<6)return null;{const b=names.map(n=>(byName.get(n)||{}).b||n);if(new Set(b).size<b.length)return null}
  const ms=mine?(msIn||members()):null,mx=META.model.meanX||0;
  const {xRaw,x0,cr,sc}=strengthX(names,ms),x=calibK()*(xRaw-mx);
  const pa=mine?personalAdj():null;let xp=null;if(pa){xp=x;for(const n of names)xp+=(pa.get(n)||0)/4}
  return {p:sig(x),pYou:xp==null?null:sig(xp),x:xRaw,pct:strengthPct(xRaw),pctRaw:strengthPct(x0),credit:cr,tested:testedPairs(names),struct:sc,illegal:ms?itemClause(ms):[]}}
function winVs(a,b,ma,mb){if(!modelOK())return null;return sig(calibK()*(strengthX(a,ma).xRaw-strengthX(b,mb).xRaw))}
// where a team's strength falls among real tournament teams from the last 45 days (0-100, from the shipped percentiles)
function strengthPct(x){const d=META.model&&META.model.dist,q=d&&Array.isArray(d.q)&&d.q.length===101?d.q:null;if(!q)return null;
  if(x<=q[0])return 0;if(x>=q[100])return 100;let i=0;while(i<99&&q[i+1]<x)i++;const lo=q[i],hi=q[i+1];return i+(hi>lo?(x-lo)/(hi-lo):0)}
function modelLine(){const m=META.model;if(!m||!m.eval)return '';const e=m.eval,t=e.model_teams_only,r=e.raw_win_rates;
  return `Trained on ${(m.games||0).toLocaleString('en-US')} real games with player skill taken out. ${m.sets&&Object.keys(m.sets).length?'It reads items and moves too. ':''}On ${e.test_games.toLocaleString('en-US')} held-out games it called ${(t.acc*100).toFixed(1)}% of winners (raw win rates: ${(r.acc*100).toFixed(1)}%).`}


// Team Score of any six members (plans, additions, builds), from the same model as the Team page
function tsOf(team){if(!team||team.length!==6)return null;try{const wv=winVsField(team.map(m=>m.p.n),true,team);return wv?teamScore({wv}).score:null}catch(e){return null}}
// What's behind a Team Score: for each member, how many points the score would lose (or gain) if that Pokémon were an
// average tournament pick instead (its own strength and set, plus half of each pairing it's in), with the same untried-mix
// and checklist cuts the score uses. Plus the points those cuts take off. The members don't add up to the score exactly:
// the score is a rank among real teams, so points near the top are harder to earn than in the middle.
function tsBreakdown(ms){if(!modelOK()||!ms||ms.length!==6)return null;const M=META.model,names=ms.map(m=>m.p.n),mx=M.meanX||0;
  const wv=winVsField(names,true,ms);if(!wv)return null;const ts=teamScore({wv}),S0=strengthX(names,ms),avg=mx/6;
  const megas=names.filter(n=>{const p=byName.get(n);return p&&p.m}),val=n=>(M.mons[n]||0)+setOne(ms[names.indexOf(n)]);
  const capped=new Set(megas.sort((a,b)=>val(b)-val(a)).slice(2));
  const pc=n=>{let s=0;for(const o of names)if(o!==n){const k=n<o?n+'|'+o:o+'|'+n;s+=(M.pairs[k]||0)/2}return s};
  const pctOf=x0=>{const d=x0-mx,x=mx+(d>0?d*S0.cr*S0.sc.c:d),p=strengthPct(x);return p==null?null:Math.max(0,Math.min(100,Math.floor(p)))};
  const rows=ms.map((m,i)=>{const n=names[i],c=(capped.has(n)?0:val(n))+pc(n),alt=pctOf(S0.x0-(c-avg));return {m,d:alt==null?0:ts.score-alt}});
  return {score:ts.score,rows,cut:ts.cut,miss:S0.sc.miss,untried:S0.cr<1,tested:testedPairs(names),illegal:ts.illegal||null}}
// Quick model strength for shortlisting: the same number as strengthX without the checklist cut (the slow part).
function xQuick(team){if(!modelOK()||!team||team.length!==6)return -Infinity;const names=team.map(m=>m.p.n),mx=META.model.meanX||0,x=teamX(names,team),d=x-mx;return mx+(d>0?d*mixCredit(names):d)}
// Which plans get a full Team Score check: the first n in the order given (the planner's own ranking) plus the n the win
// model rates strongest, so a change the model likes is never missed just because the planner's type rules ranked it low.
function tsShortlist(pls,n){const out=new Set(pls.slice(0,n));if(!modelOK())return [...out];
  for(const pl of pls)if(pl._xq===undefined)pl._xq=xQuick(pl.team);
  let k=0;for(const pl of pls.filter(pl=>pl._xq>-Infinity).sort((x,y)=>y._xq-x._xq)){if(k>=n)break;if(!out.has(pl)){out.add(pl);k++}}return [...out]}
// Fix plans, Best additions and Build for me choose by Team Score when the win model is loaded (off-meta searches keep their own picks).
function useTSPick(){return !OFFMETA&&modelOK()}
// What "improves the team" means everywhere (Fix plans, Quick add, Best additions): the Team Score rises by at least this much
var TS_GAIN=2;
// a plan's Team Score, less 2 per extra change and 10 if it would put Choice Scarf on a Trick Room team
function tsKey(pl){let k=pl._ts-((pl.ch?pl.ch.length:1)-1)*2;try{if(scarfTrClash(pl.team))k-=10}catch(e){}return k}
// Team Score and win chance of any six, for chips that show both (the rank moves much more than the win chance)
function tsInfo(team){if(!team||team.length!==6)return null;try{const wv=winVsField(team.map(m=>m.p.n),true,team);return wv?{score:teamScore({wv}).score,p:wv.p}:null}catch(e){return null}}
function tsTitle(base,t){return `Team Score ${base.score} → ${t.score}; win chance against an average team ${(base.p*100).toFixed(1)}% → ${(t.p*100).toFixed(1)}%`}
function tsChip(team){const base=ui.vsum&&ui.vsum.TS;const t=tsInfo(team);if(!t||!base)return '';const d=t.score-base.score;
  return `<span class="tsd ${d>0?'up':d<0?'dn':''}" title="${esc(tsTitle(base,t))}">Team Score ${d>0?'+':d<0?'−':'±'}${Math.abs(d)}</span>`}
