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
  for(const m of ms){const p=m.p;if(!p)continue;let it='';try{it=p.m?stoneFor(p):(m.heldItem||(topItem(p)||[])[0]||'')}catch(e){}
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
// Each missing piece cuts the above-average edge by 15% (never below 40%).
const PILLARS={speed:'no speed control',fake:'no lead support (Fake Out, Intimidate or redirection)',spread:'no spread damage',mega:'no Mega'};
function structCredit(ms){if(S.format!=='doubles'||ms.length!==6)return {c:1,miss:[]};let CK=null;try{CK=proChecks(ms,true)}catch(e){}if(!CK)return {c:1,miss:[]};
  // the Mega rule is fixed (at least one Mega), so the score never depends on your "Megas on team" setting
  const miss=CK.items.filter(x=>PILLARS[x.k]&&x.k!=='mega'&&!x.ok&&!x.skip).map(x=>PILLARS[x.k]);if(!ms.some(m=>m.p&&m.p.m))miss.push(PILLARS.mega);
  // a Pokémon whose ability needs weather or terrain that nothing on the team sets (Swift Swim with no rain) is a broken piece
  try{const fullMs=ms.map(m=>m._mv&&m._mv.length?m:{...m,_mv:memberMoves(m).moves});const gp=gamePlan(fullMs);for(const r of gp.rows)if((r.k==='weather'||r.k==='terrain')&&r.st==='miss')miss.push(String(r.note||(r.k==='weather'?'weather it needs':'terrain it needs')).replace(/[.\s]+$/,''))}catch(e){}
  return {c:Math.max(.4,1-.15*miss.length),miss}}
// Team strength in the model's own units, adjusted exactly as the Team Score adjusts it. Team Score, fix plans, Best
// additions, Build for me and the Gauntlet all read this one number, so they can never disagree about which team is stronger.
// upside needs proof: an untried mix, or a team missing what nearly every winning team has, gets its above-average edge cut
function strengthX(names,ms){const mx=META.model.meanX||0,xRaw0=teamX(names,ms),dev=xRaw0-mx;
  const cr=dev>0?mixCredit(names):1,sc=dev>0&&ms?structCredit(ms):{c:1,miss:[]};return {xRaw:mx+(dev>0?dev*cr*sc.c:dev),x0:xRaw0,cr,sc}}
// The model is trained on doubles tournament games only, so singles teams get no Team Score.
function winVsField(names,mine,msIn){if(!modelOK()||names.length<6||S.format!=='doubles')return null;{const b=names.map(n=>(byName.get(n)||{}).b||n);if(new Set(b).size<b.length)return null}
  const ms=mine?(msIn||members()):null,mx=META.model.meanX||0;
  const {xRaw,x0,cr,sc}=strengthX(names,ms),x=calibK()*(xRaw-mx);
  const pa=mine?personalAdj():null;let xp=null;if(pa){xp=x;for(const n of names)xp+=(pa.get(n)||0)/4}
  return {p:sig(x),pYou:xp==null?null:sig(xp),x:xRaw,pct:strengthPct(xRaw),pctRaw:strengthPct(x0),credit:cr,tested:testedPairs(names),struct:sc}}
function winVs(a,b,ma,mb){if(!modelOK())return null;return sig(calibK()*(strengthX(a,ma).xRaw-strengthX(b,mb).xRaw))}
// where a team's strength falls among real tournament teams from the last 45 days (0-100, from the shipped percentiles)
function strengthPct(x){const d=META.model&&META.model.dist,q=d&&Array.isArray(d.q)&&d.q.length===101?d.q:null;if(!q)return null;
  if(x<=q[0])return 0;if(x>=q[100])return 100;let i=0;while(i<99&&q[i+1]<x)i++;const lo=q[i],hi=q[i+1];return i+(hi>lo?(x-lo)/(hi-lo):0)}
function modelLine(){const m=META.model;if(!m||!m.eval)return '';const e=m.eval,t=e.model_teams_only,r=e.raw_win_rates;
  return `Trained on ${(m.games||0).toLocaleString('en-US')} real games with player skill taken out. ${m.sets&&Object.keys(m.sets).length?'It reads items and moves too. ':''}On ${e.test_games.toLocaleString('en-US')} held-out games it called ${(t.acc*100).toFixed(1)}% of winners (raw win rates: ${(r.acc*100).toFixed(1)}%).`}


// Team Score of any six members (plans, additions, builds), from the same model as the Team page
function tsOf(team){if(!team||team.length!==6||S.format!=='doubles')return null;try{const wv=winVsField(team.map(m=>m.p.n),true,team);return wv?teamScore({wv}).score:null}catch(e){return null}}
// Fix plans, Best additions and Build for me choose by Team Score in doubles when the win model is loaded (Fun mode keeps its own picks).
function useTSPick(){return S.format==='doubles'&&!S.fun&&modelOK()}
// What "improves the team" means everywhere (Fix plans, Quick add, Best additions): the Team Score rises by at least this much
var TS_GAIN=2;
// a plan's Team Score, less 2 per extra change and 10 if it would put Choice Scarf on a Trick Room team
function tsKey(pl){let k=pl._ts-((pl.ch?pl.ch.length:1)-1)*2;try{if(scarfTrClash(pl.team))k-=10}catch(e){}return k}
function tsChip(team){const base=ui.vsum&&ui.vsum.TS;const t=tsOf(team);if(t==null||!base)return '';const d=t-base.score;
  return `<span class="tsd ${d>0?'up':d<0?'dn':''}" title="Team Score ${base.score} → ${t}">Team Score ${d>0?'+':d<0?'−':'±'}${Math.abs(d)}</span>`}
